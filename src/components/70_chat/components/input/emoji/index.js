/**
 * Emoji模块导出入口
 * 70_chat emoji功能的统一导出
 */

// 导出主要组件
export { default as EmojiInput } from './EmojiInput.vue'

// 导出emoji数据
export { default as emojisData } from './emojisGroup.json'

// 导出工具函数
export * from './emojiUtils.js'

// 默认导出主组件
export { default } from './EmojiInput.vue'
