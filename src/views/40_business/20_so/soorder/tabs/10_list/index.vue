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
      <el-tab-pane label="0">
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
            placeholder="销售订单编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="">
          <select-customer
            v-model.trim="dataJson.searchForm.customer_name"
            :placeholder="isPlaceholderShow('请选择客户')"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleCustomerReturnDataName"
          />
        </el-form-item>

        <el-form-item label="">
          <select-customer
            v-model.trim="dataJson.searchForm.seller_name"
            :placeholder="isPlaceholderShow('请选择主体企业')"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleSellerReturnDataName"
          />
        </el-form-item>
        <!--        全部页签专属状态显示控件-->
        <el-form-item v-if="dataJson.tabs.active === '0'">
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_SO_ORDER_STATUS"
            init-placeholder="请选择单据状态"
          />
        </el-form-item>
        <!--        其他页签显示的禁用状态控件，自动显示当前选中状态-->
        <el-form-item v-if="dataJson.tabs.active !== '0'">
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

    <el-button-group>
      <el-button
        v-permission="'B_SO_ORDER:UPDATE'"
        :disabled="!settings.btnStatus.showUpdate"
        type="primary"
        icon="el-icon-edit"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改
      </el-button>
      <el-button
        v-permission="'B_SO_ORDER:DELETE'"
        :disabled="!settings.btnStatus.showDel"
        type="primary"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDel"
      >删除
      </el-button>
      <el-button
        v-permission="'B_SO_ORDER:CANCEL'"
        :disabled="!settings.btnStatus.showCancel"
        type="primary"
        icon="el-icon-error"
        :loading="settings.loading"
        @click="handleCancel"
      >作废
      </el-button>
      <el-button
        v-permission="'B_SO_ORDER:AUDIT'"
        :disabled="!settings.btnStatus.showApprove"
        type="primary"
        icon="el-icon-s-check"
        :loading="settings.loading"
        @click="handleApprove"
      >审批
      </el-button>
      <el-button
        v-permission="'B_SO_ORDER:PUSH'"
        :disabled="!settings.btnStatus.showPush"
        type="primary"
        icon="el-icon-s-promotion"
        :loading="settings.loading"
        @click="handlePush"
      >下推业务
      </el-button>
      <el-button
        v-permission="'B_SO_ORDER:FINISH'"
        :disabled="!settings.btnStatus.showFinish"
        type="primary"
        icon="el-icon-success"
        :loading="settings.loading"
        @click="handleView"
      >完成
      </el-button>
      <!--      导出按钮-->
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'B_SO_ORDER:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'B_SO_ORDER:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <!--      导出模式切换按钮-->
      <el-button
        v-if="settings.btnStatus.hidenExport"
        v-permission="'B_SO_ORDER:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <el-button
        v-permission="'B_SO_ORDER:PRINT'"
        :disabled="!settings.btnStatus.showPrint"
        type="primary"
        icon="el-icon-printer"
        :loading="settings.loading"
        @click="handlePrint"
      >打印
      </el-button>
      <el-button
        v-permission="'B_SO_ORDER:INFO'"
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
        <span class="count-title">合同总金额：</span><span class="count-data">{{ dataJson.sumData.amount_total == null ? 0 : formatCurrency(dataJson.sumData.amount_total,true) }}</span>
        <span class="count-title">合同总销售数量：</span><span class="count-data">{{ dataJson.sumData.qty_total == null ? 0 : formatNumber(dataJson.sumData.qty_total,true,4) }}</span>
        <span class="count-title">预收未收总金额：</span><span class="count-data">{{ dataJson.sumData.advance_unreceive_total == null ? 0 : formatCurrency(dataJson.sumData.advance_unreceive_total,true) }}</span>
        <span class="count-title">预收已收款总金额：</span><span class="count-data">{{ dataJson.sumData.advance_received_total == null ? 0 : formatCurrency(dataJson.sumData.advance_received_total,true) }}</span>
        <span class="count-title">结算总金额：</span><span class="count-data">{{ dataJson.sumData.settle_amount_total == null ? 0 : formatCurrency(dataJson.sumData.settle_amount_total,true) }}</span>
        <span class="count-title">待结算数量（吨）：</span><span class="count-data">{{ dataJson.sumData.settle_can_qty_total == null ? 0 : formatNumber(dataJson.sumData.settle_can_qty_total,true,4) }}</span>
      </div>
    </div>

    <!-- 数据表格部分会很长，先创建基本框架 -->
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      canvas-auto-height
      :canvas-bottom-reserve="10"
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
        min-width="160"
        prop="customer_name"
        label="客户名称"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="seller_name"
        label="销售方名称"
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
        prop="settle_can_qty_total"
        label="待结算数量（吨）"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.settle_can_qty_total == null ? '' : formatNumber(scope.row.settle_can_qty_total, true, 4) }}
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
          prop="sku_code"
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
          prop="goods_name"
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
          prop="sku_name"
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
          prop="origin"
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
          prop="qty"
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
          prop="price"
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
          prop="tax_rate"
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

    <!-- 作废弹窗-->
    <cancel-confirm-dialog
      v-if="popCancel.dialogVisible"
      :data="popCancel.data"
      :visible="popCancel.dialogVisible"
      destroy-on-close
      @closeMeOk="handleCancelCloseDialogOk"
      @closeMeCancel="handleCancelCloseDialogCancel"
    />

    <!-- 下推弹窗-->
    <push-confirm-dialog
      v-if="popPush.dialogVisible"
      :data="popPush.data"
      :visible="popPush.dialogVisible"
      destroy-on-close
      @closeMeOk="handlePushDialogOk"
      @closeMeCancel="handlePushCloseDialogCancel"
      @openOutplanNew="handleOpenOutplanNew"
      @openSettlementNew="handleOpenSettlementNew"
      @openCargoRightTransferNew="handleOpenCargoRightTransferNew"
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
import SelectCustomer from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/customer/index.vue'
import {
  getListSumApi,
  exportApi,
  getListApi,
  delApi, getApi
} from '@/api/40_business/20_so/soorder/soorder'
import constants_para from '@/common/constants/constants_para'
import Pagination from '@/components/Pagination/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission' // 权限判断指令
import constants_dict from '@/common/constants/constants_dict'
import { EventBus } from '@/common/eventbus/eventbus'
import print_template from '@/views/40_business/20_so/soorder/tabs/60_print/index.vue'
import cancelConfirmDialog from '../../dialog/cancel/index.vue'
import pushConfirmDialog from '../../dialog/push/next/index.vue'
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'

export default {
  components: { SelectDicts, SelectCustomer, pushConfirmDialog, cancelConfirmDialog, print_template, Pagination },
  directives: { elDragDialog, permission },
  props: {
    data: {
      type: Object,
      default: null
    }
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
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          contract_code: '', // 合同编号
          code: null, // 销售订单编号
          customer_name: '', // 客户名称
          customer_id: '', // 客户ID
          seller_name: '', // 销售方名称
          seller_id: '', // 销售方ID
          status_list: [], // 单据状态列表
          type_list: [], // 合同类型列表
          settle_list: [], // 结算方式列表
          bill_type_list: [], // 结算单据类型列表
          goods_name: '', // 商品编号或名称（高级查询）
          active_tabs_index: '', // 当前被激活的页签
          status: '' // 单个状态（用于tabs切换）
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
      // 作废窗口的状态
      popCancel: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 下推窗口的状态
      popPush: {
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
          showDisable: false,
          showUpdate: false,
          showView: false,
          showExport: false,
          hidenExport: true,
          showApprove: false,
          showPrint: false,
          showPush: false,
          showCancel: false,
          showFinish: false
        },
        // loading 状态
        loading: true,
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
      ]
    }
  },
  computed: {
    CONSTANTS () {
      return constants_dict
    },
    // 高级查询计数器
    screenNum () {
      let count = 0
      if (this.dataJson.searchForm.goods_name) {
        count++
      }
      return count || ''
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
    },
    // 监听多选状态变化，更新按钮状态
    'dataJson.multipleSelection': {
      handler (newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnStatus.showDel = true
          this.settings.btnStatus.showUpdate = true
          this.settings.btnStatus.showView = true
          this.settings.btnStatus.showExport = false
          this.settings.btnStatus.hidenExport = false
          this.settings.btnStatus.showApprove = true
          this.settings.btnStatus.showPrint = true
          this.settings.btnStatus.showCancel = true
          this.settings.btnStatus.showPush = true
          this.settings.btnStatus.showFinish = true
        } else {
          this.settings.btnStatus.showDel = false
          this.settings.btnStatus.showUpdate = false
          this.settings.btnStatus.showView = false
          this.settings.btnStatus.showExport = false
          this.settings.btnStatus.hidenExport = true
          this.settings.btnStatus.showApprove = false
          this.settings.btnStatus.showPrint = false
          this.settings.btnStatus.showCancel = false
          this.settings.btnStatus.showPush = false
          this.settings.btnStatus.showFinish = false
        }
      },
      deep: true
    },
    // 监听"全部"页签中状态列表的变化，实时保存到缓存中
    'dataJson.searchForm.status_list': {
      handler (newVal, oldVal) {
        // 只有在"全部"页签时才保存状态变化
        if (this.dataJson.tabs.active === '0') {
          if (Array.isArray(newVal)) {
            this.dataJson.allTabStatusCache = [...newVal]
          }
        }
      },
      deep: true
    }
  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_MST_SOORDER_NEW_OK)
    EventBus.$off(this.EMITS.EMIT_MST_SOORDER_UPDATE_OK)
    EventBus.$off(this.EMITS.EMIT_MST_SOORDER_BPM_OK)
  },
  created () {
    // 作为独立页面，通过route路由打开时
    this.$options.name = this.$route.meta.page_code

    // 新增提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_SOORDER_NEW_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_SOORDER_NEW_OK', _data)
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
    EventBus.$on(this.EMITS.EMIT_MST_SOORDER_UPDATE_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_SOORDER_UPDATE_OK', _data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: this.dataJson.currentJson.id }).then(response => {
        // EventBus.$off(this.EMITS.EMIT_MST_SOORDER_UPDATE_OK)
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
    EventBus.$on(this.EMITS.EMIT_MST_SOORDER_BPM_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_SOORDER_BPM_OK', _data)
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

    // 接收穿透参数
    if (this.$route.query.so_contract_code) {
      this.dataJson.searchForm.so_contract_code = this.$route.query.so_contract_code
    }
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

    // 如果有穿透参数，自动触发查询
    if (this.$route.query.so_contract_code) {
      this.$nextTick(() => {
        this.handleSearch()
      })
    }
  },
  destroyed () {
  },
  methods: {
    // 初始化页面
    init (parm) {
      // 初始化"全部"标签页的状态缓存 - 默认为空数组（显示所有状态）
      if (this.dataJson.allTabStatusCache.length === 0) {
        this.dataJson.allTabStatusCache = [...this.dataJson.searchForm.status_list]
      }

      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
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
      const originalSearchForm = this.$options.data.call(this).dataJson.searchForm
      // 保留分页条件和活动标签索引
      const pageCondition = this.dataJson.searchForm.pageCondition
      const activeTabsIndex = this.dataJson.searchForm.active_tabs_index

      // 重置整个searchForm
      this.dataJson.searchForm = deepCopy(originalSearchForm)

      // 恢复分页条件和活动标签索引
      this.dataJson.searchForm.pageCondition = pageCondition
      this.dataJson.searchForm.active_tabs_index = activeTabsIndex

      // 确保数组字段被正确重置为空数组
      this.dataJson.searchForm.status_list = []
      this.dataJson.searchForm.type_list = []
      this.dataJson.searchForm.settle_list = []
      this.dataJson.searchForm.bill_type_list = []
    },
    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },
    handlePageChange () {
      // 分页变化
      this.handleSearch()
    },
    // 点击按钮 更新
    handleUpdate () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '修改销售订单' },
        canEdit: true,
        editStatus: constants_para.STATUS_UPDATE,
        data: _data
      }
      this.$emit('emitUpdate', operate_tab_data)
    },
    // 点击按钮 新增
    handleNew () {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '新增销售订单' },
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
      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === '4' || _data.status === '5') {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '查看销售订单' },
        canEdit: true,
        editStatus: constants_para.STATUS_VIEW,
        data: _data
      }
      this.$emit('emitView', operate_tab_data)
    },
    // 点击按钮 打印
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
      this.dataJson.currentJson = deepCopy(row)
      this.dataJson.currentJson.index = this.getRowIndex(row)
      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnStatus.showView = true
        this.settings.btnStatus.showPrint = true
        // 审批中和驳回状态，修改按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_ZERO ||
          this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_THREE) {
          this.settings.btnStatus.showUpdate = true
        } else {
          this.settings.btnStatus.showUpdate = false
        }
        // 待审批和驳回状态删除按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_ZERO ||
            this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_THREE) {
          this.settings.btnStatus.showDel = true
        } else {
          this.settings.btnStatus.showDel = false
        }
        // 作废
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_TWO) {
          this.settings.btnStatus.showCancel = true
        } else {
          this.settings.btnStatus.showCancel = false
        }
        // 审批
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_ONE ||
          this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_FOUR) {
          this.settings.btnStatus.showApprove = true
        } else {
          this.settings.btnStatus.showApprove = false
        }
        // 完成按钮权限
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_TWO) {
          this.settings.btnStatus.showFinish = true
        } else {
          this.settings.btnStatus.showFinish = false
        }
        // 下推按钮权限
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_TWO) {
          this.settings.btnStatus.showPush = true
        } else {
          this.settings.btnStatus.showPush = false
        }
      } else {
        this.settings.btnStatus.showCancel = false
        this.settings.btnStatus.showUpdate = false
        this.settings.btnStatus.showDel = false
        this.settings.btnStatus.showApprove = false
        this.settings.btnStatus.showPrint = false
        this.settings.btnStatus.showFinish = false
        this.settings.btnStatus.showPush = false
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
      _data.serial_type = constants_dict.DICT_B_SO_ORDER
      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === '4' || _data.status === '5') {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '销售订单审批' },
        canEdit: true,
        editStatus: constants_para.STATUS_AUDIT,
        data: _data,
        enableCancel: true
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
    // 删除按钮
    handleDel () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.status.toString() !== constants_dict.DICT_B_SO_ORDER_STATUS_ZERO && _data.status.toString() !== constants_dict.DICT_B_SO_ORDER_STATUS_THREE) {
        this.showErrorMsg('销售订单状态异常，只有待审批或驳回状态才可以删除')
        return
      }
      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
      }).then(() => {
        this.handleDelOk()
      }).catch(action => {
        if (action !== 'close') {
          // 当前页所选择的数据导出
        }
      })
    },
    handleDelOk () {
      this.settings.loading = true
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
    handleTabsClick (tab, event) {
      if (this.dataJson.searchForm.active_tabs_index === tab.index) {
        return
      }
      if (this.dataJson.tabs.active === '0' && tab.index !== '0') {
        this.dataJson.allTabStatusCache = [...this.dataJson.searchForm.status_list]
      }
      this.dataJson.tabs.active = tab.index
      switch (tab.index) {
        case '1':
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_SO_ORDER_STATUS_ZERO]
          break
        case '2':
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_SO_ORDER_STATUS_ONE]
          break
        case '3':
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_SO_ORDER_STATUS_TWO]
          break
        case '4':
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_SO_ORDER_STATUS_SIX]
          break
        case '5':
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_SO_ORDER_STATUS_THREE]
          break
        case '6':
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_SO_ORDER_STATUS_FOUR]
          break
        case '7':
          this.dataJson.searchForm.status_list = [constants_dict.DICT_B_SO_ORDER_STATUS_FIVE]
          break
        default:
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
    handlePush () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popPush.data = _data
      this.popPush.dialogVisible = true
    },
    handlePrintCancel () {
      this.popPrint.dialogVisible = false
    },
    handleExportOk () {
      this.settings.btnStatus.hidenExport = true
      this.settings.btnStatus.showExport = false
      this.settings.exportModel = false
    },
    handleModelOpen () {
      this.settings.exportModel = true
      this.settings.btnStatus.hidenExport = false
      this.$tours['myTour'].start()
    },
    handleExport () {
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnStatus.showExport = false
        })
      } else if (this.dataJson.multipleSelection.length === this.dataJson.listData.length) {
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全部导出',
          cancelButtonText: '当前页数据导出'
        }).then(() => {
          this.handleExportAllData()
        }).catch(action => {
          if (action !== 'close') {
            this.handleExportSelectionData()
          }
        })
      } else {
        this.handleExportSelectionData()
      }
    },
    handleExportSelectionData () {
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push(value.id)
      })
      const searchData = { ids: selectionJson }
      exportApi(searchData).then(response => {
        this.settings.loading = false
      })
    },
    handleExportAllData () {
      this.settings.loading = true
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
    handleCancelCloseDialogOk () {
      this.popCancel.dialogVisible = false
      this.getDataList()
      this.$notify({
        title: '作废成功',
        message: null,
        type: 'success',
        duration: this.settings.duration
      })
    },
    handleCancelCloseDialogCancel () {
      this.popCancel.dialogVisible = false
    },
    handlePushDialogOk (val) {
      this.popPush.dialogVisible = false
      this.getDataList()
      this.$notify({
        title: '下推成功',
        message: null,
        type: 'success',
        duration: this.settings.duration
      })
    },
    handlePushCloseDialogCancel (val) {
      this.popPush.dialogVisible = false
    },
    handleCustomerReturnDataName (val) {
      if (val) {
        this.dataJson.searchForm.customer_name = val.name
        this.dataJson.searchForm.customer_id = val.id
      } else {
        this.dataJson.searchForm.customer_name = ''
        this.dataJson.searchForm.customer_id = ''
      }
    },
    handleSellerReturnDataName (val) {
      if (val) {
        this.dataJson.searchForm.seller_name = val.name
        this.dataJson.searchForm.seller_id = val.id
      } else {
        this.dataJson.searchForm.seller_name = ''
        this.dataJson.searchForm.seller_id = ''
      }
    },
    isPlaceholderShow (val) {
      return val
    },
    getApprovalStatusText (row) {
      if (!row.next_approve_name) {
        return row.next_approve_name || ''
      }
      if (row.status === constants_dict.DICT_B_SO_ORDER_STATUS_ONE || row.status === constants_dict.DICT_B_SO_ORDER_STATUS_FOUR) {
        return `待用户${row.next_approve_name}审批`
      }
      return row.next_approve_name
    },
    handleOpenOutplanNew (data) {
      this.$emit('emitOutplanNew', data)
    },
    handleOpenSettlementNew (data) {
      this.$emit('emitSettlementNew', data)
    },
    handleOpenCargoRightTransferNew (data) {
      this.$emit('emitCargoRightTransferNew', data)
    }
  }
}
</script>

<style scoped>
/* 样式部分保持与销售订单一致 */
.app-container {
  padding: 20px;
}

.search-form-senior {
  padding: 10px;
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

.count-data {
  color: #1890ff;
  font-size: 20px;
}

.count-title {
  margin-left: 10px;
}

.el-button-group {
  margin-bottom: 10px;
}
</style>
