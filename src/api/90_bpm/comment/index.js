import request from '@/utils/request'
// 合同统计

/**
 * 采购合同统计
 * @param {*} query
 */
export function getDictApi (query) {
  return request({
    url: 'api/v1/dictdata/list/data',
    method: 'post',
    data: query
  })
}
