<template>
  <div class="template-node-property">
    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 内容配置 -->
    <div class="property-section">
      <div class="section-title">内容</div>

      <!-- 引用提示 -->
      <refer-comment />

      <!-- 模板输入框 -->
      <el-input
        v-model="nodeConfig.template"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入模板内容，可使用 {变量名} 引用输入变量"
      />
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'

export default {
  name: 'TemplateNodeProperty',

  components: {
    NodePropertyInput,
    ReferComment
  },

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
      if (!this.wfNode.nodeConfig.template) {
        this.$set(this.wfNode.nodeConfig, 'template', '')
      }
      return this.wfNode.nodeConfig
    }
  }
}
</script>

<style lang="scss" scoped>
.template-node-property {
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
