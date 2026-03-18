<template>
  <div class="answer-node-property">
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
        <el-tooltip content="为空则表示使用上一个节点的输出做为提示词" placement="top">
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

    <!-- 执行过程输出 -->
    <div class="property-section">
      <div class="section-title">
        执行过程输出
        <el-tooltip content="关闭后，节点执行结果不会显示在对话中，但仍会传递给下游节点" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-switch
        v-model="nodeConfig.show_process_output"
        active-text="显示"
        inactive-text="隐藏"
      />
    </div>

    <!-- 工作流共享 -->
    <div class="property-section">
      <div class="section-title">
        工作流共享
        <el-tooltip content="开启后，本节点的输出可被工作流中任意节点引用" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-switch
        v-model="nodeConfig.shared_output"
        active-text="开启"
        inactive-text="关闭"
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
  name: 'AnswerNodeProperty',

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
      return this.wfNode.nodeConfig
    }
  },

  created () {
    if (!this.wfNode.nodeConfig.prompt) {
      this.$set(this.wfNode.nodeConfig, 'prompt', '')
    }
    if (!this.wfNode.nodeConfig.model_name) {
      this.$set(this.wfNode.nodeConfig, 'model_name', '')
    }
    if (this.wfNode.nodeConfig.shared_output === undefined) {
      this.$set(this.wfNode.nodeConfig, 'shared_output', false)
    }
    if (this.wfNode.nodeConfig.show_process_output === undefined) {
      this.$set(this.wfNode.nodeConfig, 'show_process_output', false)
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
.answer-node-property {
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
