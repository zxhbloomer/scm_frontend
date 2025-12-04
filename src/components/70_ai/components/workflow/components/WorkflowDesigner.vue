<template>
  <div class="workflow-designer">
    <el-container class="designer-container" style="height: 100%;">
      <!-- 左侧节点面板 -->
      <el-aside width="240px" class="designer-sidebar">
        <workflow-node-palette @drag-start="handleDragStart" />
      </el-aside>

      <!-- 中间画布区域 -->
      <el-main class="designer-main" style="height: 100%; padding: 0;">
        <div
          ref="graphContainer"
          class="graph-container"
          @drop="handleDrop"
          @dragover="handleDragOver"
        />

        <!-- 顶部工具栏 -->
        <div class="designer-toolbar">
          <el-button
            type="primary"
            size="small"
            :loading="saving"
            :disabled="!canSave"
            @click="handleSave"
          >
            保存
          </el-button>
          <el-button
            type="success"
            size="small"
            :disabled="!canRun"
            @click="handleRun"
          >
            运行
          </el-button>
        </div>
      </el-main>

      <!-- 右侧属性面板 -->
      <el-aside
        v-show="!hidePropertyPanel"
        width="400px"
        class="designer-property-panel"
      >
        <workflow-property-panel
          :workflow="workflow"
          :selected-node="selectedWfNode"
          :ui-workflow="uiWorkflow"
          @close="hidePropertyPanel = true"
        />
      </el-aside>
    </el-container>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import { Graph } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import { registerAllWorkflowNodes } from '../utils/registerX6Nodes'
import WorkflowNodePalette from './WorkflowNodePalette.vue'
import WorkflowPropertyPanel from './WorkflowPropertyPanel.vue'

export default {
  name: 'WorkflowDesigner',

  components: {
    WorkflowNodePalette,
    WorkflowPropertyPanel
  },

  props: {
    workflow: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      graph: null,
      saving: false,
      hidePropertyPanel: true,
      selectedWfNode: null,
      draggedComponentName: null,
      uiWorkflow: {
        nodes: [],
        edges: []
      }
    }
  },

  computed: {
    ...mapState({
      wfComponents: state => state.ai.workflow.wfComponents,
      currentUserId: state => state.user.userId,
      activeUuid: state => state.ai.workflow.activeUuid
    }),

    ...mapGetters({
      getWorkflowInfo: 'ai/workflow/getWorkflowInfo',
      getWfComponent: 'ai/workflow/getWfComponent'
    }),

    canSave () {
      return this.workflow.userId === this.currentUserId
    },

    canRun () {
      if (!this.workflow.nodes || this.workflow.nodes.length < 2) {
        return false
      }

      const hasStart = this.workflow.nodes.some(
        n => n.wfComponent && n.wfComponent.name === 'Start'
      )
      const hasEnd = this.workflow.nodes.some(
        n => n.wfComponent && n.wfComponent.name === 'End'
      )

      return hasStart && hasEnd
    }
  },

  watch: {
    'workflow.nodes': {
      handler (newNodes) {
        if (!this.graph || !newNodes) {
          return
        }

        newNodes.forEach(wfNode => {
          const x6Node = this.graph.getCellById(wfNode.uuid)
          if (x6Node && x6Node.isNode()) {
            const currentData = x6Node.getData()
            const hasChanged = JSON.stringify(currentData) !== JSON.stringify(wfNode)

            if (hasChanged) {
              x6Node.setData(wfNode)
            }
          }
        })
      },
      deep: true
    },

    workflow: {
      handler (newWorkflow, oldWorkflow) {
        if (!this.graph) {
          return
        }

        const newUuid = newWorkflow?.uuid || newWorkflow?.workflowUuid
        const oldUuid = oldWorkflow?.uuid || oldWorkflow?.workflowUuid

        if (newUuid && oldUuid && newUuid !== oldUuid) {
          this.clearAndRerenderGraph()
        }
      },
      deep: false
    }
  },

  mounted () {
    // 等待容器渲染完成后初始化图形编辑器
    this.$nextTick(() => {
      this.initGraph()
      this.renderGraphWhenReady()
    })

    // 监听节点配置变化事件
    this.$root.$on('workflow:update-node', ({ nodeUuid, nodeData }) => {
      if (!this.graph) {
        return
      }

      const x6Node = this.graph.getCellById(nodeUuid)

      if (x6Node && x6Node.isNode()) {
        // 注入开始节点的文件输入信息
        const enhancedNodeData = this.injectStartNodeFileInputs(nodeData)

        // 深拷贝 nodeConfig 以确保 X6 能检测到数据变化
        const nodeConfig = { ...enhancedNodeData.nodeConfig }

        // 如果存在 categories，深拷贝它（内容归类节点）
        if (nodeConfig.categories) {
          nodeConfig.categories = nodeConfig.categories.map(cat => ({ ...cat }))
        }

        // 如果存在 cases，深拷贝它（条件分支节点）
        if (nodeConfig.cases) {
          nodeConfig.cases = nodeConfig.cases.map(c => ({
            ...c,
            conditions: c.conditions ? c.conditions.map(cond => ({ ...cond })) : []
          }))
        }

        // 创建新对象以触发视图更新
        const newData = {
          ...enhancedNodeData,
          nodeConfig: nodeConfig,
          inputConfig: {
            ...enhancedNodeData.inputConfig,
            ref_inputs: [...(enhancedNodeData.inputConfig.ref_inputs || [])],
            user_inputs: [...(enhancedNodeData.inputConfig.user_inputs || [])]
          }
        }

        x6Node.prop('data', newData)
      }

      // 如果更新的是开始节点，需要同步更新所有节点的文件输入引用
      if (nodeData.wfComponent && nodeData.wfComponent.name === 'Start') {
        this.updateAllNodesStartFileInputs()
      }
    })

    // 监听容器尺寸变化
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize()
    })

    this.$nextTick(() => {
      const container = this.$refs.graphContainer
      if (container) {
        this.resizeObserver.observe(container.parentElement)
      }
    })
  },

  activated () {
    // 组件激活时调整画布尺寸
    this.$nextTick(() => {
      this.$nextTick(() => {
        setTimeout(() => {
          this.handleResize()
        }, 100)
      })
    })
  },

  beforeDestroy () {
    this.$root.$off('workflow:update-node')

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    if (this.graph) {
      this.graph.dispose()
    }
  },

  methods: {
    ...mapMutations({
      updateNodesAndEdgesId: 'ai/workflow/UPDATE_NODES_AND_EDGES_ID'
    }),

    /**
     * 等待工作流组件加载完成后渲染图形
     */
    async renderGraphWhenReady () {
      if (this.wfComponents.length > 0) {
        this.renderGraph()
        return
      }

      const maxWaitTime = 10000
      const checkInterval = 200
      let waitedTime = 0

      const checkComponents = () => {
        if (this.wfComponents.length > 0) {
          this.renderGraph()
        } else if (waitedTime < maxWaitTime) {
          waitedTime += checkInterval
          setTimeout(checkComponents, checkInterval)
        } else {
          console.error('工作流组件加载超时')
          this.$message.error('工作流组件加载失败，请刷新页面重试')
        }
      }

      checkComponents()
    },

    initGraph () {
      registerAllWorkflowNodes()

      const container = this.$refs.graphContainer
      const parentElement = container.parentElement
      let width = container.clientWidth
      let height = container.clientHeight

      if (width === 0 || height === 0) {
        width = parentElement?.clientWidth || 800
        height = parentElement?.clientHeight || 600
      }

      this.graph = new Graph({
        container,
        width,
        height,
        autoResize: true,
        background: {
          color: '#f5f5f5'
        },
        grid: {
          size: 10,
          visible: true,
          type: 'dot',
          args: {
            color: '#ddd',
            thickness: 1
          }
        },
        panning: {
          enabled: true,
          eventTypes: ['leftMouseDown'] // 只允许鼠标左键拖拽平移
        },
        mousewheel: {
          enabled: true,
          modifiers: [], // 直接滚轮缩放，不需要按Ctrl
          minScale: 0.2, // 最小缩放到20%
          maxScale: 4 // 最大放大到400%
        },
        connecting: {
          snap: true,
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          connector: 'rounded',
          connectionPoint: 'boundary',
          router: {
            name: 'manhattan',
            args: {
              padding: 20,
              startDirections: ['right'],
              endDirections: ['left']
            }
          },
          createEdge () {
            return this.createEdge({
              attrs: {
                line: {
                  stroke: '#8f8f8f',
                  strokeWidth: 1,
                  targetMarker: {
                    name: 'classic',
                    size: 8
                  }
                }
              },
              zIndex: 0
            })
          },
          validateConnection ({ sourceCell, targetCell }) {
            return sourceCell && targetCell && sourceCell !== targetCell
          }
        },
        snapline: {
          enabled: true
        },
        keyboard: {
          enabled: true
        },
        clipboard: {
          enabled: true
        },
        history: {
          enabled: true
        }
      })

      // 将graph引用添加到uiWorkflow中,供子组件使用
      this.uiWorkflow.graph = this.graph

      this.graph.use(
        new Selection({
          enabled: true,
          multiple: false,
          rubberband: false,
          movable: true,
          showNodeSelectionBox: false
        })
      )

      this.bindEvents()
    },

    bindEvents () {
      const selection = this.graph.getPlugin('selection')

      this.graph.on('node:click', ({ node }) => {
        this.graph.getEdges().forEach(edge => {
          edge.removeTools()
        })

        if (selection) {
          selection.select(node)
        }
      })

      if (selection) {
        selection.on('node:selected', ({ node }) => {
          const wfNode = this.workflow.nodes.find(n => n.uuid === node.id)

          if (wfNode) {
            this.selectedWfNode = wfNode
            this.hidePropertyPanel = false
          }
        })

        selection.on('node:unselected', ({ node }) => {
          // 节点取消选中
        })
      }

      this.graph.on('node:moved', ({ node, e }) => {
        const wfNode = this.workflow.nodes.find(n => n.uuid === node.id)
        if (wfNode) {
          const position = node.getPosition()
          wfNode.positionX = position.x
          wfNode.positionY = position.y
        }
      })

      this.graph.on('edge:connected', ({ isNew, edge }) => {
        if (isNew) {
          this.createNewEdge(edge)
        }
      })

      this.graph.on('edge:click', ({ edge }) => {
        this.graph.getEdges().forEach(e => {
          if (e.id !== edge.id) {
            e.removeTools()
          }
        })

        edge.addTools([
          {
            name: 'button-remove',
            args: {
              distance: '50%',
              offset: { x: 0, y: 0 },
              attrs: {
                circle: {
                  r: 8,
                  fill: '#ff4d4f',
                  stroke: '#fff',
                  strokeWidth: 2,
                  cursor: 'pointer'
                },
                text: {
                  text: '×',
                  fontSize: 14,
                  fill: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAnchor: 'middle',
                  textVerticalAnchor: 'middle'
                }
              }
            }
          }
        ])
      })

      this.graph.on('blank:click', () => {
        this.graph.getEdges().forEach(edge => {
          edge.removeTools()
        })
        const selection = this.graph.getPlugin('selection')
        if (selection) {
          selection.reset()
        }
        this.hidePropertyPanel = true
        this.selectedWfNode = null
      })

      this.graph.on('cell:removed', ({ cell }) => {
        if (cell.isNode()) {
          this.deleteNode(cell.id)
        } else if (cell.isEdge()) {
          this.deleteEdge(cell.id)
        }
      })
    },

    /**
     * 清空并重新渲染图形
     */
    clearAndRerenderGraph () {
      if (!this.graph) {
        return
      }

      this.graph.clearCells()
      this.selectedWfNode = null
      this.hidePropertyPanel = true

      this.$nextTick(() => {
        this.renderGraphWhenReady()
      })
    },

    renderGraph () {
      if (!this.workflow || !this.workflow.nodes) {
        return
      }

      const initX = 10
      const initY = 10

      // 渲染节点（跳过缺少 wfComponent 的节点）
      this.workflow.nodes.forEach((node, index) => {
        // 安全检查：确保节点有 wfComponent
        if (!node.wfComponent || !node.wfComponent.name) {
          return
        }

        // 使用 ? 运算符检查是否有真实坐标值
        // 原因：新建节点的初始坐标为 0，但 0 作为有效坐标会导致紧贴画布左上角
        // 应该使用默认的分布式位置 (10 + 230*i, 50)
        const px = node.positionX ? node.positionX : initX + 230 * index
        const py = node.positionY ? node.positionY : initY

        this.addNodeToGraph(node, px, py)
      })

      // 等待所有节点的Vue组件mounted完成后再渲染边
      // 问题：X6 Vue Shape 组件的 mounted 是异步的
      // 使用 setTimeout 300ms 确保所有 Vue 组件完成 mounted
      setTimeout(() => {
        if (this.workflow.edges) {
          this.workflow.edges.forEach(edge => {
            this.addEdgeToGraph(edge)
          })
        }
      }, 300)

      // 不使用自动居中，保持节点在指定位置 (10, 50)
      // this.$nextTick(() => {
      //   this.graph.centerContent()
      // })
    },

    addNodeToGraph (wfNode, x, y) {
      /**
       * 使用自定义 Vue 组件节点
       *
       * 关键点：
       * 1. shape: 使用节点类型名（小写）
       * 2. data: 传递完整的 wfNode 数据给 Vue 组件
       * 3. 不需要 attrs/ports，由节点注册时定义
       */
      // 空值检查：确保 wfComponent 存在
      if (!wfNode.wfComponent || !wfNode.wfComponent.name) {
        console.error('节点缺少 wfComponent 信息:', wfNode)
        return
      }

      const shapeName = wfNode.wfComponent.name.toLowerCase()

      // 注入开始节点的文件输入信息
      // 让节点组件可以直接访问开始节点的文件列表
      const enhancedWfNode = this.injectStartNodeFileInputs(wfNode)

      const nodeConfig = {
        id: wfNode.uuid,
        x,
        y,
        shape: shapeName,
        data: enhancedWfNode
      }

      try {
        this.graph.addNode(nodeConfig)
      } catch (error) {
        console.error('graph.addNode 调用失败:', error)
      }
    },

    addEdgeToGraph (wfEdge) {
      const sourcePort = wfEdge.sourceHandle || 'right'
      const targetPort = wfEdge.targetHandle || 'left'

      this.graph.addEdge({
        id: wfEdge.uuid,
        source: {
          cell: wfEdge.sourceNodeUuid,
          port: sourcePort
        },
        target: {
          cell: wfEdge.targetNodeUuid,
          port: targetPort
        },
        router: {
          name: 'manhattan', // 使用与连接配置相同的路由
          args: {
            padding: 20,
            startDirections: ['right'],
            endDirections: ['left']
          }
        },
        connector: 'rounded', // 圆角连接器
        attrs: {
          line: {
            stroke: '#8f8f8f',
            strokeWidth: 1,
            targetMarker: {
              name: 'classic',
              size: 8
            }
          }
        },
        data: wfEdge
      })
    },

    handleDragStart (componentName) {
      this.draggedComponentName = componentName
    },

    handleDragOver (event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    },

    handleDrop (event) {
      event.preventDefault()

      if (!this.draggedComponentName) {
        return
      }

      const component = this.getWfComponent(this.draggedComponentName)
      if (!component) {
        console.error('component not found', this.draggedComponentName)
        return
      }

      // Start 节点只能有一个
      if (this.draggedComponentName === 'Start') {
        const hasStart = this.workflow.nodes.some(
          n => n.wfComponent && n.wfComponent.name === 'Start'
        )
        if (hasStart) {
          this.$message.warning('开始节点只能有一个')
          return
        }
      }

      const graphContainer = this.$refs.graphContainer
      const rect = graphContainer.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      this.createNewNode(component, { x, y })

      this.draggedComponentName = null
    },

    async createNewNode (component, position) {
      const { createNewNode } = await import('@/components/70_ai/components/workflow/utils')
      createNewNode(this.workflow, this.uiWorkflow, component, position)

      const newNode = this.workflow.nodes[this.workflow.nodes.length - 1]

      // 关键修复：新节点也需要同步到 Vuex store，确保 NodePropertyInput 能找到它
      // 直接修改本地 workflow 对象的 nodes 数组不会自动同步到 Vuex store
      // 因此需要通过 mutation 来更新 store 中的工作流对象
      this.$store.commit('ai/workflow/ADD_NODE_TO_WORKFLOW', {
        wfUuid: this.workflow.workflowUuid,
        newNode: newNode
      })

      this.addNodeToGraph(newNode, position.x, position.y)

      // 选择节点功能暂时移除
      // X6 的 select 方法可能需要额外的插件支持
      // 用户可以手动点击节点来选择
    },

    async createNewEdge (edge) {
      const { createNewEdgeData } = await import('@/components/70_ai/components/workflow/utils')

      const sourceNodeId = edge.getSourceCellId()
      const targetNodeId = edge.getTargetCellId()

      // 支持多种可能的 ID 字段格式
      const findNode = (nodeId) => {
        return this.workflow.nodes.find(n => n.uuid === nodeId)
      }

      const sourceNode = findNode(sourceNodeId)
      const targetNode = findNode(targetNodeId)

      if (!sourceNode || !targetNode) {
        console.error('Source or target node not found', { sourceNodeId, targetNodeId })
        return
      }

      const sourcePort = edge.getSourcePortId()
      const newEdge = createNewEdgeData(
        this.workflow,
        edge.getSourceCellId(),
        sourcePort || '',
        edge.getTargetCellId()
      )

      // 更新 edge ID - 使用 graph.updateCellId() 而不是 edge.setId()
      // 参考 X6 文档: updateCellId(cell: Cell, newId: string): Cell
      this.graph.updateCellId(edge, newEdge.uuid)
    },

    deleteNode (nodeId) {
      const index = this.workflow.nodes.findIndex(n => n.uuid === nodeId)
      if (index !== -1) {
        const deletedNode = this.workflow.nodes.splice(index, 1)[0]
        if (!this.workflow.deleteNodes) {
          this.workflow.deleteNodes = []
        }
        // 只推入UUID字符串，而不是整个node对象
        // 后端期望 deleteNodes 是 List<String>，不是 List<Node>
        this.workflow.deleteNodes.push(deletedNode.uuid)

        // 如果删除的是当前选中的节点，关闭属性面板
        if (this.selectedWfNode && this.selectedWfNode.uuid === nodeId) {
          this.selectedWfNode = null
          this.hidePropertyPanel = true
        }

        // 删除相关的边
        if (this.workflow.edges) {
          const relatedEdges = this.workflow.edges.filter(
            e => e.sourceNodeUuid === nodeId || e.targetNodeUuid === nodeId
          )
          relatedEdges.forEach(edge => {
            this.deleteEdge(edge.uuid)
          })
        }
      }
    },

    deleteEdge (edgeId) {
      if (!this.workflow.edges) {
        return
      }

      const index = this.workflow.edges.findIndex(e => e.uuid === edgeId)
      if (index !== -1) {
        const deletedEdge = this.workflow.edges.splice(index, 1)[0]
        if (!this.workflow.deleteEdges) {
          this.workflow.deleteEdges = []
        }
        // 修复：只推入UUID字符串，而不是整个edge对象
        // 后端期望 deleteEdges 是 List<String>，不是 List<Edge>
        this.workflow.deleteEdges.push(deletedEdge.uuid)
      }
    },

    async handleSave () {
      if (this.saving) {
        return
      }

      this.saving = true
      try {
        const { workflowUpdate } = await import('@/components/70_ai/components/workflow/utils')
        const response = await workflowUpdate(this.workflow)

        // 更新节点和边的 ID
        this.updateNodesAndEdgesId({
          wfUuid: this.workflow.workflowUuid,
          updatedWorkflow: response.data
        })

        this.$message.success('保存成功')
      } catch (error) {
        console.error('保存工作流失败:', error)
        this.$message.error(error.message || '保存失败')
      } finally {
        this.saving = false
      }
    },

    handleRun () {
      this.$emit('run', this.workflow)
    },

    /**
     * 处理容器尺寸变化
     * 当 tab 切换或窗口 resize 时，重新调整 Graph 尺寸
     */
    handleResize () {
      if (!this.graph) {
        return
      }

      const container = this.$refs.graphContainer
      if (!container) {
        return
      }

      const width = container.clientWidth
      const height = container.clientHeight

      if (width > 0 && height > 0) {
        this.graph.resize(width, height)
        // 不使用自动居中，保持节点在其原始位置
        // this.graph.centerContent()
      }
    },

    /**
     * 等待容器获得有效尺寸，然后调整 Graph
     * 使用轮询方式，最多等待 3 秒
     */
    waitForValidSizeAndResize () {
      const container = this.$refs.graphContainer
      if (!container) {
        return
      }

      let attemptCount = 0
      const maxAttempts = 30 // 最多尝试 30 次
      const checkInterval = 100 // 每 100ms 检查一次

      const checkSize = () => {
        attemptCount++
        const width = container.clientWidth
        const height = container.clientHeight

        if (width > 0 && height > 0) {
          this.handleResize()
        } else if (attemptCount < maxAttempts) {
          setTimeout(checkSize, checkInterval)
        }
      }

      // 立即开始第一次检查
      checkSize()
    },

    /**
     * 注入开始节点的文件输入信息
     * 让所有节点都能访问到开始节点的文件列表
     */
    injectStartNodeFileInputs (wfNode) {
      if (!this.workflow || !this.workflow.nodes) {
        return wfNode
      }

      // 查找开始节点
      const startNode = this.workflow.nodes.find(n => n.wfComponent && n.wfComponent.name === 'Start')
      if (!startNode) {
        return wfNode
      }

      // 获取所有文件类型的输入（type === 4）
      const fileInputs = startNode.inputConfig?.user_inputs?.filter(input => input.type === 4) || []

      // 注入到节点数据中
      return {
        ...wfNode,
        startNodeFileInputs: fileInputs
      }
    },

    /**
     * 当开始节点的文件输入变化时，更新所有节点的 startNodeFileInputs
     * 确保所有节点都能看到最新的文件列表
     */
    updateAllNodesStartFileInputs () {
      if (!this.graph || !this.workflow) {
        return
      }

      // 获取所有节点
      const nodes = this.graph.getNodes()

      nodes.forEach(x6Node => {
        const nodeData = x6Node.getData()
        if (!nodeData) return

        // 重新注入开始节点信息
        const enhancedData = this.injectStartNodeFileInputs(nodeData)

        // 创建新对象触发更新
        const newData = {
          ...enhancedData,
          nodeConfig: { ...enhancedData.nodeConfig },
          inputConfig: {
            ...enhancedData.inputConfig,
            ref_inputs: [...(enhancedData.inputConfig.ref_inputs || [])],
            user_inputs: [...(enhancedData.inputConfig.user_inputs || [])]
          }
        }

        // 更新节点数据
        x6Node.setData(newData)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-designer {
  width: 100%;
  height: 100%;
}

.designer-container {
  height: 100%;
}

.designer-sidebar {
  background-color: #fcfcfc;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.designer-main {
  position: relative;
  padding: 0;
  background-color: #f5f5f5;
  height: 100%;
  overflow: hidden;
}

.graph-container {
  width: 100%;
  height: 100%;
}

.designer-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 12px;
}

.designer-property-panel {
  background-color: #fff;
  border-left: 1px solid #eee;
  overflow-y: auto;
}
</style>

<style lang="scss">
/* 节点选中样式 - 直接修改节点border */
/* 通用选择器：匹配所有以 -node 结尾的节点 */
.x6-node-selected [class$="-node"] {
  border: 2px solid #409eff !important;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.6) !important;
}

/*
  支持的节点类型：
  - start-node (开始)
  - answer-node (大模型)
  - end-node (结束)
  - classifier-node (分类器)
  - document-extractor-node (文档提取)
  - faq-extractor-node (FAQ提取)
  - keyword-extractor-node (关键词提取)
  - knowledge-retrieval-node (知识检索)
  - human-feedback-node (人工反馈)
  - http-request-node (HTTP请求)
  - mail-send-node (邮件发送)
  - template-node (模板)
  - switcher-node (分支)
*/

/* 边的流动动画效果 */
@keyframes edge-flow {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.x6-edge path {
  stroke-dasharray: 8, 4;
  animation: edge-flow 0.5s linear infinite;
}
</style>
