import request from '@/utils/request'

/**
 * 查询逻辑
 */
export function getListApi (query) {
  return request({
    url: '/api/v1/bpm/process/page_list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 */
export function getDetailApi (query) {
  return request({
    url: '/api/v1/bpm/process/get',
    method: 'post',
    data: query
  })
}

/**
 * 查询分组
 */
export function getGroupApi () {
  return request({
    url: '/api/v1/bpm/process/getgroup',
    method: 'get'
  })
}

/**
 * 发布模板
 */
export function deployProcessApi (query) {
  return request({
    url: '/api/v1/bpm/process/deploy',
    method: 'post',
    data: query
  })
}

/**
 * 根据表名获取数据
 */
export function getFlowProcessApi (query) {
  return request({
    url: '/api/v1/bpm/process/get_json',
    method: 'post',
    data: query
  })
}

/**
 * 根据表名获取数据
 */
export function createStartProcessApi (query) {
  return request({
    url: '/api/v1/bpm/process/createStartProcess',
    method: 'post',
    data: query
  })
}

/**
 * @description 将表单项树结构转换为扁平结构
 * @param formItemTree {Array}
 * @return Array
 */
export function flatFormItem (formItemTree) {
  return formItemTree.reduce((result, item) => {
    if (item.name === 'SpanLayout') {
      return result.concat(flatFormItem(item.props.items))
    } else {
      return result.concat(item)
    }
  }, [])
}

export function formatBusinessStatus (row, column) {
  const map = {
    '0': '正在处理',
    '1': '已撤销',
    '2': '完结',
    '3': '驳回'
  }
  return map[row[column.property]]
}

