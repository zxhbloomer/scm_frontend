import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'

export default {
  created () {
    // 作为独立页面，通过route路由打开时
    this.$options.name = this.$route.meta.page_code
  },
  beforeMount () {
  },
  mounted () {
    this.setUIheight()
    this.$nextTick(() => {
      addResizeListener(window.document.body, this.doResize)
    })
  },
  updated () {
    this.setUIheight()
  },
  // 生命周期结束时销毁事件
  destroyed () {
    if (this.resizeListener) removeResizeListener(window.document.body, this.doResize)
  },
  methods: {
    doResize () {
      this.setUIheight()
    },
    setUIheight () {
      try {
        const rtnVal = 1111 - 95

        // 此处使用的是页面上的值
        this.settings.tableHeight = rtnVal
        return rtnVal
      } catch (error) {
        console.log('mixin error')
      }
    },
    /**
     * 判断是否显示placeholder
     */
    isPlaceholderShow (placeholder) {
      return placeholder
    },

    /**
     * 获取标签位置
     */
    getLabelPosition () {
      return 'right'
    }
  }
}
