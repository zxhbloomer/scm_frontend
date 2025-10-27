<template>
  <div class="common-node-header">
    <div class="header-icon">
      <i :class="iconClass" />
    </div>
    <div class="header-title">
      {{ wfNode.title }}
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
 * 严格参考 aideepin CommonNodeHeader.vue 实现
 *
 * 注意: 需要使用 inject: ['getNode'] 从X6依赖注入系统获取节点对象
 * 参考X6文档: https://github.com/antvis/x6/blob/master/site/docs/tutorial/intermediate/vue.zh.md
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
  // 参考X6官方文档: inject: ['getNode'] 是获取X6节点的标准方式
  inject: ['getNode'],

  computed: {
    iconClass () {
      return getIconClassByComponentName(this.wfNode.wfComponent.name)
    }
  },

  methods: {
    handleCommand (command) {
      if (command === 'delete') {
        try {
          // 通过X6注入的getNode()获取X6节点,然后删除
          // getNode是X6 Vue shape中的标准依赖注入属性
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
