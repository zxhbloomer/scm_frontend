/**
 * SO项目管理测试数据生成器
 * 基于实际业务需求生成测试数据
 */

const faker = require('faker');

// 设置中文语言环境
faker.locale = 'zh_CN';

class SOProjectTestData {
  /**
   * 生成基础项目数据
   */
  static generateBasicProject() {
    const timestamp = Date.now();
    const projectCode = `PROJ${timestamp.toString().slice(-6)}`;
    
    return {
      projectCode: projectCode,
      projectName: `${faker.company.companyName()}供应链项目`,
      projectType: '销售业务',
      supplierName: `${faker.company.companyName()}供应商`,
      customerName: `${faker.company.companyName()}客户`,
      financierName: '主体企业',
      deliveryType: faker.random.arrayElement(['自提', '送货上门', '物流配送']),
      deliveryLocation: faker.address.city() + faker.address.streetName(),
      remark: faker.lorem.sentence()
    };
  }

  /**
   * 生成完整项目数据
   */
  static generateCompleteProject() {
    const basicData = this.generateBasicProject();
    
    return {
      ...basicData,
      financeInfo: this.generateFinanceInfo(),
      goodsList: this.generateGoodsList(faker.datatype.number({ min: 1, max: 3 })),
      projectRemark: faker.lorem.paragraph(),
      attachments: this.generateAttachmentPaths(faker.datatype.number({ min: 0, max: 2 }))
    };
  }

  /**
   * 生成财务信息
   */
  static generateFinanceInfo() {
    return {
      paymentMethod: faker.random.arrayElement(['现金', '银行转账', '支票', '承兑汇票']),
      paymentDays: faker.datatype.number({ min: 0, max: 90 }),
      projectCycle: faker.datatype.number({ min: 30, max: 180 }),
      financeAmount: faker.datatype.number({ min: 100000, max: 5000000, precision: 0.01 }),
      rate: faker.datatype.number({ min: 0.01, max: 0.15, precision: 0.001 })
    };
  }

  /**
   * 生成商品明细列表
   * @param {number} count - 商品数量
   */
  static generateGoodsList(count = 3) {
    const goods = [];
    
    for (let i = 0; i < count; i++) {
      const qty = faker.datatype.number({ min: 10, max: 1000 });
      const price = faker.datatype.number({ min: 10, max: 1000, precision: 0.01 });
      const taxRate = faker.random.arrayElement([0.06, 0.09, 0.13, 0.16]);
      
      goods.push({
        goodsCode: `SKU${faker.datatype.number({ min: 100000, max: 999999 })}`,
        goodsName: faker.commerce.productName(),
        specification: faker.commerce.productAdjective(),
        qty: qty,
        price: price,
        amount: qty * price,
        taxRate: taxRate,
        taxAmount: qty * price * taxRate,
        origin: faker.address.city()
      });
    }
    
    return goods;
  }

  /**
   * 生成附件文件路径（模拟）
   * @param {number} count - 附件数量
   */
  static generateAttachmentPaths(count = 2) {
    const attachments = [];
    const fileTypes = ['pdf', 'doc', 'xls', 'jpg', 'png'];
    
    for (let i = 0; i < count; i++) {
      const fileType = faker.random.arrayElement(fileTypes);
      attachments.push(`/tmp/test-file-${i + 1}.${fileType}`);
    }
    
    return attachments;
  }

  /**
   * 生成搜索条件
   */
  static generateSearchCriteria() {
    return {
      projectCode: `PROJ${faker.datatype.number({ min: 100000, max: 999999 })}`,
      projectName: faker.company.companyName(),
      supplierName: faker.company.companyName(),
      customerName: faker.company.companyName(),
      status: faker.random.arrayElement(['待审批', '审批中', '执行中', '已完成']),
      goodsName: faker.commerce.productName()
    };
  }

  /**
   * 生成批量项目数据
   * @param {number} count - 项目数量
   */
  static generateBatchProjects(count = 5) {
    const projects = [];
    
    for (let i = 0; i < count; i++) {
      projects.push(this.generateCompleteProject());
    }
    
    return projects;
  }

  /**
   * 生成特定状态的项目数据
   * @param {string} status - 项目状态
   */
  static generateProjectWithStatus(status) {
    const project = this.generateCompleteProject();
    project.status = status;
    project.approvalStatus = this.getApprovalStatusByProjectStatus(status);
    
    return project;
  }

  /**
   * 根据项目状态获取审批状态
   * @param {string} projectStatus - 项目状态
   */
  static getApprovalStatusByProjectStatus(projectStatus) {
    const statusMap = {
      '待审批': '待审批',
      '审批中': '审批中',
      '执行中': '审批通过',
      '已完成': '审批通过',
      '驳回': '审批驳回',
      '已作废': '已作废'
    };
    
    return statusMap[projectStatus] || '待审批';
  }

  /**
   * 生成审批意见
   */
  static generateApprovalComment() {
    const comments = [
      '同意该项目申请，符合公司发展战略',
      '项目方案可行，建议按计划执行',
      '需要进一步完善财务方案',
      '建议降低项目风险后再执行',
      '项目预算合理，同意审批通过'
    ];
    
    return faker.random.arrayElement(comments);
  }

  /**
   * 生成项目修改数据
   * @param {Object} originalProject - 原始项目数据
   */
  static generateModifiedProject(originalProject) {
    return {
      ...originalProject,
      projectName: originalProject.projectName + ' (修改版)',
      deliveryLocation: faker.address.city() + faker.address.streetName(),
      remark: originalProject.remark + ' - 已修改',
      financeInfo: {
        ...originalProject.financeInfo,
        financeAmount: originalProject.financeInfo.financeAmount * 1.1 // 增加10%
      }
    };
  }

  /**
   * 生成无效的项目数据（用于负面测试）
   */
  static generateInvalidProject() {
    return {
      projectCode: '', // 空项目编号
      projectName: '', // 空项目名称
      supplierName: '', // 空供应商
      customerName: '', // 空客户
      financeInfo: {
        paymentDays: -1, // 负数账期
        financeAmount: -1000 // 负数金额
      }
    };
  }

  /**
   * 生成边界值测试数据
   */
  static generateBoundaryTestData() {
    return {
      maxLengthProjectName: 'A'.repeat(200), // 最大长度项目名称
      maxPaymentDays: 999, // 最大账期天数
      maxFinanceAmount: 99999999.99, // 最大融资额度
      maxProjectCycle: 999, // 最大项目周期
      minValues: {
        paymentDays: 0,
        financeAmount: 0.01,
        projectCycle: 1
      }
    };
  }

  /**
   * 生成性能测试数据
   * @param {number} count - 数据量
   */
  static generatePerformanceTestData(count = 100) {
    console.log(`生成 ${count} 条性能测试数据...`);
    
    const startTime = Date.now();
    const projects = this.generateBatchProjects(count);
    const endTime = Date.now();
    
    console.log(`数据生成完成，耗时 ${endTime - startTime}ms`);
    
    return projects;
  }

  /**
   * 重置测试数据计数器（用于确保数据唯一性）
   */
  static resetCounters() {
    faker.seed(Date.now());
  }

  /**
   * 生成特定场景的测试数据
   * @param {string} scenario - 测试场景
   */
  static generateScenarioData(scenario) {
    this.resetCounters();
    
    switch (scenario) {
      case 'smoke':
        return this.generateBasicProject();
      
      case 'complete_workflow':
        return this.generateCompleteProject();
      
      case 'batch_operations':
        return this.generateBatchProjects(10);
      
      case 'edge_cases':
        return this.generateBoundaryTestData();
      
      case 'negative_testing':
        return this.generateInvalidProject();
      
      case 'performance':
        return this.generatePerformanceTestData(50);
      
      default:
        return this.generateCompleteProject();
    }
  }
}

module.exports = { SOProjectTestData };