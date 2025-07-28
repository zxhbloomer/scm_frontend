<template>
  <div class="app-container">
    <div class="edit-container">
      <!-- 编辑页面复用新增页面的表单结构，只是标题和API调用不同 -->
      <el-alert
        title="编辑销售结算"
        type="warning"
        :closable="false"
      />

      <!-- 这里复用新增页的所有表单内容 -->
      <!-- 为了简化，直接引用新增页组件 -->
      <so-settlement-new
        ref="editForm"
        :data="editData"
        :edit-status="editStatus"
        @closeMeOk="handleEditOk"
        @closeMeCancel="handleEditCancel"
      />
    </div>
  </div>
</template>

<script>
import SoSettlementNew from '../20_new/index.vue'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  components: {
    SoSettlementNew
  },
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      editData: null,
      editStatus: 'edit'
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
        this.editData = this.data
      }
    },

    /**
     * 编辑完成
     */
    handleEditOk (data) {
      EventBus.$emit('EMIT_MST_SO_SETTLEMENT_UPDATE_OK', data)
      this.$emit('closeMeOk', data)
    },

    /**
     * 编辑取消
     */
    handleEditCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>

<style scoped>
.edit-container {
  padding: 20px;
}
</style>