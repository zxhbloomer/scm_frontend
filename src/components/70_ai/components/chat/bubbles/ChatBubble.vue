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
        :class="{
          'maximized': isMaximized
        }"
        :style="panelStyle"
      >
        <chat-panel
          :messages="messages"
          :is-loading="isLoading"
          :user-info="userInfo"
          :assistant-info="assistantInfo"
          :online-status="onlineStatus"
          :input-placeholder="inputPlaceholder"
          :is-maximized="isMaximized"
          @send-message="handleSendMessage"
          @close="closeChatPanel"
          @toggle-maximize="toggleMaximize"
          @resize-chat="handleResizeChat"
        />

      </div>
    </transition>
  </div>
</template>

<script>
import ChatPanel from '../panels/ChatPanel.vue'

export default {
  name: 'ChatBubble',
  components: {
    ChatPanel
  },
  data () {
    return {
      isMaximized: false,
      panelSize: {
        width: 480,
        height: Math.max(window.innerHeight * 0.8, 500)
      },
      minSize: {
        width: 480,
        height: 500
      }
    }
  },
  computed: {
    messages () {
      return this.$store.getters['chat/chatMessages']
    },
    unreadCount () {
      return this.$store.getters['chat/chatUnreadCount']
    },
    isLoading () {
      return this.$store.getters['chat/chatIsTyping']
    },
    isExpanded () {
      return this.$store.getters['chat/chatPanelExpanded']
    },
    userInfo () {
      return {
        id: this.$store.getters.staff_id,
        name: this.$store.getters.name || '访客',
        avatar: this.$store.getters.avatar
      }
    },
    assistantInfo () {
      return {
        name: 'SCM智能助手',
        avatar: '',
        role: 'SCM业务专家'
      }
    },
    onlineStatus () {
      return this.$store.getters['chat/connectionStatus']?.isConnected ? 'online' : 'offline'
    },
    inputPlaceholder () {
      return '输入您的消息'
    },

    panelStyle () {
      if (this.isMaximized) {
        return {
          position: 'fixed',
          top: '2.5vh',
          left: '2.5vw',
          right: '2.5vw',
          bottom: '2.5vh',
          width: '95vw',
          height: '95vh',
          zIndex: 10000
        }
      }

      const maxHeight = Math.min(window.innerHeight - 150, window.innerHeight * 0.85)
      const currentHeight = Math.min(this.panelSize.height, maxHeight)

      return {
        width: `${this.panelSize.width}px`,
        height: `${currentHeight}px`,
        maxHeight: `${maxHeight}px`
      }
    }
  },

  watch: {
    isExpanded: {
      handler (newVal, oldVal) {
        if (!oldVal && newVal) {
          this.$nextTick(() => {
            this.startAutoConversation()
          })
        }
      },
      immediate: false
    }
  },
  mounted () {
    if (!this.$store.state.chat) {
      return
    }

    this.$store.dispatch('chat/initChatPanel')
      .catch(_error => {
        // 聊天面板初始化失败处理
      })
    this.handleResize = () => {
      if (!this.isMaximized) {
        const newHeight = Math.max(window.innerHeight * 0.8, this.minSize.height)
        this.panelSize.height = newHeight
      }
    }

    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy () {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize)
    }
  },
  methods: {
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
      this.$store.dispatch('chat/toggleChatPanel')
        .catch(_error => {
          // 切换面板状态失败处理
        })
    },

    closeChatPanel () {
      this.$store.dispatch('chat/setChatPanelExpanded', false)
    },

    handleSendMessage (messageContent) {
      // 如果 messageContent 是对象，提取 content 字段；否则直接使用
      const content = typeof messageContent === 'object' && messageContent.content
        ? messageContent.content
        : messageContent
      this.sendMessage(content)
    },

    toggleMaximize () {
      this.isMaximized = !this.isMaximized
    },

    handleResizeChat (newWidth) {
      if (!this.isMaximized) {
        this.panelSize.width = newWidth
      }
    },

    startAutoConversation () {
      // 聊天面板展开时初始化聊天并加载历史消息
      this.initializeChat().catch(_error => {
        // 聊天初始化失败处理
      })
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

  &.maximized {
    position: fixed !important;
    z-index: 10000;
    border-radius: 8px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
  }

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

    &.maximized {
      top: 5vh !important;
      left: 2.5vw !important;
      right: 2.5vw !important;
      bottom: 5vh !important;
      width: 95vw !important;
      height: 90vh !important;
    }
  }

}
</style>
