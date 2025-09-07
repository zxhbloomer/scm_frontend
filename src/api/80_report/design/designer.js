/**
 * 报表设计器API
 * @description 报表设计相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/designer'

export default {
  /**
   * 保存报表设计
   */
  saveDesign (data) {
    return request({
      url: `${API_BASE}/save`,
      method: 'post',
      data
    })
  },

  /**
   * 加载报表设计
   */
  loadDesign (reportId) {
    return request({
      url: `${API_BASE}/load`,
      method: 'get',
      params: { reportId }
    })
  },

  /**
   * 预览报表
   */
  previewReport (data) {
    return request({
      url: `${API_BASE}/preview`,
      method: 'post',
      data
    })
  },

  /**
   * 获取设计器配置
   */
  getDesignerConfig () {
    return request({
      url: `${API_BASE}/config`,
      method: 'get'
    })
  },

  /**
   * 验证报表设计
   */
  validateDesign (data) {
    return request({
      url: `${API_BASE}/validate`,
      method: 'post',
      data
    })
  },

  /**
   * 复制报表
   */
  copyReport (reportId) {
    return request({
      url: `${API_BASE}/copy`,
      method: 'post',
      data: { reportId }
    })
  }
}
