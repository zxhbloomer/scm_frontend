/**
 * 系统配置API
 * @description 报表系统配置相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/management/system'

export default {
  /**
   * 获取系统配置
   */
  getSystemConfig () {
    return request({
      url: `${API_BASE}/config`,
      method: 'get'
    })
  },

  /**
   * 更新系统配置
   */
  updateSystemConfig (data) {
    return request({
      url: `${API_BASE}/config/update`,
      method: 'post',
      data
    })
  },

  /**
   * 获取系统信息
   */
  getSystemInfo () {
    return request({
      url: `${API_BASE}/info`,
      method: 'get'
    })
  },

  /**
   * 获取许可证信息
   */
  getLicenseInfo () {
    return request({
      url: `${API_BASE}/license`,
      method: 'get'
    })
  },

  /**
   * 更新许可证
   */
  updateLicense (data) {
    return request({
      url: `${API_BASE}/license/update`,
      method: 'post',
      data
    })
  },

  /**
   * 获取系统日志
   */
  getSystemLogs (params) {
    return request({
      url: `${API_BASE}/logs`,
      method: 'get',
      params
    })
  },

  /**
   * 清理系统缓存
   */
  clearCache () {
    return request({
      url: `${API_BASE}/cache/clear`,
      method: 'post'
    })
  }
}
