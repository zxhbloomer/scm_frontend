/**
 * AI模块 - Vuex Store 入口
 * 用于动态注册到全局 Store
 */
import chat from './modules/chat'
import workflow from './modules/workflow'
import workflowRuntime from './modules/workflowRuntime'

export default {
  modules: {
    chat,
    workflow,
    workflowRuntime
  }
}

// 同时导出单个模块供直接引用
export { chat, workflow, workflowRuntime }
