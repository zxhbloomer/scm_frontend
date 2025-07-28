import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/soorder/pagelist',
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
    url: '/api/v1/soorder/sum',
    method: 'post',
    data: query
  })
}

/**
 * 货权转移专用-查询销售订单列表
 * @param {*} data
 */
export function getCargoRightTransferListApi (query) {
  return request({
    url: '/api/v1/soorder/pagelist/cargorighttransfer',
    method: 'post',
    data: query
  })
}

/**
 * 货权转移专用-查询销售订单汇总
 * @param {*} data
 */
export function getCargoRightTransferListSumApi (query) {
  return request({
    url: '/api/v1/soorder/sum/cargorighttransfer',
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
    url: '/api/v1/soorder/get',
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
    url: '/api/v1/soorder/save',
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
    url: '/api/v1/soorder/insert',
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
    url: '/api/v1/soorder/import',
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
    url: '/api/v1/soorder/export',
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
    url: '/api/v1/soorder/export_all',
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
    url: '/api/v1/soorder/delete',
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
    url: '/api/v1/soorder/validate',
    method: 'post',
    data
  })
}

/**
 * 报表打印
 */
export function printApi (query) {
  return request({
    url: '/api/v1/soorder/print',
    method: 'post',
    data: query
  })
}

/**
 * 作废审批流
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/soorder/cancel',
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
    url: '/api/v1/soorder/settle/pagelist',
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
    url: '/api/v1/soorder/settle/sum',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑 - 为应收退款提供数据
 */
export function getListByArrefundApi (query) {
  return request({
    url: '/api/v1/soorder/pagelist/byarrefund',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑 - 为应收退款提供汇总数据
 */
export function querySumByArrefund (query) {
  return request({
    url: '/api/v1/soorder/sum/arrefund',
    method: 'post',
    data: query
  })
}

/**
 * 货权转移专用-获取销售订单明细数据
 * @param {*} data
 */
export function setSodetailListDataApi (query) {
  return request({
    url: '/api/v1/soorder/list/detail',
    method: 'post',
    data: query
  })
}