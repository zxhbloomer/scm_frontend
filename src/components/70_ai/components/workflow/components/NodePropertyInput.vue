<template>
  <el-collapse :value="['input']" class="node-property-input">
    <el-collapse-item name="input" title="输入">
      <template slot="title">
        <span class="collapse-title">输入</span>
      </template>

      <div class="input-list">
        <div
          v-for="(refInput, index) in wfNode.inputConfig.ref_inputs"
          :key="refInput.uuid"
          class="input-item"
        >
          <el-input
            v-if="showVarName"
            v-model="refInput.name"
            placeholder="变量名"
            maxlength="50"
            show-word-limit
            class="var-name-input"
          />

          <wf-variable-selector
            :workflow="workflow"
            :wf-node="wfNode"
            :wf-ref-var="refInput"
            :white-list-components="onlyShowStartNode ? ['Start'] : []"
            :white-list-user-input-types="whiteListUserInputTypes"
            :exclude-nodes="[wfNode.uuid]"
            class="var-selector"
            @variable-selected="onVariableSelected(refInput, $event)"
          />

          <el-button
            type="text"
            icon="el-icon-delete"
            class="delete-btn"
            @click="onDelete(index)"
          />
        </div>

        <el-button
          v-if="inputsCount < limit"
          type="dashed"
          icon="el-icon-plus"
          plain
          @click="onAdd"
        >
          新增变量
        </el-button>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
import { nanoid } from 'nanoid'
import { generate } from 'random-words'
import WfVariableSelector from './WfVariableSelector.vue'

export default {
  name: 'NodePropertyInput',

  components: {
    WfVariableSelector
  },

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    },
    limit: {
      type: Number,
      default: 50
    },
    showVarName: {
      type: Boolean,
      default: true
    },
    onlyShowStartNode: {
      type: Boolean,
      default: false
    },
    whiteListUserInputTypes: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    inputsCount () {
      const refInputs = this.wfNode.inputConfig.ref_inputs || []
      const userInputs = this.wfNode.inputConfig.user_inputs || []
      return refInputs.length + userInputs.length
    }
  },

  methods: {
    onAdd () {
      if (this.inputsCount >= this.limit) {
        this.$message.warning(`最多只能添加${this.limit}个输入`)
        return
      }

      const startNode = this.getStartOrFirstNode()
      if (!startNode) {
        this.$message.warning('未找到Start节点')
        return
      }

      let nodeParamName = ''
      if (startNode.wfComponent && startNode.wfComponent.name === 'Start' && startNode.inputConfig && startNode.inputConfig.user_inputs && startNode.inputConfig.user_inputs.length > 0) {
        if (this.whiteListUserInputTypes.length > 0) {
          const enableUserInput = startNode.inputConfig.user_inputs.find(
            item => this.whiteListUserInputTypes.includes(item.type)
          )
          nodeParamName = enableUserInput?.name || ''
        } else {
          nodeParamName = startNode.inputConfig.user_inputs[0].name
        }
      } else {
        nodeParamName = 'output'
      }

      const newRefInput = {
        uuid: nanoid(32).replace(/-/g, ''),
        name: `var_${generate({ minLength: 1, maxLength: 20 })}`,
        node_param_name: nodeParamName,
        node_uuid: startNode.uuid
      }

      this.$store.commit('ai/workflow/ADD_REF_INPUT_TO_NODE', {
        wfUuid: this.workflow.workflowUuid,
        nodeUuid: this.wfNode.uuid,
        newInput: newRefInput
      })

      // 通知 WorkflowDesigner 更新 X6 节点
      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    },

    onDelete (index) {
      this.$store.commit('ai/workflow/DELETE_REF_INPUT', {
        wfUuid: this.workflow.workflowUuid,
        nodeUuid: this.wfNode.uuid,
        idx: index
      })

      // 通知 WorkflowDesigner 更新 X6 节点
      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    },

    onVariableSelected (wfInput, nodeUuidParamName) {
      wfInput.node_uuid = nodeUuidParamName[0]
      wfInput.node_param_name = nodeUuidParamName[1]
    },

    getStartOrFirstNode () {
      const startNode = this.workflow.nodes.find(n => n.wfComponent && n.wfComponent.name === 'Start')
      if (startNode) {
        return startNode
      }

      // 如果没有Start节点，返回第一个节点（不包括当前节点）
      return this.workflow.nodes.find(n => n.uuid !== this.wfNode.uuid)
    }
  }
}
</script>

<style lang="scss" scoped>
.node-property-input {
  margin: 16px 0;

  .collapse-title {
    font-size: 16px;
    font-weight: 500;
  }

  .input-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .var-name-input {
      width: 200px;
      flex-shrink: 0;
    }

    .var-selector {
      flex: 1;
    }

    .delete-btn {
      color: #f56c6c;
      padding: 0;
      min-width: auto;

      &:hover {
        color: #f56c6c;
      }
    }
  }
}
</style>
