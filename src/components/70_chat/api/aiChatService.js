/**
 * SCM AI聊天服务
 * 提供与AI助手的交互接口
 */

import request from '@/utils/request'

class AIChatService {
  constructor () {
    this.sessionTimeout = 30 * 60 * 1000 // 30分钟会话超时
    this.activeSessions = new Map() // 活跃会话管理
  }

  /**
   * 发送消息给AI助手
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
          chatModelId
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
      console.error('AI聊天请求失败:', error)
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
          organizationId
        }
      })
      return response.data
    } catch (error) {
      console.error('添加对话失败:', error)
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
      console.error('获取对话列表失败:', error)
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
      console.error('删除对话失败:', error)
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

      return response.data || []
    } catch (error) {
      console.error('获取对话详情失败:', error)
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
      console.error('更新对话标题失败:', error)
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
   * 生成对话ID
   */
  generateConversationId () {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 记录用户行为
   * @param {string} action - 行为类型
   * @param {Object} data - 行为数据
   */
  trackUserAction (action, data = {}) {
    try {
      // 这里可以集成数据分析服务
      console.log('用户行为跟踪:', { action, data, timestamp: Date.now() })

      // 可以发送到分析服务
      // analytics.track(action, data)
    } catch (error) {
      console.error('用户行为跟踪失败:', error)
    }
  }
}

// 创建单例实例
const aiChatService = new AIChatService()

export default aiChatService
export { AIChatService }
