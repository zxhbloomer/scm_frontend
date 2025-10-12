<template>
  <div class="item-graph-viewer">
    <div class="graph-container">
      <div class="graph-canvas">
        <div
          v-if="!loading && graphData.vertices.length === 0"
          class="empty-state"
        >
          <i class="el-icon-warning" />
          <p>暂无图谱数据</p>
        </div>
        <div
          v-else
          id="cy-container"
          ref="cyContainer"
          class="cy-container"
        />
      </div>

      <div class="control-panel">
        <div class="panel-section">
          <div class="section-title">图谱控制</div>

          <div class="control-item">
            <span class="control-label">布局算法</span>
            <el-select
              v-model="selectedLayout"
              size="small"
              :popper-append-to-body="false"
              @change="handleLayoutChange"
            >
              <el-option label="力导向布局" value="cose" />
              <el-option label="网格布局" value="grid" />
              <el-option label="圆形布局" value="circle" />
              <el-option label="同心圆布局" value="concentric" />
            </el-select>
          </div>

          <div class="control-item button-group">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-refresh"
              @click="handleReLayout"
            >
              重新布局
            </el-button>
          </div>

          <div class="control-item button-group">
            <el-button
              type="success"
              size="small"
              icon="el-icon-full-screen"
              @click="handleFitCanvas"
            >
              适配画布
            </el-button>
          </div>

          <div class="control-item button-group">
            <el-button
              type="info"
              size="small"
              icon="el-icon-download"
              @click="handleExportImage"
            >
              导出图片
            </el-button>
          </div>
        </div>

        <div
          v-if="selectedElement"
          class="panel-section"
        >
          <div class="section-title">
            {{ selectedElement.type === 'node' ? '节点详情' : '边详情' }}
          </div>

          <div class="element-details">
            <div
              v-if="selectedElement.type === 'node'"
              class="detail-content"
            >
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ selectedElement.data.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">标签:</span>
                <span class="detail-value">{{ selectedElement.data.label }}</span>
              </div>
              <div
                v-if="selectedElement.data.properties"
                class="detail-item"
              >
                <span class="detail-label">属性:</span>
                <div class="properties-content">
                  <div
                    v-for="(value, key) in selectedElement.data.properties"
                    :key="key"
                    class="property-item"
                  >
                    <span class="property-key">{{ key }}:</span>
                    <span class="property-value">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="detail-content"
            >
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ selectedElement.data.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">关系:</span>
                <span class="detail-value">{{ selectedElement.data.label }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">源节点:</span>
                <span class="detail-value">{{ selectedElement.data.source }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">目标节点:</span>
                <span class="detail-value">{{ selectedElement.data.target }}</span>
              </div>
              <div
                v-if="selectedElement.data.properties"
                class="detail-item"
              >
                <span class="detail-label">属性:</span>
                <div class="properties-content">
                  <div
                    v-for="(value, key) in selectedElement.data.properties"
                    :key="key"
                    class="property-item"
                  >
                    <span class="property-key">{{ key }}:</span>
                    <span class="property-value">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">图谱统计</div>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">节点数:</span>
              <span class="stat-value">{{ graphData.vertices.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">边数:</span>
              <span class="stat-value">{{ graphData.edges.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading-overlay"
    >
      <i class="el-icon-loading" />
      <span>加载图谱数据中...</span>
    </div>
  </div>
</template>

<script>
import knowledgeBaseService from '../api/knowledgeBaseService'
import {
  initCytoscape,
  renderGraph,
  applyLayout,
  highlightNode,
  highlightEdge,
  clearHighlight,
  fitToCanvas,
  exportGraphAsImage
} from '../utils/graphUtils'

export default {
  name: 'ItemGraphViewer',

  props: {
    kbItemUuid: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      loading: false,
      graphData: {
        vertices: [],
        edges: []
      },
      selectedLayout: 'cose',
      selectedElement: null,
      cy: null,
      maxVertextId: null,
      maxEdgeId: null
    }
  },

  watch: {
    kbItemUuid: {
      handler (val) {
        if (val) {
          this.initGraph()
        }
      },
      immediate: true
    }
  },

  beforeDestroy () {
    if (this.cy) {
      this.cy.destroy()
    }
  },

  methods: {
    /**
     * 初始化图谱
     */
    async initGraph () {
      this.loading = true
      this.selectedElement = null
      this.graphData = {
        vertices: [],
        edges: []
      }

      try {
        await this.loadGraphData()

        if (this.graphData.vertices.length > 0) {
          this.renderGraphVisualization()
        }
      } catch (error) {
        console.error('加载图谱失败:', error)
        this.$message.error('加载图谱失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载图谱数据
     */
    async loadGraphData () {
      const response = await knowledgeBaseService.graphList(
        this.kbItemUuid,
        this.maxVertextId,
        this.maxEdgeId,
        1000
      )

      const data = response.data || response

      if (data.vertices && data.vertices.length > 0) {
        this.graphData.vertices = data.vertices
        this.graphData.edges = data.edges || []

        const vertexIds = data.vertices.map(v => v.id)
        const edgeIds = (data.edges || []).map(e => e.id)

        this.maxVertextId = vertexIds.length > 0 ? Math.max(...vertexIds) : null
        this.maxEdgeId = edgeIds.length > 0 ? Math.max(...edgeIds) : null
      }
    },

    /**
     * 渲染图谱可视化
     */
    renderGraphVisualization () {
      const container = this.$refs.cyContainer

      if (!container) {
        console.error('图谱容器不存在')
        return
      }

      // 初始化Cytoscape实例
      const cyInstance = initCytoscape(container)

      // 使用Object.freeze()阻止Vue的响应式系统处理Cytoscape实例
      // 关键性能优化：Cytoscape是复杂的第三方对象，不需要响应式
      this.cy = Object.freeze(cyInstance)

      if (!this.cy) {
        console.error('Cytoscape实例创建失败')
        return
      }

      // 渲染图谱数据
      renderGraph(this.cy, this.graphData.vertices, this.graphData.edges)

      // 应用布局
      applyLayout(this.cy, this.selectedLayout)

      // 绑定节点点击事件
      this.cy.on('tap', 'node', (evt) => {
        const node = evt.target
        clearHighlight(this.cy)
        highlightNode(this.cy, node.id())

        this.selectedElement = {
          type: 'node',
          data: {
            id: node.id(),
            label: node.data('label'),
            properties: node.data('properties')
          }
        }
      })

      // 绑定边点击事件
      this.cy.on('tap', 'edge', (evt) => {
        const edge = evt.target
        clearHighlight(this.cy)
        highlightEdge(this.cy, edge.id())

        this.selectedElement = {
          type: 'edge',
          data: {
            id: edge.id(),
            label: edge.data('label'),
            source: edge.data('source'),
            target: edge.data('target'),
            properties: edge.data('properties')
          }
        }
      })

      // 绑定画布点击事件
      this.cy.on('tap', (evt) => {
        if (evt.target === this.cy) {
          clearHighlight(this.cy)
          this.selectedElement = null
        }
      })

      // 适配画布
      fitToCanvas(this.cy)
    },

    /**
     * 布局变化处理
     */
    handleLayoutChange () {
      if (this.cy) {
        applyLayout(this.cy, this.selectedLayout)
      }
    },

    /**
     * 重新布局
     */
    handleReLayout () {
      if (this.cy) {
        applyLayout(this.cy, this.selectedLayout)
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
     * 导出图片
     */
    handleExportImage () {
      if (this.cy) {
        try {
          exportGraphAsImage(this.cy, 'knowledge-graph.png')
          this.$message.success('图片导出成功')
        } catch (error) {
          this.$message.error('图片导出失败: ' + (error.message || '未知错误'))
        }
      }
    }
  }
}
</script>

<style scoped>
.item-graph-viewer {
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #f5f5f5;
}

.graph-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.graph-canvas {
  flex: 1;
  position: relative;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}

.cy-container {
  width: 100%;
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
}

.control-panel {
  width: 280px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-left: none;
  overflow-y: auto;
}

.panel-section {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.control-item {
  margin-bottom: 12px;
}

.control-item:last-child {
  margin-bottom: 0;
}

.control-item.button-group .el-button {
  width: 100%;
}

.control-label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 6px;
}

.control-item .el-select {
  width: 100%;
}

.element-details {
  font-size: 12px;
}

.detail-content {
  color: #606266;
}

.detail-item {
  margin-bottom: 10px;
  line-height: 1.5;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 500;
  color: #303133;
  display: block;
  margin-bottom: 4px;
}

.detail-value {
  color: #606266;
  word-break: break-all;
}

.properties-content {
  margin-top: 4px;
  padding-left: 10px;
}

.property-item {
  margin-bottom: 6px;
  line-height: 1.4;
}

.property-item:last-child {
  margin-bottom: 0;
}

.property-key {
  font-weight: 500;
  color: #303133;
  margin-right: 4px;
}

.property-value {
  color: #606266;
  word-break: break-all;
}

.stats-content {
  font-size: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  line-height: 1.5;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-weight: 500;
  color: #303133;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-overlay i {
  font-size: 32px;
  color: #409EFF;
  margin-bottom: 10px;
}

.loading-overlay span {
  font-size: 14px;
  color: #606266;
}
</style>
