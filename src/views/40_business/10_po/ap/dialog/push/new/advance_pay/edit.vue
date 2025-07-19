<template>
  <div class="app-container">
    <div>
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
        status-icon
      >
        <el-alert
          title="付款基本信息"
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
          <el-descriptions-item label="编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="业务类型">
            <el-form-item
              prop="type"
              label-width="0"
            >
              预付款
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="主体企业（付款方）">
            <el-form-item
              prop="purchaser_name"
              label-width="0"
            >
              {{ dataJson.tempJson.buyer_enterprise_name }}
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="供应商（收款方）">
            <el-form-item
              prop="supplier_name"
              label-width="0"
            >
              {{ dataJson.tempJson.supplier_enterprise_name }}
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="付款状态">
            未付款
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="3">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

          <el-descriptions-item label="付款附件材料" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  :accept="'*'"
                  @upload-success="handlePaymentUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.payment_doc_att"
                :key="i"
                :offset="1"
                :span="5"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removePaymentFile"
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
          :column="2"
          :label-style="twoLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="申请付款总金额">
            {{ dataJson.tempJson.payable_amount == null ? '-': formatCurrency(dataJson.tempJson.payable_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="已付款总金额">
            {{ dataJson.tempJson.paid_amount == null? '-': formatCurrency(dataJson.tempJson.paid_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="未付款总金额">
            {{ dataJson.tempJson.unpay_amount == null? '-': formatCurrency(dataJson.tempJson.unpay_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="付款中金额">
            {{ dataJson.tempJson.paying_amount == null? '-': formatCurrency(dataJson.tempJson.paying_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.poOrderListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
          @row-click="handlePoOrderRowClick"
          @current-change="handlePoOrderCurrentChange"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
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
            min-width="130"
            prop="po_goods"
            :auto-fit="true"
            label="商品"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="qty_total"
            align="right"
            label="总采购数量"
          />
          <el-table-column
            min-width="150"
            prop="amount_total"
            label="订单总金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.amount_total == null? '-' : formatCurrency(scope.row.amount_total,true) }}
            </template>
          </el-table-column>
          <el-table-column
            min-width="150"
            prop="po_advance_payment_amount"
            label="预付款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.po_advance_payment_amount == null? '': formatCurrency(scope.row.po_advance_payment_amount, true) }}
            </template>
          </el-table-column>

          <el-table-column
            min-width="150"
            prop="po_can_advance_payment_amount"
            label="可申请预付款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.po_can_advance_payment_amount == null? '': formatCurrency(scope.row.po_can_advance_payment_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            min-width="200"
            prop="order_amount"
            label="本次申请金额"
            align="right"
          >
            <template v-slot="scope">
              <div style="display: flex; align-items: center;">
                <numeric
                  v-model="scope.row.order_amount"
                  :decimal-places="2"
                  :currency-symbol="'¥'"
                  style="flex: 1; margin-right: 8px;"
                  @change.native="handlePoOrderCheck(scope.row)"
                />
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleFullAmountApply(scope.row)"
                >
                  全额
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            min-width="150"
            prop="remark"
            label="备注"
          >
            <template v-slot="scope">
              <el-input
                v-model="scope.row.remark"
                clearable
                :maxlength="dataJson.inputSettings.maxLength.remark"
              />
            </template>
          </el-table-column>

        </el-table>

        <el-alert
          title="付款账户信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="threeLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="付款总金额">
            {{ dataJson.tempJson.detail_payable_amount == null ? '-': formatCurrency(dataJson.tempJson.detail_payable_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-button-group>
          <el-button
            :disabled="settings.btnBankDisabledStatus.disabledInsert"
            type="primary"
            icon="el-icon-circle-plus-outline"
            :loading="settings.loading"
            @click="handleBankInsert"
          >添加</el-button>
          <el-button
            :disabled="settings.btnBankDisabledStatus.disabledDelete"
            type="primary"
            icon="el-icon-circle-close"
            :loading="settings.loading"
            @click="handleBankDelete"
          >删除</el-button>
        </el-button-group>

        <el-table
          ref="multipleBankTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.bankListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
          @row-click="handleBankRowClick"
          @current-change="handleBankCurrentChange"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="name"
            label="付款账户名"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="bank_name"
            label="开户行"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="account_number"
            label="银行账号"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="accounts_purpose_type_name"
            label="类型"
            align="left"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="200"
            prop="payable_amount"
            label="付款金额"
            align="right"
          >
            <template v-slot="scope">
              <div style="display: flex; align-items: center;">
                <numeric
                  v-model="scope.row.payable_amount"
                  :decimal-places="2"
                  :currency-symbol="'¥'"
                  style="flex: 1; margin-right: 8px;"
                  @input="handlePayableAmountChange"
                />
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleFullPaymentApply(scope.row)"
                >
                  全额付款
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
          >
            <template v-slot="scope">
              <el-input
                v-model="scope.row.remark"
                clearable
                :maxlength="dataJson.inputSettings.maxLength.remark"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </div>

    <!-- 审批流程设置：选择人 -->
    <bpm-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="popSettingsData.sponsorDialog.serial_type"
      @closeMeCancel="handleBpmDialogCancel"
      @closeMeOk="handleBpmDialogOk"
    />

    <!--采购订单-弹窗-->
    <poorder_list_template
      v-if="popSettingsData.poOrderDialog.visible"
      :visible="popSettingsData.poOrderDialog.visible"
      :data="popSettingsData.poOrderDialog.data"
      title="添加关联单-采购订单"
      @closeMeOk="handlePoOrderCloseOk"
      @closeMeCancel="handlePoOrderCloseCancel"
    />

    <!--企业银行账户-弹窗-->
    <bank_list_template
      v-if="popSettingsData.bankDialog.visible"
      :visible="popSettingsData.bankDialog.visible"
      :data="popSettingsData.bankDialog.data"
      title="申请付款-付款信息"
      @closeMeOk="handleBankCloseOk"
      @closeMeCancel="handleBankCloseCancel"
    />

  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.el-form-item .el-select {
  width: 100%;
}

.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-button-group {
  margin-left: 10px;
}
.el-table {
  margin: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import { getTypeApi, insertApi, validateApi } from '@/api/40_business/10_po/ap/ap'
import { selectListDataApi } from '@/api/10_system/dictdata/dictdata'
import { getApi } from '@/api/40_business/10_po/poorder/poorder'
import poorder_list_template from '@/views/40_business/10_po/poorder/dialog/listfor/inplan/index.vue'
import bank_list_template from '@/views/20_master/bankaccounts/dialog/list/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import { getPurchaserApi } from '@/api/20_master/bankaccounts/bankaccounts'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import previewCard from '@/components/50_preview_card/preview_card.vue'

export default {
  directives: { elDragDialog },
  components: {
    numeric,
    poorder_list_template,
    bank_list_template,
    BpmDialog,
    SimpleUploadMutilFile,
    previewCard
  },
  mixins: [],
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      twoLabelStyle: {
        width: '5.5%',
        'text-align': 'right'
      },
      threeLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },
      popSettingsData: {
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          serial_type: constants_dict.DICT_B_AP,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        },
        // 采购订单弹窗
        poOrderDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          rowIndex: null
        },
        // 企业银行账户弹窗
        bankDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          rowIndex: null
        }
      },
      dataJson: {
        typeListDate: [],
        bankTypeListDate: [],
        // 用于监听
        actual_count: 0,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          po_order_code: null,
          po_contract_code: null,
          project_code: null,
          purchaser_id: null,
          purchaser_name: '',
          purchaser_code: '',
          buyer_enterprise_name: '',
          buyer_enterprise_code: '',
          supplier_enterprise_name: '',
          supplier_enterprise_code: '',
          // 采购订单
          poOrderListData: [],
          // 银行账户
          bankListData: [],
          // 类型
          type: '2', // 预付款
          detailListData: [],
          // 申请付款总金额
          payable_amount: null,
          // 未付款总金额
          unpay_amount: null,
          // 已付款总金额
          paid_amount: null,
          // 付款中金额
          paying_amount: null,
          // 付款信息付款总额
          detail_payable_amount: null,
          // 付款附件材料
          payment_doc_att_files: [],
          remark: ''
        },
        // 单条数据 json
        tempJson: {
          bankListData: [],
          poOrderListData: []
        },
        currentJson: null,
        searchForm: {
          reset: false
        },
        inputSettings: {
          maxLength: {
            remark: 100
          }
        },
        // 付款附件材料
        payment_doc_att: [],
        payment_doc_att_file: [],
        payment_doc_att_files: []
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        duration: 4000,
        // 采购订单状态：是否可用，false:可用，true不可用
        btnPoOrderDisabledStatus: {
          disabledInsert: false,
          disabledDelete: true
        },
        // 企业银行账户按钮状态：是否可用，false:可用，true不可用
        btnBankDisabledStatus: {
          disabledInsert: false,
          disabledDelete: true
        },
        // pop的check内容
        rules: {
          type: [
            { required: true, message: '请选择业务类型', trigger: 'change' }
          ],
          po_order_code: [
            { required: true, message: '请添加关联单号', trigger: 'change' }
          ],
          order_amount: [
            { required: true, message: '请添加申请金额', trigger: 'change' }
          ],
          payable_amount: [
            { required: true, message: '请添加付款金额', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    CONSTANTS () {
      return constants_dict
    }
  },
  // 监听器
  watch: {
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
    'dataJson.tempJson.poOrderListData': {
      handler: 'calculatePayableAmounts',
      deep: true,
      immediate: true
    },
    'dataJson.tempJson.bankListData': {
      handler: 'handleBankListDataChange',
      deep: true,
      immediate: true
    }
  },
  created () {
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  methods: {
    // 初始化处理
    async init () {
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      // 初始化业务类型
      this.initTypeList()
      // 初始化款项类型
      this.initBankTypeList()
      // 初始化页面数据
      this.initData()
      this.settings.loading = false
    },
    // 计算申请付款相关金额
    calculatePayableAmounts () {
      // 1. 申请付款总金额：业务单据信息表的所有本次申请金额的汇总值
      let totalPayableAmount = 0
      if (this.dataJson.tempJson.poOrderListData && this.dataJson.tempJson.poOrderListData.length > 0) {
        totalPayableAmount = this.dataJson.tempJson.poOrderListData.reduce((sum, item) => {
          const orderAmount = parseFloat(item.order_amount) || 0
          return sum + orderAmount
        }, 0)
      }

      // 设置申请付款总金额
      this.dataJson.tempJson.payable_amount = totalPayableAmount

      // 2. 已付款总金额：设置为null（显示为"-"）
      this.dataJson.tempJson.paid_amount = null

      // 3. 未付款总金额：等于申请付款总金额
      this.dataJson.tempJson.unpay_amount = totalPayableAmount

      // 4. 付款中金额：设置为null（显示为"-"）
      this.dataJson.tempJson.paying_amount = null

      console.log('计算金额 - 申请付款总金额:', totalPayableAmount)
    },
    // 计算付款账户信息的付款总金额
    calculateDetailPayableAmount () {
      let totalDetailPayableAmount = 0
      if (this.dataJson.tempJson.bankListData && this.dataJson.tempJson.bankListData.length > 0) {
        totalDetailPayableAmount = this.dataJson.tempJson.bankListData.reduce((sum, item) => {
          const payableAmount = parseFloat(item.payable_amount) || 0
          return sum + payableAmount
        }, 0)
      }
      this.dataJson.tempJson.detail_payable_amount = totalDetailPayableAmount
      console.log('计算付款账户信息金额 - 付款总金额:', totalDetailPayableAmount)
    },
    // 监听付款金额变化
    handlePayableAmountChange () {
      this.calculateDetailPayableAmount()
    },
    // 银行账户列表数据变化处理
    handleBankListDataChange (newVal, oldVal) {
      this.calculateDetailPayableAmount()
      // 付款账户信息区域的el-table的数据为空时，删除按钮不可用
      if (!newVal || newVal.length === 0) {
        this.settings.btnBankDisabledStatus.disabledDelete = true
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 新增
    doInsert () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const tempData = deepCopy(this.dataJson.tempJson)
          // 审批流程启动数据
          tempData.initial_process = this.popSettingsData.sponsorDialog.initial_process // 流程
          tempData.form_data = this.popSettingsData.sponsorDialog.form_data // 表单参数
          tempData.process_users = this.popSettingsData.sponsorDialog.process_users // 自选用户

          // 确保付款附件材料数据被包含
          tempData.doc_att_files = this.dataJson.payment_doc_att

          if (tempData.poOrderListData == null || tempData.poOrderListData.length === 0) {
            this.showErrorMsg('至少选择一个采购订单')
            return
          }

          if (tempData.bankListData == null || tempData.bankListData.length === 0) {
            this.showErrorMsg('请选择银行账户')
            return
          }

          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_B_AP_NEW_OK, _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
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
    // 采购订单弹窗
    handlePoOrderInsert () {
      this.popSettingsData.poOrderDialog.data = {
        supplier_id: this.dataJson.tempJson.supplier_id,
        supplier_name: this.dataJson.tempJson.supplier_enterprise_name,
        supplier_code: this.dataJson.tempJson.supplier_enterprise_code,
        purchaser_id: this.dataJson.tempJson.purchaser_id,
        purchaser_name: this.dataJson.tempJson.buyer_enterprise_name,
        purchaser_code: this.dataJson.tempJson.buyer_enterprise_code
      }

      this.popSettingsData.poOrderDialog.visible = true
    },
    // 采购订单选中
    handlePoOrderRowClick (row) {
      this.popSettingsData.poOrderDialog.rowIndex = this.getPoOrderRowIndex(row)
    },
    // 采购订单获取行索引
    getPoOrderRowIndex (row) {
      const _index = this.dataJson.tempJson.poOrderListData.lastIndexOf(row)
      return _index
    },
    // 采购订单按钮
    handlePoOrderCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getPoOrderRowIndex(row)
      this.settings.btnPoOrderDisabledStatus.disabledDelete = false
    },
    // 采购订单选择完成
    handlePoOrderCloseOk (val) {
      this.popSettingsData.poOrderDialog.visible = false

      // 设置到table中绑定的业务单据信息
      const tempData = {}
      tempData.po_order_code = val.code
      tempData.po_order_id = val.id
      tempData.project_code = val.project_code
      tempData.po_contract_code = val.po_contract_code
      tempData.po_goods = val.goods_name
      tempData.qty_total = val.order_total
      tempData.amount_total = val.order_amount_sum
      tempData.po_advance_payment_amount = val.advance_pay_price
      tempData.po_can_advance_payment_amount = val.advance_amount_total
      tempData.order_amount = 0
      tempData.remark = null
      tempData.po_contract_id = val.po_contract_id

      if (this.dataJson.tempJson.poOrderListData.find(item => item.po_order_code === tempData.po_order_code)) {
        this.showErrorMsg('业务单据添加失败：该采购订单编号在表格中已经存在，不能添加重复的采购订单！')
        return false
      }

      this.dataJson.tempJson.poOrderListData.push(tempData)

      // 添加后重新计算金额
      this.calculatePayableAmounts()

      this.$notify({
        title: '新增业务单据信息处理成功',
        message: '新增业务单据信息处理成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 采购订单选择关闭
    handlePoOrderCloseCancel () {
      this.popSettingsData.poOrderDialog.visible = false
    },
    // 采购订单选择删除
    handlePoOrderDelete () {
      if (this.popSettingsData.poOrderDialog.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.$confirm('是否确认删除该条数据', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 正确操作数组
        this.dataJson.tempJson.poOrderListData.splice(this.popSettingsData.poOrderDialog.rowIndex, 1)

        this.settings.btnPoOrderDisabledStatus.disabledDelete = true
        this.settings.btnPoOrderDisabledStatus.disabledInsert = false

        // 删除后重新计算金额
        this.calculatePayableAmounts()
      }).catch(() => {
      })
    },
    // 查询主体企业是否有默认账户
    queryPurchaserBankAccount (id) {
      getPurchaserApi({ enterprise_id: id })
        .then(_data => {
          if (_data.data != null) {
            // 检查是否已经存在相同的银行账户（根据bank_accounts_id判断）
            if (this.dataJson.tempJson.bankListData.find(item => item.bank_accounts_id === _data.data.id)) {
              console.log('默认银行账户已存在，跳过添加')
              return
            }

            const tempData = {}
            tempData.name = _data.data.name
            tempData.bank_name = _data.data.bank_name
            tempData.account_number = _data.data.account_number
            tempData.bank_accounts_id = _data.data.id
            tempData.bank_accounts_code = _data.data.code
            tempData.payable_amount = 0

            // 款项类型
            for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
              const element = this.dataJson.bankTypeListDate[i]
              if (this.dataJson.tempJson.type === constants_dict.DICT_B_AP_TYPE_ONE &&
                element.code === constants_dict.DICT_M_BANK_TYPE_THREE) {
                tempData.bank_accounts_type_id = element.id
                tempData.bank_accounts_type_code = element.code
                tempData.accounts_purpose_type_name = element.name
                break
              } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AP_TYPE_TWO &&
                element.code === constants_dict.DICT_M_BANK_TYPE_ONE) {
                tempData.bank_accounts_type_id = element.id
                tempData.bank_accounts_type_code = element.code
                tempData.accounts_purpose_type_name = element.name
                break
              } else {
                tempData.bank_accounts_type_id = element.id
                tempData.bank_accounts_type_code = element.code
                tempData.accounts_purpose_type_name = element.name
                break
              }
            }

            tempData.remark = null
            this.dataJson.tempJson.bankListData = []
            this.dataJson.tempJson.bankListData.push(tempData)

            // 添加默认账户后重新计算付款总金额
            this.calculateDetailPayableAmount()
          } else {
            // 控制按钮
            this.settings.btnBankDisabledStatus.disabledInsert = false
          }
        }).catch(_error => {
          this.showErrorMsg(_error.error.message)
        })
    },
    // 企业银行账户弹窗
    handleBankInsert () {
      this.popSettingsData.bankDialog.data = {
        accounts_purpose_type: constants_dict.DICT_M_BANK_TYPE_ONE,
        enterprise_code: this.dataJson.tempJson.buyer_enterprise_code,
        enterprise_name: this.dataJson.tempJson.buyer_enterprise_name
      }

      this.popSettingsData.bankDialog.visible = true
    },
    // 企业银行账户选中
    handleBankRowClick (row) {
      this.popSettingsData.bankDialog.rowIndex = this.getBankRowIndex(row)
    },
    // 企业银行账户获取行索引
    getBankRowIndex (row) {
      const _index = this.dataJson.tempJson.bankListData.lastIndexOf(row)
      return _index
    },
    // 企业银行按钮
    handleBankCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getBankRowIndex(row)
      this.settings.btnBankDisabledStatus.disabledDelete = false
    },
    // 企业银行选择完成
    handleBankCloseOk (val) {
      // 检查是否已经存在相同的银行账户（根据bank_accounts_id判断）
      if (this.dataJson.tempJson.bankListData.find(item => item.bank_accounts_id === val.id)) {
        this.showErrorMsg('付款账户添加失败：该付款账户在表格中已经存在，不能添加重复的付款账户！')
        return false
      }

      const tempData = {}
      tempData.name = val.name
      tempData.bank_name = val.bank_name
      tempData.account_number = val.account_number
      tempData.bank_accounts_id = val.id
      tempData.bank_accounts_code = val.code

      // 款项类型
      for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
        const element = this.dataJson.bankTypeListDate[i]
        if (this.dataJson.tempJson.type === constants_dict.DICT_B_AP_TYPE_ONE &&
          element.code === constants_dict.DICT_M_BANK_TYPE_THREE) {
          tempData.bank_accounts_type_id = element.id
          tempData.bank_accounts_type_code = element.code
          tempData.accounts_purpose_type_name = element.name
          break
        } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AP_TYPE_TWO &&
          element.code === constants_dict.DICT_M_BANK_TYPE_ONE) {
          tempData.bank_accounts_type_id = element.id
          tempData.bank_accounts_type_code = element.code
          tempData.accounts_purpose_type_name = element.name
          break
        } else {
          tempData.bank_accounts_type_id = element.id
          tempData.bank_accounts_type_code = element.code
          tempData.accounts_purpose_type_name = element.name
          break
        }
      }

      tempData.payable_amount = 0
      tempData.remark = null
      this.dataJson.tempJson.bankListData.push(tempData)
      this.popSettingsData.bankDialog.visible = false

      // 添加后重新计算付款总金额
      this.calculateDetailPayableAmount()

      this.$notify({
        title: '新增付款信息处理成功',
        message: '新增付款信息处理成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 企业银行选择关闭
    handleBankCloseCancel () {
      this.popSettingsData.bankDialog.visible = false
    },
    // 企业银行选择删除
    handleBankDelete () {
      if (this.popSettingsData.bankDialog.rowIndex === null) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 删除
      this.$confirm('是否确认删除该条数据', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 设置到table中绑定的json数据源
        this.dataJson.tempJson.bankListData.splice(this.popSettingsData.bankDialog.rowIndex, 1)

        this.settings.btnBankDisabledStatus.disabledDelete = true
        this.settings.btnBankDisabledStatus.disabledInsert = false

        // 删除后重新计算付款总金额
        this.calculateDetailPayableAmount()
      }).catch(action => {

      })
    },
    // 校验数据 获取审批流程
    startProcess () {
      this.showLoading('正在保存，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE

      // 确保付款附件材料数据被包含
      tempData.payment_doc_att_files = this.dataJson.payment_doc_att

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          validateApi(tempData).then(_data => {
            if (_data.success) {
              // 获取审批流程
              this.getFlow()
            } else {
              this.closeLoading()
              this.$notify({
                title: '校验失败',
                message: _data.data.message,
                type: 'error',
                duration: this.settings.duration
              })
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
    // 获取审批流程
    getFlow () {
      // 校验是否存在审批流程
      getFlowProcessApi({ 'serial_type': this.popSettingsData.sponsorDialog.serial_type })
        .then((rsp) => {
          if (rsp.data === null) {
            this.$message.error('未找到审批流程，请联系管理员')
          } else {
            // 流程参数
            this.popSettingsData.sponsorDialog.form_data = {}
            // 启动审批流弹窗
            this.popSettingsData.sponsorDialog.visible = true
          }
        }).catch((err) => {
          this.closeLoading()
          this.$message.error(err)
        }).finally(() => {
          this.closeLoading()
        })
    },
    // 取消
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    // 初始化业务类型
    initTypeList () {
      const _this = this
      getTypeApi().then(response => {
        if (response.data.length !== 0) {
          _this.dataJson.typeListDate = _this.dataJson.typeListDate.concat(response.data)
          _this.dataJson.typeListDate.forEach(item => {
            item.checked = false
          })
        } else {
          this.showErrorMsg('业务类型数据为空,请联系管理员')
        }
      })
    },
    // 初始化款项类型
    initBankTypeList () {
      const params = {
        dictTypeCode: constants_dict.DICT_M_BANK_TYPE,
        is_del: 0
      }
      selectListDataApi(params).then(response => {
        if (response.data.length !== 0) {
          this.dataJson.bankTypeListDate = response.data.map(item => ({
            id: item.id,
            code: item.dict_value,
            name: item.label
          }))
        } else {
          this.showErrorMsg('款项类型数据为空,请联系管理员')
        }
      }).catch(error => {
        console.error('获取款项类型失败:', error)
        this.showErrorMsg('获取款项类型失败')
      })
    },
    // 初始化页面数据
    initData () {
      getApi({ id: this.data.id }).then(response => {
        if (response.data.length !== 0) {
          // 基本信息（添加关联单号）
          this.dataJson.tempJson.po_order_code = response.data.code
          this.dataJson.tempJson.po_order_id = response.data.id
          this.dataJson.tempJson.project_code = response.data.project_code
          this.dataJson.tempJson.po_contract_code = response.data.po_contract_code
          this.dataJson.tempJson.supplier_enterprise_code = response.data.supplier_code
          this.dataJson.tempJson.supplier_enterprise_name = response.data.supplier_name
          this.dataJson.tempJson.buyer_enterprise_code = response.data.purchaser_code
          this.dataJson.tempJson.buyer_enterprise_name = response.data.purchaser_name
          this.dataJson.tempJson.supplier_id = response.data.supplier_id
          this.dataJson.tempJson.supplier_name = response.data.supplier_name
          this.dataJson.tempJson.supplier_code = response.data.supplier_code
          this.dataJson.tempJson.purchaser_id = response.data.purchaser_id
          this.dataJson.tempJson.purchaser_name = response.data.purchaser_name
          this.dataJson.tempJson.purchaser_code = response.data.purchaser_code

          // 设置到table中绑定的业务单据信息
          const tempData = {}
          tempData.id = response.data.id
          tempData.po_order_code = response.data.code
          tempData.po_order_id = response.data.id
          tempData.project_code = response.data.project_code
          tempData.po_contract_code = response.data.po_contract_code
          tempData.po_goods = response.data.goods_name
          tempData.qty_total = response.data.order_total
          tempData.amount_total = response.data.order_amount_sum
          tempData.po_advance_payment_amount = response.data.advance_pay_price
          tempData.po_can_advance_payment_amount = response.data.advance_amount_total
          tempData.order_amount = 0
          tempData.remark = null

          tempData.po_contract_id = response.data.po_contract_id

          this.dataJson.tempJson.poOrderListData.push(tempData)

          // 添加后重新计算金额
          this.calculatePayableAmounts()

          // 查询主体企业是否有默认账户
          this.queryPurchaserBankAccount(response.data.purchaser_id)
        } else {
          this.showErrorMsg('数据为空,请联系管理员')
        }
      })
    },
    // 申请金额填写
    handlePoOrderCheck (val) {
      // 申请金额不能大于可申请预付款金额
      if (val.po_can_advance_payment_amount < val.order_amount) {
        val.order_amount = null
        this.showErrorMsg('申请金额不能大于可申请预付款金额')
        return
      }

      // 触发金额重新计算
      this.calculatePayableAmounts()
    },
    /**
     * 处理全额申请：本次申请金额=可申请预付款金额
     * @param val
     */
    handleFullAmountApply (val) {
      val.order_amount = val.po_can_advance_payment_amount
      // 触发金额重新计算
      this.calculatePayableAmounts()
    },
    /**
     * 处理全额付款：付款金额=申请付款总金额，其他行付款金额设为0
     * @param val 当前行数据
     */
    handleFullPaymentApply (val) {
      console.log('全额付款按钮点击事件触发', val)

      // 1. 把其他行的付款金额设置为0
      if (this.dataJson.tempJson.bankListData && this.dataJson.tempJson.bankListData.length > 0) {
        this.dataJson.tempJson.bankListData.forEach(item => {
          if (item !== val) {
            item.payable_amount = 0
          }
        })
      }

      // 2. 当前行的付款金额设置为申请付款总金额
      val.payable_amount = this.dataJson.tempJson.payable_amount || 0

      // 3. 触发付款总金额重新计算
      this.calculateDetailPayableAmount()
    },
    // 付款附件上传成功
    handlePaymentUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.payment_doc_att.push(res.response.data)
      this.dataJson.payment_doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.payment_doc_att_files = this.dataJson.payment_doc_att
    },
    // 付款附件文件移除
    removePaymentFile (val) {
      // 获取下标
      const _index = this.dataJson.payment_doc_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.payment_doc_att.splice(_index, 1)
      this.dataJson.payment_doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.payment_doc_att_files = this.dataJson.payment_doc_att
    },
    // 上传失败
    handleFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    }
  }
}
</script>
