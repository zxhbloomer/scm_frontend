<template>
  <div class="app-container">
    <div>
      <el-form
        ref="dataSubmitForm"
        :model="dataJson.tempJson"
        label-position="right"
        label-width="150px"
        status-icon
      >
        <!-- 作废信息 -->
        <el-alert
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_OUT_STATUS_CANCEL || dataJson.tempJson.status === constants_dict.DICT_B_OUT_STATUS_CANCEL_BEING_AUDITED"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_OUT_STATUS_CANCEL || dataJson.tempJson.status === constants_dict.DICT_B_OUT_STATUS_CANCEL_BEING_AUDITED"
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
          <el-descriptions-item label="出库单编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === '' ? '系统自动生成' : dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="出库类型" span="2">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="货主">
            {{ dataJson.tempJson.owner_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item />

          <el-descriptions-item label="备注" span="3">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 合同、订单信息 -->
        <el-alert
          v-if="dataJson.tempJson.contract_code"
          title="合同、订单信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.contract_code"
          title=""
          :column="3"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="合同编号">
            {{ dataJson.tempJson.contract_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.po_contract_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="供应商">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业">
            {{ dataJson.tempJson.purchaser_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="付款方式">
            {{ dataJson.tempJson.payment_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="结算方式">
            {{ dataJson.tempJson.settle_type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="交货日期">
            {{ dataJson.tempJson.delivery_date || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="交货地点" :span="2">
            {{ dataJson.tempJson.delivery_location || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ dataJson.tempJson.order_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            {{ dataJson.tempJson.po_order_status_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="运输方式">
            {{ dataJson.tempJson.delivery_type_name || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 出库信息 -->
        <el-alert
          title="出库信息"
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
          <el-descriptions-item label="商品规格编号">
            {{ dataJson.tempJson.sku_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">
            {{ dataJson.tempJson.goods_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="规格">
            {{ dataJson.tempJson.sku_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="仓库 / 库区 / 库位">
            {{ dataJson.tempJson.warehouse_location_bin_display || [dataJson.tempJson.warehouse_name, dataJson.tempJson.location_name, dataJson.tempJson.bin_name].filter(item => item).join(' / ') || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="原发数量">
            {{ dataJson.tempJson.original_qty == null ? '-' : formatNumber(dataJson.tempJson.original_qty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item />

          <el-descriptions-item label="出库时间">
            {{ formatDateTime(dataJson.tempJson.outbound_time) || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="出库数量">
            {{ dataJson.tempJson.qty == null ? '-' : formatNumber(dataJson.tempJson.qty, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="出库单价">
            {{ dataJson.tempJson.price == null ? '-' : formatCurrency(dataJson.tempJson.price, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="出库金额">
            {{ dataJson.tempJson.amount == null ? '-' : formatCurrency(dataJson.tempJson.amount, true) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 附件信息 -->
        <el-alert
          title="附件信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style=" { width: '2.3%', 'text-align': 'right' }"
          :content-style="{ width: '15%'}"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="磅单文件" span="3">
            <preview-description :attachment-files="dataJson.tempJson.one_file" />
          </el-descriptions-item>

          <el-descriptions-item label="出库附件明细" span="3">
            <preview-description :attachment-files="dataJson.tempJson.two_file" />
          </el-descriptions-item>

          <el-descriptions-item label="检验单" span="3">
            <preview-description :attachment-files="dataJson.tempJson.three_file" />
          </el-descriptions-item>

          <el-descriptions-item label="货物照片" span="3">
            <preview-description :attachment-files="dataJson.tempJson.four_file" />
          </el-descriptions-item>
        </el-descriptions>

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
  margin-top: 10px;
  margin-left: 10px;
}
.el-table {
  margin: 10px;
}
.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import constants_dict from '@/common/constants/constants_dict'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/40_out/out/out'
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
      default: 'view'
    }
  },
  data () {
    return {
      constants_para,
      constants_dict,
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
      settings: {
        loading: false,
        rules: {}
      },
      dataJson: {
        // 单条数据 json
        tempJson: {
          code: '',
          type: '',
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          supplier_id: null,
          supplier_name: '',
          supplier_code: '',
          consignor_name: '',
          contract_id: null,
          contract_code: '',
          po_contract_type: '',
          po_contract_type_name: '',
          order_id: null,
          order_code: '',
          po_order_status: '',
          po_order_status_name: '',
          po_order_delivery_type: '',
          delivery_type_name: '',
          purchaser_name: '',
          po_contract_payment_type: '',
          payment_type_name: '',
          po_contract_settle_type: '',
          settle_type_name: '',
          delivery_date: '',
          delivery_location: '',
          sku_id: null,
          sku_code: '',
          goods_name: '',
          sku_name: '',
          warehouse_id: null,
          warehouse_code: '',
          warehouse_name: '',
          location_id: null,
          location_code: '',
          location_name: '',
          bin_id: null,
          bin_code: '',
          bin_name: '',
          warehouse_location_bin_display: '',
          original_qty: null,
          qty: null,
          price: null,
          amount: null,
          outbound_time: null,
          remark: '',
          status: '',
          status_name: '',
          c_name: '',
          c_time: '',
          u_name: '',
          u_time: '',
          bpm_instance_code: '',
          bpm_process_name: '',
          dbversion: null,
          cancel_reason: '',
          cancel_name: '',
          cancel_time: '',
          cancel_doc_att_files: [],
          one_file: [],
          two_file: [],
          three_file: [],
          four_file: []
        },
        // 附件列表
        one_file: [],
        one_file_url: [],
        two_file: [],
        two_file_url: [],
        three_file: [],
        three_file_url: [],
        four_file: [],
        four_file_url: []
      }
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
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        // 处理附件数据
        this.dataJson.one_file = this.dataJson.tempJson.one_file || []
        this.dataJson.two_file = this.dataJson.tempJson.two_file || []
        this.dataJson.three_file = this.dataJson.tempJson.three_file || []
        this.dataJson.four_file = this.dataJson.tempJson.four_file || []
      }).finally(() => {
        this.settings.loading = false
      })
    },

    /**
     * 获取状态标签类型
     */
    getStatusTagType (status) {
      const statusMap = {
        'SUBMITTED': 'warning',
        'APPROVED': 'success',
        'RETURN': 'danger',
        'FINISH': 'info',
        'CANCEL': 'info',
        'CANCEL_BEING_AUDITED': 'warning'
      }
      return statusMap[status] || 'info'
    },

    /**
     * 格式化日期时间
     */
    formatDateTime (dateTimeStr) {
      if (!dateTimeStr) return '-'
      try {
        const date = new Date(dateTimeStr)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return dateTimeStr
      }
    },

    /**
     * 格式化数字
     */
    formatNumber (value, useComma = false, decimalPlaces = 2) {
      if (value === null || value === undefined || value === '') {
        return '0'
      }
      const num = parseFloat(value)
      if (isNaN(num)) {
        return '0'
      }
      if (useComma) {
        return num.toLocaleString('zh-CN', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        })
      } else {
        return num.toFixed(decimalPlaces)
      }
    },

    /**
     * 格式化货币
     */
    formatCurrency (value, showSymbol = false) {
      if (value === null || value === undefined || value === '') {
        return showSymbol ? '¥0.00' : '0.00'
      }
      const num = parseFloat(value)
      if (isNaN(num)) {
        return showSymbol ? '¥0.00' : '0.00'
      }
      const formatted = num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      return showSymbol ? `¥${formatted}` : formatted
    }
  }
}
</script>
