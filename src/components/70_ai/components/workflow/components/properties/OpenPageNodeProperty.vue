<template>
  <div class="openpage-node-property">
    <!-- 功能说明 -->
    <el-alert
      title="将上游数据透传给前端自动打开业务弹窗或导航到指定页面"
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

    <!-- 打开模式选择 -->
    <div class="property-section">
      <div class="section-title">打开模式</div>
      <el-radio-group v-model="nodeConfig.open_mode" size="small" @change="handleOpenModeChange">
        <el-radio-button label="dialog">弹窗模式</el-radio-button>
        <el-radio-button label="route">页面导航模式</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 模型选择（dialog和route模式共享） -->
    <div class="property-section">
      <div class="section-title">模型</div>
      <WfLLMSelector
        :model-name="nodeConfig.model_name"
        @llm-selected="handleLLMSelected"
      />
    </div>

    <!-- 提示词配置（dialog和route模式共享） -->
    <div class="property-section">
      <div class="section-title">
        提示词
        <el-tooltip
          :content="nodeConfig.open_mode === 'route'
            ? '为空时直接从上游数据构建导航指令，不调用LLM'
            : '为空时仅存储数据并打开页面，不调用LLM'"
          placement="top"
        >
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <refer-comment />
      <expandable-textarea
        v-model="nodeConfig.prompt"
        placeholder="请输入提示词，可使用 {变量名} 引用输入变量"
        dialog-title="编辑提示词"
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
      return this.wfNode.nodeConfig
    }
  },

  created () {
    const config = this.wfNode.nodeConfig
    if (!config.model_name) this.$set(config, 'model_name', '')
    if (!config.prompt) this.$set(config, 'prompt', '')
    if (!config.open_mode) this.$set(config, 'open_mode', 'route')
    if (config.show_process_output === undefined) this.$set(config, 'show_process_output', true)
  },

  methods: {
    handleOpenModeChange () {
      this.emitUpdate()
    },
    handleLLMSelected (modelName) {
      this.$set(this.wfNode.nodeConfig, 'model_name', modelName)
      this.emitUpdate()
    },
    emitUpdate () {
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
