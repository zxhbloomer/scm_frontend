<template>
  <div class="app-container">
    <FloatMenu />
    <el-tabs
      ref="minusTabs"
      v-model="dataJson.tabs.active"
      type="card"
      class=""
      @tab-click="handleTabsClick"
    >
      <el-tab-pane name="0">
        <template slot="label">全部</template>
      </el-tab-pane>
      <el-tab-pane name="1">
        <template slot="label">应付退款</template>
      </el-tab-pane>
      <el-tab-pane name="2">
        <template slot="label">预付退款</template>
      </el-tab-pane>
      <el-tab-pane name="3">
        <template slot="label">其他退款</template>
      </el-tab-pane>
      <el-tab-pane name="4">
        <template slot="label">作废</template>
      </el-tab-pane>

    </el-tabs>
    <div>
      <el-form
        ref="minusForm"
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
      >
        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.code"
            clearable
            placeholder="退付款管理编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <select-dict
            v-model="dataJson.searchForm.status"
            :para="CONSTANTS.DICT_B_AP_REFUND_STATUS"
            init-placeholder="请选择状态"
          />
        </el-form-item>

        <el-form-item>
          <select-dict
            v-model="dataJson.searchForm.type"
            :para="CONSTANTS.DICT_B_AP_REFUND_TYPE"
            init-placeholder="业务类型"
          />
        </el-form-item>

        <el-form-item>
          <select-dict
            v-model="dataJson.searchForm.pay_status"
            :para="CONSTANTS.DICT_B_AP_REFUND_PAY_STATUS"
            init-placeholder="退款状态"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.po_contract_code"
            clearable
            placeholder="合同编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.po_order_code"
            clearable
            placeholder="订单编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item style="float:right">
          <el-badge
            :value="screenNum"
            class="item"
          >
            <el-button
              v-popover:popover
              type="primary"
              plain
              icon="el-icon-search"
              :loading="settings.loading"
            >高级查询</el-button>
          </el-badge>
        </el-form-item>

        <el-form-item style="float:right">
          <el-button
            type="primary"
            plain
            icon="el-icon-search"
            :loading="settings.loading"
            @click="handleSearch"
          >查询
          </el-button>
        </el-form-item>

      </el-form>
    </div>

    <el-popover
      ref="popover"
      placement="bottom"
      width="600"
      title="高级查询"
      popper-class="perfect_popper"
    >
      <el-form
        :inline="true"
        :model="dataJson.searchForm"
        label-position="top"
        class="search-form-senior"
      >
        <el-form-item label="主体企业">
          <select-se-customer
            v-model.trim="dataJson.searchForm.purchaser_name"
            :placeholder="'请选择主体企业'"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleCustomerReturnDataName"
          />
        </el-form-item>

        <el-form-item label="供应商">
          <select-cp-supplier
            v-model.trim="dataJson.searchForm.supplier_name"
            :placeholder="'请选择供应商'"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleSupplierReturnDataName"
          />
        </el-form-item>

        <el-divider />
        <div style="text-align: right; margin: 0">
          <el-button
            type="text"
            @click="doResetSearch"
          >重置</el-button>
          <el-button
            type="primary"
            :loading="settings.loading"
            @click="handleSearch"
          >提交</el-button>
        </div>
      </el-form>
    </el-popover>

    <el-button-group>
      <el-button
        v-permission="'P_AP_REFUND:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleNew"
      >
        新增
      </el-button>
      <el-button
        v-permission="'P_AP_REFUND:UPDATE'"
        :disabled="!settings.btnStatus.showUpdate"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改
      </el-button>
      <el-button
        v-permission="'P_AP_REFUND:DELETE'"
        :disabled="!settings.btnStatus.showDel"
        type="primary"
        icon="el-icon-check"
        :loading="settings.loading"
        @click="handleDel"
      >删除
      </el-button>
      <el-button
        v-permission="'P_AP_REFUND:CANCEL'"
        :disabled="!settings.btnStatus.showCancel"
        type="primary"
        icon="el-icon-error"
        :loading="settings.loading"
        @click="handleCancel"
      >作废
      </el-button>
      <el-button
        v-permission="'P_AP_REFUND:AUDIT'"
        :disabled="!settings.btnStatus.showApprove"
        type="primary"
        icon="el-icon-s-check"
        :loading="settings.loading"
        @click="handleApprove"
      >审批
      </el-button>
      <el-button
        v-permission="'P_AP_REFUND:PUSH'"
        :disabled="!settings.btnStatus.showPush"
        type="primary"
        icon="el-icon-circle-close"
        :loading="settings.loading"
        @click="handlePush"
      >下推退款指令
      </el-button>
      <!--      导出按钮-->
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'P_AP_REFUND:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'P_AP_REFUND:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <!--      导出模式切换按钮-->
      <el-button
        v-if="settings.btnStatus.hidenExport"
        v-permission="'P_AP_REFUND:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <el-button
        v-permission="'P_AP_REFUND:PRINT'"
        :disabled="!settings.btnStatus.showPrint"
        type="primary"
        icon="el-icon-printer"
        :loading="settings.loading"
        @click="handlePrint"
      >打印
      </el-button>
      <el-button
        v-permission="'P_AP_REFUND:INFO'"
        :disabled="!settings.btnStatus.showView"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleView"
      >查看
      </el-button>
    </el-button-group>

    <div
      class="div-sum"
    >
      <div class="right">
        <span class="count-title">未退款总金额：</span><span class="count-data">{{ dataJson.sumData.not_refund_amount_total == null ? 0 : formatCurrency(dataJson.sumData.not_refund_amount_total,true) }}</span>
      </div>
    </div>

    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      columns_index_key="true"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      :cell-class-name="tableCellClassName"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="settings.exportModel"
        type="selection"
        width="45"
        prop="id"
      />
      <el-table-column
        type="index"
        width="45"
        prop="No"
        label="No"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="code"
        label="退付款管理编号"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="status_name"
        label="状态"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="type_name"
        label="业务类型"
        align="left"
      />
      <el-table-column
        :auto-fit="true"
        min-width="150"
        prop="next_approve_name"
        label="审批情况"
        align="left"
      >
        <template v-slot="scope">
          {{ getApprovalStatusText(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="purchaser_name"
        label="主体企业（付款方）"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="supplier_name"
        label="供应商（收款方）"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="po_contract_code"
        label="合同号"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.po_contract_code || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="100"
        prop="po_order_code"
        label="订单号"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.po_order_code || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="account_number"
        label="退款账户"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.account_number || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        :auto-fit="true"
        min-width="100"
        prop="accounts_purpose_type_name"
        label="账户类型"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.accounts_purpose_type_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="refund_status_name"
        label="退款状态"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="refundable_amount"
        label="申请退款总金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.refundable_amount == null ? '-' : formatCurrency(scope.row.refundable_amount, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="refunded_amount"
        label="已退款总金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.refunded_amount == null ? '-' : formatCurrency(scope.row.refunded_amount, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="refunding_amount"
        label="退款中总金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.refunding_amount == null ? '-' : formatCurrency(scope.row.refunding_amount, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="unrefund_amount"
        label="未退款总金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.unrefund_amount == null ? '-' : formatCurrency(scope.row.unrefund_amount, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="remark"
        label="备注"
        align="left"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_name"
        label="创建人"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="c_time"
        label="创建时间"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.c_time == null?'':formatDateTime(scope.row.c_time) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="c_name"
        label="更新人"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="u_time"
        label="更新时间"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.u_time == null?'':formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>
    <pagination
      ref="minusPaging"
      :total="dataJson.paging.total"
      :page.sync="dataJson.paging.current"
      :limit.sync="dataJson.paging.size"
      @pagination="getDataList"
    />

    <!--打印弹窗-->
    <print_template
      :v-if="popPrint.dialogVisible"
      :visible="popPrint.dialogVisible"
      :data="popPrint.data"
      title="付款管理单据打印"
      @closeMeCancel="handlePrintCancel"
    />

    <!--  退款单下推-->
    <push_template
      v-if="popPush.dialogVisible"
      :visible="popPush.dialogVisible"
      :data="popPush.data"
      title="退款单下推"
      @closeMeOk="handlePushOk"
      @closeMeCancel="handlePushCancel"
    />

    <!-- 作废弹窗-->
    <cancel-confirm-dialog
      v-if="popCancel.dialogVisible"
      :data="popCancel.data"
      :visible="popCancel.dialogVisible"
      destroy-on-close
      @closeMeOk="handleCloseDialogOk"
      @closeMeCancel="handleCloseDialogCancel"
    />

  </div>
</template>

<style scoped>
.merge_cells0 {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  line-height: 23px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 6px;
}

.merge_cells1 {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  line-height: 23px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #dfe6ec;
}

.merge_cells2 {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  line-height: 23px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #dfe6ec;
}

.merge_cells3 {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  line-height: 23px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 6px;
}

::v-deep .el-tabs__item {
  height: 30px;
  line-height: 30px;
}

::v-deep .el-tabs__header {
  margin: 0 0 5px;
}

.floatRight {
  float: right;
}

.floatLeft {
  float: left;
}

.el-form-item .el-select {
  width: 100%;
}

.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 371px;
}

.el-button-group {
  margin-bottom: 10px;
}

.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}

.el-input-group__append_reset {
  color: #ffffff;
  background-color: #f56c6c;
  border-color: #f56c6c;
}

a {
  color: #52b5f2;
}

.div-sum {
  width: 100%;
  height: 35px;
  padding: 5px 5px;
  margin: 0;
  box-sizing: border-box;
  border-radius: 4px;
  transition: opacity 0.2s;
  background-color: #f5f7fa;
  color: #666;
  font-size: 16px;
  border-top: 1px solid #dfe6ec;
  border-left: 1px solid #dfe6ec;
  border-right: 1px solid #dfe6ec;
}

.right {
  position: absolute;
  right: 10px;
  margin-right: 10px;
}

.left {
  position: absolute;
  left: 10px;
  margin-left: 10px;
}

.count-data {
  color: #1890ff;
  font-size: 20px;
}

.count-title {
  margin-left: 10px;
}

br {
  display: block;
  margin: 10px;
  content: ' ';
}

.perfect_popper .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}

/* sumData处的 el-link */
.el-link.el-link--default {
  font-size: 16px;
  vertical-align: top;
}

.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}

.el-tabs {
  margin-bottom: 5px;
}
</style>

<script>
import {
  deleteApi,
  getApi,
  exportApi,
  getListApi,
  getListSumApi
} from '@/api/40_business/10_po/aprefund/aprefund'
import constants_para from '@/common/constants/constants_para'
import Pagination from '@/components/Pagination/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import mixin from './mixin'
import permission from '@/directive/permission' // 权限判断指令
import constants_dict from '@/common/constants/constants_dict'
import { EventBus } from '@/common/eventbus/eventbus'
import print_template from '@/views/40_business/10_po/aprefund/tabs/60_print/index.vue'
import push_template from '@/views/40_business/10_po/aprefundpay/dialog/push/index.vue'
import SelectDict from '@/components/00_dict/select/SelectDict.vue'
import SelectCpSupplier from '@/views/20_master/enterprise/dialog/selectgrid/counterparty/supplier/index.vue'
import SelectSeCustomer from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/customer/index.vue'
import cancelConfirmDialog from '../../dialog/cancel/index.vue'

export default {
  components: { cancelConfirmDialog, push_template, print_template, Pagination, SelectDict, SelectCpSupplier, SelectSeCustomer },
  directives: { elDragDialog, permission },
  mixins: [mixin],
  props: {
    // 自己作为弹出框时的参数
    meDialogStatus: {
      type: Boolean,
      default: false
    },
    dataModel: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // 监听器
      dataJson: {
        tabsCount: {
          all: 0,
          todo: 0
        },
        tabs: {
          active: ''
        },
        // 保存用户在状态多选控件中选择的状态数据，用于缓存用户的选择
        allTabStatusCache: [],
        // 查询使用的json
        searchForm: {
          code: '',
          plan_code: '',
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          // 启动日期
          batch: '',
          active_tabs_index: '', // 当前被激活的页签
          status_list: [], // 单据状态（多选）
          type: '', // 业务类型
          pay_status: '', // 退款状态
          po_contract_code: '', // 合同编号
          po_order_code: '', // 订单编号
          // 企业相关字段
          purchaser_name: '', // 客户名称
          purchaser_id: '', // 客户名称
          supplier_name: '', // 供应商名称
          supplier_id: '' // 供应商名称
          // 是否包含放货指令
        },
        todoSearchForm: {},
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        sumData: {
          not_refund_amount_total: 0
        },
        customerComboList: [],
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            config_key: 20,
            value: 50,
            descr: 200
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      popSettingsData: {
        dialogFormVisible: false
      },
      // 打印窗口的状态
      popPrint: {
        dialogVisible: false,
        data: null
      },
      // 下推窗口的状态
      popPush: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 作废窗口的状态
      popCancel: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式
        exportModel: false,
        // 按钮状态
        btnStatus: {
          showDel: false,
          showUpdate: false,
          showView: false,
          showExport: false,
          hidenExport: true,
          showApprove: false,
          showPrint: false,
          showPush: false,
          showCancel: false
        },
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      },
      // vue-tour组件
      tourOption: {
        useKeyboardNavigation: false, // 是否通过键盘的←, → 和 ESC 控制指引
        labels: { // 指引项的按钮文案
          buttonStop: '结束' // 结束文案
        },
        highlight: false // 是否高亮显示激活的的target项
      },
      steps: [
        {
          target: '.el-table-column--selection', // 当前项的id或class或data-v-step属性
          content: '请通过点击多选框，选择要导出的数据！', // 当前项指引内容
          params: {
            placement: 'right', // 指引在target的位置，支持上、下、左、右
            highlight: false, // 当前项激活时是否高亮显示
            enableScrolling: false // 指引到当前项时是否滚动轴滚动到改项位置
          },
          // 在进行下一步时处理UI渲染或异步操作，例如打开弹窗，调用api等。当执行reject时，指引不会执行下一步
          before: type => new Promise((resolve, reject) => {
            // 耗时的UI渲染或异步操作
            resolve('foo')
          })
        }
      ],
      popSettings: {
        // 弹出编辑页面
        one: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            dialogStatus: ''
          }
        }
      },
      screenNum: 0
    }
  },
  computed: {
  },
  // 监听器
  watch: {
    // 全屏loading
    'settings.loading': {
      handler (newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在查询，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    },
    // 监听搜索表单的变化
    'dataJson.searchForm': {
      handler (newVal, oldVal) {
        // 这里可以添加您需要的逻辑
        const screenKeys = ['purchaser_name', 'supplier_name']
        const { searchForm } = this.dataJson
        const data = Object.keys(searchForm).map(item => {
          if (screenKeys.includes(item)) {
            if (searchForm[item] || searchForm[item] === 0) {
              return searchForm[item]
            }
          }
        })
        const len = data.filter(x => x).length || 0
        this.screenNum = len
      },
      deep: true
    }
  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_MST_B_AP_REFUND_NEW_OK)
    EventBus.$off(this.EMITS.EMIT_MST_B_AP_REFUND_UPDATE_OK)
    EventBus.$off(this.EMITS.EMIT_MST_B_AP_REFUND_BPM_OK)
  },
  created () {
    // 描绘完成
    this.init()

    // 新增提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_AP_REFUND_NEW_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_AP_REFUND_NEW_OK', _data)
      // 设置到table中绑定的json数据源
      console.log('新增数据：', _data)
      this.dataJson.listData.unshift(_data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: _data.id }).then(response => {
        // 设置到table中绑定的json数据源
        console.log('更新数据：', response.data)
        // 设置到table中绑定的json数据源
        this.dataJson.listData.splice(0, 1, response.data)
        this.$nextTick(() => {
          this.$refs.multipleTable.setCurrentRow(this.dataJson.listData[0])
        })
      }).finally(() => {
        this.settings.loading = false
      })
    })

    // 更新提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_AP_REFUND_UPDATE_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_AP_REFUND_UPDATE_OK', _data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: this.dataJson.currentJson.id }).then(response => {
        // 设置到table中绑定的json数据源
        console.log('更新数据：', response.data)
        // 设置到table中绑定的json数据源
        this.dataJson.listData.splice(this.dataJson.rowIndex, 1, response.data)
        this.$nextTick(() => {
          this.$refs.multipleTable.setCurrentRow(this.dataJson.listData[this.dataJson.rowIndex])
        })
      }).finally(() => {
        this.settings.loading = false
      })
    })

    // 提交审批流时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_AP_REFUND_BPM_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_AP_REFUND_BPM_OK', _data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: this.dataJson.currentJson.id }).then(response => {
        // 设置到table中绑定的json数据源
        console.log('更新数据：', response.data)
        // 设置到table中绑定的json数据源
        this.dataJson.listData.splice(this.dataJson.rowIndex, 1, response.data)
        this.$nextTick(() => {
          this.$refs.multipleTable.setCurrentRow(this.dataJson.listData[this.dataJson.rowIndex])
        })
      }).finally(() => {
        this.settings.loading = false
      })
    })
  },
  beforeUpdate () {
    // 重新布局表格
    this.$nextTick(() => {
      this.$refs.multipleTable.doLayout()
    })
  },
  mounted () {
  },
  destroyed () {
  },
  methods: {
    // 初始化页面
    init (parm) {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.$options.data.call(this).dataJson.tempJson)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    // 行双点击，仅在dialog中有效
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      var _data = deepCopy(row)
      if (this.meDialogStatus) {
        this.$emit('rowDbClick', _data)
      }
    },
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },
    handleSortChange (column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },
    getDataList () {
      // 启动全屏loading
      this.showLoading('正在查询，请稍后...')

      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.loading = true
      getListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
      // 查询合计信息
      getListSumApi(this.dataJson.searchForm).then(response => {
        if (response.data !== null) {
          this.dataJson.sumData = response.data
        } else {
          this.dataJson.sumData.not_refund_amount_total = 0
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },
    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },
    // 点击按钮 更新
    handleUpdate () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '修改应付退款' },
        canEdit: true,
        editStatus: constants_para.STATUS_UPDATE,
        data: _data
      }

      this.$emit('emitUpdate', operate_tab_data)
    },
    // 点击按钮 新增
    handleNew () {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '新增应付退款' },
        canEdit: true,
        editStatus: constants_para.STATUS_INSERT
      }
      this.$emit('emitNew', operate_tab_data)
    },
    // 点击按钮 查看
    handleView () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === '4' || _data.status === '5') {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '查看应付退款' },
        canEdit: true,
        editStatus: constants_para.STATUS_VIEW,
        data: _data
      }
      this.$emit('emitView', operate_tab_data)
    },
    // 点击按钮 查看
    handlePrint () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popPrint.dialogVisible = true
      this.popPrint.data = _data
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnStatus.showView = true
        this.settings.btnStatus.showPrint = true

        // 待审批和驳回状态，修改，删除按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_AP_REFUND_STATUS_ZERO ||
          this.dataJson.currentJson.status === constants_dict.DICT_B_AP_REFUND_STATUS_THREE) {
          this.settings.btnStatus.showUpdate = true
          this.settings.btnStatus.showDel = true
        } else {
          this.settings.btnStatus.showUpdate = false
          this.settings.btnStatus.showDel = false
        }

        // 审批
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_AP_REFUND_STATUS_ONE ||
          this.dataJson.currentJson.status === constants_dict.DICT_B_AP_REFUND_STATUS_FOUR
        ) {
          this.settings.btnStatus.showApprove = true
        } else {
          this.settings.btnStatus.showApprove = false
        }

        // 作废
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_AP_REFUND_STATUS_TWO) {
          this.settings.btnStatus.showCancel = true
          this.settings.btnStatus.showPush = true
        } else {
          this.settings.btnStatus.showCancel = false
          this.settings.btnStatus.showPush = false
        }
      } else {
        this.settings.btnStatus.showCancel = false
        this.settings.btnStatus.showUpdate = false
        this.settings.btnStatus.showDel = false
        this.settings.btnStatus.showApprove = false
        this.settings.btnStatus.showPush = false
        this.settings.btnStatus.showPrint = false
      }
    },
    // 审批按钮
    handleApprove () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      _data.serial_id = _data.id
      _data.serial_type = constants_dict.DICT_B_AP_REFUND

      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === '4' || _data.status === '5') {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '应付退款审批' },
        canEdit: true,
        editStatus: constants_para.STATUS_AUDIT,
        data: _data,
        enableCancel: true // 撤销按钮显示
      }
      this.$emit('emitApprove', operate_tab_data)
    },
    // 删除按钮
    handleDel () {
      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
      }).then(() => {
        this.handleDelOk()
      }).catch(action => {
        // 右上角X
        if (action !== 'close') {
          // 当前页所选择的数据导出
          // this.handleExportSelectionData()
        }
      })
    },
    // 作废弹窗
    handleCancel () {
      this.popCancel.dialogVisible = true
      this.popCancel.data = this.dataJson.currentJson
    },
    handleDelOk () {
      // 设置到table中绑定的json数据源
      this.settings.loading = true
      // 开始删除
      deleteApi({ id: this.dataJson.currentJson.id }).then((_data) => {
        this.$notify({
          title: '删除成功',
          message: _data.data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.popCancel.dialogVisible = false
        this.getDataList()
      }, (_error) => {
        this.$notify({
          title: '删除失败',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
        this.closeLoading()
      })
    },
    handleTabsClick (tab, event) {
      if (this.dataJson.searchForm.active_tabs_index === tab.index) {
        return
      }

      // 缓存用户在状态多选控件中的选择
      if (this.dataJson.searchForm.status_list && this.dataJson.searchForm.status_list.length > 0) {
        this.dataJson.allTabStatusCache = [...this.dataJson.searchForm.status_list]
      }

      // 设置当前激活的标签页
      this.dataJson.tabs.active = tab.index

      switch (tab.index) {
        case '1': // 应付退款
          this.dataJson.searchForm.type = '1'
          break
        case '2': // 预付退款
          this.dataJson.searchForm.type = '2'
          break
        case '3': // 其他退款
          this.dataJson.searchForm.type = '3'
          break
        case '4': // 作废
          this.dataJson.searchForm.type = '4'
          break
        default: // 全部 - 恢复之前保存的状态数据
          this.dataJson.searchForm.type = ''
          // 如果有缓存状态，则恢复用户之前的选择
          if (this.dataJson.allTabStatusCache && this.dataJson.allTabStatusCache.length > 0) {
            this.dataJson.searchForm.status_list = [...this.dataJson.allTabStatusCache]
          }
          break
      }

      this.dataJson.searchForm.active_tabs_index = tab.index
      this.getDataList()
    },
    // 数据批量导入按钮
    handleOpenImportDialog () {
      this.popSettingsImport.dialogFormVisible = true
    },
    getClass (index, length) {
      if (length === 1) {
        return 'merge_cells0 cell'
      } else if (index === 0) {
        return 'merge_cells1 cell'
      } else if (index === length - 1) {
        return 'merge_cells3 cell'
      } else {
        return 'merge_cells2 cell'
      }
    },
    // 下推
    handlePush () {
      this.popPush.data = Object.assign({}, this.dataJson.currentJson)
      if (this.popPush.data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popPush.editStatus = constants_para.STATUS_UPDATE
      this.popPush.dialogVisible = true
    },
    /**
     * 打印弹窗关闭
     */
    handlePrintCancel () {
      this.popPrint.dialogVisible = false
    },
    /**
     * 退款单弹窗下推成功
     */
    handlePushOk () {
      this.popPush.dialogVisible = false
      this.getDataList()

      this.$notify({
        title: '下推成功',
        message: null,
        type: 'success',
        duration: this.settings.duration
      })
    },
    /**
     * 退款单弹窗关闭取消
     */
    handlePushCancel () {
      this.popPush.dialogVisible = false
    },
    /**
     * 完成导出
     */
    handleExportOk () {
      this.settings.btnStatus.hidenExport = true
      this.settings.btnStatus.showExport = false
      this.settings.exportModel = false
    },
    /**
     * 切换到导出模式
     */
    handleModelOpen () {
      this.settings.exportModel = true
      this.settings.btnStatus.hidenExport = false
      this.$tours['myTour'].start()
    },
    // 导出按钮
    handleExport () {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnStatus.showExport = false
        })
      } else if (this.dataJson.multipleSelection.length === this.dataJson.listData.length) {
        // 选择全部的时候
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全部导出',
          cancelButtonText: '当前页数据导出'
        }).then(() => {
          this.handleExportAllData()
        }).catch(action => {
          // 右上角X
          if (action !== 'close') {
            // 当前页所选择的数据导出
            this.handleExportSelectionData()
          }
        })
      } else {
        // 部分数据导出
        this.handleExportSelectionData()
      }
    },
    // 部分数据导出
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push(value.id)
      })
      const searchData = { ids: selectionJson }
      // 开始导出
      exportApi(searchData).then(response => {
        this.settings.loading = false
      })
    },
    // 全部数据导出
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出
      exportApi(this.dataJson.searchForm).then(response => {
        this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'validate_vehicle' && row.validate_vehicle !== '1') {
        return 'warning-cell'
      }
      return ''
    },
    // 作废弹窗关闭 作废成功
    handleCloseDialogOk (val) {
      this.popCancel.dialogVisible = false
      this.getDataList()

      this.$notify({
        title: '作废成功',
        message: null,
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 作废弹窗关闭
    handleCloseDialogCancel (val) {
      this.popCancel.dialogVisible = false
    },
    // 供应商选择回调
    handleSupplierReturnDataName (val) {
      if (val) {
        // 正常选择供应商的情况
        this.dataJson.searchForm.supplier_name = val.name
        this.dataJson.searchForm.supplier_id = val.id
      } else {
        // 取消或清空的情况
        this.dataJson.searchForm.supplier_name = ''
        this.dataJson.searchForm.supplier_id = ''
      }
    },
    // 主体企业选择回调
    handleCustomerReturnDataName (val) {
      if (val) {
        // 正常选择主体企业的情况
        this.dataJson.searchForm.purchaser_name = val.name
        this.dataJson.searchForm.purchaser_id = val.id
      } else {
        // 取消或清空的情况
        this.dataJson.searchForm.purchaser_name = ''
        this.dataJson.searchForm.purchaser_id = ''
      }
    },
    // 获取审批情况显示文本
    getApprovalStatusText (row) {
      if (!row.next_approve_name) {
        return row.next_approve_name || ''
      }

      // 状态为1或4时，显示"待用户"+next_approve_name+"审批"
      if (row.status === constants_dict.DICT_B_AP_REFUND_STATUS_ONE || row.status === constants_dict.DICT_B_AP_REFUND_STATUS_FOUR) {
        return `待用户${row.next_approve_name}审批`
      }

      // 其他状态直接显示next_approve_name
      return row.next_approve_name
    }
  }
}
</script>
