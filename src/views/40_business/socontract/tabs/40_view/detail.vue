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

          <!--          <el-descriptions-item label="项目编号">-->
          <!--            {{ dataJson.tempJson.project_code == null || dataJson.tempJson.code == ''?'系统自动生成':dataJson.tempJson.code }}-->
          <!--          </el-descriptions-item>-->

          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.contract_code }}
          </el-descriptions-item>

          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.type_name }}
          </el-descriptions-item>

          <!--          <el-descriptions-item label="订单量">-->
          <!--            <el-form-item-->
          <!--              prop="owner_name"-->
          <!--              label-width="0"-->
          <!--            >-->
          <!--              <el-input-->
          <!--                v-model.trim="dataJson.tempJson.vehicle_no"-->
          <!--                clearable-->
          <!--                :disabled="isViewModel"-->
          <!--                :maxlength="dataJson.inputSettings.maxLength.vehicle_no"-->
          <!--              />-->
          <!--            </el-form-item>-->
          <!--          </el-descriptions-item>-->
          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.purchaser_name }}
          </el-descriptions-item>

          <el-descriptions-item label="签约日期">
            {{ dataJson.tempJson.sign_date }}
          </el-descriptions-item>

          <el-descriptions-item label="到期日期">
            {{ dataJson.tempJson.expiry_date }}
          </el-descriptions-item>

          <el-descriptions-item label="交货日期">
            {{ dataJson.tempJson.delivery_date }}
          </el-descriptions-item>

          <el-descriptions-item label="运输方式">
            {{ dataJson.tempJson.delivery_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="结算方式">
            {{ dataJson.tempJson.settle_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="结算单据类型">
            {{ dataJson.tempJson.bill_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="付款方式">
            {{ dataJson.tempJson.payment_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="交货地点">
            {{ dataJson.tempJson.delivery_location }}
          </el-descriptions-item>

          <el-descriptions-item label="合同总金额">
            {{ dataJson.tempJson.contract_amount_sum == null || dataJson.tempJson.contract_amount_sum === ''?'-':formatNumber(dataJson.tempJson.contract_amount_sum,true,4) }}
          </el-descriptions-item>

          <el-descriptions-item label="总销售数量（吨）">
            {{ dataJson.tempJson.contract_total == null || dataJson.tempJson.contract_total === '' ?'-':formatNumber(dataJson.tempJson.contract_total,true,4) }}
          </el-descriptions-item>
          <el-descriptions-item label="已结算数量（吨）">
            {{ dataJson.tempJson.settle_qty == null || dataJson.tempJson.settle_qty === '' ? '-' : formatNumber(dataJson.tempJson.settle_qty,true,4) }}
          </el-descriptions-item>
          <el-descriptions-item label="总税额">
            {{ dataJson.tempJson.tax_amount_sum == null || dataJson.tempJson.tax_amount_sum === ''?'-':formatNumber(dataJson.tempJson.tax_amount_sum,true,4) }}
          </el-descriptions-item>

          <el-descriptions-item label="审批后自动生成订单">
            {{ dataJson.tempJson.auto_create_name }}
          </el-descriptions-item>

          <el-descriptions-item label="备注">
            {{ dataJson.tempJson.remark }}
          </el-descriptions-item>

        </el-descriptions>
        <div>
          <br>
          <el-alert
            title="财务信息"
            type="info"
            :closable="false"
          />
          <br>
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
              {{ dataJson.tempJson.settled_price == null ? '-' : formatNumber(dataJson.tempJson.settled_price, true, 4) }}
            </el-descriptions-item>
            <el-descriptions-item label="预付款金额">
              {{ dataJson.tempJson.advance_pay_price == null ? '-' : formatNumber(dataJson.tempJson.advance_pay_price, true, 4) }}
            </el-descriptions-item>
            <el-descriptions-item label="累计实付">
              {{ dataJson.tempJson.accumulated_act_price == null ? '-' : formatNumber(dataJson.tempJson.accumulated_act_price, true, 4) }}
            </el-descriptions-item>
            <el-descriptions-item label="未付">
              {{ dataJson.tempJson.unpaid_amount == null ? '-' : formatNumber(dataJson.tempJson.unpaid_amount, true, 4) }}
            </el-descriptions-item>

            <el-descriptions-item label="预付款可退金额">
              {{ dataJson.tempJson.advance_pay_refundable_price == null ? '-' : formatNumber(dataJson.tempJson.advance_pay_refundable_price, true, 4) }}
            </el-descriptions-item>

            <el-descriptions-item label="已开票金额">
              {{ dataJson.tempJson.invoiced_price == null ? '-' : formatNumber(dataJson.tempJson.invoiced_price, true, 4) }}
            </el-descriptions-item>

          </el-descriptions>
        </div>
        <br>
        <el-alert
          title="合同附件"
          type="info"
          :closable="false"
        />
        <br>

        <el-descriptions
          title=""
          :column="1"
          :label-style="fileLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="其他材料">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="1"
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
        <br>

        <br>
        <el-alert
          title="商品信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          :height="settings.tableHeight"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: 100%"
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
            min-width="130"
            prop="sku_code"
            label="物料编码"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="sku_name"
            label="物料名称"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="pm"
            label="品名"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="spec"
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
              {{ scope.row.qty == null? '-' : scope.row.qty }}
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
              {{ scope.row.price == null? '': formatNumber(scope.row.price, true,4) }}
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
              {{ scope.row.amount == null?formatNumber(scope.row.qty*scope.row.price,true,4): formatNumber(scope.row.amount,true,4) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
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
              {{ scope.row.tax_amount == null? '': formatNumber(scope.row.tax_amount,true,4) }}
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
br {
  display: block;
  margin: 10px;
  content: ' ';
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/socontract/socontract'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'

export default {
  directives: { elDragDialog },
  components: { PreviewCard },
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
      fileLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },
      // 监听器
      watch: {},
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          detailListData: []
        },
        // 单条数据 json
        tempJson: {
          detailListData: []
        },
        // 其他文件附件
        doc_att: [],
        doc_att_file: [],
        doc_att_files: []
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus
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
  // 初始化
  created () {
    this.init()
  },
  mounted () {
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
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]

        // 其他附件
        this.dataJson.doc_att = this.dataJson.tempJson.doc_att_files
        if (this.dataJson.doc_att != null && this.dataJson.doc_att.length > 0) {
          this.dataJson.tempJson.doc_att_files.forEach(item => {
            this.dataJson.doc_att_file.push(item.url)
          })
        } else {
          this.dataJson.doc_att = []
          this.dataJson.doc_att_file = []
          this.dataJson.doc_att_files = []
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
    }
  }
}
</script>
