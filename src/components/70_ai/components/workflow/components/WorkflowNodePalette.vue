<template>
  <div class="workflow-node-palette">
    <div ref="paletteHeader" class="palette-header">
      <span class="palette-title">节点面板</span>
    </div>

    <div
      ref="paletteContent"
      class="palette-content"
      :style="{ height: contentHeight }"
    >
      <div
        v-for="component in enabledComponents"
        :key="component.uuid"
        class="node-item"
        draggable="true"
        @dragstart="handleDragStart($event, component.name)"
      >
        <i :class="getIconClass(component.name)" class="node-icon" />
        <span class="node-title">{{ component.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'WorkflowNodePalette',

  data () {
    return {
      contentHeight: 'calc(100% - 165px)'
    }
  },

  computed: {
    ...mapState({
      wfComponents: state => state.ai.workflow.wfComponents
    }),

    enabledComponents () {
      return this.wfComponents.filter(c => c.isEnable !== false)
    }
  },

  methods: {
    handleDragStart (event, componentName) {
      event.dataTransfer.setData('application/vueflow', componentName)
      event.dataTransfer.effectAllowed = 'move'
      this.$emit('drag-start', componentName)
    },

    getIconClass (name) {
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
        'HumanFeedback': 'el-icon-user',
        'MailSend': 'el-icon-message',
        'HttpRequest': 'el-icon-link'
      }

      return iconMap[name] || 'el-icon-s-operation'
    },

    getIconColor (name) {
      const colorMap = {
        'Start': '#409EFF',
        'End': '#F56C6C',
        'Answer': '#67C23A',
        'Classifier': '#9370DB',
        'KnowledgeRetrieval': '#8B4513',
        'DocumentExtractor': '#DC143C',
        'KeywordExtractor': '#00CED1',
        'FaqExtractor': '#20B2AA',
        'Switcher': '#FFD700',
        'Template': '#87CEEB',
        'HumanFeedback': '#696969',
        'MailSend': '#FFA500',
        'HttpRequest': '#708090'
      }

      return colorMap[name] || '#606266'
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-node-palette {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.palette-header {
  padding: 16px 12px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;

  .palette-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.palette-content {
  /* 高度通过 :style 动态计算，不在CSS中固定 */
  overflow-y: auto;
  padding: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  cursor: grab;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    background-color: #ecf5ff;
    transform: translateX(2px);
  }

  &:active {
    cursor: grabbing;
  }

  .node-icon {
    font-size: 18px;
    margin-right: 8px;
    color: #606266;
  }

  .node-title {
    flex: 1;
    font-size: 13px;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 根据节点类型设置图标颜色
.node-item:nth-child(1) .node-icon { color: #409EFF; }  // Start
.node-item:nth-child(2) .node-icon { color: #F56C6C; }  // End
.node-item:nth-child(3) .node-icon { color: #67C23A; }  // Answer
.node-item:nth-child(4) .node-icon { color: #9370DB; }  // Classifier
.node-item:nth-child(5) .node-icon { color: #8B4513; }  // KnowledgeRetrieval
.node-item:nth-child(6) .node-icon { color: #DC143C; }  // DocumentExtractor
.node-item:nth-child(7) .node-icon { color: #00CED1; }  // KeywordExtractor
.node-item:nth-child(8) .node-icon { color: #20B2AA; }  // FaqExtractor
.node-item:nth-child(9) .node-icon { color: #FFD700; }  // Switcher
.node-item:nth-child(10) .node-icon { color: #87CEEB; } // Template
.node-item:nth-child(11) .node-icon { color: #696969; } // HumanFeedback
.node-item:nth-child(12) .node-icon { color: #FFA500; } // MailSend
.node-item:nth-child(13) .node-icon { color: #708090; } // HttpRequest
</style>
