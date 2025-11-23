/**
 * Workflow Vuex Module
 * 工作流状态管理模块
 * 基于 aideepin 原始实现,适配 Vue 2.7.16 + Vuex 3.1.0
 *
 * 重要修改：
 * - aideepin 使用 Vue 3（支持 Map 响应式）
 * - SCM 使用 Vue 2.7（不支持 Map 响应式）
 * - 必须将 Map 改为普通对象以确保响应式工作
 */

import Vue from 'vue'
import { emptyWorkflowInfo } from '../../components/workflow/utils/workflowUtil'
import { COMPONENT_UUID_START } from '../../constants/workflowComponentUuid'

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
  // Vue 2: 使用普通对象代替 Map
  wfUuidToUIWorkflow: {},

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
   * 严格参考 aideepin 实现：直接从 myWorkflows/publicWorkflows 查找返回
   */
  getWorkflowInfo: (state) => (wfUuid) => {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid)
    if (wf) {
      return wf
    }
    return state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
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
   * 使用UUID判断，更加稳定可靠
   */
  getStartNode: (state, getters) => (wfUuid) => {
    const wf = getters.getWorkflowInfo(wfUuid)
    if (!wf || !wf.nodes) return undefined
    // 查找 Start 节点：使用 component_uuid 判断
    return wf.nodes.find(item => {
      if (!item.wfComponent) return false
      return item.wfComponent.componentUuid === COMPONENT_UUID_START
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
   * Vue 2: 使用对象属性访问代替 Map.get()
   */
  getUIWorkflow: (state) => (wfUuid) => {
    return state.wfUuidToUIWorkflow[wfUuid] || { nodes: [], edges: [] }
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
   * 从列表中获取工作流数据，并进行深拷贝以避免编辑污染原列表
   * 注意：LIST 会同步修改（DELETE_NODE 会修改列表和 activeWorkflowInfo），
   * 但下次打开时仍需要从刚刚重新加载的列表中取数据
   */
  SET_ACTIVE (state, wfUuid) {
    state.activeUuid = wfUuid

    if (!wfUuid) {
      // 关闭工作流时直接清空
      state.activeWorkflowInfo = EMPTY_WORKFLOW_INFO()
      return
    }

    // 从列表中查找工作流
    let workflow = state.myWorkflows.find(item => item.workflowUuid === wfUuid)

    if (!workflow) {
      workflow = state.publicWorkflows.find(item => item.workflowUuid === wfUuid)
    }

    if (workflow) {
      // 深拷贝工作流数据到 activeWorkflowInfo，避免编辑污染原列表
      // 即使列表中的数据被修改过，深拷贝会复制当前状态
      state.activeWorkflowInfo = JSON.parse(JSON.stringify(workflow))
    } else {
      state.activeWorkflowInfo = EMPTY_WORKFLOW_INFO()
    }
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
      const oldIsPublic = wf.isPublic

      Object.assign(wf, {
        title: workflow.title,
        remark: workflow.remark,
        isPublic: workflow.isPublic,
        dbversion: workflow.dbversion,
        // 智能路由新增字段
        desc: workflow.desc,
        keywords: workflow.keywords,
        category: workflow.category,
        categoryName: workflow.categoryName,
        priority: workflow.priority
      })

      // 如果公开状态发生变化，同步更新 publicWorkflows 列表
      if (oldIsPublic !== workflow.isPublic) {
        if (workflow.isPublic) {
          // 改为公开：添加到公开列表（如果不存在）
          const existsInPublic = state.publicWorkflows.find(item => item.workflowUuid === uuid)
          if (!existsInPublic) {
            state.publicWorkflows.push(wf)
          }
        } else {
          // 改为私有：从公开列表移除
          state.publicWorkflows = state.publicWorkflows.filter(item => item.workflowUuid !== uuid)
        }
      } else if (workflow.isPublic) {
        // 公开状态未变但仍是公开：更新公开列表中的数据
        const publicWf = state.publicWorkflows.find(item => item.workflowUuid === uuid)
        if (publicWf) {
          Object.assign(publicWf, {
            title: workflow.title,
            remark: workflow.remark,
            dbversion: workflow.dbversion,
            // 智能路由新增字段
            desc: workflow.desc,
            keywords: workflow.keywords,
            category: workflow.category,
            categoryName: workflow.categoryName,
            priority: workflow.priority
          })
        }
      }

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
   * 添加节点到工作流
   * 用于同步 WorkflowDesigner 中创建的新节点到 Vuex store
   */
  ADD_NODE_TO_WORKFLOW (state, { wfUuid, newNode }) {
    const wf = state.myWorkflows.find(item => item.workflowUuid === wfUuid) ||
              state.publicWorkflows.find(item => item.workflowUuid === wfUuid)

    if (wf) {
      wf.nodes.push(newNode)
    }
  },

  /**
   * 添加引用输入到节点
   * 严格参考 aideepin 实现
   */
  ADD_REF_INPUT_TO_NODE (state, { wfUuid, nodeUuid, newInput }) {
    const wf = getters.getWorkflowInfo(state)(wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.inputConfig.ref_inputs.push(newInput)
      }
    }
  },

  /**
   * 添加用户输入到节点
   * 严格参考 aideepin 实现
   */
  ADD_USER_INPUT_TO_NODE (state, { wfUuid, nodeUuid, newInput }) {
    const wf = getters.getWorkflowInfo(state)(wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.inputConfig.user_inputs.push(newInput)
      }
    }
  },

  /**
   * 删除引用输入
   * 严格参考 aideepin 实现
   */
  DELETE_REF_INPUT (state, { wfUuid, nodeUuid, idx }) {
    const wf = getters.getWorkflowInfo(state)(wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.inputConfig.ref_inputs.splice(idx, 1)
      }
    }
  },

  /**
   * 删除用户输入
   * 严格参考 aideepin 实现
   */
  DELETE_USER_INPUT (state, { wfUuid, nodeUuid, idx }) {
    const wf = getters.getWorkflowInfo(state)(wfUuid)
    if (wf) {
      const node = wf.nodes.find(n => n.uuid === nodeUuid)
      if (node) {
        node.inputConfig.user_inputs.splice(idx, 1)
      }
    }
  },

  /**
   * 删除节点
   * 同时删除 activeWorkflowInfo 中的节点（如果当前工作流是激活状态）
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

    // 如果这是当前激活的工作流，也要同时删除 activeWorkflowInfo 中的节点
    if (state.activeUuid === wfUuid && state.activeWorkflowInfo.workflowUuid) {
      const activeIdx = state.activeWorkflowInfo.nodes.findIndex(node => node.uuid === nodeUuid)
      if (activeIdx > -1) {
        state.activeWorkflowInfo.nodes.splice(activeIdx, 1)
      }
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
   * Vue 2: 使用 Vue.set() 确保响应式
   */
  SET_UI_WORKFLOW (state, { wfUuid, uiWorkflow }) {
    Vue.set(state.wfUuidToUIWorkflow, wfUuid, uiWorkflow)
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
  },

  /**
   * 清空工作流列表
   * 用于关闭工作流时清空已修改的数据，确保重新加载时获取最新数据
   */
  CLEAR_WORKFLOWS (state) {
    state.myWorkflows = []
    state.publicWorkflows = []
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
        // ✅ 必须对返回的数据进行清理和规范化，确保节点uuid字段正确
        const cleanedWorkflows = response.data.records.map(workflow => {
          // 规范化节点中的uuid字段，并过滤已删除节点
          if (workflow.nodes && Array.isArray(workflow.nodes)) {
            // 先过滤掉 is_deleted = 1 的节点
            workflow.nodes = workflow.nodes.filter(node => {
              const isDeleted = node.isDeleted !== undefined ? node.isDeleted : node.is_deleted
              return !isDeleted
            })

            // 然后规范化保留节点的uuid字段
            workflow.nodes.forEach(node => {
              // 确保节点有 uuid 字段（用于Vuex store查找）
              if (!node.uuid && (node.nodeUuid || node.node_uuid)) {
                node.uuid = node.nodeUuid || node.node_uuid
              }
              // 确保节点有 nodeUuid 字段（与后端保持一致）
              if (!node.nodeUuid && (node.uuid || node.node_uuid)) {
                node.nodeUuid = node.uuid || node.node_uuid
              }
            })
          }
          return workflow
        })

        commit('APPEND_WORKFLOWS', { workflows: cleanedWorkflows, isMine: true })

        // 如果是第一次加载且activeUuid为空，自动选中第一个
        if (cleanedWorkflows.length > 0 && !rootState.ai.workflow.activeUuid) {
          commit('SET_ACTIVE', cleanedWorkflows[0].workflowUuid)
        }
      }
    } catch (error) {
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
        // ✅ 必须对返回的数据进行清理和规范化（与loadMyWorkflows保持一致）
        const cleanedWorkflows = response.data.records.map(workflow => {
          // 规范化节点中的uuid字段，并过滤已删除节点
          if (workflow.nodes && Array.isArray(workflow.nodes)) {
            // 先过滤掉 is_deleted = 1 的节点
            workflow.nodes = workflow.nodes.filter(node => {
              const isDeleted = node.isDeleted !== undefined ? node.isDeleted : node.is_deleted
              return !isDeleted
            })

            // 然后规范化保留节点的uuid字段
            workflow.nodes.forEach(node => {
              // 确保节点有 uuid 字段（用于Vuex store查找）
              if (!node.uuid && (node.nodeUuid || node.node_uuid)) {
                node.uuid = node.nodeUuid || node.node_uuid
              }
              // 确保节点有 nodeUuid 字段（与后端保持一致）
              if (!node.nodeUuid && (node.uuid || node.node_uuid)) {
                node.nodeUuid = node.uuid || node.node_uuid
              }
            })
          }
          return workflow
        })

        commit('APPEND_WORKFLOWS', { workflows: cleanedWorkflows, isMine: false })
      }
    } catch (error) {
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
      throw error
    } finally {
      commit('SET_SUBMITTING', false)
    }
  },

  /**
   * 关闭工作流并重新加载列表
   * 防止编辑未保存的数据污染列表，确保下次打开时显示最新的数据库数据
   */
  async closeWorkflow ({ commit, dispatch }) {
    // 清除激活状态
    commit('SET_ACTIVE', '')

    // 重新加载列表数据，确保列表中的数据是最新的、未污染的
    try {
      // 关键：清空列表，确保下面的重新加载会替换而不是追加
      commit('CLEAR_WORKFLOWS')

      // 同时刷新"我的工作流"和"公开工作流"列表
      await Promise.all([
        dispatch('loadMyWorkflows', { page: 1, pageSize: 20 }),
        dispatch('loadPublicWorkflows', { page: 1, pageSize: 20 })
      ])
    } catch (error) {
      // 不抛出错误，防止关闭流程被中断
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
 * Vue 2: 使用对象属性访问代替 Map.get()
 */
function deleteUiNode (state, wfUuid, nodeUuid) {
  const uiWorkflow = state.wfUuidToUIWorkflow[wfUuid]
  if (!uiWorkflow) return

  const idx = uiWorkflow.nodes.findIndex(node => node.id === nodeUuid)
  if (idx > -1) {
    uiWorkflow.nodes.splice(idx, 1)
  }
}

/**
 * 删除UI边
 * Vue 2: 使用对象属性访问代替 Map.get()
 */
function deleteUiEdge (state, wfUuid, edgeId) {
  const uiWorkflow = state.wfUuidToUIWorkflow[wfUuid]
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
