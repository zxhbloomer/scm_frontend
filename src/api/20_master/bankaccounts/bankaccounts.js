import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/bank/accounts/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getDialogListApi (query) {
  return request({
    url: '/api/v1/bank/accounts/dialogpagelist',
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
    url: '/api/v1/bank/accounts/sum',
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
    url: '/api/v1/bank/accounts/get',
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
    url: '/api/v1/bank/accounts/update',
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
    url: '/api/v1/bank/accounts/insert',
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
    url: '/api/v1/bank/accounts/export',
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
    url: '/api/v1/bank/accounts/delete',
    method: 'post',
    data
  })
}

/**
 * 状态修改api
 * @param {*} data
 */
export function updateStatusApi (data) {
  return request({
    url: '/api/v1/bank/accounts/update_status',
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
    url: '/api/v1/bank/accounts/validate',
    method: 'post',
    data
  })
}

/**
 * 获取主体企业的默认银行账户
 */
export function getPurchaserApi (query) {
  return request({
    url: '/api/v1/bank/accounts/get_purchaser',
    method: 'post',
    data: query
  })
}

/**
 * 获取销售方企业的默认银行账户
 */
export function getSellerApi (query) {
  return request({
    url: '/api/v1/bank/accounts/get_seller',
    method: 'post',
    data: query
  })
}
//
// /**
//  * 获取款项类型
//  */
// export function getBankTypeApi (query) {
//   return request({
//     url: '/api/v1/bank/accounts/get_bankType',
//     method: 'post',
//     data: query
//   })
// }
