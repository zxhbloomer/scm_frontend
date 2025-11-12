/**
 * AI工作流管理 API
 * 对应后端: AiWorkflowController
 *
 * @author SCM-AI团队
 * @since 2025-11-10
 */
import request from '@/request/http'

const API_PREFIX = '/ai'

/**
 * ==================== 工作流管理 API ====================
 */

/**
 * 保存工作流(新建或更新)
 * @param {Object} data 工作流数据
 * @returns {Promise}
 */
export function saveWorkflow (data) {
  return request({
    url: `${API_PREFIX}/workflow/save`,
    method: 'post',
    data
  })
}

/**
 * 测试运行工作流
 * @param {String} workflowUuid 工作流UUID
 * @param {String} testInput 测试输入内容
 * @returns {Promise}
 */
export function testWorkflow (workflowUuid, testInput) {
  return request({
    url: `${API_PREFIX}/workflow/test`,
    method: 'post',
    params: {
      workflowUuid,
      testInput
    }
  })
}

/**
 * 发布工作流
 * @param {String} workflowUuid 工作流UUID
 * @returns {Promise}
 */
export function publishWorkflow (workflowUuid) {
  return request({
    url: `${API_PREFIX}/workflow/publish`,
    method: 'post',
    params: {
      workflowUuid
    }
  })
}

/**
 * 取消发布工作流
 * @param {String} workflowUuid 工作流UUID
 * @returns {Promise}
 */
export function unpublishWorkflow (workflowUuid) {
  return request({
    url: `${API_PREFIX}/workflow/unpublish`,
    method: 'post',
    params: {
      workflowUuid
    }
  })
}

/**
 * 获取工作流详情
 * @param {String} workflowUuid 工作流UUID
 * @returns {Promise}
 */
export function getWorkflowDetail (workflowUuid) {
  return request({
    url: `${API_PREFIX}/workflow/detail`,
    method: 'get',
    params: {
      workflowUuid
    }
  })
}

/**
 * 获取用户所有工作流(管理页面)
 * @param {String} tenantCode 租户编码
 * @returns {Promise}
 */
export function getAllWorkflows (tenantCode) {
  return request({
    url: `${API_PREFIX}/workflow/list`,
    method: 'get',
    params: {
      tenantCode
    }
  })
}

/**
 * 获取已发布工作流(前端Tab筛选)
 * @param {String} tenantCode 租户编码
 * @param {String} category 可选的分类筛选(0/1/2)
 * @returns {Promise}
 */
export function getPublishedWorkflows (tenantCode, category = null) {
  return request({
    url: `${API_PREFIX}/workflow/published`,
    method: 'get',
    params: {
      tenantCode,
      category
    }
  })
}

/**
 * 删除工作流
 * @param {String} workflowUuid 工作流UUID
 * @returns {Promise}
 */
export function deleteWorkflow (workflowUuid) {
  return request({
    url: `${API_PREFIX}/workflow/delete`,
    method: 'post',
    params: {
      workflowUuid
    }
  })
}

