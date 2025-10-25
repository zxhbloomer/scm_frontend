<template>
  <div class="human-feedback-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="tip-preview">
        {{ node.nodeConfig.tip || '无提示' }}
      </div>
    </div>
  </div>
</template>

<script>
/**
 * HumanFeedbackNode 组件
 * 人工反馈节点
 * 严格参考 aideepin HumanFeedbackNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\HumanFeedbackNode.vue
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'HumanFeedbackNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  computed: {
    node () {
      return this.getNode().data
    }
  }
}
</script>

<style scoped>
.human-feedback-node {
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

.tip-preview {
  line-height: 24px;
  background: rgba(150, 150, 150, 0.1);
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
