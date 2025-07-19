import request from '@/utils/request'

/**
 * 查询逻辑
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/ap/refund/pay/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 添加逻辑
 */
export function insertApi (query) {
  return request({
    url: '/api/v1/ap/refund/pay/insert',
    method: 'post',
    data: query
  })
}

/**
 * 校验数据
 */
export function validateApi (query) {
  return request({
    url: '/api/v1/ap/refund/pay/validate',
    method: 'post',
    data: query
  })
}

/**
 * 获取详情
 */
export function getApi (query) {
  return request({
    url: '/api/v1/ap/refund/pay/get',
    method: 'post',
    data: query
  })
}

/**
 * 获取
 */
export function paymentReviewApi (query) {
  return request({
    url: '/api/v1/ap/refund/pay/payment_review',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/ap/refund/pay/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 获取
 */
export function getBankCollectionDataApi (query) {
  return request({
    url: '/api/v1/bank/accounts/get_bank_collection',
    method: 'post',
    data: query
  })
}

/**
 * 完成退款
 */
export function refundCompleteAPi (query) {
  return request({
    url: '/api/v1/ap/refund/pay/complete',
    method: 'post',
    data: query
  })
}

/**
 * 获取汇总数据
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/ap/refund/pay/sum',
    method: 'post',
    data: query
  })
}
