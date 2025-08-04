const { SOOrderBasePage } = require('./soorder-base-page');

/**
 * SO订单列表页面对象模型
 * 对应 src/views/40_business/20_so/soorder/tabs/10_list/index.vue
 */
class SOOrderListPage extends SOOrderBasePage {
  constructor(page) {
    super(page);
    this.pageUrl = `${this.baseUrl}#main`;
  }

  // ===================
  // 列表页特有元素定位器
  // ===================

  // 数据表格
  get dataTable() {
    return this.page.locator('.list-content .el-table, .data-table .el-table');
  }

  get tableRows() {
    return this.dataTable.locator('.el-table__row');
  }

  get tableHeaders() {
    return this.dataTable.locator('.el-table__header th');
  }

  get noDataPlaceholder() {
    return this.page.locator('.el-table__empty-text, .no-data');
  }

  // 表格列
  get orderCodeColumn() {
    return this.dataTable.locator('td[class*="order-code"], td:has-text("SO")');
  }

  get customerNameColumn() {
    return this.dataTable.locator('td[class*="customer-name"]');
  }

  get orderDateColumn() {
    return this.dataTable.locator('td[class*="order-date"]');
  }

  get totalAmountColumn() {
    return this.dataTable.locator('td[class*="total-amount"], td[class*="amount"]');
  }

  get statusColumn() {
    return this.dataTable.locator('td[class*="status"]');
  }

  get actionColumn() {
    return this.dataTable.locator('td[class*="action"], td[class*="operation"]');
  }

  // 分页控件
  get pagination() {
    return this.page.locator('.el-pagination');
  }

  get paginationTotal() {
    return this.pagination.locator('.el-pagination__total');
  }

  get paginationSizes() {
    return this.pagination.locator('.el-pagination__sizes select');
  }

  get paginationPrev() {
    return this.pagination.locator('.btn-prev');
  }

  get paginationNext() {
    return this.pagination.locator('.btn-next');
  }

  // 工具栏
  get toolbar() {
    return this.page.locator('.toolbar, .action-bar');
  }

  get batchDeleteButton() {
    return this.toolbar.locator('button:has-text("批量删除")');
  }

  get batchExportButton() {
    return this.toolbar.locator('button:has-text("批量导出")');
  }

  get refreshButton() {
    return this.toolbar.locator('button:has-text("刷新"), .refresh-btn');
  }

  // 复选框
  get selectAllCheckbox() {
    return this.dataTable.locator('.el-table__header .el-checkbox');
  }

  get rowCheckboxes() {
    return this.dataTable.locator('.el-table__row .el-checkbox');
  }

  // 行操作按钮
  get rowViewButtons() {
    return this.dataTable.locator('button:has-text("查看")');
  }

  get rowEditButtons() {
    return this.dataTable.locator('button:has-text("修改")');
  }

  get rowDeleteButtons() {
    return this.dataTable.locator('button:has-text("删除")');
  }

  get rowApproveButtons() {
    return this.dataTable.locator('button:has-text("审批")');
  }

  get rowPrintButtons() {
    return this.dataTable.locator('button:has-text("打印")');
  }

  // 业务关联按钮
  get rowOutplanButtons() {
    return this.dataTable.locator('button:has-text("出库计划")');
  }

  get rowSettlementButtons() {
    return this.dataTable.locator('button:has-text("结算单")');
  }

  get rowCargoRightTransferButtons() {
    return this.dataTable.locator('button:has-text("货权转移")');
  }

  // ===================
  // 列表页业务方法
  // ===================

  /**
   * 导航到列表页
   */
  async navigateToListPage() {
    await this.page.goto(this.pageUrl);
    await this.waitForPageLoad();
    await this.switchToTab('main');
  }

  /**
   * 等待列表数据加载完成
   */
  async waitForListLoad() {
    await this.page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await this.page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 等待数据加载完成（要么有数据行，要么显示无数据）
    await this.page.waitForFunction(() => {
      const table = document.querySelector('.el-table');
      const rows = table.querySelectorAll('.el-table__row');
      const noData = table.querySelector('.el-table__empty-text');
      return rows.length > 0 || noData;
    }, { timeout: 10000 });
    
    await this.page.waitForTimeout(1000);
  }

  /**
   * 获取列表数据总数
   */
  async getListTotalCount() {
    const totalText = await this.paginationTotal.textContent();
    const match = totalText.match(/共\s*(\d+)\s*条/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 获取当前页显示的行数
   */
  async getCurrentPageRowCount() {
    return await this.tableRows.count();
  }

  /**
   * 验证列表页加载
   */
  async verifyListPageLoaded() {
    await this.expect(this.dataTable).toBeVisible();
    await this.expect(this.searchForm).toBeVisible();
    await this.expect(this.toolbar).toBeVisible();
    await this.expect(this.pagination).toBeVisible();
  }

  /**
   * 验证表格列标题
   */
  async verifyTableHeaders() {
    const expectedHeaders = [
      '订单编号', '客户名称', '订单日期', '交货日期', 
      '总金额', '状态', '操作'
    ];
    
    for (const header of expectedHeaders) {
      await this.expect(this.tableHeaders).toContainText(header);
    }
  }

  /**
   * 点击指定行的查看按钮
   * @param {number} rowIndex - 行索引（从0开始）
   */
  async clickViewButtonInRow(rowIndex = 0) {
    const viewButton = this.tableRows.nth(rowIndex).locator('button:has-text("查看")');
    await viewButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 点击指定行的编辑按钮
   * @param {number} rowIndex - 行索引（从0开始）
   */
  async clickEditButtonInRow(rowIndex = 0) {
    const editButton = this.tableRows.nth(rowIndex).locator('button:has-text("修改")');
    await editButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 点击指定行的删除按钮
   * @param {number} rowIndex - 行索引（从0开始）
   */
  async clickDeleteButtonInRow(rowIndex = 0) {
    const deleteButton = this.tableRows.nth(rowIndex).locator('button:has-text("删除")');
    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 点击指定行的审批按钮
   * @param {number} rowIndex - 行索引（从0开始）
   */
  async clickApproveButtonInRow(rowIndex = 0) {
    const approveButton = this.tableRows.nth(rowIndex).locator('button:has-text("审批")');
    await approveButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 点击新增按钮
   */
  async clickNewButton() {
    await this.newButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 获取指定行的订单编号
   * @param {number} rowIndex - 行索引（从0开始）
   */
  async getOrderCodeInRow(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    const orderCodeCell = row.locator('td').first();
    return await orderCodeCell.textContent();
  }

  /**
   * 获取指定行的客户名称
   * @param {number} rowIndex - 行索引（从0开始）
   */
  async getCustomerNameInRow(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    const customerNameCell = row.locator('td').nth(1);
    return await customerNameCell.textContent();
  }

  /**
   * 获取指定行的订单状态
   * @param {number} rowIndex - 行索引（从0开始）
   */
  async getOrderStatusInRow(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    const statusCell = row.locator('td[class*="status"]');
    return await statusCell.textContent();
  }

  /**
   * 选择指定行的复选框
   * @param {number} rowIndex - 行索引（从0开始）
   */
  async selectRowCheckbox(rowIndex = 0) {
    const checkbox = this.tableRows.nth(rowIndex).locator('.el-checkbox');
    await checkbox.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 选择所有行的复选框
   */
  async selectAllRows() {
    await this.selectAllCheckbox.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 执行批量删除操作
   */
  async performBatchDelete() {
    await this.batchDeleteButton.click();
    await this.handleConfirmDialog(true);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 切换分页大小
   * @param {number} pageSize - 每页显示数量
   */
  async changePageSize(pageSize) {
    await this.paginationSizes.selectOption({ value: pageSize.toString() });
    await this.waitForListLoad();
  }

  /**
   * 切换到下一页
   */
  async goToNextPage() {
    const isEnabled = await this.paginationNext.isEnabled();
    if (isEnabled) {
      await this.paginationNext.click();
      await this.waitForListLoad();
      return true;
    }
    return false;
  }

  /**
   * 切换到上一页
   */
  async goToPreviousPage() {
    const isEnabled = await this.paginationPrev.isEnabled();
    if (isEnabled) {
      await this.paginationPrev.click();
      await this.waitForListLoad();
      return true;
    }
    return false;
  }

  /**
   * 刷新列表数据
   */
  async refreshList() {
    await this.refreshButton.click();
    await this.waitForListLoad();
  }

  /**
   * 验证列表数据
   * @param {Array} expectedData - 期望的数据数组
   */
  async verifyListData(expectedData) {
    const actualRowCount = await this.getCurrentPageRowCount();
    
    if (expectedData.length === 0) {
      await this.expect(this.noDataPlaceholder).toBeVisible();
      return;
    }
    
    this.expect(actualRowCount).toBeGreaterThanOrEqual(1);
    
    // 验证第一行数据
    if (expectedData.length > 0) {
      const firstRowData = expectedData[0];
      
      if (firstRowData.orderCode) {
        const actualOrderCode = await this.getOrderCodeInRow(0);
        this.expect(actualOrderCode).toContain(firstRowData.orderCode);
      }
      
      if (firstRowData.customerName) {
        const actualCustomerName = await this.getCustomerNameInRow(0);
        this.expect(actualCustomerName).toContain(firstRowData.customerName);
      }
    }
  }

  /**
   * 验证行操作按钮状态
   * @param {number} rowIndex - 行索引
   * @param {Object} expectedStates - 期望的按钮状态
   */
  async verifyRowActionButtonStates(rowIndex = 0, expectedStates = {}) {
    const row = this.tableRows.nth(rowIndex);
    
    if (expectedStates.hasView !== undefined) {
      const viewButton = row.locator('button:has-text("查看")');
      if (expectedStates.hasView) {
        await this.expect(viewButton).toBeVisible();
      } else {
        await this.expect(viewButton).toBeHidden();
      }
    }
    
    if (expectedStates.hasEdit !== undefined) {
      const editButton = row.locator('button:has-text("修改")');
      if (expectedStates.hasEdit) {
        await this.expect(editButton).toBeVisible();
        await this.expect(editButton).toBeEnabled();
      } else {
        await this.expect(editButton).toBeDisabled();
      }
    }
    
    if (expectedStates.hasDelete !== undefined) {
      const deleteButton = row.locator('button:has-text("删除")');
      if (expectedStates.hasDelete) {
        await this.expect(deleteButton).toBeVisible();
        await this.expect(deleteButton).toBeEnabled();
      } else {
        await this.expect(deleteButton).toBeDisabled();
      }
    }
    
    if (expectedStates.hasApprove !== undefined) {
      const approveButton = row.locator('button:has-text("审批")');
      if (expectedStates.hasApprove) {
        await this.expect(approveButton).toBeVisible();
        await this.expect(approveButton).toBeEnabled();
      } else {
        await this.expect(approveButton).toBeDisabled();
      }
    }
  }

  /**
   * 执行高级搜索
   * @param {Object} searchCriteria - 搜索条件
   */
  async performAdvancedSearch(searchCriteria) {
    // 如果高级搜索面板未打开，则点击打开
    const isAdvancedVisible = await this.advancedSearchButton.isVisible();
    if (isAdvancedVisible) {
      await this.advancedSearchButton.click();
      await this.page.waitForTimeout(500);
    }
    
    await this.performSearch(searchCriteria);
  }

  /**
   * 重置搜索条件
   */
  async resetSearchConditions() {
    await this.resetButton.click();
    await this.page.waitForTimeout(500);
    await this.waitForListLoad();
  }

  /**
   * 验证搜索功能
   * @param {Object} searchCriteria - 搜索条件
   * @param {Object} expectedResult - 期望的搜索结果
   */
  async verifySearchFunctionality(searchCriteria, expectedResult) {
    // 执行搜索
    await this.performSearch(searchCriteria);
    
    // 验证搜索结果
    await this.verifySearchResults(expectedResult);
    
    // 重置搜索条件
    await this.resetSearchConditions();
  }
}

module.exports = { SOOrderListPage };