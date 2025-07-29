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
import { printApi } from '@/api/40_business/20_so/cargo_right_transfer/cargorighttransfer'

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
      default: '货权转移单打印'
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
  watch: {
    // 全屏loading监听
    'settings.loading': {
      handler (newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在处理，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  created () { },
  mounted () { },
  methods: {
    handleOpend () {
      this.dataJson.loading = true
      printApi({ id: this.data.id }).then(response => {
        if (response.success) {
          this.dataJson.printUrl = response.data.print_url
        } else {
          this.$message.error(response.message || '获取打印地址失败')
          this.handleDoCancel()
        }
      }).catch(error => {
        console.error('获取打印地址失败:', error)
        this.$message.error('获取打印地址失败')
        this.handleDoCancel()
      }).finally(() => {
        this.dataJson.loading = false
      })
    },

    // 取消关闭
    handleDoCancel () {
      this.$emit('onCancel', false)
    },

    // 关闭弹窗
    handleClose () {
      this.$emit('onCancel', false)
    },

    // 显示加载
    showLoading (message) {
      this.$loading({
        lock: true,
        text: message,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },

    // 关闭加载
    closeLoading () {
      this.$loading().close()
    }
  }
}
</script>

<style scoped>
.iframe-container {
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.dialog-footer {
  text-align: center;
  padding: 10px 0;
}

.el-divider {
  margin: 10px 0;
}
</style>
