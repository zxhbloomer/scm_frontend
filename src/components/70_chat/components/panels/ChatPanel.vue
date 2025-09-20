<template>
  <div class="chat-panel chat-container">
    <!-- 聊天头部 -->
    <chat-header
      :assistant="assistantInfo"
      :online-status="onlineStatus"
      @close="$emit('close')"
      @switch-human="handleSwitchHuman"
      @clear-conversation="handleClearConversation"
      @export-conversation="handleExportConversation"
      @open-settings="handleOpenSettings"
      @open-help="handleOpenHelp"
    />

    <!-- 消息列表 -->
    <div class="chat-panel__content">
      <message-list
        :messages="messages"
        :is-typing="isLoading"
        :user-info="userInfo"
        @message-action="handleMessageAction"
        @quick-question="handleQuickQuestion"
      />
    </div>

    <!-- 聊天底部 -->
    <chat-footer
      :is-loading="isLoading"
      :placeholder="inputPlaceholder"
      @send-message="handleSendMessage"
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
import '../../styles/index.scss'

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
    }
  },

  data () {
    return {
      showFeedback: false,
      feedbackMessage: null
    }
  },

  methods: {
    handleSendMessage (message) {
      this.$emit('send-message', message)
    },

    handleMessageAction (action, data) {
      switch (action) {
        case 'copy':
          console.log('复制消息:', data)
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
          console.log('未知消息操作:', action, data)
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
      console.log('用户反馈:', feedbackData)
    },

    handleQuickQuestion (question) {
      console.log('处理快捷问题:', question)
      // 将快捷问题作为用户消息发送
      this.$emit('send-message', question)
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
}

/* 确保三段式布局 */
.chat-panel > :first-child {
  flex-shrink: 0;
}

.chat-panel > .chat-panel__content {
  flex: 1;
  min-height: 0;
}

.chat-panel > :last-child {
  flex-shrink: 0;
}
</style>
