<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    :title="PARAMETERS.STATUS_TEXT_MAP[dialogStatus]+data.name+'流程设计'"
    :visible="visible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    destroy-on-close
    @close="handleCancel"
  >
    <form_process_design
      ref="dialogRef"
      :title="title"
      @closeMeOk="handleMeOk"
    />
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import form_process_design from '@/components/60_bpm/admin/FormProcessDesign'
import constants_para from '@/common/constants/constants_para'
import { getDetailApi } from '@/api/40_business/bpmprocess/bpmprocess'

export default {
  components: { form_process_design },
  directives: { elDragDialog },
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
    dialogStatus: {
      type: String,
      default: constants_para.STATUS_VIEW
    },
    title: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // 是否显示弹出层
      open: false,
      dataJson: {
        // 页面设置json
        settings: {
          // 按钮状态：是否可用
          btnDisabledStatus: {
            disabledOk: false
          }
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
  watch: {
    // 监听页面上面是否有选择
    // 监听页面是否打开
    listenVisible: {
      handler (newVal, oldVal) {
        if (newVal) {
          // dialog打开后初始化
          this.$nextTick(() => {
            // this.$refs.dialogRef.initDialogStatus()
            // this.$refs.dialogRef.initShow()
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    this.init()
    // 设置dialog的返回
  },
  methods: {
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 正常关闭页面
    handleMeOk (val) {
      this.$emit('closeMeOk', val)
    },
    init () {
      /**
       * 获取流程设计数据
       */
      console.log('this.data:', this.data)
      getDetailApi(this.data).then(response => {
        const form = response.data

        form.settings = JSON.parse(form.settings)
        form.formItems = JSON.parse(form.form_items)
        form.process = JSON.parse(form.process)
        form.notify = JSON.parse(form.notify)
        this.$store.commit('loadForm', form)
        this.$emit('loadForm', form)
      }, (_error) => {
        // this.showErrorMsg('发生了异常，请联系管理员！', _error.data)
        console.log('发生了异常，请联系管理员！:' + JSON.stringify(_error))
      }).finally(() => {
      })
    }
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  margin-top: 0vh !important;
  height: 95vh;
  width: 95vw;
  overflow: auto;
}
</style>
