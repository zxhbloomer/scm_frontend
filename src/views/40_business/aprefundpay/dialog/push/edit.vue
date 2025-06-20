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
        <el-alert
          title="退款信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-descriptions
          title=""
          :column="4"
          :label-style="labelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          style="padding-right: 10px;padding-left: 10px;"
          border
        >

          <el-descriptions-item label="应付退款编号">
            {{ dataJson.tempJson.code }}
          </el-descriptions-item>

          <el-descriptions-item label="退款状态">
            {{ dataJson.tempJson.pay_status_name }}
          </el-descriptions-item>

          <el-descriptions-item label="主体企业（付款方）">
            {{ dataJson.tempJson.buyer_enterprise_name }}
          </el-descriptions-item>

          <el-descriptions-item label="账户">
            {{ dataJson.tempJson.bankListData!=null? dataJson.tempJson.bankListData[0].account_number:0 }}
          </el-descriptions-item>

          <el-descriptions-item label="供应商（收款方）">
            {{ dataJson.tempJson.supplier_enterprise_name }}
          </el-descriptions-item>

          <el-descriptions-item label="申请付款总金额">
            {{ dataJson.tempJson.refund_amount == null ? '-' : formatNumber(dataJson.tempJson.refund_amount, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="已退款总金额">
            {{ dataJson.tempJson.refunded_amount == null ? '-' : formatNumber(dataJson.tempJson.refunded_amount, true, 4) }}
          </el-descriptions-item>
          <el-descriptions-item label="未退款总金额">
            {{
              dataJson.tempJson.not_pay_amount == null ? '-' : formatNumber(dataJson.tempJson.not_pay_amount, true, 4)
            }}
          </el-descriptions-item>
          <el-descriptions-item label="退款中金额">
            {{ dataJson.tempJson.refunding_amount == null ? '-' : formatNumber(dataJson.tempJson.refunding_amount, true, 4) }}
          </el-descriptions-item>

        </el-descriptions>
        <br>
        <el-alert
          title="付款指令"
          type="info"
          :closable="false"
        />
        <br>

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
              退款指令金额
            </div>
            <el-form-item
              prop="refund_amount_pay"
              label-width="0"
            >
              <numeric
                v-model="dataJson.tempJson.refund_amount_pay"
                :decimal-places="4"
                clearable
                :currency-symbol="''"
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="附件">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col :span="1">
                <Simple-upload-mutil-file
                  :accept="'*'"
                  @upload-success="handleOtherUploadFileSuccess"
                  @upload-error="handleFileError"
                />
              </el-col>
              <el-col
                v-for="(item, i) in dataJson.push_att"
                :key="i"
                :offset="3"
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
          <el-descriptions-item label="备注">
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
  height: calc(100vh - 500px);
  overflow-x: auto;
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
import { getDetailApi } from '@/api/40_business/aprefund/aprefund'
import { insertApi } from '@/api/40_business/aprefundpay/aprefundpay'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'
import numeric from '@/components/40_input/numeric/index.vue'

export default {
  directives: { elDragDialog },
  components: { numeric, SimpleUploadMutilFile, PreviewCard },
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
        typeListDate: [],
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
          refund_amount_pay: [
            { required: true, message: '请输入付款指令金额', trigger: 'change' },
            { validator: this.verifyPayAmount, trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
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
      getDetailApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)
        this.dataJson.tempJsonOriginal = deepCopy(response.data)
        this.dataJson.tempJson.poOrderListData = [...response.data.poOrderListData]
        this.dataJson.tempJson.bankListData = [...response.data.bankListData]
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
          tempData.refund_amount = tempJson.refund_amount_pay
          tempData.type = tempJson.type

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
        callback(new Error('付款金额不能大于未付款金额'))
      } else {
        callback()
      }
    }
  }
}
</script>
