<template>
  <el-dialog
    v-if="listenVisible"
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
      :me-dialog-status="visible"
      :data="data"
      @rowDbClick="handleRowDbClick"
    />
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        @click="handleDoCancel()"
      >取消</el-button>
      <el-button
        :disabled="dataJson.settings.btnDisabledStatus.disabledOk"
        @click="handleDoOk()"
      >确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import myPage from '@/views/20_master/enterprise/tabs/10_list/index.vue'

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
      }
    }
  },
  computed: {
    listenSelectedDataJson () {
      console.log(this.$store.getters.selectedMultipleDataJson)
      return this.$store.getters.selectedMultipleDataJson
    },
    listenVisible () {
      return this.visible
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
    },
    // 监听页面是否打开
    listenVisible: {
      handler (newVal, oldVal) {
        if (newVal) {
          // dialog打开后初始化
          this.$nextTick(() => {
            this.$refs.dialogRef.initDialogStatus()
            // this.$refs.dialogRef.initShow()
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    // 设置dialog的返回
    this.$store.dispatch('popUpSearchMultipleDialog/selectedMultipleDataJson', null)
  },
  methods: {
    handleRowDbClick (val) {
      this.$emit('closeMeOk', this.$store.getters.selectedMultipleDataJson)
    },
    // 确定
    handleDoOk () {
      // this.$emit('update:visible', false)
      // 遍历数据，将id置空
      this.$store.getters.selectedMultipleDataJson.forEach(item => {
        item.enterprise_id = item.id
        item.id = null
      })

      this.$emit('closeMeOk', this.$store.getters.selectedMultipleDataJson)
    },
    // 取消
    handleDoCancel () {
      // this.$emit('update:visible', false)
      this.$store.dispatch('popUpSearchMultipleDialog/selectedMultipleDataJson', null)
      this.$emit('closeMeCancel')
    }
  }
}
</script>
