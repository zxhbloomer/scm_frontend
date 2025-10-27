/**
 * AI模块 - Vuex Store 入口
 * 用于动态注册到全局 Store
 */
import app from './modules/app'
import chat from './modules/chat'
import workflow from './modules/workflow'
import workflowRuntime from './modules/workflowRuntime'

export default {
  modules: {
    app,
    chat,
    workflow,
    workflowRuntime
  }
}

// 同时导出单个模块供直接引用
export { app, chat, workflow, workflowRuntime }
