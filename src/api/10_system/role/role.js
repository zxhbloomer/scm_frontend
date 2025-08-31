import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/role/list',
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
    url: '/api/v1/role/save',
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
    url: '/api/v1/role/insert',
    method: 'post',
    data
  })
}

/**
 * 导出逻辑，全部导出
 * @param {*} data
 */
export function exportAllApi (data) {
  return request({
    url: '/api/v1/role/exportall',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出逻辑，部分导出
 * @param {*} data
 */
export function exportSelectionApi (data) {
  return request({
    url: '/api/v1/role/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导入逻辑
 * @param {*} data
 */
export function importExcelApi (data) {
  return request({
    url: '/api/v1/role/import',
    method: 'post',
    data
  })
}

/**
 * 删除逻辑
 * @param {*} data
 */
export function deleteApi (data) {
  return request({
    url: '/api/v1/role/delete',
    method: 'post',
    data
  })
}

/**
 * 获取所有角色列表（无分页，用于角色选择弹窗）
 * @param {Object} data - 查询条件
 * @param {string} data.name - 角色名称（可选）
 * @param {string} data.code - 角色编码（可选）
 * @param {boolean} data.is_del - 是否删除（固定为false）
 */
export function getAllRolesApi (data) {
  return request({
    url: '/api/v1/role/all',
    method: 'post',
    data
  })
}

/**
 * 获取角色选择弹窗列表（无分页，用于角色选择弹窗）
 * @deprecated 请使用 getAllRolesApi
 * @param {Object} data - 查询条件
 */
export function getRoleListForDialogApi (data) {
  return getAllRolesApi(data)
}

