<template>
  <el-card>
    <div slot="header">
      <span class="el-card-title">待办超时提醒</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
    </div>
    <div class="remind-box">
      <div id="doughnutChart" class="circle-progress" />
      <div
        class="circle-progress-content"
        :style="
          `position:absolute;top: 40%;left:${(circleProgressHeight - 51) /
            2}px;`
        "
      >
        <span class="content-title">待处理</span>
        <span class="content-num">{{ dataJson.data.pendingQty }}</span>
      </div>
      <div class="line-progress-box">
        <div class="line-progress-item">
          <span class="line-progress-title">超1天</span>
          <el-progress
            class="line-progress"
            color="rgb(155 156 159)"
            :show-text="false"
            :percentage="dataJson.data.overOneDaypercentage"
            :stroke-width="8"
          />
          <span class="line-progress-num">{{ dataJson.data.overOneDay }}</span>
        </div>
        <div class="line-progress-item">
          <span class="line-progress-title">超2天</span>
          <el-progress
            class="line-progress"
            color="#396AFF"
            :show-text="false"
            :percentage="dataJson.data.overTwoDaypercentage"
            :stroke-width="8"
          />
          <span class="line-progress-num">{{ dataJson.data.overTwoDay }}</span>
        </div>
        <div class="line-progress-item">
          <span class="line-progress-title">超3天</span>
          <el-progress
            class="line-progress"
            color="#FFB339"
            :show-text="false"
            :percentage="dataJson.data.overThreeDaypercentage"
            :stroke-width="8"
          />
          <span class="line-progress-num">{{ dataJson.data.overThreeDay }}</span>
        </div>
        <div class="line-progress-item">
          <span class="line-progress-title">超一周以上</span>
          <el-progress
            class="line-progress"
            color="#FF394C"
            :show-text="false"
            :percentage="dataJson.data.overOneWeekpercentage"
            :stroke-width="8"
          />
          <span class="line-progress-num">{{ dataJson.data.overOneWeek }}</span>
        </div>
      </div>
    </div>
    <div class="progress-explain-box">
      <div class="explain-item">
        <span class="dot-1" />
        <span class="explain-title">超1天</span>
      </div>
      <div class="explain-item">
        <span class="dot-2" />
        <span class="explain-title">超2天</span>
      </div>
      <div class="explain-item">
        <span class="dot-3" />
        <span class="explain-title">超3天</span>
      </div>
      <div class="explain-item">
        <span class="dot-4" />
        <span class="explain-title">超一周以上</span>
      </div>
    </div>
  </el-card>
</template>

<script>
import { getRemindDataApi } from '@/api/01_dashboard'
export default {
  props: {
    id: {
      type: [String, Number],
      required: true
    },
    panelSetIcon: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      panelId: this.id,
      isPanelSetIcon: this.panelSetIcon,
      circleProgressHeight: 0,
      dataJson: {
        data: {
          pendingQty: 0,
          overOneDay: 0,
          overOneDaypercentage: 0,
          overTwoDay: 0,
          overTwoDaypercentage: 0,
          overThreeDay: 0,
          overThreeDaypercentage: 0,
          overOneWeek: 0,
          overOneWeekpercentage: 0
        },
        chartData: [
          { value: 1, name: '超期1天' },
          { value: 2, name: '超期2天' },
          { value: 3, name: '超期3天' },
          { value: 4, name: '超一周以上' }
        ]
      },
      settings: {
        loading: false,
        skeletonLoading: false
      }
    }
  },
  created () {
    this.getData()
  },
  mounted () {

  },
  methods: {
    getData () {
      this.settings.loading = true
      getRemindDataApi().then(response => {
        // 确保响应数据的完整性和类型正确性
        this.dataJson.data = {
          pendingQty: response.data?.pendingQty || 0,
          overOneDay: response.data?.overOneDay || 0,
          overOneDaypercentage: this.ensureNumber(response.data?.overOneDaypercentage),
          overTwoDay: response.data?.overTwoDay || 0,
          overTwoDaypercentage: this.ensureNumber(response.data?.overTwoDaypercentage),
          overThreeDay: response.data?.overThreeDay || 0,
          overThreeDaypercentage: this.ensureNumber(response.data?.overThreeDaypercentage),
          overOneWeek: response.data?.overOneWeek || 0,
          overOneWeekpercentage: this.ensureNumber(response.data?.overOneWeekpercentage)
        }

        this.dataJson.chartData = [
          { value: this.dataJson.data.overOneDay, name: '超1天' },
          { value: this.dataJson.data.overTwoDay, name: '超2天' },
          { value: this.dataJson.data.overThreeDay, name: '超3天' },
          { value: this.dataJson.data.overOneWeek, name: '超一周以上' }
        ]
        this.$nextTick(() => {
          this.doughnut()
          this.circleProgressHeight = document.getElementById(
            'doughnutChart'
          ).clientWidth
        })
        this.settings.loading = false
      }).catch(error => {
        console.error('获取提醒数据失败:', error)
        this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 删除面板项发送事件
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    // 确保百分比值为数字类型
    ensureNumber (value) {
      if (value === null || value === undefined || value === '') {
        return 0
      }
      const num = Number(value)
      return isNaN(num) ? 0 : Math.max(0, Math.min(100, num))
    },
    // acharts饼形图
    doughnut () {
      const myChart = this.$echarts.init(
        document.getElementById('doughnutChart')
      )
      myChart.setOption({
        color: ['#ccc', '#396AFF', '#FFB339', '#FF394C'],
        series: [
          {
            name: '待办超时提醒',
            type: 'pie',
            radius: ['50%', '70%'],
            hoverAnimation: false,
            legendHoverLink: false,
            label: {
              show: false,
              position: 'center'
            },
            data: this.dataJson.chartData
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.el-card {
  height: 100%;
}
.el-icon-close {
  font-size: 1.2em;
  cursor: pointer;
}
.el-card-title {
  font-weight: bold;
}
.remind-box {
  display: flex;
  height: 160px;
  position: relative;
}
.remind-box .circle-progress {
  flex: 0 0 40%;
}
.circle-progress-content {
  /* position: absolute;
  top: 40%;
  left: 65px; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* transform: translate(-40%,0); */
}
.circle-progress-content .content-title {
  font-size: 0.8em;
  color: rgba(0, 0, 0, 0.45);
}
.circle-progress-content .content-num {
  font-size: 1.4em;
}
.remind-box .line-progress-box {
  flex: 1;
}
.line-progress-item {
  display: grid;
  grid-template-columns: 2fr 4fr 1fr;
  height: 40px;
  line-height: 40px;
}
.line-progress-item .line-progress-title {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}
.line-progress-item .line-progress-num {
  text-align: center;
}
.line-progress-item .line-progress {
  display: flex;
  align-items: center;
}

/* 类型提示 */
.progress-explain-box {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, 25%);
}
.progress-explain-box .explain-item {
  display: flex;
  justify-content: center;
  align-items: center;
}
.explain-item .dot-1,
.dot-2,
.dot-3,
.dot-4 {
  width: 10px;
  height: 10px;
  background: #e4e7ed;
  border-radius: 50%;
  margin-right: 10px;
}
.dot-2 {
  background: #396aff;
}
.dot-3 {
  background: #ffb339;
}
.dot-4 {
  background: #ff394c;
}
.explain-item .explain-title {
  font-size: 12px;
  color: #8c8c8c;
}
</style>
