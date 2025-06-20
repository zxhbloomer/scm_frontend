<template>
  <div>
    <el-container>
      <el-main>
        <span>
          待处理预警: {{ alarmCount }}
        </span>
        <div>
          <Content
            ref="content"
            @closeTable="closeTable"
          />
        </div>
      </el-main>
      <el-divider direction="vertical" />
      <StatisticsAside :close-table="closeTable" />
    </el-container>
  </div>
</template>

<script>
import Content from '@/views/10_system/websocketnotice/header/alarmcontentlist'
/* import StatisticsCard from '@/components/StatisticsCard/index'
import StatisticsCardNew from '@/components/StatisticsCardNew/index' */
import StatisticsAside from '@/components/AlarmStatisticsAside/index'

import { getAlarmCount } from '@/api/10_system/message'
import constants_program from '@/common/constants/constants_program'
import { mapState } from 'vuex'

export default {
  components: { Content, StatisticsAside },
  props: {
    // 是否显示
    showAlarm: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      constants_program: constants_program,
      dialogVisible: true,
      dataJson: {
        searchForm: {},
        sumData: {
          // 监管任务数量
          monitorCount: 0,
          // 监管任务同步失败
          monitorSyncErrorCount: 0,
          // 出库计划数量
          outPlanCount: 0,
          // 出库单数量
          outCount: 0,
          // 入库单数量
          inCount: 0,
          // 入库计划数量
          inPlanCount: 0,
          // 待审核预警
          monitor_unaudited: 0,
          // 港口停滞预警
          inventory_stagnation_warning: 0,
          // 监管任务损耗预警
          monitor_loss_warning: 0
        }
      }

    }
  },
  computed: {
    ...mapState('headNotice', ['alarmCount'])
  },
  created () {
    this.getDataCount()
    // alert(this.showAlarm)
  },
  beforeDestroy () {
    // alert('销毁了')
  },
  methods: {
    // handleClose (done) {
    //   this.$confirm('确认关闭？')
    //     .then(_ => {
    //       done()
    //     })
    //     .catch(_ => { })
    // },
    // 关闭通知
    closeTable () {
      this.$emit('closeTable')
    },
    // 查询数量
    getDataCount () {
      getAlarmCount(this.dataJson.searchForm).then(response => {
        this.dataJson.sumData = response.data
      }).finally(() => {
      })
    },
    handleParentReturn () {
      this.getDataCount()
      this.$refs.content.getDataList()
    }

  }
}
</script>

<style lang="scss" scoped>
.configDialog.el-dialog {
  .el-dialog__header {
    display: none !important;
  }
  .dj-dialog-content {
    padding: 0;
    overflow: unset;
  }
}
.el-checkbox {
  width: auto;
}
.configDialog ul {
  margin: 0;
  padding: 0;
}
.el-aside {
  background-color: white;
  padding: 10px 12px;
}
br {
  display: block;
  margin: 1px;
  content: ' ';
}
.el-main {
  padding: 1px;
  height: 272px;
}
.el-divider--vertical {
  display: inline-block;
  width: 2px;
  height: 20em;
  margin: 1px 2px;
  vertical-align: middle;
  position: relative;
}
::v-deep .el-main .container {
  height: 222px;
}
</style>
