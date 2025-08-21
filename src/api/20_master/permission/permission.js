import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/permission/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getCascaderListApi (query) {
  return request({
    url: '/api/v1/permission/cascaderlist',
    method: 'post',
    data: query
  })
}

/**
 * 获取所有权限列表，为权限选择弹窗服务
 * @param {*} data
 */
export function getAllPermissionsApi (query) {
  return request({
    url: '/api/v1/permission/all',
    method: 'post',
    data: query
  })
}

/**
 * 获取角色已分配的权限ID列表
 * @param {*} data
 */
export function getRoleAssignedPermissionIdsApi (query) {
  return request({
    url: '/api/v1/permission/role/assigned',
    method: 'post',
    data: query
  })
}

/**
 * 保存角色权限关系（全删全插）
 * @param {*} data
 */
export function saveRolePermissionsApi (data) {
  return request({
    url: '/api/v1/permission/role/permissions/save',
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
    url: '/api/v1/permission/save',
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
    url: '/api/v1/permission/insert',
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
    url: '/api/v1/permission/export_all',
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
    url: '/api/v1/permission/export_selection',
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
    url: '/api/v1/permission/import',
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
    url: '/api/v1/permission/delete',
    method: 'post',
    data
  })
}

/**
   * 设为管理员逻辑
   * @param {*} data
   */
export function adminApi (data) {
  return request({
    url: '/api/v1/permission/admin',
    method: 'post',
    data
  })
}

// /**
//    * 部门权限表数据获取系统菜单根节点
//    * @param {*} data
//    */
// export function getSystemMenuRootListApi(data) {
//   return request({
//     url: '/api/v1/permission/dept/get_sys_menu_root_node',
//     method: 'post'
//   })
// }

// /**
//    * 判断是否已经选择过，默认菜单进行编辑
//    * @param {*} data
//    */
// export function isAlreadySetMenuIdApi(data) {
//   return request({
//     url: '/api/v1/permission/dept/setted',
//     method: 'post',
//     data
//   })
// }
