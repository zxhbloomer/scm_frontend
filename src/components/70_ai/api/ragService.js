/**
 * SCM AI知识库RAG服务
 * 提供知识库问答和RAG检索接口
 */

import request from '@/utils/request'
import { getTenantId } from '@/utils/tenant'

class RAGService {
  constructor () {
    this.sessionTimeout = 30 * 60 * 1000 // 30分钟会话超时
  }

  /**
   * 创建知识库问答记录
   * @param {string} kbUuid 知识库UUID
   * @param {Object} data 问答数据
   * @param {string} data.question 用户问题
   * @param {string} data.aiModelId AI模型ID
   * @returns {Promise}
   */
  addQaRecord (kbUuid, data) {
    return request({
      url: `/api/v1/ai/knowledge-base/qa/add/${kbUuid}`,
      method: 'post',
      data
    })
  }

  /**
   * SSE流式问答
   * @param {Object} params 请求参数
   * @param {string} params.qaRecordUuid 问答记录UUID
   * @param {AbortSignal} params.signal 中止信号
   * @param {number} params.maxResults 最大检索结果数（可选，默认3）
   * @param {number} params.minScore 最小相似度分数（可选，默认0.3）
   * @param {Object} callbacks 回调函数
   * @param {Function} callbacks.onStart 开始回调
   * @param {Function} callbacks.onContent 内容片段回调
   * @param {Function} callbacks.onComplete 完成回调
   * @param {Function} callbacks.onError 错误回调
   */
  async sseAsk (params, callbacks = {}) {
    const {
      qaRecordUuid,
      signal,
      maxResults,
      minScore
    } = params

    const {
      onStart = () => {},
      onContent = () => {},
      onComplete = () => {},
      onError = () => {}
    } = callbacks

    try {
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

      // 构建请求头
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }

      const tenantId = getTenantId()
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        signal
      })

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`)
      }

      onStart()

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          onComplete('')
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // ✅ 关键修复：使用双换行符切分SSE消息（与aiChatService.js对齐）
        const messages = buffer.split('\n\n')
        buffer = messages.pop() || '' // 保留最后一个不完整的消息

        for (const message of messages) {
          if (message.trim() === '') continue

          // 解析SSE格式的data行
          if (message.startsWith('data:')) {
            const data = message.slice(5).trim() // 移除 "data:" 前缀

            if (data === '[DONE]') {
              onComplete('')
              return
            }
            if (data) {
              try {
                // 解析Spring AI标准的ChatResponseVo格式
                const json = JSON.parse(data)

                // 提取：json.results[0].output.content
                if (json.results && json.results.length > 0) {
                  const generation = json.results[0]
                  const content = generation.output?.content || ''

                  if (content && content.trim().length > 0) {
                    onContent(content)
                  }
                }
              } catch (e) {
                // JSON解析失败时不传递原始数据，避免显示"{...}"
                console.warn('[RAG SSE] JSON解析失败:', e.message)
              }
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('RAG SSE error:', error)
        onError(error.message || '请求失败')
      }
    }
  }

  /**
   * 搜索问答记录
   * @param {string} kbUuid 知识库UUID
   * @param {string} keyword 搜索关键词（可选）
   * @param {number} currentPage 当前页码（从1开始）
   * @param {number} pageSize 每页数量
   * @returns {Promise}
   */
  searchQaRecords (kbUuid, keyword = '', currentPage = 1, pageSize = 20) {
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
  deleteQaRecord (uuid) {
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
  getEmbeddingRef (uuid) {
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
  getGraphRef (uuid) {
    return request({
      url: `/api/v1/ai/knowledge-base/qa/graph-ref/${uuid}`,
      method: 'get'
    })
  }

  /**
   * 清空当前用户的所有问答记录
   * @returns {Promise}
   */
  clearAllQaRecords () {
    return request({
      url: '/api/v1/ai/knowledge-base/qa/clear',
      method: 'post'
    })
  }
}

export default new RAGService()
