<template>
  <div ref="messagesContainer" class="hewa-message-list">
    <div class="messages-wrapper">
      <!-- 消息项 -->
      <transition-group name="message" tag="div" class="messages-container">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="[`message-item--${message.type}`]"
        >
          <!-- 系统消息 -->
          <div v-if="message.type === 'system'" class="message-system">
            <div class="system-content">
              <i class="el-icon-info" />
              <span>{{ message.content }}</span>
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>

          <!-- 用户消息 -->
          <div v-else-if="message.type === 'user'" class="message-user">
            <div class="message-content">
              <div class="message-bubble message-bubble--user">
                <div class="bubble-content">{{ message.content }}</div>
                <div class="bubble-actions">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-copy-document"
                    class="bubble-action-btn"
                    @click="copyMessage(message)"
                  />
                </div>
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
            <div class="message-avatar">
              <el-avatar :size="32" :src="userInfo.avatar">
                <i class="el-icon-user" />
              </el-avatar>
            </div>
          </div>

          <!-- AI助手消息 -->
          <div v-else-if="message.type === 'ai'" class="message-ai">
            <div class="message-avatar">
              <el-avatar :size="32" :src="message.avatar" class="ai-avatar">
                <svg viewBox="0 0 24 24" class="ai-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </el-avatar>
            </div>

            <div class="message-content">
              <div class="message-bubble message-bubble--ai">
                <!-- 消息内容 -->
                <div class="bubble-content">
                  <div v-if="message.isError" class="error-content">
                    <i class="el-icon-warning" />
                    <span>{{ message.content }}</span>
                  </div>
                  <div v-else class="ai-content">
                    {{ message.content }}
                  </div>
                </div>

                <!-- 步骤化处理 -->
                <div v-if="message.steps && message.steps.length" class="ai-steps">
                  <div class="steps-title">操作步骤：</div>
                  <ol class="steps-list">
                    <li v-for="(step, index) in message.steps" :key="index" class="step-item">
                      {{ step }}
                    </li>
                  </ol>
                </div>

                <!-- 操作按钮 -->
                <div v-if="message.actions && message.actions.length" class="ai-actions">
                  <el-button
                    v-for="action in message.actions"
                    :key="action.action"
                    type="primary"
                    size="mini"
                    class="action-button"
                    @click="executeAction(action, message)"
                  >
                    {{ action.text }}
                  </el-button>
                </div>

                <!-- 消息操作栏 -->
                <div class="bubble-actions">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-copy-document"
                    class="bubble-action-btn"
                    title="复制"
                    @click="copyMessage(message)"
                  />
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-thumb"
                    class="bubble-action-btn"
                    title="有用"
                    @click="feedbackMessage(message, 'positive')"
                  />
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-close"
                    class="bubble-action-btn"
                    title="无用"
                    @click="feedbackMessage(message, 'negative')"
                  />
                  <el-button
                    v-if="message.isError"
                    type="text"
                    size="mini"
                    icon="el-icon-refresh"
                    class="bubble-action-btn"
                    title="重试"
                    @click="retryMessage(message)"
                  />
                </div>
              </div>

              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- 人工客服消息 -->
          <div v-else-if="message.type === 'agent'" class="message-agent">
            <div class="message-avatar">
              <el-avatar :size="32" :src="message.avatar" class="agent-avatar">
                <i class="el-icon-service" />
              </el-avatar>
            </div>

            <div class="message-content">
              <div class="agent-info">
                <span class="agent-name">{{ message.sender.name }}</span>
                <span class="agent-role">{{ message.sender.role }}</span>
              </div>

              <div class="message-bubble message-bubble--agent">
                <div class="bubble-content">{{ message.content }}</div>
                <div class="bubble-actions">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-copy-document"
                    class="bubble-action-btn"
                    @click="copyMessage(message)"
                  />
                </div>
              </div>

              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- 正在输入指示器 -->
      <div v-if="isTyping" class="typing-indicator">
        <div class="message-avatar">
          <el-avatar :size="32" class="ai-avatar">
            <svg viewBox="0 0 24 24" class="ai-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </el-avatar>
        </div>

        <div class="typing-content">
          <div class="typing-bubble">
            <div class="typing-text">HeWa正在思考</div>
            <div class="typing-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageList',

  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isTyping: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },

  watch: {
    messages: {
      handler () {
        this.scrollToBottom()
      },
      deep: true
    },

    isTyping () {
      this.scrollToBottom()
    }
  },

  methods: {
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
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }
      })
    },

    copyMessage (message) {
      const text = message.content
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopyTextToClipboard(text)
        })
      } else {
        this.fallbackCopyTextToClipboard(text)
      }

      this.$emit('message-action', 'copy', message)
    },

    fallbackCopyTextToClipboard (text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        this.$message.success('已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }

      document.body.removeChild(textArea)
    },

    feedbackMessage (message, type) {
      console.log('消息反馈:', type, message)

      const feedbackText = type === 'positive' ? '感谢您的反馈！' : '我们会改进回答质量'
      this.$message.success(feedbackText)

      this.$emit('message-action', 'feedback', { message, type })
    },

    retryMessage (message) {
      console.log('重试消息:', message)
      this.$emit('message-action', 'retry', message)
    },

    executeAction (action, message) {
      console.log('执行操作:', action, message)
      this.$emit('message-action', 'execute', { action, message })
    }
  }
}
</script>

<style scoped>
.hewa-message-list {
  background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
  position: relative;
}

.messages-wrapper {
  padding: 16px 20px;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 消息项布局 */
.message-item {
  display: flex;
  animation: messageSlideIn 0.4s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 系统消息 */
.message-system {
  align-self: center;
  text-align: center;
}

.system-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.2);
  border-radius: 16px;
  color: #67c23a;
  font-size: 13px;
}

/* 用户消息 */
.message-item--user {
  flex-direction: row-reverse;
}

.message-user {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 80%;
  margin-left: auto;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-user .message-content {
  align-items: flex-end;
}

/* AI助手消息 */
.message-item--ai {
  flex-direction: row;
}

.message-ai,
.message-agent {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 85%;
}

.message-ai .message-content,
.message-agent .message-content {
  align-items: flex-start;
}

/* 头像样式 */
.message-avatar {
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.agent-avatar {
  background: #67c23a;
  color: white;
}

.ai-icon {
  width: 18px;
  height: 18px;
  fill: white;
}

/* 消息气泡 */
.message-bubble {
  position: relative;
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
  word-break: break-word;
  max-width: 100%;
  transition: all 0.3s ease;
}

.message-bubble:hover .bubble-actions {
  opacity: 1;
  transform: translateY(0);
}

.message-bubble--user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-bubble--ai {
  background: white;
  color: #303133;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.1);
}

.message-bubble--agent {
  background: white;
  color: #303133;
  border: 1px solid rgba(103, 194, 58, 0.2);
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.1);
}

/* 气泡内容 */
.bubble-content {
  margin-bottom: 4px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
}

.ai-content {
  white-space: pre-wrap;
}

/* AI步骤 */
.ai-steps {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.steps-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.steps-list {
  margin: 0;
  padding-left: 16px;
}

.step-item {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
  line-height: 1.4;
}

/* AI操作按钮 */
.ai-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 12px;
  height: auto;
}

.action-button:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
}

/* 气泡操作栏 */
.bubble-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.3s ease;
}

.bubble-action-btn {
  padding: 4px 6px;
  font-size: 12px;
  color: #c0c4cc;
  min-height: auto;
  height: auto;
  border-radius: 4px;
}

.bubble-action-btn:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

/* 人工客服信息 */
.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.agent-name {
  font-size: 12px;
  font-weight: 600;
  color: #67c23a;
}

.agent-role {
  font-size: 11px;
  color: #909399;
  background: rgba(103, 194, 58, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 消息时间 */
.message-time {
  font-size: 11px;
  color: #c0c4cc;
  padding: 0 4px;
  white-space: nowrap;
}

/* 正在输入指示器 */
.typing-indicator {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  animation: typing-fade-in 0.3s ease-out;
}

@keyframes typing-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.typing-bubble {
  background: white;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  border-bottom-left-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-text {
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background: #667eea;
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

/* 消息过渡动画 */
.message-enter-active,
.message-leave-active {
  transition: all 0.4s ease;
}

.message-enter,
.message-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.message-move {
  transition: transform 0.4s ease;
}

/* 滚动条样式 */
.hewa-message-list::-webkit-scrollbar {
  width: 6px;
}

.hewa-message-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.hewa-message-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.hewa-message-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .messages-wrapper {
    padding: 12px 16px;
  }

  .message-user,
  .message-ai,
  .message-agent {
    max-width: 95%;
  }

  .message-bubble {
    padding: 10px 12px;
    font-size: 14px;
  }

  .ai-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
