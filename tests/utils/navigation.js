// SPA导航工具 - 基于Playwright官方模式
export class SPANavigator {
  constructor(page, baseURL = 'http://localhost:9528') {
    this.page = page;
    this.baseURL = baseURL;
  }

  /**
   * 构建SPA URL - 使用Playwright官方的URL构建模式
   */
  buildURL(hashRoute) {
    try {
      const url = new URL(this.baseURL);
      url.hash = hashRoute.startsWith('#') ? hashRoute : '#' + hashRoute;
      return url.toString();
    } catch (e) {
      return `${this.baseURL}#${hashRoute}`;
    }
  }

  /**
   * 导航到SPA路由 - 学习Playwright官方waitForURL模式
   */
  async navigateToRoute(hashRoute) {
    const targetURL = this.buildURL(hashRoute);
    console.log(`导航到: ${targetURL}`);
    
    await this.page.goto(targetURL);
    
    // 使用Playwright官方的glob模式等待hash路由
    await this.page.waitForURL(`**/#${hashRoute.replace(/^#?/, '')}`);
    
    // 等待页面内容加载完成
    await this.page.waitForLoadState('networkidle');
    
    console.log(`导航完成，当前URL: ${this.page.url()}`);
    return this.page.url();
  }

  /**
   * 等待hash路由变化 - 处理SPA内部导航
   */
  async waitForRouteChange(expectedRoute) {
    await this.page.waitForURL(`**/#${expectedRoute.replace(/^#?/, '')}`, { 
      timeout: 15000 
    });
  }

  /**
   * 验证当前路由
   */
  async verifyCurrentRoute(expectedRoute) {
    const currentURL = this.page.url();
    const expectedURL = this.buildURL(expectedRoute);
    
    if (currentURL !== expectedURL) {
      throw new Error(`路由不匹配: 期望 ${expectedURL}, 实际 ${currentURL}`);
    }
    
    return true;
  }
}