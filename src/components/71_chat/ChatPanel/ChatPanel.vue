<template>
  <div class="chat-panel">
    <!-- 聊天头部 -->
    <div class="chat-panel__header">
      <div class="chat-panel__title">
        <i class="el-icon-service" />
        <span>在线客服</span>
      </div>
      <el-button
        type="text"
        icon="el-icon-close"
        class="chat-panel__close"
        @click="$emit('close')"
      />
    </div>

    <!-- 消息列表 -->
    <div ref="messagesContainer" class="chat-panel__messages">
      <div class="messages-wrapper">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="[`message-item--${message.type}`]"
        >
          <!-- 系统消息 -->
          <div v-if="message.type === 'system'" class="message-system">
            <span>{{ message.content }}</span>
          </div>

          <!-- 用户消息 -->
          <div v-else-if="message.type === 'user'" class="message-user">
            <div class="message-bubble message-bubble--user">
              {{ message.content }}
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>

          <!-- 客服消息 -->
          <div v-else-if="message.type === 'agent'" class="message-agent">
            <el-avatar
              :size="32"
              :src="message.avatar"
              class="message-avatar"
            >
              <i class="el-icon-service" />
            </el-avatar>
            <div class="message-content">
              <div class="message-bubble message-bubble--agent">
                {{ message.content }}
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="typing-indicator">
          <el-avatar :size="32" class="message-avatar">
            <i class="el-icon-service" />
          </el-avatar>
          <div class="typing-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>

    <!-- 消息输入 -->
    <div class="chat-panel__input">
      <div class="input-wrapper">
        <el-input
          ref="messageInput"
          v-model="messageText"
          type="textarea"
          :rows="2"
          :maxlength="500"
          resize="none"
          placeholder="请输入您的问题..."
          :disabled="isLoading"
          @keyup.enter.native="handleSendMessage"
        />
        <div class="input-actions">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-s-promotion"
            :loading="isLoading"
            @click="handleSendMessage"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatPanel',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isTyping: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      messageText: ''
    }
  },

  watch: {
    messages: {
      handler () {
        this.scrollToBottom()
      },
      deep: true
    }
  },

  mounted () {
    // 初始化时聚焦输入框
    this.$nextTick(() => {
      if (this.$refs.messageInput) {
        this.$refs.messageInput.focus()
      }
    })
  },
  methods: {
    handleSendMessage () {
      if (!this.messageText.trim() || this.isLoading) {
        return
      }

      const message = this.messageText.trim()
      this.messageText = ''
      this.$emit('send-message', message)

      // 聚焦到输入框
      this.$nextTick(() => {
        this.$refs.messageInput.focus()
      })
    },

    formatTime (timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()

      if (date.toDateString() === now.toDateString()) {
        // 今天显示时间
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } else {
        // 其他日期显示月日时间
        return date.toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    },

    scrollToBottom () {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  }
}
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

/* 头部样式 */
.chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #409eff;
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.chat-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-panel__close {
  color: white !important;
}

.chat-panel__close:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* 消息列表样式 */
.chat-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fa;
}

.messages-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 消息项样式 */
.message-item {
  display: flex;
  flex-direction: column;
}

/* 系统消息 */
.message-system {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 8px;
}

/* 用户消息 */
.message-item--user {
  align-items: flex-end;
}

.message-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  max-width: 80%;
  margin-left: auto;
}

/* 客服消息 */
.message-item--agent {
  align-items: flex-start;
}

.message-agent {
  display: flex;
  gap: 8px;
  max-width: 80%;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-avatar {
  flex-shrink: 0;
  background: #409eff;
  color: white;
}

/* 消息气泡样式 */
.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  line-height: 1.4;
  word-break: break-word;
  max-width: 100%;
}

.message-bubble--user {
  background: #409eff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble--agent {
  background: white;
  color: #303133;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #c0c4cc;
  padding: 0 4px;
}

/* 正在输入指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.typing-dots {
  display: flex;
  gap: 3px;
  background: white;
  padding: 10px 14px;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  border: 1px solid #e4e7ed;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background: #c0c4cc;
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* 输入区域样式 */
.chat-panel__input {
  padding: 16px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

/* 滚动条样式 */
.chat-panel__messages::-webkit-scrollbar {
  width: 4px;
}

.chat-panel__messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-panel__messages::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.chat-panel__messages::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* Element UI 输入框样式调整 */
.chat-panel__input >>> .el-textarea__inner {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  resize: none !important;
}

.chat-panel__input >>> .el-textarea__inner:focus {
  border-color: #409eff;
}
</style>
