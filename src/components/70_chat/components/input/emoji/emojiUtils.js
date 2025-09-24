/**
 * Emoji工具函数
 * 基于chatwoot实现，适配70_chat使用
 */

// 统一的emoji正则表达式
const EMOJI_REGEX = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g

/**
 * 检测是否支持emoji字符集
 * 基于Modernizr emoji检测
 * @return {Boolean} true或false
 */
export const hasEmojiSupport = () => {
  const pixelRatio = window.devicePixelRatio || 1
  const offset = 12 * pixelRatio
  const node = document.createElement('canvas')

  // 检查canvastext支持
  if (
    !node.getContext ||
    !node.getContext('2d') ||
    typeof node.getContext('2d').fillText !== 'function'
  ) {
    return false
  }

  const ctx = node.getContext('2d')

  ctx.fillStyle = '#f00'
  ctx.textBaseline = 'top'
  ctx.font = '32px Arial'
  ctx.fillText('\ud83d\udc28', 0, 0) // U+1F428 KOALA
  return ctx.getImageData(offset, offset, 1, 1).data[0] !== 0
}

/**
 * 从文本中移除emoji
 * @param {string} text 输入文本
 * @return {string} 移除emoji后的文本
 */
export const removeEmoji = text => {
  if (text) {
    return text
      .replace(EMOJI_REGEX, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return ''
}

/**
 * 检查字符串是否包含emoji
 * @param {string} text 输入文本
 * @return {boolean} 是否包含emoji
 */
export const containsEmoji = text => {
  const regex = new RegExp(EMOJI_REGEX.source)
  return regex.test(text)
}

/**
 * 计算字符串中emoji的数量
 * @param {string} text 输入文本
 * @return {number} emoji数量
 */
export const countEmojis = text => {
  if (!text) return 0
  const emojiMatches = text.match(EMOJI_REGEX)
  return emojiMatches ? emojiMatches.length : 0
}

/**
 * 限制emoji数量
 * @param {string} text 输入文本
 * @param {number} maxCount 最大emoji数量
 * @return {string} 限制后的文本
 */
export const limitEmojis = (text, maxCount = 10) => {
  if (!text || countEmojis(text) <= maxCount) return text

  let result = ''
  let emojiCount = 0

  for (const char of text) {
    if (containsEmoji(char)) {
      if (emojiCount < maxCount) {
        result += char
        emojiCount++
      }
      // 超过限制就跳过这个emoji
    } else {
      result += char
    }
  }

  return result
}

/**
 * 获取随机emoji
 * @param {Array} emojis emoji列表
 * @return {string} 随机emoji
 */
export const getRandomEmoji = (emojis = []) => {
  if (!emojis.length) return '😀'
  const randomIndex = Math.floor(Math.random() * emojis.length)
  return emojis[randomIndex].emoji || emojis[randomIndex]
}
