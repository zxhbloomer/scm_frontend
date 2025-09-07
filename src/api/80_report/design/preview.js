/**
 * 报表预览导出API
 * @description 报表预览和导出相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/preview'

export default {
  /**
   * 预览报表
   */
  previewReport (params) {
    return request({
      url: `${API_BASE}/view`,
      method: 'get',
      params
    })
  },

  /**
   * 导出Excel
   */
  exportExcel (params) {
    return request({
      url: `${API_BASE}/export/excel`,
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  /**
   * 导出PDF
   */
  exportPDF (params) {
    return request({
      url: `${API_BASE}/export/pdf`,
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  /**
   * 导出Word
   */
  exportWord (params) {
    return request({
      url: `${API_BASE}/export/word`,
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  /**
   * 打印报表
   */
  printReport (params) {
    return request({
      url: `${API_BASE}/print`,
      method: 'post',
      data: params
    })
  },

  /**
   * 获取报表参数
   */
  getReportParams (reportId) {
    return request({
      url: `${API_BASE}/params`,
      method: 'get',
      params: { reportId }
    })
  }
}
