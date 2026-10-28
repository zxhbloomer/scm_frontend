import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getUserInfo (query) {
  return request({
    url: '/api/v1/user/get',
    method: 'post',
    data: query
  })
}

/**
 * 修改密码逻辑
 * @param {*} data
 */
export function updatePwd (query) {
  return request({
    url: '/api/v1/user/password/update',
    method: 'post',
    data: query
  })
}

/**
 * 生成当前用户默认头像
 */
export function generateAvatar () {
  return request({
    url: '/api/v1/user/avatar/generate',
    method: 'post'
  })
}

