/**
 * 模板管理API
 * @description 报表模板相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/template'

export default {
  /**
   * 获取模板列表
   */
  getTemplateList (params) {
    return request({
      url: `${API_BASE}/list`,
      method: 'get',
      params
    })
  },

  /**
   * 获取模板详情
   */
  getTemplateDetail (id) {
    return request({
      url: `${API_BASE}/detail`,
      method: 'get',
      params: { id }
    })
  },

  /**
   * 创建模板
   */
  createTemplate (data) {
    return request({
      url: `${API_BASE}/create`,
      method: 'post',
      data
    })
  },

  /**
   * 更新模板
   */
  updateTemplate (data) {
    return request({
      url: `${API_BASE}/update`,
      method: 'post',
      data
    })
  },

  /**
   * 删除模板
   */
  deleteTemplate (id) {
    return request({
      url: `${API_BASE}/delete`,
      method: 'post',
      data: { id }
    })
  },

  /**
   * 导入模板
   */
  importTemplate (file) {
    const formData = new FormData()
    formData.append('file', file)

    return request({
      url: `${API_BASE}/import`,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 导出模板
   */
  exportTemplate (id) {
    return request({
      url: `${API_BASE}/export`,
      method: 'get',
      params: { id },
      responseType: 'blob'
    })
  }
}
