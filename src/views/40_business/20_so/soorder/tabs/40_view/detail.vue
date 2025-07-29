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
              <span class="fontWeight">
                {{ dataJson.socontract.contract_amount_sum == null || dataJson.socontract.contract_amount_sum === ''?'-':formatCurrency(dataJson.socontract.contract_amount_sum,true,4) }}
              </span>
            </el-descriptions-item>

            <el-descriptions-item label="总销售数量（吨）">
              <span class="fontWeight">
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
            <el-descriptions-item label="合同附件材料" :span="3">
              <preview-description :attachment-files="dataJson.socontract.doc_att_files" />
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 销售订单信息 -->
        <el-alert
          title="订单信息"
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
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 10px;">{{ dataJson.tempJson.code }}</span>
              <el-button
                type="primary"
                size="mini"
                @click="handleViewDataChangeLog"
              >
                数据日志
              </el-button>
            </div>
          </el-descriptions-item>

          <el-descriptions-item v-if="dataJson.tempJson.contract_code" label="合同编号">
            {{ dataJson.tempJson.contract_code }}
          </el-descriptions-item>

          <el-descriptions-item label="运输方式">
            {{ dataJson.tempJson.delivery_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="交货日期">
            {{ dataJson.tempJson.delivery_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="交货地点">
            {{ dataJson.tempJson.delivery_location || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单备注" :span="2">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="订单总金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.order_amount_sum == null || dataJson.tempJson.order_amount_sum === ''?'-':formatCurrency(dataJson.tempJson.order_amount_sum,true,4) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="订单总销售数量（吨）">
            <span class="fontWeight">
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

        <el-alert
          title="商品信息"
          type="info"
          :closable="false"
        />
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          height="200px"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
          @row-click="handleRowClick"
          @current-change="handleCurrentChange"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="sku_code"
            label="商品编号"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="goods_name"
            label="商品名称"
          />

          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="sku_name"
            label="规格"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="qty"
            label="合同数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.qty == null? '-' : formatCurrency(scope.row.qty,true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="price"
            label="单价（含税）"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.price == null? '': formatCurrency(scope.row.price,true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="amount"
            label="金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.amount == null? '' : formatCurrency(scope.row.amount,true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="90"
            prop="tax_rate"
            label="税率（%）"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.tax_rate == null? '': scope.row.tax_rate }}%
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="tax_amount"
            label="税额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.tax_amount == null? '': formatCurrency(scope.row.tax_amount,true) }}
            </template>
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="origin"
            label="产地"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.origin == null ? '': scope.row.origin }}
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
    </div>

    <!-- 数据日志弹出框 -->
    <data-change-log-dialog
      v-if="dataChangeLogDialogVisible"
      :visible="dataChangeLogDialogVisible"
      :data="dataChangeLogDialogData"
      @closeMeCancel="handleCloseDataChangeLogDialog"
    />
  </div>
</template>

<script>
import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/20_so/soorder/soorder'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import DataChangeLogDialog from '@/views/30_wms/datachangelogorder/tabs/dialog/info/index.vue'

export default {
  directives: { elDragDialog },
  components: { PreviewDescription, DataChangeLogDialog },
  mixins: [],
  props: {
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: 'view'
    }
  },
  data () {
    return {
      constants_dict,
      constants_para,
      contentStyle: {
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      fileLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },
      // 监听器
      watch: {
      },
      // 数据日志弹出框控制
      dataChangeLogDialogVisible: false,
      dataChangeLogDialogData: null,
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          detailListData: []
        },
        // 单条数据 json
        tempJson: {
          detailListData: [],
          project: {
            code: null,
            name: null,
            remark: null,
            // 附件
            doc_att: [],
            doc_att_file: [],
            doc_att_files: []
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true
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
    // 初始化
    this.init()
  },
  destroyed () {
  },
  methods: {
    // 初始化处理
    init () {
      this.dataJson.tempJson = this.data
      // 数据初始化
      this.getData()

      this.settings.loading = false
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.socontract = deepCopy(response.data.so_contract)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]
        // 其他附件
        this.dataJson.doc_att = this.dataJson.tempJson.doc_att_files
        this.dataJson.doc_att_file = []
        if (this.dataJson.doc_att != null && this.dataJson.doc_att.length > 0) {
          this.dataJson.tempJson.doc_att_files.forEach(item => {
            this.dataJson.doc_att_file.push(item.url)
          })
        } else {
          this.dataJson.doc_att = []
          this.dataJson.doc_att_file = []
          this.dataJson.doc_att_files = []
        }

        // 项目管理的附件信息
        if (this.dataJson.tempJson.project && this.dataJson.tempJson.project.doc_att_files) {
          this.dataJson.tempJson.project.doc_att = this.dataJson.tempJson.project.doc_att_files
          if (this.dataJson.tempJson.project.doc_att != null && this.dataJson.tempJson.project.doc_att.length > 0) {
            this.dataJson.tempJson.project.doc_att_file = []
            this.dataJson.tempJson.project.doc_att_files.forEach(item => {
              this.dataJson.tempJson.project.doc_att_file.push(item.url)
            })
          } else {
            this.dataJson.tempJson.project.doc_att = []
            this.dataJson.tempJson.project.doc_att_file = []
            this.dataJson.tempJson.project.doc_att_files = []
          }
        }

        // 销售合同的附件信息
        if (this.dataJson.socontract && this.dataJson.socontract.doc_att_files) {
          this.dataJson.socontract.doc_att = this.dataJson.socontract.doc_att_files
          if (this.dataJson.socontract.doc_att != null && this.dataJson.socontract.doc_att.length > 0) {
            this.dataJson.socontract.doc_att_file = []
            this.dataJson.socontract.doc_att_files.forEach(item => {
              this.dataJson.socontract.doc_att_file.push(item.url)
            })
          } else {
            this.dataJson.socontract.doc_att = []
            this.dataJson.socontract.doc_att_file = []
            this.dataJson.socontract.doc_att_files = []
          }
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handleRowClick (row) {
      this.popSettingsData.goodsDialog.rowIndex = this.getRowIndex(row)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.tempJson.detailListData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },
    // 其他附件附件文件
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.doc_att_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.doc_att.splice(_index, 1)
      this.dataJson.doc_att_file.splice(_index, 1)
      this.dataJson.tempJson.doc_att_files = this.dataJson.doc_att
    },
    // 处理项目编号点击事件
    handleProjectCodeClick (projectCode) {
      // 跳转到项目管理页面，传递项目编号作为参数p1
      this.$router.push({
        path: constants_para.URL_PROJECT_LIST,
        query: {
          p1: projectCode
        }
      })
    },
    // 处理合同编号点击事件
    handleContractCodeClick (contractCode) {
      // 跳转到销售合同页面，传递合同编号作为参数p1
      this.$router.push({
        path: constants_para.URL_SO_CONTRACT_LIST,
        query: {
          p1: contractCode
        }
      })
    },

    // 查看数据日志
    handleViewDataChangeLog () {
      console.log('查看数据日志被点击，订单ID:', this.dataJson.tempJson.id, '订单编号:', this.dataJson.tempJson.code)
      // 设置弹出框数据，传入订单编号作为order_code参数
      this.dataChangeLogDialogData = {
        order_code: this.dataJson.tempJson.code
      }
      // 显示弹出框
      this.dataChangeLogDialogVisible = true
    },

    // 关闭数据日志弹出框
    handleCloseDataChangeLogDialog () {
      this.dataChangeLogDialogVisible = false
      this.dataChangeLogDialogData = null
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
</style>
