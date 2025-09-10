// WMS测试基础配置 - 采用Playwright官方推荐的URL处理模式
export const WMS_CONFIG = {
  baseURL: 'http://localhost:9528',
  apiPrefix: '/scm/api/v1',
  timeout: 30000,
  tenantId: 'scm_tenant_20250519_001'
};

// 路由配置 - 使用相对路径，配合baseURL使用
export const WMS_ROUTES = {
  warehouse: '/#/master/warehouse',
  inventory: '/#/master/inventory', 
  inbound: '/#/master/inbound',
  outbound: '/#/master/outbound',
  stocktaking: '/#/master/stocktaking'
};

// URL构建辅助函数 - 学习Playwright官方TestServer模式
export function buildURL(route) {
  return `${WMS_CONFIG.baseURL}${route}`;
}

// 完整URL常量 - 用于直接导航场景
export const WMS_FULL_URLS = {
  warehouse: buildURL(WMS_ROUTES.warehouse),
  inventory: buildURL(WMS_ROUTES.inventory),
  inbound: buildURL(WMS_ROUTES.inbound),
  outbound: buildURL(WMS_ROUTES.outbound),
  stocktaking: buildURL(WMS_ROUTES.stocktaking)
};