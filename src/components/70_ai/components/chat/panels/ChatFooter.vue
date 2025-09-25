<template>
  <footer
    class="chat-footer"
  >
    <chat-input-wrap
      :is-loading="isLoading"
      :placeholder="placeholder"
      @send-message="handleSendMessage"
      @input-focus="handleInputFocus"
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

  methods: {
    handleSendMessage (content) {
      this.$emit('send-message', content)
    },

    handleInputFocus () {
      this.$emit('input-focus')
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
