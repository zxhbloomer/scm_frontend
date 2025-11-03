<template>
  <div class="keyword-extractor-node-property">
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

    <!-- 提取关键词数量 -->
    <div class="property-section">
      <div class="section-title">提取关键词数量</div>
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
  name: 'KeywordExtractorNodeProperty',

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

      // 手动触发 X6 节点重新渲染
      // 使用 Vue.set 确保响应式更新
      this.$set(this.wfNode.nodeConfig, 'model_name', modelName)

      // 强制更新父组件
      this.$nextTick(() => {
        // 通过事件总线通知 WorkflowDesigner 更新 X6
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.keyword-extractor-node-property {
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
