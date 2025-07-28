<template>
  <div class="app-container">
    <div class="edit-container">
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        status-icon
      >
        <el-alert
          title="基本信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >

          <el-descriptions-item label="采购结算编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="业务类型">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >添加关联单号
            </div>
            <el-button-group>
              <el-button
                type="primary"
                size="mini"
                :disabled="isAddRelatedOrderDisabled"
                :loading="settings.loading"
                @click="handlePoOrderRelationInsert"
              >点击我-添加关联单号</el-button>
            </el-button-group>
          </el-descriptions-item>

          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.purchaser_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >结算日期
            </div>
            <el-form-item prop="settlement_date">
              <el-date-picker
                v-model="dataJson.tempJson.settlement_date"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder="请选择结算日期"
                clearable
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="结算方式">
            {{ dataJson.tempJson.settle_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="结算单据类型">
            {{ dataJson.tempJson.bill_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item />
          <el-descriptions-item label="备注" span="3">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              placeholder="请输入"
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

          <el-descriptions-item label="附件材料" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <Simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleOtherUploadFileSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="0"
                :span="3"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="业务单据信息"
          type="info"
          :closable="false"
        />

        <el-descriptions
          title=""
          :column="4"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item span="2" label="应付金额" />
          <el-descriptions-item span="2" label="应付金额公式">
            = 申请结算总金额
          </el-descriptions-item>
          <el-descriptions-item label="结算总金额">
            {{ summaryData.finalTotalAmount == null ? '-': formatCurrency(summaryData.finalTotalAmount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="结算总数量（吨）">
            {{ summaryData.totalQty == null? '-': formatNumber(summaryData.totalQty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="当前企业资金池余额" />
          <el-descriptions-item label="资金池冲抵" />
          <el-descriptions-item label="优惠金额（减金额）">
            <numeric
              v-model="dataJson.tempJson.discount_amount"
              :decimal-places="2"
              :currency-symbol="'¥'"
              style="width: 100%"
              placeholder="请输入优惠金额"
              :disabled="dataJson.tempJson.detailListData.length === 0"
            />
          </el-descriptions-item>
          <el-descriptions-item label="其他金额（加金额）">
            <numeric
              v-model="dataJson.tempJson.other_amount"
              :decimal-places="2"
              :currency-symbol="'¥'"
              style="width: 100%"
              :minimum-value="-999999999"
              placeholder="请输入其他金额"
              :disabled="dataJson.tempJson.detailListData.length === 0"
            />
          </el-descriptions-item>
          <el-descriptions-item label="杂项金额（加金额）">
            <numeric
              v-model="dataJson.tempJson.misc_amount"
              :decimal-places="2"
              :currency-symbol="'¥'"
              :minimum-value="-999999999"
              style="width: 100%"
              placeholder="请输入杂项金额"
              :disabled="dataJson.tempJson.detailListData.length === 0"
            />
          </el-descriptions-item>
          <el-descriptions-item label="罚款金额（减金额）">
            <numeric
              v-model="dataJson.tempJson.penalty_amount"
              :decimal-places="2"
              :currency-symbol="'¥'"
              style="width: 100%"
              placeholder="请输入罚款金额"
              :disabled="dataJson.tempJson.detailListData.length === 0"
            />
          </el-descriptions-item>

        </el-descriptions>

        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-circle-plus-outline"
            :disabled="!dataJson.hasAddedRelatedOrder"
            :loading="settings.loading"
            @click="handleOrderInsert"
          >添加</el-button>
          <el-button
            :disabled="dataJson.tempJson.detailListData.length === 0 || dataJson.rowIndex === null"
            type="primary"
            icon="el-icon-circle-close"
            :loading="settings.loading"
            @click="handleOrderDelete"
          >删除</el-button>
        </el-button-group>

        <div class="div-sum">
          <div class="right">
            <span class="count-title">本次计划结算总金额：</span>
            <span class="count-data">{{ summaryData.totalAmount == null ? '-' : formatCurrency(summaryData.totalAmount, true) }}</span>
            <span class="count-title">本次计划结算总数量：</span>
            <span class="count-data">{{ summaryData.totalQty == null ? '-' : formatNumber(summaryData.totalQty, true, 4) }}</span>
          </div>
        </div>
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          height="350px"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
          :row-class-name="getRowClassName"
          @row-click="handleRowClick"
          @current-change="handleCurrentChange"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
            fixed="left"
          />

          <!-- 合同订单信息 -->
          <el-table-column label="合同订单信息" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="140"
              label="合同编号｜订单编号"
              align="left"
            >
              <template v-slot="scope">
                <div style="line-height: 1.2;">
                  <div>{{ scope.row.po_contract_code || '-' }}</div>
                  <div>{{ scope.row.po_order_code || '-' }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              label="商品名称｜规格"
              align="left"
            >
              <template v-slot="scope">
                <div style="line-height: 1.2;">
                  <div>{{ scope.row.goods_name || '-' }}</div>
                  <div>{{ scope.row.sku_name || '-' }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="order_qty"
              label="订单数量（吨）"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_qty == null? '-' : formatNumber(scope.row.order_qty,true,4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="order_price"
              label="订单单价"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_price == null? '-' : formatCurrency(scope.row.order_price,true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="order_amount"
              label="订单金额"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_amount == null? '-' : formatCurrency(scope.row.order_amount,true) }}
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 待结算数量（吨） -->
          <el-table-column
            show-overflow-tooltip
            min-width="120"
            prop="settle_can_qty_total"
            label="待结算数量（吨）"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.settle_can_qty_total == null? '-' : formatNumber(scope.row.settle_can_qty_total,true,4) }}
            </template>
          </el-table-column>

          <!-- 本次结算计划 -->
          <el-table-column label="本次结算计划" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="planned_qty"
              label="结算数量（吨）"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.planned_qty == null? '-' : formatNumber(scope.row.planned_qty,true,4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="planned_amount"
              label="结算金额"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.planned_amount == null? '-' : formatCurrency(scope.row.planned_amount,true) }}
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
            <template v-slot="scope">
              <el-button
                type="primary"
                size="mini"
                :loading="settings.loading"
                @click="handleSettleDetail(scope.$index, scope.row)"
              >
                结算
              </el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-form>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        size="medium"
        type="primary"
        :disabled="settings.loading"
        :loading="settings.loading"
        @click="startProcess()"
      >提交审批并保存</el-button>
      <el-button
        size="medium"
        :disabled="settings.loading"
        :loading="settings.loading"
        @click="handleReset()"
      >重置</el-button>
      <el-button
        size="medium"
        :disabled="settings.loading"
        :loading="settings.loading"
        @click="handleCancel()"
      >返回</el-button>
    </div>

    <!--采购订单关联单号弹窗-->
    <po-order-relation-dialog
      v-if="popSettingsData.poOrderRelationDialog.visible"
      title="新增结算明细-请选择要结算的订单"
      :visible="popSettingsData.poOrderRelationDialog.visible"
      :data="popSettingsData.poOrderRelationDialog.data"
      @closeMeOk="handlePoOrderRelationCloseOk"
      @closeMeCancel="handlePoOrderRelationCloseCancel"
    />

    <!-- 审批流程设置：选择人 -->
    <bpm-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="popSettingsData.sponsorDialog.serial_type"
      @closeMeCancel="handleBpmDialogCancel"
      @closeMeOk="handleBpmDialogOk"
    />

    <!-- 结算明细设置弹窗 -->
    <settlement-detail-dialog
      v-if="popSettingsData.settleDetailDialog.visible"
      :visible="popSettingsData.settleDetailDialog.visible"
      :data="popSettingsData.settleDetailDialog.data"
      @closeMeOk="handleSettleDetailCloseOk"
      @closeMeCancel="handleSettleDetailCloseCancel"
    />

  </div>
</template>

<script>
import deepCopy from 'deep-copy'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import { validateApi, insertApi } from '@/api/40_business/10_po/settlement/settlement'
import constants_para from '@/common/constants/constants_para'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import PoOrderRelationDialog from '@/views/40_business/10_po/poorder/dialog/listfor/settlement/index.vue'
import SettlementDetailDialog from '@/views/40_business/10_po/settlement/dialog/new/detail/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import { getApi as getDictDataApi } from '@/api/10_system/dictdata/dictdata'
import CONSTANTS from '@/common/constants/constants_dict'
import { EventBus } from '@/common/eventbus/eventbus'
import constants_dict from '@/common/constants/constants_dict' // EventBus事件总线

export default {
  name: 'SettlementNew',
  components: {
    SimpleUploadMutilFile,
    PreviewCard,
    BpmDialog,
    PoOrderRelationDialog,
    SettlementDetailDialog,
    numeric
  },
  props: {
    currentTabName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      constants_para: constants_para,
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      contentStyle: {
        width: '15%'
      },
      settings: {
        loading: false,
        duration: 1000,
        rules: {
          settlement_date: [
            { required: true, message: '请选择结算日期', trigger: 'change' }
          ],
          remark: [
            { max: 500, message: '备注不能超过500个字符', trigger: 'blur' }
          ]
        },
        // 按钮禁用状态
        btnTableDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        }
      },
      // 页面数据
      dataJson: {
        rowIndex: null,
        currentJson: {},
        hasAddedRelatedOrder: false, // 是否已添加过关联单号
        tempJson: {
          // 基本信息
          id: null,
          code: '',
          type: constants_dict.DICT_B_PO_SETTLEMENT_TYPE_ZERO,
          type_name: '',
          purchaser_id: null,
          purchaser_code: '',
          purchaser_name: '',
          supplier_id: null,
          supplier_code: '',
          supplier_name: '',
          settle_type: '',
          payment_type: '',
          settle_type_name: '',
          bill_type: '',
          bill_type_name: '',
          settlement_date: '',
          remark: '',

          // 业务单据信息统计
          planned_amount: null,
          settled_amount: null,
          planned_qty: null,
          settled_qty: null,
          discount_amount: 0,
          other_amount: 0,
          misc_amount: 0,
          penalty_amount: 0,

          // 明细数据
          detailListData: [],

          // 附件
          doc_att_files: []
        },
        doc_att: [],
        doc_att_file: [],
        inputSettings: {
          maxLength: {
            remark: 500
          }
        }
      },
      // 汇总数据
      summaryData: {
        totalAmount: null, // 本次计划结算总金额
        totalQty: null, // 结算总数量
        finalTotalAmount: null // 最终结算总金额（含优惠、其他、杂项、罚款）
      },
      // 弹窗设置
      popSettingsData: {
        // 审批流程设置
        sponsorDialog: {
          visible: false,
          serial_type: 'b_po_settlement', // 结算新增审批流程
          form_data: {},
          initial_process: null,
          process_users: []
        },
        // 采购订单关联单号弹窗
        poOrderRelationDialog: {
          visible: false,
          data: {}
        },
        // 结算明细设置弹窗
        settleDetailDialog: {
          visible: false,
          data: {}
        }
      }
    }
  },
  computed: {
    // 添加关联单号按钮禁用状态
    isAddRelatedOrderDisabled () {
      return this.settings.loading || this.dataJson.tempJson.detailListData.length > 0
    },
    // 重置页面按钮禁用状态
    isResetPageDisabled () {
      return this.settings.loading || this.dataJson.tempJson.detailListData.length === 0
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
    // 监听明细数据变化，自动计算汇总
    'dataJson.tempJson.detailListData': {
      handler (newVal, oldVal) {
        this.calculateSummary()
      },
      deep: true // 深度监听
    },
    // 监听优惠金额变化
    'dataJson.tempJson.discount_amount': {
      handler (newVal, oldVal) {
        this.calculateFinalTotalAmount()
      }
    },
    // 监听其他金额变化
    'dataJson.tempJson.other_amount': {
      handler (newVal, oldVal) {
        this.calculateFinalTotalAmount()
      }
    },
    // 监听杂项金额变化
    'dataJson.tempJson.misc_amount': {
      handler (newVal, oldVal) {
        this.calculateFinalTotalAmount()
      }
    },
    // 监听罚款金额变化
    'dataJson.tempJson.penalty_amount': {
      handler (newVal, oldVal) {
        this.calculateFinalTotalAmount()
      }
    },
    // 监听供应商和主体企业变化，控制添加按钮状态
    'dataJson.tempJson.purchaser_id': {
      handler: 'updateAddButtonStatus',
      deep: true,
      immediate: true
    },
    'dataJson.tempJson.supplier_id': {
      handler: 'updateAddButtonStatus',
      deep: true,
      immediate: true
    }
  },
  mounted () {
    this.initNewData()
    // 初始化汇总数据
    this.calculateSummary()
    // 获取业务类型
    this.fetchBusinessType()
  },
  methods: {
    /**
     * 初始化新增数据
     */
    initNewData () {
      // 重置数据
      this.resetDataJson()
    },

    /**
     * 重置数据
     */
    resetDataJson () {
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
      this.dataJson.doc_att = []
      this.dataJson.doc_att_file = []
      // 重置按钮状态
      this.settings.btnTableDisabledStatus.disabledInsert = true
      this.settings.btnTableDisabledStatus.disabledDelete = true
      // 重置当前选择状态
      this.dataJson.currentJson = {}
      this.dataJson.rowIndex = null
      // 重置关联单号添加状态
      this.dataJson.hasAddedRelatedOrder = false
      // 重置汇总数据
      this.summaryData.totalAmount = null
      this.summaryData.totalQty = null
      this.summaryData.finalTotalAmount = null
    },

    /**
     * 根据供应商和主体企业状态更新添加按钮状态
     */
    updateAddButtonStatus () {
      const hasSupplier = this.dataJson.tempJson.supplier_id && this.dataJson.tempJson.supplier_name
      const hasPurchaser = this.dataJson.tempJson.purchaser_id && this.dataJson.tempJson.purchaser_name

      // 当供应商和主体企业都有数据时，添加按钮可点击
      if (hasSupplier && hasPurchaser) {
        this.settings.btnTableDisabledStatus.disabledInsert = false
      } else {
        this.settings.btnTableDisabledStatus.disabledInsert = true
      }
    },

    /**
     * 添加关联单号
     */
    handlePoOrderRelationInsert () {
      // 传递供应商和主体企业参数给弹出框，作为查询条件
      this.popSettingsData.poOrderRelationDialog.data = {
        supplier_id: this.dataJson.tempJson.supplier_id,
        supplier_name: this.dataJson.tempJson.supplier_name,
        supplier_code: this.dataJson.tempJson.supplier_code,
        purchaser_id: this.dataJson.tempJson.purchaser_id,
        purchaser_name: this.dataJson.tempJson.purchaser_name,
        purchaser_code: this.dataJson.tempJson.purchaser_code
      }
      this.popSettingsData.poOrderRelationDialog.visible = true
    },

    /**
     * 采购订单关联：确定
     */
    handlePoOrderRelationCloseOk (val) {
      this.popSettingsData.poOrderRelationDialog.visible = false

      // 检查是否已经存在相同的采购订单（根据采购订单编号判断）
      if (val.code && this.dataJson.tempJson.detailListData.some(item => item.po_order_code === val.code)) {
        this.showErrorMsg('业务单据添加失败：该采购订单编号在表格中已经存在，不能添加重复的采购订单！')
        return false
      }

      // 设置基本信息
      this.dataJson.tempJson.type = val.type
      this.dataJson.tempJson.type_name = val.type_name
      this.dataJson.tempJson.purchaser_id = val.purchaser_id
      this.dataJson.tempJson.purchaser_code = val.purchaser_code
      this.dataJson.tempJson.purchaser_name = val.purchaser_name
      this.dataJson.tempJson.supplier_id = val.supplier_id
      this.dataJson.tempJson.supplier_code = val.supplier_code
      this.dataJson.tempJson.supplier_name = val.supplier_name
      this.dataJson.tempJson.settle_type = val.settle_type
      this.dataJson.tempJson.settle_type_name = val.settle_type_name
      this.dataJson.tempJson.payment_type = val.payment_type
      this.dataJson.tempJson.bill_type = val.bill_type
      this.dataJson.tempJson.bill_type_name = val.bill_type_name

      // 设置明细数据
      if (val.detailListData && val.detailListData.length > 0) {
        this.dataJson.tempJson.detailListData = deepCopy(val.detailListData)
        this.updateDetailDataFromOrder(val)
        // 启用表格操作按钮
        this.settings.btnTableDisabledStatus.disabledInsert = false
        // 设置已添加关联单号状态
        this.dataJson.hasAddedRelatedOrder = true
        // 重新计算汇总数据
        this.calculateTotal()
      }

      this.$notify({
        title: '关联成功',
        message: '已成功关联采购订单数据',
        type: 'success',
        duration: this.settings.duration
      })
    },

    /**
     * 采购订单关联：取消
     */
    handlePoOrderRelationCloseCancel () {
      this.popSettingsData.poOrderRelationDialog.visible = false
    },

    /**
     * 更新明细数据中的订单信息
     * @param {Object} val - 包含订单信息的对象
     */
    updateDetailDataFromOrder (val) {
      this.dataJson.tempJson.detailListData.forEach(item => {
        item.po_contract_code = val.po_contract_code
        item.po_contract_id = val.po_contract_id
        item.po_order_code = val.code
        item.po_order_id = val.id
        item.order_qty = item.qty
        item.order_price = item.price
        item.order_amount = item.amount
      })
    },

    /**
     * 添加明细 - 与添加关联单号使用同一个弹窗
     */
    handleOrderInsert () {
      // 传递供应商和主体企业参数给弹出框，作为查询条件
      this.popSettingsData.poOrderRelationDialog.data = {
        supplier_id: this.dataJson.tempJson.supplier_id,
        supplier_name: this.dataJson.tempJson.supplier_name,
        supplier_code: this.dataJson.tempJson.supplier_code,
        purchaser_id: this.dataJson.tempJson.purchaser_id,
        purchaser_name: this.dataJson.tempJson.purchaser_name,
        purchaser_code: this.dataJson.tempJson.purchaser_code
      }
      this.popSettingsData.poOrderRelationDialog.visible = true
    },

    /**
     * 删除明细
     */
    handleOrderDelete () {
      if (this.dataJson.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 删除
      this.$confirm('是否确认删除该条数据', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.dataJson.tempJson.detailListData.splice(this.dataJson.rowIndex, 1)
        // 重新计算汇总数据
        this.calculateTotal()
        // 重置选择状态
        this.dataJson.rowIndex = null
        this.settings.btnTableDisabledStatus.disabledDelete = true
      }).catch(() => {
        // 用户取消
      })
    },

    /**
     * 结算明细设置
     */
    handleSettleDetail (index, row) {
      this.popSettingsData.settleDetailDialog.visible = true
      this.popSettingsData.settleDetailDialog.data = {
        ...row,
        rowIndex: index
      }
    },

    /**
     * 结算明细设置：确定
     */
    handleSettleDetailCloseOk (data) {
      this.popSettingsData.settleDetailDialog.visible = false
      const rowIndex = this.popSettingsData.settleDetailDialog.data.rowIndex
      if (rowIndex !== undefined && this.dataJson.tempJson.detailListData[rowIndex]) {
        // 更新对应行的结算数据 - 使用Vue.set确保响应式更新
        const updatedRow = {
          ...this.dataJson.tempJson.detailListData[rowIndex],
          planned_qty: data.qty,
          planned_price: data.price,
          planned_amount: data.amount,
          settled_qty: data.qty,
          settled_price: data.price,
          settled_amount: data.amount
        }
        this.$set(this.dataJson.tempJson.detailListData, rowIndex, updatedRow)

        // 重新计算汇总数据
        this.calculateTotal()
      }
    },

    /**
     * 结算明细设置：取消
     */
    handleSettleDetailCloseCancel () {
      this.popSettingsData.settleDetailDialog.visible = false
    },

    /**
     * 表格行点击
     */
    handleRowClick (row, column, event) {
      this.dataJson.currentJson = row
    },

    /**
     * 表格当前行变更
     */
    handleCurrentChange (currentRow, oldCurrentRow) {
      if (currentRow) {
        this.dataJson.currentJson = currentRow
        this.dataJson.rowIndex = this.dataJson.tempJson.detailListData.indexOf(currentRow)
        this.settings.btnTableDisabledStatus.disabledDelete = false
      } else {
        this.dataJson.currentJson = {}
        this.dataJson.rowIndex = null
        this.settings.btnTableDisabledStatus.disabledDelete = true
      }
    },

    /**
     * 计算汇总数据
     */
    calculateTotal () {
      let plannedAmount = 0
      let settledAmount = 0
      let plannedQty = 0
      let settledQty = 0

      this.dataJson.tempJson.detailListData.forEach(item => {
        plannedAmount += item.planned_amount || 0
        settledAmount += item.planned_amount || 0
        plannedQty += item.planned_qty || 0
        settledQty += item.planned_qty || 0
      })

      this.dataJson.tempJson.planned_amount = plannedAmount
      this.dataJson.tempJson.settled_amount = settledAmount
      this.dataJson.tempJson.planned_qty = plannedQty
      this.dataJson.tempJson.settled_qty = settledQty
    },

    /**
     * 计算汇总数据 - 用于表格顶部显示
     */
    calculateSummary () {
      let totalAmount = 0
      let totalQty = 0

      // 遍历明细数据，计算结算金额和结算数量的汇总
      this.dataJson.tempJson.detailListData.forEach(item => {
        totalAmount += item.planned_amount || 0 // 结算金额
        totalQty += item.planned_qty || 0 // 结算数量（吨）
      })

      // 更新汇总数据
      this.summaryData.totalAmount = totalAmount > 0 ? totalAmount : null
      this.summaryData.totalQty = totalQty > 0 ? totalQty : null

      // 计算最终结算总金额
      this.calculateFinalTotalAmount()
    },

    /**
     * 计算最终结算总金额
     * 公式：结算总金额 = 本次计划结算总金额 - 优惠金额 + 其他金额 + 杂项金额 - 罚款金额
     */
    calculateFinalTotalAmount () {
      const detailAmount = this.summaryData.totalAmount || 0 // 本次计划结算总金额
      const discountAmount = this.dataJson.tempJson.discount_amount || 0 // 优惠金额（减）
      const otherAmount = this.dataJson.tempJson.other_amount || 0 // 其他金额（加）
      const miscAmount = this.dataJson.tempJson.misc_amount || 0 // 杂项金额（加）
      const penaltyAmount = this.dataJson.tempJson.penalty_amount || 0 // 罚款金额（减）

      // 计算最终金额
      const finalAmount = detailAmount - discountAmount + otherAmount + miscAmount - penaltyAmount

      // 更新最终结算总金额
      this.summaryData.finalTotalAmount = finalAmount !== 0 ? finalAmount : null
    },

    /**
     * 获取表格行的CSS类名
     */
    getRowClassName ({ row, rowIndex }) {
      if (row.hasValidationError) {
        return 'validation-error-row'
      }
      return ''
    },

    /**
     * 其他附件上传成功
     */
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.doc_att.push(res.response.data)
      this.dataJson.doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },

    /**
     * 其他附件文件移除
     */
    removeOtherFile (val) {
      const _index = this.dataJson.doc_att_file.lastIndexOf(val)
      this.dataJson.doc_att.splice(_index, 1)
      this.dataJson.doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },

    /**
     * 上传失败
     */
    handleFileError () {
      console.debug('文件上传失败')
      this.showErrorMsg('文件上传发生错误！')
    },

    /**
     * 校验数据 获取审批流程
     */
    startProcess () {
      this.showLoading('正在启动审批流程...')

      // 校验结算明细的结算金额
      const validationResult = this.validateSettlementDetails()
      if (!validationResult.isValid) {
        this.closeLoading()
        this.showErrorMsg('校验出错：请对红色行的数据进行结算，请点击结算按钮')
        return
      }

      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          if (this.dataJson.tempJson.detailListData.length === 0) {
            this.closeLoading()
            this.showErrorMsg('请至少添加一条结算明细')
            return
          }
          validateApi(tempData).then(_data => {
            if (_data.success) {
              // 获取审批流程
              this.getFlow()
            } else {
              this.closeLoading()
              this.showErrorMsg(_data.data.message)
            }
          }).catch(error => {
            console.log('校验出错', error)
            this.closeLoading()
          })
        } else {
          this.closeLoading()
        }
      })
    },

    /**
     * 校验结算明细的结算金额
     * 检查每一行是否都设置了结算金额
     */
    validateSettlementDetails () {
      // 重置所有行的错误状态
      this.dataJson.tempJson.detailListData.forEach(item => {
        this.$set(item, 'hasValidationError', false)
      })

      let hasError = false

      // 检查每一行的结算金额
      this.dataJson.tempJson.detailListData.forEach((item, index) => {
        // 检查结算金额是否为空或等于0
        if (item.planned_amount == null || item.planned_amount === '' || item.planned_amount === undefined || item.planned_amount === 0) {
          // 标记该行有校验错误
          this.$set(item, 'hasValidationError', true)
          hasError = true
        }
      })

      return {
        isValid: !hasError
      }
    },

    /**
     * 获取审批流程
     */
    getFlow () {
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.showErrorMsg('未找到审批流程，请联系管理员')
            this.closeLoading()
          } else {
            this.popSettingsData.sponsorDialog.form_data = {}
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.showErrorMsg(err)
        })
    },

    /**
     * 审批流弹窗取消
     */
    handleBmpDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },

    /**
     * 审批流弹窗确定
     */
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },

    /**
     * 执行新增操作
     */
    doInsert () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          // 添加审批流程数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users
          tempData.type = constants_dict.DICT_B_PO_SETTLEMENT_TYPE_ZERO // 设置业务类型为采购结算

          if (this.dataJson.tempJson.detailListData == null || this.dataJson.tempJson.detailListData.length === 0) {
            this.showErrorMsg('请至少添加一条结算明细')
            this.closeLoading()
            return
          }

          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
                // 通知兄弟组件，新增数据更新 - 将完整数据传递给列表页面
                setTimeout(() => {
                  EventBus.$emit(this.EMITS.EMIT_MST_SETTLEMENT_NEW_OK, _data.data)
                }, 1000)
              },
              _error => {
                this.closeLoading()
                this.$notify({
                  title: '新增失败',
                  message: _error.error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              this.closeLoading()
            })
        } else {
          this.closeLoading()
        }
      })
    },

    /**
     * 重置
     */
    handleReset () {
      this.$confirm('确认要重置表单吗？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.resetDataJson()
        this.$notify({
          title: '重置成功',
          message: '表单已重置',
          type: 'success',
          duration: this.settings.duration
        })
      }).catch(() => {
        // 用户取消
      })
    },

    /**
     * 设置订单信息到详细列表
     * 参数：val - 包含订单信息的对象
     * 无返回值
     */
    setOrderInfoToDetailList (val) {
      // 循环设置明细数据的订单信息
      this.dataJson.tempJson.detailListData.forEach(item => {
        item.po_contract_code = val.po_contract_code
        item.po_contract_id = val.po_contract_id
        item.po_order_code = val.code
        item.po_order_id = val.id
        item.order_qty = val.qty
        item.order_price = val.price
        item.order_amount = val.amount
      })
    },

    /**
     * 返回列表页
     */
    handleCancel () {
      this.$emit('closeMeCancel')
    },

    /**
     * 获取业务类型
     */
    fetchBusinessType () {
      getDictDataApi({
        code: CONSTANTS.DICT_B_PO_SETTLEMENT_TYPE,
        dict_value: CONSTANTS.DICT_B_PO_SETTLEMENT_TYPE_ZERO
      }).then(res => {
        this.dataJson.tempJson.type_name = res.data.label
      })
    }
  }
}
</script>

<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.dialog-footer {
  text-align: center;
}

/* 校验错误行的样式 - 使用更强的选择器覆盖Element UI默认样式 */
::v-deep .el-table__body tr.validation-error-row td {
  background-color: #fef0f0 !important;
}

::v-deep .el-table__body tr.validation-error-row:hover td {
  background-color: #fde2e2 !important;
}

/* 覆盖条纹表格的样式 */
::v-deep .el-table--striped .el-table__body tr.validation-error-row.el-table__row--striped td {
  background-color: #fef0f0 !important;
}

::v-deep .el-table--striped .el-table__body tr.validation-error-row.el-table__row--striped:hover td {
  background-color: #fde2e2 !important;
}

/* 覆盖鼠标悬停的默认样式 */
::v-deep .el-table--enable-row-hover .el-table__body tr.validation-error-row:hover td {
  background-color: #fde2e2 !important;
}
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-button-group {
  margin-left: 10px;
}
.el-table {
  margin: 0 10px 10px 10px;
}
.el-form-item .el-select {
  width: 100%;
}
.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.form-items-container {
  display: flex;
  align-items: center;
}

.left-side {
  flex: 9; /* 或者你想要的更高的值，表示左边占据较多的空间 */
}

.right-side {
  flex: 1; /* 或者你想要的更低的值，表示右边占据较少的空间 */
  margin-left: 5px;
}
.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
.div-sum {
  width: calc(100% - 20px );
  height: 35px;
  padding: 5px 5px;
  margin: 10px 10px 0 10px ;
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
  float: right;
}
.count-title {
  margin-left: 10px;
}
.count-data {
  color: #1890ff;
  font-size: 20px;
}

</style>
