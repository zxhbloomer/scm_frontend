import request from '@/utils/request'

/**
 * 查询逻辑
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/enterprise/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 获取企业类型
 */
export function getTypeApi (query) {
  return request({
    url: '/api/v1/enterprise/gettype',
    method: 'post',
    data: query
  })
}

// /**
//  * 增加企业
//  */
// export function insertApi (query) {
//   return request({
//     url: '/api/v1/enterprise/insert',
//     method: 'post',
//     data: query
//   })
// }

/**
 * 增加企业 增加审批流程
 */
export function insertApi (query) {
  return request({
    url: '/api/v1/enterprise/insert',
    method: 'post',
    data: query
  })
}

// /**
//  * 增加企业
//  */
// export function updateApi (query) {
//   return request({
//     url: '/api/v1/enterprise/save',
//     method: 'post',
//     data: query
//   })
// }

/**
 * 修改企业 增加审批流程
 */
export function updateApi (query) {
  return request({
    url: '/api/v1/enterprise/save',
    method: 'post',
    data: query
  })
}

/**
 * 校验数据
 */
export function validateApi (query) {
  return request({
    url: '/api/v1/enterprise/validate',
    method: 'post',
    data: query
  })
}

/**
 * 获取详情
 */
export function getDetailApi (query) {
  return request({
    url: '/api/v1/enterprise/getdetail',
    method: 'post',
    data: query
  })
}

// /**
//  * 修改是否黑名单状态
//  */
// export function updateBlacklistApi (query) {
//   return request({
//     url: '/api/v1/enterprise/updateblacklist',
//     method: 'post',
//     data: query
//   })
// }

// /**
//  * 审核状态
//  */
// export function updateAuditApi (query) {
//   return request({
//     url: '/api/v1/enterprise/updateaudit',
//     method: 'post',
//     data: query
//   })
// }

/**
 * 删除企业
 */
export function deleteApi (query) {
  return request({
    url: '/api/v1/enterprise/delete',
    method: 'post',
    data: query
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportApi (data) {
  return request({
    url: '/api/v1/enterprise/export',
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
    url: '/api/v1/enterprise/exportall',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 查询逻辑
 */
export function getAdjustDataApi (query) {
  return request({
    url: '/api/v1/enterprise/adjustlist',
    method: 'post',
    data: query
  })
}

/**
 * 获取详情
 */
export function getAdjustDetailApi (query) {
  return request({
    url: '/api/v1/enterprise/getadjustdetail',
    method: 'post',
    data: query
  })
}

/**
 * 导入数据
 */
export function importApi (query) {
  return request({
    url: '/api/v1/enterprise/import',
    method: 'post',
    data: query
  })
}

/**
 * 报表打印
 */
export function printApi (query) {
  return request({
    url: '/api/v1/enterprise/print',
    method: 'post',
    data: query
  })
}

/**
 * 获取企业下拉列表数据（交易对手、供应商）
 */
export function selectCounterpartySupplierGridDataApi (query) {
  return request({
    url: '/api/v1/enterprise/cp/supplier/select_grid',
    method: 'post',
    data: query
  })
}

/**
 * 获取企业下拉列表数据（交易对手、买方、客户、经销商）
 */
export function selectCounterpartyCustomerGridDataApi (query) {
  return request({
    url: '/api/v1/enterprise/cp/customer/select_grid',
    method: 'post',
    data: query
  })
}

/**
 * 获取企业下拉列表数据（主体企业、系统企业、供应商）
 */
export function selectSystemEnterpriseSupplierGridDataApi (query) {
  return request({
    url: '/api/v1/enterprise/se/supplier/select_grid',
    method: 'post',
    data: query
  })
}

/**
 * 获取企业下拉列表数据（主体企业、系统企业、买方、经销商）
 */
export function selectSystemEnterpriseCustomerGridDataApi (query) {
  return request({
    url: '/api/v1/enterprise/se/customer/select_grid',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：主体企业、客户、经销商
 * getSystemEnterpriseCustomerListApi
 */
export function selectCounterpartySupplierListApi (query) {
  return request({
    url: '/api/v1/enterprise/se/customer/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：根据查询条件，获取企业列表（交易对手、供应商）
 * getSystemEnterpriseCustomerListApi
 */
export function getCounterpartySupplierListApi (query) {
  return request({
    url: '/api/v1/enterprise/cp/supplier/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：主体企业、客户、经销商
 * getSystemEnterpriseCustomerListApi
 */
export function getSystemEnterpriseCustomerListApi (query) {
  return request({
    url: '/api/v1/enterprise/se/customer/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：根据查询条件，获取企业列表（交易对手、供应商、主体企业）
 * getSystemEnterpriseSupplierListApi
 */
export function getSystemEnterpriseSupplierListApi (query) {
  return request({
    url: '/api/v1/enterprise/se/supplier/pagelist',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：根据查询条件，获取企业列表（系统企业、买方、经销商）
 * getCounterpartyCustomerListApi
 */
export function getCounterpartyCustomerListApi (query) {
  return request({
    url: '/api/v1/enterprise/cp/customer/pagelist',
    method: 'post',
    data: query
  })
}
