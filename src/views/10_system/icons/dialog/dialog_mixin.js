import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'

export default {
  data () {
    return {
      // div高度
      divHieght: 0
    }
  },
  created () {
  },
  beforeMount () {
  },
  mounted () {
    this.setDivHeight()
    this.$nextTick(() => {
      addResizeListener(window.document.body, this.doResize)
    })
  },
  updated () {
    this.setDivHeight()
  },
  // 生命周期结束时销毁事件
  destroyed () {
    if (this.resizeListener) removeResizeListener(window.document.body, this.doResize)
  },
  methods: {
    doResize () {
      this.setDivHeight()
    },
    setDivHeight () {
      try {
        // 定义高度
        const elementHeight = document.documentElement.clientHeight - 335
        const rtnVal = elementHeight

        this.divHieght = rtnVal
      } catch (error) {
        console.log('mixin error')
      }
    }
  }
}
