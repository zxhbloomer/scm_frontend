<template>
  <div class="temp-kb-node-property">
    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 简介输入框 🆕 -->
    <div class="property-section">
      <div class="section-title">
        简介
        <span class="required-mark">*</span>
      </div>
      <el-input
        v-model="nodeConfig.brief"
        placeholder="请输入简介,用于标识此临时知识库"
        maxlength="100"
        show-word-limit
        clearable
        @input="handleBriefChange"
      />
    </div>

    <!-- 模型选择 -->
    <div class="property-section">
      <div class="section-title">模型</div>
      <WfLLMSelector
        :model-name="nodeConfig.model_name"
        @llm-selected="handleLLMSelected"
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
/**
 * TempKnowledgeBaseNodeProperty 组件
 * 临时知识库节点属性配置
 *
 * 设计理念：
 * - 极简配置，只需要选择模型和输入简介
 * - 后台硬编码提示词："创建临时知识库并同步完成向量索引"
 * - 自动使用上游节点的输出作为输入
 *
 * 配置项：
 * - NodePropertyInput: 定义输入变量（如var_particularly, var_center等）
 * - brief: 简介（必填），用于填充ai_knowledge_base_item的title和brief字段
 * - model_name: 模型选择（可选，默认gj-deepseek）
 *
 * 节点执行时：
 * - 后台获取上游节点的输出（通过NodePropertyInput定义的输入变量）
 * - 使用硬编码提示词："创建临时知识库并同步完成向量索引"
 * - LLM根据输入内容自动判断text还是fileUrls，然后调用MCP工具
 *
 * @author zzxxhh
 * @since 2025-12-04
 * @updated 2025-12-05 增加简介字段
 */
import NodePropertyInput from '../NodePropertyInput.vue'
import WfLLMSelector from '../WfLLMSelector.vue'

export default {
  name: 'TempKnowledgeBaseNodeProperty',

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
      // 🆕 初始化 brief
      if (!this.wfNode.nodeConfig.brief) {
        this.$set(this.wfNode.nodeConfig, 'brief', '')
      }
      // 执行过程输出开关，默认为true（显示）
      if (this.wfNode.nodeConfig.show_process_output === undefined) {
        this.$set(this.wfNode.nodeConfig, 'show_process_output', true)
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    /**
     * 🆕 处理简介输入变化
     */
    handleBriefChange () {
      // 手动触发 X6 节点重新渲染
      this.$set(this.wfNode.nodeConfig, 'brief', this.nodeConfig.brief)

      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    },

    /**
     * 处理模型选择
     */
    handleLLMSelected (modelName) {
      this.nodeConfig.model_name = modelName

      // 手动触发 X6 节点重新渲染
      this.$set(this.wfNode.nodeConfig, 'model_name', modelName)

      // 强制更新父组件
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
.temp-kb-node-property {
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

      /* 🆕 必填标记样式 */
      .required-mark {
        color: #f56c6c;
        margin-left: 4px;
      }
    }
  }
}
</style>
