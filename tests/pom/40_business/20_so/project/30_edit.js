const { ProjectBasePage } = require('./00_base');

/**
 * SO项目管理编辑页面对象模型
 * 对应 /40_business/20_so/project (编辑页tab)
 * 基于源码: src/views/40_business/20_so/project/tabs/30_edit/index.vue
 */
class ProjectEditPage extends ProjectBasePage {
  constructor(page) {
    super(page);
    this.url = '/40_business/20_so/project';
  }

  // ===================
  // 编辑页面特有元素
  // ===================

  get editTabContainer() {
    return this.page.locator('.el-tab-pane[name="edit"]');
  }

  get projectDataForm() {
    return this.page.locator('el-form[ref="dataForm"]');
  }

  // 项目基本信息表单
  get basicInfoDescriptions() {
    return this.page.locator('.el-descriptions[title="项目基本信息"]');
  }

  get projectNameInput() {
    return this.basicInfoDescriptions.locator('input[placeholder="项目名称"]');
  }

  get supplierSearchInput() {
    return this.basicInfoDescriptions.locator('el-form-item[prop="supplier_name"] input');
  }

  get customerSearchInput() {
    return this.basicInfoDescriptions.locator('el-form-item[prop="purchaser_name"] input');
  }

  get deliveryTypeSelect() {
    return this.basicInfoDescriptions.locator('select-dict[init-placeholder="请选择运输方式"]');
  }

  get deliveryLocationInput() {
    return this.basicInfoDescriptions.locator('input[placeholder="交货地点"]');
  }

  get remarkTextarea() {
    return this.basicInfoDescriptions.locator('textarea[placeholder="备注"]');
  }

  // 商品明细区域
  get goodsDetailSection() {
    return this.page.locator('.goods-detail-section');
  }

  get goodsTable() {
    return this.page.locator('el-table[ref="goodsTable"]');
  }

  get addGoodsButton() {
    return this.page.locator('button:has-text("添加商品")');
  }

  get deleteGoodsButton() {
    return this.page.locator('button:has-text("删除商品")');
  }

  // 财务信息区域
  get financeInfoSection() {
    return this.page.locator('.finance-info-section');
  }

  get paymentMethodSelect() {
    return this.financeInfoSection.locator('select-dict[init-placeholder="请选择付款方式"]');
  }

  get paymentDaysInput() {
    return this.financeInfoSection.locator('input[placeholder*="账期"]');
  }

  get projectCycleInput() {
    return this.financeInfoSection.locator('input[placeholder*="项目周期"]');
  }

  get financeAmountInput() {
    return this.financeInfoSection.locator('input[placeholder*="融资额度"]');
  }

  get rateInput() {
    return this.financeInfoSection.locator('input[placeholder*="费率"]');
  }

  // 项目说明区域
  get projectRemarkSection() {
    return this.page.locator('.project-remark-section');
  }

  get projectRemarkEditor() {
    return this.projectRemarkSection.locator('.editor-container textarea');
  }

  // 附件区域
  get attachmentSection() {
    return this.page.locator('.attachment-section');
  }

  get fileUploadArea() {
    return this.attachmentSection.locator('.el-upload-dragger');
  }

  get uploadedFilesList() {
    return this.attachmentSection.locator('.el-upload-list');
  }

  // 操作按钮
  get updateButton() {
    return this.page.locator('button:has-text("更新保存")');
  }

  get submitApprovalButton() {
    return this.page.locator('button:has-text("提交审批并保存")');
  }

  get returnToListButton() {
    return this.page.locator('button:has-text("返回列表")');
  }

  get resetButton() {
    return this.page.locator('button:has-text("重置")');
  }

  // 商品选择弹窗
  get goodsSelectionDialog() {
    return this.page.locator('.goods-selection-dialog');
  }

  get goodsSearchInput() {
    return this.goodsSelectionDialog.locator('input[placeholder*="商品编号或名称"]');
  }

  get goodsListTable() {
    return this.goodsSelectionDialog.locator('el-table[ref="goodsSelectionTable"]');
  }

  get confirmGoodsSelectionButton() {
    return this.goodsSelectionDialog.locator('button:has-text("确定")');
  }

  // ===================
  // 编辑页面操作方法
  // ===================

  /**
   * 等待编辑页面加载完成
   */
  async waitForEditPageLoad() {
    await this.editTabContainer.waitFor();
    await this.projectDataForm.waitFor();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 填写项目基本信息
   * @param {Object} basicInfo - 基本信息数据
   */
  async fillBasicInfo(basicInfo) {
    if (basicInfo.projectName) {
      await this.projectNameInput.clear();
      await this.projectNameInput.fill(basicInfo.projectName);
    }

    if (basicInfo.supplierName) {
      await this.supplierSearchInput.click();
      await this.supplierSearchInput.fill(basicInfo.supplierName);
      // 等待下拉选项出现并选择
      await this.page.locator(`.el-select-dropdown .el-option:has-text("${basicInfo.supplierName}")`).first().click();
    }

    if (basicInfo.customerName) {
      await this.customerSearchInput.click();
      await this.customerSearchInput.fill(basicInfo.customerName);
      await this.page.locator(`.el-select-dropdown .el-option:has-text("${basicInfo.customerName}")`).first().click();
    }

    if (basicInfo.deliveryType) {
      await this.deliveryTypeSelect.click();
      await this.page.locator(`.el-select-dropdown .el-option:has-text("${basicInfo.deliveryType}")`).click();
    }

    if (basicInfo.deliveryLocation) {
      await this.deliveryLocationInput.clear();
      await this.deliveryLocationInput.fill(basicInfo.deliveryLocation);
    }

    if (basicInfo.remark) {
      await this.remarkTextarea.clear();
      await this.remarkTextarea.fill(basicInfo.remark);
    }
  }

  /**
   * 修改商品信息
   * @param {number} rowIndex - 商品行索引
   * @param {Object} goodsData - 商品数据
   */
  async updateGoods(rowIndex, goodsData) {
    const row = this.goodsTable.locator('tbody tr').nth(rowIndex);

    if (goodsData.qty) {
      await row.locator('input[placeholder*="数量"]').clear();
      await row.locator('input[placeholder*="数量"]').fill(goodsData.qty.toString());
    }

    if (goodsData.price) {
      await row.locator('input[placeholder*="单价"]').clear();
      await row.locator('input[placeholder*="单价"]').fill(goodsData.price.toString());
    }

    if (goodsData.taxRate) {
      await row.locator('select[placeholder*="税率"]').click();
      await this.page.locator(`.el-select-dropdown .el-option:has-text("${goodsData.taxRate}")`).click();
    }

    // 等待金额自动计算
    await this.page.waitForTimeout(500);
  }

  /**
   * 删除商品行
   * @param {number} rowIndex - 商品行索引
   */
  async deleteGoodsRow(rowIndex) {
    const row = this.goodsTable.locator('tbody tr').nth(rowIndex);
    const deleteButton = row.locator('button:has-text("删除")');
    
    await deleteButton.click();
    await this.confirmAction(); // 确认删除
  }

  /**
   * 添加新商品
   * @param {Object} goodsData - 商品数据
   */
  async addGoods(goodsData) {
    await this.addGoodsButton.click();
    await this.goodsSelectionDialog.waitFor();

    // 搜索商品
    if (goodsData.goodsName || goodsData.goodsCode) {
      const searchTerm = goodsData.goodsName || goodsData.goodsCode;
      await this.goodsSearchInput.fill(searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForLoading();
    }

    // 选择商品
    const goodsRow = this.goodsListTable.locator('tbody tr').first();
    await goodsRow.locator('input[type="checkbox"]').check();

    // 确认选择
    await this.confirmGoodsSelectionButton.click();
    await this.goodsSelectionDialog.waitFor({ state: 'hidden' });

    // 填写商品详细信息
    const lastRow = this.goodsTable.locator('tbody tr').last();
    
    if (goodsData.qty) {
      await lastRow.locator('input[placeholder*="数量"]').fill(goodsData.qty.toString());
    }

    if (goodsData.price) {
      await lastRow.locator('input[placeholder*="单价"]').fill(goodsData.price.toString());
    }
  }

  /**
   * 填写财务信息
   * @param {Object} financeInfo - 财务信息数据
   */
  async fillFinanceInfo(financeInfo) {
    if (financeInfo.paymentMethod) {
      await this.paymentMethodSelect.click();
      await this.page.locator(`.el-select-dropdown .el-option:has-text("${financeInfo.paymentMethod}")`).click();
    }

    if (financeInfo.paymentDays) {
      await this.paymentDaysInput.clear();
      await this.paymentDaysInput.fill(financeInfo.paymentDays.toString());
    }

    if (financeInfo.projectCycle) {
      await this.projectCycleInput.clear();
      await this.projectCycleInput.fill(financeInfo.projectCycle.toString());
    }

    if (financeInfo.financeAmount) {
      await this.financeAmountInput.clear();
      await this.financeAmountInput.fill(financeInfo.financeAmount.toString());
    }

    if (financeInfo.rate) {
      await this.rateInput.clear();
      await this.rateInput.fill(financeInfo.rate.toString());
    }
  }

  /**
   * 填写项目说明
   * @param {string} remark - 项目说明内容
   */
  async fillProjectRemark(remark) {
    await this.projectRemarkEditor.clear();
    await this.projectRemarkEditor.fill(remark);
  }

  /**
   * 上传附件
   * @param {string} filePath - 文件路径
   */
  async uploadAttachment(filePath) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.fileUploadArea.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  /**
   * 删除附件
   * @param {number} fileIndex - 文件索引
   */
  async deleteAttachment(fileIndex) {
    const fileItem = this.uploadedFilesList.locator('.el-upload-list__item').nth(fileIndex);
    const deleteButton = fileItem.locator('.el-upload-list__item-delete');
    
    await deleteButton.click();
    await this.confirmAction(); // 确认删除
  }

  /**
   * 更新保存项目
   */
  async updateProject() {
    await this.updateButton.click();
    await this.waitForSuccess(); // 等待成功消息
  }

  /**
   * 提交审批并保存
   */
  async submitApproval() {
    await this.submitApprovalButton.click();
    await this.waitForSuccess(); // 等待成功消息
  }

  /**
   * 重置表单
   */
  async resetForm() {
    await this.resetButton.click();
    await this.confirmAction(); // 确认重置
  }

  /**
   * 返回列表页
   */
  async returnToList() {
    await this.returnToListButton.click();
    await this.page.waitForTimeout(1000); // 等待Tab切换
  }

  /**
   * 获取当前项目数据
   */
  async getCurrentProjectData() {
    return {
      projectName: await this.projectNameInput.inputValue(),
      deliveryLocation: await this.deliveryLocationInput.inputValue(),
      remark: await this.remarkTextarea.inputValue(),
      goodsList: await this.getGoodsList(),
      financeInfo: await this.getCurrentFinanceInfo(),
      projectRemark: await this.projectRemarkEditor.inputValue()
    };
  }

  /**
   * 获取商品列表数据
   */
  async getGoodsList() {
    const rows = await this.goodsTable.locator('tbody tr').all();
    const goods = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      goods.push({
        goodsCode: cells[1] || '',
        goodsName: cells[2] || '',
        specification: cells[3] || '',
        qty: cells[4] || '',
        price: cells[5] || '',
        amount: cells[6] || '',
        taxRate: cells[7] || '',
        taxAmount: cells[8] || ''
      });
    }

    return goods;
  }

  /**
   * 获取当前财务信息
   */
  async getCurrentFinanceInfo() {
    return {
      paymentDays: await this.paymentDaysInput.inputValue(),
      projectCycle: await this.projectCycleInput.inputValue(),
      financeAmount: await this.financeAmountInput.inputValue(),
      rate: await this.rateInput.inputValue()
    };
  }

  /**
   * 验证数据修改的完整性
   * @param {Object} expectedData - 期望的数据
   */
  async validateDataModification(expectedData) {
    const currentData = await this.getCurrentProjectData();
    const validations = {};

    if (expectedData.projectName) {
      validations.projectNameMatch = currentData.projectName === expectedData.projectName;
    }

    if (expectedData.goodsCount) {
      validations.goodsCountMatch = currentData.goodsList.length === expectedData.goodsCount;
    }

    if (expectedData.financeAmount) {
      validations.financeAmountMatch = parseFloat(currentData.financeInfo.financeAmount) === expectedData.financeAmount;
    }

    return validations;
  }

  /**
   * 验证表单字段的可编辑性
   */
  async validateEditableFields() {
    return {
      projectNameEditable: await this.projectNameInput.isEditable(),
      deliveryLocationEditable: await this.deliveryLocationInput.isEditable(),
      remarkEditable: await this.remarkTextarea.isEditable(),
      goodsAddable: await this.addGoodsButton.isVisible(),
      financeAmountEditable: await this.financeAmountInput.isEditable()
    };
  }

  /**
   * 检查编辑权限
   */
  async checkEditPermissions() {
    return {
      canUpdate: await this.updateButton.isVisible(),
      canSubmitApproval: await this.submitApprovalButton.isVisible(),
      canReset: await this.resetButton.isVisible(),
      canAddGoods: await this.addGoodsButton.isVisible(),
      canUploadAttachment: await this.fileUploadArea.isVisible()
    };
  }
}

module.exports = { ProjectEditPage };