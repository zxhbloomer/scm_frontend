<template>
  <div class="mcp-node-property">
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

    <!-- 输入参数配置 -->
    <div class="property-section">
      <div class="section-title">
        输入参数
        <el-tooltip content="配置传递给MCP工具的参数,可使用 {变量名} 引用输入变量" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>

      <!-- 引用提示 -->
      <refer-comment />

      <!-- 参数输入框 -->
      <el-input
        v-model="nodeConfig.tool_input"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入MCP工具的输入参数，可使用 {变量名} 引用输入变量"
      />
    </div>

    <!-- 执行过程输出开关 -->
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
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'
import WfLLMSelector from '../WfLLMSelector.vue'

export default {
  name: 'McpNodeProperty',

  components: {
    NodePropertyInput,
    ReferComment,
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
      if (!this.wfNode.nodeConfig.tool_input) {
        this.$set(this.wfNode.nodeConfig, 'tool_input', '')
      }
      if (!this.wfNode.nodeConfig.model_name) {
        this.$set(this.wfNode.nodeConfig, 'model_name', '')
      }
      // 执行过程输出开关，默认为true（显示）
      if (this.wfNode.nodeConfig.show_process_output === undefined) {
        this.$set(this.wfNode.nodeConfig, 'show_process_output', true)
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
.mcp-node-property {
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
