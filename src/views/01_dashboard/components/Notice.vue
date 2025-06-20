<template>
  <el-card
    ref="refCard"
  >
    <!-- 标题 -->
    <div slot="header">
      <span class="el-card-title">通知
      </span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
      <i
        v-show="isPanelSetIcon"
        class="iconfont icon-caret-right"
        style="float: right; padding: 3px 0"
      />
    </div>
    <!-- 标签栏 -->
    <el-tabs v-if="settings.loading === false" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane class="notice-all-box" label="全部" name="first">
        <!-- 内容列表 -->
        <div ref="refContainer1" class="all-box-2">
          <div
            v-for="(item, index) in dataJson.data.noticeListAll"
            :key="index"
            class="all-box-2-item"
          >
            <span
              class="title-item"
            >{{ item.title }}</span>
            <span class="name-item">{{ item.c_name }}</span>
            <span class="time-item">{{ formatDateTime( item.c_time) }}</span>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="系统通知" name="second">
        <!-- 内容列表 -->
        <div ref="refContainer2" class="all-box-2">
          <div
            v-for="(item, index) in dataJson.data.noticeListSystem"
            :key="index"
            class="all-box-2-item"
          >
            <span
              class="title-item"
            >{{ item.title }}</span>
            <span class="name-item">{{ item.c_name }}</span>
            <span class="time-item">{{ formatDateTime( item.c_time) }}</span>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="用户通知" name="third">
        <!-- 内容列表 -->
        <div ref="refContainer3" class="all-box-2">
          <div
            v-for="(item, index) in dataJson.data.noticeListPersonal"
            :key="index"
            class="all-box-2-item"
          >
            <span
              class="title-item"
            >{{ item.title }}</span>
            <span class="name-item">{{ item.c_name }}</span>
            <span class="time-item">{{ formatDateTime( item.c_time) }}</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-skeleton v-if="settings.loading" :rows="4" animated />
  </el-card>
</template>

<script>
import { getNoticeListApi } from '@/api/01_dashboard'
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'

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
      activeName: 'first',
      isPanelSetIcon: this.panelSetIcon,
      dataJson: {
        data: {
          noticeListAll: [],
          noticeListSystem: [],
          noticeListPersonal: []
        }
      },
      settings: {
        loading: false,
        skeletonLoading: false
      }
    }
  },
  mounted () {
    this.init()
    this.$nextTick(() => {
      addResizeListener(window.document.body, this.doResize)
    })
  },
  // 生命周期结束时销毁事件
  destroyed () {
    if (this.resizeListener) removeResizeListener(window.document.body, this.doResize)
  },
  methods: {
    init () {
      this.getData()
    },
    getData () {
      this.settings.loading = true
      getNoticeListApi().then(response => {
        this.dataJson.data = response.data
        this.settings.loading = false
      }).finally(() => {
        this.doResize()
        this.settings.loading = false
      })
    },
    handleClick (tab, event) {
      console.log(tab, event)
    },
    // 删除面板项
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    doResize () {
      try {
        const viewportHeight = this.$refs.refCard.$el.clientHeight
        const offsetHeight = 150 // +高度
        const finalHeight = viewportHeight - offsetHeight
        const container1 = this.$refs.refContainer1
        container1.style.height = `${finalHeight}px`
        const container2 = this.$refs.refContainer2
        container2.style.height = `${finalHeight}px`
        const container3 = this.$refs.refContainer3
        container3.style.height = `${finalHeight}px`
        console.log('我的待办，窗口调整高度', finalHeight)
      } catch (error) {
        console.log(' error')
      }
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
.notice-all-box {
  display: flex;
}
.all-box-1 {
  flex: 0 0 25%;
}
.all-box-1 img {
  width: 100%;
  height: 150px;
}
.all-box-2 {
  flex: 1;
  font-size: 14px;
  margin-left: 5px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}
.all-box-2 .all-box-2-item {
  display: grid;
  grid-template-columns: 4fr 1fr 2fr;
  height: 40px;
  line-height: 40px;
  cursor: pointer;
}
.all-box-2-item .name-item {
  text-align: center;
}
.all-box-2-item .title-item,
.time-item,
.name-item {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
