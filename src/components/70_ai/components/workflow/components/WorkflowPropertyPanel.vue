<template>
  <div class="workflow-property-panel">
    <div class="panel-header">
      <span class="panel-title">节点属性</span>
      <el-button
        type="text"
        icon="el-icon-close"
        @click="$emit('close')"
      />
    </div>

    <div v-if="selectedNode" class="panel-content">
      <!-- 节点基本信息 -->
      <div class="node-info-section">
        <div class="node-info-header">
          <i :class="getIconClass(selectedNode.wfComponent.name)" class="node-type-icon" />
          <el-input
            v-model="nodeTitle"
            placeholder="节点名称"
            class="node-title-input"
            @change="handleTitleChange"
          />
        </div>
        <div class="node-description">
          <span class="description-label">组件功能：</span>
          <span class="description-text">{{ selectedNode.wfComponent.remark || selectedNode.wfComponent.title }}</span>
        </div>
      </div>

      <!-- 节点属性配置区域 -->
      <el-divider />

      <div class="node-properties-section">
        <!-- 根据节点类型显示不同的属性表单 -->
        <!-- Start 节点 -->
        <start-node-property
          v-if="selectedNode.wfComponent.name === 'Start'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- End 节点 -->
        <end-node-property
          v-else-if="selectedNode.wfComponent.name === 'End'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- LLM Answer 节点 -->
        <answer-node-property
          v-else-if="selectedNode.wfComponent.name === 'Answer'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- Template 模板节点 -->
        <template-node-property
          v-else-if="selectedNode.wfComponent.name === 'Template'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- Classifier 内容分类节点 -->
        <classifier-node-property
          v-else-if="selectedNode.wfComponent.name === 'Classifier'"
          :workflow="workflow"
          :wf-node="selectedNode"
          :ui-workflow="uiWorkflow"
        />

        <!-- KeywordExtractor 关键词提取节点 -->
        <keyword-extractor-node-property
          v-else-if="selectedNode.wfComponent.name === 'KeywordExtractor'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- FaqExtractor FAQ提取节点 -->
        <faq-extractor-node-property
          v-else-if="selectedNode.wfComponent.name === 'FaqExtractor'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- KnowledgeRetrieval 知识库检索节点 -->
        <knowledge-retrieval-node-property
          v-else-if="selectedNode.wfComponent.name === 'KnowledgeRetrieval'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- DocumentExtractor 文档提取节点 -->
        <document-extractor-node-property
          v-else-if="selectedNode.wfComponent.name === 'DocumentExtractor'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- Switcher 条件分支节点 -->
        <switcher-node-property
          v-else-if="selectedNode.wfComponent.name === 'Switcher'"
          :workflow="workflow"
          :wf-node="selectedNode"
          :ui-workflow="uiWorkflow"
        />

        <!-- HttpRequest HTTP请求节点 -->
        <http-request-node-property
          v-else-if="selectedNode.wfComponent.name === 'HttpRequest'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- MailSend 邮件发送节点 -->
        <mail-send-node-property
          v-else-if="selectedNode.wfComponent.name === 'MailSend'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- HumanFeedback 人工反馈节点 -->
        <human-feedback-node-property
          v-else-if="selectedNode.wfComponent.name === 'HumanFeedback'"
          :workflow="workflow"
          :wf-node="selectedNode"
        />

        <!-- 默认属性显示（未匹配的节点类型） -->
        <div v-else class="default-properties">
          <el-alert
            title="该节点类型暂无属性配置组件"
            type="info"
            :closable="false"
            show-icon
          />
          <div class="property-item">
            <span class="property-label">节点 UUID:</span>
            <span class="property-value">{{ selectedNode.uuid }}</span>
          </div>
          <div class="property-item">
            <span class="property-label">组件类型:</span>
            <span class="property-value">{{ selectedNode.wfComponent.name }}</span>
          </div>
          <div class="property-item">
            <span class="property-label">位置:</span>
            <span class="property-value">X: {{ selectedNode.positionX }}, Y: {{ selectedNode.positionY }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="panel-empty">
      <i class="el-icon-info" />
      <p>请选择一个节点</p>
    </div>
  </div>
</template>

<script>
import StartNodeProperty from './properties/StartNodeProperty.vue'
import EndNodeProperty from './properties/EndNodeProperty.vue'
import AnswerNodeProperty from './properties/AnswerNodeProperty.vue'
import TemplateNodeProperty from './properties/TemplateNodeProperty.vue'
import ClassifierNodeProperty from './properties/ClassifierNodeProperty.vue'
import KeywordExtractorNodeProperty from './properties/KeywordExtractorNodeProperty.vue'
import FaqExtractorNodeProperty from './properties/FaqExtractorNodeProperty.vue'
import KnowledgeRetrievalNodeProperty from './properties/KnowledgeRetrievalNodeProperty.vue'
import DocumentExtractorNodeProperty from './properties/DocumentExtractorNodeProperty.vue'
import SwitcherNodeProperty from './properties/SwitcherNodeProperty.vue'
import HttpRequestNodeProperty from './properties/HttpRequestNodeProperty.vue'
import MailSendNodeProperty from './properties/MailSendNodeProperty.vue'
import HumanFeedbackNodeProperty from './properties/HumanFeedbackNodeProperty.vue'

export default {
  name: 'WorkflowPropertyPanel',

  components: {
    StartNodeProperty,
    EndNodeProperty,
    AnswerNodeProperty,
    TemplateNodeProperty,
    ClassifierNodeProperty,
    KeywordExtractorNodeProperty,
    FaqExtractorNodeProperty,
    KnowledgeRetrievalNodeProperty,
    DocumentExtractorNodeProperty,
    SwitcherNodeProperty,
    HttpRequestNodeProperty,
    MailSendNodeProperty,
    HumanFeedbackNodeProperty
  },

  props: {
    workflow: {
      type: Object,
      required: true
    },
    selectedNode: {
      type: Object,
      default: null
    },
    uiWorkflow: {
      type: Object,
      default: () => ({ nodes: [], edges: [] })
    }
  },

  data () {
    return {
      nodeTitle: ''
    }
  },

  watch: {
    selectedNode: {
      immediate: true,
      handler (newVal) {
        if (newVal) {
          this.nodeTitle = newVal.title || newVal.wfComponent.title
        }
      }
    }
  },

  methods: {
    handleTitleChange () {
      if (this.selectedNode && this.nodeTitle) {
        this.selectedNode.title = this.nodeTitle
        this.$store.commit('ai/workflow/UPDATE_NODE_TITLE', {
          wfUuid: this.workflow.workflowUuid,
          nodeUuid: this.selectedNode.uuid,
          newTitle: this.nodeTitle
        })
      }
    },

    getIconClass (name) {
      const iconMap = {
        'Start': 'el-icon-video-play',
        'End': 'el-icon-video-pause',
        'Answer': 'el-icon-chat-dot-round',
        'Classifier': 'el-icon-files',
        'KnowledgeRetrieval': 'el-icon-collection',
        'DocumentExtractor': 'el-icon-document',
        'KeywordExtractor': 'el-icon-key',
        'FaqExtractor': 'el-icon-question',
        'Switcher': 'el-icon-set-up',
        'Template': 'el-icon-tickets',
        'HumanFeedback': 'el-icon-user',
        'MailSend': 'el-icon-message',
        'HttpRequest': 'el-icon-link'
      }

      return iconMap[name] || 'el-icon-s-operation'
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-property-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;

  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.panel-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;

  i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

.node-info-section {
  .node-info-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .node-type-icon {
      font-size: 24px;
      margin-right: 12px;
      color: #409eff;
    }

    .node-title-input {
      ::v-deep .el-input__inner {
        font-size: 18px;
        font-weight: 600;
        border: 1px solid transparent;
        padding: 4px 8px;

        &:hover,
        &:focus {
          border-color: #dcdfe6;
        }
      }
    }
  }

  .node-description {
    padding: 8px 0;
    font-size: 13px;

    .description-label {
      color: #909399;
      margin-right: 8px;
    }

    .description-text {
      color: #606266;
    }
  }
}

.node-properties-section {
  .default-properties {
    .property-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;

      .property-label {
        width: 120px;
        font-size: 13px;
        font-weight: 500;
        color: #606266;
      }

      .property-value {
        flex: 1;
        font-size: 13px;
        color: #303133;
        word-break: break-all;
      }
    }
  }
}
</style>
