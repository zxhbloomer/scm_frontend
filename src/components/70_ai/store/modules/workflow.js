/**
 * Workflow Vuex Module
 * 工作流状态管理模块
 * 基于 aideepin 原始实现,适配 Vue 2.7.16 + Vuex 3.1.0
 */

import { emptyWorkflowInfo } from '../../components/workflow/utils/workflowUtil'

const EMPTY_WORKFLOW_INFO = emptyWorkflowInfo

const state = {
  // UI状态
  showCreateOrEditDialog: false, // 显示创建/编辑对话框
  createOrEditWfUuid: '', // 当前创建/编辑的工作流UUID
  selectedType: 'mine', // 选中的类型: mine(我的) | public(公共)
  activeUuid: '', // 当前激活的工作流UUID
  activeWorkflowInfo: EMPTY_WORKFLOW_INFO(), // 当前激活的工作流信息

  // 工作流数据
  wfComponents: [], // 工作流组件库(节点类型列表)
  myWorkflows: [], // 我的工作流列表
  publicWorkflows: [], // 公共工作流列表

  // X6画布数据映射 (workflowUuid -> {nodes: [], edges: []})
  wfUuidToUIWorkflow: new Map(),

  // 加载状态
  loadingMyWorkflows: false,
  loadingPublicWorkflows: false,
  submitting: false, // 提交状态(保存/运行)

  // 运算符列表(用于Branch节点条件判断)
  operators: []
}

const getters = {
  /**
   * 获取工作流信息 (by UUID)
   */
  getWorkflowInfo: (state) => (wfUuid) => {
    // 在我的工作流中查找
    let wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) return wf

    // 再在公开工作流中查找
    wf = state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) return wf

    // 如果都没找到，返回undefined
    return undefined
  },

  /**
   * 获取工作流信息 (by ID)
   */
  getWorkflowInfoById: (state) => (id) => {
    const wf = state.myWorkflows.find(item => item.id === id)
    if (wf) return wf
    return state.publicWorkflows.find(item => item.id === id)
  },

  /**
   * 获取工作流组件 (by name)
   */
  getWfComponent: (state) => (name) => {
    return state.wfComponents.find(item => item.name === name)
  },

  /**
   * 获取Start节点
   */
  getStartNode: (state, getters) => (wfUuid) => {
    const wf = getters.getWorkflowInfo(wfUuid)
    if (!wf || !wf.nodes) return undefined
    // 查找 Start 节点
    return wf.nodes.find(item => {
      if (!item.wfComponent) return false
      const name = item.wfComponent.name
      return name === 'Start' || name === 'start'
    })
  },

  /**
   * 获取运算符描述
   */
  getOperatorDesc: (state) => (name) => {
    return state.operators.find(item => item.name === name)?.desc || ''
  },

  /**
   * 获取X6 UI Workflow
   */
  getUIWorkflow: (state) => (wfUuid) => {
    return state.wfUuidToUIWorkflow.get(wfUuid) || { nodes: [], edges: [] }
  }
}

const mutations = {
  /**
   * 设置显示创建/编辑对话框
   */
  SET_SHOW_CREATE_OR_EDIT_VIEW (state, show) {
    state.showCreateOrEditDialog = show
    if (!show) {
      state.createOrEditWfUuid = ''
    }
  },

  /**
   * 设置当前编辑的工作流UUID
   */
  SET_CREATE_OR_EDIT_WF_UUID (state, wfUuid) {
    state.createOrEditWfUuid = wfUuid || ''
  },

  /**
   * 设置当前激活的工作流
   * 简单策略：关闭/切换时直接清空，打开时重新加载
   */
  SET_ACTIVE (state, wfUuid) {
    state.activeUuid = wfUuid

    // 关闭或切换工作流时，直接清空数据，避免数据缓存问题
    // 下次打开时会从列表中重新加载
    state.activeWorkflowInfo = EMPTY_WORKFLOW_INFO()
  },

  /**
   * 设置工作流组件库
   */
  SET_WORKFLOW_COMPONENTS (state, components) {
    state.wfComponents = components
  },

  /**
   * 设置运算符列表
   */
  SET_OPERATORS (state, operators) {
    state.operators = operators
  },

  /**
   * 添加工作流到我的工作流列表
   */
  ADD_WORKFLOW (state, workflow) {
    // 初始化工作流字段
    initWorkflowFields(workflow, state.wfComponents)
    state.myWorkflows.unshift(workflow)
  },

  /**
   * 添加工作流并设为激活状态
   */
  ADD_WORKFLOW_AND_ACTIVE (state, workflow) {
    // 初始化工作流字段
    initWorkflowFields(workflow, state.wfComponents)
    state.myWorkflows.unshift(workflow)
    state.activeUuid = workflow.workflowUuid
    state.activeWorkflowInfo = workflow
  },

  /**
   * 追加工作流列表
   */
  APPEND_WORKFLOWS (state, { workflows, isMine }) {
    const targetList = isMine ? state.myWorkflows : state.publicWorkflows
    workflows.forEach((workflow) => {
      // 检查是否已存在
      const exists = targetList.findIndex(wf => wf.workflowUuid === workflow.workflowUuid) !== -1

      if (exists) {
        return
      }

      initWorkflowFields(workflow, state.wfComponents)
      targetList.push(workflow)
    })
  },

  /**
   * 更新工作流基础信息
   */
  UPDATE_BASE_INFO (state, { uuid, workflow }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === uuid)
    if (wf) {
      Object.assign(wf, {
        title: workflow.title,
        remark: workflow.remark,
        isPublic: workflow.isPublic,
        dbversion: workflow.dbversion
      })

      // 如果当前激活的工作流被更新，也更新 activeWorkflowInfo
      if (state.activeUuid === uuid) {
        state.activeWorkflowInfo = wf
      }
    }
  },

  /**
   * 更新工作流节点和边
   */
  UPDATE_NODES_AND_EDGES (state, { uuid, workflow }) {
    state.myWorkflows.forEach((item) => {
      if (item.workflowUuid === uuid) {
        item.nodes.forEach((node) => {
          const nodeInfo = workflow.nodes.find(n => n.uuid === node.uuid)
          if (nodeInfo) {
            Object.assign(node, { ...nodeInfo })
          }
        })
        item.edges.forEach((edge) => {
          const edgeInfo = workflow.edges.find(e => e.uuid === edge.uuid)
          if (edgeInfo) {
            Object.assign(edge, { ...edgeInfo })
          }
        })
      }
    })
  },

  /**
   * 更新节点和边的ID (新增节点/边保存后更新ID)
   */
  UPDATE_NODES_AND_EDGES_ID (state, { uuid, updatedWorkflow }) {
    state.myWorkflows.forEach((item) => {
      if (item.workflowUuid === uuid) {
        item.nodes.forEach((node) => {
          if (!node.id) {
            const updatedNode = updatedWorkflow.nodes.find(n => n.uuid === node.uuid)
            if (updatedNode) {
              node.id = updatedNode.id
            }
          }
        })
        item.edges.forEach((edge) => {
          if (!edge.id) {
            const updatedEdge = updatedWorkflow.edges.find(e => e.uuid === edge.uuid)
            if (updatedEdge) {
              edge.id = updatedEdge.id
            }
          }
        })
      }
    })
  },

  /**
   * 设置工作流公开状态
   */
  SET_WORKFLOW_PUBLIC (state, { uuid, isPublic }) {
    const idx = state.myWorkflows.findIndex(item => item.workflowUuid === uuid)
    if (idx !== -1) {
      state.myWorkflows[idx].isPublic = isPublic
      if (isPublic) {
        state.publicWorkflows.push(state.myWorkflows[idx])
      } else {
        state.publicWorkflows = state.publicWorkflows.filter(item => item.workflowUuid !== uuid)
      }
    }
  },

  /**
   * 删除工作流
   */
  DELETE_WORKFLOW (state, uuid) {
    const idx = state.myWorkflows.findIndex(item => item.workflowUuid === uuid)
    if (idx !== -1) {
      state.myWorkflows.splice(idx, 1)
    }
  },

  /**
   * 更新节点标题
   */
  UPDATE_NODE_TITLE (state, { wfUuid, nodeUuid, newTitle }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid) ||
              state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.title = newTitle
      }
    }
  },

  /**
   * 更新节点配置
   */
  UPDATE_NODE (state, { wfUuid, nodeUuid, newNode }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid) ||
              state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        Object.assign(node, { ...newNode })
      }
    }
  },

  /**
   * 添加引用输入到节点
   */
  ADD_REF_INPUT_TO_NODE (state, { wfUuid, nodeUuid, newInput }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid) ||
              state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.inputConfig.ref_inputs.push(newInput)
      }
    }
  },

  /**
   * 添加用户输入到节点
   */
  ADD_USER_INPUT_TO_NODE (state, { wfUuid, nodeUuid, newInput }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid) ||
              state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.inputConfig.user_inputs.push(newInput)
      }
    }
  },

  /**
   * 删除引用输入
   */
  DELETE_REF_INPUT (state, { wfUuid, nodeUuid, idx }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid) ||
              state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.inputConfig.ref_inputs.splice(idx, 1)
      }
    }
  },

  /**
   * 删除用户输入
   */
  DELETE_USER_INPUT (state, { wfUuid, nodeUuid, idx }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid) ||
              state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.inputConfig.user_inputs.splice(idx, 1)
      }
    }
  },

  /**
   * 删除节点
   */
  DELETE_NODE (state, { wfUuid, nodeUuid }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid)
    if (!wf) return

    // 添加到删除列表
    wf.deleteNodes.push(nodeUuid)

    // 从节点列表中删除
    const idx = wf.nodes.findIndex(node => node.uuid === nodeUuid)
    if (idx > -1) {
      wf.nodes.splice(idx, 1)
    }

    // 删除相关的边
    deleteEdgesByNodeUuid(wf, nodeUuid)

    // 删除UI节点
    deleteUiNode(state, wfUuid, nodeUuid)
  },

  /**
   * 删除边
   */
  DELETE_EDGE (state, { wfUuid, edgeUuid }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid)
    if (!wf) return

    // 添加到删除列表
    wf.deleteEdges.push(edgeUuid)

    // 从边列表中删除
    const idx = wf.edges.findIndex(edge => edge.uuid === edgeUuid)
    if (idx > -1) {
      wf.edges.splice(idx, 1)
    }

    // 删除UI边
    deleteUiEdge(state, wfUuid, edgeUuid)
  },

  /**
   * 设置UI Workflow
   */
  SET_UI_WORKFLOW (state, { wfUuid, uiWorkflow }) {
    state.wfUuidToUIWorkflow.set(wfUuid, uiWorkflow)
  },

  /**
   * 设置加载状态
   */
  SET_LOADING_MY_WORKFLOWS (state, loading) {
    state.loadingMyWorkflows = loading
  },

  SET_LOADING_PUBLIC_WORKFLOWS (state, loading) {
    state.loadingPublicWorkflows = loading
  },

  SET_SUBMITTING (state, submitting) {
    state.submitting = submitting
  }
}

const actions = {
  /**
   * 加载工作流组件库
   */
  async loadWfComponents ({ commit, state }) {
    if (state.wfComponents.length > 0) {
      return
    }

    try {
      const { workflowComponents } = await import('../../components/workflow/utils')
      const response = await workflowComponents()
      if (response.data && response.data.length > 0) {
        commit('SET_WORKFLOW_COMPONENTS', response.data)
      }
    } catch (error) {
      console.error('加载工作流组件失败:', error)
      throw error
    }
  },

  /**
   * 加载我的工作流列表
   */
  async loadMyWorkflows ({ commit, rootState }, { page = 1, pageSize = 20 }) {
    commit('SET_LOADING_MY_WORKFLOWS', true)
    try {
      const { workflowSearchMine } = await import('../../components/workflow/utils')
      const response = await workflowSearchMine('', page, pageSize)
      if (response.data && response.data.records) {
        commit('APPEND_WORKFLOWS', { workflows: response.data.records, isMine: true })

        // 如果是第一次加载且activeUuid为空，自动选中第一个
        if (response.data.records.length > 0 && !rootState.ai.workflow.activeUuid) {
          commit('SET_ACTIVE', response.data.records[0].workflowUuid)
        }
      }
    } catch (error) {
      console.error('加载我的工作流失败:', error)
      throw error
    } finally {
      commit('SET_LOADING_MY_WORKFLOWS', false)
    }
  },

  /**
   * 加载公开工作流列表
   */
  async loadPublicWorkflows ({ commit }, { page = 1, pageSize = 20 }) {
    commit('SET_LOADING_PUBLIC_WORKFLOWS', true)
    try {
      const { workflowSearchPublic } = await import('../../components/workflow/utils')
      const response = await workflowSearchPublic('', page, pageSize)
      if (response.data && response.data.records) {
        commit('APPEND_WORKFLOWS', { workflows: response.data.records, isMine: false })
      }
    } catch (error) {
      console.error('加载公开工作流失败:', error)
      throw error
    } finally {
      commit('SET_LOADING_PUBLIC_WORKFLOWS', false)
    }
  },

  /**
   * 加载运算符列表
   */
  async loadOperators ({ commit, state }) {
    if (state.operators.length > 0) {
      return
    }

    try {
      const { workflowOperators } = await import('../../components/workflow/utils')
      const response = await workflowOperators()
      if (response.data) {
        commit('SET_OPERATORS', response.data)
      }
    } catch (error) {
      console.error('加载运算符失败:', error)
      throw error
    }
  },

  /**
   * 保存工作流
   */
  async saveWorkflow ({ commit, state }, wfUuid) {
    const workflow = state.myWorkflows.find(wf => wf.workflowUuid === wfUuid)
    if (!workflow) {
      throw new Error('工作流不存在')
    }

    commit('SET_SUBMITTING', true)
    try {
      const { workflowUpdate } = await import('../../components/workflow/utils')
      const response = await workflowUpdate(workflow)
      if (response.data) {
        commit('UPDATE_NODES_AND_EDGES_ID', { uuid: wfUuid, updatedWorkflow: response.data })
      }
      return true
    } catch (error) {
      console.error('保存工作流失败:', error)
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  }
}

// ==================== 辅助函数 ====================

/**
 * 初始化工作流字段
 * 统一使用 camelCase 命名，与后端 AiWorkflowVo 保持一致
 * 同时创建 snake_case 别名以保持向后兼容
 */
function initWorkflowFields (workflow, wfComponents) {
  // ========== 初始化节点 ==========
  if (!workflow.nodes) {
    workflow.nodes = []
  }

  workflow.nodes.forEach((node, index) => {
    // 关联节点组件
    const wfComponent = wfComponents.find(c => c.id === node.workflowComponentId)
    if (wfComponent) {
      node.wfComponent = wfComponent
    }

    // 初始化输入配置
    if (!node.inputConfig) {
      node.inputConfig = { user_inputs: [], ref_inputs: [] }
    }
  })

  // ========== 初始化边 ==========
  if (!workflow.edges) {
    workflow.edges = []
  }

  // ========== 初始化删除列表 ==========
  workflow.deleteNodes = []
  workflow.deleteEdges = []
}

/**
 * 删除节点相关的所有边
 */
function deleteEdgesByNodeUuid (workflow, deletedNodeUuid) {
  const edges = workflow.edges.filter(edge =>
    edge.sourceNodeUuid === deletedNodeUuid ||
    edge.targetNodeUuid === deletedNodeUuid
  )

  edges.forEach((edge) => {
    const edgeIdx = workflow.edges.findIndex(e => e.uuid === edge.uuid)
    if (edgeIdx > -1) {
      workflow.edges.splice(edgeIdx, 1)
    }
    workflow.deleteEdges.push(edge.uuid)
  })
}

/**
 * 删除UI节点
 */
function deleteUiNode (state, wfUuid, nodeUuid) {
  const uiWorkflow = state.wfUuidToUIWorkflow.get(wfUuid)
  if (!uiWorkflow) return

  const idx = uiWorkflow.nodes.findIndex(node => node.id === nodeUuid)
  if (idx > -1) {
    uiWorkflow.nodes.splice(idx, 1)
  }
}

/**
 * 删除UI边
 */
function deleteUiEdge (state, wfUuid, edgeId) {
  const uiWorkflow = state.wfUuidToUIWorkflow.get(wfUuid)
  if (!uiWorkflow) return

  const idx = uiWorkflow.edges.findIndex(edge => edge.id === edgeId)
  if (idx > -1) {
    uiWorkflow.edges.splice(idx, 1)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
