import request from '@/utils/request'

/**
 * 分页查询出库计划列表
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/outplan/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询出库计划汇总统计
 * @param {*} data
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/outplan/sum',
    method: 'post',
    data: query
  })
}

/**
 * 根据ID获取出库计划详情
 * @param {*} data
 */
export function getApi (query) {
  return request({
    url: '/api/v1/outplan/get',
    method: 'post',
    data: query
  })
}

/**
 * 修改出库计划
 * @param {*} data
 */
export function updateApi (data) {
  return request({
    url: '/api/v1/outplan/save',
    method: 'post',
    data
  })
}

/**
 * 新增出库计划
 * @param {*} data
 */
export function insertApi (data) {
  return request({
    url: '/api/v1/outplan/insert',
    method: 'post',
    data
  })
}

/**
 * 导入出库计划数据
 * @param {*} data
 */
export function importDataApi (data) {
  return request({
    url: '/api/v1/outplan/import',
    method: 'post',
    data
  })
}

/**
 * 导出出库计划数据
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/outplan/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出所有出库计划数据
 * @param {*} data
 */
export function exportAllApi (data) {
  return request({
    url: '/api/v1/outplan/export_all',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 删除出库计划
 * @param {*} data
 */
export function delApi (data) {
  return request({
    url: '/api/v1/outplan/delete',
    method: 'post',
    data
  })
}

/**
 * 验证出库计划数据
 * @param {*} data
 */
export function validateApi (data) {
  return request({
    url: '/api/v1/outplan/validate',
    method: 'post',
    data
  })
}

/**
 * 获取打印数据
 */
export function printApi (query) {
  return request({
    url: '/api/v1/outplan/print',
    method: 'post',
    data: query
  })
}

/**
 * 作废出库计划
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/outplan/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 完成出库计划
 * @param {*} data
 */
export function finishApi (query) {
  return request({
    url: '/api/v1/outplan/finish',
    method: 'post',
    data: query
  })
}

/**
 * 初始化出库计划数据
 * @param {*} data
 */
export function initPlanDataApi (data) {
  return request({
    url: '/api/v1/outplan/init/plan/data',
    method: 'post',
    data
  })
}
