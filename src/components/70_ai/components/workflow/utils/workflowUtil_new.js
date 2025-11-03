/**
 * Workflow 工具函数
 * 适配 Vue 2.7.16 + AntV X6
 */

import { nanoid } from 'nanoid'

/**
 * 生成工作流UUID (32位不带横线)
 * @returns {string}
 */
export function generateUuid () {
  return nanoid(32).replace(/-/g, '')
}
