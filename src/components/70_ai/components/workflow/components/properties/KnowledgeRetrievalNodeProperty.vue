<template>
  <div class="knowledge-retrieval-node-property">
    <!-- 知识库选择 -->
    <div class="property-section">
      <div class="section-title">知识库</div>
      <wf-knowledge-selector
        :knowledge-base-uuid="nodeConfig.knowledge_base_uuid"
        @selected="handleKnowledgeSelected"
      />
    </div>

    <!-- 召回数量 -->
    <div class="property-section">
      <div class="section-title">召回数量 ({{ nodeConfig.top_n }})</div>
      <div class="slider-container">
        <el-slider
          v-model="nodeConfig.top_n"
          :min="1"
          :max="30"
          :step="1"
          show-stops
        />
      </div>
    </div>

    <!-- 命中最低分数 -->
    <div class="property-section">
      <div class="section-title">命中最低分数 ({{ nodeConfig.score }})</div>
      <div class="slider-container">
        <el-slider
          v-model="nodeConfig.score"
          :min="0.1"
          :max="1"
          :step="0.1"
          show-stops
        />
      </div>
    </div>

    <!-- 严格模式 -->
    <div class="property-section">
      <div class="section-title">
        严格模式
        <el-tooltip placement="top">
          <div slot="content">
            <div>严格模式：严格匹配知识库，知识库中如无搜索结果，直接返回无答案</div>
            <div>宽松模式：知识库中如无搜索结果，将用户提问传给LLM继续请求答案</div>
          </div>
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-radio-group v-model="nodeConfig.is_strict">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </div>

    <!-- 默认回复内容 -->
    <div class="property-section">
      <div class="section-title">
        默认回复内容
        <el-tooltip content="如果没有答案，则采用本内容" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-input
        v-model="nodeConfig.default_response"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入默认回复内容"
      />
    </div>
  </div>
</template>

<script>
import WfKnowledgeSelector from '../WfKnowledgeSelector.vue'

export default {
  name: 'KnowledgeRetrievalNodeProperty',

  components: {
    WfKnowledgeSelector
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
      if (!this.wfNode.nodeConfig.knowledge_base_uuid) {
        this.$set(this.wfNode.nodeConfig, 'knowledge_base_uuid', '')
      }
      if (!this.wfNode.nodeConfig.knowledge_base_name) {
        this.$set(this.wfNode.nodeConfig, 'knowledge_base_name', '')
      }
      if (!this.wfNode.nodeConfig.top_n) {
        this.$set(this.wfNode.nodeConfig, 'top_n', 5)
      }
      if (!this.wfNode.nodeConfig.score) {
        this.$set(this.wfNode.nodeConfig, 'score', 0.5)
      }
      if (this.wfNode.nodeConfig.is_strict === undefined) {
        this.$set(this.wfNode.nodeConfig, 'is_strict', true)
      }
      if (!this.wfNode.nodeConfig.default_response) {
        this.$set(this.wfNode.nodeConfig, 'default_response', '很抱歉，我无法找到相关答案。')
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    /**
     * 处理知识库选择
     */
    handleKnowledgeSelected (uuid, name) {
      this.nodeConfig.knowledge_base_uuid = uuid
      this.nodeConfig.knowledge_base_name = name

      // 手动触发 X6 节点重新渲染
      // 使用 Vue.set 确保响应式更新
      this.$set(this.wfNode.nodeConfig, 'knowledge_base_uuid', uuid)
      this.$set(this.wfNode.nodeConfig, 'knowledge_base_name', name)

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
.knowledge-retrieval-node-property {
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

  .slider-container {
    padding: 0 12px;
  }
}
</style>
