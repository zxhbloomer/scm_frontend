<template>
  <div class="app-container">
    <FloatMenu />
    <!-- 状态标签页 -->
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

    <!-- 查询条件区域 -->
    <div>
      <el-form
        ref="minusForm"
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
      >
        <!-- 基本查询条件 -->
        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.code"
            clearable
            placeholder="计划编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.contract_code"
            clearable
            placeholder="合同编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.order_code"
            clearable
            placeholder="订单编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="">
          <select-se-customer
            v-model.trim="dataJson.searchForm.owner_name"
            placeholder="请选择货主"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleOwnerReturnDataName"
          />
        </el-form-item>

        <el-form-item label="">
          <select-warehouse
            v-model.trim="dataJson.searchForm.warehouse_name"
            placeholder="请选择仓库"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleWarehouseReturnDataName"
          />
        </el-form-item>

        <el-form-item label="">
          <select-cp-supplier
            v-model.trim="dataJson.searchForm.supplier_name"
            placeholder="请选择供应商"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleSupplierReturnDataName"
          />
        </el-form-item>

        <!-- 全部页签专属状态显示控件 -->
        <el-form-item v-if="dataJson.tabs.active === '0'">
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_IN_PLAN_STATUS"
            init-placeholder="请选择单据状态"
          />
        </el-form-item>

        <!-- 其他页签显示的禁用状态控件，自动显示当前选中状态 -->
        <el-form-item v-if="dataJson.tabs.active !== '0'">
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_IN_PLAN_STATUS"
            init-placeholder="请选择单据状态"
            disabled
          />
        </el-form-item>

        <el-form-item>
          <select-dicts
            v-model="dataJson.searchForm.type_list"
            :para="CONSTANTS.DICT_B_IN_PLAN_TYPE"
            init-placeholder="请选择入库类型"
          />
        </el-form-item>

        <!-- 高级查询按钮 -->
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

        <!-- 查询按钮 -->
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

    <!-- 高级查询弹窗 -->
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
        <el-form-item label="物料编码或名称">
          <el-input
            v-model.trim="dataJson.searchForm.goods_name"
            clearable
            placeholder="物料编码或名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="项目编码">
          <el-input
            v-model.trim="dataJson.searchForm.project_code"
            clearable
            placeholder="项目编码"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="计划时间">
          <el-date-picker
            v-model="dataJson.searchForm.plan_times"
            type="datetimerange"
            range-separator="至"
            start-placeholder="计划时间开始"
            end-placeholder="计划时间结束"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
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

    <!-- 操作按钮区域 -->
    <el-button-group>
      <el-button
        v-permission="'P_IN_PLAN:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleNew"
      >
        新增
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:UPDATE'"
        :disabled="!settings.btnStatus.showUpdate"
        type="primary"
        icon="el-icon-edit"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:DELETE'"
        :disabled="!settings.btnStatus.showDel"
        type="primary"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDel"
      >删除
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:CANCEL'"
        :disabled="!settings.btnStatus.showCancel"
        type="primary"
        icon="el-icon-error"
        :loading="settings.loading"
        @click="handleCancel"
      >作废
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:AUDIT'"
        :disabled="!settings.btnStatus.showApprove"
        type="primary"
        icon="el-icon-s-check"
        :loading="settings.loading"
        @click="handleApprove"
      >审批
      </el-button>
      <el-button
        :disabled="!settings.btnStatus.showInbound"
        type="primary"
        icon="el-icon-box"
        :loading="settings.loading"
        @click="handleInbound"
      >入库操作
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:FINISH'"
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
        v-permission="'P_IN_PLAN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'P_IN_PLAN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnStatus.hidenExport"
        v-permission="'P_IN_PLAN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <!--      导出按钮 结束-->
      <el-button
        v-permission="'P_IN_PLAN:PRINT'"
        :disabled="!settings.btnStatus.showPrint"
        type="primary"
        icon="el-icon-printer"
        :loading="settings.loading"
        @click="handlePrint"
      >打印
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:INFO'"
        :disabled="!settings.btnStatus.showView"
        type="primary"
        icon="el-icon-view"
        :loading="settings.loading"
        @click="handleView"
      >查看
      </el-button>
    </el-button-group>

    <!-- 统计信息 -->
    <div
      class="div-sum"
    >
      <div class="right">
        <span class="count-title">总入库数量：</span><span class="count-data">{{ dataJson.sumData.qty_sum == null ? 0 : formatNumber(dataJson.sumData.qty_sum,true,4) }}</span>
      </div>
    </div>
    <!-- 数据表格 -->
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      columns_index_key="false"
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
        width="50"
        label="序号"
      />
      <!-- 入库计划主表 -->
      <el-table-column label="入库计划主表" align="center">
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="150"
          prop="code"
          label="计划单号"
          align="left"
        />
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="160"
          prop="plan_time"
          label="计划日期"
          align="left"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.plan_time) }}
          </template>
        </el-table-column>
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="120"
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
          <template slot-scope="scope">
            {{ getApprovalStatusText(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="120"
          prop="type_name"
          label="入库类型"
          align="left"
        />
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="150"
          prop="owner_name"
          label="货主"
          align="left"
        />
      </el-table-column>

      <!-- 入库计划明细 -->
      <el-table-column
        label="入库计划明细"
        align="center"
        :merge-group="true"
      >
        <el-table-column
          :merge-cells="true"
          min-width="80"
          label="序号"
          align="left"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.no }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="150"
          label="合同编号"
          align="left"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.contract_code }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="150"
          label="订单编号"
          align="left"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.order_code }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="150"
          label="入库仓库"
          align="left"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.warehouse_name }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="150"
          label="供应商"
          align="left"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.supplier_name }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="120"
          label="订单量"
          align="right"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.order_qty == null ? '' : formatNumber(item.order_qty, true, 4) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="200"
          label="物料名称"
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
          min-width="120"
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
          min-width="120"
          label="计划入库数量"
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
          min-width="80"
          label="单位"
          align="center"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.unit_name || '吨' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="100"
          label="已入库"
          align="right"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.processed_qty == null ? '' : formatNumber(item.processed_qty, true, 4) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="100"
          label="待入库"
          align="right"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.unprocessed_qty == null ? '' : formatNumber(item.unprocessed_qty, true, 4) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :merge-cells="true"
          min-width="120"
          label="入库确认中"
          align="right"
        >
          <template v-slot="scope">
            <div
              v-for="(item, index) in scope.row.detailListData"
              :key="index"
              :class="getClass(index, scope.row.detailListData.length)"
            > {{ item.processing_qty == null ? '' : formatNumber(item.processing_qty, true, 4) }}
            </div>
          </template>
        </el-table-column>

      </el-table-column>

      <!-- 创建人 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_name"
        label="创建人"
        align="left"
      />

      <!-- 创建时间 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="180"
        prop="c_time"
        label="创建时间"
        align="left"
      >
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.c_time) }}
        </template>
      </el-table-column>

      <!-- 更新人 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="u_name"
        label="更新人"
        align="left"
      />

      <!-- 更新时间 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="180"
        prop="u_time"
        label="更新时间"
        align="left"
      >
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination_for_list
      ref="minusPaging"
      :total="dataJson.paging.total"
      :page.sync="dataJson.paging.current"
      :limit.sync="dataJson.paging.size"
      @pagination="getDataList"
    />

    <!-- 作废申请对话框 -->
    <cancel-dialog
      :visible.sync="showCancelDialog"
      :data="cancelDialogData"
      @closeMeOk="handleCancelOk"
      @closeMeCancel="handleCancelCancel"
    />

    <!-- 入库货物明细选择弹窗 -->
    <select-goods-dialog
      :visible.sync="showSelectGoodsDialog"
      :in-plan-id="selectedInPlanId"
      @next="handleSelectGoodsNext"
      @close="handleSelectGoodsClose"
    />
  </div>
</template>

<script>
import { getListApi, getListSumApi, getApi, delApi, finishApi, exportApi } from '@/api/40_business/inplan/inplan'
import FloatMenu from '@/components/FloatMenu'
import pagination_for_list from '@/components/Pagination/index'
import mixin from './mixin'
import CancelDialog from '../../dialog/cancel/index.vue'
import SelectGoodsDialog from '../../dialog/select_goods/index.vue'
import SelectSeCustomer from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/customer'
import SelectCpSupplier from '@/views/20_master/enterprise/dialog/selectgrid/counterparty/supplier'
import SelectWarehouse from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin'
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'
import permission from '@/directive/permission/index.js' // 权限判断指令
import deepCopy from 'deep-copy'
import { EventBus } from '@/common/eventbus/eventbus' // EventBus事件总线
import constants_dict from '@/common/constants/constants_dict'

export default {
  name: 'InPlanList',
  components: {
    FloatMenu,
    pagination_for_list,
    CancelDialog,
    SelectGoodsDialog,
    SelectSeCustomer,
    SelectCpSupplier,
    SelectWarehouse,
    SelectDicts
  },
  directives: { permission },
  mixins: [mixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      // 数据json
      dataJson: {
        tabs: {
          active: '0' // 默认显示全部
        },
        // 保存"全部"页签中用户手动选择的状态数据
        allTabStatusCache: [],
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 当前被激活的页签
          active_tabs_index: '',
          code: '', // 计划编号
          contract_code: '', // 合同编号
          order_code: '', // 订单编号
          owner_name: '', // 货主名称
          owner_id: '', // 货主ID
          warehouse_name: '', // 仓库名称
          warehouse_id: '', // 仓库ID
          supplier_name: '', // 供应商名称
          supplier_id: '', // 供应商ID
          status_list: [], // 单据状态列表
          type_list: [], // 入库类型列表
          goods_name: '', // 物料编码或名称（高级查询）
          project_code: '', // 项目编码（高级查询）
          plan_times: [] // 计划时间起始、结束（高级查询）
        },
        listData: [], // 列表数据
        total: 0, // 总条数
        currentJson: null, // 当前选中行
        multipleSelection: [], // 多选数据
        // 翻页条件
        pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 统计数据
        sumData: {
          total_qty: 0, // 计划总数量
          total_processed_qty: 0, // 已处理数量
          total_processing_qty: 0, // 处理中数量
          total_unprocessed_qty: 0, // 未处理数量
          total_weight: 0, // 计划总重量
          total_processed_weight: 0, // 已处理重量
          total_processing_weight: 0, // 处理中重量
          total_unprocessed_weight: 0, // 未处理重量
          total_volume: 0, // 计划总体积
          total_processed_volume: 0, // 已处理体积
          total_processing_volume: 0, // 处理中体积
          total_unprocessed_volume: 0, // 未处理体积
          total_amount: 0, // 计划总金额
          total_processed_amount: 0, // 已处理金额
          total_processing_amount: 0, // 处理中金额
          total_unprocessed_amount: 0 // 未处理金额
        }
      },
      // 打印窗口的状态
      popPrint: {
        dialogVisible: false,
        data: null
      },
      // 页面设置
      settings: {
        loading: false,
        duration: 4000, // 消息提示持续时间
        tableHeight: this.setUIheight(),
        // 表格排序规则
        sortOrders: ['ascending', 'descending'],
        // 导出模式
        exportModel: false,
        btnStatus: {
          showUpdate: false,
          showDel: false,
          showCancel: false,
          showApprove: false,
          showInbound: false,
          showFinish: false,
          showView: false,
          showPrint: false,
          showExport: false,
          hidenExport: true
        }
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
      screenNum: 0, // 高级查询条件数量
      showCancelDialog: false, // 显示作废对话框
      cancelDialogData: null, // 作废对话框数据
      showSelectGoodsDialog: false, // 显示入库货物选择弹窗
      selectedInPlanId: null // 选中的入库计划ID
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
    // 监听高级查询条件变化，更新高级查询条件数量
    'dataJson.searchForm': {
      handler (newVal) {
        let count = 0
        // 统计高级查询条件数量
        if (newVal.goods_name && newVal.goods_name.trim() !== '') count++
        if (newVal.project_code && newVal.project_code.trim() !== '') count++
        if (newVal.plan_times && newVal.plan_times.length === 2) count++
        this.screenNum = count
      },
      deep: true
    }
  },
  created () {
    // 新增提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_INPLAN_NEW_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_INPLAN_NEW_OK', _data)
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
    EventBus.$on(this.EMITS.EMIT_MST_INPLAN_UPDATE_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_INPLAN_UPDATE_OK', _data)
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
    EventBus.$on(this.EMITS.EMIT_MST_INPLAN_BPM_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_INPLAN_BPM_OK', _data)
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
    this.handleSearch()
  },
  beforeDestroy () {
    // 清理EventBus监听器
    EventBus.$off(this.EMITS.EMIT_MST_INPLAN_NEW_OK)
    EventBus.$off(this.EMITS.EMIT_MST_INPLAN_UPDATE_OK)
    EventBus.$off(this.EMITS.EMIT_MST_INPLAN_BPM_OK)
  },
  methods: {

    /**
     * 刷新统计数据
     */
    refreshSumData () {
      // 重新查询统计数据
      getListSumApi(this.dataJson.searchForm).then(response => {
        if (response.data !== null) {
          this.dataJson.sumData = response.data
        }
      }).catch(error => {
        console.warn('刷新统计数据失败：', error)
      })
    },

    /**
     * 搜索
     */
    handleSearch () {
      this.dataJson.paging.current = 1
      this.getDataList()
    },

    /**
     * 获取行索引
     */
    getRowIndex (row) {
      return this.dataJson.listData.findIndex(item => item.id === row.id)
    },

    /**
     * 获取列表数据
     */
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
          this.dataJson.sumData.total_qty = 0
          this.dataJson.sumData.total_processed_qty = 0
          this.dataJson.sumData.total_processing_qty = 0
          this.dataJson.sumData.total_unprocessed_qty = 0
          this.dataJson.sumData.total_amount = 0
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },

    /**
     * 标签页切换
     */
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
          this.dataJson.searchForm.status_list = [this.CONSTANTS.DICT_B_IN_PLAN_STATUS_ZERO]
          break
        case '2': // 审批中
          this.dataJson.searchForm.status_list = [this.CONSTANTS.DICT_B_IN_PLAN_STATUS_ONE]
          break
        case '3': // 执行中
          this.dataJson.searchForm.status_list = [this.CONSTANTS.DICT_B_IN_PLAN_STATUS_TWO]
          break
        case '4': // 已完成
          this.dataJson.searchForm.status_list = [this.CONSTANTS.DICT_B_IN_PLAN_STATUS_SIX]
          break
        case '5': // 驳回
          this.dataJson.searchForm.status_list = [this.CONSTANTS.DICT_B_IN_PLAN_STATUS_THREE]
          break
        case '6': // 作废审批中
          this.dataJson.searchForm.status_list = [this.CONSTANTS.DICT_B_IN_PLAN_STATUS_FOUR]
          break
        case '7': // 已作废
          this.dataJson.searchForm.status_list = [this.CONSTANTS.DICT_B_IN_PLAN_STATUS_FIVE]
          break
        default: // 全部 - 恢复之前保存的状态数据
          // 如果缓存为空或者没有缓存，则使用空数组（表示显示所有状态）
          this.dataJson.searchForm.status_list = this.dataJson.allTabStatusCache && this.dataJson.allTabStatusCache.length > 0 ? [...this.dataJson.allTabStatusCache] : []
          break
      }

      this.dataJson.searchForm.active_tabs_index = tab.index
      this.getDataList()
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'validate_vehicle' && row.validate_vehicle !== '1') {
        return 'warning-cell'
      }
      return ''
    },
    /**
     * 当前行变化
     */
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnStatus.showView = true
        this.settings.btnStatus.showPrint = true

        // 修改按钮：待审批(0)或驳回(3)
        if (this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_ZERO ||
          this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_THREE) {
          this.settings.btnStatus.showUpdate = true
        } else {
          this.settings.btnStatus.showUpdate = false
        }

        // 删除按钮：待审批(0)和驳回(3)
        if (this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_ZERO ||
            this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_THREE) {
          this.settings.btnStatus.showDel = true
        } else {
          this.settings.btnStatus.showDel = false
        }

        // 作废按钮：仅执行中(2)
        if (this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_TWO) {
          this.settings.btnStatus.showCancel = true
        } else {
          this.settings.btnStatus.showCancel = false
        }

        // 审批按钮：审批中(1)或作废审批中(4)
        if (this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_ONE ||
          this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_FOUR) {
          this.settings.btnStatus.showApprove = true
        } else {
          this.settings.btnStatus.showApprove = false
        }

        // 入库操作按钮：仅执行中(2)
        if (this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_TWO) {
          this.settings.btnStatus.showInbound = true
        } else {
          this.settings.btnStatus.showInbound = false
        }

        // 完成按钮：仅执行中(2)
        if (this.dataJson.currentJson.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_TWO) {
          this.settings.btnStatus.showFinish = true
        } else {
          this.settings.btnStatus.showFinish = false
        }
      } else {
        this.settings.btnStatus.showCancel = false
        this.settings.btnStatus.showUpdate = false
        this.settings.btnStatus.showDel = false
        this.settings.btnStatus.showApprove = false
        this.settings.btnStatus.showInbound = false
        this.settings.btnStatus.showPrint = false
        this.settings.btnStatus.showFinish = false
        this.settings.btnStatus.showView = false
      }
    },

    /**
     * 多选变化
     */
    handleSelectionChange (selection) {
      this.dataJson.multipleSelection = selection
    },

    /**
     * 新增
     */
    handleNew () {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '新增入库计划' },
        canEdit: true,
        editStatus: this.CONSTANTS.STATUS_INSERT
      }
      this.$emit('emitNew', operate_tab_data)
    },

    /**
     * 修改
     */
    handleUpdate () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '修改入库计划' },
        canEdit: true,
        editStatus: this.CONSTANTS.STATUS_UPDATE,
        data: _data
      }

      this.$emit('emitUpdate', operate_tab_data)
    },

    /**
     * 查看
     */
    handleView () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '查看入库计划' },
        canEdit: true,
        editStatus: this.CONSTANTS.STATUS_VIEW,
        data: _data
      }
      this.$emit('emitView', operate_tab_data)
    },

    /**
     * 审批
     */
    handleApprove () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      _data.serial_id = _data.id
      _data.serial_type = this.CONSTANTS.DICT_B_INPLAN

      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_FOUR ||
          _data.status === this.CONSTANTS.DICT_B_IN_PLAN_STATUS_FIVE) {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '入库计划审批' },
        canEdit: true,
        editStatus: this.CONSTANTS.STATUS_AUDIT,
        data: _data,
        enableCancel: true // 撤销按钮显示
      }
      this.$emit('emitApprove', operate_tab_data)
    },

    /**
     * 入库操作
     */
    handleInbound () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      // 检查状态：仅执行中状态可以进行入库操作
      if (_data.status.toString() !== this.CONSTANTS.DICT_B_IN_PLAN_STATUS_TWO) {
        this.showErrorMsg('只有执行中状态的入库计划才能进行入库操作')
        return
      }

      // 记录日志
      console.log('入库操作按钮被点击', {
        action: '入库操作',
        planId: _data.id,
        planCode: _data.code,
        status: _data.status,
        timestamp: new Date().toISOString(),
        user: this.$store.getters.name || 'unknown'
      })

      // 打开入库货物明细选择弹窗
      this.selectedInPlanId = _data.id
      this.showSelectGoodsDialog = true
    },

    /**
     * 删除
     */
    handleDel () {
      const _data = deepCopy(this.dataJson.currentJson)
      // 状态为待审批或驳回才可以删除
      if (_data.status.toString() !== this.CONSTANTS.DICT_B_IN_PLAN_STATUS_ZERO && _data.status.toString() !== this.CONSTANTS.DICT_B_IN_PLAN_STATUS_THREE) {
        this.showErrorMsg('入库计划状态异常，只有待审批或驳回状态才可以删除')
        return
      }
      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
      }).then(() => {
        this.handleDelOk()
      }).catch(action => {
        // 右上角X
        if (action !== 'close') {
          // 取消删除
        }
      })
    },

    /**
     * 确认删除
     */
    handleDelOk () {
      this.settings.loading = true
      const delData = { id: this.dataJson.currentJson.id }
      delApi(delData).then(response => {
        this.showMsg('删除成功')
        // 删除成功后从表格中移除该行
        const deleteIndex = this.dataJson.listData.findIndex(item => item.id === this.dataJson.currentJson.id)
        if (deleteIndex !== -1) {
          this.dataJson.listData.splice(deleteIndex, 1)
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },

    /**
     * 作废按钮
     */
    handleCancel () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.showCancelDialog = true
      this.cancelDialogData = this.dataJson.currentJson
    },

    /**
     * 作废对话框确认
     */
    handleCancelOk (val) {
      // 关闭作废对话框
      this.showCancelDialog = false
      // 刷新数据列表
      this.getDataList()
      // 注意：成功消息已经在作废对话框中显示，这里不再重复显示
      // 参考采购合同的实现，但避免重复消息提示
    },

    /**
     * 作废对话框取消
     */
    handleCancelCancel () {
      this.showCancelDialog = false
    },

    /**
     * 入库货物选择弹窗 - 下一步事件
     */
    handleSelectGoodsNext (data) {
      // 处理下一步逻辑
      console.log('入库货物选择弹窗 - 下一步事件处理', {
        selectedRow: data.selectedRow,
        planData: data.planData,
        timestamp: new Date().toISOString()
      })

      // 关闭弹窗
      this.showSelectGoodsDialog = false
      this.selectedInPlanId = null

      // 构造入库操作页面数据
      const inboundData = {
        plan_id: data.planData.id,
        plan_code: data.planData.code,
        plan_time: data.planData.plan_time,
        status_name: data.planData.status_name,
        type_name: data.planData.type_name,
        owner_id: data.planData.owner_id,
        owner_name: data.planData.owner_name,
        owner_code: data.planData.owner_code,
        supplier_id: data.planData.supplier_id,
        supplier_name: data.planData.supplier_name,
        supplier_code: data.planData.supplier_code,
        goods_id: data.selectedRow.goods_id,
        goods_name: data.selectedRow.goods_name,
        sku_id: data.selectedRow.sku_id,
        sku_code: data.selectedRow.sku_code,
        sku_name: data.selectedRow.sku_name,
        qty: data.selectedRow.qty,
        price: data.selectedRow.price
      }

      // 打开入库操作页签
      const operate_tab_data = {
        data: inboundData,
        operate_tab_info: {
          show: true,
          name: '入库操作-' + data.planData.code
        },
        editStatus: 'new'
      }

      this.$emit('emitInbound', operate_tab_data)
    },

    /**
     * 入库货物选择弹窗 - 关闭事件
     */
    handleSelectGoodsClose () {
      this.showSelectGoodsDialog = false
      this.selectedInPlanId = null
    },

    /**
     * 完成
     */
    handleFinish () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      this.$confirm('完成后不可再进行任何操作，确认要完成该入库计划吗？', '确认信息', {
      }).then(() => {
        this.handleFinishOk()
      }).catch(action => {
        // 右上角X
        if (action !== 'close') {
          // 取消完成
        }
      })
    },

    /**
     * 确认完成
     */
    handleFinishOk () {
      this.settings.loading = true
      const finishData = { id: this.dataJson.currentJson.id }
      finishApi(finishData).then(response => {
        this.showMsg('入库计划已完成')
        this.getDataList()
      }).finally(() => {
        this.settings.loading = false
      })
    },

    /**
     * 打印
     */
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
      } else if (this.dataJson.multipleSelection.length === this.dataJson.list.length) {
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

    /**
     * 行点击
     */
    handleRowClick (row) {
      this.$refs.multipleTable.setCurrentRow(row)
      this.handleCurrentChange(row)
    },

    /**
     * 行双击
     */
    handleRowDbClick (row) {
      this.handleView()
    },

    /**
     * 排序变化
     */
    handleSortChange ({ column, prop, order }) {
      // 处理排序逻辑
      this.handleSearch()
    },

    /**
     * 重置搜索
     */
    doResetSearch () {
      const defaultSearchForm = {
        code: '', // 计划编号
        contract_code: '', // 合同编号
        order_code: '', // 订单编号
        owner_name: '', // 货主名称
        owner_id: '', // 货主ID
        warehouse_name: '', // 仓库名称
        warehouse_id: '', // 仓库ID
        supplier_name: '', // 供应商名称
        supplier_id: '', // 供应商ID
        status_list: [], // 单据状态列表
        type_list: [], // 入库类型列表
        goods_name: '', // 物料编码或名称（高级查询）
        project_code: '', // 项目编码（高级查询）
        plan_times: [] // 计划时间起始、结束（高级查询）
      }
      this.dataJson.searchForm = deepCopy(defaultSearchForm)
      this.screenNum = 0
    },

    /**
     * 货主选择回调
     */
    handleOwnerReturnDataName (data) {
      if (data && data.length > 0) {
        this.dataJson.searchForm.owner_id = data[0].id
        this.dataJson.searchForm.owner_name = data[0].name
      } else {
        this.dataJson.searchForm.owner_id = ''
        this.dataJson.searchForm.owner_name = ''
      }
    },

    /**
     * 仓库选择回调
     */
    handleWarehouseReturnDataName (data) {
      if (data && data.length > 0) {
        this.dataJson.searchForm.warehouse_id = data[0].id
        this.dataJson.searchForm.warehouse_name = data[0].name
      } else {
        this.dataJson.searchForm.warehouse_id = ''
        this.dataJson.searchForm.warehouse_name = ''
      }
    },

    /**
     * 供应商选择回调
     */
    handleSupplierReturnDataName (data) {
      if (data && data.length > 0) {
        this.dataJson.searchForm.supplier_id = data[0].id
        this.dataJson.searchForm.supplier_name = data[0].name
      } else {
        this.dataJson.searchForm.supplier_id = ''
        this.dataJson.searchForm.supplier_name = ''
      }
    },

    /**
     * 获取明细数据行的CSS类
     * 根据明细数据的索引和总数返回不同的CSS类来控制边框显示
     */
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

    /**
     * 获取审批情况显示文本
     */
    getApprovalStatusText (row) {
      if (!row.next_approve_name) {
        return row.next_approve_name || ''
      }

      // 状态为1或4时，显示"待用户"+next_approve_name+"审批"
      if (row.status === constants_dict.DICT_B_IN_PLAN_STATUS_ONE || row.status === constants_dict.DICT_B_IN_PLAN_STATUS_FOUR) {
        return `待用户${row.next_approve_name}审批`
      }

      // 其他状态直接显示next_approve_name
      return row.next_approve_name
    }
  }
}
</script>

<style lang="scss" scoped>
// 入库计划明细循环展示时的边框样式控制
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
::v-deep .el-tabs__item {
  height: 30px;
  line-height: 30px;
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

.el-button-group {
  margin-bottom: 10px;
}

.perfect_popper .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}

.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}

.el-tabs {
  margin-bottom: 5px;
}

/* sumData处的 el-link */
.el-link.el-link--default {
  font-size: 16px;
  vertical-align: top;
}

.search-form-senior {
  .el-form-item {
    width: 45%;
    margin-right: 10%;
  }

  // 日期选择器所在的表单项需要更宽
  .el-form-item:nth-child(3) {
    width: 95%;
    margin-right: 5%;
  }
}
::v-deep .el-tabs__header {
  margin: 0 0 5px;
}

</style>
