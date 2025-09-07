<template>
  <div class="app-container">
    <category-list />
  </div>
</template>

<script>
import CategoryList from './page/10_list/index.vue'
import constants_program from '@/common/constants/constants_program'

export default {
  name: constants_program.P_CATEGORY,
  components: { CategoryList },

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
