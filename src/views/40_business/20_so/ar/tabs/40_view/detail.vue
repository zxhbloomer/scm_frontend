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

        <!-- 作废区域 -->
        <el-alert
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_AR_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_AR_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_AR_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_AR_STATUS_FIVE"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="作废理由" :span="3">
            {{ dataJson.tempJson.cancel_reason }}
          </el-descriptions-item>
          <el-descriptions-item label="作废附件" :span="3">
            <preview-description :attachment-files="dataJson.tempJson.cancel_files" />
          </el-descriptions-item>
          <el-descriptions-item label="作废提交时间">
            {{ formatDateTime(dataJson.tempJson.cancel_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="作废提交人">
            {{ dataJson.tempJson.cancel_name }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
        </el-descriptions>

        <!-- 中止区域 -->
        <el-alert
          v-if="dataJson.tempJson.receive_status === '-1'"
          title="中止理由"
          type="warning"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.receive_status === '-1'"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="中止理由" :span="3">
            {{ dataJson.tempJson.stopreceive_reason }}
          </el-descriptions-item>
          <el-descriptions-item label="中止附件" :span="3">
            <preview-description :attachment-files="dataJson.tempJson.stopreceive_files" />
          </el-descriptions-item>
          <el-descriptions-item label="中止提交时间">
            {{ formatDateTime(dataJson.tempJson.stopreceive_u_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="中止提交人">
            {{ dataJson.tempJson.stop_name }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
        </el-descriptions>

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

          <el-descriptions-item label="收款管理编号">
            {{ dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="业务类型">
            <el-form-item
              prop="type"
              label-width="0"
            >
              {{ dataJson.tempJson.type_name }}
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item />

          <el-descriptions-item label="主体企业（收款方）">
            <el-form-item
              prop="seller_name"
              label-width="0"
            >
              {{ dataJson.tempJson.seller_name }}

              <!--              <input-search-->
              <!--                v-model.trim="dataJson.tempJson.seller_name"-->
              <!--                @onInputSearch="handleSellerDialog"-->
              <!--              />-->
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="客户（付款方）">
            <el-form-item
              prop="customer_name"
              label-width="0"
            >
              {{ dataJson.tempJson.customer_name }}

              <!--              <input-search-->
              <!--                v-model.trim="dataJson.tempJson.customer_name"-->
              <!--                @onInputSearch="handleCustomerDialog"-->
              <!--              />-->
            </el-form-item>
          </el-descriptions-item>

          <el-descriptions-item label="收款状态">
            {{ dataJson.tempJson.receive_status_name == null ? '-': dataJson.tempJson.receive_status_name }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="3">
            {{ dataJson.tempJson.remark == null ? '-': dataJson.tempJson.remark }}
          </el-descriptions-item>

          <el-descriptions-item label="收款附件材料" span="3">
            <preview-description :attachment-files="dataJson.tempJson.doc_att_files" />
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
          <el-descriptions-item label="申请收款总金额">
            {{ dataJson.tempJson.receivable_amount_total == null ? '-': formatCurrency(dataJson.tempJson.receivable_amount_total, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="已收款总金额">
            {{ dataJson.tempJson.received_amount_total == null? '-': formatCurrency(dataJson.tempJson.received_amount_total, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="未收款总金额">
            {{ dataJson.tempJson.unreceive_amount_total == null? '-': formatCurrency(dataJson.tempJson.unreceive_amount_total, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="收款中金额">
            {{ dataJson.tempJson.receiving_amount_total == null? '-': formatCurrency(dataJson.tempJson.receiving_amount_total, true) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.soOrderListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px)"
          height="200px"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="140"
            label="合同编号｜订单编号"
            align="left"
          >
            <template v-slot="scope">
              <div style="line-height: 1.2;">
                <div>{{ scope.row.so_contract_code || '-' }}</div>
                <div>{{ scope.row.so_order_code || '-' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="so_goods"
            label="商品"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="qty_total"
            label="总销售数量"
            align="right"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="amount_total"
            label="订单总金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.amount_total == null? '-' : formatCurrency(scope.row.amount_total, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="so_advance_receipt_amount"
            label="预收款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.so_advance_receipt_amount == null? '': formatCurrency(scope.row.so_advance_receipt_amount, true) }}
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="so_can_advance_receipt_amount"
            label="可申请预收款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.so_can_advance_receipt_amount == null? '': formatCurrency(scope.row.so_can_advance_receipt_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="order_amount"
            label="本次申请金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.order_amount == null? '': formatCurrency(scope.row.order_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
          />

        </el-table>

        <el-alert
          title="收款信息"
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
          <el-descriptions-item label="收款总金额">
            {{ dataJson.tempJson.detail_receivable_amount == null ? '-': formatCurrency(dataJson.tempJson.detail_receivable_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>

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
          style="width: calc(100% - 20px)"
          height="200px"
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
            label="收款账户名"
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
            prop="bank_type_name"
            label="类型"
            align="left"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="receivable_amount"
            label="收款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.receivable_amount == null? '': formatCurrency(scope.row.receivable_amount, true) }}
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
          />
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
.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-button-group {
  margin-top: 10px;
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
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import { getApi } from '@/api/40_business/20_so/ar/ar'
import PreviewDescription from '@/components/51_preview_description/index.vue'
export default {
  directives: { elDragDialog },
  components: { PreviewDescription },
  mixins: [],
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      constants_dict,
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
        // 客户
        customerDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 主体企业
        sellerDialogData: {
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
        // 销售订单弹窗
        soOrderDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 销售订单弹窗(添加关联单号)
        soOrderFountDialog: {
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
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          customer_id: null,
          customer_name: '',
          customer_code: '',
          so_order_code: null,
          so_contract_code: null,
          project_code: null,
          seller_id: null,
          seller_name: '',
          seller_code: '',
          // 销售订单
          soOrderListData: [],
          // 银行账户
          bankListData: [],
          // 类型
          type: constants_dict.DICT_B_AR_TYPE_TWO,
          detailListData: [],
          // 申请收款总金额
          receivable_amount: null,
          // 未收款总金额
          unreceive_amount: null,
          // 已收款总金额
          received_amount: null,
          // 收款中金额
          receiving_amount: null,
          // 收款信息收款总额
          detail_receivable_amount: null
        },
        // 单条数据 json
        tempJson: {
        },
        // 收款附件数据
        receipt_doc_att: [],
        receipt_doc_att_file: [],
        receipt_doc_att_files: [],
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
        rules: {
        }
      }
    }
  },
  computed: {
  },
  // 监听器
  watch: {},
  created () {
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    async init () {
      // 初始化按钮
      this.getData()
      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.soOrderListData = [...response.data.soOrderListData]
        this.dataJson.tempJson.bankListData = [...response.data.bankListData]

        this.dataJson.tempJson.detail_receivable_amount = this.dataJson.tempJson.bankListData[0].receivable_amount

        // 初始化收款附件数据
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.receipt_doc_att = [...response.data.doc_att_files]
          this.dataJson.receipt_doc_att_file = response.data.doc_att_files.map(item => item.url)
          this.dataJson.tempJson.receipt_doc_att_files = [...response.data.doc_att_files]
        } else {
          this.dataJson.receipt_doc_att = []
          this.dataJson.receipt_doc_att_file = []
          this.dataJson.tempJson.receipt_doc_att_files = []
        }
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
    },
    // 格式化日期时间
    formatDateTime (dateTime) {
      if (!dateTime) return '-'
      return dateTime
    }
  }

}
</script>
