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
        <el-button
          type="primary"
          class="button-btn"
          :disabled="!isSalesType"
          @click="handlePushSalesContract"
        >
          下推销售合同
        </el-button>
      </div>    </el-dialog>

    <!-- 销售合同下推弹窗 -->
    <so-contract-push-new
      :visible="soContractDialogVisible"
      :title="'项目管理-下推销售合同'"
      :data="data"
      @closeMeOk="handleSoContractOk"
      @closeMeCancel="handleSoContractCancel"
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
  justify-content: space-between;
  margin-top: 5px;
}
.button-btn {
  height: 30px;
  width: 180px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import SoContractPushNew from '@/views/40_business/20_so/socontract/dialog/push/new/index.vue'

export default {
  components: {
    SoContractPushNew
  },
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
      }, // 监听器
      watch: {
        unwatch_tempJson: null
      },
      popSettingsData: {

      },
      dataJson: {
        // 单条数据 json
        tempJson: null,
        inputSettings: {
        }
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        // pop的check内容
        rules: {
        }
      },
      // 销售合同弹窗可见性
      soContractDialogVisible: false
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    // 判断是否为采购业务类型
    isPurchaseType () {
      if (this.data && this.data.type_name) {
        return this.data.type_name === '采购业务'
      }
      return false
    },
    // 判断是否为销售业务类型
    isSalesType () {
      if (this.data && this.data.type_name) {
        // 支持"销售业务"和"采购、销售"两种类型
        return this.data.type_name === '销售业务' || this.data.type_name === '采购、销售'
      }
      return false
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
      // 初始化watch
      this.setWatch()
      this.settings.loading = false
    },
    // 设置监听器
    setWatch () {
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
    }, handleClose () {
      this.$emit('closeMeCancel')
    },
    // 下推销售合同
    handlePushSalesContract () {
      // 显示销售合同弹窗
      this.soContractDialogVisible = true
    },
    // 销售合同弹窗确认
    handleSoContractOk () {
      this.soContractDialogVisible = false
      this.$emit('closeMeOk')
    },
    // 销售合同弹窗取消
    handleSoContractCancel () {
      this.soContractDialogVisible = false
    }
  }
}
</script>
