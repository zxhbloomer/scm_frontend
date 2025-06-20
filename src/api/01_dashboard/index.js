import request from '@/utils/request'

/**
 * 获取工作台配置
 * @param {*} data
 */
export function getInfoApi (query) {
  return request({
    url: '/api/v1/workbench/info',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-快捷操作配置
 * @param {*} data
 */
export function getQuickOperationApi (query) {
  return request({
    url: '/api/v1/workbench/quick',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-常用应用配置
 * @param {*} data
 */
export function getOfftenOperationApi (query) {
  return request({
    url: '/api/v1/workbench/offten',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-保存
 * @param {*} data
 */
export function saveInfoApi (query) {
  return request({
    url: '/api/v1/workbench/info/save',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-保存
 * @param {*} data
 */
export function resetInfoApi (query) {
  return request({
    url: '/api/v1/workbench/info/reset',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-快捷操作配置-保存
 * @param {*} data
 */
export function saveQuickApi (query) {
  return request({
    url: '/api/v1/workbench/quick/save',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-常用应用配置-保存
 * @param {*} data
 */
export function saveOfftenApi (query) {
  return request({
    url: '/api/v1/workbench/offten/save',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-待办事项
 * @param {*} data
 */
export function getTodoApi (query) {
  return request({
    url: '/api/v1/workbench/todo',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-待办超时提醒
 * @param {*} data
 */
export function getTodoOverTimeApi (query) {
  return request({
    url: '/api/v1/workbench/todo/overtime',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-待办超时提醒
 * @param {*} data
 */
export function getAlarmDataApi (query) {
  return request({
    url: '/api/v1/workbench/alarm',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-当月统计信息
 * @param {*} data
 */
export function getCurrentByMonthApi (query) {
  return request({
    url: '/api/v1/workbench/current/month',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-获取审批事项
 * @param {*} data
 */
export function getMatterDataApi (query) {
  return request({
    url: '/api/v1/workbench/matter/info',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-获取待办超时提醒
 * @param {*} data
 */
export function getRemindDataApi (query) {
  return request({
    url: '/api/v1/workbench/remind/info',
    method: 'post',
    data: query
  })
}

/**
 * 获取工作台配置-获取通知list
 * @param {*} data
 */
export function getNoticeListApi (query) {
  return request({
    url: '/api/v1/workbench/note/info',
    method: 'post',
    data: query
  })
}
