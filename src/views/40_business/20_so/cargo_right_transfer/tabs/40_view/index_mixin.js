import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'

export default {
  data () {
    return {
      // 左侧div高度
      divLeftHeight: 0,
      // 右侧div高度
      divRightHeight: 0,
      // 底部div高度
      divFootHeight: 0
    }
  },
  created () {
  },
  beforeMount () {
  },
  mounted () {
    this.setLeftDivHeight()
    this.setRightDivHeight()
    this.setFootDivHeight()
    this.$nextTick(() => {
      addResizeListener(window.document.body, this.doResize)
    })
  },
  updated () {
    this.setLeftDivHeight()
    this.setRightDivHeight()
    this.setFootDivHeight()
  },
  // 生命周期结束时销毁事件
  destroyed () {
    if (this.resizeListener) removeResizeListener(window.document.body, this.doResize)
  },
  methods: {
    doResize () {
      this.setLeftDivHeight()
      this.setRightDivHeight()
      this.setFootDivHeight()
    },
    setLeftDivHeight () {
      try {
        // 定义高度
        const elementHeight = document.documentElement.clientHeight - 185
        const rtnVal = elementHeight

        this.divLeftHeight = rtnVal
      } catch (error) {
        console.log('mixin error')
      }
    },
    setRightDivHeight () {
      try {
        // 定义高度
        const elementHeight = document.documentElement.clientHeight - 185
        const rtnVal = elementHeight

        this.divRightHeight = rtnVal
      } catch (error) {
        console.log('mixin error')
      }
    },
    setFootDivHeight () {
      try {
        // 定义高度
        const rtnVal = 90

        this.divFootHeight = rtnVal
      } catch (error) {
        console.log('mixin error')
      }
    }
  }
}