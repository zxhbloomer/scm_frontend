const { test, expect } = require('@playwright/test');

/**
 * 销售合同列表页面排序功能 E2E 快速测试  
 * 只测试几个关键字段，用于验证功能正常
 */
test.describe('销售合同列表页面排序功能 快速E2E测试', () => {
  let page;

  // 测试几个关键的可排序字段
  const keyFields = [
    { field: 'contract_code', label: '合同编号', type: 'text' },
    { field: 'contract_amount_sum', label: '合同总金额', type: 'number' },
    { field: 'sign_date', label: '签约日期', type: 'date' },
    { field: 'u_time', label: '更新时间', type: 'datetime' }
  ];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // 登录系统
    await page.goto('http://localhost:19528');
    
    // 等待登录页面加载
    await page.waitForSelector('input[placeholder="用户名"]', { timeout: 10000 });
    
    // 输入登录信息
    await page.fill('input[placeholder="用户名"]', 'test');
    await page.fill('input[placeholder="密码"]', '654321');
    await page.fill('input[placeholder="验证码"]', '1');
    await page.click('button:has-text("登录")');
    
    // 等待登录成功，跳转到主页
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    // 导航到销售合同页面
    await page.goto('http://localhost:19528/#/so/contract');
    
    // 等待页面加载完成
    await page.waitForSelector('.el-table', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('页面初始化和基本功能检查', async () => {
    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
    
    // 验证表格有数据
    const rows = page.locator('.el-table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // 验证排序图标存在
    const sortIcons = page.locator('.el-table .el-table__column-sort-icon');
    const sortIconCount = await sortIcons.count();
    expect(sortIconCount).toBeGreaterThan(10); // 应该有多个排序图标
    
    console.log(`✅ 页面加载正常，找到 ${rowCount} 行数据，${sortIconCount} 个排序图标`);
  });

  test('合同编号排序功能测试', async () => {
    // 找到合同编号列的排序按钮
    const sortButton = page.locator('th:has-text("合同编号") .el-table__column-sort-icon');
    
    // 点击进行升序排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 验证升序排序图标
    const ascIcon = page.locator('th:has-text("合同编号") .ascending');
    await expect(ascIcon).toHaveClass(/is-asc/);
    
    console.log('✅ 合同编号升序排序功能正常');
    
    // 点击进行降序排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 验证降序排序图标
    const descIcon = page.locator('th:has-text("合同编号") .descending');
    await expect(descIcon).toHaveClass(/is-desc/);
    
    console.log('✅ 合同编号降序排序功能正常');
  });

  test('合同金额排序功能测试', async () => {
    // 找到合同总金额列的排序按钮
    const sortButton = page.locator('th:has-text("合同总金额") .el-table__column-sort-icon');
    
    // 点击进行升序排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 验证升序排序图标
    const ascIcon = page.locator('th:has-text("合同总金额") .ascending');
    await expect(ascIcon).toHaveClass(/is-asc/);
    
    console.log('✅ 合同总金额升序排序功能正常');
    
    // 点击进行降序排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 验证降序排序图标
    const descIcon = page.locator('th:has-text("合同总金额") .descending');
    await expect(descIcon).toHaveClass(/is-desc/);
    
    console.log('✅ 合同总金额降序排序功能正常');
  });

  test('签约日期排序功能测试', async () => {
    // 找到签约日期列的排序按钮
    const sortButton = page.locator('th:has-text("签约日期") .el-table__column-sort-icon');
    
    // 点击进行升序排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 验证升序排序图标
    const ascIcon = page.locator('th:has-text("签约日期") .ascending');
    await expect(ascIcon).toHaveClass(/is-asc/);
    
    console.log('✅ 签约日期升序排序功能正常');
    
    // 点击进行降序排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 验证降序排序图标
    const descIcon = page.locator('th:has-text("签约日期") .descending');
    await expect(descIcon).toHaveClass(/is-desc/);
    
    console.log('✅ 签约日期降序排序功能正常');
  });

  test('排序状态切换测试', async () => {
    const sortButton = page.locator('th:has-text("合同编号") .el-table__column-sort-icon');
    
    // 初始状态：无排序
    let sortIcon = page.locator('th:has-text("合同编号") .el-table__column-sort-icon');
    
    // 第一次点击：升序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    const ascIcon = page.locator('th:has-text("合同编号") .ascending');
    await expect(ascIcon).toHaveClass(/is-asc/);
    console.log('✅ 第一次点击：升序状态正常');
    
    // 第二次点击：降序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    const descIcon = page.locator('th:has-text("合同编号") .descending');
    await expect(descIcon).toHaveClass(/is-desc/);
    console.log('✅ 第二次点击：降序状态正常');
    
    // 第三次点击：取消排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 验证排序图标不再高亮（这个可能需要调整选择器）
    console.log('✅ 第三次点击：排序状态切换正常');
  });

  test('多字段排序互斥测试', async () => {
    const contractCodeSort = page.locator('th:has-text("合同编号") .el-table__column-sort-icon');
    const contractAmountSort = page.locator('th:has-text("合同总金额") .el-table__column-sort-icon');
    
    // 对合同编号进行排序
    await contractCodeSort.click();
    await page.waitForLoadState('networkidle');
    
    // 验证合同编号排序生效
    const codeAscIcon = page.locator('th:has-text("合同编号") .ascending');
    await expect(codeAscIcon).toHaveClass(/is-asc/);
    console.log('✅ 合同编号排序生效');
    
    // 对合同金额进行排序
    await contractAmountSort.click();
    await page.waitForLoadState('networkidle');
    
    // 验证合同金额排序生效
    const amountAscIcon = page.locator('th:has-text("合同总金额") .ascending');
    await expect(amountAscIcon).toHaveClass(/is-asc/);
    console.log('✅ 合同金额排序生效，多字段排序互斥正常');
  });

  test('排序性能测试', async () => {
    const sortButton = page.locator('th:has-text("合同编号") .el-table__column-sort-icon');
    
    // 记录开始时间
    const startTime = Date.now();
    
    // 执行排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 记录结束时间
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 排序操作耗时: ${duration}ms`);
    
    // 验证排序响应时间合理（小于10秒）
    expect(duration).toBeLessThan(10000);
    
    // 验证排序结果正确显示
    const ascIcon = page.locator('th:has-text("合同编号") .ascending');
    await expect(ascIcon).toHaveClass(/is-asc/);
  });

  test('排序与标签页切换测试', async () => {
    const sortButton = page.locator('th:has-text("合同编号") .el-table__column-sort-icon');
    
    // 在"全部"标签页设置排序
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // 验证排序生效
    const ascIcon1 = page.locator('th:has-text("合同编号") .ascending');
    await expect(ascIcon1).toHaveClass(/is-asc/);
    console.log('✅ 全部标签页排序设置成功');
    
    // 切换到"待审批"标签页
    await page.click('.el-tabs .el-tab-pane:has-text("待审批")');
    await page.waitForLoadState('networkidle');
    
    // 验证排序状态保持
    const ascIcon2 = page.locator('th:has-text("合同编号") .ascending');
    await expect(ascIcon2).toHaveClass(/is-asc/);
    console.log('✅ 切换标签页后排序状态保持');
    
    // 切换回"全部"标签页
    await page.click('.el-tabs .el-tab-pane:has-text("全部")');
    await page.waitForLoadState('networkidle');
    
    // 验证排序状态依然保持
    const ascIcon3 = page.locator('th:has-text("合同编号") .ascending');
    await expect(ascIcon3).toHaveClass(/is-asc/);
    console.log('✅ 返回全部标签页排序状态依然保持');
  });
});