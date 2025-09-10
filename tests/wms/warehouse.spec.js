// 仓库管理测试 - 直接在目标页面设置认证
import { test, expect } from '@playwright/test';
import { setupWMSAuth } from '../setup/auth.js';

test.describe('WMS仓库管理', () => {

  test('直接打开仓库管理页面', async ({ page }) => {
    // 直接在仓库管理页面设置认证并打开
    const finalUrl = await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 验证URL是否正确
    console.log('最终URL:', finalUrl);
    expect(finalUrl).toContain('master/warehouse');
    
    // 检查页面是否成功加载
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('✅ 仓库管理页面直接打开成功');
  });

  test('检查页面基本结构', async ({ page }) => {
    // 直接在目标页面设置认证
    await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 检查页面主要容器是否存在
    const appContainer = page.locator('#app, .app-wrapper, .main-container');
    await expect(appContainer.first()).toBeVisible();
    
    console.log('✅ 页面基本结构正常');
  });

  test('验证认证信息是否正确设置', async ({ page }) => {
    // 直接在目标页面设置认证
    await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 验证localStorage中的用户信息
    const userInfo = await page.evaluate(() => {
      return localStorage.getItem('user');
    });
    
    expect(userInfo).toBeTruthy();
    console.log('用户信息:', userInfo);
    
    // 验证cookie是否设置
    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find(c => c.name === 'wms-Token');
    expect(tokenCookie).toBeTruthy();
    
    console.log('✅ 认证信息设置正确');
  });
});