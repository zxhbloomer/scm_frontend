import request from '@/utils/request'

/**
 * 查询逻辑
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/ar/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询统计合计
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/ar/sum',
    method: 'post',
    data: query
  })
}

/**
 * 获取企业类型
 */
export function getTypeApi (query) {
  return request({
    url: '/api/v1/ar/gettype',
    method: 'post',
    data: query
  })
}

/**
 * 增加企业 增加审批流程
 */
export function insertApi (query) {
  return request({
    url: '/api/v1/ar/insert',
    method: 'post',
    data: query
  })
}

/**
 * 修改企业 增加审批流程
 */
export function updateApi (query) {
  return request({
    url: '/api/v1/ar/save',
    method: 'post',
    data: query
  })
}

/**
 * 校验数据
 */
export function validateApi (query) {
  return request({
    url: '/api/v1/ar/validate',
    method: 'post',
    data: query
  })
}

/**
 * 获取详情
 */
export function getApi (query) {
  return request({
    url: '/api/v1/ar/get',
    method: 'post',
    data: query
  })
}

/**
 * 删除企业
 */
export function deleteApi (query) {
  return request({
    url: '/api/v1/ar/delete',
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
    url: '/api/v1/ar/export',
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
    url: '/api/v1/ar/print',
    method: 'post',
    data: query
  })
}

/**
 * 作废审批流
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/ar/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 中止收款
 */
export function suspendReceive (query) {
  return request({
    url: '/api/v1/ar/suspend_receive',
    method: 'post',
    data: query
  })
}

/**
 * 获取下推预收退款款数据
 */
export function getArRefundApi (query) {
  return request({
    url: '/api/v1/ar/get_ar_refund',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 */
export function getListByArrefundApi (query) {
  return request({
    url: '/api/v1/ar/pagelist/byarrefund',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 */
export function querySumByArrefund (query) {
  return request({
    url: '/api/v1/ar/sum/arrefund',
    method: 'post',
    data: query
  })
}
