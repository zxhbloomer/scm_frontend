import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/inv2/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getTodoCountApi (query) {
  return request({
    url: '/api/v1/in/todo/count',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/inv2/list/sum',
    method: 'post',
    data: query
  })
}

/**
 * 查询明细逻辑
 * @param {*} data
 */
export function getApi (query) {
  return request({
    url: '/api/v1/inv2/get',
    method: 'post',
    data: query
  })
}

/**
 * 更新api
 * @param {*} data
 */
export function updateApi (data) {
  return request({
    url: '/api/v1/inv2/save',
    method: 'post',
    data
  })
}

/**
 * 插入api
 * @param {*} data
 */
export function insertApi (data) {
  return request({
    url: '/api/v1/inv2/insert',
    method: 'post',
    data
  })
}

/**
 * 提交api
 * @param {*} data
 */
export function submitApi (data) {
  return request({
    url: '/api/v1/inv2/submit',
    method: 'post',
    data
  })
}

/**
 * 审核api
 * @param {*} data
 */
export function auditApi (data) {
  return request({
    url: '/api/v1/inv2/audit',
    method: 'post',
    data
  })
}

/**
 * 驳回api
 * @param {*} data
 */
export function returnApi (data) {
  return request({
    url: '/api/v1/inv2/return',
    method: 'post',
    data
  })
}

/**
 * 作废审核api
 * @param {*} data
 */
export function cancelAuditApi (data) {
  return request({
    url: '/api/v1/inv2/cancelaudit',
    method: 'post',
    data
  })
}

/**
 * 作废驳回api
 * @param {*} data
 */
export function cancelReturnApi (data) {
  return request({
    url: '/api/v1/inv2/cancelreturn',
    method: 'post',
    data
  })
}

/**
 * 作废api
 * @param {*} data
 */
export function cancelApi (data) {
  return request({
    url: '/api/v1/inv2/cancel',
    method: 'post',
    data
  })
}

/**
 * 作废api
 * @param {*} data
 */
export function cancelDirectApi (data) {
  return request({
    url: '/api/v1/inv2/canceldirect',
    method: 'post',
    data
  })
}

/**
 * 同步所有数据
 * @param {*} data
 */
export function syncAllApi (data) {
  return request({
    url: '/api/v1/inv2/syncall',
    method: 'post',
    data
  })
}

/**
 * 同步选中数据
 * @param {*} data
 */
export function syncApi (data) {
  return request({
    url: '/api/v1/inv2/sync',
    method: 'post',
    data
  })
}

/**
 * 导入逻辑
 * @param {*} data
 */
export function importBInApi (data) {
  return request({
    url: '/api/v1/inv2/import',
    method: 'post',
    data
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportBInApi (data) {
  return request({
    url: '/api/v1/inv2/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportAllBInApi (data) {
  return request({
    url: '/api/v1/inv2/export_all',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getCountApi (query) {
  return request({
    url: '/api/v1/inv2/list/count',
    method: 'post',
    data: query
  })
}

/**
 * 校验数据
 */
export function validateApi (query) {
  return request({
    url: '/api/v1/inv2/validate',
    method: 'post',
    data: query
  })
}
