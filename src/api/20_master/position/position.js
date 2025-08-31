import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getDataByIdApi (query) {
  return request({
    url: '/api/v1/org/position/id',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/org/position/list',
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
    url: '/api/v1/org/position/save',
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
    url: '/api/v1/org/position/insert',
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
    url: '/api/v1/org/position/exportall',
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
    url: '/api/v1/org/position/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 删除逻辑（岗位信息管理页面使用）
 * @param {*} data
 */
export function deleteApi (data) {
  return request({
    url: '/api/v1/org/position/delete',
    method: 'post',
    data
  })
}

/**
 * 从组织架构删除岗位（组织架构管理页面使用）
 * @param {*} data
 */
export function deleteOrgApi (data) {
  return request({
    url: '/api/v1/org/position/delete/org',
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
    url: '/api/v1/org/position/enable',
    method: 'post',
    data
  })
}

/**
 * 获取岗位仓库权限信息
 * @param {*} data
 */
export function getDetailApi (data) {
  return request({
    url: '/api/v1/org/position/detail',
    method: 'post',
    data
  })
}

/**
 * 修改岗位仓库权限信息
 * @param {*} data
 */
export function updateWarehousePermissionApi (data) {
  return request({
    url: '/api/v1/org/position/warehousepermission/save',
    method: 'post',
    data
  })
}

/**
 * 获取岗位已分配的角色ID列表
 * @param {Object} data - 查询条件
 * @param {number} data.position_id - 岗位ID
 */
export function getPositionAssignedRoleIdsApi (data) {
  return request({
    url: '/api/v1/org/position/role/assigned',
    method: 'post',
    data
  })
}

/**
 * 保存岗位角色关系（全删全插）
 * @param {Object} data - 保存数据
 * @param {number} data.positionId - 岗位ID
 * @param {Array<number>} data.roleIds - 角色ID列表
 */
export function savePositionRolesApi (data) {
  return request({
    url: '/api/v1/org/position/role/save',
    method: 'post',
    data
  })
}
