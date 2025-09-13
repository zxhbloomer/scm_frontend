<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    :title="title"
    :visible="visible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="90%"
    destroy-on-close
    top="5vh"
  >
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
            :data="{process_code: data.bpm_instance_code}"
            :edit-status="editStatus"
            :enable-cancel="enableCancel"
            @emitReturn="handleReturn"
          />
        </el-col>
      </el-row>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        @click="handleDoCancel()"
      >取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import bpmprocess_body_template from '@/components/ProcessProgress/ProcessInstancePreview.vue'
import left_data_template from './detail.vue'
import mixin from './index_mixin'

export default {
  components: { left_data_template, bpmprocess_body_template },
  mixins: [mixin],
  props: {
    // 业务表
    data: {
      type: Object,
      default: null
    },
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
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
    listenVisible () {
      return this.visible
    }
  },
  methods: {
    handleDoCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>

<style lang="scss" scoped>

.dialog-footer {
  text-align: center;
}
</style>
