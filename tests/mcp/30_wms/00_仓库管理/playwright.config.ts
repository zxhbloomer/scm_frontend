import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件 - 仓库管理页面排序功能测试
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试目录
  testDir: '.',
  
  // 全局测试超时时间 (30分钟)
  globalTimeout: 30 * 60 * 1000,
  
  // 单个测试超时时间 (10分钟)
  timeout: 10 * 60 * 1000,
  
  // 期望超时时间
  expect: {
    timeout: 10 * 1000,
  },
  
  // 并发运行配置
  fullyParallel: false, // 排序测试需要顺序执行以避免干扰
  
  // 失败重试次数
  retries: process.env.CI ? 2 : 1,
  
  // 并发工作进程数
  workers: 1, // 排序测试使用单线程以确保稳定性
  
  // 测试报告器配置
  reporter: [
    ['html', { outputFolder: './test-results/html-report' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['list'],
    ['allure-playwright', { outputFolder: './test-results/allure-results' }]
  ],
  
  // 测试输出目录
  outputDir: './test-results/artifacts',
  
  // 全局设置
  use: {
    // 基础URL
    baseURL: 'http://localhost:9528',
    
    // 浏览器配置
    headless: false, // 显示浏览器以便观察测试过程
    viewport: { width: 1920, height: 1080 },
    
    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,
    
    // 操作超时时间
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
    
    // 截图配置
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // 浏览器上下文配置
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    
    // 添加自定义用户代理
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SCM-Warehouse-Sorting-Test',
  },

  // 项目配置 - 多浏览器测试
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 排序测试专用配置
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
          geolocation: { latitude: 39.9042, longitude: 116.4074 }, // 北京坐标
        }
      },
    },
    
    // 可选：其他浏览器测试
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 全局测试钩子
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),
  
  // Web服务器配置（如果需要启动本地服务）
  // webServer: {
  //   command: 'npm run dev',
  //   port: 9528,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});