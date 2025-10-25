<template>
  <div class="document-extractor-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="ref-input-line">
        <span class="ref-label">{{ firstFileInputName }}</span>
        <span class="ref-value">{{ firstFileInputTitle }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * DocumentExtractorNode 组件
 * 文档提取节点
 * 严格参考 aideepin DocumentExtractorNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\DocumentExtractorNode.vue
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'DocumentExtractorNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  computed: {
    node () {
      return this.getNode().data
    },

    firstFileInput () {
      if (!this.node.inputConfig.ref_inputs || this.node.inputConfig.ref_inputs.length === 0) {
        return null
      }
      return this.node.inputConfig.ref_inputs[0]
    },

    firstFileInputName () {
      return this.firstFileInput?.name || ''
    },

    firstFileInputTitle () {
      if (!this.firstFileInput) return ''

      const workflow = this.$store.getters['ai/workflow/getWorkflowInfo'](this.node.workflowUuid)
      if (!workflow) return ''

      const startNode = workflow.nodes.find(n => n.wfComponent && n.wfComponent.name === 'Start')
      if (!startNode) return ''

      const fileInput = startNode.inputConfig.user_inputs.find(input => input.type === 4)
      return fileInput?.title || ''
    }
  }
}
</script>

<style scoped>
.document-extractor-node {
  width: 220px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.node-content {
  display: flex;
  flex-direction: column;
}

.ref-input-line {
  height: 40px;
  line-height: 40px;
  background: rgba(150, 150, 150, 0.1);
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 4px;
}

.ref-label {
  width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 4px;
  font-size: 12px;
  color: #909399;
}

.ref-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #303133;
}
</style>
