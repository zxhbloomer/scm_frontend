/**
 * 知识图谱工具函数
 * 基于aideepin图谱逻辑，使用cytoscape.js
 */

import cytoscape from 'cytoscape'

/**
 * 初始化Cytoscape实例
 * @param {string|HTMLElement} containerOrId - 容器DOM元素或ID
 * @returns {Object} cytoscape实例
 */
export function initCytoscape (containerOrId) {
  // 支持传入DOM元素或ID字符串
  const container = typeof containerOrId === 'string'
    ? document.getElementById(containerOrId)
    : containerOrId

  if (!container) {
    console.error('容器不存在')
    return null
  }

  const cy = cytoscape({
    container,
    elements: [],
    style: [
      {
        selector: 'node',
        style: {
          'content': 'data(name)',
          'width': 30,
          'height': 30,
          'background-color': '#409EFF',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '12px'
        }
      },
      {
        selector: 'node.highlighted',
        style: {
          'background-color': '#f56c6c',
          'width': 35,
          'height': 35,
          'border-width': 3,
          'border-color': '#f56c6c'
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
          'text-rotation': 'autorotate'
        }
      },
      {
        selector: 'edge.highlighted',
        style: {
          'width': 3,
          'line-color': '#f56c6c',
          'target-arrow-color': '#f56c6c'
        }
      }
    ]
  })

  return cy
}

/**
 * 将顶点和边数据转换为cytoscape元素
 * @param {Array} vertices - 顶点数据
 * @param {Array} edges - 边数据
 * @returns {Object} { nodes, edges }
 */
export function transformGraphData (vertices, edges) {
  const nodes = vertices.map(vertex => ({
    group: 'nodes',
    data: {
      id: String(vertex.id),
      name: vertex.name,
      description: vertex.description
    }
  }))

  const edgeElements = edges.map(edge => ({
    group: 'edges',
    data: {
      id: String(edge.id),
      source: String(edge.startId),
      target: String(edge.endId),
      label: edge.label || edge.description || '',
      description: edge.description
    }
  }))

  return { nodes, edges: edgeElements }
}

/**
 * 渲染图谱
 * @param {Object} cy - cytoscape实例
 * @param {Array} vertices - 顶点数据
 * @param {Array} edges - 边数据
 * @param {Object} options - 渲染选项
 */
export function renderGraph (cy, vertices, edges, options = {}) {
  if (!cy) return

  const {
    clearExisting = true,
    layout = 'cose',
    onNodeClick = null,
    onEdgeClick = null
  } = options

  // 清除现有元素
  if (clearExisting) {
    cy.$('node').remove()
    cy.$('edge').remove()
  }

  // 转换数据
  const { nodes, edges: edgeElements } = transformGraphData(vertices, edges)

  // 添加节点
  if (nodes.length > 0) {
    cy.add(nodes)

    // 绑定节点点击事件
    if (onNodeClick) {
      cy.nodes().on('click', (e) => {
        const clickedNode = e.target
        onNodeClick(clickedNode.data())
      })
    }
  }

  // 添加边
  if (edgeElements.length > 0) {
    cy.add(edgeElements)

    // 绑定边点击事件
    if (onEdgeClick) {
      cy.edges().on('click', (e) => {
        const clickedEdge = e.target
        onEdgeClick(clickedEdge.data())
      })
    }
  }

  // 应用布局
  applyLayout(cy, layout)
}

/**
 * 应用图谱布局
 * @param {Object} cy - cytoscape实例
 * @param {string} layoutName - 布局名称
 */
export function applyLayout (cy, layoutName = 'cose') {
  if (!cy) return

  const layoutOptions = getLayoutOptions(layoutName)
  const layout = cy.layout(layoutOptions)
  layout.run()
}

/**
 * 获取布局配置
 * @param {string} layoutName - 布局名称
 * @returns {Object} 布局配置
 */
export function getLayoutOptions (layoutName = 'cose') {
  const layouts = {
    // COSE布局（力导向）
    cose: {
      name: 'cose',
      animate: true,
      animationDuration: 500,
      animationThreshold: 250,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: false,
      componentSpacing: 40,
      nodeRepulsion: function (node) { return 2048 },
      nodeOverlap: 4,
      idealEdgeLength: function (edge) { return 32 },
      edgeElasticity: function (edge) { return 32 },
      nestingFactor: 1.2,
      gravity: 1,
      numIter: 1000,
      initialTemp: 1000,
      coolingFactor: 0.99,
      minTemp: 1.0
    },

    // 网格布局
    grid: {
      name: 'grid',
      fit: true,
      padding: 30,
      avoidOverlap: true,
      avoidOverlapPadding: 10,
      condense: false,
      rows: undefined,
      cols: undefined
    },

    // 圆形布局
    circle: {
      name: 'circle',
      fit: true,
      padding: 30,
      avoidOverlap: true,
      radius: undefined,
      startAngle: 3 / 2 * Math.PI,
      sweep: undefined,
      clockwise: true
    },

    // 同心圆布局
    concentric: {
      name: 'concentric',
      fit: true,
      padding: 30,
      avoidOverlap: true,
      concentric: function (node) {
        return node.degree()
      },
      levelWidth: function (nodes) {
        return nodes.maxDegree() / 4
      }
    }
  }

  return layouts[layoutName] || layouts.cose
}

/**
 * 检查图谱是否为空
 * @param {Object} cy - cytoscape实例
 * @returns {boolean}
 */
export function isGraphEmpty (cy) {
  if (!cy) return true
  return cy.elements().length === 0
}

/**
 * 导出图谱为图片
 * @param {Object} cy - cytoscape实例
 * @param {Object} options - 导出选项
 * @returns {string} base64图片数据
 */
export function exportGraphAsImage (cy, options = {}) {
  if (!cy) return null

  const {
    scale = 2
  } = options

  return cy.png({
    output: 'base64',
    bg: '#fff',
    full: true,
    scale
  })
}

/**
 * 查找节点
 * @param {Object} cy - cytoscape实例
 * @param {string} nodeId - 节点ID
 * @returns {Object} 节点对象
 */
export function findNode (cy, nodeId) {
  if (!cy) return null
  return cy.getElementById(String(nodeId))
}

/**
 * 高亮节点
 * @param {Object} cy - cytoscape实例
 * @param {string} nodeId - 节点ID
 */
export function highlightNode (cy, nodeId) {
  if (!cy) return

  const node = findNode(cy, nodeId)
  if (node) {
    cy.nodes().removeClass('highlighted')
    cy.edges().removeClass('highlighted')
    node.addClass('highlighted')
    node.connectedEdges().addClass('highlighted')
  }
}

/**
 * 高亮边
 * @param {Object} cy - cytoscape实例
 * @param {string} edgeId - 边ID
 */
export function highlightEdge (cy, edgeId) {
  if (!cy) return

  const edge = cy.getElementById(String(edgeId))
  if (edge) {
    cy.nodes().removeClass('highlighted')
    cy.edges().removeClass('highlighted')
    edge.addClass('highlighted')
    edge.connectedNodes().addClass('highlighted')
  }
}

/**
 * 清除高亮
 * @param {Object} cy - cytoscape实例
 */
export function clearHighlight (cy) {
  if (!cy) return

  cy.nodes().removeClass('highlighted')
  cy.edges().removeClass('highlighted')
}

/**
 * 适配画布（自动缩放以适应所有元素）
 * @param {Object} cy - cytoscape实例
 * @param {number} padding - 内边距
 */
export function fitToCanvas (cy, padding = 50) {
  if (!cy) return

  cy.fit(cy.elements(), padding)
}

/**
 * 缩放图谱到节点
 * @param {Object} cy - cytoscape实例
 * @param {string} nodeId - 节点ID
 */
export function zoomToNode (cy, nodeId) {
  if (!cy) return

  const node = findNode(cy, nodeId)
  if (node) {
    cy.animate({
      fit: {
        eles: node,
        padding: 50
      },
      duration: 500
    })
  }
}

/**
 * 获取节点的邻居
 * @param {Object} cy - cytoscape实例
 * @param {string} nodeId - 节点ID
 * @returns {Array} 邻居节点列表
 */
export function getNodeNeighbors (cy, nodeId) {
  if (!cy) return []

  const node = findNode(cy, nodeId)
  if (!node) return []

  const neighbors = node.neighborhood('node')
  return neighbors.map(n => n.data())
}
