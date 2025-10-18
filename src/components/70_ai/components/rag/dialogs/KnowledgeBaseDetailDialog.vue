<template>
  <div>
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      :visible="visible"
      :title="dialogTitle"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="true"
      class="kb-detail-dialog"
      width="1500px"
      destroy-on-close
      top="5vh"
      @close="handleClose"
    >
      <div style="height: 550px; overflow-y: auto;">
        <div class="kb-detail-container">
          <div ref="minusToolbar" class="toolbar">
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
            ref="multipleTable"
            v-loading="loading"
            :element-loading-text="'正在拼命加载中...'"
            element-loading-background="rgba(255, 255, 255, 0.5)"
            :data="tableData"
            height="400px"
            highlight-current-row
            fit
            stripe
            border
            style="width: 100%; margin-top: 20px"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55"
            />
            <el-table-column
              type="index"
              width="45"
              label="No"
            />

            <el-table-column
              prop="title"
              :auto-fit="true"
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
              label="向量化状态"
              width="120"
            >
              <template slot-scope="scope">
                <el-tag
                  v-if="scope.row.embeddingStatus === 3"
                  type="success"
                  size="small"
                >
                  已完成
                </el-tag>
                <el-tag
                  v-else-if="scope.row.embeddingStatus === 2"
                  type="warning"
                  size="small"
                >
                  处理中
                </el-tag>
                <el-tag
                  v-else-if="scope.row.embeddingStatus === 4"
                  type="danger"
                  size="small"
                >
                  失败
                </el-tag>
                <el-tag
                  v-else-if="scope.row.embeddingStatus === 1"
                  type="info"
                  size="small"
                >
                  待处理
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
              label="图谱化状态"
              width="120"
            >
              <template slot-scope="scope">
                <el-tag
                  v-if="scope.row.graphicalStatus === 3"
                  type="success"
                  size="small"
                >
                  已完成
                </el-tag>
                <el-tag
                  v-else-if="scope.row.graphicalStatus === 2"
                  type="warning"
                  size="small"
                >
                  处理中
                </el-tag>
                <el-tag
                  v-else-if="scope.row.graphicalStatus === 4"
                  type="danger"
                  size="small"
                >
                  失败
                </el-tag>
                <el-tag
                  v-else-if="scope.row.graphicalStatus === 1"
                  type="info"
                  size="small"
                >
                  待处理
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
              prop="c_time"
              label="创建时间"
              width="160"
            />

            <el-table-column
              label="操作"
              width="320"
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

          <pagination
            ref="minusPaging"
            :total="pagination.total"
            :page.sync="pagination.page"
            :limit.sync="pagination.pageSize"
            @pagination="handlePageChange"
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
  </div>
</template>

<script>
import knowledgeBaseService from '../../../api/knowledgeBaseService'
import { INDEX_CHECK_INTERVAL } from '../constants/indexTypes'
import { createEmptyKbItem } from '../utils/knowledgeBaseUtils'
import KnowledgeItemEditDialog from './KnowledgeItemEditDialog.vue'
import KnowledgeItemUploadDialog from './KnowledgeItemUploadDialog.vue'
import KnowledgeIndexDialog from './KnowledgeIndexDialog.vue'
import ItemEmbeddingDialog from './ItemEmbeddingDialog.vue'
import ItemGraphDialog from './ItemGraphDialog.vue'
import FilePreview from '../components/FilePreview.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import Pagination from '@/components/Pagination_for_dialog'

export default {
  name: 'KnowledgeBaseDetailDialog',

  directives: { elDragDialog },

  components: {
    KnowledgeItemEditDialog,
    KnowledgeItemUploadDialog,
    KnowledgeIndexDialog,
    ItemEmbeddingDialog,
    ItemGraphDialog,
    FilePreview,
    Pagination
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
        pageSize: 20,
        total: 0
      },
      editDialogVisible: false,
      uploadDialogVisible: false,
      indexDialogVisible: false,
      embeddingDialogVisible: false,
      graphDialogVisible: false,
      previewDialogVisible: false,
      currentItem: createEmptyKbItem(),
      indexStatusTimer: null,
      divHeight: 500
    }
  },

  computed: {
    dialogTitle () {
      return this.kbTitle ? `${this.kbTitle} - 知识点管理` : '知识点管理'
    }
  },

  watch: {
    visible: {
      handler (val) {
        if (val && this.kbUuid) {
          this.initData()
        } else {
          this.stopIndexStatusPolling()
        }
      },
      immediate: true
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
        // 直接使用embeddingStatus和graphicalStatus字段
        const records = data.records || data || []
        this.tableData = records
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
    handlePageChange () {
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
          // 检查向量化或图谱化是否有处理中的项
          // embeddingStatus: 2-处理中, graphicalStatus: 2-处理中
          const processingItems = data.filter(item =>
            item.embeddingStatus === 2 || item.graphicalStatus === 2
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
      const msgBox = this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        customClass: 'my-messagebox'
      })

      // 动态设置 MessageBox wrapper 的 z-index - 延迟确保 DOM 已渲染
      setTimeout(() => {
        const wrapper = document.querySelector('.el-message-box__wrapper:has(.my-messagebox)')
        if (wrapper) {
          wrapper.style.zIndex = '9999999'
        }
      }, 100)

      msgBox.then(async () => {
        try {
          await knowledgeBaseService.itemDelete(row.itemUuid)

          // 直接从列表中过滤掉删除的项，不重新查询
          this.$nextTick(() => {
            this.tableData = this.tableData.filter(item => item.itemUuid !== row.itemUuid)
            this.pagination.total = this.pagination.total - 1
          })

          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }).catch(() => {
        // 用户取消
      })
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.$emit('update:visible', false)
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

.dialog-footer {
  text-align: right;
}
</style>

