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
      class="rag-chat-dialog"
      width="1200px"
      destroy-on-close
      top="5vh"
      @close="handleClose"
    >
      <div class="chat-container">
        <div
          ref="scrollRef"
          class="message-list"
          @scroll="handleScroll"
        >
          <div v-if="qaRecords.length === 0" class="empty-placeholder">
            <i class="el-icon-chat-dot-round" style="font-size: 48px; color: #909399;" />
            <div style="margin-top: 10px; color: #909399;">开始提问吧～</div>
          </div>

          <div v-for="record in qaRecords" :key="record.uuid" class="qa-pair">
            <div class="question-message">
              <div class="message-avatar">
                <i class="el-icon-user" />
              </div>
              <div class="message-content">
                <div class="message-text">{{ record.question }}</div>
                <div class="message-time">{{ formatDateTime(record.createTime) }}</div>
              </div>
            </div>

            <div class="answer-message">
              <div class="message-avatar">
                <i class="el-icon-data-analysis" />
              </div>
              <div class="message-content">
                <!-- ✅ 关键修复：loading时也显示answer内容，实现流式显示 -->
                <div v-if="record.error" class="message-text error-text">
                  {{ record.answer || '请求失败' }}
                </div>
                <div v-else class="message-text ai-answer-text">
                  <div v-if="record.loading && (!record.answer || record.answer.trim() === '')" class="loading-placeholder">
                    <i class="el-icon-loading" /> 生成中...
                  </div>
                  <md-renderer
                    v-else
                    :source="record.answer || '[无答案]'"
                    :reasoning-content="record.reasoning"
                    :send-message="() => {}"
                    :chat-record-id="record.uuid"
                    :disabled="false"
                    type="ai-chat"
                  />
                  <div v-if="record.loading && record.answer && record.answer.trim() !== ''" class="streaming-indicator">
                    <i class="el-icon-loading" />
                  </div>
                </div>

                <div v-if="!record.loading && !record.error && record.answer" class="message-actions">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-document"
                    @click="handleShowReference(record)"
                  >
                    引用
                  </el-button>
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-share"
                    @click="handleShowGraph(record)"
                  >
                    图谱
                  </el-button>
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-delete"
                    style="color: #f56c6c"
                    @click="handleDeleteRecord(record)"
                  >
                    删除
                  </el-button>
                </div>

                <div class="message-time">{{ formatDateTime(record.createTime) }}</div>
              </div>
            </div>
          </div>

          <div v-if="loadedAll && qaRecords.length > 0" class="load-more-tip">
            没有更多了
          </div>
        </div>

        <div v-if="sseRequesting" class="stop-button-container">
          <el-button
            size="mini"
            type="warning"
            icon="el-icon-video-pause"
            @click="handleStopRequest"
          >
            停止生成
          </el-button>
        </div>

        <div class="input-area">
          <div class="input-wrapper">
            <el-input
              ref="inputRef"
              v-model="prompt"
              type="textarea"
              :rows="3"
              :maxlength="2000"
              show-word-limit
              placeholder="输入您的问题..."
              @keyup.enter.native="handleKeyEnter"
            />
            <el-button
              type="primary"
              :disabled="buttonDisabled"
              :loading="sseRequesting"
              @click="handleSubmit"
            >
              <i class="el-icon-s-promotion" /> 发送
            </el-button>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleShowHistory">历史记录</el-button>
        <el-button type="danger" plain @click="handleClearAll">清空对话</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </el-dialog>

    <rag-chat-ref-dialog
      :visible.sync="refDialogVisible"
      :qa-record-uuid="currentRecordUuid"
      :references="currentReferences"
    />

    <rag-chat-graph-dialog
      :visible.sync="graphDialogVisible"
      :qa-record-uuid="currentRecordUuid"
    />

    <rag-qa-history-dialog
      :visible.sync="historyDialogVisible"
      :kb-uuid="kbUuid"
      @select-record="handleSelectHistoryRecord"
    />
  </div>
</template>

<script>
import ragService from '../../../api/ragService'
import elDragDialog from '@/directive/el-drag-dialog'
import RagChatRefDialog from './RagChatRefDialog.vue'
import RagChatGraphDialog from './RagChatGraphDialog.vue'
import RagQaHistoryDialog from './RagQaHistoryDialog.vue'
import { MdRenderer } from '../../chat/markdown'

export default {
  name: 'RagChatDialog',

  directives: { elDragDialog },

  components: {
    RagChatRefDialog,
    RagChatGraphDialog,
    RagQaHistoryDialog,
    MdRenderer
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    kbUuid: {
      type: String,
      required: true
    },
    kbTitle: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      prompt: '',
      qaRecords: [],
      sseRequesting: false,
      controller: null,
      loadedAll: false,
      currentPage: 1,
      pageSize: 20,
      prevScrollTop: 0,
      refDialogVisible: false,
      graphDialogVisible: false,
      historyDialogVisible: false,
      currentRecordUuid: '',
      currentReferences: [],
      scrollTimer: null // 滚动防抖定时器
    }
  },

  computed: {
    dialogTitle () {
      return this.kbTitle ? `${this.kbTitle} - 知识库对话` : '知识库对话'
    },

    buttonDisabled () {
      return this.sseRequesting || !this.prompt || this.prompt.trim() === ''
    }
  },

  watch: {
    visible: {
      handler (val) {
        if (val) {
          this.initDialog()
        }
      },
      immediate: true
    },

    // 深度监听qaRecords变化，实现自动滚动
    qaRecords: {
      handler () {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      },
      deep: true
    }
  },

  beforeDestroy () {
    this.handleStopRequest()
  },

  methods: {
    /**
     * 格式化时间戳为日期时间字符串
     */
    formatDateTime (timestamp) {
      if (!timestamp) return ''

      // 如果是字符串，尝试解析为数字
      const time = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp

      // 验证是否为有效数字
      if (isNaN(time)) return ''

      const date = new Date(time)

      // 验证日期是否有效
      if (isNaN(date.getTime())) return ''

      // 格式化为 "yyyy-MM-dd HH:mm:ss"
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    /**
     * 初始化对话框
     */
    async initDialog () {
      this.qaRecords = []
      this.loadedAll = false
      this.currentPage = 1
      await this.loadMoreMessages()
      this.$nextTick(() => {
        this.scrollToBottom()
        if (this.$refs.inputRef) {
          this.$refs.inputRef.focus()
        }
      })
    },

    /**
     * 加载更多消息
     */
    async loadMoreMessages (callback) {
      if (this.loadedAll) return

      try {
        const response = await ragService.searchQaRecords(
          this.kbUuid,
          '',
          this.currentPage,
          this.pageSize
        )

        const data = response.data || response
        const records = data.records || []

        if (records.length > 0) {
          this.qaRecords = [...records.reverse(), ...this.qaRecords]
        }

        if (records.length < this.pageSize) {
          this.loadedAll = true
        }

        this.currentPage++

        if (callback) callback()
      } catch (error) {
        // 加载消息失败
      }
    },

    /**
     * 滚动处理
     */
    handleScroll (event) {
      const scrollTop = event.target.scrollTop
      const lastScrollClient = event.target.scrollHeight

      if (scrollTop < 50 && scrollTop < this.prevScrollTop) {
        this.loadMoreMessages(() => {
          this.$nextTick(() => {
            const scrollRef = this.$refs.scrollRef
            if (scrollRef) {
              scrollRef.scrollTop = scrollRef.scrollHeight - lastScrollClient
            }
          })
        })
      }

      this.prevScrollTop = scrollTop
    },

    /**
     * 滚动到底部（优化：使用防抖避免频繁滚动）
     */
    scrollToBottom () {
      // 清除之前的定时器
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer)
      }

      // 使用requestAnimationFrame确保DOM已更新
      this.scrollTimer = setTimeout(() => {
        this.$nextTick(() => {
          const scrollRef = this.$refs.scrollRef
          if (scrollRef) {
            scrollRef.scrollTop = scrollRef.scrollHeight
          }
        })
      }, 50) // 50ms防抖
    },

    /**
     * 键盘回车
     */
    handleKeyEnter (event) {
      if (event.ctrlKey || event.metaKey) {
        this.handleSubmit()
      }
    },

    /**
     * 提交问题
     */
    async handleSubmit () {
      const message = this.prompt.trim()
      if (!message || this.sseRequesting) return

      this.sseRequesting = true
      this.controller = new AbortController()
      this.prompt = ''

      try {
        const addResponse = await ragService.addQaRecord(this.kbUuid, {
          question: message
        })

        const qaRecord = addResponse.data || addResponse
        qaRecord.answer = ''
        qaRecord.loading = true
        qaRecord.error = false

        this.qaRecords.push(qaRecord)
        this.scrollToBottom()

        await ragService.sseAsk(
          {
            qaRecordUuid: qaRecord.uuid,
            signal: this.controller.signal
          },
          {
            onStart: () => {
              const record = this.qaRecords.find(r => r.uuid === qaRecord.uuid)
              if (record) {
                this.$set(record, 'answer', '')
                this.$set(record, 'loading', true)
              }
            },
            onContent: (chunk) => {
              // 使用splice替换数组元素，触发Vue响应式更新
              const index = this.qaRecords.findIndex(r => r.uuid === qaRecord.uuid)
              if (index !== -1) {
                const oldRecord = this.qaRecords[index]
                const newAnswer = (oldRecord.answer || '') + chunk
                const newRecord = { ...oldRecord, answer: newAnswer }
                this.qaRecords.splice(index, 1, newRecord)
              }
            },
            onComplete: () => {
              const record = this.qaRecords.find(r => r.uuid === qaRecord.uuid)
              if (record) {
                this.$set(record, 'loading', false)
                this.$set(record, 'error', false)
              }
              this.sseRequesting = false
            },
            onError: (error) => {
              const record = this.qaRecords.find(r => r.uuid === qaRecord.uuid)
              if (record) {
                this.$set(record, 'answer', `系统提示:${error}`)
                this.$set(record, 'loading', false)
                this.$set(record, 'error', true)
              }
              this.sseRequesting = false
              this.$message.error(error)
            }
          }
        )
      } catch (error) {
        this.sseRequesting = false
        this.$message.error('提交失败: ' + (error.message || '未知错误'))
      }
    },

    /**
     * 停止请求
     */
    handleStopRequest () {
      if (this.controller) {
        this.controller.abort()
        this.controller = null
      }
      this.sseRequesting = false
    },

    /**
     * 显示引用
     */
    async handleShowReference (record) {
      this.currentRecordUuid = record.uuid
      try {
        const response = await ragService.getEmbeddingRef(record.uuid)
        this.currentReferences = response.data || response || []
        this.refDialogVisible = true
      } catch (error) {
        this.$message.error('加载引用失败: ' + (error.message || '未知错误'))
      }
    },

    /**
     * 显示图谱
     */
    handleShowGraph (record) {
      this.currentRecordUuid = record.uuid
      this.graphDialogVisible = true
    },

    /**
     * 删除记录
     */
    handleDeleteRecord (record) {
      this.$confirm('删除后无法恢复，确认要删除该条对话记录吗？', '确认信息', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await ragService.deleteQaRecord(record.uuid)
          this.qaRecords = this.qaRecords.filter(r => r.uuid !== record.uuid)
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }).catch(() => {
        // 用户取消
      })
    },

    /**
     * 显示历史记录
     */
    handleShowHistory () {
      this.historyDialogVisible = true
    },

    /**
     * 选择历史记录
     */
    handleSelectHistoryRecord (record) {
      const exists = this.qaRecords.find(r => r.uuid === record.uuid)
      if (!exists) {
        this.qaRecords.push(record)
      }
      this.scrollToBottom()
    },

    /**
     * 清空所有对话
     */
    handleClearAll () {
      this.$confirm('确认要清空所有对话记录吗？此操作不可恢复。', '确认信息', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await ragService.clearAllQaRecords()
          this.qaRecords = []
          this.$message.success('清空成功')
        } catch (error) {
          this.$message.error('清空失败: ' + (error.message || '未知错误'))
        }
      }).catch(() => {
        // 用户取消
      })
    },

    /**
     * 关闭对话框
     */
    handleClose () {
      this.handleStopRequest()
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.qa-pair {
  margin-bottom: 20px;
}

.question-message,
.answer-message {
  display: flex;
  margin-bottom: 15px;
}

.question-message {
  justify-content: flex-end;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.question-message .message-avatar {
  background-color: #409eff;
  color: white;
  margin-left: 10px;
  order: 2;
}

.answer-message .message-avatar {
  background-color: #67c23a;
  color: white;
  margin-right: 10px;
}

.message-content {
  max-width: 70%;
}

.question-message .message-content {
  order: 1;
}

.message-text {
  background-color: white;
  padding: 12px 16px;
  border-radius: 8px;
  word-wrap: break-word;
  white-space: pre-wrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* AI答案文本区域 - 覆盖默认样式以支持markdown渲染 */
.ai-answer-text {
  white-space: normal;
  line-height: 1.6;
}

/* markdown内容样式调整 */
.ai-answer-text >>> p {
  margin: 0.5em 0;
  line-height: 1.6;
}

.ai-answer-text >>> ul,
.ai-answer-text >>> ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.ai-answer-text >>> code {
  background-color: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

.ai-answer-text >>> pre {
  background-color: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.ai-answer-text >>> pre code {
  background-color: transparent;
  padding: 0;
}

.ai-answer-text >>> h1,
.ai-answer-text >>> h2,
.ai-answer-text >>> h3 {
  margin: 0.8em 0 0.5em 0;
  font-weight: 600;
}

.ai-answer-text >>> blockquote {
  border-left: 4px solid #ddd;
  padding-left: 12px;
  margin: 0.5em 0;
  color: #606266;
}

.question-message .message-text {
  background-color: #409eff;
  color: white;
}

.error-text {
  background-color: #fef0f0;
  color: #f56c6c;
}

.message-actions {
  margin-top: 8px;
  display: flex;
  gap: 5px;
}

.message-time {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.load-more-tip {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 10px 0;
}

.stop-button-container {
  text-align: center;
  padding: 10px 0;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.input-area {
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid #ebeef5;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-wrapper .el-textarea {
  flex: 1;
}

.dialog-footer {
  text-align: right;
}

.loading-placeholder {
  color: #909399;
  font-size: 14px;
}

.streaming-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  color: #67c23a;
  font-size: 12px;
}

.streaming-indicator i {
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
