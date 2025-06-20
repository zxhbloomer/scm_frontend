import request from '@/utils/request'

/**
 * 查看我的待办
 */
export function selectPageListApi (query) {
  return request({
    url: '/api/v1/bpm/todo/list',
    method: 'post',
    data: query
  })
}

/**
 * 根据查询条件，获取待办数据条数
 */
export function selectTodoCountApi (query) {
  return request({
    url: '/api/v1/bpm/todo/count',
    method: 'post',
    data: query
  })
}

/**
 * 查看我的待办
 */
export function getListTenApi (query) {
  return request({
    url: '/api/v1/bpm/todo/list/ten',
    method: 'post',
    data: query
  })
}

/**
 * 通过流程实例id查看详情
 */
export function instanceInfoApi (query) {
  return request({
    url: '/api/v1/bpm/todo/instanceInfo',
    method: 'post',
    data: query
  })
}

/**
 * 同意
 */
export function agreeApi (query) {
  return request({
    url: '/api/v1/bpm/todo/agree',
    method: 'post',
    data: query
  })
}

/**
 * 流程审批拒绝
 */
export function refuseApi (query) {
  return request({
    url: '/api/v1/bpm/todo/refuse',
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

/**
 * 流程审批评论
 */
export function commentsApi (query) {
  return request({
    url: '/api/v1/bpm/todo/comments',
    method: 'post',
    data: query
  })
}

/**
 * 流程审批撤销
 */
export function cancelApi (query) {
  return request({
    url: '/api/v1/bpm/todo/cancel',
    method: 'post',
    data: query
  })
}

/**
 * 流程审批拒绝
 */
export function transferApi (query) {
  return request({
    url: '/api/v1/bpm/todo/transfer',
    method: 'post',
    data: query
  })
}
