<template>
  <div class="dalle3-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="info-line">
        <span class="info-label">图像大小：</span>
        <span class="info-value">{{ node.nodeConfig.size || '1024x1024' }}</span>
      </div>
      <div class="info-line">
        <span class="info-label">图像质量：</span>
        <span class="info-value">{{ node.nodeConfig.quality || 'standard' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Dalle3Node 组件
 * DALL-E 3 图像生成节点
 * 严格参考 aideepin Dalle3Node.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\Dalle3Node.vue
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'Dalle3Node',

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
.dalle3-node {
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

.info-line {
  height: 40px;
  line-height: 40px;
  background: rgba(150, 150, 150, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

.info-line:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #909399;
  margin-right: 8px;
}

.info-value {
  flex: 1;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
