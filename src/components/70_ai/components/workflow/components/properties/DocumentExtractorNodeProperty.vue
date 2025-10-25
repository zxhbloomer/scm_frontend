<template>
  <div class="document-extractor-node-property">
    <!-- 检查是否有文件输入 -->
    <div v-if="!hasUserFileInput" class="no-file-input-warning">
      <el-alert
        title="开始节点没有文件输入类型的参数，请添加后再操作"
        type="warning"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 如果有文件输入，显示配置 -->
    <node-property-input
      v-else
      :workflow="workflow"
      :wf-node="wfNode"
      :limit="1"
      :only-show-start-node="true"
      :white-list-user-input-types="[4]"
    />
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'

export default {
  name: 'DocumentExtractorNodeProperty',

  components: {
    NodePropertyInput
  },

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    }
  },

  computed: {
    /**
     * 检查Start节点是否有文件类型(4)的用户输入
     */
    hasUserFileInput () {
      const startNode = this.getStartNode()
      if (!startNode) return false

      const userInputs = startNode.inputConfig?.user_inputs || []
      return userInputs.some(input => input.type === 4)
    }
  },

  methods: {
    /**
     * 获取Start节点
     */
    getStartNode () {
      const nodes = this.workflow.nodes || []
      return nodes.find(node => node.wfComponent && node.wfComponent.name === 'Start')
    }
  }
}
</script>

<style lang="scss" scoped>
.document-extractor-node-property {
  padding: 16px 0;

  .no-file-input-warning {
    padding: 12px;
  }
}
</style>
