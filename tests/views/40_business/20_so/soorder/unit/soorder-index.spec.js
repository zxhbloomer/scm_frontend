/**
 * 销售订单主页面（index.vue）单元测试
 * 测试 Tab 切换、状态管理、事件处理等核心功能
 */

import { shallowMount, createLocalVue } from '@vue/test-utils';
import ElementUI from 'element-ui';
import SOOrderIndex from '@/views/40_business/20_so/soorder/index.vue';
import { SOOrderTestData } from '../../../../utils/soorder-test-data';

const localVue = createLocalVue();
localVue.use(ElementUI);

// Mock 子组件
const mockComponents = {
  list_template: { template: '<div class="mock-list-template">销售订单列表</div>' },
  new_template: { template: '<div class="mock-new-template">新增订单</div>' },
  update_template: { template: '<div class="mock-update-template">修改订单</div>' },
  detail_template: { template: '<div class="mock-detail-template">查看订单</div>' },
  approve_template: { template: '<div class="mock-approve-template">审批订单</div>' },
  outplan_new_template: { template: '<div class="mock-outplan-template">出库计划</div>' },
  settlement_new_template: { template: '<div class="mock-settlement-template">结算单</div>' },
  cargo_right_transfer_new_template: { template: '<div class="mock-cargo-template">货权转移</div>' }
};

// Mock mixin
const mockResizeMixin = {
  mounted() {},
  methods: {
    setUIheight() {}
  }
};

describe('销售订单主页面', () => {
  let wrapper;
  let testData;

  beforeEach(() => {
    testData = SOOrderTestData.generateScenarioData('complete_workflow');
    
    wrapper = shallowMount(SOOrderIndex, {
      localVue,
      propsData: {
        height: 600
      },
      stubs: mockComponents,
      mixins: [mockResizeMixin],
      mocks: {
        $route: {
          meta: {
            page_code: 'soorder'
          }
        },
        $nextTick: (fn) => fn && fn(),
        $refs: {
          refTabs: {
            $el: {
              children: [
                { style: { margin: 0, display: 'block' } }
              ]
            }
          }
        },
        $routerTab: {
          updateTabTitle: jest.fn()
        }
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  describe('组件初始化', () => {
    test('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.el-tabs').exists()).toBe(true);
    });

    test('应该有正确的初始数据状态', () => {
      const data = wrapper.vm.$data;
      
      expect(data.dataJson.tab.showMain).toBe(true);
      expect(data.dataJson.tab.showNew).toBe(false);
      expect(data.dataJson.tab.showUpdate).toBe(false);
      expect(data.dataJson.tab.showView).toBe(false);
      expect(data.dataJson.tab.showApprove).toBe(false);
      expect(data.settings.tabs.activeName).toBe('main');
    });

    test('应该正确设置组件属性', () => {
      expect(wrapper.props('height')).toBe(600);
    });

    test('应该渲染主列表标签页', () => {
      const mainTab = wrapper.find('el-tab-pane-stub[name="main"]');
      expect(mainTab.exists()).toBe(true);
      expect(mainTab.find('.mock-list-template').exists()).toBe(true);
    });
  });

  describe('Tab 状态管理', () => {
    test('应该正确切换到新增页签', async () => {
      const eventData = SOOrderTestData.generateOperationEventData().newEvent;
      
      await wrapper.vm.handleNew(eventData);
      
      expect(wrapper.vm.dataJson.tab.showNew).toBe(true);
      expect(wrapper.vm.dataJson.tab.showMain).toBe(false);
      expect(wrapper.vm.settings.tabs.activeName).toBe('edit');
    });

    test('应该正确切换到查看页签', async () => {
      const eventData = SOOrderTestData.generateOperationEventData().viewEvent;
      
      await wrapper.vm.handleView(eventData);
      
      expect(wrapper.vm.dataJson.tab.showView).toBe(true);
      expect(wrapper.vm.dataJson.tab.showMain).toBe(false);
      expect(wrapper.vm.settings.tabs.activeName).toBe('view');
      expect(wrapper.vm.dataJson.data).toEqual(eventData.data);
    });

    test('应该正确切换到修改页签', async () => {
      const eventData = SOOrderTestData.generateOperationEventData().updateEvent;
      
      await wrapper.vm.handleUpdate(eventData);
      
      expect(wrapper.vm.dataJson.tab.showUpdate).toBe(true);
      expect(wrapper.vm.dataJson.tab.showNew).toBe(false);
      expect(wrapper.vm.dataJson.tab.showMain).toBe(false);
      expect(wrapper.vm.settings.tabs.activeName).toBe('edit');
      expect(wrapper.vm.dataJson.modifyReason).toBe(eventData.modifyReason);
    });

    test('应该正确切换到审批页签', async () => {
      const eventData = SOOrderTestData.generateOperationEventData().approveEvent;
      
      await wrapper.vm.handleApprove(eventData);
      
      expect(wrapper.vm.dataJson.tab.showApprove).toBe(true);
      expect(wrapper.vm.dataJson.tab.showMain).toBe(false);
      expect(wrapper.vm.settings.tabs.activeName).toBe('approve');
      expect(wrapper.vm.dataJson.enableCancel).toBe(eventData.enableCancel);
    });

    test('应该正确处理页签返回操作', async () => {
      // 先切换到其他页签
      const eventData = SOOrderTestData.generateOperationEventData().viewEvent;
      await wrapper.vm.handleView(eventData);
      
      // 然后返回主页签
      await wrapper.vm.handleReturn();
      
      expect(wrapper.vm.dataJson.tab.showMain).toBe(true);
      expect(wrapper.vm.dataJson.tab.showView).toBe(false);
      expect(wrapper.vm.dataJson.tab.showNew).toBe(false);
      expect(wrapper.vm.dataJson.tab.showUpdate).toBe(false);
      expect(wrapper.vm.settings.tabs.activeName).toBe('main');
    });
  });

  describe('业务关联页签管理', () => {
    test('应该正确处理出库计划新增', async () => {
      const orderData = { id: 12345 };
      
      await wrapper.vm.handleOutplanNew(orderData);
      
      expect(wrapper.vm.dataJson.tab.showOutplanNew).toBe(true);
      expect(wrapper.vm.dataJson.tab.showMain).toBe(false);
      expect(wrapper.vm.dataJson.so_id).toBe(12345);
      expect(wrapper.vm.settings.tabs.activeName).toBe('outplan_new');
    });

    test('应该正确处理结算单新增', async () => {
      const orderData = { id: 67890 };
      
      await wrapper.vm.handleSettlementNew(orderData);
      
      expect(wrapper.vm.dataJson.tab.showSettlementNew).toBe(true);
      expect(wrapper.vm.dataJson.tab.showMain).toBe(false);
      expect(wrapper.vm.dataJson.so_id).toBe(67890);
      expect(wrapper.vm.settings.tabs.activeName).toBe('settlement_new');
    });

    test('应该正确处理货权转移新增', async () => {
      const orderData = SOOrderTestData.generateCompleteOrder();
      
      await wrapper.vm.handleCargoRightTransferNew(orderData);
      
      expect(wrapper.vm.dataJson.tab.showCargoRightTransferNew).toBe(true);
      expect(wrapper.vm.dataJson.tab.showMain).toBe(false);
      expect(wrapper.vm.dataJson.so_data).toEqual(orderData);
      expect(wrapper.vm.settings.tabs.activeName).toBe('cargo_right_transfer_new');
    });
  });

  describe('数据传递验证', () => {
    test('应该正确传递数据到子组件', async () => {
      const eventData = SOOrderTestData.generateOperationEventData().viewEvent;
      
      await wrapper.vm.handleView(eventData);
      
      const detailTemplate = wrapper.find('detail_template-stub');
      expect(detailTemplate.exists()).toBe(true);
      expect(detailTemplate.props('data')).toEqual(eventData.data);
      expect(detailTemplate.props('editStatus')).toBe('view');
    });

    test('应该正确设置编辑状态', async () => {
      const newEventData = SOOrderTestData.generateOperationEventData().newEvent;
      const updateEventData = SOOrderTestData.generateOperationEventData().updateEvent;
      
      // 测试新增状态
      await wrapper.vm.handleNew(newEventData);
      expect(wrapper.vm.dataJson.editStatus).toBe('new');
      
      // 测试修改状态
      await wrapper.vm.handleUpdate(updateEventData);
      expect(wrapper.vm.dataJson.editStatus).toBe('edit');
    });

    test('应该正确传递操作信息', async () => {
      const eventData = SOOrderTestData.generateOperationEventData().updateEvent;
      
      await wrapper.vm.handleUpdate(eventData);
      
      expect(wrapper.vm.dataJson.operation_head_info).toBe(eventData.operate_tab_info);
      expect(wrapper.vm.dataJson.modifyReason).toBe(eventData.modifyReason);
    });
  });

  describe('页签显示控制', () => {
    test('应该根据条件显示正确的页签', async () => {
      // 初始状态只显示主页签
      expect(wrapper.findAll('el-tab-pane-stub').length).toBe(1);
      
      // 切换到新增页签
      const newEventData = SOOrderTestData.generateOperationEventData().newEvent;
      await wrapper.vm.handleNew(newEventData);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.findAll('el-tab-pane-stub').length).toBe(2);
      expect(wrapper.find('el-tab-pane-stub[name="edit"]').exists()).toBe(true);
    });

    test('应该正确设置页签的可关闭属性', async () => {
      const eventData = SOOrderTestData.generateOperationEventData().newEvent;
      await wrapper.vm.handleNew(eventData);
      await wrapper.vm.$nextTick();
      
      const editTab = wrapper.find('el-tab-pane-stub[name="edit"]');
      expect(editTab.attributes('closable')).toBeTruthy();
    });

    test('应该正确设置页签标题', async () => {
      const eventData = SOOrderTestData.generateOperationEventData().viewEvent;
      await wrapper.vm.handleView(eventData);
      await wrapper.vm.$nextTick();
      
      const viewTab = wrapper.find('el-tab-pane-stub[name="view"]');
      expect(viewTab.exists()).toBe(true);
    });
  });

  describe('标题更新功能', () => {
    test('应该正确获取页签标题扩展', () => {
      expect(wrapper.vm.getTabTitleExtension('main')).toBe('-查询');
      expect(wrapper.vm.getTabTitleExtension('view')).toBe('-查看');
      expect(wrapper.vm.getTabTitleExtension('approve')).toBe('-审批');
    });

    test('应该根据新增/修改状态返回正确的标题', () => {
      // 设置新增状态
      wrapper.vm.dataJson.tab.showNew = true;
      expect(wrapper.vm.getTabTitleExtension('edit')).toBe('-新增');
      
      // 设置修改状态
      wrapper.vm.dataJson.tab.showNew = false;
      expect(wrapper.vm.getTabTitleExtension('edit')).toBe('-修改');
    });

    test('应该正确调用标题更新方法', () => {
      const mockUpdateTabTitle = jest.fn();
      wrapper.vm.$routerTab = {
        updateTabTitle: mockUpdateTabTitle
      };
      
      wrapper.vm.updateTabTitleByState('view');
      
      expect(mockUpdateTabTitle).toHaveBeenCalledWith('-查看');
    });
  });

  describe('事件处理', () => {
    test('应该正确处理页签点击事件', () => {
      const mockTab = { name: 'main' };
      const mockEvent = {};
      
      // 确保方法存在且可调用
      expect(() => {
        wrapper.vm.handleTabsClick(mockTab, mockEvent);
      }).not.toThrow();
    });

    test('应该正确处理页签移除事件', () => {
      const targetName = 'edit';
      
      // 确保方法存在且可调用
      expect(() => {
        wrapper.vm.handleRemoveTab(targetName);
      }).not.toThrow();
    });

    test('应该正确处理关闭成功事件', async () => {
      // 先设置一个非主页签状态
      const eventData = SOOrderTestData.generateOperationEventData().newEvent;
      await wrapper.vm.handleNew(eventData);
      
      // 然后调用关闭成功处理
      await wrapper.vm.handleCloseMeOk();
      
      expect(wrapper.vm.dataJson.tab.showMain).toBe(true);
      expect(wrapper.vm.dataJson.tab.showNew).toBe(false);
      expect(wrapper.vm.settings.tabs.activeName).toBe('main');
    });
  });

  describe('页签状态重置', () => {
    test('应该正确执行页签关闭操作', async () => {
      // 先设置一些页签为显示状态
      wrapper.vm.dataJson.tab.showNew = true;
      wrapper.vm.dataJson.tab.showView = true;
      wrapper.vm.dataJson.tab.showOutplanNew = true;
      wrapper.vm.settings.tabs.activeName = 'edit';
      
      // 执行关闭操作
      wrapper.vm.doCloseTab();
      
      expect(wrapper.vm.dataJson.tab.showMain).toBe(true);
      expect(wrapper.vm.dataJson.tab.showNew).toBe(false);
      expect(wrapper.vm.dataJson.tab.showView).toBe(false);
      expect(wrapper.vm.dataJson.tab.showOutplanNew).toBe(false);
      expect(wrapper.vm.settings.tabs.activeName).toBe('main');
    });
  });

  describe('监听器测试', () => {
    test('应该监听页签切换并更新标题', async () => {
      const mockUpdateTabTitle = jest.fn();
      wrapper.vm.$routerTab = {
        updateTabTitle: mockUpdateTabTitle
      };
      
      // 触发页签切换
      wrapper.vm.settings.tabs.activeName = 'view';
      await wrapper.vm.$nextTick();
      
      expect(mockUpdateTabTitle).toHaveBeenCalled();
    });
  });

  describe('生命周期测试', () => {
    test('应该在组件挂载时正确设置样式', () => {
      const mockElement = {
        style: { margin: 0, display: 'block' }
      };
      
      wrapper.vm.$refs.refTabs = {
        $el: {
          children: [mockElement]
        }
      };
      
      wrapper.vm.$options.mounted[0].call(wrapper.vm);
      
      expect(mockElement.style.margin).toBe(0);
      expect(mockElement.style.display).toBe('none');
    });
  });

  describe('边界条件测试', () => {
    test('应该处理空数据事件', async () => {
      const emptyEvent = {
        data: null,
        operate_tab_info: {},
        editStatus: null
      };
      
      expect(() => {
        wrapper.vm.handleView(emptyEvent);
      }).not.toThrow();
    });

    test('应该处理缺少必要属性的事件', async () => {
      const incompleteEvent = {};
      
      expect(() => {
        wrapper.vm.handleNew(incompleteEvent);
      }).not.toThrow();
    });

    test('应该处理 RouterTab 不存在的情况', () => {
      wrapper.vm.$routerTab = null;
      
      expect(() => {
        wrapper.vm.updateTabTitleByState('main');
      }).not.toThrow();
    });
  });

  describe('性能测试', () => {
    test('页签切换应该快速响应', async () => {
      const startTime = Date.now();
      
      const eventData = SOOrderTestData.generateOperationEventData().viewEvent;
      await wrapper.vm.handleView(eventData);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // 页签切换应该在50ms内完成
    });

    test('大量数据传递应该保持性能', async () => {
      const largeOrderData = {
        ...SOOrderTestData.generateCompleteOrder(),
        orderDetails: SOOrderTestData.generateOrderDetails(100) // 100个订单明细
      };
      
      const eventData = {
        data: largeOrderData,
        operate_tab_info: { name: '大数据测试', showView: true },
        editStatus: 'view'
      };
      
      const startTime = Date.now();
      await wrapper.vm.handleView(eventData);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 大数据处理应该在100ms内完成
    });
  });
});