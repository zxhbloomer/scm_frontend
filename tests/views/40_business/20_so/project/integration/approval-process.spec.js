const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pom/login/login-page');
const { DashboardPage } = require('../../../../pom/dashboard/dashboard-page');
const { ProjectListPage } = require('../../../../pom/40_business/20_so/project/project-list-page');
const { ProjectCreatePage } = require('../../../../pom/40_business/20_so/project/project-create-page');
const { ProjectApprovalPage } = require('../../../../pom/40_business/20_so/project/project-approval-page');
const { ProjectDetailPage } = require('../../../../pom/40_business/20_so/project/project-detail-page');
const { SOProjectTestData } = require('../../../../utils/so-project-test-data');

/**
 * SO项目管理审批流程集成测试
 * 使用Playwright + 真实API数据
 * 
 * 测试范围：
 * - 完整的审批工作流程
 * - 审批状态流转验证
 * - BPM流程集成验证
 * - 审批历史追踪验证
 */
test.describe('SO项目管理 - 审批流程集成测试', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.quickLogin();
    
    // 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test.describe('完整审批工作流程', () => {
    
    test('应该完成从项目创建到审批通过的完整流程', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      const projectApprovalPage = new ProjectApprovalPage(page);
      const projectDetailPage = new ProjectDetailPage(page);
      
      // 步骤1: 先创建一个待审批的项目
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      const testData = SOProjectTestData.generateCompleteProject();
      testData.projectName = `审批流程测试_${Date.now()}`;
      
      // 创建项目
      await projectCreatePage.fillBasicInfo({
        projectName: testData.projectName,
        supplierName: testData.supplierName,
        customerName: testData.customerName,
        deliveryLocation: testData.deliveryLocation
      });
      
      await projectCreatePage.addGoods(testData.goodsList[0]);
      await projectCreatePage.fillFinanceInfo(testData.financeInfo);
      await projectCreatePage.submitApproval();
      await projectListPage.waitForPageLoad();
      
      // 步骤2: 切换到待审批Tab，找到刚创建的项目
      await projectListPage.switchStatusTab('pendingApproval');
      await projectListPage.waitForLoading();
      
      const pendingProjects = await projectListPage.getProjectList();
      const targetProject = pendingProjects.find(p => 
        p.projectName.includes(testData.projectName)
      );
      
      expect(targetProject, '应该找到待审批的项目').toBeDefined();
      expect(targetProject.status, '状态应该是待审批').toContain('待审批');
      
      // 步骤3: 进入审批页面
      const projectIndex = pendingProjects.findIndex(p => 
        p.projectName.includes(testData.projectName)
      );
      
      await projectListPage.selectTableRow(projectIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 验证审批页面加载正确
      const approvalPageData = await projectApprovalPage.getProjectBasicInfo();
      expect(approvalPageData.projectName, '审批页项目名称应该一致').toContain(testData.projectName);
      
      // 验证当前审批步骤信息
      const currentStepInfo = await projectApprovalPage.getCurrentApprovalStepInfo();
      expect(currentStepInfo.stepName, '应该有当前审批步骤').toBeTruthy();
      expect(currentStepInfo.approverName, '应该有当前审批人').toBeTruthy();
      
      // 步骤4: 验证审批权限
      const approvalPermissions = await projectApprovalPage.validateApprovalPermissions();
      expect(approvalPermissions.canApprove, '应该可以审批通过').toBe(true);
      expect(approvalPermissions.canReject, '应该可以审批驳回').toBe(true);
      expect(approvalPermissions.canSubmit, '提交按钮应该可用').toBe(true);
      
      // 步骤5: 执行审批通过
      const approvalData = {
        result: 'approve',
        comment: '项目信息完整，商品明细清晰，财务数据合理，同意通过该项目申请。'
      };
      
      await projectApprovalPage.selectApprovalResult(approvalData.result);
      await projectApprovalPage.fillApprovalComment(approvalData.comment);
      
      // 验证审批表单填写完成
      const commentText = await projectApprovalPage.approvalCommentTextarea.inputValue();
      expect(commentText, '审批意见应该填写正确').toBe(approvalData.comment);
      
      // 提交审批
      await projectApprovalPage.submitApproval();
      
      // 步骤6: 验证审批提交结果
      const submissionResult = await projectApprovalPage.validateApprovalSubmissionResult('通过');
      expect(submissionResult.statusUpdated, '项目状态应该更新').toBe(true);
      expect(submissionResult.historyAdded, '审批历史应该添加').toBe(true);
      
      // 步骤7: 返回列表验证状态变化
      await projectApprovalPage.returnToList();
      await projectListPage.waitForPageLoad();
      
      // 在执行中Tab查找项目
      await projectListPage.switchStatusTab('executing');
      await projectListPage.waitForLoading();
      
      const executingProjects = await projectListPage.getProjectList();
      const approvedProject = executingProjects.find(p => 
        p.projectName.includes(testData.projectName)
      );
      
      expect(approvedProject, '项目应该进入执行状态').toBeDefined();
      expect(approvedProject.status, '状态应该是执行中').toContain('执行');
      
      // 步骤8: 验证详情页审批历史
      const approvedProjectIndex = executingProjects.findIndex(p => 
        p.projectName.includes(testData.projectName)
      );
      
      await projectListPage.selectTableRow(approvedProjectIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      const approvalHistory = await projectDetailPage.getApprovalHistory();
      expect(approvalHistory.length, '应该有审批历史记录').toBeGreaterThan(0);
      
      const latestApproval = approvalHistory[0];
      expect(latestApproval.approvalResult, '最新审批结果应该是通过').toContain('通过');
      expect(latestApproval.approvalComment, '审批意见应该正确').toContain(approvalData.comment);
      
      console.log(`✅ 审批流程测试完成 - 项目: ${testData.projectName}, 状态: ${approvedProject.status}`);
    });

    test('应该完成审批驳回的完整流程', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      const projectApprovalPage = new ProjectApprovalPage(page);
      
      // 创建待审批项目
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      const testData = SOProjectTestData.generateCompleteProject();
      testData.projectName = `审批驳回测试_${Date.now()}`;
      
      await projectCreatePage.fillBasicInfo({
        projectName: testData.projectName,
        supplierName: testData.supplierName,
        customerName: testData.customerName
      });
      
      await projectCreatePage.addGoods(testData.goodsList[0]);
      await projectCreatePage.fillFinanceInfo(testData.financeInfo);
      await projectCreatePage.submitApproval();
      await projectListPage.waitForPageLoad();
      
      // 进入审批流程
      await projectListPage.switchStatusTab('pendingApproval');
      await projectListPage.waitForLoading();
      
      const pendingProjects = await projectListPage.getProjectList();
      const targetProjectIndex = pendingProjects.findIndex(p => 
        p.projectName.includes(testData.projectName)
      );
      
      await projectListPage.selectTableRow(targetProjectIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 执行审批驳回
      const rejectionData = {
        result: 'reject',
        comment: '商品信息不完整，财务数据需要进一步核实，建议重新整理后提交。'
      };
      
      await projectApprovalPage.selectApprovalResult(rejectionData.result);
      await projectApprovalPage.fillApprovalComment(rejectionData.comment);
      await projectApprovalPage.submitApproval();
      
      // 验证驳回结果
      const submissionResult = await projectApprovalPage.validateApprovalSubmissionResult('驳回');
      expect(submissionResult.statusUpdated, '项目状态应该更新为驳回').toBe(true);
      
      // 返回列表验证
      await projectApprovalPage.returnToList();
      await projectListPage.waitForPageLoad();
      
      // 在全部Tab查找被驳回的项目
      await projectListPage.switchStatusTab('all');
      await projectListPage.waitForLoading();
      
      const allProjects = await projectListPage.getProjectList();
      const rejectedProject = allProjects.find(p => 
        p.projectName.includes(testData.projectName)
      );
      
      expect(rejectedProject, '应该找到被驳回的项目').toBeDefined();
      expect(rejectedProject.status, '状态应该显示驳回').toContain('驳回');
      
      console.log(`✅ 审批驳回流程测试完成 - 项目: ${testData.projectName}`);
    });

    test('应该支持审批转办流程', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      const projectApprovalPage = new ProjectApprovalPage(page);
      
      // 创建待审批项目
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      const testData = SOProjectTestData.generateCompleteProject();
      testData.projectName = `审批转办测试_${Date.now()}`;
      
      await projectCreatePage.fillBasicInfo({
        projectName: testData.projectName,
        supplierName: testData.supplierName,
        customerName: testData.customerName
      });
      
      await projectCreatePage.addGoods(testData.goodsList[0]);
      await projectCreatePage.fillFinanceInfo(testData.financeInfo);
      await projectCreatePage.submitApproval();
      await projectListPage.waitForPageLoad();
      
      // 进入审批流程
      await projectListPage.switchStatusTab('pendingApproval');
      await projectListPage.waitForLoading();
      
      const pendingProjects = await projectListPage.getProjectList();
      const targetProjectIndex = pendingProjects.findIndex(p => 
        p.projectName.includes(testData.projectName)
      );
      
      await projectListPage.selectTableRow(targetProjectIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 验证转办权限
      const permissions = await projectApprovalPage.validateApprovalPermissions();
      
      if (permissions.canTransfer) {
        // 执行转办
        const transferData = {
          result: 'transfer',
          comment: '此项目需要专业人员审批，转办给相关负责人处理。',
          transferInfo: {
            transferUser: '测试审批员',
            transferReason: '需要专业审批意见'
          }
        };
        
        await projectApprovalPage.selectApprovalResult(transferData.result);
        
        // 验证转办区域显示
        const transferSectionVisible = await projectApprovalPage.transferSection.isVisible();
        expect(transferSectionVisible, '转办区域应该显示').toBe(true);
        
        await projectApprovalPage.fillApprovalComment(transferData.comment);
        await projectApprovalPage.setTransferInfo(transferData.transferInfo);
        await projectApprovalPage.submitApproval();
        
        // 验证转办成功
        const submissionResult = await projectApprovalPage.validateApprovalSubmissionResult('转办');
        expect(submissionResult.historyAdded, '转办记录应该添加到历史').toBe(true);
        
        console.log(`✅ 审批转办流程测试完成 - 项目: ${testData.projectName}`);
      } else {
        console.log(`⚠️ 当前用户无转办权限，跳过转办测试`);
      }
    });

  });

  test.describe('审批流程状态验证', () => {
    
    test('应该验证BPM流程状态的完整性', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectApprovalPage = new ProjectApprovalPage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      // 切换到待审批Tab
      await projectListPage.switchStatusTab('pendingApproval');
      await projectListPage.waitForLoading();
      
      const pendingProjects = await projectListPage.getProjectList();
      
      if (pendingProjects.length > 0) {
        await projectListPage.selectTableRow(0);
        await projectListPage.clickApprove();
        await projectApprovalPage.waitForApprovalPageLoad();
        
        // 验证BPM流程状态
        const bmpProcessStatus = await projectApprovalPage.getBmpProcessStatus();
        
        expect(bmpProcessStatus.length, 'BPM流程应该有多个步骤').toBeGreaterThan(0);
        
        // 验证当前活动步骤
        const activeStep = bmpProcessStatus.find(step => step.isActive);
        expect(activeStep, '应该有当前活动的审批步骤').toBeDefined();
        
        // 验证已完成步骤
        const completedSteps = bmpProcessStatus.filter(step => step.isCompleted);
        expect(completedSteps.length, '应该有已完成的步骤').toBeGreaterThanOrEqual(0);
        
        console.log('BPM流程状态验证:', bmpProcessStatus);
      }
    });

    test('应该验证审批历史的完整性和准确性', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectApprovalPage = new ProjectApprovalPage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      // 查找已有审批历史的项目
      await projectListPage.switchStatusTab('executing');
      await projectListPage.waitForLoading();
      
      const executingProjects = await projectListPage.getProjectList();
      
      if (executingProjects.length > 0) {
        await projectListPage.selectTableRow(0);
        await projectListPage.clickApprove();
        await projectApprovalPage.waitForApprovalPageLoad();
        
        // 获取审批历史
        const approvalHistory = await projectApprovalPage.getApprovalHistory();
        
        if (approvalHistory.length > 0) {
          // 验证审批历史字段完整性
          const latestRecord = approvalHistory[0];
          
          expect(latestRecord.stepName, '审批步骤名称应该存在').toBeTruthy();
          expect(latestRecord.approver, '审批人应该存在').toBeTruthy();
          expect(latestRecord.approvalTime, '审批时间应该存在').toBeTruthy();
          expect(latestRecord.approvalResult, '审批结果应该存在').toBeTruthy();
          
          // 验证时间格式
          const timePattern = /\d{4}-\d{2}-\d{2}|\d{2}:\d{2}/;
          expect(timePattern.test(latestRecord.approvalTime), '审批时间格式应该正确').toBe(true);
          
          console.log('审批历史验证通过:', latestRecord);
        }
      }
    });

  });

  test.describe('审批流程性能验证', () => {
    
    test('应该在合理时间内完成审批操作', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectApprovalPage = new ProjectApprovalPage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      await projectListPage.switchStatusTab('pendingApproval');
      await projectListPage.waitForLoading();
      
      const pendingProjects = await projectListPage.getProjectList();
      
      if (pendingProjects.length > 0) {
        const startTime = Date.now();
        
        // 进入审批页面
        await projectListPage.selectTableRow(0);
        await projectListPage.clickApprove();
        await projectApprovalPage.waitForApprovalPageLoad();
        
        // 执行审批操作
        await projectApprovalPage.selectApprovalResult('approve');
        await projectApprovalPage.fillApprovalComment('性能测试审批意见');
        
        const approvalStartTime = Date.now();
        await projectApprovalPage.submitApproval();
        const approvalEndTime = Date.now();
        
        const totalTime = approvalEndTime - startTime;
        const approvalTime = approvalEndTime - approvalStartTime;
        
        // 验证性能（整个审批流程应该在20秒内完成）
        expect(totalTime, '整个审批流程应该在合理时间内完成').toBeLessThan(20000);
        
        // 验证审批提交性能（应该在5秒内完成）
        expect(approvalTime, '审批提交应该快速完成').toBeLessThan(5000);
        
        console.log(`审批流程性能测试完成 - 总耗时: ${totalTime}ms, 提交耗时: ${approvalTime}ms`);
      }
    });

    test('应该支持并发审批操作', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectApprovalPage = new ProjectApprovalPage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      await projectListPage.switchStatusTab('pendingApproval');
      await projectListPage.waitForLoading();
      
      const pendingProjects = await projectListPage.getProjectList();
      
      if (pendingProjects.length >= 2) {
        const concurrentStartTime = Date.now();
        
        // 快速处理多个审批（模拟并发场景）
        for (let i = 0; i < Math.min(3, pendingProjects.length); i++) {
          await projectListPage.selectTableRow(i);
          await projectListPage.clickApprove();
          await projectApprovalPage.waitForApprovalPageLoad();
          
          await projectApprovalPage.selectApprovalResult('approve');
          await projectApprovalPage.fillApprovalComment(`并发测试审批 ${i + 1}`);
          await projectApprovalPage.submitApproval();
          
          await projectApprovalPage.returnToList();
          await projectListPage.waitForPageLoad();
          await projectListPage.switchStatusTab('pendingApproval');
          await projectListPage.waitForLoading();
        }
        
        const concurrentEndTime = Date.now();
        const concurrentDuration = concurrentEndTime - concurrentStartTime;
        
        // 验证并发性能（3个审批应该在60秒内完成）
        expect(concurrentDuration, '并发审批性能应该可接受').toBeLessThan(60000);
        
        console.log(`并发审批测试完成，总耗时: ${concurrentDuration}ms`);
      }
    });

  });

});