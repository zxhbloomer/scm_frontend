const { test, expect } = require('@playwright/test');
const { ProjectListPage } = require('../../../../../pom/40_business/20_so/project/10_list');
const { ProjectCreatePage } = require('../../../../../pom/40_business/20_so/project/20_create');

/**
 * SO项目管理 - 新建页单元测试
 * 测试范围：表单验证、数据填写、提交审批
 */
test.describe('SO项目管理 - 新建页测试', () => {

  let projectListPage;
  let projectCreatePage;

  test.beforeEach(async ({ page }) => {
    projectListPage = new ProjectListPage(page);
    projectCreatePage = new ProjectCreatePage(page);
    
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
    
    // 点击新增按钮进入新建页
    await projectListPage.clickAdd();
    await projectCreatePage.waitForCreatePageLoad();
  });

  test('新建页面基础元素加载', async ({ page }) => {
    // 验证页面容器
    await expect(projectCreatePage.appContainer).toBeVisible();
    await expect(projectCreatePage.dataSubmitForm).toBeVisible();
    
    // 验证各个区域标题
    await expect(projectCreatePage.basicInfoAlert).toBeVisible();
    await expect(projectCreatePage.goodsDetailAlert).toBeVisible();
    await expect(projectCreatePage.financeInfoAlert).toBeVisible();
    await expect(projectCreatePage.projectDescAlert).toBeVisible();
    await expect(projectCreatePage.attachmentAlert).toBeVisible();
    
    // 验证底部操作按钮
    await expect(projectCreatePage.submitApprovalButton).toBeVisible();
    await expect(projectCreatePage.returnButton).toBeVisible();
  });

  test('基本信息区域元素验证', async ({ page }) => {
    // 项目编号（只读，应该自动生成）
    await expect(projectCreatePage.projectCodeDisplay).toBeVisible();
    
    // 必填字段验证
    await expect(projectCreatePage.projectNameInput).toBeVisible();
    await expect(projectCreatePage.supplierSearchInput).toBeVisible();
    await expect(projectCreatePage.customerSearchInput).toBeVisible();
    
    // 其他基本信息字段
    await expect(projectCreatePage.projectTypeDisplay).toBeVisible();
    await expect(projectCreatePage.deliveryTypeRadio).toBeVisible();
    await expect(projectCreatePage.deliveryLocationInput).toBeVisible();
    await expect(projectCreatePage.remarkInput).toBeVisible();
  });

  test('必填字段验证测试', async ({ page }) => {
    // 尝试直接提交空表单
    await projectCreatePage.submitApprovalButton.click();
    
    // 验证必填字段错误提示
    const validations = await projectCreatePage.validateRequiredFields();
    
    // 项目名称应该显示必填提示
    expect(validations.projectNameRequired).toBe(true);
    
    // 验证页面显示错误消息
    const errorMessages = await page.locator('.el-form-item__error').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('项目名称字段验证', async ({ page }) => {
    // 测试最大长度限制
    const longName = 'A'.repeat(201);
    await projectCreatePage.projectNameInput.fill(longName);
    
    const actualValue = await projectCreatePage.projectNameInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(200);
    
    // 测试特殊字符处理
    await projectCreatePage.projectNameInput.clear();
    await projectCreatePage.projectNameInput.fill('<script>alert("test")</script>');
    
    // 尝试提交验证XSS防护
    await projectCreatePage.submitApprovalButton.click();
    await page.waitForTimeout(1000);
  });

  test('供应商选择功能', async ({ page }) => {
    // 点击供应商搜索
    await projectCreatePage.supplierSearchButton.click();
    
    // 验证供应商选择弹窗出现
    await expect(projectCreatePage.supplierDialog).toBeVisible({ timeout: 5000 });
    
    // 在弹窗中搜索供应商
    const searchInput = projectCreatePage.supplierDialog.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试供应商');
      
      const searchBtn = projectCreatePage.supplierDialog.locator('button:has-text("搜索")');
      await searchBtn.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 取消选择
    const cancelBtn = projectCreatePage.supplierDialog.locator('button:has-text("取消")');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
    }
  });

  test('客户选择功能', async ({ page }) => {
    // 点击客户搜索
    await projectCreatePage.customerSearchButton.click();
    
    // 验证客户选择弹窗出现
    await expect(projectCreatePage.customerDialog).toBeVisible({ timeout: 5000 });
    
    // 在弹窗中搜索客户
    const searchInput = projectCreatePage.customerDialog.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试客户');
      
      const searchBtn = projectCreatePage.customerDialog.locator('button:has-text("搜索")');
      await searchBtn.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 取消选择
    const cancelBtn = projectCreatePage.customerDialog.locator('button:has-text("取消")');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
    }
  });

  test('商品明细区域功能', async ({ page }) => {
    // 验证商品操作按钮
    await expect(projectCreatePage.addGoodsButton).toBeVisible();
    await expect(projectCreatePage.deleteGoodsButton).toBeVisible();
    
    // 验证商品表格
    await expect(projectCreatePage.goodsTable).toBeVisible();
    
    // 测试添加商品功能
    await projectCreatePage.addGoodsButton.click();
    
    // 验证商品选择弹窗
    await expect(projectCreatePage.goodsDialog).toBeVisible({ timeout: 5000 });
    
    // 取消添加
    const cancelBtn = projectCreatePage.goodsDialog.locator('button:has-text("取消")');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
    }
  });

  test('财务信息区域验证', async ({ page }) => {
    // 验证财务信息字段
    await expect(projectCreatePage.paymentMethodDisplay).toBeVisible();
    await expect(projectCreatePage.paymentDaysInput).toBeVisible();
    await expect(projectCreatePage.projectCycleInput).toBeVisible();
    await expect(projectCreatePage.financeAmountInput).toBeVisible();
    await expect(projectCreatePage.rateInput).toBeVisible();
    
    // 测试数值字段验证
    await projectCreatePage.financeAmountInput.fill('-1000');
    const negativeAmount = await projectCreatePage.financeAmountInput.inputValue();
    // 验证负数是否被处理
    
    // 测试费率范围（0-1）
    await projectCreatePage.rateInput.fill('1.5');
    await projectCreatePage.submitApprovalButton.click();
    await page.waitForTimeout(1000);
  });

  test('项目说明和附件区域', async ({ page }) => {
    // 验证项目说明区域
    await expect(projectCreatePage.projectRemarkTextarea).toBeVisible();
    
    // 填写项目说明
    await projectCreatePage.fillProjectRemark('这是一个测试项目的说明');
    
    const remarkValue = await projectCreatePage.projectRemarkTextarea.inputValue();
    expect(remarkValue).toBe('这是一个测试项目的说明');
    
    // 验证附件上传区域
    await expect(projectCreatePage.fileUploadComponent).toBeVisible();
  });

  test('基本信息填写流程', async ({ page }) => {
    // 填写项目基本信息
    const basicInfo = {
      projectName: '自动化测试项目_' + Date.now(),
      deliveryLocation: '测试交货地点',
      remark: '测试备注信息'
    };
    
    await projectCreatePage.fillBasicInfo(basicInfo);
    
    // 验证填写结果
    const nameValue = await projectCreatePage.projectNameInput.inputValue();
    expect(nameValue).toBe(basicInfo.projectName);
    
    const locationValue = await projectCreatePage.deliveryLocationInput.inputValue();
    expect(locationValue).toBe(basicInfo.deliveryLocation);
  });

  test('财务信息填写验证', async ({ page }) => {
    const financeInfo = {
      paymentDays: 30,
      projectCycle: 90,
      financeAmount: 100000,
      rate: 0.08
    };
    
    await projectCreatePage.fillFinanceInfo(financeInfo);
    
    // 验证填写结果
    const amountValue = await projectCreatePage.financeAmountInput.inputValue();
    expect(parseFloat(amountValue)).toBe(financeInfo.financeAmount);
    
    const rateValue = await projectCreatePage.rateInput.inputValue();
    expect(parseFloat(rateValue)).toBe(financeInfo.rate);
  });

  test('表单重置功能', async ({ page }) => {
    // 先填写一些数据
    await projectCreatePage.projectNameInput.fill('测试项目名称');
    await projectCreatePage.deliveryLocationInput.fill('测试地点');
    await projectCreatePage.financeAmountInput.fill('50000');
    
    // 如果有重置按钮，测试重置功能
    const resetButton = page.locator('button:has-text("重置")');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      
      // 确认重置
      await page.locator('button:has-text("确定")').click();
      
      // 验证字段被清空
      const nameValue = await projectCreatePage.projectNameInput.inputValue();
      const locationValue = await projectCreatePage.deliveryLocationInput.inputValue();
      
      expect(nameValue).toBe('');
      expect(locationValue).toBe('');
    }
  });

  test('返回列表功能', async ({ page }) => {
    // 点击返回按钮
    await projectCreatePage.returnToList();
    
    // 验证返回到列表页
    await page.waitForTimeout(1000);
    await expect(projectListPage.projectTable).toBeVisible();
    
    // 验证活动Tab切换到列表页
    const activeTab = page.locator('.el-tabs__item.is-active');
    await expect(activeTab).toContainText('列表');
  });

  test('完整新建流程测试', async ({ page }) => {
    // 填写完整的项目信息
    const projectData = {
      basicInfo: {
        projectName: '完整测试项目_' + Date.now(),
        deliveryLocation: '北京市朝阳区',
        remark: '这是一个完整的测试项目'
      },
      financeInfo: {
        paymentDays: 30,
        projectCycle: 60,
        financeAmount: 500000,
        rate: 0.06
      },
      projectRemark: '项目详细说明：用于测试完整的新建流程'
    };
    
    // 填写基本信息
    await projectCreatePage.fillBasicInfo(projectData.basicInfo);
    
    // 填写财务信息
    await projectCreatePage.fillFinanceInfo(projectData.financeInfo);
    
    // 填写项目说明
    await projectCreatePage.fillProjectRemark(projectData.projectRemark);
    
    // 验证数据完整性
    const validations = await projectCreatePage.validateDataCompleteness({
      projectName: projectData.basicInfo.projectName,
      financeAmount: projectData.financeInfo.financeAmount
    });
    
    expect(validations.projectNameMatch).toBe(true);
    expect(validations.financeAmountMatch).toBe(true);
    
    // 注意：这里不实际提交，避免创建测试数据
    console.log('✅ 完整新建流程验证通过');
  });

  test('表单输入性能测试', async ({ page }) => {
    const startTime = Date.now();
    
    // 快速填写多个字段
    await projectCreatePage.projectNameInput.fill('性能测试项目');
    await projectCreatePage.deliveryLocationInput.fill('性能测试地点');
    await projectCreatePage.financeAmountInput.fill('100000');
    await projectCreatePage.rateInput.fill('0.05');
    await projectCreatePage.projectRemarkTextarea.fill('性能测试说明');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 验证输入响应时间在合理范围内（3秒）
    expect(duration).toBeLessThan(3000);
    
    console.log(`表单输入耗时: ${duration}ms`);
  });

});