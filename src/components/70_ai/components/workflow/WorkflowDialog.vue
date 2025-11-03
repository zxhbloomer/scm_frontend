<template>
  <div>
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      :visible="visible"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
      :append-to-body="true"
      :modal-append-to-body="true"
      :class="['workflow-dialog', { 'workflow-dialog--fullscreen': isFullscreen }]"
      width="1200px"
      top="5vh"
      destroy-on-close
      @close="handleClose"
    >
      <!-- 自定义标题栏 -->
      <div slot="title" class="dialog-title">
        <span>{{ dialogTitle }}</span>
        <el-button
          type="text"
          :icon="isFullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"
          :title="isFullscreen ? '恢复' : '最大化'"
          class="maximize-btn"
          @click.native="toggleFullscreen"
        />
      </div>
      <div class="workflow-dialog-container">
        <workflow-index
          v-if="visible"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import WorkflowIndex from '@/components/70_ai/components/workflow/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'WorkflowDialog',

  directives: { elDragDialog },

  components: {
    WorkflowIndex
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isFullscreen: true // 默认最大化
    }
  },

  computed: {
    dialogTitle () {
      return '工作流管理'
    }
  },

  methods: {
    /**
     * 切换最大化/恢复状态
     */
    toggleFullscreen () {
      this.isFullscreen = !this.isFullscreen
    },

    /**
     * 关闭弹窗
     */
    async handleClose () {
      // 调用 closeWorkflow action 清空 activeUuid 和重新加载列表
      try {
        await this.$store.dispatch('ai/workflow/closeWorkflow')
      } catch (error) {
        // 处理错误，但仍继续关闭弹窗
        // eslint-disable-next-line no-console
        console.error('closeWorkflow failed:', error)
      }

      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 20px;
}

.maximize-btn {
  padding: 5px;
  margin-left: 8px;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
}

.maximize-btn:hover {
  color: #409eff;
}

.workflow-dialog-container {
  min-height: 500px;
  max-height: 600px;
  overflow: hidden;
}

.dialog-footer {
  text-align: right;
}
</style>

<style>
/* 最大化样式 */
.workflow-dialog--fullscreen .el-dialog {
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  width: calc(100vw - 480px) !important;
  height: 100vh !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.workflow-dialog--fullscreen .el-dialog__body {
  height: calc(100vh - 60px - 60px) !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.workflow-dialog--fullscreen .workflow-dialog-container {
  max-height: none !important;
  height: 100% !important;
}
</style>
