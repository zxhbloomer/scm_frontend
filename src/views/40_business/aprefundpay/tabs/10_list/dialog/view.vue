<template>
  <div>
    <!-- pop窗口 数据编辑:新增、修改 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="查看付款"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="1100px"
      destroy-on-close
    >
      <el-alert
        title="说明:请按照实际情况填写,并上传对应的付款凭证。"
        type="warning"
        show-icon
        :closable="false"
      />
      <el-form
        ref="dataSubmitForm"
        :rules="settings.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="0px"
        status-icon
      >
        <br>
        <el-alert
          title="付款信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-descriptions
          title=""
          :column="2"
          :label-style="fileLabelStyle"
          :content-style="contentStyle"
          direction="horizontal"
          border
          style="padding-right: 10px;padding-left: 10px;"
        >
          <el-descriptions-item label="本次付款金额" span="2">
            {{ dataJson.tempJson.refund_amount == null?'':formatNumber(dataJson.tempJson.refund_amount, true, 4) }} 元
          </el-descriptions-item>

          <el-descriptions-item label="付款日期">
            {{ dataJson.tempJson.refund_date == null?'':formatDateTime(dataJson.tempJson.refund_date) }}
          </el-descriptions-item>

          <el-descriptions-item label="退款方式">
            {{ dataJson.tempJson.refund_method_name == null?'':dataJson.tempJson.refund_method_name }}
          </el-descriptions-item>

          <el-descriptions-item label="退款账户">
            {{ dataJson.tempJson.buyer_enterprise_bank_name }}
          </el-descriptions-item>

          <el-descriptions-item label="交易对手账户">
            {{ dataJson.tempJson.supplier_enterprise_bank_name }}
          </el-descriptions-item>

          <el-descriptions-item label="备注" :span="2">
            {{ dataJson.tempJson.voucher_remark }}
          </el-descriptions-item>

          <el-descriptions-item label="附件">
            <el-row style="display: flex;flex-wrap: wrap;">
              <el-col
                v-for="(item, i) in dataJson.voucher_data"
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
        </el-descriptions>
        <br>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          :disabled="settings.loading"
          @click="handleCancel()"
        >返回</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.edit-container {
  height: calc(100vh - 160px);
  overflow-x: auto;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 0px;
}
.required-mark::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
.dialog-footer {
  text-align: center;
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
.el-button-group {
  margin-bottom: 15px;
}
.el-popup-border-color >>> .el-input__inner {
  border-color: #1890ff;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import PreviewCard from '@/components/50_preview_card/preview_card.vue'
import deepCopy from 'deep-copy'
import { getBankCollectionDataApi, getDetailApi } from '@/api/40_business/aprefundpay/aprefundpay'

export default {
  components: { PreviewCard },
  directives: { elDragDialog },
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
    }
  },
  data () {
    return {
      fileLabelStyle: {
        width: '3%',
        'text-align': 'right'
      },
      contentStyle: {
        width: '10%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      popSettingsData: {
        // 审批流程
        sponsorDialog: {
          // 弹出框显示参数
          visible: false,
          form_data: { },
          // 点击确定以后返回的值
          selectedDataJson: {
            id: null
          },
          // 审批流程
          initial_process: null,
          // 自选用户
          process_users: {}
        }
      },
      dataJson: {
        // 附件
        voucher_data: [],
        voucher_file: [],
        voucher_files: [],
        // 交易对手账户
        bank_collection_data: [],
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          refund_date: null,
          refund_method: null,
          supplier_enterprise_bank_name: null,
          voucher_files: [],
          refund_amount: null
        },
        // 单条数据 json
        tempJson: {
          id: undefined,
          refund_date: null,
          refund_method: null,
          supplier_enterprise_bank_name: null,
          voucher_files: [],
          refund_amount: null
        },
        inputSettings: {}
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
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.dialogStatus,
        // pop的check内容
        rules: {
          refund_date: [
            { required: true, message: '请选择付款日期', trigger: 'change' }
          ],
          refund_method: [
            { required: true, message: '请选择付款方式', trigger: 'change' }
          ],
          supplier_enterprise_bank_name: [
            { required: true, message: '请选择对手交易方式', trigger: 'change' }
          ]
        }
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    isViewModel () {
      if (this.settings.dialogStatus === this.PARAMETERS.STATUS_VIEW) {
        return true
      } else {
        return false
      }
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
    init () {
      this.initButtonShowStatus()
      this.initButtonDisabledStatus()
      this.initTempJsonOriginal()

      // 初始化收款方银行账户
      this.getBankCollectionData()

      // 获取数据
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
      this.settings.btnShowStatus = this.$options.data.call(
        this
      ).settings.btnShowStatus
    },
    initButtonDisabledStatus () {
      // 按钮状态初始化：默认不可用
      this.settings.btnDisabledStatus = this.$options.data.call(
        this
      ).settings.btnDisabledStatus
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    // 设置监听器
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch(
        'dataJson.tempJson',
        (newVal, oldVal) => {
          this.settings.btnDisabledStatus.disabledInsert = false
          this.settings.btnDisabledStatus.disabledUpdate = false
        },
        { deep: true }
      )
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 其他附件上传成功
    handleOtherUploadFileSuccess (res) {
      res.response.data.timestamp = res.response.timestamp
      this.dataJson.voucher_data.push(res.response.data)
      this.dataJson.voucher_file.push(res.response.data.url)
      this.dataJson.tempJson.voucher_files = this.dataJson.voucher_data
    },
    // 其他附件附件文件
    removeOtherFile (val) {
      // 获取下标
      const _index = this.dataJson.voucher_file.lastIndexOf(val)
      // 从数组中移除
      this.dataJson.voucher_data.splice(_index, 1)
      this.dataJson.voucher_file.splice(_index, 1)
      this.dataJson.tempJson.voucher_files = this.dataJson.voucher_data
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
    // 获取数据
    getData () {
      // 查询逻辑
      this.settings.loading = true
      getDetailApi(this.data).then(response => {
        this.dataJson.tempJson = deepCopy(response.data)

        // 其他附件
        this.dataJson.voucher_data = this.dataJson.tempJson.voucher_files
        if (this.dataJson.voucher_data != null && this.dataJson.voucher_data.length > 0) {
          this.dataJson.tempJson.voucher_files.forEach(item => {
            this.dataJson.voucher_file.push(item.url)
          })
        } else {
          this.dataJson.voucher_data = []
          this.dataJson.voucher_file = []
          this.dataJson.voucher_files = []
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 获取银行收款账户
    getBankCollectionData () {
      // 查询逻辑
      this.settings.loading = true
      getBankCollectionDataApi({ enterprise_code: this.data.supplier_enterprise_code }).then(response => {
        this.dataJson.bank_collection_data = response.data
      }).finally(() => {
        this.settings.loading = false
      })
    }
  }
}
</script>
