/**
 * RAG工具模块统一导出
 * 导出知识库API函数和工具函数
 */

import knowledgeBaseService from '@/components/70_ai/api/knowledgeBaseService'

/**
 * 搜索我的知识库
 */
export async function knowledgeBaseSearchMine (query, currentPage = 1, pageSize = 10) {
  return knowledgeBaseService.searchMine(query, currentPage, pageSize)
}

/**
 * 搜索公开知识库
 */
export async function knowledgeBaseSearchPublic (query, currentPage = 1, pageSize = 10) {
  return knowledgeBaseService.searchPublic(query, currentPage, pageSize)
}

/**
 * 获取知识库详情
 */
export async function knowledgeBaseInfo (uuid) {
  return knowledgeBaseService.getInfo(uuid)
}

// 导出工具函数
export {
  createEmptyKbInfo,
  createEmptyKbItem,
  createEmptyQaRecord,
  getFileExtension,
  getFileMimeType,
  formatFileSize,
  getTokenFromCookie,
  deepCopy
} from './knowledgeBaseUtils'
