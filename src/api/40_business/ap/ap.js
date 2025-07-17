import request from '@/utils/request'

/**
 * 查询逻辑
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/ap/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询统计合计
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/ap/sum',
    method: 'post',
    data: query
  })
}

/**
 * 获取企业类型
 */
export function getTypeApi (query) {
  return request({
    url: '/api/v1/ap/gettype',
    method: 'post',
    data: query
  })
}

/**
 * 增加企业 增加审批流程
 */
export function insertApi (query) {
  return request({
    url: '/api/v1/ap/insert',
    method: 'post',
    data: query
  })
}

/**
 * 修改企业 增加审批流程
 */
export function updateApi (query) {
  return request({
    url: '/api/v1/ap/save',
    method: 'post',
    data: query
  })
}

/**
 * 校验数据
 */
export function validateApi (query) {
  return request({
    url: '/api/v1/ap/validate',
    method: 'post',
    data: query
  })
}

/**
 * 获取详情
 */
export function getApi (query) {
  return request({
    url: '/api/v1/ap/get',
    method: 'post',
    data: query
  })
}

/**
 * 删除企业
 */
export function deleteApi (query) {
  return request({
    url: '/api/v1/ap/delete',
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
    url: '/api/v1/ap/export',
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
    url: '/api/v1/ap/print',
    method: 'post',
    data: query
  })
}

/**
 * 作废审批流
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/ap/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 中止付款
 */
export function suspendPayment (query) {
  return request({
    url: '/api/v1/ap/suspend_payment',
    method: 'post',
    data: query
  })
}

/**
 * 获取下推预付退款款数据
 */
export function getApRefundApi (query) {
  return request({
    url: '/api/v1/ap/get_ap_refund',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 */
export function getListByAprefundApi (query) {
  return request({
    url: '/api/v1/ap/pagelist/byaprefund',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 */
export function querySumByAprefund (query) {
  return request({
    url: '/api/v1/ap/sum/aprefund',
    method: 'post',
    data: query
  })
}
