<template>
  <div>
    <!-- pop窗口 数据查看 -->
    <el-dialog
      v-if="visible"
      v-el-drag-dialog
      title="查看部门"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="700px"
      destroy-on-close
    >
      <el-form
        :model="dataJson.tempJson"
        label-position="right"
        label-width="120px"
      >
        <el-alert
          title="基本信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门编号：">
              <span class="view-text">{{ dataJson.tempJson.code || '--' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称：">
              <span class="view-text">{{ dataJson.tempJson.name || '--' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门简称：">
              <span class="view-text">{{ dataJson.tempJson.simple_name || '--' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门主管：">
              <span class="view-text">{{ dataJson.tempJson.handler_id_name || '--' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="部门副主管：">
              <span class="view-text">{{ dataJson.tempJson.sub_handler_id_name || '--' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级主管领导：">
              <span class="view-text">{{ dataJson.tempJson.leader_id_name || '--' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="上级分管领导：">
              <span class="view-text">{{ dataJson.tempJson.response_leader_id_name || '--' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注：">
          <div class="view-textarea">{{ dataJson.tempJson.descr || '--' }}</div>
        </el-form-item>

        <el-alert
          title="所属组织信息"
          type="info"
          :closable="false"
        />
        <br>

        <el-row>
          <el-col :span="12">
            <el-form-item label="集团信息：">
              <span class="view-text">{{ dataJson.tempJson.group_full_simple_name || '--' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业信息：">
              <span class="view-text">{{ dataJson.tempJson.company_simple_name || '--' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="上级部门：">
              <span class="view-text">{{ dataJson.tempJson.parent_dept_simple_name || '--' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-alert
          title="系统信息"
          type="info"
          :closable="false"
        />
        <br>

        <el-row>
          <el-col :span="12">
            <el-form-item label="创建人：">
              <span class="view-text">{{ dataJson.tempJson.c_name || '--' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间：">
              <span class="view-text">{{ formatDateTime(dataJson.tempJson.c_time) || '--' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="更新人：">
              <span class="view-text">{{ dataJson.tempJson.u_name || '--' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间：">
              <span class="view-text">{{ formatDateTime(dataJson.tempJson.u_time) || '--' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="删除状态：">
              <el-tag :type="dataJson.tempJson.is_del === false ? 'success' : 'danger'">
                {{ dataJson.tempJson.is_del === false ? '未删除' : '已删除' }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-divider />
        <el-button
          plain
          @click="handleCancel()"
        >关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.el-form-item .el-select {
  width: 100%;
}

.view-text {
  color: #606266;
  font-size: 14px;
  line-height: 32px;
  display: inline-block;
  min-height: 32px;
}

.view-textarea {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  min-height: 80px;
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'

export default {
  name: 'DeptViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      dataJson: {
        // 单条数据 json
        tempJson: {}
      }
    }
  },
  computed: {},
  // 监听器
  watch: {
    visible: {
      handler (newVal) {
        if (newVal && this.data) {
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化处理
    init () {
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.data)
    },
    // 取消按钮
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
