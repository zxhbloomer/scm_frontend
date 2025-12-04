<template>
  <div>
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      :visible="visible"
      title="我的知识库"
      width="1300px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
      :append-to-body="true"
      :modal-append-to-body="true"
      class="kb-manage-dialog"
      destroy-on-close
      @close="handleClose"
    >
      <div :style="{ height: divHeight + 'px', overflowY: 'auto' }">
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
            ref="multipleTable"
            v-loading="loading"
            :data="tableData"
            :element-loading-text="'正在拼命加载中...'"
            element-loading-background="rgba(255, 255, 255, 0.5)"
            height="400px"
            stripe
            border
            fit
            highlight-current-row
            style="width: 100%; margin-top: 20px"
          >
            <el-table-column
              type="index"
              width="45"
              label="No"
            />
            <el-table-column
              prop="title"
              label="标题"
              min-width="200"
              :auto-fit="true"
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
              width="100"
            >
              <template slot="header">
                <field-help
                  default-label="严格模式"
                  help="严格模式：严格匹配知识库，知识库中如无搜索结果，直接返回无答案<br>宽松模式：知识库中如无搜索结果，将用户提问传给LLM继续请求答案"
                />
              </template>
              <template slot-scope="scope">
                {{ scope.row.isStrict ? '是' : '否' }}
              </template>
            </el-table-column>

            <el-table-column
              prop="isTemp"
              label="是否临时"
              width="100"
            >
              <template slot-scope="scope">
                {{ scope.row.isTemp ? '是' : '否' }}
              </template>
            </el-table-column>

            <el-table-column
              label="操作"
              width="320"
              align="center"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="handleChat(scope.row)"
                >
                  对话
                </el-button>
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
                  :disabled="scope.row.isTemp === 1"
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
          <pagination
            ref="minusPaging"
            :total="pagination.total"
            :page.sync="pagination.page"
            :limit.sync="pagination.pageSize"
            @pagination="handlePageChange"
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

      <!-- 知识库对话弹窗 -->
      <rag-chat-dialog
        :visible.sync="ragChatDialogVisible"
        :kb-uuid="currentKbUuid"
        :kb-title="currentKbTitle"
      />

    </el-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import KnowledgeBaseEditDialog from './KnowledgeBaseEditDialog.vue'
import KnowledgeBaseDetailDialog from './KnowledgeBaseDetailDialog.vue'
import RagChatDialog from './RagChatDialog.vue'
import { createEmptyKbInfo } from '../utils/knowledgeBaseUtils'
import knowledgeBaseService from '../../../api/knowledgeBaseService'
import elDragDialog from '@/directive/el-drag-dialog'
import Pagination from '@/components/Pagination_for_dialog'
import FieldHelp from '@/components/30_table/FieldHelp'

export default {
  name: 'KnowledgeBaseManageDialog',

  directives: { elDragDialog },

  components: {
    KnowledgeBaseEditDialog,
    KnowledgeBaseDetailDialog,
    RagChatDialog,
    Pagination,
    FieldHelp
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
      ragChatDialogVisible: false,
      currentKbInfo: null,
      currentKbUuid: '',
      currentKbTitle: '',

      // 固定高度
      divHeight: 530
    }
  },

  watch: {
    visible: {
      handler (val) {
        if (val) {
          this.initData()
        }
      },
      immediate: true
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
    handlePageChange () {
      this.search(this.pagination.page)
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
      const msgBox = this.$confirm(`删除后数据无法恢复，确定要删除知识库 ${row.title} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'kb-manage-delete-confirm'
      })

      // 动态设置 MessageBox wrapper 的 z-index - 延迟确保 DOM 已渲染
      setTimeout(() => {
        const wrapper = document.querySelector('.el-message-box__wrapper:has(.kb-manage-delete-confirm)')
        if (wrapper) {
          wrapper.style.zIndex = '9999999'
        }
      }, 100)

      msgBox.then(async () => {
        try {
          await knowledgeBaseService.delete(row.kbUuid)
          const index = this.tableData.findIndex(item => item.kbUuid === row.kbUuid)
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
     * 处理对话
     */
    handleChat (row) {
      this.currentKbUuid = row.kbUuid
      this.currentKbTitle = row.title
      this.ragChatDialogVisible = true
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
      this.$emit('update:visible', false)
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
</style>

