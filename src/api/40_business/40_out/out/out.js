import request from '@/utils/request'

// 出库单管理API

/**
 * 获取出库单列表
 * @param {Object} params 查询参数
 */
export function getListApi (params) {
  return request({
    url: '/api/v1/out/pagelist',
    method: 'post',
    data: params
  })
}

/**
 * 查询出库单汇总统计
 * @param {Object} params 查询参数
 */
export function getListSumApi (params) {
  return request({
    url: '/api/v1/out/sum',
    method: 'post',
    data: params
  })
}

/**
 * 获取出库单详情
 * @param {Number} id 出库单ID
 */
export function getOutDetailApi (id) {
  return request({
    url: '/api/v1/out/detail',
    method: 'get',
    params: { id }
  })
}

/**
 * 创建出库单
 * @param {Object} data 出库单数据
 */
export function createOutApi (data) {
  return request({
    url: '/api/v1/out/create',
    method: 'post',
    data
  })
}

/**
 * 根据ID获取出库单详情
 * @param {*} data
 */
export function getApi (query) {
  return request({
    url: '/api/v1/out/get',
    method: 'post',
    data: query
  })
}

/**
 * 更新出库单
 * @param {Object} data 出库单数据
 */
export function updateApi (data) {
  return request({
    url: '/api/v1/out/save',
    method: 'post',
    data
  })
}

/**
 * 删除出库单
 * @param {Number} id 出库单ID
 */
export function deleteOutApi (id) {
  return request({
    url: '/api/v1/out/delete',
    method: 'post',
    data: { id }
  })
}

/**
 * 删除出库单（与出库计划API保持一致）
 * @param {*} data
 */
export function delApi (data) {
  return request({
    url: '/api/v1/out/delete',
    method: 'post',
    data
  })
}

/**
 * 作废出库单
 * @param {Object} data 作废数据
 */
export function cancelApi (data) {
  return request({
    url: '/api/v1/out/cancel',
    method: 'post',
    data
  })
}

/**
 * 审批出库单
 * @param {Object} data 审批数据
 */
export function approveOutApi (data) {
  return request({
    url: '/api/v1/out/approve',
    method: 'post',
    data
  })
}

/**
 * 提交出库单审批
 * @param {Object} data 提交数据
 */
export function submitOutApi (data) {
  return request({
    url: '/api/v1/out/submit',
    method: 'post',
    data
  })
}

/**
 * 验证出库单数据
 * @param {*} data
 */
export function validateApi (data) {
  return request({
    url: '/api/v1/out/validate',
    method: 'post',
    data
  })
}

/**
 * 新增出库单
 * @param {*} data
 */
export function insertApi (data) {
  return request({
    url: '/api/v1/out/insert',
    method: 'post',
    data
  })
}

/**
 * 导出出库单数据
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/out/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 获取出库单打印数据
 * @param {Object} data 查询参数
 */
export function printApi (data) {
  return request({
    url: '/api/v1/out/print',
    method: 'post',
    data
  })
}

export default {
  getOutListApi: getListApi,
  getListSumApi,
  getOutDetailApi,
  createOutApi,
  getApi,
  updateOutApi: updateApi,
  deleteOutApi,
  delApi,
  cancelApi,
  approveOutApi,
  submitOutApi,
  validateApi,
  insertApi,
  exportApi,
  printApi
}