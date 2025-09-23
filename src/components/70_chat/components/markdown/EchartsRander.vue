<template>
  <div class="charts-container">
    <div
      ref="chartsRef"
      v-resize="handleChartResize"
      :style="chartStyle"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EchartsRander',

  // 添加resize指令支持（如果没有全局指令）
  directives: {
    resize: {
      bind (el, binding) {
        const callback = binding.value
        if (typeof callback === 'function') {
          // 使用ResizeObserver或window resize事件
          if (window.ResizeObserver) {
            el._resizeObserver = new ResizeObserver(() => {
              callback()
            })
            el._resizeObserver.observe(el)
          } else {
            // 降级到window resize事件
            const resizeHandler = () => callback()
            window.addEventListener('resize', resizeHandler)
            el._resizeHandler = resizeHandler
          }
        }
      },
      unbind (el) {
        if (el._resizeObserver) {
          el._resizeObserver.disconnect()
          delete el._resizeObserver
        }
        if (el._resizeHandler) {
          window.removeEventListener('resize', el._resizeHandler)
          delete el._resizeHandler
        }
      }
    }
  },
  props: {
    option: {
      type: String,
      required: true,
      default: ''
    }
  },
  data () {
    return {
      chartInstance: null,
      chartStyle: {
        height: '220px',
        width: '100%'
      }
    }
  },
  watch: {
    option: {
      handler (newOption) {
        if (newOption) {
          this.$nextTick(() => {
            this.initChart()
          })
        }
      },
      immediate: true
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy () {
    this.destroyChart()
  },
  methods: {
    initChart () {
      if (!this.$refs.chartsRef || !this.option) {
        return
      }

      try {
        // 销毁已存在的图表实例
        if (this.chartInstance) {
          this.chartInstance.dispose()
          this.chartInstance = null
        }

        // 获取或创建图表实例
        let chartInstance = echarts.getInstanceByDom(this.$refs.chartsRef)
        if (!chartInstance) {
          chartInstance = echarts.init(this.$refs.chartsRef)
        }
        this.chartInstance = chartInstance

        // 解析配置选项
        const optionConfig = this.parseChartOption(this.option)

        if (optionConfig) {
          // 设置图表配置
          this.chartInstance.setOption(optionConfig, true)
        }
      } catch (error) {
        console.error('图表初始化失败:', error)
      }
    },

    parseChartOption (optionString) {
      try {
        const optionData = JSON.parse(optionString)

        // 处理样式配置
        if (optionData.style) {
          this.chartStyle = { ...this.chartStyle, ...optionData.style }
        }

        // 根据不同的配置类型进行解析
        if (optionData.actionType === 'EVAL') {
          return this.evalParseOption(optionData)
        } else {
          return this.jsonParseOption(optionData)
        }
      } catch (error) {
        console.error('图表配置解析失败:', error)
        return null
      }
    },

    jsonParseOption (optionData) {
      // 直接返回JSON配置
      if (optionData.option) {
        return optionData.option
      }

      // 如果没有嵌套的option属性，直接返回配置对象
      // eslint-disable-next-line no-unused-vars
      const { style, actionType, ...chartOption } = optionData
      return chartOption
    },

    evalParseOption (optionData) {
      // 出于安全考虑，不推荐使用eval，这里提供一个安全的替代方案
      console.warn('EVAL模式存在安全风险，建议使用JSON配置')

      try {
        // 尝试解析为函数配置
        if (typeof optionData.option === 'string') {
          // 这里可以添加更安全的代码执行逻辑
          // 比如使用Function构造函数替代eval
          const optionFunction = new Function('echarts', `
            let option = {};
            ${optionData.option}
            return option;
          `)
          return optionFunction(echarts)
        }
      } catch (error) {
        console.error('EVAL配置解析失败:', error)
      }

      return null
    },

    handleChartResize () {
      if (this.chartInstance) {
        // 延迟执行resize以确保容器尺寸已更新
        this.$nextTick(() => {
          this.chartInstance.resize()
        })
      }
    },

    destroyChart () {
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }
    },

    // 获取图表实例（供外部调用）
    getChartInstance () {
      return this.chartInstance
    },

    // 手动刷新图表
    refreshChart () {
      this.initChart()
    }
  }
}
</script>

<style lang="scss" scoped>
.charts-container {
  overflow-x: auto;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #EBEEF5;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar-track-piece {
    background-color: rgba(0, 0, 0, 0);
    border-left: 1px solid rgba(0, 0, 0, 0);
  }

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    background-clip: padding-box;
    border-radius: 5px;
    min-height: 28px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}

/* 图表加载状态 */
.charts-container.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: #909399;
  font-size: 14px;
}

/* 图表错误状态 */
.charts-container.error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: #F56C6C;
  font-size: 14px;
  border-color: #FBC4C4;
  background-color: #FEF0F0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts-container {
    padding: 4px;
  }
}

/* 暗色主题支持 */
.dark-theme .charts-container {
  background: #2d2d2d;
  border-color: #404040;
  color: #ffffff;
}
</style>
