/**
 * 销售订单（SO Order）测试数据生成器
 * 基于实际业务需求生成测试数据，支持中文业务场景
 */

const faker = require('faker');

// 设置中文语言环境
faker.locale = 'zh_CN';

class SOOrderTestData {
  /**
   * 生成基础销售订单数据
   */
  static generateBasicOrder() {
    const timestamp = Date.now();
    const orderCode = `SO${timestamp.toString().slice(-8)}`;
    
    return {
      orderCode: orderCode,
      orderType: faker.random.arrayElement(['标准销售', '预售订单', '代销订单', '退货订单']),
      sellerCode: 'SELLER001',
      sellerName: '主体企业销售公司',
      customerCode: `CUST${faker.datatype.number({ min: 10000, max: 99999 })}`,
      customerName: `${faker.company.companyName()}有限公司`,
      orderDate: faker.date.recent(30).toISOString().split('T')[0],
      deliveryDate: faker.date.future(0.5).toISOString().split('T')[0],
      deliveryAddress: faker.address.city() + faker.address.streetName() + faker.datatype.number({ min: 1, max: 999 }) + '号',
      contactPerson: faker.name.findName(),
      contactPhone: faker.phone.phoneNumber('1##########'),
      totalAmount: faker.datatype.number({ min: 10000, max: 1000000, precision: 0.01 }),
      status: faker.random.arrayElement(['草稿', '待审批', '已审批', '执行中', '已完成', '已取消']),
      remark: faker.lorem.sentence()
    };
  }

  /**
   * 生成完整销售订单数据
   */
  static generateCompleteOrder() {
    const basicData = this.generateBasicOrder();
    
    return {
      ...basicData,
      paymentInfo: this.generatePaymentInfo(),
      deliveryInfo: this.generateDeliveryInfo(),
      orderDetails: this.generateOrderDetails(faker.datatype.number({ min: 1, max: 5 })),
      approvalInfo: this.generateApprovalInfo(),
      financialInfo: this.generateFinancialInfo(),
      attachments: this.generateAttachmentPaths(faker.datatype.number({ min: 0, max: 3 }))
    };
  }

  /**
   * 生成支付信息
   */
  static generatePaymentInfo() {
    return {
      paymentMethod: faker.random.arrayElement(['现金支付', '银行转账', '支票支付', '承兑汇票', '信用证']),
      paymentTerms: faker.random.arrayElement(['预付款', '货到付款', '月结30天', '月结60天', '月结90天']),
      creditLimit: faker.datatype.number({ min: 100000, max: 5000000, precision: 0.01 }),
      accountPeriod: faker.datatype.number({ min: 0, max: 90 }),
      bankAccount: faker.finance.account(),
      bankName: `${faker.company.companyName()}银行${faker.address.city()}分行`
    };
  }

  /**
   * 生成配送信息
   */
  static generateDeliveryInfo() {
    return {
      deliveryMethod: faker.random.arrayElement(['自提', '送货上门', '第三方物流', '快递配送']),
      carrierName: faker.random.arrayElement(['顺丰速运', '圆通快递', '中通快递', '申通快递', '韵达快递']),
      estimatedDeliveryTime: faker.datatype.number({ min: 1, max: 15 }),
      deliveryFee: faker.datatype.number({ min: 0, max: 500, precision: 0.01 }),
      trackingNumber: `TK${faker.datatype.number({ min: 100000000, max: 999999999 })}`,
      deliveryInstructions: faker.lorem.sentence()
    };
  }

  /**
   * 生成订单明细列表
   * @param {number} count - 明细数量
   */
  static generateOrderDetails(count = 3) {
    const details = [];
    
    for (let i = 0; i < count; i++) {
      const qty = faker.datatype.number({ min: 1, max: 1000 });
      const unitPrice = faker.datatype.number({ min: 10, max: 10000, precision: 0.01 });
      const discount = faker.datatype.number({ min: 0, max: 0.2, precision: 0.01 });
      const taxRate = faker.random.arrayElement([0.06, 0.09, 0.13, 0.16]);
      const lineTotal = qty * unitPrice * (1 - discount);
      
      details.push({
        lineNumber: i + 1,
        goodsCode: `SKU${faker.datatype.number({ min: 100000, max: 999999 })}`,
        goodsName: faker.commerce.productName(),
        specification: faker.commerce.productAdjective(),
        unit: faker.random.arrayElement(['件', '箱', '台', '套', 'kg', 'm']),
        qty: qty,
        unitPrice: unitPrice,
        discount: discount,
        discountAmount: qty * unitPrice * discount,
        lineTotal: lineTotal,
        taxRate: taxRate,
        taxAmount: lineTotal * taxRate,
        totalAmount: lineTotal + (lineTotal * taxRate),
        warehouseCode: `WH${faker.datatype.number({ min: 100, max: 999 })}`,
        warehouseName: `${faker.address.city()}仓库`,
        batchNumber: `BATCH${faker.datatype.number({ min: 100000, max: 999999 })}`,
        expiryDate: faker.date.future(1).toISOString().split('T')[0],
        remark: faker.lorem.sentence()
      });
    }
    
    return details;
  }

  /**
   * 生成审批信息
   */
  static generateApprovalInfo() {
    return {
      approvalStatus: faker.random.arrayElement(['待审批', '审批中', '已通过', '已驳回', '已撤回']),
      submittedBy: faker.name.findName(),
      submittedAt: faker.date.recent(7).toISOString(),
      approvedBy: faker.name.findName(),
      approvedAt: faker.date.recent(5).toISOString(),
      approvalComments: this.generateApprovalComments(),
      nextApprover: faker.name.findName(),
      approvalLevel: faker.datatype.number({ min: 1, max: 3 }),
      totalLevels: 3
    };
  }

  /**
   * 生成财务信息
   */
  static generateFinancialInfo() {
    return {
      grossAmount: faker.datatype.number({ min: 10000, max: 1000000, precision: 0.01 }),
      discountAmount: faker.datatype.number({ min: 0, max: 10000, precision: 0.01 }),
      netAmount: faker.datatype.number({ min: 9000, max: 990000, precision: 0.01 }),
      taxAmount: faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
      totalAmount: faker.datatype.number({ min: 10000, max: 1100000, precision: 0.01 }),
      paidAmount: faker.datatype.number({ min: 0, max: 500000, precision: 0.01 }),
      outstandingAmount: faker.datatype.number({ min: 0, max: 600000, precision: 0.01 }),
      currency: 'CNY',
      exchangeRate: 1.0
    };
  }

  /**
   * 生成审批意见
   */
  static generateApprovalComments() {
    const comments = [
      '订单信息完整，客户资质良好，同意审批通过',
      '商品价格合理，交货期可接受，建议通过',
      '客户信用额度充足，订单金额在授权范围内',
      '需要进一步确认库存情况后再审批',
      '建议与财务部门确认客户账期政策',
      '订单金额较大，建议提交上级审批',
      '客户首次合作，建议要求预付款',
      '商品规格需要与技术部门再次确认'
    ];
    
    return faker.random.arrayElement(comments);
  }

  /**
   * 生成附件文件路径（模拟）
   * @param {number} count - 附件数量
   */
  static generateAttachmentPaths(count = 2) {
    const attachments = [];
    const fileTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'];
    const fileNames = ['销售合同', '技术规格书', '报价单', '客户资质证明', '产品图片'];
    
    for (let i = 0; i < count; i++) {
      const fileType = faker.random.arrayElement(fileTypes);
      const fileName = faker.random.arrayElement(fileNames);
      attachments.push(`/uploads/soorder/${fileName}-${i + 1}.${fileType}`);
    }
    
    return attachments;
  }

  /**
   * 生成搜索条件
   */
  static generateSearchCriteria() {
    return {
      orderCode: `SO${faker.datatype.number({ min: 10000000, max: 99999999 })}`,
      customerName: faker.company.companyName(),
      customerCode: `CUST${faker.datatype.number({ min: 10000, max: 99999 })}`,
      status: faker.random.arrayElement(['草稿', '待审批', '已审批', '执行中', '已完成']),
      orderDateFrom: faker.date.past(1).toISOString().split('T')[0],
      orderDateTo: faker.date.recent(1).toISOString().split('T')[0],
      goodsName: faker.commerce.productName(),
      goodsCode: `SKU${faker.datatype.number({ min: 100000, max: 999999 })}`,
      amountFrom: faker.datatype.number({ min: 1000, max: 50000 }),
      amountTo: faker.datatype.number({ min: 50000, max: 1000000 })
    };
  }

  /**
   * 生成批量订单数据
   * @param {number} count - 订单数量
   */
  static generateBatchOrders(count = 10) {
    const orders = [];
    
    for (let i = 0; i < count; i++) {
      orders.push(this.generateCompleteOrder());
    }
    
    return orders;
  }

  /**
   * 生成特定状态的订单数据
   * @param {string} status - 订单状态
   */
  static generateOrderWithStatus(status) {
    const order = this.generateCompleteOrder();
    order.status = status;
    order.approvalInfo.approvalStatus = this.getApprovalStatusByOrderStatus(status);
    
    return order;
  }

  /**
   * 根据订单状态获取审批状态
   * @param {string} orderStatus - 订单状态
   */
  static getApprovalStatusByOrderStatus(orderStatus) {
    const statusMap = {
      '草稿': '待提交',
      '待审批': '待审批',
      '已审批': '已通过',
      '执行中': '已通过',
      '已完成': '已通过',
      '已取消': '已撤回'
    };
    
    return statusMap[orderStatus] || '待审批';
  }

  /**
   * 生成订单修改数据
   * @param {Object} originalOrder - 原始订单数据
   */
  static generateModifiedOrder(originalOrder) {
    return {
      ...originalOrder,
      deliveryAddress: faker.address.city() + faker.address.streetName() + faker.datatype.number({ min: 1, max: 999 }) + '号',
      contactPhone: faker.phone.phoneNumber('1##########'),
      remark: originalOrder.remark + ' - 已修改',
      totalAmount: originalOrder.totalAmount * 1.05, // 增加5%
      orderDetails: originalOrder.orderDetails.map(detail => ({
        ...detail,
        qty: detail.qty + faker.datatype.number({ min: 1, max: 10 })
      }))
    };
  }

  /**
   * 生成无效的订单数据（用于负面测试）
   */
  static generateInvalidOrder() {
    return {
      orderCode: '', // 空订单编号
      customerName: '', // 空客户名称
      customerCode: '', // 空客户编码
      orderDate: 'invalid-date', // 无效日期
      totalAmount: -1000, // 负数金额
      deliveryDate: '1990-01-01', // 过去日期
      contactPhone: '123', // 无效电话号码
      orderDetails: [] // 空订单明细
    };
  }

  /**
   * 生成边界值测试数据
   */
  static generateBoundaryTestData() {
    return {
      maxLengthCustomerName: 'A'.repeat(200), // 最大长度客户名称
      maxQty: 999999, // 最大数量
      maxUnitPrice: 99999999.99, // 最大单价
      maxTotalAmount: 999999999.99, // 最大总金额
      minValues: {
        qty: 1,
        unitPrice: 0.01,
        totalAmount: 0.01
      },
      specialCharacters: {
        customerName: '<script>alert("test")</script>',
        remark: '特殊字符测试!@#$%^&*()_+-=[]{}|;:,.<>?'
      }
    };
  }

  /**
   * 生成性能测试数据
   * @param {number} count - 数据量
   */
  static generatePerformanceTestData(count = 100) {
    console.log(`生成 ${count} 条销售订单性能测试数据...`);
    
    const startTime = Date.now();
    const orders = this.generateBatchOrders(count);
    const endTime = Date.now();
    
    console.log(`销售订单数据生成完成，耗时 ${endTime - startTime}ms`);
    
    return orders;
  }

  /**
   * 生成特定场景的测试数据
   * @param {string} scenario - 测试场景
   */
  static generateScenarioData(scenario) {
    this.resetCounters();
    
    switch (scenario) {
      case 'smoke':
        return this.generateBasicOrder();
      
      case 'complete_workflow':
        return this.generateCompleteOrder();
      
      case 'batch_operations':
        return this.generateBatchOrders(10);
      
      case 'edge_cases':
        return this.generateBoundaryTestData();
      
      case 'negative_testing':
        return this.generateInvalidOrder();
      
      case 'performance':
        return this.generatePerformanceTestData(50);
      
      case 'approval_workflow':
        return [
          this.generateOrderWithStatus('草稿'),
          this.generateOrderWithStatus('待审批'),
          this.generateOrderWithStatus('已审批'),
          this.generateOrderWithStatus('执行中'),
          this.generateOrderWithStatus('已完成')
        ];
      
      case 'financial_validation':
        const order = this.generateCompleteOrder();
        order.financialInfo.outstandingAmount = order.financialInfo.totalAmount - order.financialInfo.paidAmount;
        return order;
      
      default:
        return this.generateCompleteOrder();
    }
  }

  /**
   * 重置测试数据计数器（用于确保数据唯一性）
   */
  static resetCounters() {
    faker.seed(Date.now());
  }

  /**
   * 生成页签状态测试数据
   */
  static generateTabTestData() {
    return {
      initialState: {
        showMain: true,
        showNew: false,
        showUpdate: false,
        showView: false,
        showApprove: false,
        showOutplanNew: false,
        showSettlementNew: false,
        showCargoRightTransferNew: false
      },
      newTabState: {
        showMain: false,
        showNew: true,
        showUpdate: false,
        showView: false,
        showApprove: false,
        showOutplanNew: false,
        showSettlementNew: false,
        showCargoRightTransferNew: false
      },
      viewTabState: {
        showMain: false,
        showNew: false,
        showUpdate: false,
        showView: true,
        showApprove: false,
        showOutplanNew: false,
        showSettlementNew: false,
        showCargoRightTransferNew: false
      }
    };
  }

  /**
   * 生成操作事件测试数据
   */
  static generateOperationEventData() {
    return {
      viewEvent: {
        data: this.generateCompleteOrder(),
        operate_tab_info: {
          name: '销售订单-查看',
          showView: true
        },
        editStatus: 'view'
      },
      newEvent: {
        data: {},
        operate_tab_info: {
          name: '销售订单-新增',
          showNew: true
        },
        editStatus: 'new'
      },
      updateEvent: {
        data: this.generateCompleteOrder(),
        operate_tab_info: {
          name: '销售订单-修改',
          showUpdate: true
        },
        editStatus: 'edit',
        modifyReason: '客户要求修改交货地址'
      },
      approveEvent: {
        data: this.generateCompleteOrder(),
        editStatus: 'approve',
        enableCancel: true
      }
    };
  }
}

module.exports = { SOOrderTestData };