/**
 * 报表管理API
 * @description 报表管理相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/management/report'

export default {
  /**
   * 获取报表列表
   */
  getReportList (params) {
    return request({
      url: `${API_BASE}/list`,
      method: 'get',
      params
    })
  },

  /**
   * 获取报表详情
   */
  getReportDetail (id) {
    return request({
      url: `${API_BASE}/detail`,
      method: 'get',
      params: { id }
    })
  },

  /**
   * 创建报表
   */
  createReport (data) {
    return request({
      url: `${API_BASE}/create`,
      method: 'post',
      data
    })
  },

  /**
   * 更新报表
   */
  updateReport (data) {
    return request({
      url: `${API_BASE}/update`,
      method: 'post',
      data
    })
  },

  /**
   * 删除报表
   */
  deleteReport (id) {
    return request({
      url: `${API_BASE}/delete`,
      method: 'post',
      data: { id }
    })
  },

  /**
   * 发布报表
   */
  publishReport (id) {
    return request({
      url: `${API_BASE}/publish`,
      method: 'post',
      data: { id }
    })
  },

  /**
   * 下线报表
   */
  unpublishReport (id) {
    return request({
      url: `${API_BASE}/unpublish`,
      method: 'post',
      data: { id }
    })
  },

  /**
   * 获取报表分类
   */
  getReportCategories () {
    return request({
      url: `${API_BASE}/categories`,
      method: 'get'
    })
  }
}
