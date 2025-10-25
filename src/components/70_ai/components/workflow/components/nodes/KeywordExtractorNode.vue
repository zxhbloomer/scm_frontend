<template>
  <div class="keyword-extractor-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="model-line">
        <i class="el-icon-cpu model-icon" />
        <span class="model-name">{{ node.nodeConfig.model_name || '未选择模型' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * KeywordExtractorNode 组件
 * 关键词提取节点
 * 严格参考 aideepin KeywordExtractorNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\KeywordExtractorNode.vue
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'KeywordExtractorNode',

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
.keyword-extractor-node {
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

.model-line {
  height: 40px;
  line-height: 40px;
  background: rgba(150, 150, 150, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
}

.model-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #00CED1;
}

.model-name {
  flex: 1;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
