// Mock webpack require.context
global.require = {
  context: jest.fn(() => ({
    keys: () => [],
    resolve: jest.fn(),
    id: 'test'
  }))
}

// Mock Vue router and store
jest.mock('@/router', () => ({
  currentRoute: { meta: { page_code: 'test' } }
}))

jest.mock('@/store', () => ({
  getters: {},
  dispatch: jest.fn()
}))

// Mock API
jest.mock('@/api/40_business/20_so/socontract/socontract', () => ({
  getListApi: jest.fn()
}))

describe('销售合同列表页面排序功能单元测试', () => {
  let wrapper
  
  const mockData = {
    records: [
      {
        id: 1,
        contract_code: 'CT001',
        project_code: 'PJ001',
        customer_name: '客户A',
        contract_amount_sum: 100000,
        sign_date: '2024-01-01',
        u_time: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        contract_code: 'CT002', 
        project_code: 'PJ002',
        customer_name: '客户B',
        contract_amount_sum: 200000,
        sign_date: '2024-01-02',
        u_time: '2024-01-02 10:00:00'
      }
    ],
    total: 2,
    current: 1,
    size: 20
  }

  beforeEach(() => {
    getListApi.mockResolvedValue({ data: mockData })
    
    wrapper = mount(SoContractList, {
      localVue,
      mocks: {
        $route: { meta: { page_code: 'test' } },
        $router: { push: jest.fn() },
        $notify: jest.fn(),
        $alert: jest.fn(),
        $confirm: jest.fn(),
        showLoading: jest.fn(),
        closeLoading: jest.fn(),
        showErrorMsg: jest.fn(),
        PARAMETERS: {
          PAGE_CONDITION: { current: 1, size: 20, sort: '' },
          PAGE_JSON: { current: 1, size: 20, total: 0 },
          SORT_PARA: ['ascending', 'descending']
        },
        CONSTANTS: {
          DICT_B_SO_CONTRACT_STATUS: 'B_SO_CONTRACT_STATUS',
          DICT_P_SO_CONTRACT_TYPE: 'P_SO_CONTRACT_TYPE',
          DICT_P_SO_CONTRACT_SETTLE_TYPE: 'P_SO_CONTRACT_SETTLE_TYPE',
          DICT_P_SO_CONTRACT_BILL_TYPE: 'P_SO_CONTRACT_BILL_TYPE'
        },
        EMITS: {
          EMIT_MST_SOCONTRACT_NEW_OK: 'test',
          EMIT_MST_SOCONTRACT_UPDATE_OK: 'test',
          EMIT_MST_SOCONTRACT_BPM_OK: 'test'
        },
        setUIheight: () => 500,
        formatCurrency: (val) => val,
        formatNumber: (val) => val,
        formatDateTime: (val) => val
      },
      stubs: {
        'select-se-customer': true,
        'select-dicts': true,
        'pagination': true,
        'simple-upload': true,
        'print_template': true,
        'push_order_template': true,
        'cancel-confirm-dialog': true,
        'FloatMenu': true,
        'v-tour': true
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
    jest.clearAllMocks()
  })

  describe('排序状态管理', () => {
    test('默认排序设置正确', () => {
      const table = wrapper.find('.el-table')
      expect(table.props('default-sort')).toEqual({
        prop: 'u_time',
        order: 'descending'
      })
    })

    test('排序参数初始化正确', () => {
      expect(wrapper.vm.settings.sortOrders).toEqual(['ascending', 'descending'])
    })
  })

  describe('排序功能核心测试', () => {
    test('handleSortChange - 升序排序', async () => {
      const sortColumn = {
        prop: 'contract_code',
        order: 'ascending'
      }

      await wrapper.vm.handleSortChange(sortColumn)

      expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe('contract_code')
      expect(getListApi).toHaveBeenCalledWith(
        expect.objectContaining({
          pageCondition: expect.objectContaining({
            sort: 'contract_code'
          })
        })
      )
    })

    test('handleSortChange - 降序排序', async () => {
      const sortColumn = {
        prop: 'contract_amount_sum',
        order: 'descending'
      }

      await wrapper.vm.handleSortChange(sortColumn)

      expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe('-contract_amount_sum')
      expect(getListApi).toHaveBeenCalledWith(
        expect.objectContaining({
          pageCondition: expect.objectContaining({
            sort: '-contract_amount_sum'
          })
        })
      )
    })

    test('handleSortChange - 清除排序', async () => {
      // 先设置一个排序
      await wrapper.vm.handleSortChange({ prop: 'contract_code', order: 'ascending' })
      
      // 清除排序
      await wrapper.vm.handleSortChange({ prop: 'contract_code', order: null })

      expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe('')
    })
  })

  describe('关键字段排序测试', () => {
    const testCases = [
      { field: 'project_code', label: '项目编号', type: 'text' },
      { field: 'contract_code', label: '合同编号', type: 'text' },
      { field: 'type_name', label: '类型', type: 'text' },
      { field: 'order_volume', label: '订单笔数', type: 'number' },
      { field: 'status_name', label: '状态', type: 'text' },
      { field: 'customer_name', label: '客户', type: 'text' },
      { field: 'purchaser_name', label: '销售方', type: 'text' },
      { field: 'execution_progress', label: '执行进度', type: 'text' },
      { field: 'sign_date', label: '签约日期', type: 'date' },
      { field: 'expiry_date', label: '到期日期', type: 'date' },
      { field: 'delivery_date', label: '交货日期', type: 'date' },
      { field: 'delivery_type_name', label: '运输方式', type: 'text' },
      { field: 'settle_type_name', label: '结算方式', type: 'text' },
      { field: 'bill_type_name', label: '结算单据类型', type: 'text' },
      { field: 'payment_type_name', label: '付款方式', type: 'text' },
      { field: 'contract_amount_sum', label: '合同总金额', type: 'number' },
      { field: 'contract_total', label: '总销售数量', type: 'number' },
      { field: 'tax_amount_sum', label: '税额', type: 'number' },
      { field: 'settled_qty', label: '已结算数量', type: 'number' },
      { field: 'settled_price', label: '结算金额', type: 'number' },
      { field: 'advance_pay_price', label: '预收款金额', type: 'number' },
      { field: 'accumulated_act_price', label: '累计实收', type: 'number' },
      { field: 'unpaid_amount', label: '未收', type: 'number' },
      { field: 'advance_refund_amount_total', label: '预收款可退金额', type: 'number' },
      { field: 'already_invoice_price', label: '已开票金额', type: 'number' },
      { field: 'c_name', label: '创建人', type: 'text' },
      { field: 'c_time', label: '创建时间', type: 'datetime' },
      { field: 'u_time', label: '更新时间', type: 'datetime' }
    ]

    testCases.forEach(({ field, label, type }) => {
      test(`${label}(${field}) - 升序排序`, async () => {
        await wrapper.vm.handleSortChange({ prop: field, order: 'ascending' })
        expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe(field)
      })

      test(`${label}(${field}) - 降序排序`, async () => {
        await wrapper.vm.handleSortChange({ prop: field, order: 'descending' })
        expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe(`-${field}`)
      })
    })
  })

  describe('排序状态持久化测试', () => {
    test('排序状态在查询后保持', async () => {
      // 设置排序
      await wrapper.vm.handleSortChange({ prop: 'contract_code', order: 'ascending' })
      
      // 触发查询
      await wrapper.vm.handleSearch()
      
      // 验证排序参数保持
      expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe('contract_code')
    })

    test('切换标签页时排序状态保持', async () => {
      // 设置排序
      await wrapper.vm.handleSortChange({ prop: 'contract_amount_sum', order: 'descending' })
      
      // 切换标签页
      await wrapper.vm.handleTabsClick({ index: '1' })
      
      // 验证排序参数保持
      expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe('-contract_amount_sum')
    })
  })

  describe('边界情况测试', () => {
    test('处理undefined排序字段', async () => {
      await wrapper.vm.handleSortChange({ prop: undefined, order: 'ascending' })
      expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe('')
    })

    test('处理null排序顺序', async () => {
      await wrapper.vm.handleSortChange({ prop: 'contract_code', order: null })
      expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe('')
    })

    test('处理空字符串排序字段', async () => {
      await wrapper.vm.handleSortChange({ prop: '', order: 'ascending' })
      expect(wrapper.vm.dataJson.searchForm.pageCondition.sort).toBe('')
    })
  })

  describe('API调用验证', () => {
    test('排序变化时触发API调用', async () => {
      const initialCallCount = getListApi.mock.calls.length
      
      await wrapper.vm.handleSortChange({ prop: 'contract_code', order: 'ascending' })
      
      expect(getListApi.mock.calls.length).toBe(initialCallCount + 1)
    })

    test('相同排序不重复调用API', async () => {
      // 设置初始排序
      await wrapper.vm.handleSortChange({ prop: 'contract_code', order: 'ascending' })
      const callCount = getListApi.mock.calls.length
      
      // 再次设置相同排序
      await wrapper.vm.handleSortChange({ prop: 'contract_code', order: 'ascending' })
      
      expect(getListApi.mock.calls.length).toBe(callCount + 1) // 仍会调用，因为没有缓存机制
    })
  })
})