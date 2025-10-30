<template>
  <el-select
    v-model="selectedVar"
    placeholder="请选择变量"
    filterable
    @change="handleSelect"
  >
    <el-option-group
      v-for="group in optionGroups"
      :key="group.key"
      :label="group.label"
    >
      <el-option
        v-for="item in group.children"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
        <span style="float: left">
          <i :class="getIconClass(item.value)" style="margin-right: 8px;" />
          {{ item.label }}
        </span>
      </el-option>
    </el-option-group>
  </el-select>
</template>

<script>
import { getIconClassByComponentName } from '@/components/70_ai/components/workflow/utils'

export default {
  name: 'WfVariableSelector',

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    },
    wfRefVar: {
      type: Object,
      required: true
    },
    excludeNodes: {
      type: Array,
      default: () => []
    },
    whiteListComponents: {
      type: Array,
      default: () => []
    },
    whiteListUserInputTypes: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      selectedVar: ''
    }
  },

  computed: {
    optionGroups () {
      const userInputGroup = {
        key: 'userInput',
        label: '用户的输入',
        children: []
      }

      const componentOutputGroup = {
        key: 'componentOutput',
        label: '节点的输出',
        children: []
      }

      // 使用 Set 追踪已添加的节点 UUID，避免重复
      const addedNodeUuids = new Set()

      const nodes = this.workflow.nodes || []
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // 检查 wfComponent 是否存在
        if (!node.wfComponent) {
          continue
        }

        // 检查是否已经添加过此节点（去重）
        if (addedNodeUuids.has(node.uuid)) {
          continue
        }

        // 排除当前节点和End节点
        if (this.excludeNodes.includes(node.uuid) || node.wfComponent.name === 'End') {
          continue
        }

        // 白名单过滤
        if (this.whiteListComponents.length > 0 && !this.whiteListComponents.includes(node.wfComponent.name)) {
          continue
        }

        const inputConfig = node.inputConfig || { user_inputs: [] }

        if (node.wfComponent.name === 'Start') {
          // Start节点：添加用户输入
          for (let j = 0; j < inputConfig.user_inputs.length; j++) {
            const userInput = inputConfig.user_inputs[j]

            // 类型白名单过滤
            if (this.whiteListUserInputTypes.length > 0 && !this.whiteListUserInputTypes.includes(userInput.type)) {
              continue
            }

            userInputGroup.children.push({
              label: userInput.title,
              value: `${node.uuid}::${userInput.name}`
            })
          }
        } else {
          // 其他节点：添加输出
          // 使用 node.title，如果为空则使用 wfComponent.title 作为备用
          const nodeLabel = node.title || node.wfComponent.title || node.wfComponent.name
          componentOutputGroup.children.push({
            label: nodeLabel,
            value: `${node.uuid}::output`
          })
        }

        // 标记此节点已添加
        addedNodeUuids.add(node.uuid)
      }

      return [userInputGroup, componentOutputGroup]
    }
  },

  watch: {
    wfRefVar: {
      immediate: true,
      handler (val) {
        if (val && val.node_uuid && val.node_param_name) {
          this.$nextTick(() => {
            this.selectedVar = `${val.node_uuid}::${val.node_param_name}`
          })
        }
      }
    }
  },

  methods: {
    handleSelect (value) {
      const vs = value.split('::')
      this.$emit('variable-selected', vs)
    },

    getIconClass (value) {
      const nodeUuid = value.split('::')[0]
      const node = this.workflow.nodes.find(item => item.uuid === nodeUuid)
      if (node && node.wfComponent) {
        return getIconClassByComponentName(node.wfComponent.name)
      }
      return 'el-icon-help'
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-select {
  width: 100%;
}
</style>
