// 可选：新建多企业类型选择API接口示例
import request from '@/utils/request'

/**
 * 根据多个企业类型查询企业列表（通用多类型选择）
 * 支持多个企业类型组合查询
 * @param {Object} query 查询参数
 * @param {Array} query.type_ids 企业类型数组，如：['1', '2', '3']
 * @param {Object} query.pageCondition 分页参数
 * @param {String} query.combine_search_condition 搜索关键词
 * @param {Boolean} query.enable 是否启用
 * @returns {Promise} 企业列表数据
 */
export function selectEnterpriseByTypesGridDataApi (query) {
  return request({
    url: '/api/v1/enterprise/selectbytypes/select_grid',
    method: 'post',
    data: query
  })
}

// 使用示例：
/*
const searchParams = {
  pageCondition: {
    current: 1,
    size: 20,
    sort: 'name'
  },
  combine_search_condition: '搜索关键词',
  enable: true,
  type_ids: ['1', '2'],  // 客户+供应商
  region: '华北',        // 额外查询条件
  audit_status: 'approved'
}

const response = await selectEnterpriseByTypesGridDataApi(searchParams)
*/
