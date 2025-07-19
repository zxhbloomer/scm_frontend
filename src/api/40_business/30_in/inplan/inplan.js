import request from '@/utils/request'

/**
 * 分页查询入库计划列表
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/inplan/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询入库计划汇总统计
 * @param {*} data
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/inplan/sum',
    method: 'post',
    data: query
  })
}

/**
 * 根据ID获取入库计划详情
 * @param {*} data
 */
export function getApi (query) {
  return request({
    url: '/api/v1/inplan/get',
    method: 'post',
    data: query
  })
}

/**
 * 修改入库计划
 * @param {*} data
 */
export function updateApi (data) {
  return request({
    url: '/api/v1/inplan/save',
    method: 'post',
    data
  })
}

/**
 * 新增入库计划
 * @param {*} data
 */
export function insertApi (data) {
  return request({
    url: '/api/v1/inplan/insert',
    method: 'post',
    data
  })
}

/**
 * 导入入库计划数据
 * @param {*} data
 */
export function importDataApi (data) {
  return request({
    url: '/api/v1/inplan/import',
    method: 'post',
    data
  })
}

/**
 * 导出入库计划数据
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/inplan/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出所有入库计划数据
 * @param {*} data
 */
export function exportAllApi (data) {
  return request({
    url: '/api/v1/inplan/export_all',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 删除入库计划
 * @param {*} data
 */
export function delApi (data) {
  return request({
    url: '/api/v1/inplan/delete',
    method: 'post',
    data
  })
}

/**
 * 验证入库计划数据
 * @param {*} data
 */
export function validateApi (data) {
  return request({
    url: '/api/v1/inplan/validate',
    method: 'post',
    data
  })
}

/**
 * 获取打印数据
 */
export function printApi (query) {
  return request({
    url: '/api/v1/inplan/print',
    method: 'post',
    data: query
  })
}

/**
 * 作废入库计划
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/inplan/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 完成入库计划
 * @param {*} data
 */
export function finishApi (query) {
  return request({
    url: '/api/v1/inplan/finish',
    method: 'post',
    data: query
  })
}

/**
 * 初始化入库计划数据
 * @param {*} data
 */
export function initPlanDataApi (data) {
  return request({
    url: '/api/v1/inplan/init/plan/data',
    method: 'post',
    data
  })
}
