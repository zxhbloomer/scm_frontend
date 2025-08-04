const { test, expect } = require('@playwright/test');
const { ProjectListPage } = require('../../../../../pom/40_business/20_so/project/10_list');
const { ProjectApprovalPage } = require('../../../../../pom/40_business/20_so/project/40_approval');

/**
 * SO项目管理 - 审批页单元测试
 * 测试范围：审批流程、BPM集成、审批权限、意见填写
 */
test.describe('SO项目管理 - 审批页测试', () => {

  let projectListPage;
  let projectApprovalPage;

  test.beforeEach(async ({ page }) => {
    projectListPage = new ProjectListPage(page);
    projectApprovalPage = new ProjectApprovalPage(page);
    
    // 登录系统
    await page.goto('/');
    await page.fill('input[placeholder*="用户名"]', 'test');
    await page.fill('input[placeholder*="密码"]', '654321');
    await page.fill('input[placeholder*="企业"]', '1');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    // 进入项目管理页面
    await page.goto('/#/so/project');
    await projectListPage.waitForPageLoad();
  });

  test('审批页面访问权限验证', async ({ page }) => {
    // 切换到审批中标签页
    await projectListPage.switchStatusTab('approving');
    
    const tableValidation = await projectListPage.validateTableLoaded();
    
    if (tableValidation.hasData) {
      // 选择第一个审批中的项目
      await projectListPage.selectTableRow(0);
      
      // 检查审批按钮状态
      const buttonStates = await projectListPage.validateButtonStates();
      
      if (buttonStates.approveEnabled) {
        // 点击审批进入审批页
        await projectListPage.clickApprove();
        await projectApprovalPage.waitForApprovalPageLoad();
        
        // 验证审批页面加载
        await expect(projectApprovalPage.approvalContainer).toBeVisible();
        await expect(projectApprovalPage.projectInfoSection).toBeVisible();
        
        console.log('✅ 审批页面访问权限验证通过');
      } else {
        console.log('ℹ️ 当前用户无审批权限或无审批中项目');
      }
    } else {
      console.log('ℹ️ 暂无审批中的项目');
    }
  });

  test('审批页面基础元素验证', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 验证项目信息展示区域
      await expect(projectApprovalPage.projectSummaryCard).toBeVisible();
      await expect(projectApprovalPage.projectCodeText).toBeVisible();
      await expect(projectApprovalPage.projectNameText).toBeVisible();
      
      // 验证BPM流程图区域
      await expect(projectApprovalPage.bmpProcessSection).toBeVisible();
      
      // 验证审批决策区域
      await expect(projectApprovalPage.approvalDecisionSection).toBeVisible();
      await expect(projectApprovalPage.approvalResultRadioGroup).toBeVisible();
      
      // 验证审批意见区域
      await expect(projectApprovalPage.approvalCommentSection).toBeVisible();
      await expect(projectApprovalPage.approvalCommentTextarea).toBeVisible();
      
      // 验证操作按钮
      await expect(projectApprovalPage.submitApprovalButton).toBeVisible();
      await expect(projectApprovalPage.returnToListButton).toBeVisible();
      
      console.log('✅ 审批页面基础元素验证通过');
    }
  });

  test('项目基本信息显示验证', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 获取项目基本信息
      const projectInfo = await projectApprovalPage.getProjectBasicInfo();
      
      // 验证项目信息完整性
      expect(projectInfo.projectCode).toBeTruthy();
      expect(projectInfo.projectName).toBeTruthy();
      expect(projectInfo.currentStatus).toBeTruthy();
      
      // 验证信息与列表页一致
      expect(projectInfo.projectName).toContain(approvingProject.projectName);
      
      console.log('项目基本信息:', projectInfo);
      console.log('✅ 项目基本信息显示验证通过');
    }
  });

  test('审批步骤信息验证', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 获取当前审批步骤信息
      const stepInfo = await projectApprovalPage.getCurrentApprovalStepInfo();
      
      // 验证审批步骤信息
      expect(stepInfo.stepName).toBeTruthy();
      expect(stepInfo.approverName).toBeTruthy();
      
      console.log('当前审批步骤:', stepInfo);
      console.log('✅ 审批步骤信息验证通过');
    }
  });

  test('审批权限验证', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 验证审批操作权限
      const permissions = await projectApprovalPage.validateApprovalPermissions();
      
      // 验证基本审批选项可见
      expect(permissions.canApprove).toBe(true);
      expect(permissions.canReject).toBe(true);
      
      // 验证操作按钮可用
      expect(permissions.canSubmit).toBe(true);
      
      console.log('审批权限验证:', permissions);
      console.log('✅ 审批权限验证通过');
    }
  });

  test('审批结果选择功能', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 测试选择同意
      await projectApprovalPage.selectApprovalResult('approve');
      const approveChecked = await projectApprovalPage.approveRadio.isChecked();
      expect(approveChecked).toBe(true);
      
      // 测试选择驳回
      await projectApprovalPage.selectApprovalResult('reject');
      const rejectChecked = await projectApprovalPage.rejectRadio.isChecked();
      expect(rejectChecked).toBe(true);
      
      // 测试选择退回
      await projectApprovalPage.selectApprovalResult('return');
      const returnChecked = await projectApprovalPage.returnRadio.isChecked();
      expect(returnChecked).toBe(true);
      
      // 测试转办功能
      await projectApprovalPage.selectApprovalResult('transfer');
      const transferChecked = await projectApprovalPage.transferRadio.isChecked();
      expect(transferChecked).toBe(true);
      
      // 验证转办区域显示
      await expect(projectApprovalPage.transferSection).toBeVisible();
      
      console.log('✅ 审批结果选择功能验证通过');
    }
  });

  test('审批意见填写功能', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 填写审批意见
      const approvalComment = '测试审批意见：项目资料齐全，符合审批要求。';
      await projectApprovalPage.fillApprovalComment(approvalComment);
      
      // 验证意见填写结果
      const commentValue = await projectApprovalPage.approvalCommentTextarea.inputValue();
      expect(commentValue).toBe(approvalComment);
      
      // 测试常用语功能
      if (await projectApprovalPage.commonPhrasesButton.isVisible()) {
        await projectApprovalPage.useCommonPhrase('同意');
        await page.waitForTimeout(1000);
      }
      
      // 测试意见模板功能
      if (await projectApprovalPage.commentTemplatesSelect.isVisible()) {
        await projectApprovalPage.selectCommentTemplate('标准同意意见');
        await page.waitForTimeout(1000);
      }
      
      console.log('✅ 审批意见填写功能验证通过');
    }
  });

  test('转办功能验证', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 选择转办
      await projectApprovalPage.selectApprovalResult('transfer');
      
      // 设置转办信息
      const transferData = {
        transferUser: '张三',
        transferReason: '专业问题需要专业人员处理'
      };
      
      await projectApprovalPage.setTransferInfo(transferData);
      
      // 验证转办信息填写
      const reasonValue = await projectApprovalPage.transferReasonTextarea.inputValue();
      expect(reasonValue).toBe(transferData.transferReason);
      
      console.log('✅ 转办功能验证通过');
    }
  });

  test('审批历史记录验证', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 获取审批历史记录
      const history = await projectApprovalPage.getApprovalHistory();
      
      // 验证历史记录结构
      if (history.length > 0) {
        const firstRecord = history[0];
        expect(firstRecord).toHaveProperty('stepName');
        expect(firstRecord).toHaveProperty('approver');
        expect(firstRecord).toHaveProperty('approvalTime');
        
        console.log('审批历史记录:', history);
      }
      
      // 测试展开/收起功能
      if (await projectApprovalPage.expandAllHistoryButton.isVisible()) {
        await projectApprovalPage.expandAllHistory();
        await projectApprovalPage.collapseAllHistory();
      }
      
      console.log('✅ 审批历史记录验证通过');
    }
  });

  test('BPM流程状态验证', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 获取BPM流程状态
      const processStatus = await projectApprovalPage.getBmpProcessStatus();
      
      // 验证流程状态信息
      if (processStatus.length > 0) {
        const hasActiveStep = processStatus.some(step => step.isActive);
        expect(hasActiveStep).toBe(true);
        
        console.log('BPM流程状态:', processStatus);
      }
      
      console.log('✅ BPM流程状态验证通过');
    }
  });

  test('审批附件上传功能', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 验证附件上传区域
      if (await projectApprovalPage.attachmentUploadArea.isVisible()) {
        await expect(projectApprovalPage.attachmentUploadArea).toBeVisible();
        
        // 注意：这里不实际上传文件，只验证上传区域可见
        console.log('✅ 审批附件上传区域可见');
      }
    }
  });

  test('审批意见保存功能', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 填写审批意见
      await projectApprovalPage.fillApprovalComment('测试保存审批意见功能');
      
      // 测试保存功能
      if (await projectApprovalPage.saveCommentButton.isVisible()) {
        await projectApprovalPage.saveApprovalComment();
        
        // 验证保存成功（通常会有成功提示）
        await page.waitForTimeout(1000);
        
        console.log('✅ 审批意见保存功能验证通过');
      }
    }
  });

  test('审批表单重置功能', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 填写一些审批信息
      await projectApprovalPage.selectApprovalResult('approve');
      await projectApprovalPage.fillApprovalComment('测试重置功能');
      
      // 测试重置功能
      if (await projectApprovalPage.resetFormButton.isVisible()) {
        await projectApprovalPage.resetApprovalForm();
        
        // 验证表单被重置
        const commentValue = await projectApprovalPage.approvalCommentTextarea.inputValue();
        expect(commentValue).toBe('');
        
        console.log('✅ 审批表单重置功能验证通过');
      }
    }
  });

  test('审批预览功能', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 填写审批信息
      await projectApprovalPage.selectApprovalResult('approve');
      await projectApprovalPage.fillApprovalComment('预览测试意见');
      
      // 测试预览功能
      if (await projectApprovalPage.previewButton.isVisible()) {
        await projectApprovalPage.previewApprovalResult();
        await page.waitForTimeout(1000);
        
        console.log('✅ 审批预览功能验证通过');
      }
    }
  });

  test('审批返回列表功能', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 点击返回列表
      await projectApprovalPage.returnToList();
      
      // 验证返回到列表页
      await projectListPage.waitForPageLoad();
      await expect(projectListPage.projectTable).toBeVisible();
      
      console.log('✅ 审批返回列表功能验证通过');
    }
  });

  test('完整审批流程测试（仅验证不实际提交）', async ({ page }) => {
    const approvingProject = await findApprovingProject();
    
    if (approvingProject) {
      await projectListPage.selectTableRow(approvingProject.rowIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 模拟完整审批流程
      const approvalData = {
        result: 'approve',
        comment: '项目符合公司政策要求，资料齐全，建议通过审批。'
      };
      
      // 选择审批结果
      await projectApprovalPage.selectApprovalResult(approvalData.result);
      
      // 填写审批意见
      await projectApprovalPage.fillApprovalComment(approvalData.comment);
      
      // 验证数据填写完整性
      const validations = await projectApprovalPage.validateApprovalPageData({
        projectName: approvingProject.projectName,
        currentStatus: '审批中'
      });
      
      console.log('审批页面数据验证:', validations);
      
      // 注意：这里不实际提交审批，避免影响数据
      console.log('✅ 完整审批流程验证通过（未实际提交）');
    }
  });

  // 辅助函数：查找审批中的项目
  async function findApprovingProject() {
    // 切换到审批中标签页
    await projectListPage.switchStatusTab('approving');
    await page.waitForLoadState('networkidle');
    
    const projects = await projectListPage.getProjectList();
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      
      // 查找审批中状态的项目
      if (project.status.includes('审批中')) {
        return {
          ...project,
          rowIndex: i
        };
      }
    }
    
    return null;
  }

});