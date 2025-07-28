<template>
  <div
    ref="minusBody"
  >
    <el-row>
      <el-col
        :span="18"
        style="padding-right:8px;"
        :style="{ height: divLeftHeight + 'px',overflowY:'auto' } "
      >
        <!--左边业务数据区域-->
        <!--销售订单审批详情-->
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
    <el-row :style="{ height: divFootHeight + 'px' } ">
      <el-col>
        <div class="foot_container">
          <!--底部审批按钮-->
          <bpmprocess_foot_template
            :data="dataJson.processData"
            :edit-status="editStatus"
            :enable-cancel="enableCancel"
            @emitReturn="handleReturn"
            @emitBack="handleBack"
            @emitApprove="handleApprove"
            @emitReject="handleReject"
            @emitDelegate="handleDelegate"
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
     * approve: 审批
     * 40_view: 查看
     * update：更新
     * insert：插入
     */
    editStatus: {
      type: String,
      default: 'approve'
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
        processData: { 
          process_code: this.data.bmp_instance_code, 
          task_id: this.data.task_id,
          // 审批特有的数据
          business_id: this.data.id,
          business_code: this.data.code
        }
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
  created () {
  },
  methods: {
    /**
     * 关闭dialog
     */
    handleReturn () {
      setTimeout(() => {
        EventBus.$emit(this.EMITS.EMIT_MST_SOORDER_BPM_OK, this.data)
      }, 1000)
      this.$emit('emitReturn')
    },
    /**
     * 返回上一步
     */
    handleBack () {
      this.$emit('emitBack')
    },
    /**
     * 审批通过
     */
    handleApprove (approveData) {
      // 处理审批通过逻辑
      this.$confirm('确认通过此销售订单审批？', '审批确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用审批通过接口
        this.doApprove(approveData)
      }).catch(() => {
        // 取消审批
      })
    },
    /**
     * 审批驳回
     */
    handleReject (rejectData) {
      // 处理审批驳回逻辑
      this.$confirm('确认驳回此销售订单审批？', '审批确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用审批驳回接口
        this.doReject(rejectData)
      }).catch(() => {
        // 取消驳回
      })
    },
    /**
     * 审批委托
     */
    handleDelegate (delegateData) {
      // 处理审批委托逻辑
      this.doDelegate(delegateData)
    },
    /**
     * 执行审批通过
     */
    doApprove (approveData) {
      // 这里应该调用实际的审批API
      console.log('执行审批通过', approveData)
      this.$message.success('审批通过')
      this.handleReturn()
    },
    /**
     * 执行审批驳回
     */
    doReject (rejectData) {
      // 这里应该调用实际的驳回API
      console.log('执行审批驳回', rejectData)
      this.$message.success('审批驳回')
      this.handleReturn()
    },
    /**
     * 执行审批委托
     */
    doDelegate (delegateData) {
      // 这里应该调用实际的委托API
      console.log('执行审批委托', delegateData)
      this.$message.success('审批委托成功')
      this.handleReturn()
    }
  }
}
</script>

<style scoped>
.foot_container {
  width: 100%;
  height: 90px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
  padding: 10px;
  box-sizing: border-box;
}
</style>