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

        <el-alert
          title="结算信息"
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
          <el-descriptions-item label="结算单号">
            {{ dataJson.tempJson.code }}
          </el-descriptions-item>
          <el-descriptions-item label="结算日期">
            {{ dataJson.tempJson.settlement_date }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            {{ dataJson.tempJson.status_name }}
          </el-descriptions-item>

          <el-descriptions-item label="结算方式">
            {{ dataJson.tempJson.settle_type_name }}
          </el-descriptions-item>
          <el-descriptions-item label="结算单据类型">
            {{ dataJson.tempJson.bill_type_name }}
          </el-descriptions-item>
          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.purchaser_name }}
          </el-descriptions-item>
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.po_contract_code }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.po_order_code }}
          </el-descriptions-item>

          <el-descriptions-item label="实结算数量">
            <span class="fontWeight">
              {{ dataJson.tempJson.settled_qty == null || dataJson.tempJson.settled_qty === '' ? '-' : formatNumber(dataJson.tempJson.settled_qty, true, 4) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="实结算金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.settled_amount == null || dataJson.tempJson.settled_amount === '' ? '-' : formatCurrency(dataJson.tempJson.settled_amount, true) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="结算附件材料" :span="3">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.doc_att"
                :key="i"
                :offset="1"
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

        <div>
          <el-alert
            title="结算明细"
            type="info"
            :closable="false"
          />
          <el-table
            ref="multipleTable"
            v-loading="settings.loading"
            :data="dataJson.tempJson.items"
            stripe
            border
            fit
            highlight-current-row
            style="width: 100%;margin-top: 10px;"
          >
            <el-table-column
              type="index"
              width="45"
              prop="No"
              label="No"
            />
            <el-table-column
              :auto-fit="true"
              min-width="140"
              prop="goods_name"
              label="商品名称"
              align="left"
            />
            <el-table-column
              :auto-fit="true"
              min-width="120"
              prop="sku_name"
              label="规格名称"
              align="left"
            />
            <el-table-column
              :auto-fit="true"
              min-width="100"
              prop="unit_name"
              label="单位"
              align="center"
            />
            <el-table-column
              :auto-fit="true"
              min-width="120"
              prop="price"
              label="单价"
              align="right"
            >
              <template slot-scope="scope">
                {{ scope.row.price == null ? '' : formatCurrency(scope.row.price, true) }}
              </template>
            </el-table-column>
            <el-table-column
              :auto-fit="true"
              min-width="100"
              prop="qty"
              label="数量"
              align="right"
            >
              <template slot-scope="scope">
                {{ scope.row.qty == null ? '' : formatNumber(scope.row.qty, true, 4) }}
              </template>
            </el-table-column>
            <el-table-column
              :auto-fit="true"
              min-width="120"
              prop="amount"
              label="金额"
              align="right"
            >
              <template slot-scope="scope">
                {{ scope.row.amount == null ? '' : formatCurrency(scope.row.amount, true) }}
              </template>
            </el-table-column>
            <el-table-column
              :auto-fit="true"
              min-width="200"
              prop="remark"
              label="备注"
              align="left"
            />
          </el-table>
        </div>

        <div>
          <el-alert
            title="操作信息"
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
            <el-descriptions-item label="创建人">
              {{ dataJson.tempJson.c_name }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(dataJson.tempJson.c_time) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新人">
              {{ dataJson.tempJson.u_name }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDateTime(dataJson.tempJson.u_time) }}
            </el-descriptions-item>
            <el-descriptions-item label="" />
            <el-descriptions-item label="" />
          </el-descriptions>
        </div>

      </el-form>
    </div>

  </div>
</template>

<style>
.el-alert {
  margin-top: 10px;
  margin-bottom: 10px;
}

.el-descriptions {
  margin-bottom: 10px;
}

.fontWeight {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}
</style>

<script>
import { getApi } from '@/api/40_business/settlement/settlement'
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
      default: null
    }
  },
  data () {
    return {
      dataJson: {
        tempJson: {
          id: this.data.id
        },
        doc_att: []
      },
      labelStyle: {
        'font-weight': 'bold',
        color: '#99a9bf',
        width: '120px'
      },
      contentStyle: {
        'font-size': '14px'
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
    }
  },
  created () {
    // 初始化数据
    this.initData()
  },
  methods: {
    // 初始化数据
    initData () {
      this.getDetail()
    },

    // 获取详情数据
    getDetail () {
      this.settings.loading = true
      getApi({ id: this.data.id }).then(response => {
        this.dataJson.tempJson = response.data
        // 处理附件数据
        if (this.dataJson.tempJson.doc_att) {
          this.dataJson.doc_att = this.dataJson.tempJson.doc_att
        }
        // 处理作废附件数据
        if (this.dataJson.tempJson.cancel_doc_att) {
          this.dataJson.tempJson.cancel_doc_att_files = this.dataJson.tempJson.cancel_doc_att
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 移除附件文件
    removeOtherFile (data) {
      // 查看模式下不允许删除
    }
  }
}
</script>
