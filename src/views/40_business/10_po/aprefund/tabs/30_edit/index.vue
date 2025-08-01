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
        <div style="margin-bottom: 10px" />
        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="退款编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              业务类型</div>
            <el-form-item
              prop="type"
              label-width="0"
            >
              <el-radio-group v-model="dataJson.tempJson.type" :disabled="isBusinessTypeDisabled">
                <el-radio-button
                  v-for="item in dataJson.typeListDate"
                  :key="item.dict_id"
                  :label="item.dict_id"
                  :checked="item.checked"
                  @click.native="handleTypeChange(item.dict_id)"
                >
                  {{ item.dict_label }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="退款状态">
            未退款
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="3">
            <el-input
              v-model.trim="dataJson.tempJson.remark"
              clearable
              :maxlength="dataJson.inputSettings.maxLength.remark"
            />
          </el-descriptions-item>

          <el-descriptions-item label="退款附件材料" span="3">
            <el-row>
              <Simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleRefundUploadFileSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.refund_doc_att"
                :key="i"
                :offset="0"
                :span="3"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeRefundFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>

        </el-descriptions>
        <div style="margin-bottom: 10px" />
        <el-alert
          title="业务单据信息"
          type="info"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />
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
            {{ dataJson.tempJson.refundable_amount == null ? '-': formatCurrency(dataJson.tempJson.refundable_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="已退款总金额">
            {{ dataJson.tempJson.refunded_amount == null? '-': formatCurrency(dataJson.tempJson.refunded_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="未退款总金额">
            {{ dataJson.tempJson.unrefund_amount == null? '-': formatCurrency(dataJson.tempJson.unrefund_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="退款中金额">
            {{ dataJson.tempJson.refunding_amount == null? '-': formatCurrency(dataJson.tempJson.refunding_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-bottom: 10px" />

        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
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
            {{ dataJson.tempJson.po_goods || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="预付款已付金额">
            {{ (dataJson.tempJson.advance_paid_total || 0) - (dataJson.tempJson.advance_cancelpay_total || 0) == 0 ? '-': formatCurrency((dataJson.tempJson.advance_paid_total || 0) - (dataJson.tempJson.advance_cancelpay_total || 0), true) }}
          </el-descriptions-item>
          <el-descriptions-item label="可退金额">
            {{ dataJson.tempJson.advance_refund_amount_total == null ? '-': formatCurrency(dataJson.tempJson.advance_refund_amount_total, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="本次申请退款金额">
            <el-form-item
              prop="order_amount"
              label-width="0"
            >
              <div style="display: flex; align-items: center;">
                <numeric
                  v-if="dataJson.tempJson.po_contract_code"
                  v-model="dataJson.tempJson.order_amount"
                  :decimal-places="2"
                  :currency-symbol="'¥'"
                  :disabled="isRefundAmountDisabled"
                  style="flex: 1; margin-right: 8px;"
                  @change.native="handlePoOrderCheck(dataJson.tempJson)"
                />
                <span v-else style="flex: 1; margin-right: 8px; color: #999;">
                  请先选择业务类型
                </span>
                <el-button
                  size="mini"
                  type="primary"
                  :disabled="isFullAmountApplyDisabled"
                  @click="handleFullAmountApply(dataJson.tempJson)"
                >
                  全额申请
                </el-button>
              </div>
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-bottom: 10px" />

        <el-alert
          title="退款账户"
          type="info"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />

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
            {{ dataJson.tempJson.bankData.detail_refund_amount == null ? '-': formatCurrency(dataJson.tempJson.bankData.detail_refund_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-bottom: 10px" />

        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="退款账户">
            <div style="display: flex; align-items: center;">
              <span style="flex: 1; margin-right: 8px;">{{ dataJson.tempJson.bankData.name || '-' }}</span>
              <el-button
                size="mini"
                type="primary"
                :disabled="isBankAccountSwitchDisabled"
                @click="handleBankInsert"
              >
                切换账户
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="开户行">
            {{ dataJson.tempJson.bankData.bank_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="银行账户">
            {{ dataJson.tempJson.bankData.account_number || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.bankData.bank_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="退款金额">
            <el-form-item
              prop="bankData.order_amount"
              label-width="0"
            >
              <div style="display: flex; align-items: center;">
                <numeric
                  v-model="dataJson.tempJson.bankData.order_amount"
                  :decimal-places="2"
                  :currency-symbol="'¥'"
                  :disabled="isBankRefundAmountDisabled"
                  style="flex: 1; margin-right: 8px;"
                  @change.native="handleBankRefundAmountChange(dataJson.tempJson.bankData)"
                />
                <el-button
                  size="mini"
                  type="primary"
                  :disabled="isFullRefundDisabled"
                  @click="handleBankFullAmountApply(dataJson.tempJson.bankData)"
                >
                  全额退款
                </el-button>
              </div>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item />
        </el-descriptions>
        <div style="margin-bottom: 10px" />

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
      <!--      <el-button-->
      <!--        size="medium"-->
      <!--        :disabled="isResetPageDisabled"-->
      <!--        @click="handleApFountRest"-->
      <!--      >重置</el-button>-->
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

    <!--(关联单号)付款管理-列表弹窗-->
    <po-order-list-template
      v-if="popSettingsData.apFundDialog.visible"
      :visible="popSettingsData.apFundDialog.visible"
      :data="popSettingsData.apFundDialog.data"
      title="添加关联单-采购预付款"
      @closeMeOk="handlePoorderListCloseOk"
      @closeMeCancel="handleApFountCloseCancel"
    />

    <!--企业银行账户-弹窗-->
    <bank_list_template
      v-if="popSettingsData.bankDialog.visible"
      :visible="popSettingsData.bankDialog.visible"
      :data="popSettingsData.bankDialog.data"
      title="申请退款-请选择退款账户"
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
.div-sum {
  margin-left: 10px;
  width: calc(100% - 20px);
  height: 35px;
  padding: 5px 5px;
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
  margin-left: 10px;
}
.el-table {
  margin: 10px;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import constants_bpm from '@/common/constants/constants_bpm'
import { getFlowProcessApi } from '@/api/40_business/bpmprocess/bpmprocess'
import BpmDialog from '@/components/60_bpm/submitBpmDialog.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import { getTypeApi, insertApi, validateApi, getApi } from '@/api/40_business/10_po/aprefund/aprefund'
import { selectListDataApi } from '@/api/10_system/dictdata/dictdata'
import PoOrderListTemplate from '@/views/40_business/10_po/poorder/dialog/listfor/aprefund/index.vue'
import bank_list_template from '@/views/20_master/bankaccounts/dialog/list/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import { getPurchaserApi } from '@/api/20_master/bankaccounts/bankaccounts'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import previewCard from '@/components/50_preview_card/preview_card.vue'
export default {
  directives: { elDragDialog },
  components: { numeric, PoOrderListTemplate, bank_list_template, BpmDialog, SimpleUploadMutilFile, previewCard },
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
      },
      popSettingsData: {
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          serial_type: constants_bpm.BPM_B_AP_REFUND,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        },

        // 付款管理弹窗(添加关联单号)
        apFundDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 企业银行账户弹窗
        bankDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 选中行索引
          rowIndex: null,
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
        // 单条数据 json
        tempJson: {
          // 应付账款信息字段（直接在tempJson下）
          ap_code: null,
          po_code: null,
          project_code: null,
          po_contract_id: null,
          po_contract_code: null,
          po_order_id: null,
          po_order_code: null,
          po_goods: null,
          advance_pay_amount: null,
          can_refunded_amount: null,
          refunded_amount: null,
          refunding_amount: null,
          order_amount: null,
          remark: null,
          // 退款附件材料
          doc_att_files: [],

          // 银行账户信息（单个对象）
          bankData: {
            // 银行账户基本信息
            name: null, // 退款账户
            bank_name: null, // 开户行
            account_number: null, // 银行账户
            bank_type_name: null, // 类型名称
            bank_accounts_id: null, // 银行账户ID
            bank_accounts_code: null, // 银行账户编码
            bank_accounts_type_id: null, // 银行账户类型ID
            bank_accounts_type_code: null, // 银行账户类型编码

            // 金额相关
            order_amount: null, // 付款金额
            payable_amount: 0, // 应付金额
            detail_refund_amount: null, // 退款总金额

            // 其他
            remark: null // 备注
          },
          type: null
        },
        searchForm: {
          reset: false
        },
        inputSettings: {
          maxLength: {
            remark: 100
          }
        },
        // 退款附件材料
        refund_doc_att: [],
        refund_doc_att_file: [],
        refund_doc_att_files: []
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
        btApDisabledStatus: {
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
          type: [
            { required: true, message: '请选择业务类型', trigger: 'change' }
          ],
          po_code: [
            { required: true, message: '请添加关联单号', trigger: 'change' }
          ],
          order_amount: [
            { required: true, message: '请输入本次申请退款金额', trigger: 'blur' },
            { type: 'number', min: 0.01, message: '本次申请退款金额必须大于0', trigger: 'blur' }
          ],
          'bankData.order_amount': [
            { required: true, message: '请输入退款金额', trigger: 'blur' },
            { type: 'number', min: 0.01, message: '退款金额必须大于0', trigger: 'blur' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    refundAmountSum () {
      // 获取银行账户的退款金额（单个对象）
      if (!this.dataJson.tempJson.bankData) return 0
      const val = Number(this.dataJson.tempJson.bankData.order_amount)
      return isNaN(val) ? 0 : val
    },
    // 计算业务类型是否禁用
    isBusinessTypeDisabled () {
      // 当有业务数据时,业务类型控件不可用
      return !!this.dataJson.tempJson.po_contract_code
    },
    // 计算重置清空页面按钮是否禁用
    isResetPageDisabled () {
      // 当有业务数据时,重置按钮可用
      return !this.dataJson.tempJson.po_contract_code
    },
    // 计算本次申请退款金额控件是否禁用
    isRefundAmountDisabled () {
      // 当有业务单据信息时启用
      return !this.dataJson.tempJson.po_contract_code
    },
    // 计算全额申请按钮是否禁用
    isFullAmountApplyDisabled () {
      // 当有业务单据信息时启用
      return !this.dataJson.tempJson.po_contract_code
    },
    // 计算切换账户按钮是否禁用
    isBankAccountSwitchDisabled () {
      // 当有业务数据时启用
      return !this.dataJson.tempJson.po_contract_code
    },
    // 计算退款金额控件是否禁用
    isBankRefundAmountDisabled () {
      // 当有银行账户数据时启用
      return !this.dataJson.tempJson.bankData.bank_accounts_id
    },
    // 计算全额退款按钮是否禁用
    isFullRefundDisabled () {
      // 当有银行账户数据时启用
      return !this.dataJson.tempJson.bankData.bank_accounts_id
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
    'dataJson.tempJson.order_amount': {
      handler (newVal, oldVal) {
        this.calculateRefundAmounts()
      },
      immediate: true
    },
    'dataJson.tempJson.bankData.order_amount': {
      handler: 'handleBankDataChange',
      deep: true,
      immediate: true
    }
  },
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
  },
  methods: {
    // 初始化处理
    async init () {
      // 初始化按钮
      this.initButtonShowStatus()
      this.initInsertModel()

      // 如果是编辑模式，加载数据
      if (this.editStatus === constants_para.STATUS_UPDATE && this.data) {
        await this.getData()
      }

      // 初始化业务类型
      this.initTypeList()

      // 初始化款项类型
      this.initBankTypeList()

      this.settings.loading = false
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btApDisabledStatus = this.$options.data.call(this).settings.btApDisabledStatus
      this.settings.btnBankDisabledStatus = this.$options.data.call(this).settings.btnBankDisabledStatus
    },
    // 初始化按钮状态
    initButtonShowStatusReset () {
      // 初始化按钮状态：重置为默认值
      this.settings.btApDisabledStatus.disabledInsert = true
      this.settings.btApDisabledStatus.disabledDelete = true
      this.settings.btnBankDisabledStatus.disabledInsert = true
      this.settings.btnBankDisabledStatus.disabledDelete = true
    },
    // 新增时的初始化
    initInsertModel () {
      // 数据初始化 - 直接从初始数据重置
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
    },
    // 获取数据（用于编辑模式）
    async getData () {
      this.settings.loading = true
      try {
        const response = await getApi(this.data)
        this.dataJson.tempJson = deepCopy(response.data)

        // 确保 bankData 结构存在
        if (!this.dataJson.tempJson.bankData) {
          this.dataJson.tempJson.bankData = {
            name: null,
            bank_name: null,
            account_number: null,
            bank_type_name: null,
            order_amount: null,
            remark: null
          }
        }

        // 如果有银行账户数据，映射到 bankData
        if (response.data.bankListData && response.data.bankListData.length > 0) {
          const bankInfo = response.data.bankListData[0]
          this.dataJson.tempJson.bankData = {
            name: bankInfo.name,
            bank_name: bankInfo.bank_name,
            account_number: bankInfo.account_number,
            bank_type_name: bankInfo.bank_type_name,
            order_amount: bankInfo.order_amount,
            remark: bankInfo.remark
          }
        }

        // 处理退款附件材料
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.refund_doc_att = response.data.doc_att_files
          this.dataJson.refund_doc_att_file = response.data.doc_att_files.map(file => file.url)
          this.dataJson.tempJson.doc_att_files = response.data.doc_att_files
        }

        // 计算退款总金额
        this.dataJson.tempJson.detail_refund_amount = this.dataJson.tempJson.bankData.order_amount
      } catch (error) {
        console.error('获取数据失败:', error)
        this.showErrorMsg('获取数据失败，请重试')
      } finally {
        this.settings.loading = false
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
          // 确保退款附件材料数据被包含
          tempData.doc_att_files = this.dataJson.refund_doc_att

          // 输出附件信息用于调试
          console.log('提交数据中的附件信息:', tempData.doc_att_files)

          if (!tempData.po_contract_code) {
            this.showErrorMsg('请选择采购订单')
            return
          }

          if (tempData.bankData == null) {
            this.showErrorMsg('请选择银行账户')
            return
          }

          // 1. 重新计算申请退款总金额：业务单据信息的本次申请退款金额
          let totalRefundAmount = 0
          if (tempData.po_contract_code && tempData.order_amount) {
            totalRefundAmount = parseFloat(tempData.order_amount) || 0
          }
          tempData.refundable_amount = totalRefundAmount
          this.dataJson.tempJson.refundable_amount = totalRefundAmount

          // 2. 重新计算退款总金额：退款账户信息的退款金额
          let totalDetailRefundAmount = 0
          if (tempData.bankData && tempData.bankData.order_amount) {
            totalDetailRefundAmount = parseFloat(tempData.bankData.order_amount) || 0
          }
          tempData.detail_refund_amount = totalDetailRefundAmount
          this.dataJson.tempJson.detail_refund_amount = totalDetailRefundAmount

          // 3. 校验退款总金额与申请退款总金额
          // 考虑浮点数精度问题，使用小的容差值进行比较
          console.log('校验金额 - 申请退款总金额:', totalRefundAmount)
          console.log('校验金额 - 退款总金额:', totalDetailRefundAmount)
          console.log('校验金额 - 差异:', Math.abs(totalDetailRefundAmount - totalRefundAmount))
          if ((totalDetailRefundAmount - totalRefundAmount) !== 0) {
            const errorMsg = `退款数据校验失败：请确保各账户退款金额之和与申请退款金额完全一致。申请退款总金额：${this.formatCurrency(totalRefundAmount, true)}，退款总金额：${this.formatCurrency(totalDetailRefundAmount, true)}`
            this.showErrorMsg(errorMsg)
            return
          }

          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_B_AP_REFUND_NEW_OK, _data.data)
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
    // 应付账款获取行索引（单对象模式下不需要索引）
    getApRowIndex (row) {
      return 0 // 单对象模式下索引始终为0
    },
    // 采购订单选择删除
    handleApDelete () {
      if (!this.dataJson.tempJson.po_contract_code) {
        this.showErrorMsg('没有可删除的数据')
        return
      }
      this.$confirm('是否确认删除该条数据', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 清空应付账款数据
        this.dataJson.tempJson.ap_code = null
        this.dataJson.tempJson.po_code = null
        this.dataJson.tempJson.project_code = null
        this.dataJson.tempJson.po_contract_id = null
        this.dataJson.tempJson.po_contract_code = null
        this.dataJson.tempJson.po_order_id = null
        this.dataJson.tempJson.po_order_code = null
        this.dataJson.tempJson.po_goods = null
        this.dataJson.tempJson.advance_pay_amount = null
        this.dataJson.tempJson.can_refunded_amount = null
        this.dataJson.tempJson.refunded_amount = null
        this.dataJson.tempJson.refunding_amount = null
        this.dataJson.tempJson.order_amount = null
        this.dataJson.tempJson.remark = null

        // 清空选中行索引
        this.popSettingsData.apDialog.rowIndex = null

        // 删除后设置按钮状态
        this.settings.btApDisabledStatus.disabledDelete = true
      }).catch(() => {
      })
    },
    // 添加关联单选择弹窗
    handleApFountInsert () {
      this.popSettingsData.apFundDialog.data = {
        supplier_id: this.dataJson.tempJson.supplier_id,
        supplier_name: this.dataJson.tempJson.supplier_name,
        supplier_code: this.dataJson.tempJson.supplier_code,
        purchaser_id: this.dataJson.tempJson.purchaser_id,
        purchaser_code: this.dataJson.tempJson.purchaser_code,
        purchaser_name: this.dataJson.tempJson.purchaser_name,
        enterprise_id: this.dataJson.tempJson.purchaser_id
      }

      this.popSettingsData.apFundDialog.visible = true
    },
    // 重置
    handleApFountRest () {
      // 数据重新初始化 - 直接从初始数据重置
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)
      // 控制按钮
      this.initButtonShowStatusReset()
    },
    // 添加关联单选择完成
    handlePoorderListCloseOk (val) {
      this.popSettingsData.apFundDialog.visible = false
      // 数据整合 - 根据用户需求映射弹窗数据到本页面数据
      this.dataJson.tempJson.po_contract_id = val.po_contract_id
      this.dataJson.tempJson.po_contract_code = val.po_contract_code
      this.dataJson.tempJson.po_order_id = val.po_order_id
      this.dataJson.tempJson.po_order_code = val.po_order_code
      this.dataJson.tempJson.type_name = val.type_name
      this.dataJson.tempJson.purchaser_name = val.purchaser_name
      this.dataJson.tempJson.purchaser_id = val.purchaser_id
      this.dataJson.tempJson.supplier_name = val.supplier_name
      this.dataJson.tempJson.supplier_id = val.supplier_id
      this.dataJson.tempJson.advance_paid_total = val.advance_paid_total
      this.dataJson.tempJson.advance_cancelpay_total = val.advance_cancelpay_total
      this.dataJson.tempJson.advance_refund_amount_total = val.advance_refund_amount_total
      this.dataJson.tempJson.order_amount = 0
      // 处理商品名称：将弹窗数据的list.goods_name转换成按逗号分割的一条数据
      if (val.detailListData && Array.isArray(val.detailListData) && val.detailListData.length > 0) {
        const goodsNames = val.detailListData.map(item => item.goods_name).filter(name => name)
        this.dataJson.tempJson.po_goods = goodsNames.join(',')
        this.dataJson.tempJson.bankData.po_goods = goodsNames.join(',')
      } else {
        this.dataJson.tempJson.po_goods = ''
        this.dataJson.tempJson.bankData.po_goods = ''
      }

      // 基本信息（保持原有逻辑）
      this.dataJson.tempJson.po_code = val.code
      this.dataJson.tempJson.project_code = val.project_code
      this.dataJson.tempJson.supplier_code = val.supplier_code
      this.dataJson.tempJson.purchaser_code = val.purchaser_code
      this.dataJson.tempJson.enterprise_id = val.purchaser_id

      // 设置应付账款信息（直接在tempJson下）
      this.dataJson.tempJson.ap_code = val.code
      this.dataJson.tempJson.advance_pay_amount = val.payable_amount
      this.dataJson.tempJson.can_refunded_amount = val.can_refunded_amount
      this.dataJson.tempJson.refunded_amount = val.refunded_amount
      this.dataJson.tempJson.refunding_amount = val.refunding_amount
      this.dataJson.tempJson.order_amount = 0
      this.dataJson.tempJson.remark = null

      // 数据已经直接设置到tempJson中，不需要额外操作

      // 查询主体企业是否有默认账户，继续绑定json数据
      this.queryBuyerEnterpriseBankAccount(this.dataJson.tempJson.enterprise_id)

      // 强制更新computed属性以确保响应式更新
      this.$nextTick(() => {
        this.$forceUpdate()
      })

      this.$notify({
        title: '添加关联单处理成功',
        message: '添加关联单处理成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 添加关联单选择关闭
    handleApFountCloseCancel () {
      this.popSettingsData.apFundDialog.visible = false
      // 弹窗取消时，重置业务类型选择
      this.dataJson.tempJson.type = null
    },
    // 查询主体企业是否有默认账户
    queryBuyerEnterpriseBankAccount (enterprise_id) {
      getPurchaserApi({ enterprise_id: enterprise_id })
        .then(_data => {
          if (_data.data != null) {
            // 设置到bankData对象，用于退款账户描述列表显示
            this.dataJson.tempJson.bankData.name = _data.data.name
            this.dataJson.tempJson.bankData.bank_name = _data.data.bank_name
            this.dataJson.tempJson.bankData.account_number = _data.data.account_number
            this.dataJson.tempJson.bankData.bank_accounts_id = _data.data.id
            this.dataJson.tempJson.bankData.bank_accounts_code = _data.data.code

            // 直接从API返回数据设置款项类型信息
            this.dataJson.tempJson.bankData.bank_accounts_type_id = _data.data.bank_accounts_type_id
            this.dataJson.tempJson.bankData.bank_accounts_type_code = _data.data.bank_accounts_type_code
            this.dataJson.tempJson.bankData.bank_type_name = _data.data.bank_type_name

            // 初始化退款金额为0
            this.dataJson.tempJson.bankData.order_amount = 0
            this.dataJson.tempJson.bankData.remark = null

            // 同步银行账户数据
            this.syncBankDataToTempJson()

            // 强制更新computed属性以确保响应式更新
            this.$nextTick(() => {
              this.$forceUpdate()
            })
          } else {
            // 没有默认账户时，按钮状态由监听器和computed属性控制
            console.log('没有默认账户')
          }
        }).catch(_error => {
          this.showErrorMsg(_error.error.message)
        })
    },
    // 企业银行账户弹窗
    handleBankInsert () {
      // 根据业务类型设置bank_type数组
      let bankType = []
      if (this.dataJson.tempJson.type === constants_dict.DICT_B_AP_REFUND_TYPE_ONE) {
        // 应付
        bankType = [constants_dict.DICT_M_BANK_TYPE_ONE]
      } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AP_REFUND_TYPE_TWO) {
        // 预付
        bankType = [constants_dict.DICT_M_BANK_TYPE_TWO]
      } else if (this.dataJson.tempJson.type === constants_dict.DICT_B_AP_REFUND_TYPE_THREE) {
        // 其他支出
        bankType = [constants_dict.DICT_M_BANK_TYPE_THREE]
      }

      this.popSettingsData.bankDialog.data = {
        accounts_purpose_type: constants_dict.DICT_M_BANK_TYPE_ONE,
        enterprise_code: this.dataJson.tempJson.purchaser_code,
        enterprise_name: this.dataJson.tempJson.purchaser_name,
        bank_type: bankType
      }

      this.popSettingsData.bankDialog.visible = true
    },
    // 企业银行账户选中
    handleBankRowClick (row) {
      this.popSettingsData.bankDialog.rowIndex = this.getBankRowIndex(row)
    },
    // 企业银行账户获取行索引（单对象模式下不需要索引）
    getBankRowIndex (row) {
      return 0 // 单对象模式下索引始终为0
    },
    // 企业银行按钮
    handleBankCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getBankRowIndex(row)
      this.settings.btnBankDisabledStatus.disabledDelete = false
    },
    // 企业银行选择完成
    handleBankCloseOk (val) {
      // 更新bankData对象（用于页面显示）
      this.dataJson.tempJson.bankData.name = val.name
      this.dataJson.tempJson.bankData.bank_name = val.bank_name
      this.dataJson.tempJson.bankData.account_number = val.account_number
      this.dataJson.tempJson.bankData.bank_accounts_id = val.id
      this.dataJson.tempJson.bankData.bank_accounts_code = val.code

      // 直接从API返回数据设置款项类型信息
      this.dataJson.tempJson.bankData.bank_accounts_type_id = val.bank_accounts_type_id
      this.dataJson.tempJson.bankData.bank_accounts_type_code = val.bank_accounts_type_code
      this.dataJson.tempJson.bankData.bank_type_name = val.bank_type_name

      // 初始化付款金额
      this.dataJson.tempJson.bankData.order_amount = 0
      this.dataJson.tempJson.bankData.remark = null

      // 同步银行账户数据到tempJson
      this.syncBankDataToTempJson()

      // 强制更新computed属性以确保响应式更新
      this.$nextTick(() => {
        this.$forceUpdate()
      })

      this.popSettingsData.bankDialog.visible = false

      this.$notify({
        title: '切换账户成功',
        message: '切换账户成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 企业银行选择关闭
    handleBankCloseCancel () {
      this.popSettingsData.bankDialog.visible = false
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
      console.log('开始初始化业务类型数据...')
      getTypeApi().then(response => {
        console.log('业务类型API响应:', response)
        if (response.data && response.data.length > 0) {
          // 将API返回的数据映射为模板需要的格式
          this.dataJson.typeListDate = response.data.map(item => {
            return {
              dict_id: item.id || item.dict_id, // 映射id字段为dict_id
              dict_label: item.name || item.dict_label || item.label, // 映射name/label字段为dict_label
              checked: false // 默认未选中
            }
          })
          console.log('业务类型数据初始化成功:', this.dataJson.typeListDate)
        } else {
          console.warn('业务类型数据为空')
          this.showErrorMsg('业务类型数据为空,请联系管理员')
        }
      }).catch(error => {
        console.error('获取业务类型数据失败:', error)
        this.showErrorMsg('获取业务类型数据失败,请联系管理员')
      })
    },
    // 初始化款项类型
    initBankTypeList () {
      const _this = this
      const params = {
        dictTypeCode: constants_dict.DICT_M_BANK_TYPE,
        is_del: 0
      }
      selectListDataApi(params).then(response => {
        if (response.data.length !== 0) {
          _this.dataJson.bankTypeListDate = _this.dataJson.bankTypeListDate.concat(response.data)
        } else {
          this.showErrorMsg('款项类型数据为空,请联系管理员')
        }
      })
    },
    // 计算申请退款相关金额
    calculateRefundAmounts () {
      // 1. 申请退款总金额：业务单据信息的本次申请退款金额
      let totalRefundAmount = 0
      if (this.dataJson.tempJson.order_amount) {
        totalRefundAmount = parseFloat(this.dataJson.tempJson.order_amount) || 0
      }

      // 设置申请退款总金额
      this.dataJson.tempJson.refundable_amount = totalRefundAmount

      // 2. 已退款总金额：设置为null（显示为"-"）
      this.dataJson.tempJson.refunded_amount = null

      // 3. 未退款总金额：等于申请退款总金额
      this.dataJson.tempJson.unrefund_amount = totalRefundAmount

      // 4. 退款中金额：设置为null（显示为"-"）
      this.dataJson.tempJson.refunding_amount = null

      console.log('计算金额 - 申请退款总金额:', totalRefundAmount)
    },
    // 计算退款账户信息的退款总金额
    calculateDetailRefundAmount () {
      // 退款总金额：使用bankData中的order_amount（对应AP模块的退款金额）
      const totalDetailRefundAmount = parseFloat(this.dataJson.tempJson.bankData.order_amount) || 0

      // 设置退款总金额到bankData和tempJson
      this.dataJson.tempJson.bankData.detail_refund_amount = totalDetailRefundAmount
      this.dataJson.tempJson.detail_refund_amount = totalDetailRefundAmount

      console.log('计算金额 - 退款总金额:', totalDetailRefundAmount)
    },
    // 申请金额变化验证
    handleRefundAmountChange (row) {
      // 处理本次申请金额变化
      if (row.order_amount && row.can_refunded_amount && row.order_amount > row.can_refunded_amount) {
        row.order_amount = 0
        this.showErrorMsg('输入错误：输入的申请金额需要小于等于可退金额')
        // 清空错误的输入
        this.$nextTick(() => {
          row.order_amount = null
        })
        return
      }

      // 触发金额重新计算
      this.calculateRefundAmounts()
    },
    /**
     * 处理全额申请：本次申请退款金额=可退金额
     * @param val
     */
    handleFullAmountApply (val) {
      // 本次申请退款金额=可退金额（页面显示的advance_refund_amount_total）
      val.order_amount = this.dataJson.tempJson.advance_refund_amount_total || 0
      // 触发金额重新计算
      this.calculateRefundAmounts()
    },
    // 申请金额填写（保持向后兼容）
    handlePoOrderCheck (val) {
      this.handleRefundAmountChange(val)
    },
    // 银行账户退款金额变化验证
    handleBankRefundAmountChange (row) {
      // 请添加关联单号
      if (!this.dataJson.tempJson.po_contract_code) {
        this.dataJson.tempJson.bankData.order_amount = 0
        this.showErrorMsg('请添加业务单据信息')
        return
      }

      // 处理银行账户退款金额变化，校验退款金额不能超过申请退款总金额
      const maxRefundAmount = this.dataJson.tempJson.refundable_amount || 0
      if (this.dataJson.tempJson.bankData.order_amount && maxRefundAmount && this.dataJson.tempJson.bankData.order_amount > maxRefundAmount) {
        this.dataJson.tempJson.bankData.order_amount = 0
        this.showErrorMsg('输入错误：输入的退款金额需要小于等于申请退款总金额')
        // 清空错误的输入
        this.$nextTick(() => {
          this.dataJson.tempJson.bankData.order_amount = null
        })
        return
      }

      // 触发金额重新计算
      this.calculateDetailRefundAmount()
    },
    /**
     * 处理全额退款：退款金额=申请退款总金额
     * @param val 当前行数据
     */
    handleBankFullAmountApply (val) {
      console.log('全额退款按钮点击事件触发', val)

      // 请添加关联单号
      if (!this.dataJson.tempJson.po_contract_code) {
        this.$message.warning('请先添加业务单据信息')
        return
      }

      // 设置当前银行账户的退款金额为申请退款总金额
      this.dataJson.tempJson.bankData.order_amount = this.dataJson.tempJson.refundable_amount || 0

      // 触发退款总金额重新计算
      this.calculateDetailRefundAmount()
    },
    handleBankDataChange (newVal, oldVal) {
      // 当银行账户数据发生变化时的处理逻辑
      this.calculateDetailRefundAmount()

      // 同步数据到tempJson
      this.syncBankDataToTempJson()

      // 如果没有付款金额，删除按钮不可用
      if (!newVal) {
        this.settings.btnBankDisabledStatus.disabledDelete = true
      }
    },
    // 付款金额填写（保持向后兼容）
    handleBankCheck (val) {
      this.handleBankRefundAmountChange(val)
    },
    handleTypeChange (val) {
      // 当选择预付款退款时，弹出选择弹窗
      if (val === constants_dict.DICT_B_AP_TYPE_TWO) {
        this.handleApFountInsert()
      }

      // 如果有银行账户信息，根据业务类型更新款项类型
      if (this.dataJson.tempJson.bankData.name) {
        // 银行账户付款类型赋值
        for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
          const element = this.dataJson.bankTypeListDate[i]
          if (val === constants_dict.DICT_B_AP_TYPE_ONE &&
            element.code === constants_dict.DICT_M_BANK_TYPE_THREE) {
            this.dataJson.tempJson.bankData.bank_accounts_type_id = element.id
            this.dataJson.tempJson.bankData.bank_accounts_type_code = element.code
            this.dataJson.tempJson.bankData.bank_type_name = element.name
            break
          } else if (val === constants_dict.DICT_B_AP_TYPE_TWO &&
            element.code === constants_dict.DICT_M_BANK_TYPE_ONE) {
            this.dataJson.tempJson.bankData.bank_accounts_type_id = element.id
            this.dataJson.tempJson.bankData.bank_accounts_type_code = element.code
            this.dataJson.tempJson.bankData.bank_type_name = element.name
            break
          } else if (val === constants_dict.DICT_B_AP_TYPE_THREE) {
            this.dataJson.tempJson.bankData.bank_accounts_type_id = element.id
            this.dataJson.tempJson.bankData.bank_accounts_type_code = element.code
            this.dataJson.tempJson.bankData.bank_type_name = element.name
            break
          }
        }
        // 重置金额和备注
        this.dataJson.tempJson.bankData.order_amount = 0
        this.dataJson.tempJson.bankData.remark = null
      }
    },
    // 处理退款金额变化
    handlePayableAmountChange (val) {
      // 触发金额重新计算
      this.calculateDetailRefundAmount()
    },
    // 同步bankData到tempJson.bankData以保持数据一致性
    syncBankDataToTempJson () {
      // bankData现在已经在tempJson下，只需要同步detail_refund_amount到顶级
      if (this.dataJson.tempJson.bankData) {
        this.dataJson.tempJson.detail_refund_amount = this.dataJson.tempJson.bankData.detail_refund_amount
      }
    },
    // 退款附件上传成功
    handleRefundUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.refund_doc_att.push(res.response.data)
      this.dataJson.refund_doc_att_file.push(res.response.data.url)
      this.dataJson.tempJson.doc_att_files = this.dataJson.refund_doc_att
    },
    // 退款附件文件移除
    removeRefundFile (val) {
      // 获取下标
      const _index = this.dataJson.refund_doc_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.refund_doc_att.splice(_index, 1)
      this.dataJson.refund_doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.doc_att_files = this.dataJson.refund_doc_att
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
