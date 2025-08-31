import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/org/company/list',
    method: 'post',
    data: query
  })
}

/**
 * 根据ID获取单个企业信息
 * @param {*} data
 */
export function getByIdApi (data) {
  return request({
    url: '/api/v1/org/company/id',
    method: 'post',
    data
  })
}

/**
 * 更新api
 * @param {*} data
 */
export function updateApi (data) {
  return request({
    url: '/api/v1/org/company/save',
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
    url: '/api/v1/org/company/insert',
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
    url: '/api/v1/org/company/exportall',
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
    url: '/api/v1/org/company/export',
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
    url: '/api/v1/org/company/import',
    method: 'post',
    data
  })
}

/**
 * 删除逻辑（主体企业信息管理页面使用）
 * @param {*} data
 */
export function deleteApi (data) {
  return request({
    url: '/api/v1/org/company/delete',
    method: 'post',
    data
  })
}

/**
 * 从组织架构删除主体企业（组织架构管理页面使用）
 * @param {*} data
 */
export function deleteOrgApi (data) {
  return request({
    url: '/api/v1/org/company/delete/org',
    method: 'post',
    data
  })
}

/**
 * 启用逻辑
 * @param {*} data
 */
export function enableApi (data) {
  return request({
    url: '/api/v1/org/company/enable',
    method: 'post',
    data
  })
}
