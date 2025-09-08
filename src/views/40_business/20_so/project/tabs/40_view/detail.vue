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
          title="基本信息"
          type="info"
          :closable="false"
        />
        <el-descriptions
          title=""
          :column="3"
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="项目编号">
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

          <el-descriptions-item label="项目名称">
            {{ dataJson.tempJson.name }}
          </el-descriptions-item>

          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.type_name }}
          </el-descriptions-item>

          <el-descriptions-item label="上游供应商（主体企业）">
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

          <el-descriptions-item label="交货地点" :span="2">
            {{ dataJson.tempJson.delivery_location }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" :span="3">
            {{ dataJson.tempJson.remark }}
          </el-descriptions-item>

        </el-descriptions>
        <el-alert
          title="商品明细"
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
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="付款方式">
            {{ dataJson.tempJson.payment_method_name == null?'-':dataJson.tempJson.payment_method_name }}
          </el-descriptions-item>

          <el-descriptions-item label="是否有账期/天数">
            {{ dataJson.tempJson.payment_days == null ? '-' : dataJson.tempJson.payment_days }}
          </el-descriptions-item>

          <el-descriptions-item label="项目周期">
            {{ dataJson.tempJson.project_cycle == null ? '-' : dataJson.tempJson.project_cycle }}
          </el-descriptions-item>

          <el-descriptions-item label="融资额度">
            {{ dataJson.tempJson.amount == null ? '-' : formatCurrency(dataJson.tempJson.amount, true) }}
          </el-descriptions-item>

          <el-descriptions-item label="费率">
            {{ dataJson.tempJson.rate == null ? '-' : dataJson.tempJson.rate }}
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
          :content-style="contentStyle"
          :label-style="labelStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >

          <el-descriptions-item
            label="项目说明"
            :label-style="{ width: '2%' }"
          >
            {{ dataJson.tempJson.project_remark || '-' }}
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
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
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
  flex: 9; /* 或者你想要的更高的值，表示左边占据较多的空间 */
}

.right-side {
  flex: 1; /* 或者你想要的更低的值，表示右边占据较少的空间 */
  margin-left: 5px;
}
.fontWeight {
  font-weight: bold;
  color: #1890ff;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/project/project'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import DataChangeLogDialog from '@/views/10_system/datachangelogorder/tabs/dialog/info/index.vue'

export default {
  components: { PreviewDescription, DataChangeLogDialog },
  directives: { elDragDialog },
  mixins: [],
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // 监听器
      watch: {
        unwatch_tempJson: null,
        unwatch_actual_count: null,
        unwatch_actual_price: null
      },
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

      popSettingsData: {
      },
      // 数据日志弹出框控制
      dataChangeLogDialogVisible: false,
      dataChangeLogDialogData: null,
      dataJson: {
        // 商品列表数据
        detailListData: [],
        // 附件
        doc_att: [],
        doc_att_file: [],
        doc_att_files: [],

        searchForm: {
          reset: null
        },
        // 单条数据 json
        tempJson: {
          id: null,
          type: '',
          name: '',
          value: '',
          unit_id: null,
          unit_name: null,
          supplier_id: null,
          supplier_code: null,
          supplier_name: null,
          purchaser_id: null,
          purchaser_code: null,
          purchaser_name: null,
          goods_name: null,
          sku_id: null,
          contract_no: null,
          financier_name: '-',
          detailListData: []
        },
        inputSettings: {
          maxLength: {

            remark: 100
          }
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        duration: 4000,
        // pop的check内容
        rules: {
          name: [
            { required: true, message: '请输入项目名称', trigger: 'change' }
          ],
          supplier_name: [
            { required: true, message: '请选择上游供应商（主体企业）', trigger: 'change' }
          ],
          purchaser_name: [
            { required: true, message: '请选择下游客户', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请选择类型', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: { },
  // 监听器
  watch: {
  },
  created () {
  },
  mounted () {
    // 描绘完成
    this.init()
  },
  destroyed () {
    // 清理
  },
  methods: {
    // 初始化处理
    init () {
      this.settings.loading = false
      // 如果有传入id，则加载数据
      if (this.data && this.data.id) {
        this.getData()
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },

    // 获取数据
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi({ id: this.data.id }).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJson.idx = this.data.idx

        // 处理附件数据
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
