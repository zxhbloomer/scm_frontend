import request from '@/utils/request'

/**
 * 查询逻辑
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/ar/refund/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询统计合计
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/ar/refund/sum',
    method: 'post',
    data: query
  })
}

/**
 * 获取应收账款退款类型
 */
export function getTypeApi (query) {
  return request({
    url: '/api/v1/ar/refund/gettype',
    method: 'post',
    data: query
  })
}

/**
 * 增加应收账款退款 增加审批流程
 */
export function insertApi (query) {
  return request({
    url: '/api/v1/ar/refund/insert',
    method: 'post',
    data: query
  })
}

/**
 * 修改应收账款退款 增加审批流程
 */
export function updateApi (query) {
  return request({
    url: '/api/v1/ar/refund/save',
    method: 'post',
    data: query
  })
}

/**
 * 校验数据
 */
export function validateApi (query) {
  return request({
    url: '/api/v1/ar/refund/validate',
    method: 'post',
    data: query
  })
}

/**
 * 获取详情
 */
export function getApi (query) {
  return request({
    url: '/api/v1/ar/refund/get',
    method: 'post',
    data: query
  })
}

/**
 * 删除应收账款退款
 */
export function deleteApi (query) {
  return request({
    url: '/api/v1/ar/refund/delete',
    method: 'post',
    data: query
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/ar/refund/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 报表打印
 */
export function printApi (query) {
  return request({
    url: '/api/v1/ar/refund/print',
    method: 'post',
    data: query
  })
}

/**
 * 作废审批流
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/ar/refund/cancel',
    method: 'post',
    data: query
  })
}