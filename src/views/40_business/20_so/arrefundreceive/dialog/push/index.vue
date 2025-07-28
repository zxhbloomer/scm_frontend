<template>
  <el-dialog
    v-el-drag-dialog
    :title="title"
    :visible="visible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1300px"
    destroy-on-close
    top="5vh"
  >
    <my-page
      ref="dialogRef"
      :data="data"
      @closeMeOk="handleDoOk"
      @closeMeCancel="handleDoCancel"
    />
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        size="medium"
        type="primary"
        :disabled="settings.loading"
        @click="handleSubmit()"
      >下推</el-button>
      <el-button
        size="medium"
        :disabled="settings.loading"
        @click="handleCancel()"
      >返回</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import myPage from './edit.vue'

export default {
  components: { myPage },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    datas: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dataJson: {
        // 页面设置json
        settings: {
          // 按钮状态：是否可用
          btnDisabledStatus: {
            disabledOk: false
          }
        }
      }, // 页面设置json
      settings: {
        // loading 状态
        loading: false
      }
    }
  },
  computed: {
    listenSelectedDataJson () {
      console.log(this.$store.getters.selectedDataJson)
      return this.$store.getters.selectedDataJson
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有选择
    listenSelectedDataJson: {
      handler (newVal, oldVal) {
        if (newVal === undefined || newVal === null || newVal.length === 0) {
          this.dataJson.settings.btnDisabledStatus.disabledOk = true
        } else {
          this.dataJson.settings.btnDisabledStatus.disabledOk = false
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    // 设置dialog的返回
    this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
  },
  methods: {
    // 确定
    handleDoOk () {
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      this.$emit('closeMeOk')
    },
    // 取消
    handleDoCancel () {
      // this.$emit('update:visible', false)
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      this.$emit('closeMeCancel')
    },
    // 下推按钮点击事件
    handleSubmit () {
      // 先验证表单数据
      if (this.$refs.dialogRef && this.$refs.dialogRef.validateForm) {
        this.$refs.dialogRef.validateForm().then(() => {
          // 验证通过，进行下推处理
          this.settings.loading = true

          // 获取表单数据
          const formData = this.$refs.dialogRef.getFormData()

          // 调用下推API
          import('@/api/40_business/20_so/arrefundreceive/arrefundreceive').then(({ insertApi }) => {
            const submitData = {
              ar_refund_id: this.data.id,
              ar_refund_code: this.data.code,
              ...formData
            }

            insertApi(submitData).then(response => {
              this.settings.loading = false
              this.$emit('closeMeOk')
              this.$message.success('下推成功')
            }).catch(error => {
              this.settings.loading = false
              this.$message.error('下推失败：' + (error.message || '未知错误'))
            })
          })
        }).catch(error => {
          // 验证失败，显示错误信息
          this.$message.error(error.message)
        })
      } else {
        this.$message.error('无法获取表单验证方法')
      }
    },
    // 返回按钮点击事件
    handleCancel () {
      this.handleDoCancel()
    }
  }
}
</script>
<style scoped>
.dialog-footer {
  text-align: center;
}
</style>