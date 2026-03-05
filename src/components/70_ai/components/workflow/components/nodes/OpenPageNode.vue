<template>
  <div class="openpage-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 模型信息 -->
    <div class="node-content">
      <div class="model-line">
        <i class="el-icon-monitor model-icon" />
        <span class="model-name">{{ localModelName || '默认模型' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * OpenPageNode 组件
 * 打开前端页面节点：调用LLM生成友好回复，同时将JSON数据透传给前端打开业务弹窗
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'OpenPageNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  data () {
    return {
      localModelName: ''
    }
  },

  computed: {
    node () {
      return this.getNode().data
    }
  },

  mounted () {
    const node = this.getNode()
    this.localModelName = node.data.nodeConfig?.model_name || ''

    node.on('change:data', ({ current }) => {
      this.localModelName = current.nodeConfig?.model_name || ''
    })
  }
}
</script>

<style scoped>
.openpage-node {
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
  color: #409EFF;
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
