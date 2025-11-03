<template>
  <div class="faq-extractor-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="model-line">
        <i class="el-icon-cpu model-icon" />
        <span class="model-name">{{ localModelName || '未选择模型' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * FaqExtractorNode 组件
 * FAQ提取节点
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'FaqExtractorNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  data () {
    return {
      // 本地响应式状态，用于显示
      localModelName: ''
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
    this.localModelName = node.data.nodeConfig?.model_name || ''

    // 监听 X6 节点数据变化事件
    node.on('change:data', ({ current }) => {
      // 更新本地状态，触发视图更新
      this.localModelName = current.nodeConfig?.model_name || ''
    })
  }
}
</script>

<style scoped>
.faq-extractor-node {
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
  color: #20B2AA;
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
