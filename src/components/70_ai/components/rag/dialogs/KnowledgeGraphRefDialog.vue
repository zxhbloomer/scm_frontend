<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    title="引用图谱"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="graph-ref-container">
      <div
        v-if="loading"
        class="loading-state"
      >
        <i class="el-icon-loading" />
        <span>加载中...</span>
      </div>

      <div
        v-else-if="!graphData.vertices || graphData.vertices.length === 0"
        class="empty-state"
      >
        <i class="el-icon-share" />
        <p>暂无引用图谱</p>
      </div>

      <div
        v-else
        class="graph-viewer"
      >
        <div class="graph-canvas">
          <div
            id="ref-cy-container"
            ref="cyContainer"
            class="cy-container"
          />
        </div>

        <div class="graph-controls">
          <div class="control-section">
            <div class="section-title">图谱控制</div>
            <el-button
              size="small"
              @click="handleReLayout"
            >
              重新布局
            </el-button>
            <el-button
              size="small"
              @click="handleFitCanvas"
            >
              适配画布
            </el-button>
          </div>

          <div class="control-section">
            <div class="section-title">图谱统计</div>
            <div class="stat-item">
              <span>节点数:</span>
              <span>{{ graphData.vertices.length }}</span>
            </div>
            <div class="stat-item">
              <span>边数:</span>
              <span>{{ graphData.edges.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  initCytoscape,
  renderGraph,
  applyLayout,
  fitToCanvas
} from '../utils/graphUtils'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'KnowledgeGraphRefDialog',

  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    qaRecordUuid: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      loading: false,
      cy: null
    }
  },

  computed: {
    ...mapGetters('knowledgeBase', ['getGraphRef', 'isLoadingGraphRef']),

    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },

    graphData () {
      const data = this.getGraphRef(this.qaRecordUuid)
      return data || { vertices: [], edges: [] }
    }
  },

  watch: {
    visible (val) {
      if (val && this.qaRecordUuid) {
        this.loadGraphRef()
      } else if (!val) {
        this.destroyGraph()
      }
    },

    graphData: {
      handler (val) {
        if (val && val.vertices && val.vertices.length > 0) {
          this.$nextTick(() => {
            this.renderGraphVisualization()
          })
        }
      },
      deep: true
    }
  },

  beforeDestroy () {
    this.destroyGraph()
  },

  methods: {
    ...mapActions('knowledgeBase', ['loadGraphRef']),

    /**
     * 加载引用图谱
     */
    async loadGraphRef () {
      if (this.graphData.vertices && this.graphData.vertices.length > 0) {
        this.$nextTick(() => {
          this.renderGraphVisualization()
        })
        return
      }

      this.loading = true
      try {
        await this.$store.dispatch('knowledgeBase/loadGraphRef', this.qaRecordUuid)
      } catch (error) {
        this.$message.error('加载引用图谱失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    /**
     * 渲染图谱
     */
    renderGraphVisualization () {
      this.destroyGraph()

      const container = this.$refs.cyContainer
      if (!container || !this.graphData.vertices || this.graphData.vertices.length === 0) {
        return
      }

      this.cy = initCytoscape(container)

      renderGraph(this.cy, this.graphData.vertices, this.graphData.edges)

      applyLayout(this.cy, 'cose')

      setTimeout(() => {
        fitToCanvas(this.cy)
      }, 100)
    },

    /**
     * 重新布局
     */
    handleReLayout () {
      if (this.cy) {
        applyLayout(this.cy, 'cose')
        setTimeout(() => {
          fitToCanvas(this.cy)
        }, 100)
      }
    },

    /**
     * 适配画布
     */
    handleFitCanvas () {
      if (this.cy) {
        fitToCanvas(this.cy)
      }
    },

    /**
     * 销毁图谱
     */
    destroyGraph () {
      if (this.cy) {
        this.cy.destroy()
        this.cy = null
      }
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.graph-ref-container {
  min-height: 500px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  color: #909399;
}

.loading-state i,
.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
  color: #c0c4cc;
}

.graph-viewer {
  display: flex;
  height: 600px;
}

.graph-canvas {
  flex: 1;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}

.cy-container {
  width: 100%;
  height: 100%;
}

.graph-controls {
  width: 200px;
  background-color: #f5f7fa;
  border: 1px solid #e0e0e0;
  border-left: none;
  padding: 15px;
  overflow-y: auto;
}

.control-section {
  margin-bottom: 20px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.control-section .el-button {
  width: 100%;
  margin-bottom: 10px;
}

.control-section .el-button:last-child {
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  text-align: right;
}
</style>
