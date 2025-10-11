<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    title="我的知识库"
    width="90%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    :append-to-body="true"
    :modal-append-to-body="true"
    class="kb-manage-dialog"
    @close="handleClose"
  >
    <div class="kb-manage-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" size="small" @click="handleAdd">
            新增
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchValue"
            placeholder="请输入关键词搜索"
            size="small"
            style="width: 300px; margin-right: 10px"
            @keyup.enter.native="handleSearch"
          />
          <el-button type="primary" size="small" @click="handleSearch">
            搜索
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="title"
          label="标题"
          width="200"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="handleOpenDetail(scope.row)"
            >
              {{ scope.row.title }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column
          prop="remark"
          label="描述"
        />

        <el-table-column
          prop="isPublic"
          label="是否公开"
          width="100"
        >
          <template slot-scope="scope">
            {{ scope.row.isPublic ? '是' : '否' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="isStrict"
          label="严格模式"
          width="100"
        >
          <template slot-scope="scope">
            {{ scope.row.isStrict ? '是' : '否' }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="220"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleOpenDetail(scope.row)"
            >
              进入知识库
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              style="color: #f56c6c"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 知识库编辑弹窗 -->
    <knowledge-base-edit-dialog
      :visible.sync="editDialogVisible"
      :kb-info="currentKbInfo"
      :llm-list="llmList"
      @success="handleEditSuccess"
    />

    <!-- 知识库详情弹窗 -->
    <knowledge-base-detail-dialog
      :visible.sync="detailDialogVisible"
      :kb-uuid="currentKbUuid"
      :kb-title="currentKbTitle"
      @close="detailDialogVisible = false"
    />
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import KnowledgeBaseEditDialog from './KnowledgeBaseEditDialog.vue'
import KnowledgeBaseDetailDialog from './KnowledgeBaseDetailDialog.vue'
import { createEmptyKbInfo } from '../utils/knowledgeBaseUtils'
import knowledgeBaseService from '../api/knowledgeBaseService'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'KnowledgeBaseManageDialog',

  directives: { elDragDialog },

  components: {
    KnowledgeBaseEditDialog,
    KnowledgeBaseDetailDialog
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    llmList: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      loading: false,
      searchValue: '',
      tableData: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },

      // 子弹窗控制
      editDialogVisible: false,
      detailDialogVisible: false,
      currentKbInfo: null,
      currentKbUuid: '',
      currentKbTitle: ''
    }
  },

  computed: {
    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    }
  },

  watch: {
    visible (val) {
      if (val) {
        this.initData()
      }
    }
  },

  methods: {
    ...mapActions('knowledgeBase', ['loadMyKbList', 'setReloadSignal']),

    /**
     * 初始化数据
     */
    async initData () {
      await this.search(1)
    },

    /**
     * 搜索知识库
     */
    async search (page) {
      if (this.loading) {
        this.$message.warning('正在加载，请稍候')
        return
      }

      this.loading = true
      try {
        const response = await knowledgeBaseService.searchMine(
          this.searchValue,
          page,
          this.pagination.pageSize
        )

        const data = response.data || response
        this.tableData = data.records || data || []
        this.pagination.page = page
        this.pagination.total = data.total || this.tableData.length
      } catch (error) {
        this.$message.error('加载失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理搜索
     */
    handleSearch () {
      this.search(1)
    },

    /**
     * 处理分页变化
     */
    handlePageChange (page) {
      this.search(page)
    },

    /**
     * 处理新增
     */
    handleAdd () {
      this.currentKbInfo = createEmptyKbInfo()
      this.editDialogVisible = true
    },

    /**
     * 处理编辑
     */
    handleEdit (row) {
      this.currentKbInfo = { ...row }
      this.editDialogVisible = true
    },

    /**
     * 处理删除
     */
    handleDelete (row) {
      this.$confirm(`删除后数据无法恢复，确定要删除知识库 ${row.title} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await knowledgeBaseService.delete(row.kbUuid) // ✅ 修正：使用kbUuid
          const index = this.tableData.findIndex(item => item.kbUuid === row.kbUuid) // ✅ 修正：使用kbUuid
          if (index !== -1) {
            this.tableData.splice(index, 1)
          }
          this.$message.success('删除成功')
          this.setReloadSignal(true)
        } catch (error) {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }).catch(() => {})
    },

    /**
     * 处理打开详情
     */
    handleOpenDetail (row) {
      this.currentKbUuid = row.kbUuid // ✅ 修正：使用后端返回的kbUuid字段
      this.currentKbTitle = row.title
      this.detailDialogVisible = true
    },

    /**
     * 处理编辑成功
     */
    async handleEditSuccess () {
      this.editDialogVisible = false
      await this.search(this.pagination.page)
      this.setReloadSignal(true)
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.kb-manage-container {
  padding: 10px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>

<style>
/* 确保知识库管理弹窗在AI聊天框上层显示（非scoped，全局生效） */
.kb-manage-dialog.el-dialog__wrapper {
  z-index: 10100 !important;
}
</style>
