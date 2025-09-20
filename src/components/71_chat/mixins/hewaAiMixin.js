/**
 * HeWa AI聊天混入
 * 提供通用的AI聊天功能和状态管理
 */

import aiChatService from '../services/aiChatService'
import scmKnowledgeBase from '../services/scmKnowledgeBase'

export default {
  data () {
    return {
      // 聊天状态
      chatState: {
        isInitialized: false,
        isConnected: false,
        sessionId: null,
        messageHistory: [],
        unreadCount: 0,
        lastActivity: null
      },

      // AI助手配置
      aiConfig: {
        name: 'HeWa智能助手',
        version: '1.0.0',
        capabilities: [
          'business_guidance', // 业务指导
          'operation_help', // 操作帮助
          'knowledge_search', // 知识搜索
          'data_analysis', // 数据分析
          'smart_suggestions' // 智能建议
        ],
        maxHistoryLength: 100,
        responseTimeout: 30000
      },

      // 用户偏好设置
      userPreferences: {
        autoScroll: true,
        soundEnabled: false,
        compactMode: false,
        theme: 'default'
      }
    }
  },

  computed: {
    // 是否有活跃的聊天会话
    hasActiveSession () {
      return this.chatState.sessionId && this.chatState.isConnected
    },

    // 获取最后一条消息
    lastMessage () {
      const messages = this.chatState.messageHistory
      return messages.length > 0 ? messages[messages.length - 1] : null
    },

    // 是否正在等待回复
    isWaitingForResponse () {
      const lastMsg = this.lastMessage
      return lastMsg && lastMsg.type === 'user' && !this.hasSubsequentAIResponse(lastMsg)
    }
  },

  created () {
    this.initializeChat()
  },

  beforeDestroy () {
    this.cleanup()
  },

  methods: {
    /**
     * 初始化聊天功能
     */
    async initializeChat () {
      try {
        // 生成会话ID
        this.chatState.sessionId = aiChatService.generateSessionId()

        // 检查AI服务状态
        const serviceStatus = await aiChatService.checkServiceStatus()
        this.chatState.isConnected = serviceStatus.online

        // 加载用户偏好
        this.loadUserPreferences()

        // 标记为已初始化
        this.chatState.isInitialized = true

        console.log('HeWa AI聊天初始化完成:', {
          sessionId: this.chatState.sessionId,
          connected: this.chatState.isConnected
        })
      } catch (error) {
        console.error('聊天初始化失败:', error)
        this.chatState.isConnected = false
      }
    },

    /**
     * 发送消息给AI
     */
    async sendMessageToAI (messageContent, options = {}) {
      if (!messageContent.trim()) return null

      try {
        // 添加用户消息到历史记录
        const userMessage = this.createUserMessage(messageContent)
        this.addMessageToHistory(userMessage)

        // 构建上下文信息
        const context = this.buildConversationContext()

        // 发送给AI服务
        const aiResponse = await aiChatService.sendMessage({
          sessionId: this.chatState.sessionId,
          message: messageContent,
          context: context,
          userInfo: this.getCurrentUserInfo(),
          ...options
        })

        // 添加AI回复到历史记录
        const aiMessage = this.createAIMessage(aiResponse)
        this.addMessageToHistory(aiMessage)

        // 更新活跃时间
        this.updateActivity()

        return aiMessage
      } catch (error) {
        console.error('发送消息失败:', error)

        // 添加错误消息
        const errorMessage = this.createErrorMessage(error)
        this.addMessageToHistory(errorMessage)

        return errorMessage
      }
    },

    /**
     * 获取快捷问题列表
     */
    async getQuickQuestions (category = 'scm') {
      try {
        return await aiChatService.getQuickQuestions(category)
      } catch (error) {
        console.error('获取快捷问题失败:', error)
        return scmKnowledgeBase.getFAQ().map(faq => faq.question).slice(0, 6)
      }
    },

    /**
     * 搜索知识库
     */
    searchKnowledge (query) {
      return scmKnowledgeBase.searchKnowledge(query)
    },

    /**
     * 获取智能建议
     */
    getSmartSuggestions (userInput) {
      return scmKnowledgeBase.getSmartSuggestions(userInput, {
        sessionId: this.chatState.sessionId,
        messageHistory: this.chatState.messageHistory
      })
    },

    /**
     * 提交用户反馈
     */
    async submitFeedback (feedbackData) {
      try {
        return await aiChatService.submitFeedback({
          ...feedbackData,
          sessionId: this.chatState.sessionId,
          userInfo: this.getCurrentUserInfo()
        })
      } catch (error) {
        console.error('提交反馈失败:', error)
        throw error
      }
    },

    /**
     * 切换到人工客服
     */
    async switchToHumanService () {
      try {
        const context = {
          messageHistory: this.chatState.messageHistory.slice(-10), // 最近10条消息
          userInfo: this.getCurrentUserInfo(),
          currentUrl: window.location.href
        }

        return await aiChatService.switchToHuman(this.chatState.sessionId, context)
      } catch (error) {
        console.error('切换人工客服失败:', error)
        throw error
      }
    },

    /**
     * 清空聊天记录
     */
    clearChatHistory () {
      this.chatState.messageHistory = []
      this.chatState.unreadCount = 0
      console.log('聊天记录已清空')
    },

    /**
     * 导出聊天记录
     */
    exportChatHistory () {
      const exportData = {
        sessionId: this.chatState.sessionId,
        exportTime: new Date().toISOString(),
        messageCount: this.chatState.messageHistory.length,
        messages: this.chatState.messageHistory.map(msg => ({
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp,
          formattedTime: new Date(msg.timestamp).toLocaleString('zh-CN')
        }))
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `chat_history_${this.chatState.sessionId}.json`
      link.click()

      URL.revokeObjectURL(url)
    },

    /**
     * 创建用户消息对象
     * @private
     */
    createUserMessage (content) {
      return {
        id: 'user_' + Date.now(),
        type: 'user',
        content: content,
        timestamp: Date.now(),
        sender: this.getCurrentUserInfo()
      }
    },

    /**
     * 创建AI消息对象
     * @private
     */
    createAIMessage (aiResponse) {
      return {
        id: 'ai_' + Date.now(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: Date.now(),
        steps: aiResponse.steps,
        actions: aiResponse.actions,
        suggestions: aiResponse.suggestions,
        confidence: aiResponse.confidence,
        isError: aiResponse.isError || false,
        sender: {
          name: this.aiConfig.name,
          role: 'AI助手',
          avatar: 'H'
        }
      }
    },

    /**
     * 创建错误消息对象
     * @private
     */
    createErrorMessage (error) {
      return {
        id: 'error_' + Date.now(),
        type: 'ai',
        content: '抱歉，我遇到了一些技术问题。请稍后再试或联系技术支持。',
        timestamp: Date.now(),
        isError: true,
        errorType: error.name || 'UnknownError',
        actions: [
          { text: '重试', action: 'retry' },
          { text: '联系客服', action: 'contact_support' }
        ],
        sender: {
          name: this.aiConfig.name,
          role: 'AI助手',
          avatar: 'H'
        }
      }
    },

    /**
     * 添加消息到历史记录
     * @private
     */
    addMessageToHistory (message) {
      this.chatState.messageHistory.push(message)

      // 限制历史记录长度
      if (this.chatState.messageHistory.length > this.aiConfig.maxHistoryLength) {
        this.chatState.messageHistory = this.chatState.messageHistory.slice(-this.aiConfig.maxHistoryLength)
      }

      // 如果是AI或错误消息，增加未读计数
      if (message.type === 'ai' || message.isError) {
        this.chatState.unreadCount++
      }
    },

    /**
     * 构建对话上下文
     * @private
     */
    buildConversationContext () {
      const recentMessages = this.chatState.messageHistory.slice(-5) // 最近5条消息
      return {
        recentMessages: recentMessages,
        userPreferences: this.userPreferences,
        currentModule: this.$route?.meta?.module || 'unknown',
        currentPage: this.$route?.path || window.location.pathname
      }
    },

    /**
     * 获取当前用户信息
     * @private
     */
    getCurrentUserInfo () {
      // 这里应该从Vuex或其他状态管理获取用户信息
      return this.$store?.getters?.userInfo || {
        id: 'anonymous',
        name: '用户',
        avatar: '',
        role: 'user'
      }
    },

    /**
     * 检查是否有后续AI回复
     * @private
     */
    hasSubsequentAIResponse (userMessage) {
      const userIndex = this.chatState.messageHistory.findIndex(msg => msg.id === userMessage.id)
      if (userIndex === -1) return false

      for (let i = userIndex + 1; i < this.chatState.messageHistory.length; i++) {
        if (this.chatState.messageHistory[i].type === 'ai') {
          return true
        }
      }
      return false
    },

    /**
     * 更新活跃时间
     * @private
     */
    updateActivity () {
      this.chatState.lastActivity = Date.now()
    },

    /**
     * 加载用户偏好设置
     * @private
     */
    loadUserPreferences () {
      try {
        const saved = localStorage.getItem('hewa_chat_preferences')
        if (saved) {
          this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) }
        }
      } catch (error) {
        console.error('加载用户偏好失败:', error)
      }
    },

    /**
     * 保存用户偏好设置
     */
    saveUserPreferences () {
      try {
        localStorage.setItem('hewa_chat_preferences', JSON.stringify(this.userPreferences))
      } catch (error) {
        console.error('保存用户偏好失败:', error)
      }
    },

    /**
     * 重置未读计数
     */
    resetUnreadCount () {
      this.chatState.unreadCount = 0
    },

    /**
     * 用户行为跟踪
     */
    trackUserAction (action, data = {}) {
      aiChatService.trackUserAction(action, {
        ...data,
        sessionId: this.chatState.sessionId,
        timestamp: Date.now(),
        userInfo: this.getCurrentUserInfo()
      })
    },

    /**
     * 清理资源
     * @private
     */
    cleanup () {
      // 保存用户偏好
      this.saveUserPreferences()

      // 清理定时器等资源
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
      }

      console.log('HeWa AI聊天组件已清理')
    }
  }
}
