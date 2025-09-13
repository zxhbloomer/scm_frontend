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
 * 启用单条类别记录
 * @param {Object} data - 类别对象 {id: number}
 * @returns {Promise} - 返回更新后的类别数据
 */
export function enabledSelectionApi (data) {
  return request({
    url: '/api/v1/category/enabled',
    method: 'post',
    data
  })
}

/**
 * 停用单条类别记录
 * @param {Object} data - 类别对象 {id: number}
 * @returns {Promise} - 返回更新后的类别数据
 */
export function disAbledSelectionApi (data) {
  return request({
    url: '/api/v1/category/disabled',
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
