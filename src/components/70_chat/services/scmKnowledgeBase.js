/**
 * SCM业务知识库
 * 提供SCM相关业务知识和操作指导
 */

class SCMKnowledgeBase {
  constructor () {
    this.knowledgeBase = this.initializeKnowledgeBase()
    this.businessModules = this.initializeBusinessModules()
    this.operationGuides = this.initializeOperationGuides()
  }

  /**
   * 根据关键词搜索知识库
   * @param {string} query - 搜索关键词
   * @returns {Array} 匹配的知识条目
   */
  searchKnowledge (query) {
    const results = []
    const keywords = query.toLowerCase().split(/\s+/)

    // 搜索知识库
    this.knowledgeBase.forEach(item => {
      const score = this.calculateRelevanceScore(item, keywords)
      if (score > 0) {
        results.push({ ...item, relevanceScore: score })
      }
    })

    // 按相关性排序
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5)
  }

  /**
   * 获取业务模块信息
   * @param {string} moduleName - 模块名称
   * @returns {Object} 模块信息
   */
  getModuleInfo (moduleName) {
    return this.businessModules[moduleName] || null
  }

  /**
   * 获取操作指导
   * @param {string} operation - 操作类型
   * @returns {Object} 操作指导信息
   */
  getOperationGuide (operation) {
    return this.operationGuides[operation] || null
  }

  /**
   * 获取常见问题及解答
   * @param {string} category - 问题分类
   * @returns {Array} FAQ列表
   */
  getFAQ (category = 'all') {
    const faqs = {
      purchase: [
        {
          question: '如何创建采购订单？',
          answer: '进入采购管理模块 → 点击"新建采购订单" → 填写供应商信息 → 添加采购商品 → 提交审批',
          steps: [
            '登录SCM系统',
            '进入"采购管理"模块',
            '点击"采购订单"菜单',
            '点击"新建"按钮',
            '选择供应商',
            '添加采购商品明细',
            '确认订单信息',
            '提交审批流程'
          ],
          relatedLinks: [
            { text: '供应商管理', path: '/purchase/supplier' },
            { text: '采购审批', path: '/bpm/purchase-approval' }
          ]
        },
        {
          question: '采购订单审批流程是什么？',
          answer: '采购订单提交后会进入审批流程：部门主管审批 → 财务审批 → 总经理审批（金额>10万）',
          steps: [
            '提交采购申请',
            '部门主管审批（必须）',
            '财务部门审批（必须）',
            '总经理审批（金额≥10万元）',
            '审批通过后生成正式采购订单',
            '供应商确认订单',
            '安排发货'
          ]
        }
      ],
      inventory: [
        {
          question: '库存不足怎么处理？',
          answer: '发现库存不足时，系统会自动预警。可以通过采购补货、调拨等方式处理。',
          steps: [
            '检查库存预警信息',
            '分析库存不足原因',
            '确定补货需求量',
            '选择补货方式（采购/调拨）',
            '创建采购申请或调拨单',
            '跟踪补货进度',
            '确认库存恢复正常'
          ]
        }
      ],
      warehouse: [
        {
          question: '出库流程是什么？',
          answer: '出库需要先有出库申请，经过审批后执行出库操作，最后更新库存。',
          steps: [
            '创建出库申请单',
            '填写出库商品明细',
            '提交部门主管审批',
            '仓库管理员确认库存',
            '执行出库操作',
            '打印出库单据',
            '更新库存数据',
            '通知相关人员'
          ]
        }
      ]
    }

    if (category === 'all') {
      return Object.values(faqs).flat()
    }

    return faqs[category] || []
  }

  /**
   * 获取错误码解释
   * @param {string} errorCode - 错误码
   * @returns {Object} 错误信息和解决方案
   */
  getErrorSolution (errorCode) {
    const errorSolutions = {
      'SCM_001': {
        description: '供应商信息不完整',
        solution: '请检查供应商的基本信息、联系方式、银行账户等是否完整填写',
        steps: ['进入供应商管理', '选择对应供应商', '补充完整信息', '保存并审核']
      },
      'SCM_002': {
        description: '库存数量不足',
        solution: '当前库存不足以支持此次出库操作，请先补充库存或调整出库数量',
        steps: ['检查当前库存', '确认实际需求', '补充库存或调整数量', '重新提交出库申请']
      },
      'SCM_003': {
        description: '审批流程异常',
        solution: '审批流程中断或配置错误，请联系系统管理员检查流程配置',
        steps: ['确认审批节点', '检查审批人员', '重新提交审批', '联系管理员']
      }
    }

    return errorSolutions[errorCode] || {
      description: '未知错误',
      solution: '请联系系统管理员或技术支持',
      steps: ['记录错误信息', '联系技术支持', '提供详细描述']
    }
  }

  /**
   * 初始化知识库
   * @private
   */
  initializeKnowledgeBase () {
    return [
      {
        id: 'kb_001',
        title: '采购订单创建',
        content: '采购订单是向供应商采购商品的正式文件，需要包含商品明细、价格、交期等信息。',
        keywords: ['采购', '订单', '创建', '供应商'],
        category: 'purchase',
        tags: ['基础操作', '采购管理']
      },
      {
        id: 'kb_002',
        title: '库存管理要点',
        content: '库存管理包括入库、出库、盘点、调拨等操作，需要确保数据准确性。',
        keywords: ['库存', '管理', '入库', '出库', '盘点'],
        category: 'inventory',
        tags: ['库存管理', '仓储']
      },
      {
        id: 'kb_003',
        title: '供应商资质审核',
        content: '新供应商需要提供营业执照、税务登记证、银行开户许可证等资质文件。',
        keywords: ['供应商', '资质', '审核', '证件'],
        category: 'supplier',
        tags: ['供应商管理', '资质审核']
      },
      {
        id: 'kb_004',
        title: '质检流程规范',
        content: '入库商品需要进行质量检验，包括外观检查、数量核对、规格确认等步骤。',
        keywords: ['质检', '流程', '入库', '检验'],
        category: 'quality',
        tags: ['质量管理', '入库流程']
      },
      {
        id: 'kb_005',
        title: '报表查询方法',
        content: '系统提供多种报表查询功能，可以按时间、部门、商品等维度进行数据分析。',
        keywords: ['报表', '查询', '统计', '分析'],
        category: 'report',
        tags: ['数据分析', '报表系统']
      }
    ]
  }

  /**
   * 初始化业务模块
   * @private
   */
  initializeBusinessModules () {
    return {
      purchase: {
        name: '采购管理',
        description: '管理采购订单、供应商、采购计划等采购相关业务',
        subModules: [
          { name: '采购订单', path: '/purchase/order' },
          { name: '供应商管理', path: '/purchase/supplier' },
          { name: '采购计划', path: '/purchase/plan' },
          { name: '采购审批', path: '/bpm/purchase-approval' }
        ],
        commonOperations: [
          '创建采购订单',
          '供应商资质审核',
          '采购价格管理',
          '采购合同管理'
        ]
      },
      inventory: {
        name: '库存管理',
        description: '管理商品库存、入库、出库、盘点等仓储业务',
        subModules: [
          { name: '库存查询', path: '/inventory/stock' },
          { name: '入库管理', path: '/inventory/inbound' },
          { name: '出库管理', path: '/inventory/outbound' },
          { name: '库存盘点', path: '/inventory/stocktake' }
        ],
        commonOperations: [
          '商品入库',
          '商品出库',
          '库存调拨',
          '库存盘点'
        ]
      },
      warehouse: {
        name: '仓储管理',
        description: '管理仓库、货位、库存分布等仓储设施',
        subModules: [
          { name: '仓库管理', path: '/warehouse/manage' },
          { name: '货位管理', path: '/warehouse/location' },
          { name: '库存分布', path: '/warehouse/distribution' }
        ],
        commonOperations: [
          '仓库设置',
          '货位规划',
          '库存分配',
          '仓储优化'
        ]
      }
    }
  }

  /**
   * 初始化操作指导
   * @private
   */
  initializeOperationGuides () {
    return {
      create_purchase_order: {
        title: '创建采购订单',
        description: '创建新的采购订单的详细操作步骤',
        steps: [
          {
            step: 1,
            title: '进入采购管理模块',
            description: '从主菜单选择"采购管理" → "采购订单"',
            screenshot: '/help/screenshots/purchase-menu.png'
          },
          {
            step: 2,
            title: '点击新建按钮',
            description: '在采购订单列表页面，点击"新建"按钮',
            screenshot: '/help/screenshots/purchase-new.png'
          },
          {
            step: 3,
            title: '填写基本信息',
            description: '选择供应商，填写采购日期、交货日期等基本信息',
            tips: '确保供应商信息准确，交货日期要合理'
          },
          {
            step: 4,
            title: '添加商品明细',
            description: '点击"添加商品"按钮，选择需要采购的商品并填写数量、单价',
            tips: '仔细核对商品规格和价格'
          },
          {
            step: 5,
            title: '确认并提交',
            description: '检查所有信息无误后，点击"保存并提交审批"',
            tips: '提交后将进入审批流程，无法直接修改'
          }
        ],
        preconditions: [
          '已完成供应商资质审核',
          '商品信息已录入系统',
          '采购权限已开通'
        ],
        notes: [
          '采购订单一旦提交审批，不能直接修改',
          '超过一定金额需要多级审批',
          '建议先保存草稿，确认无误后再提交'
        ]
      },
      stock_inbound: {
        title: '商品入库操作',
        description: '将采购的商品进行入库登记的操作流程',
        steps: [
          {
            step: 1,
            title: '查找入库单',
            description: '在入库管理页面找到对应的入库通知单'
          },
          {
            step: 2,
            title: '确认商品信息',
            description: '核对商品规格、数量、生产日期等信息'
          },
          {
            step: 3,
            title: '质量检验',
            description: '按照质检标准对商品进行检验'
          },
          {
            step: 4,
            title: '分配货位',
            description: '为商品分配合适的仓储货位'
          },
          {
            step: 5,
            title: '确认入库',
            description: '完成入库操作，更新库存数据'
          }
        ]
      }
    }
  }

  /**
   * 计算相关性得分
   * @private
   */
  calculateRelevanceScore (item, keywords) {
    let score = 0
    const text = (item.title + ' ' + item.content + ' ' + item.keywords.join(' ')).toLowerCase()

    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1
        // 标题匹配得分更高
        if (item.title.toLowerCase().includes(keyword)) {
          score += 2
        }
        // 关键词精确匹配得分更高
        if (item.keywords.some(k => k.includes(keyword))) {
          score += 1
        }
      }
    })

    return score
  }

  /**
   * 获取智能建议
   * @param {string} userInput - 用户输入
   * @param {Object} context - 上下文信息
   * @returns {Object} 智能建议
   */
  getSmartSuggestions (userInput, context = {}) {
    const suggestions = {
      quickActions: [],
      relatedModules: [],
      helpLinks: []
    }

    // 根据输入内容分析用户意图
    const intent = this.analyzeUserIntent(userInput)

    switch (intent.type) {
      case 'create_order':
        suggestions.quickActions.push({
          text: '创建采购订单',
          action: 'navigate',
          target: '/purchase/order/new'
        })
        suggestions.relatedModules.push('purchase')
        break

      case 'check_inventory':
        suggestions.quickActions.push({
          text: '查看库存报表',
          action: 'navigate',
          target: '/inventory/report'
        })
        suggestions.relatedModules.push('inventory')
        break

      case 'process_help':
        suggestions.helpLinks.push({
          text: '查看操作指南',
          action: 'open_help',
          target: 'operation_guide'
        })
        break
    }

    return suggestions
  }

  /**
   * 分析用户意图
   * @private
   */
  analyzeUserIntent (userInput) {
    const input = userInput.toLowerCase()

    if (input.includes('创建') || input.includes('新建')) {
      if (input.includes('采购') || input.includes('订单')) {
        return { type: 'create_order', confidence: 0.9 }
      }
    }

    if (input.includes('库存') || input.includes('数量')) {
      return { type: 'check_inventory', confidence: 0.8 }
    }

    if (input.includes('怎么') || input.includes('如何') || input.includes('流程')) {
      return { type: 'process_help', confidence: 0.7 }
    }

    return { type: 'general', confidence: 0.5 }
  }
}

// 创建单例实例
const scmKnowledgeBase = new SCMKnowledgeBase()

export default scmKnowledgeBase
export { SCMKnowledgeBase }
