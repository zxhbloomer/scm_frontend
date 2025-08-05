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
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_AR_REFUND_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_AR_REFUND_STATUS_FIVE"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="作废理由" :span="3">
            {{ dataJson.tempJson.cancel_reason || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="作废附件" :span="3">
            <preview-description :attachment-files="dataJson.tempJson.cancel_files" />
          </el-descriptions-item>
          <el-descriptions-item label="作废提交时间">
            {{ formatDateTime(dataJson.tempJson.cancel_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="作废提交人">
            {{ dataJson.tempJson.cancel_name || '-' }}
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

          <el-descriptions-item label="退款编号">
            {{ dataJson.tempJson.code || '系统自动生成' }}
          </el-descriptions-item>

          <el-descriptions-item label="业务类型">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="退款状态">
            {{ dataJson.tempJson.refund_status_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业（收款方）">
            {{ dataJson.tempJson.seller_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="客户（付款方）">
            {{ dataJson.tempJson.customer_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="" />

          <el-descriptions-item label="备注" span="3">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="退款附件材料" span="3">
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
            {{ dataJson.tempJson.so_contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.so_order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.so_goods || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="预收款已收金额">
            {{ (dataJson.tempJson.advance_received_total || 0) - (dataJson.tempJson.advance_cancelreceive_total || 0) == 0 ? '-': formatCurrency((dataJson.tempJson.advance_received_total || 0) - (dataJson.tempJson.advance_cancelreceive_total || 0), true) }}
          </el-descriptions-item>
          <el-descriptions-item label="可退金额">
            {{ dataJson.tempJson.advance_refund_amount_total == null ? '-': formatCurrency(dataJson.tempJson.advance_refund_amount_total, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="本次申请退款金额">
            {{ dataJson.tempJson.order_amount == null ? '-': formatCurrency(dataJson.tempJson.order_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="退款信息"
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
          <el-descriptions-item label="退款总金额">
            {{ dataJson.tempJson.detail_refund_amount == null ? '-': formatCurrency(dataJson.tempJson.detail_refund_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>

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
            {{ dataJson.tempJson.bankData.name || '-' }}
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
            {{ dataJson.tempJson.bankData.order_amount == null ? '-': formatCurrency(dataJson.tempJson.bankData.order_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item />
        </el-descriptions>

      </el-form>
    </div>

  </div>
</template>

<style scoped>
.app-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.el-form-item .el-select {
  width: 100%;
}

.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
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
import { getApi } from '@/api/40_business/20_so/arrefund/arrefund'
import PreviewDescription from '@/components/51_preview_description/index.vue'
export default {
  directives: { elDragDialog },
  components: { PreviewDescription },
  mixins: [],
  props: {
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
      // 监听器配置（已移除）
      dataJson: {
        // 单条数据 json
        tempJson: {
          // 状态字段，避免undefined导致闪烁
          status: null,
          refund_status: null,
          // 银行账户信息（单个对象）
          bankData: {
            name: null,
            bank_name: null,
            account_number: null,
            bank_type_name: null,
            order_amount: null,
            remark: null
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // pop的check内容
        rules: {
        }
      }
    }
  },
  computed: {
  },
  // 监听器
  watch: {
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        // 监听页面上面是否有修改，有修改按钮高亮
      },
      deep: true
    }
  },
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    // 组件销毁时清理资源
  },
  methods: {
    // 初始化处理
    async init () {
      this.getData()
      // 初始化完成
      this.settings.loading = false
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
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

        // 计算退款总金额
        this.dataJson.tempJson.detail_refund_amount = this.dataJson.tempJson.bankData.order_amount
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 格式化日期时间
    formatDateTime (dateTime) {
      if (!dateTime) return '-'
      return dateTime
    }
  }

}
</script>
