import chatAPI from '@/api/70_chat/chat'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

// 聊天模块状态管理
const state = {
  // 连接状态
  isConnected: false,
  isConnecting: false,

  // 会话信息
  sessionId: null,
  sessionInfo: {},

  // 消息相关 - 清空以显示"猜你想问"
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isTyping: false,

  // WebSocket连接
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
  SET_SESSION_ID (state, sessionId) {
    state.sessionId = sessionId
    // 存储到localStorage中，页面刷新后恢复
    if (sessionId) {
      localStorage.setItem('chat_session_id', sessionId)
    } else {
      localStorage.removeItem('chat_session_id')
    }
  },

  SET_SESSION_INFO (state, info) {
    state.sessionInfo = { ...state.sessionInfo, ...info }
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
    state.sessionId = null
    state.messages = []
    state.unreadCount = 0
    state.isConnected = false
    state.isConnecting = false
    state.lastError = null
    state.retryCount = 0
    localStorage.removeItem('chat_session_id')
  }
}

const actions = {
  // 初始化聊天
  async initializeChat ({ commit, dispatch, state }) {
    try {
      commit('SET_LOADING', true)

      // 尝试从localStorage恢复会话
      const savedSessionId = localStorage.getItem('chat_session_id')
      if (savedSessionId) {
        commit('SET_SESSION_ID', savedSessionId)
        // 尝试恢复历史消息
        await dispatch('loadMessages')
      }

      // 初始化WebSocket连接
      await dispatch('connectWebSocket')
    } catch (error) {
      console.error('初始化聊天失败:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 创建新会话
  async createSession ({ commit, state }) {
    try {
      const response = await chatAPI.initSession(state.userInfo)
      const sessionData = response.data

      commit('SET_SESSION_ID', sessionData.session_id)
      commit('SET_SESSION_INFO', sessionData)

      // 添加欢迎消息
      if (sessionData.welcome_message) {
        commit('ADD_MESSAGE', {
          id: 'welcome_' + Date.now(),
          content: sessionData.welcome_message,
          type: 'system',
          timestamp: new Date().toISOString()
        })
      }

      return sessionData
    } catch (error) {
      console.error('创建会话失败:', error)
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // 发送消息
  async sendMessage ({ commit, state, dispatch }, content) {
    if (!content.trim()) return

    try {
      commit('SET_LOADING', true)

      // 如果没有会话，先创建会话
      if (!state.sessionId) {
        await dispatch('createSession')
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

      // 发送消息到服务器
      const response = await chatAPI.sendMessage(state.sessionId, content)
      const messageData = response.data

      // 更新消息状态
      commit('UPDATE_MESSAGE', {
        messageId: userMessage.id,
        updates: {
          id: messageData.id,
          status: 'sent'
        }
      })
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
    if (!state.sessionId) return

    try {
      const response = await chatAPI.getMessages(state.sessionId, params)
      const messages = response.data.messages || []

      // 转换消息格式
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.sender_type === 'user' ? 'user' : 'agent',
        timestamp: msg.created_at,
        avatar: msg.sender_avatar,
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
    if (!state.sessionId || state.unreadCount === 0) return

    try {
      await chatAPI.markAsRead(state.sessionId)
      commit('SET_UNREAD_COUNT', 0)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  },

  // 连接WebSocket
  async connectWebSocket ({ commit, dispatch, state }) {
    if (state.isConnected || state.isConnecting) return

    commit('SET_CONNECTING', true)

    try {
      // 创建SockJS连接
      const socket = new SockJS('/ws/chat')
      const stompClient = Stomp.over(socket)

      // 禁用调试日志
      stompClient.debug = null

      // 连接配置
      const connectHeaders = {}
      if (state.sessionId) {
        connectHeaders['session-id'] = state.sessionId
      }

      // 连接WebSocket
      await new Promise((resolve, reject) => {
        stompClient.connect(
          connectHeaders,
          (frame) => {
            commit('SET_CONNECTED', true)
            commit('SET_SOCKET', socket)
            commit('SET_STOMP_CLIENT', stompClient)
            commit('SET_RETRY_COUNT', 0)

            // 订阅消息
            dispatch('subscribeToMessages')

            resolve(frame)
          },
          (error) => {
            commit('SET_ERROR', error)
            reject(error)
          }
        )
      })
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      commit('SET_ERROR', error.message)

      // 重连机制
      if (state.retryCount < state.config.maxRetries) {
        commit('SET_RETRY_COUNT', state.retryCount + 1)
        setTimeout(() => {
          dispatch('connectWebSocket')
        }, state.config.retryInterval)
      }
    } finally {
      commit('SET_CONNECTING', false)
    }
  },

  // 订阅消息
  subscribeToMessages ({ commit, state }) {
    if (!state.stompClient || !state.sessionId) return

    // 订阅个人消息
    state.stompClient.subscribe(`/topic/chat/${state.sessionId}`, (message) => {
      const messageData = JSON.parse(message.body)

      // 处理不同类型的消息
      switch (messageData.type) {
        case 'message':
          commit('ADD_MESSAGE', {
            id: messageData.id,
            content: messageData.content,
            type: messageData.sender_type === 'user' ? 'user' : 'agent',
            timestamp: messageData.timestamp,
            avatar: messageData.avatar
          })

          // 增加未读计数（如果不是用户自己的消息）
          if (messageData.sender_type !== 'user') {
            commit('SET_UNREAD_COUNT', state.unreadCount + 1)
          }
          break

        case 'typing_start':
          commit('SET_TYPING', true)
          break

        case 'typing_stop':
          commit('SET_TYPING', false)
          break

        case 'session_end':
          // 会话结束处理
          commit('RESET_CHAT_STATE')
          break

        default:
          console.log('未知消息类型:', messageData.type)
      }
    })

    // 订阅系统消息
    state.stompClient.subscribe('/topic/system', (message) => {
      const systemData = JSON.parse(message.body)

      if (systemData.type === 'maintenance') {
        commit('ADD_MESSAGE', {
          id: 'system_' + Date.now(),
          content: systemData.message,
          type: 'system',
          timestamp: new Date().toISOString()
        })
      }
    })
  },

  // 断开连接
  disconnectWebSocket ({ commit, state }) {
    if (state.stompClient) {
      state.stompClient.disconnect()
    }
    if (state.socket) {
      state.socket.close()
    }

    commit('SET_CONNECTED', false)
    commit('SET_SOCKET', null)
    commit('SET_STOMP_CLIENT', null)
  },

  // 设置用户信息
  setUserInfo ({ commit }, userInfo) {
    commit('SET_USER_INFO', userInfo)
  },

  // 结束会话
  async endSession ({ commit, dispatch, state }) {
    if (!state.sessionId) return

    try {
      await chatAPI.endSession(state.sessionId)
      commit('RESET_CHAT_STATE')
      dispatch('disconnectWebSocket')
    } catch (error) {
      console.error('结束会话失败:', error)
      commit('SET_ERROR', error.message)
    }
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

  // 是否有活跃会话
  hasActiveSession: (state) => {
    return !!state.sessionId && state.isConnected
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
