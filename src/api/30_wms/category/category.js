import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/category/list',
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
    url: '/api/v1/category/save',
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
    url: '/api/v1/category/insert',
    method: 'post',
    data
  })
}

/**
 * 删除选择数据
 * @param {*} data
 */
export function deleteApi (data) {
  return request({
    url: '/api/v1/category/delete',
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
    url: '/api/v1/category/enabled',
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
    url: '/api/v1/category/disabled',
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
    url: '/api/v1/category/enable',
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
    url: '/api/v1/category/exportall',
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
    url: '/api/v1/category/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}
