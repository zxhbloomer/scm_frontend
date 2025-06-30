<template>
  <div
    ref="minusBody"
  >
    <el-row>
      <el-col
        :span="18"
        style="padding-right:8px;"
        class="1111111"
        :style="{ height: divLeftHeight + 'px',overflowY:'auto' } "
      >
        <!--左边业务数据区域-->
        <!--采购合同-->
        <left_data_template
          :data="data"
          :edit-status="editStatus"
        />
      </el-col>
      <el-col
        :span="6"
        class="22222222"
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
    <el-row :style="{ height: divFootHeight + 'px' } ">
      <el-col>
        <div class="foot_container">
          <!--底部审批按钮-->
          <bpmprocess_foot_template
            :data="dataJson.processData"
            :edit-status="editStatus"
            :enable-cancel="enableCancel"
            @closeMeOk="handleCloseMeOk"
            @emitReturn="handleReturn"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import bpmprocess_body_template from '@/components/ProcessProgress/ProcessInstancePreview.vue'
import bpmprocess_foot_template from '@/components/ProcessProgress/ProcessInstancePreview_foot_container.vue'
import constants_para from '@/common/constants/constants_para'
import left_data_template from './detail.vue'
import constants_dict from '@/common/constants/constants_dict'
import mixin from './index_mixin'
import { EventBus } from '@/common/eventbus/eventbus'

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
    constants_dict () {
      return constants_dict
    },
    constants_para () {
      return constants_para
    }
  },
  methods: {
    handleReturn () {
      setTimeout(() => {
        EventBus.$emit(this.EMITS.EMIT_MST_B_AP_BPM_OK, this.data)
      }, 1000)
      this.$emit('emitReturn')
    },
    handleCloseMeOk () {
      this.$emit('closeMeOk')
      console.log('handleCloseMeOk')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
