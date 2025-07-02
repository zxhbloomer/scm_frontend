<template>
  <div class="app-container">
    <div class="view-container">
      <el-alert
        title="查看采购结算"
        type="info"
        :closable="false"
      />

      <!-- 查看页面复用新增页的表单结构，但设为只读模式 -->
      <view-settlement-detail
        :data="viewData"
        :can-edit="false"
      />
    </div>
  </div>
</template>

<script>
import ViewSettlementDetail from './detail.vue'

export default {
  components: {
    ViewSettlementDetail
  },
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      viewData: null
    }
  },
  created () {
    this.initData()
  },
  methods: {
    /**
     * 初始化数据
     */
    initData () {
      if (this.data) {
        this.viewData = this.data
      }
    }
  }
}
</script>

<style scoped>
.view-container {
  padding: 20px;
}
</style>
