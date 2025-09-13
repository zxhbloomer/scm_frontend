import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/goods/list',
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
    url: '/api/v1/goods/save',
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
    url: '/api/v1/goods/insert',
    method: 'post',
    data
  })
}

/**
 * 删除物料
 * @param {*} data
 */
export function deleteApi (data) {
  return request({
    url: '/api/v1/goods/delete',
    method: 'post',
    data
  })
}

/**
 * 启用选择数据
 * @param {*} data
 */
export function enabledSelectionApi (data) {
  return request({
    url: '/api/v1/goods/enabled',
    method: 'post',
    data
  })
}

/**
 * 停用选择数据
 * @param {*} data
 */
export function disAbledSelectionApi (data) {
  return request({
    url: '/api/v1/goods/disabled',
    method: 'post',
    data
  })
}

/**
 * 停用/停用 选择数据
 * @param {*} data
 */
export function enableOrDisAbleApi (data) {
  return request({
    url: '/api/v1/goods/enable',
    method: 'post',
    data
  })
}

/**
 * 导出全部数据
 * @param {*} data
 */
export function exportAllApi (data) {
  return request({
    url: '/api/v1/goods/exportall',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出选中数据
 * @param {*} data
 */
export function exportSelectionApi (data) {
  return request({
    url: '/api/v1/goods/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出（保持向后兼容）
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/goods/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

