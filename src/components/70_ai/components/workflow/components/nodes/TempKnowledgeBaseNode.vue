<template>
  <div class="temp-kb-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 🆕 简介显示 -->
      <div v-if="localBrief" class="brief-line">
        <i class="el-icon-document brief-icon" />
        <span class="brief-text">{{ localBrief }}</span>
      </div>

      <!-- 模型信息 -->
      <div class="model-line">
        <i class="el-icon-folder-add model-icon" />
        <span class="model-name">{{ localModelName || '默认模型' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * TempKnowledgeBaseNode 组件
 * 临时知识库节点
 *
 * 功能：创建2小时自动过期的临时知识库，同步完成向量索引
 *
 * 设计理念：
 * - 极简配置，只需要选择模型和输入简介
 * - 后台硬编码提示词："创建临时知识库并同步完成向量索引"
 * - 自动使用上游节点的输出作为输入
 *
 * 显示逻辑：
 * - 显示用户输入的简介（用于区分不同临时知识库节点）
 * - 显示选择的模型名称（与MCP工具节点一致）
 * - 未选择模型时显示"默认模型"
 *
 * @author zzxxhh
 * @since 2025-12-04
 * @updated 2025-12-05 增加简介显示
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'TempKnowledgeBaseNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  data () {
    return {
      // 本地响应式状态，用于显示
      localModelName: '',
      localBrief: '' // 🆕 新增
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
    this.localBrief = node.data.nodeConfig?.brief || '' // 🆕 初始化

    // 监听 X6 节点数据变化事件
    node.on('change:data', ({ current }) => {
      // 更新本地状态，触发视图更新
      this.localModelName = current.nodeConfig?.model_name || ''
      this.localBrief = current.nodeConfig?.brief || '' // 🆕 监听变化
    })
  }
}
</script>

<style scoped>
.temp-kb-node {
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
  gap: 8px;
}

/* 🆕 简介行样式 */
.brief-line {
  height: 36px;
  line-height: 36px;
  background: rgba(103, 194, 58, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
}

.brief-icon {
  font-size: 16px;
  margin-right: 8px;
  color: #67c23a;
}

.brief-text {
  flex: 1;
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-line {
  height: 40px;
  line-height: 40px;
  background: rgba(255, 107, 107, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
}

.model-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #FF6B6B;
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
