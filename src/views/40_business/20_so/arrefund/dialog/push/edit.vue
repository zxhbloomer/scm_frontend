<template>
  <div class="app-container">
    <div class="edit-container">
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
        status-icon
      >
        <el-alert
          title="基本信息"
          type="info"
          :closable="false"
        />
        <br>
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
              预付退款
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="关联单号">
            {{ dataJson.tempJson.po_code }}
          </el-descriptions-item>

          <el-descriptions-item label="退款状态">
            未退款
          </el-descriptions-item>

          <el-descriptions-item label="备注">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

        </el-descriptions>
        <br>
        <el-alert
          title="业务单据信息"
          type="info"
          :closable="false"
        />
        <br>

        <el-descriptions
          title=""
          :column="2"
          :label-style="twoLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="申请退款总金额">
            {{ dataJson.tempJson.refund_amount == null ? '-': formatNumber(dataJson.tempJson.refund_amount, true,4) }}
          </el-descriptions-item>
          <el-descriptions-item label="已退款总金额">
            {{ dataJson.tempJson.refunded_amount == null? '-': formatNumber(dataJson.tempJson.refunded_amount, true,4) }}
          </el-descriptions-item>
          <el-descriptions-item label="未退款总金额">
            {{ dataJson.tempJson.not_pay_amount == null? '-': formatNumber(dataJson.tempJson.not_pay_amount, true,4) }}
          </el-descriptions-item>
          <el-descriptions-item label="退款中金额">
            {{ dataJson.tempJson.refunding_amount == null? '-': formatNumber(dataJson.tempJson.refunding_amount, true,4) }}
          </el-descriptions-item>
        </el-descriptions>
        <br>

        <el-descriptions
          title=""
          :column="3"
          :label-style="twoLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.po_contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.po_order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="主体企业（付款方）">
            {{ dataJson.tempJson.purchaser_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="供应商（收款方）">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.goods_name_concact || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="预付款已付金额">
            {{ (dataJson.tempJson.advance_paid_total && dataJson.tempJson.advance_cancelpay_total) ? formatNumber(dataJson.tempJson.advance_paid_total - dataJson.tempJson.advance_cancelpay_total, true, 4) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="可退金额">
            {{ dataJson.tempJson.advance_refund_amount_total == null ? '-' : formatNumber(dataJson.tempJson.advance_refund_amount_total, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="本次申请退款金额">
            <div style="display: flex; align-items: center;">
              <numeric
                v-model="dataJson.tempJson.order_amount"
                :decimal-places="2"
                :currency-symbol="'¥'"
                style="flex: 1; margin-right: 8px;"
                @change.native="handlePoOrderCheck(dataJson.tempJson)"
              />
              <el-button
                size="mini"
                type="primary"
                @click="handleFullAmountApply(dataJson.tempJson)"
              >
                全额申请
              </el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <br>

        <el-descriptions
          title=""
          :column="3"
          :label-style="twoLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.po_contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.po_order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="主体企业（付款方）">
            {{ dataJson.tempJson.purchaser_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="供应商（收款方）">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.goods_name_concact || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="预付款已付金额">
            {{ (dataJson.tempJson.advance_paid_total || 0) - (dataJson.tempJson.advance_cancelpay_total || 0) }}
          </el-descriptions-item>
          <el-descriptions-item label="可退金额">
            {{ dataJson.tempJson.advance_refund_amount_total || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="本次申请退款金额">
            <div style="display: flex; align-items: center;">
              <numeric
                v-model="dataJson.tempJson.order_amount"
                :decimal-places="2"
                :currency-symbol="'¥'"
                style="flex: 1; margin-right: 8px;"
                @change.native="handlePoOrderCheck()"
              />
              <el-button
                size="mini"
                type="primary"
                @click="handleFullAmountApply()"
              >
                全额申请
              </el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <br>

        <br>
        <el-alert
          title="退款信息"
          type="info"
          :closable="false"
        />
        <br>

        <el-descriptions
          title=""
          :column="1"
          :label-style="threeLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="退款总金额">
            {{ dataJson.tempJson.detail_payable_amount == null ? '-': formatNumber(dataJson.tempJson.detail_payable_amount, true,4) }}
          </el-descriptions-item>
        </el-descriptions>
        <br>

        <br>

        <el-descriptions
          title=""
          :column="3"
          :label-style="twoLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="付款账户名">
            {{ dataJson.tempJson.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="开户行">
            {{ dataJson.tempJson.bank_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="银行账户">
            {{ dataJson.tempJson.account_number || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.bank_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="付款金额" span="2">
            <div style="display: flex; align-items: center;">
              <numeric
                v-model="dataJson.tempJson.order_amount"
                :decimal-places="2"
                :currency-symbol="'¥'"
                style="flex: 1; margin-right: 8px;"
                @change.native="handleBankRefundAmountChange(dataJson.tempJson)"
              />
              <el-button
                size="mini"
                type="primary"
                @click="handleBankFullAmountApply(dataJson.tempJson)"
              >
                全额退款
              </el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <br>

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
        @click="startProcess()"
      >提交审批并保存</el-button>
      <el-button
        size="medium"
        :disabled="settings.loading"
        @click="handleCancel()"
      >返回</el-button>
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
  height: calc(100vh - 220px);
  overflow-x: auto;
}
.dialog-footer {
  text-align: center;
}
.el-form-item .el-select {
  width: 100%;
}

.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
br {
  display: block;
  margin: 10px;
  content: ' ';
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
import { getTypeApi, insertApi, validateApi, getApRefundApi } from '@/api/40_business/10_po/ap/ap'
import { selectListDataApi } from '@/api/10_system/dictdata/dictdata'
import bank_list_template from '@/views/20_master/bankaccounts/dialog/list/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import { getPurchaserApi } from '@/api/20_master/bankaccounts/bankaccounts'
export default {
  directives: { elDragDialog },
  components: { numeric, bank_list_template, BpmDialog },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: constants_para.STATUS_INSERT
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
      // 监听器
      watch: {
        unwatch_tempJson: null,
        unwatch_actual_count: null,
        unwatch_actual_price: null,
        'dataJson.tempJson.unit_id': {
          handler (newVal, oldVal) {
            console.log(newVal)
          }
        }
      },
      popSettingsData: {
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          serial_type: constants_dict.DICT_B_AR_REFUND,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        },
        // 企业银行账户弹窗
        bankDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        }
      },
      dataJson: {
        typeListDate: [],
        bankTypeListDate: [],
        // 用于监听
        actual_count: 0,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          buyer_enterprise_code: null,
          buyer_enterprise_name: null,
          po_code: null,
          po_contract_code: null,
          po_order_code: null,
          project_code: null,
          supplier_enterprise_code: null,
          supplier_enterprise_name: null,
          // 新增字段
          po_contract_id: null,
          po_order_id: null,
          type_name: null,
          purchaser_name: null,
          purchaser_id: null,
          supplier_name: null,
          supplier_id: null,
          goods_name_concact: null,
          advance_paid_total: null,
          advance_cancelpay_total: null,
          advance_refund_amount_total: null,
          order_amount: 0,
          // 银行账户信息
          name: null,
          bank_name: null,
          account_number: null,
          bank_type_name: null,
          refund_amount: null,
          // 采购订单
          poOrderListData: [],
          // 银行账户
          bankListData: [],
          // 类型
          type: constants_dict.DICT_B_AR_TYPE_TWO,
          detailListData: [],
          // 申请付款总金额
          payable_amount: null,
          // 未付款总金额
          not_pay_amount: null,
          // 已付款总金额
          paid_amount: null,
          // 付款中金额
          paying_amount: null,
          // 付款信息付款总额
          detail_payable_amount: null
        },
        // 单条数据 json
        tempJson: {
          bankListData: [],
          poOrderListData: []
        },
        searchForm: {
          reset: false
        },
        inputSettings: {
          maxLength: {
            remark: 100
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false
        },
        // 采购订单状态：是否可用，false:可用，true不可用
        btnPoOrderDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        // 企业银行账户按钮状态：是否可用，false:可用，true不可用
        btnBankDisabledStatus: {
          disabledInsert: true,
          disabledDelete: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {
          po_code: [
            { required: true, message: '请添加关联单号', trigger: 'change' }
          ],
          order_amount: [
            { required: true, message: '请添加申请金额', trigger: 'change' }
          ],
          paid_amount: [
            { required: true, message: '请添加付款金额', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  // 监听器
  watch: {},
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    async init () {
      // 初始化按钮
      this.initButtonShowStatus()
      this.initInsertModel()

      // 初始化款项类型
      this.initBankTypeList()

      // 初始化页面数据
      this.initData()

      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnPoOrderDisabledStatus = this.$options.data.call(this).settings.btnPoOrderDisabledStatus
      this.settings.btnBankDisabledStatus = this.$options.data.call(this).settings.btnBankDisabledStatus
    },
    // 新增时的初始化
    initInsertModel () {
      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch(
        'dataJson.tempJson',
        (newVal, oldVal) => {

        },
        { deep: true }
      )
    },
    unWatch () {
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
                EventBus.$emit(this.EMITS.EMIT_MST_B_AR_REFUND_NEW_OK, _data.data)
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
    // 处理银行退款金额变化
    handleBankRefundAmountChange () {
      // 退款金额不能大于可退金额
      if (this.dataJson.tempJson.advance_refund_amount_total && this.dataJson.tempJson.refund_amount > this.dataJson.tempJson.advance_refund_amount_total) {
        this.dataJson.tempJson.refund_amount = 0
        this.showErrorMsg('退款金额不能大于可退金额')
        return
      }

      // 同步更新订单申请金额
      this.dataJson.tempJson.order_amount = this.dataJson.tempJson.refund_amount

      // 计算相关金额
      this.dataJson.tempJson.detail_payable_amount = this.dataJson.tempJson.refund_amount
      this.dataJson.tempJson.not_pay_amount = this.dataJson.tempJson.refund_amount
    },

    // 全额退款按钮处理
    handleBankFullAmountApply () {
      this.dataJson.tempJson.refund_amount = this.dataJson.tempJson.advance_refund_amount_total || 0
      // 同步更新订单申请金额
      this.dataJson.tempJson.order_amount = this.dataJson.tempJson.refund_amount
      // 计算相关金额
      this.dataJson.tempJson.detail_payable_amount = this.dataJson.tempJson.refund_amount
      this.dataJson.tempJson.not_pay_amount = this.dataJson.tempJson.refund_amount
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
      const tempData = {}
      tempData.name = val.name
      tempData.bank_name = val.bank_name
      tempData.account_number = val.account_number
      tempData.bank_accounts_id = val.id
      tempData.bank_accounts_code = val.code
      // tempData.bank_accounts_purpose_id = val.bank_accounts_purpose_id
      // tempData.bank_accounts_purpose_code = val.bank_accounts_purpose_code
      // tempData.accounts_purpose_type_name = val.accounts_purpose_type_name

      // todo 款项类型
      for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
        const element = this.dataJson.bankTypeListDate[i]
        if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_ONE &&
          element.code === constants_dict.DICT_M_BANK_TYPE_THREE) {
          tempData.bank_accounts_type_id = element.id
          tempData.bank_accounts_type_code = element.code
          tempData.accounts_purpose_type_name = element.name
          break
        } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_TWO &&
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

      // tempData.payable_amount = 0
      tempData.remark = null
      this.dataJson.tempJson.bankListData.push(tempData)
      this.popSettingsData.bankDialog.visible = false

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

        this.dataJson.tempJson.detail_payable_amount = '-'
        this.settings.btnBankDisabledStatus.disabledDelete = true
        this.settings.btnBankDisabledStatus.disabledInsert = false
      }).catch(action => {

      })
    },
    // 校验数据 获取审批流程
    startProcess () {
      this.showLoading('正在查询，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.INSERT_CHECK_TYPE

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
    // 数据整合方法
    integrateDialogData (dialogData) {
      // 根据需求进行数据整合
      this.dataJson.tempJson.po_contract_id = dialogData.po_contract_id
      this.dataJson.tempJson.po_contract_code = dialogData.po_contract_code
      this.dataJson.tempJson.po_order_id = dialogData.po_order_id
      this.dataJson.tempJson.po_order_code = dialogData.po_order_code
      this.dataJson.tempJson.type_name = dialogData.type_name
      this.dataJson.tempJson.purchaser_name = dialogData.purchaser_name
      this.dataJson.tempJson.purchaser_id = dialogData.purchaser_id
      this.dataJson.tempJson.supplier_name = dialogData.supplier_name
      this.dataJson.tempJson.supplier_id = dialogData.supplier_id
      this.dataJson.tempJson.advance_paid_total = dialogData.advance_paid_total
      this.dataJson.tempJson.advance_cancelpay_total = dialogData.advance_cancelpay_total
      this.dataJson.tempJson.advance_refund_amount_total = dialogData.advance_refund_amount_total
      this.dataJson.tempJson.order_amount = 0

      // 处理商品名称（转换成按逗号分割的一条数据）
      if (dialogData.list && dialogData.list.length > 0) {
        const goodsNames = dialogData.list.map(item => item.goods_name).filter(name => name)
        this.dataJson.tempJson.goods_name_concact = goodsNames.join(',')
      }

      // 调用 getPurchaserApi
      if (dialogData.purchaser_id) {
        this.queryPurchaserBankAccount(dialogData.purchaser_id)
      }
    },

    // 查询主体企业是否有默认账户
    queryPurchaserBankAccount (id) {
      // 根据业务类型设置bank_type参数
      let bankType = []
      if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_ONE) {
        // 应付款
        bankType = [constants_dict.DICT_M_BANK_TYPE_ONE]
      } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_TWO) {
        // 预付款
        bankType = [constants_dict.DICT_M_BANK_TYPE_TWO]
      } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_THREE) {
        // 其他支出
        bankType = [constants_dict.DICT_M_BANK_TYPE_THREE]
      }

      getPurchaserApi({ enterprise_id: id, bank_type: bankType })
        .then(_data => {
          if (_data.data != null) {
            // 设置银行账户信息
            this.dataJson.tempJson.name = _data.data.name
            this.dataJson.tempJson.bank_name = _data.data.bank_name
            this.dataJson.tempJson.account_number = _data.data.account_number
            this.dataJson.tempJson.refund_amount = 0

            // 设置银行类型名称
            for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
              const element = this.dataJson.bankTypeListDate[i]
              if (this.dataJson.tempJson.type === constants_dict.DICT_B_AR_TYPE_TWO &&
                element.code === constants_dict.DICT_M_BANK_TYPE_ONE) {
                this.dataJson.tempJson.bank_type_name = element.name
                break
              } else {
                this.dataJson.tempJson.bank_type_name = element.name
                break
              }
            }
          }
        }).catch(_error => {
          this.showErrorMsg(_error.error.message || '获取默认银行账户失败')
        })
    },

    // 初始化页面数据
    initData () {
      // 使用传入的数据进行数据整合
      if (this.data) {
        const popupData = this.data

        // 数据整合逻辑
        this.dataJson.tempJson.po_contract_id = popupData.po_contract_id
        this.dataJson.tempJson.po_contract_code = popupData.po_contract_code
        this.dataJson.tempJson.po_order_id = popupData.po_order_id
        this.dataJson.tempJson.po_order_code = popupData.po_order_code
        this.dataJson.tempJson.type_name = popupData.type_name
        this.dataJson.tempJson.purchaser_name = popupData.purchaser_name
        this.dataJson.tempJson.purchaser_id = popupData.purchaser_id
        this.dataJson.tempJson.supplier_name = popupData.supplier_name
        this.dataJson.tempJson.supplier_id = popupData.supplier_id
        this.dataJson.tempJson.advance_paid_total = popupData.advance_paid_total
        this.dataJson.tempJson.advance_cancelpay_total = popupData.advance_cancelpay_total
        this.dataJson.tempJson.advance_refund_amount_total = popupData.advance_refund_amount_total
        this.dataJson.tempJson.order_amount = 0

        // 商品名称转换：从 list.goods_name 转换成按逗号分割的一条数据
        if (popupData.list && popupData.list.length > 0) {
          const goodsNames = popupData.list.map(item => item.goods_name).filter(name => name)
          this.dataJson.tempJson.goods_name_concact = goodsNames.join(',')
        }

        // 调用 getPurchaserApi
        if (popupData.purchaser_id) {
          this.queryPurchaserBankAccount(popupData.purchaser_id)
        }
      } else {
        // 原有逻辑保留作为备用
        getApRefundApi({ po_code: this.data.code }).then(response => {
          if (response.data != null) {
            // 基本信息（添加关联单号）
            this.dataJson.tempJson.po_code = response.data.code
            this.dataJson.tempJson.project_code = response.data.project_code
            this.dataJson.tempJson.po_contract_code = response.data.po_contract_code
            this.dataJson.tempJson.supplier_enterprise_code = response.data.supplier_enterprise_code
            this.dataJson.tempJson.supplier_enterprise_name = response.data.supplier_enterprise_name
            this.dataJson.tempJson.supplier_enterprise_version = response.data.supplier_enterprise_version
            this.dataJson.tempJson.buyer_enterprise_code = response.data.buyer_enterprise_code
            this.dataJson.tempJson.buyer_enterprise_name = response.data.buyer_enterprise_name
            this.dataJson.tempJson.buyer_enterprise_version = response.data.buyer_enterprise_version
            this.dataJson.tempJson.type = constants_dict.DICT_B_AR_TYPE_TWO
            this.dataJson.tempJson.refunded_amount = response.data.refunded_amount
            this.dataJson.tempJson.refunding_amount = response.data.refunding_amount

            // 设置到table中绑定的业务单据信息
            const tempData = {}
            tempData.ap_id = response.data.id
            tempData.ap_code = response.data.code
            tempData.po_code = response.data.po_code
            tempData.project_code = response.data.project_code
            tempData.po_contract_code = response.data.po_contract_code
            tempData.po_goods = response.data.poOrderListData[0].po_goods
            tempData.advance_pay_amount = response.data.payable_amount
            tempData.can_refunded_amount = response.data.can_refunded_amount
            tempData.refunded_amount = response.data.refunded_amount
            tempData.refunding_amount = response.data.refunding_amount
            tempData.refund_amount = 0
            tempData.remark = null

            this.dataJson.tempJson.poOrderListData.push(tempData)

            // 查询主体企业是否有默认账户
            this.queryPurchaserBankAccount(response.data.buyer_enterprise_code)
          } else {
            this.$emit('closeMeCancel')
            this.showErrorMsg('不存在付款信息，无法下推预付退款')
          }
        })
      }
    },
    // 申请金额填写
    handlePoOrderCheck () {
      const orderAmount = parseFloat(this.dataJson.tempJson.order_amount) || 0
      const maxRefundAmount = parseFloat(this.dataJson.tempJson.advance_refund_amount_total) || 0

      // 申请金额不能大于可退金额
      if (orderAmount > maxRefundAmount) {
        this.dataJson.tempJson.order_amount = 0
        this.showErrorMsg('申请金额不能大于可退金额')
        return
      }

      // 同步更新银行退款金额
      this.dataJson.tempJson.refund_amount = orderAmount
      this.calculateRefundAmounts()
    },
    // 付款金额填写
    handleBankCheck (val) {
      // 请添加关联单号
      if (this.dataJson.tempJson.poOrderListData == null || this.dataJson.tempJson.poOrderListData.length === 0) {
        val.refund_amount = 0
        this.showErrorMsg('请添加业务单据信息')
        return
      }

      // 申请金额不能大于可申请预付款金额
      if (this.dataJson.tempJson.poOrderListData[0].can_refunded_amount < val.refund_amount) {
        val.refund_amount = 0
        this.showErrorMsg('申请金额不能大于可申请预付款金额')
      }

      // 计算付款金额总金额
      this.dataJson.tempJson.poOrderListData[0].refund_amount = val.refund_amount
      this.dataJson.tempJson.refund_amount = val.refund_amount
      this.dataJson.tempJson.detail_payable_amount = val.refund_amount
      this.dataJson.tempJson.not_pay_amount = val.refund_amount
    },
    handleTypeChange (val) {
      if (this.dataJson.tempJson.bankListData[0] != null) {
        const tempData = this.dataJson.tempJson.bankListData[0]
        // todo 款项类型
        for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
          const element = this.dataJson.bankTypeListDate[i]
          if (val === constants_dict.DICT_B_AR_TYPE_ONE &&
            element.code === constants_dict.DICT_M_BANK_TYPE_THREE) {
            tempData.bank_accounts_type_id = element.id
            tempData.bank_accounts_type_code = element.code
            tempData.accounts_purpose_type_name = element.name
            break
          } else if (val === constants_dict.DICT_B_AR_TYPE_TWO &&
            element.code === constants_dict.DICT_M_BANK_TYPE_ONE) {
            tempData.bank_accounts_type_id = element.id
            tempData.bank_accounts_type_code = element.code
            tempData.accounts_purpose_type_name = element.name
            break
          } else if (val === constants_dict.DICT_B_AR_TYPE_THREE) {
            tempData.bank_accounts_type_id = element.id
            tempData.bank_accounts_type_code = element.code
            tempData.accounts_purpose_type_name = element.name
            break
          }
        }
        // tempData.payable_amount = 0
        tempData.remark = null
        this.dataJson.tempJson.bankListData = [tempData]
      }
    },
    // 校验本次申请金额
    verifyOrderAmount (rule, value, callback) {
      if (value > this.dataJson.tempJson.poOrderListData[0].po_can_advance_payment_amount) {
        callback(new Error('本次申请金额不能大于可申请预付款金额'))
      } else {
        callback()
      }
    },
    // 全额申请方法
    handleFullAmountApply () {
      this.dataJson.tempJson.order_amount = this.dataJson.tempJson.advance_refund_amount_total || 0
      this.dataJson.tempJson.refund_amount = this.dataJson.tempJson.order_amount
      this.calculateRefundAmounts()
    },
    // 计算退款相关金额
    calculateRefundAmounts () {
      const orderAmount = parseFloat(this.dataJson.tempJson.order_amount) || 0
      const refundAmount = parseFloat(this.dataJson.tempJson.refund_amount) || 0

      // 更新各种金额显示
      this.dataJson.tempJson.refund_amount = orderAmount
      this.dataJson.tempJson.not_pay_amount = orderAmount
      this.dataJson.tempJson.detail_payable_amount = refundAmount

      console.log('计算退款金额 - 本次申请金额:', orderAmount)
      console.log('计算退款金额 - 退款总金额:', refundAmount)
    }
  }
}
</script>
