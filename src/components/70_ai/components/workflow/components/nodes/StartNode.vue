<template>
  <div class="start-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 用户输入列表 -->
    <div class="node-content">
      <div
        v-for="userInputDef in (node.inputConfig || node.input_config || {}).user_inputs || []"
        :key="userInputDef.uuid"
        class="content-line"
      >
        <div class="input-icon">
          <i v-if="userInputDef.type === 1" class="el-icon-document" />
          <i v-if="userInputDef.type === 2" class="el-icon-s-data" />
          <i v-if="userInputDef.type === 3" class="el-icon-menu" />
          <i v-if="userInputDef.type === 4" class="el-icon-folder-opened" />
          <i v-if="userInputDef.type === 5" class="el-icon-check" />
        </div>
        <div class="input-name">
          {{ userInputDef.name }}
        </div>
        <div class="input-title">
          {{ userInputDef.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * StartNode 组件
 * 工作流开始节点
 * 严格参考 aideepin StartNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\StartNode.vue
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'StartNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  computed: {
    node () {
      const nodeData = this.getNode().data
      return nodeData
    }
  }
}
</script>

<style scoped>
.start-node {
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

.content-line {
  height: 40px;
  line-height: 40px;
  background: rgba(150, 150, 150, 0.1);
  margin-bottom: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 4px;
}

.content-line:last-child {
  margin-bottom: 0;
}

.input-icon {
  flex: none;
  width: 16px;
  margin-right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon i {
  font-size: 14px;
  color: #606266;
}

.input-name {
  width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 4px;
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.input-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #303133;
  text-align: left;
}
</style>
