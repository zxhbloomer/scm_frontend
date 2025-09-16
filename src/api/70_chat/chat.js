import request from '@/utils/request'

const API_BASE = '/chat'

// 聊天API封装
export default {
  // 初始化聊天会话
  initSession (data = {}) {
    return request({
      url: `${API_BASE}/session/init`,
      method: 'post',
      data: {
        user_id: data.userId || null,
        user_name: data.userName || '访客',
        user_email: data.userEmail || null,
        source: 'scm_system',
        ...data
      }
    })
  },

  // 发送消息
  sendMessage (sessionId, content, type = 'text') {
    return request({
      url: `${API_BASE}/messages`,
      method: 'post',
      data: {
        session_id: sessionId,
        content,
        message_type: type,
        sender_type: 'user'
      }
    })
  },

  // 获取历史消息
  getMessages (sessionId, params = {}) {
    return request({
      url: `${API_BASE}/messages`,
      method: 'get',
      params: {
        session_id: sessionId,
        page: params.page || 1,
        size: params.size || 20,
        ...params
      }
    })
  },

  // 标记消息已读
  markAsRead (sessionId, messageIds = []) {
    return request({
      url: `${API_BASE}/messages/read`,
      method: 'post',
      data: {
        session_id: sessionId,
        message_ids: messageIds
      }
    })
  },

  // 获取未读消息数
  getUnreadCount (sessionId) {
    return request({
      url: `${API_BASE}/messages/unread-count`,
      method: 'get',
      params: {
        session_id: sessionId
      }
    })
  },

  // 结束聊天会话
  endSession (sessionId) {
    return request({
      url: `${API_BASE}/session/end`,
      method: 'post',
      data: {
        session_id: sessionId
      }
    })
  },

  // 获取客服状态
  getAgentStatus () {
    return request({
      url: `${API_BASE}/agent/status`,
      method: 'get'
    })
  },

  // 上传文件
  uploadFile (file, sessionId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('session_id', sessionId)

    return request({
      url: `${API_BASE}/upload`,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取聊天配置
  getChatConfig () {
    return request({
      url: `${API_BASE}/config`,
      method: 'get'
    })
  }
}

// WebSocket连接配置
export const wsConfig = {
  // WebSocket连接地址
  getWsUrl () {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NODE_ENV === 'development'
      ? '127.0.0.1:8088'
      : window.location.host
    return `${protocol}//${host}/ws/chat`
  },

  // SockJS连接配置
  sockJSOptions: {
    transports: ['websocket', 'xhr-polling'],
    heartbeat_delay: 30000,
    disconnect_delay: 5000
  }
}
