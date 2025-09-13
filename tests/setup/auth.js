// WMS测试认证设置 - 直接在目标页面设置认证
export async function setupWMSAuth(page, targetUrl = 'http://localhost:9528/#/master/warehouse') {
  // 1. 先设置认证Cookies（在访问页面之前）
  const cookies = [
    {
      name: 'SCM_SESSION',
      value: 'MzkyMTg4YWUtNTA4OC00MWY5LWE4N2EtMTBlNWNhZDQyOTc4',
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'session', 
      value: '4ESvLFsznqnE-TpUUmU02ELxMvEiqWV0yhIVh2EXOmY',
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'JSESSIONID',
      value: 'A352979321FA9D651B63A96C76D47524', 
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'wms-Token',
      value: 'b05e7ee7-29d5-4dac-83c3-dd8cdecbc529',
      domain: 'localhost', 
      path: '/'
    },
    {
      name: 'locale',
      value: 'zh-Hans',
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'sidebarStatus',
      value: '1',
      domain: 'localhost',
      path: '/'
    }
  ];

  await page.context().addCookies(cookies);

  // 2. 设置请求拦截（在页面加载前）
  await page.route('**/scm/**', async (route) => {
    const headers = {
      ...route.request().headers(),
      'X-Tenant-ID': 'scm_tenant_20250519_001',
      'Content-Type': 'application/json;charset=UTF-8'
    };
    
    await route.continue({ headers });
  });

  // 3. 直接导航到目标页面
  console.log(`直接访问目标页面: ${targetUrl}`);
  await page.goto(targetUrl);

  // 4. 在目标页面上设置localStorage
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({
      id: 2,
      username: 'wms_admin', 
      name: '仓库管理员',
      orgId: 1,
      orgName: '测试机构',
      permissions: ['wms:*:*', 'b:in:*', 'b:out:*', 'inventory:*:*']
    }));
    
    localStorage.setItem('settings', JSON.stringify({
      theme: 'default',
      size: 'medium', 
      language: 'zh',
      sidebar: { opened: true }
    }));

    localStorage.setItem('token', 'b05e7ee7-29d5-4dac-83c3-dd8cdecbc529');
  });

  // 5. 刷新页面让所有认证信息生效
  await page.reload();
  
  // 6. 等待页面完全加载
  await page.waitForLoadState('networkidle');
  
  console.log(`认证设置完成，当前页面: ${page.url()}`);
  return page.url();
}