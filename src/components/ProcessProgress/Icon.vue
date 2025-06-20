<template>
  <component :is="iconComponent" :class="iconClass" :style="styles" />
</template>

<script>
export default {
  props: {
    name: {
      type: [String, Array],
      default: ''
    },
    styles: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconClass () {
      const thatName = this.name
      if (Array.isArray(thatName)) {
        const i = thatName.findIndex(item => (item || '').indexOf('el-icon-') >= 0)
        if (i > -1) {
          const icon = thatName[i]
          thatName.splice(i, 1)
          return ['icon', 'el-icon', thatName.join(' '), icon]
        }
      } else {
        return thatName.indexOf('el-icon-') === 0
          ? ['icon', 'el-icon', thatName]
          : [thatName, 'icon']
      }
      return []
    },
    iconComponent () {
      return this.name.indexOf('el-icon-') === 0 ? 'el-icon' : 'i'
    }
  }
}
</script>

<style scoped>

</style>
