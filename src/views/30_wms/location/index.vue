<template>
  <div class="app-container">
    <!-- 主列表页面 -->
    <location-list />
  </div>
</template>

<script>
import constants_program from '@/common/constants/constants_program'
import LocationList from './page/10_list/index.vue'

export default {
  name: constants_program.P_LOCATION, // 页面id，和router中的name需要一致，作为缓存
  components: {
    LocationList
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
