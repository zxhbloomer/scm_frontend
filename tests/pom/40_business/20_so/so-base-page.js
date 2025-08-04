const { BasePage } = require('../../base-page');

/**
 * SO业务基础页面对象模型
 * 包含销售订单相关业务的通用元素定位器和操作方法
 */
class SOBasePage extends BasePage {
  constructor(page) {
    super(page);
    this.baseUrl = '/40_business/20_so';
  }

  // ===================
  // SO业务通用元素定位器
  // ===================

  // 业务单据状态标签页
  get allTab() {
    return this.page.getByRole('tab', { name: /全部|所有/ });
  }

  get draftTab() {
    return this.page.getByRole('tab', { name: '草稿' });
  }

  get pendingApprovalTab() {
    return this.page.getByRole('tab', { name: '待审批' });
  }

  get approvingTab() {
    return this.page.getByRole('tab', { name: '审批中' });
  }

  get approvedTab() {
    return this.page.getByRole('tab', { name: '已审批' });
  }

  get executingTab() {
    return this.page.getByRole('tab', { name: '执行中' });
  }

  get completedTab() {
    return this.page.getByRole('tab', { name: '已完成' });
  }

  get cancelledTab() {
    return this.page.getByRole('tab', { name: '已作废' });
  }

  // 业务表格
  get businessTable() {
    return this.page.locator('.el-table');
  }

  get tableRows() {
    return this.businessTable.locator('tbody tr');
  }

  get tableHeaders() {
    return this.businessTable.locator('thead th');
  }

  // 分页组件
  get pagination() {
    return this.page.locator('.el-pagination');
  }

  get paginationTotal() {
    return this.pagination.locator('.el-pagination__total');
  }

  get paginationSizer() {
    return this.pagination.locator('.el-pagination__sizes .el-select');
  }

  // 搜索表单
  get searchForm() {
    return this.page.locator('.search-form, .filter-container');
  }

  get advancedSearchButton() {
    return this.page.getByRole('button', { name: /高级查询|更多查询/ });
  }

  // 操作按钮区域
  get toolbarButtons() {
    return this.page.locator('.toolbar-buttons, .table-tools');
  }

  // SO业务特有按钮
  get pushButton() {
    return this.page.getByRole('button', { name: /下推|推送/ });
  }

  get finishButton() {
    return this.page.getByRole('button', { name: /完成|结束/ });
  }

  get pushDialog() {
    return this.page.locator('.push-dialog .el-dialog');
  }

  // 金额统计显示
  get totalAmountDisplay() {
    return this.page.locator('.total-amount, .amount-summary');
  }

  // ===================
  // SO业务通用操作方法
  // ===================

  /**
   * 切换状态标签页
   * @param {string} tabName - 标签页名称
   */
  async switchStatusTab(tabName) {
    const tabMap = {
      'all': this.allTab,
      'draft': this.draftTab,
      'pendingApproval': this.pendingApprovalTab,
      'approving': this.approvingTab,
      'approved': this.approvedTab,
      'executing': this.executingTab,
      'completed': this.completedTab,
      'cancelled': this.cancelledTab
    };

    const tab = tabMap[tabName];
    if (tab) {
      await tab.click();
      await this.waitForLoading();
    }
  }

  /**
   * 执行搜索操作 - 现代化版本
   * @param {Object} searchCriteria - 搜索条件
   */
  async search(searchCriteria) {
    // 填写搜索条件 - 使用现代化定位器
    for (const [field, value] of Object.entries(searchCriteria)) {
      if (value) {
        const input = this.page.getByLabel(field)
          .or(this.page.getByPlaceholder(field))
          .or(this.page.getByTestId(field))
          .or(this.searchForm.locator(`input[placeholder*="${field}"], select[placeholder*="${field}"]`));
        
        if (await input.isVisible()) {
          await input.fill(value.toString());
        }
      }
    }

    // 点击搜索按钮
    await this.searchButton.click();
    await this.waitForLoading();
  }

  /**
   * 重置搜索条件
   */
  async resetSearch() {
    await this.resetButton.click();
    await this.waitForLoading();
  }

  /**
   * 高级查询
   * @param {Object} advancedCriteria - 高级查询条件
   */
  async advancedSearch(advancedCriteria) {
    // 点击高级查询按钮
    await this.advancedSearchButton.click();
    await this.page.waitForTimeout(500);

    // 填写高级查询条件
    await this.fillForm(advancedCriteria);

    // 执行查询
    await this.searchButton.click();
    await this.waitForLoading();
  }

  /**
   * 获取表格数据
   */
  async getTableData() {
    const rows = await this.tableRows.all();
    const data = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      data.push(cells);
    }

    return data;
  }

  /**
   * 选择表格行
   * @param {number} rowIndex - 行索引
   */
  async selectTableRow(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    await row.click();
  }

  /**
   * 双击表格行
   * @param {number} rowIndex - 行索引
   */
  async doubleClickTableRow(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    await row.dblclick();
  }

  /**
   * 获取分页信息
   */
  async getPaginationInfo() {
    const totalText = await this.paginationTotal.textContent();
    const match = totalText.match(/共\s*(\d+)\s*条/);
    const total = match ? parseInt(match[1]) : 0;

    return {
      total,
      currentPage: await this.page.locator('.el-pagination__current').textContent(),
      pageSize: await this.paginationSizer.locator('.el-select input').inputValue()
    };
  }

  /**
   * 设置每页显示数量
   * @param {number} size - 每页显示数量
   */
  async setPageSize(size) {
    await this.paginationSizer.click();
    await this.page.locator(`.el-select-dropdown .el-option:has-text("${size}")`).click();
    await this.waitForLoading();
  }

  /**
   * 验证业务单据数据
   * @param {Object} expectedData - 期望的数据
   */
  async validateBusinessData(expectedData) {
    const validations = {};
    const tableData = await this.getTableData();

    if (tableData.length > 0) {
      const firstRow = tableData[0];
      
      // 根据业务需要验证特定字段
      if (expectedData.code && firstRow.length > 0) {
        validations.codeMatch = firstRow[0].includes(expectedData.code);
      }

      if (expectedData.name && firstRow.length > 1) {
        validations.nameMatch = firstRow[1].includes(expectedData.name);
      }
    }

    return validations;
  }

  /**
   * 检查业务权限
   */
  async checkBusinessPermissions() {
    return {
      canAdd: await this.addButton.isVisible(),
      canEdit: await this.editButton.isVisible(),
      canDelete: await this.deleteButton.isVisible(),
      canApprove: await this.approveButton.isVisible(),
      canPush: await this.pushButton.isVisible(),
      canFinish: await this.finishButton.isVisible(),
      canExport: await this.exportButton.isVisible(),
      canPrint: await this.printButton.isVisible()
    };
  }

  /**
   * 等待业务操作完成
   */
  async waitForBusinessOperation() {
    await this.waitForLoading();
    // 等待可能的成功消息
    try {
      await this.page.waitForSelector('.el-message--success', { timeout: 3000 });
    } catch {
      // 如果没有成功消息也继续执行
    }
  }
}

module.exports = { SOBasePage };