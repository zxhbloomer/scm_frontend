# Playwright测试最佳实践指南

> 基于Playwright官方源码深度分析，为SCM项目定制的测试最佳实践

## 🎯 核心原则

### 1. URL处理模式（学习Playwright官方TestServer）

**✅ 推荐做法**：
```javascript
// 配置文件中定义基础URL
export const WMS_CONFIG = {
  baseURL: 'http://localhost:9528'
};

// 使用相对路径定义路由
export const WMS_ROUTES = {
  warehouse: '/#/master/warehouse'
};

// 提供URL构建函数
export function buildURL(route) {
  return `${WMS_CONFIG.baseURL}${route}`;
}

// 测试中使用
await page.goto(WMS_FULL_URLS.warehouse); // 完整URL
await page.goto(WMS_ROUTES.warehouse);     // 相对路径（依赖baseURL配置）
```

**❌ 避免做法**：
```javascript
// 硬编码完整URL（不灵活）
await page.goto('http://localhost:9528/#/master/warehouse');

// 错误的相对路径构建
await page.goto('/#/master/warehouse'); // 没有baseURL支持时会失败
```

### 2. 认证处理模式

**✅ 推荐做法**：
```javascript
// 使用URL状态验证而非DOM选择器
await page.waitForFunction(() => {
  return !window.location.hash.includes('/login');
}, { timeout: 15000 });

// 验证认证成功后的预期URL
expect(page.url()).toContain('master/warehouse');
```

**❌ 避免做法**：
```javascript
// 依赖DOM选择器验证（不稳定）
await page.waitForSelector('.navbar-container', { timeout: 15000 });
```

### 3. 页面加载等待策略

**✅ 推荐做法**：
```javascript
// 使用networkidle等待页面完全加载
await page.waitForLoadState('networkidle');

// 验证核心内容而非DOM结构
const pageTitle = page.locator('h1, .page-title, [data-testid="page-title"]');
await expect(pageTitle.first()).toBeVisible({ timeout: 10000 });
```

## 🏗️ 项目结构最佳实践

### 目录组织（学习Playwright官方tests目录）

```
tests/
├── setup/
│   ├── config.js          # 配置文件（URL、超时等）
│   ├── auth.js            # 认证设置
│   └── fixtures.js        # 自定义fixtures
├── wms/                   # 按业务模块组织
│   ├── warehouse.spec.js  # 仓库管理测试
│   ├── inventory.spec.js  # 库存管理测试
│   └── stocktaking.spec.js # 盘点测试
├── utils/                 # 工具函数
│   ├── navigation.js      # 导航辅助函数
│   └── assertions.js      # 自定义断言
└── README_PLAYWRIGHT_BEST_PRACTICES.md
```

### 配置文件最佳实践

**playwright.config.js**：
```javascript
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://localhost:9528', // 关键：设置baseURL
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'echo "请确保前端服务已在 http://localhost:9528 启动"',
    port: 9528,
    reuseExistingServer: true
  }
});
```

## 📝 测试编写模式

### 1. 标准测试模板

```javascript
import { test, expect } from '@playwright/test';
import { setupWMSAuth } from '../setup/auth.js';
import { WMS_FULL_URLS, WMS_ROUTES } from '../setup/config.js';

test.describe('业务模块名', () => {
  test.beforeEach(async ({ page }) => {
    await setupWMSAuth(page);
  });

  test('具体功能测试', async ({ page }) => {
    // 1. 导航到目标页面
    await page.goto(WMS_FULL_URLS.targetPage);
    
    // 2. 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 3. 验证URL正确性
    expect(page.url()).toContain('expected-path');
    
    // 4. 验证页面内容
    const mainContent = page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
    
    // 5. 执行测试操作
    // ...
    
    // 6. 验证结果
    // ...
  });
});
```

### 2. Page Object模式（推荐用于复杂页面）

```javascript
// pages/WarehousePage.js
export class WarehousePage {
  constructor(page) {
    this.page = page;
    this.url = WMS_FULL_URLS.warehouse;
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-button"]');
    this.dataTable = page.locator('[data-testid="data-table"]');
  }

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async search(keyword) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifySearchResults() {
    await expect(this.dataTable).toBeVisible();
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows).toHaveCountGreaterThan(0);
  }
}
```

## 🔧 调试和故障排除

### 常见URL问题诊断

1. **URL不正确**：
   ```bash
   # 检查playwright.config.js中的baseURL设置
   # 验证WMS_ROUTES配置是否正确
   # 确认前端服务运行在正确端口
   ```

2. **认证失败**：
   ```bash
   # 检查auth.js中的认证逻辑
   # 验证登录后的URL跳转是否正确
   # 确认session/cookie设置是否有效
   ```

3. **页面加载超时**：
   ```bash
   # 使用networkidle等待策略
   # 增加超时时间配置
   # 检查页面是否有持续的网络请求
   ```

### 调试命令

```bash
# 运行单个测试文件
npx playwright test tests/wms/warehouse.spec.js --headed

# 调试模式运行
npx playwright test tests/wms/warehouse.spec.js --debug

# 生成测试报告
npx playwright test --reporter=html
```

## 📊 性能优化建议

### 1. 并发执行控制

```javascript
// playwright.config.js
export default defineConfig({
  workers: process.env.CI ? 1 : undefined, // CI环境使用单worker
  fullyParallel: true, // 允许并发执行
});
```

### 2. 重用认证状态

```javascript
// 在beforeEach中重用认证，避免每次重新登录
test.beforeEach(async ({ page }) => {
  await setupWMSAuth(page); // 已优化的认证设置
});
```

### 3. 智能等待策略

```javascript
// 使用合适的等待策略，避免不必要的延迟
await page.waitForLoadState('networkidle'); // 网络请求完成
await page.waitForSelector('[data-testid="content"]'); // 特定元素出现
await page.waitForFunction(() => window.appReady === true); // 自定义条件
```

## 🎯 质量保证检查清单

- [ ] 所有URL使用配置化管理，避免硬编码
- [ ] 认证验证基于URL状态而非DOM选择器
- [ ] 页面加载使用合适的等待策略
- [ ] 测试用例具有明确的成功/失败标准
- [ ] 错误信息清晰，便于调试
- [ ] 测试数据与生产数据隔离
- [ ] 支持CI/CD环境运行

## 📚 参考资料

- [Playwright官方文档](https://playwright.dev/)
- [SCM项目前端架构](../src/README.md)
- [Vue.js + Element UI最佳实践](../src/components/README.md)

---

*本指南基于Playwright官方源码深度分析制作，持续更新中...*