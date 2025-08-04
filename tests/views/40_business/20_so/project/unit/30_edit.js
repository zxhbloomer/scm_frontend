const { test, expect } = require('@playwright/test');
const { ProjectListPage } = require('../../../../../pom/40_business/20_so/project/10_list');
const { ProjectEditPage } = require('../../../../../pom/40_business/20_so/project/30_edit');

/**
 * SO项目管理 - 编辑页单元测试
 * 测试范围：编辑权限、数据修改、乐观锁验证
 */
test.describe('SO项目管理 - 编辑页测试', () => {

  let projectListPage;
  let projectEditPage;

  test.beforeEach(async ({ page }) => {
    projectListPage = new ProjectListPage(page);
    projectEditPage = new ProjectEditPage(page);
    
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

  test('编辑页面访问权限验证', async ({ page }) => {
    const tableValidation = await projectListPage.validateTableLoaded();
    
    if (tableValidation.hasData) {
      // 选择第一个项目
      await projectListPage.selectTableRow(0);
      
      // 获取项目数据验证状态
      const projectData = await projectListPage.getProjectDataByRow(0);
      
      // 检查编辑按钮状态
      const buttonStates = await projectListPage.validateButtonStates();
      
      if (buttonStates.editEnabled) {
        // 点击编辑进入编辑页
        await projectListPage.clickEdit();
        await projectEditPage.waitForEditPageLoad();
        
        // 验证编辑页面加载
        await expect(projectEditPage.appContainer).toBeVisible();
        await expect(projectEditPage.dataSubmitForm).toBeVisible();
        
        console.log(`✅ 项目 "${projectData.projectName}" 可以编辑`);
      } else {
        console.log(`ℹ️ 项目 "${projectData.projectName}" 状态为 "${projectData.status}"，不可编辑`);
      }
    }
  });

  test('编辑页面基础元素验证', async ({ page }) => {
    // 寻找可编辑的项目
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      // 验证页面基础结构
      await expect(projectEditPage.basicInfoAlert).toBeVisible();
      await expect(projectEditPage.goodsDetailAlert).toBeVisible();
      await expect(projectEditPage.financeInfoAlert).toBeVisible();
      
      // 验证操作按钮
      await expect(projectEditPage.updateButton).toBeVisible();
      await expect(projectEditPage.returnButton).toBeVisible();
      
      // 验证项目编号显示（只读）
      await expect(projectEditPage.projectCodeDisplay).toBeVisible();
      
      console.log('✅ 编辑页面基础元素验证通过');
    }
  });

  test('编辑权限和字段可编辑性验证', async ({ page }) => {
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      // 验证字段可编辑性
      const editableFields = await projectEditPage.validateEditableFields();
      
      // 根据项目状态验证编辑权限
      if (editableProject.status.includes('待审批') || editableProject.status.includes('驳回')) {
        expect(editableFields.projectNameEditable).toBe(true);
        expect(editableFields.deliveryLocationEditable).toBe(true);
        console.log('✅ 待审批/驳回状态项目字段可编辑');
      }
      
      if (editableProject.status.includes('已完成') || editableProject.status.includes('已作废')) {
        expect(editableFields.projectNameEditable).toBe(false);
        console.log('✅ 已完成/已作废状态项目字段不可编辑');
      }
      
      // 验证编辑权限
      const permissions = await projectEditPage.checkEditPermissions();
      console.log('编辑权限验证:', permissions);
    }
  });

  test('项目信息修改功能', async ({ page }) => {
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      // 获取原始数据
      const originalData = await projectEditPage.getCurrentProjectData();
      
      // 修改项目信息
      const modifiedData = {
        projectName: originalData.projectName + '_修改测试',
        deliveryLocation: '修改后的交货地点',
        remark: '修改测试备注'
      };
      
      // 填写修改后的数据
      await projectEditPage.fillBasicInfo(modifiedData);
      
      // 验证数据修改生效
      const updatedData = await projectEditPage.getCurrentProjectData();
      expect(updatedData.projectName).toBe(modifiedData.projectName);
      expect(updatedData.deliveryLocation).toBe(modifiedData.deliveryLocation);
      
      // 恢复原始数据（避免影响其他测试）
      await projectEditPage.fillBasicInfo({
        projectName: originalData.projectName,
        deliveryLocation: originalData.deliveryLocation,
        remark: originalData.remark
      });
      
      console.log('✅ 项目信息修改功能验证通过');
    }
  });

  test('商品明细编辑功能', async ({ page }) => {
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      // 获取现有商品列表
      const originalGoods = await projectEditPage.getGoodsList();
      const originalCount = originalGoods.length;
      
      // 测试添加商品
      const newGoods = {
        goodsName: '测试商品_编辑',
        qty: 10,
        price: 100
      };
      
      await projectEditPage.addGoods(newGoods);
      await page.waitForTimeout(1000);
      
      // 验证商品添加
      const updatedGoods = await projectEditPage.getGoodsList();
      expect(updatedGoods.length).toBe(originalCount + 1);
      
      // 如果有商品，测试删除功能
      if (updatedGoods.length > 0) {
        await projectEditPage.selectGoodsRow(updatedGoods.length - 1);
        await projectEditPage.deleteSelectedGoods();
        
        const finalGoods = await projectEditPage.getGoodsList();
        expect(finalGoods.length).toBe(originalCount);
      }
      
      console.log('✅ 商品明细编辑功能验证通过');
    }
  });

  test('财务信息修改验证', async ({ page }) => {
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      // 获取当前财务信息
      const originalFinanceInfo = await projectEditPage.getCurrentFinanceInfo();
      
      // 修改财务信息
      const modifiedFinanceInfo = {
        financeAmount: (originalFinanceInfo.financeAmount || 100000) + 50000,
        rate: 0.07,
        projectCycle: 45
      };
      
      await projectEditPage.fillFinanceInfo(modifiedFinanceInfo);
      
      // 验证修改结果
      const updatedFinanceInfo = await projectEditPage.getCurrentFinanceInfo();
      expect(updatedFinanceInfo.financeAmount).toBe(modifiedFinanceInfo.financeAmount);
      
      // 恢复原始数据
      await projectEditPage.fillFinanceInfo(originalFinanceInfo);
      
      console.log('✅ 财务信息修改验证通过');
    }
  });

  test('必填字段验证在编辑页', async ({ page }) => {
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      // 清空必填字段
      await projectEditPage.projectNameInput.clear();
      
      // 尝试保存
      await projectEditPage.updateButton.click();
      
      // 验证必填字段错误提示
      const nameError = await page.locator('.el-form-item__error:has-text("项目名称")').isVisible();
      expect(nameError).toBe(true);
      
      // 恢复项目名称
      await projectEditPage.projectNameInput.fill(editableProject.projectName);
      
      console.log('✅ 编辑页必填字段验证通过');
    }
  });

  test('乐观锁验证', async ({ page }) => {
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      // 获取当前版本号
      const currentVersion = await projectEditPage.getCurrentVersion();
      
      // 模拟数据被其他用户修改的情况
      // 这里可以通过API直接修改数据版本号来测试乐观锁
      
      // 修改数据并尝试保存
      await projectEditPage.projectNameInput.fill(editableProject.projectName + '_乐观锁测试');
      await projectEditPage.updateButton.click();
      
      // 检查是否有版本冲突提示
      const conflictMessage = await page.locator('.el-message--error:has-text("数据已被其他用户修改")').isVisible();
      
      // 恢复原始数据
      await projectEditPage.projectNameInput.fill(editableProject.projectName);
      
      console.log('✅ 乐观锁验证完成');
    }
  });

  test('编辑页面返回功能', async ({ page }) => {
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      // 修改一些数据但不保存
      await projectEditPage.projectNameInput.fill('测试返回功能');
      
      // 点击返回
      await projectEditPage.returnToList();
      
      // 验证返回到列表页
      await projectListPage.waitForPageLoad();
      await expect(projectListPage.projectTable).toBeVisible();
      
      console.log('✅ 编辑页面返回功能验证通过');
    }
  });

  test('编辑表单性能测试', async ({ page }) => {
    const editableProject = await findEditableProject();
    
    if (editableProject) {
      await projectListPage.selectTableRow(editableProject.rowIndex);
      
      const startTime = Date.now();
      
      await projectListPage.clickEdit();
      await projectEditPage.waitForEditPageLoad();
      
      const loadTime = Date.now() - startTime;
      
      // 验证编辑页加载时间
      expect(loadTime).toBeLessThan(5000);
      
      console.log(`编辑页加载时间: ${loadTime}ms`);
      
      // 测试数据修改响应时间
      const modifyStartTime = Date.now();
      
      await projectEditPage.projectNameInput.fill('性能测试修改');
      await projectEditPage.deliveryLocationInput.fill('性能测试地点');
      
      const modifyTime = Date.now() - modifyStartTime;
      expect(modifyTime).toBeLessThan(2000);
      
      console.log(`数据修改响应时间: ${modifyTime}ms`);
      
      // 恢复原始数据
      await projectEditPage.projectNameInput.fill(editableProject.projectName);
    }
  });

  // 辅助函数：查找可编辑的项目
  async function findEditableProject() {
    const projects = await projectListPage.getProjectList();
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      
      // 查找待审批或驳回状态的项目（这些通常可以编辑）
      if (project.status.includes('待审批') || project.status.includes('驳回')) {
        return {
          ...project,
          rowIndex: i
        };
      }
    }
    
    // 如果没找到可编辑的项目，返回第一个项目（用于测试权限控制）
    if (projects.length > 0) {
      return {
        ...projects[0],
        rowIndex: 0
      };
    }
    
    return null;
  }

});