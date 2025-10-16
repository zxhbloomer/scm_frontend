import request from '@/utils/request'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import store from '@/store'

/**
 * 创建知识库问答记录
 * @param {string} kbUuid 知识库UUID
 * @param {object} data 问答数据 { question: string, aiModelId: string }
 * @returns {Promise}
 */
export function addQaRecord (kbUuid, data) {
  return request({
    url: `/api/v1/ai/knowledge-base/qa/add/${kbUuid}`,
    method: 'post',
    data
  })
}

/**
 * SSE流式问答
 * @param {object} params
 * @param {string} params.qaRecordUuid 问答记录UUID
 * @param {AbortSignal} params.signal 中止信号
 * @param {function} params.startCallback 开始回调
 * @param {function} params.messageReceived 消息接收回调
 * @param {function} params.doneCallback 完成回调
 * @param {function} params.errorCallback 错误回调
 * @param {number} params.maxResults 最大检索结果数（可选，默认3）
 * @param {number} params.minScore 最小相似度分数（可选，默认0.3）
 */
export function sseAsk (params) {
  const {
    qaRecordUuid,
    signal,
    startCallback,
    messageReceived,
    doneCallback,
    errorCallback,
    maxResults,
    minScore
  } = params

  // 构建URL参数
  let url = `${process.env.VUE_APP_BASE_API}/api/v1/ai/knowledge-base/qa/process/${qaRecordUuid}`
  const urlParams = []
  if (maxResults !== undefined && maxResults !== null) {
    urlParams.push(`maxResults=${maxResults}`)
  }
  if (minScore !== undefined && minScore !== null) {
    urlParams.push(`minScore=${minScore}`)
  }
  if (urlParams.length > 0) {
    url += '?' + urlParams.join('&')
  }

  class RetriableError extends Error {}
  class FatalError extends Error {}

  fetchEventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': store.getters.tenantId || ''
    },
    credentials: 'include',
    signal,
    async onopen (response) {
      if (response.ok) {
        if (startCallback) startCallback()
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
      if (msg.event === 'message') {
        if (messageReceived) messageReceived(msg.data)
      }
    },
    onclose () {
      if (doneCallback) doneCallback('')
    },
    onerror (err) {
      if (err instanceof FatalError) {
        throw err
      } else {
        if (errorCallback) errorCallback(err.message || '请求失败')
      }
    }
  })
}

/**
 * 搜索问答记录
 * @param {string} kbUuid 知识库UUID
 * @param {string} keyword 搜索关键词（可选）
 * @param {number} currentPage 当前页码（从1开始）
 * @param {number} pageSize 每页数量
 * @returns {Promise}
 */
export function searchQaRecords (kbUuid, keyword, currentPage, pageSize) {
  return request({
    url: '/api/v1/ai/knowledge-base/qa/search',
    method: 'get',
    params: {
      kbUuid,
      keyword,
      currentPage,
      pageSize
    }
  })
}

/**
 * 删除问答记录
 * @param {string} uuid 问答记录UUID
 * @returns {Promise}
 */
export function deleteQaRecord (uuid) {
  return request({
    url: `/api/v1/ai/knowledge-base/qa/del/${uuid}`,
    method: 'post'
  })
}

/**
 * 查询问答的向量引用
 * @param {string} uuid 问答记录UUID
 * @returns {Promise}
 */
export function getEmbeddingRef (uuid) {
  return request({
    url: `/api/v1/ai/knowledge-base/qa/embedding-ref/${uuid}`,
    method: 'get'
  })
}

/**
 * 查询问答的图谱引用
 * @param {string} uuid 问答记录UUID
 * @returns {Promise}
 */
export function getGraphRef (uuid) {
  return request({
    url: `/api/v1/ai/knowledge-base/qa/graph-ref/${uuid}`,
    method: 'get'
  })
}

/**
 * 清空当前用户的所有问答记录
 * @returns {Promise}
 */
export function clearAllQaRecords () {
  return request({
    url: '/api/v1/ai/knowledge-base/qa/clear',
    method: 'post'
  })
}
