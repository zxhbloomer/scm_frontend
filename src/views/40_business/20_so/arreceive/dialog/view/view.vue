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
        <!-- 新增的基本信息区域 - 使用el-collapse样式 -->
        <el-collapse v-model="dataJson.activeNames">
          <el-collapse-item
            title="收款基本信息"
            class="collapse-info"
            name="basicInfo"
          >
            <el-descriptions
              title=""
              :column="3"
              :label-style="labelStyle"
              :content-style="contentStyle"
              direction="horizontal"
              style="padding-right: 10px;padding-left: 10px;"
              border
            >
              <el-descriptions-item label="应收账款编号">
                {{ dataJson.tempJson.ar_code }}
              </el-descriptions-item>
              <el-descriptions-item label="业务类型">
                {{ dataJson.tempJson.type_name }}
              </el-descriptions-item>
              <el-descriptions-item />
              <el-descriptions-item label="主体企业（收款方）">
                {{ dataJson.tempJson.seller_name }}
              </el-descriptions-item>
              <el-descriptions-item label="客户（付款方）">
                {{ dataJson.tempJson.customer_name }}
              </el-descriptions-item>
              <el-descriptions-item label="收款状态">
                {{ dataJson.tempJson.receive_status_name == null ? '-': dataJson.tempJson.receive_status_name }}
              </el-descriptions-item>
              <el-descriptions-item label="备注" span="3">
                {{ dataJson.tempJson.remark == null ? '-': dataJson.tempJson.remark }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>
        </el-collapse>
        <!-- 作废区域显示 -->
        <el-alert
          v-if="dataJson.tempJson.status === '2'"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />
        <el-descriptions
          v-if="dataJson.tempJson.status === '2'"
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
            <PreviewDescription :attachment-files="dataJson.tempJson.cancel_doc_att_files" />
          </el-descriptions-item>
          <el-descriptions-item label="作废提交时间">
            {{ dataJson.tempJson.cancel_time || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="作废提交人">
            {{ dataJson.tempJson.cancel_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
        </el-descriptions>
        <div style="margin-bottom: 10px" />
        <!-- 原有的收款信息区域 -->
        <el-alert
          title="收款信息"
          type="info"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />
        <div
          class="div-sum"
        >
          <div class="right">
            <span class="count-title">收款指令合计金额：</span>
            <span class="count-data">{{ formatCurrency(receiveAmountSum, true) }}</span>
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
          style="width: calc(100% - 20px);margin: 0 10px 10px 10px;"
        >
          <el-table-column
            type="index"
            width="45"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="130"
            prop="name"
            label="收款账户名"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="200"
            label="开户行|银行账号"
          >
            <template v-slot="scope">
              <div>{{ scope.row.bank_name || '-' }}</div>
              <div>{{ scope.row.account_number || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="receivable_amount"
            label="计划收款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.receivable_amount == null? '': formatCurrency(scope.row.receivable_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="received_amount"
            label="已收款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.received_amount == null? '': formatCurrency(scope.row.received_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="receiving_amount"
            label="收款中金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.receiving_amount == null? '': formatCurrency(scope.row.receiving_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="unreceive_amount"
            label="未收款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.unreceive_amount == null? '': formatCurrency(scope.row.unreceive_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="remark"
            label="备注"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="200"
            prop="receive_amount"
            label="收款指令金额"
            align="right"
            fixed="right"
          >
            <template v-slot="scope">
              <span>{{ scope.row.receive_amount == null ? '' : formatCurrency(scope.row.receive_amount, true) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-descriptions
          title=""
          :column="1"
          :label-style="threeLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="收款日期">
            <span>{{ dataJson.tempJson.receive_date ? dataJson.tempJson.receive_date : '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收款指令附件材料">
            <PreviewDescription :attachment-files="dataJson.tempJson.receive_doc_att_files" />
          </el-descriptions-item>
          <el-descriptions-item label="收款单备注">
            <span>{{ dataJson.tempJson.remark ? dataJson.tempJson.remark : '-' }}</span>
          </el-descriptions-item>
          <!-- 凭证附件区域 -->
          <el-descriptions-item label="凭证附件">
            <PreviewDescription
              :attachment-files="dataJson.tempJson.voucher_files"
            />
          </el-descriptions-item>
          <!-- 凭证备注 -->
          <el-descriptions-item label="凭证备注">
            <span>{{ dataJson.tempJson.voucher_remark ? dataJson.tempJson.voucher_remark : '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </div>

    <!-- 审批流程设置：选择人 -->
    <!--    <bmp-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="CONSTANTS.DICT_B_AR"
      @closeMeCancel="handleBmpDialogCancel"
      @closeMeOk="handleBmpDialogOk"
    />-->

  </div>
</template>

<style scoped>
.edit-container {
  overflow-x: auto;
}
.el-form-item .el-select {
  width: 100%;
}

.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}

::v-deep .el-collapse-item__header {
  background-color: #f4f4f5;
  height: 34px;
  color: #909399;
  padding-left: 25px;
  border-radius: 4px;
  margin-bottom: 10px;
}

::v-deep .el-collapse-item__wrap .el-collapse-item__content {
  padding-bottom: 10px;
}

.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.el-descriptions {
  //margin-top: 10px;
}
.div-sum {
  margin-left: 10px;
  width: calc(100% - 20px);
  height: 35px;
  padding: 5px 5px;
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
  margin-right: 10px;
}
.count-data {
  color: #1890ff;
  font-size: 20px;
}
.count-title {
  margin-left: 10px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/20_so/arreceive/arreceive'
import PreviewDescription from '@/components/51_preview_description/index.vue'

export default {
  directives: { elDragDialog },
  components: { PreviewDescription },
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
      default: ''
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
      twoLabelStyle: {
        width: '5.5%',
        'text-align': 'right'
      },
      threeLabelStyle: {
        width: '2.3%',
        'text-align': 'right'
      },
      dataJson: {
        // 折叠面板默认关闭值（页面打开时收缩状态）
        activeNames: ['basicInfo'],
        // 附件
        push_att: [],
        push_file: [],
        push_files: [],
        // 收款附件材料
        receive_doc_att_files: [],
        typeListDate: [],
        sumData: {
          sum_receive_amount_total: 0,
          unreceive_amount_total: 0
        },
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {},
        // 单条数据 json
        tempJson: {},
        searchForm: {
          reset: false
        },
        inputSettings: {
          maxLength: {
            remark: 100
          }
        }
      },
      // 页面设置json
      settings: {
        loading: true
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    receiveAmountSum () {
      // 合计所有银行账户明细的收款指令金额
      if (!this.dataJson.tempJson.detailListData) return 0
      return this.dataJson.tempJson.detailListData.reduce((sum, item) => {
        const val = Number(item.receive_amount)
        return sum + (isNaN(val) ? 0 : val)
      }, 0)
    }
  },
  created () {
    this.init()
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    async init () {
      this.getData()
      this.settings.loading = false
    },
    getData () {
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        // 初始化收款附件数据
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.tempJson.receive_doc_att_files = [...response.data.doc_att_files]
        } else {
          this.dataJson.tempJson.receive_doc_att_files = []
        }
        if (response.data.voucher_files && response.data.voucher_files.length > 0) {
          this.dataJson.tempJson.voucher_files = [...response.data.voucher_files]
        } else {
          this.dataJson.tempJson.voucher_files = []
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    unWatch () {},
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 其他附件上传成功
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.push_att.push(res.response.data)
      this.dataJson.push_file.push(res.response.data.url)
      this.dataJson.tempJson.push_files = this.dataJson.push_att
    },
    handleFullAmountApply (row) {
      if (row.receivable_amount) {
        row.receive_amount = row.receivable_amount
      } else {
        this.$message.warning('当前行的计划收款金额为空，无法执行全额操作')
      }
    },
    handleFileError () {
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    handleVoucherUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.push_att.push(res.response.data)
      this.dataJson.push_file.push(res.response.data.url)
      this.dataJson.tempJson.push_files = this.dataJson.push_att
    }
  }
}
</script>
