/**
 * 图表API
 * @description BI图表相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/bi/chart'

export default {
  /**
   * 获取图表列表
   */
  getChartList (params) {
    return request({
      url: `${API_BASE}/list`,
      method: 'get',
      params
    })
  },

  /**
   * 获取图表详情
   */
  getChartDetail (id) {
    return request({
      url: `${API_BASE}/detail`,
      method: 'get',
      params: { id }
    })
  },

  /**
   * 创建图表
   */
  createChart (data) {
    return request({
      url: `${API_BASE}/create`,
      method: 'post',
      data
    })
  },

  /**
   * 更新图表
   */
  updateChart (data) {
    return request({
      url: `${API_BASE}/update`,
      method: 'post',
      data
    })
  },

  /**
   * 删除图表
   */
  deleteChart (id) {
    return request({
      url: `${API_BASE}/delete`,
      method: 'post',
      data: { id }
    })
  },

  /**
   * 获取图表数据
   */
  getChartData (id, params) {
    return request({
      url: `${API_BASE}/data`,
      method: 'get',
      params: { id, ...params }
    })
  },

  /**
   * 刷新图表数据
   */
  refreshChartData (id) {
    return request({
      url: `${API_BASE}/refresh`,
      method: 'post',
      data: { id }
    })
  }
}
