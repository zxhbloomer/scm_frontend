<template>
  <div class="chat-panel chat-container">
    <!-- 聊天头部 -->
    <chat-header
      :assistant="assistantInfo"
      :online-status="onlineStatus"
      :is-maximized="isMaximized"
      @close="$emit('close')"
      @toggle-maximize="$emit('toggle-maximize')"
      @switch-human="handleSwitchHuman"
      @clear-conversation="handleClearConversation"
      @export-conversation="handleExportConversation"
      @open-settings="handleOpenSettings"
      @open-help="handleOpenHelp"
    />

    <!-- 消息列表 -->
    <div class="chat-panel__content">
      <message-list
        ref="messageList"
        :messages="messages"
        :is-typing="isTyping"
        :user-info="userInfo"
        @message-action="handleMessageAction"
        @quick-question="handleQuickQuestion"
        @resize-chat="handleResizeChat"
      />
    </div>

    <!-- 新建对话按钮 -->
    <div class="new-conversation-area">
      <button
        class="new-conversation-btn"
        @click="handleNewConversation"
      >
        + 新建对话
      </button>
    </div>

    <!-- 聊天底部 -->
    <chat-footer
      :is-loading="isLoading"
      :placeholder="inputPlaceholder"
      @send-message="handleSendMessage"
      @input-focus="handleInputFocus"
    />

    <!-- 反馈面板 -->
    <feedback-panel
      :visible="showFeedback"
      :message="feedbackMessage"
      @close-feedback="closeFeedback"
      @feedback="handleFeedback"
    />
  </div>
</template>

<script>
// 导入Tailwind CSS样式 - 仅在聊天组件中启用
import '../../../styles/index.scss'

import ChatHeader from './ChatHeader.vue'
import ChatFooter from './ChatFooter.vue'
import MessageList from '../messages/MessageList.vue'
import FeedbackPanel from '../feedback/FeedbackPanel.vue'

export default {
  name: 'ChatPanel',

  components: {
    ChatHeader,
    ChatFooter,
    MessageList,
    FeedbackPanel
  },

  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: () => ({
        id: null,
        name: '访客',
        avatar: ''
      })
    },
    assistantInfo: {
      type: Object,
      default: () => ({
        name: 'SCM智能助手',
        avatar: '',
        role: 'SCM业务专家'
      })
    },
    onlineStatus: {
      type: String,
      default: 'online'
    },
    inputPlaceholder: {
      type: String,
      default: '输入您的消息'
    },
    isMaximized: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      showFeedback: false,
      feedbackMessage: null
    }
  },

  computed: {
    isTyping () {
      return this.isLoading || this.$store.getters['chat/chatIsTyping']
    }
  },

  methods: {
    handleSendMessage (message) {
      this.$emit('send-message', message)
    },

    handleMessageAction (action, data) {
      switch (action) {
        case 'copy':
          break
        case 'feedback':
          this.openFeedback(data.message)
          break
        case 'retry':
          this.$emit('retry-message', data)
          break
        case 'execute':
          this.$emit('execute-action', data)
          break
        default:
          break
      }
    },

    handleSwitchHuman () {
      this.$emit('switch-human')
    },

    handleClearConversation () {
      this.$emit('clear-conversation')
    },

    handleExportConversation () {
      this.$emit('export-conversation')
    },

    handleOpenSettings () {
      this.$emit('open-settings')
    },

    handleOpenHelp () {
      this.$emit('open-help')
    },

    openFeedback (message) {
      this.feedbackMessage = message
      this.showFeedback = true
    },

    closeFeedback () {
      this.showFeedback = false
      this.feedbackMessage = null
    },

    handleFeedback (feedbackData) {
      this.$emit('feedback', feedbackData)
    },

    handleQuickQuestion (question) {
      this.$emit('send-message', question)
    },

    handleResizeChat (newWidth) {
      this.$emit('resize-chat', newWidth)
    },

    handleInputFocus () {
      // 当输入框获得焦点时，滚动到底部
      if (this.$refs.messageList) {
        this.$refs.messageList.scrollToBottom()
      }
    },

    handleNewConversation () {
      this.$store.dispatch('chat/clearConversation')
        .then(() => {
          this.$message.success('新对话已创建')
        })
        .catch(error => {
          this.$message.error('创建新对话失败：' + error.message)
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
  overflow: hidden;
}

.chat-panel__content {
  flex: 1;
  overflow: hidden;
  background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
  min-height: 0; /* 确保可以收缩 */
}

/* 确保三段式布局：头部固定、内容滚动、底部固定 */
.chat-panel > :first-child {
  flex-shrink: 0; /* 头部不收缩 */
  position: relative;
  z-index: 10;
}

.chat-panel > .chat-panel__content {
  flex: 1;
  min-height: 0; /* 允许内容区域收缩并滚动 */
  overflow: hidden;
}

.chat-panel > :last-child {
  flex-shrink: 0; /* 底部不收缩 */
  position: relative;
  z-index: 10;
}

/* 新建对话按钮区域 */
.new-conversation-area {
  padding: 8px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.new-conversation-btn {
  background: none;
  border: none;
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.new-conversation-btn:hover {
  color: #337ecc;
  text-decoration: underline;
}

.new-conversation-btn:focus {
  outline: none;
}

/* 确保聊天面板在小屏幕上正确显示 */
@media (max-height: 600px) {
  .chat-panel {
    min-height: 400px;
  }
}
</style>
