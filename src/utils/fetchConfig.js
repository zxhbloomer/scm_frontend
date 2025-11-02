/**
 * Fetch 请求配置工具
 * 用于 SSE (Server-Sent Events) 流式请求等 axios 不支持的场景
 * 保持与 request.js (axios) 相同的配置逻辑
 */

import { getTenantId } from './tenant'

/**
 * 从 cookie 中获取 token
 * @returns {string} token值，不存在则返回空字符串
 */
export function getTokenFromCookie () {
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(row => row.trim().startsWith('wms-Token='))
  return tokenCookie ? tokenCookie.split('=')[1] : ''
}

/**
 * 构建标准请求头（用于 fetch API）
 * 与 request.js 的拦截器逻辑保持一致
 * @param {Object} additionalHeaders - 额外的请求头
 * @returns {Object} 完整的请求头对象
 */
export function buildFetchHeaders (additionalHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  }

  // 添加 token
  const token = getTokenFromCookie()
  if (token) {
    headers['wms-Token'] = token
    headers['Authorization'] = token
  }

  // 添加租户ID
  const tenantId = getTenantId()
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId
  }

  return headers
}

/**
 * 构建 fetch 配置对象
 * @param {Object} options - 配置选项
 * @param {string} options.method - HTTP 方法，默认 'GET'
 * @param {Object|string} options.body - 请求体（对象会自动JSON序列化）
 * @param {Object} options.headers - 额外的请求头
 * @param {string} options.credentials - 凭证模式，默认 'include'
 * @param {AbortSignal} options.signal - 用于取消请求的 signal
 * @returns {Object} fetch 配置对象
 */
export function buildFetchConfig (options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    credentials = 'include',
    signal = null
  } = options

  const config = {
    method,
    headers: buildFetchHeaders(headers),
    credentials
  }

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  if (signal) {
    config.signal = signal
  }

  return config
}

/**
 * 获取完整URL
 * @param {string} path - API路径（如 '/api/v1/ai/chat'）
 * @returns {string} 完整URL
 */
export function buildFullUrl (path) {
  const baseURL = import.meta.env.VITE_BASE_API || ''
  return `${baseURL}${path}`
}
