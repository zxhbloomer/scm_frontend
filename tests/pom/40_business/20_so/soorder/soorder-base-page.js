const { SOBasePage } = require('../so-base-page');

/**
 * SO订单基础页面对象模型
 * 包含SO订单模块通用的元素定位器和操作方法
 */
class SOOrderBasePage extends SOBasePage {
  constructor(page) {
    super(page);
    this.baseUrl = '/40_business/20_so/soorder';
  }

  // ===================
  // 标签页通用元素定位器
  // ===================

  // 主要标签页
  get mainTabPane() {
    return this.page.locator('.el-tab-pane[name="main"]');
  }

  get newTabPane() {
    return this.page.locator('.el-tab-pane[name="edit"]');
  }

  get viewTabPane() {
    return this.page.locator('.el-tab-pane[name="view"]');
  }

  get approveTabPane() {
    return this.page.locator('.el-tab-pane[name="approve"]');
  }

  get printTabPane() {
    return this.page.locator('.el-tab-pane[name="print"]');
  }

  // 业务关联标签页
  get outplanNewTabPane() {
    return this.page.locator('.el-tab-pane[name="outplan_new"]');
  }

  get settlementNewTabPane() {
    return this.page.locator('.el-tab-pane[name="settlement_new"]');
  }

  get cargoRightTransferNewTabPane() {
    return this.page.locator('.el-tab-pane[name="cargo_right_transfer_new"]');
  }

  // 标签页操作
  get tabsContainer() {
    return this.page.locator('.el-tabs');
  }

  get activeTab() {
    return this.page.locator('.el-tabs__item.is-active');
  }

  get closableTabButtons() {
    return this.page.locator('.el-tabs__item .el-icon-close');
  }

  // ===================
  // SO订单基本信息元素定位器
  // ===================

  // 订单基本信息
  get orderCodeInput() {
    return this.page.locator('input[placeholder*="订单编号"], input[placeholder*="订单号"]');
  }

  get orderTypeSelect() {
    return this.page.locator('.el-select[placeholder*="订单类型"]');
  }

  get orderDatePicker() {
    return this.page.locator('.el-date-picker[placeholder*="订单日期"]');
  }

  // 客户信息
  get customerCodeInput() {
    return this.page.locator('input[placeholder*="客户编码"], input[placeholder*="客户代码"]');
  }

  get customerNameInput() {
    return this.page.locator('input[placeholder*="客户名称"]');
  }

  get customerSelectDialog() {
    return this.page.locator('.customer-select-dialog');
  }

  // 销售信息
  get sellerCodeInput() {
    return this.page.locator('input[placeholder*="销售方编码"], input[placeholder*="卖方编码"]');
  }

  get sellerNameInput() {
    return this.page.locator('input[placeholder*="销售方名称"], input[placeholder*="卖方名称"]');
  }

  // 交货信息
  get deliveryDatePicker() {
    return this.page.locator('.el-date-picker[placeholder*="交货日期"], .el-date-picker[placeholder*="预计交货"]');
  }

  get deliveryAddressTextarea() {
    return this.page.locator('textarea[placeholder*="交货地址"], textarea[placeholder*="送货地址"]');
  }

  // 联系信息
  get contactPersonInput() {
    return this.page.locator('input[placeholder*="联系人"]');
  }

  get contactPhoneInput() {
    return this.page.locator('input[placeholder*="联系电话"], input[placeholder*="手机号"]');
  }

  // 金额信息
  get totalAmountInput() {
    return this.page.locator('input[placeholder*="总金额"], input[placeholder*="订单金额"]');
  }

  get currencySelect() {
    return this.page.locator('.el-select[placeholder*="币种"]');
  }

  // 状态信息
  get orderStatusSelect() {
    return this.page.locator('.el-select[placeholder*="订单状态"]');
  }

  get approvalStatusDisplay() {
    return this.page.locator('.approval-status, .status-badge');
  }

  // 备注信息
  get remarkTextarea() {
    return this.page.locator('textarea[placeholder*="备注"], textarea[placeholder*="说明"]');
  }

  // ===================
  // 订单明细表格元素定位器
  // ===================

  get orderDetailsTable() {
    return this.page.locator('.order-details-table .el-table, .detail-table .el-table');
  }

  get orderDetailsTableRows() {
    return this.orderDetailsTable.locator('.el-table__row');
  }

  get addDetailButton() {
    return this.page.locator('button:has-text("添加明细"), button:has-text("新增明细")');
  }

  get deleteDetailButton() {
    return this.page.locator('button:has-text("删除"), .delete-detail-btn');
  }

  // 明细字段
  get goodsCodeInput() {
    return this.page.locator('input[placeholder*="商品编码"], input[placeholder*="货物编码"]');
  }

  get goodsNameInput() {
    return this.page.locator('input[placeholder*="商品名称"], input[placeholder*="货物名称"]');
  }

  get specificationInput() {
    return this.page.locator('input[placeholder*="规格"], input[placeholder*="型号"]');
  }

  get unitSelect() {
    return this.page.locator('.el-select[placeholder*="单位"]');
  }

  get qtyInput() {
    return this.page.locator('input[placeholder*="数量"]');
  }

  get unitPriceInput() {
    return this.page.locator('input[placeholder*="单价"]');
  }

  get lineTotalDisplay() {
    return this.page.locator('.line-total, .amount-cell');
  }

  // ===================
  // 操作按钮元素定位器
  // ===================

  // 主要操作按钮
  get newButton() {
    return this.page.locator('button:has-text("新增"), button:has-text("新建")');
  }

  get editButton() {
    return this.page.locator('button:has-text("修改"), button:has-text("编辑")');
  }

  get viewButton() {
    return this.page.locator('button:has-text("查看"), button:has-text("详情")');
  }

  get deleteButton() {
    return this.page.locator('button:has-text("删除")');
  }

  get submitButton() {
    return this.page.locator('button:has-text("提交"), button:has-text("保存")');
  }

  get approveButton() {
    return this.page.locator('button:has-text("审批"), button:has-text("通过")');
  }

  get rejectButton() {
    return this.page.locator('button:has-text("驳回"), button:has-text("拒绝")');
  }

  get printButton() {
    return this.page.locator('button:has-text("打印")');
  }

  get exportButton() {
    return this.page.locator('button:has-text("导出"), button:has-text("下载")');
  }

  // 页面导航按钮
  get returnButton() {
    return this.page.locator('button:has-text("返回"), button:has-text("关闭")');
  }

  get saveButton() {
    return this.page.locator('button:has-text("保存")');
  }

  get cancelButton() {
    return this.page.locator('button:has-text("取消")');
  }

  // 业务关联操作按钮
  get outplanButton() {
    return this.page.locator('button:has-text("出库计划")');
  }

  get settlementButton() {
    return this.page.locator('button:has-text("结算单")');
  }

  get cargoRightTransferButton() {
    return this.page.locator('button:has-text("货权转移")');
  }

  // ===================
  // 查询和过滤元素定位器
  // ===================

  get searchForm() {
    return this.page.locator('.search-form, .query-form');
  }

  get searchButton() {
    return this.page.locator('button:has-text("查询"), button:has-text("搜索")');
  }

  get resetButton() {
    return this.page.locator('button:has-text("重置"), button:has-text("清空")');
  }

  get advancedSearchButton() {
    return this.page.locator('button:has-text("高级查询"), button:has-text("更多条件")');
  }

  // 查询条件字段
  get searchOrderCodeInput() {
    return this.searchForm.locator('input[placeholder*="订单编号"]');
  }

  get searchCustomerNameInput() {
    return this.searchForm.locator('input[placeholder*="客户名称"]');
  }

  get searchOrderDateRange() {
    return this.searchForm.locator('.el-date-picker--daterange');
  }

  get searchStatusSelect() {
    return this.searchForm.locator('.el-select[placeholder*="状态"]');
  }

  // ===================
  // 通用业务方法
  // ===================

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('.el-tabs', { timeout: 10000 });
    await this.page.waitForTimeout(1000); // 等待Vue组件渲染完成
  }

  /**
   * 切换到指定标签页
   * @param {string} tabName - 标签页名称
   */
  async switchToTab(tabName) {
    const tabButton = this.page.locator(`.el-tabs__item[aria-controls="pane-${tabName}"]`);
    await tabButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 关闭当前标签页
   */
  async closeCurrentTab() {
    const closeButton = this.page.locator('.el-tabs__item.is-active .el-icon-close');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * 填写订单基本信息
   * @param {Object} orderData - 订单数据
   */
  async fillBasicOrderInfo(orderData) {
    if (orderData.orderCode) {
      await this.orderCodeInput.fill(orderData.orderCode);
    }
    
    if (orderData.orderType) {
      await this.selectDropdownOption(this.orderTypeSelect, orderData.orderType);
    }
    
    if (orderData.orderDate) {
      await this.orderDatePicker.fill(orderData.orderDate);
    }
    
    if (orderData.customerName) {
      await this.customerNameInput.fill(orderData.customerName);
    }
    
    if (orderData.customerCode) {
      await this.customerCodeInput.fill(orderData.customerCode);
    }
    
    if (orderData.deliveryDate) {
      await this.deliveryDatePicker.fill(orderData.deliveryDate);
    }
    
    if (orderData.deliveryAddress) {
      await this.deliveryAddressTextarea.fill(orderData.deliveryAddress);
    }
    
    if (orderData.contactPerson) {
      await this.contactPersonInput.fill(orderData.contactPerson);
    }
    
    if (orderData.contactPhone) {
      await this.contactPhoneInput.fill(orderData.contactPhone);
    }
    
    if (orderData.totalAmount) {
      await this.totalAmountInput.fill(orderData.totalAmount.toString());
    }
    
    if (orderData.remark) {
      await this.remarkTextarea.fill(orderData.remark);
    }
  }

  /**
   * 验证订单基本信息显示
   * @param {Object} expectedData - 期望的订单数据
   */
  async verifyBasicOrderInfo(expectedData) {
    if (expectedData.orderCode) {
      await this.expect(this.orderCodeInput).toHaveValue(expectedData.orderCode);
    }
    
    if (expectedData.customerName) {
      await this.expect(this.customerNameInput).toHaveValue(expectedData.customerName);
    }
    
    if (expectedData.totalAmount) {
      await this.expect(this.totalAmountInput).toHaveValue(expectedData.totalAmount.toString());
    }
  }

  /**
   * 添加订单明细
   * @param {Object} detailData - 明细数据
   */
  async addOrderDetail(detailData) {
    await this.addDetailButton.click();
    await this.page.waitForTimeout(500);
    
    // 在最后一行填写数据
    const lastRow = this.orderDetailsTableRows.last();
    
    if (detailData.goodsCode) {
      await lastRow.locator('input[placeholder*="商品编码"]').fill(detailData.goodsCode);
    }
    
    if (detailData.goodsName) {
      await lastRow.locator('input[placeholder*="商品名称"]').fill(detailData.goodsName);
    }
    
    if (detailData.specification) {
      await lastRow.locator('input[placeholder*="规格"]').fill(detailData.specification);
    }
    
    if (detailData.qty) {
      await lastRow.locator('input[placeholder*="数量"]').fill(detailData.qty.toString());
    }
    
    if (detailData.unitPrice) {
      await lastRow.locator('input[placeholder*="单价"]').fill(detailData.unitPrice.toString());
    }
  }

  /**
   * 验证订单明细数据
   * @param {Array} expectedDetails - 期望的明细数据数组
   */
  async verifyOrderDetails(expectedDetails) {
    const actualRowCount = await this.orderDetailsTableRows.count();
    this.expect(actualRowCount).toBe(expectedDetails.length);
    
    for (let i = 0; i < expectedDetails.length; i++) {
      const row = this.orderDetailsTableRows.nth(i);
      const expectedDetail = expectedDetails[i];
      
      if (expectedDetail.goodsName) {
        await this.expect(row.locator('input[placeholder*="商品名称"]')).toHaveValue(expectedDetail.goodsName);
      }
      
      if (expectedDetail.qty) {
        await this.expect(row.locator('input[placeholder*="数量"]')).toHaveValue(expectedDetail.qty.toString());
      }
    }
  }

  /**
   * 执行搜索操作
   * @param {Object} searchCriteria - 搜索条件
   */
  async performSearch(searchCriteria) {
    if (searchCriteria.orderCode) {
      await this.searchOrderCodeInput.fill(searchCriteria.orderCode);
    }
    
    if (searchCriteria.customerName) {
      await this.searchCustomerNameInput.fill(searchCriteria.customerName);
    }
    
    if (searchCriteria.status) {
      await this.selectDropdownOption(this.searchStatusSelect, searchCriteria.status);
    }
    
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 验证搜索结果
   * @param {Array} expectedResults - 期望的搜索结果
   */
  async verifySearchResults(expectedResults) {
    await this.page.waitForSelector('.el-table__row', { timeout: 5000 });
    
    const actualRows = await this.orderDetailsTableRows.count();
    this.expect(actualRows).toBeGreaterThanOrEqual(1);
    
    // 验证第一行数据
    if (expectedResults.length > 0) {
      const firstRow = this.orderDetailsTableRows.first();
      const expectedFirst = expectedResults[0];
      
      if (expectedFirst.orderCode) {
        await this.expect(firstRow.locator('td').first()).toContainText(expectedFirst.orderCode);
      }
    }
  }

  /**
   * 等待并处理确认对话框
   * @param {boolean} confirm - 是否确认（true为确认，false为取消）
   */
  async handleConfirmDialog(confirm = true) {
    await this.page.waitForSelector('.el-message-box', { timeout: 5000 });
    
    if (confirm) {
      await this.page.locator('.el-message-box .el-button--primary').click();
    } else {
      await this.page.locator('.el-message-box .el-button--default').click();
    }
    
    await this.page.waitForTimeout(1000);
  }

  /**
   * 验证成功消息提示
   * @param {string} expectedMessage - 期望的消息内容
   */
  async verifySuccessMessage(expectedMessage) {
    const messageBox = this.page.locator('.el-message--success');
    await this.expect(messageBox).toBeVisible({ timeout: 5000 });
    
    if (expectedMessage) {
      await this.expect(messageBox).toContainText(expectedMessage);
    }
    
    // 等待消息消失
    await this.expect(messageBox).toBeHidden({ timeout: 5000 });
  }

  /**
   * 验证错误消息提示
   * @param {string} expectedMessage - 期望的错误消息内容
   */
  async verifyErrorMessage(expectedMessage) {
    const messageBox = this.page.locator('.el-message--error');
    await this.expect(messageBox).toBeVisible({ timeout: 5000 });
    
    if (expectedMessage) {
      await this.expect(messageBox).toContainText(expectedMessage);
    }
  }

  /**
   * 验证字段验证错误
   * @param {string} fieldName - 字段名称
   * @param {string} expectedError - 期望的错误消息
   */
  async verifyFieldValidationError(fieldName, expectedError) {
    const errorElement = this.page.locator(`.el-form-item.is-error .el-form-item__error`);
    await this.expect(errorElement).toBeVisible();
    
    if (expectedError) {
      await this.expect(errorElement).toContainText(expectedError);
    }
  }
}

module.exports = { SOOrderBasePage };