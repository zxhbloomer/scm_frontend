<script src="index_mixin.js"></script>
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
        <el-alert
          v-if="dataJson.tempJson.status === constants_para.DICT_B_PROJECT_STATUS_FOUR || dataJson.tempJson.status === constants_para.DICT_B_PROJECT_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_para.DICT_B_PROJECT_STATUS_FOUR || dataJson.tempJson.status === constants_para.DICT_B_PROJECT_STATUS_FIVE"
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

          <el-descriptions-item label="项目编号">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 10px;">{{ dataJson.tempJson.code == null || dataJson.tempJson.code === ''?'系统自动生成':dataJson.tempJson.code }}</span>
              <el-button
                type="primary"
                size="mini"
                @click="handleViewDataChangeLog"
              >
                数据日志
              </el-button>
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="项目名称">
            {{ dataJson.tempJson.name }}
          </el-descriptions-item>

          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="上游供应商">
            {{ dataJson.tempJson.supplier_name }}
          </el-descriptions-item>

          <el-descriptions-item label="下游客户">
            {{ dataJson.tempJson.purchaser_name }}
          </el-descriptions-item>

          <el-descriptions-item label="融资主体">
            {{ dataJson.tempJson.financier_name }}
          </el-descriptions-item>

          <el-descriptions-item label="运输方式">
            {{ dataJson.tempJson.delivery_type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="交货地点">
            {{ dataJson.tempJson.delivery_location }}
          </el-descriptions-item>

          <el-descriptions-item label="备注">
            {{ dataJson.tempJson.remark }}
          </el-descriptions-item>

        </el-descriptions>

        <el-alert
          title="商品明细"
          type="info"
          :closable="false"
        />
        <el-table
          :data="dataJson.tempJson.detailListData"
          height="200px"
          stripe
          border
          fit
          highlight-current-row
          style="width: calc(100% - 20px )"
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
            label="物料编码"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="goods_name"
            label="商品名称"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="50"
            prop="pm"
            label="品名"
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
            label="项目数量"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.qty == null? '-' : formatNumber(scope.row.qty,true,4) }}
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
              {{ scope.row.price == null? '': formatCurrency(scope.row.price, true) }}
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
              {{ scope.row.amount == null?'': formatCurrency(scope.row.amount,true) }}
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
          >
            <template v-slot="scope">
              {{ scope.row.origin == null ? '': scope.row.origin }}
            </template>
          </el-table-column>
        </el-table>

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
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="付款方式">
            {{ dataJson.tempJson.payment_method_name == null?'-':dataJson.tempJson.payment_method_name }}
          </el-descriptions-item>

          <el-descriptions-item label="是否有账期/天数">
            {{ dataJson.tempJson.payment_days == null?'-':dataJson.tempJson.payment_days }}
          </el-descriptions-item>

          <el-descriptions-item label="项目周期">
            {{ dataJson.tempJson.project_cycle == null?'-':dataJson.tempJson.project_cycle }}
          </el-descriptions-item>

          <el-descriptions-item label="融资额度">
            <span class="fontWeight">
              {{ dataJson.tempJson.amount == null || dataJson.tempJson.amount === ''?'-':formatCurrency(dataJson.tempJson.amount,true) }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item label="费率">
            <span class="fontWeight">
              {{ dataJson.tempJson.rate == null?'-':dataJson.tempJson.rate + '%' }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item />
        </el-descriptions>

        <el-alert
          title="项目说明"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >
          <el-descriptions-item label="项目说明" :label-style="{ width: '2%' }">
            {{ dataJson.tempJson.project_remark }}
          </el-descriptions-item>
        </el-descriptions>

        <el-alert
          title="项目附件材料"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="1"
          :label-style="fileLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="附件材料">
            <preview-description :attachment-files="dataJson.tempJson.doc_att_files" />
          </el-descriptions-item>
        </el-descriptions>

      </el-form>
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
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/project/project'
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
  },
  data () {
    return {
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
        unwatch_tempJson: null,
        unwatch_actual_count: null,
        unwatch_actual_price: null,
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
          detailListData: []
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
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
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.detailListData = [...response.data.detailListData]
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

    // 查看数据日志
    handleViewDataChangeLog () {
      console.log('查看数据日志被点击，项目ID:', this.dataJson.tempJson.id, '项目编号:', this.dataJson.tempJson.code)
      // 设置弹出框数据，传入项目编号作为order_code参数
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
