<template>
  <div>
    <el-alert
      v-if="toDoCount > 10"
      title="存在多条数据，仅显示最前面的10条审批数据"
      type="warning"
      show-icon
      :closable="false"
    />
    <div class="main_container">
      <el-card
        v-for="(item, index) in dataJson.listData"
        :key="index"
        :body-style="{ padding: '5px' }"
      >
        <el-row>
          <el-col :span="2" :style="{ paddingRight: '10px' }">
            <el-avatar :size="20" :src="item.avatar" />
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
              @click="handleGo(item)"
            >
              前往
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="json_summary_container">
              <div v-for="(value, key) in JSON.parse(item.json_summary)" :key="key" class="col-row">
                <div class="col-left">{{ key }}</div>
                <div class="col-right">{{ value }}</div>
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
    <el-row v-if="toDoCount > 10">
      <div style="width: 100%">
        <el-button style="width: 100%" @click="handleShowMore">查看更多</el-button>
      </div>
    </el-row>
  </div>

</template>

<script>
import { getListTenApi } from '@/api/40_business/bpm_todo/todo'
import { mapState } from 'vuex'
import { EventBus } from '@/common/eventbus/eventbus'
export default {
  components: { },
  props: {

  },
  data () {
    return {
      dialogVisible: true,
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
  computed: {
    ...mapState('headNotice', ['alarmCount', 'toDoCount'])
  },
  created () {
    // 消息推送后，数据取最新的
    EventBus.$on(this.EMITS.EMIT_NOTISE_BPM, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_NOTISE_BPM', _data)
      this.getDataList()
    })
  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_NOTISE_BPM)
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    getDataList () {
      this.settings.loading = true
      getListTenApi().then(response => {
        this.dataJson.listData = response.data
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handleGo (val) {
      console.log(' 前往按钮被点击')
      this.$router.push({
        path: '/todo/index',
        query: {
          process_code: val.process_code
        }
      })
    },
    /**
     * 查看更多
     */
    handleShowMore () {
      console.log('查看更多')
      this.$router.push({ path: '/todo/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.main_container {
  display: flex;
  flex-wrap: wrap;  /* 允许子元素换行 */
  justify-content: space-between;  /* 水平方向间隔均匀 */
  align-items: center;  /* 垂直方向居中对齐 */
  width: 675px;  /* 容器宽度改为100%以适应不同屏幕 */
  height: 440px;
  overflow-y: auto; /* 添加垂直滚动条 */
}

.el-card {
  flex: 1;  /* 让每个卡片占据可用空间的1份 */
  min-width: 250px;  /* 设置卡片的最小宽度 */
  margin: 5px;  /* 卡片之间的间距 */

  /* 以下样式用于优化卡片外观 */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  /* 鼠标悬停效果 */
  &:hover {
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
}
.card_head{
  font-size: 15px;
  font-weight: 700;
}
.card_label{
  font-size: 13px;
  color: rgb(136 139 142);
  white-space: nowrap;    /* 防止换行 */
  overflow: hidden;        /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 使用 ... 表示溢出内容 */
}
.card_value {
  font-size: 13px;
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

.json_summary_container {
  border-top: 1px solid #eee;
}

.col-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 2px 0;
}

.col-left {
  min-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #888;
}

.col-right {
  flex: 1;
  max-width: calc(100% - 100px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 可选：添加悬停效果 */
.col-row:hover {
  background-color: rgba(0,0,0,0.02);
}
</style>
