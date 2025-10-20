<template>
  <el-dialog
    v-if="dialogVisible"
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    title="选择索引类型"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1000px"
    destroy-on-close
    @close="handleClose"
    @opened="handleOpened"
  >
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索问题内容..."
        clearable
        style="width: 300px;"
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

    <!-- 历史记录列表 -->
    <el-table
      v-loading="loading"
      :data="historyList"
      border
      stripe
      style="width: 100%; margin-top: 16px;"
      max-height="500"
    >
      <el-table-column
        type="index"
        label="序号"
        width="60"
        align="center"
      />
      <el-table-column
        prop="question"
        label="问题"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        prop="answer"
        label="回答"
        min-width="250"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span v-if="scope.row.answer">{{ scope.row.answer }}</span>
          <span v-else style="color: #909399;">暂无回答</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="160"
        align="center"
      >
        <template slot-scope="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-view"
            @click="handleViewDetail(scope.row)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            size="small"
            icon="el-icon-delete"
            style="color: #F56C6C;"
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
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button
        type="danger"
        icon="el-icon-delete"
        :disabled="historyList.length === 0"
        @click="handleClearAll"
      >
        清空全部
      </el-button>
      <el-button @click="handleClose">关闭</el-button>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-el-drag-dialog
      :visible.sync="detailDialogVisible"
      title="问答详情"
      width="70%"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="true"
    >
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-section">
          <div class="detail-label">问题:</div>
          <div class="detail-value">{{ currentDetail.question }}</div>
        </div>

        <el-divider />

        <div class="detail-section">
          <div class="detail-label">回答:</div>
          <div class="detail-value" v-html="renderMarkdown(currentDetail.answer)" />
        </div>

        <el-divider />

        <div class="detail-section">
          <div class="detail-label">创建时间:</div>
          <div class="detail-value">{{ formatTime(currentDetail.createTime) }}</div>
        </div>

        <div v-if="currentDetail.aiModelId" class="detail-section">
          <div class="detail-label">AI模型:</div>
          <div class="detail-value">{{ currentDetail.aiModelId }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Token统计:</div>
          <div class="detail-value">
            <el-tag size="mini" type="info">
              问题: {{ currentDetail.promptTokens || 0 }} tokens
            </el-tag>
            <el-tag size="mini" type="success" style="margin-left: 8px;">
              回答: {{ currentDetail.answerTokens || 0 }} tokens
            </el-tag>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { marked } from 'marked'
import ragService from '../../../api/ragService'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'RagQaHistoryDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    kbUuid: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dialogVisible: false,
      loading: false,
      searchKeyword: '',
      historyList: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      detailDialogVisible: false,
      currentDetail: null
    }
  },
  watch: {
    visible: {
      handler (val) {
        this.dialogVisible = val
      },
      immediate: true
    }
  },
  methods: {
    handleOpened () {
      // 对话框打开后加载历史记录
      this.loadHistory()
    },

    async loadHistory () {
      if (!this.kbUuid) {
        this.$message.warning('缺少知识库UUID')
        return
      }

      this.loading = true
      try {
        const response = await ragService.searchQaRecords(
          this.kbUuid,
          this.searchKeyword,
          this.currentPage,
          this.pageSize
        )

        if (response.system_code === 0 && response.data) {
          const pageData = response.data
          this.historyList = pageData.records || []
          this.total = pageData.total || 0
          this.currentPage = pageData.current || 1
        } else {
          this.$message.error(response.message || '加载历史记录失败')
          this.historyList = []
          this.total = 0
        }
      } catch (error) {
        this.$message.error('加载历史记录失败: ' + (error.message || '未知错误'))
        this.historyList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    handleSearch () {
      // 重置到第一页并搜索
      this.currentPage = 1
      this.loadHistory()
    },

    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadHistory()
    },

    handleCurrentChange (val) {
      this.currentPage = val
      this.loadHistory()
    },

    handleViewDetail (row) {
      this.currentDetail = row
      this.detailDialogVisible = true
    },

    async handleDelete (row) {
      try {
        await this.$confirm('确定删除这条问答记录吗？', '提示', {
          type: 'warning'
        })

        const response = await ragService.deleteQaRecord(row.uuid)

        if (response.system_code === 0) {
          this.$message.success('删除成功')
          // 重新加载当前页
          this.loadHistory()
        } else {
          this.$message.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }
    },

    async handleClearAll () {
      try {
        await this.$confirm(
          '确定清空所有问答记录吗？此操作不可恢复！',
          '警告',
          {
            type: 'warning',
            confirmButtonText: '确定清空',
            cancelButtonText: '取消'
          }
        )

        const response = await ragService.clearAllQaRecords()

        if (response.system_code === 0) {
          this.$message.success('清空成功')
          // 重新加载第一页
          this.currentPage = 1
          this.loadHistory()
          // 通知父组件刷新消息列表
          this.$emit('cleared')
        } else {
          this.$message.error(response.message || '清空失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('清空失败: ' + (error.message || '未知错误'))
        }
      }
    },

    formatTime (timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    renderMarkdown (text) {
      if (!text) return '暂无回答'
      try {
        return marked(text)
      } catch (error) {
        return text
      }
    },

    handleClose () {
      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')

      // 重置数据
      this.searchKeyword = ''
      this.historyList = []
      this.currentPage = 1
      this.total = 0
      this.detailDialogVisible = false
      this.currentDetail = null
    }
  }
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  justify-content: flex-start;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

.detail-content {
  .detail-section {
    margin-bottom: 20px;

    .detail-label {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .detail-value {
      font-size: 14px;
      color: #606266;
      line-height: 1.8;
      word-break: break-word;
      white-space: pre-wrap;

      ::v-deep {
        h1, h2, h3, h4, h5, h6 {
          margin-top: 16px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        p {
          margin: 8px 0;
        }

        code {
          background-color: #f5f7fa;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }

        pre {
          background-color: #f5f7fa;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;

          code {
            background-color: transparent;
            padding: 0;
          }
        }

        ul, ol {
          padding-left: 24px;
          margin: 8px 0;
        }

        li {
          margin: 4px 0;
        }

        blockquote {
          border-left: 4px solid #dcdfe6;
          padding-left: 12px;
          margin: 8px 0;
          color: #909399;
        }
      }
    }
  }

  ::v-deep .el-divider {
    margin: 20px 0;
  }
}
</style>
