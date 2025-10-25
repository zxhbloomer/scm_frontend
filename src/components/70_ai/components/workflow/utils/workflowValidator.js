/**
 * Workflow 验证器
 * 基于图算法实现工作流的验证功能
 */

/**
 * 验证工作流的完整性和有效性
 * @param {object} workflow WorkflowInfo
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateWorkflow (workflow) {
  const errors = []

  // 验证开始节点
  const startNodes = workflow.nodes.filter(n => n.wfComponent.name === 'Start')
  if (startNodes.length === 0) {
    errors.push('工作流必须有一个开始节点')
  } else if (startNodes.length > 1) {
    errors.push('工作流只能有一个开始节点')
  }

  // 验证结束节点
  const endNodes = workflow.nodes.filter(n => n.wfComponent.name === 'End')
  if (endNodes.length === 0) {
    errors.push('工作流必须有一个结束节点')
  } else if (endNodes.length > 1) {
    errors.push('工作流只能有一个结束节点')
  }

  // 验证节点数量
  if (workflow.nodes.length < 2) {
    errors.push('工作流至少需要开始节点和结束节点')
  }

  // 检测循环依赖
  const cycleResult = detectCycle(workflow)
  if (cycleResult.hasCycle) {
    errors.push('工作流存在循环依赖: ' + cycleResult.cyclePath.join(' -> '))
  }

  // 检测孤立节点
  const isolatedNodes = detectIsolatedNodes(workflow)
  if (isolatedNodes.length > 0) {
    const nodeNames = isolatedNodes.map(n => n.title || n.uuid).join(', ')
    errors.push('存在孤立节点（未连接）: ' + nodeNames)
  }

  // 验证拓扑排序（确保有向无环图）
  const topoResult = topologicalSort(workflow)
  if (!topoResult.success) {
    errors.push('工作流结构无效，无法生成执行顺序')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 检测工作流中的循环依赖
 * @param {object} workflow WorkflowInfo
 * @returns {object} { hasCycle: boolean, cyclePath: string[] }
 */
export function detectCycle (workflow) {
  const { nodes, edges } = workflow
  const visited = new Set()
  const recursionStack = new Set()
  const cyclePath = []

  // 构建邻接表
  const adjacencyList = buildAdjacencyList(nodes, edges)

  // DFS 检测循环
  function dfs (nodeUuid, path) {
    visited.add(nodeUuid)
    recursionStack.add(nodeUuid)
    path.push(nodeUuid)

    const neighbors = adjacencyList.get(nodeUuid) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, path)) {
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        // 找到循环
        const cycleStartIndex = path.indexOf(neighbor)
        cyclePath.push(...path.slice(cycleStartIndex))
        cyclePath.push(neighbor) // 闭合循环
        return true
      }
    }

    recursionStack.delete(nodeUuid)
    path.pop()
    return false
  }

  // 从每个未访问的节点开始 DFS
  for (const node of nodes) {
    if (!visited.has(node.uuid)) {
      if (dfs(node.uuid, [])) {
        // 转换 UUID 为节点标题
        const titles = cyclePath.map(uuid => {
          const node = nodes.find(n => n.uuid === uuid)
          return node ? (node.title || node.uuid.substring(0, 8)) : uuid
        })
        return { hasCycle: true, cyclePath: titles }
      }
    }
  }

  return { hasCycle: false, cyclePath: [] }
}

/**
 * 检测孤立节点（没有入边也没有出边）
 * @param {object} workflow WorkflowInfo
 * @returns {Array} 孤立节点数组
 */
export function detectIsolatedNodes (workflow) {
  const { nodes, edges } = workflow
  const isolatedNodes = []

  for (const node of nodes) {
    // 开始节点可以没有入边，结束节点可以没有出边
    const isStartNode = node.wfComponent.name === 'Start'
    const isEndNode = node.wfComponent.name === 'End'

    const hasIncomingEdge = edges.some(e => e.targetNodeUuid === node.uuid)
    const hasOutgoingEdge = edges.some(e => e.sourceNodeUuid === node.uuid)

    // 孤立节点判断
    if (isStartNode && !hasOutgoingEdge) {
      isolatedNodes.push(node)
    } else if (isEndNode && !hasIncomingEdge) {
      isolatedNodes.push(node)
    } else if (!isStartNode && !isEndNode && (!hasIncomingEdge || !hasOutgoingEdge)) {
      isolatedNodes.push(node)
    }
  }

  return isolatedNodes
}

/**
 * 拓扑排序（Kahn 算法）
 * @param {object} workflow WorkflowInfo
 * @returns {object} { success: boolean, order: string[], message: string }
 */
export function topologicalSort (workflow) {
  const { nodes, edges } = workflow

  // 构建邻接表和入度表
  const adjacencyList = buildAdjacencyList(nodes, edges)
  const inDegree = new Map()

  // 初始化入度
  nodes.forEach(node => inDegree.set(node.uuid, 0))

  // 计算入度
  edges.forEach(edge => {
    if (edge.targetNodeUuid) {
      inDegree.set(edge.targetNodeUuid, (inDegree.get(edge.targetNodeUuid) || 0) + 1)
    }
  })

  // 找到所有入度为 0 的节点
  const queue = []
  inDegree.forEach((degree, uuid) => {
    if (degree === 0) {
      queue.push(uuid)
    }
  })

  const order = []

  // Kahn 算法
  while (queue.length > 0) {
    const currentUuid = queue.shift()
    order.push(currentUuid)

    const neighbors = adjacencyList.get(currentUuid) || []
    neighbors.forEach(neighborUuid => {
      inDegree.set(neighborUuid, inDegree.get(neighborUuid) - 1)
      if (inDegree.get(neighborUuid) === 0) {
        queue.push(neighborUuid)
      }
    })
  }

  // 如果排序结果包含所有节点，则成功
  if (order.length === nodes.length) {
    return {
      success: true,
      order,
      message: '拓扑排序成功'
    }
  } else {
    return {
      success: false,
      order: [],
      message: '工作流存在循环依赖，无法生成执行顺序'
    }
  }
}

/**
 * 构建邻接表
 * @param {Array} nodes 节点数组
 * @param {Array} edges 边数组
 * @returns {Map} 邻接表 Map<nodeUuid, neighborUuids[]>
 */
function buildAdjacencyList (nodes, edges) {
  const adjacencyList = new Map()

  // 初始化
  nodes.forEach(node => {
    adjacencyList.set(node.uuid, [])
  })

  // 添加边
  edges.forEach(edge => {
    if (edge.sourceNodeUuid && edge.targetNodeUuid) {
      const neighbors = adjacencyList.get(edge.sourceNodeUuid) || []
      neighbors.push(edge.targetNodeUuid)
      adjacencyList.set(edge.sourceNodeUuid, neighbors)
    }
  })

  return adjacencyList
}

/**
 * 验证节点配置的完整性
 * @param {object} node WorkflowNode
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateNodeConfig (node) {
  const errors = []
  const componentName = node.wfComponent.name

  if (!node.title || node.title.trim() === '') {
    errors.push('节点标题不能为空')
  }

  // 根据节点类型验证配置
  switch (componentName) {
    case 'Start':
      validateStartNode(node, errors)
      break
    case 'End':
      validateEndNode(node, errors)
      break
    case 'Answer':
      validateAnswerNode(node, errors)
      break
    case 'Classifier':
      validateClassifierNode(node, errors)
      break
    case 'Switcher':
      validateSwitcherNode(node, errors)
      break
    case 'KnowledgeRetrieval':
      validateKnowledgeRetrievalNode(node, errors)
      break
    case 'HttpRequest':
      validateHttpRequestNode(node, errors)
      break
    case 'MailSend':
      validateMailSendNode(node, errors)
      break
    case 'Google':
      validateGoogleNode(node, errors)
      break
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证开始节点
 */
function validateStartNode (node, errors) {
  if (!node.inputConfig.user_inputs || node.inputConfig.user_inputs.length === 0) {
    errors.push('开始节点必须定义至少一个用户输入')
  }
}

/**
 * 验证结束节点
 */
function validateEndNode (node, errors) {
  // 结束节点没有特殊验证
}

/**
 * 验证 LLM 回答节点
 */
function validateAnswerNode (node, errors) {
  if (!node.nodeConfig.model_name) {
    errors.push('LLM回答节点必须选择模型')
  }
  if (!node.nodeConfig.prompt || node.nodeConfig.prompt.trim() === '') {
    errors.push('LLM回答节点必须设置提示词')
  }
}

/**
 * 验证内容分类节点
 */
function validateClassifierNode (node, errors) {
  if (!node.nodeConfig.model_name) {
    errors.push('内容分类节点必须选择模型')
  }
  if (!node.nodeConfig.categories || node.nodeConfig.categories.length < 2) {
    errors.push('内容分类节点至少需要2个分类')
  }
  node.nodeConfig.categories?.forEach((category, index) => {
    if (!category.category_name || category.category_name.trim() === '') {
      errors.push('分类 ' + (index + 1) + ' 的名称不能为空')
    }
  })
}

/**
 * 验证条件分支节点
 */
function validateSwitcherNode (node, errors) {
  if (!node.nodeConfig.cases || node.nodeConfig.cases.length === 0) {
    errors.push('条件分支节点至少需要1个分支条件')
  }
  node.nodeConfig.cases?.forEach((caseItem, index) => {
    if (!caseItem.conditions || caseItem.conditions.length === 0) {
      errors.push('分支 ' + (index + 1) + ' 至少需要1个条件')
    }
  })
}

/**
 * 验证知识库检索节点
 */
function validateKnowledgeRetrievalNode (node, errors) {
  if (!node.nodeConfig.knowledge_base_uuid) {
    errors.push('知识库检索节点必须选择知识库')
  }
  if (typeof node.nodeConfig.score !== 'number' || node.nodeConfig.score < 0 || node.nodeConfig.score > 1) {
    errors.push('相似度阈值必须在 0-1 之间')
  }
  if (!node.nodeConfig.top_n || node.nodeConfig.top_n < 1) {
    errors.push('检索数量必须大于 0')
  }
}

/**
 * 验证 HTTP 请求节点
 */
function validateHttpRequestNode (node, errors) {
  if (!node.nodeConfig.url || node.nodeConfig.url.trim() === '') {
    errors.push('HTTP请求节点必须设置URL')
  }
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(node.nodeConfig.method)) {
    errors.push('HTTP请求方法无效')
  }
}

/**
 * 验证邮件发送节点
 */
function validateMailSendNode (node, errors) {
  if (!node.nodeConfig.to_mails || node.nodeConfig.to_mails.trim() === '') {
    errors.push('邮件发送节点必须设置收件人')
  }
  if (!node.nodeConfig.subject || node.nodeConfig.subject.trim() === '') {
    errors.push('邮件发送节点必须设置主题')
  }
}

/**
 * 验证 Google 搜索节点
 */
function validateGoogleNode (node, errors) {
  if (!node.nodeConfig.query || node.nodeConfig.query.trim() === '') {
    errors.push('Google搜索节点必须设置查询内容')
  }
}
