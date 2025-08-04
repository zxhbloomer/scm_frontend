import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/project/pagelist',
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
    url: '/api/v1/project/list/sum',
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
    url: '/api/v1/project/get',
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
    url: '/api/v1/project/save',
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
    url: '/api/v1/project/insert',
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
    url: '/api/v1/project/submit',
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
    url: '/api/v1/project/audit',
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
    url: '/api/v1/project/return',
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
    url: '/api/v1/project/cancelaudit',
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
    url: '/api/v1/project/cancelreturn',
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
    url: '/api/v1/project/cancel',
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
    url: '/api/v1/project/canceldirect',
    method: 'post',
    data
  })
}

/**
 * 删除api
 * @param {*} data
 */
export function delApi (data) {
  return request({
    url: '/api/v1/project/delete',
    method: 'post',
    data
  })
}

/**
 * 新增验证接口api
 * @param {*} data
 */
export function validateApi (data) {
  return request({
    url: '/api/v1/project/validate',
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
    url: '/api/v1/project/import',
    method: 'post',
    data
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/project/export',
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
    url: '/api/v1/project/list/count',
    method: 'post',
    data: query
  })
}

/**
 * 项目汇总API - 获取总金额
 * @param {*} data
 */
export function getProjectSumApi (query) {
  return request({
    url: '/api/v1/project/sum',
    method: 'post',
    data: query
  })
}

/**
 * 项目报表打印
 * @param {*} data
 */
export function printApi (query) {
  return request({
    url: '/api/v1/project/print',
    method: 'post',
    data: query
  })
}

/**
 * 项目管理完成api
 * @param {*} data
 */
export function completeApi (data) {
  return request({
    url: '/api/v1/project/complete',
    method: 'post',
    data
  })
}
