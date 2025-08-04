// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * 简化版 Playwright 配置
 * 适用于 Vue.js 2.7.16 + Element UI SCM 系统
 */
module.exports = defineConfig({
  // 测试目录 - 包含所有测试类型
  testDir: './tests',
  
  // 超时设置 - 进一步优化测试超时时间
  timeout: 90 * 1000, // 90秒
  expect: {
    timeout: 15000 // 15秒断言超时
  },

  // 并行执行 - 支持并行但限制并发数避免资源竞争
  fullyParallel: true,
  
  // CI环境设置
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 3, // CI环境2个worker，本地3个worker

  // 报告配置
  reporter: [
    ['html', { outputFolder: 'tests/e2e/reports/html' }],
    ['json', { outputFile: 'tests/e2e/reports/test-results.json' }],
    ['list'] // 控制台输出
  ],

  // 全局配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:19528',
    
    // 截图配置：失败时 + 手动截图支持
    screenshot: 'only-on-failure',
    
    // 录屏配置：失败时保留
    video: 'retain-on-failure',
    
    // 调试追踪：重试时生成完整操作记录
    trace: 'on-first-retry',
    
    // 中文支持
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    
    // 等待策略 - 优化并行执行的超时设置
    actionTimeout: 20000,
    navigationTimeout: 60000,
    
    // 并行测试优化
    ignoreHTTPSErrors: true, // 忽略HTTPS错误
    bypassCSP: true, // 绕过内容安全策略
    
    // 浏览器上下文隔离
    contextOptions: {
      // 为每个测试创建独立的浏览器上下文
      storageState: undefined, // 不共享存储状态
    }
  },

  // 测试项目配置 - 并行优化版本
  projects: [
    // 登录状态设置项目（为并行测试准备）
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
      teardown: 'cleanup',
    },
    
    // 清理项目
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.js/,
    },
    
    // 单元测试 - 并行优化
    {
      name: 'unit-tests',
      testDir: './tests',
      testMatch: ['**/unit/**/*.js'],
      testIgnore: ['**/unit/**/*.spec.js'],  // 排除Vue Test Utils的.spec.js文件
      dependencies: ['setup'], // 依赖登录状态设置
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        // 并行测试优化配置
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        }
      },
    },
    
    // E2E测试 - 并行配置
    {
      name: 'e2e-tests', 
      testDir: './tests',
      testMatch: ['**/e2e/**/*.{js,spec.js}'],
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        launchOptions: {
          args: ['--disable-web-security', '--no-sandbox']
        }
      },
    },
    
    // 集成测试 - 并行配置
    {
      name: 'integration-tests',
      testDir: './tests', 
      testMatch: ['**/integration/**/*.{js,spec.js}'],
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        launchOptions: {
          args: ['--disable-web-security', '--no-sandbox']
        }
      },
    },
    
    // Firefox并行测试（可选）
    {
      name: 'firefox-e2e',
      testDir: './tests',
      testMatch: ['**/e2e/**/*.{js,spec.js}'],
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1366, height: 768 }
      },
    },
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    port: 19528,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分钟启动超时
  },
});