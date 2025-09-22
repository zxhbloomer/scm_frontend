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
      // 在正式环境中，始终尝试调用真实后端
      // 在开发环境中，可以通过配置决定是否使用mock
      const useMock = process.env.NODE_ENV === 'development' && process.env.VUE_APP_USE_MOCK_AI === 'true'

      if (useMock) {
        return await this.generateMockResponse(prompt, '')
      }

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

      return this.formatAIResponse(response.data)
    } catch (error) {
      console.error('AI聊天请求失败:', error)
      // 后端失败时使用模拟回复
      return await this.generateMockResponse(prompt, '')
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
   * 获取默认快捷问题
   * @private
   */
  getDefaultQuickQuestions () {
    return [
      '如何创建采购订单？',
      '库存不足怎么处理？',
      '如何设置供应商信息？',
      '出库流程是什么？',
      '如何查看库存报表？',
      '采购审批流程说明',
      '入库单如何创建？',
      '质检流程说明',
      '如何导出数据？',
      '系统操作权限说明'
    ]
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
   * 智能问题建议
   * @param {string} userInput - 用户输入
   * @returns {Array} 建议问题列表
   */
  getQuestionSuggestions (userInput) {
    const suggestions = []
    const input = userInput.toLowerCase()

    // 关键词匹配建议
    const keywordSuggestions = {
      '采购': [
        '如何创建采购订单？',
        '采购审批流程是什么？',
        '供应商管理在哪里？'
      ],
      '库存': [
        '库存不足怎么处理？',
        '如何查看库存报表？',
        '库存盘点怎么做？'
      ],
      '出库': [
        '出库流程是什么？',
        '如何打印出库单？',
        '出库审批权限设置'
      ],
      '入库': [
        '入库单如何创建？',
        '质检流程说明',
        '入库异常处理方法'
      ]
    }

    // 根据输入内容匹配关键词
    Object.entries(keywordSuggestions).forEach(([keyword, questions]) => {
      if (input.includes(keyword)) {
        suggestions.push(...questions)
      }
    })

    // 如果没有匹配到关键词，返回通用建议
    if (suggestions.length === 0) {
      suggestions.push(
        '请详细描述您的问题',
        '有什么可以帮助您的？',
        '您需要查看哪个模块的信息？'
      )
    }

    return [...new Set(suggestions)].slice(0, 3)
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

  /**
   * 生成模拟AI回复 (用于开发环境)
   * @param {string} message - 用户消息
   * @param {string} context - 上下文
   * @returns {Promise<Object>} AI回复
   * @private
   */
  async generateMockResponse (message, context) {
    // 模拟网络延迟
    await this.delay(1200)

    const responses = {
      '如何创建采购订单': {
        content: '创建采购订单很简单！按以下步骤操作：\\n\\n1. 进入\"采购管理\"模块\\n2. 点击\"采购订单\"菜单\\n3. 点击\"新建\"按钮\\n4. 选择供应商\\n5. 添加采购商品明细\\n6. 确认订单信息\\n7. 提交审批流程\\n\\n需要注意的是，采购订单一旦提交审批就无法直接修改，建议先保存草稿确认无误后再提交。',
        steps: [
          '正在分析您的问题...',
          '查询采购订单创建流程...',
          '整理操作步骤...'
        ],
        suggestions: ['查看采购订单列表', '了解审批流程', '供应商管理'],
        actions: [
          { text: '前往采购管理', action: 'navigate', target: '/purchase/order' }
        ]
      },
      '库存不足': {
        content: '库存不足的处理方法：\\n\\n1. **检查库存预警信息** - 确认具体缺货商品\\n2. **分析库存不足原因** - 是销售增长还是补货延迟\\n3. **确定补货需求量** - 根据销售预测计算\\n4. **选择补货方式** - 采购补货或库存调拨\\n5. **创建采购申请** - 填写采购需求\\n6. **跟踪补货进度** - 关注采购和入库状态\\n\\n系统会自动发送库存预警，确保及时处理。',
        steps: [
          '检索库存管理知识...',
          '分析补货策略...',
          '生成处理建议...'
        ],
        suggestions: ['查看库存报表', '创建采购申请', '库存调拨'],
        actions: [
          { text: '查看库存状态', action: 'navigate', target: '/inventory/stock' }
        ]
      },
      '出库': {
        content: '出库流程说明：\\n\\n1. **创建出库申请单** - 填写出库原因和商品明细\\n2. **提交部门主管审批** - 确保出库合规性\\n3. **仓库管理员确认库存** - 检查库存是否充足\\n4. **执行出库操作** - 更新库存数据\\n5. **打印出库单据** - 作为凭证保存\\n6. **通知相关人员** - 确保信息同步\\n\\n注意：出库后库存会自动更新，请确保操作准确。',
        steps: [
          '搜索出库流程文档...',
          '整理操作步骤...',
          '提供相关建议...'
        ],
        suggestions: ['查看出库记录', '库存管理', '审批流程'],
        actions: [
          { text: '前往出库管理', action: 'navigate', target: '/inventory/outbound' }
        ]
      }
    }

    // 查找匹配的回复
    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key) || key.includes(message.substring(0, 4))) {
        return this.formatAIResponse(response)
      }
    }

    // 默认回复
    const defaultResponse = {
      content: `您好！我是SCM智能助手，我收到了您的问题：\"${message}\"。\\n\\n作为SCM系统的智能助手，我可以帮您解答：\\n• 采购订单相关问题\\n• 库存管理操作指导\\n• 业务流程说明\\n• 系统功能介绍\\n\\n请告诉我您具体想了解什么，我会为您提供详细的解答。`,
      steps: [
        '理解您的问题...',
        '搜索相关知识...',
        '准备回复内容...'
      ],
      suggestions: ['如何创建采购订单', '库存不足怎么处理', '出库流程说明'],
      confidence: 0.8
    }

    return this.formatAIResponse(defaultResponse)
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise}
   * @private
   */
  delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建单例实例
const aiChatService = new AIChatService()

export default aiChatService
export { AIChatService }
