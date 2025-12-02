<template>
  <div class="qa-message-list">
    <div
      v-if="messages.length === 0"
      class="empty-state"
    >
      <i class="el-icon-chat-line-square" />
      <p>开始提问吧...</p>
    </div>

    <div
      v-else
      ref="messageContainer"
      class="message-container"
    >
      <div
        v-for="(message, index) in messages"
        :key="message.uuid || index"
        class="message-item"
        :class="{ 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }"
      >
        <div class="message-avatar">
          <i
            v-if="message.role === 'user'"
            class="el-icon-user"
          />
          <i
            v-else
            class="el-icon-s-comment"
          />
        </div>

        <div class="message-content">
          <div class="message-header">
            <span class="message-role">
              {{ message.role === 'user' ? '提问' : 'AI回答' }}
            </span>
            <span class="message-time">{{ message.createTime || formatTime(new Date()) }}</span>
          </div>

          <div class="message-text">
            <div v-if="message.role === 'user'" class="user-question">
              {{ message.qaContent }}
            </div>

            <div v-else class="assistant-answer">
              <div
                v-if="message.qaAnswer"
                class="answer-content"
              >
                <div
                  v-if="message.status === 'thinking'"
                  class="thinking-indicator"
                >
                  <i class="el-icon-loading" />
                  <span>思考中...</span>
                </div>
                <md-renderer
                  v-else
                  :source="message.qaAnswer"
                  class="markdown-content"
                />
              </div>

              <div
                v-if="message.status === 'completed' && message.uuid"
                class="message-actions"
              >
                <el-button
                  type="text"
                  size="small"
                  @click="handleViewReference(message)"
                >
                  <i class="el-icon-document" />
                  查看引用资料
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleDelete(message)"
                >
                  <i class="el-icon-delete" />
                  删除
                </el-button>
              </div>

              <div
                v-if="message.status === 'error'"
                class="error-message"
              >
                <i class="el-icon-warning" />
                {{ message.errorMessage || '回答失败，请重试' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MdRenderer } from '../../chat/markdown'

export default {
  name: 'QaMessageList',

  components: {
    MdRenderer
  },

  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },

  watch: {
    messages: {
      handler () {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      },
      deep: true
    }
  },

  methods: {
    /**
     * 格式化时间
     */
    formatTime (date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    /**
     * 滚动到底部
     */
    scrollToBottom () {
      const container = this.$refs.messageContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    /**
     * 查看引用资料
     */
    handleViewReference (message) {
      this.$emit('view-reference', message)
    },

    /**
     * 删除消息
     */
    handleDelete (message) {
      this.$emit('delete', message)
    }
  }
}
</script>

<style scoped>
.qa-message-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

.empty-state p {
  font-size: 14px;
}

.message-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  display: flex;
  margin-bottom: 25px;
}

.message-item:last-child {
  margin-bottom: 0;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ffffff;
}

.user-message .message-avatar {
  background-color: #409EFF;
  margin-left: 15px;
}

.assistant-message .message-avatar {
  background-color: #67C23A;
  margin-right: 15px;
}

.message-content {
  flex: 1;
  max-width: 75%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #909399;
}

.user-message .message-header {
  flex-direction: row-reverse;
}

.message-role {
  font-weight: 500;
  color: #606266;
}

.message-text {
  background-color: #f5f7fa;
  padding: 12px 15px;
  border-radius: 8px;
  line-height: 1.6;
  font-size: 14px;
  color: #303133;
}

.user-message .message-text {
  background-color: #409EFF;
  color: #ffffff;
}

.user-question {
  white-space: pre-wrap;
  word-break: break-word;
}

.assistant-answer {
  width: 100%;
}

.answer-content {
  margin-bottom: 10px;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  color: #909399;
}

.thinking-indicator i {
  margin-right: 8px;
  font-size: 16px;
}

.markdown-content {
  word-break: break-word;
  width: 100%;
}

.message-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.message-actions .el-button {
  padding: 0;
  color: #606266;
}

.message-actions .el-button:hover {
  color: #409EFF;
}

.message-actions i {
  margin-right: 4px;
}

.error-message {
  display: flex;
  align-items: center;
  color: #f56c6c;
  margin-top: 10px;
  padding: 8px;
  background-color: #fef0f0;
  border-radius: 4px;
}

.error-message i {
  margin-right: 8px;
  font-size: 16px;
}
</style>
