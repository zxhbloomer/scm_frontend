<template>
  <div
    ref="chatInputContainer"
    class="chat-input-container"
  >
    <div
      class="chat-input-wrapper"
      :class="{
        'focused': isFocused
      }"
    >
      <!-- 输入框 -->
      <el-input
        ref="chatInput"
        v-model="userInput"
        type="textarea"
        :rows="1"
        :placeholder="placeholder"
        :disabled="isLoading"
        resize="none"
        class="user-message-input"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.native="handleKeyDown"
        @input="handleInput"
      />

      <!-- 右侧按钮区域 -->
      <div class="chat-input-actions">
        <!-- 附件按钮 -->
        <button
          v-if="showAttachment"
          class="attachment-btn"
          title="附件"
        >
          <i class="el-icon-paperclip" />
        </button>

        <!-- emoji按钮 -->
        <button
          class="emoji-btn"
          :class="{ active: showEmojiPicker }"
          title="表情"
          @click="toggleEmojiPicker"
        >
          <i class="el-icon-sunny" />
        </button>

        <!-- 发送按钮 -->
        <el-button
          v-if="showSendButton"
          type="primary"
          class="send-button"
          :loading="isLoading"
          @click="handleSendMessage"
        >
          <i class="el-icon-s-promotion" />
        </el-button>
      </div>
    </div>

    <!-- emoji选择器 -->
    <emoji-input
      v-if="showEmojiPicker"
      :on-select="handleEmojiSelect"
      @select="handleEmojiSelect"
      @close="hideEmojiPicker"
    />
  </div>
</template>

<script>
import EmojiInput from './emoji/EmojiInput.vue'

export default {
  name: 'ChatInputWrap',

  components: {
    EmojiInput
  },

  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '输入您的消息'
    }
  },

  data () {
    return {
      userInput: '',
      isFocused: false,
      showEmojiPicker: false
    }
  },

  computed: {
    showAttachment () {
      return this.userInput.length === 0
    },
    showSendButton () {
      return this.userInput.length > 0
    }
  },

  mounted () {
    // 添加文档点击事件监听，用于点击外部关闭emoji选择器
    document.addEventListener('click', this.handleDocumentClick)
  },

  beforeDestroy () {
    // 移除文档点击事件监听
    document.removeEventListener('click', this.handleDocumentClick)
  },

  methods: {
    onFocus () {
      this.isFocused = true
    },

    onBlur () {
      this.isFocused = false
    },

    handleKeyDown (e) {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault()
        this.handleSendMessage()
      }
      // ESC键关闭emoji选择器
      if (e.keyCode === 27) {
        this.hideEmojiPicker()
      }
    },

    handleInput () {
      // 处理输入变化
    },

    handleSendMessage () {
      if (this.userInput && this.userInput.trim()) {
        this.$emit('send-message', this.userInput.trim())
        this.userInput = ''
        this.focusInput()
      }
    },

    toggleEmojiPicker () {
      this.showEmojiPicker = !this.showEmojiPicker
      if (this.showEmojiPicker) {
        // 显示emoji选择器时，可以失焦输入框，让用户专注选择emoji
      } else {
        // 隐藏emoji选择器时，重新聚焦到输入框
        this.focusInput()
      }
    },

    hideEmojiPicker () {
      if (this.showEmojiPicker) {
        this.showEmojiPicker = false
        this.focusInput()
      }
    },

    handleEmojiSelect (emoji) {
      // 获取当前光标位置
      const textarea = this.$refs.chatInput?.$refs?.textarea || this.$refs.chatInput?.$el?.querySelector('textarea')
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        // 在光标位置插入emoji
        const before = this.userInput.substring(0, start)
        const after = this.userInput.substring(end)
        this.userInput = before + emoji + after

        // 设置新的光标位置
        this.$nextTick(() => {
          const newPosition = start + emoji.length
          textarea.setSelectionRange(newPosition, newPosition)
          textarea.focus()
        })
      } else {
        // 如果无法获取textarea，就直接追加到末尾
        this.userInput += emoji
      }

      // 选择emoji后关闭选择器
      this.hideEmojiPicker()
    },

    focusInput () {
      if (this.$refs.chatInput) {
        this.$refs.chatInput.focus()
      }
    },

    handleDocumentClick (event) {
      // 如果emoji选择器是打开的，并且点击的不是容器内的元素，则关闭emoji选择器
      if (this.showEmojiPicker && this.$refs.chatInputContainer) {
        if (!this.$refs.chatInputContainer.contains(event.target)) {
          this.hideEmojiPicker()
        }
      }
    }
  }
}
</script>

<style scoped>
/* 容器样式 */
.chat-input-container {
  position: relative;
}

/* 新的输入框包装器样式 */
.chat-input-wrapper {
  display: flex;
  align-items: center;
  padding: 0 12px 0 8px;
  border-radius: 7px;
  transition: all 200ms ease;
  background-color: #ffffff;
  box-shadow: 0 0 0 1px rgb(235, 235, 235), 0 0 2px 3px rgba(235, 235, 235, 0.1);
}

.chat-input-wrapper.focused {
  box-shadow: 0 0 0 1px #2781F6, 0 0 2px 3px rgba(39, 129, 246, 0.1);
}

/* 按钮区域样式 */
.chat-input-actions {
  display: flex;
  align-items: center;
  padding-left: 8px;
}

/* 完全按照chatwoot的样式 */
.items-center {
  display: flex;
  align-items: center;
}

.flex {
  display: flex;
}

/* ltr:pl-3 rtl:pr-3 ltr:pr-2 rtl:pl-2 */
.ltr\:pl-3 {
  padding-left: 12px;
}

.ltr\:pr-2 {
  padding-right: 8px;
}

/* rounded-[7px] */
.rounded-\[7px\] {
  border-radius: 7px;
}

/* transition-all duration-200 */
.transition-all {
  transition: all 200ms ease;
}

.duration-200 {
  transition-duration: 200ms;
}

/* bg-n-background */
.bg-n-background {
  background-color: #ffffff;
}

/* 简单直接的shadow效果 */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 未选中状态 - 浅灰色边框 */
.shadow-n-strong {
  box-shadow:
    0 0 0 1px rgb(235, 235, 235) !important,
    0 0 2px 3px rgba(235, 235, 235, 0.1) !important;
}

/* 选中状态 - 蓝色边框 */
.shadow-n-brand {
  box-shadow:
    0 0 0 1px #2781F6 !important,
    0 0 2px 3px rgba(39, 129, 246, 0.1) !important;
}

/* 按钮容器 */
.ltr\:pl-2 {
  padding-left: 8px;
}

/* 输入框样式 - 按照chatwoot的user-message-input */
.user-message-input {
  width: 100%;
  border: none;
}

.user-message-input >>> .el-textarea__inner {
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  height: 32px;
  min-height: 32px;
  max-height: 240px;
  padding: 4px 0;
  margin: 8px 0;
  color: #0f172a;
  transition: all 200ms ease;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: none;
}

.user-message-input >>> .el-textarea__inner::placeholder {
  color: #64748b;
}

.user-message-input >>> .el-textarea__inner:focus {
  border: none;
  box-shadow: none;
  background: transparent;
}

/* 按钮样式 */
.attachment-btn,
.emoji-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  min-width: 32px;
  border: none;
  background: transparent;
  color: #0f172a;
  cursor: pointer;
  transition: all 150ms ease;
  font-size: 16px;
  border-radius: 4px;
  margin-right: 4px;
}

.attachment-btn:hover,
.emoji-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.emoji-btn.active {
  background: #2781F6;
  color: white;
}

.emoji-btn.active:hover {
  background: #1e6bc7;
  color: white;
}

.send-button {
  min-width: 36px;
  height: 32px;
  border-radius: 6px;
  padding: 0;
  margin-left: 4px;
}

.send-button >>> .el-button--primary {
  background: #3b82f6;
  border-color: #3b82f6;
}
</style>
