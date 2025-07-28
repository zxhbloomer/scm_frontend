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
    width="800px"
    destroy-on-close
    top="5vh"
    @opened="handleOpend"
  >
    <div
      class="iframe-container"
      style="height: 65vh;"
    >
      <iframe
        :v-if="dataJson.loading"
        :src="dataJson.printUrl"
        scrolling="no"
        style="width: 100%; height: 100%; border: 0;"
        sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin allow-downloads allow-top-navigation"
        frameborder="0"
        target="_self"
      />
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        @click="handleDoCancel()"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { printApi } from '@/api/40_business/20_so/soorder/soorder'

export default {
  components: { },
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
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dataJson: {
        printUrl: '',
        loading: false
      }
    }
  },
  computed: { },
  // 监听器
  watch: { },
  created () { },
  mounted () { },
  methods: {
    handleOpend () {
      this.loading = true
      printApi({ id: this.data.id }).then(response => {
        this.dataJson.printUrl = response.data.print_url
      }).finally(() => {
        this.loading = false
      })
    },
    // 取消
    handleDoCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
<style scoped>
.iframe-dialog >>> .el-dialog__body {
  padding: 0 !important;
  height: 90vh; /* 根据你的需求调整高度 */
}

.iframe-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>