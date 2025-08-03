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
                {{ dataJson.tempJson.code }}
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
              <el-descriptions-item label="收款附件材料" span="3">
                <PreviewDescription :attachment-files="dataJson.payment_doc_att" />
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>
        </el-collapse>
        <!-- 新增的业务单据信息区域 - 使用el-collapse样式 -->
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
              <el-descriptions-item label="申请收款总金额">
                {{ dataJson.tempJson.receivable_amount == null ? '-': formatCurrency(dataJson.tempJson.receivable_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="已收款总金额">
                {{ dataJson.tempJson.received_amount == null? '-': formatCurrency(dataJson.tempJson.received_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="未收款总金额">
                {{ dataJson.tempJson.unreceive_amount == null? '-': formatCurrency(dataJson.tempJson.unreceive_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="收款中金额">
                {{ dataJson.tempJson.receiving_amount == null? '-': formatCurrency(dataJson.tempJson.receiving_amount, true) }}
              </el-descriptions-item>
            </el-descriptions>

            <el-table
              ref="multipleTable"
              v-loading="settings.loading"
              :data="dataJson.tempJson.soOrderListData"
              :element-loading-text="'正在拼命加载中...'"
              element-loading-background="rgba(255, 255, 255, 0.5)"
              stripe
              border
              fit
              highlight-current-row
              :default-sort="{prop: 'u_time', order: 'descending'}"
              style="width: calc(100% - 20px);margin: 10px;"
            >
              <el-table-column
                type="index"
                width="45"
                label="No"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="130"
                prop="so_contract_code"
                label="合同编号"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="130"
                prop="so_order_code"
                label="订单编号"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="130"
                prop="so_goods"
                label="商品"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="130"
                prop="so_qty"
                label="总销售数量"
                align="right"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="150"
                prop="so_amount"
                label="订单总金额"
                align="right"
              >
                <template v-slot="scope">
                  {{ scope.row.so_amount == null? '-' : formatCurrency(scope.row.so_amount, true) }}
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="150"
                prop="so_advance_receive_amount"
                label="预收款金额"
                align="right"
              >
                <template v-slot="scope">
                  {{ scope.row.so_advance_receive_amount == null? '': formatCurrency(scope.row.so_advance_receive_amount, true) }}
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="150"
                prop="so_can_advance_receive_amount"
                label="可申请预收款金额"
                align="right"
              >
                <template v-slot="scope">
                  {{ scope.row.so_can_advance_receive_amount == null? '': formatCurrency(scope.row.so_can_advance_receive_amount, true) }}
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="150"
                prop="order_amount"
                label="本次申请金额"
                align="right"
              >
                <template v-slot="scope">
                  {{ scope.row.order_amount == null? '': formatCurrency(scope.row.order_amount, true) }}
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="150"
                prop="remark"
                label="备注"
              />
            </el-table>
          </el-collapse-item>
        </el-collapse>
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
          :data="dataJson.tempJson.bankListData"
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
              <div style="display: flex; align-items: center;">
                <numeric
                  v-model="scope.row.receive_amount"
                  :decimal-places="2"
                  :currency-symbol="'¥'"
                  style="flex: 1; margin-right: 8px;"
                  @change.native="handleReceiveAmountChange(scope.row)"
                />
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleFullAmountApply(scope.row)"
                >
                  全额
                </el-button>
              </div>
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
          <el-descriptions-item label="">
            <div
              slot="label"
              class="required-mark"
            >
              收款日期
            </div>
            <el-form-item
              prop="receive_date"
              label-width="0"
            >
              <el-date-picker
                v-model="dataJson.tempJson.receive_date"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                clearable
                :placeholder="'选择日期'"
                style="width: 100%"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="收款指令附件材料">
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
          <el-descriptions-item label="收款单备注">
            <el-form-item
              prop="remark"
              label-width="0"
            >
              <el-input
                ref="refFocusOne"
                v-model.trim="dataJson.tempJson.remark"
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
  /*margin-top: 10px;*/
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
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { getApi } from '@/api/40_business/20_so/ar/ar'
import { insertApi } from '@/api/40_business/20_so/arreceive/arreceive'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'
import PreviewDescription from '@/components/51_preview_description/index.vue'

export default {
  directives: { elDragDialog },
  components: { numeric, SimpleUploadMutilFile, PreviewCard, PreviewDescription },
  mixins: [],
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
      default: constants_para.STATUS_INSERT
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
      popSettingsData: {
        // 客户
        customerDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 主体企业
        sellerDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        },
        // 销售订单弹窗
        soOrderDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 销售订单弹窗(添加关联单号)
        soOrderFountDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 企业银行账户弹窗
        bankDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        }
      },
      dataJson: {
        // 折叠面板默认关闭值（页面打开时收缩状态）
        activeNames: ['basicInfo'],
        // 附件
        push_att: [],
        push_file: [],
        push_files: [],
        // 收款附件材料
        payment_doc_att: [],
        payment_doc_att_file: [],
        payment_doc_att_files: [],
        typeListDate: [],
        // 用于监听
        actual_count: 0,
        sumData: {
          // 应收账款总金额
          receivable_amount_total: 0,
          // 已收款总金额
          received_amount_total: 0,
          // 收款中总金额
          receiving_amount_total: 0,
          // 未收款总金额
          unreceive_amount_total: 0,
          // 已退款总金额
          refunded_amount_total: 0
        },
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
        // loading 状态
        loading: true,
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false
        },
        // 销售订单状态：是否可用，false:可用，true不可用
        btnSoOrderDisabledStatus: {
          disabledInsert: false,
          disabledDelete: true
        },
        // 企业银行账户按钮状态：是否可用，false:可用，true不可用
        btnBankDisabledStatus: {
          disabledInsert: false,
          disabledDelete: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.editStatus,
        // pop的check内容
        rules: {
          receive_amount: [
            { required: true, message: '请输入收款指令金额', trigger: 'change' },
            { validator: this.verifyReceiveAmount, trigger: 'change' }
          ],
          receive_date: [
            { required: true, message: '请选择收款日期', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    receiveAmountSum () {
      // 合计所有银行账户的收款指令金额
      if (!this.dataJson.tempJson.bankListData) return 0
      return this.dataJson.tempJson.bankListData.reduce((sum, item) => {
        const val = Number(item.receive_amount)
        return sum + (isNaN(val) ? 0 : val)
      }, 0)
    }
  },
  // 监听器
  watch: {
    'dataJson.tempJson.unit_id': {
      handler (newVal, oldVal) {
        console.log(newVal)
      }
    }
  },
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
  },
  methods: {
    // 初始化处理
    async init () {
      // 初始化按钮
      this.initButtonShowStatus()
      this.getData()

      // 初始化watch
      this.settings.loading = false
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnSoOrderDisabledStatus = this.$options.data.call(this).settings.btnSoOrderDisabledStatus
      this.settings.btnBankDisabledStatus = this.$options.data.call(this).settings.btnBankDisabledStatus
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJson.soOrderListData = [...response.data.soOrderListData]
        this.dataJson.tempJson.bankListData = [...response.data.bankListData]

        // 初始化收款附件数据
        if (response.data.doc_att_files && response.data.doc_att_files.length > 0) {
          this.dataJson.payment_doc_att = [...response.data.doc_att_files]
          this.dataJson.payment_doc_att_file = response.data.doc_att_files.map(item => item.url)
          this.dataJson.tempJson.payment_doc_att_files = [...response.data.doc_att_files]
        } else {
          this.dataJson.payment_doc_att = []
          this.dataJson.payment_doc_att_file = []
          this.dataJson.tempJson.payment_doc_att_files = []
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 新增
    doInsert () {
      // 开始综合验证
      this.$refs['dataSubmitForm'].validate(valid => {
        if (valid) {
          // 组装下推数据
          const tempData = {}
          const tempJson = deepCopy(this.dataJson.tempJson)
          tempData.ar_id = tempJson.id
          tempData.ar_code = tempJson.code
          tempData.so_order_code = tempJson.so_order_code
          tempData.so_order_id = tempJson.so_order_id
          tempData.so_contract_code = tempJson.so_contract_code
          tempData.customer_enterprise_name = tempJson.customer_enterprise_name
          tempData.customer_enterprise_code = tempJson.customer_enterprise_code
          tempData.customer_enterprise_version = tempJson.customer_enterprise_version
          tempData.seller_enterprise_code = tempJson.seller_enterprise_code
          tempData.seller_enterprise_version = tempJson.seller_enterprise_version
          tempData.seller_enterprise_name = tempJson.seller_enterprise_name
          tempData.remark = tempJson.remark
          tempData.push_files = tempJson.push_files
          tempData.receive_amount = tempJson.receive_amount
          tempData.type = tempJson.type

          // 任务6：添加指定的数据操作
          tempData.ar_id = tempJson.id
          tempData.detailListData = deepCopy(this.dataJson.tempJson.bankListData)

          tempData.remark = tempJson.remark
          tempData.doc_att_files = this.dataJson.push_att
          // 任务7：添加收款日期
          tempData.receive_date = tempJson.receive_date

          this.settings.loading = true
          this.showLoading('正在保存，请稍后...')
          insertApi(tempData)
            .then(
              _data => {
                this.settings.loading = false
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
                this.settings.loading = false
                this.$notify({
                  title: '新增失败',
                  message: _error.error.message,
                  type: 'error',
                  duration: this.settings.duration
                })
              }
            )
            .finally(() => {
              this.closeLoading()
            })
        } else {
          this.closeLoading()
        }
      })
    },
    // 取消
    handleBmpDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    // 审批流确定
    handleBmpDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    // 其他附件上传成功
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.push_att.push(res.response.data)
      this.dataJson.push_file.push(res.response.data.url)
      this.dataJson.tempJson.push_files = this.dataJson.push_att
    },
    // 其他附件附件文件
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.push_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.push_att.splice(_index, 1)
      this.dataJson.push_file.splice(_index, 1)
      this.dataJson.tempJson.push_files = this.dataJson.push_att
    },
    // 上传失败
    handleFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '上传错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    verifyReceiveAmount (rule, value, callback) {
      if (value > this.dataJson.tempJson.unreceive_amount) {
        callback(new Error('收款金额不能大于未收款金额'))
      } else {
        callback()
      }
    },
    handleReceiveAmountChange (row) {
      // 处理收款指令金额变化
      if (row.receive_amount && row.unreceive_amount && row.receive_amount > row.unreceive_amount) {
        row.receive_amount = 0
        this.showErrorMsg('输入错误：输入的收款指令金额需要小于等于未收款金额')
        // 清空错误的输入
        this.$nextTick(() => {
          row.receive_amount = null
        })
      }
    },
    handleFullAmountApply (row) {
      // 全额按钮：设置当前行的收款指令金额=当前行的未收款金额
      if (row.unreceive_amount) {
        row.receive_amount = row.unreceive_amount
      } else {
        this.$message.warning('当前行的未收款金额为空，无法执行全额操作')
      }
    }
  }
}
</script>
