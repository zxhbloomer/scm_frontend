<template>
  <div class="app-container">
    <BinList />
  </div>
</template>

<script>
import constants_program from '@/common/constants/constants_program'
import BinList from './page/10_list/index.vue'

export default {
  name: constants_program.P_BIN,
  components: {
    BinList
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
  }
}
</script>

<style scoped>
.app-container {
  height: 100%;
}
</style>
