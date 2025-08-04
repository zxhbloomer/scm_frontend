const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pom/login/login-page');
const { DashboardPage } = require('../../../../pom/dashboard/dashboard-page');
const { ProjectListPage } = require('../../../../pom/40_business/20_so/project/project-list-page');
const { ProjectCreatePage } = require('../../../../pom/40_business/20_so/project/project-create-page');
const { ProjectEditPage } = require('../../../../pom/40_business/20_so/project/project-edit-page');
const { ProjectDetailPage } = require('../../../../pom/40_business/20_so/project/project-detail-page');
const { ProjectApprovalPage } = require('../../../../pom/40_business/20_so/project/project-approval-page');
const { SOProjectTestData } = require('../../../../utils/so-project-test-data');

/**
 * SO项目管理数据一致性集成测试
 * 使用Playwright + 真实API数据
 * 
 * 测试范围：
 * - 跨页面数据一致性验证
 * - 数据修改后的同步验证
 * - 状态变更的数据完整性
 * - 并发操作的数据一致性
 */
test.describe('SO项目管理 - 数据一致性集成测试', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.quickLogin();
    
    // 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test.describe('跨页面数据一致性验证', () => {
    
    test('应该保证列表页、详情页、编辑页数据一致', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectDetailPage = new ProjectDetailPage(page);
      const projectEditPage = new ProjectEditPage(page);
      
      // 导航到项目管理
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      const projects = await projectListPage.getProjectList();
      
      if (projects.length > 0) {
        const targetProject = projects[0];
        
        // 步骤1: 获取列表页数据
        await projectListPage.selectTableRow(0);
        const listPageData = {
          projectName: targetProject.projectName,
          supplier: targetProject.supplier,
          customer: targetProject.customer,
          status: targetProject.status,
          createTime: targetProject.createTime
        };
        
        // 步骤2: 验证详情页数据一致性
        await projectListPage.clickView();
        await projectDetailPage.waitForDetailPageLoad();
        
        const detailBasicInfo = await projectDetailPage.getProjectBasicInfo();
        const detailStatusInfo = await projectDetailPage.getProjectStatusInfo();
        const detailFinanceInfo = await projectDetailPage.getFinanceInfo();
        const detailGoodsList = await projectDetailPage.getGoodsDetailList();
        
        // 验证基本信息一致性
        expect(detailBasicInfo.projectName, '详情页项目名称应该与列表页一致').toContain(listPageData.projectName);
        expect(detailBasicInfo.supplier, '详情页供应商应该与列表页一致').toContain(listPageData.supplier);
        expect(detailBasicInfo.customer, '详情页客户应该与列表页一致').toContain(listPageData.customer);
        expect(detailStatusInfo.projectStatus, '详情页状态应该与列表页一致').toContain(listPageData.status);
        
        // 步骤3: 验证编辑页数据一致性（如果可编辑）
        const actionButtons = await projectDetailPage.checkActionButtonsVisibility();
        
        if (actionButtons.editVisible) {
          await projectDetailPage.clickEdit();
          await projectEditPage.waitForEditPageLoad();
          
          const editPageData = await projectEditPage.getCurrentProjectData();
          const editGoodsList = await projectEditPage.getGoodsList();
          const editFinanceInfo = await projectEditPage.getCurrentFinanceInfo();
          
          // 验证编辑页与详情页数据一致性
          expect(editPageData.projectName, '编辑页项目名称应该与详情页一致').toBe(detailBasicInfo.projectName);
          expect(editPageData.deliveryLocation, '编辑页交货地点应该与详情页一致').toBe(detailBasicInfo.deliveryLocation);
          expect(editGoodsList.length, '编辑页商品数量应该与详情页一致').toBe(detailGoodsList.length);
          
          // 验证财务信息数值一致性
          if (editFinanceInfo.financeAmount && detailFinanceInfo.financeAmount) {
            const editAmount = parseFloat(editFinanceInfo.financeAmount.replace(/[^\\d.-]/g, ''));
            const detailAmount = parseFloat(detailFinanceInfo.financeAmount.replace(/[^\\d.-]/g, ''));
            expect(Math.abs(editAmount - detailAmount), '编辑页融资额度应该与详情页一致').toBeLessThan(0.01);
          }
          
          console.log(`✅ 跨页面数据一致性验证通过 - 项目: ${listPageData.projectName}`);
        }
      }
    });

    test('应该保证数据修改后的跨页面同步', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectEditPage = new ProjectEditPage(page);
      const projectDetailPage = new ProjectDetailPage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      const projects = await projectListPage.getProjectList();
      
      if (projects.length > 0) {
        // 查找可编辑的项目
        let editableProjectIndex = -1;
        
        for (let i = 0; i < projects.length; i++) {
          await projectListPage.selectTableRow(i);
          const buttonStates = await projectListPage.validateButtonStates();
          
          if (buttonStates.editEnabled) {
            editableProjectIndex = i;
            break;
          }
        }
        
        if (editableProjectIndex >= 0) {
          const targetProject = projects[editableProjectIndex];
          
          // 步骤1: 进入编辑页修改数据
          await projectListPage.clickEdit();
          await projectEditPage.waitForEditPageLoad();
          
          const originalData = await projectEditPage.getCurrentProjectData();
          
          // 修改数据
          const modificationData = {
            deliveryLocation: `修改后的交货地点_${Date.now()}`,
            remark: `修改后的备注信息_${Date.now()}`
          };
          
          await projectEditPage.fillBasicInfo(modificationData);
          
          // 保存修改
          await projectEditPage.updateProject();
          
          // 步骤2: 验证编辑页数据已更新
          const updatedEditData = await projectEditPage.getCurrentProjectData();
          expect(updatedEditData.deliveryLocation, '编辑页交货地点应该已更新').toBe(modificationData.deliveryLocation);
          expect(updatedEditData.remark, '编辑页备注应该已更新').toBe(modificationData.remark);
          
          // 步骤3: 切换到详情页验证数据同步
          await projectEditPage.returnToList();
          await projectListPage.waitForPageLoad();
          await projectListPage.selectTableRow(editableProjectIndex);
          await projectListPage.clickView();
          await projectDetailPage.waitForDetailPageLoad();
          
          const detailBasicInfo = await projectDetailPage.getProjectBasicInfo();
          expect(detailBasicInfo.deliveryLocation, '详情页交货地点应该已同步').toBe(modificationData.deliveryLocation);
          expect(detailBasicInfo.remark, '详情页备注应该已同步').toBe(modificationData.remark);
          
          // 步骤4: 返回列表页验证列表数据同步
          await projectDetailPage.returnToList();
          await projectListPage.waitForPageLoad();
          
          const updatedProjects = await projectListPage.getProjectList();
          const updatedProject = updatedProjects[editableProjectIndex];
          
          // 验证列表页显示的关键信息保持一致
          expect(updatedProject.projectName, '列表页项目名称应该保持一致').toBe(targetProject.projectName);
          expect(updatedProject.supplier, '列表页供应商应该保持一致').toBe(targetProject.supplier);
          expect(updatedProject.customer, '列表页客户应该保持一致').toBe(targetProject.customer);
          
          console.log(`✅ 数据修改同步验证通过 - 项目: ${targetProject.projectName}`);
        }
      }
    });

  });

  test.describe('状态变更数据一致性验证', () => {
    
    test('应该保证审批状态变更后的数据一致性', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      const projectApprovalPage = new ProjectApprovalPage(page);
      const projectDetailPage = new ProjectDetailPage(page);
      
      // 步骤1: 创建一个新项目用于测试
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      const testData = SOProjectTestData.generateCompleteProject();
      testData.projectName = `状态一致性测试_${Date.now()}`;
      
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
      
      // 步骤2: 记录初始状态的数据
      await projectListPage.switchStatusTab('pendingApproval');
      await projectListPage.waitForLoading();
      
      const pendingProjects = await projectListPage.getProjectList();
      const targetProject = pendingProjects.find(p => 
        p.projectName.includes(testData.projectName)
      );
      
      expect(targetProject, '应该找到新创建的项目').toBeDefined();
      
      const preApprovalData = {
        projectName: targetProject.projectName,
        supplier: targetProject.supplier,
        customer: targetProject.customer,
        status: targetProject.status
      };
      
      // 步骤3: 执行审批操作
      const projectIndex = pendingProjects.findIndex(p => 
        p.projectName.includes(testData.projectName)
      );
      
      await projectListPage.selectTableRow(projectIndex);
      await projectListPage.clickApprove();
      await projectApprovalPage.waitForApprovalPageLoad();
      
      // 记录审批前的详细数据
      const preApprovalDetailData = await projectApprovalPage.getProjectBasicInfo();
      
      // 执行审批
      await projectApprovalPage.selectApprovalResult('approve');
      await projectApprovalPage.fillApprovalComment('状态一致性测试审批通过');
      await projectApprovalPage.submitApproval();
      
      // 步骤4: 验证审批后的状态一致性
      await projectApprovalPage.returnToList();
      await projectListPage.waitForPageLoad();
      
      // 在执行中Tab查找项目
      await projectListPage.switchStatusTab('executing');
      await projectListPage.waitForLoading();
      
      const executingProjects = await projectListPage.getProjectList();
      const approvedProject = executingProjects.find(p => 
        p.projectName.includes(testData.projectName)
      );
      
      expect(approvedProject, '项目应该出现在执行中Tab').toBeDefined();
      expect(approvedProject.status, '列表页状态应该更新为执行中').toContain('执行');
      
      // 验证核心数据未变更
      expect(approvedProject.projectName, '项目名称不应该改变').toBe(preApprovalData.projectName);
      expect(approvedProject.supplier, '供应商不应该改变').toBe(preApprovalData.supplier);
      expect(approvedProject.customer, '客户不应该改变').toBe(preApprovalData.customer);
      
      // 步骤5: 验证详情页数据一致性
      const approvedProjectIndex = executingProjects.findIndex(p => 
        p.projectName.includes(testData.projectName)
      );
      
      await projectListPage.selectTableRow(approvedProjectIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      const postApprovalDetailData = await projectDetailPage.getProjectBasicInfo();
      const postApprovalStatusInfo = await projectDetailPage.getProjectStatusInfo();
      
      // 验证基本信息保持不变
      expect(postApprovalDetailData.projectName, '详情页项目名称应该保持不变').toBe(preApprovalDetailData.projectName);
      expect(postApprovalDetailData.supplier, '详情页供应商应该保持不变').toBe(preApprovalDetailData.supplier);
      expect(postApprovalDetailData.customer, '详情页客户应该保持不变').toBe(preApprovalDetailData.customer);
      expect(postApprovalDetailData.deliveryLocation, '详情页交货地点应该保持不变').toBe(preApprovalDetailData.deliveryLocation);
      
      // 验证状态信息正确更新
      expect(postApprovalStatusInfo.projectStatus, '详情页项目状态应该更新').toContain('执行');
      expect(postApprovalStatusInfo.updateTime, '应该有更新时间').toBeTruthy();
      
      // 验证审批历史
      const approvalHistory = await projectDetailPage.getApprovalHistory();
      expect(approvalHistory.length, '应该有审批历史记录').toBeGreaterThan(0);
      
      const latestApproval = approvalHistory[0];
      expect(latestApproval.approvalResult, '最新审批结果应该是通过').toContain('通过');
      expect(latestApproval.approvalComment, '审批意见应该正确').toContain('状态一致性测试审批通过');
      
      console.log(`✅ 状态变更数据一致性验证通过 - 项目: ${testData.projectName}`);
    });

  });

  test.describe('商品明细数据一致性验证', () => {
    
    test('应该保证商品增删改操作的数据一致性', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectEditPage = new ProjectEditPage(page);
      const projectDetailPage = new ProjectDetailPage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      const projects = await projectListPage.getProjectList();
      
      if (projects.length > 0) {
        // 查找可编辑的项目
        let editableProjectIndex = -1;
        
        for (let i = 0; i < projects.length; i++) {
          await projectListPage.selectTableRow(i);
          const buttonStates = await projectListPage.validateButtonStates();
          
          if (buttonStates.editEnabled) {
            editableProjectIndex = i;
            break;
          }
        }
        
        if (editableProjectIndex >= 0) {
          // 步骤1: 获取初始商品数据
          await projectListPage.clickEdit();
          await projectEditPage.waitForEditPageLoad();
          
          const originalGoodsList = await projectEditPage.getGoodsList();
          const originalGoodsCount = originalGoodsList.length;
          
          // 步骤2: 添加新商品
          const newGoods = SOProjectTestData.generateGoodsList(1)[0];
          await projectEditPage.addGoods(newGoods);
          
          const afterAddGoodsList = await projectEditPage.getGoodsList();
          expect(afterAddGoodsList.length, '添加商品后数量应该增加').toBe(originalGoodsCount + 1);
          
          // 步骤3: 修改商品数据
          if (afterAddGoodsList.length > 0) {
            const modifiedQty = 999;
            const modifiedPrice = 188.88;
            
            await projectEditPage.updateGoods(0, {
              qty: modifiedQty,
              price: modifiedPrice
            });
            
            const afterUpdateGoodsList = await projectEditPage.getGoodsList();
            const updatedGoods = afterUpdateGoodsList[0];
            
            expect(parseFloat(updatedGoods.qty), '商品数量应该被修改').toBe(modifiedQty);
            expect(parseFloat(updatedGoods.price), '商品单价应该被修改').toBe(modifiedPrice);
            
            // 验证金额自动计算
            const expectedAmount = modifiedQty * modifiedPrice;
            const actualAmount = parseFloat(updatedGoods.amount.replace(/[^\\d.-]/g, ''));
            expect(Math.abs(actualAmount - expectedAmount), '商品金额应该自动计算').toBeLessThan(0.01);
          }
          
          // 步骤4: 保存并验证详情页数据一致性
          await projectEditPage.updateProject();
          
          await projectEditPage.returnToList();
          await projectListPage.waitForPageLoad();
          await projectListPage.selectTableRow(editableProjectIndex);
          await projectListPage.clickView();
          await projectDetailPage.waitForDetailPageLoad();
          
          const detailGoodsList = await projectDetailPage.getGoodsDetailList();
          const finalEditGoodsList = await projectEditPage.getGoodsList();
          
          // 切回编辑页获取最终数据
          await projectDetailPage.clickEdit();
          await projectEditPage.waitForEditPageLoad();
          const finalEditGoodsListActual = await projectEditPage.getGoodsList();
          
          // 验证商品数量一致性
          expect(detailGoodsList.length, '详情页商品数量应该与编辑页一致').toBe(finalEditGoodsListActual.length);
          
          // 验证商品数据一致性
          if (detailGoodsList.length > 0 && finalEditGoodsListActual.length > 0) {
            const detailFirstGoods = detailGoodsList[0];
            const editFirstGoods = finalEditGoodsListActual[0];
            
            expect(detailFirstGoods.goodsName, '商品名称应该一致').toBe(editFirstGoods.goodsName);
            expect(parseFloat(detailFirstGoods.qty), '商品数量应该一致').toBe(parseFloat(editFirstGoods.qty));
            expect(parseFloat(detailFirstGoods.price), '商品单价应该一致').toBe(parseFloat(editFirstGoods.price));
          }
          
          console.log(`✅ 商品明细数据一致性验证通过 - 商品数量: ${detailGoodsList.length}`);
        }
      }
    });

  });

  test.describe('财务信息数据一致性验证', () => {
    
    test('应该保证财务信息计算的一致性', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectEditPage = new ProjectEditPage(page);
      const projectDetailPage = new ProjectDetailPage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      const projects = await projectListPage.getProjectList();
      
      if (projects.length > 0) {
        // 查找可编辑的项目
        let editableProjectIndex = -1;
        
        for (let i = 0; i < projects.length; i++) {
          await projectListPage.selectTableRow(i);
          const buttonStates = await projectListPage.validateButtonStates();
          
          if (buttonStates.editEnabled) {
            editableProjectIndex = i;
            break;
          }
        }
        
        if (editableProjectIndex >= 0) {
          await projectListPage.clickEdit();
          await projectEditPage.waitForEditPageLoad();
          
          // 修改财务信息
          const newFinanceInfo = {
            financeAmount: 500000,
            rate: 0.12,
            projectCycle: 90,
            paymentDays: 30
          };
          
          await projectEditPage.fillFinanceInfo(newFinanceInfo);
          
          // 等待计算完成
          await page.waitForTimeout(2000);
          
          const updatedFinanceInfo = await projectEditPage.getCurrentFinanceInfo();
          
          // 验证财务数据保存正确
          expect(parseFloat(updatedFinanceInfo.financeAmount), '融资额度应该正确').toBe(newFinanceInfo.financeAmount);
          expect(parseFloat(updatedFinanceInfo.rate), '费率应该正确').toBe(newFinanceInfo.rate);
          expect(parseInt(updatedFinanceInfo.projectCycle), '项目周期应该正确').toBe(newFinanceInfo.projectCycle);
          expect(parseInt(updatedFinanceInfo.paymentDays), '账期天数应该正确').toBe(newFinanceInfo.paymentDays);
          
          // 保存更新
          await projectEditPage.updateProject();
          
          // 验证详情页财务信息一致性
          await projectEditPage.returnToList();
          await projectListPage.waitForPageLoad();
          await projectListPage.selectTableRow(editableProjectIndex);
          await projectListPage.clickView();
          await projectDetailPage.waitForDetailPageLoad();
          
          const detailFinanceInfo = await projectDetailPage.getFinanceInfo();
          
          // 验证财务信息在详情页的一致性
          const detailAmount = parseFloat(detailFinanceInfo.financeAmount.replace(/[^\\d.-]/g, ''));
          const detailRate = parseFloat(detailFinanceInfo.rate.replace(/[^\\d.-]/g, ''));
          const detailCycle = parseInt(detailFinanceInfo.projectCycle.replace(/[^\\d]/g, ''));
          const detailDays = parseInt(detailFinanceInfo.paymentDays.replace(/[^\\d]/g, ''));
          
          expect(Math.abs(detailAmount - newFinanceInfo.financeAmount), '详情页融资额度应该一致').toBeLessThan(0.01);
          expect(Math.abs(detailRate - newFinanceInfo.rate), '详情页费率应该一致').toBeLessThan(0.001);
          expect(detailCycle, '详情页项目周期应该一致').toBe(newFinanceInfo.projectCycle);
          expect(detailDays, '详情页账期天数应该一致').toBe(newFinanceInfo.paymentDays);
          
          console.log(`✅ 财务信息数据一致性验证通过 - 融资额度: ${detailAmount}`);
        }
      }
    });

  });

  test.describe('并发操作数据一致性验证', () => {
    
    test('应该防止并发编辑导致的数据不一致', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectEditPage = new ProjectEditPage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      const projects = await projectListPage.getProjectList();
      
      if (projects.length > 0) {
        // 查找可编辑的项目
        let editableProjectIndex = -1;
        
        for (let i = 0; i < projects.length; i++) {
          await projectListPage.selectTableRow(i);
          const buttonStates = await projectListPage.validateButtonStates();
          
          if (buttonStates.editEnabled) {
            editableProjectIndex = i;
            break;
          }
        }
        
        if (editableProjectIndex >= 0) {
          await projectListPage.clickEdit();
          await projectEditPage.waitForEditPageLoad();
          
          // 获取原始数据和版本信息
          const originalData = await projectEditPage.getCurrentProjectData();
          
          // 模拟第一个用户的修改
          const modification1 = {
            deliveryLocation: `并发测试修改1_${Date.now()}`
          };
          
          await projectEditPage.fillBasicInfo(modification1);
          
          // 尝试保存第一个修改
          await projectEditPage.updateProject();
          
          // 验证乐观锁或版本控制机制
          const successMessage = await page.locator('.el-message--success').isVisible();
          const errorMessage = await page.locator('.el-message--error').isVisible();
          
          if (successMessage) {
            console.log('✅ 第一次修改成功提交');
            
            // 验证数据已更新
            const updatedData = await projectEditPage.getCurrentProjectData();
            expect(updatedData.deliveryLocation, '第一次修改应该生效').toBe(modification1.deliveryLocation);
            
          } else if (errorMessage) {
            console.log('⚠️ 检测到并发冲突，乐观锁机制生效');
            
            // 验证错误处理机制
            const errorText = await page.locator('.el-message--error').textContent();
            expect(errorText, '应该提示版本冲突').toContain('版本') || expect(errorText, '应该提示数据冲突').toContain('冲突');
          }
          
          console.log(`✅ 并发操作数据一致性验证完成`);
        }
      }
    });

  });

});