const { SOBasePage } = require('../so-base-page');

/**
 * SO项目管理基础页面对象模型
 * 包含项目管理模块通用的元素定位器和操作方法
 */
class ProjectBasePage extends SOBasePage {
  constructor(page) {
    super(page);
    this.baseUrl = '/40_business/20_so/project';
  }

  // ===================
  // 项目管理通用元素定位器
  // ===================

  // 项目基本信息
  get projectCodeInput() {
    return this.page.locator('input[placeholder*="项目编号"], input[placeholder*="项目代码"]');
  }

  get projectNameInput() {
    return this.page.locator('input[placeholder*="项目名称"]');
  }

  get projectTypeSelect() {
    return this.page.locator('.el-select[placeholder*="项目类型"]');
  }

  get projectPrioritySelect() {
    return this.page.locator('.el-select[placeholder*="优先级"], .el-select[placeholder*="项目优先级"]');
  }

  get projectManagerSelect() {
    return this.page.locator('.el-select[placeholder*="项目经理"], .el-select[placeholder*="负责人"]');
  }

  // 项目时间
  get startDatePicker() {
    return this.page.locator('.el-date-picker[placeholder*="开始日期"], .el-date-picker[placeholder*="计划开始"]');
  }

  get endDatePicker() {
    return this.page.locator('.el-date-picker[placeholder*="结束日期"], .el-date-picker[placeholder*="计划结束"]');
  }

  // 项目预算和成本
  get budgetInput() {
    return this.page.locator('input[placeholder*="预算"], input[placeholder*="项目预算"]');
  }

  get actualCostInput() {
    return this.page.locator('input[placeholder*="实际成本"], input[placeholder*="已用成本"]');
  }

  // 项目状态和进度
  get projectStatusSelect() {
    return this.page.locator('.el-select[placeholder*="项目状态"]');
  }

  get progressInput() {
    return this.page.locator('input[placeholder*="进度"], .el-slider');
  }

  get progressBar() {
    return this.page.locator('.el-progress, .progress-bar');
  }

  // 项目描述
  get descriptionTextarea() {
    return this.page.locator('textarea[placeholder*="项目描述"], textarea[placeholder*="描述"]');
  }

  get objectiveTextarea() {
    return this.page.locator('textarea[placeholder*="项目目标"], textarea[placeholder*="目标"]');
  }

  // 项目团队成员
  get teamMembersTable() {
    return this.page.locator('.team-members-table .el-table, .project-team .el-table');
  }

  get addMemberButton() {
    return this.page.locator('button:has-text("添加成员"), button:has-text("新增成员")');
  }

  // 项目里程碑
  get milestonesTable() {
    return this.page.locator('.milestones-table .el-table, .project-milestones .el-table');
  }

  get addMilestoneButton() {
    return this.page.locator('button:has-text("添加里程碑"), button:has-text("新增里程碑")');
  }

  // 项目任务
  get tasksTable() {
    return this.page.locator('.tasks-table .el-table, .project-tasks .el-table');
  }

  get addTaskButton() {
    return this.page.locator('button:has-text("添加任务"), button:has-text("新增任务")');
  }

  // 项目文档和附件
  get documentsSection() {
    return this.page.locator('.documents-section, .project-documents');
  }

  get uploadButton() {
    return this.page.locator('button:has-text("上传文档"), button:has-text("添加附件")');
  }

  // ===================
  // 项目管理通用操作方法
  // ===================

  /**
   * 设置项目基本信息
   * @param {Object} projectData - 项目数据
   */
  async setProjectBasicInfo(projectData) {
    if (projectData.projectCode) {
      await this.projectCodeInput.fill(projectData.projectCode);
    }

    if (projectData.projectName) {
      await this.projectNameInput.fill(projectData.projectName);
    }

    if (projectData.projectType) {
      await this.selectDropdown(this.projectTypeSelect, projectData.projectType);
    }

    if (projectData.priority) {
      await this.selectDropdown(this.projectPrioritySelect, projectData.priority);
    }

    if (projectData.projectManager) {
      await this.selectDropdown(this.projectManagerSelect, projectData.projectManager);
    }
  }

  /**
   * 设置项目时间范围
   * @param {Object} timeData - 时间数据
   */
  async setProjectTimeRange(timeData) {
    if (timeData.startDate) {
      await this.startDatePicker.click();
      await this.page.locator('.el-date-picker__editor').fill(timeData.startDate);
      await this.page.locator('.el-date-picker__editor').press('Enter');
    }

    if (timeData.endDate) {
      await this.endDatePicker.click();
      await this.page.locator('.el-date-picker__editor').fill(timeData.endDate);
      await this.page.locator('.el-date-picker__editor').press('Enter');
    }
  }

  /**
   * 设置项目预算
   * @param {number} budget - 预算金额
   */
  async setProjectBudget(budget) {
    await this.budgetInput.fill(budget.toString());
  }

  /**
   * 设置项目状态
   * @param {string} status - 项目状态
   */
  async setProjectStatus(status) {
    await this.selectDropdown(this.projectStatusSelect, status);
  }

  /**
   * 设置项目进度
   * @param {number} progress - 进度百分比 (0-100)
   */
  async setProjectProgress(progress) {
    // 如果是滑块组件
    if (await this.page.locator('.el-slider').isVisible()) {
      const slider = this.page.locator('.el-slider .el-slider__runway');
      const sliderBox = await slider.boundingBox();
      
      if (sliderBox) {
        const targetX = sliderBox.x + (sliderBox.width * progress / 100);
        await this.page.mouse.click(targetX, sliderBox.y + sliderBox.height / 2);
      }
    } else {
      // 如果是输入框
      await this.progressInput.fill(progress.toString());
    }
  }

  /**
   * 设置项目描述
   * @param {string} description - 项目描述
   */
  async setProjectDescription(description) {
    await this.descriptionTextarea.fill(description);
  }

  /**
   * 设置项目目标
   * @param {string} objective - 项目目标
   */
  async setProjectObjective(objective) {
    await this.objectiveTextarea.fill(objective);
  }

  /**
   * 添加团队成员
   * @param {Object} memberData - 成员数据
   */
  async addTeamMember(memberData) {
    await this.addMemberButton.click();
    
    // 选择成员
    if (memberData.memberName) {
      const memberSelect = this.page.locator('.el-select[placeholder*="成员"]').last();
      await this.selectDropdown(memberSelect, memberData.memberName);
    }

    // 设置角色
    if (memberData.role) {
      const roleSelect = this.page.locator('.el-select[placeholder*="角色"]').last();
      await this.selectDropdown(roleSelect, memberData.role);
    }

    // 保存成员
    await this.page.locator('button:has-text("确定"), button:has-text("保存")').click();
  }

  /**
   * 添加项目里程碑
   * @param {Object} milestoneData - 里程碑数据
   */
  async addMilestone(milestoneData) {
    await this.addMilestoneButton.click();
    
    // 里程碑名称
    if (milestoneData.name) {
      const nameInput = this.page.locator('input[placeholder*="里程碑名称"]').last();
      await nameInput.fill(milestoneData.name);
    }

    // 计划完成日期
    if (milestoneData.dueDate) {
      const dateInput = this.page.locator('.el-date-picker[placeholder*="完成日期"]').last();
      await dateInput.click();
      await this.page.locator('.el-date-picker__editor').fill(milestoneData.dueDate);
      await this.page.locator('.el-date-picker__editor').press('Enter');
    }

    // 保存里程碑
    await this.page.locator('button:has-text("确定"), button:has-text("保存")').click();
  }

  /**
   * 添加项目任务
   * @param {Object} taskData - 任务数据
   */
  async addTask(taskData) {
    await this.addTaskButton.click();
    
    // 任务名称
    if (taskData.taskName) {
      const nameInput = this.page.locator('input[placeholder*="任务名称"]').last();
      await nameInput.fill(taskData.taskName);
    }

    // 任务负责人
    if (taskData.assignee) {
      const assigneeSelect = this.page.locator('.el-select[placeholder*="负责人"]').last();
      await this.selectDropdown(assigneeSelect, taskData.assignee);
    }

    // 任务截止日期
    if (taskData.dueDate) {
      const dateInput = this.page.locator('.el-date-picker[placeholder*="截止日期"]').last();
      await dateInput.click();
      await this.page.locator('.el-date-picker__editor').fill(taskData.dueDate);
      await this.page.locator('.el-date-picker__editor').press('Enter');
    }

    // 保存任务
    await this.page.locator('button:has-text("确定"), button:has-text("保存")').click();
  }

  /**
   * 获取项目基本信息
   */
  async getProjectBasicInfo() {
    return {
      projectCode: await this.projectCodeInput.inputValue(),
      projectName: await this.projectNameInput.inputValue(),
      projectManager: await this.page.locator('.project-manager-display').textContent(),
      status: await this.page.locator('.project-status-display').textContent(),
      progress: await this.getProjectProgress()
    };
  }

  /**
   * 获取项目进度
   */
  async getProjectProgress() {
    if (await this.progressBar.isVisible()) {
      const progressText = await this.progressBar.locator('.el-progress__text').textContent();
      return progressText ? parseInt(progressText.replace('%', '')) : 0;
    }
    return 0;
  }

  /**
   * 获取团队成员列表
   */
  async getTeamMembers() {
    const rows = await this.teamMembersTable.locator('tbody tr').all();
    const members = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      members.push({
        memberName: cells[0] || '',
        role: cells[1] || '',
        joinDate: cells[2] || ''
      });
    }

    return members;
  }

  /**
   * 获取项目里程碑列表
   */
  async getMilestones() {
    const rows = await this.milestonesTable.locator('tbody tr').all();
    const milestones = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      milestones.push({
        name: cells[0] || '',
        dueDate: cells[1] || '',
        status: cells[2] || ''
      });
    }

    return milestones;
  }

  /**
   * 获取项目任务列表
   */
  async getTasks() {
    const rows = await this.tasksTable.locator('tbody tr').all();
    const tasks = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      tasks.push({
        taskName: cells[0] || '',
        assignee: cells[1] || '',
        dueDate: cells[2] || '',
        status: cells[3] || ''
      });
    }

    return tasks;
  }

  /**
   * 验证项目数据完整性
   * @param {Object} expectedData - 期望的项目数据
   */
  async validateProjectData(expectedData) {
    const validations = {};

    if (expectedData.projectName) {
      const nameValue = await this.projectNameInput.inputValue();
      validations.nameMatch = nameValue === expectedData.projectName;
    }

    if (expectedData.projectManager) {
      const managerText = await this.page.locator('.project-manager-display').textContent();
      validations.managerMatch = managerText.includes(expectedData.projectManager);
    }

    if (expectedData.status) {
      const statusText = await this.page.locator('.project-status-display').textContent();
      validations.statusMatch = statusText.includes(expectedData.status);
    }

    return validations;
  }

  /**
   * 检查项目操作权限
   */
  async checkProjectPermissions() {
    return {
      canEdit: await this.page.locator('button:has-text("编辑")').isVisible(),
      canDelete: await this.page.locator('button:has-text("删除")').isVisible(),
      canApprove: await this.approveButton.isVisible(),
      canAddMember: await this.addMemberButton.isVisible(),
      canAddTask: await this.addTaskButton.isVisible()
    };
  }
}

module.exports = { ProjectBasePage };