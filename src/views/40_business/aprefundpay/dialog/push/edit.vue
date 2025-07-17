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
            title="退款基本信息"
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
              <el-descriptions-item label="应付退款编号">
                {{ dataJson.tempJson.code }}
              </el-descriptions-item>
              <el-descriptions-item label="业务类型">
                {{ dataJson.tempJson.type_name }}
              </el-descriptions-item>
              <el-descriptions-item />
              <el-descriptions-item label="主体企业（付款方）">
                {{ dataJson.tempJson.buyer_enterprise_name }}
              </el-descriptions-item>
              <el-descriptions-item label="供应商（收款方）">
                {{ dataJson.tempJson.supplier_enterprise_name }}
              </el-descriptions-item>
              <el-descriptions-item label="退款状态">
                {{ dataJson.tempJson.pay_status_name == null ? '-': dataJson.tempJson.pay_status_name }}
              </el-descriptions-item>
              <el-descriptions-item label="备注" span="3">
                {{ dataJson.tempJson.remark == null ? '-': dataJson.tempJson.remark }}
              </el-descriptions-item>
              <el-descriptions-item label="退款附件材料" span="3">
                <PreviewDescription :attachment-files="dataJson.refund_doc_att" />
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
              <el-descriptions-item label="申请退款总金额">
                {{ dataJson.tempJson.refund_amount == null ? '-': formatCurrency(dataJson.tempJson.refund_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="已退款总金额">
                {{ dataJson.tempJson.refunded_amount == null? '-': formatCurrency(dataJson.tempJson.refunded_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="未退款总金额">
                {{ dataJson.tempJson.not_refund_amount == null? '-': formatCurrency(dataJson.tempJson.not_refund_amount, true) }}
              </el-descriptions-item>
              <el-descriptions-item label="退款中金额">
                {{ dataJson.tempJson.refunding_amount == null? '-': formatCurrency(dataJson.tempJson.refunding_amount, true) }}
              </el-descriptions-item>
            </el-descriptions>

            <el-table
              ref="multipleTable"
              v-loading="settings.loading"
              :data="dataJson.tempJson.poOrderListData"
              :element-loading-text="'正在拼命加载中...'"
              element-loading-background="rgba(255, 255, 255, 0.5)"
              stripe
              border
              fit
              highlight-current-row
              :default-sort="{prop: 'u_time', order: 'descending'}"
              style="width: calc(100% - 20px);margin: 10px;"
              height="200px"
            >
              <el-table-column
                type="index"
                width="45"
                label="No"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="130"
                prop="po_contract_code"
                label="合同编号"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="130"
                prop="po_order_code"
                label="订单编号"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="130"
                prop="po_goods"
                label="商品"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="130"
                prop="po_qty"
                label="总采购数量"
                align="right"
              />
              <el-table-column
                show-overflow-tooltip
                min-width="150"
                prop="po_amount"
                label="订单总金额"
                align="right"
              >
                <template v-slot="scope">
                  {{ scope.row.po_amount == null? '-' : formatCurrency(scope.row.po_amount, true) }}
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="150"
                prop="refund_amount"
                label="本次退款金额"
                align="right"
              >
                <template v-slot="scope">
                  {{ scope.row.refund_amount == null? '': formatCurrency(scope.row.refund_amount, true) }}
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
        <!-- 原有的退款信息区域 -->
        <el-alert
          title="退款信息"
          type="info"
          :closable="false"
        />
        <div style="margin-bottom: 10px" />
        <div
          class="div-sum"
        >
          <div class="right">
            <span class="count-title">退款指令合计金额：</span>
            <span class="count-data">{{ formatCurrency(refundAmountSum, true) }}</span>
          </div>
        </div>

        <el-table
          ref="bankTable"
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
          height="150px"
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
            label="退款账户名"
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
            prop="refund_amount"
            label="计划退款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.refund_amount == null? '': formatCurrency(scope.row.refund_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="refunded_amount"
            label="已退款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.refunded_amount == null? '': formatCurrency(scope.row.refunded_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="refunding_amount"
            label="退款中金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.refunding_amount == null? '': formatCurrency(scope.row.refunding_amount, true) }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="not_refund_amount"
            label="未退款金额"
            align="right"
          >
            <template v-slot="scope">
              {{ scope.row.not_refund_amount == null? '': formatCurrency(scope.row.not_refund_amount, true) }}
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
            prop="refund_amount_pay"
            label="退款指令金额"
            align="right"
            fixed="right"
          >
            <template v-slot="scope">
              <div style="display: flex; align-items: center;">
                <numeric
                  v-model="scope.row.refund_amount_pay"
                  :decimal-places="2"
                  :currency-symbol="'¥'"
                  style="flex: 1; margin-right: 8px;"
                  @change.native="handleRefundAmountChange(scope.row)"
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
              prop="remark"
              label-width="0"
            >
              <el-input
                ref="refFocusOne"
                v-model.trim="dataJson.tempJson.remark"
                type="textarea"
                clearable
                show-word-limit
                :placeholder="isPlaceholderShow('请输入')"
              />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
        <br>
      </el-form>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button
        size="medium"
        type="primary"
        :disabled="settings.loading"
        @click="doInsert()"
      >下推
      </el-button>
      <el-button
        size="medium"
        :disabled="settings.loading"
        @click="handleCancel()"
      >返回
      </el-button>
    </div>

    <!-- 审批流程设置：选择人 -->
    <!--    <bpm-dialog
      v-if="popSettingsData.sponsorDialog.visible"
      :visible="popSettingsData.sponsorDialog.visible"
      :form-data="popSettingsData.sponsorDialog.form_data"
      :serial-type="CONSTANTS.DICT_B_AP"
      @closeMeCancel="handleBpmDialogCancel"
      @closeMeOk="handleBpmDialogOk"
    />-->

  </div>
</template>

<style scoped>
.edit-container {
  overflow-x: auto;
}

.div-sum {
  width: 100%;
  height: 35px;
  padding: 5px 5px;
  margin: 0;
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
  position: absolute;
  right: 10px;
  margin-right: 10px;
}

.count-data {
  color: #1890ff;
  font-size: 20px;
}

.count-title {
  margin-left: 10px;
}

.collapse-info {
  margin-bottom: 10px;
}
.dialog-footer {
  text-align: center;
}
.el-form-item .el-select {
  width: 100%;
}

.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
br {
  display: block;
  margin: 10px;
  content: ' ';
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
</style>

<script>
import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import { EventBus } from '@/common/eventbus/eventbus'
import { getApi } from '@/api/40_business/aprefund/aprefund'
import { insertApi } from '@/api/40_business/aprefundpay/aprefundpay'
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
        width: '1.5%',
        'text-align': 'right'
      },
      // 监听器
      watch: {
        unwatch_tempJson: null,
        unwatch_actual_count: null,
        unwatch_actual_price: null,
        'dataJson.tempJson.unit_id': {
          handler (newVal, oldVal) {
            console.log(newVal)
          }
        }
      },
      popSettingsData: {
        // 供应商
        supplierDialogData: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 主体企业
        purchaserDialogData: {
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
        // 采购订单弹窗
        poOrderDialog: {
          // 弹出框显示参数
          visible: false,
          data: {},
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          }
        },
        // 采购订单弹窗(添加关联单号)
        poOrderFountDialog: {
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
        // 附件
        push_att: [],
        push_file: [],
        push_files: [],
        refund_doc_att: [],
        typeListDate: [],
        activeNames: ['basicInfo', 'businessInfo'],
        // 用于监听
        actual_count: 0,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          // id
          id: null,
          /** * 退款单编号*/
          code: null,
          /** * 应付账款id*/
          ap_id: null,
          /** * 应付账款code*/
          ap_code: null,
          /** * 状态*/
          status: null,
          /** * type*/
          type: null,
          /** * 采购订单编号*/
          po_code: null,
          /** * 采购合同编号*/
          po_contract_code: null,
          /** * 供应商企业编号*/
          supplier_enterprise_code: null,
          /** * 供应商企业版本号*/
          supplier_enterprise_version: null,
          /** * 供应商企业名称*/
          supplier_enterprise_name: null,
          /** * 主体企业买家企业编号*/
          buyer_enterprise_code: null,
          /** * 主体企业买家企业版本号*/
          buyer_enterprise_version: null,
          /** * 主体企业买家企业名称*/
          buyer_enterprise_name: null,
          /** * 退款日期*/
          refund_date: null,
          /** * 退款单总金额*/
          refund_amount_pay: null,
          /** * 未退款总金额*/
          not_refund_amount: null,
          /** * 退款方式：1-银行转账*/
          refund_method: null,
          /** * 备注*/
          remark: null,
          /** * 凭证上传备注*/
          payment_voucher_remark: null,
          /** * 下推附件*/
          push_file: null,
          push_files: null
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
        // 采购订单状态：是否可用，false:可用，true不可用
        btnPoOrderDisabledStatus: {
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
          refund_date: [
            { required: true, message: '请选择退款日期', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    refundAmountSum () {
      if (!this.dataJson.tempJson.bankListData || this.dataJson.tempJson.bankListData.length === 0) {
        return 0
      }
      return this.dataJson.tempJson.bankListData.reduce((sum, bank) => {
        return sum + (parseFloat(bank.refund_amount_pay) || 0)
      }, 0)
    }
  },
  // 监听器
  watch: {},
  created () {
    this.init()
  },
  mounted () {
    // 描绘完成
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化处理
    async init () {
      // 初始化按钮
      this.initButtonShowStatus()
      this.getData()

      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal = this.$options.data.call(this).dataJson.tempJsonOriginal
    },
    initButtonShowStatus () {
      // 初始化按钮状态：默认都隐藏
      this.settings.btnPoOrderDisabledStatus = this.$options.data.call(this).settings.btnPoOrderDisabledStatus
      this.settings.btnBankDisabledStatus = this.$options.data.call(this).settings.btnBankDisabledStatus
    },
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.poOrderListData = [...response.data.poOrderListData]
        this.dataJson.tempJson.bankListData = [...response.data.bankListData]

        // 初始化银行账户的退款指令金额字段
        this.dataJson.tempJson.bankListData.forEach(bank => {
          if (!bank.refund_amount_pay) {
            bank.refund_amount_pay = 0
          }
          // 计算未退款金额
          bank.not_refund_amount = (bank.refund_amount || 0) - (bank.refunded_amount || 0) - (bank.refunding_amount || 0)
        })

        // 处理附件数据
        if (response.data.attachment_files) {
          this.dataJson.refund_doc_att = response.data.attachment_files
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch(
        'dataJson.tempJson',
        (newVal, oldVal) => {

        },
        { deep: true }
      )
    },
    unWatch () {
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
          tempData.ap_refund_id = tempJson.id
          tempData.ap_refund_code = tempJson.code
          tempData.po_code = tempJson.po_code
          tempData.po_contract_code = tempJson.po_contract_code
          tempData.supplier_enterprise_name = tempJson.supplier_enterprise_name
          tempData.supplier_enterprise_code = tempJson.supplier_enterprise_code
          tempData.supplier_enterprise_version = tempJson.supplier_enterprise_version
          tempData.buyer_enterprise_code = tempJson.buyer_enterprise_code
          tempData.buyer_enterprise_version = tempJson.buyer_enterprise_version
          tempData.buyer_enterprise_name = tempJson.buyer_enterprise_name
          tempData.remark = tempJson.remark
          tempData.push_files = tempJson.push_files
          tempData.refund_date = tempJson.refund_date
          tempData.type = tempJson.type
          tempData.bank_list_data = tempJson.bankListData.filter(bank => bank.refund_amount_pay > 0)

          this.settings.loading = true
          insertApi(tempData)
            .then(
              _data => {
                this.closeLoading()
                this.$emit('closeMeOk', _data.data)
                // 通知兄弟组件，新增数据更新
                EventBus.$emit(this.EMITS.EMIT_MST_B_AP_UPDATE_OK, _data.data)
                this.$notify({
                  title: '新增成功',
                  message: _data.data.message,
                  type: 'success',
                  duration: this.settings.duration
                })
              },
              _error => {
                this.closeLoading()
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
    // 校验数据 获取审批流程
    // startProcess () {
    //   this.showLoading('正在查询，请稍后...')
    //   // 校验业务数据
    //   const tempData = deepCopy(this.dataJson.tempJson)
    //   tempData.check_type = constants_para.UPDATE_CHECK_TYPE
    //
    //   this.$refs['dataSubmitForm'].validate(valid => {
    //     if (valid) {
    //       validateApi(tempData).then(_data => {
    //         if (_data.success) {
    //           // 获取审批流程
    //           this.doInsert()
    //         } else {
    //           this.closeLoading()
    //           this.$notify({
    //             title: '校验失败',
    //             message: _data.data.message,
    //             type: 'error',
    //             duration: this.settings.duration
    //           })
    //         }
    //       }).catch(error => {
    //         console.log('校验出错', error)
    //         this.closeLoading()
    //       })
    //     } else {
    //       this.closeLoading()
    //     }
    //   })
    // },
    // 取消
    handleBpmDialogCancel () {
      this.popSettingsData.sponsorDialog.visible = false
      this.closeLoading()
    },
    // 审批流确定
    handleBpmDialogOk (data) {
      this.popSettingsData.sponsorDialog.initial_process = data.processData
      this.popSettingsData.sponsorDialog.process_users = data.process_users
      this.popSettingsData.sponsorDialog.visible = false
      this.doInsert()
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
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
    verifyPayAmount (rule, value, callback) {
      if (value > this.dataJson.tempJson.not_pay_amount) {
        callback(new Error('退款金额不能大于未退款金额'))
      } else {
        callback()
      }
    },
    // 退款金额变化处理
    handleRefundAmountChange (row) {
      // 验证退款金额不超过未退款金额
      if (row.refund_amount_pay > row.not_refund_amount) {
        this.$message.warning('退款金额不能大于未退款金额')
        row.refund_amount_pay = row.not_refund_amount
      }
    },
    // 全额退款处理
    handleFullAmountApply (row) {
      row.refund_amount_pay = row.not_refund_amount
    }
  }
}
</script>
