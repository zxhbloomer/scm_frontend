import request from '@/utils/request'

/**
 * 查询逻辑
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/fund/monitor/pagelist',
    method: 'post',
    data: query
  })
}
