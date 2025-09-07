/**
 * 权限管理API
 * @description 报表权限相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/management/permission'

export default {
  /**
   * 获取权限列表
   */
  getPermissionList (params) {
    return request({
      url: `${API_BASE}/list`,
      method: 'get',
      params
    })
  },

  /**
   * 获取用户权限
   */
  getUserPermissions (userId) {
    return request({
      url: `${API_BASE}/user`,
      method: 'get',
      params: { userId }
    })
  },

  /**
   * 获取角色权限
   */
  getRolePermissions (roleId) {
    return request({
      url: `${API_BASE}/role`,
      method: 'get',
      params: { roleId }
    })
  },

  /**
   * 分配报表权限
   */
  assignReportPermission (data) {
    return request({
      url: `${API_BASE}/assign/report`,
      method: 'post',
      data
    })
  },

  /**
   * 分配数据源权限
   */
  assignDatasourcePermission (data) {
    return request({
      url: `${API_BASE}/assign/datasource`,
      method: 'post',
      data
    })
  },

  /**
   * 撤销权限
   */
  revokePermission (data) {
    return request({
      url: `${API_BASE}/revoke`,
      method: 'post',
      data
    })
  },

  /**
   * 检查权限
   */
  checkPermission (resource, action) {
    return request({
      url: `${API_BASE}/check`,
      method: 'get',
      params: { resource, action }
    })
  }
}
