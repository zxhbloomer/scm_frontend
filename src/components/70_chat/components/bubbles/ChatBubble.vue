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
  mounted () {
    // 初始化面板状态（从localStorage恢复）
    this.$store.dispatch('chat/initChatPanel')
    // 可选：初始化聊天连接（需要配置WebSocket端点）
    // this.initializeChat()
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
      // 使用store action来切换面板状态
      this.$store.dispatch('chat/toggleChatPanel')
    },

    closeChatPanel () {
      // 关闭面板（设置为false）
      this.$store.dispatch('chat/setChatPanelExpanded', false)
    },

    handleSendMessage (messageContent) {
      this.sendMessage(messageContent)
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
