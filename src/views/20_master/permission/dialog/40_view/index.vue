<template>
  <!-- 权限查看弹窗 -->
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    :title="getDialogTitle()"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="800px"
    destroy-on-close
  >
    <el-form
      label-position="right"
      label-width="120px"
    >
      <el-form-item
        label="权限名称："
      >
        <span>{{ permissionData.name || '' }}</span>
      </el-form-item>
      <el-form-item
        label="备注："
      >
        <span>{{ permissionData.descr || '' }}</span>
      </el-form-item>
      <el-row v-if="permissionData.id">
        <el-col :span="12">
          <el-form-item
            label="更新人："
          >
            <span>{{ permissionData.u_name || '' }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="更新时间："
          >
            <span>{{ permissionData.u_time || '' }}</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-divider />
      <div class="floatLeft" />
      <el-button
        plain
        @click="handleCancel()"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'PermissionViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    permissionData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
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
  methods: {
    /**
     * 获取弹窗标题
     */
    getDialogTitle () {
      return '查看权限'
    },

    /**
     * 取消按钮
     */
    handleCancel () {
      this.$emit('update:visible', false)
      this.$emit('onCancel')
    }
  }
}
</script>

<style scoped>
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
.dialog-footer {
  text-align: center;
}
</style>
