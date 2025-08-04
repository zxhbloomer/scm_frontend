/**
 * 基础页面对象模型类
 * 包含所有页面对象的通用方法和属性
 */
class BasePage {
  constructor(page) {
    this.page = page;
    this.baseUrl = '';
  }

  // ===================
  // 通用元素定位器
  // ===================

  get appContainer() {
    return this.page.locator('.app-container, .app-main');
  }

  get loadingIndicator() {
    return this.page.locator('.el-loading-mask, .loading');
  }

  get messageBox() {
    return this.page.locator('.el-message-box');
  }

  get notification() {
    return this.page.locator('.el-notification');
  }

  // 通用按钮
  get saveButton() {
    return this.page.getByRole('button', { name: /保存|确定/ });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: /取消|关闭/ });
  }

  get confirmButton() {
    return this.page.getByRole('button', { name: /确认|确定/ });
  }

  get deleteButton() {
    return this.page.getByRole('button', { name: '删除' });
  }

  get editButton() {
    return this.page.getByRole('button', { name: /编辑|修改/ });
  }

  get addButton() {
    return this.page.getByRole('button', { name: /新增|添加/ });
  }

  get viewButton() {
    return this.page.getByRole('button', { name: /查看|详情/ });
  }

  get approveButton() {
    return this.page.getByRole('button', { name: /审批|通过/ });
  }

  get searchButton() {
    return this.page.getByRole('button', { name: /查询|搜索/ });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: /重置|清空/ });
  }

  get exportButton() {
    return this.page.getByRole('button', { name: /导出|下载/ });
  }

  get printButton() {
    return this.page.getByRole('button', { name: '打印' });
  }

  // ===================
  // 通用操作方法
  // ===================

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('.app-container, .app-main', { timeout: 10000 });
  }

  /**
   * 等待加载指示器消失
   */
  async waitForLoading() {
    try {
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 });
    } catch (error) {
      // 如果没有找到加载指示器，继续执行
    }
  }

  /**
   * 点击确认按钮（处理确认对话框）
   */
  async confirmAction() {
    await this.messageBox.waitFor({ timeout: 5000 });
    await this.confirmButton.click();
    await this.waitForLoading();
  }

  /**
   * 下拉选择器选择选项 - 现代化版本
   * @param {Locator} selectElement - 选择器元素
   * @param {string} optionText - 选项文本
   */
  async selectDropdown(selectElement, optionText) {
    await selectElement.click();
    await this.page.waitForTimeout(500);
    
    // 优先使用语义化定位器
    const option = this.page.getByRole('option', { name: optionText })
      .or(this.page.locator(`.el-select-dropdown .el-option:has-text("${optionText}")`)
      .or(this.page.getByText(optionText)));
    
    await option.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 填写表单数据 - 现代化版本
   * @param {Object} formData - 表单数据对象
   */
  async fillForm(formData) {
    for (const [field, value] of Object.entries(formData)) {
      if (value !== undefined && value !== null && value !== '') {
        // 优先使用语义化定位器
        const input = this.page.getByLabel(field)
          .or(this.page.getByPlaceholder(field))
          .or(this.page.getByTestId(field))
          .or(this.page.locator(`input[placeholder*="${field}"], textarea[placeholder*="${field}"]`));
        
        if (await input.isVisible()) {
          await input.fill(value.toString());
        }
      }
    }
  }

  /**
   * 获取错误消息
   */
  async getErrorMessage() {
    try {
      return await this.page.locator('.el-message--error .el-message__content').textContent();
    } catch {
      return null;
    }
  }

  /**
   * 获取成功消息
   */
  async getSuccessMessage() {
    try {
      return await this.page.locator('.el-message--success .el-message__content').textContent();
    } catch {
      return null;
    }
  }

  /**
   * 截图（用于调试）
   * @param {string} name - 截图名称
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `tests/reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * 滚动到元素
   * @param {Locator} element - 目标元素
   */
  async scrollToElement(element) {
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * 等待元素可见
   * @param {Locator} element - 目标元素
   * @param {number} timeout - 超时时间（毫秒）
   */
  async waitForElement(element, timeout = 5000) {
    await element.waitFor({ state: 'visible', timeout });
  }

  /**
   * 验证页面标题
   * @param {string} expectedTitle - 期望的标题
   */
  async validatePageTitle(expectedTitle) {
    const title = await this.page.title();
    return title.includes(expectedTitle);
  }

  /**
   * 获取当前URL
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * 刷新页面
   */
  async refreshPage() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * 返回上一页
   */
  async goBack() {
    await this.page.goBack();
    await this.waitForPageLoad();
  }
}

module.exports = { BasePage };