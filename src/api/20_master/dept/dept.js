import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/org/dept/list',
    method: 'post',
    data: query
  })
}

/**
 * 根据ID获取单个部门信息
 * @param {*} data
 */
export function getByIdApi (data) {
  return request({
    url: '/api/v1/org/dept/id',
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
    url: '/api/v1/org/dept/save',
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
    url: '/api/v1/org/dept/insert',
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
    url: '/api/v1/org/dept/exportall',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出逻辑，选中导出
 * @param {*} data
 */
export function exportSelectionApi (data) {
  return request({
    url: '/api/v1/org/dept/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 删除逻辑（部门信息管理页面使用）
 * @param {*} data
 */
export function deleteApi (data) {
  return request({
    url: '/api/v1/org/dept/delete',
    method: 'post',
    data
  })
}

/**
 * 从组织架构删除部门（组织架构管理页面使用）
 * @param {*} data
 */
export function deleteOrgApi (data) {
  return request({
    url: '/api/v1/org/dept/delete/org',
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
    url: '/api/v1/org/dept/enable',
    method: 'post',
    data
  })
}
