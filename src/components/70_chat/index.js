// 聊天组件统一导出文件
import ChatBubble from './ChatBubble/ChatBubble.vue'
import ChatPanel from './ChatPanel/ChatPanel.vue'
import chatMixin from './mixins/chatMixin'

// 导出组件
export {
  ChatBubble,
  ChatPanel,
  chatMixin
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
export { default as chatStore } from '@/store/modules/70_chat/chat'
