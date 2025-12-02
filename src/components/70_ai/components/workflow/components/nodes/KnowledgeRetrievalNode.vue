<template>
  <div class="knowledge-retrieval-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="kb-line">
        <i :class="localIsStrict ? 'el-icon-lock' : 'el-icon-unlock'" class="kb-icon" />
        <span class="kb-name">{{ localKnowledgeBaseName || '未选择知识库' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * KnowledgeRetrievalNode 组件
 * 知识库检索节点
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'KnowledgeRetrievalNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  data () {
    return {
      // 本地响应式状态，用于显示
      localKnowledgeBaseName: '',
      localIsStrict: true
    }
  },

  computed: {
    node () {
      return this.getNode().data
    }
  },

  mounted () {
    // 初始化本地状态
    const node = this.getNode()
    this.localKnowledgeBaseName = node.data.nodeConfig?.knowledge_base_name || '未选择知识库'
    this.localIsStrict = node.data.nodeConfig?.is_strict !== false

    // 监听 X6 节点数据变化事件
    node.on('change:data', ({ current }) => {
      // 更新本地状态，触发视图更新
      this.localKnowledgeBaseName = current.nodeConfig?.knowledge_base_name || '未选择知识库'
      this.localIsStrict = current.nodeConfig?.is_strict !== false
    })
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

.model-line {
  height: 36px;
  line-height: 36px;
  background: rgba(100, 150, 200, 0.08);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.model-icon {
  font-size: 16px;
  margin-right: 8px;
  color: #409EFF;
}

.model-name {
  flex: 1;
  font-size: 11px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
