<template>
  <div class="app-container">
    <div class="edit-container">
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="right"
        status-icon
      >
        <!-- 新增的基本信息区域 - 使用el-collapse样式 -->
        <el-collapse v-model="dataJson.activeNames">
          <el-collapse-item
            title="付款基本信息"
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
              <el-descriptions-item label="应付账款编号">
                {{ dataJson.tempJson.code }}
              </el-descriptions-item>
              <el-descriptions-item label="业务类型">
                {{ dataJson.tempJson.type_name }}
              </el-descriptions-item>
              <el-descriptions-item />
              <el-descriptions-item label="主体企业（付款方）">
                {{ dataJson.tempJson.purchaser_name }}
              </el-descriptions-item>
              <el-descriptions-item label="供应商（收款方）">
                {{ dataJson.tempJson.supplier_name }}
              </el-descriptions-item>
              <el-descriptions-item label="付款状态">
                {{ dataJson.tempJson.pay_status_name == null ? '-': dataJson.tempJson.pay_status_name }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>
        </el-collapse>
        <!-- 原有的付款信息区域 -->
        <el-alert
          title="付款信息"
          type="info"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />
        <div
          class="div-sum"
        >
          <div class="right">
            <span class="count-title">付款指令合计金额：</span>
            <span class="count-data">{{ formatCurrency(payAmountSum, true) }}</span>
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
            label="付款账户名"
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
            prop="payable_amount"
            label="计划付款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.payable_amount == null? '': formatCurrency(scope.row.payable_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="paid_amount"
            label="已付款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.paid_amount == null? '': formatCurrency(scope.row.paid_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="paying_amount"
            label="付款中金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.paying_amount == null? '': formatCurrency(scope.row.paying_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="unpay_amount"
            label="未付款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.unpay_amount == null? '': formatCurrency(scope.row.unpay_amount, true) }}
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
            prop="pay_amount"
            label="付款指令金额"
            align="right"
            fixed="right"
          >
            <template v-slot="scope">
              <span>{{ scope.row.pay_amount == null ? '' : formatCurrency(scope.row.pay_amount, true) }}</span>
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
          <el-descriptions-item label="付款日期">
            <span>{{ dataJson.tempJson.pay_date ? dataJson.tempJson.pay_date : '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="付款指令附件材料">
            <PreviewDescription :attachment-files="dataJson.tempJson.payment_doc_att_files" />
          </el-descriptions-item>
          <el-descriptions-item label="付款单备注">
            <span>{{ dataJson.tempJson.remark ? dataJson.tempJson.remark : '-' }}</span>
          </el-descriptions-item>
          <!-- 凭证附件区域 -->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              凭证附件
            </div>
            <el-form-item
              prop="voucher_files"
            >
              <SimpleUploadMutilFile
                :accept="'*'"
                @upload-success="handleVoucherUploadSuccess"
                @upload-error="handleFileError"
              />
              <el-row style="margin-top: 10px;">
                <el-col
                  v-for="(item, i) in dataJson.voucher_files"
                  :key="i"
                  :span="5"
                >
                  <previewCard
                    :file-name="item.fileName"
                    :url="item.url"
                    :time="item.timestamp"
                    @removeFile="removeVoucherFile(item)"
                  />
                </el-col>
              </el-row>
            </el-form-item>
          </el-descriptions-item>
          <!-- 凭证备注 -->
          <el-descriptions-item label="凭证备注">
            <el-input
              v-model.trim="dataJson.tempJson.voucher_remark"
              type="textarea"
              clearable
              show-word-limit
              placeholder="请输入凭证备注"
            />
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </div>

    <!-- 审批流程设置：选择人 -->
    <!--    <bmp-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="CONSTANTS.DICT_B_AP"
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
import { getApi, payCompleteApi } from '@/api/40_business/10_po/appay/appay'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import previewCard from '@/components/50_preview_card/preview_card.vue'

export default {
  directives: { elDragDialog },
  components: { SimpleUploadMutilFile, PreviewDescription, previewCard },
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
        // 付款附件材料
        payment_doc_att_files: [],
        typeListDate: [],
        sumData: {
          sum_pay_amount_total: 0,
          unpay_amount_total: 0
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
        },
        voucher_files: [] // 新增凭证文件数组
      },
      // 页面设置json
      settings: {
        loading: true,
        rules: {
          voucher_files: [
            { required: true, message: '请上传凭证附件', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    payAmountSum () {
      // 合计所有银行账户明细的付款指令金额
      if (!this.dataJson.tempJson.detailListData) return 0
      return this.dataJson.tempJson.detailListData.reduce((sum, item) => {
        const val = Number(item.pay_amount)
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
        // 初始化付款附件数据
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.tempJson.payment_doc_att_files = [...response.data.doc_att_files]
        } else {
          this.dataJson.tempJson.payment_doc_att_files = []
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
      if (row.payable_amount) {
        row.pay_amount = row.payable_amount
      } else {
        this.$message.warning('当前行的计划付款金额为空，无法执行全额操作')
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
      this.dataJson.voucher_files = this.dataJson.voucher_files || []
      this.dataJson.voucher_files.push(res.response.data)
      this.dataJson.tempJson.voucher_files = this.dataJson.voucher_files
    },
    removeVoucherFile (file) {
      const idx = this.dataJson.voucher_files.findIndex(f => f.url === file.url)
      if (idx !== -1) {
        this.dataJson.voucher_files.splice(idx, 1)
        this.dataJson.tempJson.voucher_files = this.dataJson.voucher_files
      }
    },
    payComplete () {
      this.dataJson.tempJson.voucher_files = this.dataJson.voucher_files

      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          payCompleteApi(this.dataJson.tempJson).then(response => {
            this.$notify({
              title: '完成付款',
              message: response.data.message,
              type: 'success',
              duration: this.settings.duration
            })
            this.$emit('closeMeOk')
          }).catch(error => {
            this.showErrorMsg(error.message)
          })
        } else {
          this.closeLoading()
        }
      })
    }
  }
}
</script>
