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
        <template slot="label">已审批</template>
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
            v-model.trim="dataJson.searchForm.po_order_code"
            clearable
            placeholder="合同编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="">
          <select-se-customer
            v-model.trim="dataJson.searchForm.owner_name"
            :placeholder="isPlaceholderShow('请选择货主')"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleOwnerReturnDataName"
          />
        </el-form-item>

        <el-form-item label="">
          <select-se-customer
            v-model.trim="dataJson.searchForm.consignor_name"
            :placeholder="isPlaceholderShow('请选择委托方')"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleConsignorReturnDataName"
          />
        </el-form-item>

        <el-form-item label="">
          <select-warehouse
            v-model.trim="dataJson.searchForm.warehouse_name"
            :placeholder="isPlaceholderShow('请选择仓库')"
            placement="left"
            @keyup.enter.native="handleSearch"
            @onReturnData="handleWarehouseReturnDataName"
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
            v-model="dataJson.searchForm.plan_time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="计划时间开始"
            end-placeholder="计划时间结束"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="商品编码">
          <el-input
            v-model.trim="dataJson.searchForm.goods_code"
            clearable
            placeholder="商品编码"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="SKU编码">
          <el-input
            v-model.trim="dataJson.searchForm.sku_code"
            clearable
            placeholder="SKU编码"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="采购合同编号">
          <el-input
            v-model.trim="dataJson.searchForm.po_contract_code"
            clearable
            placeholder="采购合同编号"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="采购订单编号">
          <el-input
            v-model.trim="dataJson.searchForm.po_order_code_advanced"
            clearable
            placeholder="采购订单编号"
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
        icon="el-icon-check"
        :loading="settings.loading"
        @click="handleDel"
      >删除
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:CANCEL'"
        :disabled="!settings.btnStatus.showCancel"
        type="primary"
        icon="el-icon-close"
        :loading="settings.loading"
        @click="handleCancel"
      >作废
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:AUDIT'"
        :disabled="!settings.btnStatus.showApprove"
        type="primary"
        icon="el-icon-check"
        :loading="settings.loading"
        @click="handleApprove"
      >审批
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
      <el-button
        v-permission="'P_IN_PLAN:INFO'"
        :disabled="!settings.btnStatus.showView"
        type="primary"
        icon="el-icon-view"
        :loading="settings.loading"
        @click="handleView"
      >查看
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:PRINT'"
        :disabled="!settings.btnStatus.showPrint"
        type="primary"
        icon="el-icon-printer"
        :loading="settings.loading"
        @click="handlePrint"
      >打印
      </el-button>
    </el-button-group>

    <!-- 数据导入导出按钮 -->
    <el-button-group style="margin-left: 10px;">
      <el-button
        v-permission="'P_IN_PLAN:IMPORT'"
        type="success"
        icon="el-icon-upload"
        :loading="settings.loading"
        @click="handleImport"
      >导入
      </el-button>
      <el-button
        v-permission="'P_IN_PLAN:EXPORT'"
        type="success"
        icon="el-icon-download"
        :loading="settings.loading"
        @click="handleExport"
      >导出
      </el-button>
    </el-button-group>

    <!-- 统计信息 -->
    <div
      class="div-sum"
    >
      <div class="right">
        <span class="count-title">计划总数量：</span><span class="count-data">{{ dataJson.statistics.total_qty == null ? 0 : formatNumber(dataJson.statistics.total_qty,true,4) }}</span>
        <span class="count-title">已入库数量：</span><span class="count-data">{{ dataJson.statistics.total_processed_qty == null ? 0 : formatNumber(dataJson.statistics.total_processed_qty,true,4) }}</span>
        <span class="count-title">入库确认中数量：</span><span class="count-data">{{ dataJson.statistics.total_processing_qty == null ? 0 : formatNumber(dataJson.statistics.total_processing_qty,true,4) }}</span>
        <span class="count-title">待入库数量：</span><span class="count-data">{{ dataJson.statistics.total_unprocessed_qty == null ? 0 : formatNumber(dataJson.statistics.total_unprocessed_qty,true,4) }}</span>
        <span class="count-title">计划总金额：</span><span class="count-data">{{ dataJson.statistics.total_amount == null ? 0 : formatCurrency(dataJson.statistics.total_amount,true) }}</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="minusTable"
      v-loading="settings.loading"
      :data="dataJson.list"
      :height="settings.tableHeight"
      border
      stripe
      highlight-current-row
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        type="index"
        width="50"
        label="序号"
      />
      <!-- 主要业务字段 -->
      <el-table-column prop="code" label="计划编号" width="150" sortable="custom" />
      <el-table-column prop="plan_time" label="计划日期" width="160" sortable="custom" />
      <el-table-column prop="status_name" label="状态" width="120" />
      <el-table-column prop="type_name" label="入库类型" width="120" />
      <el-table-column prop="owner_name" label="货主" width="150" />
      <el-table-column prop="consignor_name" label="委托方" width="150" />

      <!-- 明细相关字段 -->
      <el-table-column prop="po_contract_code" label="合同编号" width="150" />
      <el-table-column prop="po_order_code" label="订单编号" width="150" />
      <el-table-column prop="warehouse_name" label="入库仓库" width="150" />
      <el-table-column prop="supplier_name" label="供应商" width="150" />
      <el-table-column prop="contract_qty" label="合同量" width="100" align="right" />
      <el-table-column prop="goods_name" label="物料名称" width="200" />
      <el-table-column prop="spec" label="规格" width="120" />
      <el-table-column prop="qty" label="计划入库数量" width="120" align="right" />
      <el-table-column label="单位" width="80" align="center">
        <template>
          吨
        </template>
      </el-table-column>

      <!-- 处理状态字段 -->
      <el-table-column prop="processed_qty" label="已入库" width="100" align="right" />
      <el-table-column prop="unprocessed_qty" label="待入库" width="100" align="right" />
      <el-table-column prop="processing_qty" label="入库确认中" width="120" align="right" />
      <!-- 系统管理字段 -->
      <el-table-column prop="c_name" label="创建人" width="100" />
      <el-table-column prop="c_time" label="创建时间" width="160" sortable="custom" />
      <el-table-column prop="u_name" label="更新人" width="100" />
      <el-table-column prop="u_time" label="更新时间" width="160" sortable="custom" />
    </el-table>

    <!-- 分页组件 -->
    <pagination_for_list
      ref="pagination"
      :total="dataJson.total"
      :page.sync="dataJson.pageInfo.pageIndex"
      :limit.sync="dataJson.pageInfo.pageSize"
      @pagination="getList"
    />

    <!-- 作废申请对话框 -->
    <cancel-dialog
      :visible.sync="showCancelDialog"
      :data="cancelDialogData"
      @success="handleCancelOk"
    />
  </div>
</template>

<script>
import { getListApi, getListSumApi, delApi, finishApi } from '@/api/40_business/inplan/inplan'
import FloatMenu from '@/components/FloatMenu'
import pagination_for_list from '@/components/Pagination/index'
import mixin from './mixin'
import CancelDialog from '../../dialog/cancel/index.vue'
import SelectSeCustomer from '@/views/20_master/enterprise/dialog/selectgrid/system_enterprise/customer'
import SelectCpSupplier from '@/views/20_master/enterprise/dialog/selectgrid/counterparty/supplier'
import SelectWarehouse from '@/views/30_wms/warehouse/selectgrid/selectWarehouseLocationBin'
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'
import permission from '@/directive/permission/index.js' // 权限判断指令

export default {
  name: 'InPlanList',
  components: {
    FloatMenu,
    pagination_for_list,
    CancelDialog,
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
        searchForm: {
          code: '', // 计划编号
          po_order_code: '', // 合同编号
          owner_name: '', // 货主
          own_id: '', // 货主ID
          consignor_name: '', // 委托方
          warehouse_name: '', // 仓库
          warehouse_id: '', // 仓库ID
          supplier_name: '', // 供应商
          supplier: '', // 供应商ID
          status_list: [], // 状态
          type_list: [], // 入库类型
          goods_name: '', // 物料编码或名称（高级查询）
          project_code: '', // 项目编码（高级查询）
          plan_time: '', // 计划时间（高级查询）
          goods_code: '', // 商品编码（高级查询）
          sku_code: '', // SKU编码（高级查询）
          po_contract_code: '', // 采购合同编号（高级查询）
          po_order_code_advanced: '' // 采购订单编号（高级查询）
        },
        list: [], // 列表数据
        total: 0, // 总条数
        currentRow: null, // 当前选中行
        multipleSelection: [], // 多选数据
        pageInfo: {
          pageIndex: 1,
          pageSize: 20
        },
        statistics: {
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
      // 页面设置
      settings: {
        loading: false,
        duration: 4000, // 消息提示持续时间
        tableHeight: this.setUIheight(),
        btnStatus: {
          showUpdate: false,
          showDel: false,
          showCancel: false,
          showApprove: false,
          showFinish: false,
          showView: false,
          showPrint: false
        }
      },
      screenNum: 0, // 高级查询条件数量
      showCancelDialog: false, // 显示作废对话框
      cancelDialogData: null // 作废对话框数据
    }
  },
  mounted () {
    this.handleSearch()
  },
  methods: {
    /**
     * 搜索
     */
    handleSearch () {
      this.settings.loading = true
      this.dataJson.pageInfo.pageIndex = 1
      this.getList()
    },

    /**
     * 获取列表数据
     */
    getList () {
      const params = {
        ...this.dataJson.searchForm,
        pageCondition: {
          current: this.dataJson.pageInfo.pageIndex,
          size: this.dataJson.pageInfo.pageSize
        }
      }

      getListApi(params).then(response => {
        this.dataJson.list = response.data.records
        this.dataJson.total = response.data.total
        this.settings.loading = false
        this.getStatistics()
      }).catch(() => {
        this.settings.loading = false
      })
    },

    /**
     * 获取统计数据
     */
    getStatistics () {
      const params = { ...this.dataJson.searchForm }
      getListSumApi(params).then(response => {
        this.dataJson.statistics = response.data
      })
    },

    /**
     * 标签页切换
     */
    handleTabsClick (tab) {
      // 根据标签页设置状态筛选
      const statusMap = {
        '0': [], // 全部
        '1': ['SUBMITTED'], // 待审批
        '2': ['APPROVED'], // 审批中 (这里根据实际业务调整)
        '3': ['APPROVED'], // 已审批
        '4': ['FINISH'], // 已完成
        '5': ['RETURN'], // 驳回
        '6': ['CANCEL_BEING_AUDITED'], // 作废审批中
        '7': ['CANCEL'] // 已作废
      }

      this.dataJson.searchForm.status_list = statusMap[tab.name] || []
      this.handleSearch()
    },

    /**
     * 当前行变化
     */
    handleCurrentChange (currentRow) {
      this.dataJson.currentRow = currentRow
      this.updateBtnStatus()
    },

    /**
     * 多选变化
     */
    handleSelectionChange (selection) {
      this.dataJson.multipleSelection = selection
      this.updateBtnStatus()
    },

    /**
     * 更新按钮状态
     */
    updateBtnStatus () {
      const current = this.dataJson.currentRow

      this.settings.btnStatus = {
        showUpdate: current && ['SUBMITTED', 'RETURN'].includes(current.status),
        showDel: current && ['SUBMITTED', 'RETURN'].includes(current.status),
        showCancel: current && current.status === 'APPROVED',
        showApprove: current && ['SUBMITTED'].includes(current.status),
        showFinish: current && current.status === 'APPROVED',
        showView: !!current,
        showPrint: !!current
      }
    },

    /**
     * 新增
     */
    handleNew () {
      this.$emit('emitNew', {
        editStatus: 'insert',
        operate_tab_info: { name: '新增-入库计划' }
      })
    },

    /**
     * 修改
     */
    handleUpdate () {
      if (!this.dataJson.currentRow) {
        this.$message.warning('请选择要修改的记录')
        return
      }

      this.$emit('emitUpdate', {
        data: this.dataJson.currentRow,
        editStatus: 'update',
        operate_tab_info: { name: '修改-入库计划' }
      })
    },

    /**
     * 查看
     */
    handleView () {
      if (!this.dataJson.currentRow) {
        this.$message.warning('请选择要查看的记录')
        return
      }

      this.$emit('emitView', {
        data: this.dataJson.currentRow,
        editStatus: 'view',
        operate_tab_info: { name: '查看-入库计划' }
      })
    },

    /**
     * 审批
     */
    handleApprove () {
      if (!this.dataJson.currentRow) {
        this.$message.warning('请选择要审批的记录')
        return
      }

      this.$emit('emitApprove', {
        data: this.dataJson.currentRow,
        editStatus: 'approve',
        operate_tab_info: { name: '审批-入库计划' }
      })
    },

    /**
     * 删除
     */
    handleDel () {
      const currentRow = this.dataJson.currentRow
      if (!currentRow) {
        this.$message.warning('请选择要删除的记录')
        return
      }

      // 只有待审批状态才可以删除
      if (currentRow.status !== 'SUBMITTED') {
        this.$message.error('只有待审批状态的入库计划才能删除')
        return
      }

      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleDelOk()
      }).catch(() => {
        // 取消删除
      })
    },

    /**
     * 确认删除
     */
    handleDelOk () {
      this.settings.loading = true

      delApi({ id: this.dataJson.currentRow.id }).then((response) => {
        this.$notify({
          title: '删除成功',
          message: response.data.message || '删除成功',
          type: 'success',
          duration: this.settings.duration
        })
        // 刷新列表
        this.getList()
        // 清空当前选中行
        this.dataJson.currentRow = null
        this.updateBtnStatus()
      }).catch((error) => {
        this.$notify({
          title: '删除失败',
          message: error.message || '删除失败',
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },

    /**
     * 作废
     */
    handleCancel () {
      const currentRow = this.dataJson.currentRow
      if (!currentRow) {
        this.$message.warning('请选择要作废的记录')
        return
      }

      // 只有已审批状态才可以作废
      if (currentRow.status !== 'APPROVED') {
        this.$message.error('只有已审批状态的入库计划才能申请作废')
        return
      }

      this.showCancelDialog = true
      this.cancelDialogData = currentRow
    },

    /**
     * 作废对话框确认
     */
    handleCancelOk () {
      this.showCancelDialog = false
      this.getList()
      this.$notify({
        title: '作废申请提交成功',
        message: '作废申请已提交，等待审批',
        type: 'success',
        duration: this.settings.duration
      })
    },

    /**
     * 作废对话框取消
     */
    handleCancelCancel () {
      this.showCancelDialog = false
    },

    /**
     * 完成
     */
    handleFinish () {
      const currentRow = this.dataJson.currentRow
      if (!currentRow) {
        this.$message.warning('请选择要完成的记录')
        return
      }

      // 只有已审批状态才可以完成
      if (currentRow.status !== 'APPROVED') {
        this.$message.error('只有已审批状态的入库计划才能完成')
        return
      }

      this.$confirm('完成后不可再进行任何操作，确认要完成该入库计划吗？', '确认信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleFinishOk()
      }).catch(() => {
        // 取消完成
      })
    },

    /**
     * 确认完成
     */
    handleFinishOk () {
      this.settings.loading = true

      finishApi({ id: this.dataJson.currentRow.id }).then((response) => {
        this.$notify({
          title: '完成成功',
          message: response.data.message || '入库计划已完成',
          type: 'success',
          duration: this.settings.duration
        })
        // 刷新列表
        this.getList()
        // 清空当前选中行
        this.dataJson.currentRow = null
        this.updateBtnStatus()
      }).catch((error) => {
        this.$notify({
          title: '完成失败',
          message: error.message || '完成操作失败',
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },

    /**
     * 打印
     */
    handlePrint () {
      // 打印逻辑实现
    },

    /**
     * 导入
     */
    handleImport () {
      // 导入逻辑实现
    },

    /**
     * 导出
     */
    handleExport () {
      // 导出逻辑实现
    },

    /**
     * 重置搜索
     */
    doResetSearch () {
      this.dataJson.searchForm = {
        code: '', // 计划编号
        po_order_code: '', // 合同编号
        owner_name: '', // 货主
        own_id: '', // 货主ID
        consignor_name: '', // 委托方
        warehouse_name: '', // 仓库
        warehouse_id: '', // 仓库ID
        supplier_name: '', // 供应商
        supplier: '', // 供应商ID
        status_list: [], // 状态
        type_list: [], // 入库类型
        goods_name: '', // 物料编码或名称（高级查询）
        project_code: '', // 项目编码（高级查询）
        plan_time: '', // 计划时间（高级查询）
        goods_code: '', // 商品编码（高级查询）
        sku_code: '', // SKU编码（高级查询）
        po_contract_code: '', // 采购合同编号（高级查询）
        po_order_code_advanced: '' // 采购订单编号（高级查询）
      }
      this.screenNum = 0
    },

    /**
     * 货主选择回调
     */
    handleOwnerReturnDataName (data) {
      if (data && data.length > 0) {
        this.dataJson.searchForm.own_id = data[0].id
        this.dataJson.searchForm.owner_name = data[0].name
      } else {
        this.dataJson.searchForm.own_id = ''
        this.dataJson.searchForm.owner_name = ''
      }
    },

    /**
     * 委托方选择回调
     */
    handleConsignorReturnDataName (data) {
      if (data && data.length > 0) {
        this.dataJson.searchForm.consignor_id = data[0].id
        this.dataJson.searchForm.consignor_name = data[0].name
      } else {
        this.dataJson.searchForm.consignor_id = ''
        this.dataJson.searchForm.consignor_name = ''
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
        this.dataJson.searchForm.supplier = data[0].id
        this.dataJson.searchForm.supplier_name = data[0].name
      } else {
        this.dataJson.searchForm.supplier = ''
        this.dataJson.searchForm.supplier_name = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
