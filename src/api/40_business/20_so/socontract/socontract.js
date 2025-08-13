import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/socontract/pagelist',
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
    url: '/api/v1/socontract/sum',
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
    url: '/api/v1/socontract/get',
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
    url: '/api/v1/socontract/save',
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
    url: '/api/v1/socontract/insert',
    method: 'post',
    data
  })
}

/**
 * 导入逻辑
 * @param {*} data
 */
export function importDataApi (data) {
  return request({
    url: '/api/v1/socontract/import',
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
    url: '/api/v1/socontract/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportAllApi (data) {
  return request({
    url: '/api/v1/socontract/exportall',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 删除api
 * @param {*} data
 */
export function delApi (data) {
  return request({
    url: '/api/v1/socontract/delete',
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
    url: '/api/v1/socontract/validate',
    method: 'post',
    data
  })
}

/**
 * 报表打印
 */
export function printApi (query) {
  return request({
    url: '/api/v1/socontract/print',
    method: 'post',
    data: query
  })
}

/**
 * 作废审批流
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/socontract/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 完成
 * @param {*} data
 */
export function completeApi (query) {
  return request({
    url: '/api/v1/socontract/complete',
    method: 'post',
    data: query
  })
}
