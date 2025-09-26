// AI模型工具函数
import {
  ModelBaseTypeEnum,
  baseModelTypeMap,
  defaultAdvancedSetValueMap,
  DEEP_SEEK_REASONER,
  DEEP_SEEK_CHAT
} from '../constants/model'

/**
 * AppKey脱敏处理
 * @param {string} key - 原始AppKey
 * @returns {string} - 脱敏后的AppKey
 */
export function maskAppKey (key) {
  if (!key || typeof key !== 'string') {
    return ''
  }

  const len = key.length
  if (len <= 8) {
    return key.substring(0, 4) + '****'
  }

  // 显示前4位和后4位，中间用****代替
  return key.substring(0, 4) + '****' + key.substring(len - 4)
}

/**
 * 获取模型图标
 * @param {Object} modelItem - 模型项
 * @returns {string} - 图标名称
 */
export function getModelSvg (modelItem) {
  switch (modelItem.providerName) {
    case ModelBaseTypeEnum.DeepSeek:
      return 'deepSeek'
    case ModelBaseTypeEnum.ZhiPuAI:
      return 'zhiPuAi'
    case ModelBaseTypeEnum.OpenAI:
      return 'openAi'
    default:
      return 'openAi'
  }
}

/**
 * 获取模型默认配置
 * @param {string} supplierType - 供应商类型
 * @param {string} baseModelType - 基础模型类型
 * @returns {Array} - 默认配置数组
 */
export function getModelDefaultConfig (supplierType, baseModelType = '') {
  const defaultAdvancedSetValue = defaultAdvancedSetValueMap
  let lastDefaultValue = []

  switch (supplierType) {
    case ModelBaseTypeEnum.OpenAI:
    case ModelBaseTypeEnum.ZhiPuAI:
    case ModelBaseTypeEnum.QianFan:
    case ModelBaseTypeEnum.Ollama: {
      const includesBaseModelValues = baseModelTypeMap[supplierType]?.map(e => e.value) || []
      lastDefaultValue = includesBaseModelValues.includes(baseModelType) ? defaultAdvancedSetValue[supplierType] : []
      break
    }
    case ModelBaseTypeEnum.DeepSeek:
      if (baseModelType.toUpperCase().includes('REASONER')) {
        lastDefaultValue = DEEP_SEEK_REASONER
      } else if (baseModelType.toUpperCase().includes('CHAT')) {
        lastDefaultValue = DEEP_SEEK_CHAT
      } else {
        lastDefaultValue = []
      }
      break
    default:
      lastDefaultValue = []
      break
  }

  // 返回配置的深拷贝
  return lastDefaultValue.map(e => ({ ...e }))
}

/**
 * 搜索过滤基础模型选项
 * @param {Array} options - 原始选项
 * @param {string} searchValue - 搜索值
 * @returns {Array} - 过滤后的选项
 */
export function filterBaseModelOptions (options, searchValue) {
  if (!searchValue) {
    return options.map(e => ({ ...e, isShow: true }))
  }

  return options.map(e => ({
    ...e,
    isShow: (e.label || '').toLowerCase().includes(searchValue.toLowerCase())
  }))
}

/**
 * 验证模型参数
 * @param {Object} modelParams - 模型参数
 * @returns {Object} - 验证结果
 */
export function validateModelParams (modelParams) {
  const errors = {}

  if (!modelParams.name || !modelParams.name.trim()) {
    errors.name = '模型名称不能为空'
  }

  if (!modelParams.type) {
    errors.type = '模型类型不能为空'
  }

  if (!modelParams.baseName || !modelParams.baseName.trim()) {
    errors.baseName = '基础模型不能为空'
  }

  if (!modelParams.apiUrl || !modelParams.apiUrl.trim()) {
    errors.apiUrl = 'API地址不能为空'
  }

  if (!modelParams.appKey || !modelParams.appKey.trim()) {
    errors.appKey = 'API密钥不能为空'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * 转换模型配置数据格式 - 适配SCM后端
 * @param {Object} modelConfig - 模型配置
 * @returns {Object} - 转换后的配置
 */
export function transformModelConfig (modelConfig) {
  return {
    id: modelConfig.id || '',
    name: modelConfig.name || '',
    type: modelConfig.type || 'LLM',
    providerName: modelConfig.providerName || ModelBaseTypeEnum.DeepSeek,
    permissionType: modelConfig.permissionType || 'PUBLIC',
    status: modelConfig.status !== false, // 默认启用
    owner: modelConfig.owner || '',
    ownerType: modelConfig.ownerType || 'SYSTEM',
    baseName: modelConfig.baseName || '',
    appKey: modelConfig.appKey || '',
    apiUrl: modelConfig.apiUrl || '',
    advSettingDTOList: modelConfig.advSettingDTOList || []
  }
}

/**
 * 格式化创建时间
 * @param {number|string} timestamp - 时间戳
 * @returns {string} - 格式化后的时间
 */
export function formatCreateTime (timestamp) {
  if (!timestamp) return '-'

  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取模型状态文本
 * @param {boolean} status - 模型状态
 * @returns {string} - 状态文本
 */
export function getModelStatusText (status) {
  return status ? '已启用' : '已禁用'
}

/**
 * 字符长度限制处理
 * @param {string} str - 原始字符串
 * @param {number} limit - 长度限制
 * @returns {string} - 处理后的字符串
 */
export function characterLimit (str, limit = 20) {
  if (!str || str.length <= limit) {
    return str
  }
  return str.substring(0, limit) + '...'
}
