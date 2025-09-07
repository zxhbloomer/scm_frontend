/**
 * 大屏展示API
 * @description BI大屏相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/bi/screen'

export default {
  /**
   * 获取大屏列表
   */
  getScreenList (params) {
    return request({
      url: `${API_BASE}/list`,
      method: 'get',
      params
    })
  },

  /**
   * 获取大屏详情
   */
  getScreenDetail (id) {
    return request({
      url: `${API_BASE}/detail`,
      method: 'get',
      params: { id }
    })
  },

  /**
   * 创建大屏
   */
  createScreen (data) {
    return request({
      url: `${API_BASE}/create`,
      method: 'post',
      data
    })
  },

  /**
   * 更新大屏
   */
  updateScreen (data) {
    return request({
      url: `${API_BASE}/update`,
      method: 'post',
      data
    })
  },

  /**
   * 删除大屏
   */
  deleteScreen (id) {
    return request({
      url: `${API_BASE}/delete`,
      method: 'post',
      data: { id }
    })
  },

  /**
   * 获取大屏运行数据
   */
  getScreenData (id) {
    return request({
      url: `${API_BASE}/runtime/data`,
      method: 'get',
      params: { id }
    })
  },

  /**
   * 发布大屏
   */
  publishScreen (id) {
    return request({
      url: `${API_BASE}/publish`,
      method: 'post',
      data: { id }
    })
  }
}
