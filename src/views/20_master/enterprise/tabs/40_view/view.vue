<template>
  <div>
    <el-row>
      <el-col
        :span="18"
        style="padding-right:8px;"
        :style="{ height: divLeftHeight + 'px',overflowY:'auto' } "
      >
        <!--左边业务数据区域-->
        <!--企业管理-->
        <left_data_template
          :data="data"
          :edit-status="editStatus"
        />
      </el-col>
      <el-col
        :span="6"
        :style="{ height: divRightHeight + 'px',overflowY:'auto' } "
      >
        <!--右边审批流程数据-->
        <bpmprocess_body_template
          :data="dataJson.processData"
          :edit-status="editStatus"
          :enable-cancel="enableCancel"
          @emitReturn="handleReturn"
        />
      </el-col>
    </el-row>
    <el-row class="3333333" :style="{ height: divFootHeight + 'px' } ">
      <el-col>
        <!--底部审批按钮-->
        <bpmprocess_foot_template
          :data="dataJson.processData"
          :edit-status="editStatus"
          :enable-cancel="enableCancel"
          @emitReturn="handleReturn"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import bpmprocess_body_template from '@/components/ProcessProgress/ProcessInstancePreview.vue'
import bpmprocess_foot_template from '@/components/ProcessProgress/ProcessInstancePreview_foot_container.vue'
import left_data_template from './detail.vue'
import mixin from './view_mixin'

export default {
  components: { left_data_template, bpmprocess_body_template, bpmprocess_foot_template },
  mixins: [mixin],
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
        processData: { process_code: this.data.bpm_instance_code, task_id: this.data.task_id }
      }
    }
  },
  computed: {
  },
  methods: {
    handleReturn () {
      this.$emit('emitReturn')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
