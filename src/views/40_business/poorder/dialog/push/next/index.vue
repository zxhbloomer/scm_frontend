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
        <el-button type="primary" class="button-btn" @click="handleAdvanceDialogOpen">下推预付款</el-button>
        <el-button type="primary" class="button-btn" @click="handleAdvanceRefundDialogOpen">下推预付款退款</el-button>
      </div>

      <div class="button-container">
        <el-button type="primary" class="button-btn" @click="handleInPlanV2DialogOpen">下推入库通知</el-button>
        <el-button type="primary" class="button-btn">下推结算单</el-button>
      </div>
    </el-dialog>

    <!-- 下推-预付款-弹窗-->
    <push-advance-dialog
      v-if="popAdvanceOrder.dialogVisible"
      :data="popAdvanceOrder.data"
      :visible="popAdvanceOrder.dialogVisible"
      :title="'下推-预付款'"
      destroy-on-close
      @closeMeOk="handleAdvanceDialogOk"
      @closeMeCancel="handleAdvanceDialogClose"
    />

    <!-- 下推-入库通知-弹窗-->
    <push-in-plan-v2-dialog
      v-if="popInPlanV2.dialogVisible"
      :data="popInPlanV2.data"
      :visible="popInPlanV2.dialogVisible"
      :title="'下推-入库通知'"
      destroy-on-close
      @closeMeOk="handleInPlanV2DialogOk"
      @closeMeCancel="handleInPlanV2DialogCancel"
    />

    <!-- 下推-预付退款-弹窗-->
    <push-advance-refund-dialog
      v-if="popAdvanceRefundOrder.dialogVisible"
      :data="popAdvanceRefundOrder.data"
      :visible="popAdvanceRefundOrder.dialogVisible"
      :title="'下推-预付退款'"
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
import pushAdvanceDialog from '@/views/40_business/ap/dialog/push/new/advance_pay/index.vue'
import pushInPlanV2Dialog from '@/views/40_business/inplanv2/dialog/push/index.vue'
import pushAdvanceRefundDialog from '@/views/40_business/aprefund/dialog/push/index.vue'
import deepCopy from 'deep-copy'

export default {
  components: { pushAdvanceDialog, pushInPlanV2Dialog, pushAdvanceRefundDialog },
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
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      popSettingsData: {

      },
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          remark: ''
        },
        // 单条数据 json
        tempJson: null,
        inputSettings: {
        }
      },
      // 下推-预付款-弹窗
      popAdvanceOrder: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 下推-入库通知-弹窗
      popInPlanV2: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 下推-预付退款-弹窗
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

      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)

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
    handleClose () {
      this.$emit('closeMeCancel')
    },
    // 下推-预付款-弹窗打开
    handleAdvanceDialogOpen (val) {
      this.popAdvanceOrder.data = this.data
      this.popAdvanceOrder.dialogVisible = true
    },
    // 下推-预付款-弹窗确认
    handleAdvanceDialogOk (val) {
      this.popAdvanceOrder.dialogVisible = false
      this.$emit('closeMeOk')
    },
    // 下推-预付款-弹窗取消
    handleAdvanceDialogClose (val) {
      this.popAdvanceOrder.dialogVisible = false
      this.$emit('closeMeCancel')
    },
    // 下推-预付款-弹窗打开
    handleInPlanV2DialogOpen (val) {
      this.popInPlanV2.data = this.data
      this.popInPlanV2.dialogVisible = true
    },
    // 下推-预付款-弹窗确认
    handleInPlanV2DialogOk (val) {
      this.popInPlanV2.dialogVisible = false
      this.$emit('closeMeOk')
    },
    // 下推-预付款-弹窗取消
    handleInPlanV2DialogCancel (val) {
      this.popInPlanV2.dialogVisible = false
      this.$emit('closeMeCancel')
    },
    // 下推-预付退款-弹窗打开
    handleAdvanceRefundDialogOpen (val) {
      this.popAdvanceRefundOrder.data = this.data
      this.popAdvanceRefundOrder.dialogVisible = true
    },
    // 下推-预付退款-弹窗确认
    handleAdvanceRefundDialogOk (val) {
      this.popAdvanceRefundOrder.dialogVisible = false
      this.$emit('closeMeOk')
    },
    // 下推-预付退款-弹窗取消
    handleAdvanceRefundDialogClose (val) {
      this.popAdvanceRefundOrder.dialogVisible = false
      this.$emit('closeMeCancel')
    }
  }
}
</script>
