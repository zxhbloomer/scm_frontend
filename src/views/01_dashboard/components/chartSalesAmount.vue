<template>
  <el-card
    ref="refCard"
  >
    <div slot="header">
      <span class="el-card-title">销售合计</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
    </div>
    <div class="sales-chart">
      <h2 class="title">总销售额 ¥7,220.21万</h2>
      <div
        id="echartsBox"
        ref="chart"
        class="chart-container"
        :style="{ height: height + 'px',width:width+'px' } "
      />
    </div>
  </el-card>
</template>
<script>
import * as echarts from 'echarts'
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'
import elementResizeDetectorMaker from 'element-resize-detector'

var chart

export default {
  props: {
    resizeEventFlag: {
      type: Boolean,
      required: false
    },
    panelSetIcon: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isPanelSetIcon: this.panelSetIcon,
      settings: {
        loading: false
      },
      height: 0,
      width: 0
    }
  },
  watch: {
    // 监听 resizeEventFlag 的变化
    resizeEventFlag (newVal) {
      if (newVal) {
        this.setDivWidthHeight()
      }
    }
  },
  updated () {
    this.setDivWidthHeight()
  },
  mounted () {
    this.initChart()
    this.$nextTick(() => {
      addResizeListener(window.document.body, this.doResize)
    })
  },
  // 生命周期结束时销毁事件
  destroyed () {
    if (this.resizeListener) removeResizeListener(window.document.body, this.doResize)
  },
  methods: {
    // 删除面板项发送事件
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    initChart () {
      var chartDom = document.getElementById('echartsBox') // 容器名字

      chart = echarts.init(this.$refs.chart)
      // 模拟月度销售数据（单位：百万）
      const data = [82, 68, 95, 110, 98, 127, 142, 135, 120, 148, 132, 150]

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>¥{c}M'
        },
        grid: {
          top: '15%',
          left: '5%',
          right: '5%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 150,
          interval: 50,
          axisLabel: {
            formatter: '{value}M'
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [{
          name: '销售额',
          type: 'bar',
          data: data,
          itemStyle: {
            color: '#3398db'
          },
          barWidth: '60%'
        }]
      }
      chart.setOption(option)

      // 点击F11时，echarts图表跟随屏幕的大小变化而变化
      window.addEventListener('resize', function () {
        chart.resize()
      })

      // 根据当前容器的尺寸变化而让图表也跟着变化
      const changeSize = elementResizeDetectorMaker()
      const _this = this
      changeSize.listenTo(chartDom, () => { // chartDom为之前获取到的容器名
        _this.$nextTick(() => {
          this.setDivWidthHeight()
          chart.resize()
        })
      })
    },
    setDivWidthHeight () {
      try {
        this.width = this.$refs.refCard.$el.clientWidth - 40
        this.height = this.$refs.refCard.$el.clientHeight - 140
        this.$nextTick(() => {
          chart.resize()
        })
        console.log('this.width', this.width)
      } catch (error) {
        console.log(' error')
      }
    },
    doResize () {
      this.setDivWidthHeight()
    }
  }
}
</script>

<style scoped>
.el-card {
  width: 100%;
  height: 100%;
}
.el-icon-close {
  font-size: 1.2em;
  cursor: pointer;
}
.el-card-title {
  font-weight: bold;
}
.sales-chart {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
}

.title {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.chart-container {

}
</style>
