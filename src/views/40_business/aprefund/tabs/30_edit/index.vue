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
              <el-radio-group v-model="dataJson.tempJson.type">
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
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              添加关联单号
            </div>
            <el-button-group>
              <el-button
                v-model="dataJson.tempJson.po_code"
                type="primary"
                size="mini"
                @click="handleApFountInsert"
              >添加关联单号</el-button>
              <el-button @click="handleApFountRest">重置</el-button>
            </el-button-group>
          </el-descriptions-item>

          <el-descriptions-item label="主体企业（付款方）">
            <el-form-item
              prop="purchaser_name"
              label-width="0"
            >
              {{ dataJson.tempJson.buyer_enterprise_name }}

              <!--              <input-search-->
              <!--                v-model.trim="dataJson.tempJson.purchaser_name"-->
              <!--                @onInputSearch="handlePurchaserDialog"-->
              <!--              />-->
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="供应商（收款方）">
            <el-form-item
              prop="supplier_name"
              label-width="0"
            >
              {{ dataJson.tempJson.supplier_enterprise_name }}

              <!--              <input-search-->
              <!--                v-model.trim="dataJson.tempJson.supplier_name"-->
              <!--                @onInputSearch="handleSupplierDialog"-->
              <!--              />-->
            </el-form-item>
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

        <el-button-group>
          <el-button
            :disabled="settings.btnApDisabledStatus.disabledInsert"
            type="primary"
            icon="el-icon-circle-plus-outline"
            :loading="settings.loading"
            @click="handleApInsert"
          >添加</el-button>
          <el-button
            :disabled="settings.btnApDisabledStatus.disabledDelete"
            type="primary"
            icon="el-icon-circle-close"
            :loading="settings.loading"
            @click.native="handleApDelete"
          >删除</el-button>
        </el-button-group>

        <br>
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
          style="width: 100%"
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
            min-width="130"
            prop="po_contract_code"
            label="合同编号"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="po_code"
            label="订单编号"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="po_goods"
            label="商品"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="advance_pay_amount"
            label="预付款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.advance_pay_amount == null? '': formatNumber(scope.row.advance_pay_amount, true,4) }}
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="refunded_amount"
            label="已退金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.refunded_amount == null? '': formatNumber(scope.row.refunded_amount, true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="refunding_amount"
            label="退款中金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.refunding_amount == null? '': formatNumber(scope.row.refunding_amount, true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="can_refunded_amount"
            label="可退金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.can_refunded_amount == null? '': formatNumber(scope.row.can_refunded_amount, true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="refund_amount"
            label="本次申请金额"
            align="right"
          >
            <template v-slot="scope">
              <numeric
                v-model="scope.row.refund_amount"
                :decimal-places="2"
                :currency-symbol="''"
                @change.native="handlePoOrderCheck(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
            align="right"
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

        <br>
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.bankListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: 100%"
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
            align="right"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="refund_amount"
            label="付款金额"
            align="right"
          >
            <template v-slot="scope">
              <numeric
                v-model="scope.row.refund_amount"
                :decimal-places="2"
                :currency-symbol="''"
                @change.native="handleBankCheck(scope.row)"
              />
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
            align="right"
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

    <!--采购订单-列表弹窗-->
    <ap-list-template
      v-if="popSettingsData.apDialog.visible"
      :visible="popSettingsData.apDialog.visible"
      :data="popSettingsData.apDialog.data"
      title="添加关联单-采购订单"
      @closeMeOk="handleApCloseOk"
      @closeMeCancel="handleApCloseCancel"
    />

    <!--(关联单号)付款管理-列表弹窗-->
    <ap-list-template
      v-if="popSettingsData.apFundDialog.visible"
      :visible="popSettingsData.apFundDialog.visible"
      :data="popSettingsData.apFundDialog.data"
      title="添加关联单-采购预付款"
      @closeMeOk="handleApFountCloseOk"
      @closeMeCancel="handleApFountCloseCancel"
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
import { getTypeApi, getDetailApi, validateApi, updateApi } from '@/api/40_business/aprefund/aprefund'
import bank_list_template from '@/views/20_master/bankaccounts/dialog/list/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import { getPurchaser } from '@/api/20_master/bankaccounts/bankaccounts'
import ApListTemplate from '@/views/40_business/ap/dialog/list/index.vue'
export default {
  directives: { elDragDialog },
  components: { ApListTemplate, numeric, bank_list_template, BpmDialog },
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
      popSettingsData: {
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          serial_type: constants_dict.DICT_B_AP_REFUND,
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        },
        // 付款管理弹窗弹窗
        apDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
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
          project_code: null,
          supplier_enterprise_code: null,
          supplier_enterprise_name: null,
          // 采购订单
          poOrderListData: [],
          // 银行账户
          bankListData: [],
          // 类型
          type: constants_dict.DICT_B_AP_REFUND_TYPE_TWO,
          detailListData: [],
          // 申请退款总金额
          refund_amount: null,
          // 未退款总金额
          not_pay_amount: null,
          // 已退款总金额
          refunded_amount: null,
          // 退款中金额
          refunding_amount: null,
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
        btnApDisabledStatus: {
          disabledInsert: false,
          disabledDelete: true
        },
        // 企业银行账户按钮状态：是否可用，false:可用，true不可用
        btnBankDisabledStatus: {
          disabledInsert: false,
          disabledDelete: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {
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
  },
  methods: {
    // 初始化处理
    async init () {
      // 初始化按钮
      this.initButtonShowStatus()
      this.initUpdateModel()
      // 初始化业务类型
      this.initTypeList()

      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnApDisabledStatus = this.$options.data.call(this).settings.btnApDisabledStatus
      this.settings.btnBankDisabledStatus = this.$options.data.call(this).settings.btnBankDisabledStatus
    },
    // 新增时的初始化
    initUpdateModel () {
      this.getData()
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getDetailApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.poOrderListData = [...response.data.poOrderListData]
        this.dataJson.tempJson.bankListData = [...response.data.bankListData]

        // 修改时的可退金额 = 可退款金额 + 申请金额
        this.dataJson.tempJson.poOrderListData.forEach(element => {
          element.can_refunded_amount = element.refund_amount + element.refunded_amount
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 新增
    doUpdate () {
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
          updateApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_B_AP_UPDATE_OK, _data.data)
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
    handleApInsert () {
      this.popSettingsData.apDialog.data = {
        purchaser_code: this.dataJson.tempJson.buyer_enterprise_code,
        purchaser_name: this.dataJson.tempJson.buyer_enterprise_name,
        supplier_code: this.dataJson.tempJson.supplier_enterprise_code,
        supplier_name: this.dataJson.tempJson.supplier_enterprise_name
      }
      this.popSettingsData.apDialog.visible = true
    },
    // 采购订单选中
    handlePoOrderRowClick (row) {
      this.popSettingsData.apDialog.rowIndex = this.getPoOrderRowIndex(row)
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
      this.settings.btnApDisabledStatus.disabledDelete = false
    },
    // 采购订单选择完成
    handleApCloseOk (val) {
      this.popSettingsData.apDialog.visible = false

      // 设置到table中绑定的业务单据信息
      const tempData = {}
      tempData.po_code = val.code
      tempData.project_code = val.project_code
      tempData.po_contract_code = val.po_contract_code
      tempData.po_goods = val.goods_name
      tempData.po_qty = val.order_total
      tempData.po_amount = val.order_amount_sum
      tempData.po_advance_payment_amount = 0
      tempData.po_can_advance_payment_amount = val.po_can_advance_payment_amount
      // tempData.order_amount = 0
      tempData.remark = null

      if (this.dataJson.tempJson.poOrderListData.find(item => item.po_code === tempData.po_code)) {
        this.showErrorMsg('您选择的数据已经在表格中，添加失败！')
        return false
      }

      this.dataJson.tempJson.poOrderListData.push(tempData)

      this.$notify({
        title: '新增处理成功',
        message: '新增处理成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 采购订单选择关闭
    handleApCloseCancel () {
      this.popSettingsData.apDialog.visible = false
    },
    // 采购订单选择删除
    handleApDelete () {
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
        this.$nextTick(() => {
          this.settings.btnApDisabledStatus.disabledDelete = true
          this.settings.btnApDisabledStatus.disabledInsert = false
          // 设置到table中绑定的json数据源
          this.dataJson.tempJson.poOrderListData.splice(this.popSettingsData.apDialog.rowIndex, 1)
        })
      }).catch(action => {
        this.settings.btnApDisabledStatus.disabledDelete = false
      })
    },
    // 添加关联单选择弹窗
    handleApFountInsert () {
      this.popSettingsData.apFundDialog.data = {
        purchaser_code: this.dataJson.tempJson.buyer_enterprise_code,
        purchaser_name: this.dataJson.tempJson.buyer_enterprise_name,
        supplier_code: this.dataJson.tempJson.supplier_enterprise_code,
        supplier_name: this.dataJson.tempJson.supplier_enterprise_name
      }
      this.popSettingsData.apFundDialog.visible = true
    },
    // 重置
    handleApFountRest () {
      // 数据重新初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
      // 控制按钮
      this.initButtonShowStatus()
    },
    // 添加关联单选择完成
    handleApFountCloseOk (val) {
      this.popSettingsData.apFundDialog.visible = false

      // 基本信息（添加关联单号）
      this.dataJson.tempJson.po_code = val.code
      this.dataJson.tempJson.project_code = val.project_code
      this.dataJson.tempJson.po_contract_code = val.po_contract_code
      this.dataJson.tempJson.supplier_enterprise_code = val.supplier_enterprise_code
      this.dataJson.tempJson.supplier_enterprise_name = val.supplier_enterprise_name
      this.dataJson.tempJson.supplier_enterprise_version = val.supplier_enterprise_version
      this.dataJson.tempJson.buyer_enterprise_code = val.buyer_enterprise_code
      this.dataJson.tempJson.buyer_enterprise_name = val.buyer_enterprise_name
      this.dataJson.tempJson.buyer_enterprise_version = val.buyer_enterprise_version

      // 设置到table中绑定的业务单据信息
      const tempData = {}
      tempData.ap_id = val.id
      tempData.ap_code = val.code
      tempData.po_code = val.po_code
      tempData.project_code = val.project_code
      tempData.po_contract_code = val.po_contract_code
      tempData.po_goods = val.poOrderListData[0].po_goods
      tempData.advance_pay_amount = val.payable_amount
      tempData.can_refunded_amount = val.can_refunded_amount
      tempData.refunded_amount = 0
      tempData.refund_amount = 0
      tempData.refunding_amount = 0
      tempData.remark = null

      if (this.dataJson.tempJson.poOrderListData.find(item => item.po_code === tempData.po_code)) {
        this.showErrorMsg('您选择的数据已经在表格中，添加失败！')
        return false
      }

      if (this.dataJson.tempJson.poOrderListData.length > 0) {
        this.showErrorMsg('只能选择一条数据！')
        return false
      }

      this.dataJson.tempJson.poOrderListData.push(tempData)

      // todo 计算未付款总金额
      this.dataJson.tempJson.not_pay_amount = 0
      this.dataJson.tempJson.poOrderListData.forEach(element => {
        this.dataJson.tempJson.not_pay_amount += element.can_refunded_amount
      })

      // 查询主体企业是否有默认账户
      this.queryPurchaserBankAccount(val.buyer_enterprise_code)

      this.$notify({
        title: '添加关联单处理成功',
        message: '添加关联单处理成功',
        type: 'success',
        duration: this.settings.duration
      })
    },
    // 查询主体企业是否有默认账户
    queryPurchaserBankAccount (buyer_enterprise_code) {
      getPurchaser({ enterprise_code: buyer_enterprise_code })
        .then(_data => {
          if (_data.data != null) {
            const tempData = {}
            tempData.name = _data.data.name
            tempData.bank_name = _data.data.bank_name
            tempData.account_number = _data.data.account_number
            tempData.bank_accounts_id = _data.data.id
            tempData.bank_accounts_code = _data.data.code
            // tempData.bank_accounts_purpose_id = _data.data.bank_accounts_purpose_id
            // tempData.bank_accounts_purpose_code = _data.data.bank_accounts_purpose_code
            // tempData.accounts_purpose_type_name = _data.data.accounts_purpose_type_name

            // todo 款项类型
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

            tempData.refunded_amount = 0
            tempData.refund_amount = 0
            tempData.remark = null
            this.dataJson.tempJson.bankListData = []
            this.dataJson.tempJson.bankListData.push(tempData)
          } else {
            // 控制按钮
            this.settings.btnBankDisabledStatus.disabledInsert = false
          }
        })
    },
    // 添加关联单选择关闭
    handleApFountCloseCancel () {
      this.popSettingsData.apFundDialog.visible = false
    },
    // 企业银行账户弹窗
    handleBankInsert () {
      this.popSettingsData.bankDialog.data = {
        accounts_purpose_type: constants_dict.DICT_M_BANK_TYPE_ONE,
        enterprise_code: this.dataJson.tempJson.buyer_enterprise_code,
        enterprise_name: this.dataJson.tempJson.buyer_enterprise_name }

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
      this.popSettingsData.bankDialog.visible = false
      // 设置到table中绑定的json数据源
      this.dataJson.tempJson.bankListData.push(val.data)

      this.$notify({
        title: '新增处理成功',
        message: val.data.message,
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
        // 设置到table中绑定的json数据源
        this.dataJson.tempJson.bankListData.splice(this.popSettingsData.bankDialog.rowIndex, 1)

        // this.dataJson.tempJson.contract_amount_sum = 0
        // this.dataJson.tempJson.contract_total = 0
        // this.dataJson.tempJson.tax_amount_sum = 0
        // this.dataJson.tempJson.detailListData.forEach(element => {
        //   this.dataJson.tempJson.contract_amount_sum += element.qty * element.price
        //   this.dataJson.tempJson.contract_total += element.qty
        //   this.dataJson.tempJson.tax_amount_sum += element.tax_amount
        // })

        this.dataJson.tempJson.detail_payable_amount = '-'
        this.settings.btnBankDisabledStatus.disabledDelete = true
        this.settings.btnBankDisabledStatus.disabledInsert = false
      }).catch(action => {

      })
    },
    // 供应商
    handleSupplierDialog () {
      this.popSettingsData.supplierDialogData.visible = true
      this.popSettingsData.supplierDialogData.data.status = constants_dict.DICT_M_ENTERPRISE_STATUS_TWO
    },
    // 供应商：关闭对话框：确定
    handleSupplierCloseOk (val) {
      this.popSettingsData.supplierDialogData.selectedDataJson = val
      this.dataJson.tempJson.supplier_id = val.id
      this.dataJson.tempJson.supplier_code = val.code
      this.dataJson.tempJson.supplier_name = val.name
      this.popSettingsData.supplierDialogData.visible = false
    },
    // 校验数据 获取审批流程
    startProcess () {
      this.showLoading('正在查询，请稍后...')
      // 校验业务数据
      const tempData = deepCopy(this.dataJson.tempJson)
      tempData.check_type = constants_para.UPDATE_CHECK_TYPE

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
            this.popSettingsData.sponsorDialog.form_data = { }
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
      this.doUpdate()
    },
    // 初始化业务类型
    initTypeList () {
      const _this = this
      getTypeApi().then(response => {
        _this.dataJson.typeListDate = _this.dataJson.typeListDate.concat(response.data)
        _this.dataJson.typeListDate.forEach(item => {
          item.checked = false
        })
      })
    },
    // 申请金额填写
    handlePoOrderCheck (val) {
      // 申请金额不能大于可申请预付款金额
      if (val.can_refunded_amount < val.refund_amount) {
        val.refund_amount = null
        this.showErrorMsg('申请金额不能大于可申请预付款金额')
      }

      // 计算申请金额总金额
      this.dataJson.tempJson.refund_amount = val.refund_amount
      this.dataJson.tempJson.can_refund_amount = val.refund_amount

      if (this.dataJson.tempJson.bankListData != null) {
        this.dataJson.tempJson.bankListData[0].refund_amount = val.refund_amount
        this.dataJson.tempJson.detail_payable_amount = val.refund_amount
        this.dataJson.tempJson.not_pay_amount = val.refund_amount
      }
    },
    // 申请金额填写
    handleBankCheck (val) {
      // 请添加关联单号
      if (this.dataJson.tempJson.poOrderListData == null || this.dataJson.tempJson.poOrderListData.length === 0) {
        val.refund_amount = null
        this.showErrorMsg('请添加业务单据信息')
        return
      }

      // 申请金额不能大于可申请预付款金额
      if (this.dataJson.tempJson.poOrderListData[0].can_refunded_amount < val.refund_amount) {
        val.refund_amount = null
        this.showErrorMsg('申请金额不能大于可申请预付款金额')
      }

      this.dataJson.tempJson.refund_amount = val.refund_amount
      this.dataJson.tempJson.can_refund_amount = val.refund_amount

      // 计算付款金额总金额
      this.dataJson.tempJson.poOrderListData[0].refund_amount = val.refund_amount
      this.dataJson.tempJson.refund_amount = val.refund_amount
      this.dataJson.tempJson.detail_payable_amount = val.refund_amount
      this.dataJson.tempJson.not_pay_amount = val.refund_amount
    },
    handleTypeChange (val) {
      if (this.dataJson.tempJson.bankListData[0] != null) {
        const tempData = this.dataJson.tempJson.bankListData[0]
        // 银行账户付款类型赋值
        for (let i = 0; i < this.dataJson.bankTypeListDate.length; i++) {
          const element = this.dataJson.bankTypeListDate[i]
          if (val === constants_dict.DICT_B_AP_TYPE_ONE &&
            element.code === constants_dict.DICT_M_BANK_TYPE_THREE) {
            tempData.bank_accounts_type_id = element.id
            tempData.bank_accounts_type_code = element.code
            tempData.accounts_purpose_type_name = element.name
            break
          } else if (val === constants_dict.DICT_B_AP_TYPE_TWO &&
            element.code === constants_dict.DICT_M_BANK_TYPE_ONE) {
            tempData.bank_accounts_type_id = element.id
            tempData.bank_accounts_type_code = element.code
            tempData.accounts_purpose_type_name = element.name
            break
          } else if (val === constants_dict.DICT_B_AP_TYPE_THREE) {
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
    }
  }

}
</script>
