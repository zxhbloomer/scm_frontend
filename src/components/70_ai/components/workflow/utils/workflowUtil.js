/**
 * Workflow 工具函数
 */

import { nanoid } from 'nanoid'
import { generate } from 'random-words'

/**
 * 生成工作流UUID (32位不带横线)
 * @returns {string}
 */
export function generateUuid () {
  return nanoid(32).replace(/-/g, '')
}

/**
 * 创建空的工作流信息对象
 * @returns {object} WorkflowInfo
 */
export function emptyWorkflowInfo () {
  return {
    id: '',
    uuid: '',
    title: '',
    remark: '',
    createTime: '',
    input: {},
    output: {},
    isPublic: false,
    userId: '',
    userUuid: '',
    userName: '',
    nodes: [],
    edges: [],
    deleteNodes: [],
    deleteEdges: [],
    dbversion: 0
  }
}

/**
 * 创建空的 UI 工作流对象（AntV X6）
 * @returns {object} UIWorkflow
 */
export function emptyUiWorkflow () {
  return {
    nodes: [],
    edges: []
  }
}

/**
 * 创建空的工作流节点对象
 * @returns {object} WorkflowNode
 */
export function emptyWorkflowNode () {
  return {
    id: '',
    nodeUuid: '', // 主要字段，与后端保持一致
    uuid: '', // 兼容字段
    workflowId: '',
    workflowComponentId: '',
    title: '',
    remark: '',
    inputConfig: { user_inputs: [], ref_inputs: [] },
    nodeConfig: {},
    outputConfig: {},
    positionX: 0,
    positionY: 0,
    workflowUuid: '',
    wfComponent: {},
    sourceHandleIds: [],
    targetHandleIds: []
  }
}

/**
 * 创建空的工作流运行时对象
 * @returns {object} WorkflowRuntime
 */
export function emptyWfRuntime () {
  return {
    id: '',
    runtime_uuid: '',
    wf_id: '',
    wf_uuid: '',
    create_time: '',
    status: 1,
    status_remark: '',
    input: {},
    output: {},
    prologue: '',
    nodes: [],
    error: false,
    loading: false
  }
}

/**
 * 创建空的节点运行时对象
 * @returns {object} WfRuntimeNode
 */
export function emptyWfNodeRuntime () {
  return {
    id: '',
    node_runtime_uuid: '',
    runtime_uuid: '',
    node_id: '',
    node_uuid: '',
    node_title: '',
    wf_component: {},
    input: {},
    output: {},
    status: 1,
    status_remark: '',
    create_time: '',
    error: false
  }
}

/**
 * 将工作流节点转换为 X6 UI 节点
 * @param {object} node WorkflowNode
 * @returns {object} X6 Node
 */
export function wfNodeToX6Node (node) {
  // 根据节点类型设置正确的尺寸，与 registerX6Nodes.js 保持一致
  const width = 220
  let height = 100 // 默认高度

  const componentName = node.wfComponent.name
  if (componentName === 'End') {
    height = 80
  } else if (['Classifier', 'Switcher', 'AnswerNode', 'Template'].includes(componentName)) {
    height = 120 // 复杂节点较高
  }

  return {
    id: node.nodeUuid || node.node_uuid || node.uuid, // 优先使用 nodeUuid，与后端保持一致
    shape: componentName.toLowerCase(), // X6 使用 shape 而非 type
    data: node,
    x: node.positionX,
    y: node.positionY,
    width,
    height
  }
}

/**
 * 将工作流边转换为 X6 UI 边
 * @param {object} edge WorkflowEdge
 * @returns {object} X6 Edge
 */
export function wfEdgeToX6Edge (edge) {
  return {
    id: edge.uuid,
    source: edge.sourceNodeUuid,
    target: edge.targetNodeUuid,
    sourcePort: edge.sourceHandle || undefined,
    router: { name: 'orth' },
    connector: { name: 'rounded', args: { radius: 8 }},
    data: edge
  }
}

/**
 * 创建新节点
 * @param {object} workflow WorkflowInfo
 * @param {object} uiWorkflow UIWorkflow
 * @param {object} component WorkflowComponent
 * @param {object} position { x: number, y: number }
 * @param {string} defaultModelName 默认LLM模型名称
 */
export function createNewNode (workflow, uiWorkflow, component, position, defaultModelName = '') {
  const newWfNode = emptyWorkflowNode()
  // 使用 nodeUuid 字段，与后端保持一致
  newWfNode.nodeUuid = generateUuid()
  newWfNode.uuid = newWfNode.nodeUuid // 保留 uuid 作为兼容字段
  newWfNode.title = component.title
  newWfNode.workflowId = workflow.id
  newWfNode.workflowUuid = workflow.workflowUuid
  newWfNode.wfComponent = component
  newWfNode.workflowComponentId = component.id
  newWfNode.inputConfig = { user_inputs: [], ref_inputs: [] }
  newWfNode.nodeConfig = {}
  newWfNode.outputConfig = {}
  newWfNode.positionX = position.x
  newWfNode.positionY = position.y

  // 根据节点类型创建默认配置
  const componentName = component.name
  if (componentName === 'Start') {
    // Start 节点需要默认的 user_inputs
    createStartNode(newWfNode)
  } else if (componentName === 'End') {
    // End 节点需要默认的 nodeConfig
    createEndNode(newWfNode)
  } else if (componentName === 'Classifier') {
    createClassifierNode(newWfNode, defaultModelName)
  } else if (componentName === 'Answer') {
    createAnswer(newWfNode, defaultModelName)
  } else if (componentName === 'Switcher') {
    createSwitcherNode(workflow, newWfNode)
  } else if (componentName === 'KeywordExtractor') {
    createKeywordExtractor(newWfNode, defaultModelName)
  } else if (componentName === 'FaqExtractor') {
    createFaqExtractor(newWfNode, defaultModelName)
  } else if (componentName === 'KnowledgeRetrieval') {
    createKnowledgeRetrieval(newWfNode)
  } else if (componentName === 'HumanFeedback') {
    createHumanFeedback(newWfNode)
  } else if (componentName === 'MailSend') {
    createMailSend(newWfNode)
  } else if (componentName === 'HttpRequest') {
    createHttpRequest(newWfNode)
  } else if (componentName === 'DocumentExtractor') {
    // DocumentExtractor 节点自动创建 ref_input
    createDocumentExtractor(workflow, newWfNode)
  }

  workflow.nodes.push(newWfNode)
  uiWorkflow.nodes.push(wfNodeToX6Node(newWfNode))
}

/**
 * 创建新边
 * @param {object} params { workflow, uiWorkflow, source, sourceHandle, target }
 */
export function createNewEdge (params) {
  const { workflow, uiWorkflow, source, sourceHandle, target } = params

  const wfEdge = {
    id: '',
    uuid: generateUuid(),
    workflowId: workflow.id,
    sourceNodeUuid: source,
    sourceHandle: sourceHandle,
    targetNodeUuid: target,
    workflowUuid: workflow.workflowUuid
  }

  workflow.edges.push(wfEdge)

  if (target) {
    const x6Edge = wfEdgeToX6Edge(wfEdge)
    uiWorkflow.edges.push(x6Edge)
  }

  // 判断源节点是否【条件分支】或【内容分类】
  workflow.nodes.forEach((node) => {
    const nodeId = node.nodeUuid || node.node_uuid || node.uuid
    if (nodeId === source) {
      if (node.wfComponent.name === 'Switcher') {
        if (wfEdge.sourceHandle === 'default_handle') {
          node.nodeConfig.default_target_node_uuid = wfEdge.targetNodeUuid
        } else {
          node.nodeConfig.cases.forEach((item) => {
            if (item.uuid === wfEdge.sourceHandle) {
              item.target_node_uuid = wfEdge.targetNodeUuid
            }
          })
        }
      } else if (node.wfComponent.name === 'Classifier') {
        node.nodeConfig.categories.forEach((item) => {
          if (item.category_uuid === wfEdge.sourceHandle) {
            item.target_node_uuid = wfEdge.targetNodeUuid
          }
        })
      }
    }
  })

  return wfEdge
}

/**
 * 创建新边数据（仅数据，不操作 UI）
 * @param {object} workflow WorkflowInfo
 * @param {string} source 源节点UUID
 * @param {string} sourceHandle sourceHandle 标识
 * @param {string} target 目标节点UUID
 * @returns {object} 新创建的边对象
 */
export function createNewEdgeData (workflow, source, sourceHandle, target) {
  const wfEdge = {
    id: '',
    uuid: generateUuid(),
    workflowId: workflow.id,
    sourceNodeUuid: source,
    sourceHandle: sourceHandle || '',
    targetNodeUuid: target,
    workflowUuid: workflow.workflowUuid
  }

  workflow.edges.push(wfEdge)

  // 判断源节点是否【条件分支】或【内容分类】
  workflow.nodes.forEach((node) => {
    const nodeId = node.nodeUuid || node.node_uuid || node.uuid
    if (nodeId === source) {
      if (node.wfComponent.name === 'Switcher') {
        if (wfEdge.sourceHandle === 'default_handle') {
          node.nodeConfig.default_target_node_uuid = wfEdge.targetNodeUuid
        } else {
          node.nodeConfig.cases.forEach((item) => {
            if (item.uuid === wfEdge.sourceHandle) {
              item.target_node_uuid = wfEdge.targetNodeUuid
            }
          })
        }
      } else if (node.wfComponent.name === 'Classifier') {
        node.nodeConfig.categories.forEach((item) => {
          if (item.category_uuid === wfEdge.sourceHandle) {
            item.target_node_uuid = wfEdge.targetNodeUuid
          }
        })
      }
    }
  })

  return wfEdge
}

/**
 * 更新边（通过 sourceHandle）
 * @param {object} params { workflow, uiWorkflow, source, sourceHandle, target }
 */
export function updateEdgeBySourceHandle (params) {
  const { workflow, uiWorkflow, source, sourceHandle, target } = params

  const wfEdge = workflow.edges.find(item => item.sourceHandle === sourceHandle)
  if (!wfEdge) {
    return
  }

  wfEdge.targetNodeUuid = target

  const idx = uiWorkflow.edges.findIndex(item => item.source === source && item.sourcePort === sourceHandle)
  if (idx > -1) {
    uiWorkflow.edges.splice(idx, 1)
  }

  const x6Edge = wfEdgeToX6Edge(wfEdge)
  uiWorkflow.edges.push(x6Edge)
}

/**
 * 删除源节点的所有边
 * @param {object} workflow WorkflowInfo
 * @param {object} uiWorkflow UIWorkflow
 * @param {string} source 源节点UUID
 */
export function deleteEdgesBySource (workflow, uiWorkflow, source) {
  const edges = workflow.edges.filter(edge => edge.sourceNodeUuid === source)
  edges.forEach((element) => {
    const edgeIndex = workflow.edges.findIndex((edge) => {
      const hit = edge.uuid === element.uuid
      if (hit) {
        workflow.deleteEdges.push(edge.uuid)
      }
      return hit
    })
    if (edgeIndex !== -1) {
      workflow.edges.splice(edgeIndex, 1)
    }

    const uiEdgeIndex = uiWorkflow.edges.findIndex(edge => edge.id === element.uuid)
    if (uiEdgeIndex !== -1) {
      uiWorkflow.edges.splice(uiEdgeIndex, 1)
    }
  })
}

/**
 * 删除指定 sourceHandle 的边
 * @param {object} workflow WorkflowInfo
 * @param {object} uiWorkflow UIWorkflow
 * @param {string} source 源节点UUID
 * @param {string} sourceHandle sourceHandle 标识
 */
export function deleteEdgesBySourceHandle (workflow, uiWorkflow, source, sourceHandle) {
  const edgeIndex = workflow.edges.findIndex((edge) => {
    const hit = edge.sourceNodeUuid === source && edge.sourceHandle === sourceHandle
    if (hit) {
      workflow.deleteEdges.push(edge.uuid)
    }
    return hit
  })
  if (edgeIndex !== -1) {
    workflow.edges.splice(edgeIndex, 1)
  }

  const uiEdgeIndex = uiWorkflow.edges.findIndex(edge => edge.source === source && edge.sourcePort === sourceHandle)
  if (uiEdgeIndex !== -1) {
    uiWorkflow.edges.splice(uiEdgeIndex, 1)
  }
}

/**
 * 创建开始节点的默认 user_inputs
 * @param {object} node WorkflowNode
 */
function createStartNode (node) {
  // 创建默认用户输入参数定义
  const userInputDef = {
    uuid: generateUuid(),
    type: 1, // TEXT 类型
    name: 'var_user_input',
    title: '用户输入',
    required: false,
    max_length: 1000
  }

  // 设置 inputConfig
  node.inputConfig = {
    user_inputs: [userInputDef],
    ref_inputs: []
  }
}

/**
 * 创建结束节点配置
 * @param {object} node WorkflowNode
 */
function createEndNode (node) {
  // 初始化 nodeConfig，设置默认完成提示文本
  node.nodeConfig = {
    result: '任务执行完成'
  }
}

/**
 * 创建条件分支节点配置
 * @param {object} workflow WorkflowInfo
 * @param {object} node WorkflowNode
 */
function createSwitcherNode (workflow, node) {
  const startNode = workflow.nodes.find(item => item.wfComponent.name === 'Start')
  if (!startNode) {
    throw new Error('Start node not found')
  }

  const firstInput = startNode.inputConfig.user_inputs[0]
  node.nodeConfig = {
    default_target_node_uuid: '',
    cases: [
      {
        uuid: generateUuid(),
        operator: 'and',
        target_node_uuid: '',
        conditions: [
          { node_uuid: startNode.uuid, node_param_name: firstInput.name, operator: 'contains', value: '' }
        ]
      },
      {
        uuid: generateUuid(),
        operator: 'and',
        target_node_uuid: '',
        conditions: [
          { node_uuid: startNode.uuid, node_param_name: firstInput.name, operator: 'contains', value: '' }
        ]
      }
    ]
  }
}

/**
 * 创建内容分类节点配置
 * @param {object} node WorkflowNode
 * @param {string} defaultModelName 默认模型名称
 */
function createClassifierNode (node, defaultModelName) {
  node.nodeConfig = {
    model_name: defaultModelName || '',
    categories: [
      {
        category_uuid: generateUuid(),
        category_name: '',
        target_node_uuid: ''
      },
      {
        category_uuid: generateUuid(),
        category_name: '',
        target_node_uuid: ''
      }
    ]
  }
}

/**
 * 创建LLM回答节点配置
 * @param {object} node WorkflowNode
 * @param {string} defaultModelName 默认模型名称
 */
function createAnswer (node, defaultModelName) {
  node.nodeConfig = {
    prompt: '',
    model_name: defaultModelName || ''
  }
}

/**
 * 创建关键词提取节点配置
 * @param {object} node WorkflowNode
 * @param {string} defaultModelName 默认模型名称
 */
function createKeywordExtractor (node, defaultModelName) {
  node.nodeConfig = {
    top_n: 5,
    model_name: defaultModelName || ''
  }
}

/**
 * 创建FAQ提取节点配置
 * @param {object} node WorkflowNode
 * @param {string} defaultModelName 默认模型名称
 */
function createFaqExtractor (node, defaultModelName) {
  node.nodeConfig = {
    top_n: 5,
    model_name: defaultModelName || ''
  }
}

/**
 * 创建知识库检索节点配置
 * @param {object} node WorkflowNode
 */
function createKnowledgeRetrieval (node) {
  node.nodeConfig = {
    knowledge_base_uuid: '',
    knowledge_base_name: '',
    score: 0.6,
    top_n: 3,
    is_strict: true,
    default_response: ''
  }
}

/**
 * 创建人工反馈节点配置
 * @param {object} node WorkflowNode
 */
function createHumanFeedback (node) {
  node.nodeConfig = {
    tip: ''
  }
}

/**
 * 创建邮件发送节点配置
 * @param {object} node WorkflowNode
 */
function createMailSend (node) {
  node.nodeConfig = {
    sender_type: 1,
    cc_mails: '',
    to_mails: '',
    subject: '',
    content: '',
    smtp: {
      host: '',
      port: 465
    },
    sender: {
      name: '',
      mail: '',
      password: ''
    }
  }
}

/**
 * 创建HTTP请求节点配置
 * @param {object} node WorkflowNode
 */
function createHttpRequest (node) {
  node.nodeConfig = {
    method: 'GET',
    url: '',
    content_type: 'text/plain',
    headers: [
      { name: 'Accept', value: '*/*' },
      { name: 'Cache-Control', value: 'no-cache' },
      { name: 'Connection', value: 'keep-alive' }
    ],
    params: [],
    text_body: '',
    json_body: {},
    form_data_body: [],
    form_urlencoded_body: [],
    body: {},
    timeout: 10,
    retry_times: 0,
    clear_html: false
  }
}

/**
 * 根据节点和参数名获取输入标签
 * @param {object} workflow WorkflowInfo
 * @param {string} nodeUuid 节点UUID
 * @param {string} nodeParamName 参数名称
 * @returns {string}
 */
export function getInputLabelFromParamName (workflow, nodeUuid, nodeParamName) {
  const node = workflow.nodes.find(node => node.uuid === nodeUuid)
  if (!node) {
    return ''
  }

  if (node.wfComponent.name === 'Start') {
    const inputConfig = node.inputConfig
    const input = inputConfig.user_inputs.find(input => input.name === nodeParamName)
    if (input) {
      return input.title
    }
  } else {
    return node.title
  }
}

/**
 * 根据输入类型获取中文名称
 * @param {number} type 数据类型
 * @returns {string}
 */
export function getNameByInputType (type) {
  switch (type) {
    case 1:
      return '文本'
    case 2:
      return '数字'
    case 3:
      return '下拉选项'
    case 4:
      return '文件列表'
    case 5:
      return '布尔值'
    default:
      return '未知'
  }
}

/**
 * 根据组件名称获取图标 class
 * @param {string} name 组件名称
 * @returns {string}
 */
export function getIconClassByComponentName (name) {
  const lowerName = name.toLowerCase()
  const iconMap = {
    answer: 'el-icon-chat-line-round',
    classifier: 'el-icon-set-up',
    knowledgeretrieval: 'el-icon-search',
    documentextractor: 'el-icon-document',
    keywordextractor: 'el-icon-key',
    faqextractor: 'el-icon-question',
    switcher: 'el-icon-share',
    template: 'el-icon-tickets',
    humanfeedback: 'el-icon-user',
    mailsend: 'el-icon-message',
    httprequest: 'el-icon-connection',
    end: 'el-icon-circle-check',
    start: 'el-icon-video-play'
  }
  return iconMap[lowerName] || 'el-icon-help'
}

/**
 * 根据组件名称获取颜色类
 * @param {string} name 组件名称
 * @returns {string}
 */
export function getColorClassByComponentName (name) {
  const lowerName = name.toLowerCase()
  const colorMap = {
    answer: 'color-success',
    classifier: 'color-warning',
    knowledgeretrieval: 'color-info',
    documentextractor: 'color-danger',
    keywordextractor: 'color-primary',
    faqextractor: 'color-success',
    switcher: 'color-warning',
    template: 'color-info',
    humanfeedback: 'color-info',
    mailsend: 'color-warning',
    httprequest: 'color-primary',
    end: 'color-warning',
    start: 'color-primary'
  }
  return colorMap[lowerName] || ''
}

/**
 * 创建文档提取节点配置
 * 自动创建一个 ref_input 关联到 Start 节点的第一个文件输入
 * @param {object} workflow WorkflowInfo
 * @param {object} node WorkflowNode
 */
function createDocumentExtractor (workflow, node) {
  // 查找开始节点
  const startNode = workflow.nodes.find(item => item.wfComponent && item.wfComponent.name === 'Start')

  if (!startNode) {
    return
  }

  // 获取所有文件类型的输入（type === 4）
  const fileInputs = startNode.inputConfig?.user_inputs?.filter(input => input.type === 4) || []

  if (fileInputs.length === 0) {
    return
  }

  // 自动创建一个 ref_input，关联到第一个文件输入
  const firstFileInput = fileInputs[0]
  const refInput = {
    uuid: generateUuid(),
    name: 'var_' + generate({ minLength: 1, maxLength: 20 }),
    node_param_name: firstFileInput.name,
    node_uuid: startNode.nodeUuid || startNode.uuid
  }

  // 添加到 ref_inputs
  node.inputConfig.ref_inputs.push(refInput)
}
