<template>
  <div class="subworkflow-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="workflow-line">
        <i class="el-icon-connection workflow-icon" />
        <span class="workflow-name">{{ localWorkflowName || '请选择工作流' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'SubWorkflowNode',
  components: { CommonNodeHeader },
  inject: ['getNode'],
  data () {
    return {
      localWorkflowName: ''
    }
  },
  computed: {
    node () {
      return this.getNode().data
    }
  },
  mounted () {
    const node = this.getNode()
    this.localWorkflowName = node.data.nodeConfig?.workflow_name || ''

    // 监听X6节点数据变化
    node.on('change:data', ({ current }) => {
      this.localWorkflowName = current.nodeConfig?.workflow_name || ''
    })
  }
}
</script>

<style scoped>
.subworkflow-node {
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

.workflow-line {
  height: 40px;
  line-height: 40px;
  background: rgba(150, 150, 150, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
}

.workflow-icon {
  font-size: 18px;
  margin-right: 8px;
  color: #409EFF;
}

.workflow-name {
  flex: 1;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
