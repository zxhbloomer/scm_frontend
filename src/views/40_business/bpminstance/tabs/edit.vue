<template>
  <div class="bpm-container">
    <div>
      <el-row>
        <el-col
          :span="18"
          style="padding-right:8px;"
        >
          <!--出库计划-->
          <out-plan-edit-view
            v-if="data.serial_type === constants_dict.DICT_BPM_TODO_SERIAL_TYPE_OUT_PLAN"
            :data="assembleData(data)"
            :edit-status="constants_para.STATUS_VIEW"
          />

          <!--企业管理-->
          <customer-edit-view
            v-if="data.serial_type === constants_dict.DICT_M_ENTERPRISE"
            :data="assembleData(data)"
            :edit-status="constants_para.STATUS_VIEW"
          />
        </el-col>
        <el-col
          :span="6"
        >
          <div class="chart-wrapper">
            <!--审批流-->
            <instance-preview
              :data="dataJson.process_data"
              :edit-status="dataJson.editStatus"
              :enable-cancel="true"
            />
          </div>
        </el-col>
      </el-row>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />

      <el-button size="medium" @click="handleReturn">返回</el-button>
    </div>
  </div>
</template>

<script>
import InstancePreview from '@/components/ProcessProgress/ProcessInstancePreview.vue'
import OutPlanEditView from '@/views/40_business/bpminstance/tabs/left/outplanedit.vue'
import CustomerEditView from '@/views/40_business/bpminstance/tabs/left/enterprise_master.vue'
import constants_para from '@/common/constants/constants_para'
import constants_dict from '@/common/constants/constants_dict'

export default {
  components: { InstancePreview, OutPlanEditView, CustomerEditView },
  props: {
    // 业务数据
    data: {
      type: Object,
      default: null
    },
    editStatus: {
      type: String,
      default: constants_para.STATUS_VIEW
    }
  },
  data () {
    return {
      dataJson: {
        // 业务表数据参数组装
        serial_data: { id: this.data.serial_id },
        // 审批流查询参数组装
        process_data: { process_code: this.data.process_code, task_id: this.data.task_id, editStatus: this.editStatus }
      }
    }
  },
  computed: {
    constants_dict () {
      return constants_dict
    },
    constants_para () {
      return constants_para
    }
  },
  methods: {
    handleReturn () {
      this.$emit('emitReturn')
    },
    // 组装业务表数据参数
    assembleData (data) {
      switch (data.serial_type) {
        case constants_dict.DICT_BPM_TODO_SERIAL_TYPE_OUT_PLAN: // 出库计划
          return { id: this.data.serial_id }
        case constants_dict.DICT_M_ENTERPRISE: // 出库计划
          return { id: this.data.serial_id }
        default:
          return {
            id: this.data.serial_id
          }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bpm-container {
  //padding: 10px;
  //background-color: rgb(240, 242, 245);

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  //.chart-wrapper {
  //  padding: 10px;
  //  background: #fff;
  //  margin-bottom: 10px;
  //  height: calc(100vh - 170px);
  //}
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
.dialog-footer {
  text-align: center;
}

</style>
