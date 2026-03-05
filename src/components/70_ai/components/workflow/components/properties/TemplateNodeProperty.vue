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

      <!-- 模式说明 -->
      <div class="mode-hint">
        <div class="hint-item">
          <span class="hint-label">留空</span>
          <span class="hint-text">自动将所有输入变量合并为 JSON 对象输出</span>
        </div>
        <div class="hint-item">
          <span class="hint-label">填写模板</span>
          <span class="hint-text">使用 ${变量名} 引用输入变量，按模板格式输出文本</span>
        </div>
      </div>

      <!-- 模板输入框 -->
      <expandable-textarea
        v-model="nodeConfig.template"
        placeholder="留空则自动输出 JSON，填写则按模板格式输出"
        dialog-title="编辑模板内容"
        @input="handleTemplateChange"
      />
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'
import ExpandableTextarea from '../ExpandableTextarea.vue'

export default {
  name: 'TemplateNodeProperty',

  components: {
    NodePropertyInput,
    ReferComment,
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
      // 初始化默认值
      if (!this.wfNode.nodeConfig.template) {
        this.$set(this.wfNode.nodeConfig, 'template', '')
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    handleTemplateChange () {
      // 手动触发 X6 节点重新渲染
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

  .mode-hint {
    margin-bottom: 10px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;

    .hint-item {
      line-height: 22px;
      display: flex;
      align-items: baseline;
    }

    .hint-label {
      flex-shrink: 0;
      display: inline-block;
      padding: 0 6px;
      margin-right: 8px;
      background: #e6f0ff;
      color: #409eff;
      border-radius: 3px;
      font-size: 11px;
    }

    .hint-text {
      color: #909399;
    }
  }
}
</style>
