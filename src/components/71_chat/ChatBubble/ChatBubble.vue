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
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ChatBubble',
  // 点击外部关闭指令
  directives: {
    'click-outside': {
      bind (el, binding) {
        el.clickOutsideEvent = function (event) {
          // 排除气泡按钮本身的点击
          const chatBubble = el.querySelector('.chat-bubble')
          const chatBubbleWrapper = el.closest('.chat-bubble-wrapper')

          if (!(el === event.target || el.contains(event.target)) &&
              !(chatBubble && (chatBubble === event.target || chatBubble.contains(event.target))) &&
              !(chatBubbleWrapper && chatBubbleWrapper.querySelector('.chat-bubble-badge') &&
                chatBubbleWrapper.querySelector('.chat-bubble-badge').contains(event.target))) {
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
      isExpanded: false
    }
  },
  computed: {
    ...mapState('chat', {
      messages: 'messages',
      unreadCount: 'unreadCount',
      isLoading: 'isLoading'
    })
  },
  mounted () {
    // 可选：初始化聊天连接（需要配置WebSocket端点）
    // this.initializeChat()
  },
  methods: {
    ...mapActions('chat', [
      'sendMessage',
      'markAsRead',
      'initializeChat'
    ]),

    toggleChatPanel () {
      this.isExpanded = !this.isExpanded
      if (this.isExpanded && this.unreadCount > 0) {
        this.markAsRead()
      }
    },

    closeChatPanel () {
      this.isExpanded = false
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
  bottom: 100px;
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
