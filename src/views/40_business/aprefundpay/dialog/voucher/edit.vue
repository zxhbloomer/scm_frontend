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

        <!-- 作废区域 -->
        <el-alert
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_AP_REFUND_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_AP_REFUND_STATUS_FIVE"
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
            <preview-description :attachment-files="dataJson.tempJson.cancel_files" />
          </el-descriptions-item>
          <el-descriptions-item label="作废提交时间">
            {{ dataJson.tempJson.cancel_time ? formatDateTime(dataJson.tempJson.cancel_time) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="作废提交人">
            {{ dataJson.tempJson.cancel_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="" />
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
          <el-descriptions-item label="退款编号">
            {{ dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="业务类型">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="退款状态">
            {{ dataJson.tempJson.status_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业（付款方）">
            {{ dataJson.tempJson.purchaser_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="供应商（收款方）">
            {{ dataJson.tempJson.supplier_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="" />

          <el-descriptions-item label="备注" span="3">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="退款附件材料" span="3">
            <preview-description :attachment-files="dataJson.tempJson.doc_att_files" />
          </el-descriptions-item>

        </el-descriptions>
        <div style="margin-bottom: 10px" />
        <!-- 业务单据信息区域 - 使用el-collapse样式 -->
        <el-collapse v-model="dataJson.activeNames">
          <el-collapse-item
            title="业务单据信息"
            name="businessInfo"
          >
            <el-descriptions
              title=""
              :column="2"
              :label-style="twoLabelStyle"
              :content-style="contentStyle"
              direction="horizontal"
              border
              style="padding-right: 10px;padding-left: 10px;"
            >
              <el-descriptions-item label="申请退款总金额">
                {{ dataJson.tempJson.bankData.refundable_amount == null ? '-': formatCurrency(dataJson.tempJson.bankData.refundable_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="已退款总金额">
                {{ dataJson.tempJson.bankData.refunded_amount == null? '-': formatCurrency(dataJson.tempJson.bankData.refunded_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="未退款总金额">
                {{ dataJson.tempJson.bankData.unrefund_amount == null? '-': formatCurrency(dataJson.tempJson.bankData.unrefund_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="退款中金额">
                {{ dataJson.tempJson.bankData.refunding_amount == null? '-': formatCurrency(dataJson.tempJson.bankData.refunding_amount, true) }}
              </el-descriptions-item>
            </el-descriptions>
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
              <el-descriptions-item label="合同编号">
                {{ dataJson.tempJson.po_contract_code || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="订单编号">
                {{ dataJson.tempJson.po_order_code || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="商品名称">
                {{ dataJson.tempJson.po_goods || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="预付款已付金额">
                {{ (dataJson.tempJson.advance_paid_total || 0) == 0 ? '-': formatCurrency((dataJson.tempJson.advance_paid_total || 0) , true) }}
              </el-descriptions-item>
              <el-descriptions-item label="可退金额">
                {{ dataJson.tempJson.advance_refund_amount_total == null ? '-': formatCurrency(dataJson.tempJson.advance_refund_amount_total, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="本次申请退款金额">
                {{ dataJson.tempJson.source_order_amount == null ? '-': formatCurrency(dataJson.tempJson.source_order_amount, true) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>
        </el-collapse>

        <el-alert
          title="退款信息"
          type="info"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />
        <el-descriptions
          title=""
          :column="1"
          :label-style="threeLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="退款总金额">
            {{ dataJson.tempJson.detail_refund_amount == null ? '-': formatCurrency(dataJson.tempJson.detail_refund_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>
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
          <el-descriptions-item label="退款账户">
            {{ dataJson.tempJson.bankData.account_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="开户行">
            {{ dataJson.tempJson.bankData.bank_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="银行账户">
            {{ dataJson.tempJson.bankData.account_number || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ dataJson.tempJson.bankData.bank_type_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="计划退款金额">
            {{ dataJson.tempJson.bankData.refundable_amount == null ? '-': formatCurrency(dataJson.tempJson.bankData.refundable_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="已退款金额">
            {{ dataJson.tempJson.bankData.refunded_amount == null ? '-': formatCurrency(dataJson.tempJson.bankData.refunded_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="退款中金额">
            {{ dataJson.tempJson.bankData.refunding_amount == null ? '-': formatCurrency(dataJson.tempJson.bankData.refunding_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="未退款金额">
            {{ dataJson.tempJson.bankData.unrefund_amount == null ? '-': formatCurrency(dataJson.tempJson.bankData.unrefund_amount, true) }}
          </el-descriptions-item>
          <el-descriptions-item label="退款指令金额">
            {{ dataJson.tempJson.bankData.order_amount == null ? '-': formatCurrency(dataJson.tempJson.bankData.order_amount, true) }}
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-bottom: 10px" />
        <el-descriptions
          title=""
          :column="1"
          :label-style="threeLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="退款日期">
            {{ dataJson.tempJson.refund_date ? formatDateTime(dataJson.tempJson.refund_date) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="退款指令附件材料">
            <preview-description :attachment-files="dataJson.tempJson.push_files" />
          </el-descriptions-item>
          <el-descriptions-item label="退款单备注">
            {{ dataJson.tempJson.refund_remark || '-' }}
          </el-descriptions-item>
          <!-- 凭证附件区域 -->
          <el-descriptions-item>
            <div
              slot="label"
              class="required-mark"
            >
              退款凭证附件
            </div>
            <el-form-item
              prop="voucher_files"
              label-width="0"
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
            <el-form-item
              prop="voucher_remark"
              label-width="0"
            >
              <el-input
                v-model.trim="dataJson.tempJson.voucher_remark"
                type="textarea"
                clearable
                show-word-limit
                :maxlength="dataJson.inputSettings.maxLength.voucher_remark"
                placeholder="请输入凭证备注"
              />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </div>

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
import constants_dict from '@/common/constants/constants_dict'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi, refundCompleteAPi } from '@/api/40_business/aprefundpay/aprefundpay'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import previewCard from '@/components/50_preview_card/preview_card.vue'

export default {
  directives: { elDragDialog },
  components: { PreviewDescription, SimpleUploadMutilFile, previewCard },
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
      constants_dict,
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
        // 折叠面板默认收缩状态
        activeNames: [],
        // 附件
        push_att: [],
        push_file: [],
        push_files: [],
        // 退款附件材料
        refund_doc_att_files: [],
        typeListDate: [],
        sumData: {
          sum_refund_amount_total: 0,
          unrefund_amount_total: 0
        },
        // 凭证文件
        voucher_files: [],
        // 单条数据 json
        tempJson: {
          // 状态字段，避免undefined导致闪烁
          status: null,
          refund_status: null,
          refund_date: null,
          remark: null,
          refund_order_amount: 0,
          push_files: [],
          // 作废相关字段
          cancel_time: null,
          cancel_name: null,
          cancel_reason: null,
          cancel_files: [],
          // 银行账户信息（单个对象）
          bankData: {
            name: null,
            account_name: null,
            bank_name: null,
            account_number: null,
            bank_type_name: null,
            order_amount: 0,
            refundable_amount: null,
            refunded_amount: null,
            refunding_amount: null,
            unrefund_amount: null,
            remark: null
          }
        },
        searchForm: {
          reset: false
        },
        inputSettings: {
          maxLength: {
            remark: 100,
            voucher_remark: 200
          }
        }
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
  },
  // 监听器
  watch: {
    // 全屏loading
    'settings.loading': {
      handler (newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在查询，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  created () {
  },
  mounted () {
    this.init()
  },
  destroyed () {
  },
  methods: {
    // 初始化处理
    async init () {
      this.getData()
    },
    getData () {
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        // 确保 tempJson 基本字段存在
        if (!this.dataJson.tempJson.cancel_time) {
          this.dataJson.tempJson.cancel_time = null
        }
        if (!this.dataJson.tempJson.cancel_name) {
          this.dataJson.tempJson.cancel_name = null
        }
        if (!this.dataJson.tempJson.cancel_reason) {
          this.dataJson.tempJson.cancel_reason = null
        }
        if (!this.dataJson.tempJson.cancel_files) {
          this.dataJson.tempJson.cancel_files = []
        }

        // 确保 bankData 结构存在
        if (!this.dataJson.tempJson.bankData) {
          this.dataJson.tempJson.bankData = {
            name: null,
            account_name: null,
            bank_name: null,
            account_number: null,
            bank_type_name: null,
            order_amount: 0,
            refundable_amount: null,
            refunded_amount: null,
            refunding_amount: null,
            unrefund_amount: null,
            remark: null
          }
        }

        // 如果有银行账户数据，映射到 bankData
        if (response.data.bankListData && response.data.bankListData.length > 0) {
          const bankInfo = response.data.bankListData[0]
          this.dataJson.tempJson.bankData = {
            name: bankInfo.name,
            account_name: bankInfo.account_name || bankInfo.name,
            bank_name: bankInfo.bank_name,
            account_number: bankInfo.account_number,
            bank_type_name: bankInfo.bank_type_name,
            order_amount: bankInfo.order_amount || 0,
            refundable_amount: bankInfo.refundable_amount,
            refunded_amount: bankInfo.refunded_amount,
            refunding_amount: bankInfo.refunding_amount,
            unrefund_amount: bankInfo.unrefund_amount,
            remark: bankInfo.remark
          }
        }

        // 初始化附件数据
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.tempJson.push_files = [...response.data.doc_att_files]
        } else {
          this.dataJson.tempJson.push_files = []
        }

        // 初始化退款附件数据
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.tempJson.refund_doc_att_files = [...response.data.doc_att_files]
        } else {
          this.dataJson.tempJson.refund_doc_att_files = []
        }

        // 初始化凭证文件数据
        if (response.data.voucher_files && response.data.voucher_files.length > 0) {
          this.dataJson.voucher_files = [...response.data.voucher_files]
          this.dataJson.tempJson.voucher_files = [...response.data.voucher_files]
        } else {
          this.dataJson.voucher_files = []
          this.dataJson.tempJson.voucher_files = []
        }

        // 计算退款总金额
        this.dataJson.tempJson.detail_refund_amount = this.dataJson.tempJson.refund_order_amount || 0
      }).finally(() => {
        this.settings.loading = false
      })
    },
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
    handleFileError () {
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 凭证附件上传成功
    handleVoucherUploadSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.voucher_files = this.dataJson.voucher_files || []
      this.dataJson.voucher_files.push(res.response.data)
      this.dataJson.tempJson.voucher_files = this.dataJson.voucher_files
    },
    // 删除凭证文件
    removeVoucherFile (file) {
      const idx = this.dataJson.voucher_files.findIndex(f => f.url === file.url)
      if (idx !== -1) {
        this.dataJson.voucher_files.splice(idx, 1)
        this.dataJson.tempJson.voucher_files = this.dataJson.voucher_files
      }
    },
    // 格式化日期时间
    formatDateTime (dateTime) {
      if (!dateTime || dateTime === null || dateTime === undefined || dateTime === '') {
        return '-'
      }
      try {
        // 确保是有效的日期格式
        const date = new Date(dateTime)
        if (isNaN(date.getTime())) {
          return '-'
        }
        // 如果传入的已经是格式化好的字符串，直接返回
        if (typeof dateTime === 'string' && dateTime.includes('-')) {
          return dateTime
        }
        // 格式化为 YYYY-MM-DD HH:mm:ss
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.warn('日期格式化错误:', error)
        return '-'
      }
    },
    // 完成退款
    refundComplete () {
      // 更新凭证文件数据
      this.dataJson.tempJson.voucher_files = this.dataJson.voucher_files
      // 表单验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          const submitData = {
            id: this.data.id,
            voucher_remark: this.dataJson.tempJson.voucher_remark,
            voucher_files: this.dataJson.tempJson.voucher_files
          }
          this.settings.loading = true
          refundCompleteAPi(submitData).then(response => {
            this.$notify({
              title: '退款完成',
              message: '退款凭证上传成功',
              type: 'success',
              duration: 4000
            })
            this.$emit('closeMeOk')
          }).catch(error => {
            this.$notify({
              title: '操作失败',
              message: error.message || '退款凭证上传失败',
              type: 'error',
              duration: 4000
            })
          }).finally(() => {
            this.settings.loading = false
          })
        } else {
          this.settings.loading = false
        }
      })
    }
  }
}
</script>
