<template>
  <div class="app-container">
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
            v-model.trim="dataJson.searchForm.code"
            clearable
            placeholder="订单编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="">
          <select-cp-customer
            v-if="!isCustomerDisabled"
            v-model.trim="dataJson.searchForm.customer_name"
            :placeholder="'请选择客户'"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleCustomerReturnDataName"
          />
          <el-input
            v-if="isCustomerDisabled"
            v-model.trim="dataJson.searchForm.customer_name"
            disabled
            placeholder="客户"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="">
          <select-se-supplier
            v-if="!isSellerDisabled"
            v-model.trim="dataJson.searchForm.seller_name"
            :placeholder="'请选择主体企业'"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleSellerReturnDataName"
          />
          <el-input
            v-if="isSellerDisabled"
            v-model.trim="dataJson.searchForm.seller_name"
            disabled
            placeholder="主体企业"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <!-- 单据状态只能是执行中，且不可修改 -->
        <el-form-item>
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_SO_ORDER_STATUS"
            init-placeholder="请选择单据状态"
            disabled
          />
        </el-form-item>

        <el-form-item>
          <select-dicts
            v-model="dataJson.searchForm.type_list"
            :para="CONSTANTS.DICT_B_SO_CONTRACT_TYPE"
            init-placeholder="请选择合同类型"
          />
        </el-form-item>

        <el-form-item>
          <select-dicts
            v-model="dataJson.searchForm.settle_list"
            :para="CONSTANTS.DICT_B_SO_ORDER_SETTLE_TYPE"
            init-placeholder="请选择结算方式"
          />
        </el-form-item>

        <el-form-item>
          <select-dicts
            v-model="dataJson.searchForm.bill_type_list"
            :para="CONSTANTS.DICT_B_SO_ORDER_BILL_TYPE"
            init-placeholder="请选择结算单据类型"
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
        <el-form-item label="商品编号或名称">
          <el-input
            v-model.trim="dataJson.searchForm.goods_name"
            clearable
            placeholder="商品编号或名称"
            @keyup.enter.native="handleSearch"
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
    <div
      class="div-sum"
    >
      <div class="right">
        <span class="count-title">预收未收总金额：</span><span class="count-data">{{ dataJson.sumData.advance_unreceive_total == null ? 0 : formatCurrency(dataJson.sumData.advance_unreceive_total,true) }}</span>
        <span class="count-title">预收已收款总金额：</span><span class="count-data">{{ dataJson.sumData.advance_received_total == null ? 0 : formatCurrency(dataJson.sumData.advance_received_total,true) }}</span>
        <span class="count-title">订单总金额：</span><span class="count-data">{{ dataJson.sumData.amount_total == null ? 0 : formatCurrency(dataJson.sumData.amount_total,true) }}</span>
        <span class="count-title">结算总金额：</span><span class="count-data">{{ dataJson.sumData.settle_amount_total == null ? 0 : formatCurrency(dataJson.sumData.settle_amount_total,true) }}</span>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      columns_index_key="false"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
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
        prop="project_code"
        label="项目编号"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="so_contract_code"
        label="合同编号"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="type_name"
        label="合同类型"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="code"
        label="订单编号"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="status_name"
        label="状态"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="customer_name"
        label="客户"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="seller_name"
        label="主体企业"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="execution_progress"
        label="执行进度"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="delivery_date"
        label="交货日期"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="delivery_type_name"
        label="运输方式"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="settle_type_name"
        label="结算方式"
        align="left"
      />
      <el-table-column
        sortable="custom"
        min-width="130"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        prop="bill_type_name"
        label="结算单据类型"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="120"
        prop="payment_type_name"
        label="收款方式"
        align="left"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="order_amount_sum"
        label="订单总金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.order_amount_sum == null ? '' : formatCurrency(scope.row.order_amount_sum, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="qty_total"
        label="销售数量（吨）"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.qty_total == null ? '' : formatNumber(scope.row.qty_total, true, 4) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="out_qty"
        label="出库数量（吨）"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.out_qty == null ? '' : formatNumber(scope.row.out_qty, true, 4) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="settled_qty"
        label="已结算数量（吨）"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.settled_qty == null ? '' : formatNumber(scope.row.settled_qty, true, 4) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="canceled_out_qty"
        label="已作废出库数量（吨）"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.canceled_out_qty == null ? '' : formatNumber(scope.row.canceled_out_qty, true, 4) }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="tax_amount_sum"
        label="税额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.tax_amount_sum == null ? '' : formatCurrency(scope.row.tax_amount_sum, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="settled_price"
        label="结算金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.settled_price == null ? '' : formatCurrency(scope.row.settled_price, true) }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="advance_receive_total"
        label="预收款金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.advance_receive_total == null ? '' : formatCurrency(scope.row.advance_receive_total, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="received_total"
        label="累计实收"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.received_total == null ? '' : formatCurrency(scope.row.received_total, true) }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="advance_amount_total"
        label="可下推预收款金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.advance_amount_total == null ? '' : formatCurrency(scope.row.advance_amount_total, true) }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="advance_refund_amount_total"
        label="预收款可退金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.advance_refund_amount_total == null ? '' : formatCurrency(scope.row.advance_refund_amount_total, true) }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="already_invoice_price"
        label="已开票金额"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.already_invoice_price == null ? '' : formatCurrency(scope.row.already_invoice_price, true) }}
        </template>
      </el-table-column>

      <el-table-column
        label="商品"
        align="center"
        :merge-group="true"
      >
        <el-table-column
          :merge-cells="true"
          min-width="120"
          label="商品编码"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.sku_code }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="100"
          label="商品名称"
          align="left"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.goods_name }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="100"
          label="规格"
          align="left"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.sku_name }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="100"
          label="产地"
          align="left"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.origin }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="100"
          label="数量"
          align="right"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.qty == null ? '' : formatNumber(item.qty, true, 4) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="100"
          label="单价"
          align="right"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            >{{ item.price == null ? '' : formatCurrency(item.price, true) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="100"
          label="税率"
          align="right"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.tax_rate }} %
            </div>
          </template>
        </el-table-column>
      </el-table-column>

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
      title="销售订单单据打印"
      @closeMeCancel="handlePrintCancel"
    />

    <!--    vue-tour组件-->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />
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
  right: 25px;
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
  getListSumApi,
  getListApi
} from '@/api/40_business/20_so/soorder/soorder'
import constants_para from '@/common/constants/constants_para'
import Pagination from '@/components/Pagination/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import mixin from './mixin'
import permission from '@/directive/permission'
import constants_dict from '@/common/constants/constants_dict'
import print_template from '@/views/40_business/20_so/soorder/tabs/60_print/index.vue'
import SelectCpCustomer from '@/views/20_master/enterprise/dialog/selectgrid/counterparty/customer/index.vue'
import SelectSeSupplier from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/supplier/index.vue'
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'

export default {
  components: {
    print_template,
    Pagination,
    SelectCpCustomer,
    SelectSeSupplier,
    SelectDicts
  },
  directives: { elDragDialog, permission },
  mixins: [mixin],
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // 监听器
      watch: {
      },
      dataJson: {
        // 查询使用的json
        searchForm: {
          code: null, // 销售订单编号
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          so_contract_code: '',
          customer_name: '',
          customer_id: '',
          seller_name: '',
          seller_id: '',
          status_list: ['2'], // 只能是执行中的订单
          type_list: [],
          settle_list: [],
          bill_type_list: [],
          goods_name: '', // 高级查询-商品编号或名称
          // 启动日期
          batch: '',
          is_advance_receive: true // 是否预收款
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        sumData: {
          actual_count: 0,
          actual_weight: 0,
          sync_error_count: 0
        },
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
      // 打印窗口的状态
      popPrint: {
        dialogVisible: false,
        data: null
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000,
        isCustomerDisabled: false,
        isSellerDisabled: false
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
      ]
    }
  },
  computed: {
    // 高级查询计数器
    screenNum () {
      let count = 0
      if (this.dataJson.searchForm.goods_name) {
        count++
      }
      return count || ''
    },
    // 控制客户是否禁用
    isCustomerDisabled () {
      return this.settings.isCustomerDisabled
    },
    // 控制主体企业是否禁用
    isSellerDisabled () {
      return this.settings.isSellerDisabled
    }
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
  },
  beforeUpdate () {
    // 重新布局表格
    this.$nextTick(() => {
      this.$refs.multipleTable.doLayout()
    })
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化页面
    init (parm) {
      // 处理传入的data参数
      this.handleInitData()

      this.setWatch()

      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)

      // 最后触发查询
      this.getDataList()
    },
    // 处理传入的data参数
    handleInitData () {
      if (this.data) {
        // 如果存在customer_id，客户控件不可用，并且设置
        if (this.data.customer_id) {
          this.settings.isCustomerDisabled = true
          this.dataJson.searchForm.customer_name = this.data.customer_name
          this.dataJson.searchForm.customer_id = this.data.customer_id
        }

        // 如果存在seller_id，主体企业控件不可用，并且设置
        if (this.data.seller_id) {
          this.settings.isSellerDisabled = true
          this.dataJson.searchForm.seller_name = this.data.seller_name
          this.dataJson.searchForm.seller_id = this.data.seller_id
        }
      }
    },
    setWatch () {},
    unWatch () {
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
      this.$emit('rowDbClick', _data)
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

      // 查询审批通过的数据
      this.dataJson.searchForm.status = constants_dict.DICT_B_SO_ORDER_STATUS_TWO

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
          this.dataJson.sumData.amount = 0
          this.dataJson.sumData.actual_count = 0
          this.dataJson.sumData.sync_error_count = 0
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 重置查询区域
    doResetSearch () {
      const statusList = this.dataJson.searchForm.status_list // 保存执行中状态

      // 保存从data中传递的客户和主体企业信息
      const preservedCustomerName = this.data && this.data.customer_id ? this.data.customer_name : ''
      const preservedCustomerId = this.data && this.data.customer_id ? this.data.customer_id : ''
      const preservedSellerName = this.data && this.data.seller_id ? this.data.seller_name : ''
      const preservedSellerId = this.data && this.data.seller_id ? this.data.seller_id : ''

      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
      this.dataJson.searchForm.status_list = statusList // 重新设置为执行中状态

      // 如果存在customer_id，重置后不复原customer相关信息
      if (this.data && this.data.customer_id) {
        this.dataJson.searchForm.customer_name = preservedCustomerName
        this.dataJson.searchForm.customer_id = preservedCustomerId
      }

      // 如果存在seller_id，重置后不复原seller相关信息
      if (this.data && this.data.seller_id) {
        this.dataJson.searchForm.seller_name = preservedSellerName
        this.dataJson.searchForm.seller_id = preservedSellerId
      }
    },
    // 客户选择回调
    handleCustomerReturnDataName (val) {
      if (val) {
        // 正常选择客户的情况
        this.dataJson.searchForm.customer_name = val.name
        this.dataJson.searchForm.customer_id = val.id
      } else {
        // 取消或清空的情况
        this.dataJson.searchForm.customer_name = ''
        this.dataJson.searchForm.customer_id = ''
      }
    },
    // 主体企业选择回调
    handleSellerReturnDataName (val) {
      if (val) {
        // 正常选择主体企业的情况
        this.dataJson.searchForm.seller_name = val.name
        this.dataJson.searchForm.seller_id = val.id
      } else {
        // 取消或清空的情况
        this.dataJson.searchForm.seller_name = ''
        this.dataJson.searchForm.seller_id = ''
      }
    },
    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = deepCopy(row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', deepCopy(row))
    },
    // 表格多选事件处理
    handleSelectionChange (selection) {
      this.dataJson.multipleSelection = selection
    },
    // 审批按钮
    handleApprove () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      _data.serial_id = _data.id
      _data.serial_type = constants_dict.DICT_B_SO_ORDER
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '销售合同审批' },
        canEdit: true,
        editStatus: constants_para.STATUS_AUDIT,
        data: _data,
        enableCancel: true // 撤销按钮显示
      }
      this.$emit('emitApprove', operate_tab_data)
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
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'validate_vehicle' && row.validate_vehicle !== '1') {
        return 'warning-cell'
      }
      return ''
    },
    // 处理打印窗口取消事件
    handlePrintCancel () {
      this.popPrint.dialogVisible = false
    }
  }
}
</script>
