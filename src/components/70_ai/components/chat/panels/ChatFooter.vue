<template>
  <footer
    class="chat-footer"
  >
    <chat-input-wrap
      :is-loading="isLoading"
      :placeholder="placeholder"
      :session-id="sessionId"
      @send-message="handleSendMessage"
      @input-focus="handleInputFocus"
      @file-uploaded="handleFileUploaded"
      @file-upload-error="handleFileUploadError"
    />
  </footer>
</template>

<script>
import ChatInputWrap from '../input/ChatInputWrap.vue'

export default {
  name: 'ChatFooter',

  components: {
    ChatInputWrap
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

  computed: {
    sessionId () {
      return this.$store.state.chat.conversationId || ''
    }
  },

  methods: {
    handleSendMessage (content) {
      this.$emit('send-message', content)
    },

    handleInputFocus () {
      this.$emit('input-focus')
    },

    handleFileUploaded (file) {
      console.log('文件上传成功：', file)
    },

    handleFileUploadError ({ file, error }) {
      console.error('文件上传失败：', file.name, error)
    }
  }
}
</script>

<style scoped>
/* 聊天底部样式 */
.chat-footer {
  position: relative;
  z-index: 50;
  margin-bottom: 4px;
  border-radius: 8px;
  padding: 0 20px;
}
</style>
