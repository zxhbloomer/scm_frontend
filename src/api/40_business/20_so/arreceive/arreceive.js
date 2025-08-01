import request from '@/utils/request'

/**
 * 查询逻辑
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/ar/receive/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 添加逻辑
 */
export function insertApi (query) {
  return request({
    url: '/api/v1/ar/receive/insert',
    method: 'post',
    data: query
  })
}

/**
 * 校验数据
 */
export function validateApi (query) {
  return request({
    url: '/api/v1/ar/receive/validate',
    method: 'post',
    data: query
  })
}

/**
 * 获取详情
 */
export function getDetailApi (query) {
  return request({
    url: '/api/v1/ar/receive/getdetail',
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
 * 凭证上传，完成收款
 */
export function receiveCompleteApi (query) {
  return request({
    url: '/api/v1/ar/receive/complete',
    method: 'post',
    data: query
  })
}

/**
 * 取消逻辑
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/ar/receive/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 查询统计合计
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/ar/receive/sum',
    method: 'post',
    data: query
  })
}

/**
 * 获取详情
 */
export function getApi (query) {
  return request({
    url: '/api/v1/ar/receive/get',
    method: 'post',
    data: query
  })
}
