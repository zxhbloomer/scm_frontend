import request from '@/utils/request'

/**
 * 根据表名获取数据
 */
export function ccListApi (query) {
  return request({
    url: '/api/v1/bpm/process_work/ccList',
    method: 'post',
    data: query
  })
}

/**
 * 根据表名获取数据
 */
export function selectPageList (query) {
  return request({
    url: '/api/v1/bpm/cc/list',
    method: 'post',
    data: query
  })
}
