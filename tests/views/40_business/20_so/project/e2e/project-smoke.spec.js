const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/login/login-page');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page');
const { ProjectListPage } = require('../../../pages/40_business/20_so/project/project-list-page');
const { ProjectCreatePage } = require('../../../pages/40_business/20_so/project/project-create-page');
const { SOProjectTestData } = require('../../../utils/so-project-test-data');

/**
 * SO项目管理冒烟测试
 * 验证核心功能的基本可用性
 */
test.describe('SO项目管理冒烟测试', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.quickLogin();
  });

  test('应该能够访问项目管理页面', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    
    // 验证页面加载
    await projectListPage.waitForPageLoad();
    const validation = await projectListPage.validateTableLoaded();
    
    expect(validation.tableVisible).toBe(true);
    expect(validation.rowCount).toBeGreaterThanOrEqual(0);
  });

  test('应该能够打开新增项目页面', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    const projectCreatePage = new ProjectCreatePage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 点击新增按钮
    await projectListPage.clickAdd();
    
    // 验证新增页面加载
    await projectCreatePage.waitForCreatePageLoad();
    
    // 验证必要表单元素存在
    expect(await projectCreatePage.projectNameInput.isVisible()).toBe(true);
    expect(await projectCreatePage.supplierSearchInput.isVisible()).toBe(true);
    expect(await projectCreatePage.customerSearchInput.isVisible()).toBe(true);
    expect(await projectCreatePage.submitApprovalButton.isVisible()).toBe(true);
  });

  test('应该能够进行基础搜索', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 执行搜索
    await projectListPage.searchProject({
      projectCode: 'TEST'
    });
    
    // 验证搜索执行成功（不报错即可）
    const validation = await projectListPage.validateTableLoaded();
    expect(validation.tableVisible).toBe(true);
  });

  test('应该能够切换状态Tab', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 切换到待审批Tab
    await projectListPage.switchStatusTab('pendingApproval');
    
    // 验证切换成功
    const validation = await projectListPage.validateTableLoaded();
    expect(validation.tableVisible).toBe(true);
  });

  test('应该能够验证操作按钮状态', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 验证按钮状态
    const buttonStates = await projectListPage.validateButtonStates();
    
    // 新增按钮应该始终可用
    expect(buttonStates.addEnabled).toBe(true);
    
    // 其他按钮状态取决于是否选中项目
    expect(typeof buttonStates.editEnabled).toBe('boolean');
    expect(typeof buttonStates.deleteEnabled).toBe('boolean');
    expect(typeof buttonStates.viewEnabled).toBe('boolean');
  });

  test('应该能够处理基础分页', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 获取分页信息
    const paginationInfo = await projectListPage.getPaginationInfo();
    
    // 验证分页信息结构
    expect(typeof paginationInfo.total).toBe('number');
    expect(typeof paginationInfo.currentPage).toBe('string');
    
    // 如果有数据，验证分页功能
    if (paginationInfo.total > 10) {
      await projectListPage.setPageSize(20);
      await projectListPage.waitForLoading();
      
      const newInfo = await projectListPage.getPaginationInfo();
      expect(newInfo.pageSize).toBe('20');
    }
  });

  test('应该能够测试表格基础交互', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 获取项目列表
    const projects = await projectListPage.getProjectList();
    
    if (projects.length > 0) {
      // 选择第一行
      await projectListPage.selectTableRow(0);
      
      // 验证选择成功（不报错即可）
      const buttonStates = await projectListPage.validateButtonStates();
      
      // 选中后某些按钮状态可能会改变
      expect(typeof buttonStates.editEnabled).toBe('boolean');
    }
  });

  test('应该能够验证响应性能', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 记录开始时间
    const startTime = Date.now();
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 记录结束时间
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // 验证页面加载时间在合理范围内（10秒内）
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`项目管理页面加载时间: ${loadTime}ms`);
  });

  test('应该能够验证必要UI元素的存在', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 验证关键UI元素存在
    expect(await projectListPage.projectCodeInput.isVisible()).toBe(true);
    expect(await projectListPage.projectNameInput.isVisible()).toBe(true);
    expect(await projectListPage.searchButton.isVisible()).toBe(true);
    expect(await projectListPage.addButton.isVisible()).toBe(true);
    expect(await projectListPage.projectTable.isVisible()).toBe(true);
    expect(await projectListPage.pagination.isVisible()).toBe(true);
    
    // 验证状态Tab存在
    expect(await projectListPage.allTab.isVisible()).toBe(true);
    expect(await projectListPage.pendingApprovalTab.isVisible()).toBe(true);
  });

  test('应该能够验证数据格式的正确性', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectListPage = new ProjectListPage(page);
    
    // 导航到项目管理
    await dashboardPage.navigateToMenu('业务管理 > SO管理 > 项目管理');
    await projectListPage.waitForPageLoad();
    
    // 获取项目列表数据
    const projects = await projectListPage.getProjectList();
    
    if (projects.length > 0) {
      const firstProject = projects[0];
      
      // 验证数据字段存在（允许为空）
      expect(typeof firstProject.projectCode).toBe('string');
      expect(typeof firstProject.projectName).toBe('string');
      expect(typeof firstProject.status).toBe('string');
      expect(typeof firstProject.type).toBe('string');
      expect(typeof firstProject.supplier).toBe('string');
      expect(typeof firstProject.customer).toBe('string');
    }
    
    // 验证总金额显示
    const totalAmount = await projectListPage.getTotalAmount();
    expect(typeof totalAmount).toBe('string');
  });

});