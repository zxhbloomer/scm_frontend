<template>
  <el-card
    ref="refCard"
  >
    <!-- 标题 -->
    <div slot="header">
      <span class="el-card-title">我的待办</span>
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
    <!-- 内容 -->
    <div ref="refContainer" class="main_container scroll-container">
      <el-card
        v-for="(item, index) in dataJson.listData"
        :key="index"
        :body-style="{ padding: '10px' }"
        class="data_card"
      >
        <el-row>
          <el-col :span="2" :style="{ paddingRight: '10px' }">
            <el-avatar :size="30" :src="item.avatar" />
          </el-col>
          <el-col :span="20">
            <div
              class="card_head"
            >
              {{ item.process_definition_name }}
              <span style="font-size: 10px">
                {{ item.bpm_instance_code }}
              </span>
            </div>
          </el-col>
          <el-col :span="2">
            <div
              class="card_head_go"
              @click="handleGo"
            >
              前往
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="json_summary_container col-row">
              <div v-for="(value, key) in JSON.parse(item.json_summary)" :key="key">
                <span class="col-left">{{ key }}</span>
                <span class="col-right">{{ value }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <div style="border-top: 1px solid #eee;padding: 10px 0;">
            <el-col :span="4">
              <div class="card_label">
                提交人
              </div>
            </el-col>
            <el-col :span="6">
              <div class="card_value">
                {{ item.owner_name }}
              </div>
            </el-col>
            <el-col :span="5">
              <div class="card_label">
                提交时间
              </div>
            </el-col>
            <el-col :span="9">
              <div class="card_value">
                {{ item.c_time }}
              </div>
            </el-col>
          </div>
        </el-row>
      </el-card>
    </div>
  </el-card>
</template>

<script>
import { getListTenApi } from '@/api/40_business/bpm_todo/todo'
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
      isPanelSetIcon: this.panelSetIcon,
      dataJson: {
        // table使用的json
        listData: null
      },
      settings: {
        loading: false,
        skeletonLoading: false
      }
    }
  },
  mounted () {
    this.getDataList()
    this.$nextTick(() => {
      addResizeListener(window.document.body, this.doResize)
    })
  },
  // 生命周期结束时销毁事件
  destroyed () {
    if (this.resizeListener) removeResizeListener(window.document.body, this.doResize)
  },
  methods: {
    // 删除面板项
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    getDataList () {
      this.settings.loading = true
      getListTenApi().then(response => {
        this.dataJson.listData = response.data
      }).finally(() => {
        this.settings.loading = false
        this.doResize()
      })
    },
    handleGo () {
      console.log(' 前往按钮被点击')
    },
    doResize () {
      try {
        const viewportHeight = this.$refs.refCard.$el.clientHeight
        const offsetHeight = 90 // +高度
        const finalHeight = viewportHeight - offsetHeight
        const container = this.$refs.refContainer
        container.style.height = `${finalHeight}px`
        console.log('我的待办，窗口调整高度', finalHeight)
      } catch (error) {
        console.log(' error')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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
.card_head{
  font-weight: 700;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 如果需要水平对齐 */
  height: 100%; /* 设置容器的高度 */
}
.card_label{
  font-size: 13px;
  color: rgb(136 139 142);
  white-space: nowrap;    /* 防止换行 */
  overflow: hidden;        /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 使用 ... 表示溢出内容 */
}
.card_value {
  white-space: nowrap;    /* 防止换行 */
  overflow: hidden;        /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 使用 ... 表示溢出内容 */
}
.card_head_go {
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #f5f7fa;
    color: #409eff;
    cursor: pointer;
  }
}
.data_card{
  height: auto;
  margin-bottom: 10px;
}
// 新增样式
.json_summary_container {
  border-top: 1px solid #eee;
  padding: 10px 0;
}

.col-row {
  display: flex; // 使用 Grid 布局
  gap: 10px; // 列之间的间距
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  padding: 5px 0;
  min-height: 60px;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: center;
}

.col-left {
  font-size: 13px;
  white-space: normal; // 允许文字换行
  overflow-wrap: break-word; // 长文本自动换行
  color: #888;
}

.col-right {
  white-space: normal; // 允许文字换行
  overflow-wrap: break-word; // 长文本自动换行
}
/* 可选：添加悬停效果 */
.col-row:hover {
  background-color: rgba(0,0,0,0.02);
}
.scroll-container {
  overflow-y: auto;
  // 自定义滚动条样式
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
</style>
