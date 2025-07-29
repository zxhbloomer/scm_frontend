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
        <!-- 审批提示信息 -->
        <el-alert
          title="待审批销售订单"
          type="warning"
          :closable="false"
          show-icon
        />

        <!-- 作废理由显示 -->
        <el-alert
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_SO_ORDER_STATUS_FIVE"
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
            <preview-description :attachment-files="dataJson.tempJson.cancel_doc_att_files" />
          </el-descriptions-item>
          <el-descriptions-item label="作废提交时间">
            {{ formatDateTime(dataJson.tempJson.cancel_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="作废提交人">
            {{ dataJson.tempJson.cancel_name }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
        </el-descriptions>

        <!-- 项目信息 -->
        <el-alert
          v-if="dataJson.tempJson.project != null"
          title="项目信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.project != null"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="项目编号">
            <el-link
              v-if="dataJson.tempJson.project.code"
              type="primary"
              @click="handleProjectCodeClick(dataJson.tempJson.project.code)"
            >
              {{ dataJson.tempJson.project.code }}
            </el-link>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="项目名称">
            {{ dataJson.tempJson.project.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
          <el-descriptions-item label="备注" :span="3">
            {{ dataJson.tempJson.project.remark || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="项目附件材料" :span="3">
            <preview-description :attachment-files="dataJson.tempJson.project.doc_att_files" />
          </el-descriptions-item>
        </el-descriptions>

        <!-- 销售合同信息 -->
        <div v-if="dataJson.tempJson.so_contract_code">
          <el-alert
            title="合同信息"
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
            <el-descriptions-item label="合同编号">
              <el-link
                v-if="dataJson.socontract.contract_code"
                type="primary"
                @click="handleContractCodeClick(dataJson.socontract.contract_code)"
              >
                {{ dataJson.socontract.contract_code }}
              </el-link>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="系统编号">
              {{ dataJson.tempJson.code }}
            </el-descriptions-item>
            <el-descriptions-item label="类型">
              {{ dataJson.socontract.type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="客户">
              {{ dataJson.socontract.customer_name }}
            </el-descriptions-item>

            <el-descriptions-item label="主体企业">
              {{ dataJson.socontract.seller_name }}
            </el-descriptions-item>

            <el-descriptions-item label="收款方式">
              {{ dataJson.socontract.payment_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="结算方式">
              {{ dataJson.socontract.settle_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="结算单据类型">
              {{ dataJson.socontract.bill_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="运输方式">
              {{ dataJson.socontract.delivery_type_name }}
            </el-descriptions-item>

            <el-descriptions-item label="到期日期">
              {{ dataJson.socontract.expiry_date }}
            </el-descriptions-item>

            <el-descriptions-item label="交货日期">
              {{ dataJson.socontract.delivery_date }}
            </el-descriptions-item>

            <el-descriptions-item label="签约日期">
              {{ dataJson.socontract.sign_date }}
            </el-descriptions-item>

            <el-descriptions-item label="交货地点">
              {{ dataJson.socontract.delivery_location }}
            </el-descriptions-item>

            <el-descriptions-item label="备注">
              {{ dataJson.socontract.remark }}
            </el-descriptions-item>

            <el-descriptions-item label="合同总金额">
              <span class="fontWeight highlight-amount">
                {{ dataJson.socontract.contract_amount_sum == null || dataJson.socontract.contract_amount_sum === ''?'-':formatCurrency(dataJson.socontract.contract_amount_sum,true,4) }}
              </span>
            </el-descriptions-item>

            <el-descriptions-item label="总销售数量（吨）">
              <span class="fontWeight highlight-qty">
                {{ dataJson.socontract.contract_total == null || dataJson.socontract.contract_total === '' ?'-':formatNumber(dataJson.socontract.contract_total,true,4) }}
              </span>
            </el-descriptions-item>

            <el-descriptions-item label="已结算数量（吨）">
              <span class="fontWeight">
                {{ dataJson.socontract.settle_qty == null || dataJson.socontract.settle_qty === '' ? '-' : formatNumber(dataJson.socontract.settle_qty,true,4) }}
              </span>
            </el-descriptions-item>

            <el-descriptions-item label="总税额">
              <span class="fontWeight">
                {{ dataJson.socontract.tax_amount_sum == null || dataJson.socontract.tax_amount_sum === ''?'-':formatCurrency(dataJson.socontract.tax_amount_sum,true,4) }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 销售订单信息 -->
        <el-alert
          title="订单信息（审批重点）"
          type="warning"
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
          <el-descriptions-item label="订单编号">
            <span class="highlight-code">{{ dataJson.tempJson.code }}</span>
          </el-descriptions-item>

          <el-descriptions-item v-if="dataJson.tempJson.contract_code" label="合同编号">
            {{ dataJson.tempJson.contract_code }}
          </el-descriptions-item>

          <el-descriptions-item label="运输方式">
            {{ dataJson.tempJson.delivery_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="交货日期">
            <span class="highlight-date">{{ dataJson.tempJson.delivery_date || '-' }}</span>
          </el-descriptions-item>

          <el-descriptions-item label="交货地点">
            {{ dataJson.tempJson.delivery_location || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单备注" :span="2">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单总金额">
            <span class="fontWeight highlight-amount">
              {{ dataJson.tempJson.order_amount_sum == null || dataJson.tempJson.order_amount_sum === ''?'-':formatCurrency(dataJson.tempJson.order_amount_sum,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="订单总销售数量（吨）">
            <span class="fontWeight highlight-qty">
              {{ dataJson.tempJson.qty_total == null || dataJson.tempJson.qty_total === '' ?'-':formatNumber(dataJson.tempJson.qty_total,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="已出库数量（吨）">
            <span class="fontWeight">
              {{ dataJson.tempJson.inventory_out_total_sum == null || dataJson.tempJson.inventory_out_total_sum === '' ? '-' : formatNumber(dataJson.tempJson.inventory_out_total_sum,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="订单总税额">
            <span class="fontWeight">
              {{ dataJson.tempJson.tax_amount_sum == null || dataJson.tempJson.tax_amount_sum === ''?'-':formatCurrency(dataJson.tempJson.tax_amount_sum,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="订单附件材料" :span="3">
            <preview-card :attachment-files="dataJson.tempJson.doc_att_files" />
          </el-descriptions-item>
        </el-descriptions>

        <!-- 财务信息 -->
        <el-alert
          title="财务信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          style="padding-right: 10px;padding-left: 10px;"
          direction="horizontal"
          border
        >
          <el-descriptions-item label="结算金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.settled_price == null ? '-' : formatCurrency(dataJson.tempJson.settled_price, true) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="预收款金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.advance_receive_total == null ? '-' : formatCurrency(dataJson.tempJson.advance_receive_total, true) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="累计实收">
            <span class="fontWeight">
              {{ dataJson.tempJson.received_total == null ? '-' : formatCurrency(dataJson.tempJson.received_total, true) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="可下推预收款金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.advance_amount_total == null ? '-' : formatCurrency(dataJson.tempJson.advance_amount_total, true) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="预收款可退金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.advance_receive_refundable_price == null ? '-' : formatCurrency(dataJson.tempJson.advance_receive_refundable_price, true) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="已开票金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.invoiced_price == null ? '-' : formatCurrency(dataJson.tempJson.invoiced_price, true) }}
            </span>
          </el-descriptions-item>

        </el-descriptions>

        <!-- 订单明细表格 -->
        <el-alert
          title="订单明细（审批核心数据）"
          type="success"
          :closable="false"
        />

        <el-table
          :data="dataJson.tempJson.detailListData"
          style="width: 100%; margin-top: 10px;"
          border
          :height="300"
          :row-class-name="getRowClassName"
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
          />
          <el-table-column
            prop="goods_code"
            label="商品编号"
            min-width="120"
          />
          <el-table-column
            prop="goods_name"
            label="商品名称"
            min-width="150"
          />
          <el-table-column
            prop="sku_code"
            label="规格编号"
            min-width="120"
          />
          <el-table-column
            prop="sku_name"
            label="规格名称"
            min-width="120"
          />
          <el-table-column
            prop="origin"
            label="产地"
            width="100"
          />
          <el-table-column
            prop="qty"
            label="数量"
            width="100"
            align="right"
          >
            <template slot-scope="scope">
              <span class="highlight-qty">{{ formatNumber(scope.row.qty, true, 4) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="price"
            label="单价"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              <span class="highlight-amount">{{ formatCurrency(scope.row.price, true, 4) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="amount"
            label="金额"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              <span class="highlight-amount">{{ formatCurrency(scope.row.amount, true, 4) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="tax_rate"
            label="税率"
            width="80"
            align="right"
          >
            <template slot-scope="scope">
              {{ scope.row.tax_rate }}%
            </template>
          </el-table-column>
          <el-table-column
            prop="tax_amount"
            label="税额"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              {{ formatCurrency(scope.row.tax_amount, true, 4) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="inventory_out_total"
            label="已出库数量"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              {{ formatNumber(scope.row.inventory_out_total, true, 4) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="settle_can_qty_total"
            label="待结算数量"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              {{ formatNumber(scope.row.settle_can_qty_total, true, 4) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 风险提示信息 -->
        <el-alert
          v-if="hasRiskWarning"
          title="风险提示"
          type="error"
          :closable="false"
          style="margin-top: 20px;"
        >
          <ul style="margin: 0; padding-left: 20px;">
            <li v-if="dataJson.tempJson.order_amount_sum > 1000000">订单金额超过100万，请特别关注！</li>
            <li v-if="dataJson.tempJson.qty_total > 10000">订单数量超过1万吨，请确认交货能力！</li>
            <li v-if="isDeliveryDateTight">交货时间紧张，请评估履约风险！</li>
          </ul>
        </el-alert>

        <!-- 操作日志/审批历史等其他信息 -->
        <el-alert
          title="操作信息"
          type="info"
          :closable="false"
          style="margin-top: 20px;"
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
          <el-descriptions-item label="创建人">
            {{ dataJson.tempJson.c_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(dataJson.tempJson.c_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(dataJson.tempJson.status)">
              {{ dataJson.tempJson.status_name || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="更新人">
            {{ dataJson.tempJson.u_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(dataJson.tempJson.u_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="提交审批时间">
            {{ formatDateTime(dataJson.tempJson.submit_time) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </div>
  </div>
</template>

<script>
import constants_para from '@/common/constants/constants_para'
import constants_dict from '@/common/constants/constants_dict'
import { getApi } from '@/api/40_business/20_so/soorder/soorder'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'

export default {
  components: { PreviewCard, PreviewDescription },
  props: {
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: 'approve'
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
      dataJson: {
        tempJson: {},
        socontract: {}
      },
      settings: {
        loading: false,
        rules: {}
      }
    }
  },
  computed: {
    constants_dict () {
      return constants_dict
    },
    constants_para () {
      return constants_para
    },
    // 是否有风险警告
    hasRiskWarning () {
      return this.dataJson.tempJson.order_amount_sum > 1000000 ||
             this.dataJson.tempJson.qty_total > 10000 ||
             this.isDeliveryDateTight
    },
    // 交货时间是否紧张
    isDeliveryDateTight () {
      if (!this.dataJson.tempJson.delivery_date) return false
      const deliveryDate = new Date(this.dataJson.tempJson.delivery_date)
      const now = new Date()
      const diffDays = (deliveryDate - now) / (1000 * 60 * 60 * 24)
      return diffDays < 30 // 小于30天认为时间紧张
    }
  },
  created () {
    this.loadOrderData()
  },
  methods: {
    loadOrderData () {
      if (this.data && this.data.id) {
        this.settings.loading = true
        getApi({ id: this.data.id }).then(response => {
          if (response.data) {
            this.dataJson.tempJson = response.data
            this.dataJson.socontract = response.data.so_contract || {}
          }
          this.settings.loading = false
        }).catch(() => {
          this.$message.error('加载订单数据失败')
          this.settings.loading = false
        })
      }
    },
    getRowClassName ({ row, rowIndex }) {
      // 为重要行添加样式
      if (row.amount > 100000) { // 金额超过10万的行高亮
        return 'high-value-row'
      }
      return ''
    },
    getStatusTagType (status) {
      const statusMap = {
        [constants_dict.DICT_B_SO_ORDER_STATUS_ZERO]: 'info', // 待审批
        [constants_dict.DICT_B_SO_ORDER_STATUS_ONE]: 'warning', // 审批中
        [constants_dict.DICT_B_SO_ORDER_STATUS_TWO]: 'success', // 执行中
        [constants_dict.DICT_B_SO_ORDER_STATUS_THREE]: 'danger', // 驳回
        [constants_dict.DICT_B_SO_ORDER_STATUS_FOUR]: 'warning', // 作废审批中
        [constants_dict.DICT_B_SO_ORDER_STATUS_FIVE]: 'info', // 已作废
        [constants_dict.DICT_B_SO_ORDER_STATUS_SIX]: 'success' // 已完成
      }
      return statusMap[status] || 'info'
    },
    handleProjectCodeClick (code) {
      // 跳转到项目详情
      console.log('项目编号点击:', code)
    },
    handleContractCodeClick (code) {
      // 跳转到合同详情
      console.log('合同编号点击:', code)
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 10px;
}

.el-descriptions {
  margin-bottom: 20px;
}

.fontWeight {
  font-weight: bold;
  color: #1890ff;
}

.el-alert {
  margin-bottom: 10px;
}

.el-table {
  margin-bottom: 20px;
}

/* 审批页面特殊样式 */
.highlight-amount {
  color: #e6a23c;
  font-weight: bold;
  font-size: 14px;
}

.highlight-qty {
  color: #67c23a;
  font-weight: bold;
  font-size: 14px;
}

.highlight-code {
  color: #409eff;
  font-weight: bold;
  font-size: 14px;
}

.highlight-date {
  color: #f56c6c;
  font-weight: bold;
}

/* 高金额行样式 */
::v-deep .high-value-row {
  background-color: #fdf6ec !important;
}

::v-deep .high-value-row:hover {
  background-color: #faecd8 !important;
}
</style>
