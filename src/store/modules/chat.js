import aiChatService from '@/components/70_chat/api/aiChatService'
// import SockJS from 'sockjs-client'
// import Stomp from 'stompjs'

console.log('Chat module loading, aiChatService:', aiChatService)

// 聊天模块状态管理
const state = {
  // 连接状态
  isConnected: false,
  isConnecting: false,

  // 会话信息
  conversationId: null,
  conversationInfo: {},

  // 消息相关 - 清空以显示"猜你想问"
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isTyping: false,

  // 聊天面板状态
  isPanelExpanded: false,

  // WebSocket连接 (AI聊天暂时不需要)
  socket: null,
  stompClient: null,

  // 用户信息
  userInfo: {
    userId: null,
    userName: '访客',
    userEmail: null
  },

  // 聊天配置
  config: {
    maxRetries: 3,
    retryInterval: 5000,
    heartbeatInterval: 30000
  },

  // 错误信息
  lastError: null,
  retryCount: 0
}

const mutations = {
  // 连接状态
  SET_CONNECTED (state, status) {
    state.isConnected = status
  },

  SET_CONNECTING (state, status) {
    state.isConnecting = status
  },

  // 会话管理
  SET_CONVERSATION_ID (state, conversationId) {
    state.conversationId = conversationId
    // 存储到localStorage中，页面刷新后恢复
    if (conversationId) {
      localStorage.setItem('chat_conversation_id', conversationId)
    } else {
      localStorage.removeItem('chat_conversation_id')
    }
  },

  SET_CONVERSATION_INFO (state, info) {
    state.conversationInfo = { ...state.conversationInfo, ...info }
  },

  // 消息管理
  SET_MESSAGES (state, messages) {
    state.messages = messages
  },

  ADD_MESSAGE (state, message) {
    state.messages.push({
      id: message.id || Date.now(),
      content: message.content,
      type: message.type || 'user', // user, agent, system
      timestamp: message.timestamp || new Date().toISOString(),
      avatar: message.avatar || null,
      status: message.status || 'sent' // sent, delivered, read, failed
    })
  },

  UPDATE_MESSAGE (state, { messageId, updates }) {
    const index = state.messages.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      state.messages.splice(index, 1, { ...state.messages[index], ...updates })
    }
  },

  SET_UNREAD_COUNT (state, count) {
    state.unreadCount = count
  },

  SET_LOADING (state, status) {
    state.isLoading = status
  },

  SET_TYPING (state, status) {
    state.isTyping = status
  },

  // 聊天面板状态控制
  SET_PANEL_EXPANDED (state, expanded) {
    state.isPanelExpanded = expanded
    // 持久化到localStorage，保持跨页面状态
    localStorage.setItem('chat_panel_expanded', expanded.toString())
  },

  TOGGLE_PANEL (state) {
    state.isPanelExpanded = !state.isPanelExpanded
    localStorage.setItem('chat_panel_expanded', state.isPanelExpanded.toString())
  },

  // WebSocket连接
  SET_SOCKET (state, socket) {
    state.socket = socket
  },

  SET_STOMP_CLIENT (state, client) {
    state.stompClient = client
  },

  // 用户信息
  SET_USER_INFO (state, userInfo) {
    state.userInfo = { ...state.userInfo, ...userInfo }
  },

  // 错误处理
  SET_ERROR (state, error) {
    state.lastError = error
  },

  SET_RETRY_COUNT (state, count) {
    state.retryCount = count
  },

  // 重置状态
  RESET_CHAT_STATE (state) {
    state.conversationId = null
    state.messages = []
    state.unreadCount = 0
    state.isConnected = false
    state.isConnecting = false
    state.lastError = null
    state.retryCount = 0
    // 保持面板状态，不重置 isPanelExpanded
    localStorage.removeItem('chat_conversation_id')
  },

  // 初始化状态（从localStorage恢复）
  INIT_CHAT_STATE (state) {
    // 恢复面板展开状态
    const savedPanelState = localStorage.getItem('chat_panel_expanded')
    if (savedPanelState !== null) {
      state.isPanelExpanded = savedPanelState === 'true'
    }

    // 恢复对话ID
    const savedConversationId = localStorage.getItem('chat_conversation_id')
    if (savedConversationId) {
      state.conversationId = savedConversationId
    }
  }
}

const actions = {
  // 初始化聊天
  async initializeChat ({ commit, dispatch, state }) {
    try {
      commit('SET_LOADING', true)

      // 首先初始化状态（从localStorage恢复）
      commit('INIT_CHAT_STATE')

      // 尝试从localStorage恢复对话
      const savedConversationId = localStorage.getItem('chat_conversation_id')
      if (savedConversationId) {
        commit('SET_CONVERSATION_ID', savedConversationId)
        // 尝试恢复历史消息
        await dispatch('loadMessages')
      }

      // AI聊天使用REST API，不需要WebSocket连接
      // await dispatch('connectWebSocket')
    } catch (error) {
      console.error('初始化聊天失败:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 创建新对话
  async createConversation ({ commit, state }, prompt = '您好，我是SCM智能助手，请问有什么可以帮助您的吗？') {
    try {
      const conversationId = aiChatService.generateConversationId()
      const response = await aiChatService.addConversation({
        prompt,
        chatModelId: 'default',
        conversationId,
        organizationId: 'default'
      })

      commit('SET_CONVERSATION_ID', conversationId)
      commit('SET_CONVERSATION_INFO', response)

      return { conversationId, ...response }
    } catch (error) {
      console.error('创建对话失败:', error)
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // 发送消息
  async sendMessage ({ commit, state, dispatch }, content) {
    if (!content.trim()) return

    try {
      commit('SET_LOADING', true)

      // 如果没有对话，先创建对话
      if (!state.conversationId) {
        await dispatch('createConversation', content)
      }

      // 添加用户消息到界面
      const userMessage = {
        id: 'temp_' + Date.now(),
        content: content.trim(),
        type: 'user',
        timestamp: new Date().toISOString(),
        status: 'sending'
      }
      commit('ADD_MESSAGE', userMessage)

      // 发送消息到AI服务器
      const response = await aiChatService.sendMessage({
        conversationId: state.conversationId,
        prompt: content.trim(),
        chatModelId: 'default'
      })

      // 更新用户消息状态
      commit('UPDATE_MESSAGE', {
        messageId: userMessage.id,
        updates: {
          status: 'sent'
        }
      })

      // 添加AI回复消息
      if (response.content) {
        commit('ADD_MESSAGE', {
          id: 'ai_' + Date.now(),
          content: response.content,
          type: 'agent',
          timestamp: new Date().toISOString(),
          status: 'delivered'
        })
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      commit('SET_ERROR', error.message)

      // 标记消息发送失败
      const failedMessage = state.messages.find(msg => msg.status === 'sending')
      if (failedMessage) {
        commit('UPDATE_MESSAGE', {
          messageId: failedMessage.id,
          updates: { status: 'failed' }
        })
      }

      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 加载历史消息
  async loadMessages ({ commit, state }, params = {}) {
    if (!state.conversationId) return

    try {
      const messages = await aiChatService.getChatHistory(state.conversationId, params.limit || 50)

      // 转换消息格式
      const formattedMessages = messages.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.content,
        type: msg.type || 'agent',
        timestamp: msg.timestamp,
        avatar: msg.avatar,
        status: 'delivered'
      }))

      if (params.page === 1) {
        commit('SET_MESSAGES', formattedMessages)
      } else {
        // 追加历史消息（向前翻页）
        commit('SET_MESSAGES', [...formattedMessages, ...state.messages])
      }
    } catch (error) {
      console.error('加载消息失败:', error)
      commit('SET_ERROR', error.message)
    }
  },

  // 标记已读
  async markAsRead ({ commit, state }) {
    if (!state.conversationId || state.unreadCount === 0) return

    try {
      // AI聊天暂时不需要标记已读逻辑，直接设置为0
      commit('SET_UNREAD_COUNT', 0)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  },

  // 连接WebSocket (AI聊天暂时不需要)
  async connectWebSocket ({ commit, dispatch, state }) {
    console.log('AI聊天使用REST API，跳过WebSocket连接')
    // AI聊天使用REST API，不需要WebSocket
    return Promise.resolve()
  },

  // 订阅消息 (AI聊天暂时不需要)
  subscribeToMessages ({ commit, state }) {
    console.log('AI聊天使用REST API，跳过消息订阅')
    // AI聊天使用REST API，不需要消息订阅
  },

  // 断开连接 (AI聊天暂时不需要)
  disconnectWebSocket ({ commit, state }) {
    console.log('AI聊天使用REST API，跳过WebSocket断开')
    // AI聊天使用REST API，不需要WebSocket
    commit('SET_CONNECTED', false)
    commit('SET_SOCKET', null)
    commit('SET_STOMP_CLIENT', null)
  },

  // 设置用户信息
  setUserInfo ({ commit }, userInfo) {
    commit('SET_USER_INFO', userInfo)
  },

  // 结束对话
  async endConversation ({ commit, dispatch, state }) {
    if (!state.conversationId) return

    try {
      await aiChatService.deleteConversation(state.conversationId)
      commit('RESET_CHAT_STATE')
      dispatch('disconnectWebSocket')
    } catch (error) {
      console.error('结束对话失败:', error)
      commit('SET_ERROR', error.message)
    }
  },

  // 面板状态管理
  toggleChatPanel ({ commit, state }) {
    commit('TOGGLE_PANEL')
    // 如果打开面板且有未读消息，标记为已读
    if (state.isPanelExpanded && state.unreadCount > 0) {
      commit('SET_UNREAD_COUNT', 0)
    }
  },

  setChatPanelExpanded ({ commit }, expanded) {
    commit('SET_PANEL_EXPANDED', expanded)
  },

  // 初始化面板状态（用于组件挂载时调用）
  initChatPanel ({ commit }) {
    commit('INIT_CHAT_STATE')
  }
}

const getters = {
  // 获取连接状态
  connectionStatus: (state) => ({
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    hasError: !!state.lastError
  }),

  // 获取最新消息
  latestMessages: (state) => (count = 10) => {
    return state.messages.slice(-count)
  },

  // 获取未读消息
  unreadMessages: (state) => {
    return state.messages.filter(msg =>
      msg.type === 'agent' && msg.status !== 'read'
    )
  },

  // 是否有活跃对话
  hasActiveSession: (state) => {
    return !!state.conversationId
  },

  // 面板状态
  isPanelExpanded: (state) => state.isPanelExpanded
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
