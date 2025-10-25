<template>
  <div class="faq-extractor-node-property">
    <!-- 引用输入配置 (不显示变量名) -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
      :show-var-name="false"
    />

    <!-- 模型选择 -->
    <div class="property-section">
      <div class="section-title">模型</div>
      <WfLLMSelector
        :model-name="nodeConfig.model_name"
        @llm-selected="handleLLMSelected"
      />
    </div>

    <!-- 提取问题数量 -->
    <div class="property-section">
      <div class="section-title">提取问题数量</div>
      <el-input-number
        v-model="nodeConfig.top_n"
        :min="1"
        :max="30"
        controls-position="right"
        style="width: 100%;"
      />
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import WfLLMSelector from '../WfLLMSelector.vue'

export default {
  name: 'FaqExtractorNodeProperty',

  components: {
    NodePropertyInput,
    WfLLMSelector
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
      if (!this.wfNode.nodeConfig.model_name) {
        this.$set(this.wfNode.nodeConfig, 'model_name', '')
      }
      if (!this.wfNode.nodeConfig.top_n) {
        this.$set(this.wfNode.nodeConfig, 'top_n', 5)
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    handleLLMSelected (modelName) {
      this.nodeConfig.model_name = modelName
    }
  }
}
</script>

<style lang="scss" scoped>
.faq-extractor-node-property {
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
