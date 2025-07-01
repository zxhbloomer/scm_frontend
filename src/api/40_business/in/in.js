import request from '@/utils/request'

// 入库单管理API

/**
 * 获取入库单列表
 * @param {Object} params 查询参数
 */
export function getListApi (params) {
  return request({
    url: '/api/v1/in/pagelist',
    method: 'post',
    data: params
  })
}

/**
 * 查询入库单汇总统计
 * @param {Object} params 查询参数
 */
export function getListSumApi (params) {
  return request({
    url: '/api/v1/in/sum',
    method: 'post',
    data: params
  })
}

/**
 * 获取入库单详情
 * @param {Number} id 入库单ID
 */
export function getInDetailApi (id) {
  return request({
    url: '/api/v1/in/detail',
    method: 'get',
    params: { id }
  })
}

/**
 * 创建入库单
 * @param {Object} data 入库单数据
 */
export function createInApi (data) {
  return request({
    url: '/api/v1/in/create',
    method: 'post',
    data
  })
}

/**
 * 根据ID获取入库单详情
 * @param {*} data
 */
export function getApi (query) {
  return request({
    url: '/api/v1/in/get',
    method: 'post',
    data: query
  })
}

/**
 * 更新入库单
 * @param {Object} data 入库单数据
 */
export function updateInApi (data) {
  return request({
    url: '/api/v1/in/update',
    method: 'post',
    data
  })
}

/**
 * 删除入库单
 * @param {Number} id 入库单ID
 */
export function deleteInApi (id) {
  return request({
    url: '/api/v1/in/delete',
    method: 'post',
    data: { id }
  })
}

/**
 * 删除入库单（与入库计划API保持一致）
 * @param {*} data
 */
export function delApi (data) {
  return request({
    url: '/api/v1/in/delete',
    method: 'post',
    data
  })
}

/**
 * 作废入库单
 * @param {Object} data 作废数据
 */
export function cancelApi (data) {
  return request({
    url: '/api/v1/in/cancel',
    method: 'post',
    data
  })
}

/**
 * 审批入库单
 * @param {Object} data 审批数据
 */
export function approveInApi (data) {
  return request({
    url: '/api/v1/in/approve',
    method: 'post',
    data
  })
}

/**
 * 提交入库单审批
 * @param {Object} data 提交数据
 */
export function submitInApi (data) {
  return request({
    url: '/api/v1/in/submit',
    method: 'post',
    data
  })
}

/**
 * 验证入库单数据
 * @param {*} data
 */
export function validateApi (data) {
  return request({
    url: '/api/v1/in/validate',
    method: 'post',
    data
  })
}

/**
 * 新增入库单
 * @param {*} data
 */
export function insertApi (data) {
  return request({
    url: '/api/v1/in/insert',
    method: 'post',
    data
  })
}

/**
 * 导出入库单数据
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/in/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

export default {
  getInListApi: getListApi,
  getListSumApi,
  getInDetailApi,
  createInApi,
  getApi,
  updateInApi,
  deleteInApi,
  delApi,
  cancelApi,
  approveInApi,
  submitInApi,
  validateApi,
  insertApi,
  exportApi
}
