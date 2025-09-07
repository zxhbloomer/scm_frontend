<template>
  <div class="app-container">
    <!-- 字典类型管理主页面 -->
    <dicttype-list />
  </div>
</template>

<script>
import constants_program from '@/common/constants/constants_program'
import DicttypeList from './page/10_list/index.vue'

export default {
  name: constants_program.P_DICTTYPE, // 页面id，和router中的name需要一致，作为缓存
  components: {
    DicttypeList
  },
  created () {
    // 作为独立页面，通过route路由打开时
    this.$options.name = this.$route.meta.page_code
  }
}
</script>

<style scoped>
.app-container {
  height: 100%;
}
</style>
