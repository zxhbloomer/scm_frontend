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
import myPage from './list.vue'

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
    handleRowDbClick (val) {
      this.$emit('closeMeOk', this.$store.getters.selectedDataJson)
    },
    // 确定
    handleDoOk () {
      this.$emit('closeMeOk', this.$store.getters.selectedDataJson)
    },
    // 取消
    handleDoCancel () {
      // this.$emit('update:visible', false)
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      this.$emit('closeMeCancel')
    }
  }
}
</script>
