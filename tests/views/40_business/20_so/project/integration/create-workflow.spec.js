const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pom/login/login-page');
const { DashboardPage } = require('../../../../pom/dashboard/dashboard-page');
const { ProjectListPage } = require('../../../../pom/40_business/20_so/project/project-list-page');
const { ProjectCreatePage } = require('../../../../pom/40_business/20_so/project/project-create-page');
const { ProjectDetailPage } = require('../../../../pom/40_business/20_so/project/project-detail-page');
const { SOProjectTestData } = require('../../../../utils/so-project-test-data');

/**
 * SO项目管理创建工作流程集成测试
 * 使用Playwright + 真实API数据
 * 
 * 测试范围：
 * - 完整的项目创建工作流程
 * - 跨页面数据流转验证
 * - 业务流程端到端验证
 * - 数据持久化验证
 */
test.describe('SO项目管理 - 创建工作流程集成测试', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.quickLogin();
    
    // 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test.describe('完整创建工作流程', () => {
    
    test('应该完成从列表页到创建完成的完整流程', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      const projectDetailPage = new ProjectDetailPage(page);
      
      // 步骤1: 导航到项目管理列表页
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      // 记录初始项目数量
      const initialProjects = await projectListPage.getProjectList();
      const initialCount = initialProjects.length;
      
      // 步骤2: 点击新增按钮进入创建页
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      // 验证页面切换成功
      const currentTab = await page.locator('.el-tabs__item.is-active').textContent();
      expect(currentTab, '应该切换到新建Tab').toContain('新建');
      
      // 步骤3: 填写完整的项目信息
      const testData = SOProjectTestData.generateCompleteProject();
      
      // 填写基本信息
      await projectCreatePage.fillBasicInfo({
        projectName: testData.projectName,
        supplierName: testData.supplierName,
        customerName: testData.customerName,
        deliveryType: testData.deliveryType,
        deliveryLocation: testData.deliveryLocation,
        remark: testData.remark
      });
      
      // 添加商品明细
      for (const goods of testData.goodsList) {
        await projectCreatePage.addGoods(goods);
        
        // 验证商品添加成功
        const currentGoods = await projectCreatePage.getGoodsList();
        expect(currentGoods.length, '商品应该被成功添加').toBeGreaterThan(0);
      }
      
      // 填写财务信息
      await projectCreatePage.fillFinanceInfo(testData.financeInfo);
      
      // 填写项目说明
      if (testData.projectRemark) {
        await projectCreatePage.fillProjectRemark(testData.projectRemark);
      }
      
      // 步骤4: 提交创建
      await projectCreatePage.submitApproval();
      
      // 验证创建成功消息
      const successMessage = await page.locator('.el-message--success').textContent();
      expect(successMessage, '应该显示创建成功消息').toContain('成功');
      
      // 步骤5: 验证返回列表页后的数据
      await projectListPage.waitForPageLoad();
      
      // 验证项目数量增加
      const updatedProjects = await projectListPage.getProjectList();
      expect(updatedProjects.length, '项目数量应该增加').toBe(initialCount + 1);
      
      // 查找新创建的项目
      const newProject = updatedProjects.find(p => 
        p.projectName.includes(testData.projectName)
      );
      
      expect(newProject, '应该找到新创建的项目').toBeDefined();
      expect(newProject.supplier, '供应商信息应该正确').toContain(testData.supplierName);
      expect(newProject.customer, '客户信息应该正确').toContain(testData.customerName);
      expect(newProject.status, '初始状态应该是待审批').toContain('待审批');
      
      // 步骤6: 验证详情页数据完整性
      const projectIndex = updatedProjects.findIndex(p => 
        p.projectName.includes(testData.projectName)
      );
      
      await projectListPage.selectTableRow(projectIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 验证详情页基本信息
      const detailBasicInfo = await projectDetailPage.getProjectBasicInfo();
      expect(detailBasicInfo.projectName, '详情页项目名称应该一致').toContain(testData.projectName);
      expect(detailBasicInfo.supplier, '详情页供应商应该一致').toContain(testData.supplierName);
      expect(detailBasicInfo.customer, '详情页客户应该一致').toContain(testData.customerName);
      expect(detailBasicInfo.deliveryLocation, '详情页交货地点应该一致').toContain(testData.deliveryLocation);
      
      // 验证商品明细
      const detailGoodsList = await projectDetailPage.getGoodsDetailList();
      expect(detailGoodsList.length, '详情页商品数量应该一致').toBe(testData.goodsList.length);
      
      // 验证财务信息
      const detailFinanceInfo = await projectDetailPage.getFinanceInfo();
      const expectedAmount = parseFloat(testData.financeInfo.financeAmount);
      const actualAmount = parseFloat(detailFinanceInfo.financeAmount.replace(/[^\\d.-]/g, ''));
      expect(Math.abs(actualAmount - expectedAmount), '详情页融资额度应该一致').toBeLessThan(0.01);
      
      // 验证项目状态信息
      const statusInfo = await projectDetailPage.getProjectStatusInfo();
      expect(statusInfo.projectStatus, '项目状态应该是待审批').toContain('待审批');
      expect(statusInfo.createTime, '应该有创建时间').toBeTruthy();
      expect(statusInfo.createUser, '应该有创建人').toBeTruthy();
      
      console.log(`✅ 项目创建工作流程测试完成 - 项目名称: ${testData.projectName}`);
    });

    test('应该处理创建过程中的数据验证错误', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      // 测试不完整数据提交
      const incompleteData = {
        projectName: '测试项目_不完整数据',
        // 故意不填写供应商和客户
      };
      
      await projectCreatePage.fillBasicInfo(incompleteData);
      
      // 尝试提交
      await projectCreatePage.submitApprovalButton.click();
      
      // 验证错误提示
      const errorMessages = await page.locator('.el-form-item__error').allTextContents();
      expect(errorMessages.length, '应该显示验证错误').toBeGreaterThan(0);
      
      // 修正数据并重新提交
      const completeData = SOProjectTestData.generateBasicProject();
      await projectCreatePage.fillBasicInfo({
        supplierName: completeData.supplierName,
        customerName: completeData.customerName
      });
      
      // 添加必要的商品和财务信息
      await projectCreatePage.addGoods(SOProjectTestData.generateGoodsList(1)[0]);
      await projectCreatePage.fillFinanceInfo(SOProjectTestData.generateFinanceInfo());
      
      // 重新提交
      await projectCreatePage.submitApproval();
      
      // 验证修正后提交成功
      const successMessage = await page.locator('.el-message--success').textContent();
      expect(successMessage, '修正后应该提交成功').toContain('成功');
    });

    test('应该支持创建过程中的数据暂存', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      // 填写部分数据
      const partialData = {
        projectName: '测试项目_暂存数据',
        deliveryLocation: '测试暂存地点'
      };
      
      await projectCreatePage.fillBasicInfo(partialData);
      
      // 保存草稿（如果有保存草稿功能）
      if (await projectCreatePage.saveDraftButton.isVisible()) {
        await projectCreatePage.saveDraftButton.click();
        await projectCreatePage.waitForSuccess();
        
        // 切换到列表页再回来，验证数据是否保存
        await projectCreatePage.returnToList();
        await projectListPage.waitForPageLoad();
        await projectListPage.clickAdd();
        await projectCreatePage.waitForCreatePageLoad();
        
        // 验证数据是否恢复
        const restoredName = await projectCreatePage.projectNameInput.inputValue();
        const restoredLocation = await projectCreatePage.deliveryLocationInput.inputValue();
        
        expect(restoredName, '项目名称应该被恢复').toBe(partialData.projectName);
        expect(restoredLocation, '交货地点应该被恢复').toBe(partialData.deliveryLocation);
      }
    });

  });

  test.describe('批量创建工作流程', () => {
    
    test('应该支持快速创建多个相似项目', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      
      const initialCount = (await projectListPage.getProjectList()).length;
      const projectsToCreate = 3;
      const createdProjects = [];
      
      // 创建多个项目
      for (let i = 0; i < projectsToCreate; i++) {
        const testData = SOProjectTestData.generateCompleteProject();
        testData.projectName = `批量创建测试项目_${i + 1}_${Date.now()}`;
        
        // 进入创建页
        await projectListPage.clickAdd();
        await projectCreatePage.waitForCreatePageLoad();
        
        // 填写项目信息
        await projectCreatePage.fillBasicInfo({
          projectName: testData.projectName,
          supplierName: testData.supplierName,
          customerName: testData.customerName,
          deliveryLocation: testData.deliveryLocation
        });
        
        await projectCreatePage.addGoods(testData.goodsList[0]);
        await projectCreatePage.fillFinanceInfo(testData.financeInfo);
        
        // 提交创建
        await projectCreatePage.submitApproval();
        await projectListPage.waitForPageLoad();
        
        createdProjects.push(testData.projectName);
        
        console.log(`✅ 第${i + 1}个项目创建完成: ${testData.projectName}`);
      }
      
      // 验证所有项目都创建成功
      const finalProjects = await projectListPage.getProjectList();
      expect(finalProjects.length, '项目总数应该增加').toBe(initialCount + projectsToCreate);
      
      // 验证每个项目都能在列表中找到
      for (const projectName of createdProjects) {
        const foundProject = finalProjects.find(p => 
          p.projectName.includes(projectName.split('_')[0])
        );
        expect(foundProject, `应该找到项目: ${projectName}`).toBeDefined();
      }
    });

  });

  test.describe('创建工作流程性能验证', () => {
    
    test('应该在合理时间内完成项目创建', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      
      const startTime = Date.now();
      
      // 执行完整创建流程
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      const testData = SOProjectTestData.generateCompleteProject();
      
      await projectCreatePage.fillBasicInfo({
        projectName: testData.projectName,
        supplierName: testData.supplierName,
        customerName: testData.customerName,
        deliveryLocation: testData.deliveryLocation
      });
      
      await projectCreatePage.addGoods(testData.goodsList[0]);
      await projectCreatePage.fillFinanceInfo(testData.financeInfo);
      await projectCreatePage.submitApproval();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 验证性能（整个创建流程应该在30秒内完成）
      expect(duration, '创建工作流程应该在合理时间内完成').toBeLessThan(30000);
      
      console.log(`创建工作流程性能测试完成，耗时: ${duration}ms`);
    });

    test('应该验证大数据量商品的创建性能', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const projectListPage = new ProjectListPage(page);
      const projectCreatePage = new ProjectCreatePage(page);
      
      await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
      await projectListPage.waitForPageLoad();
      await projectListPage.clickAdd();
      await projectCreatePage.waitForCreatePageLoad();
      
      const testData = SOProjectTestData.generateCompleteProject();
      const manyGoods = SOProjectTestData.generateGoodsList(20); // 20个商品
      
      // 填写基本信息
      await projectCreatePage.fillBasicInfo({
        projectName: testData.projectName,
        supplierName: testData.supplierName,
        customerName: testData.customerName
      });
      
      // 测试大量商品添加性能
      const goodsStartTime = Date.now();
      
      for (const goods of manyGoods) {
        await projectCreatePage.addGoods(goods);
      }
      
      const goodsEndTime = Date.now();
      const goodsDuration = goodsEndTime - goodsStartTime;
      
      // 填写财务信息
      await projectCreatePage.fillFinanceInfo(testData.financeInfo);
      
      // 提交项目
      const submitStartTime = Date.now();
      await projectCreatePage.submitApproval();
      const submitEndTime = Date.now();
      const submitDuration = submitEndTime - submitStartTime;
      
      // 验证商品添加性能（20个商品应该在60秒内完成）
      expect(goodsDuration, '大量商品添加性能应该可接受').toBeLessThan(60000);
      
      // 验证提交性能（应该在15秒内完成）
      expect(submitDuration, '大数据量项目提交性能应该可接受').toBeLessThan(15000);
      
      console.log(`大数据量创建测试完成 - 商品添加耗时: ${goodsDuration}ms, 提交耗时: ${submitDuration}ms`);
    });

  });

});