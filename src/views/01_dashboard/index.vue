<template>
  <div>
    <list_template
      v-if="!isEditModel"
      @editDesktopEvent="handleEditDesktopEvent"
    />
    <edit_template
      v-if="isEditModel"
      @exitEditEvent="handleExitEditEvent"
      @saveLayoutDataEvent="handleSaveLayoutDataEvent"
    />

    <!-- 聊天组件 -->
    <ChatBubble />
  </div>
</template>

<script>
import list_template from './list'
import edit_template from './edit'
import { ChatBubble } from '@/components/70_chat'
// import DebugChatBubble from '@/components/70_chat/ChatBubble/DebugChatBubble.vue'
// import SimplifiedChatBubble from '@/components/70_chat/ChatBubble/SimplifiedChatBubble.vue'

export default {
  components: {
    list_template,
    edit_template,
    ChatBubble
  },
  data () {
    return {
      isEditModel: false
    }
  },
  created () {
  },
  methods: {
    handleEditDesktopEvent () {
      this.isEditModel = true
    },
    handleExitEditEvent () {
      this.isEditModel = false
    },
    handleSaveLayoutDataEvent () {
      this.isEditModel = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
