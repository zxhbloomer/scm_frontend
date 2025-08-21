<template>
  <el-dialog
    v-el-drag-dialog
    title="查看权限详情"
    :visible="visible"
    width="1200px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    destroy-on-close
    top="8vh"
  >
    <!-- 权限操作展示内容 -->
    <permission-operation-view
      ref="operationView"
      :permission-id="permissionId"
      :height="500"
      :head-info="headInfo"
    />

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button
        @click="handleClose"
      >关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import PermissionOperationView from './operation.vue'

export default {
  name: 'PermissionViewDialog',
  components: { PermissionOperationView },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    // 权限ID
    permissionId: {
      type: [Number, String],
      default: null
    },
    // 头部信息
    headInfo: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dataJson: {}
    }
  },
  computed: {},
  created () {},
  methods: {
    // 关闭弹窗
    handleClose () {
      this.$emit('closeMeCancel')
    },

    // 获取权限信息
    getPermissionInfo () {
      if (this.$refs.operationView) {
        return this.$refs.operationView.getPermissionInfo()
      }
      return null
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
  padding-top: 10px;
}

.dialog-footer .el-button {
  min-width: 80px;
}
</style>
