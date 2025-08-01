import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/poorder/pagelist',
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
    url: '/api/v1/poorder/sum',
    method: 'post',
    data: query
  })
}

/**
 * 货权转移专用-查询采购订单列表
 * @param {*} data
 */
export function getCargoRightTransferListApi (query) {
  return request({
    url: '/api/v1/poorder/pagelist/cargorighttransfer',
    method: 'post',
    data: query
  })
}

/**
 * 货权转移专用-查询采购订单汇总
 * @param {*} data
 */
export function getCargoRightTransferListSumApi (query) {
  return request({
    url: '/api/v1/poorder/sum/cargorighttransfer',
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
    url: '/api/v1/poorder/get',
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
    url: '/api/v1/poorder/save',
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
    url: '/api/v1/poorder/insert',
    method: 'post',
    data
  })
}

/**
 * 导入逻辑
 * @param {*} data
 */
export function importApi (data) {
  return request({
    url: '/api/v1/poorder/import',
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
    url: '/api/v1/poorder/export',
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
    url: '/api/v1/poorder/export_all',
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
    url: '/api/v1/poorder/delete',
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
    url: '/api/v1/poorder/validate',
    method: 'post',
    data
  })
}

/**
 * 报表打印
 */
export function printApi (query) {
  return request({
    url: '/api/v1/poorder/print',
    method: 'post',
    data: query
  })
}

/**
 * 作废审批流
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/poorder/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListForSettlementApi (query) {
  return request({
    url: '/api/v1/poorder/settle/pagelist',
    method: 'post',
    data: query
  })
}
/**
 * 查询逻辑
 * @param {*} data
 */
export function getListForSettlementSumApi (query) {
  return request({
    url: '/api/v1/poorder/settle/sum',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑 - 为应付退款提供数据
 */
export function getListByAprefundApi (query) {
  return request({
    url: '/api/v1/poorder/pagelist/byaprefund',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑 - 为应付退款提供汇总数据
 */
export function querySumByAprefund (query) {
  return request({
    url: '/api/v1/poorder/sum/aprefund',
    method: 'post',
    data: query
  })
}

/**
 * 货权转移专用-获取采购订单明细数据
 * @param {*} data
 */
export function setPodetailListDataApi (query) {
  return request({
    url: '/api/v1/poorder/list/detail',
    method: 'post',
    data: query
  })
}
