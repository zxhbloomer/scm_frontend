// AI MCP (Model Context Protocol) API服务
// 严格参照 AIDeepin index.ts 中的 MCP API 实现 (lines 751-768)
import request from '@/utils/request'

// API基础路径 - 对应SCM后端McpController
const API_BASE = '/api/v1/ai/mcp'

// ==================== 模板MCP API ====================

/**
 * 搜索模板MCP列表
 * 对应AIDeepin: mcpSearch(keyword: string, currentPage: number, pageSize: number)
 * 对应后端: McpController.searchTemplates(@RequestParam String keyword, @RequestParam int currentPage, @RequestParam int pageSize)
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.currentPage - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} - MCP模板分页数据
 */
export function mcpSearch (params) {
  return request({
    url: `${API_BASE}/template/search`,
    method: 'post',
    data: {
      keyword: params.keyword || '',
      current_page: params.currentPage,
      page_size: params.pageSize
    }
  })
}

/**
 * 获取模板MCP列表
 * 对应AIDeepin: mcpList(currentPage: number, pageSize: number)
 * 对应后端: McpController.listTemplates(@RequestParam int currentPage, @RequestParam int pageSize)
 * @param {number} currentPage - 当前页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise} - MCP模板分页数据
 */
export function mcpList (currentPage, pageSize) {
  return request({
    url: `${API_BASE}/template/list`,
    method: 'post',
    data: {
      current_page: currentPage,
      page_size: pageSize
    }
  })
}

/**
 * 获取模板MCP详情
 * 对应AIDeepin: getMcpDetail(id: number)
 * 对应后端: McpController.getTemplateDetail(@PathVariable Long id)
 * @param {number} id - MCP模板ID
 * @returns {Promise} - MCP模板详情数据
 */
export function getMcpDetail (id) {
  return request({
    url: `${API_BASE}/template/${id}`,
    method: 'get'
  })
}

/**
 * 安装模板MCP到用户空间
 * 对应AIDeepin: installMcp(mcpId: number)
 * 对应后端: McpController.install(@PathVariable Long mcpId)
 * @param {number} mcpId - MCP模板ID
 * @returns {Promise} - 安装结果
 */
export function installMcp (mcpId) {
  return request({
    url: `${API_BASE}/install/${mcpId}`,
    method: 'post'
  })
}

/**
 * 测试模板MCP连接
 * 对应AIDeepin: testMcpConnection(mcpId: number)
 * 对应后端: McpController.testTemplate(@PathVariable Long mcpId)
 * @param {number} mcpId - MCP模板ID
 * @returns {Promise} - 测试结果
 */
export function testMcpConnection (mcpId) {
  return request({
    url: `${API_BASE}/template/test/${mcpId}`,
    method: 'post'
  })
}

/**
 * 获取MCP分类列表
 * 对应AIDeepin: getMcpCategories()
 * 对应后端: McpController.getCategories()
 * @returns {Promise} - MCP分类列表
 */
export function getMcpCategories () {
  return request({
    url: `${API_BASE}/categories`,
    method: 'get'
  })
}

/**
 * 按分类获取模板MCP列表
 * 对应AIDeepin: getMcpsByCategory(category: string, currentPage: number, pageSize: number)
 * 对应后端: McpController.listByCategory(@RequestParam String category, @RequestParam int currentPage, @RequestParam int pageSize)
 * @param {Object} params - 查询参数
 * @param {string} params.category - 分类名称
 * @param {number} params.currentPage - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} - MCP模板分页数据
 */
export function getMcpsByCategory (params) {
  return request({
    url: `${API_BASE}/template/category`,
    method: 'post',
    data: {
      category: params.category,
      current_page: params.currentPage,
      page_size: params.pageSize
    }
  })
}

// ==================== 用户MCP API ====================

/**
 * 获取用户MCP列表
 * 对应AIDeepin: userMcpList(currentPage: number, pageSize: number)
 * 对应后端: McpController.listUserMcps(@RequestParam int currentPage, @RequestParam int pageSize)
 * @param {number} currentPage - 当前页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise} - 用户MCP分页数据
 */
export function userMcpList (currentPage, pageSize) {
  return request({
    url: `${API_BASE}/user/list`,
    method: 'post',
    data: {
      current_page: currentPage,
      page_size: pageSize
    }
  })
}

/**
 * 添加用户MCP
 * 对应AIDeepin: addUserMcp(params: AddUserMcpParams)
 * 对应后端: McpController.addUserMcp(@RequestBody AiUserMcpVo userMcpVo)
 * @param {Object} params - 用户MCP参数
 * @param {string} params.name - MCP名称
 * @param {string} params.description - MCP描述
 * @param {string} params.serverUrl - 服务器URL
 * @param {Object} params.config - MCP配置(JSON对象)
 * @param {boolean} params.enabled - 是否启用
 * @returns {Promise} - 添加结果
 */
export function addUserMcp (params) {
  return request({
    url: `${API_BASE}/user/add`,
    method: 'post',
    data: {
      name: params.name,
      description: params.description || '',
      server_url: params.serverUrl,
      config: params.config || {},
      enabled: params.enabled !== undefined ? params.enabled : true
    }
  })
}

/**
 * 更新用户MCP
 * 对应AIDeepin: updateUserMcp(params: UpdateUserMcpParams)
 * 对应后端: McpController.updateUserMcp(@RequestBody AiUserMcpVo userMcpVo)
 * @param {Object} params - 用户MCP参数
 * @param {number} params.id - 用户MCP ID
 * @param {string} params.name - MCP名称
 * @param {string} params.description - MCP描述
 * @param {string} params.serverUrl - 服务器URL
 * @param {Object} params.config - MCP配置(JSON对象)
 * @param {boolean} params.enabled - 是否启用
 * @returns {Promise} - 更新结果
 */
export function updateUserMcp (params) {
  return request({
    url: `${API_BASE}/user/update`,
    method: 'put',
    data: {
      id: params.id,
      name: params.name,
      description: params.description || '',
      server_url: params.serverUrl,
      config: params.config || {},
      enabled: params.enabled !== undefined ? params.enabled : true
    }
  })
}

/**
 * 删除用户MCP
 * 对应AIDeepin: deleteUserMcp(id: number)
 * 对应后端: McpController.deleteUserMcp(@PathVariable Long id)
 * @param {number} id - 用户MCP ID
 * @returns {Promise} - 删除结果
 */
export function deleteUserMcp (id) {
  return request({
    url: `${API_BASE}/user/${id}`,
    method: 'delete'
  })
}

/**
 * 获取用户MCP详情
 * 对应AIDeepin: getUserMcpDetail(id: number)
 * 对应后端: McpController.getUserMcpDetail(@PathVariable Long id)
 * @param {number} id - 用户MCP ID
 * @returns {Promise} - 用户MCP详情数据
 */
export function getUserMcpDetail (id) {
  return request({
    url: `${API_BASE}/user/${id}`,
    method: 'get'
  })
}

/**
 * 启用/禁用用户MCP
 * 对应AIDeepin: toggleUserMcp(id: number)
 * 对应后端: McpController.toggleUserMcp(@PathVariable Long id)
 * @param {number} id - 用户MCP ID
 * @returns {Promise} - 操作结果
 */
export function toggleUserMcp (id) {
  return request({
    url: `${API_BASE}/user/toggle/${id}`,
    method: 'post'
  })
}

/**
 * 测试用户MCP连接
 * 对应AIDeepin: testUserMcpConnection(id: number)
 * 对应后端: McpController.testUserMcp(@PathVariable Long id)
 * @param {number} id - 用户MCP ID
 * @returns {Promise} - 测试结果
 */
export function testUserMcpConnection (id) {
  return request({
    url: `${API_BASE}/user/test/${id}`,
    method: 'post'
  })
}

/**
 * 获取已启用的用户MCP列表(用于workflow节点选择)
 * @param {string} userId - 用户ID
 * @returns {Promise} - 已启用的用户MCP列表
 */
export function getEnabledUserMcps (userId) {
  return request({
    url: `${API_BASE}/user/list-enabled`,
    method: 'get',
    params: { userId }
  })
}

// 导出所有API函数
export default {
  // 模板MCP
  mcpSearch,
  mcpList,
  getMcpDetail,
  installMcp,
  testMcpConnection,
  getMcpCategories,
  getMcpsByCategory,
  // 用户MCP
  userMcpList,
  addUserMcp,
  updateUserMcp,
  deleteUserMcp,
  getUserMcpDetail,
  toggleUserMcp,
  testUserMcpConnection
}
