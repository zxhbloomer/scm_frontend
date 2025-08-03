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
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_OUT_PLAN_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_OUT_PLAN_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_OUT_PLAN_STATUS_FOUR || dataJson.tempJson.status === constants_dict.DICT_B_OUT_PLAN_STATUS_FIVE"
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
          <el-descriptions-item label="计划编号">
            {{ dataJson.tempJson.code == null || dataJson.tempJson.code === '' ? '系统自动生成' : dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="出库类型" span="2">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="货主">
            {{ dataJson.tempJson.owner_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="计划出库时间">
            {{ dataJson.tempJson.plan_time || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="超发比例(%)">
            {{ dataJson.tempJson.over_delivery_rate == null ? '-' : formatNumber(dataJson.tempJson.over_delivery_rate, true, 2) }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" span="3">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="附件材料" span="3">
            <preview-description :attachment-files="dataJson.tempJson.doc_att_files" />
          </el-descriptions-item>
        </el-descriptions>

        <!-- 出库货物明细 -->
        <el-alert
          title="出库货物明细"
          type="info"
          :closable="false"
        />

        <el-table
          ref="multipleTable"
          v-loading="settings.loading"
          :data="dataJson.tempJson.detailListData"
          :element-loading-text="'正在拼命加载中...'"
          element-loading-background="rgba(255, 255, 255, 0.5)"
          height="350px"
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
            fixed="left"
          />

          <!-- 合同订单信息 -->
          <el-table-column label="合同订单信息" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              label="合同编号｜订单编号"
              align="left"
            >
              <template v-slot="scope">
                <div style="line-height: 1.2;">
                  <div>{{ scope.row.contract_code || '-' }}</div>
                  <div>{{ scope.row.order_code || '-' }}</div>
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
              min-width="120"
              prop="supplier_name"
              label="供应商"
              align="left"
            >
              <template v-slot="scope">
                {{ scope.row.supplier_name || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="order_qty"
              label="订单数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.order_qty == null? '-' : formatNumber(scope.row.order_qty,true,4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="80"
              prop="unit"
              label="单位"
              align="center"
            >
              <template v-slot="scope">
                {{ scope.row.unit_name || scope.row.unit || '吨' }}
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

          <!-- 历史出库 -->
          <el-table-column label="历史出库" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="processed_qty"
              label="已出库数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.processed_qty == null? '-' : formatNumber(scope.row.processed_qty,true,4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="unprocessed_qty"
              label="待出库数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.unprocessed_qty == null? '-' : formatNumber(scope.row.unprocessed_qty,true,4) }}
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 本次出库计划 -->
          <el-table-column label="本次出库计划" align="center">
            <el-table-column
              show-overflow-tooltip
              min-width="120"
              prop="qty"
              label="出库数量"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.qty == null? '-' : formatNumber(scope.row.qty,true,4) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="100"
              prop="price"
              label="出库单价"
              align="right"
            >
              <template v-slot="scope">
                {{ scope.row.price == null? '-' : formatCurrency(scope.row.price,true) }}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              min-width="150"
              label="仓库/库区/库位"
              align="left"
            >
              <template v-slot="scope">
                <div style="line-height: 1.2;">
                  <div>{{ scope.row.warehouse_name || '-' }}</div>
                  <div>{{ scope.row.location_name || '-' }}</div>
                  <div>{{ scope.row.bin_name || '-' }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 备注 -->
          <el-table-column
            show-overflow-tooltip
            min-width="100"
            prop="remark"
            label="备注"
            align="left"
          >
            <template v-slot="scope">
              {{ scope.row.remark || '-' }}
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
import { getApi } from '@/api/40_business/40_out/outplan/outplan'
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
          detailListData: [],
          code: '',
          type: '',
          type_name: '',
          owner_id: null,
          owner_name: '',
          owner_code: '',
          plan_time: null,
          over_delivery_rate: null,
          remark: '',
          plan_total: 0,
          so_order_id: null,
          so_order_code: '',
          so_contract_code: '',
          project_code: '',
          status: '',
          status_name: '',
          consignor_name: '',
          next_approve_name: '',
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
          doc_att_files: []
        },
        // 附件列表
        doc_att: [],
        doc_att_file: [],
        doc_att_files: []
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
     * 处理行点击
     */
    handleRowClick (row, column, event) {
      console.log('Row clicked:', row)
    },

    /**
     * 处理当前行变化
     */
    handleCurrentChange (currentRow, oldCurrentRow) {
      console.log('Current row changed:', currentRow)
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
