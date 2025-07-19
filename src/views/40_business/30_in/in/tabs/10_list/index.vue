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
            placeholder="入库单号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.plan_code"
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
            :para="CONSTANTS.DICT_B_IN_STATUS"
            init-placeholder="请选择单据状态"
          />
        </el-form-item>

        <!-- 其他页签显示的禁用状态控件，自动显示当前选中状态 -->
        <el-form-item v-if="dataJson.tabs.active !== '0'">
          <select-dicts
            v-model="dataJson.searchForm.status_list"
            :para="CONSTANTS.DICT_B_IN_STATUS"
            init-placeholder="请选择单据状态"
            disabled
          />
        </el-form-item>

        <el-form-item>
          <select-dicts
            v-model="dataJson.searchForm.type_list"
            :para="CONSTANTS.DICT_B_IN_TYPE"
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

        <el-form-item label="入库时间">
          <el-date-picker
            v-model="dataJson.searchForm.inbound_times"
            type="datetimerange"
            range-separator="至"
            start-placeholder="入库时间开始"
            end-placeholder="入库时间结束"
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
        v-permission="'P_IN:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleNew"
      >
        新增
      </el-button>
      <el-button
        v-permission="'P_IN:UPDATE'"
        :disabled="!settings.btnStatus.showUpdate"
        type="primary"
        icon="el-icon-edit"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改
      </el-button>
      <el-button
        v-permission="'P_IN:DELETE'"
        :disabled="!settings.btnStatus.showDel"
        type="primary"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDel"
      >删除
      </el-button>
      <el-button
        v-permission="'P_IN:CANCEL'"
        :disabled="!settings.btnStatus.showCancel"
        type="primary"
        icon="el-icon-error"
        :loading="settings.loading"
        @click="handleCancel"
      >作废
      </el-button>
      <el-button
        v-permission="'P_IN:AUDIT'"
        :disabled="!settings.btnStatus.showApprove"
        type="primary"
        icon="el-icon-s-check"
        :loading="settings.loading"
        @click="handleApprove"
      >审批
      </el-button>
      <!--      导出按钮 开始-->
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'B_IN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnStatus.hidenExport"
        v-permission="'B_IN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnStatus.hidenExport"
        v-permission="'B_IN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <!--      导出按钮 结束-->
      <el-button
        v-permission="'P_IN:PRINT'"
        :disabled="!settings.btnStatus.showPrint"
        type="primary"
        icon="el-icon-printer"
        :loading="settings.loading"
        @click="handlePrint"
      >打印
      </el-button>
      <el-button
        v-permission="'P_IN:INFO'"
        :disabled="!settings.btnStatus.showView"
        type="primary"
        icon="el-icon-view"
        :loading="settings.loading"
        @click="handleView"
      >查看
      </el-button>
    </el-button-group>

    <div style="margin-bottom: 10px" />

    <!-- 统计信息 -->
    <div
      class="div-sum"
    >
      <div class="right">
        <span class="count-title">总入库数量：</span><span class="count-data">{{ dataJson.sumData.qty_total == null ? 0 : formatNumber(dataJson.sumData.qty_total,true,4) }}</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      style="width: 100%"
      row-key="id"
      border
      stripe
      fit
      highlight-current-row
      :height="settings.tableHeight"
      :default-sort="{ prop: 'u_time', order: 'descending' }"
      @row-click="handleRowClick"
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
        align="center"
      />

      <!-- 入库计划 -->
      <el-table-column label="入库计划" align="center">
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          min-width="150"
          prop="plan_code"
          label="计划单号"
          align="left"
          :auto-fit="true"
        >
          <template slot-scope="scope">
            {{ scope.row.plan_code || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          min-width="80"
          prop="plan_no"
          label="序号"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.plan_no || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          min-width="150"
          prop="plan_time"
          label="计划日期"
          align="left"
          :auto-fit="true"
        >
          <template slot-scope="scope">
            {{ scope.row.plan_time ? formatDate(scope.row.plan_time) : '-' }}
          </template>
        </el-table-column>
      </el-table-column>
      <!-- 入库单号 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="code"
        label="入库单号"
        align="left"
        :auto-fit="true"
      />
      <!-- 入库单状态 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="120"
        prop="status_name"
        label="入库单状态"
        align="left"
        :auto-fit="true"
      />

      <!-- 审批情况 -->
      <el-table-column
        min-width="150"
        prop="next_approve_name"
        label="审批情况"
        align="left"
        :auto-fit="true"
      >
        <template slot-scope="scope">
          {{ getApprovalStatusText(scope.row) }}
        </template>
      </el-table-column>

      <!-- 入库类型 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="120"
        prop="type_name"
        label="入库类型"
        align="left"
        :auto-fit="true"
      />

      <!-- 入库仓库 -->
      <el-table-column
        min-width="200"
        label="入库仓库"
        align="left"
        :auto-fit="true"
      >
        <template slot-scope="scope">
          <div style="line-height: 20px;">
            <div>{{ scope.row.warehouse_name }}</div>
            <div>{{ scope.row.location_name }}</div>
            <div>{{ scope.row.bin_name }}</div>
          </div>
        </template>
      </el-table-column>

      <!-- 货主 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="owner_name"
        label="货主"
        align="left"
        :auto-fit="true"
      />

      <!-- 供应商 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="supplier_name"
        label="供应商"
        align="left"
        :auto-fit="true"
      />

      <!-- 合同编号 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="contract_code"
        label="合同编号"
        align="left"
        :auto-fit="true"
      />

      <!-- 订单编号 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="150"
        prop="order_code"
        label="订单编号"
        align="left"
        :auto-fit="true"
      />

      <!-- 商品名称 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="180"
        prop="goods_name"
        label="商品名称"
        align="left"
        :auto-fit="true"
      />

      <!-- 规格 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="120"
        prop="sku_name"
        label="规格"
        align="left"
        :auto-fit="true"
      />

      <!-- 原发数量 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="120"
        prop="original_qty"
        label="原发数量"
        align="right"
      >
        <template slot-scope="scope">
          {{ formatNumber(scope.row.original_qty, true, 4) }}
        </template>
      </el-table-column>

      <!-- 入库数量（净重） -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="130"
        prop="qty"
        label="入库数量（净重）"
        align="right"
      >
        <template slot-scope="scope">
          {{ formatNumber(scope.row.qty, true, 4) }}
        </template>
      </el-table-column>

      <!-- 单位 -->
      <el-table-column
        sortable="custom"
        min-width="80"
        prop="unit_name"
        label="单位"
        align="left"
        :auto-fit="true"
      />

      <!-- 入库单价 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="120"
        prop="price"
        label="入库单价"
        align="right"
      >
        <template slot-scope="scope">
          {{ formatCurrency(scope.row.price, true) }}
        </template>
      </el-table-column>

      <!-- 入库金额 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="120"
        prop="amount"
        label="入库金额"
        align="right"
      >
        <template slot-scope="scope">
          {{ formatCurrency(scope.row.amount, true) }}
        </template>
      </el-table-column>

      <!-- 入库时间 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="160"
        prop="inbound_time"
        label="入库时间"
        align="left"
        :auto-fit="true"
      >
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.inbound_time) }}
        </template>
      </el-table-column>

      <!-- 创建人 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="100"
        prop="c_name"
        label="创建人"
        align="left"
        :auto-fit="true"
      />

      <!-- 创建时间 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="160"
        prop="c_time"
        label="创建时间"
        align="left"
        :auto-fit="true"
      >
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.c_time) }}
        </template>
      </el-table-column>

      <!-- 更新人 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="100"
        prop="u_name"
        label="更新人"
        align="left"
        :auto-fit="true"
      />

      <!-- 更新时间 -->
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="160"
        prop="u_time"
        label="更新时间"
        align="left"
        :auto-fit="true"
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

    <!-- vue-tour组件 -->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />

    <!-- 作废对话框 -->
    <cancel-dialog
      v-if="popCancel.dialogVisible"
      :data="popCancel.data"
      :visible="popCancel.dialogVisible"
      @closeMeOk="handleCloseDialogOneOk"
      @closeMeCancel="handleCloseDialogOneCancel"
    />
  </div>
</template>

<script>
import FloatMenu from '@/components/FloatMenu/index.vue'
import pagination_for_list from '@/components/Pagination/index.vue'
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'
import SelectSeCustomer from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/customer/index.vue'
import SelectWarehouse from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin.vue'
import SelectCpSupplier from '@/views/20_master/enterprise/dialog/selectgrid/counterparty/supplier/index.vue'
import CancelDialog from '../../dialog/cancel/index.vue'
import { getListApi, getListSumApi, delApi, getApi, exportApi } from '@/api/40_business/30_in/in/in.js'
import mixin from './mixin'
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'InList',
  components: {
    FloatMenu,
    pagination_for_list,
    SelectDicts,
    SelectSeCustomer,
    SelectWarehouse,
    SelectCpSupplier,
    CancelDialog
  },
  mixins: [mixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      // 数据相关
      dataJson: {
        // 标签页数据
        tabs: {
          active: '0' // 默认选中全部页签
        },
        // 保存"全部"页签中用户手动选择的状态数据
        allTabStatusCache: [],
        // 搜索表单
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 当前被激活的页签
          active_tabs_index: '',
          code: '', // 入库单号
          plan_code: '', // 计划编号
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
          plan_times: [], // 计划时间开始-结束（高级查询）
          inbound_times: [] // 入库时间开始-结束（高级查询）
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
          qty_total: 0, // 入库总数量
          amount_total: 0 // 入库总金额
        }
      },
      // 页面设置
      settings: {
        loading: false,
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式
        exportModel: false,
        tableHeight: this.setUIheight(),
        duration: 4000,
        // 按钮状态
        btnStatus: {
          showUpdate: false, // 显示修改按钮
          showDel: false, // 显示删除按钮
          showCancel: false, // 显示作废按钮
          showApprove: false, // 显示审批按钮
          showPrint: false, // 显示打印按钮
          showView: false, // 显示查看按钮
          showExport: false, // 显示导出状态
          hidenExport: true // 隐藏导出按钮（默认隐藏）
        }
      },
      // 作废对话框控制
      popCancel: {
        dialogVisible: false,
        data: null
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
    // 高级查询筛选数量
    screenNum () {
      let count = 0
      if (this.dataJson.searchForm.goods_name && this.dataJson.searchForm.goods_name.trim() !== '') count++
      if (this.dataJson.searchForm.project_code && this.dataJson.searchForm.project_code.trim() !== '') count++
      if (this.dataJson.searchForm.plan_times && this.dataJson.searchForm.plan_times.length === 2) count++
      if (this.dataJson.searchForm.inbound_times && this.dataJson.searchForm.inbound_times.length === 2) count++
      return count > 0 ? count : ''
    }
  },
  watch: {
    // 全屏loading
    'settings.loading': {
      handler (newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在处理，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    },
    // 监听标签页切换
    'dataJson.tabs.active' (newVal) {
      // 根据选中的标签页设置状态筛选
      if (newVal === '0') {
        // 全部页签，清空状态筛选
        this.dataJson.searchForm.status_list = []
      } else {
        // 映射Tab名称到实际状态值
        const tabToStatusMap = {
          '1': '0', // 待审批 -> 状态0
          '2': '1', // 审批中 -> 状态1
          '3': '2', // 执行中 -> 状态2
          '4': '6', // 已完成 -> 状态6
          '5': '3', // 驳回 -> 状态3
          '6': '4', // 作废审批中 -> 状态4
          '7': '5' // 已作废 -> 状态5
        }
        const statusValue = tabToStatusMap[newVal]
        if (statusValue) {
          this.dataJson.searchForm.status_list = [statusValue]
        }
      }
      // 重新加载数据
      this.handleSearch()
    }
  },
  created () {
    // 新增提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_IN_NEW_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_IN_NEW_OK', _data)
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
          this.handleCurrentChange(this.dataJson.listData[0])
        })
      }).finally(() => {
        this.settings.loading = false
      })
    })

    // 更新提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_IN_UPDATE_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_IN_UPDATE_OK', _data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: this.dataJson.currentJson.id }).then(response => {
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

    // 提交审批流时监听
    EventBus.$on(this.EMITS.EMIT_MST_B_IN_BPM_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_B_IN_BPM_OK', _data)
      this.settings.loading = true
      // 查询选中行数据，并更新到选中行的数据
      getApi({ id: this.dataJson.currentJson.id }).then(response => {
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
    EventBus.$off(this.EMITS.EMIT_MST_B_IN_NEW_OK)
    EventBus.$off(this.EMITS.EMIT_MST_B_IN_UPDATE_OK)
    EventBus.$off(this.EMITS.EMIT_MST_B_IN_BPM_OK)
  },
  mounted () {
    // 页面加载时获取数据
    this.handleSearch()
  },
  methods: {
    /**
     * 标签页点击事件
     */
    handleTabsClick (tab) {
      // 标签页切换逻辑在watch中处理
    },

    /**
     * 搜索
     */
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.dataJson.listData = []
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
      this.initButtonStatus()
    },

    /**
     * 重置搜索条件
     */
    doResetSearch () {
      // 重置搜索表单
      this.dataJson.searchForm = {
        // 翻页条件
        pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
        // 当前被激活的页签
        active_tabs_index: '',
        code: '', // 入库单号
        plan_code: '', // 计划编号
        contract_code: '', // 合同编号
        order_code: '', // 订单编号
        owner_name: '', // 货主名称
        owner_id: '', // 货主ID
        warehouse_name: '', // 仓库名称
        warehouse_id: '', // 仓库ID
        supplier_name: '', // 供应商名称
        supplier_id: '', // 供应商ID
        status_list: this.dataJson.tabs.active === '0' ? [] : [this.dataJson.tabs.active], // 单据状态列表
        type_list: [], // 入库类型列表
        goods_name: '', // 物料编码或名称（高级查询）
        project_code: '', // 项目编码（高级查询）
        plan_times: [], // 计划时间开始-结束（高级查询）
        inbound_times: [] // 入库时间开始-结束（高级查询）
      }
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
        this.dataJson.listData = deepCopy(response.data.records)
      }).finally(() => {
        this.settings.loading = false
      })
      // 查询合计信息
      getListSumApi(this.dataJson.searchForm).then(response => {
        if (response.data !== null) {
          this.dataJson.sumData = response.data
        } else {
          this.dataJson.sumData.qty_total = 0
          this.dataJson.sumData.amount_total = 0
        }
      }).finally(() => {
      })
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
      this.settings.btnStatus.showExport = false
    },
    /**
     * 排序变化
     */
    handleSortChange (column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },
    /**
     * 行点击事件
     */
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },

    /**
     * 当前行变化事件
     */
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        // 默认可用的按钮
        this.settings.btnStatus.showView = true
        this.settings.btnStatus.showPrint = true

        // 修改按钮 - 待审批和驳回状态可以修改
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_IN_STATUS_ZERO ||
            this.dataJson.currentJson.status === constants_dict.DICT_B_IN_STATUS_THREE) {
          this.settings.btnStatus.showUpdate = true
        } else {
          this.settings.btnStatus.showUpdate = false
        }

        // 删除按钮 - 待审批和驳回状态可以删除
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_IN_STATUS_ZERO ||
            this.dataJson.currentJson.status === constants_dict.DICT_B_IN_STATUS_THREE) {
          this.settings.btnStatus.showDel = true
        } else {
          this.settings.btnStatus.showDel = false
        }

        // 作废按钮 - 执行中状态可以作废
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_IN_STATUS_TWO) {
          this.settings.btnStatus.showCancel = true
        } else {
          this.settings.btnStatus.showCancel = false
        }

        // 审批按钮 - 审批中和作废审批中状态可以审批
        if (this.dataJson.currentJson.status === constants_dict.DICT_B_IN_STATUS_ONE ||
            this.dataJson.currentJson.status === constants_dict.DICT_B_IN_STATUS_FOUR) {
          this.settings.btnStatus.showApprove = true
        } else {
          this.settings.btnStatus.showApprove = false
        }
      } else {
        // 没有选中任何行时，所有按钮都不可用
        this.settings.btnStatus.showUpdate = false
        this.settings.btnStatus.showCancel = false
        this.settings.btnStatus.showView = false
        this.settings.btnStatus.showDel = false
        this.settings.btnStatus.showApprove = false
        this.settings.btnStatus.showPrint = false
      }

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },

    /**
     * 多选变化
     */
    handleSelectionChange (selection) {
      this.dataJson.multipleSelection = selection
      // 更新导出按钮状态
      if (selection.length > 0) {
        this.settings.btnStatus.showExport = true
      } else {
        this.settings.btnStatus.showExport = false
      }
      // 不做其他按钮联动，保持单选行为
    },

    /**
     * 新增
     */
    handleNew () {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '新增入库单' },
        canEdit: true,
        editStatus: constants_para.STATUS_INSERT
      }
      this.$emit('emitNew', operate_tab_data)
    },

    /**
     * 修改
     */
    handleUpdate () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (!_data) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 更新
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '修改入库单' },
        canEdit: true,
        editStatus: constants_para.STATUS_UPDATE,
        data: _data
      }

      this.$emit('emitUpdate', operate_tab_data)
    },

    /**
     * 查看
     */
    handleView () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === constants_dict.DICT_B_IN_STATUS_FOUR || _data.status === constants_dict.DICT_B_IN_STATUS_FIVE) {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '查看入库单详情' },
        canEdit: false,
        editStatus: constants_para.STATUS_VIEW,
        data: _data
      }

      this.$router.push({
        query: {}
      })

      this.$emit('emitView', operate_tab_data)
    },

    /**
     * 删除
     */
    handleDel () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.$message.warning('请选择一条数据')
        return
      }
      // 状态为待审批或驳回才可以删除
      if (_data.status.toString() !== constants_dict.DICT_B_IN_STATUS_ZERO && _data.status.toString() !== constants_dict.DICT_B_IN_STATUS_THREE) {
        this.$message.error('入库单状态异常，只有待审批或驳回状态才可以删除')
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
        this.$message.success('删除成功')
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
     * 作废
     */
    handleCancel () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.$message.warning('请选择一条数据')
        return
      }
      this.popCancel.dialogVisible = true
      this.popCancel.data = this.dataJson.currentJson
    },

    /**
     * 作废对话框确定回调
     */
    handleCloseDialogOneOk () {
      this.popCancel.dialogVisible = false
      this.popCancel.data = null
      this.handleSearch() // 刷新列表
      this.$notify({
        title: '作废成功',
        message: null,
        type: 'success',
        duration: this.settings.duration
      })
    },

    /**
     * 作废对话框取消回调
     */
    handleCloseDialogOneCancel () {
      this.popCancel.dialogVisible = false
      this.popCancel.data = null
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
      _data.serial_type = constants_dict.DICT_B_IN

      // 状态 0-3显示新增审批流 4-5显示作废审批流
      if (_data.status === constants_dict.DICT_B_IN_STATUS_FOUR || _data.status === constants_dict.DICT_B_IN_STATUS_FIVE) {
        _data.bpm_instance_code = _data.bpm_cancel_instance_code
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '入库单审批' },
        canEdit: true,
        editStatus: constants_para.STATUS_AUDIT,
        data: _data,
        enableCancel: true // 撤销按钮显示
      }
      this.$emit('emitApprove', operate_tab_data)
    },

    /**
     * 打印
     */
    handlePrint () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.$message.warning('请选择一条数据')
        return
      }
      // 打印逻辑，可以跳转到打印页面或弹窗
      const data = {
        data: _data,
        editStatus: 'print',
        operate_tab_info: {
          name: '打印入库单',
          showPrint: true
        }
      }
      this.$emit('emitPrint', data)
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

    /**
     * 开始导出
     */
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

    /**
     * 导出选中数据
     */
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

    /**
     * 导出全部数据
     */
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
     * 获取表格行样式类名
     */
    getClass (index, length) {
      const classes = ['table-cell-item']
      if (index === 0) classes.push('first-item')
      if (index === length - 1) classes.push('last-item')
      return classes.join(' ')
    },

    /**
     * 获取行索引
     */
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },

    /**
     * 获取审批情况显示文本
     */
    getApprovalStatusText (row) {
      if (!row.next_approve_name) {
        return row.next_approve_name || ''
      }

      // 状态为1或4时，显示"待用户"+next_approve_name+"审批"
      if (row.status === constants_dict.DICT_B_IN_STATUS_ONE || row.status === constants_dict.DICT_B_IN_STATUS_FOUR) {
        return `待用户${row.next_approve_name}审批`
      }

      // 其他状态直接显示next_approve_name
      return row.next_approve_name
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form-senior {
  .el-form-item {
    width: 48%;
    margin-right: 2%;
  }
}

// 表格明细行样式
.table-cell-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
  min-height: 30px;
  display: flex;
  align-items: center;
}

.table-cell-item.first-item {
  padding-top: 12px;
}

.table-cell-item.last-item {
  border-bottom: none;
  padding-bottom: 12px;
}
.count-data {
  color: #1890ff;
  font-size: 20px;
}
.count-title {
  margin-left: 10px;
}
.right {
  position: absolute;
  right: 10px;
  margin-right: 10px;
}
::v-deep .el-tabs__item {
  height: 30px;
  line-height: 30px;
}
.el-tabs {
  margin-bottom: 5px;
}
::v-deep .el-tabs__header {
  margin: 0 0 5px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
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

</style>
