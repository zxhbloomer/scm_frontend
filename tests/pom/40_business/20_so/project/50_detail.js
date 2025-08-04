const { ProjectBasePage } = require('./00_base');

/**
 * SO项目管理详情页面对象模型
 * 对应 /40_business/20_so/project (查看页tab)
 * 基于源码: src/views/40_business/20_so/project/tabs/40_view/index.vue
 */
class ProjectDetailPage extends ProjectBasePage {
  constructor(page) {
    super(page);
    this.url = '/40_business/20_so/project';
  }

  // ===================
  // 详情页面元素
  // ===================

  get detailTabContainer() {
    return this.page.locator('.el-tab-pane[name="view"]');
  }

  get projectDetailContainer() {
    return this.page.locator('.project-detail-container');
  }

  // 项目基本信息展示区域
  get basicInfoSection() {
    return this.page.locator('.basic-info-section');
  }

  get projectCodeDisplay() {
    return this.basicInfoSection.locator('.project-code-display');
  }

  get projectNameDisplay() {
    return this.basicInfoSection.locator('.project-name-display');
  }

  get projectTypeDisplay() {
    return this.basicInfoSection.locator('.project-type-display');
  }

  get supplierDisplay() {
    return this.basicInfoSection.locator('.supplier-display');
  }

  get customerDisplay() {
    return this.basicInfoSection.locator('.customer-display');
  }

  get financierDisplay() {
    return this.basicInfoSection.locator('.financier-display');
  }

  get deliveryTypeDisplay() {
    return this.basicInfoSection.locator('.delivery-type-display');
  }

  get deliveryLocationDisplay() {
    return this.basicInfoSection.locator('.delivery-location-display');
  }

  get remarkDisplay() {
    return this.basicInfoSection.locator('.remark-display');
  }

  // 项目状态信息
  get statusInfoSection() {
    return this.page.locator('.status-info-section');
  }

  get projectStatusDisplay() {
    return this.statusInfoSection.locator('.project-status-display');
  }

  get approvalStatusDisplay() {
    return this.statusInfoSection.locator('.approval-status-display');
  }

  get nextApproverDisplay() {
    return this.statusInfoSection.locator('.next-approver-display');
  }

  get createTimeDisplay() {
    return this.statusInfoSection.locator('.create-time-display');
  }

  get createUserDisplay() {
    return this.statusInfoSection.locator('.create-user-display');
  }

  get updateTimeDisplay() {
    return this.statusInfoSection.locator('.update-time-display');
  }

  get updateUserDisplay() {
    return this.statusInfoSection.locator('.update-user-display');
  }

  // 商品明细展示表格
  get goodsDetailSection() {
    return this.page.locator('.goods-detail-section');
  }

  get goodsDisplayTable() {
    return this.goodsDetailSection.locator('el-table[ref="goodsDisplayTable"]');
  }

  get goodsTableRows() {
    return this.goodsDisplayTable.locator('tbody tr');
  }

  get goodsTotalAmountDisplay() {
    return this.goodsDetailSection.locator('.goods-total-amount');
  }

  get goodsTotalTaxDisplay() {
    return this.goodsDetailSection.locator('.goods-total-tax');
  }

  // 财务信息展示区域
  get financeInfoSection() {
    return this.page.locator('.finance-info-section');
  }

  get paymentMethodDisplay() {
    return this.financeInfoSection.locator('.payment-method-display');
  }

  get paymentDaysDisplay() {
    return this.financeInfoSection.locator('.payment-days-display');
  }

  get projectCycleDisplay() {
    return this.financeInfoSection.locator('.project-cycle-display');
  }

  get financeAmountDisplay() {
    return this.financeInfoSection.locator('.finance-amount-display');
  }

  get rateDisplay() {
    return this.financeInfoSection.locator('.rate-display');
  }

  get interestAmountDisplay() {
    return this.financeInfoSection.locator('.interest-amount-display');
  }

  // 项目说明展示区域
  get projectRemarkSection() {
    return this.page.locator('.project-remark-section');
  }

  get projectRemarkDisplay() {
    return this.projectRemarkSection.locator('.project-remark-content');
  }

  // 附件展示区域
  get attachmentSection() {
    return this.page.locator('.attachment-section');
  }

  get attachmentList() {
    return this.attachmentSection.locator('.attachment-list');
  }

  get attachmentItems() {
    return this.attachmentList.locator('.attachment-item');
  }

  // 审批历史区域
  get approvalHistorySection() {
    return this.page.locator('.approval-history-section');
  }

  get approvalHistoryTable() {
    return this.approvalHistorySection.locator('el-table[ref="approvalHistoryTable"]');
  }

  get approvalHistoryRows() {
    return this.approvalHistoryTable.locator('tbody tr');
  }

  // 操作按钮区域
  get actionButtonsSection() {
    return this.page.locator('.action-buttons-section');
  }

  get editButton() {
    return this.actionButtonsSection.locator('button:has-text("编辑")');
  }

  get approveButton() {
    return this.actionButtonsSection.locator('button:has-text("审批")');
  }

  get exportButton() {
    return this.actionButtonsSection.locator('button:has-text("导出")');
  }

  get printButton() {
    return this.actionButtonsSection.locator('button:has-text("打印")');
  }

  get returnToListButton() {
    return this.actionButtonsSection.locator('button:has-text("返回列表")');
  }

  // BPM流程图区域
  get bpmProcessSection() {
    return this.page.locator('.bpm-process-section');
  }

  get bpmDiagram() {
    return this.bpmProcessSection.locator('.bpmn-diagram');
  }

  get processSteps() {
    return this.bpmProcessSection.locator('.process-step');
  }

  // ===================
  // 详情页面操作方法
  // ===================

  /**
   * 等待详情页面加载完成
   */
  async waitForDetailPageLoad() {
    await this.detailTabContainer.waitFor();
    await this.projectDetailContainer.waitFor();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 获取项目基本信息
   */
  async getProjectBasicInfo() {
    return {
      projectCode: await this.projectCodeDisplay.textContent(),
      projectName: await this.projectNameDisplay.textContent(),
      projectType: await this.projectTypeDisplay.textContent(),
      supplier: await this.supplierDisplay.textContent(),
      customer: await this.customerDisplay.textContent(),
      financier: await this.financierDisplay.textContent(),
      deliveryType: await this.deliveryTypeDisplay.textContent(),
      deliveryLocation: await this.deliveryLocationDisplay.textContent(),
      remark: await this.remarkDisplay.textContent()
    };
  }

  /**
   * 获取项目状态信息
   */
  async getProjectStatusInfo() {
    return {
      projectStatus: await this.projectStatusDisplay.textContent(),
      approvalStatus: await this.approvalStatusDisplay.textContent(),
      nextApprover: await this.nextApproverDisplay.textContent(),
      createTime: await this.createTimeDisplay.textContent(),
      createUser: await this.createUserDisplay.textContent(),
      updateTime: await this.updateTimeDisplay.textContent(),
      updateUser: await this.updateUserDisplay.textContent()
    };
  }

  /**
   * 获取商品明细列表
   */
  async getGoodsDetailList() {
    const rows = await this.goodsTableRows.all();
    const goods = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      goods.push({
        sequence: cells[0] || '',
        goodsCode: cells[1] || '',
        goodsName: cells[2] || '',
        specification: cells[3] || '',
        origin: cells[4] || '',
        qty: cells[5] || '',
        price: cells[6] || '',
        amount: cells[7] || '',
        taxRate: cells[8] || '',
        taxAmount: cells[9] || '',
        totalAmount: cells[10] || ''
      });
    }

    return goods;
  }

  /**
   * 获取商品汇总信息
   */
  async getGoodsSummary() {
    return {
      totalAmount: await this.goodsTotalAmountDisplay.textContent(),
      totalTax: await this.goodsTotalTaxDisplay.textContent()
    };
  }

  /**
   * 获取财务信息
   */
  async getFinanceInfo() {
    return {
      paymentMethod: await this.paymentMethodDisplay.textContent(),
      paymentDays: await this.paymentDaysDisplay.textContent(),
      projectCycle: await this.projectCycleDisplay.textContent(),
      financeAmount: await this.financeAmountDisplay.textContent(),
      rate: await this.rateDisplay.textContent(),
      interestAmount: await this.interestAmountDisplay.textContent()
    };
  }

  /**
   * 获取项目说明内容
   */
  async getProjectRemark() {
    return await this.projectRemarkDisplay.textContent();
  }

  /**
   * 获取附件列表
   */
  async getAttachmentList() {
    const items = await this.attachmentItems.all();
    const attachments = [];

    for (const item of items) {
      const fileName = await item.locator('.file-name').textContent();
      const fileSize = await item.locator('.file-size').textContent();
      const uploadTime = await item.locator('.upload-time').textContent();
      
      attachments.push({
        fileName: fileName || '',
        fileSize: fileSize || '',
        uploadTime: uploadTime || ''
      });
    }

    return attachments;
  }

  /**
   * 下载附件
   * @param {number} attachmentIndex - 附件索引
   */
  async downloadAttachment(attachmentIndex) {
    const downloadPromise = this.page.waitForEvent('download');
    const downloadButton = this.attachmentItems.nth(attachmentIndex).locator('.download-button');
    
    await downloadButton.click();
    const download = await downloadPromise;
    return download;
  }

  /**
   * 预览附件
   * @param {number} attachmentIndex - 附件索引
   */
  async previewAttachment(attachmentIndex) {
    const previewButton = this.attachmentItems.nth(attachmentIndex).locator('.preview-button');
    await previewButton.click();
    
    // 等待预览窗口打开
    await this.page.locator('.file-preview-dialog').waitFor();
  }

  /**
   * 获取审批历史记录
   */
  async getApprovalHistory() {
    const rows = await this.approvalHistoryRows.all();
    const history = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      history.push({
        step: cells[0] || '',
        approver: cells[1] || '',
        approvalTime: cells[2] || '',
        approvalResult: cells[3] || '',
        approvalComment: cells[4] || '',
        duration: cells[5] || ''
      });
    }

    return history;
  }

  /**
   * 获取BPM流程状态
   */
  async getBpmProcessStatus() {
    const steps = await this.processSteps.all();
    const processStatus = [];

    for (const step of steps) {
      const stepName = await step.locator('.step-name').textContent();
      const stepStatus = await step.locator('.step-status').textContent();
      const isActive = await step.locator('.step-active').isVisible();
      
      processStatus.push({
        stepName: stepName || '',
        stepStatus: stepStatus || '',
        isActive: isActive
      });
    }

    return processStatus;
  }

  /**
   * 检查操作按钮的可见性
   */
  async checkActionButtonsVisibility() {
    return {
      editVisible: await this.editButton.isVisible(),
      approveVisible: await this.approveButton.isVisible(),
      exportVisible: await this.exportButton.isVisible(),
      printVisible: await this.printButton.isVisible(),
      returnVisible: await this.returnToListButton.isVisible()
    };
  }

  /**
   * 点击编辑按钮
   */
  async clickEdit() {
    await this.editButton.click();
    await this.page.waitForTimeout(1000); // 等待Tab切换
  }

  /**
   * 点击审批按钮
   */
  async clickApprove() {
    await this.approveButton.click();
    await this.page.waitForTimeout(1000); // 等待Tab切换
  }

  /**
   * 导出项目详情
   */
  async exportDetail() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    const download = await downloadPromise;
    return download;
  }

  /**
   * 打印项目详情
   */
  async printDetail() {
    await this.printButton.click();
    // 等待打印对话框
    await this.page.locator('.print-dialog').waitFor();
  }

  /**
   * 返回列表页
   */
  async returnToList() {
    await this.returnToListButton.click();
    await this.page.waitForTimeout(1000); // 等待Tab切换
  }

  /**
   * 验证项目详情数据的完整性
   * @param {Object} expectedData - 期望的项目数据
   */
  async validateProjectDetailData(expectedData) {
    const basicInfo = await this.getProjectBasicInfo();
    const statusInfo = await this.getProjectStatusInfo();
    const financeInfo = await this.getFinanceInfo();
    const goodsList = await this.getGoodsDetailList();
    
    const validations = {};

    // 验证基本信息
    if (expectedData.projectName) {
      validations.projectNameMatch = basicInfo.projectName.includes(expectedData.projectName);
    }

    if (expectedData.supplier) {
      validations.supplierMatch = basicInfo.supplier.includes(expectedData.supplier);
    }

    if (expectedData.customer) {
      validations.customerMatch = basicInfo.customer.includes(expectedData.customer);
    }

    // 验证商品数量
    if (expectedData.goodsCount) {
      validations.goodsCountMatch = goodsList.length === expectedData.goodsCount;
    }

    // 验证财务信息
    if (expectedData.financeAmount) {
      const amount = parseFloat(financeInfo.financeAmount.replace(/[^\d.-]/g, ''));
      validations.financeAmountMatch = Math.abs(amount - expectedData.financeAmount) < 0.01;
    }

    // 验证状态
    if (expectedData.projectStatus) {
      validations.statusMatch = statusInfo.projectStatus.includes(expectedData.projectStatus);
    }

    return validations;
  }

  /**
   * 验证数据展示的完整性
   */
  async validateDisplayCompleteness() {
    const basicInfo = await this.getProjectBasicInfo();
    const statusInfo = await this.getProjectStatusInfo();
    const financeInfo = await this.getFinanceInfo();
    
    return {
      hasProjectCode: !!basicInfo.projectCode,
      hasProjectName: !!basicInfo.projectName,
      hasSupplier: !!basicInfo.supplier,
      hasCustomer: !!basicInfo.customer,
      hasStatus: !!statusInfo.projectStatus,
      hasCreateTime: !!statusInfo.createTime,
      hasFinanceAmount: !!financeInfo.financeAmount,
      hasBpmProcess: await this.bpmProcessSection.isVisible()
    };
  }

  /**
   * 检查审批流程的完整性
   */
  async validateApprovalProcessIntegrity() {
    const approvalHistory = await this.getApprovalHistory();
    const processStatus = await this.getBpmProcessStatus();
    
    return {
      hasApprovalHistory: approvalHistory.length > 0,
      hasBpmDiagram: await this.bpmDiagram.isVisible(),
      processStepCount: processStatus.length,
      activeStepExists: processStatus.some(step => step.isActive)
    };
  }
}

module.exports = { ProjectDetailPage };