// AI模型API服务
import request from '@/utils/request'

// API基础路径 - 对应SCM后端SystemAIModelConfigController
const API_BASE = '/api/v1/ai/model/config'

/**
 * 获取模型列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 模型列表数据
 */
export function getModelConfigList (params) {
  return request({
    url: `${API_BASE}/source/list`,
    method: 'post',
    data: {
      current: params.current || 1,
      pageSize: params.pageSize || 10,
      owner: params.owner || '', // 模型拥有者
      keyword: params.keyword || '', // 搜索关键词
      providerName: params.providerName || '' // 供应商名称
    }
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
      name: data.name,
      type: data.type,
      providerName: data.providerName,
      permissionType: data.permissionType,
      status: data.status,
      owner: data.owner,
      ownerType: data.ownerType,
      baseName: data.baseName,
      appKey: data.appKey,
      apiUrl: data.apiUrl,
      advSettingDTOList: data.advSettingDTOList || []
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
 * 获取模型名称列表
 * @returns {Promise} - 模型名称列表
 */
export function getModelConfigNameList () {
  return request({
    url: `${API_BASE}/source/name/list`,
    method: 'get'
  })
}

// 个人模型相关API（如果需要支持个人级别的模型管理）

/**
 * 获取个人模型列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 个人模型列表数据
 */
export function getPersonalModelConfigList (params) {
  // 设置owner为当前用户ID，表示获取个人模型
  return getModelConfigList({
    ...params,
    owner: params.owner || getUserId() // 需要从用户状态中获取用户ID
  })
}

/**
 * 编辑个人模型配置
 * @param {Object} data - 模型配置数据
 * @returns {Promise} - 编辑结果
 */
export function editPersonalModelConfig (data) {
  // 设置为个人级别的模型
  return editModelConfig({
    ...data,
    owner: data.owner || getUserId(),
    ownerType: 'PERSONAL',
    permissionType: 'PRIVATE'
  })
}

/**
 * 获取个人模型详情
 * @param {string} id - 模型ID
 * @returns {Promise} - 模型详情数据
 */
export function getPersonalModelConfigDetail (id) {
  return getModelConfigDetail(id)
}

/**
 * 删除个人模型
 * @param {string} id - 模型ID
 * @returns {Promise} - 删除结果
 */
export function deletePersonalModelConfig (id) {
  return deleteModelConfig(id)
}

// 工具函数

/**
 * 获取当前用户ID
 * @returns {string} - 用户ID
 */
function getUserId () {
  // 这里需要根据SCM前端的用户状态管理方式来获取用户ID
  // 可能需要从Vuex store或者本地存储中获取
  try {
    // 假设从store中获取
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.id || ''
  } catch (e) {
    // 获取用户ID失败，使用默认值
    return ''
  }
}

// 导出所有API函数
export default {
  // 系统级模型API
  getModelConfigList,
  editModelConfig,
  getModelConfigDetail,
  deleteModelConfig,
  getModelConfigNameList,

  // 个人级模型API
  getPersonalModelConfigList,
  editPersonalModelConfig,
  getPersonalModelConfigDetail,
  deletePersonalModelConfig
}
