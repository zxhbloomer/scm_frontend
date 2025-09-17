<template>
  <footer
    class="relative z-50 mb-1 rounded-lg px-5"
  >
    <chat-input-wrap
      class="shadow-sm"
      :is-loading="isLoading"
      :placeholder="placeholder"
      @send-message="handleSendMessage"
    />
  </footer>
</template>

<script>
import ChatInputWrap from './ChatInputWrap.vue'

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
    }
  }
}
</script>

<style scoped>
/* 按照chatwoot的footer样式 */
footer {
  /* 对应chatwoot的: relative z-50 mb-1 rounded-lg px-5 */
  position: relative;
  z-index: 50;
  margin-bottom: 4px;
  border-radius: 8px;
}

/* px-5 对应padding-left和padding-right为20px (5 * 4px) */
.px-5 {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
