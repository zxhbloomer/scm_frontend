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
    <!-- 新增71_chat聊天组件 -->
    <ChatBubble71 />
  </div>
</template>

<script>
import list_template from './list'
import edit_template from './edit'
import { ChatBubble } from '@/components/70_chat'
import { ChatBubble as ChatBubble71 } from '@/components/71_chat'

export default {
  components: {
    list_template,
    edit_template,
    ChatBubble,
    ChatBubble71
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
