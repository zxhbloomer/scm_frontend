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
        <template slot="label">待审批</template>
      </el-tab-pane>
      <el-tab-pane name="2">
        <template slot="label">审批中</template>
      </el-tab-pane>
      <el-tab-pane name="3">
        <template slot="label">执行中</template>
      </el-tab-pane>
      <el-tab-pane name="4">
        <template slot="label">已完成</template>
      </el-tab-pane>
      <el-tab-pane name="5">
        <template slot="label">驳回</template>
      </el-tab-pane>
      <el-tab-pane name="6">
        <template slot="label">作废审批中</template>
      </el-tab-pane>
      <el-tab-pane name="7">
        <template slot="label">已作废</template>
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
            placeholder="项目编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.name"
            clearable
            placeholder="项目名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="">
          <select-cp-supplier
            v-model.trim="dataJson.searchForm.supplier_name"
            :placeholder="isPlaceholderShow('请选择供应商')"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleSupplierReturnDataName"
          />
        </el-form-item>

        <el-form-item label="">
          <select-se-customer
            v-model.trim="dataJson.searchForm.purchaser_name"
            :placeholder="isPlaceholderShow('请选择下游客户')"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleCustomerReturnDataName"
          />
        </el-form-item>

        <el-form-item>
          <select-dict
            v-model="dataJson.searchForm.type"
            :para="CONSTANTS.DICT_B_PROJECT_TYPE"
            init-placeholder="请选择单据类型"
            :disabled="true"
          />
        </el-form-item>

        <!--        全部页签专属状态显示控件-->
        <el-form-item v-if="dataJson.tabs.active === '0'">
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_PROJECT_STATUS"
            init-placeholder="请选择单据状态"
          />
        </el-form-item>
        <!--        其他页签显示的禁用状态控件，自动显示当前选中状态-->
        <el-form-item v-if="dataJson.tabs.active !== '0'">
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_PROJECT_STATUS"
            init-placeholder="请选择单据状态"
            disabled
          />
        </el-form-item>
        <el-form-item style="float: right">
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
          >查询</el-button>
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
    <el-button-group>
      <el-button
        v-permission="'P_SO_PROJECT:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleNew"
      >
        新增
      </el-button>
      <el-button
        v-permission="'P_SO_PROJECT:UPDATE'"
        :disabled="!settings.btnStatus.showUpdate"
        type="primary"
        icon="el-icon-edit"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改
      </el-button>
      <el-button
        v-permission="'P_SO_PROJECT:DELETE'"
        :disabled="!settings.btnStatus.showDel"
        type="primary"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDel"
      >删除
      </el-button>
      <el-button
        v-permission="'P_SO_PROJECT:CANCEL'"
        :disabled="!settings.btnStatus.showCancel"
        type="primary"
        icon="el-icon-error"
        :loading="settings.loading"
        @click="handleCancel"
      >作废
      </el-button>
      <el-button
        v-permission="'P_SO_PROJECT:AUDIT'"
        :disabled="!settings.btnStatus.showApprove"
        type="primary"
        icon="el-icon-s-check"
        :loading="settings.loading"
        @click="handleApprove"
      >审批
      </el-button>
      <el-button
        v-permission="'P_SO_PROJECT:PUSH'"
        :disabled="!settings.btnStatus.showPush"
        type="primary"
        icon="el-icon-s-promotion"
        :loading="settings.loading"
        @click="handlePush"
      >下推业务
      </el-button>
      <el-button
        v-permission="'P_SO_PROJECT:FINISH'"
        :disabled="!settings.btnStatus.showFinish"
        type="primary"
        icon="el-icon-success"
        :loading="settings.loading"
        @click="handleFinish"
      >完成
      </el-button>
      <!--      导出按钮 开始-->
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'P_SO_PROJECT:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'P_SO_PROJECT:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnStatus.hidenExport"
        v-permission="'P_SO_PROJECT:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <!--      导出按钮 结束-->
      <el-button
        v-permission="'P_SO_PROJECT:PRINT'"
        :disabled="!settings.btnStatus.showPrint"
        type="primary"
        icon="el-icon-printer"
        :loading="settings.loading"
        @click="handlePrint"
      >打印
      </el-button>
      <el-button
        v-permission="'P_SO_PROJECT:INFO'"
        :disabled="!settings.btnStatus.showView"
        type="primary"
        icon="el-icon-view"
        :loading="settings.loading"
        @click="handleView"
      >查看
      </el-button>
    </el-button-group>

    <div
      class="div-sum"
    >
      <div class="right">
        <span class="count-title">总金额：</span><span class="count-data">{{ dataJson.sumData.amount_sum == null?'-' :formatCurrency(dataJson.sumData.amount_sum,true) }}</span>
      </div>
    </div>

    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      columns_index_key="true"
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
        v-if="settings.exportModel"
        type="selection"
        width="55"
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
        label="项目编号"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="name"
        label="项目名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="status_name"
        label="状态"
      />
      <el-table-column
        :auto-fit="true"
        min-width="150"
        prop="next_approve_name"
        label="审批情况"
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
        prop="type_name"
        label="类型"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="supplier_name"
        label="上游供应商"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="purchaser_name"
        label="下游客户"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="financier_name"
        label="融资主体"
      />
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
            > {{ formatNumber(item.qty,true,4) }}
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
          min-width="90"
          label="税率（%）"
          align="left"
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
        prop="payment_method_name"
        label="付款方式"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="payment_days"
        label="是否有账期/天数"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="amount"
        label="融资额度"
      >
        <template v-slot="scope">
          {{ scope.row.amount == null ? '-' : formatCurrency(scope.row.amount, true) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="project_cycle"
        label="项目周期"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="rate"
        label="费率"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="delivery_location"
        label="交货地点"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="delivery_type_name"
        label="运输方式"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="remark"
        label="备注"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_name"
        label="创建人"
      />
      <el-table-column
        sortable="custom"
        min-width="200"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        prop="c_time"
        label="创建时间"
      >
        <template v-slot="scope">
          {{ scope.row.c_time == null?'':formatDateTime(scope.row.c_time) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
        sortable="custom"
        min-width="200"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        prop="u_time"
        label="更新时间"
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

    <!-- 作废弹窗 -->
    <cancel-confirm-dialog
      v-if="popCancel.dialogVisible"
      :data="popCancel.data"
      :visible="popCancel.dialogVisible"
      @closeMeOk="handleCloseDialogOneOk"
      @closeMeCancel="handleCloseDialogOneCancel"
    />

    <!-- 打印弹窗 -->
    <print_template
      v-if="popPrint.dialogVisible"
      :visible="popPrint.dialogVisible"
      :data="popPrint.data"
      title="项目单据打印"
      @closeMeCancel="handlePrintCancel"
    />

    <!-- 下推-弹窗-->
    <push-dialog
      v-if="popPush.dialogVisible"
      :data="popPush.data"
      :visible="popPush.dialogVisible"
      :title="'下推操作'"
      destroy-on-close
      @closeMeOk="handlePushOk"
      @closeMeCancel="handlePushCancel"
    />

    <!-- 销售合同下推弹窗 -->
    <so-contract-push-new
      :visible="soContractDialogVisible"
      :title="'项目管理-下推销售合同'"
      :data="soContractDialogData"
      @closeMeOk="handleSoContractOk"
      @closeMeCancel="handleSoContractCancel"
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
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'
import SelectDict from '@/components/00_dict/select/SelectDict.vue'
import SelectCpSupplier from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/supplier/index.vue'
import SelectSeCustomer from '@/views/20_master/enterprise/dialog/selectgrid/counterparty/customer/index.vue'

import FloatMenu from '@/components/FloatMenu/index.vue'
import { exportApi, importBInApi, getListApi, getApi, delApi, getProjectSumApi } from '@/api/40_business/project/project'
import constants_para from '@/common/constants/constants_para'
import { getPageApi } from '@/api/10_system/pages/page'
import constants_type from '@/common/constants/constants_dict'
import constants_dict from '@/common/constants/constants_dict'
import constants_bpm from '@/common/constants/constants_bpm'
import mixin from './mixin'
import Pagination from '@/components/Pagination/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission' // 权限判断指令
import cancelConfirmDialog from '@/views/40_business/20_so/project/dialog/cancel/index.vue'
import { getOwnerComboListApi } from '@/api/30_wms/owner/owner'
import { mapState } from 'vuex'
import { EventBus } from '@/common/eventbus/eventbus'
import print_template from '@/views/40_business/20_so/project/tabs/60_print/index.vue'
import pushDialog from '@/views/40_business/20_so/project/dialog/push/next/index.vue'
import SoContractPushNew from '@/views/40_business/20_so/socontract/dialog/push/new/index.vue'

export default {
  components: { Pagination, SelectDicts, SelectDict, SelectCpSupplier, SelectSeCustomer, cancelConfirmDialog, FloatMenu, print_template, pushDialog, SoContractPushNew },
  directives: { elDragDialog, permission },
  mixins: [mixin],
  props: {
  },
  data () {
    return {
      dataJson: {
        tabs: {
          active: '0'
        },
        // 保存"全部"页签中用户手动选择的状态数据
        allTabStatusCache: [],
        // 查询使用的json
        searchForm: {
          code: '',
          name: '', // 项目名称
          plan_code: '',
          type: '2', // 默认选择销售业务
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          consignor_id: '',
          supplier_id: '',
          supplier_name: '', // 供应商名称
          purchaser_name: '', // 下游客户名称
          purchaser_id: '', // 下游客户ID
          todo_status: '0',
          // 审核时间
          ed_dt: [],
          create_dt: [],
          prop: null,
          status: null,
          type_list: [],
          sync_status: null,
          warehouse_type: null,
          status_list: [], // 初始状态列表为空，以便控件保持为空
          owner_name: null,
          active_tabs_index: 0, // 当前被激活的页签
          // 启动日期
          batch: '',
          remove_impurity: null
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        sumData: {
          actual_count: 0,
          actual_weight: 0,
          primary_quantity: 0,
          sync_error_count: 0,
          amount_sum: 0
        },
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          config_key: '',
          value: '',
          descr: ''
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
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式
        exportModel: false,
        // 按钮状态
        btnStatus: {
          showEnable: false,
          showDisable: false,
          showUpdate: false,
          showOperate: false,
          showView: false,
          showSubmit: false,
          showExport: false,
          hidenExport: true,
          showAudit: false,
          showReject: false,
          showCancel: false,
          showSync: false,
          showDel: false,
          showApprove: false,
          showPush: false,
          showPrint: false,
          showFinish: false
        },
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      },
      // 作废弹窗配置
      popCancel: {
        dialogVisible: false,
        data: null
      },
      // 打印窗口的状态
      popPrint: {
        dialogVisible: false,
        data: null
      },
      // 下推弹窗配置
      popPush: {
        dialogVisible: false,
        data: null
      },
      // 销售合同下推弹窗配置
      soContractDialogVisible: false,
      soContractDialogData: null,
      screenNum: 0,
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
    ...mapState('dictDefaultValue', ['dict_value'])
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
    // 监听多选状态变化，更新按钮状态
    'dataJson.multipleSelection': {
      handler (newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnStatus.showEnable = true
          this.settings.btnStatus.showDisable = true
          this.settings.btnStatus.showSubmit = true
          this.settings.btnStatus.showAudit = true
          this.settings.btnStatus.showReject = true
          this.settings.btnStatus.showSync = true
          this.settings.btnStatus.showExport = true
        } else {
          this.settings.btnStatus.showEnable = false
          this.settings.btnStatus.showDisable = false
          this.settings.btnStatus.showSubmit = false
          this.settings.btnStatus.showAudit = false
          this.settings.btnStatus.showReject = false
          this.settings.btnStatus.showSync = false
          this.settings.btnStatus.showExport = false
        }

        newVal.forEach((value) => {
          if (value.status !== constants_type.DICT_B_PROJECT_STATUS_ZERO) {
            if (value.status === constants_type.DICT_B_PROJECT_STATUS_THREE) {
              // 驳回状态可提交
              this.settings.btnStatus.showSubmit = true
            } else {
              // 非待审批状态不可提交
              this.settings.btnStatus.showSubmit = false
            }
          }

          if (value.status !== constants_type.DICT_B_PROJECT_STATUS_ONE && value.status !== constants_type.DICT_B_PROJECT_STATUS_FOUR) {
            // 非审批中/作废审批中状态不可审核/驳回
            this.settings.btnStatus.showAudit = false
            this.settings.btnStatus.showReject = false
          }
        })
      },
      deep: true
    },
    // 监听搜索表单变化，处理日期逻辑
    'dataJson.searchForm': {
      handler (newVal, oldVal) {
        if (this.dataJson.searchForm.daterange === null) {
          this.dataJson.searchForm.start_time = null
          this.dataJson.searchForm.over_time = null
        }

        if (this.dataJson.searchForm.ed_dt === null) {
          this.dataJson.searchForm.e_dt_start = null
          this.dataJson.searchForm.e_dt_end = null
        }

        if (this.dataJson.searchForm.create_dt === null) {
          this.dataJson.searchForm.c_time_start = null
          this.dataJson.searchForm.c_time_end = null
        }
      },
      deep: true
    },
    // 监听"全部"页签中用户手动选择的状态变化，自动缓存起来
    'dataJson.searchForm.status_list': {
      handler (newVal, oldVal) {
        // 只有在"全部"页签时才缓存用户选择的状态
        if (this.dataJson.tabs.active === '0' && newVal !== oldVal) {
          this.dataJson.allTabStatusCache = [...newVal]
        }
      },
      deep: true
    }
  },
  created () {
    // 描绘完成
    this.init()
    // 新增提交数据时监听
    EventBus.$on(this.EMITS.EMIT_BUS_PROJECT_NEW_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_BUS_PROJECT_NEW_OK', _data)
      // 设置到table中绑定的json数据源
      console.log('新增数据：', _data)
      this.dataJson.listData.unshift(_data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: _data.id }).then(response => {
        // EventBus.$off(this.EMITS.EMIT_MST_ENTERPRISE_NEW_OK)
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
    EventBus.$on(this.EMITS.EMIT_BUS_PROJECT_UPDATE_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_BUS_PROJECT_UPDATE_OK', _data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: this.dataJson.currentJson.id }).then(response => {
        // EventBus.$off(this.EMITS.EMIT_MST_ENTERPRISE_NEW_OK)
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
    EventBus.$on(this.EMITS.EMIT_BUS_PROJECT_BPM_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_BUS_PROJECT_BPM_OK', _data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: this.dataJson.currentJson.id }).then(response => {
        // EventBus.$off(this.EMITS.EMIT_MST_ENTERPRISE_NEW_OK)
        // 设置到table中绑定的json数据源
        console.log('更新数据：', response.data)
        // 设置到table中绑定的json数据源
        this.dataJson.listData.splice(this.dataJson.rowIndex, 1, response.data)
        this.$nextTick(() => {
          this.$refs.multipleTable.setCurrentRow(this.dataJson.listData[this.dataJson.rowIndex])
          this.handleCurrentChange(this.dataJson.listData[this.dataJson.rowIndex])
        })
      }).finally(() => {
        this.settings.loading = false
      })
    })
  },
  beforeDestroy () {
    // 清理EventBus监听器
    EventBus.$off(this.EMITS.EMIT_BUS_PROJECT_NEW_OK)
    EventBus.$off(this.EMITS.EMIT_BUS_PROJECT_UPDATE_OK)
    EventBus.$off(this.EMITS.EMIT_BUS_PROJECT_BPM_OK)
  },
  mounted () {
  },
  activated () {
    this.doResize()
    this.handleUrlParams()
  },
  destroyed () {
    // 清理EventBus监听器
    EventBus.$off(this.EMITS.EMIT_BUS_PROJECT_NEW_OK)
  },
  methods: {
    // 初始化页面
    init (parm) {
      // 初始化按钮状态 - 没有选中任何行时，所有按钮都不可用
      this.initButtonStatus()

      // 初始化"全部"标签页的状态缓存 - 确保为空数组（状态控件保持为空）
      this.dataJson.allTabStatusCache = []

      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = deepCopy({}, this.dataJson.tempJsonOriginal)
    },
    // 初始化按钮状态
    initButtonStatus () {
      this.settings.btnStatus.showUpdate = false
      this.settings.btnStatus.showCancel = false
      this.settings.btnStatus.showView = false
      this.settings.btnStatus.showDel = false
      this.settings.btnStatus.showApprove = false
      this.settings.btnStatus.showPush = false
      this.settings.btnStatus.showPrint = false
      this.settings.btnStatus.showFinish = false
    },
    // 弹出框设置初始化
    initDialogStatus () {
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
      if (this.dataJson.searchForm.daterange !== null && this.dataJson.searchForm.daterange !== undefined && this.dataJson.searchForm.daterange !== '') {
        this.dataJson.searchForm.start_time = this.dataJson.searchForm.daterange[0]
        this.dataJson.searchForm.over_time = this.dataJson.searchForm.daterange[1]
      }
      if (this.dataJson.searchForm.ed_dt !== null && this.dataJson.searchForm.ed_dt !== undefined && this.dataJson.searchForm.ed_dt !== '') {
        this.dataJson.searchForm.e_dt_start = this.dataJson.searchForm.ed_dt[0]
        this.dataJson.searchForm.e_dt_end = this.dataJson.searchForm.ed_dt[1]
      }
      if (this.dataJson.searchForm.create_dt !== null && this.dataJson.searchForm.create_dt !== undefined && this.dataJson.searchForm.create_dt !== '') {
        this.dataJson.searchForm.c_time_start = this.dataJson.searchForm.create_dt[0]
        this.dataJson.searchForm.c_time_end = this.dataJson.searchForm.create_dt[1]
      }

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
      }).finally(() => {
        this.settings.loading = false
      })
      // 查询总数量
      this.settings.skeletonLoading = true
      // getCountApi(this.dataJson.searchForm).then(response => {
      //   this.dataJson.paging.total = response.data.total_count
      //   this.dataJson.paging.current = response.data.pageCondition.current
      //   this.dataJson.paging.size = response.data.pageCondition.size
      // }).finally(() => {
      //   this.settings.skeletonLoading = false
      // })

      // 查询合计信息
      getProjectSumApi(this.dataJson.searchForm).then(response => {
        if (response.data !== null) {
          this.dataJson.sumData = response.data
        } else {
          this.dataJson.sumData = {
            actual_count: 0,
            actual_weight: 0,
            primary_quantity: 0,
            sync_error_count: 0,
            amount_sum: 0
          }
        }
      }).finally(() => {
      })
    },
    // 重置查询区域
    doResetSearch () {
      const todo_status = this.dataJson.searchForm.todo_status
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
      this.dataJson.searchForm.todo_status = todo_status
      this.dataJson.searchForm.warehouse_name = ''
      this.dataJson.searchForm.owner_name = ''
      this.dataJson.searchForm.consignor_name = ''
      this.dataJson.searchForm.purchaser_name = ''
      this.dataJson.searchForm.ed_dt = []

      this.setDateRange()
    },

    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },

    // 点击按钮 新增
    handleInsert () {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '新增入库单' },
        canEdit: true,
        editStatus: constants_para.STATUS_INSERT
      }

      this.$emit('emitInsert', operate_tab_data)
    },
    // 点击按钮 更新
    handleUpdate () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (!_data) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 更新
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '修改项目' },
        canEdit: true,
        editStatus: constants_para.STATUS_UPDATE,
        data: _data
      }

      this.$emit('emitUpdate', operate_tab_data)
    },
    // 点击按钮 查看
    handleView () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === '4' || _data.status === '5') {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '查看项目详情' },
        canEdit: false,
        editStatus: constants_para.STATUS_VIEW,
        data: _data
      }

      this.$router.push({
        query: {}
      })

      this.$emit('emitView', operate_tab_data)
    },

    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        // 默认可用的按钮
        this.settings.btnStatus.showView = true
        this.settings.btnStatus.showPrint = true

        // 修改按钮 - 待审批和驳回状态可以修改
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_ZERO ||
            this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_THREE) {
          this.settings.btnStatus.showUpdate = true
        } else {
          this.settings.btnStatus.showUpdate = false
        }

        // 删除按钮 - 待审批和驳回状态可以删除
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_ZERO ||
            this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_THREE) {
          this.settings.btnStatus.showDel = true
        } else {
          this.settings.btnStatus.showDel = false
        }

        // 作废按钮 - 执行中状态可以作废
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_TWO) {
          this.settings.btnStatus.showCancel = true
        } else {
          this.settings.btnStatus.showCancel = false
        }

        // 审批按钮 - 审批中和作废审批中状态可以审批
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_ONE ||
            this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_FOUR) {
          this.settings.btnStatus.showApprove = true
        } else {
          this.settings.btnStatus.showApprove = false
        }

        // 下推业务按钮 - 执行中状态可以下推
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_TWO) {
          this.settings.btnStatus.showPush = true
        } else {
          this.settings.btnStatus.showPush = false
        }

        // 完成按钮 - 执行中状态可以完成
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_PROJECT_STATUS_TWO) {
          this.settings.btnStatus.showFinish = true
        } else {
          this.settings.btnStatus.showFinish = false
        }
      } else {
        // 没有选中任何行时，所有按钮都不可用
        this.settings.btnStatus.showUpdate = false
        this.settings.btnStatus.showCancel = false
        this.settings.btnStatus.showView = false
        this.settings.btnStatus.showDel = false
        this.settings.btnStatus.showApprove = false
        this.settings.btnStatus.showPush = false
        this.settings.btnStatus.showPrint = false
        this.settings.btnStatus.showFinish = false
      }

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
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
      _data.serial_type = constants_bpm.BPM_SO_B_PROJECT

      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === '4' || _data.status === '5') {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '项目审批' },
        canEdit: true,
        editStatus: constants_para.STATUS_AUDIT,
        data: _data,
        enableCancel: true // 撤销按钮显示
      }
      this.$emit('emitApprove', operate_tab_data)
    },
    // 作废按钮
    handleCancel () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popCancel.dialogVisible = true
      this.popCancel.data = this.dataJson.currentJson
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

      switch (tab.index) {
        case '1': // 待审批
          this.dataJson.searchForm.status_list = [constants_type.DICT_B_PROJECT_STATUS_ZERO]
          break
        case '2': // 审批中
          this.dataJson.searchForm.status_list = [constants_type.DICT_B_PROJECT_STATUS_ONE]
          break
        case '3': // 执行中
          this.dataJson.searchForm.status_list = [constants_type.DICT_B_PROJECT_STATUS_TWO]
          break
        case '4': // 已完成
          this.dataJson.searchForm.status_list = [constants_type.DICT_B_PROJECT_STATUS_SIX]
          break
        case '5': // 驳回
          this.dataJson.searchForm.status_list = [constants_type.DICT_B_PROJECT_STATUS_THREE]
          break
        case '6': // 作废审批中
          this.dataJson.searchForm.status_list = [constants_type.DICT_B_PROJECT_STATUS_FOUR]
          break
        case '7': // 已作废
          this.dataJson.searchForm.status_list = [constants_type.DICT_B_PROJECT_STATUS_FIVE]
          break
        default: // 全部 - 恢复之前保存的状态数据
          // 如果缓存为空或者没有缓存，则使用空数组（表示显示所有状态）
          this.dataJson.searchForm.status_list = this.dataJson.allTabStatusCache.length > 0 ? [...this.dataJson.allTabStatusCache] : []
          break
      }

      this.dataJson.searchForm.active_tabs_index = tab.index
      this.getDataList()
    },
    // 仓库
    handleWarehouseReturnData (val) {
      if (val === null) {
        // 仓库
        this.dataJson.searchForm.warehouse_id = null
        this.dataJson.searchForm.warehouse_name = null
      } else {
        // 仓库
        this.dataJson.searchForm.warehouse_id = val.warehouse_id
        this.dataJson.searchForm.warehouse_name = val.warehouse_name
      }
    },
    // 弹出框关闭
    handleDialogClose () {
      this.settings.visible = false
    },
    // 文件上传成功
    handleUploadFileSuccess (response) {
      this.settings.loading = true
      this.showLoading('正在上传，请稍后...')
      // 开始导入
      const tempData = response.response.data
      tempData.page_code = this.$route.meta.page_code
      importBInApi(tempData).then(response => {
        this.popSettingsImport.errorFileUrl = ''
        if (response.system_code !== 0) {
          this.popSettingsImport.errorFileUrl = response.data.url
          this.showErrorMsg('您上传的excel数据有错误，请点击错误信息进行查看！')
        } else if (response.system_code === 0) {
          const successList = '成功导入 ' + response.data.length + ' 条数据'
          this.$alert(successList, '导入成功', {
            confirmButtonText: '关闭',
            type: 'success'
          }).then(() => {
          })
        }
      }, (_error) => {
        // this.showErrorMsg('发生了异常，请联系管理员！', _error.data)
        console.log('发生了异常，请联系管理员！:' + JSON.stringify(_error))
      }).finally(() => {
        this.settings.loading = false
        this.closeLoading()
      })
    },
    /**
     * 删除按钮
     */
    handleDel () {
      const _data = deepCopy(this.dataJson.currentJson)
      // 状态为待审批或驳回才可以删除
      if (_data.status.toString() !== constants_type.DICT_B_PROJECT_STATUS_ZERO &&
          _data.status.toString() !== constants_type.DICT_B_PROJECT_STATUS_THREE) {
        this.showErrorMsg('项目状态异常，只有待审批或驳回状态才可以删除')
        return
      }
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
    /**
     * 删除确认处理
     */
    handleDelOk () {
      // 设置到table中绑定的json数据源
      this.settings.loading = true
      this.showLoading('正在删除，请稍后...')
      // 开始删除
      delApi({ id: this.dataJson.currentJson.id }).then((_data) => {
        this.$notify({
          title: '删除成功',
          message: _data.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      }, (_error) => {
        this.$notify({
          title: '删除失败',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.getDataList()
        this.settings.loading = false
        this.closeLoading()
      })
    },
    // 文件上传失败
    handleUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '导入错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    getTemplate () {
      const tempData = {}
      tempData.code = this.$route.meta.page_code
      getPageApi(tempData).then(response => {
        this.settings.loading = false
        this.popSettingsImport.templateFilePath = response.data.template_url
      }, (_error) => {
        // this.showErrorMsg('发生了异常，请联系管理员！', _error.data)
        console.log('发生了异常，请联系管理员！:' + JSON.stringify(_error))
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 货主下拉框
    getOwnerData () {
      getOwnerComboListApi().then((_data) => {
        this.dataJson.ownerComboList = _data.data
      }, (_error) => {
      })
    },
    // 点击查询, 同步状态为同步失败
    searchSyncError () {
      this.dataJson.searchForm.sync_status = '0'
      this.handleSearch()
    },
    // 设置创建时间的默认时间
    setDateRange () {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      this.dataJson.searchForm.create_dt.push(start)
      this.dataJson.searchForm.create_dt.push(end)
      this.dataJson.searchForm.c_time_start = start
      this.dataJson.searchForm.c_time_end = end
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
    // 点击按钮 新增
    handleNew () {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '新增项目管理' },
        canEdit: true,
        editStatus: constants_para.STATUS_INSERT
      }
      this.$emit('emitNew', operate_tab_data)
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
      // 等待DOM更新完成后再启动vue-tour
      this.$nextTick(() => {
        this.$tours['myTour'].start()
      })
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
    // 下推确认
    handlePushOk (val) {
      this.popPush.dialogVisible = false
      this.getDataList()
      this.$notify({
        title: '下推成功',
        message: null,
        type: 'success',
        duration: this.settings.duration
      })
    },
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
    handleCustomerReturnDataName (val) {
      if (val) {
        // 正常选择下游客户的情况
        this.dataJson.searchForm.purchaser_name = val.name
        this.dataJson.searchForm.purchaser_id = val.id
      } else {
        // 取消或清空的情况
        this.dataJson.searchForm.purchaser_name = ''
        this.dataJson.searchForm.purchaser_id = ''
      }
    },
    handlePrint () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popPrint.dialogVisible = true
      this.popPrint.data = _data
    },
    /**
     * 打印弹窗关闭
     */
    handlePrintCancel () {
      this.popPrint.dialogVisible = false
    },
    handlePush () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 直接打开销售合同下推弹窗
      this.soContractDialogData = _data
      this.soContractDialogVisible = true
    },
    // 下推取消
    handlePushCancel () {
      this.popPush.dialogVisible = false
    },
    // 销售合同下推确认
    handleSoContractOk (val) {
      this.soContractDialogVisible = false
      this.getDataList()
      this.$notify({
        title: '下推成功',
        message: '销售合同已成功创建',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 销售合同下推取消
    handleSoContractCancel () {
      this.soContractDialogVisible = false
    },
    handleFinish () {
    },
    // 处理URL参数
    handleUrlParams () {
      // 获取URL参数p1（项目编号）
      const code = this.$route.query.p1
      if (code) {
        // 调用重置按钮功能
        this.doResetSearch()
        // 将项目编号赋值到查询条件
        this.dataJson.searchForm.code = code
        // 触发查询
        this.handleSearch()
      }
    },
    // 获取审批情况显示文本
    getApprovalStatusText (row) {
      if (!row.next_approve_name) {
        return row.next_approve_name || ''
      }

      // 状态为1或4时，显示"待用户"+next_approve_name+"审批"
      if (row.status === constants_dict.DICT_B_PROJECT_STATUS_ONE || row.status === constants_dict.DICT_B_PROJECT_STATUS_FOUR) {
        return `待用户${row.next_approve_name}审批`
      }

      // 其他状态直接显示next_approve_name
      return row.next_approve_name
    }
  }
}
</script>
