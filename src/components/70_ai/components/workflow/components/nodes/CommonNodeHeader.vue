<template>
  <div class="common-node-header">
    <div class="header-icon">
      <i :class="iconClass" />
    </div>
    <div class="header-title">
      {{ displayTitle }}
    </div>
    <div class="header-actions">
      <el-dropdown
        v-if="wfNode.wfComponent.name !== 'Start'"
        trigger="click"
        @command="handleCommand"
      >
        <i class="el-icon-more header-more-icon" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="delete" icon="el-icon-delete">
            删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
/**
 * CommonNodeHeader 组件
 * 工作流节点的通用头部组件
 */
import { getIconClassByComponentName } from '../../utils/workflowUtil'

export default {
  name: 'CommonNodeHeader',

  props: {
    wfNode: {
      type: Object,
      required: true
    }
  },

  // 从X6的Vue shape依赖注入系统获取节点对象
  inject: ['getNode'],

  data () {
    return {
      // 本地响应式标题，用于响应 X6 数据变化
      localTitle: ''
    }
  },

  computed: {
    iconClass () {
      return getIconClassByComponentName(this.wfNode.wfComponent.name)
    },

    // 显示标题：优先使用本地响应式标题
    displayTitle () {
      return this.localTitle || this.wfNode.title || this.wfNode.wfComponent?.title || ''
    }
  },

  mounted () {
    // 初始化本地标题
    this.localTitle = this.wfNode.title || this.wfNode.wfComponent?.title || ''

    // 监听 X6 节点数据变化事件，实现标题实时同步
    try {
      const node = this.getNode()
      if (node) {
        node.on('change:data', ({ current }) => {
          if (current && current.title) {
            this.localTitle = current.title
          }
        })
      }
    } catch (e) {
      // 忽略错误，某些情况下 getNode 可能不可用
    }
  },

  methods: {
    handleCommand (command) {
      if (command === 'delete') {
        try {
          const node = this.getNode()
          if (node) {
            node.remove()
          }
        } catch (error) {
          this.$message.error('删除节点失败: ' + error.message)
        }
      }
    }
  }
}
</script>

<style scoped>
.common-node-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 12px;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
}

.header-icon {
  width: 24px;
  margin-right: 8px;
}

.header-icon i {
  font-size: 20px;
}

.header-title {
  flex: 1;
  max-height: 24px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.header-actions {
  width: 24px;
  margin-left: 8px;
}

.header-more-icon {
  cursor: pointer;
  font-size: 16px;
  color: #606266;
}

.header-more-icon:hover {
  color: #409eff;
}
</style>
