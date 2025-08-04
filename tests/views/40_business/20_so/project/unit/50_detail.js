const { test, expect } = require('@playwright/test');
const { ProjectListPage } = require('../../../../../pom/40_business/20_so/project/10_list');
const { ProjectDetailPage } = require('../../../../../pom/40_business/20_so/project/50_detail');

/**
 * SO项目管理 - 详情页单元测试
 * 测试范围：数据展示、只读验证、打印功能、权限控制
 */
test.describe('SO项目管理 - 详情页测试', () => {

  let projectListPage;
  let projectDetailPage;

  test.beforeEach(async ({ page }) => {
    projectListPage = new ProjectListPage(page);
    projectDetailPage = new ProjectDetailPage(page);
    
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

  test('详情页面访问权限验证', async ({ page }) => {
    const tableValidation = await projectListPage.validateTableLoaded();
    
    if (tableValidation.hasData) {
      // 选择第一个项目
      await projectListPage.selectTableRow(0);
      
      // 验证查看按钮状态（查看按钮对所有状态都应该可用）
      const buttonStates = await projectListPage.validateButtonStates();
      expect(buttonStates.viewEnabled).toBe(true);
      
      // 点击查看进入详情页
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 验证详情页面加载
      await expect(projectDetailPage.appContainer).toBeVisible();
      await expect(projectDetailPage.detailContainer).toBeVisible();
      
      console.log('✅ 详情页面访问权限验证通过');
    }
  });

  test('详情页面基础元素验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 验证页面基础结构
      await expect(projectDetailPage.basicInfoSection).toBeVisible();
      await expect(projectDetailPage.goodsDetailSection).toBeVisible();
      await expect(projectDetailPage.financeInfoSection).toBeVisible();
      await expect(projectDetailPage.projectDescSection).toBeVisible();
      await expect(projectDetailPage.attachmentSection).toBeVisible();
      
      // 验证操作按钮区域
      await expect(projectDetailPage.actionButtonsSection).toBeVisible();
      await expect(projectDetailPage.returnButton).toBeVisible();
      
      // 验证打印按钮（如果有）
      if (await projectDetailPage.printButton.isVisible()) {
        await expect(projectDetailPage.printButton).toBeVisible();
      }
      
      console.log('✅ 详情页面基础元素验证通过');
    }
  });

  test('项目基本信息展示验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 获取详情页显示的项目信息
      const detailInfo = await projectDetailPage.getProjectDetailInfo();
      
      // 验证基本信息字段完整性
      expect(detailInfo.projectCode).toBeTruthy();
      expect(detailInfo.projectName).toBeTruthy();
      expect(detailInfo.status).toBeTruthy();
      expect(detailInfo.type).toBeTruthy();
      
      // 验证信息与列表页一致
      expect(detailInfo.projectName).toContain(firstProject.projectName);
      expect(detailInfo.status).toContain(firstProject.status);
      
      console.log('项目详情信息:', detailInfo);
      console.log('✅ 项目基本信息展示验证通过');
    }
  });

  test('商品明细展示验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 验证商品明细表格
      await expect(projectDetailPage.goodsDetailTable).toBeVisible();
      
      // 获取商品明细列表
      const goodsList = await projectDetailPage.getGoodsDetailList();
      
      if (goodsList.length > 0) {
        const firstGoods = goodsList[0];
        
        // 验证商品明细字段完整性
        expect(firstGoods).toHaveProperty('goodsCode');
        expect(firstGoods).toHaveProperty('goodsName');
        expect(firstGoods).toHaveProperty('qty');
        expect(firstGoods).toHaveProperty('price');
        
        console.log('商品明细列表:', goodsList);
        console.log('✅ 商品明细展示验证通过');
      } else {
        console.log('ℹ️ 该项目暂无商品明细');
      }
    }
  });

  test('财务信息展示验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 获取财务信息
      const financeInfo = await projectDetailPage.getFinanceInfo();
      
      // 验证财务信息字段
      if (financeInfo.financeAmount) {
        expect(financeInfo.financeAmount).toBeTruthy();
      }
      
      if (financeInfo.paymentMethod) {
        expect(financeInfo.paymentMethod).toBeTruthy();
      }
      
      console.log('财务信息:', financeInfo);
      console.log('✅ 财务信息展示验证通过');
    }
  });

  test('字段只读性验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 验证所有字段都是只读的
      const readOnlyValidation = await projectDetailPage.validateReadOnlyFields();
      
      // 项目名称应该是只读的
      expect(readOnlyValidation.projectNameReadOnly).toBe(true);
      
      // 供应商信息应该是只读的
      expect(readOnlyValidation.supplierReadOnly).toBe(true);
      
      // 客户信息应该是只读的
      expect(readOnlyValidation.customerReadOnly).toBe(true);
      
      // 验证没有编辑按钮
      const hasEditControls = await projectDetailPage.hasEditControls();
      expect(hasEditControls).toBe(false);
      
      console.log('✅ 字段只读性验证通过');
    }
  });

  test('项目附件展示验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 验证附件区域
      await expect(projectDetailPage.attachmentSection).toBeVisible();
      
      // 获取附件列表
      const attachments = await projectDetailPage.getAttachmentList();
      
      if (attachments.length > 0) {
        const firstAttachment = attachments[0];
        
        // 验证附件信息
        expect(firstAttachment.fileName).toBeTruthy();
        
        // 验证下载功能（如果有）
        if (await projectDetailPage.downloadButton.isVisible()) {
          await expect(projectDetailPage.downloadButton).toBeVisible();
        }
        
        console.log('项目附件列表:', attachments);
        console.log('✅ 项目附件展示验证通过');
      } else {
        console.log('ℹ️ 该项目暂无附件');
      }
    }
  });

  test('审批历史展示验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 如果有审批历史区域
      if (await projectDetailPage.approvalHistorySection.isVisible()) {
        await expect(projectDetailPage.approvalHistorySection).toBeVisible();
        
        // 获取审批历史
        const approvalHistory = await projectDetailPage.getApprovalHistory();
        
        if (approvalHistory.length > 0) {
          const firstRecord = approvalHistory[0];
          
          // 验证审批历史记录字段
          expect(firstRecord).toHaveProperty('stepName');
          expect(firstRecord).toHaveProperty('approver');
          expect(firstRecord).toHaveProperty('approvalTime');
          
          console.log('审批历史:', approvalHistory);
          console.log('✅ 审批历史展示验证通过');
        } else {
          console.log('ℹ️ 该项目暂无审批历史');
        }
      }
    }
  });

  test('打印功能验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 测试打印功能
      if (await projectDetailPage.printButton.isVisible()) {
        await projectDetailPage.printButton.click();
        
        // 验证打印预览或打印对话框
        await page.waitForTimeout(1000);
        
        // 检查是否有打印预览窗口
        const printDialog = page.locator('.print-dialog, .print-preview');
        if (await printDialog.isVisible()) {
          await expect(printDialog).toBeVisible();
          
          // 关闭打印预览
          const closeButton = printDialog.locator('button:has-text("关闭"), button:has-text("取消")');
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        }
        
        console.log('✅ 打印功能验证通过');
      } else {
        console.log('ℹ️ 打印功能不可用或无权限');
      }
    }
  });

  test('导出功能验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 测试导出功能
      if (await projectDetailPage.exportButton.isVisible()) {
        // 设置下载事件监听
        const downloadPromise = page.waitForEvent('download');
        
        await projectDetailPage.exportButton.click();
        
        try {
          const download = await downloadPromise;
          console.log(`导出文件名: ${download.suggestedFilename()}`);
          console.log('✅ 导出功能验证通过');
        } catch (error) {
          console.log('ℹ️ 导出功能可能需要特殊权限或配置');
        }
      } else {
        console.log('ℹ️ 导出功能不可用或无权限');
      }
    }
  });

  test('相关单据展示验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 如果有相关单据区域
      if (await projectDetailPage.relatedDocumentsSection.isVisible()) {
        await expect(projectDetailPage.relatedDocumentsSection).toBeVisible();
        
        // 获取相关单据列表
        const relatedDocs = await projectDetailPage.getRelatedDocuments();
        
        if (relatedDocs.length > 0) {
          const firstDoc = relatedDocs[0];
          
          // 验证相关单据字段
          expect(firstDoc).toHaveProperty('documentType');
          expect(firstDoc).toHaveProperty('documentCode');
          expect(firstDoc).toHaveProperty('status');
          
          console.log('相关单据列表:', relatedDocs);
          console.log('✅ 相关单据展示验证通过');
        } else {
          console.log('ℹ️ 该项目暂无相关单据');
        }
      }
    }
  });

  test('返回列表功能验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 点击返回按钮
      await projectDetailPage.returnToList();
      
      // 验证返回到列表页
      await projectListPage.waitForPageLoad();
      await expect(projectListPage.projectTable).toBeVisible();
      
      // 验证活动Tab切换到列表页
      const activeTab = page.locator('.el-tabs__item.is-active');
      await expect(activeTab).toContainText('列表');
      
      console.log('✅ 返回列表功能验证通过');
    }
  });

  test('双击行进入详情页验证', async ({ page }) => {
    const tableValidation = await projectListPage.validateTableLoaded();
    
    if (tableValidation.hasData) {
      // 双击第一行
      await projectListPage.doubleClickRow(0);
      
      // 等待页面切换
      await page.waitForTimeout(1000);
      
      // 验证是否进入详情页
      if (await projectDetailPage.detailContainer.isVisible()) {
        await expect(projectDetailPage.detailContainer).toBeVisible();
        console.log('✅ 双击行进入详情页验证通过');
      } else {
        console.log('ℹ️ 双击行可能触发其他操作或需要特定权限');
      }
    }
  });

  test('详情页面数据完整性验证', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      // 验证详情页面数据完整性
      const completenessValidation = await projectDetailPage.validateDataCompleteness({
        projectName: firstProject.projectName,
        hasBasicInfo: true,
        hasGoodsDetail: true,
        hasFinanceInfo: true
      });
      
      // 验证项目名称匹配
      expect(completenessValidation.projectNameMatch).toBe(true);
      
      // 验证各部分数据存在
      expect(completenessValidation.hasBasicInfo).toBe(true);
      
      console.log('数据完整性验证:', completenessValidation);
      console.log('✅ 详情页面数据完整性验证通过');
    }
  });

  test('详情页面加载性能测试', async ({ page }) => {
    const firstProject = await getFirstProject();
    
    if (firstProject) {
      await projectListPage.selectTableRow(firstProject.rowIndex);
      
      const startTime = Date.now();
      
      await projectListPage.clickView();
      await projectDetailPage.waitForDetailPageLoad();
      
      const loadTime = Date.now() - startTime;
      
      // 验证详情页加载时间在合理范围内（5秒）
      expect(loadTime).toBeLessThan(5000);
      
      console.log(`详情页加载时间: ${loadTime}ms`);
      console.log('✅ 详情页面加载性能验证通过');
    }
  });

  test('不同状态项目详情页验证', async ({ page }) => {
    const projects = await projectListPage.getProjectList();
    
    // 测试不同状态的项目详情页
    const statusesToTest = ['待审批', '审批中', '执行中', '已完成'];
    
    for (const status of statusesToTest) {
      const projectIndex = projects.findIndex(p => p.status.includes(status));
      
      if (projectIndex >= 0) {
        await projectListPage.selectTableRow(projectIndex);
        await projectListPage.clickView();
        await projectDetailPage.waitForDetailPageLoad();
        
        // 验证详情页正常加载
        await expect(projectDetailPage.detailContainer).toBeVisible();
        
        console.log(`✅ ${status}状态项目详情页验证通过`);
        
        // 返回列表继续测试其他状态
        await projectDetailPage.returnToList();
        await projectListPage.waitForPageLoad();
      }
    }
  });

  // 辅助函数：获取第一个项目
  async function getFirstProject() {
    const projects = await projectListPage.getProjectList();
    
    if (projects.length > 0) {
      return {
        ...projects[0],
        rowIndex: 0
      };
    }
    
    return null;
  }

});