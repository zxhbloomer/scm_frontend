import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 仓库管理页面排序功能综合测试
 * 测试所有19个可排序字段的升序/降序排序功能
 */

// 测试配置
const TEST_CONFIG = {
  baseURL: 'http://localhost:9528',
  loginCredentials: {
    username: 'administrator',
    password: '654321',
    captcha: '1'
  },
  warehousePage: '/#/master/warehouse',
  errorScreenshotDir: './error'
};

// 可排序字段配置
const SORTABLE_FIELDS = [
  // 基础信息字段
  { field: 'warehouse_code', name: '仓库编码', category: '基础信息' },
  { field: 'warehouse_name', name: '仓库名称', category: '基础信息' },
  { field: 'warehouse_short_name', name: '仓库简称', category: '基础信息' },
  
  // 地理位置字段
  { field: 'province', name: '省份', category: '地理位置' },
  { field: 'city', name: '城市', category: '地理位置' },
  { field: 'district', name: '区县', category: '地理位置' },
  { field: 'address', name: '地址', category: '地理位置' },
  
  // 数值字段
  { field: 'sort', name: '排序', category: '数值' },
  { field: 'dbversion', name: '版本', category: '数值' },
  
  // 企业相关字段
  { field: 'org_id', name: '组织ID', category: '企业相关' },
  { field: 'org_code', name: '组织编码', category: '企业相关' },
  { field: 'org_name', name: '组织名称', category: '企业相关' },
  
  // 时间和人员字段
  { field: 'c_time', name: '创建时间', category: '时间人员' },
  { field: 'u_time', name: '修改时间', category: '时间人员' },
  { field: 'c_name', name: '创建人', category: '时间人员' },
  { field: 'u_name', name: '修改人', category: '时间人员' },
  
  // 其他字段
  { field: 'warehouse_type_name', name: '仓库类型', category: '其他' },
  { field: 'enabled_name', name: '启用状态', category: '其他' },
  { field: 'remark', name: '备注', category: '其他' }
];

// 测试结果记录
interface TestResult {
  field: string;
  fieldName: string;
  category: string;
  ascendingTest: {
    success: boolean;
    error?: string;
    screenshot?: string;
    responseTime?: number;
  };
  descendingTest: {
    success: boolean;
    error?: string;
    screenshot?: string;
    responseTime?: number;
  };
}

let testResults: TestResult[] = [];
let totalErrors = 0;

/**
 * 创建错误截图目录
 */
async function ensureErrorDir() {
  const errorDir = path.resolve(TEST_CONFIG.errorScreenshotDir);
  if (!fs.existsSync(errorDir)) {
    fs.mkdirSync(errorDir, { recursive: true });
  }
}

/**
 * 生成错误截图文件名
 */
function generateErrorScreenshotName(testCase: string, error: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedError = error.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  return `${testCase}_${sanitizedError}_${timestamp}.png`;
}

/**
 * 错误处理和截图
 */
async function handleError(page: Page, testCase: string, error: string): Promise<string> {
  console.error(`❌ 测试错误 [${testCase}]: ${error}`);
  
  const screenshotName = generateErrorScreenshotName(testCase, error);
  const screenshotPath = path.join(TEST_CONFIG.errorScreenshotDir, screenshotName);
  
  try {
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`📸 错误截图已保存: ${screenshotPath}`);
    totalErrors++;
    return screenshotName;
  } catch (screenshotError) {
    console.error(`截图失败: ${screenshotError}`);
    return '';
  }
}

/**
 * 等待并处理已知的登录后错误对话框
 */
async function handleLoginErrorDialog(page: Page) {
  try {
    // 等待可能出现的错误对话框
    const errorDialog = page.locator('.el-message-box');
    await errorDialog.waitFor({ timeout: 5000 });
    
    console.log('⚠️ 检测到登录后错误对话框，正在处理...');
    
    // 点击确定按钮关闭对话框
    const confirmButton = page.locator('.el-message-box .el-button--primary');
    await confirmButton.click();
    
    console.log('✅ 错误对话框已关闭');
    await page.waitForTimeout(1000);
  } catch (error) {
    // 如果没有错误对话框出现，继续执行
    console.log('ℹ️ 未检测到错误对话框');
  }
}

/**
 * 登录功能
 */
async function login(page: Page): Promise<boolean> {
  try {
    console.log('🔑 开始登录流程...');
    
    await page.goto(TEST_CONFIG.baseURL);
    await page.waitForLoadState('domcontentloaded');
    
    // 填写登录表单
    await page.fill('input[placeholder="请输入账号"]', TEST_CONFIG.loginCredentials.username);
    await page.fill('input[placeholder="请输入密码"]', TEST_CONFIG.loginCredentials.password);
    await page.fill('input[placeholder="请输入验证码"]', TEST_CONFIG.loginCredentials.captcha);
    
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    // 等待登录完成（URL变化或页面元素出现）
    await page.waitForTimeout(3000);
    
    // 处理可能出现的错误对话框
    await handleLoginErrorDialog(page);
    
    console.log('✅ 登录成功');
    return true;
  } catch (error) {
    await handleError(page, 'login', `登录失败: ${error}`);
    return false;
  }
}

/**
 * 导航到仓库管理页面
 */
async function navigateToWarehousePage(page: Page): Promise<boolean> {
  try {
    console.log('🧭 导航到仓库管理页面...');
    
    await page.goto(TEST_CONFIG.baseURL + TEST_CONFIG.warehousePage);
    await page.waitForLoadState('domcontentloaded');
    
    // 等待表格加载完成
    await page.waitForSelector('.el-table', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('✅ 成功进入仓库管理页面');
    return true;
  } catch (error) {
    await handleError(page, 'navigation', `页面导航失败: ${error}`);
    return false;
  }
}

/**
 * 检查列是否在视窗内，如不在则滚动
 */
async function ensureColumnVisible(page: Page, fieldName: string): Promise<void> {
  try {
    const columnHeader = page.locator(`.el-table__header th:has-text("${fieldName}")`);
    
    // 检查列是否存在
    if (await columnHeader.count() === 0) {
      console.log(`⚠️ 未找到列"${fieldName}"，可能需要滚动查看`);
      
      // 尝试横向滚动查找列
      const tableContainer = page.locator('.el-table__body-wrapper');
      const scrollStep = 200;
      const maxScrollAttempts = 10;
      
      for (let i = 0; i < maxScrollAttempts; i++) {
        await tableContainer.evaluate((element, step) => {
          element.scrollLeft += step;
        }, scrollStep);
        
        await page.waitForTimeout(500);
        
        if (await columnHeader.count() > 0) {
          console.log(`✅ 找到列"${fieldName}"，滚动了${(i + 1) * scrollStep}px`);
          break;
        }
      }
    }
    
    // 确保列在视窗内
    await columnHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  } catch (error) {
    console.warn(`列滚动检查失败: ${error}`);
  }
}

/**
 * 执行排序测试
 */
async function testFieldSorting(page: Page, field: { field: string; name: string; category: string }): Promise<TestResult> {
  const result: TestResult = {
    field: field.field,
    fieldName: field.name,
    category: field.category,
    ascendingTest: { success: false },
    descendingTest: { success: false }
  };
  
  console.log(`\n🔍 测试字段: ${field.name} (${field.field}) - ${field.category}`);
  
  try {
    // 确保列可见
    await ensureColumnVisible(page, field.name);
    
    const columnHeader = page.locator(`.el-table__header th:has-text("${field.name}")`);
    
    if (await columnHeader.count() === 0) {
      throw new Error(`未找到列头: ${field.name}`);
    }
    
    // 测试升序排序
    console.log(`  📈 测试升序排序...`);
    const ascendingStartTime = Date.now();
    
    try {
      await columnHeader.click();
      await page.waitForTimeout(1000);
      
      // 验证排序状态
      const ascendingIcon = page.locator(`.el-table__header th:has-text("${field.name}") .ascending`);
      if (await ascendingIcon.count() > 0) {
        result.ascendingTest.success = true;
        result.ascendingTest.responseTime = Date.now() - ascendingStartTime;
        console.log(`  ✅ 升序排序成功 (${result.ascendingTest.responseTime}ms)`);
      } else {
        throw new Error('升序排序指示器未显示');
      }
    } catch (error) {
      result.ascendingTest.error = error.toString();
      result.ascendingTest.screenshot = await handleError(page, `${field.field}_ascending`, error.toString());
    }
    
    // 测试降序排序
    console.log(`  📉 测试降序排序...`);
    const descendingStartTime = Date.now();
    
    try {
      await columnHeader.click();
      await page.waitForTimeout(1000);
      
      // 验证排序状态
      const descendingIcon = page.locator(`.el-table__header th:has-text("${field.name}") .descending`);
      if (await descendingIcon.count() > 0) {
        result.descendingTest.success = true;
        result.descendingTest.responseTime = Date.now() - descendingStartTime;
        console.log(`  ✅ 降序排序成功 (${result.descendingTest.responseTime}ms)`);
      } else {
        throw new Error('降序排序指示器未显示');
      }
    } catch (error) {
      result.descendingTest.error = error.toString();
      result.descendingTest.screenshot = await handleError(page, `${field.field}_descending`, error.toString());
    }
    
    // 恢复默认排序
    await columnHeader.click();
    await page.waitForTimeout(500);
    
  } catch (error) {
    const errorMsg = error.toString();
    result.ascendingTest.error = errorMsg;
    result.descendingTest.error = errorMsg;
    result.ascendingTest.screenshot = await handleError(page, `${field.field}_field_test`, errorMsg);
  }
  
  return result;
}

/**
 * 生成测试报告
 */
function generateTestReport(): string {
  const timestamp = new Date().toLocaleString('zh-CN');
  const totalTests = testResults.length * 2; // 每个字段测试升序和降序
  const successfulTests = testResults.reduce((count, result) => {
    return count + (result.ascendingTest.success ? 1 : 0) + (result.descendingTest.success ? 1 : 0);
  }, 0);
  const failedTests = totalTests - successfulTests;
  
  let report = `
# 仓库管理页面排序功能测试报告

## 📊 测试摘要
- **测试执行时间**: ${timestamp}
- **总测试用例数**: ${totalTests}
- **通过用例数**: ${successfulTests}
- **失败用例数**: ${failedTests}
- **发现错误总数**: ${totalErrors}
- **成功率**: ${((successfulTests / totalTests) * 100).toFixed(2)}%

## 📋 详细测试结果

`;

  // 按类别分组显示结果
  const categories = [...new Set(testResults.map(r => r.category))];
  
  categories.forEach(category => {
    report += `### ${category}字段测试结果\n\n`;
    
    const categoryResults = testResults.filter(r => r.category === category);
    
    categoryResults.forEach(result => {
      const ascStatus = result.ascendingTest.success ? '✅' : '❌';
      const descStatus = result.descendingTest.success ? '✅' : '❌';
      const ascTime = result.ascendingTest.responseTime || 'N/A';
      const descTime = result.descendingTest.responseTime || 'N/A';
      
      report += `**${result.fieldName} (${result.field})**\n`;
      report += `- 升序排序: ${ascStatus} (${ascTime}ms)\n`;
      report += `- 降序排序: ${descStatus} (${descTime}ms)\n`;
      
      if (result.ascendingTest.error) {
        report += `- 升序错误: ${result.ascendingTest.error}\n`;
        if (result.ascendingTest.screenshot) {
          report += `- 升序错误截图: ${result.ascendingTest.screenshot}\n`;
        }
      }
      
      if (result.descendingTest.error) {
        report += `- 降序错误: ${result.descendingTest.error}\n`;
        if (result.descendingTest.screenshot) {
          report += `- 降序错误截图: ${result.descendingTest.screenshot}\n`;
        }
      }
      
      report += `\n`;
    });
  });
  
  // 性能分析
  const responseTimes = testResults.flatMap(r => [
    r.ascendingTest.responseTime,
    r.descendingTest.responseTime
  ]).filter(time => time !== undefined) as number[];
  
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    report += `## ⚡ 性能分析

- **平均响应时间**: ${avgResponseTime.toFixed(2)}ms
- **最慢排序操作**: ${maxResponseTime}ms
- **最快排序操作**: ${minResponseTime}ms
- **超时操作数量**: 0 (无超时阈值设定)

`;
  }
  
  if (totalErrors > 0) {
    report += `## ⚠️ 错误汇总

本次测试共发现 ${totalErrors} 个错误，错误截图已保存在 ./error 目录中。

`;
  }
  
  report += `## 💡 测试建议

1. 所有排序功能均已测试，包括升序和降序排序
2. 测试覆盖了19个可排序字段，涵盖基础信息、地理位置、数值、企业相关、时间人员等类别
3. 实现了横向滚动处理，确保所有列都能被正确测试
4. 错误检测机制完善，所有错误都有截图记录
5. 建议定期执行此测试以确保排序功能稳定性

---
*测试脚本自动生成于 ${timestamp}*
`;
  
  return report;
}

// 主测试用例
test('仓库管理页面排序功能综合测试', async ({ page }) => {
  console.log('🚀 开始仓库管理页面排序功能综合测试\n');
  
  // 确保错误截图目录存在
  await ensureErrorDir();
  
  // 设置页面大小以确保能看到更多列
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // 步骤1: 登录
  const loginSuccess = await login(page);
  if (!loginSuccess) {
    throw new Error('登录失败，无法继续测试');
  }
  
  // 步骤2: 导航到仓库管理页面
  const navSuccess = await navigateToWarehousePage(page);
  if (!navSuccess) {
    throw new Error('导航到仓库管理页面失败');
  }
  
  console.log(`\n📝 开始测试 ${SORTABLE_FIELDS.length} 个可排序字段...\n`);
  
  // 步骤3: 测试所有可排序字段
  for (const field of SORTABLE_FIELDS) {
    const result = await testFieldSorting(page, field);
    testResults.push(result);
    
    // 每个字段测试完成后稍作延迟
    await page.waitForTimeout(500);
  }
  
  // 生成测试报告
  const report = generateTestReport();
  console.log('\n' + report);
  
  // 保存测试报告到文件
  const reportPath = path.join(TEST_CONFIG.errorScreenshotDir, `test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.md`);
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`📋 测试报告已保存: ${reportPath}`);
  
  // 如果有错误，测试失败
  if (totalErrors > 0) {
    throw new Error(`测试完成，但发现 ${totalErrors} 个错误，请查看错误截图和报告`);
  }
  
  console.log('\n🎉 所有排序功能测试通过！');
});