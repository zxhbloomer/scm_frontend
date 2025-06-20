<template>
  <div class="bpm-container">
    <div>
      <el-row>
        <el-col
          :span="18"
          style="padding-right:8px;"
        >
          <!--企业管理-->
          <left_data_template
            :data="data"
            :edit-status="editStatus"
          />
        </el-col>
        <el-col
          :span="6"
        >
          <div class="chart-wrapper">
            <!--审批流程-->
            <instance-preview
              :data="dataJson.processData"
              :edit-status="editStatus"
              :enable-cancel="enableCancel"
              @emitReturn="handleReturn"
            />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import InstancePreview from '@/components/ProcessProgress/ProcessInstancePreview.vue'
import constants_para from '@/common/constants/constants_para'
import left_data_template from '@/views/20_master/enterprise/tabs/40_view/detail.vue'
import constants_dict from '@/common/constants/constants_dict'

export default {
  components: { left_data_template, InstancePreview },
  props: {
    // 业务表
    data: {
      type: Object,
      default: null
    },
    /**
     * 40_view: 查看
     * audit：审批
     * update：更新
     * insert：插入
     */
    editStatus: {
      type: String,
      default: null
    },
    /**
     * 是否显示撤销按钮
     */
    enableCancel: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dataJson: {
        // 业务数据查询组装
        serialData: { id: this.data.serial_id },
        // 审批流程数据查询
        processData: { process_code: this.data.process_code, task_id: this.data.task_id }
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
        case constants_dict.DICT_M_ENTERPRISE: // 企业管理
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
  //  background: #fff;
  //  padding: 16px 16px 0;
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
