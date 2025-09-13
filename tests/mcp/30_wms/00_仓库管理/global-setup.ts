import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Playwright 全局设置
 * 在所有测试开始前执行
 */
async function globalSetup(config: FullConfig) {
  console.log('🔧 开始全局测试设置...');
  
  // 创建必要的目录
  const directories = [
    './error',
    './test-results',
    './test-results/html-report', 
    './test-results/allure-results',
    './test-results/artifacts'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 创建目录: ${fullPath}`);
    }
  });
  
  // 清理旧的测试结果
  console.log('🧹 清理旧的测试结果...');
  
  // 清理错误截图目录
  const errorDir = path.resolve('./error');
  if (fs.existsSync(errorDir)) {
    const files = fs.readdirSync(errorDir);
    files.forEach(file => {
      if (file.endsWith('.png') || file.endsWith('.md')) {
        fs.unlinkSync(path.join(errorDir, file));
      }
    });
  }
  
  // 记录测试开始时间
  const startTime = new Date().toISOString();
  const logInfo = {
    testStartTime: startTime,
    configuration: {
      baseURL: config.projects[0]?.use?.baseURL || 'http://localhost:9528',
      browser: config.projects[0]?.name || 'chromium',
      headless: config.projects[0]?.use?.headless || false,
      viewport: config.projects[0]?.use?.viewport || { width: 1920, height: 1080 }
    },
    testSuite: '仓库管理页面排序功能测试',
    totalSortableFields: 19
  };
  
  fs.writeFileSync(
    path.resolve('./test-results/test-session.json'), 
    JSON.stringify(logInfo, null, 2)
  );
  
  console.log('✅ 全局设置完成');
  console.log(`📊 测试配置信息:`);
  console.log(`   - 基础URL: ${logInfo.configuration.baseURL}`);
  console.log(`   - 浏览器: ${logInfo.configuration.browser}`);
  console.log(`   - 无头模式: ${logInfo.configuration.headless}`);
  console.log(`   - 视窗大小: ${logInfo.configuration.viewport.width}x${logInfo.configuration.viewport.height}`);
  console.log(`   - 可排序字段数: ${logInfo.totalSortableFields}`);
  console.log(`   - 测试开始时间: ${startTime}`);
}

export default globalSetup;