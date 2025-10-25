<template>
  <div class="classifier-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 模型信息 -->
      <div class="model-line">
        <i class="el-icon-cpu model-icon" />
        <span class="model-name">{{ node.nodeConfig.model_name || '未选择模型' }}</span>
      </div>

      <!-- 分类列表 -->
      <div
        v-for="(category, idx) in node.nodeConfig.categories"
        :key="category.category_uuid"
        class="category-line"
        :data-port-id="category.category_uuid"
      >
        {{ category.category_name || `分类${idx + 1}` }}
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ClassifierNode 组件
 * 内容分类节点（动态端口）
 * 严格参考 aideepin ClassifierNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\ClassifierNode.vue
 *
 * 关键技术点：
 * 1. 每个 category 对应一个独立的输出端口（端口ID = category.category_uuid）
 * 2. 端口在 mounted 时动态添加到 X6 节点
 * 3. 显示模型名称和所有分类
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'ClassifierNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  computed: {
    node () {
      return this.getNode().data
    }
  },

  mounted () {
    // 动态添加端口
    this.updatePorts()
  },

  methods: {
    /**
     * 计算分类端口Y坐标
     * 参考 aideepin ClassifierNode.vue:29
     */
    getCategoryPortYPosition (categoryIndex) {
      const baseY = 60 // 头部高度
      const modelLineHeight = 40
      const categoryLineHeight = 40

      return baseY + modelLineHeight + categoryIndex * categoryLineHeight + (categoryLineHeight / 2)
    },

    /**
     * 更新节点端口
     * 参考 X6 文档：dynamic ports API
     */
    updatePorts () {
      const x6Node = this.getNode()

      // 清除所有现有的 source 端口
      const currentPorts = x6Node.getPorts() || []
      currentPorts.forEach(port => {
        if (port.group === 'source') {
          x6Node.removePort(port.id)
        }
      })

      // 为每个 category 添加一个输出端口
      if (this.node.nodeConfig.categories) {
        this.node.nodeConfig.categories.forEach((category, idx) => {
          x6Node.addPort({
            id: category.category_uuid,
            group: 'source',
            args: {
              y: this.getCategoryPortYPosition(idx)
            }
          })
        })
      }
    }
  }
}
</script>

<style scoped>
.classifier-node {
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
  margin-bottom: 4px;
}

.model-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #9370DB;
}

.model-name {
  flex: 1;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-line {
  height: 40px;
  line-height: 40px;
  background: rgba(150, 150, 150, 0.1);
  padding: 0 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}

.category-line:last-child {
  margin-bottom: 0;
}
</style>
