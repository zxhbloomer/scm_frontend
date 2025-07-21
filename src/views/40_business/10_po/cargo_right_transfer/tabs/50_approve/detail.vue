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
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_FIVE"
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
            <preview-description :attachment-files="dataJson.tempJson.cancel_doc_att_files" />
          </el-descriptions-item>
          <el-descriptions-item label="作废提交时间">
            {{ formatDateTime(dataJson.tempJson.cancel_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="作废提交人">
            {{ dataJson.tempJson.cancel_name || '-' }}
          </el-descriptions-item>
        </el-descriptions>

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

          <el-descriptions-item label="货权转移编号">
            {{ dataJson.tempJson.code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(dataJson.tempJson.status)">
              {{ dataJson.tempJson.status_name || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="" />

          <el-descriptions-item label="关联采购订单">
            {{ dataJson.tempJson.po_order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联采购合同">
            {{ dataJson.tempJson.po_contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="项目编号">
            {{ dataJson.tempJson.project_code || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.purchaser_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="" />

          <el-descriptions-item label="货转日期">
            {{ formatDateTime(dataJson.tempJson.transfer_date) }}
          </el-descriptions-item>
          <el-descriptions-item label="货转地点" :span="2">
            {{ dataJson.tempJson.transfer_location || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" :span="3">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="转移总金额">
            <span class="fontWeight">
              {{ dataJson.tempJson.total_amount == null || dataJson.tempJson.total_amount === '' ? '-' : formatCurrency(dataJson.tempJson.total_amount, true) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="转移总数量（吨）">
            <span class="fontWeight">
              {{ dataJson.tempJson.total_qty == null || dataJson.tempJson.total_qty === '' ? '-' : formatNumber(dataJson.tempJson.total_qty, true, 4) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="" />

          <el-descriptions-item label="附件材料" :span="3">
            <preview-description :attachment-files="dataJson.tempJson.doc_att_files" />
          </el-descriptions-item>

        </el-descriptions>

        <!--货权转移货物明细-->
        <el-alert
          title="货权转移-商品信息"
          type="info"
          :closable="false"
        />
        <div style="padding-left: 10px; padding-right: 10px;">
          <el-table
            :data="dataJson.tempJson.detailListData"
            border
            stripe
            style="width: 100%;"
            :height="tableHeight"
          >
            <el-table-column
              align="center"
              type="index"
              width="60"
              label="序号"
            />
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="sku_code"
              label="商品编号"
            >
              <template v-slot="scope">
                {{ scope.row.sku_code || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="goods_name"
              label="商品名称"
            >
              <template v-slot="scope">
                {{ scope.row.goods_name || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="130"
              prop="sku_name"
              label="规格"
            >
              <template v-slot="scope">
                {{ scope.row.sku_name || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="order_qty"
              label="订单数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_qty == null ? '-' : formatNumber(scope.row.order_qty, true, 4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="order_price"
              label="订单单价"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_price == null ? '-' : formatCurrency(scope.row.order_price, true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="order_amount"
              label="订单金额"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_amount == null ? '-' : formatCurrency(scope.row.order_amount, true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              prop="origin"
              label="产地"
            >
              <template v-slot="scope">
                {{ scope.row.origin || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="transfer_qty"
              label="转移数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.transfer_qty == null ? '-' : formatNumber(scope.row.transfer_qty, true, 4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="transfer_price"
              label="转移单价"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.transfer_price == null ? '-' : formatCurrency(scope.row.transfer_price, true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="transfer_amount"
              label="转移金额"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.transfer_amount == null ? '-' : formatCurrency(scope.row.transfer_amount, true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="batch_no"
              label="批次号"
            >
              <template v-slot="scope">
                {{ scope.row.batch_no || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="production_date"
              label="生产日期"
            >
              <template v-slot="scope">
                {{ scope.row.production_date || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="expiry_date"
              label="有效期"
            >
              <template v-slot="scope">
                {{ scope.row.expiry_date || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="160"
              prop="remark"
              label="备注"
            >
              <template v-slot="scope">
                {{ scope.row.remark || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import { getApi } from '@/api/40_business/10_po/cargo_right_transfer/cargorighttransfer'

export default {
  components: { PreviewDescription },
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
      settings: {
        duration: constants_para.DURATION,
        rules: {}
      },
      dataJson: {
        // 单条数据json - 包含完整的字段初始化以确保Vue响应式系统正常工作
        tempJson: {
          // 基础信息字段
          id: null,
          code: '',
          status: null,
          status_name: '', // 状态名称
          detailListData: [],

          // 采购订单相关
          po_order_id: null,
          po_order_code: '',
          po_contract_id: null,
          po_contract_code: '',
          project_code: '',

          // 企业信息
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          purchaser_id: null,
          purchaser_name: '',
          purchaser_code: '',

          // 转移信息
          transfer_date: '',
          transfer_location: '',
          transferor_name: '', // 转让方名称（查看页面特有）
          transferee_name: '', // 受让方名称（查看页面特有）
          total_amount: 0,
          total_qty: 0,

          // 货物信息
          quality_status: null, // 货物质量状态（查看页面特有）
          quality_status_name: '', // 货物质量状态名称
          warehouse_name: '', // 货物所在仓库（查看页面特有）

          // 备注
          remark: '',

          // 附件材料
          doc_att_files: [], // 附件文件列表

          // 作废相关（查看页面特有）
          cancel_reason: '', // 作废理由
          cancel_doc_att_files: [], // 作废附件
          cancel_time: '', // 作废提交时间
          cancel_name: '', // 作废提交人

          // 系统字段
          c_time: '', // 创建时间
          c_name: '', // 创建人
          u_time: '', // 修改时间
          u_name: '', // 修改人
          dbversion: null // 数据版本
        },

        // 附件相关字段 - 与新增页面保持一致
        doc_att: [], // 附件对象数组
        doc_att_file: [], // 附件URL数组
        doc_att_files: [] // 附件文件数组
      },
      // 表格高度
      tableHeight: 300,
      // 样式设置
      labelStyle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#606266'
      },
      contentStyle: {
        fontSize: '14px',
        color: '#303133'
      }
    }
  },
  computed: {
    constants_dict () {
      return constants_dict
    },
    constants_para () {
      return constants_para
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 初始化
    init () {
      this.getData()
    },

    // 获取数据
    getData () {
      getApi({ id: this.data.id }).then(response => {
        if (response.success) {
          this.dataJson.tempJson = response.data
          this.dataJson.tempJson.detailListData = response.data.detailListData || response.data.item_list || []
        } else {
          this.$message.error(response.message)
        }
      }).catch(error => {
        console.error('获取货权转移数据失败:', error)
        this.$message.error('获取数据失败')
      })
    },

    // 获取状态标签类型
    getStatusTagType (status) {
      const statusMap = {
        [constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_ONE]: 'info', // 草稿
        [constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_TWO]: 'warning', // 审批中
        [constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_THREE]: 'success', // 已完成
        [constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_FOUR]: 'danger', // 已作废
        [constants_dict.DICT_B_PO_CARGO_RIGHT_TRANSFER_STATUS_FIVE]: 'danger' // 已拒绝
      }
      return statusMap[status] || 'info'
    }

  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.el-descriptions {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 10px;
}

.required-mark::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
</style>
