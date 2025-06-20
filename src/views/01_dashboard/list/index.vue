<template>
  <div class="edit-container">
    <!-- 自定义布局项，不可拖拽与不可调整大小 -->
    <grid-layout
      :layout.sync="layout"
      :col-num="24"
      :row-height="30"
      :is-draggable="false"
      :is-resizable="false"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[10, 10]"
      :use-css-transforms="true"
    >
      <grid-item
        v-for="item in layout"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
      >
        <notice
          v-if="item.name === '公告栏'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <document
          v-if="item.name === '待办公文'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <quick-operation
          v-if="item.name === '快捷操作'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <often-app
          v-if="item.name === '常用应用'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <often-apply
          v-if="item.name === '常用流程'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <today-work
          v-if="item.name === '我的日程'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <chart-sales-amount
          v-if="item.name === '销售合计'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <person
          v-if="item.name === '个人信息'"
          :id="item.i"
          :panel-set-icon="true"
          @editDesktopEvent="editDesktop"
        />
        <wait-matter
          v-if="item.name === '待办事项'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <remind v-if="item.name === '待办超时提醒'" :id="item.i" :panel-set-icon="true" />
        <meeting v-if="item.name === '我的会议'" :id="item.i" :panel-set-icon="true" />
        <my-task v-if="item.name === '我的待办'" :id="item.i" :panel-set-icon="true" />
        <process v-if="item.name === '待办流程'" :id="item.i" :panel-set-icon="true" />
        <my-document
          v-if="item.name === '督办公文'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <monthly-overview-po
          v-if="item.name === '当月信息统计-采购'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <monthly-overview-so
          v-if="item.name === '当月信息统计-销售'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <todayInfo4
          v-if="item.name === '今日信息统计'"
          :id="item.i"
          :panel-set-icon="true"
        />
        <alarm
          v-if="item.name === '预警'"
          :id="item.i"
          :panel-set-icon="true"
        />
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import VueGridLayout from 'vue-grid-layout'
import notice from '../components/Notice'
import document from '../components/Document'
import quickOperation from '../components/quickOperation'
import oftenApp from '../components/oftenApp'
import oftenApply from '../components/oftenApply.vue'
import todayWork from '../components/todayWork'
import Person from '../components/Person'
import waitMatter from '../components/WaitMatter'
import Remind from '../components/Remind'
import Meeting from '../components/Meeting'
import MyTask from '../components/MyTask'
import Process from '../components/Process'
import MyDocument from '../components/MyDocument'
import todayInfo4 from '../components/todayInfo4'
import alarm from '../components/myAlarm.vue'

import { getInfoApi } from '@/api/01_dashboard'
import deepCopy from 'deep-copy'
import chartSalesAmount from '../components/chartSalesAmount.vue'
import monthlyOverviewPo from '../components/monthlyOverviewPo.vue'
import monthlyOverviewSo from '../components/monthlyOverviewSo.vue'

export default {
  components: {
    monthlyOverviewPo,
    monthlyOverviewSo,
    chartSalesAmount,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    notice,
    document,
    quickOperation,
    oftenApp,
    oftenApply,
    todayWork,
    Person,
    waitMatter,
    Remind,
    Meeting,
    MyTask,
    Process,
    MyDocument,
    todayInfo4,
    alarm
  },
  data () {
    return {
      layout: [],
      panels: []
    }
  },
  created () {
    this.getNewPanels()
    this.initPanel()
  },
  mounted () {
    this.initData()
  },
  methods: {
    // 初始化面板项
    initPanel () {
      const layout = JSON.parse(window.sessionStorage.getItem('layout'))
      if (!layout) {
        this.checkPanelItem = this.panels
      }
    },
    /**
     * 初始化数据
     */
    initData () {
      getInfoApi().then(response => {
        console.log('initData', response)
        this.layout = deepCopy(JSON.parse(response.data.config))
        window.sessionStorage.setItem('layout', JSON.stringify(this.layout))
        for (const attr in this.layout) {
          this.panels.push(this.layout[attr].name)
        }
      })
    },
    // 页面加载完成，获取最新面板
    getNewPanels () {
      const layout = JSON.parse(window.sessionStorage.getItem('layout'))
      if (layout) {
        this.layout = layout
      }
    },
    // 编辑界面跳转
    editDesktop () {
      this.$emit('editDesktopEvent')
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-container {
  height:  calc(100vh - 100px);;
}

</style>
