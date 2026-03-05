<template>
  <div class="openpage-node-property">
    <!-- 功能说明 -->
    <el-alert
      title="将上游数据透传给前端自动打开业务弹窗，有提示词时调用LLM生成回复"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 16px;"
    />

    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 模型选择 -->
    <div class="property-section">
      <div class="section-title">模型</div>
      <WfLLMSelector
        :model-name="nodeConfig.model_name"
        @llm-selected="handleLLMSelected"
      />
    </div>

    <!-- 提示词配置 -->
    <div class="property-section">
      <div class="section-title">
        提示词
        <el-tooltip content="为空时仅存储数据并打开页面，不调用LLM" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>

      <!-- 引用提示 -->
      <refer-comment />

      <!-- 提示词输入框 -->
      <expandable-textarea
        v-model="nodeConfig.prompt"
        placeholder="请输入提示词，可使用 {变量名} 引用输入变量"
        dialog-title="编辑提示词"
      />
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'
import WfLLMSelector from '../WfLLMSelector.vue'
import ExpandableTextarea from '../ExpandableTextarea.vue'

export default {
  name: 'OpenPageNodeProperty',

  components: {
    NodePropertyInput,
    ReferComment,
    WfLLMSelector,
    ExpandableTextarea
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
      if (!this.wfNode.nodeConfig.model_name) {
        this.$set(this.wfNode.nodeConfig, 'model_name', '')
      }
      if (!this.wfNode.nodeConfig.prompt) {
        this.$set(this.wfNode.nodeConfig, 'prompt', '')
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    handleLLMSelected (modelName) {
      this.$set(this.wfNode.nodeConfig, 'model_name', modelName)

      this.$nextTick(() => {
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
.openpage-node-property {
  padding: 16px 0;

  .property-section {
    margin-top: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #303133;
      display: flex;
      align-items: center;
    }
  }
}
</style>
