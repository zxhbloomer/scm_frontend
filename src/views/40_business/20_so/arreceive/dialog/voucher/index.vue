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
    <div
      :style="{ height: '700px',overflowY:'auto' } "
    >
      <my-page
        ref="myPageRef"
        :data="data"
        @closeMeOk="handleDoOk"
        @closeMeCancel="handleDoCancel"
      />
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        size="medium"
        :disabled="settings.loading"
        @click="handleCancel()"
      >关闭</el-button>
      <el-button
        type="primary"
        @click="handleReceiveComplete"
      >完成收款</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import myPage from './edit.vue'
import mixin from './mixin'

export default {
  components: { myPage },
  directives: { elDragDialog },
  mixins: [mixin],
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
      },
      // 页面设置json
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
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      this.$emit('closeMeCancel')
    },
    // 下推按钮点击事件
    doInsert () {
      if (this.$refs.myPageRef && this.$refs.myPageRef.doInsert) {
        this.$refs.myPageRef.doInsert()
      }
    },
    // 返回按钮点击事件
    handleCancel () {
      if (this.$refs.myPageRef && this.$refs.myPageRef.handleCancel) {
        this.$refs.myPageRef.handleCancel()
      }
    },
    handleReceiveComplete () {
      if (this.$refs.myPageRef && this.$refs.myPageRef.receiveComplete) {
        this.$refs.myPageRef.receiveComplete()
      }
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}
</style>
