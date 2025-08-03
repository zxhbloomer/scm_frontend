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
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_AR_REFUND_STATUS_FIVE"
          title="作废理由"
          type="error"
          :closable="false"
        />
        <el-descriptions
          v-if="dataJson.tempJson.status === constants_dict.DICT_B_AR_REFUND_STATUS_FIVE"
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
            {{ dataJson.tempJson.code || '系统自动生成' }}
          </el-descriptions-item>

          <el-descriptions-item label="业务类型">
            {{ dataJson.tempJson.type_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="退款状态">
            {{ dataJson.tempJson.refund_status_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业（收款方）">
            {{ dataJson.tempJson.seller_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="客户（付款方）">
            {{ dataJson.tempJson.customer_name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="" />

          <el-descriptions-item label="备注" span="3">
            {{ dataJson.tempJson.remark || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="退款附件材料" span="3">
            <preview-description :attachment-files="dataJson.tempJson.doc_att_files" />
          </el-descriptions-item>

        </el-descriptions>

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
                {{ dataJson.tempJson.refundable_amount == null ? '-': formatCurrency(dataJson.tempJson.refundable_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="已退款总金额">
                {{ dataJson.tempJson.refunded_amount == null? '-': formatCurrency(dataJson.tempJson.refunded_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="未退款总金额">
                {{ dataJson.tempJson.unrefund_amount == null? '-': formatCurrency(dataJson.tempJson.unrefund_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="退款中金额">
                {{ dataJson.tempJson.refunding_amount == null? '-': formatCurrency(dataJson.tempJson.refunding_amount, true) }}
              </el-descriptions-item>
            </el-descriptions>
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
                {{ dataJson.tempJson.so_contract_code || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="订单编号">
                {{ dataJson.tempJson.so_order_code || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="商品名称">
                {{ dataJson.tempJson.so_goods || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="预收款已收金额">
                {{ (dataJson.tempJson.advance_received_total || 0) - (dataJson.tempJson.advance_cancelreceive_total || 0) == 0 ? '-': formatCurrency((dataJson.tempJson.advance_received_total || 0) - (dataJson.tempJson.advance_cancelreceive_total || 0), true) }}
              </el-descriptions-item>
              <el-descriptions-item label="可退金额">
                {{ dataJson.tempJson.advance_refund_amount_total == null ? '-': formatCurrency(dataJson.tempJson.advance_refund_amount_total, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="本次申请退款金额">
                {{ dataJson.tempJson.order_amount == null ? '-': formatCurrency(dataJson.tempJson.order_amount, true) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>
        </el-collapse>

        <el-alert
          title="退款信息"
          type="info"
          :closable="false"
        />
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
            {{ dataJson.tempJson.bankData.name || '-' }}
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
            <div style="display: flex; align-items: center;">
              <numeric
                v-model="dataJson.tempJson.refund_order_amount"
                :decimal-places="2"
                :currency-symbol="'¥'"
                style="flex: 1; margin-right: 8px;"
                @change.native="handleReceiveAmountChange()"
              />
              <el-button
                size="mini"
                type="primary"
                @click="handleFullAmountApply()"
              >
                全额
              </el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions
          title=""
          :column="1"
          :label-style="threeLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="">
            <div
              slot="label"
              class="required-mark"
            >
              退款日期
            </div>
            <el-form-item
              prop="refund_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.refund_date"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                :placeholder="'选择日期'"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="退款指令附件材料">
            <el-row>
              <Simple-upload-mutil-file
                :accept="'*'"
                @upload-success="handleOtherUploadFileSuccess"
                @upload-error="handleFileError"
              />
            </el-row>
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.push_att"
                :key="i"
                :offset="0"
                :span="5"
              >
                <previewCard
                  :file-name="item.fileName"
                  :url="item.url"
                  :time="item.timestamp"
                  @removeFile="removeOtherFile"
                />
              </el-col>
            </el-row>
          </el-descriptions-item>
          <el-descriptions-item label="退款单备注">
            <el-form-item
              prop="refund_remark"
              label-width="0"
            >
              <el-input
                ref="refFocusOne"
                v-model.trim="dataJson.tempJson.refund_remark"
                type="textarea"
                clearable
                show-word-limit
                :placeholder="'请输入'"
              />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </div>

  </div>
</template>

<style scoped>
.app-container {
  overflow-x: auto;
}
.el-form-item .el-select {
  width: 100%;
}

.el-descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
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
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import constants_dict from '@/common/constants/constants_dict'
import { getApi } from '@/api/40_business/20_so/arrefund/arrefund'
import PreviewDescription from '@/components/51_preview_description/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
export default {
  directives: { elDragDialog },
  components: { PreviewCard, SimpleUploadMutilFile, numeric, PreviewDescription },
  mixins: [],
  props: {
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: constants_para.STATUS_INSERT
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
      // 监听器配置（已移除）
      dataJson: {
        // 折叠面板默认收缩状态
        activeNames: [],
        // 附件列表
        push_att: [],
        push_file: [],
        push_files: [],
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
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // pop的check内容
        rules: {
          refund_date: [
            { required: true, message: '请选择退款日期', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
  },
  // 监听器
  watch: {
    'dataJson.tempJson': {
      handler(newVal, oldVal) {
        // 监听页面上面是否有修改，有修改按钮高亮
      },
      deep: true
    }
  },
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    // 组件销毁时清理资源
  },
  methods: {
    // 初始化处理
    async init () {
      this.getData()
      // 初始化完成
      this.settings.loading = false
    },
    getData () {
      // 查询逻辑
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
          // 将银行账户的退款指令金额赋值给新的字段
          this.dataJson.tempJson.refund_order_amount = bankInfo.order_amount || 0
        }

        // 初始化附件数据
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.push_att = [...response.data.doc_att_files]
          this.dataJson.push_file = response.data.doc_att_files.map(item => item.url)
          this.dataJson.tempJson.push_files = [...response.data.doc_att_files]
        } else {
          this.dataJson.push_att = []
          this.dataJson.push_file = []
          this.dataJson.tempJson.push_files = []
        }

        // 计算退款总金额
        this.dataJson.tempJson.detail_refund_amount = this.dataJson.tempJson.refund_order_amount || 0
      }).finally(() => {
        this.settings.loading = false
      })
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
    // 全额按钮处理
    handleFullAmountApply () {
      // 将退款指令金额设置为未退款金额
      this.dataJson.tempJson.refund_order_amount = this.dataJson.tempJson.bankData.unrefund_amount || 0
      // 更新退款总金额
      this.dataJson.tempJson.detail_refund_amount = this.dataJson.tempJson.refund_order_amount || 0
    },
    // 退款指令金额变化处理
    handleReceiveAmountChange () {
      // 更新退款总金额
      this.dataJson.tempJson.detail_refund_amount = this.dataJson.tempJson.refund_order_amount || 0
    },
    // 验证表单数据
    validateForm () {
      return new Promise((resolve, reject) => {
        // 先执行表单验证
        this.$refs.dataSubmitForm.validate((valid) => {
          if (!valid) {
            reject(new Error('表单验证失败'))
            return
          }

          // 验证退款指令金额必须大于0
          if (!this.dataJson.tempJson.refund_order_amount || this.dataJson.tempJson.refund_order_amount <= 0) {
            reject(new Error('校验出错：请输入退款指令金额大于0的数据。'))
            return
          }

          // 验证退款指令金额不能大于未退款金额
          if (this.dataJson.tempJson.refund_order_amount > this.dataJson.tempJson.bankData.unrefund_amount) {
            reject(new Error('输入错误：输入的退款指令金额需要小于等于未退款金额'))
            return
          }

          resolve()
        })
      })
    },
    // 文件上传成功处理
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.push_att.push(res.response.data)
      this.dataJson.push_file.push(res.response.data.url)
      this.dataJson.tempJson.push_files = this.dataJson.push_att
    },
    // 文件上传错误处理
    handleFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 移除附件
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.push_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.push_att.splice(_index, 1)
      this.dataJson.push_file.splice(_index, 1)
      this.dataJson.tempJson.push_files = this.dataJson.push_att
    },
    // 获取表单数据
    getFormData () {
      return {
        ...this.dataJson.tempJson,
        push_att: this.dataJson.push_att,
        push_files: this.dataJson.tempJson.push_files,
        refund_order_amount: this.dataJson.tempJson.refund_order_amount,
        doc_att_files: this.dataJson.push_att
      }
    }
  }

}
</script>
