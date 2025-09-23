<template>
  <div ref="htmlRef" v-html="source" />
</template>

<script>
export default {
  name: 'HtmlRander',
  props: {
    source: {
      type: String,
      default: ''
    },
    scriptExec: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    source: {
      handler () {
        this.$nextTick(() => {
          this.initHtmlContent()
        })
      },
      immediate: false
    }
  },
  mounted () {
    this.initHtmlContent()
  },

  beforeDestroy () {
    // 清理可能的事件监听器
    if (this.$refs.htmlRef) {
      const scripts = this.$refs.htmlRef.getElementsByTagName('script')
      for (const script of scripts) {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }
  },
  methods: {
    initHtmlContent () {
      if (this.$refs.htmlRef && this.scriptExec) {
        this.executeScripts()
      }
    },

    executeScripts () {
      const htmlElement = this.$refs.htmlRef
      if (!htmlElement) return

      try {
        const range = document.createRange()
        range.selectNode(htmlElement)
        const scripts = htmlElement.getElementsByTagName('script')

        if (scripts && scripts.length > 0) {
          const scriptContents = []

          // 收集所有脚本内容
          for (let i = scripts.length - 1; i >= 0; i--) {
            const script = scripts[i]
            scriptContents.unshift(script.outerHTML)
            if (script.parentNode) {
              script.parentNode.removeChild(script)
            }
          }

          // 重新创建和执行脚本
          if (scriptContents.length > 0) {
            const documentFragment = range.createContextualFragment(
              scriptContents.join('\n')
            )
            htmlElement.appendChild(documentFragment)
          }
        }
      } catch (error) {
        console.warn('HTML脚本执行失败:', error)
      }
    },

    // 安全清理方法
    sanitizeHtml (html) {
      // 这里可以添加HTML清理逻辑，移除危险标签
      // 暂时保持原样，后续可以集成DOMPurify等库
      return html
    }
  }
}
</script>

<style lang="scss" scoped>
/* HTML内容渲染器样式 */
.html-content {
  /* 继承父容器样式 */
  word-wrap: break-word;
  word-break: break-all;
}

/* 确保内容不溢出 */
::v-deep * {
  max-width: 100%;
  box-sizing: border-box;
}

/* 表格样式优化 */
::v-deep table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

::v-deep table th,
::v-deep table td {
  border: 1px solid #EBEEF5;
  padding: 8px 12px;
  text-align: left;
}

::v-deep table th {
  background-color: #F5F7FA;
  font-weight: 500;
}

/* 图片样式优化 */
::v-deep img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* 代码块样式 */
::v-deep pre {
  background-color: #F5F7FA;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
}

::v-deep code {
  background-color: #F5F7FA;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}
</style>
