<template>
  <el-card>
    <div slot="header">
      <span class="el-card-title">审批事项</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
    </div>
    <div v-if="settings.loading === false" class="wait-matter-box">
      <div class="grid-item item-1">
        <span class="wait-matter-title">待办流程</span>
        <span class="wait-matter-total">{{ dataJson.data.pendingProcessQty }}</span>
        <span
          class="wait-matter-complete-title"
        >今日<span class="wait-matter-complete-num">{{ dataJson.data.todayPendingProcessQty }}</span></span>
      </div>
      <div class="grid-item item-2">
        <span class="wait-matter-title">已处理</span>
        <span class="wait-matter-total">{{ dataJson.data.processedQty }}</span>
        <span
          class="wait-matter-complete-title"
        >今日<span class="wait-matter-complete-num">{{ dataJson.data.todayProcessedQty }}</span>
        </span>
      </div>
      <div class="grid-item item-3">
        <span class="wait-matter-title">已发起</span>
        <span class="wait-matter-total">{{ dataJson.data.initiatedQty }}</span>
        <span
          class="wait-matter-complete-title"
        >今日
          <span class="wait-matter-complete-num">{{ dataJson.data.todayInitiatedQty }}</span>
          <span
            class="wait-matter-complete-update"
          >日更新
            <span class="wait-matter-complete-update-num">{{ dataJson.data.todayUpdateInitiatedQty }}</span>
          </span>
        </span>
      </div>
      <div class="grid-item item-4">
        <span class="wait-matter-title">我收到的</span>
        <span class="wait-matter-total">{{ dataJson.data.todayProcessedQty }}</span>
        <span
          class="wait-matter-complete-title"
        >今日
          <span class="wait-matter-complete-num">{{ dataJson.data.todayReceivedQty }}</span>
        </span>
      </div>
    </div>
    <el-skeleton v-if="settings.loading" :rows="3" animated />
  </el-card>
</template>

<script>
import { getMatterDataApi } from '@/api/01_dashboard'
import { EventBus } from '@/common/eventbus/eventbus'

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
        data: {
          pendingProcessQty: 0,
          todayPendingProcessQty: 0,
          processedQty: 0,
          todayProcessedQty: 0,
          initiatedQty: 0,
          todayInitiatedQty: 0,
          todayUpdateInitiatedQty: 0,
          todayReceivedQty: 0
        }
      },
      settings: {
        loading: false,
        skeletonLoading: false
      }
    }
  },
  created () {
    // 消息推送后，数据取最新的
    EventBus.$on(this.EMITS.EMIT_NOTISE_BPM, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_NOTISE_BPM', _data)
      this.getData()
    })
  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_NOTISE_BPM)
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getData()
    },
    // 删除面板项发送事件
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
    },
    getData () {
      this.settings.loading = true
      getMatterDataApi().then(response => {
        // 确保响应数据的完整性
        this.dataJson.data = {
          pendingProcessQty: response.data?.pendingProcessQty || 0,
          todayPendingProcessQty: response.data?.todayPendingProcessQty || 0,
          processedQty: response.data?.processedQty || 0,
          todayProcessedQty: response.data?.todayProcessedQty || 0,
          initiatedQty: response.data?.initiatedQty || 0,
          todayInitiatedQty: response.data?.todayInitiatedQty || 0,
          todayUpdateInitiatedQty: response.data?.todayUpdateInitiatedQty || 0,
          todayReceivedQty: response.data?.todayReceivedQty || 0
        }
        this.settings.loading = false
      }).catch(error => {
        console.error('获取待办事项数据失败:', error)
        this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
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
.wait-matter-box {
  display: grid;
  grid-template-columns: repeat(4, 25%);
}
.wait-matter-box .grid-item {
  display: flex;
  flex-direction: column;
}
.grid-item .wait-matter-title,
.wait-matter-complete-title {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}
.grid-item .wait-matter-total {
  font-size: 1.5em;
  font-weight: bold;
  margin: 10px 0;
}
.grid-item .wait-matter-complete-num {
  margin-left: 10px;
  color: #29c814;
  font-size: 14px;
}
.wait-matter-complete-title .wait-matter-complete-update {
  margin-left: 10px;
}
.wait-matter-complete-update .wait-matter-complete-update-num {
  margin-left: 10px;
  color: #396aff;
  font-size: 14px;
}
</style>
