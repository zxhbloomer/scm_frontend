const { ProjectBasePage } = require('./00_base');

/**
 * SO项目管理审批页面对象模型
 * 对应 /40_business/20_so/project (审批页tab)
 * 基于源码: src/views/40_business/20_so/project/tabs/50_approve/index.vue
 */
class ProjectApprovalPage extends ProjectBasePage {
  constructor(page) {
    super(page);
    this.url = '/40_business/20_so/project';
  }

  // ===================
  // 审批页面元素
  // ===================

  get approvalTabContainer() {
    return this.page.locator('.el-tab-pane[name="approve"]');
  }

  get approvalContainer() {
    return this.page.locator('.approval-container');
  }

  // 项目基本信息展示区域（只读）
  get projectInfoSection() {
    return this.page.locator('.project-info-section');
  }

  get projectSummaryCard() {
    return this.projectInfoSection.locator('.project-summary-card');
  }

  get projectCodeText() {
    return this.projectSummaryCard.locator('.project-code-text');
  }

  get projectNameText() {
    return this.projectSummaryCard.locator('.project-name-text');
  }

  get supplierText() {
    return this.projectSummaryCard.locator('.supplier-text');
  }

  get customerText() {
    return this.projectSummaryCard.locator('.customer-text');
  }

  get financeAmountText() {
    return this.projectSummaryCard.locator('.finance-amount-text');
  }

  get currentStatusText() {
    return this.projectSummaryCard.locator('.current-status-text');
  }

  // BPM审批流程图区域
  get bpmProcessSection() {
    return this.page.locator('.bpm-process-section');
  }

  get bpmDiagram() {
    return this.bmpProcessSection.locator('.bpmn-diagram-container');
  }

  get currentStepHighlight() {
    return this.bmpProcessSection.locator('.current-step-highlight');
  }

  get processStepsList() {
    return this.bmpProcessSection.locator('.process-steps-list');
  }

  get processStepItems() {
    return this.processStepsList.locator('.step-item');
  }

  // 当前审批步骤信息
  get currentApprovalSection() {
    return this.page.locator('.current-approval-section');
  }

  get currentStepName() {
    return this.currentApprovalSection.locator('.current-step-name');
  }

  get currentApproverName() {
    return this.currentApprovalSection.locator('.current-approver-name');
  }

  get approvalDeadline() {
    return this.currentApprovalSection.locator('.approval-deadline');
  }

  get urgencyLevelIndicator() {
    return this.currentApprovalSection.locator('.urgency-level');
  }

  // 审批决策表单区域
  get approvalDecisionSection() {
    return this.page.locator('.approval-decision-section');
  }

  get approvalResultRadioGroup() {
    return this.approvalDecisionSection.locator('.approval-result-radio-group');
  }

  get approveRadio() {
    return this.approvalResultRadioGroup.locator('input[value="approve"]');
  }

  get rejectRadio() {
    return this.approvalResultRadioGroup.locator('input[value="reject"]');
  }

  get returnRadio() {
    return this.approvalResultRadioGroup.locator('input[value="return"]');
  }

  get transferRadio() {
    return this.approvalResultRadioGroup.locator('input[value="transfer"]');
  }

  // 审批意见输入
  get approvalCommentSection() {
    return this.page.locator('.approval-comment-section');
  }

  get approvalCommentTextarea() {
    return this.approvalCommentSection.locator('textarea[placeholder*="审批意见"]');
  }

  get commentTemplatesSelect() {
    return this.approvalCommentSection.locator('.comment-templates-select');
  }

  get commonPhrasesButton() {
    return this.approvalCommentSection.locator('button:has-text("常用语")');
  }

  // 审批附件区域
  get approvalAttachmentSection() {
    return this.page.locator('.approval-attachment-section');
  }

  get attachmentUploadArea() {
    return this.approvalAttachmentSection.locator('.el-upload-dragger');
  }

  get uploadedAttachmentsList() {
    return this.approvalAttachmentSection.locator('.uploaded-attachments-list');
  }

  // 转办/委派区域
  get transferSection() {
    return this.page.locator('.transfer-section');
  }

  get transferUserSelect() {
    return this.transferSection.locator('.transfer-user-select');
  }

  get transferReasonTextarea() {
    return this.transferSection.locator('textarea[placeholder*="转办原因"]');
  }

  // 审批历史区域
  get approvalHistorySection() {
    return this.page.locator('.approval-history-section');
  }

  get approvalHistoryTable() {
    return this.approvalHistorySection.locator('el-table[ref="approvalHistoryTable"]');
  }

  get historyTableRows() {
    return this.approvalHistoryTable.locator('tbody tr');
  }

  get expandAllHistoryButton() {
    return this.approvalHistorySection.locator('button:has-text("展开全部")');
  }

  get collapseAllHistoryButton() {
    return this.approvalHistorySection.locator('button:has-text("收起全部")');
  }

  // 相关单据区域
  get relatedDocumentsSection() {
    return this.page.locator('.related-documents-section');
  }

  get relatedDocumentsTable() {
    return this.relatedDocumentsSection.locator('el-table[ref="relatedDocumentsTable"]');
  }

  get viewRelatedDocumentButtons() {
    return this.relatedDocumentsTable.locator('button:has-text("查看")');
  }

  // 操作按钮区域
  get approvalActionsSection() {
    return this.page.locator('.approval-actions-section');
  }

  get submitApprovalButton() {
    return this.approvalActionsSection.locator('button:has-text("提交审批")');
  }

  get saveCommentButton() {
    return this.approvalActionsSection.locator('button:has-text("保存意见")');
  }

  get resetFormButton() {
    return this.approvalActionsSection.locator('button:has-text("重置")');
  }

  get returnToListButton() {
    return this.approvalActionsSection.locator('button:has-text("返回列表")');
  }

  get previewButton() {
    return this.approvalActionsSection.locator('button:has-text("预览")');
  }

  // 审批确认对话框
  get approvalConfirmDialog() {
    return this.page.locator('.approval-confirm-dialog');
  }

  get confirmDialogContent() {
    return this.approvalConfirmDialog.locator('.dialog-content');
  }

  get confirmApprovalButton() {
    return this.approvalConfirmDialog.locator('button:has-text("确认审批")');
  }

  get cancelApprovalButton() {
    return this.approvalConfirmDialog.locator('button:has-text("取消")');
  }

  // 常用语选择弹窗
  get commonPhrasesDialog() {
    return this.page.locator('.common-phrases-dialog');
  }

  get phrasesList() {
    return this.commonPhrasesDialog.locator('.phrases-list');
  }

  get phraseItems() {
    return this.phrasesList.locator('.phrase-item');
  }

  // ===================
  // 审批页面操作方法
  // ===================

  /**
   * 等待审批页面加载完成
   */
  async waitForApprovalPageLoad() {
    await this.approvalTabContainer.waitFor();
    await this.approvalContainer.waitFor();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 获取项目基本信息
   */
  async getProjectBasicInfo() {
    return {
      projectCode: await this.projectCodeText.textContent(),
      projectName: await this.projectNameText.textContent(),
      supplier: await this.supplierText.textContent(),
      customer: await this.customerText.textContent(),
      financeAmount: await this.financeAmountText.textContent(),
      currentStatus: await this.currentStatusText.textContent()
    };
  }

  /**
   * 获取当前审批步骤信息
   */
  async getCurrentApprovalStepInfo() {
    return {
      stepName: await this.currentStepName.textContent(),
      approverName: await this.currentApproverName.textContent(),
      deadline: await this.approvalDeadline.textContent(),
      urgencyLevel: await this.urgencyLevelIndicator.textContent()
    };
  }

  /**
   * 选择审批结果
   * @param {string} result - 审批结果 ('approve', 'reject', 'return', 'transfer')
   */
  async selectApprovalResult(result) {
    const radioMap = {
      'approve': this.approveRadio,
      'reject': this.rejectRadio,
      'return': this.returnRadio,
      'transfer': this.transferRadio
    };

    const radio = radioMap[result];
    if (radio) {
      await radio.check();
      
      // 如果是转办，显示转办区域
      if (result === 'transfer') {
        await this.transferSection.waitFor();
      }
    }
  }

  /**
   * 填写审批意见
   * @param {string} comment - 审批意见内容
   */
  async fillApprovalComment(comment) {
    await this.approvalCommentTextarea.clear();
    await this.approvalCommentTextarea.fill(comment);
  }

  /**
   * 选择审批意见模板
   * @param {string} template - 模板名称
   */
  async selectCommentTemplate(template) {
    await this.commentTemplatesSelect.click();
    await this.page.locator(`.el-select-dropdown .el-option:has-text("${template}")`).click();
    
    // 等待模板内容填入
    await this.page.waitForTimeout(500);
  }

  /**
   * 使用常用语
   * @param {string} phrase - 常用语内容
   */
  async useCommonPhrase(phrase) {
    await this.commonPhrasesButton.click();
    await this.commonPhrasesDialog.waitFor();
    
    // 选择指定的常用语
    const phraseItem = this.phraseItems.filter({ hasText: phrase });
    await phraseItem.first().click();
    
    await this.commonPhrasesDialog.waitFor({ state: 'hidden' });
  }

  /**
   * 上传审批附件
   * @param {string} filePath - 文件路径
   */
  async uploadApprovalAttachment(filePath) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.attachmentUploadArea.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  /**
   * 设置转办信息
   * @param {Object} transferData - 转办数据
   */
  async setTransferInfo(transferData) {
    if (transferData.transferUser) {
      await this.transferUserSelect.click();
      await this.page.locator(`.el-select-dropdown .el-option:has-text("${transferData.transferUser}")`).click();
    }

    if (transferData.transferReason) {
      await this.transferReasonTextarea.fill(transferData.transferReason);
    }
  }

  /**
   * 提交审批
   */
  async submitApproval() {
    await this.submitApprovalButton.click();
    
    // 等待确认对话框
    await this.approvalConfirmDialog.waitFor();
    
    // 确认提交
    await this.confirmApprovalButton.click();
    
    // 等待提交完成
    await this.waitForSuccess();
  }

  /**
   * 保存审批意见（暂存）
   */
  async saveApprovalComment() {
    await this.saveCommentButton.click();
    await this.waitForSuccess();
  }

  /**
   * 重置审批表单
   */
  async resetApprovalForm() {
    await this.resetFormButton.click();
    await this.confirmAction(); // 确认重置
  }

  /**
   * 预览审批结果
   */
  async previewApprovalResult() {
    await this.previewButton.click();
    // 等待预览窗口或页面
    await this.page.waitForTimeout(1000);
  }

  /**
   * 返回列表页
   */
  async returnToList() {
    await this.returnToListButton.click();
    await this.page.waitForTimeout(1000); // 等待Tab切换
  }

  /**
   * 获取审批历史记录
   */
  async getApprovalHistory() {
    const rows = await this.historyTableRows.all();
    const history = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      history.push({
        stepName: cells[0] || '',
        approver: cells[1] || '',
        approvalTime: cells[2] || '',
        approvalResult: cells[3] || '',
        approvalComment: cells[4] || '',
        duration: cells[5] || '',
        nextStep: cells[6] || ''
      });
    }

    return history;
  }

  /**
   * 展开所有审批历史
   */
  async expandAllHistory() {
    await this.expandAllHistoryButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 收起所有审批历史
   */
  async collapseAllHistory() {
    await this.collapseAllHistoryButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 获取相关单据列表
   */
  async getRelatedDocuments() {
    const table = this.relatedDocumentsTable;
    const rows = await table.locator('tbody tr').all();
    const documents = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      documents.push({
        documentType: cells[0] || '',
        documentCode: cells[1] || '',
        documentName: cells[2] || '',
        status: cells[3] || '',
        createTime: cells[4] || ''
      });
    }

    return documents;
  }

  /**
   * 查看相关单据
   * @param {number} documentIndex - 单据索引
   */
  async viewRelatedDocument(documentIndex) {
    const viewButton = this.viewRelatedDocumentButtons.nth(documentIndex);
    await viewButton.click();
    // 等待单据详情页面或弹窗
    await this.page.waitForTimeout(1000);
  }

  /**
   * 获取BPM流程状态
   */
  async getBpmProcessStatus() {
    const stepItems = await this.processStepItems.all();
    const processStatus = [];

    for (const item of stepItems) {
      const stepName = await item.locator('.step-name').textContent();
      const stepStatus = await item.locator('.step-status').textContent();
      const isActive = await item.locator('.step-active').isVisible();
      const isCompleted = await item.locator('.step-completed').isVisible();
      
      processStatus.push({
        stepName: stepName || '',
        stepStatus: stepStatus || '',
        isActive: isActive,
        isCompleted: isCompleted
      });
    }

    return processStatus;
  }

  /**
   * 验证审批页面数据的完整性
   * @param {Object} expectedData - 期望的数据
   */
  async validateApprovalPageData(expectedData) {
    const projectInfo = await this.getProjectBasicInfo();
    const stepInfo = await this.getCurrentApprovalStepInfo();
    const history = await this.getApprovalHistory();
    
    const validations = {};

    // 验证项目基本信息
    if (expectedData.projectName) {
      validations.projectNameMatch = projectInfo.projectName.includes(expectedData.projectName);
    }

    if (expectedData.currentStatus) {
      validations.statusMatch = projectInfo.currentStatus.includes(expectedData.currentStatus);
    }

    // 验证审批步骤信息
    if (expectedData.stepName) {
      validations.stepNameMatch = stepInfo.stepName.includes(expectedData.stepName);
    }

    if (expectedData.approver) {
      validations.approverMatch = stepInfo.approverName.includes(expectedData.approver);
    }

    // 验证审批历史
    if (expectedData.hasHistory) {
      validations.hasApprovalHistory = history.length > 0;
    }

    return validations;
  }

  /**
   * 验证审批操作权限
   */
  async validateApprovalPermissions() {
    return {
      canApprove: await this.approveRadio.isVisible(),
      canReject: await this.rejectRadio.isVisible(),
      canReturn: await this.returnRadio.isVisible(),
      canTransfer: await this.transferRadio.isVisible(),
      canUploadAttachment: await this.attachmentUploadArea.isVisible(),
      canSubmit: await this.submitApprovalButton.isEnabled(),
      canSaveComment: await this.saveCommentButton.isVisible()
    };
  }

  /**
   * 执行完整的审批流程
   * @param {Object} approvalData - 审批数据
   */
  async performCompleteApproval(approvalData) {
    // 选择审批结果
    await this.selectApprovalResult(approvalData.result);

    // 填写审批意见
    if (approvalData.comment) {
      await this.fillApprovalComment(approvalData.comment);
    }

    // 如果是转办，设置转办信息
    if (approvalData.result === 'transfer' && approvalData.transferInfo) {
      await this.setTransferInfo(approvalData.transferInfo);
    }

    // 上传附件（如果有）
    if (approvalData.attachmentPath) {
      await this.uploadApprovalAttachment(approvalData.attachmentPath);
    }

    // 提交审批
    await this.submitApproval();
  }

  /**
   * 验证审批提交结果
   * @param {string} expectedResult - 期望的结果状态
   */
  async validateApprovalSubmissionResult(expectedResult) {
    // 等待页面更新
    await this.page.waitForTimeout(2000);
    
    const updatedStatus = await this.currentStatusText.textContent();
    const updatedHistory = await this.getApprovalHistory();
    
    return {
      statusUpdated: updatedStatus.includes(expectedResult),
      historyAdded: updatedHistory.length > 0,
      latestApprovalResult: updatedHistory[0]?.approvalResult || ''
    };
  }
}

module.exports = { ProjectApprovalPage };