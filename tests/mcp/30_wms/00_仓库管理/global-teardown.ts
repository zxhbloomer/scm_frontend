import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Playwright 全局清理
 * 在所有测试完成后执行
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始全局测试清理...');
  
  try {
    // 读取测试会话信息
    const sessionFile = path.resolve('./test-results/test-session.json');
    let sessionInfo = { testStartTime: new Date().toISOString() };
    
    if (fs.existsSync(sessionFile)) {
      sessionInfo = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    }
    
    // 计算测试总时间
    const startTime = new Date(sessionInfo.testStartTime);
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(duration / 60000);
    const durationSeconds = Math.floor((duration % 60000) / 1000);
    
    // 统计错误截图数量
    const errorDir = path.resolve('./error');
    let errorCount = 0;
    let errorScreenshots: string[] = [];
    
    if (fs.existsSync(errorDir)) {
      const files = fs.readdirSync(errorDir);
      errorScreenshots = files.filter(file => file.endsWith('.png'));
      errorCount = errorScreenshots.length;
    }
    
    // 生成测试完成摘要
    const summary = {
      ...sessionInfo,
      testEndTime: endTime.toISOString(),
      totalDuration: `${durationMinutes}分${durationSeconds}秒`,
      durationMs: duration,
      errors: {
        total: errorCount,
        screenshots: errorScreenshots
      },
      testResults: {
        artifactsPath: path.resolve('./test-results/artifacts'),
        htmlReportPath: path.resolve('./test-results/html-report'),
        jsonResultsPath: path.resolve('./test-results/results.json')
      }
    };
    
    // 保存测试摘要
    fs.writeFileSync(
      path.resolve('./test-results/test-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // 输出测试完成信息
    console.log('📊 测试完成摘要:');
    console.log(`   - 测试开始时间: ${sessionInfo.testStartTime}`);
    console.log(`   - 测试结束时间: ${summary.testEndTime}`);
    console.log(`   - 总耗时: ${summary.totalDuration}`);
    console.log(`   - 错误数量: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log(`   - 错误截图: ${errorScreenshots.join(', ')}`);
      console.log(`   - 错误截图目录: ${errorDir}`);
    }
    
    console.log(`   - HTML报告: ${summary.testResults.htmlReportPath}/index.html`);
    console.log(`   - JSON结果: ${summary.testResults.jsonResultsPath}`);
    
    // 如果有错误，输出警告
    if (errorCount > 0) {
      console.warn(`⚠️  发现 ${errorCount} 个错误，请查看错误截图和测试报告`);
    } else {
      console.log('🎉 测试完成，未发现错误！');
    }
    
  } catch (error) {
    console.error('清理过程中发生错误:', error);
  }
  
  console.log('✅ 全局清理完成');
}

export default globalTeardown;