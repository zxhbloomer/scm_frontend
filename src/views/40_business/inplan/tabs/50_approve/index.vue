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
        <!--入库计划-->
        <detail
          ref="detail"
          :data="data"
          :edit-status="editStatus"
          @refreshPage="refreshPage"
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
            @emitBack="handleBack"
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
import detail from './detail.vue'
import constants_dict from '@/common/constants/constants_dict'
import indexMixin from './index_mixin'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'InplanApprove',
  components: {
    detail,
    bpmprocess_body_template,
    bpmprocess_foot_template
  },
  mixins: [indexMixin],
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
        serialData: { id: this.data ? this.data.serial_id : null },
        // 审批流程数据查询
        processData: {
          process_code: this.data ? this.data.bpm_instance_code : null,
          task_id: this.data ? this.data.task_id : null
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
  watch: {
  },
  created () {
    this.initData()
  },
  methods: {
    // 初始化数据
    initData () {
      // 如果有data属性，更新processData
      if (this.data) {
        this.dataJson.processData = {
          process_code: this.data.bpm_instance_code,
          task_id: this.data.task_id
        }
        this.dataJson.serialData = {
          id: this.data.serial_id
        }
      }
    },

    // 刷新页面
    refreshPage () {
      this.initData()
    },

    // 处理返回事件 - 通过返回按钮返回
    handleBack () {
      this.$emit('emitReturn')
    },

    // 处理返回事件
    handleReturn () {
      setTimeout(() => {
        EventBus.$emit(this.EMITS.EMIT_MST_INPLAN_BPM_OK, this.data)
      }, 1000)
      this.$emit('emitReturn')
    },

    // 处理确定事件
    handleCloseMeOk () {
      this.$emit('closeMeOk')
      console.log('handleCloseMeOk')
    }
  }
}
</script>

<style lang="scss" scoped>
.foot_container {
  padding: 10px;
  text-align: center;
}
</style>
