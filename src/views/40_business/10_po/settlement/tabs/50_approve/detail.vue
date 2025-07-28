<template>
  <div class="app-container">
    <div>
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        status-icon
      >
        <!-- 作废信息 -->
        <el-alert
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_PO_SETTLEMENT_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_PO_SETTLEMENT_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_PO_SETTLEMENT_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_PO_SETTLEMENT_STATUS_FIVE"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="作废理由" span="3">
            {{ dataJson.tempJson.cancel_reason || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="作废附件" span="3">
            <preview-description :attachment-files="dataJson.tempJson.cancel_doc_att_files" />
          </el-descriptions-item>
          <el-descriptions-item label="作废提交时间">
            {{ formatDateTime(dataJson.tempJson.cancel_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="作废提交人">
            {{ dataJson.tempJson.cancel_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
        </el-descriptions>

        <!-- 基本信息 -->
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

          <el-descriptions-item label="采购结算编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="业务类型">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="关联单号状态">
            {{ dataJson.tempJson.detailListData && dataJson.tempJson.detailListData.length > 0 ? '已关联' : '未关联' }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.purchaser_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="结算日期">
            {{ dataJson.tempJson.settlement_date || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="结算方式">
            {{ dataJson.tempJson.settle_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="结算单据类型">
            {{ dataJson.tempJson.bill_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            {{ dataJson.tempJson.status_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="3">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="附件材料" span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="0"
                :span="4"
              >
                <previewCard
                  :show-delete="false"
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 业务单据信息 -->
        <el-alert
          title="业务单据信息"
          type="info"
          :closable="false"
        />

        <el-descriptions
          title=""
          :column="4"
          :label-style="{ width: '10%', 'text-align': 'right' }"
          :content-style="{ width: '10%' }"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item span="2" label="应付金额" />
          <el-descriptions-item span="2" label="应付金额公式">
            = 申请结算总金额
          </el-descriptions-item>
          <el-descriptions-item label="结算总金额">
            {{ summaryData.finalTotalAmount == null ? '-': formatCurrency(summaryData.finalTotalAmount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="结算总数量（吨）">
            {{ summaryData.totalQty == null? '-': formatNumber(summaryData.totalQty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="当前企业资金池余额" />
          <el-descriptions-item label="资金池冲抵" />
          <el-descriptions-item label="优惠金额（减金额）">
            {{ dataJson.tempJson.discount_amount == null ? '-' : formatCurrency(dataJson.tempJson.discount_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="其他金额（加金额）">
            {{ dataJson.tempJson.other_amount == null ? '-' : formatCurrency(dataJson.tempJson.other_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="杂项金额（加金额）">
            {{ dataJson.tempJson.misc_amount == null ? '-' : formatCurrency(dataJson.tempJson.misc_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="罚款金额（减金额）">
            {{ dataJson.tempJson.penalty_amount == null ? '-' : formatCurrency(dataJson.tempJson.penalty_amount, true) }}
          </el-descriptions-item>

        </el-descriptions>

        <div class="div-sum">
          <div class="right">
            <span class="count-title">本次计划结算总金额：</span>
            <span class="count-data">{{ summaryData.totalAmount == null ? '-' : formatCurrency(summaryData.totalAmount, true) }}</span>
            <span class="count-title">本次计划结算总数量：</span>
            <span class="count-data">{{ summaryData.totalQty == null ? '-' : formatNumber(summaryData.totalQty, true, 4) }}</span>
          </div>
        </div>
        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          stripe
          border
          fit
          highlight-current-row
          :default-sort="{prop: 'u_time', order: 'descending'}"
          style="width: calc(100% - 20px )"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
            fixed="left"
          />

          <!-- 合同订单信息 -->
          <el-table-column label="合同订单信息" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="140"
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
              show-overflow-tooltip
              min-width="150"
              label="商品名称｜规格"
              align="left"
            >
              <template v-slot="scope">
                <div style="line-height: 1.2;">
                  <div>{{ scope.row.goods_name || '-' }}</div>
                  <div>{{ scope.row.sku_name || '-' }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="order_qty"
              label="订单数量（吨）"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_qty == null? '-' : formatNumber(scope.row.order_qty,true,4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="order_price"
              label="订单单价"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_price == null? '-' : formatCurrency(scope.row.order_price,true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="order_amount"
              label="订单金额"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_amount == null? '-' : formatCurrency(scope.row.order_amount,true) }}
              </template>
            </el-table-column>
          </el-table-column>
          <!-- 本次结算计划 -->
          <el-table-column label="本次结算计划" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="planned_qty"
              label="结算数量（吨）"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.planned_qty == null? '-' : formatNumber(scope.row.planned_qty,true,4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="planned_amount"
              label="结算金额"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.planned_amount == null? '-' : formatCurrency(scope.row.planned_amount,true) }}
              </template>
            </el-table-column>
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

.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-button-group {
  margin-left: 10px;
}
.el-table {
  margin: 0 10px 10px 10px;
}
.el-form-item .el-select {
  width: 100%;
}
.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.form-items-container {
  display: flex;
  align-items: center;
}

.left-side {
  flex: 9;
}

.right-side {
  flex: 1;
  margin-left: 5px;
}
.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
.div-sum {
  width: calc(100% - 20px );
  height: 35px;
  padding: 5px 5px;
  margin: 10px 10px 0 10px ;
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
}
.count-title {
  margin-left: 10px;
}
.count-data {
  color: #1890ff;
  font-size: 20px;
}

</style>

<script>
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/10_po/settlement/settlement'
import constants_para from '@/common/constants/constants_para'
import constants_dict from '@/common/constants/constants_dict'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'

export default {
  components: {
    PreviewCard,
    PreviewDescription
  },
  props: {
    // 业务表
    data: {
      type: Object,
      default: null
    },
    /**
     * 40_view: 查看
     * audit：审批
     * update：更新
     * insert：插入
     */
    editStatus: {
      type: String,
      default: 'audit'
    }
  },
  data () {
    return {
      constants_para: constants_para,
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      contentStyle: {
        width: '15%'
      },
      settings: {
        loading: false,
        duration: 1000,
        rules: {}
      },
      // 页面数据
      dataJson: {
        // 单条数据 json
        tempJson: {
          // 基本信息
          id: null,
          code: '',
          type: '',
          type_name: '',
          purchaser_id: null,
          purchaser_code: '',
          purchaser_name: '',
          supplier_id: null,
          supplier_code: '',
          supplier_name: '',
          settle_type: '',
          payment_type: '',
          settle_type_name: '',
          bill_type: '',
          bill_type_name: '',
          settlement_date: '',
          remark: '',
          status: '',
          status_name: '',

          // 业务单据信息统计
          planned_amount: null,
          settled_amount: null,
          planned_qty: null,
          settled_qty: null,
          discount_amount: 0,
          other_amount: 0,
          misc_amount: 0,
          penalty_amount: 0,

          // 明细数据
          detailListData: [],

          // 附件
          doc_att_files: [],
          cancel_doc_att_files: [],

          // 操作信息
          c_name: '',
          c_time: '',
          u_name: '',
          u_time: '',
          cancel_reason: '',
          cancel_name: '',
          cancel_time: ''
        },
        doc_att: [],
        doc_att_file: [],
        inputSettings: {
          maxLength: {
            remark: 500
          }
        }
      },
      // 汇总数据
      summaryData: {
        totalAmount: null, // 本次计划结算总金额
        totalQty: null, // 结算总数量
        finalTotalAmount: null // 最终结算总金额（含优惠、其他、杂项、罚款）
      }
    }
  },
  computed: {
    constants_dict () {
      return constants_dict
    }
  },
  // 全屏loading
  watch: {
    'settings.loading': {
      handler (newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在处理，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  // 初始化
  created () {
  },
  mounted () {
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

    // 获取详情数据
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]

        // 处理附件数据
        this.dataJson.doc_att = this.dataJson.tempJson.doc_att_files || []
        if (this.dataJson.doc_att != null && this.dataJson.doc_att.length > 0) {
          this.dataJson.tempJson.doc_att_files.forEach(item => {
            this.dataJson.doc_att_file.push(item.url)
          })
        } else {
          this.dataJson.doc_att = []
          this.dataJson.doc_att_file = []
        }

        // 处理作废附件数据
        if (this.dataJson.tempJson.cancel_doc_att_files) {
          this.dataJson.tempJson.cancel_doc_att_files = this.dataJson.tempJson.cancel_doc_att_files
        }

        // 计算汇总数据
        this.calculateSummary()
      }).finally(() => {
        this.settings.loading = false
      })
    },

    /**
     * 计算汇总数据 - 用于表格顶部显示
     */
    calculateSummary () {
      let totalAmount = 0
      let totalQty = 0

      // 遍历明细数据，计算结算金额和结算数量的汇总
      this.dataJson.tempJson.detailListData.forEach(item => {
        totalAmount += item.planned_amount || 0 // 结算金额
        totalQty += item.planned_qty || 0 // 结算数量（吨）
      })

      // 更新汇总数据
      this.summaryData.totalAmount = totalAmount > 0 ? totalAmount : null
      this.summaryData.totalQty = totalQty > 0 ? totalQty : null

      // 计算最终结算总金额
      this.calculateFinalTotalAmount()
    },

    /**
     * 计算最终结算总金额
     * 公式：结算总金额 = 本次计划结算总金额 - 优惠金额 + 其他金额 + 杂项金额 - 罚款金额
     */
    calculateFinalTotalAmount () {
      const detailAmount = this.summaryData.totalAmount || 0 // 本次计划结算总金额
      const discountAmount = this.dataJson.tempJson.discount_amount || 0 // 优惠金额（减）
      const otherAmount = this.dataJson.tempJson.other_amount || 0 // 其他金额（加）
      const miscAmount = this.dataJson.tempJson.misc_amount || 0 // 杂项金额（加）
      const penaltyAmount = this.dataJson.tempJson.penalty_amount || 0 // 罚款金额（减）

      // 计算最终金额
      const finalAmount = detailAmount - discountAmount + otherAmount + miscAmount - penaltyAmount

      // 更新最终结算总金额
      this.summaryData.finalTotalAmount = finalAmount !== 0 ? finalAmount : null
    },

    // 移除附件文件 - 审批模式下不允许删除
    removeOtherFile (val) {
      // 审批模式下不允许删除
    }
  }
}
</script>
