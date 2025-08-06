const { test, expect } = require('@playwright/test');

/**
 * 销售合同列表页面排序功能 E2E 测试
 * 测试所有可排序字段的升序、降序功能
 * 使用真实后台API，不使用Mock数据
 */
test.describe('销售合同列表页面排序功能 E2E 测试', () => {
  let page;

  // 可排序字段配置
  const sortableFields = [
    { field: 'project_code', label: '项目编号', type: 'text', headerIndex: 2 },
    { field: 'contract_code', label: '合同编号', type: 'text', headerIndex: 3 },
    { field: 'type_name', label: '类型', type: 'text', headerIndex: 4 },
    { field: 'order_volume', label: '订单笔数', type: 'number', headerIndex: 5 },
    { field: 'status_name', label: '状态', type: 'text', headerIndex: 6 },
    { field: 'customer_name', label: '客户', type: 'text', headerIndex: 8 },
    { field: 'purchaser_name', label: '销售方（主体企业）', type: 'text', headerIndex: 9 },
    { field: 'execution_progress', label: '执行进度', type: 'text', headerIndex: 10 },
    { field: 'sign_date', label: '签约日期', type: 'date', headerIndex: 11 },
    { field: 'expiry_date', label: '到期日期', type: 'date', headerIndex: 12 },
    { field: 'delivery_date', label: '交货日期', type: 'date', headerIndex: 13 },
    { field: 'delivery_type_name', label: '运输方式', type: 'text', headerIndex: 14 },
    { field: 'settle_type_name', label: '结算方式', type: 'text', headerIndex: 15 },
    { field: 'bill_type_name', label: '结算单据类型', type: 'text', headerIndex: 16 },
    { field: 'payment_type_name', label: '付款方式', type: 'text', headerIndex: 17 },
    { field: 'contract_amount_sum', label: '合同总金额', type: 'number', headerIndex: 18 },
    { field: 'contract_total', label: '总销售数量（吨）', type: 'number', headerIndex: 19 },
    { field: 'tax_amount_sum', label: '税额', type: 'number', headerIndex: 20 },
    { field: 'settled_qty', label: '已结算数量（吨）', type: 'number', headerIndex: 21 },
    { field: 'settled_price', label: '结算金额', type: 'number', headerIndex: 22 },
    { field: 'advance_pay_price', label: '预收款金额', type: 'number', headerIndex: 23 },
    { field: 'accumulated_act_price', label: '累计实收', type: 'number', headerIndex: 24 },
    { field: 'unpaid_amount', label: '未收', type: 'number', headerIndex: 25 },
    { field: 'advance_refund_amount_total', label: '预收款可退金额', type: 'number', headerIndex: 26 },
    { field: 'already_invoice_price', label: '已开票金额', type: 'number', headerIndex: 27 },
    { field: 'c_name', label: '创建人', type: 'text', headerIndex: 31 },
    { field: 'c_time', label: '创建时间', type: 'datetime', headerIndex: 32 },
    { field: 'u_time', label: '更新时间', type: 'datetime', headerIndex: 34 }
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
    await page.goto('http://localhost:19528/#/socontract');
    
    // 等待页面加载完成
    await page.waitForSelector('.el-table', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('页面初始化状态检查', async () => {
    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
    
    // 验证默认排序（更新时间降序）
    const defaultSortIcon = page.locator('.el-table th:has-text("更新时间") .el-table__column-sort-icon');
    await expect(defaultSortIcon).toBeVisible();
    
    // 验证表格有数据
    const rows = page.locator('.el-table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // 测试每个可排序字段
  sortableFields.forEach(({ field, label, type, headerIndex }) => {
    test.describe(`${label} (${field}) 排序测试`, () => {
      test('升序排序测试', async () => {
        // 点击表头进行升序排序
        const headerSelector = `.el-table th:nth-child(${headerIndex}) .el-table__column-sort-icon`;
        await page.click(headerSelector);
        
        // 等待网络请求完成
        await page.waitForLoadState('networkidle');
        
        // 验证升序排序图标显示
        const ascIcon = page.locator(`.el-table th:nth-child(${headerIndex}) .ascending`);
        await expect(ascIcon).toHaveClass(/is-asc/);
        
        // 验证数据排序正确性
        await validateSortOrder(page, headerIndex, type, 'asc');
      });

      test('降序排序测试', async () => {
        // 再次点击表头进行降序排序
        const headerSelector = `.el-table th:nth-child(${headerIndex}) .el-table__column-sort-icon`;
        await page.click(headerSelector);
        
        // 等待网络请求完成
        await page.waitForLoadState('networkidle');
        
        // 验证降序排序图标显示
        const descIcon = page.locator(`.el-table th:nth-child(${headerIndex}) .descending`);
        await expect(descIcon).toHaveClass(/is-desc/);
        
        // 验证数据排序正确性
        await validateSortOrder(page, headerIndex, type, 'desc');
      });

      test('取消排序测试', async () => {
        // 第三次点击表头取消排序
        const headerSelector = `.el-table th:nth-child(${headerIndex}) .el-table__column-sort-icon`;
        await page.click(headerSelector);
        
        // 等待网络请求完成
        await page.waitForLoadState('networkidle');
        
        // 验证排序图标不再高亮
        const sortIcon = page.locator(`.el-table th:nth-child(${headerIndex}) .el-table__column-sort-icon`);
        await expect(sortIcon).not.toHaveClass(/is-asc|is-desc/);
      });
    });
  });

  test('排序状态切换测试', async () => {
    const testField = sortableFields[0]; // 使用项目编号进行测试
    const headerSelector = `.el-table th:nth-child(${testField.headerIndex}) .el-table__column-sort-icon`;
    
    // 初始状态：无排序
    let sortIcon = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .el-table__column-sort-icon`);
    await expect(sortIcon).not.toHaveClass(/is-asc|is-desc/);
    
    // 第一次点击：升序
    await page.click(headerSelector);
    await page.waitForLoadState('networkidle');
    
    const ascIcon = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .ascending`);
    await expect(ascIcon).toHaveClass(/is-asc/);
    
    // 第二次点击：降序
    await page.click(headerSelector);
    await page.waitForLoadState('networkidle');
    
    const descIcon = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .descending`);
    await expect(descIcon).toHaveClass(/is-desc/);
    
    // 第三次点击：取消排序
    await page.click(headerSelector);
    await page.waitForLoadState('networkidle');
    
    sortIcon = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .el-table__column-sort-icon`);
    await expect(sortIcon).not.toHaveClass(/is-asc|is-desc/);
  });

  test('多字段排序互斥测试', async () => {
    const field1 = sortableFields[0]; // 项目编号
    const field2 = sortableFields[1]; // 合同编号
    
    // 对第一个字段进行排序
    await page.click(`.el-table th:nth-child(${field1.headerIndex}) .el-table__column-sort-icon`);
    await page.waitForLoadState('networkidle');
    
    // 验证第一个字段排序生效
    const field1Icon = page.locator(`.el-table th:nth-child(${field1.headerIndex}) .ascending`);
    await expect(field1Icon).toHaveClass(/is-asc/);
    
    // 对第二个字段进行排序
    await page.click(`.el-table th:nth-child(${field2.headerIndex}) .el-table__column-sort-icon`);
    await page.waitForLoadState('networkidle');
    
    // 验证第二个字段排序生效
    const field2Icon = page.locator(`.el-table th:nth-child(${field2.headerIndex}) .ascending`);
    await expect(field2Icon).toHaveClass(/is-asc/);
    
    // 验证第一个字段排序被清除
    const field1ClearIcon = page.locator(`.el-table th:nth-child(${field1.headerIndex}) .el-table__column-sort-icon`);
    await expect(field1ClearIcon).not.toHaveClass(/is-asc|is-desc/);
  });

  test('排序与分页结合测试', async () => {
    const testField = sortableFields[2]; // 使用类型字段
    
    // 设置排序
    await page.click(`.el-table th:nth-child(${testField.headerIndex}) .el-table__column-sort-icon`);
    await page.waitForLoadState('networkidle');
    
    // 获取第一页的第一条数据
    const firstRowValue = await page.locator('.el-table tbody tr:first-child td:nth-child(' + testField.headerIndex + ')').innerText();
    
    // 切换到第二页（如果存在）
    const nextPageBtn = page.locator('.btn-next');
    if (await nextPageBtn.isEnabled()) {
      await nextPageBtn.click();
      await page.waitForLoadState('networkidle');
      
      // 验证排序状态保持
      const sortIcon = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .ascending`);
      await expect(sortIcon).toHaveClass(/is-asc/);
      
      // 返回第一页
      await page.locator('.btn-prev').click();
      await page.waitForLoadState('networkidle');
      
      // 验证数据一致性
      const firstRowValueAfter = await page.locator('.el-table tbody tr:first-child td:nth-child(' + testField.headerIndex + ')').innerText();
      expect(firstRowValueAfter).toBe(firstRowValue);
    }
  });

  test('排序与标签页切换测试', async () => {
    const testField = sortableFields[3]; // 使用订单笔数字段
    
    // 在"全部"标签页设置排序
    await page.click(`.el-table th:nth-child(${testField.headerIndex}) .el-table__column-sort-icon`);
    await page.waitForLoadState('networkidle');
    
    // 验证排序生效
    const sortIcon1 = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .ascending`);
    await expect(sortIcon1).toHaveClass(/is-asc/);
    
    // 切换到"待审批"标签页
    await page.click('.el-tabs .el-tab-pane:has-text("待审批")');
    await page.waitForLoadState('networkidle');
    
    // 验证排序状态保持
    const sortIcon2 = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .ascending`);
    await expect(sortIcon2).toHaveClass(/is-asc/);
    
    // 切换回"全部"标签页
    await page.click('.el-tabs .el-tab-pane:has-text("全部")');
    await page.waitForLoadState('networkidle');
    
    // 验证排序状态依然保持
    const sortIcon3 = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .ascending`);
    await expect(sortIcon3).toHaveClass(/is-asc/);
  });

  test('大数据量排序性能测试', async () => {
    const testField = sortableFields[4]; // 使用状态字段
    
    // 记录排序前的时间
    const startTime = Date.now();
    
    // 执行排序
    await page.click(`.el-table th:nth-child(${testField.headerIndex}) .el-table__column-sort-icon`);
    await page.waitForLoadState('networkidle');
    
    // 记录排序后的时间
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 验证排序响应时间（应在5秒内完成）
    expect(duration).toBeLessThan(5000);
    
    // 验证排序结果正确显示
    const sortIcon = page.locator(`.el-table th:nth-child(${testField.headerIndex}) .ascending`);
    await expect(sortIcon).toHaveClass(/is-asc/);
  });
});

/**
 * 验证排序顺序的辅助函数
 * @param {Page} page - Playwright页面对象
 * @param {number} columnIndex - 列索引
 * @param {string} dataType - 数据类型 (text, number, date, datetime)
 * @param {string} sortOrder - 排序顺序 (asc, desc)
 */
async function validateSortOrder(page, columnIndex, dataType, sortOrder) {
  // 获取当前页面所有行的该列数据
  const cells = page.locator(`.el-table tbody tr td:nth-child(${columnIndex})`);
  const cellCount = await cells.count();
  
  if (cellCount < 2) return; // 数据少于2条，无法验证排序
  
  const values = [];
  for (let i = 0; i < Math.min(cellCount, 10); i++) { // 只验证前10行数据
    const cellText = await cells.nth(i).innerText();
    values.push(cellText.trim());
  }
  
  // 根据数据类型转换值
  const convertedValues = values.map(value => convertValue(value, dataType));
  
  // 验证排序顺序
  for (let i = 0; i < convertedValues.length - 1; i++) {
    const current = convertedValues[i];
    const next = convertedValues[i + 1];
    
    if (current === null || next === null) continue; // 跳过空值
    
    if (sortOrder === 'asc') {
      expect(current <= next).toBeTruthy();
    } else if (sortOrder === 'desc') {
      expect(current >= next).toBeTruthy();
    }
  }
}

/**
 * 根据数据类型转换值
 * @param {string} value - 原始值
 * @param {string} dataType - 数据类型
 * @returns {*} 转换后的值
 */
function convertValue(value, dataType) {
  if (!value || value === '-' || value === '') return null;
  
  switch (dataType) {
    case 'number':
      const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(numValue) ? null : numValue;
    
    case 'date':
    case 'datetime':
      const dateValue = new Date(value);
      return isNaN(dateValue.getTime()) ? null : dateValue;
    
    case 'text':
    default:
      return value.toLowerCase();
  }
}