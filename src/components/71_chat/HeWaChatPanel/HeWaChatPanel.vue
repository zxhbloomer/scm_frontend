<template>
  <div class="hewa-chat-panel">
    <!-- 固定头部 -->
    <div class="chat-header-fixed">
      <chat-header
        :assistant="assistant"
        :online-status="onlineStatus"
        @close="$emit('close')"
        @switch-human="$emit('switch-human')"
      />
    </div>

    <!-- 可滚动中间区域 -->
    <div class="chat-content-scrollable">
      <!-- 欢迎区域和快捷问题 -->
      <welcome-area
        v-if="showWelcome"
        :quick-questions="quickQuestions"
        :user-name="userInfo.name"
        @quick-question="$emit('quick-question', $event)"
      />

      <!-- 消息列表 -->
      <message-list
        :messages="messages"
        :is-typing="isTyping"
        :user-info="userInfo"
        @message-action="handleMessageAction"
      />
    </div>

    <!-- 固定底部 -->
    <div class="chat-footer-fixed">
      <chat-footer
        :is-loading="isLoading"
        :placeholder="inputPlaceholder"
        @send-message="$emit('send-message', $event)"
      />
    </div>

    <!-- 反馈面板 -->
    <feedback-panel
      v-if="showFeedback"
      :message="feedbackMessage"
      @feedback="handleFeedback"
      @close-feedback="showFeedback = false"
    />
  </div>
</template>

<script>
import ChatHeader from './components/ChatHeader.vue'
import WelcomeArea from './components/WelcomeArea.vue'
import MessageList from './components/MessageList.vue'
import ChatFooter from './components/ChatFooter.vue'
import FeedbackPanel from './components/FeedbackPanel.vue'

export default {
  name: 'HeWaChatPanel',

  components: {
    ChatHeader,
    WelcomeArea,
    MessageList,
    ChatFooter,
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
    isTyping: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: () => ({})
    },
    quickQuestions: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      showWelcome: true,
      showFeedback: false,
      feedbackMessage: null,
      onlineStatus: 'online',

      // AI助手信息
      assistant: {
        name: 'HeWa智能助手',
        avatar: '/static/images/hewa-avatar.png',
        role: 'SCM业务专家',
        description: '专业的供应链管理助手，为您提供智能化的业务支持'
      }
    }
  },

  computed: {
    inputPlaceholder () {
      return this.isLoading ? '正在思考中...' : '请输入您的问题...'
    }
  },

  watch: {
    messages: {
      handler (newMessages) {
        // 当有新消息时，隐藏欢迎区域
        if (newMessages.length > 1) {
          this.showWelcome = false
        }
      },
      deep: true
    }
  },

  mounted () {
    console.log('✅ HeWa聊天面板加载成功!')
    this.initializePanel()
  },

  methods: {
    initializePanel () {
      // 初始化面板状态
      this.checkOnlineStatus()

      // 定期检查在线状态
      setInterval(() => {
        this.checkOnlineStatus()
      }, 30000)
    },

    checkOnlineStatus () {
      // 检查AI服务在线状态
      // 这里可以调用实际的状态检查接口
      this.onlineStatus = navigator.onLine ? 'online' : 'offline'
    },

    handleMessageAction (action, message) {
      console.log('消息操作:', action, message)

      switch (action) {
        case 'copy':
          this.copyToClipboard(message.content)
          break
        case 'feedback':
          this.showFeedbackPanel(message)
          break
        case 'retry':
          this.retryMessage(message)
          break
        case 'execute':
          this.executeAction(message)
          break
        default:
          console.warn('未知的消息操作:', action)
      }
    },

    copyToClipboard (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('已复制到剪贴板')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    },

    showFeedbackPanel (message) {
      this.feedbackMessage = message
      this.showFeedback = true
    },

    retryMessage (message) {
      // 重试发送消息
      const userMessage = this.messages.find(m =>
        m.type === 'user' && m.timestamp < message.timestamp
      )

      if (userMessage) {
        this.$emit('send-message', userMessage.content)
      }
    },

    executeAction (message) {
      // 执行消息中的操作
      if (message.actions) {
        message.actions.forEach(action => {
          this.handleActionClick(action)
        })
      }
    },

    handleActionClick (action) {
      console.log('执行操作:', action)

      switch (action.action) {
        case 'show_tutorial':
          this.showTutorial(action.data)
          break
        case 'contact_support':
          this.contactSupport()
          break
        case 'open_module':
          this.openModule(action.data)
          break
        default:
          console.warn('未知操作:', action.action)
      }
    },

    showTutorial (data) {
      // 显示教程
      this.$message.info('正在打开教程...')
      // 这里可以打开新窗口或跳转到教程页面
    },

    contactSupport () {
      // 联系技术支持
      this.$emit('switch-human')
    },

    openModule (moduleData) {
      // 打开指定模块
      this.$message.info(`正在打开${moduleData.name}模块...`)
      // 这里可以使用路由跳转到指定模块
    },


    handleFeedback (feedback) {
      console.log('处理反馈:', feedback)
      this.$emit('feedback', {
        message: this.feedbackMessage,
        feedback: feedback,
        timestamp: Date.now()
      })

      this.showFeedback = false
      this.feedbackMessage = null
    }
  }
}
</script>

<style scoped>
.hewa-chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%; /* 占满父容器 */
  flex: 1; /* 确保在flex容器中正确展开 */
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  overflow: hidden; /* 关键：防止整体滚动，严格按照chatwoot模式 */
}

/* 添加面板的微妙边框光效 */
.hewa-chat-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.05) 50%,
    rgba(240, 147, 251, 0.1) 100%
  );
  pointer-events: none;
  z-index: 0;
}

.hewa-chat-panel > * {
  position: relative;
  z-index: 1;
}

/* ===== 基于chatwoot的三段式布局样式 ===== */

/* 固定头部 - 按chatwoot模式 */
.chat-header-fixed {
  flex-shrink: 0; /* 不缩放 */
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

/* 可滚动中间区域 - 严格按chatwoot模式：flex flex-1 overflow-auto */
.chat-content-scrollable {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto; /* chatwoot使用的是 overflow: auto 而不是 overflow-y: auto */
  background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
  min-height: 0; /* 重要：确保flex子项可以缩小 */
}

/* 固定底部 - 按chatwoot模式：直接在外层容器中 */
.chat-footer-fixed {
  flex-shrink: 0; /* 不缩放 */
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

/* 平滑的滚动条样式 */
.hewa-chat-panel ::-webkit-scrollbar {
  width: 6px;
}

.hewa-chat-panel ::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.hewa-chat-panel ::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.hewa-chat-panel ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
</style>
