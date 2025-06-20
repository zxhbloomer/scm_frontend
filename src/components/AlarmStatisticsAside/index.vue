<template>
  <el-aside width="320px">
    <el-row :gutter="10">
      <el-col :span="12">
        <StatisticsCardNew
          :title-one="'入库'"
          :number-one="dataJson.sumData.inCount"
          :page-code-one="constants_program.P_IN"
          :title-two="'出库同步失败'"
          :number-two="dataJson.sumData.outCount"
          :page-code-two="constants_program.P_OUT"
          @closeTable="closeTable"
        />
      </el-col>
      <el-col :span="12">
        <StatisticsCardNew
          :title-one="'入库'"
          :number-one="dataJson.sumData.inPlanCount"
          :page-code-one="constants_program.P_IN_PLAN"
          :title-two="'出库计划同步失败'"
          :number-two="dataJson.sumData.outPlanCount"
          :page-code-two="constants_program.P_OUT_PLAN"
          @closeTable="closeTable"
        />
      </el-col>
    </el-row>
    <br>
    <el-row :gutter="10">
      <el-col :span="12">
        <StatisticsCard
          title="车次异常"
          :number="dataJson.sumData.monitorCount"
          :page-code="constants_program.P_MONITOR"
          @closeTable="closeTable"
        />
      </el-col>
      <el-col :span="12">
        <StatisticsCard
          title="监管任务同步失败"
          :number="dataJson.sumData.monitorSyncErrorCount"
          :page-code="constants_program.P_MONITOR"
          sync-status="2"
          @closeTable="closeTable"
        />
      </el-col>
    </el-row>
    <br>
    <el-row :gutter="10">
      <el-col :span="12">
        <StatisticsCard
          title="待审核预警"
          :number="dataJson.sumData.monitor_unaudited"
          sync-status="7"
          :page-code="constants_program.P_MONITOR"
          @closeTable="closeTable"
        />
      </el-col>
      <el-col :span="12">
        <StatisticsCard
          title="港口中转停滞预警"
          :number="dataJson.sumData.inventory_stagnation_warning"
          :page-code="constants_program.M_INVENTORY_STAGNATION_WARNING"
          @closeTable="closeTable"
        />
      </el-col>
    </el-row>
    <br>
    <el-row :gutter="10">
      <el-col :span="12">
        <StatisticsCard
          title="监管任务损耗预警"
          :number="dataJson.sumData.monitor_loss_warning"
          :page-code="constants_program.P_MONITOR"
          sync-status="8"
          @closeTable="closeTable"
        />
      </el-col>
    </el-row>
  </el-aside>
</template>

<script>
import StatisticsCard from '@/components/StatisticsCard/index'
import StatisticsCardNew from '@/components/StatisticsCardNew/index'
import constants_program from '@/common/constants/constants_program'
import { getAlarmCount } from '@/api/10_system/message'

export default {
  components: { StatisticsCard, StatisticsCardNew },
  data () {
    return {
      constants_program: constants_program,
      dataJson: {
        searchForm: {},
        sumData: {
          monitorCount: 0,
          monitorSyncErrorCount: 0,
          outPlanCount: 0,
          outCount: 0,
          inCount: 0,
          inPlanCount: 0,
          monitor_unaudited: 0,
          inventory_stagnation_warning: 0,
          monitor_loss_warning: 0
        }
      }
    }
  },
  created () {
    this.getDataCount()
  },
  methods: {
    closeTable () {
      // Implement the closeTable logic here
    },
    getDataCount () {
      getAlarmCount(this.dataJson.searchForm).then(response => {
        this.dataJson.sumData = response.data
      }).finally(() => {
      })
    }
  }
}
</script>

<style scoped>
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
