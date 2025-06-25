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
            v-model.trim="dataJson.searchForm.contract_no"
            clearable
            placeholder="合同编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item v-if="!isZhongLin">
          <el-select
            v-model="dataJson.searchForm.owner_name"
            :placeholder="isPlaceholderShow('请选择货主')"
            filterable
            clearable
          >
            <el-option
              v-for="item in dataJson.ownerComboList"
              :key="item.id"
              :label="item.short_name"
              :value="item.short_name"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isZhongLin">
          <select-warehouse
            v-model.trim="dataJson.searchForm.warehouse_name"
            :placeholder="isPlaceholderShow('请选择仓库')"
            :reset="settings.reset4"
            placement="left"
            @keyup.enter.native="handleSearch"
            @closeParentDialog="handleDialogClose"
            @onReturnData="handleWarehouseReturnData"
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.waybill_code"
            clearable
            placeholder="请输入物流合同"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <select-dict
            v-model="dataJson.searchForm.type"
            :para="CONSTANTS.DICT_B_IN_PLAN_TYPE"
            init-placeholder="请选择入库类型"
            :filter-para="dataJson.searchForm.filter_type"
            :disabled="settings.isTypeFlag"
          />
        </el-form-item>
        <el-form-item>
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_IN_PLAN_V2_STATUS"
            init-placeholder="请选择单据状态"
          />
        </el-form-item>
        <el-form-item>
          <select-dict
            v-model="dataJson.searchForm.bill_type"
            :para="CONSTANTS.DICT_B_IN_PLAN_BUSINESS_TYPE"
            init-placeholder="请选择单据类型"
          />
        </el-form-item>
        <!--        <el-form-item>-->
        <!--          <el-input-->
        <!--            v-model.trim="dataJson.searchForm.extra_code"-->
        <!--            clearable-->
        <!--            placeholder="外部关联单号"-->
        <!--            @keyup.enter.native="handleSearch"-->
        <!--          />-->
        <!--        </el-form-item>-->
        <el-form-item>
          <el-date-picker
            v-model="dataJson.searchForm.daterange"
            style="width: 292px"
            value-format="yyyy-MM-dd"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
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
        <el-form-item label="委托方">
          <select-enterprise
            v-model.trim="dataJson.searchForm.consignor_name"
            :placeholder="isPlaceholderShow('请选择委托方')"
            :type="CONSTANTS.DICT_CONSIGNOR"
            :reset="settings.reset2"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnDataName="handleConsignorReturnDataName"
          />
        </el-form-item>
        <el-form-item
          v-if="!isZhongLin"
          label="仓库"
        >
          <select-warehouse
            v-model.trim="dataJson.searchForm.warehouse_name"
            :reset="settings.reset4"
            placement="left"
            @keyup.enter.native="handleSearch"
            @closeParentDialog="handleDialogClose"
            @onReturnData="handleWarehouseReturnData"
          />
        </el-form-item>

        <el-form-item label="货主">
          <select-enterprise
            v-model.trim="dataJson.searchForm.owner_name"
            :placeholder="isPlaceholderShow('请选择货主')"
            :type="CONSTANTS.DICT_CONSIGNOR"
            :reset="settings.reset5"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnDataName="handleSupplierReturnDataName"
          />
        </el-form-item>
        <!--        <el-form-item-->
        <!--          v-if="isZhongLin"-->
        <!--          label="货主"-->
        <!--        >-->
        <!--          <el-select-->

        <!--            v-model="dataJson.searchForm.owner_name"-->
        <!--            :disabled="isViewModel"-->
        <!--            filterable-->
        <!--            clearable-->
        <!--          >-->
        <!--            <el-option-->
        <!--              v-for="item in dataJson.ownerComboList"-->
        <!--              :key="item.id"-->
        <!--              :label="item.short_name"-->
        <!--              :value="item.short_name"-->
        <!--            />-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->

        <el-form-item label="物料编码或名称">
          <el-input
            v-model.trim="dataJson.searchForm.goods_name"
            clearable
            placeholder="物料编码或名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="计划单号">
          <el-input
            v-model.trim="dataJson.searchForm.plan_code"
            clearable
            placeholder="计划单号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="供应商">
          <select-enterprise
            v-model.trim="dataJson.searchForm.customer_name"
            :placeholder="isPlaceholderShow('请选择供应商')"
            :type="CONSTANTS.DICT_SUPPLIER"
            :reset="settings.reset3"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnDataName="handleSupplierReturnDataName"
          />
        </el-form-item>
        <el-form-item label="仓库类型">
          <select-dict
            v-model="dataJson.searchForm.warehouse_type"
            :para="CONSTANTS.DICT_M_WAREHOUSE_TYPE"
            init-placeholder="请选择仓库类型"
          />
        </el-form-item>
        <el-form-item label="同步状态">
          <el-select
            v-model="dataJson.searchForm.sync_status"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in dataJson.syncStatusList"
              :key="item.sync_status"
              :label="item.status_name"
              :value="item.sync_status"
            />
          </el-select>
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

    <el-button-group v-if="!meDialogStatus">

      <el-button
        v-permission="'P_INPLAN:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleNew"
      >
        新增
      </el-button>
      <el-button
        v-permission="'P_INPLAN:UPDATE'"
        :disabled="!settings.btnStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >
        修改
      </el-button>
      <el-button
        v-permission="'P_INPLAN:IN_OPERATE'"
        :disabled="!settings.btnStatus.showOperate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleIn"
      >
        下推入库
      </el-button>
      <el-button
        v-permission="'P_INPLAN:AUDIT'"
        :disabled="!settings.btnStatus.showApprove"
        type="primary"
        icon="el-icon-s-check"
        :loading="settings.loading"
        @click="handleApprove"
      >审批</el-button>
      <el-button
        v-permission="'P_INPLAN:CANCEL'"
        :disabled="!settings.btnStatus.showCancel"
        type="primary"
        icon="el-icon-error"
        :loading="settings.loading"
        @click="handleCancel"
      >作废</el-button>
      <el-button
        v-permission="'P_INPLAN:FINISH'"
        :disabled="!settings.btnStatus.showFinish"
        type="primary"
        icon="el-icon-check"
        :loading="settings.loading"
        @click="handleFinish"
      >完成</el-button>
      <el-button
        v-permission="'P_INPLAN:INFO'"
        :disabled="!settings.btnStatus.showView"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
      <!--      导出按钮-->
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'P_INPLAN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'P_INPLAN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <!--      导出模式切换按钮-->
      <el-button
        v-if="settings.btnStatus.hidenExport"
        v-permission="'P_INPLAN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>

    </el-button-group>

    <div
      v-if="!meDialogStatus"
      class="div-sum"
    >
      <div class="right">
        <span class="count-title">计划入库数量：</span><span class="count-data">{{ dataJson.sumData.count == null?'0': isZhongLin ? formatNumber3(dataJson.sumData.count) :formatNumber(dataJson.sumData.count,true,4) }}</span>
        <span class="count-title">已入库数量：</span><span class="count-data">{{ dataJson.sumData.has_handle_count== null?'0':isZhongLin ? formatNumber3(dataJson.sumData.has_handle_count) :formatNumber(dataJson.sumData.has_handle_count,true,4) }}</span>
        <span class="count-title">待入库数量：</span><span class="count-data">{{ dataJson.sumData.pending_count > 0? isZhongLin ? formatNumber3(dataJson.sumData.pending_count) :formatNumber(dataJson.sumData.pending_count,true,4):'0' }}</span>
      </div>
    </div>

    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      :default-sort="{prop: 'u_time', order: 'descending'}"
      columns_index_key="true"
      stripe
      border
      fit
      highlight-current-row
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
        label="计划单号"
        :sort-orders="settings.sortOrders"
        align="center"
      >
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          min-width="170"
          prop="plan_code"
          label="单号"
        />
        <el-table-column
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="55"
          prop="no"
          label="序号"
        />
      </el-table-column>

      <el-table-column
        :auto-fit="true"
        sortable="custom"
        min-width="130"
        :sort-orders="settings.sortOrders"
        prop="plan_time"
        label="计划日期"
      >
        <template v-slot="scope">
          {{ scope.row.plan_time == null?'':formatDate(scope.row.plan_time) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="status_name"
        label="状态"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="in_counts"
        label="入库单数量"
      >
        <template v-slot="scope">
          <router-link v-if="scope.row.type !== '6'" :to="{name:constants_program.P_IN,query:{plan_code:scope.row.plan_code, fullpath:true}}"><a href="javascript:void(0)">{{ scope.row.in_counts == null?0:scope.row.in_counts }}</a></router-link>
          <router-link v-if="scope.row.type === '6'" :to="{name:constants_program.P_DELIVERY,query:{plan_code:scope.row.plan_code, fullpath:true}}"><a href="javascript:void(0)">{{ scope.row.in_counts == null?0:scope.row.in_counts }}</a></router-link>
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="contract_no"
        label="合同编号"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="order_no"
        label="订单编号"
      />
      <!--      <el-table-column-->
      <!--        sortable="custom"-->
      <!--        :sort-orders="settings.sortOrders"-->
      <!--        :auto-fit="true"-->
      <!--        min-width="130"-->
      <!--        prop="extra_code"-->
      <!--        label="外部关联单号"-->
      <!--      />-->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="waybill_code"
        label="物流合同"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="type_name"
        label="入库类型"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="warehouse_name"
        label="入库仓库"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="consignor_name"
        label="委托方"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="owner_name"
        label="货主"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="120"
        prop="customer_name"
        label="供应商"
        :auto-fit="true"
      />
      <!--      <el-table-column-->
      <!--        sortable="custom"-->
      <!--        :sort-orders="settings.sortOrders"-->
      <!--        :auto-fit="true"-->
      <!--        min-width="120"-->
      <!--        prop="ship_name"-->
      <!--        label="船名"-->
      <!--      />-->

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="bill_type_name"
        label="单据类型"
      />
      <el-table-column
        :auto-fit="true"
        sortable="custom"
        min-width="130"
        :sort-orders="settings.sortOrders"
        prop="contract_dt"
        label="合同日期"
      >
        <template v-slot="scope">
          {{ scope.row.contract_dt == null?'':formatDate(scope.row.contract_dt) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        min-width="120"
        prop="contract_num"
        label="合同量"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.contract_num == null? '': isZhongLin ? formatNumber3(scope.row.contract_num) : formatNumber(scope.row.contract_num) }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="goods_name"
        label="物料名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="pm"
        label="品名"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="spec"
        align="center"
        label="规格"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="type_gauge"
        align="center"
        label="型规"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="sku_code"
        align="center"
        label="规格编号"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="count"
        label="计划入库数量"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.count == null? '': isZhongLin ? formatNumber3(scope.row.count) : formatNumber(scope.row.count,true,4) }}
        </template>
      </el-table-column>
      <el-table-column
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="unit_name"
        label="单位"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="weight"
        label="换算后数量"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.weight == null? '': isZhongLin ? formatNumber3(scope.row.weight) : formatNumber(scope.row.weight,true,4) }}
        </template>
      </el-table-column>

      <el-table-column
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="unit"
        label="单位"
      >
        <template>吨</template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="has_handle_count"
        label="已入库数量"
        align="right"
      >
        <template v-slot="scope">
          {{ scope.row.has_handle_count == null? '': isZhongLin ? formatNumber3(scope.row.has_handle_count) : formatNumber(scope.row.has_handle_count,true,4) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        align="right"
        min-width="150"
        prop="pending_count"
        label="待入库数量"
      >
        <template v-slot="scope">
          {{ scope.row.pending_count > 0? isZhongLin ? formatNumber3(scope.row.pending_count) : formatNumber(scope.row.pending_count,true,4) : '0' }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="cancel_remark"
        label="作废理由"
      />
      <el-table-column
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_name"
        label="创建人"
      />
      <el-table-column
        :auto-fit="true"
        sortable="custom"
        min-width="200"
        :sort-orders="settings.sortOrders"
        prop="c_time"
        label="创建时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.c_time) }}
        </template>
      </el-table-column>
      <el-table-column
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
        :auto-fit="true"
        sortable="custom"
        min-width="200"
        :sort-orders="settings.sortOrders"
        prop="u_time"
        label="更新时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
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

    <!--作废理由-->
    <cancel-confirm-dialog
      v-if="cancelDialog.dialogVisible"
      :data="cancelDialog.data"
      :visible="cancelDialog.dialogVisible"
      @closeMeOk="handleCloseDialogOneOk"
      @closeMeCancel="handleCloseDialogOneCancel"
    />

    <!-- 入库单下推-->
    <push_operate_template
      v-if="popPushOperate.dialogVisible"
      :visible="popPushOperate.dialogVisible"
      :data="popPushOperate.data"
      title="入库单下推"
      @closeMeOk="handlePushOperateOk"
      @closeMeCancel="handlePushOperateCancel"
    />

    <!--    vue-tour组件-->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />
  </div>
</template>

<style scoped>
/* br {
  display: block;
  margin: 10px;
  content: ' ';
} */
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
.perfect_popper .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
/* sumData处的 el-link */
.el-link.el-link--default {
  font-size: 16px;
  vertical-align: top;
}
.el-tabs {
  margin-bottom: 5px;
}
</style>

<script>
import permission from '@/directive/permission/index.js' // 权限判断指令
import SelectEnterprise from '@/views/30_wms/customer/selectgrid/selectEnterprise.vue'
import constants_program from '@/common/constants/constants_program'
import SelectDict from '@/components/00_dict/select/SelectDict'
import SelectDicts from '@/components/00_dict/select/SelectDicts'
import constants_para from '@/common/constants/constants_para'
import constants_type from '@/common/constants/constants_dict'
import { getWarehouseComboListApi } from '@/api/30_wms/warehouse/warehouse'
import { getListSumApi, exportAllApi, exportApi, getListApi, cancelApi, finishApi, getIsHaveMoreDetailApi, getCountApi } from '@/api/40_business/inplanv2/inplanv2'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import mixin from './mixin'
import SelectWarehouse from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBinForSearch'
import cancelConfirmDialog from './dialog/cancelconfirm.vue'
import urlUtil from '@/utils/urlUtil'
import Constants_dict from '@/common/constants/constants_dict'
import constants_dict from '@/common/constants/constants_dict'
import { EventBus } from '@/common/eventbus/eventbus'
import { getApi } from '@/api/40_business/ap/ap'
import push_operate_template from '@/views/40_business/inv2/dialog/pushoperate/index.vue'

export default {
  components: { push_operate_template, Pagination, SelectDict, SelectDicts, SelectEnterprise, SelectWarehouse, cancelConfirmDialog },
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
    },
    height: {
      type: Number,
      default: 200
    },
    searchData: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近三个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }]
      },
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      constants_program: constants_program,
      dataJson: {
        tabsCount: {
          all: 0,
          todo: 0
        },
        tabs: {
          active: '0'
        },
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          contract_no: null,
          plan_code: '',
          // 查询条件
          name: '',
          config_key: '',
          consignor_id: '',
          owner_id: '',
          supplier_id: '',
          warehouse_id: '',
          consignor_name: '',
          sync_status: null,
          warehouse_type: null,
          todo_status: '2',
          daterange: [],
          status_list: ['3', '2', '1', '0', '6', '7', '4'],
          active_tabs_index: 0, // 当前被激活的页签
          filter_type: []
        },
        syncStatusList: [
          { 'status_name': '同步成功', 'sync_status': '1' },
          { 'status_name': '同步失败', 'sync_status': '0' }
        ],
        // 该计划单号下是否包含多条明细
        detail_count: 1,
        todoSearchForm: {},
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        sumData: {
          pending_count: 0,
          weight: 0,
          count: 0,
          sync_error_count: 0
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
      // 作废窗口的状态
      cancelDialog: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 入库单下推窗口的状态
      popPushOperate: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 修改弹窗
      updateDialog: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 页面设置json
      settings: {
        // 重置
        reset1: false,
        reset2: false,
        reset3: false,
        reset4: false,
        reset5: false,
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态
        btnStatus: {
          showEnable: false,
          showDisable: false,
          showUpdate: false,
          showOperate: false,
          showView: false,
          showApprove: false, // 审批
          showCancel: false,
          showFinish: false,
          showSync: false,
          showExport: false,
          hidenExport: true
        },
        // 分页插件骨架 loading 状态
        skeletonLoading: true,
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000,
        isTypeFlag: false,
        // 导出模式
        exportModel: false
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
      screenNum: 0
    }
  },
  computed: {
    // 判断是否是中林环境
    isZhongLin () {
      const href = window.location.href
      if (href.indexOf('shyiyuanth') !== -1 || href.indexOf('172.21.1.249') !== -1 || href.indexOf('localhost') !== -1) {
        return true
      } else {
        return false
      }
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
    'dataJson.searchForm': {
      deep: true,
      handler (newVal, oldVal) {
        const screenKeys = ['consignor_name', 'goods_name', 'plan_code', 'ship_name', 'customer_name', 'sync_status', 'warehouse_type']
        if (this.isZhongLin) {
          screenKeys.push('owner_name')
        } else {
          screenKeys.push('warehouse_name')
        }
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
      }
    }
  },
  beforeUpdate () {
    // 重新布局表格
    this.$nextTick(() => {
      this.$refs.multipleTable.doLayout()
    })
  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_NEW_OK)
    EventBus.$off(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_UPDATE_OK)
    EventBus.$off(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_BPM_OK)
  },
  created () {
    // 默认查询近一个月内的数据
    this.setDateRange()
    // 获取url参数
    const p1 = urlUtil.getHashQueryVariable(window.location.href, 'p1')
    this.init_List(p1)
    if (this.meDialogStatus) {
      if (this.searchData && this.searchData.type === 'b_schedule') {
        this.dataJson.searchForm.contract_no = this.searchData.contract_no
        this.dataJson.searchForm.status_list = ['2']
      }

      if (this.searchData.type !== null && this.searchData.type === this.CONSTANTS.DICT_B_IN_PLAN_TYPE_TIH) {
        this.dataJson.searchForm.status_list = [this.searchData.status]
        this.dataJson.searchForm.type = this.searchData.type
        this.settings.isTypeFlag = true
      }

      if (this.searchData.filter_type !== null && this.searchData.filter_type !== undefined) {
        this.dataJson.searchForm.filter_type = this.searchData.filter_type
      }
    }
    if (this.$route.query.code !== null && this.$route.query.code !== undefined) {
      this.dataJson.searchForm.plan_code = this.$route.query.code
      this.dataJson.tabs.active = '2'
      this.dataJson.searchForm.daterange = []
    }
    if (this.$route.query.contract_no != null && this.$route.query.contract_no !== undefined) {
      this.dataJson.searchForm.contract_no = this.$route.query.contract_no
      this.dataJson.tabs.active = '2'
      this.dataJson.searchForm.daterange = []
    }
    // 入库计划单号
    if (this.$route.query.serial_code !== null && this.$route.query.serial_code !== undefined) {
      this.dataJson.searchForm.plan_code = this.$route.query.serial_code
      this.dataJson.tabs.active = '2'
      this.dataJson.searchForm.daterange = []
    }
    // 初始化watch
    this.setWatch()
    // 初始化查询
    this.getDataList()
    // 数据初始化
    this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
    // 初始化仓库下拉框
    // this.getWarehouseData()

    // 新增提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_NEW_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_NEW_OK', _data)
      // EventBus.$off(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_NEW_OK)
      // 设置到table中绑定的json数据源
      console.log('新增数据：', _data)
      this.dataJson.listData.unshift(_data)
    })

    // 更新提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_UPDATE_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_UPDATE_OK', _data)
      // EventBus.$off(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_UPDATE_OK)
      // 设置到table中绑定的json数据源
      console.log('更新数据：', _data)
      // 设置到table中绑定的json数据源
      this.dataJson.listData.splice(this.dataJson.rowIndex, 1, _data)
      this.$nextTick(() => {
        this.$refs.multipleTable.setCurrentRow(this.dataJson.listData[this.dataJson.rowIndex])
      })
    })

    // 提交审批流时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_BPM_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_IN_PLAN_DETAIL_V2_BPM_OK', _data)
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
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      const _this = this
      _this.watch.unwatch_tempJson = _this.$watch('dataJson.multipleSelection', (newVal, oldVal) => {
        if (newVal.length > 0) {
          _this.settings.btnStatus.showEnable = true
          _this.settings.btnStatus.showDisable = true
          _this.settings.btnStatus.showApprove = true
          _this.settings.btnStatus.showFinish = true
          _this.settings.btnStatus.showSync = true
          _this.settings.btnStatus.showExport = true
        } else {
          _this.settings.btnStatus.showEnable = false
          _this.settings.btnStatus.showDisable = false
          _this.settings.btnStatus.showApprove = false
          _this.settings.btnStatus.showFinish = false
          _this.settings.btnStatus.showSync = false
          _this.settings.btnStatus.showExport = false
        }

        // _this.dataJson.multipleSelection.forEach(function (value, index, array) {
        //   if (value.status !== constants_type.DICT_B_IN_PLAN_STATUS_ONE && value.status !== constants_type.DICT_B_IN_PLAN_STATUS_FOUR) {
        //     // 非已提交状态不可审核/驳回
        //     _this.settings.btnStatus.showApprove = false
        //   }
        //
        //   if (value.status !== constants_type.DICT_B_IN_PLAN_STATUS_TWO) {
        //     // 非审核通过状态不可完成
        //     _this.settings.btnStatus.showFinish = false
        //   }
        // })
      }, { deep: true }
      )

      this.watch.unwatch_tempJson1 = this.$watch('dataJson.searchForm.daterange', (newVal, oldVal) => {
        if (this.dataJson.searchForm.daterange === null) {
          this.dataJson.searchForm.start_time = null
          this.dataJson.searchForm.over_time = null
        }
      }, { deep: true }
      )
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
      if (this.watch.unwatch_tempJson1) {
        this.watch.unwatch_tempJson1()
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
      if (this.dataJson.searchForm.daterange !== null && this.dataJson.searchForm.daterange !== undefined && this.dataJson.searchForm.daterange !== '') {
        this.dataJson.searchForm.start_time = this.dataJson.searchForm.daterange[0]
        this.dataJson.searchForm.over_time = this.dataJson.searchForm.daterange[1]
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
      // 查询入库计划列表
      getListApi(this.dataJson.searchForm).then(response => {
        // if (this.dataJson.searchForm.todo_status === '0') {
        //   this.dataJson.tabsCount.todo = response.data.total
        // }
        // this.dataJson.listData = response.data.records
        this.dataJson.listData = response.data
        // this.dataJson.paging.total = response.data.page_count
        // this.dataJson.paging = response.data
        // this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })

      // 查询总数量
      this.settings.skeletonLoading = true
      getCountApi(this.dataJson.searchForm).then(response => {
        this.dataJson.paging.total = response.data.page_count
        this.dataJson.paging.current = response.data.pageCondition.current
        this.dataJson.paging.size = response.data.pageCondition.size
      }).finally(() => {
        this.settings.skeletonLoading = false
      })

      // 查询合计信息
      getListSumApi(this.dataJson.searchForm).then(response => {
        if (response.data !== null) {
          this.dataJson.sumData = response.data
        } else {
          this.dataJson.sumData.pending_count = 0
          this.dataJson.sumData.count = 0
          this.dataJson.sumData.has_handle_count = 0
          this.dataJson.sumData.sync_error_count = 0
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
      this.dataJson.searchForm.customer_name = ''

      // 不重置过滤属性
      this.dataJson.searchForm.filter_type = this.searchData.filter_type

      // 重置货主、客户、仓库等组件
      this.settings.reset1 = !this.settings.reset1
      this.settings.reset2 = !this.settings.reset2
      this.settings.reset3 = !this.settings.reset3
      this.settings.reset4 = !this.settings.reset4

      // 默认查询近一个月内的数据
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
    handleNew () {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '新增入库计划' },
        canEdit: true,
        editStatus: constants_para.STATUS_INSERT
      }
      this.$emit('emitNew', operate_tab_data)
    },
    // 点击按钮 更新
    handleUpdate () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      if (_data.status === constants_dict.DICT_B_IN_PLAN_STATUS_V2_TWO) {
        this.showErrorMsg('已审核通过的数据不允许操作')
        return
      }
      if (_data.status === constants_dict.DICT_B_IN_PLAN_STATUS_V2_FOUR) {
        this.showErrorMsg('已作废的数据不允许操作')
        return
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '修改入库计划' },
        canEdit: true,
        editStatus: constants_para.STATUS_UPDATE,
        data: _data
      }

      this.$emit('emitUpdate', operate_tab_data)
    },
    handleIn () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      // 提库操作
      if (_data.type === Constants_dict.DICT_B_IN_PLAN_TYPE_TIH) {
        this.showErrorMsg('提库操作暂未编写')
        return
      } else {
        this.popPushOperate.editStatus = constants_para.STATUS_UPDATE
        this.popPushOperate.dialogVisible = true
        this.popPushOperate.data = _data
      }
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
        operate_tab_info: { show: true, name: '查看入库计划' },
        canEdit: true,
        editStatus: constants_para.STATUS_VIEW,
        data: _data
      }
      this.$emit('emitView', operate_tab_data)
    },
    // ------------------编辑弹出框 end--------------------
    renderHeaderIsEnabled: function (h, { column }) {
      return (
        <span>{column.label}
          <el-tooltip
            class='item'
            effect='dark'
            placement='bottom'
          >
            <div slot='content'>
              删除状态提示：<br/>
              绿色：已启用  <br/>
              红色：未启用
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    },

    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnStatus.showView = true
        this.settings.btnStatus.showPrint = true

        // 审批中和驳回状态，修改按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_IN_PLAN_V2_STATUS_ZERO ||
          this.dataJson.currentJson.status === constants_dict.DICT_B_IN_PLAN_V2_STATUS_THREE) {
          this.settings.btnStatus.showUpdate = true
        } else {
          this.settings.btnStatus.showUpdate = false
        }

        // 待审批状态删除按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_IN_PLAN_V2_STATUS_ZERO) {
          this.settings.btnStatus.showDel = true
        } else {
          this.settings.btnStatus.showDel = false
        }

        // 作废
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_IN_PLAN_V2_STATUS_TWO) {
          this.settings.btnStatus.showCancel = true
        } else {
          this.settings.btnStatus.showCancel = false
        }

        // 审批
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_IN_PLAN_V2_STATUS_ONE ||
          this.dataJson.currentJson.status === constants_dict.DICT_B_IN_PLAN_V2_STATUS_FOUR
        ) {
          this.settings.btnStatus.showApprove = true
        } else {
          this.settings.btnStatus.showApprove = false
        }

        // 审核通过可入库操作,并且来源不为调度任务
        if (this.dataJson.currentJson.status === constants_type.DICT_B_IN_PLAN_V2_STATUS_TWO && this.dataJson.currentJson.allocate_detail_id === null) {
          this.settings.btnStatus.showOperate = true
        } else {
          this.settings.btnStatus.showOperate = false
        }
      } else {
        this.settings.btnStatus.showCancel = false
        this.settings.btnStatus.showUpdate = false
        this.settings.btnStatus.showDel = false
        this.settings.btnStatus.showApprove = false
        this.settings.btnStatus.showOperate = false
      }

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      return val
    },
    // -----------------入库操作弹出框 start--------------------
    handleCloseDialogTwoOk (val) {
      this.updateDialog.visible = false
    },
    handleCloseDialogTwoCancel () {
      this.updateDialog.visible = false
    },
    // 审核按钮
    handleApprove () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      getIsHaveMoreDetailApi({ 'id': _data.id, 'plan_id': _data.plan_id }).then(response => {
        this.dataJson.detail_count = response.data
        if (this.dataJson.detail_count !== 1) {
          this.$confirm('确定要审核该计划单号吗？该计划单号下存在' + this.dataJson.detail_count + '条明细, 审核会更新所有入库计划明细的状态(审核通过).', '未选择数据错误', {
            distinguishCancelAndClose: true,
            confirmButtonText: '确认',
            cancelButtonText: '关闭'
          }).then(() => {
            // 选中数据提交
            this.openApproveDialog(_data)
          }).catch(action => {
            // 右上角X
            if (action !== 'close') {
              // 当前页所选择的数据导出
              return
            }
          })
        } else {
          // 选中数据提交
          this.openApproveDialog(_data)
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    openApproveDialog (_data) {
      _data.serial_id = _data.id
      _data.serial_type = constants_dict.DICT_B_IN_PLAN_V2

      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === '4' || _data.status === '5') {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '入库计划审批' },
        canEdit: true,
        editStatus: constants_para.STATUS_AUDIT,
        data: _data,
        enableCancel: true // 撤销按钮显示
      }
      this.$emit('emitApprove', operate_tab_data)
    },
    // 作废按钮
    handleCancel () {
      if (this.dataJson.currentJson.type === constants_type.DICT_B_IN_PLAN_TYPE_JG_TH) {
        this.showErrorMsg('监管退货无法作废')
        return
      }

      this.$confirm('点击作废将直接更新状态为作废，请谨慎操作。确定要作废吗？', '确认信息', {}).then(() => {
        this.handleCancelOk()
      }).catch(action => {
        // 右上角X
        if (action !== 'close') {
          // 当前页所选择的数据导出
          // this.handleExportSelectionData()
        }
      })
    },
    // 确认作废
    handleCancelOk () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      this.cancelDialog.dialogVisible = true
      this.cancelDialog.data = this.dataJson.currentJson
    },
    // 查询作废的入库计划单存在多少个详情
    handleCloseDialogOneOk (val) {
      this.settings.loading = true
      this.cancelDialog.data = Object.assign({}, this.dataJson.currentJson)

      getIsHaveMoreDetailApi(val).then(response => {
        this.dataJson.detail_count = response.data
        if (this.dataJson.detail_count !== 1) {
          this.$confirm('确定要作废该计划单号吗？该计划单号下存在' + this.dataJson.detail_count + '条明细, 作废会更新所有入库计划明细的状态(已作废).', '未选择数据错误', {
            distinguishCancelAndClose: true,
            confirmButtonText: '确认',
            cancelButtonText: '关闭'
          }).then(() => {
            // 选中数据提交
            this.handleCancelData(val)
          }).catch(action => {
            // 右上角X
            if (action !== 'close') {
              // 当前页所选择的数据导出
              return
            }
          })
        } else {
          // 选中数据提交
          this.handleCancelData(val)
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handleCancelData (val) {
      this.settings.loading = true
      this.showLoading('正在保存，请稍后...')
      // 开始作废
      cancelApi(val).then((_data) => {
        this.$notify({
          title: '作废成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.cancelDialog.dialogVisible = false
        this.getDataList()
        // loading
      }, (_error) => {
        this.$notify({
          title: '作废错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
        this.closeLoading()
      })
    },
    handleCloseDialogOneCancel () {
      this.cancelDialog.dialogVisible = false
    },
    // 完成按钮
    handleFinish () {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行完成', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnStatus.showDelete = false
        })
      } else {
        // 选中数据完成
        this.handleDetailCountFinish()
      }
    },
    // 查询完成时有多少条详情数据
    handleDetailCountFinish () {
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push({ 'plan_id': value.plan_id })
      })
      getIsHaveMoreDetailApi(selectionJson).then(response => {
        this.dataJson.detail_count = response.data
        if (this.dataJson.detail_count !== 1) {
          this.$confirm('确定要完成该计划单号吗？该计划单号下存在' + this.dataJson.detail_count + '条明细, 完成会更新所有入库计划明细的状态(已完成).', '未选择数据错误', {
            distinguishCancelAndClose: true,
            confirmButtonText: '确认',
            cancelButtonText: '关闭'
          }).then(() => {
            // 选中数据提交
            this.handleFinishSelectionData()
          }).catch(action => {
            // 右上角X
            if (action !== 'close') {
              // 当前页所选择的数据导出
              return
            }
          })
        } else {
          // 选中数据提交
          this.handleFinishSelectionData()
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 完成数据
    handleFinishSelectionData () {
      // loading
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push({ 'id': value.id, 'plan_id': value.plan_id })
      })
      // 开始完成
      finishApi(selectionJson).then((_data) => {
        this.$notify({
          title: '完成成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.getDataList()
        // loading
      }, (_error) => {
        this.$notify({
          title: '完成错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    getWarehouseData () {
      getWarehouseComboListApi().then((_data) => {
        this.dataJson.warehouseComboList = _data.data
      }, (_error) => {
      })
    },
    handleConsignorReturnDataName (val) {
      this.dataJson.searchForm.consignor_name = val
    },
    handleSupplierReturnDataName (val) {
      this.dataJson.searchForm.customer_name = val
    },
    handleTabsClick (tab, event) {
      if (this.dataJson.searchForm.active_tabs_index === tab.index) {
        return
      }
      switch (tab.index) {
        case '1': // 待审批
          this.dataJson.searchForm.status = constants_type.DICT_B_IN_PLAN_STATUS_V2_ZERO
          break
        case '2': // 审批中
          this.dataJson.searchForm.status = constants_type.DICT_B_IN_PLAN_STATUS_V2_ONE
          break
        case '3': // 执行中
          this.dataJson.searchForm.status = constants_type.DICT_B_IN_PLAN_STATUS_V2_TWO
          break
        case '4': // 已完成
          this.dataJson.searchForm.status = constants_type.DICT_B_IN_PLAN_STATUS_V2_SIX
          break
        case '5': // 驳回
          this.dataJson.searchForm.status = constants_type.DICT_B_IN_PLAN_STATUS_V2_THREE
          break
        case '6': // 作废审批中
          this.dataJson.searchForm.status = constants_type.DICT_B_IN_PLAN_STATUS_V2_FOUR
          break
        case '7': // 已作废
          this.dataJson.searchForm.status = constants_type.DICT_B_IN_PLAN_STATUS_V2_FIVE
          break
        default:
          this.dataJson.searchForm.status = ''
          break
      }
      this.getDataList()
      this.dataJson.searchForm.active_tabs_index = tab.index
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
    // 初始化查询页面
    init_List (para) {
      this.dataJson.searchForm.active_tabs_index = para
      this.dataJson.tabs.active = para

      // 接收url参数
      if (this.data !== null && this.data.searchForm !== null) {
        this.dataJson.searchForm = this.data.searchForm
      } else {
        this.dataJson.searchForm.schedule_code = this.$route.query.schedule_code
      }
      // 初始化watch
      this.setWatch()
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
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
    // 全部数据导出
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
        this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 部分数据导出
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push({ 'id': value.id })
      })
      // 开始导出
      exportApi(selectionJson).then(response => {
        this.settings.loading = false
      })
    },
    // 设置创建时间的默认时间
    setDateRange () {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      this.dataJson.searchForm.daterange.push(start)
      this.dataJson.searchForm.daterange.push(end)
      this.dataJson.searchForm.start_time = start
      this.dataJson.searchForm.over_time = end
    },
    // 下推确认
    handlePushOperateOk (val) {
      this.popPushOperate.dialogVisible = false
      this.getDataList()
      this.$notify({
        title: '下推成功',
        message: null,
        type: 'success',
        duration: this.settings.duration
      })
    },
    /**
     * 下推弹窗关闭
     */
    handlePushOperateCancel () {
      this.popPushOperate.dialogVisible = false
    }
  }
}
</script>
