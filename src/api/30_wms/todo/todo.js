import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getCountApi (query) {
  return request({
    url: '/api/v1/bpm/todo/count',
    method: 'post',
    data: query
  })
}
