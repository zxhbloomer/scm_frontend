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

    <!-- dialog模式配置 -->
    <template v-if="!nodeConfig.open_mode || nodeConfig.open_mode === 'dialog'">
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
        <refer-comment />
        <expandable-textarea
          v-model="nodeConfig.prompt"
          placeholder="请输入提示词，可使用 {变量名} 引用输入变量"
          dialog-title="编辑提示词"
        />
      </div>
    </template>

    <!-- route模式配置 -->
    <template v-if="nodeConfig.open_mode === 'route'">
      <div class="property-section">
        <div class="section-title">目标路由</div>
        <el-input
          v-model="nodeConfig.route"
          placeholder="如 /po/order"
          size="small"
        />
      </div>

      <div class="property-section">
        <div class="section-title">页面模式</div>
        <el-select v-model="nodeConfig.page_mode" size="small" style="width: 100%">
          <el-option label="列表页" value="list" />
          <el-option label="新增页" value="new" />
          <el-option label="查看页" value="view" />
          <el-option label="编辑页" value="edit" />
          <el-option label="审批页" value="approve" />
        </el-select>
      </div>

      <!-- 人机交互配置 -->
      <div class="property-section">
        <div class="section-title">人机交互</div>
        <el-switch
          v-model="nodeConfig.interaction_enabled"
          active-text="启用"
          inactive-text="关闭"
        />
      </div>

      <template v-if="nodeConfig.interaction_enabled">
        <div class="property-section">
          <div class="section-title">交互类型</div>
          <el-select v-model="nodeConfig.interaction_type" size="small" style="width: 100%">
            <el-option label="用户选择" value="user_select" />
            <el-option label="用户确认" value="user_confirm" />
            <el-option label="用户表单" value="user_form" />
          </el-select>
        </div>

        <div class="property-section">
          <div class="section-title">交互描述</div>
          <el-input
            v-model="nodeConfig.interaction_description"
            type="textarea"
            :rows="2"
            placeholder="显示给用户的提示文字"
            size="small"
          />
        </div>

        <div class="property-section">
          <div class="section-title">超时时间(分钟)</div>
          <el-input-number
            v-model="nodeConfig.timeout_minutes"
            :min="1"
            :max="1440"
            size="small"
          />
        </div>
      </template>
    </template>
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
      const config = this.wfNode.nodeConfig
      // dialog模式字段
      if (!config.model_name) {
        this.$set(config, 'model_name', '')
      }
      if (!config.prompt) {
        this.$set(config, 'prompt', '')
      }
      // 打开模式（默认dialog保持向后兼容）
      if (!config.open_mode) {
        this.$set(config, 'open_mode', 'dialog')
      }
      // route模式字段
      if (config.route === undefined) {
        this.$set(config, 'route', '')
      }
      if (config.page_mode === undefined) {
        this.$set(config, 'page_mode', 'list')
      }
      if (config.interaction_enabled === undefined) {
        this.$set(config, 'interaction_enabled', false)
      }
      if (config.interaction_type === undefined) {
        this.$set(config, 'interaction_type', 'user_select')
      }
      if (config.interaction_description === undefined) {
        this.$set(config, 'interaction_description', '')
      }
      if (config.timeout_minutes === undefined) {
        this.$set(config, 'timeout_minutes', 30)
      }
      return config
    }
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
