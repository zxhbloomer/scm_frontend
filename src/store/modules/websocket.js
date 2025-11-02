import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

const state = {
  socketUrl: import.meta.env.VITE_WEBSOCKET_NOTICE,
  reconnecting: false,
  connected: false,
  socket: null,
  stompClient: null,
  headers: {},
  retryCount: 0,
  maxRetries: 5,
  retryDelay: 5000,
  subscriptions: new Map(),
  connectionCallbacks: [],
  checkInterval: null
}

const mutations = {
  SET_CONNECTION_STATUS (state, status) {
    state.connected = status
  },
  SET_RECONNECTING (state, status) {
    state.reconnecting = status
  },
  SET_SOCKET (state, socket) {
    state.socket = socket
  },
  SET_STOMP_CLIENT (state, client) {
    state.stompClient = client
  },
  SET_RETRY_COUNT (state, count) {
    state.retryCount = count
  },
  ADD_SUBSCRIPTION (state, { topic, subscription }) {
    state.subscriptions.set(topic, subscription)
  },
  REMOVE_SUBSCRIPTION (state, topic) {
    state.subscriptions.delete(topic)
  },
  SET_CHECK_INTERVAL (state, interval) {
    state.checkInterval = interval
  }
}

const actions = {
  // 初始化WebSocket连接
  async WEBSOCKET_INIT ({ commit, dispatch, state }, headers = {}) {
    if (state.connected) {
      console.log('WebSocket already connected')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        // 清理现有连接
        if (state.stompClient && state.stompClient.connected) {
          state.stompClient.disconnect()
        }

        // 创建连接
        const socket = new SockJS(state.socketUrl)
        const stompClient = Stomp.over(socket)

        // 禁用调试信息
        stompClient.debug = () => {}

        commit('SET_SOCKET', socket)
        commit('SET_STOMP_CLIENT', stompClient)

        // 连接配置
        const connectHeaders = { ...state.headers, ...headers }

        stompClient.connect(
          connectHeaders,
          frame => {
            console.log('WebSocket connected successfully')
            commit('SET_CONNECTION_STATUS', true)
            commit('SET_RECONNECTING', false)
            commit('SET_RETRY_COUNT', 0)

            // 设置心跳
            stompClient.heartbeat.outgoing = 10000
            stompClient.heartbeat.incoming = 0

            // 执行连接回调
            state.connectionCallbacks.forEach(callback => callback())

            resolve(frame)
          },
          error => {
            console.error('WebSocket connection failed:', error)
            commit('SET_CONNECTION_STATUS', false)
            dispatch('WEBSOCKET_RECONNECT', headers)
            reject(error)
          }
        )
      } catch (error) {
        console.error('WebSocket initialization error:', error)
        reject(error)
      }
    })
  },

  // 重连机制
  WEBSOCKET_RECONNECT ({ commit, dispatch, state }, headers = {}) {
    if (state.reconnecting) {
      return
    }

    if (state.retryCount >= state.maxRetries) {
      console.log('WebSocket reached maximum retry limit')
      return
    }

    commit('SET_RECONNECTING', true)
    commit('SET_RETRY_COUNT', state.retryCount + 1)

    const delay = Math.min(state.retryDelay * Math.pow(2, state.retryCount), 30000)

    console.log(`WebSocket reconnecting in ${delay}ms (attempt ${state.retryCount}/${state.maxRetries})`)

    setTimeout(() => {
      dispatch('WEBSOCKET_INIT', headers)
    }, delay)
  },

  // 订阅主题
  WEBSOCKET_SUBSCRIBE ({ commit, state }, { topic, callback }) {
    if (!state.connected || !state.stompClient) {
      // 添加到连接后执行的回调中
      state.connectionCallbacks.push(() => {
        const subscription = state.stompClient.subscribe(topic, callback)
        commit('ADD_SUBSCRIPTION', { topic, subscription })
      })
    } else {
      const subscription = state.stompClient.subscribe(topic, callback)
      commit('ADD_SUBSCRIPTION', { topic, subscription })
    }
  },

  // 取消订阅
  WEBSOCKET_UNSUBSCRIBE ({ commit, state }, topic) {
    const subscription = state.subscriptions.get(topic)
    if (subscription) {
      subscription.unsubscribe()
      commit('REMOVE_SUBSCRIPTION', topic)
    }
  },

  // 发送消息
  WEBSOCKET_SEND ({ state }, { topic, data, headers = {}}) {
    if (state.connected && state.stompClient) {
      state.stompClient.send(topic, headers, JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected, unable to send message')
    }
  },

  // 断开连接
  WEBSOCKET_DISCONNECT ({ commit, state }) {
    if (state.checkInterval) {
      clearInterval(state.checkInterval)
      commit('SET_CHECK_INTERVAL', null)
    }

    // 清理订阅
    state.subscriptions.forEach((subscription, topic) => {
      subscription.unsubscribe()
    })
    state.subscriptions.clear()

    if (state.stompClient && state.stompClient.connected) {
      state.stompClient.disconnect(() => {
        console.log('WebSocket disconnected')
      })
    }

    commit('SET_CONNECTION_STATUS', false)
    commit('SET_RECONNECTING', false)
    commit('SET_SOCKET', null)
    commit('SET_STOMP_CLIENT', null)
  }
}

const getters = {
  isConnected: state => state.connected,
  isReconnecting: state => state.reconnecting,
  connectionStatus: state => ({
    connected: state.connected,
    reconnecting: state.reconnecting,
    retryCount: state.retryCount,
    maxRetries: state.maxRetries
  })
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
