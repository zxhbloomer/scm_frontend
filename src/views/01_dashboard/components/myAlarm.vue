<template>
  <el-card>
    <div slot="header">
      <span class="el-card-title">预警</span>
      <i
        v-show="!isPanelSetIcon"
        class="el-icon-close"
        style="float: right; padding: 3px 0"
        @click="deletePanelItem"
      />
    </div>
    <div>
      <el-container>
        <el-main>
          <span />
          <Content
            ref="content"
          />
        </el-main>
        <el-divider direction="vertical" />
        <el-aside width="330px">
          <el-row :gutter="20">
            <el-col :span="12">
              <StatisticsCardNew
                :title-one="'入库'"
                :number-one="dataJson.sumData.inCount"
                :page-code-one="constants_program.P_IN"
                :title-two="'出库同步失败'"
                :number-two="dataJson.sumData.outCount"
                :page-code-two="constants_program.P_OUT"
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
              />
            </el-col>
            <el-col :span="12">
              <StatisticsCard
                title="监管任务同步失败"
                :number="dataJson.sumData.monitorSyncErrorCount"
                :page-code="constants_program.P_MONITOR"
                sync-status="2"
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
              />
            </el-col>

            <el-col :span="12">
              <StatisticsCard
                title="港口中转停滞预警"
                :number="dataJson.sumData.inventory_stagnation_warning"
                sync-status="7"
                :page-code="constants_program.M_INVENTORY_STAGNATION_WARNING"
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
              />
            </el-col>
          </el-row>
        </el-aside>
      </el-container>
    </div>

  </el-card>
</template>

<script>
import StatisticsCardNew from '@/components/StatisticsCardNew/index.vue'
import StatisticsCard from '@/components/StatisticsCard/index.vue'
import { getAlarmCount } from '@/api/10_system/message'
import constants_program from '@/common/constants/constants_program'
import Content from '@/views/10_system/websocketnotice/dialog/alarmcontentlistdialog.vue'

export default {
  components: { Content, StatisticsCard, StatisticsCardNew },
  props: {
    id: { type: [String, Number], required: true },
    panelSetIcon: { type: Boolean, default: false }
  },
  data () {
    return {
      panelId: this.id,
      isPanelSetIcon: this.panelSetIcon,
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
    deletePanelItem () {
      this.$emit('deletePanelItemEvent', this.panelId)
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
.el-card {
  height: 100%;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.el-card-title {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
}

.el-icon-close {
  font-size: 1.2em;
  cursor: pointer;
}

.configDialog.el-dialog {
  .el-dialog__header {
    display: none !important;
  }
  .dj-dialog-content {
    padding: 0;
    overflow: unset;
  }
}
::v-deep .configDialog .el-dialog__body {
  padding: 10px 12px;
}

::v-deep .configDialog .el-dialog__footer {
  padding: 15px;
  padding-top: 0px;
}
.el-checkbox {
  width: auto;
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
  height: 300px;
}

::v-deep .el-main .container {
  height: 251px;
}
.el-divider--vertical {
  display: inline-block;
  width: 2px;
  height: 260px;
  margin: 1px 2px;
  vertical-align: middle;
  position: relative;
}
</style>
