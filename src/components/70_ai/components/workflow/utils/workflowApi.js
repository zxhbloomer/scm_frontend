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
  // 获取要删除的节点和边的UUID列表
  const deleteNodeUuids = workflow.deleteNodes || workflow.delete_nodes || []
  const deleteEdgeUuids = workflow.deleteEdges || workflow.delete_edges || []

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
    // 过滤掉已删除的节点
    nodes: (workflow.nodes || [])
      .filter(node => {
        const nodeUuid = node.uuid || node.nodeUuid || node.node_uuid
        return !deleteNodeUuids.includes(nodeUuid)
      })
      .map(node => ({
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
    // 过滤掉已删除的边
    edges: (workflow.edges || [])
      .filter(edge => {
        const edgeUuid = edge.uuid || edge.edgeUuid || edge.edge_uuid
        return !deleteEdgeUuids.includes(edgeUuid)
      })
      .map(edge => ({
        id: edge.id,
        uuid: edge.uuid || edge.edgeUuid || edge.edge_uuid,
        workflowId: edge.workflowId || edge.workflow_id,
        sourceNodeUuid: edge.sourceNodeUuid || edge.source_node_uuid,
        targetNodeUuid: edge.targetNodeUuid || edge.target_node_uuid,
        sourceHandle: edge.sourceHandle || edge.source_handle
      }))
  }

  // 添加删除列表（如果存在）
  if (deleteNodeUuids.length > 0) {
    cleaned.deleteNodes = deleteNodeUuids
  }
  if (deleteEdgeUuids.length > 0) {
    cleaned.deleteEdges = deleteEdgeUuids
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
 * 发布工作流
 */
export function workflowPublish (uuid) {
  return request({
    url: `/api/v1/ai/workflow/publish/${uuid}`,
    method: 'post'
  })
}

/**
 * 取消发布工作流(停用)
 */
export function workflowUnpublish (uuid) {
  return request({
    url: `/api/v1/ai/workflow/unpublish/${uuid}`,
    method: 'post'
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
 * 对齐Spring AI Alibaba：无event名，通过data.type区分消息类型
 *
 * 消息类型（data.type）：
 * - runtime: 工作流运行时初始化数据
 * - chunk: LLM流式输出块
 * - output: 节点完整输出
 * - interrupt: 人机交互中断
 *
 * @param {object} params
 * @param {string} params.uuid 工作流UUID
 * @param {Array} params.inputs 用户输入数组 [{ name: string, content: { value: string, type: number } }]
 * @param {AbortSignal} params.signal 中止信号
 * @param {function} params.onMessage 消息回调 (data: object) - 解析后的JSON对象
 * @param {function} params.onComplete 完成回调 - Flux流结束时调用
 * @param {function} params.onError 错误回调 (error: string)
 */
export function workflowRun (params) {
  const {
    uuid,
    inputs,
    signal,
    onMessage,
    onComplete,
    onError
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
        // SSE连接建立成功
        return
      } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        const errorText = await response.text()
        if (onError) onError(errorText || `HTTP Error ${response.status}`)
        throw new FatalError()
      } else {
        throw new RetriableError()
      }
    },
    onmessage (msg) {
      // 对齐Spring AI Alibaba：无event名，所有消息都是data
      // 检查空值和空字符串
      if (!msg.data || msg.data.trim() === '') return

      try {
        const data = JSON.parse(msg.data)

        // 统一调用onMessage，由调用方根据data.type处理
        if (onMessage) onMessage(data)
      } catch (e) {
        console.error('[workflowRun] 解析SSE数据失败:', e, msg.data)
      }
    },
    onclose () {
      if (onComplete) onComplete()
    },
    onerror (err) {
      // 对于工作流场景，不应该自动重试（每次重试都会创建新runtime）
      // 必须抛出所有错误，阻止fetch-event-source的自动重试机制
      if (onError) onError(err.message || '工作流运行失败')
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
