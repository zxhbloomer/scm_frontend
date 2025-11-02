/**
 * 租户管理工具
 * 集中管理多租户相关的配置和方法
 */

/**
 * 获取租户ID配置
 * 优先从环境变量读取，避免硬编码
 *
 * @returns {string|null} 租户ID
 *   - 固定租户模式（VUE_APP_Tenant='false'）：返回环境变量 VUE_APP_TENANT_ID 的值
 *   - 动态多租户模式（VUE_APP_Tenant='true'）：返回 null（暂未实现，后续从session获取）
 */
export function getTenantId () {
  const tenantMode = import.meta.env.VITE_Tenant || 'false'

  if (tenantMode === 'true') {
    // 多租户模式：从用户session动态获取（暂未实现）
    // TODO: 接入动态租户功能时，从 store.getters.currentTenantId 获取
    // import store from '@/store'
    // return store.getters.currentTenantId || null
    return null
  }

  // 固定租户模式：从环境变量读取
  return import.meta.env.VITE_TENANT_ID || 'scm_tenant_20250519_001'
}

/**
 * 检查是否启用多租户模式
 * @returns {boolean} true-多租户模式，false-固定租户模式
 */
export function isMultiTenantMode () {
  return import.meta.env.VITE_Tenant === 'true'
}

/**
 * 获取租户配置信息
 * @returns {Object} 租户配置对象
 */
export function getTenantConfig () {
  return {
    mode: isMultiTenantMode() ? 'multi' : 'single',
    tenantId: getTenantId(),
    enabled: import.meta.env.VITE_Tenant
  }
}

// 未来扩展功能预留：

/**
 * 切换租户（多租户模式下使用）
 * @param {string} tenantId - 新的租户ID
 * @returns {Promise<void>}
 *
 * @example
 * // 未来实现示例
 * await switchTenant('scm_tenant_new_001')
 */
// export async function switchTenant(tenantId) {
//   if (!isMultiTenantMode()) {
//     throw new Error('切换租户仅在多租户模式下可用')
//   }
//   // TODO: 实现租户切换逻辑
//   // 1. 更新 store 中的当前租户ID
//   // 2. 重新加载用户权限和数据
//   // 3. 刷新页面或重新初始化应用
// }

/**
 * 获取租户详细信息（多租户模式下使用）
 * @param {string} tenantId - 租户ID（可选，默认当前租户）
 * @returns {Promise<Object>} 租户信息对象
 *
 * @example
 * // 未来实现示例
 * const info = await getTenantInfo()
 * // { id: 'xxx', name: '某某公司', status: 'active', ... }
 */
// export async function getTenantInfo(tenantId) {
//   // TODO: 调用后端API获取租户信息
// }
