/**
 * Workflow SSE (Server-Sent Events) 事件类型常量
 * 用于工作流实时运行反馈
 * 基于 aideepin 原始实现
 */

// SSE 事件类型枚举
export const SSE_EVENT_TYPES = {
  START: 'START', // 工作流开始
  NODE_RUN: 'NODE_RUN', // 节点开始运行
  NODE_INPUT: 'NODE_INPUT', // 节点输入数据
  NODE_CHUNK: 'NODE_CHUNK', // 节点流式输出chunk
  NODE_OUTPUT: 'NODE_OUTPUT', // 节点输出数据
  NODE_WAIT_FEEDBACK: 'NODE_WAIT_FEEDBACK', // 节点等待人工反馈
  DONE: 'DONE', // 工作流完成
  ERROR: 'ERROR' // 工作流错误
}

// SSE 事件类型前缀 (用于解析事件类型)
export const SSE_EVENT_PREFIXES = {
  START: '[START]',
  NODE_RUN: '[NODE_RUN_', // 后跟节点UUID,如 [NODE_RUN_abc123]
  NODE_INPUT: '[NODE_INPUT_', // 后跟节点UUID
  NODE_CHUNK: '[NODE_CHUNK_', // 后跟节点UUID
  NODE_OUTPUT: '[NODE_OUTPUT_', // 后跟节点UUID
  NODE_WAIT_FEEDBACK: '[NODE_WAIT_FEEDBACK_BY_', // 后跟节点UUID
  DONE: '[DONE]',
  ERROR: '[ERROR]'
}

// SSE 事件类型中文名称映射
export const SSE_EVENT_LABELS = {
  [SSE_EVENT_TYPES.START]: '开始运行',
  [SSE_EVENT_TYPES.NODE_RUN]: '节点运行',
  [SSE_EVENT_TYPES.NODE_INPUT]: '节点输入',
  [SSE_EVENT_TYPES.NODE_CHUNK]: '节点输出流',
  [SSE_EVENT_TYPES.NODE_OUTPUT]: '节点输出',
  [SSE_EVENT_TYPES.NODE_WAIT_FEEDBACK]: '等待反馈',
  [SSE_EVENT_TYPES.DONE]: '运行完成',
  [SSE_EVENT_TYPES.ERROR]: '运行错误'
}

// SSE 事件类型图标映射
export const SSE_EVENT_ICONS = {
  [SSE_EVENT_TYPES.START]: 'el-icon-video-play',
  [SSE_EVENT_TYPES.NODE_RUN]: 'el-icon-loading',
  [SSE_EVENT_TYPES.NODE_INPUT]: 'el-icon-download',
  [SSE_EVENT_TYPES.NODE_CHUNK]: 'el-icon-document',
  [SSE_EVENT_TYPES.NODE_OUTPUT]: 'el-icon-upload2',
  [SSE_EVENT_TYPES.NODE_WAIT_FEEDBACK]: 'el-icon-warning',
  [SSE_EVENT_TYPES.DONE]: 'el-icon-success',
  [SSE_EVENT_TYPES.ERROR]: 'el-icon-error'
}

// SSE 事件类型颜色映射
export const SSE_EVENT_COLORS = {
  [SSE_EVENT_TYPES.START]: '#67C23A',
  [SSE_EVENT_TYPES.NODE_RUN]: '#409EFF',
  [SSE_EVENT_TYPES.NODE_INPUT]: '#909399',
  [SSE_EVENT_TYPES.NODE_CHUNK]: '#409EFF',
  [SSE_EVENT_TYPES.NODE_OUTPUT]: '#67C23A',
  [SSE_EVENT_TYPES.NODE_WAIT_FEEDBACK]: '#E6A23C',
  [SSE_EVENT_TYPES.DONE]: '#67C23A',
  [SSE_EVENT_TYPES.ERROR]: '#F56C6C'
}

/**
 * 解析 SSE 事件行
 * @param {string} line - SSE 事件行,格式: event: [EVENT_TYPE] 或 data: {...}
 * @returns {object|null} - 解析后的事件对象 { type, nodeUuid?, data? }
 */
export const parseSSEEventLine = (line) => {
  if (!line || typeof line !== 'string') {
    return null
  }

  // 解析 event: [EVENT_TYPE] 行
  if (line.startsWith('event:')) {
    const eventContent = line.substring(6).trim()

    // [START]
    if (eventContent === SSE_EVENT_PREFIXES.START) {
      return { type: SSE_EVENT_TYPES.START }
    }

    // [DONE]
    if (eventContent === SSE_EVENT_PREFIXES.DONE) {
      return { type: SSE_EVENT_TYPES.DONE }
    }

    // [ERROR]
    if (eventContent === SSE_EVENT_PREFIXES.ERROR) {
      return { type: SSE_EVENT_TYPES.ERROR }
    }

    // [NODE_RUN_uuid]
    if (eventContent.startsWith(SSE_EVENT_PREFIXES.NODE_RUN)) {
      const nodeUuid = eventContent
        .substring(SSE_EVENT_PREFIXES.NODE_RUN.length)
        .replace(']', '')
      return { type: SSE_EVENT_TYPES.NODE_RUN, nodeUuid }
    }

    // [NODE_INPUT_uuid]
    if (eventContent.startsWith(SSE_EVENT_PREFIXES.NODE_INPUT)) {
      const nodeUuid = eventContent
        .substring(SSE_EVENT_PREFIXES.NODE_INPUT.length)
        .replace(']', '')
      return { type: SSE_EVENT_TYPES.NODE_INPUT, nodeUuid }
    }

    // [NODE_CHUNK_uuid]
    if (eventContent.startsWith(SSE_EVENT_PREFIXES.NODE_CHUNK)) {
      const nodeUuid = eventContent
        .substring(SSE_EVENT_PREFIXES.NODE_CHUNK.length)
        .replace(']', '')
      return { type: SSE_EVENT_TYPES.NODE_CHUNK, nodeUuid }
    }

    // [NODE_OUTPUT_uuid]
    if (eventContent.startsWith(SSE_EVENT_PREFIXES.NODE_OUTPUT)) {
      const nodeUuid = eventContent
        .substring(SSE_EVENT_PREFIXES.NODE_OUTPUT.length)
        .replace(']', '')
      return { type: SSE_EVENT_TYPES.NODE_OUTPUT, nodeUuid }
    }

    // [NODE_WAIT_FEEDBACK_BY_uuid]
    if (eventContent.startsWith(SSE_EVENT_PREFIXES.NODE_WAIT_FEEDBACK)) {
      const nodeUuid = eventContent
        .substring(SSE_EVENT_PREFIXES.NODE_WAIT_FEEDBACK.length)
        .replace(']', '')
      return { type: SSE_EVENT_TYPES.NODE_WAIT_FEEDBACK, nodeUuid }
    }
  }

  // 解析 data: {...} 行
  if (line.startsWith('data:')) {
    const dataContent = line.substring(5).trim()
    try {
      const data = JSON.parse(dataContent)
      return { data }
    } catch (e) {
      console.error('Failed to parse SSE data:', dataContent, e)
      return { data: dataContent }
    }
  }

  return null
}

/**
 * 创建 SSE 事件对象
 * @param {string} type - 事件类型
 * @param {object} payload - 事件数据
 * @returns {object} - SSE 事件对象
 */
export const createSSEEvent = (type, payload = {}) => {
  return {
    type,
    timestamp: Date.now(),
    ...payload
  }
}

/**
 * 判断是否为节点相关事件
 * @param {string} type - 事件类型
 * @returns {boolean}
 */
export const isNodeEvent = (type) => {
  return [
    SSE_EVENT_TYPES.NODE_RUN,
    SSE_EVENT_TYPES.NODE_INPUT,
    SSE_EVENT_TYPES.NODE_CHUNK,
    SSE_EVENT_TYPES.NODE_OUTPUT,
    SSE_EVENT_TYPES.NODE_WAIT_FEEDBACK
  ].includes(type)
}

/**
 * 判断是否为工作流级别事件
 * @param {string} type - 事件类型
 * @returns {boolean}
 */
export const isWorkflowEvent = (type) => {
  return [
    SSE_EVENT_TYPES.START,
    SSE_EVENT_TYPES.DONE,
    SSE_EVENT_TYPES.ERROR
  ].includes(type)
}

/**
 * 判断是否为终止事件
 * @param {string} type - 事件类型
 * @returns {boolean}
 */
export const isTerminalEvent = (type) => {
  return [
    SSE_EVENT_TYPES.DONE,
    SSE_EVENT_TYPES.ERROR
  ].includes(type)
}

// SSE 连接配置
export const SSE_CONFIG = {
  // 重连间隔(毫秒)
  RECONNECT_INTERVAL: 3000,
  // 最大重连次数
  MAX_RECONNECT_ATTEMPTS: 3,
  // 连接超时时间(毫秒)
  CONNECTION_TIMEOUT: 30000,
  // 心跳间隔(毫秒)
  HEARTBEAT_INTERVAL: 5000
}

// SSE 错误类型
export const SSE_ERROR_TYPES = {
  CONNECTION_FAILED: 'connection_failed',
  TIMEOUT: 'timeout',
  PARSE_ERROR: 'parse_error',
  UNKNOWN: 'unknown'
}

// SSE 错误消息映射
export const SSE_ERROR_MESSAGES = {
  [SSE_ERROR_TYPES.CONNECTION_FAILED]: '连接服务器失败',
  [SSE_ERROR_TYPES.TIMEOUT]: '连接超时',
  [SSE_ERROR_TYPES.PARSE_ERROR]: '数据解析错误',
  [SSE_ERROR_TYPES.UNKNOWN]: '未知错误'
}
