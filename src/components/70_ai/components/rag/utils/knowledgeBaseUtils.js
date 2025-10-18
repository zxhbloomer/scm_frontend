/**
 * 知识库工具函数
 */

import { EMPTY_KB_INFO, EMPTY_KB_ITEM, EMPTY_QA_RECORD } from '../constants/knowledgeBase'

/**
 * 创建空的知识库信息对象
 */
export function createEmptyKbInfo () {
  return JSON.parse(JSON.stringify(EMPTY_KB_INFO))
}

/**
 * 创建空的知识项对象
 */
export function createEmptyKbItem () {
  return JSON.parse(JSON.stringify(EMPTY_KB_ITEM))
}

/**
 * 创建空的QA记录对象
 */
export function createEmptyQaRecord () {
  return JSON.parse(JSON.stringify(EMPTY_QA_RECORD))
}

/**
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 */
export function getFileExtension (fileName) {
  if (!fileName) return ''
  return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
}

/**
 * 获取文件MIME类型
 * @param {string} fileName - 文件名
 */
export function getFileMimeType (fileName) {
  const ext = getFileExtension(fileName)
  const mimeTypes = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    html: 'text/html',
    txt: 'text/plain'
  }
  return mimeTypes[ext] || 'text/plain'
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 */
export function formatFileSize (bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取Token（从Cookie）
 */
export function getTokenFromCookie () {
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(row => row.trim().startsWith('wms-Token='))
  return tokenCookie ? tokenCookie.split('=')[1] : ''
}

/**
 * 深度复制对象
 * @param {*} obj - 要复制的对象
 */
export function deepCopy (obj) {
  return JSON.parse(JSON.stringify(obj))
}
