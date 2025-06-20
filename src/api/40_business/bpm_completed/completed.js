import request from '@/utils/request'

/**
 * 根据表名获取数据
 */
export function selectPageList (query) {
  return request({
    url: '/api/v1/bpm/todo/list',
    method: 'post',
    data: query
  })
}

/**
 * 获取流程图业务数据
 */
export function getInstanceProgressApi (query) {
  return request({
    url: '/api/v1/bpm/todo/getinstanceprogress',
    method: 'post',
    data: query
  })
}

