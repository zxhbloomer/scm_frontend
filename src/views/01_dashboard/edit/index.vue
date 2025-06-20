<template>
  <div class="edit-container">
    <!-- 添加任务栏 -->
    <div class="addPanel-position-box">
      <div class="addPanel-container">
        <div class="panel-text-box">
          <i class="iconfont icon-layout" />
          <span>面板 / </span>
          <span>{{ layout.length }}</span>
        </div>
        <el-divider direction="vertical" />
        <div class="add-panel-box" @click="addPanelDialog = true">
          <i class="el-icon-circle-plus" />
          <span>添加面板</span>
        </div>
        <div class="saveBtn-box">
          <el-button @click="exitEdit">退出编辑</el-button>
          <el-button @click="handleReset">初始化</el-button>
          <el-button class="save-btn" @click="saveLayoutData">保存</el-button>
        </div>
      </div>
    </div>
    <!-- 面板对话框 -->
    <el-dialog title="选择面板" :visible.sync="addPanelDialog" width="40%">
      <span>
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >全选</el-checkbox>
        <div style="margin: 15px 0;" />
        <el-checkbox-group
          v-model="checkPanelItem"
          @change="handleCheckedCitiesChange"
        >
          <el-checkbox
            v-for="(item, index) in panels"
            :key="index"
            :disabled="item === '个人信息'"
            :label="item"
          >{{ item }}</el-checkbox>
        </el-checkbox-group>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addPanelDialog = false">取 消</el-button>
        <el-button @click="resetPanel">恢复默认设置</el-button>
        <el-button type="primary" @click="getPanelItem">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 自定义布局项 -->
    <grid-layout
      :layout.sync="layout"
      :col-num="24"
      :row-height="30"
      :is-draggable="true"
      :is-resizable="true"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[10, 10]"
      :use-css-transforms="true"
      @layout-mounted="handleLayoutMountedEvent"
    >
      <grid-item
        v-for="item in layout"
        :key="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :static="item.static"
        @resize="handleResizeEvent"
        @resized="handleResizedEvent"
      >
        <person
          v-if="item.name === '个人信息'"
          :id="item.i"
          :edit-person-style="true"
          @deletePanelItemEvent="deletePanelItem"
          @exitEditEvent="handleExitEditEvent"
        />
        <wait-matter
          v-if="item.name === '待办事项'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <notice
          v-if="item.name === '公告栏'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <document
          v-if="item.name === '待办公文'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <quick-operation
          v-if="item.name === '快捷操作'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <often-app
          v-if="item.name === '常用应用'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <often-apply
          v-if="item.name === '常用流程'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <today-work
          v-if="item.name === '我的日程'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <chart-sales-amount
          v-if="item.name === '销售合计'"
          :id="item.i"
          :resize-event-flag="resizeEventFlag"
          @deletePanelItemEvent="deletePanelItem"
        />
        <Remind
          v-if="item.name === '待办超时提醒'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <meeting
          v-if="item.name === '我的会议'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <my-task
          v-if="item.name === '我的待办'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <process
          v-if="item.name === '待办流程'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <my-document
          v-if="item.name === '督办公文'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <monthly-overview-po
          v-if="item.name === '当月信息统计-采购'"
          :id="item.i"
          :resize-event-flag="resizeEventFlag"
          @deletePanelItemEvent="deletePanelItem"
        />
        <monthly-overview-so
          v-if="item.name === '当月信息统计-销售'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <todayInfo4
          v-if="item.name === '今日信息统计'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
        <alarm
          v-if="item.name === '预警'"
          :id="item.i"
          @deletePanelItemEvent="deletePanelItem"
        />
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import notice from '../components/Notice'
import document from '../components/Document'
import quickOperation from '../components/quickOperation'
import oftenApp from '../components/oftenApp'
import oftenApply from '../components/oftenApply.vue'
import todayWork from '../components/todayWork'
import chartSalesAmount from '../components/chartSalesAmount'
import monthlyOverviewPo from '../components/monthlyOverviewPo'
import VueGridLayout from 'vue-grid-layout'
import Person from '../components/Person'
import waitMatter from '../components/WaitMatter'
import Remind from '../components/Remind'
import Meeting from '../components/Meeting'
import MyTask from '../components/MyTask'
import Process from '../components/Process'
import MyDocument from '../components/MyDocument'
import { initPanelsLayout } from '@/assets/js/layout'
import { saveInfoApi, resetInfoApi } from '@/api/01_dashboard'
import deepCopy from 'deep-copy'
import monthlyOverviewSo from '../components/monthlyOverviewSo.vue'
import todayInfo4 from '../components/todayInfo4.vue'
import alarm from '../components/myAlarm.vue'

const layout = Array.from(initPanelsLayout)
const panelOptions = []
for (const attr in initPanelsLayout) {
  panelOptions.push(initPanelsLayout[attr].name)
}

export default {
  components: {
    todayInfo4,
    monthlyOverviewSo,
    notice,
    document,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    quickOperation,
    oftenApp,
    oftenApply,
    todayWork,
    chartSalesAmount,
    Person,
    waitMatter,
    Remind,
    Meeting,
    MyTask,
    Process,
    MyDocument,
    monthlyOverviewPo,
    alarm
  },
  data () {
    return {
      initLayout: layout,
      layout: [],
      checkPanelItem: [],
      defaultCheckPanelItem: [],
      panels: panelOptions,
      addPanelDialog: false,
      checkAll: false,
      isIndeterminate: true,
      settings: { duration: 4000 },
      resizeEventFlag: false
    }
  },
  created () {
    this.initPanel()
  },
  methods: {
    // 初始化面板项
    initPanel () {
      const layout = JSON.parse(window.sessionStorage.getItem('layout'))
      if (layout === null) {
        this.checkPanelItem = panelOptions
        this.layout = initPanelsLayout
      } else {
        this.layout = layout
        for (const attr in this.layout) {
          this.checkPanelItem[attr] = this.layout[attr].name
        }
      }
    },
    // 全选面板选项
    handleCheckAllChange (val) {
      this.checkPanelItem = val ? this.panels : ['个人信息']
      this.isIndeterminate = false
    },
    // 多选面板选项
    handleCheckedCitiesChange (value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.panels.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.panels.length
    },
    // 添加面板
    getPanelItem () {
      const newLayout = []
      const panelName = []
      const layout = JSON.parse(window.sessionStorage.getItem('layout'))
      if (layout) {
        for (const attr in layout) {
          this.checkPanelItem.filter(item => {
            if (item === layout[attr].name) {
              newLayout.push(layout[attr])
              panelName.push(layout[attr].name)
            }
          })
        }
        const addPanel = this.checkPanelItem
          .concat(panelName)
          .filter((item, i, arr) => {
            return arr.indexOf(item) === arr.lastIndexOf(item)
          })
        for (const attr in this.initLayout) {
          addPanel.filter(item => {
            console.log('面板数据', this.initLayout[attr].name)
            if (item === this.initLayout[attr].name) {
              newLayout.push(this.initLayout[attr])
            }
          })
        }
        this.layout = newLayout
      } else {
        console.log(this.checkPanelItem)
        const result = []
        for (const attr in this.initLayout) {
          result.push(this.initLayout[attr].name)
          this.checkPanelItem.filter((item, index) => {
            if (item === this.initLayout[attr].name) {
              newLayout.push(this.initLayout[attr])
            }
          })
        }
        this.layout = newLayout
      }
      this.addPanelDialog = false
    },
    // 恢复默认设置面板
    resetPanel () {
      this.checkPanelItem = this.panels
    },
    // 保存最新面板布局参数
    saveLayoutData () {
      /**
       * 数据库保存
       */
      console.log('this.layout', this.layout)
      this.showLoading('正在保存，请稍后...')
      window.sessionStorage.setItem('layout', JSON.stringify(this.layout))
      saveInfoApi({ config: JSON.stringify(this.layout) })
        .then(
          _data => {
            this.closeLoading()
            this.$notify({
              title: '桌面保存成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
          },
          _error => {
            this.closeLoading()
            this.$notify({
              title: '桌面保存失败',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
          }
        )
        .finally(() => {
          this.closeLoading()
        })
      this.$emit('saveLayoutDataEvent', this.layout)
    },
    // 根据面板id删除面板
    deletePanelItem (panelId) {
      const deleteName = []
      const layout = Array.from(this.layout)
      console.log(this.initLayout)
      for (const attr in layout) {
        if (layout[attr].i === panelId) {
          deleteName.push(layout[attr].name)
          delete layout[attr]
        }
      }
      this.layout = layout.filter(item => {
        if (item !== undefined) {
          return item
        }
      })
      console.log(this.initLayout)
      this.checkPanelItem = this.checkPanelItem
        .concat(deleteName)
        .filter((item, index, Arr) => {
          return Arr.indexOf(item) === Arr.lastIndexOf(item)
        })
    },
    // 退出编辑
    exitEdit () {
      this.$emit('exitEditEvent')
    },
    /**
     * 初始化数据读取
     */
    handleReset () {
      // 读取数据库默认数据数据
      console.log('this.layout', this.layout)
      resetInfoApi()
        .then(
          _data => {
            this.layout = deepCopy(_data.data.config)
            window.sessionStorage.setItem('layout', this.layout)
            this.initPanel()
          },
          _error => {
            this.$notify({
              title: '桌面初始化失败',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
          }
        )
        .finally(() => {
        })
    },
    handleExitEditEvent () {
      this.$emit('exitEditEvent')
    },
    // 调整大小完成后触发
    handleResizeEvent (i, newH, newW, newHPx, newWPx) {
      this.resizeEventFlag = !this.resizeEventFlag
    },
    // 调整大小完成后触发
    handleResizedEvent (i, newH, newW, newHPx, newWPx) {
      this.resizeEventFlag = !this.resizeEventFlag
    },
    // 布局挂载后
    handleLayoutMountedEvent () {
      this.resizeEventFlag = !this.resizeEventFlag
    }
  }
}
</script>

<style scoped>
.edit-container {
  background-color: #ebeef5;
  background-image: radial-gradient(#ccc 4%, transparent 0);
  background-size: 45px 45px;
  height:  calc(100vh - 100px);;
}
/* 头部添加面板区域 */
.addPanel-position-box {
  position: sticky;
  top: 0px;
  z-index: 100;
}
.addPanel-container {
  height: 56px;
  display: flex;
  align-items: center;
  font-size: 14px;
  position: relative;
  background: #ebeef5;
}
.el-icon-circle-plus {
  color: #396aff;
  margin-right: 10px;
  cursor: pointer;
}
.saveBtn-box {
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  right: 10px;
}
.save-btn {
  background-color: #396aff !important;
  color: #fff !important;
}
.icon-layout {
  margin-right: 10px;
}
.panel-text-box {
  padding: 5px 10px;
}
.add-panel-box {
  padding: 5px 10px;
  cursor: pointer;
}
.add-panel-box:hover {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  color: #409eff;
}
/* 自定义布局项 */
.vue-grid-layout {
  width: 100%;
}
/* 多选框 */
.el-checkbox-group {
  display: flex;
  flex-direction: column;
}
.el-checkbox {
  margin-bottom: 10px;
}
</style>
