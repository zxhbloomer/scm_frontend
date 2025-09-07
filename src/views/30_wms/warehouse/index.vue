<template>
  <div class="app-container">
    <!-- 仓库管理主要容器 - 遵循Position模块架构模式 -->
    <WarehouseList />
  </div>
</template>

<script>
import WarehouseList from './page/10_list/index.vue'

export default {
  name: 'WarehouseMain',
  components: {
    WarehouseList
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
