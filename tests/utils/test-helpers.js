/**
 * 测试辅助工具类
 * 提供通用的测试工具方法
 */

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @param {string} prefix - 前缀
 */
function generateRandomString(length = 8, prefix = '') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机数字
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 */
function generateRandomNumber(min = 1, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式 ('YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss')
 */
function formatDate(date = new Date(), format = 'YYYY-MM-DD') {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'YYYY-MM-DD HH:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * 等待指定时间
 * @param {number} ms - 毫秒数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试执行函数
 * @param {Function} fn - 要执行的函数
 * @param {number} retries - 重试次数
 * @param {number} delay - 重试间隔 (毫秒)
 */
async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(delay);
    }
  }
}

/**
 * 生成测试用户数据
 */
function generateUserData() {
  const timestamp = Date.now();
  return {
    username: `testuser_${timestamp}`,
    password: 'Test123456',
    email: `test_${timestamp}@example.com`,
    phone: `138${generateRandomNumber(10000000, 99999999)}`,
    realName: `测试用户_${timestamp}`,
    status: '启用'
  };
}

/**
 * 生成测试公司数据
 */
function generateCompanyData() {
  const timestamp = Date.now();
  return {
    name: `测试公司_${timestamp}`,
    code: `COM${timestamp}`,
    type: '供应商',
    address: '北京市朝阳区测试地址',
    contact: '张三',
    phone: `010-${generateRandomNumber(10000000, 99999999)}`,
    status: '正常'
  };
}

/**
 * 清理测试数据的通用方法
 * @param {Object} page - Playwright page对象
 * @param {string} searchKeyword - 搜索关键词
 */
async function cleanupTestData(page, searchKeyword) {
  try {
    // 搜索测试数据
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="查询"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(searchKeyword);
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    // 查找并删除测试数据
    const deleteButtons = page.locator('button:has-text("删除")');
    const count = await deleteButtons.count();
    
    for (let i = 0; i < count; i++) {
      await deleteButtons.nth(i).click();
      // 确认删除
      await page.locator('.el-message-box button:has-text("确定")').click();
      await page.waitForTimeout(500);
    }
  } catch (error) {
    console.log('清理测试数据时出错:', error.message);
  }
}

/**
 * 验证Element UI表格数据
 * @param {Object} page - Playwright page对象
 * @param {Array} expectedData - 期望的数据数组
 */
async function validateTableData(page, expectedData) {
  const tableRows = page.locator('.el-table__body tr');
  const rowCount = await tableRows.count();
  
  expect(rowCount).toBeGreaterThan(0);
  
  for (let i = 0; i < Math.min(rowCount, expectedData.length); i++) {
    const row = tableRows.nth(i);
    const cells = row.locator('td');
    const cellCount = await cells.count();
    
    for (let j = 0; j < cellCount && j < expectedData[i].length; j++) {
      const cellText = await cells.nth(j).textContent();
      if (expectedData[i][j]) {
        expect(cellText).toContain(expectedData[i][j]);
      }
    }
  }
}

/**
 * 截图工具 (用于调试)
 * @param {Object} page - Playwright page对象
 * @param {string} name - 截图名称
 */
async function takeScreenshot(page, name) {
  const timestamp = Date.now();
  const filename = `${name}-${timestamp}.png`;
  await page.screenshot({ 
    path: `tests/e2e/reports/screenshots/${filename}`,
    fullPage: true 
  });
  console.log(`截图已保存: ${filename}`);
}

/**
 * 等待网络请求完成
 * @param {Object} page - Playwright page对象
 * @param {string} urlPattern - URL模式
 * @param {number} timeout - 超时时间
 */
async function waitForApiResponse(page, urlPattern, timeout = 10000) {
  return await page.waitForResponse(
    response => response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}

/**
 * 模拟文件上传
 * @param {Object} page - Playwright page对象
 * @param {string} fileSelector - 文件输入选择器
 * @param {string} fileName - 文件名
 * @param {string} content - 文件内容
 */
async function uploadFile(page, fileSelector, fileName, content) {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator(fileSelector).click();
  const fileChooser = await fileChooserPromise;
  
  // 创建临时文件
  const buffer = Buffer.from(content);
  await fileChooser.setFiles({
    name: fileName,
    mimeType: 'text/plain',
    buffer: buffer,
  });
}

module.exports = {
  generateRandomString,
  generateRandomNumber,
  formatDate,
  sleep,
  retry,
  generateUserData,
  generateCompanyData,
  cleanupTestData,
  validateTableData,
  takeScreenshot,
  waitForApiResponse,
  uploadFile
};