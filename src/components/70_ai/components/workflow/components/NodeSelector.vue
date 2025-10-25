<template>
  <el-select
    v-model="selectedNodeUuid"
    placeholder="请选择下一个节点"
    filterable
    clearable
    style="width: 100%;"
    @change="handleSelect"
  >
    <el-option
      v-for="item in nodeOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
      <span style="float: left">
        <i :class="getIconClass(item.componentName)" style="margin-right: 8px;" />
        {{ item.label }}
      </span>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'NodeSelector',

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    },
    selected: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      selectedNodeUuid: ''
    }
  },

  computed: {
    /**
     * 节点选项列表（排除当前节点和Start节点）
     */
    nodeOptions () {
      const nodes = this.workflow.nodes || []
      const options = []

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        // 排除当前节点和Start节点
        if (node.uuid === this.wfNode.uuid || node.wfComponent.name === 'Start') {
          continue
        }

        options.push({
          label: node.title,
          value: node.uuid,
          componentName: node.wfComponent.name
        })
      }

      return options
    }
  },

  watch: {
    selected: {
      immediate: true,
      handler (val) {
        this.selectedNodeUuid = val || ''
      }
    }
  },

  methods: {
    /**
     * 处理节点选择
     */
    handleSelect (nodeUuid) {
      this.$emit('node-selected', nodeUuid || '')
    },

    /**
     * 获取节点图标类名
     */
    getIconClass (componentName) {
      const iconMap = {
        'Start': 'el-icon-video-play',
        'End': 'el-icon-video-pause',
        'Answer': 'el-icon-chat-dot-round',
        'Classifier': 'el-icon-files',
        'KnowledgeRetrieval': 'el-icon-collection',
        'DocumentExtractor': 'el-icon-document',
        'KeywordExtractor': 'el-icon-key',
        'FaqExtractor': 'el-icon-question',
        'Switcher': 'el-icon-set-up',
        'Template': 'el-icon-tickets',
        'Dalle3': 'el-icon-picture',
        'Tongyiwanx': 'el-icon-picture-outline',
        'Google': 'el-icon-search',
        'HumanFeedback': 'el-icon-user',
        'MailSend': 'el-icon-message',
        'HttpRequest': 'el-icon-link'
      }

      return iconMap[componentName] || 'el-icon-s-operation'
    }
  }
}
</script>
