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
        @open-page="handleOpenPage"
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

    <!-- 全屏拖放引导层 -->
    <transition name="fade">
      <div
        v-if="showGlobalDropZone"
        class="global-drop-zone"
        @drop.prevent="handleGlobalDrop"
        @dragover.prevent
        @dragleave="handleGlobalDragLeave"
      >
        <div class="drop-hint">
          <i class="el-icon-upload" style="font-size: 48px; color: #409eff;" />
          <p class="hint-text">拖拽文件到这里上传</p>
          <p class="hint-subtext">支持图片、文档、音频等文件</p>
        </div>
      </div>
    </transition>

    <!-- AI业务弹窗：工作流输出JSON自动打开对应业务弹窗 -->
    <AiBusinessDialogLoader ref="aiDialogLoader" />
  </div>
</template>

<script>
// 导入Tailwind CSS样式 - 仅在聊天组件中启用
import '../../../styles/index.scss'

import ChatHeader from './ChatHeader.vue'
import ChatFooter from './ChatFooter.vue'
import MessageList from '../messages/MessageList.vue'
import FeedbackPanel from '../feedback/FeedbackPanel.vue'
import AiBusinessDialogLoader from '@/components/70_ai/components/common/AiBusinessDialogLoader.vue'

export default {
  name: 'ChatPanel',

  components: {
    ChatHeader,
    ChatFooter,
    MessageList,
    FeedbackPanel,
    AiBusinessDialogLoader
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
      feedbackMessage: null,
      // 全局拖放引导层
      showGlobalDropZone: false,
      dragLeaveTimer: null
    }
  },

  computed: {
    isTyping () {
      return this.isLoading || this.$store.getters['chat/chatIsTyping']
    },
    pendingAiDialogOutput () {
      return this.$store.state.chat.pendingAiDialogOutput
    }
  },

  watch: {
    pendingAiDialogOutput (val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.aiDialogLoader.open(val)
          this.$store.commit('chat/SET_PENDING_AI_DIALOG_OUTPUT', null)
        })
      }
    }
  },

  mounted () {
    // 监听全局拖动事件
    window.addEventListener('dragenter', this.handleWindowDragEnter)
    window.addEventListener('dragover', this.handleWindowDragOver)
  },

  beforeDestroy () {
    // 移除全局事件监听
    window.removeEventListener('dragenter', this.handleWindowDragEnter)
    window.removeEventListener('dragover', this.handleWindowDragOver)
    if (this.dragLeaveTimer) {
      clearTimeout(this.dragLeaveTimer)
    }
  },

  methods: {
    handleSendMessage (message) {
      if (this.$refs.messageList) {
        this.$refs.messageList.prepareScrollToUserMessage()
      }
      this.$emit('send-message', message)
    },

    /**
     * 从消息中的"打开页面"按钮触发业务弹窗
     * @param {string} aiOpenDialogPara - 含ai_new_route的JSON字符串
     */
    handleOpenPage (aiOpenDialogPara) {
      if (this.$refs.aiDialogLoader) {
        this.$refs.aiDialogLoader.open(aiOpenDialogPara)
      }
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
      if (this.$refs.messageList) {
        this.$refs.messageList.prepareScrollToUserMessage()
      }
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
    },

    // 全局拖放事件处理
    handleWindowDragEnter (e) {
      // 检测是否拖动文件（而非页面元素）
      if (e.dataTransfer && e.dataTransfer.types) {
        const hasFiles = Array.from(e.dataTransfer.types).includes('Files')
        if (hasFiles) {
          console.log('🌍 全局检测到文件拖动')
          this.showGlobalDropZone = true
        }
      }
    },

    handleWindowDragOver (e) {
      // 持续检测拖动，保持overlay显示
      if (this.showGlobalDropZone) {
        e.preventDefault()
      }
    },

    handleGlobalDragLeave (e) {
      // 使用延迟确保真正离开（避免子元素触发）
      if (this.dragLeaveTimer) {
        clearTimeout(this.dragLeaveTimer)
      }

      this.dragLeaveTimer = setTimeout(() => {
        console.log('👋 离开拖放区域')
        this.showGlobalDropZone = false
      }, 100)
    },

    handleGlobalDrop (e) {
      console.log('🎯 全局drop触发')
      // 隐藏overlay
      this.showGlobalDropZone = false

      // 获取文件
      const files = e.dataTransfer?.files
      if (!files || files.length === 0) {
        console.warn('⚠️ 没有检测到文件')
        return
      }

      // 转发到ChatFooter的ChatInputWrap处理
      // 通过ref访问ChatFooter，再访问其子组件ChatInputWrap
      const chatFooter = this.$children.find(child => child.$options.name === 'ChatFooter')
      if (chatFooter) {
        const chatInputWrap = chatFooter.$children.find(child => child.$options.name === 'ChatInputWrap')
        if (chatInputWrap) {
          // 模拟调用processFile方法
          Array.from(files).forEach(file => {
            console.log('📤 转发文件到ChatInputWrap:', file.name)
            chatInputWrap.processFile(file)
          })
        } else {
          console.error('❌ 找不到ChatInputWrap组件')
        }
      } else {
        console.error('❌ 找不到ChatFooter组件')
      }
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

/* 全局拖放引导层样式 */
.global-drop-zone {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.drop-hint {
  background: white;
  padding: 60px 80px;
  border-radius: 16px;
  border: 3px dashed #409eff;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.hint-text {
  font-size: 24px;
  color: #409eff;
  margin: 20px 0 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.hint-subtext {
  font-size: 14px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(64, 158, 255, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 12px 40px rgba(64, 158, 255, 0.5);
  }
}

/* 渐入渐出动画 */
.fade-enter-active {
  animation: fadeIn 0.3s ease-out;
}

.fade-leave-active {
  animation: fadeOut 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
