<template>
  <div class="template-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="template-preview">
        {{ node.nodeConfig.template || '无模板' }}
      </div>
    </div>
  </div>
</template>

<script>
/**
 * TemplateNode 组件
 * 模板节点
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'TemplateNode',

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
.template-node {
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

.template-preview {
  line-height: 32px;
  background: rgba(150, 150, 150, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
