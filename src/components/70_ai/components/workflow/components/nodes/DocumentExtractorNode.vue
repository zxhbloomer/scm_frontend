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

  data () {
    return {
      // 本地响应式状态
      localRefInputs: [],
      // 开始节点的文件输入列表
      startNodeFileInputs: []
    }
  },

  computed: {
    node () {
      return this.getNode().data
    },

    firstFileInput () {
      if (!this.localRefInputs || this.localRefInputs.length === 0) {
        return null
      }
      return this.localRefInputs[0]
    },

    firstFileInputName () {
      return this.firstFileInput?.name || ''
    },

    /**
     * 🔥 方案A：模仿 aideepin 实现
     * 始终显示开始节点第一个文件输入的 title
     * 不管 ref_input 关联的是哪个文件
     */
    firstFileInputTitle () {
      // 从注入的 startNodeFileInputs 获取第一个文件的 title
      if (this.startNodeFileInputs && this.startNodeFileInputs.length > 0) {
        return this.startNodeFileInputs[0].title || this.startNodeFileInputs[0].name || ''
      }
      return ''
    }
  },

  mounted () {
    // 初始化本地状态
    const node = this.getNode()
    this.localRefInputs = [...(node.data.inputConfig?.ref_inputs || [])]
    this.startNodeFileInputs = [...(node.data.startNodeFileInputs || [])]

    // 监听 X6 节点数据变化事件
    node.on('change:data', ({ current }) => {
      this.localRefInputs = [...(current.inputConfig?.ref_inputs || [])]
      this.startNodeFileInputs = [...(current.startNodeFileInputs || [])]
    })
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
