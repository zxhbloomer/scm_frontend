import request from '@/utils/request'

/**
 * 根据表名获取数据
 */
export function selectPageList (query) {
  return request({
    url: '/api/v1/bpm/instance/list',
    method: 'post',
    data: query
  })
}
