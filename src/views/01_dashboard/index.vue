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
  </div>
</template>

<script>
import list_template from './list'
import edit_template from './edit'

export default {
  components: { list_template, edit_template },
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
