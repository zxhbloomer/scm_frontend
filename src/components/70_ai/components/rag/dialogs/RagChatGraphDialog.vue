<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    title="引用图11谱"
    width="60%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    @close="handleClose"
    @opened="handleOpened"
  >
    <div v-if="loading" class="loading-container">
      <i class="el-icon-loading" /> 加载中...
    </div>

    <div v-else class="graph-container">
      <!-- 左侧：图谱可视化区域 -->
      <div class="graph-visual-area">
        <div v-if="isEmpty" class="empty-graph">
          <i class="el-icon-warning" />
          <p>无图谱数据</p>
        </div>
        <div
          v-show="!isEmpty"
          id="ragGraphCy"
          ref="graphCyRef"
          class="cytoscape-container"
        />
        <div class="graph-toolbar">
          <el-button
            v-show="!isEmpty"
            size="small"
            type="primary"
            icon="el-icon-refresh"
            :loading="loading"
            @click="relayout"
          >
            重新布局
          </el-button>
        </div>
      </div>

      <!-- 右侧：详情面板 -->
      <div class="graph-detail-panel">
        <!-- 从问题提取的实体 -->
        <div v-if="entitiesFromQuestion && entitiesFromQuestion.length > 0" class="detail-section">
          <div class="detail-title">
            <i class="el-icon-star-on" /> 问题实体
          </div>
          <div class="entity-tags">
            <el-tag
              v-for="(entity, idx) in entitiesFromQuestion"
              :key="idx"
              size="small"
              type="success"
            >
              {{ entity }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <!-- 选中的节点详情 -->
        <div v-if="selectedVertex" class="detail-section">
          <div class="detail-title">
            <i class="el-icon-user" /> 实体节点
          </div>
          <div class="detail-item">
            <span class="detail-label">ID:</span>
            <span class="detail-value">{{ selectedVertex.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">名称:</span>
            <span class="detail-value">{{ selectedVertex.name }}</span>
          </div>
          <div v-if="selectedVertex.type" class="detail-item">
            <span class="detail-label">类型:</span>
            <span class="detail-value">{{ selectedVertex.type }}</span>
          </div>
          <div v-if="selectedVertex.description" class="detail-item">
            <span class="detail-label">描述:</span>
            <span class="detail-value">{{ selectedVertex.description }}</span>
          </div>
        </div>

        <!-- 选中的边详情 -->
        <div v-if="selectedEdge" class="detail-section">
          <div class="detail-title">
            <i class="el-icon-connection" /> 关系边
          </div>
          <div class="detail-item">
            <span class="detail-label">ID:</span>
            <span class="detail-value">{{ selectedEdge.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">关系:</span>
            <span class="detail-value">{{ selectedEdge.label || selectedEdge.name }}</span>
          </div>
          <div v-if="selectedEdge.description" class="detail-item">
            <span class="detail-label">描述:</span>
            <span class="detail-value">{{ selectedEdge.description }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">起点:</span>
            <span class="detail-value">{{ selectedEdge.source }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">终点:</span>
            <span class="detail-value">{{ selectedEdge.target }}</span>
          </div>
        </div>

        <!-- 空状态提示 -->
        <div v-if="!selectedVertex && !selectedEdge" class="detail-section empty-state">
          <i class="el-icon-info" />
          <p>点击节点或边查看详情</p>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import cytoscape from 'cytoscape'
import ragService from '../../../api/ragService'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'RagChatGraphDialog',
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
      dialogVisible: false,
      loading: false,
      isEmpty: true,
      graphData: null,
      entitiesFromQuestion: [],
      selectedVertex: null,
      selectedEdge: null
      // cy 不放在 data 中,避免被 Vue 响应式系统处理
    }
  },
  watch: {
    visible: {
      handler (val) {
        this.dialogVisible = val
        if (val && this.qaRecordUuid) {
          this.loadGraphData()
        }
      },
      immediate: true
    }
  },
  created () {
    // 在实例上直接创建非响应式属性来存储 Cytoscape 实例
    this._cy = null
  },
  beforeDestroy () {
    if (this.cy) {
      this.cy.destroy()
      this.cy = null
    }
  },
  methods: {
    async loadGraphData () {
      if (!this.qaRecordUuid) {
        this.$message.warning('缺少问答记录UUID')
        return
      }

      this.loading = true
      try {
        const response = await ragService.getGraphRef(this.qaRecordUuid)

        if (response.system_code === 0 && response.data) {
          this.graphData = response.data

          // 提取问题实体
          this.entitiesFromQuestion = response.data.entitiesFromQuestion || []

          // 如果对话框已经打开，立即渲染
          if (this.cy) {
            this.renderGraph()
          }
        } else {
          this.$message.error(response.message || '加载图谱数据失败')
          this.graphData = null
          this.isEmpty = true
        }
      } catch (error) {
        console.error('加载图谱数据失败:', error)
        this.$message.error('加载图谱数据失败: ' + (error.message || '未知错误'))
        this.graphData = null
        this.isEmpty = true
      } finally {
        this.loading = false
      }
    },

    handleOpened () {
      // 对话框打开后初始化 cytoscape
      this.$nextTick(() => {
        if (!this.cy) {
          this.initCytoscape()
        }
        if (this.graphData) {
          this.renderGraph()
        }
      })
    },

    initCytoscape () {
      const container = document.getElementById('ragGraphCy')
      if (!container) {
        console.error('找不到图谱容器元素')
        return
      }

      this.cy = cytoscape({
        container: container,
        elements: [],
        style: [
          {
            selector: 'node',
            style: {
              'content': 'data(name)',
              'width': 40,
              'height': 40,
              'background-color': '#409EFF',
              'color': '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '12px',
              'text-wrap': 'wrap',
              'text-max-width': '80px'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '10px',
              'text-rotation': 'autorotate',
              'text-margin-y': -10
            }
          },
          {
            selector: 'node:selected',
            style: {
              'background-color': '#67C23A',
              'border-width': 3,
              'border-color': '#409EFF'
            }
          },
          {
            selector: 'edge:selected',
            style: {
              'line-color': '#67C23A',
              'target-arrow-color': '#67C23A',
              'width': 3
            }
          }
        ],
        layout: {
          name: 'cose'
        }
      })

      // 绑定节点点击事件
      this.cy.on('tap', 'node', (evt) => {
        const node = evt.target
        this.selectedVertex = node.data()
        this.selectedEdge = null
      })

      // 绑定边点击事件
      this.cy.on('tap', 'edge', (evt) => {
        const edge = evt.target
        this.selectedVertex = null
        this.selectedEdge = edge.data()
      })

      // 点击背景清除选择
      this.cy.on('tap', (evt) => {
        if (evt.target === this.cy) {
          this.selectedVertex = null
          this.selectedEdge = null
        }
      })
    },

    renderGraph () {
      if (!this.cy || !this.graphData) {
        return
      }

      // 清除现有元素
      this.cy.elements().remove()

      const vertices = this.graphData.vertices || []
      const edges = this.graphData.edges || []

      if (vertices.length === 0 && edges.length === 0) {
        this.isEmpty = true
        return
      }

      this.isEmpty = false

      // 添加节点
      const nodes = vertices.map(vertex => ({
        group: 'nodes',
        data: {
          id: String(vertex.id),
          name: vertex.name,
          type: vertex.type,
          description: vertex.description
        }
      }))

      // 添加边
      const edgesData = edges.map(edge => ({
        group: 'edges',
        data: {
          id: String(edge.id),
          label: edge.name,
          name: edge.name,
          description: edge.description,
          source: String(edge.source),
          target: String(edge.target)
        }
      }))

      // 添加到图中
      if (nodes.length > 0) {
        this.cy.add(nodes)
      }
      if (edgesData.length > 0) {
        this.cy.add(edgesData)
      }

      // 自动布局
      this.$nextTick(() => {
        this.relayout()
      })
    },

    relayout () {
      if (!this.cy) {
        return
      }

      const layout = this.cy.layout({
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 1.2
      })

      layout.run()

      // 调整视图以适应所有元素
      this.$nextTick(() => {
        this.cy.fit(null, 50)
      })
    },

    handleClose () {
      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')

      // 重置数据
      this.selectedVertex = null
      this.selectedEdge = null
      this.graphData = null
      this.entitiesFromQuestion = []
      this.isEmpty = true

      // 清除图谱
      if (this.cy) {
        this.cy.elements().remove()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-container {
  text-align: center;
  padding: 80px 0;
  color: #909399;
  font-size: 14px;

  i {
    font-size: 32px;
    margin-bottom: 12px;
    display: block;
  }
}

.graph-container {
  display: flex;
  gap: 16px;
  min-height: 500px;
}

.graph-visual-area {
  flex: 1;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;

  .empty-graph {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 500px;
    color: #909399;

    i {
      font-size: 48px;
      margin-bottom: 12px;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }

  .cytoscape-container {
    width: 100%;
    height: 500px;
    background-color: #ffffff;
  }

  .graph-toolbar {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
  }
}

.graph-detail-panel {
  width: 280px;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #ffffff;
  overflow-y: auto;
  max-height: 500px;

  .detail-section {
    margin-bottom: 16px;

    &.empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #909399;

      i {
        font-size: 32px;
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        margin: 0;
      }
    }
  }

  .detail-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      color: #409EFF;
    }
  }

  .entity-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .detail-item {
    margin-bottom: 12px;
    font-size: 13px;

    .detail-label {
      display: inline-block;
      color: #909399;
      min-width: 50px;
      font-weight: 500;
    }

    .detail-value {
      color: #606266;
      word-break: break-word;
    }
  }

  ::v-deep .el-divider {
    margin: 16px 0;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
