<template>
  <div class="knowledge-retrieval-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="kb-line">
        <i :class="node.nodeConfig.is_strict ? 'el-icon-lock' : 'el-icon-unlock'" class="kb-icon" />
        <span class="kb-name">{{ node.nodeConfig.knowledge_base_name || '未选择知识库' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * KnowledgeRetrievalNode 组件
 * 知识库检索节点
 * 严格参考 aideepin KnowledgeRetrievalNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\KnowledgeRetrievalNode.vue
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'KnowledgeRetrievalNode',

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
.knowledge-retrieval-node {
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

.kb-line {
  height: 40px;
  line-height: 40px;
  background: rgba(150, 150, 150, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
}

.kb-icon {
  font-size: 18px;
  margin-right: 8px;
  color: #8B4513;
}

.kb-name {
  flex: 1;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
