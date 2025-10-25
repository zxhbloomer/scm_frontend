<template>
  <div class="human-feedback-node-property">
    <div class="property-section">
      <div class="section-title">输入前提示</div>
      <el-input
        v-model="nodeConfig.tip"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入提示信息"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'HumanFeedbackNodeProperty',

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    }
  },

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.tip) {
        this.$set(this.wfNode.nodeConfig, 'tip', '')
      }
      return this.wfNode.nodeConfig
    }
  }
}
</script>

<style lang="scss" scoped>
.human-feedback-node-property {
  padding: 16px 0;

  .property-section {
    margin-top: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #303133;
    }
  }
}
</style>
