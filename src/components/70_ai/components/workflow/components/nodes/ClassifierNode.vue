<template>
  <div class="classifier-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 模型信息 -->
      <div class="model-line">
        <i class="el-icon-cpu model-icon" />
        <span class="model-name">{{ localModelName || '未选择模型' }}</span>
      </div>

      <!-- 分类列表 -->
      <div
        v-for="(category, idx) in localCategories"
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
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'ClassifierNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  data () {
    return {
      // 本地响应式状态，用于显示
      localModelName: '',
      localCategories: []
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
    this.localCategories = node.data.nodeConfig?.categories || []

    // 监听 X6 节点数据变化事件
    node.on('change:data', ({ current }) => {
      // 更新本地状态，触发视图更新
      this.localModelName = current.nodeConfig?.model_name || ''

      // 更新分类列表
      if (current.nodeConfig?.categories) {
        const newCategories = current.nodeConfig.categories
        const oldCategoriesLength = this.localCategories.length
        const newCategoriesLength = newCategories.length

        // 更新本地分类数据
        this.localCategories = [...newCategories]

        // 只有当类别数量变化时才更新端口（避免修改名称时重建端口导致边丢失）
        if (oldCategoriesLength !== newCategoriesLength) {
          this.$nextTick(() => {
            this.updatePorts()
          })
        }
      }
    })

    // 动态添加端口
    this.updatePorts()
  },

  methods: {
    /**
     * 计算分类端口Y坐标
     */
    getCategoryPortYPosition (categoryIndex) {
      const baseY = 60 // 头部高度
      const modelLineHeight = 40
      const categoryLineHeight = 40

      return baseY + modelLineHeight + categoryIndex * categoryLineHeight + (categoryLineHeight / 2)
    },

    /**
     * 更新节点端口（智能增量更新，保留边连接）
     */
    updatePorts () {
      const x6Node = this.getNode()
      const categories = this.node.nodeConfig.categories || []

      // 获取当前所有端口
      const currentPorts = x6Node.getPorts() || []
      const currentSourcePorts = currentPorts.filter(p => p.group === 'source')

      // 获取当前端口ID集合
      const currentPortIds = new Set(currentSourcePorts.map(p => p.id))
      const newPortIds = new Set(categories.map(c => c.category_uuid))

      // 1. 删除不再需要的端口
      currentSourcePorts.forEach(port => {
        if (!newPortIds.has(port.id)) {
          x6Node.removePort(port.id)
        }
      })

      // 2. 添加新端口 & 更新现有端口位置
      categories.forEach((category, idx) => {
        const portY = this.getCategoryPortYPosition(idx)

        if (currentPortIds.has(category.category_uuid)) {
          // 端口已存在，只更新位置（使用 setPortProp 避免删除边）
          x6Node.setPortProp(category.category_uuid, 'args', { y: portY })
        } else {
          // 新端口，添加它
          x6Node.addPort({
            id: category.category_uuid,
            group: 'source',
            args: { y: portY }
          })
        }
      })
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
