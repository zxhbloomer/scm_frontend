<template>
  <div class="switcher-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 每个分支情况 -->
      <div
        v-for="(wfCase, idx) in node.nodeConfig.cases"
        :key="wfCase.uuid"
        class="case-section"
      >
        <!-- 分支标题 -->
        <div class="case-header" :data-port-id="wfCase.uuid">
          分支情况{{ idx + 1 }}
        </div>

        <!-- 条件列表 -->
        <div class="conditions-wrapper">
          <div
            v-for="(condition, condIdx) in wfCase.conditions"
            :key="condition.uuid || condIdx"
            class="condition-row"
          >
            <!-- 变量名 -->
            <div class="condition-label">
              {{ getInputLabel(condition.node_uuid, condition.node_param_name) }}
            </div>

            <!-- 运算符 -->
            <div class="condition-operator">
              {{ getOperatorDesc(condition.operator) }}
            </div>

            <!-- 值 -->
            <div
              v-show="condition.operator !== 'empty' && condition.operator !== 'not empty'"
              class="condition-value"
            >
              {{ condition.value }}
            </div>

            <!-- 逻辑运算符（与/或） -->
            <div
              v-if="condIdx !== wfCase.conditions.length - 1"
              class="logic-operator"
            >
              {{ wfCase.operator === 'and' ? '与' : '或' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 保底情况 -->
      <div class="default-case" data-port-id="default_handle">
        保底情况
      </div>
    </div>
  </div>
</template>

<script>
/**
 * SwitcherNode 组件
 * 条件分支节点（动态端口）
 * 严格参考 aideepin SwitcherNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\SwitcherNode.vue
 *
 * 关键技术点：
 * 1. 每个 case 对应一个独立的输出端口（端口ID = case.uuid）
 * 2. 保底情况对应一个固定端口（端口ID = 'default_handle'）
 * 3. 端口在 mounted 时动态添加到 X6 节点
 * 4. 监听 nodeConfig.cases 变化，动态更新端口
 */
import CommonNodeHeader from './CommonNodeHeader.vue'
import { getInputLabelFromParamName } from '../../utils/workflowUtil'

export default {
  name: 'SwitcherNode',

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
    // 参考 X6 文档：node.addPort() API
    this.updatePorts()
  },

  methods: {
    /**
     * 获取输入标签
     * 参考 aideepin getInputLabelFromParamName
     */
    getInputLabel (nodeUuid, paramName) {
      const workflow = this.$store.getters['ai/workflow/getWorkflowInfo'](this.node.workflowUuid)
      if (!workflow) return ''
      return getInputLabelFromParamName(workflow, nodeUuid, paramName)
    },

    /**
     * 获取运算符描述
     */
    getOperatorDesc (operator) {
      return this.$store.getters['ai/workflow/getOperatorDesc'](operator)
    },

    /**
     * 计算端口Y坐标
     * 参考 aideepin SwitcherNode.vue 的 yposition 逻辑
     */
    getPortYPosition (caseIndex) {
      const baseY = 60 // 头部高度
      const caseHeaderHeight = 32
      const conditionHeight = 32

      let yOffset = baseY

      // 累计前面所有 case 的高度
      for (let i = 0; i < caseIndex; i++) {
        const prevCase = this.node.nodeConfig.cases[i]
        yOffset += caseHeaderHeight
        yOffset += prevCase.conditions.length * conditionHeight
      }

      // 当前 case 的头部
      yOffset += caseHeaderHeight / 2

      return yOffset
    },

    /**
     * 获取保底端口Y坐标
     */
    getDefaultPortYPosition () {
      const baseY = 60
      const caseHeaderHeight = 32
      const conditionHeight = 32

      let yOffset = baseY

      // 累计所有 case 的高度
      this.node.nodeConfig.cases.forEach(wfCase => {
        yOffset += caseHeaderHeight
        yOffset += wfCase.conditions.length * conditionHeight
      })

      // 保底情况头部
      yOffset += caseHeaderHeight / 2

      return yOffset
    },

    /**
     * 更新节点端口
     * 参考 X6 文档：dynamic ports
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

      // 为每个 case 添加一个输出端口
      if (this.node.nodeConfig.cases) {
        this.node.nodeConfig.cases.forEach((wfCase, idx) => {
          x6Node.addPort({
            id: wfCase.uuid,
            group: 'source',
            args: {
              y: this.getPortYPosition(idx)
            }
          })
        })
      }

      // 添加保底端口
      x6Node.addPort({
        id: 'default_handle',
        group: 'source',
        args: {
          y: this.getDefaultPortYPosition()
        }
      })
    }
  }
}
</script>

<style scoped>
.switcher-node {
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

.case-section {
  margin-bottom: 4px;
}

.case-header {
  height: 32px;
  line-height: 32px;
  padding: 0 8px;
  background: #e5e5e5;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  position: relative;
}

.conditions-wrapper {
  display: flex;
  flex-direction: column;
}

.condition-row {
  display: flex;
  align-items: center;
  height: 32px;
  margin-top: 4px;
  padding: 0 4px;
  background: rgba(150, 150, 150, 0.1);
  border-radius: 4px;
  font-size: 11px;
  position: relative;
}

.condition-label {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #909399;
  padding: 0 4px;
}

.condition-operator {
  overflow: hidden;
  padding: 0 4px;
  color: #606266;
}

.condition-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #909399;
  padding: 0 4px;
}

.logic-operator {
  position: absolute;
  right: 8px;
  color: #409eff;
  font-size: 11px;
  font-weight: 600;
}

.default-case {
  height: 32px;
  line-height: 32px;
  margin-top: 4px;
  padding: 0 8px;
  background: #e5e5e5;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  position: relative;
}
</style>
