<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="1400px"
    :close-on-click-modal="false"
    class="kb-detail-dialog"
    @close="handleClose"
  >
    <div class="kb-detail-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="!kbUuid"
            @click="handleAdd"
          >
            新建知识点
          </el-button>
          <el-button
            size="small"
            icon="el-icon-upload"
            :disabled="!kbUuid"
            @click="handleUpload"
          >
            上传文件
          </el-button>
          <el-button
            size="small"
            icon="el-icon-setting"
            :disabled="selectedItems.length === 0"
            @click="handleBatchIndex"
          >
            批量索引 ({{ selectedItems.length }})
          </el-button>
          <el-button
            size="small"
            icon="el-icon-refresh"
            @click="handleRefreshIndexStatus"
          >
            刷新状态
          </el-button>
        </div>

        <div class="toolbar-right">
          <el-input
            v-model="keyword"
            placeholder="搜索知识点..."
            size="small"
            style="width: 250px"
            clearable
            @clear="handleSearch"
            @keyup.enter.native="handleSearch"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handleSearch"
            />
          </el-input>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />

        <el-table-column
          prop="title"
          label="标题"
          min-width="200"
          show-overflow-tooltip
        />

        <el-table-column
          prop="brief"
          label="摘要"
          min-width="250"
          show-overflow-tooltip
        />

        <el-table-column
          label="索引状态"
          width="150"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.indexStatus === 'completed'"
              type="success"
              size="small"
            >
              已完成
            </el-tag>
            <el-tag
              v-else-if="scope.row.indexStatus === 'processing'"
              type="warning"
              size="small"
            >
              索引中
            </el-tag>
            <el-tag
              v-else-if="scope.row.indexStatus === 'failed'"
              type="danger"
              size="small"
            >
              失败
            </el-tag>
            <el-tag
              v-else
              type="info"
              size="small"
            >
              未索引
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="createTime"
          label="创建时间"
          width="160"
        />

        <el-table-column
          label="操作"
          width="280"
          fixed="right"
        >
          <template slot-scope="scope">
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
              @click="handleViewEmbedding(scope.row)"
            >
              嵌入
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleViewGraph(scope.row)"
            >
              图谱
            </el-button>
            <el-button
              v-if="scope.row.fileName"
              type="text"
              size="small"
              @click="handlePreviewFile(scope.row)"
            >
              预览
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

      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>

    <knowledge-item-edit-dialog
      :visible.sync="editDialogVisible"
      :kb-uuid="kbUuid"
      :item-info="currentItem"
      @success="handleEditSuccess"
    />

    <knowledge-item-upload-dialog
      :visible.sync="uploadDialogVisible"
      :kb-uuid="kbUuid"
      @success="handleUploadSuccess"
    />

    <knowledge-index-dialog
      :visible.sync="indexDialogVisible"
      :selected-items="selectedItems"
      @success="handleIndexSuccess"
      @remove-item="handleRemoveSelectedItem"
      @start-checking="startIndexStatusPolling"
    />

    <item-embedding-dialog
      :visible.sync="embeddingDialogVisible"
      :kb-item-uuid="currentItem.itemUuid"
      :item-title="currentItem.title"
    />

    <item-graph-dialog
      :visible.sync="graphDialogVisible"
      :kb-item-uuid="currentItem.itemUuid"
      :item-title="currentItem.title"
    />

    <el-dialog
      v-el-drag-dialog
      :visible.sync="previewDialogVisible"
      :title="`${currentItem.title} - 文件预览`"
      width="1000px"
      append-to-body
    >
      <file-preview
        v-if="previewDialogVisible"
        :item-data="currentItem"
      />
    </el-dialog>
  </el-dialog>
</template>

<script>
import knowledgeBaseService from '../api/knowledgeBaseService'
import { INDEX_CHECK_INTERVAL } from '../constants/indexTypes'
import { createEmptyKbItem } from '../utils/knowledgeBaseUtils'
import KnowledgeItemEditDialog from './KnowledgeItemEditDialog.vue'
import KnowledgeItemUploadDialog from './KnowledgeItemUploadDialog.vue'
import KnowledgeIndexDialog from './KnowledgeIndexDialog.vue'
import ItemEmbeddingDialog from './ItemEmbeddingDialog.vue'
import ItemGraphDialog from './ItemGraphDialog.vue'
import FilePreview from '../components/FilePreview.vue'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'KnowledgeBaseDetailDialog',

  directives: { elDragDialog },

  components: {
    KnowledgeItemEditDialog,
    KnowledgeItemUploadDialog,
    KnowledgeIndexDialog,
    ItemEmbeddingDialog,
    ItemGraphDialog,
    FilePreview
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    kbUuid: {
      type: String,
      default: ''
    },
    kbTitle: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      loading: false,
      keyword: '',
      tableData: [],
      selectedItems: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      editDialogVisible: false,
      uploadDialogVisible: false,
      indexDialogVisible: false,
      embeddingDialogVisible: false,
      graphDialogVisible: false,
      previewDialogVisible: false,
      currentItem: createEmptyKbItem(),
      indexStatusTimer: null
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
    },

    dialogTitle () {
      return this.kbTitle ? `${this.kbTitle} - 知识点管理` : '知识点管理'
    }
  },

  watch: {
    visible (val) {
      if (val && this.kbUuid) {
        this.initData()
      } else {
        this.stopIndexStatusPolling()
      }
    }
  },

  beforeDestroy () {
    this.stopIndexStatusPolling()
  },

  methods: {
    /**
     * 初始化数据
     */
    initData () {
      this.keyword = ''
      this.pagination.page = 1
      this.selectedItems = []
      this.loadList()
    },

    /**
     * 加载列表
     */
    async loadList () {
      if (!this.kbUuid) return

      this.loading = true
      try {
        const response = await knowledgeBaseService.itemSearch(
          this.pagination.page,
          this.pagination.pageSize,
          this.kbUuid,
          this.keyword
        )

        const data = response.data || response
        this.tableData = data.records || data || []
        this.pagination.total = data.total || this.tableData.length
      } catch (error) {
        this.$message.error('加载失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    /**
     * 搜索
     */
    handleSearch () {
      this.pagination.page = 1
      this.loadList()
    },

    /**
     * 分页变化
     */
    handlePageChange (page) {
      this.pagination.page = page
      this.loadList()
    },

    /**
     * 选择变化
     */
    handleSelectionChange (selection) {
      this.selectedItems = selection
    },

    /**
     * 新建
     */
    handleAdd () {
      this.currentItem = createEmptyKbItem()
      this.currentItem.kbUuid = this.kbUuid
      this.editDialogVisible = true
    },

    /**
     * 编辑
     */
    handleEdit (row) {
      this.currentItem = { ...row }
      this.editDialogVisible = true
    },

    /**
     * 编辑成功
     */
    handleEditSuccess () {
      this.loadList()
    },

    /**
     * 上传文件
     */
    handleUpload () {
      this.uploadDialogVisible = true
    },

    /**
     * 上传成功
     */
    handleUploadSuccess () {
      this.loadList()
    },

    /**
     * 批量索引
     */
    handleBatchIndex () {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请先选择知识点')
        return
      }
      this.indexDialogVisible = true
    },

    /**
     * 移除选中项
     */
    handleRemoveSelectedItem (item) {
      const index = this.selectedItems.findIndex(i => i.itemUuid === item.itemUuid)
      if (index > -1) {
        this.selectedItems.splice(index, 1)
      }
    },

    /**
     * 索引成功
     */
    handleIndexSuccess () {
      this.selectedItems = []
      this.loadList()
    },

    /**
     * 开始索引状态轮询
     */
    startIndexStatusPolling () {
      this.stopIndexStatusPolling()
      this.indexStatusTimer = setInterval(() => {
        this.checkIndexStatus()
      }, INDEX_CHECK_INTERVAL)
    },

    /**
     * 停止索引状态轮询
     */
    stopIndexStatusPolling () {
      if (this.indexStatusTimer) {
        clearInterval(this.indexStatusTimer)
        this.indexStatusTimer = null
      }
    },

    /**
     * 检查索引状态
     */
    async checkIndexStatus () {
      try {
        const response = await knowledgeBaseService.indexingCheck()
        const data = response.data || response

        if (data && data.length > 0) {
          const processingItems = data.filter(item =>
            item.indexStatus === 'processing'
          )

          if (processingItems.length === 0) {
            this.stopIndexStatusPolling()
          }

          this.loadList()
        } else {
          this.stopIndexStatusPolling()
        }
      } catch (error) {
        console.error('检查索引状态失败:', error)
      }
    },

    /**
     * 刷新索引状态
     */
    handleRefreshIndexStatus () {
      this.loadList()
    },

    /**
     * 查看嵌入
     */
    handleViewEmbedding (row) {
      this.currentItem = { ...row }
      this.embeddingDialogVisible = true
    },

    /**
     * 查看图谱
     */
    handleViewGraph (row) {
      this.currentItem = { ...row }
      this.graphDialogVisible = true
    },

    /**
     * 预览文件
     */
    handlePreviewFile (row) {
      this.currentItem = { ...row }
      this.previewDialogVisible = true
    },

    /**
     * 删除
     */
    handleDelete (row) {
      this.$confirm(`确定删除知识点"${row.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await knowledgeBaseService.itemDelete(row.itemUuid)
          this.$message.success('删除成功')
          this.loadList()
        } catch (error) {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }).catch(() => {})
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.dialogVisible = false
      this.stopIndexStatusPolling()
    }
  }
}
</script>

<style scoped>
.kb-detail-container {
  min-height: 500px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-left {
  display: flex;
  gap: 10px;
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

.dialog-footer {
  text-align: right;
}
</style>

<style>
/* 确保知识库详情弹窗在管理弹窗上层（非scoped，全局生效） */
.kb-detail-dialog.el-dialog__wrapper {
  z-index: 10200 !important;
}
</style>
