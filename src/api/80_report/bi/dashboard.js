/**
 * BI仪表板API
 * @description BI仪表板相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/bi/dashboard'

export default {
  /**
   * 获取仪表板列表
   */
  getDashboardList (params) {
    return request({
      url: `${API_BASE}/list`,
      method: 'get',
      params
    })
  },

  /**
   * 获取仪表板详情
   */
  getDashboardDetail (id) {
    return request({
      url: `${API_BASE}/detail`,
      method: 'get',
      params: { id }
    })
  },

  /**
   * 创建仪表板
   */
  createDashboard (data) {
    return request({
      url: `${API_BASE}/create`,
      method: 'post',
      data
    })
  },

  /**
   * 更新仪表板
   */
  updateDashboard (data) {
    return request({
      url: `${API_BASE}/update`,
      method: 'post',
      data
    })
  },

  /**
   * 删除仪表板
   */
  deleteDashboard (id) {
    return request({
      url: `${API_BASE}/delete`,
      method: 'post',
      data: { id }
    })
  },

  /**
   * 保存仪表板布局
   */
  saveDashboardLayout (data) {
    return request({
      url: `${API_BASE}/layout/save`,
      method: 'post',
      data
    })
  },

  /**
   * 发布仪表板
   */
  publishDashboard (id) {
    return request({
      url: `${API_BASE}/publish`,
      method: 'post',
      data: { id }
    })
  }
}
