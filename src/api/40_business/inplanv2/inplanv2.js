import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/inplanv2/list',
    method: 'post',
    data: query
  })
}

/**
 * 校验数据
 */
export function validateApi (query) {
  return request({
    url: '/api/v1/inplanv2/validate',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListSumApi (query) {
  return request({
    url: '/api/v1/inplanv2/list/sum',
    method: 'post',
    data: query
  })
}

/**
 * 详情查询逻辑
 * @param {*} data
 */
export function getApi (query) {
  return request({
    url: '/api/v1/inplanv2/get',
    method: 'post',
    data: query
  })
}

/**
 * 查询入库数量
 * @param {*} data
 */
export function countApi (query) {
  return request({
    url: '/api/v1/inplanv2/checkcount',
    method: 'post',
    data: query
  })
}

/**
 * 详情查询逻辑
 * @param {*} data
 */
export function getPlanDetailApi (query) {
  return request({
    url: '/api/v1/inplanv2/getplandetail',
    method: 'post',
    data: query
  })
}

/**
 * 更新api
 * @param {*} data
 */
export function updateApi (data) {
  return request({
    url: '/api/v1/inplanv2/save',
    method: 'post',
    data
  })
}

/**
 * 插入api
 * @param {*} data
 */
export function insertApi (data) {
  return request({
    url: '/api/v1/inplanv2/insert',
    method: 'post',
    data
  })
}

/**
 * 作废api
 * @param {*} data
 */
export function cancelApi (data) {
  return request({
    url: '/api/v1/inplanv2/cancel',
    method: 'post',
    data
  })
}

/**
 * 完成api
 * @param {*} data
 */
export function finishApi (data) {
  return request({
    url: '/api/v1/inplanv2/finish',
    method: 'post',
    data
  })
}

/**
 * 入库操作api
 * @param {*} data
 */
export function operateApi (data) {
  return request({
    url: '/api/v1/inplanv2/operate',
    method: 'post',
    data
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/inplanv2/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportAllApi (data) {
  return request({
    url: '/api/v1/inplanv2/export_all',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 查询选中的数据是否包含多个详情
 * @param {*} data
 */
export function getIsHaveMoreDetailApi (data) {
  return request({
    url: '/api/v1/inplanv2/get_detail_count',
    method: 'post',
    data
  })
}

/**
 * 查询超收配置
 * @param {*} data
 */
export function getOverReceiveConfigApi (query) {
  return request({
    url: '/api/v1/inplanv2/over_receive/get',
    method: 'post',
    data: query
  })
}

/**
 * 查询 皮重, 毛重 开关控制
 * @param {*} data
 */
export function getWeightControlConfigApi (query) {
  return request({
    url: '/api/v1/inplanv2/weight_control/get',
    method: 'get',
    data: query
  })
}

/**
 * 查询 皮重, 毛重 开关控制
 * @param {*} data
 */
export function getCountApi (query) {
  return request({
    url: '/api/v1/inplanv2/count',
    method: 'post',
    data: query
  })
}
