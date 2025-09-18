<template>
  <div
    class="items-center flex ltr:pl-3 rtl:pr-3 ltr:pr-2 rtl:pl-2 rounded-[7px] transition-all duration-200 bg-n-background shadow-sm"
    :class="{
      'shadow-n-brand': isFocused,
      'shadow-n-strong': !isFocused,
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
    <div class="flex items-center ltr:pl-2 rtl:pr-2">
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
</template>

<script>
export default {
  name: 'ChatInputWrap',

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
    },

    focusInput () {
      if (this.$refs.chatInput) {
        this.$refs.chatInput.focus()
      }
    }
  }
}
</script>

<style scoped>
/* CSS Reset for this component - 基于 Meyer Web Reset */
* {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
  box-sizing: border-box;
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

/* 按钮容器 */
.ltr\:pl-2 {
  padding-left: 8px;
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
