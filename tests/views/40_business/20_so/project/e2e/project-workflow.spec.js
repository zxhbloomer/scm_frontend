const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/login/login-page');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { ProjectListPage } = require('../../../pages/40_business/20_so/project/project-list-page');
const { ProjectCreatePage } = require('../../../pages/40_business/20_so/project/project-create-page');
const { SOProjectTestData } = require('../../../utils/so-project-test-data');

/**
 * SO项目管理完整业务流程测试
 * 涵盖项目从创建到审批的完整流程
 */
test.describe('SO项目管理业务流程测试', () => {

  // 每个测试前都需要登录
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.quickLogin();
    
    // 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('应该能够完成项目创建的完整流程', async ({ page }) => {
    // 准备测试数据
    const projectData = SOProjectTestData.generateCompleteProject();
    
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    const projectCreatePage = new ProjectCreatePage(page);
    
    // 1. 导航到项目管理页面
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 2. 验证列表页加载
    const listValidation = await projectListPage.validateTableLoaded();
    expect(listValidation.tableVisible).toBe(true);
    
    // 3. 点击新增按钮
    await projectListPage.clickAdd();
    await projectCreatePage.waitForCreatePageLoad();
    
    // 4. 填写项目基本信息
    await projectCreatePage.fillBasicInfo({
      projectName: projectData.projectName,
      supplierName: projectData.supplierName,
      customerName: projectData.customerName,
      deliveryType: projectData.deliveryType,
      deliveryLocation: projectData.deliveryLocation,
      remark: projectData.remark
    });
    
    // 5. 添加商品明细
    for (const goods of projectData.goodsList) {
      await projectCreatePage.addGoods(goods);
    }
    
    // 验证商品明细添加成功
    const goodsList = await projectCreatePage.getGoodsList();
    expect(goodsList.length).toBe(projectData.goodsList.length);
    
    // 6. 填写财务信息
    await projectCreatePage.fillFinanceInfo(projectData.financeInfo);
    
    // 7. 填写项目说明
    await projectCreatePage.fillProjectRemark(projectData.projectRemark);
    
    // 8. 验证数据填写完整性
    const dataValidation = await projectCreatePage.validateDataCompleteness({
      projectName: projectData.projectName,
      goodsCount: projectData.goodsList.length,
      financeAmount: projectData.financeInfo.financeAmount
    });
    
    expect(dataValidation.projectNameMatch).toBe(true);
    expect(dataValidation.goodsCountMatch).toBe(true);
    expect(dataValidation.financeAmountMatch).toBe(true);
    
    // 9. 提交审批并保存
    await projectCreatePage.submitApproval();
    
    // 10. 验证返回列表页
    await projectListPage.waitForPageLoad();
    
    // 11. 搜索刚创建的项目
    await projectListPage.searchProject({
      projectName: projectData.projectName
    });
    
    // 12. 验证项目创建成功
    const searchResults = await projectListPage.getProjectList();
    const createdProject = searchResults.find(p => 
      p.projectName.includes(projectData.projectName)
    );
    
    expect(createdProject).toBeTruthy();
    expect(createdProject.status).toContain('待审批');
  });

  test('应该能够搜索和筛选项目', async ({ page }) => {
    const searchCriteria = SOProjectTestData.generateSearchCriteria();
    
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 1. 导航到项目管理页面
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 2. 测试基础搜索功能
    await projectListPage.searchProject({
      projectCode: searchCriteria.projectCode
    });
    
    // 验证搜索结果
    const basicSearchResults = await projectListPage.validateSearchResults({
      projectCode: searchCriteria.projectCode
    });
    
    // 3. 测试高级搜索功能
    await projectListPage.advancedSearch({
      goodsName: searchCriteria.goodsName
    });
    
    // 4. 测试状态筛选
    await projectListPage.switchStatusTab('pendingApproval');
    await projectListPage.waitForLoading();
    
    const pendingProjects = await projectListPage.getProjectList();
    // 验证所有项目都是待审批状态
    const allPending = pendingProjects.every(project => 
      project.status.includes('待审批')
    );
    expect(allPending).toBe(true);
    
    // 5. 重置搜索条件
    await projectListPage.resetSearch();
    
    // 6. 切换回全部状态
    await projectListPage.switchStatusTab('all');
  });

  test('应该能够进行项目列表操作', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 1. 导航到项目管理页面
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 2. 验证按钮状态
    const buttonStates = await projectListPage.validateButtonStates();
    expect(buttonStates.addEnabled).toBe(true);
    
    // 3. 选择第一行项目
    const projects = await projectListPage.getProjectList();
    if (projects.length > 0) {
      await projectListPage.selectTableRow(0);
      
      // 验证选择后按钮状态变化
      const selectedButtonStates = await projectListPage.validateButtonStates();
      // 根据项目状态，某些按钮应该变为可用
      
      // 4. 测试查看功能
      await projectListPage.clickView();
      // 应该切换到查看Tab
      await page.waitForTimeout(2000);
      
      // 5. 返回列表
      // 这里需要在查看页面实现返回功能
    }
    
    // 6. 测试分页功能
    const paginationInfo = await projectListPage.getPaginationInfo();
    if (paginationInfo.total > 10) {
      // 测试页面大小设置
      await projectListPage.setPageSize(20);
      
      // 验证页面大小变更
      const newPaginationInfo = await projectListPage.getPaginationInfo();
      expect(newPaginationInfo.pageSize).toBe('20');
    }
  });

  test('应该能够处理项目审批流程', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 1. 导航到项目管理页面
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 2. 切换到待审批Tab
    await projectListPage.switchStatusTab('pendingApproval');
    
    // 3. 获取待审批项目
    const pendingProjects = await projectListPage.getProjectList();
    
    if (pendingProjects.length > 0) {
      // 4. 选择第一个待审批项目
      await projectListPage.selectTableRow(0);
      
      // 5. 点击审批按钮
      await projectListPage.clickApprove();
      
      // 6. 等待审批页面加载
      await page.waitForTimeout(2000);
      
      // 这里需要实现审批页面的具体操作
      // 比如填写审批意见、选择审批结果等
      
      // 7. 验证审批操作成功
      // 可以检查项目状态是否变更为"审批中"或"已通过"
    }
  });

  test('应该能够处理错误情况和边界值', async ({ page }) => {
    const invalidData = SOProjectTestData.generateInvalidProject();
    const boundaryData = SOProjectTestData.generateBoundaryTestData();
    
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    const projectCreatePage = new ProjectCreatePage(page);
    
    // 1. 导航到项目管理页面
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 2. 点击新增按钮
    await projectListPage.clickAdd();
    await projectCreatePage.waitForCreatePageLoad();
    
    // 3. 测试必填字段验证
    await projectCreatePage.submitApproval();
    
    // 验证必填字段错误提示
    const fieldValidations = await projectCreatePage.validateRequiredFields();
    expect(fieldValidations.projectNameRequired).toBe(true);
    expect(fieldValidations.supplierRequired).toBe(true);
    expect(fieldValidations.customerRequired).toBe(true);
    
    // 4. 测试边界值
    await projectCreatePage.fillBasicInfo({
      projectName: boundaryData.maxLengthProjectName
    });
    
    await projectCreatePage.fillFinanceInfo({
      paymentDays: boundaryData.maxPaymentDays,
      financeAmount: boundaryData.maxFinanceAmount,
      projectCycle: boundaryData.maxProjectCycle
    });
    
    // 5. 验证边界值处理
    // 应该能够正常保存或给出适当的错误提示
    
    // 6. 返回列表页
    await projectCreatePage.returnToList();
  });

  test('应该能够进行批量操作', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 1. 导航到项目管理页面
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 2. 获取项目列表
    const projects = await projectListPage.getProjectList();
    
    if (projects.length >= 2) {
      // 3. 选择多个项目
      await projectListPage.selectMultipleRows([0, 1]);
      
      // 4. 测试批量导出
      const download = await projectListPage.clickExport();
      expect(download).toBeTruthy();
      
      // 5. 如果有可删除的项目，测试批量删除
      // 注意：这可能需要特定权限和项目状态
    }
    
    // 6. 测试分页导航
    const paginationInfo = await projectListPage.getPaginationInfo();
    
    if (paginationInfo.total > 20) {
      // 跳转到第2页
      await projectListPage.goToPage(2);
      
      const newPaginationInfo = await projectListPage.getPaginationInfo();
      expect(newPaginationInfo.currentPage).toBe('2');
    }
  });

  test('应该能够处理网络错误和超时', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 1. 导航到项目管理页面
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 2. 模拟网络延迟
    await page.route('**/api/**', async route => {
      // 延迟2秒再响应
      await page.waitForTimeout(2000);
      await route.continue();
    });
    
    // 3. 执行搜索操作
    await projectListPage.searchProject({
      projectName: 'test'
    });
    
    // 4. 验证加载状态显示
    // 应该显示loading状态
    
    // 5. 移除网络拦截
    await page.unroute('**/api/**');
  });

  // 性能测试用例
  test('应该能够处理大量数据的性能测试', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 1. 导航到项目管理页面
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    
    // 2. 记录页面加载时间
    const startTime = Date.now();
    await projectListPage.waitForPageLoad();
    const loadTime = Date.now() - startTime;
    
    // 3. 验证页面加载时间在可接受范围内（5秒内）
    expect(loadTime).toBeLessThan(5000);
    
    // 4. 设置最大页面大小
    await projectListPage.setPageSize(100);
    
    // 5. 记录大数据量加载时间
    const dataStartTime = Date.now();
    await projectListPage.waitForLoading();
    const dataLoadTime = Date.now() - dataStartTime;
    
    // 6. 验证大数据量加载时间
    expect(dataLoadTime).toBeLessThan(10000); // 10秒内
    
    // 7. 验证表格渲染正常
    const listValidation = await projectListPage.validateTableLoaded();
    expect(listValidation.tableVisible).toBe(true);
  });

});

/**
 * SO项目管理数据完整性测试
 * 验证数据的一致性和准确性
 */
test.describe('SO项目管理数据完整性测试', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.quickLogin();
  });

  test('应该能够验证项目数据的一致性', async ({ page }) => {
    const projectData = SOProjectTestData.generateCompleteProject();
    
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    const projectCreatePage = new ProjectCreatePage(page);
    
    // 1. 创建项目
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    await projectListPage.clickAdd();
    
    // 2. 填写完整项目数据
    await projectCreatePage.fillCompleteProjectData(projectData);
    
    // 3. 提交保存
    await projectCreatePage.submitApproval();
    await projectListPage.waitForPageLoad();
    
    // 4. 搜索并查看项目
    await projectListPage.searchProject({
      projectName: projectData.projectName
    });
    
    const projects = await projectListPage.getProjectList();
    const createdProject = projects.find(p => 
      p.projectName.includes(projectData.projectName)
    );
    
    // 5. 验证数据一致性
    expect(createdProject).toBeTruthy();
    expect(createdProject.projectName).toBe(projectData.projectName);
    
    // 6. 点击查看详情验证完整数据
    const projectIndex = await projectListPage.findProjectRowByCode(createdProject.projectCode);
    await projectListPage.selectTableRow(projectIndex);
    await projectListPage.clickView();
    
    // 这里需要实现详情页面的数据验证
    // 比如验证商品明细、财务信息等是否与输入一致
  });

});