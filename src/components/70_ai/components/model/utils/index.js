/**
 * AI模型工具模块
 * 导出模型相关的API函数
 */

import { getLlmModels, getVisionModels, getEmbeddingModels, getModelConfigList } from '@/components/70_ai/api/model'

/**
 * 获取模型列表（兼容workflow使用）
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export async function modelList (params) {
  // 如果params中有page和pageSize，转换为对应的参数
  // 新系统中getModelConfigList不使用分页参数
  return getModelConfigList({
    keyword: params.keyword || '',
    providerName: params.providerName || ''
  })
}

/**
 * 获取LLM模型列表
 */
export function modelListLlm () {
  return getLlmModels()
}

/**
 * 获取视觉模型列表
 */
export function modelListVision () {
  return getVisionModels()
}

/**
 * 获取嵌入模型列表
 */
export function modelListEmbedding () {
  return getEmbeddingModels()
}

export default {
  modelList,
  modelListLlm,
  modelListVision,
  modelListEmbedding
}
