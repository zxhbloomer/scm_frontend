<template>
  <div class="chat-bubble-wrapper">
    <!-- 聊天气泡按钮 -->
    <el-badge
      :value="unreadCount"
      :hidden="unreadCount === 0"
      class="chat-bubble-badge"
    >
      <div
        class="chat-bubble"
        :class="{ 'chat-bubble--expanded': isExpanded }"
        @click.stop="toggleChatPanel"
      >
        <i class="el-icon-chat-dot-round chat-bubble__icon" />
      </div>
    </el-badge>

    <!-- 聊天面板 -->
    <transition name="chat-panel">
      <div
        v-if="isExpanded"
        class="chat-panel-container"
      >
        <chat-panel
          :messages="messages"
          :is-loading="isLoading"
          :user-info="userInfo"
          :assistant-info="assistantInfo"
          :online-status="onlineStatus"
          :input-placeholder="inputPlaceholder"
          @send-message="handleSendMessage"
          @close="closeChatPanel"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import ChatPanel from '../panels/ChatPanel.vue'

export default {
  name: 'ChatBubble',
  // 移除点击外部关闭指令，现在只能通过点击气泡切换状态
  components: {
    ChatPanel
  },
  data () {
    return {
      // 面板状态现在由store管理，移除本地状态
    }
  },
  computed: {
    // 使用项目标准的全局getters
    messages () {
      return this.$store.getters.chatMessages
    },
    unreadCount () {
      return this.$store.getters.chatUnreadCount
    },
    isLoading () {
      return this.$store.getters.chatIsLoading
    },
    // 面板展开状态从store获取
    isExpanded () {
      return this.$store.getters.chatPanelExpanded
    },
    // 用户信息
    userInfo () {
      return {
        id: this.$store.getters.staff_id,
        name: this.$store.getters.name || '访客',
        avatar: this.$store.getters.avatar
      }
    },
    // 助手信息
    assistantInfo () {
      return {
        name: 'SCM智能助手',
        avatar: '',
        role: 'SCM业务专家'
      }
    },
    // 在线状态
    onlineStatus () {
      return this.$store.getters.chatConnectionStatus ? 'online' : 'offline'
    },
    // 输入占位符
    inputPlaceholder () {
      return '输入您的消息'
    }
  },

  // 监听面板展开状态变化
  watch: {
    // SCM特有逻辑：面板打开时自动开始AI对话
    isExpanded: {
      handler (newVal, oldVal) {
        console.log('面板状态变化:', oldVal, '->', newVal)
        // 从关闭到打开时，自动发起AI对话
        if (!oldVal && newVal) {
          console.log('聊天面板打开，准备开始自动AI对话')
          // 延迟一下确保组件完全渲染
          this.$nextTick(() => {
            this.startAutoConversation()
          })
        }
      },
      immediate: false
    }
  },
  mounted () {
    console.log('ChatBubble mounted')
    console.log('Store modules:', Object.keys(this.$store.state))
    console.log('Chat store exists:', !!this.$store.state.chat)

    if (this.$store.state.chat) {
      console.log('Chat store state:', this.$store.state.chat)
      console.log('isPanelExpanded:', this.$store.state.chat.isPanelExpanded)
    } else {
      console.error('Chat store 模块未找到！')
      return
    }

    // 测试getter
    console.log('chatPanelExpanded getter:', this.$store.getters.chatPanelExpanded)

    // 初始化面板状态（从localStorage恢复）
    this.$store.dispatch('chat/initChatPanel')
      .then(() => {
        console.log('聊天面板初始化完成')
        console.log('初始化后面板状态:', this.$store.state.chat.isPanelExpanded)
      })
      .catch(error => {
        console.error('聊天面板初始化失败:', error)
      })
  },
  methods: {
    // 使用项目标准的action调用方式
    sendMessage (content) {
      return this.$store.dispatch('chat/sendMessage', content)
    },
    markAsRead () {
      return this.$store.dispatch('chat/markAsRead')
    },
    initializeChat () {
      return this.$store.dispatch('chat/initializeChat')
    },

    toggleChatPanel () {
      console.log('点击聊天气泡')
      console.log('当前面板状态:', this.isExpanded)
      console.log('Store state:', this.$store.state.chat)

      // 使用store action来切换面板状态
      this.$store.dispatch('chat/toggleChatPanel')
        .then(() => {
          console.log('切换后面板状态:', this.isExpanded)
        })
        .catch(error => {
          console.error('切换面板状态失败:', error)
        })
    },

    closeChatPanel () {
      // 关闭面板（设置为false）
      this.$store.dispatch('chat/setChatPanelExpanded', false)
    },

    handleSendMessage (messageContent) {
      this.sendMessage(messageContent)
    },

    // SCM特有功能：面板打开时自动开始AI对话
    startAutoConversation () {
      // 检查是否已有消息，如果没有则发起欢迎对话
      if (this.messages.length === 0) {
        console.log('开始自动AI对话...')
        // 发送一个欢迎消息来启动对话
        const welcomePrompt = '您好，我是SCM智能助手，请问有什么可以帮助您的吗？'
        this.sendMessage(welcomePrompt)
      }
    }
  }
}
</script>

<style scoped>
.chat-bubble-wrapper {
  position: fixed;
  bottom: 50px;
  right: 20px;
  z-index: 9999;
}

.chat-bubble-badge {
  display: inline-block;
}

.chat-bubble {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  user-select: none;
}

.chat-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.chat-bubble--expanded {
  background: linear-gradient(135deg, #67c23a 0%, #409eff 100%);
}

.chat-bubble__icon {
  color: white;
  font-size: 24px;
  transition: all 0.3s ease;
}

.chat-bubble--expanded .chat-bubble__icon {
  transform: rotate(180deg);
}

.chat-panel-container {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 480px;
  height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* 过渡动画 */
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: bottom right;
}

.chat-panel-enter,
.chat-panel-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-bubble-wrapper {
    bottom: 15px;
    right: 15px;
  }

  .chat-panel-container {
    width: calc(100vw - 30px);
    height: 70vh;
    right: -15px;
    bottom: 80px;
  }
}
</style>
