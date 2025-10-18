// 聊天组件统一导出文件
// 基于Chatwoot架构的标准化聊天模块

// Bubble组件（悬浮聊天气泡）
import ChatBubble from '@/components/70_ai/components/chat/bubbles/ChatBubble.vue'

// 消息组件
import MessageList from '@/components/70_ai/components/chat/messages/MessageList.vue'

// 输入组件
import ChatInputWrap from '@/components/70_ai/components/chat/input/ChatInputWrap.vue'

// 面板组件
import ChatPanel from '@/components/70_ai/components/chat/panels/ChatPanel.vue'
import ChatHeader from '@/components/70_ai/components/chat/panels/ChatHeader.vue'
import ChatFooter from '@/components/70_ai/components/chat/panels/ChatFooter.vue'

// 反馈组件
import FeedbackPanel from '@/components/70_ai/components/chat/feedback/FeedbackPanel.vue'

// API服务
import aiChatService from './api/aiChatService.js'

// 工具和混入
import chatMixin from './utils/chatMixin.js'

// Store模块
import aiStoreModules from './store'

// 导出所有组件
export {
  // 主要组件
  ChatBubble,

  // 消息相关
  MessageList,

  // 输入相关
  ChatInputWrap,

  // 面板相关
  ChatPanel,
  ChatHeader,
  ChatFooter,

  // 反馈相关
  FeedbackPanel,

  // 服务和工具
  aiChatService,
  chatMixin
}

// Vue插件安装方法
export default {
  install (Vue, options = {}) {
    // 动态注册Vuex Store模块
    const { store } = options
    if (store && !store.state.chat) {
      store.registerModule('chat', aiStoreModules.modules.chat)
    }

    // 注册全局组件
    Vue.component('ChatBubble', ChatBubble)
    Vue.component('ChatPanel', ChatPanel)
    Vue.component('MessageList', MessageList)
    Vue.component('ChatInputWrap', ChatInputWrap)
    Vue.component('ChatHeader', ChatHeader)
    Vue.component('ChatFooter', ChatFooter)
    Vue.component('FeedbackPanel', FeedbackPanel)

    // 全局混入（可选）
    if (options.enableMixin) {
      Vue.mixin(chatMixin)
    }

    // 配置AI服务（可选）
    if (options.aiServiceConfig) {
      Object.assign(aiChatService, options.aiServiceConfig)
    }

    // 在Vue原型上添加AI服务
    Vue.prototype.$aiChat = aiChatService
  }
}

// Vuex模块已通过动态注册方式集成
// Store模块会在插件install时自动注册到全局store

// 样式文件导入（如果需要全局样式）
// import './styles/chat.scss'
