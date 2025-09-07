/**
 * 数据源管理API
 * @description 报表系统数据源相关接口
 */
import request from '@/utils/request'

const API_BASE = '/scm/report/datasource'

export default {
  /**
   * 获取数据源列表
   */
  getDataSourceList (params) {
    return request({
      url: `${API_BASE}/list`,
      method: 'get',
      params
    })
  },

  /**
   * 创建数据源
   */
  createDataSource (data) {
    return request({
      url: `${API_BASE}/create`,
      method: 'post',
      data
    })
  },

  /**
   * 更新数据源
   */
  updateDataSource (data) {
    return request({
      url: `${API_BASE}/update`,
      method: 'post',
      data
    })
  },

  /**
   * 删除数据源
   */
  deleteDataSource (id) {
    return request({
      url: `${API_BASE}/delete`,
      method: 'post',
      data: { id }
    })
  },

  /**
   * 测试数据源连接
   */
  testConnection (data) {
    return request({
      url: `${API_BASE}/test`,
      method: 'post',
      data
    })
  },

  /**
   * 获取数据源表结构
   */
  getTableSchema (datasourceId, tableName) {
    return request({
      url: `${API_BASE}/schema`,
      method: 'get',
      params: { datasourceId, tableName }
    })
  }
}
