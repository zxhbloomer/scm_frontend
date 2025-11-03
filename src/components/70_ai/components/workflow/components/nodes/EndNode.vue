<template>
  <div class="end-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 结果显示 -->
    <div class="node-content">
      <div class="result-line">
        {{ node.nodeConfig.result || '无' }}
      </div>
    </div>
  </div>
</template>

<script>
/**
 * EndNode 组件
 * 工作流结束节点
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'EndNode',

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
.end-node {
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

.result-line {
  line-height: 24px;
  background: rgba(150, 150, 150, 0.1);
  margin-bottom: 4px;
  padding: 4px 8px;
  text-align: left;
  font-size: 12px;
  color: #606266;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
