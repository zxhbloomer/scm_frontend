// 聊天模块API导出文件
export { default as chatAPI, wsConfig } from './chat'

// 便捷方法导出
export {
  initSession,
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount,
  endSession,
  getAgentStatus,
  uploadFile,
  getChatConfig
} from './chat'
