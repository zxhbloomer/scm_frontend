// 聊天组件统一导出文件
import ChatBubble from './HeWaChatBubble/index.vue' // 使用新的HeWa风格组件
import ChatPanel from './ChatPanel/ChatPanel.vue'
import chatMixin from './mixins/chatMixin'
import hewaAiMixin from './mixins/hewaAiMixin'

// 导出组件
export {
  ChatBubble,
  ChatPanel,
  chatMixin,
  hewaAiMixin
}

// 批量安装插件方法
export default {
  install (Vue) {
    // 注册全局组件
    Vue.component('ChatBubble', ChatBubble)
    Vue.component('ChatPanel', ChatPanel)

    // 注册全局混入（可选）
    // Vue.mixin(chatMixin)
  }
}

// Vuex模块导入辅助
export { default as chatStore } from '@/store/modules/chat'
