/**
 * SCM AI聊天服务
 * 提供与AI助手的交互接口
 */

import request from '@/utils/request'
import { getTenantId } from '@/utils/tenant'

class AIChatService {
  constructor () {
    this.sessionTimeout = 30 * 60 * 1000 // 30分钟会话超时
    this.activeSessions = new Map() // 活跃会话管理
  }

  /**
   * 流式发送消息给AI助手 (Spring AI标准格式)
   * @param {Object} params - 请求参数
   * @param {string} params.conversationId - 对话ID
   * @param {string} params.prompt - 用户消息
   * @param {string} params.chatModelId - AI模型ID
   * @param {Object} callbacks - 回调函数
   * @param {Function} callbacks.onStart - 开始回调
   * @param {Function} callbacks.onContent - 内容片段回调
   * @param {Function} callbacks.onComplete - 完成回调
   * @param {Function} callbacks.onError - 错误回调
   * @returns {Function} 取消函数
   */
  sendMessageStream ({ conversationId, prompt, chatModelId = 'default' }, callbacks = {}) {
    const {
      onStart = () => {},
      onContent = () => {},
      onComplete = () => {},
      onError = () => {}
    } = callbacks

    let cancelled = false
    const controller = new AbortController()
    let hasStarted = false
    let accumulatedContent = '' // 本地累积buffer，用于在onComplete时传递完整内容

    const connectSSE = async () => {
      try {
        // 使用fetch进行SSE请求（axios不支持真正的流式处理）
        const baseURL = import.meta.env.VITE_BASE_API
        const url = `${baseURL}/api/v1/ai/conversation/chat/stream`

        // 构建请求头
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }

        // 添加租户ID（使用统一方法）
        const tenantId = getTenantId()
        if (tenantId) {
          headers['X-Tenant-ID'] = tenantId
        }

        // 添加 wms-Token，从cookies中获取
        const wmsToken = document.cookie.split(';')
          .find(row => row.trim().startsWith('wms-Token='))
        if (wmsToken) {
          headers['wms-Token'] = wmsToken.split('=')[1]
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            conversationId,
            prompt,
            chatModelId
          }),
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        let done = false
        // eslint-disable-next-line no-unmodified-loop-condition
        while (!done && !cancelled) {
          const result = await reader.read()
          done = result.done
          const value = result.value
          if (done) break

          const chunk = decoder.decode(value, { stream: true })

          buffer += chunk

          // 处理SSE消息格式: data: JSON\n\n
          const messages = buffer.split('\n\n')
          buffer = messages.pop() || '' // 保留最后一个不完整的消息

          for (const message of messages) {
            if (message.trim() === '') continue

            // 解析SSE格式的data行 - 修复多行JSON问题
            if (message.startsWith('data:')) {
              const jsonData = message.slice(5) // 移除 "data:" 前缀

              if (jsonData.trim() === '') {
                continue
              }

              try {
                // 解析ChatResponse JSON对象
                const chatResponse = JSON.parse(jsonData)

                if (chatResponse.results && chatResponse.results.length > 0) {
                  const generation = chatResponse.results[0]
                  let content = generation.output?.content || ''

                  // 尝试解析content，因为工作流输出是JSON格式 {"output":{"type":1,"value":"实际文本"}}
                  try {
                    const contentObj = JSON.parse(content)
                    if (contentObj.output && contentObj.output.value) {
                      content = contentObj.output.value
                    }
                  } catch (e) {
                    // 如果content不是JSON，直接使用原始内容
                  }

                  // 第一次收到数据时触发start事件
                  if (!hasStarted) {
                    hasStarted = true
                    onStart()
                  }

                  // 检查是否为完成事件（有finishReason或isComplete标志)
                  if ((generation.metadata && generation.metadata.finishReason === 'stop') || chatResponse.isComplete === true) {
                    // 完成事件 - 优先使用done事件的content(后端确定的完整内容),
                    // 如果done事件没有content则使用前端累积的内容
                    const finalContent = (content && content.trim().length > 0) ? content : accumulatedContent

                    // 传递完整的chatResponse对象,包含workflowRuntime等信息
                    onComplete(finalContent, chatResponse)
                    return
                  } else {
                    // 流式进行中的内容块

                    // 处理增量内容：Spring AI可能发送空内容块或完整累积内容
                    // 只有当内容不为空且包含有效字符时才触发回调
                    if (content !== undefined && content !== null && content.trim().length > 0) {
                      accumulatedContent += content // 累积到本地buffer
                      onContent(content)
                    }
                  }
                }
              } catch (parseError) {
                // 继续处理其他消息，不中断流
                console.error('❌ 解析SSE消息失败:', parseError)
              }
            }
          }
        }

        // 流结束处理
        if (!cancelled) {
          if (!hasStarted) {
            onComplete(accumulatedContent)
          }
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          onError(error)
        }
      }
    }

    // 开始连接
    connectSSE()

    // 更新会话状态
    this.updateSessionActivity(conversationId)

    // 返回取消函数
    return () => {
      cancelled = true
      controller.abort()
    }
  }

  /**
   * 流式发送消息给AI助手 (SSE兼容版本)
   * @deprecated 使用sendMessageStream的Spring AI标准版本
   */
  sendMessageStreamSSE ({ conversationId, prompt, chatModelId = 'default' }, callbacks = {}) {
    const {
      onStart = () => {},
      onContent = () => {},
      onComplete = () => {},
      onError = () => {}
    } = callbacks

    let cancelled = false
    const controller = new AbortController()

    const connectSSE = async () => {
      try {
        // 使用旧的SSE接口
        const baseURL = import.meta.env.VITE_BASE_API
        const url = `${baseURL}/api/v1/ai/conversation/chat/stream/sse`

        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }

        // 添加租户ID（使用统一方法）
        const tenantId = getTenantId()
        if (tenantId) {
          headers['X-Tenant-ID'] = tenantId
        }

        const wmsToken = document.cookie.split(';')
          .find(row => row.trim().startsWith('wms-Token='))
        if (wmsToken) {
          headers['wms-Token'] = wmsToken.split('=')[1]
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            conversationId,
            prompt,
            chatModelId,
            tenantId // 使用统一的租户ID
          }),
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        let done = false
        // eslint-disable-next-line no-unmodified-loop-condition
        while (!done && !cancelled) {
          const result = await reader.read()
          done = result.done
          const value = result.value
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          const messages = buffer.split('\n\n')
          buffer = messages.pop() || ''

          for (const message of messages) {
            if (message.trim() === '') continue

            let eventType = null
            let eventData = ''

            const lines = message.split('\n')
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.slice(6).trim()
              } else if (line.startsWith('data:')) {
                eventData = line.slice(5)
              }
            }

            switch (eventType) {
              case 'start':
                onStart()
                break
              case 'content':
                if (eventData && eventData.trim() !== '') {
                  onContent(eventData)
                }
                break
              case 'complete':
                onComplete(eventData)
                return
              case 'error':
                onError(new Error(eventData))
                return
            }
          }
        }

        if (!cancelled) {
          onComplete(buffer)
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          onError(error)
        }
      }
    }

    connectSSE()
    this.updateSessionActivity(conversationId)

    return () => {
      cancelled = true
      controller.abort()
    }
  }

  /**
   * 发送消息给AI助手 (原有的同步方法，保持兼容)
   * @param {Object} params - 请求参数
   * @param {string} params.conversationId - 对话ID
   * @param {string} params.prompt - 用户消息
   * @param {string} params.chatModelId - AI模型ID
   * @returns {Promise} AI回复
   */
  async sendMessage ({ conversationId, prompt, chatModelId = 'default' }) {
    try {
      const response = await request({
        url: '/api/v1/ai/conversation/chat',
        method: 'post',
        data: {
          conversationId,
          prompt,
          chatModelId,
          tenantId: getTenantId() // 使用统一的租户ID方法
        }
      })

      // 更新会话状态
      this.updateSessionActivity(conversationId)

      // 检查响应数据是否存在
      if (response !== undefined && response !== null) {
        // SCM的request.js已经处理了响应，直接返回了response.data
        // 如果response直接是字符串（AI聊天接口返回）
        if (typeof response === 'string') {
          return this.formatAIResponse({ content: response })
        } else if (typeof response === 'object') {
          // 如果有data属性
          if (response.data !== undefined) {
            return this.formatAIResponse(typeof response.data === 'string' ? { content: response.data } : response.data)
          } else if (response.content) {
            return this.formatAIResponse(response)
          } else {
            return this.formatAIResponse(response)
          }
        } else {
          throw new Error('AI服务返回数据格式不正确')
        }
      } else {
        throw new Error('AI服务返回数据为空')
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 添加新对话
   * @param {Object} params - 请求参数
   * @param {string} params.prompt - 用户消息
   * @param {string} params.chatModelId - AI模型ID
   * @param {string} params.conversationId - 对话ID
   * @param {string} params.organizationId - 组织ID
   * @returns {Promise} 新对话信息
   */
  async addConversation ({ prompt, chatModelId, conversationId, organizationId }) {
    try {
      const response = await request({
        url: '/api/v1/ai/conversation/add',
        method: 'post',
        data: {
          prompt,
          chatModelId,
          conversationId,
          organizationId,
          tenantId: getTenantId() // 使用统一的租户ID方法
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * 获取对话列表
   * @returns {Promise<Array>} 对话列表
   */
  async getConversationList () {
    try {
      const response = await request({
        url: '/api/v1/ai/conversation/list',
        method: 'get'
      })
      return response.data || []
    } catch (error) {
      return []
    }
  }

  /**
   * 删除对话
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 删除结果
   */
  async deleteConversation (conversationId) {
    try {
      const response = await request({
        url: `/api/v1/ai/conversation/delete/${conversationId}`,
        method: 'delete'
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * 获取对话详情
   * @param {string} conversationId - 对话ID
   * @returns {Promise<Array>} 对话内容列表
   */
  async getAiChatDetail (conversationId) {
    try {
      const response = await request({
        url: `/api/v1/ai/conversation/chat/list/${conversationId}`,
        method: 'get'
      })

      // SCM的request.js已经处理了响应，直接返回了response.data
      // 所以这里的response就是实际的数据
      let result = []

      if (Array.isArray(response)) {
        // 如果response直接是数组（最常见情况）
        result = response
      } else if (response && response.data && Array.isArray(response.data)) {
        // 如果有data属性且是数组
        result = response.data
      } else if (response && typeof response === 'object') {
        // 如果response是对象，尝试找到数组数据
        const keys = Object.keys(response)
        // 尝试找到第一个数组属性
        for (const key of keys) {
          if (Array.isArray(response[key])) {
            result = response[key]
            break
          }
        }
      }

      return result || []
    } catch (error) {
      return []
    }
  }

  /**
   * 更新对话标题
   * @param {Object} params - 请求参数
   * @param {string} params.id - 对话ID
   * @param {string} params.title - 新标题
   * @returns {Promise} 更新结果
   */
  async updateAiChatTitle ({ id, title }) {
    try {
      const response = await request({
        url: '/api/v1/ai/conversation/update',
        method: 'post',
        data: { id, title }
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * 格式化AI回复
   * @private
   */
  formatAIResponse (data) {
    return {
      content: data.content || '抱歉，我无法理解您的问题。',
      steps: data.steps || null,
      actions: data.actions || null,
      confidence: data.confidence || 0.8,
      suggestions: data.suggestions || [],
      relatedQuestions: data.relatedQuestions || [],
      timestamp: Date.now()
    }
  }

  /**
   * 创建错误回复
   * @private
   */
  createErrorResponse (error) {
    const errorMessages = {
      'network': '网络连接异常，请检查您的网络设置。',
      'timeout': '请求超时，请稍后再试。',
      'server': '服务器暂时不可用，请稍后再试。',
      'auth': '身份验证失败，请重新登录。'
    }

    let errorType = 'server'
    if (error.code === 'NETWORK_ERROR') errorType = 'network'
    if (error.code === 'TIMEOUT') errorType = 'timeout'
    if (error.status === 401) errorType = 'auth'

    return {
      content: errorMessages[errorType] || '抱歉，出现了一些技术问题，请稍后再试。',
      isError: true,
      errorType,
      actions: [
        { text: '重试', action: 'retry' },
        { text: '联系客服', action: 'contact_support' }
      ],
      timestamp: Date.now()
    }
  }

  /**
   * 更新会话活跃状态
   * @private
   */
  updateSessionActivity (conversationId) {
    this.activeSessions.set(conversationId, Date.now())

    // 清理过期会话
    this.cleanupExpiredSessions()
  }

  /**
   * 清理过期会话
   * @private
   */
  cleanupExpiredSessions () {
    const now = Date.now()
    for (const [conversationId, lastActivity] of this.activeSessions.entries()) {
      if (now - lastActivity > this.sessionTimeout) {
        this.activeSessions.delete(conversationId)
      }
    }
  }

  /**
   * 清空对话内容
   * @param {string} conversationId - 对话ID
   * @returns {Promise} 清空结果
   */
  async clearConversationContent (conversationId) {
    try {
      const response = await request({
        url: `/api/v1/ai/conversation/clear/${conversationId}`,
        method: 'post'
      })

      return response.data
    } catch (error) {
      throw new Error(error.message || '清空对话内容失败')
    }
  }

  /**
   * 记录用户行为
   * @param {string} action - 行为类型
   * @param {Object} data - 行为数据
   */
  trackUserAction (action, data = {}) {
    try {
      // 这里可以集成数据分析服务

      // 可以发送到分析服务
      // analytics.track(action, data)
    } catch (error) {
      // 用户行为跟踪失败
    }
  }

  /**
   * 获取AI Chat工作流运行时详情
   * @param {String} runtimeUuid - AI Chat工作流运行时UUID
   * @returns {Promise<Object>} 运行时详情对象
   */
  async getConversationRuntimeDetail (runtimeUuid) {
    try {
      const response = await request({
        url: `/api/v1/ai/conversation/workflow/runtime/${runtimeUuid}`,
        method: 'get'
      })

      // 后端使用ResponseEntity.ok()直接返回对象,不包装在{code,data}中
      // 所以response本身就是数据,不需要.data
      const data = response.data !== undefined ? response.data : response
      return data || {}
    } catch (error) {
      console.error('获取工作流运行时详情失败:', error)
      throw new Error(error.message || '获取工作流运行时详情失败')
    }
  }

  /**
   * 获取AI Chat工作流运行时节点详情
   * @param {String} runtimeUuid - AI Chat工作流运行时UUID
   * @returns {Promise<Array>} 节点详情列表
   */
  async getConversationRuntimeNodeDetails (runtimeUuid) {
    try {
      const response = await request({
        url: `/api/v1/ai/conversation/workflow/runtime/nodes/${runtimeUuid}`,
        method: 'get'
      })

      // 后端使用ResponseEntity.ok()直接返回List,不包装在{code,data}中
      // 所以response本身就是数组,不需要.data
      const data = response.data !== undefined ? response.data : response
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('获取工作流执行详情失败:', error)
      throw new Error(error.message || '获取工作流执行详情失败')
    }
  }

  /**
   * 删除AI Chat聊天消息记录
   * @param {String} messageId - 消息ID
   * @returns {Promise} 删除结果
   */
  async deleteConversationRuntime (messageId) {
    try {
      const response = await request({
        url: `/api/v1/ai/conversation/message/${messageId}`,
        method: 'delete'
      })

      return response.data !== undefined ? response.data : response
    } catch (error) {
      console.error('删除聊天消息失败:', error)
      throw new Error(error.message || '删除聊天消息失败')
    }
  }
}

// 创建单例实例
const aiChatService = new AIChatService()

export default aiChatService
export { AIChatService }
