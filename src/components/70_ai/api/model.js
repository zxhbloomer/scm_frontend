// AI模型API服务
import request from '@/utils/request'

// API基础路径 - 对应SCM后端AiModelConfigController
const API_BASE = '/api/v1/ai/model/config'

/**
 * 获取模型列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 模型列表数据
 */
export function getModelConfigList (params) {
  const data = {
    keyword: params.keyword || '' // 搜索关键词
  }

  // 只有提供了providerName且不为空时，才添加到请求参数中
  if (params.providerName) {
    data.providerName = params.providerName
  }

  return request({
    url: `${API_BASE}/source/list`,
    method: 'post',
    data
    // 删除了owner字段 - 新系统不使用owner
    // 删除了分页参数 - 新系统不分页
  })
}

/**
 * 编辑模型配置
 * @param {Object} data - 模型配置数据
 * @returns {Promise} - 编辑结果
 */
export function editModelConfig (data) {
  return request({
    url: `${API_BASE}/edit-source`,
    method: 'post',
    data: {
      id: data.id || undefined,
      modelName: data.modelName, // 字段名从name改为modelName
      modelType: data.modelType, // 字段名从type改为modelType
      provider: data.provider, // 字段名从providerName改为provider
      enabled: data.enabled, // 字段名从status改为enabled
      deploymentName: data.deploymentName, // 字段名从baseName改为deploymentName
      apiKey: data.apiKey, // 字段名从appKey改为apiKey
      baseUrl: data.baseUrl, // 字段名从apiUrl改为baseUrl
      // 高级参数直接字段
      temperature: data.temperature,
      maxTokens: data.maxTokens,
      topP: data.topP,
      timeout: data.timeout,
      // 模型能力标记
      supportChat: data.supportChat,
      supportVision: data.supportVision,
      supportEmbedding: data.supportEmbedding
      // 删除了owner, ownerType, permissionType字段 - 新系统不使用
      // 删除了advSettingDTOList - 改为直接字段
    }
  })
}

/**
 * 获取模型详情
 * @param {string} id - 模型ID
 * @returns {Promise} - 模型详情数据
 */
export function getModelConfigDetail (id) {
  return request({
    url: `${API_BASE}/get/${id}`,
    method: 'get'
  })
}

/**
 * 删除模型
 * @param {string} id - 模型ID
 * @returns {Promise} - 删除结果
 */
export function deleteModelConfig (id) {
  return request({
    url: `${API_BASE}/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 获取可用的语言模型列表
 * @returns {Promise} - 语言模型列表
 */
export function getLlmModels () {
  return request({
    url: `${API_BASE}/llm-models`,
    method: 'post'
  })
}

/**
 * 获取可用的视觉模型列表
 * @returns {Promise} - 视觉模型列表
 */
export function getVisionModels () {
  return request({
    url: `${API_BASE}/vision-models`,
    method: 'post'
  })
}

/**
 * 获取可用的嵌入模型列表
 * @returns {Promise} - 嵌入模型列表
 */
export function getEmbeddingModels () {
  return request({
    url: `${API_BASE}/embedding-models`,
    method: 'post'
  })
}

/**
 * 获取默认模型配置
 * @returns {Promise} - 默认模型配置 {defaultLlm: modelId, defaultVision: modelId, defaultEmbedding: modelId}
 */
export function getDefaultModels () {
  return request({
    url: `${API_BASE}/default-models`,
    method: 'post'
  })
}

/**
 * 设置默认模型
 * @param {Object} data - 默认模型配置数据
 * @param {string} data.modelType - 模型类型：LLM/VISION/EMBEDDING
 * @param {number} data.modelId - 模型ID
 * @returns {Promise} - 设置结果
 */
export function setDefaultModel (data) {
  return request({
    url: `${API_BASE}/default-model`,
    method: 'post',
    data: {
      modelType: data.modelType,
      modelId: data.modelId
    }
  })
}

// 删除了getModelConfigNameList - 新系统暂不需要此接口
// 删除了个人模型相关API - 新系统不区分个人/系统模型

// 导出所有API函数
export default {
  getModelConfigList,
  editModelConfig,
  getModelConfigDetail,
  deleteModelConfig,
  getLlmModels,
  getVisionModels,
  getEmbeddingModels,
  getDefaultModels,
  setDefaultModel
}
