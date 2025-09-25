import aiChatService from '@/components/70_ai/api/aiChatService'
// import SockJS from 'sockjs-client'
// import Stomp from 'stompjs'

const state = {
  isConnected: false,
  isConnecting: false,

  conversationId: null,
  conversationInfo: {},

  messages: [],
  unreadCount: 0,
  isLoading: false,
  isTyping: false,

  isPanelExpanded: false,

  userInfo: {
    userId: null,
    userName: '访客',
    userEmail: null
  },

  config: {
    maxRetries: 3,
    retryInterval: 5000,
    heartbeatInterval: 30000
  },

  lastError: null,
  retryCount: 0
}

const mutations = {
  SET_CONNECTED (state, status) {
    state.isConnected = status
  },

  SET_CONNECTING (state, status) {
    state.isConnecting = status
  },

  SET_CONVERSATION_ID (state, conversationId) {
    state.conversationId = conversationId
    if (conversationId) {
      localStorage.setItem('chat_conversation_id', conversationId)
    } else {
      localStorage.removeItem('chat_conversation_id')
    }
  },

  SET_CONVERSATION_INFO (state, info) {
    state.conversationInfo = { ...state.conversationInfo, ...info }
  },

  SET_MESSAGES (state, messages) {
    state.messages = messages
  },

  ADD_MESSAGE (state, message) {
    const newMessage = {
      id: message.id || Date.now(),
      content: message.content,
      type: message.type || 'user', // user, agent, system
      timestamp: message.timestamp || new Date().toISOString(),
      avatar: message.avatar || null,
      status: message.status || 'sent' // sent, delivered, read, failed
    }
    state.messages.push(newMessage)
  },

  UPDATE_MESSAGE (state, { messageId, updates }) {
    const index = state.messages.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      const oldMessage = state.messages[index]
      const newMessage = { ...oldMessage, ...updates }
      state.messages.splice(index, 1, newMessage)
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

  SET_PANEL_EXPANDED (state, expanded) {
    state.isPanelExpanded = expanded
    localStorage.setItem('chat_panel_expanded', expanded.toString())
  },

  TOGGLE_PANEL (state) {
    state.isPanelExpanded = !state.isPanelExpanded
    localStorage.setItem('chat_panel_expanded', state.isPanelExpanded.toString())
  },

  SET_USER_INFO (state, userInfo) {
    state.userInfo = { ...state.userInfo, ...userInfo }
  },

  SET_ERROR (state, error) {
    state.lastError = error
  },

  SET_RETRY_COUNT (state, count) {
    state.retryCount = count
  },

  RESET_CHAT_STATE (state) {
    state.conversationId = null
    state.messages = []
    state.unreadCount = 0
    state.isConnected = false
    state.isConnecting = false
    state.lastError = null
    state.retryCount = 0
    localStorage.removeItem('chat_conversation_id')
  },

  // 初始化状态（从localStorage恢复）
  INIT_CHAT_STATE (state) {
    const savedPanelState = localStorage.getItem('chat_panel_expanded')
    if (savedPanelState !== null) {
      state.isPanelExpanded = savedPanelState === 'true'
    }

    const savedConversationId = localStorage.getItem('chat_conversation_id')
    if (savedConversationId) {
      state.conversationId = savedConversationId
    }
  }
}

const actions = {
  async initializeChat ({ commit, dispatch, state, rootState }) {
    try {
      commit('SET_LOADING', true)

      commit('INIT_CHAT_STATE')

      // 必须从用户信息中获取conv_uuid
      const userInfo = rootState.user || {}
      const conversationId = userInfo.conv_uuid

      if (conversationId) {
        commit('SET_CONVERSATION_ID', conversationId)
        await dispatch('loadMessages')
      } else {
        commit('SET_ERROR', '用户会话信息不完整，无法加载历史消息')
      }
    } catch (error) {
      console.error('聊天初始化失败:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createConversation ({ commit, rootState }, prompt = '您好，我是SCM智能助手，请问有什么可以帮助您的吗？') {
    try {
      // 必须使用用户的conv_uuid
      const userInfo = rootState.user || {}
      const conversationId = userInfo.conv_uuid

      if (!conversationId) {
        throw new Error('用户conv_uuid不存在，无法创建会话')
      }

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
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async sendMessage ({ commit, state, dispatch }, content) {
    if (!content.trim()) return

    // eslint-disable-next-line no-unused-vars
    let _cancelFunction = null

    try {
      commit('SET_LOADING', true)

      if (!state.conversationId) {
        await dispatch('createConversation', content)
      }

      const userMessage = {
        id: 'temp_' + Date.now(),
        content: content.trim(),
        type: 'user',
        timestamp: new Date().toISOString(),
        status: 'sending'
      }
      commit('ADD_MESSAGE', userMessage)

      const aiMessageId = 'ai_' + Date.now()
      // 立即创建AI消息但设为隐藏状态，避免闪烁
      const aiMessage = {
        id: aiMessageId,
        content: '',
        type: 'ai',
        timestamp: new Date().toISOString(),
        status: 'thinking',
        isStreaming: true,
        isHidden: true // 标记为隐藏，不在UI中显示
      }
      commit('ADD_MESSAGE', aiMessage)
      // 开始思考状态
      commit('SET_TYPING', true)

      _cancelFunction = aiChatService.sendMessageStream({
        conversationId: state.conversationId,
        prompt: content.trim(),
        chatModelId: 'default'
      }, {
        onStart: () => {
          commit('UPDATE_MESSAGE', {
            messageId: userMessage.id,
            updates: { status: 'sent' }
          })
        },
        onContent: (contentChunk) => {
          const currentMessage = state.messages.find(msg => msg.id === aiMessageId)

          if (currentMessage) {
            const accumulatedContent = (currentMessage.content || '') + (contentChunk || '')

            // 只有当累积内容有实际意义时才显示AI消息并隐藏思考状态
            // 提高阈值，确保有足够内容才显示，避免空白对话框
            const trimmedContent = accumulatedContent.trim()
            const hasValidContent = trimmedContent.length > 15 &&
                                  trimmedContent.replace(/\s+/g, ' ').length > 10 // 去除多余空格后仍有内容

            if (hasValidContent && state.isTyping) {
              commit('SET_TYPING', false)
            }

            commit('UPDATE_MESSAGE', {
              messageId: aiMessageId,
              updates: {
                content: accumulatedContent,
                status: hasValidContent ? 'streaming' : 'thinking',
                isStreaming: !hasValidContent,
                isHidden: !hasValidContent, // 有有效内容时才显示
                streamFormat: 'flux-chat-response'
              }
            })
          }
        },
        onComplete: (fullContent) => {
          // 确保思考状态结束
          commit('SET_TYPING', false)

          const currentMessage = state.messages.find(msg => msg.id === aiMessageId)
          const finalContent = fullContent || currentMessage?.content || ''

          if (currentMessage) {
            // 检查最终内容是否足够显示，避免空白消息
            const trimmedFinalContent = finalContent.trim()
            const hasEnoughContent = trimmedFinalContent.length > 5 &&
                                   trimmedFinalContent.replace(/\s+/g, ' ').length > 3

            commit('UPDATE_MESSAGE', {
              messageId: aiMessageId,
              updates: {
                content: finalContent,
                status: 'delivered',
                isStreaming: false,
                isHidden: !hasEnoughContent, // 只有有足够内容才显示
                streamFormat: 'flux-chat-response',
                completedAt: new Date().toISOString()
              }
            })
          }
        },
        onError: (_error) => {
          // 错误时结束思考状态
          commit('SET_TYPING', false)

          commit('UPDATE_MESSAGE', {
            messageId: userMessage.id,
            updates: {
              status: 'failed',
              content: content.trim()
            }
          })
          commit('UPDATE_MESSAGE', {
            messageId: aiMessageId,
            updates: {
              content: '抱歉，消息发送失败，请稍后重试。',
              status: 'error',
              isStreaming: false
            }
          })
        }
      })
    } catch (error) {
      // 异常时结束思考状态
      commit('SET_TYPING', false)
      commit('SET_ERROR', error.message)

      const failedMessage = state.messages.find(msg => msg.status === 'sending')
      if (failedMessage) {
        commit('UPDATE_MESSAGE', {
          messageId: failedMessage.id,
          updates: {
            status: 'failed',
            content: content.trim()
          }
        })
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async loadMessages ({ commit, state }, params = {}) {
    if (!state.conversationId) {
      return
    }

    try {
      const messages = await aiChatService.getAiChatDetail(state.conversationId)

      const formattedMessages = messages.map(msg => {
        // 将API返回的type转换为前端期望的格式
        let messageType = msg.type || 'agent'
        if (messageType === 'assistant') {
          messageType = 'agent'
        }

        // 时间戳格式化
        let formattedTimestamp = msg.createTime || msg.timestamp || new Date().toISOString()
        if (typeof formattedTimestamp === 'number') {
          formattedTimestamp = new Date(formattedTimestamp).toISOString()
        }

        return {
          id: msg.id || Date.now(),
          content: msg.content,
          type: messageType,
          timestamp: formattedTimestamp,
          avatar: msg.avatar,
          status: 'delivered'
        }
      })

      if (params.page === 1) {
        commit('SET_MESSAGES', formattedMessages)
      } else {
        commit('SET_MESSAGES', [...formattedMessages, ...state.messages])
      }
    } catch (error) {
      console.error('加载历史消息失败:', error)
      commit('SET_ERROR', error.message)
    }
  },

  markAsRead ({ commit, state }) {
    if (!state.conversationId || state.unreadCount === 0) return
    commit('SET_UNREAD_COUNT', 0)
  },

  setUserInfo ({ commit }, userInfo) {
    commit('SET_USER_INFO', userInfo)
  },

  async endConversation ({ commit, state }) {
    if (!state.conversationId) return

    try {
      await aiChatService.deleteConversation(state.conversationId)
      commit('RESET_CHAT_STATE')
    } catch (error) {
      commit('SET_ERROR', error.message)
    }
  },

  async clearConversation ({ commit, state }) {
    if (!state.conversationId) return

    try {
      await aiChatService.clearConversationContent(state.conversationId)
      // 只清空前端消息列表，保留对话状态
      commit('SET_MESSAGES', [])
      commit('SET_UNREAD_COUNT', 0)
      commit('SET_LOADING', false)
      commit('SET_TYPING', false)
      commit('SET_ERROR', null)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  toggleChatPanel ({ commit, state }) {
    commit('TOGGLE_PANEL')
    if (state.isPanelExpanded && state.unreadCount > 0) {
      commit('SET_UNREAD_COUNT', 0)
    }
  },

  setChatPanelExpanded ({ commit }, expanded) {
    commit('SET_PANEL_EXPANDED', expanded)
  },

  initChatPanel ({ commit }) {
    commit('INIT_CHAT_STATE')
  }
}

const getters = {
  connectionStatus: (state) => ({
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    hasError: !!state.lastError
  }),

  latestMessages: (state) => (count = 10) => {
    return state.messages.slice(-count)
  },

  unreadMessages: (state) => {
    return state.messages.filter(msg =>
      msg.type === 'agent' && msg.status !== 'read'
    )
  },

  hasActiveSession: (state) => {
    return !!state.conversationId
  },

  isPanelExpanded: (state) => state.isPanelExpanded,

  // 聊天相关的getters
  chatMessages: (state) => state.messages,
  chatUnreadCount: (state) => state.unreadCount,
  chatIsLoading: (state) => state.isLoading,
  chatIsTyping: (state) => state.isTyping,
  chatPanelExpanded: (state) => state.isPanelExpanded
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
