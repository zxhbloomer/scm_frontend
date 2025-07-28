import request from '@/utils/request'

/**
 * 查询采购结算列表数据
 * @param {*} query 查询参数
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/settlement/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询采购结算汇总统计数据
 * @param {*} query 查询参数
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/settlement/sum',
    method: 'post',
    data: query
  })
}

/**
 * 查询采购结算明细数据
 * @param {*} query 查询参数
 */
export function getApi (query) {
  return request({
    url: '/api/v1/settlement/get',
    method: 'post',
    data: query
  })
}

/**
 * 更新采购结算数据
 * @param {*} data 更新数据
 */
export function updateApi (data) {
  return request({
    url: '/api/v1/settlement/save',
    method: 'post',
    data
  })
}

/**
 * 新增采购结算数据
 * @param {*} data 新增数据
 */
export function insertApi (data) {
  return request({
    url: '/api/v1/settlement/insert',
    method: 'post',
    data
  })
}

/**
 * 导入采购结算数据
 * @param {*} data 导入数据
 */
export function importDataApi (data) {
  return request({
    url: '/api/v1/settlement/import',
    method: 'post',
    data
  })
}

/**
 * 导出采购结算数据
 * @param {*} data 导出参数
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/settlement/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出全部采购结算数据
 * @param {*} data 导出参数
 */
export function exportAllApi (data) {
  return request({
    url: '/api/v1/settlement/export_all',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 删除采购结算数据
 * @param {*} data 删除参数
 */
export function delApi (data) {
  return request({
    url: '/api/v1/settlement/delete',
    method: 'post',
    data
  })
}

/**
 * 采购结算新增验证接口
 * @param {*} data 验证数据
 */
export function validateApi (data) {
  return request({
    url: '/api/v1/settlement/validate',
    method: 'post',
    data
  })
}

/**
 * 采购结算报表打印
 * @param {*} query 打印参数
 */
export function printApi (query) {
  return request({
    url: '/api/v1/settlement/print',
    method: 'post',
    data: query
  })
}

/**
 * 采购结算作废审批流
 * @param {*} query 作废参数
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/settlement/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 采购结算完成操作
 * @param {*} query 完成参数
 */
export function getFinishApi (query) {
  return request({
    url: '/api/v1/settlement/finish',
    method: 'post',
    data: query
  })
}

/**
 * 获取导入模板
 */
export function getImportTemplateApi () {
  return request({
    url: '/api/v1/settlement/import_template',
    method: 'get'
  })
}

/**
 * 采购结算下推应付账款
 * @param {*} data 下推参数
 */
export function pushApApi (data) {
  return request({
    url: '/api/v1/settlement/push_ap',
    method: 'post',
    data
  })
}
