/**
 * AI模块 - Vuex Store 入口
 * 用于动态注册到全局 Store
 */
import chat from './modules/chat'

export default {
  modules: {
    chat
  }
}

// 同时导出单个模块供直接引用
export { chat }
