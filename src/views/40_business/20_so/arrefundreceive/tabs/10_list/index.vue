<template>
  <div class="app-container">
    <FloatMenu />
    <!-- 顶部tabs页签 -->
    <el-tabs
      ref="minusTabs"
      v-model="dataJson.tabs.active"
      type="card"
      @tab-click="handleTabsClick"
    >
      <el-tab-pane name="0">
        <template slot="label">全部</template>
      </el-tab-pane>
      <el-tab-pane name="1">
        <template slot="label">待收款</template>
      </el-tab-pane>
      <el-tab-pane name="2">
        <template slot="label">已收款</template>
      </el-tab-pane>
      <el-tab-pane name="3">
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
            v-model.trim="dataJson.searchForm.so_contract_code"
            clearable
            placeholder="合同编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.so_order_code"
            clearable
            placeholder="订单编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <select-se-customer
            v-model.trim="dataJson.searchForm.seller_name"
            :placeholder="'请选择主体企业'"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleCustomerReturnDataName"
          />
        </el-form-item>
        <el-form-item>
          <select-cp-supplier
            v-model.trim="dataJson.searchForm.customer_name"
            :placeholder="'请选择客户'"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleSupplierReturnDataName"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.ar_refund_code"
            clearable
            placeholder="退收款管理编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.code"
            clearable
            placeholder="退款单编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <!-- 退款单状态控件，全部tab下可用，其他tab下禁用 -->
        <el-form-item v-if="dataJson.tabs.active === '0'">
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_AR_REFUND_RECEIVE_STATUS"
            init-placeholder="请选择退款单状态"
          />
        </el-form-item>
        <el-form-item v-else>
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_AR_REFUND_RECEIVE_STATUS"
            init-placeholder="请选择退款单状态"
            disabled
          />
        </el-form-item>

        <el-form-item style="float:right">
          <el-button
            v-popover:popover
            type="primary"
            plain
            @click="doResetSearch"
          >重置
          </el-button>
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

    <el-button-group>

      <el-button
        v-permission="'P_AR_REFUND_RECEIVE:AUDIT'"
        :disabled="!settings.btnStatus.showApprove"
        type="primary"
        icon="el-icon-s-check"
        :loading="settings.loading"
        @click="handleApprove"
      >上传收款凭证完成收款
      </el-button>
      <el-button
        v-permission="'P_AR_REFUND_RECEIVE:CANCEL'"
        :disabled="!settings.btnStatus.showCancel"
        type="primary"
        icon="el-icon-error"
        :loading="settings.loading"
        @click="handleCancel"
      >作废
      </el-button>
      <el-button
        v-permission="'P_AR_REFUND_RECEIVE:INFO'"
        :disabled="!settings.btnStatus.showView"
        type="primary"
        icon="el-icon-view"
        :loading="settings.loading"
        @click="handleView"
      >查看
      </el-button>
    </el-button-group>

    <!-- 汇总区域 -->
    <div class="div-sum">
      <div class="right">
        <span class="count-title">收款指令总金额：</span>
        <span class="count-data">{{ dataJson.sumData.sum_refund_amount_total == null ? 0 : formatCurrency(dataJson.sumData.sum_refund_amount_total, true) }}</span>
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
        prop="ar_refund_code"
        label="退收款管理编号"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="code"
        label="退款单编号"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="90"
        prop="type_name"
        label="类型"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="90"
        prop="status_name"
        label="状态"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="seller_name"
        label="主体企业（收款方）"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="customer_name"
        label="客户（付款方）"
        align="left"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="refund_order_amount"
        label="收款指令金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.refund_order_amount == null?'':formatCurrency(scope.row.refund_order_amount, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="refund_date"
        label="收款日期"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.refund_date == null?'':formatDate(scope.row.refund_date) }}
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
        min-width="160"
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
        prop="u_name"
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

    <!--    vue-tour组件-->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />

    <!-- 作废弹窗-->
    <cancel-confirm-dialog
      v-if="popCancel.dialogVisible"
      :data="popCancel.data"
      :visible="popCancel.dialogVisible"
      destroy-on-close
      @closeMeOk="handleCloseDialogOneOk"
      @closeMeCancel="handleCloseDialogOneCancel"
    />

    <!--查看-->
    <view-dialog
      v-if="popView.dialogVisible"
      title="查看退款单"
      :data="popView.data"
      :visible="popView.dialogVisible"
      destroy-on-close
      @closeMeOk="handleCloseViewDialogOk"
      @closeMeCancel="handleCloseViewDialogOk"
    />

    <!--凭证附件-->
    <voucher-dialog
      v-if="popVoucher.dialogVisible"
      title="上传收款凭证"
      :data="popVoucher.data"
      :visible="popVoucher.dialogVisible"
      destroy-on-close
      @closeMeOk="popVoucher.dialogVisible = false"
      @closeMeCancel="popVoucher.dialogVisible = false"
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
  getListApi,
  getListSumApi
} from '@/api/40_business/20_so/arrefundreceive/arrefundreceive'
import constants_para from '@/common/constants/constants_para'
import Pagination from '@/components/Pagination/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import mixin from './mixin'
import permission from '@/directive/permission' // 权限判断指令
import constants_dict from '@/common/constants/constants_dict'
import SelectSeCustomer from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/customer/index.vue'
import viewDialog from '@/views/40_business/20_so/arrefundreceive/dialog/view/index.vue'
import SelectCpSupplier from '@/views/20_master/enterprise/dialog/selectgrid/counterparty/supplier/index.vue'
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'
import voucherDialog from '@/views/40_business/20_so/arrefundreceive/dialog/voucher/index.vue'
import cancelConfirmDialog from '../../dialog/cancel/index.vue'

export default {
  components: { SelectDicts, SelectCpSupplier, Pagination, viewDialog, SelectSeCustomer, voucherDialog, cancelConfirmDialog },
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
      watch: {
        unwatch_tempJson: null,
        unwatch_statusList: null
      },
      dataJson: {
        tabs: {
          active: '0'
        },
        allTabStatusCache: [],
        // 查询使用的json
        searchForm: {
          status: '',
          status_list: [],
          active_tabs_index: '',
          code: '',
          plan_code: '',
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION)
        },
        todoSearchForm: {},
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        sumData: {
          sum_refund_amount_total: 0
        },
        customerComboList: [],
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      popSettingsData: {
        dialogFormVisible: false
      },
      // 查看窗口的状态
      popView: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 凭证附件窗口的状态
      popVoucher: {
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
          showCancel: false,
          showView: false,
          showApprove: false
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
      screenNum: 0,
      // 作废窗口的状态
      popCancel: {
        dialogVisible: false,
        editStatus: null,
        data: null
      }
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
    }
  },
  beforeDestroy () {
  },
  created () {
    // 描绘完成
    this.init()
  },
  beforeUpdate () {
    // 重新布局表格
    this.$nextTick(() => {
      this.$refs.multipleTable.doLayout()
    })
  },
  mounted () {
  },
  methods: {
    // 初始化页面
    init (parm) {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
      // 初始化tabs缓存
      if (this.dataJson.allTabStatusCache.length === 0) {
        this.dataJson.allTabStatusCache = [...this.dataJson.searchForm.status_list]
      }
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
          this.dataJson.sumData.sum_refund_amount_total = 0
        }
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
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '修改销售合同' },
        canEdit: true,
        editStatus: constants_para.STATUS_UPDATE,
        data: _data
      }

      this.$emit('emitUpdate', operate_tab_data)
    },
    // 点击按钮 新增
    handleNew () {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '新增销售合同' },
        canEdit: true,
        editStatus: constants_para.STATUS_INSERT
      }
      this.$emit('emitNew', operate_tab_data)
    },
    // 点击按钮 查看
    handleView () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      this.popView.dialogVisible = true
      this.popView.data = _data
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnStatus.showView = true

        const status = this.dataJson.currentJson.status?.toString()
        if (status === constants_dict.DICT_B_AR_REFUND_RECEIVE_STATUS_ZERO) { // 待收款
          this.settings.btnStatus.showApprove = true
          this.settings.btnStatus.showCancel = true
        } else if (status === constants_dict.DICT_B_AR_REFUND_RECEIVE_STATUS_ONE) { // 已收款
          this.settings.btnStatus.showApprove = false
          this.settings.btnStatus.showCancel = true
        } else if (status === constants_dict.DICT_B_AR_REFUND_RECEIVE_STATUS_STOP) { // 中止
          this.settings.btnStatus.showApprove = false
          this.settings.btnStatus.showCancel = false
        } else if (status === constants_dict.DICT_B_AR_REFUND_RECEIVE_STATUS_TWO) { // 作废
          this.settings.btnStatus.showApprove = false
          this.settings.btnStatus.showCancel = false
        } else {
          this.settings.btnStatus.showApprove = false
          this.settings.btnStatus.showCancel = false
        }
      } else {
        this.settings.btnStatus.showView = false
        this.settings.btnStatus.showCancel = false
        this.settings.btnStatus.showApprove = false
      }
    },
    // 审批按钮
    handleApprove () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      this.popVoucher.dialogVisible = true
      this.popVoucher.data = _data
    },
    // 作废按钮
    handleCancel () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popCancel.dialogVisible = true
      this.popCancel.data = _data
    },
    // 作废确认
    handleCloseDialogOneOk (val) {
      this.popCancel.dialogVisible = false
      this.getDataList()
      this.$notify({
        title: '作废成功',
        message: null,
        type: 'success',
        duration: this.settings.duration
      })
    },
    handleCloseDialogOneCancel () {
      this.popCancel.dialogVisible = false
    },
    handleTabsClick (tab, event) {
      if (this.dataJson.searchForm.active_tabs_index === tab.index) {
        return
      }
      // 如果当前是在"全部"页签，保存用户手动选择的状态数据
      if (this.dataJson.tabs.active === '0' && tab.index !== '0') {
        this.dataJson.allTabStatusCache = [...this.dataJson.searchForm.status_list]
      }
      // 设置当前激活的标签页
      this.dataJson.tabs.active = tab.index
      // 退款单状态常量
      switch (tab.index) {
        case '1': // 待收款
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_AR_REFUND_RECEIVE_STATUS_ZERO]
          break
        case '2': // 已收款
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_AR_REFUND_RECEIVE_STATUS_ONE]
          break
        case '3': // 作废
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_AR_REFUND_RECEIVE_STATUS_TWO]
          break
        case '4': // 中止
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_AR_REFUND_RECEIVE_STATUS_STOP]
          break
        default: // 全部 - 恢复之前保存的状态数据
          this.dataJson.searchForm.status_list = this.dataJson.allTabStatusCache.length > 0 ? [...this.dataJson.allTabStatusCache] : []
          break
      }
      this.dataJson.searchForm.active_tabs_index = tab.index
      this.getDataList()
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
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'validate_vehicle' && row.validate_vehicle !== '1') {
        return 'warning-cell'
      }
      return ''
    },
    // 企业选择回调
    handleCustomerReturnDataName (val) {
      // 处理企业选择回调
    },
    // 供应商选择回调
    handleSupplierReturnDataName (val) {
      // 处理供应商选择回调
    },
    // 查看关闭弹窗
    handleCloseViewDialogOk (val) {
      this.popView.dialogVisible = false
    }
  }
}
</script>
