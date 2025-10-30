// AI工作流API服务
// 严格参照 AIDeepin index.ts 中的 Workflow API 实现 (lines 638-749)
import request from '@/utils/request'
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source'
import store from '@/store'

// API基础路径 - 对应SCM后端WorkflowController
const API_BASE = '/api/v1/ai/workflow'

/**
 * 添加工作流
 * 对应AIDeepin: workflowAdd(data: { title: string; remark: string; isPublic: boolean })
 * 对应后端: WorkflowController.add(@RequestBody AiWorkflowVo workflowVo)
 * @param {Object} data - 工作流数据
 * @param {string} data.title - 工作流标题
 * @param {string} data.remark - 工作流备注
 * @param {boolean} data.isPublic - 是否公开
 * @returns {Promise} - 添加结果
 */
export function workflowAdd (data) {
  return request({
    url: `${API_BASE}/add`,
    method: 'post',
    data: {
      title: data.title,
      remark: data.remark || '',
      is_public: data.isPublic !== undefined ? data.isPublic : false
    }
  })
}

/**
 * 更新工作流
 * 对应AIDeepin: workflowUpdate(data: { id: number; title: string; remark: string; isPublic: boolean })
 * 对应后端: WorkflowController.update(@RequestBody AiWorkflowVo workflowVo)
 * @param {Object} data - 工作流数据
 * @param {number} data.id - 工作流ID
 * @param {string} data.title - 工作流标题
 * @param {string} data.remark - 工作流备注
 * @param {boolean} data.isPublic - 是否公开
 * @returns {Promise} - 更新结果
 */
export function workflowUpdate (data) {
  return request({
    url: `${API_BASE}/update`,
    method: 'put',
    data: {
      id: data.id,
      title: data.title,
      remark: data.remark || '',
      is_public: data.isPublic !== undefined ? data.isPublic : false
    }
  })
}

/**
 * 删除工作流
 * 对应AIDeepin: workflowDel(id: number)
 * 对应后端: WorkflowController.delete(@PathVariable Long id)
 * @param {number} id - 工作流ID
 * @returns {Promise} - 删除结果
 */
export function workflowDel (id) {
  return request({
    url: `${API_BASE}/${id}`,
    method: 'delete'
  })
}

/**
 * 保存工作流完整数据(包括节点和边)
 * 对应AIDeepin: workflowSave(data: WorkflowSaveData)
 * 对应后端: WorkflowController.save(@RequestBody AiWorkflowVo workflowVo)
 * @param {Object} data - 工作流完整数据
 * @param {number} data.id - 工作流ID
 * @param {string} data.title - 工作流标题
 * @param {string} data.remark - 工作流备注
 * @param {Array} data.nodes - 节点数组
 * @param {Array} data.edges - 边数组
 * @returns {Promise} - 保存结果
 */
export function workflowSave (data) {
  return request({
    url: `${API_BASE}/save`,
    method: 'post',
    data: {
      id: data.id,
      title: data.title,
      remark: data.remark || '',
      nodes: data.nodes || [],
      edges: data.edges || []
    }
  })
}

/**
 * 获取工作流详情
 * 对应AIDeepin: workflowDetail(id: number)
 * 对应后端: WorkflowController.getDetail(@PathVariable Long id)
 * @param {number} id - 工作流ID
 * @returns {Promise} - 工作流详情数据
 */
export function workflowDetail (id) {
  return request({
    url: `${API_BASE}/${id}`,
    method: 'get'
  })
}

/**
 * 获取工作流列表(分页)
 * 对应AIDeepin: workflowList(currentPage: number, pageSize: number, isPublic: boolean)
 * 对应后端: WorkflowController.listByPage(@RequestParam int currentPage, @RequestParam int pageSize, @RequestParam(required=false) Boolean isPublic)
 * @param {Object} params - 查询参数
 * @param {number} params.currentPage - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @param {boolean} params.isPublic - 是否只查询公开工作流(可选)
 * @returns {Promise} - 工作流分页数据
 */
export function workflowList (params) {
  return request({
    url: `${API_BASE}/list`,
    method: 'post',
    data: {
      current_page: params.currentPage,
      page_size: params.pageSize,
      is_public: params.isPublic !== undefined ? params.isPublic : null
    }
  })
}

/**
 * 运行工作流 - SSE 流式版本
 * 严格参考 aideepin: workflowRun + commonSseProcess (index.ts line 95-165, 677-687)
 * 对应后端: WorkflowController.run(@PathVariable String wfUuid, @RequestBody List<JSONObject> inputs)
 *
 * @param {Object} params - 运行参数
 * @param {string} params.wfUuid - 工作流UUID
 * @param {Array} params.inputs - 用户输入数组 [{name: string, content: {value: any, type: number}}]
 * @param {AbortSignal} params.signal - 取消信号（可选）
 * @param {Function} params.startCallback - START 事件回调
 * @param {Function} params.messageReceived - 消息接收回调 (chunk, eventName)
 * @param {Function} params.doneCallback - DONE 事件回调
 * @param {Function} params.errorCallback - ERROR 事件回调
 * @returns {void} - 无返回值，通过回调处理事件
 */
export function workflowRun (params) {
  const {
    wfUuid,
    inputs = [],
    signal,
    startCallback,
    messageReceived,
    doneCallback,
    errorCallback
  } = params

  // 获取认证 token（参考 aideepin line 113）
  const token = store.getters.token || ''

  // 构造请求URL（包含路径参数，参考 aideepin line 686）
  // 注意：fetchEventSource 不会自动添加 baseURL，需要手动拼接
  const url = `${process.env.VUE_APP_BASE_API}${API_BASE}/run/${wfUuid}`

  // 使用 fetchEventSource 处理 SSE（参考 aideepin line 109-165）
  fetchEventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'X-Tenant-ID': localStorage.getItem('X-Tenant-ID') || 'scm_tenant_20250519_001'
    },
    signal,
    body: JSON.stringify(inputs),

    // 连接打开回调（参考 aideepin line 119-133）
    async onopen (response) {
      if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
        // SSE 连接成功
        return
      } else if (response.status === 401) {
        console.error('无登录权限')
        throw new Error('无登录权限')
      } else {
        console.error('SSE connection error:', response.status)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    },

    // 消息接收回调（参考 aideepin line 134-156）
    onmessage (eventMessage) {
      const eventName = eventMessage.event || ''
      const data = eventMessage.data || ''

      // 处理特殊事件
      if (eventName === '[START]' || eventName === 'start') {
        if (startCallback) {
          startCallback(data)
        }
      } else if (eventName === '[DONE]' || eventName === 'done') {
        if (doneCallback) {
          doneCallback(data)
        }
      } else if (eventName === '[ERROR]' || eventName === 'error') {
        if (errorCallback) {
          errorCallback(data)
        }
      } else {
        // 其他事件（节点事件：NODE_RUN, NODE_INPUT, NODE_OUTPUT, NODE_CHUNK）
        if (messageReceived) {
          messageReceived(data, eventName)
        }
      }
    },

    // 错误回调（参考 aideepin line 157-164）
    onerror (error) {
      console.error('[workflowRun] SSE error:', error)
      if (errorCallback) {
        errorCallback(error.message || '工作流执行失败')
      }
      // 抛出错误以关闭连接
      throw error
    }
  })
}

/**
 * 运行工作流 - SSE流式传输版本
 * 对应AIDeepin: workflowRun(params: WorkflowRunParams, onMessage: (message: string) => void)
 * 对应后端: WorkflowController.run(@RequestParam Long workflowId, @RequestParam String userInput, @RequestParam(required=false) Long runtimeId) - SSE endpoint
 *
 * @param {Object} params - 运行参数
 * @param {number} params.workflowId - 工作流ID
 * @param {string} params.userInput - 用户输入
 * @param {number} params.runtimeId - 运行时ID(用于恢复运行,可选)
 * @param {Function} onMessage - SSE消息回调函数
 * @param {Function} onError - SSE错误回调函数(可选)
 * @param {Function} onComplete - SSE完成回调函数(可选)
 * @returns {Object} - 包含close方法的对象，用于关闭SSE连接
 */
export function workflowRunSSE (params, onMessage, onError, onComplete) {
  const queryParams = new URLSearchParams({
    workflowId: params.workflowId,
    userInput: params.userInput
  })

  if (params.runtimeId) {
    queryParams.append('runtimeId', params.runtimeId)
  }

  const eventSource = new EventSource(
    `${API_BASE}/run?${queryParams.toString()}`,
    {
      withCredentials: true
    }
  )

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource.close()
      if (onComplete) {
        onComplete()
      }
      return
    }

    try {
      const data = JSON.parse(event.data)
      if (onMessage) {
        onMessage(data)
      }
    } catch (error) {
      console.error('解析SSE消息失败:', error)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE连接错误:', error)
    eventSource.close()
    if (onError) {
      onError(error)
    }
  }

  return {
    close: () => {
      eventSource.close()
    }
  }
}

/**
 * 获取工作流组件列表
 * 对应AIDeepin: getWorkflowComponents()
 * 对应后端: WorkflowController.listComponents()
 * @returns {Promise} - 组件列表
 */
export function getWorkflowComponents () {
  return request({
    url: `${API_BASE}/components`,
    method: 'get'
  })
}

/**
 * 复制工作流
 * 对应AIDeepin: copyWorkflow(id: number)
 * 对应后端: WorkflowController.copy(@PathVariable Long id)
 * @param {number} id - 工作流ID
 * @returns {Promise} - 复制结果
 */
export function copyWorkflow (id) {
  return request({
    url: `${API_BASE}/copy/${id}`,
    method: 'post'
  })
}

/**
 * 发布/取消发布工作流
 * 对应AIDeepin: toggleWorkflowPublic(id: number)
 * 对应后端: WorkflowController.togglePublic(@PathVariable Long id)
 * @param {number} id - 工作流ID
 * @returns {Promise} - 操作结果
 */
export function toggleWorkflowPublic (id) {
  return request({
    url: `${API_BASE}/toggle-public/${id}`,
    method: 'post'
  })
}

// ==================== 工作流运行时API ====================

/**
 * 获取工作流运行时列表(分页)
 * 对应AIDeepin: getWorkflowRuntimeList(workflowId: number, currentPage: number, pageSize: number)
 * 对应后端: WorkflowController.listRuntimeByPage(@RequestParam Long workflowId, @RequestParam int currentPage, @RequestParam int pageSize)
 * @param {Object} params - 查询参数
 * @param {number} params.workflowId - 工作流ID（必需，数字型）
 * @param {number} params.currentPage - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} - 运行时分页数据
 */
export function getWorkflowRuntimeList (params) {
  return request({
    url: `${API_BASE}/runtime/list`,
    method: 'post',
    params: {
      workflowId: params.workflowId,
      currentPage: params.currentPage,
      pageSize: params.pageSize
    }
  })
}

/**
 * 获取运行时节点详情列表
 * 对应AIDeepin: getRuntimeNodeDetails(runtimeId: number)
 * 对应后端: WorkflowController.listRuntimeNodes(@PathVariable Long runtimeId)
 * @param {number} runtimeId - 运行时ID
 * @returns {Promise} - 运行时节点列表
 */
export function getRuntimeNodeDetails (runtimeId) {
  return request({
    url: `${API_BASE}/runtime/nodes/${runtimeId}`,
    method: 'get'
  })
}

/**
 * 清空工作流运行时历史
 * 对应AIDeepin: clearWorkflowRuntimeHistory(workflowId: number)
 * 对应后端: WorkflowController.clearRuntimeHistory(@PathVariable Long workflowId)
 * @param {number} workflowId - 工作流ID
 * @returns {Promise} - 清空结果
 */
export function clearWorkflowRuntimeHistory (workflowId) {
  return request({
    url: `${API_BASE}/runtime/clear/${workflowId}`,
    method: 'post'
  })
}

/**
 * 删除工作流运行时记录
 * 对应AIDeepin: deleteWorkflowRuntime(runtimeId: number)
 * 对应后端: WorkflowController.deleteRuntime(@PathVariable Long runtimeId)
 * @param {number} runtimeId - 运行时ID
 * @returns {Promise} - 删除结果
 */
export function deleteWorkflowRuntime (runtimeId) {
  return request({
    url: `${API_BASE}/runtime/${runtimeId}`,
    method: 'delete'
  })
}

/**
 * 恢复工作流运行
 * 对应AIDeepin: resumeWorkflowRun(runtimeId: number, userInput: string)
 * 对应后端: WorkflowController.resumeRun(@PathVariable Long runtimeId, @RequestParam String userInput)
 * @param {Object} params - 恢复参数
 * @param {number} params.runtimeId - 运行时ID
 * @param {string} params.userInput - 用户输入
 * @returns {Promise} - 恢复结果
 */
export function resumeWorkflowRun (params) {
  return request({
    url: `${API_BASE}/runtime/resume/${params.runtimeId}`,
    method: 'post',
    data: {
      user_input: params.userInput
    }
  })
}

// ==================== 兼容性别名导出 ====================
// 为 WorkflowRuntimeList 组件提供兼容的函数名

/**
 * 搜索工作流运行时列表(别名)
 * 别名: workflowRuntimeSearch -> getWorkflowRuntimeList
 */
export const workflowRuntimeSearch = getWorkflowRuntimeList

/**
 * 删除工作流运行时(别名)
 * 别名: workflowRuntimeDelete -> deleteWorkflowRuntime
 */
export const workflowRuntimeDelete = deleteWorkflowRuntime

// 导出所有API函数
export default {
  // 工作流基础操作
  workflowAdd,
  workflowUpdate,
  workflowDel,
  workflowSave,
  workflowDetail,
  workflowList,
  workflowRun,
  workflowRunSSE,
  getWorkflowComponents,
  copyWorkflow,
  toggleWorkflowPublic,
  // 工作流运行时
  getWorkflowRuntimeList,
  getRuntimeNodeDetails,
  clearWorkflowRuntimeHistory,
  deleteWorkflowRuntime,
  resumeWorkflowRun,
  // 兼容性别名
  workflowRuntimeSearch,
  workflowRuntimeDelete
}
