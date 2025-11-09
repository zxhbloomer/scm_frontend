/**
 * Workflow API 服务
 */

import request from '@/utils/request'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import store from '@/store'

/**
 * 清理工作流数据，移除重复字段，统一使用 camelCase 与后端 AiWorkflowVo 对齐
 * @param {object} workflow - 工作流数据
 * @returns {object} - 清理后的数据
 */
function cleanWorkflowData (workflow) {
  const cleaned = {
    id: workflow.id,
    workflowUuid: workflow.workflowUuid || workflow.wf_uuid || workflow.uuid,
    title: workflow.title,
    remark: workflow.remark,
    isPublic: workflow.isPublic !== undefined ? workflow.isPublic : workflow.is_public,
    isEnable: workflow.isEnable !== undefined ? workflow.isEnable : workflow.is_enable,
    userId: workflow.userId || workflow.user_id,
    userUuid: workflow.userUuid || workflow.user_uuid,
    userName: workflow.userName || workflow.user_name,
    cTime: workflow.cTime || workflow.c_time || workflow.CTime,
    uTime: workflow.uTime || workflow.u_time || workflow.UTime,
    nodes: (workflow.nodes || []).map(node => ({
      id: node.id,
      uuid: node.uuid || node.nodeUuid || node.node_uuid,
      workflowId: node.workflowId || node.workflow_id,
      workflowComponentId: node.workflowComponentId || node.workflow_component_id,
      // 只有 title，没有 name
      title: node.title,
      remark: node.remark,
      inputConfig: node.inputConfig || node.input_config,
      nodeConfig: node.nodeConfig || node.node_config,
      // 修复：使用 !== undefined 检查，避免 0 被当作 falsy 值
      positionX: node.positionX !== undefined ? node.positionX : (node.position_x !== undefined ? node.position_x : 0),
      positionY: node.positionY !== undefined ? node.positionY : (node.position_y !== undefined ? node.position_y : 0)
    })),
    edges: (workflow.edges || []).map(edge => ({
      id: edge.id,
      uuid: edge.uuid || edge.edgeUuid || edge.edge_uuid,
      workflowId: edge.workflowId || edge.workflow_id,
      sourceNodeUuid: edge.sourceNodeUuid || edge.source_node_uuid,
      targetNodeUuid: edge.targetNodeUuid || edge.target_node_uuid,
      sourceHandle: edge.sourceHandle || edge.source_handle
    }))
  }

  // 添加删除列表（如果存在）
  if (workflow.deleteNodes || workflow.delete_nodes) {
    cleaned.deleteNodes = workflow.deleteNodes || workflow.delete_nodes
  }
  if (workflow.deleteEdges || workflow.delete_edges) {
    cleaned.deleteEdges = workflow.deleteEdges || workflow.delete_edges
  }

  return cleaned
}

/**
 * 新增工作流
 * @param {object} data { title: string, remark: string, isPublic: boolean }
 * @returns {Promise}
 */
export function workflowAdd (data) {
  return request({
    url: '/api/v1/ai/workflow/add',
    method: 'post',
    data
  })
}

/**
 * 复制工作流
 * @param {string} uuid 工作流UUID
 * @returns {Promise}
 */
export function workflowCopy (uuid) {
  return request({
    url: `/api/v1/ai/workflow/copy/${uuid}`,
    method: 'post'
  })
}

/**
 * 更新工作流完整信息（包括节点和边）
 * @param {object} data WorkflowInfo对象
 * @returns {Promise}
 */
export function workflowUpdate (data) {
  // 清理重复字段，统一使用 camelCase
  const cleanedData = cleanWorkflowData(data)

  return request({
    url: '/api/v1/ai/workflow/update',
    method: 'post',
    data: cleanedData
  })
}

/**
 * 删除工作流
 * @param {string} uuid 工作流UUID
 * @returns {Promise}
 */
export function workflowDel (uuid) {
  return request({
    url: `/api/v1/ai/workflow/del/${uuid}`,
    method: 'post'
  })
}

/**
 * 设置工作流公开状态
 * @param {string} uuid 工作流UUID
 * @param {boolean} isPublic 是否公开
 * @returns {Promise}
 */
export function workflowSetPublic (uuid, isPublic) {
  return request({
    url: `/api/v1/ai/workflow/set-public/${uuid}`,
    method: 'post',
    params: {
      isPublic
    }
  })
}

/**
 * 更新工作流基本信息（不包括节点和边）
 * @param {object} data { uuid: string, title: string, remark: string, isPublic: boolean, dbversion: number }
 * @returns {Promise}
 */
export function workflowBaseInfoUpdate (data) {
  return request({
    url: '/api/v1/ai/workflow/base-info/update',
    method: 'post',
    data
  })
}

/**
 * 运行工作流（SSE流式）
 * @param {object} params
 * @param {string} params.uuid 工作流UUID
 * @param {Array} params.inputs 用户输入数组 [{ name: string, content: { value: string, type: number } }]
 * @param {AbortSignal} params.signal 中止信号
 * @param {function} params.startCallback 开始回调
 * @param {function} params.messageReceived 消息接收回调 (chunk: string, eventName: string)
 * @param {function} params.doneCallback 完成回调
 * @param {function} params.errorCallback 错误回调
 */
export function workflowRun (params) {
  const {
    uuid,
    inputs,
    signal,
    startCallback,
    messageReceived,
    doneCallback,
    errorCallback
  } = params

  const url = `${import.meta.env.VITE_BASE_API}/api/v1/ai/workflow/run/${uuid}`

  class RetriableError extends Error {}
  class FatalError extends Error {}

  fetchEventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': store.getters.tenantId || ''
    },
    body: JSON.stringify({ inputs }),
    credentials: 'include',
    signal,
    openWhenHidden: true, // 防止页面切换时自动重连导致重复触发回调
    async onopen (response) {
      if (response.ok) {
        // SSE连接建立成功，等待后端发送start事件
        return
      } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        const errorText = await response.text()
        if (errorCallback) errorCallback(errorText || `HTTP Error ${response.status}`)
        throw new FatalError()
      } else {
        throw new RetriableError()
      }
    },
    onmessage (msg) {
      // 特殊处理START事件
      if (msg.event === 'start') {
        if (startCallback) startCallback(msg.data)
        return
      }

      // 处理其他事件（NODE_RUN, NODE_CHUNK, NODE_OUTPUT等）
      if (msg.event) {
        if (messageReceived) messageReceived(msg.data || '', msg.event)
      } else if (msg.data) {
        if (messageReceived) messageReceived(msg.data, '')
      }
    },
    onclose () {
      if (doneCallback) doneCallback()
    },
    onerror (err) {
      // 对于工作流场景，不应该自动重试（每次重试都会创建新runtime）
      // 必须抛出所有错误，阻止fetch-event-source的自动重试机制
      if (errorCallback) errorCallback(err.message || '工作流运行失败')
      throw err
    }
  })
}

/**
 * 恢复工作流运行（从人工反馈后继续）
 * @param {string} runtimeUuid 运行时UUID
 * @param {object} data { feedbackOutput: object }
 * @returns {Promise}
 */
export function workflowRuntimeResume (runtimeUuid, data) {
  return request({
    url: `/api/v1/ai/workflow/runtime/resume/${runtimeUuid}`,
    method: 'post',
    data
  })
}

/**
 * 获取工作流组件列表（节点类型定义）
 * @returns {Promise}
 */
export function workflowComponents () {
  return request({
    url: '/api/v1/ai/workflow/public/component/list',
    method: 'get'
  })
}

/**
 * 搜索我的工作流
 * @param {string} keyword 搜索关键词（可选）
 * @param {number} currentPage 当前页码（从1开始）
 * @param {number} pageSize 每页数量
 * @returns {Promise}
 */
export function workflowSearchMine (keyword, currentPage, pageSize) {
  return request({
    url: '/api/v1/ai/workflow/mine/search',
    method: 'get',
    params: {
      keyword,
      currentPage,
      pageSize
    }
  })
}

/**
 * 搜索公开工作流
 * @param {string} keyword 搜索关键词（可选）
 * @param {number} currentPage 当前页码（从1开始）
 * @param {number} pageSize 每页数量
 * @returns {Promise}
 */
export function workflowSearchPublic (keyword, currentPage, pageSize) {
  return request({
    url: '/api/v1/ai/workflow/public/search',
    method: 'get',
    params: {
      keyword,
      currentPage,
      pageSize
    }
  })
}

/**
 * 获取工作流运行时历史列表
 * @param {string} wfUuid 工作流UUID
 * @param {number} currentPage 当前页码（从1开始）
 * @param {number} pageSize 每页数量
 * @returns {Promise}
 */
export function workflowRuntimes (wfUuid, currentPage, pageSize) {
  return request({
    url: '/api/v1/ai/workflow/runtime/list',
    method: 'get',
    params: {
      wfUuid,
      currentPage,
      pageSize
    }
  })
}

/**
 * 获取运行时节点列表
 * @param {string} runtimeUuid 运行时UUID
 * @returns {Promise}
 */
export function workflowRuntimeNodes (runtimeUuid) {
  return request({
    url: `/api/v1/ai/workflow/runtime/${runtimeUuid}/nodes`,
    method: 'get'
  })
}

/**
 * 清空工作流的所有运行时历史
 * @param {string} wfUuid 工作流UUID
 * @returns {Promise}
 */
export function workflowRuntimesClear (wfUuid) {
  return request({
    url: `/api/v1/ai/workflow/runtime/clear/${wfUuid}`,
    method: 'post'
  })
}

/**
 * 获取运算符列表（用于分支节点条件判断）
 * @returns {Promise}
 */
export function workflowOperators () {
  return request({
    url: '/api/v1/ai/workflow/public/operators',
    method: 'get'
  })
}

/**
 * 删除单个运行时记录
 * @param {string} runtimeUuid 运行时UUID
 * @returns {Promise}
 */
export function workflowRuntimeDelete (runtimeUuid) {
  return request({
    url: `/api/v1/ai/workflow/runtime/del/${runtimeUuid}`,
    method: 'delete'
  })
}
