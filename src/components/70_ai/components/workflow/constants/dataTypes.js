/**
 * Workflow 节点数据类型常量
 */

// 节点输入输出数据类型枚举
export const DATA_TYPES = {
  TEXT: 1, // 文本类型
  NUMBER: 2, // 数字类型
  OPTIONS: 3, // 选项类型(单选或多选)
  FILES: 4, // 文件类型
  BOOL: 5, // 布尔类型
  REF_INPUT: 6, // 引用输入(引用其他节点的输入)
  REF_OUTPUT: 7 // 引用输出(引用其他节点的输出)
}

// 数据类型中文名称映射
export const DATA_TYPE_LABELS = {
  [DATA_TYPES.TEXT]: '文本',
  [DATA_TYPES.NUMBER]: '数字',
  [DATA_TYPES.OPTIONS]: '选项',
  [DATA_TYPES.FILES]: '文件',
  [DATA_TYPES.BOOL]: '布尔',
  [DATA_TYPES.REF_INPUT]: '引用输入',
  [DATA_TYPES.REF_OUTPUT]: '引用输出'
}

// 数据类型图标映射
export const DATA_TYPE_ICONS = {
  [DATA_TYPES.TEXT]: 'el-icon-edit',
  [DATA_TYPES.NUMBER]: 'el-icon-s-data',
  [DATA_TYPES.OPTIONS]: 'el-icon-menu',
  [DATA_TYPES.FILES]: 'el-icon-document',
  [DATA_TYPES.BOOL]: 'el-icon-finished',
  [DATA_TYPES.REF_INPUT]: 'el-icon-top-left',
  [DATA_TYPES.REF_OUTPUT]: 'el-icon-bottom-right'
}

// 数据类型颜色映射
export const DATA_TYPE_COLORS = {
  [DATA_TYPES.TEXT]: '#409EFF',
  [DATA_TYPES.NUMBER]: '#67C23A',
  [DATA_TYPES.OPTIONS]: '#E6A23C',
  [DATA_TYPES.FILES]: '#909399',
  [DATA_TYPES.BOOL]: '#F56C6C',
  [DATA_TYPES.REF_INPUT]: '#409EFF',
  [DATA_TYPES.REF_OUTPUT]: '#67C23A'
}

// 数据类型默认值
export const DATA_TYPE_DEFAULTS = {
  [DATA_TYPES.TEXT]: '',
  [DATA_TYPES.NUMBER]: 0,
  [DATA_TYPES.OPTIONS]: [],
  [DATA_TYPES.FILES]: [],
  [DATA_TYPES.BOOL]: false,
  [DATA_TYPES.REF_INPUT]: null,
  [DATA_TYPES.REF_OUTPUT]: null
}

// 数据类型验证器
export const DATA_TYPE_VALIDATORS = {
  [DATA_TYPES.TEXT]: (value) => typeof value === 'string',
  [DATA_TYPES.NUMBER]: (value) => typeof value === 'number' && !isNaN(value),
  [DATA_TYPES.OPTIONS]: (value) => Array.isArray(value) || typeof value === 'string',
  [DATA_TYPES.FILES]: (value) => Array.isArray(value),
  [DATA_TYPES.BOOL]: (value) => typeof value === 'boolean',
  [DATA_TYPES.REF_INPUT]: (value) => value === null || (typeof value === 'object' && value.node_uuid && value.node_param_name),
  [DATA_TYPES.REF_OUTPUT]: (value) => value === null || (typeof value === 'object' && value.node_uuid && value.node_param_name)
}

// NodeIODefinition 默认结构
export const createNodeIODefinition = (type, name, title, required = false) => {
  return {
    uuid: '', // 由后端生成
    type,
    name,
    title,
    required,
    // type === FILES 时的额外字段
    limit: type === DATA_TYPES.FILES ? 10 : undefined,
    // type === OPTIONS 时的额外字段
    multiple: type === DATA_TYPES.OPTIONS ? false : undefined
  }
}

// NodeIORefDefinition 默认结构 (引用类型)
export const createNodeIORefDefinition = (name, nodeUuid, nodeParamName) => {
  return {
    uuid: '', // 由后端生成
    name,
    node_param_name: nodeParamName,
    node_uuid: nodeUuid
  }
}

// NodeIOData 默认结构
export const createNodeIOData = (title, type, value = null) => {
  return {
    title,
    type,
    value: value !== null ? value : DATA_TYPE_DEFAULTS[type]
  }
}

// 判断是否为引用类型
export const isReferenceType = (type) => {
  return type === DATA_TYPES.REF_INPUT || type === DATA_TYPES.REF_OUTPUT
}

// 判断数据类型是否需要用户输入
export const requiresUserInput = (type) => {
  return [
    DATA_TYPES.TEXT,
    DATA_TYPES.NUMBER,
    DATA_TYPES.OPTIONS,
    DATA_TYPES.FILES,
    DATA_TYPES.BOOL
  ].includes(type)
}

// 格式化数据类型值
export const formatDataValue = (type, value) => {
  switch (type) {
    case DATA_TYPES.TEXT:
      return String(value || '')
    case DATA_TYPES.NUMBER:
      return Number(value) || 0
    case DATA_TYPES.OPTIONS:
      return Array.isArray(value) ? value : [value].filter(Boolean)
    case DATA_TYPES.FILES:
      return Array.isArray(value) ? value : []
    case DATA_TYPES.BOOL:
      return Boolean(value)
    case DATA_TYPES.REF_INPUT:
    case DATA_TYPES.REF_OUTPUT:
      return value || null
    default:
      return value
  }
}

// HTTP请求内容类型
export const HTTP_CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain'
}

// HTTP请求方法
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
}

// 运算符类型 (用于Branch节点的条件判断)
export const OPERATORS = {
  EQUALS: 'equals', // 等于
  NOT_EQUALS: 'not_equals', // 不等于
  GREATER_THAN: 'greater_than', // 大于
  GREATER_THAN_OR_EQUALS: 'greater_than_or_equals', // 大于等于
  LESS_THAN: 'less_than', // 小于
  LESS_THAN_OR_EQUALS: 'less_than_or_equals', // 小于等于
  CONTAINS: 'contains', // 包含
  NOT_CONTAINS: 'not_contains', // 不包含
  STARTS_WITH: 'starts_with', // 开头是
  ENDS_WITH: 'ends_with', // 结尾是
  IS_EMPTY: 'is_empty', // 为空
  IS_NOT_EMPTY: 'is_not_empty', // 不为空
  AND: 'and', // 与
  OR: 'or' // 或
}

// 运算符中文名称映射
export const OPERATOR_LABELS = {
  [OPERATORS.EQUALS]: '等于',
  [OPERATORS.NOT_EQUALS]: '不等于',
  [OPERATORS.GREATER_THAN]: '大于',
  [OPERATORS.GREATER_THAN_OR_EQUALS]: '大于等于',
  [OPERATORS.LESS_THAN]: '小于',
  [OPERATORS.LESS_THAN_OR_EQUALS]: '小于等于',
  [OPERATORS.CONTAINS]: '包含',
  [OPERATORS.NOT_CONTAINS]: '不包含',
  [OPERATORS.STARTS_WITH]: '开头是',
  [OPERATORS.ENDS_WITH]: '结尾是',
  [OPERATORS.IS_EMPTY]: '为空',
  [OPERATORS.IS_NOT_EMPTY]: '不为空',
  [OPERATORS.AND]: '与',
  [OPERATORS.OR]: '或'
}
