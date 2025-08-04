const { ProjectBasePage } = require('./00_base');

/**
 * SO项目管理新建页面对象模型
 * 对应 /40_business/20_so/project (新建页tab)
 * 基于源码: src/views/40_business/20_so/project/tabs/20_new/index.vue
 */
class ProjectCreatePage extends ProjectBasePage {
  constructor(page) {
    super(page);
    this.url = '/40_business/20_so/project';
  }

  // ===================
  // 页面容器元素
  // ===================

  get appContainer() {
    return this.page.locator('.app-container');
  }

  get editContainer() {
    return this.page.locator('.edit-container');
  }

  get dataSubmitForm() {
    return this.page.locator('el-form[ref="dataSubmitForm"]');
  }

  // ===================
  // 基本信息区域元素
  // ===================

  get basicInfoAlert() {
    return this.page.locator('el-alert[title="基本信息"]');
  }

  get basicInfoDescriptions() {
    return this.basicInfoAlert.locator('+ el-descriptions');
  }

  // 项目编号（只读）
  get projectCodeDisplay() {
    return this.basicInfoDescriptions.locator('el-descriptions-item:has-text("项目编号")');
  }

  // 项目名称（必填）
  get projectNameInput() {
    return this.basicInfoDescriptions.locator('el-form-item[prop="name"] input');
  }

  // 类型（只读显示"销售业务"）
  get projectTypeDisplay() {
    return this.basicInfoDescriptions.locator('el-descriptions-item:has-text("类型")');
  }

  // 上游供应商（必填）
  get supplierSearchInput() {
    return this.basicInfoDescriptions.locator('el-form-item[prop="supplier_name"] input-search input');
  }

  get supplierSearchButton() {
    return this.basicInfoDescriptions.locator('el-form-item[prop="supplier_name"] input-search button');
  }

  // 下游客户（必填）
  get customerSearchInput() {
    return this.basicInfoDescriptions.locator('el-form-item[prop="purchaser_id"] input-search input');
  }

  get customerSearchButton() {
    return this.basicInfoDescriptions.locator('el-form-item[prop="purchaser_id"] input-search button');
  }

  // 融资主体（只读）
  get financierDisplay() {
    return this.basicInfoDescriptions.locator('el-descriptions-item:has-text("融资主体")');
  }

  // 运输方式
  get deliveryTypeRadio() {
    return this.basicInfoDescriptions.locator('el-form-item[prop="delivery_type"] radio-dict');
  }

  // 交货地点
  get deliveryLocationInput() {
    return this.basicInfoDescriptions.locator('el-descriptions-item:has-text("交货地点") input');
  }

  // 备注
  get remarkInput() {
    return this.basicInfoDescriptions.locator('el-descriptions-item:has-text("备注") input');
  }

  // ===================
  // 商品明细区域元素
  // ===================

  get goodsDetailAlert() {
    return this.page.locator('el-alert[title="商品明细"]');
  }

  get goodsButtonGroup() {
    return this.goodsDetailAlert.locator('+ el-button-group');
  }

  get addGoodsButton() {
    return this.goodsButtonGroup.locator('button:has-text("新增")');
  }

  get deleteGoodsButton() {
    return this.goodsButtonGroup.locator('button:has-text("删除")');
  }

  get goodsTable() {
    return this.page.locator('el-table[ref="multipleTable"]');
  }

  get goodsTableRows() {
    return this.goodsTable.locator('tbody tr');
  }

  get goodsTableHeaders() {
    return this.goodsTable.locator('thead th');
  }

  // ===================
  // 财务信息区域元素
  // ===================

  get financeInfoAlert() {
    return this.page.locator('el-alert[title="财务信息"]');
  }

  get financeInfoDescriptions() {
    return this.financeInfoAlert.locator('+ el-descriptions');
  }

  // 付款方式（只读）
  get paymentMethodDisplay() {
    return this.financeInfoDescriptions.locator('el-descriptions-item:has-text("付款方式")');
  }

  // 是否有账期/天数
  get paymentDaysInput() {
    return this.financeInfoDescriptions.locator('el-descriptions-item:has-text("是否有账期") numeric input');
  }

  // 项目周期
  get projectCycleInput() {
    return this.financeInfoDescriptions.locator('el-descriptions-item:has-text("项目周期") numeric input');
  }

  // 融资额度
  get financeAmountInput() {
    return this.financeInfoDescriptions.locator('el-descriptions-item:has-text("融资额度") numeric input');
  }

  // 费率
  get rateInput() {
    return this.financeInfoDescriptions.locator('el-descriptions-item:has-text("费率") numeric input');
  }

  // ===================
  // 项目说明区域元素
  // ===================

  get projectDescAlert() {
    return this.page.locator('el-alert[title="项目说明"]');
  }

  get projectDescDescriptions() {
    return this.projectDescAlert.locator('+ el-descriptions');
  }

  get projectRemarkTextarea() {
    return this.projectDescDescriptions.locator('el-descriptions-item:has-text("项目说明") textarea');
  }

  // ===================
  // 项目附件区域元素
  // ===================

  get attachmentAlert() {
    return this.page.locator('el-alert[title="项目附件材料"]');
  }

  get attachmentDescriptions() {
    return this.attachmentAlert.locator('+ el-descriptions');
  }

  get fileUploadComponent() {
    return this.attachmentDescriptions.locator('Simple-upload-mutil-file');
  }

  get filePreviewCards() {
    return this.attachmentDescriptions.locator('previewCard');
  }

  // ===================
  // 底部操作按钮元素
  // ===================

  get dialogFooter() {
    return this.page.locator('.dialog-footer');
  }

  get submitApprovalButton() {
    return this.dialogFooter.locator('button:has-text("提交审批并保存")');
  }

  get returnButton() {
    return this.dialogFooter.locator('button:has-text("返回")');
  }

  // ===================
  // 弹窗元素
  // ===================

  get supplierDialog() {
    return this.page.locator('supplier-dialog');
  }

  get customerDialog() {
    return this.page.locator('customer-dialog');
  }

  get goodsDialog() {
    return this.page.locator('goods-dialog');
  }

  // ===================
  // 页面操作方法
  // ===================

  /**
   * 等待新建页面加载完成
   */
  async waitForCreatePageLoad() {
    await this.appContainer.waitFor();
    await this.dataSubmitForm.waitFor();
    await this.basicInfoAlert.waitFor();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 填写项目基本信息
   * @param {Object} basicInfo - 基本信息数据
   */
  async fillBasicInfo(basicInfo) {
    // 项目名称（必填）
    if (basicInfo.projectName) {
      await this.projectNameInput.fill(basicInfo.projectName);
    }

    // 上游供应商（必填）
    if (basicInfo.supplierName) {
      await this.supplierSearchInput.fill(basicInfo.supplierName);
      await this.supplierSearchButton.click();
      await this.supplierDialog.waitFor();
      // 这里需要处理供应商选择弹窗逻辑
      await this.selectSupplierFromDialog(basicInfo.supplierName);
    }

    // 下游客户（必填）
    if (basicInfo.customerName) {
      await this.customerSearchInput.fill(basicInfo.customerName);
      await this.customerSearchButton.click();
      await this.customerDialog.waitFor();
      // 这里需要处理客户选择弹窗逻辑
      await this.selectCustomerFromDialog(basicInfo.customerName);
    }

    // 运输方式
    if (basicInfo.deliveryType) {
      await this.selectDeliveryType(basicInfo.deliveryType);
    }

    // 交货地点
    if (basicInfo.deliveryLocation) {
      await this.deliveryLocationInput.fill(basicInfo.deliveryLocation);
    }

    // 备注
    if (basicInfo.remark) {
      await this.remarkInput.fill(basicInfo.remark);
    }
  }

  /**
   * 选择运输方式
   * @param {string} deliveryType - 运输方式
   */
  async selectDeliveryType(deliveryType) {
    const radioOption = this.deliveryTypeRadio.locator(`label:has-text("${deliveryType}")`);
    await radioOption.click();
  }

  /**
   * 从供应商弹窗中选择供应商
   * @param {string} supplierName - 供应商名称
   */
  async selectSupplierFromDialog(supplierName) {
    // 在供应商弹窗中搜索并选择
    const searchInput = this.supplierDialog.locator('input[placeholder*="搜索"]');
    await searchInput.fill(supplierName);
    
    const searchBtn = this.supplierDialog.locator('button:has-text("搜索")');
    await searchBtn.click();
    
    // 选择第一个匹配的供应商
    const firstRow = this.supplierDialog.locator('.el-table tbody tr').first();
    await firstRow.click();
    
    // 确认选择
    const confirmBtn = this.supplierDialog.locator('button:has-text("确定")');
    await confirmBtn.click();
    
    await this.supplierDialog.waitFor({ state: 'hidden' });
  }

  /**
   * 从客户弹窗中选择客户
   * @param {string} customerName - 客户名称
   */
  async selectCustomerFromDialog(customerName) {
    // 在客户弹窗中搜索并选择
    const searchInput = this.customerDialog.locator('input[placeholder*="搜索"]');
    await searchInput.fill(customerName);
    
    const searchBtn = this.customerDialog.locator('button:has-text("搜索")');
    await searchBtn.click();
    
    // 选择第一个匹配的客户
    const firstRow = this.customerDialog.locator('.el-table tbody tr').first();
    await firstRow.click();
    
    // 确认选择
    const confirmBtn = this.customerDialog.locator('button:has-text("确定")');
    await confirmBtn.click();
    
    await this.customerDialog.waitFor({ state: 'hidden' });
  }

  /**
   * 添加商品明细
   * @param {Object} goodsInfo - 商品信息
   */
  async addGoods(goodsInfo) {
    await this.addGoodsButton.click();
    await this.goodsDialog.waitFor();

    // 在商品弹窗中选择商品
    await this.selectGoodsFromDialog(goodsInfo);
  }

  /**
   * 从商品弹窗中选择商品
   * @param {Object} goodsInfo - 商品信息
   */
  async selectGoodsFromDialog(goodsInfo) {
    // 搜索商品
    if (goodsInfo.goodsName || goodsInfo.goodsCode) {
      const searchInput = this.goodsDialog.locator('input[placeholder*="商品"]');
      await searchInput.fill(goodsInfo.goodsName || goodsInfo.goodsCode);
      
      const searchBtn = this.goodsDialog.locator('button:has-text("搜索")');
      await searchBtn.click();
    }

    // 选择商品
    const firstRow = this.goodsDialog.locator('.el-table tbody tr').first();
    await firstRow.click();

    // 填写数量和单价
    if (goodsInfo.qty) {
      const qtyInput = this.goodsDialog.locator('input[placeholder*="数量"]');
      await qtyInput.fill(goodsInfo.qty.toString());
    }

    if (goodsInfo.price) {
      const priceInput = this.goodsDialog.locator('input[placeholder*="单价"]');
      await priceInput.fill(goodsInfo.price.toString());
    }

    // 确认选择
    const confirmBtn = this.goodsDialog.locator('button:has-text("确定")');
    await confirmBtn.click();
    
    await this.goodsDialog.waitFor({ state: 'hidden' });
  }

  /**
   * 删除选中的商品明细
   */
  async deleteSelectedGoods() {
    await this.deleteGoodsButton.click();
    await this.confirmAction(); // 确认删除
  }

  /**
   * 获取商品明细列表
   */
  async getGoodsList() {
    const rows = await this.goodsTableRows.all();
    const goods = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      goods.push({
        goodsCode: cells[1] || '',       // 商品编号
        goodsName: cells[2] || '',       // 商品名称
        specification: cells[3] || '',   // 规格
        qty: cells[4] || '',             // 合同数量
        price: cells[5] || '',           // 单价（含税）
        amount: cells[6] || '',          // 金额
        taxRate: cells[7] || '',         // 税率（%）
        taxAmount: cells[8] || '',       // 税额
        origin: cells[9] || ''           // 产地
      });
    }

    return goods;
  }

  /**
   * 选择商品明细行
   * @param {number} rowIndex - 行索引
   */
  async selectGoodsRow(rowIndex) {
    const row = this.goodsTableRows.nth(rowIndex);
    await row.click();
  }

  /**
   * 填写财务信息
   * @param {Object} financeInfo - 财务信息
   */
  async fillFinanceInfo(financeInfo) {
    // 账期天数
    if (financeInfo.paymentDays) {
      await this.paymentDaysInput.fill(financeInfo.paymentDays.toString());
    }

    // 项目周期
    if (financeInfo.projectCycle) {
      await this.projectCycleInput.fill(financeInfo.projectCycle.toString());
    }

    // 融资额度
    if (financeInfo.financeAmount) {
      await this.financeAmountInput.fill(financeInfo.financeAmount.toString());
    }

    // 费率
    if (financeInfo.rate) {
      await this.rateInput.fill(financeInfo.rate.toString());
    }
  }

  /**
   * 填写项目说明
   * @param {string} projectRemark - 项目说明
   */
  async fillProjectRemark(projectRemark) {
    await this.projectRemarkTextarea.fill(projectRemark);
  }

  /**
   * 上传附件
   * @param {string[]} filePaths - 文件路径数组
   */
  async uploadAttachments(filePaths) {
    for (const filePath of filePaths) {
      // 触发文件选择
      const fileInput = this.fileUploadComponent.locator('input[type="file"]');
      await fileInput.setInputFiles(filePath);
      
      // 等待上传完成
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * 删除附件
   * @param {number} fileIndex - 文件索引
   */
  async removeAttachment(fileIndex) {
    const fileCard = this.filePreviewCards.nth(fileIndex);
    const removeBtn = fileCard.locator('button[title="删除"], .remove-btn');
    await removeBtn.click();
    await this.confirmAction(); // 确认删除
  }

  /**
   * 获取已上传的附件列表
   */
  async getAttachmentList() {
    const cards = await this.filePreviewCards.all();
    const attachments = [];

    for (const card of cards) {
      const fileName = await card.locator('.file-name').textContent();
      const uploadTime = await card.locator('.upload-time').textContent();
      attachments.push({
        fileName: fileName || '',
        uploadTime: uploadTime || ''
      });
    }

    return attachments;
  }

  /**
   * 提交审批并保存
   */
  async submitApproval() {
    await this.submitApprovalButton.click();
    await this.waitForLoading();
    
    // 等待可能的确认弹窗
    try {
      await this.page.waitForSelector('.el-message-box', { timeout: 3000 });
      await this.confirmAction();
    } catch (error) {
      // 没有确认弹窗，继续执行
    }
    
    await this.waitForLoading();
  }

  /**
   * 返回列表页
   */
  async returnToList() {
    await this.returnButton.click();
    await this.page.waitForTimeout(1000); // 等待Tab切换
  }

  /**
   * 验证表单必填字段
   */
  async validateRequiredFields() {
    const validations = {};

    // 项目名称
    validations.projectNameRequired = await this.projectNameInput.locator('+ .el-form-item__error').isVisible();

    // 供应商
    validations.supplierRequired = await this.supplierSearchInput.locator('+ .el-form-item__error').isVisible();

    // 客户
    validations.customerRequired = await this.customerSearchInput.locator('+ .el-form-item__error').isVisible();

    return validations;
  }

  /**
   * 填写完整的项目信息
   * @param {Object} projectData - 完整的项目数据
   */
  async fillCompleteProjectData(projectData) {
    // 填写基本信息
    if (projectData.basicInfo) {
      await this.fillBasicInfo(projectData.basicInfo);
    }

    // 添加商品明细
    if (projectData.goodsList && projectData.goodsList.length > 0) {
      for (const goods of projectData.goodsList) {
        await this.addGoods(goods);
      }
    }

    // 填写财务信息
    if (projectData.financeInfo) {
      await this.fillFinanceInfo(projectData.financeInfo);
    }

    // 填写项目说明
    if (projectData.projectRemark) {
      await this.fillProjectRemark(projectData.projectRemark);
    }

    // 上传附件
    if (projectData.attachments && projectData.attachments.length > 0) {
      await this.uploadAttachments(projectData.attachments);
    }
  }

  /**
   * 验证数据填写完整性
   * @param {Object} expectedData - 期望的数据
   */
  async validateDataCompleteness(expectedData) {
    const validations = {};

    // 验证基本信息
    if (expectedData.projectName) {
      const nameValue = await this.projectNameInput.inputValue();
      validations.projectNameMatch = nameValue === expectedData.projectName;
    }

    // 验证商品明细
    if (expectedData.goodsCount) {
      const goodsList = await this.getGoodsList();
      validations.goodsCountMatch = goodsList.length === expectedData.goodsCount;
    }

    // 验证财务信息
    if (expectedData.financeAmount) {
      const amountValue = await this.financeAmountInput.inputValue();
      validations.financeAmountMatch = parseFloat(amountValue) === expectedData.financeAmount;
    }

    // 验证附件
    if (expectedData.attachmentCount) {
      const attachments = await this.getAttachmentList();
      validations.attachmentCountMatch = attachments.length === expectedData.attachmentCount;
    }

    return validations;
  }
}

module.exports = { ProjectCreatePage };