<template>
  <!-- 查看岗位弹窗 -->
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="查看"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1000px"
    destroy-on-close
  >
    <el-form
      :model="dataJson.tempJson"
      label-position="rigth"
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
          <el-form-item label="岗位编号：">
            <span class="view-text">{{ dataJson.tempJson.code || '--' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位名称：">
            <span class="view-text">{{ dataJson.tempJson.name || '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="岗位简称：">
            <span class="view-text">{{ dataJson.tempJson.simple_name || '--' }}</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注：">
        <div class="view-textarea">{{ dataJson.tempJson.descr || '--' }}</div>
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="创建人：">
            <span class="view-text">{{ dataJson.tempJson.c_name || '--' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="创建时间：">
            <span class="view-text">{{ dataJson.tempJson.c_time ? formatDateTime(dataJson.tempJson.c_time) : '--' }}</span>
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
            <span class="view-text">{{ dataJson.tempJson.u_time ? formatDateTime(dataJson.tempJson.u_time) : '--' }}</span>
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
.dialog-footer {
  text-align: center;
}
</style>

<script>
import deepcopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      dataJson: {
        tempJson: {}
      },
      settings: {
        loading: false
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  watch: {
    listenVisible: {
      handler (newVal) {
        if (newVal) {
          this.init()
        }
      },
      immediate: true
    }
  },
  methods: {
    init () {
      // 初始化查看数据
      this.dataJson.tempJson = deepcopy(this.data)
    },
    handleCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
