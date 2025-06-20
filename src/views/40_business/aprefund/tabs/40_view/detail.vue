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
            {{ dataJson.tempJson.type_name == null ? '-': dataJson.tempJson.type_name }}
          </el-descriptions-item>
          <el-descriptions-item label="关联单号">
            {{ dataJson.tempJson.po_code == null ? '-': dataJson.tempJson.po_code }}
          </el-descriptions-item>

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

          <el-descriptions-item label="退款状态">
            {{ dataJson.tempJson.pay_status_name == null ? '-': dataJson.tempJson.pay_status_name }}
          </el-descriptions-item>

          <el-descriptions-item label="备注">
            {{ dataJson.tempJson.remark == null ? '-': dataJson.tempJson.remark }}
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
              {{ scope.row.refund_amount == null? '': formatNumber(scope.row.refund_amount, true,4) }}
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
              {{ scope.row.remark == null? '': formatNumber(scope.row.remark, true,4) }}
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
              {{ scope.row.refund_amount == null? '': formatNumber(scope.row.refund_amount, true,4) }}
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
              {{ scope.row.remark == null? '': formatNumber(scope.row.remark, true,4) }}
            </template>
          </el-table-column>
        </el-table>

      </el-form>
    </div>
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
import { getDetailApi } from '@/api/40_business/aprefund/aprefund'
export default {
  directives: { elDragDialog },
  components: { },
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
        // 供应商
        supplierDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 主体企业
        purchaserDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
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
          }
        },
        // 采购订单弹窗(添加关联单号)
        poOrderFountDialog: {
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
          type: constants_dict.DICT_B_AP_TYPE_TWO,
          detailListData: [],
          // 申请退款总金额
          refund_amount: 0,
          // 未退款总金额
          not_pay_amount: 0,
          // 已退款总金额
          refunded_amount: 0,
          // 退款中金额
          refunding_amount: 0,
          // 付款信息付款总额
          detail_payable_amount: 0
        },
        // 单条数据 json
        tempJson: {
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
      this.getData()
      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnShowStatus = this.$options.data.call(this).settings.btnShowStatus
      this.settings.btnPoOrderDisabledStatus = this.$options.data.call(this).settings.btnPoOrderDisabledStatus
      this.settings.btnBankDisabledStatus = this.$options.data.call(this).settings.btnBankDisabledStatus
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getDetailApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.poOrderListData = [...response.data.poOrderListData]
        this.dataJson.tempJson.bankListData = [...response.data.bankListData]

        this.dataJson.tempJson.detail_payable_amount = this.dataJson.tempJson.bankListData[0].refund_amount
      }).finally(() => {
        this.settings.loading = false
      })
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
    }
  }

}
</script>
