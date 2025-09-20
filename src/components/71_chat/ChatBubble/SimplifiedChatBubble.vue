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
        @click="toggleChatPanel"
      >
        <i class="el-icon-chat-dot-round chat-bubble__icon" />
      </div>
    </el-badge>

    <!-- 聊天面板 -->
    <transition name="chat-panel">
      <div
        v-if="isExpanded"
        v-click-outside="closeChatPanel"
        class="chat-panel-container"
      >
        <chat-panel
          :messages="messages"
          :is-loading="isLoading"
          @send-message="handleSendMessage"
          @close="closeChatPanel"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import ChatPanel from '../ChatPanel/ChatPanel.vue'

export default {
  name: 'SimplifiedChatBubble',
  // 点击外部关闭指令
  directives: {
    'click-outside': {
      bind (el, binding) {
        el.clickOutsideEvent = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value()
          }
        }
        document.addEventListener('click', el.clickOutsideEvent)
      },
      unbind (el) {
        document.removeEventListener('click', el.clickOutsideEvent)
      }
    }
  },
  components: {
    ChatPanel
  },
  data () {
    return {
      isExpanded: false,
      unreadCount: 3, // 临时固定值
      isLoading: false,
      messages: [
        {
          id: 1,
          type: 'system',
          content: '欢迎来到在线客服',
          timestamp: new Date().getTime()
        },
        {
          id: 2,
          type: 'agent',
          content: '您好！有什么可以帮助您的吗？',
          timestamp: new Date().getTime(),
          avatar: ''
        }
      ]
    }
  },
  mounted () {
    console.log('✅ SimplifiedChatBubble组件加载成功!')
    console.log('当前状态:', {
      messages: this.messages.length,
      unreadCount: this.unreadCount,
      isLoading: this.isLoading
    })
  },
  methods: {
    toggleChatPanel () {
      console.log('=== toggleChatPanel 被调用 ===')
      this.isExpanded = !this.isExpanded
      console.log('展开状态:', this.isExpanded)

      if (this.isExpanded && this.unreadCount > 0) {
        this.unreadCount = 0 // 标记为已读
      }
    },

    closeChatPanel () {
      console.log('=== closeChatPanel 被调用 ===')
      this.isExpanded = false
    },

    handleSendMessage (messageContent) {
      console.log('=== handleSendMessage 被调用 ===', messageContent)

      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: messageContent,
        timestamp: new Date().getTime()
      }
      this.messages.push(userMessage)

      // 模拟客服回复
      this.isLoading = true
      setTimeout(() => {
        const agentMessage = {
          id: Date.now() + 1,
          type: 'agent',
          content: '我收到了您的消息：' + messageContent,
          timestamp: new Date().getTime(),
          avatar: ''
        }
        this.messages.push(agentMessage)
        this.isLoading = false
      }, 1000)
    }
  }
}
</script>

<style scoped>
.chat-bubble-wrapper {
  position: fixed;
  bottom: 20px;
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
  width: 360px;
  height: 500px;
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
