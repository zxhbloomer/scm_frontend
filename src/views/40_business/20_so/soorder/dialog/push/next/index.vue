<template>
  <div>
    <!-- pop窗口 数据编辑:新增、修改 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="请选择下推操作"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="!PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="400px"
      destroy-on-close
      @close="handleClose"
    >
      <div class="button-container">
        <el-button type="primary" class="button-btn" @click="handleAdvanceDialogOpen">下推预收款</el-button>
        <el-button type="primary" class="button-btn" @click="handleAdvanceRefundDialogOpen">下推预收款退款</el-button>
      </div>

      <div class="button-container">
        <el-button type="primary" class="button-btn" @click="handleOutPlanNewDialogOpen">下推出库计划</el-button>
        <el-button type="primary" class="button-btn" @click="handleSettlementNewDialogOpen">下推结算单</el-button>
      </div>

      <div class="button-container">
        <el-button type="primary" class="button-btn" @click="handleCargoRightTransferNewDialogOpen">下推货权转移</el-button>
      </div>
    </el-dialog>

    <!-- 下推-预收款-弹窗-->
    <push-advance-dialog
      v-if="popAdvanceOrder.dialogVisible"
      :data="popAdvanceOrder.data"
      :visible="popAdvanceOrder.dialogVisible"
      :title="'下推-预收款'"
      destroy-on-close
      @closeMeOk="handleAdvanceDialogOk"
      @closeMeCancel="handleAdvanceDialogClose"
    />

    <!-- 下推-预收退款-弹窗-->
    <push-advance-refund-dialog
      v-if="popAdvanceRefundOrder.dialogVisible"
      :data="popAdvanceRefundOrder.data"
      :visible="popAdvanceRefundOrder.dialogVisible"
      :title="'下推-预收退款'"
      destroy-on-close
      @closeMeOk="handleAdvanceRefundDialogOk"
      @closeMeCancel="handleAdvanceRefundDialogClose"
    />

  </div>
</template>

<style scoped>
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
.el-popup-border-color >>> .el-input__inner {
  border-color: #1890ff;
}
.button-container {
  display: flex;
  justify-content: space-between; /* 或者使用 space-around, flex-start, flex-end 等 */
  margin-top: 5px;
}
.button-btn{
  height: 30px;
  width: 200px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import pushAdvanceDialog from '@/views/40_business/20_so/ar/dialog/push/new/advance_receive/index.vue'
import pushAdvanceRefundDialog from '@/views/40_business/20_so/arrefund/dialog/push/index.vue'
import deepCopy from 'deep-copy'

export default {
  components: { pushAdvanceDialog, pushAdvanceRefundDialog },
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
        width: '15%'
      },
      labelStyle: {
        width: '10%',
        'text-align': 'right'
      },
      popSettingsData: {

      },
      dataJson: {
        // 单条数据 json
        tempJson: null,
        inputSettings: {
        }
      },
      // 下推-预收款-弹窗
      popAdvanceOrder: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 下推-出库通知-弹窗
      popOutPlanV2: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 下推-预收退款-弹窗
      popAdvanceRefundOrder: {
        dialogVisible: false,
        editStatus: null,
        data: null
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
  watch: {
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        this.settings.btnDisabledStatus.disabledInsert = false
        this.settings.btnDisabledStatus.disabledUpdate = false
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
  },
  methods: {
    // 初始化处理
    init () {
      this.initButtonShowStatus()
      this.initButtonDisabledStatus()

      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.$options.data.call(this).dataJson.tempJson)

      // 初始化watch
      this.settings.loading = false
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
    handleClose () {
      this.$emit('closeMeCancel')
    },
    // 下推-预收款-弹窗打开
    handleAdvanceDialogOpen (val) {
      this.popAdvanceOrder.data = this.data
      this.popAdvanceOrder.dialogVisible = true
    },
    // 下推-预收款-弹窗确认
    handleAdvanceDialogOk (val) {
      this.popAdvanceOrder.dialogVisible = false
      this.$emit('closeMeOk')
    },
    // 下推-预收款-弹窗取消
    handleAdvanceDialogClose (val) {
      this.popAdvanceOrder.dialogVisible = false
      this.$emit('closeMeCancel')
    },
    // 下推-预收款-弹窗打开
    handleOutPlanV2DialogOpen (val) {
      this.popOutPlanV2.data = this.data
      this.popOutPlanV2.dialogVisible = true
    },
    // 下推-预收款-弹窗确认
    handleOutPlanV2DialogOk (val) {
      this.popOutPlanV2.dialogVisible = false
      this.$emit('closeMeOk')
    },
    // 下推-预收款-弹窗取消
    handleOutPlanV2DialogCancel (val) {
      this.popOutPlanV2.dialogVisible = false
      this.$emit('closeMeCancel')
    },
    // 下推-预收退款-弹窗打开
    handleAdvanceRefundDialogOpen (val) {
      this.popAdvanceRefundOrder.data = this.data
      this.popAdvanceRefundOrder.dialogVisible = true
    },
    // 下推-预收退款-弹窗确认
    handleAdvanceRefundDialogOk (val) {
      this.popAdvanceRefundOrder.dialogVisible = false
      this.$emit('closeMeOk')
    },
    // 下推-预收退款-弹窗取消
    handleAdvanceRefundDialogClose (val) {
      this.popAdvanceRefundOrder.dialogVisible = false
      this.$emit('closeMeCancel')
    },
    // 出库计划新增-打开
    handleOutPlanNewDialogOpen (val) {
      // 关闭当前弹窗并打开出库计划新增页面
      this.$emit('closeMeCancel')
      // 通过事件总线通知父组件打开出库计划新增页面
      this.$emit('openOutplanNew', this.data)
    },
    // 结算单新增-打开
    handleSettlementNewDialogOpen (val) {
      // 关闭当前弹窗并打开结算单新增页面
      this.$emit('closeMeCancel')
      // 通过事件总线通知父组件打开结算单新增页面
      this.$emit('openSettlementNew', this.data)
    },
    // 货权转移新增-打开
    handleCargoRightTransferNewDialogOpen (val) {
      // 关闭当前弹窗并打开货权转移新增页面
      this.$emit('closeMeCancel')
      // 通过事件总线通知父组件打开货权转移新增页面
      this.$emit('openCargoRightTransferNew', this.data)
    }
  }
}
</script>
