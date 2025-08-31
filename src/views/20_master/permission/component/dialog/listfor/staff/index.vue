<!--
/**
 * 员工权限选择弹窗组件
 *
 * 功能特性：
 * - 支持多选权限，已选权限底部展示
 * - 接收staffId参数，自动加载员工已分配权限
 * - 集成员工权限API：getStaffAssignedPermissionIds, saveStaffPermissions
 * - 基于岗位权限弹窗改造，提供一致的用户体验
 * - 专为员工权限管理设计
 *
 * 使用场景：
 * - 员工权限设置
 * - 其他需要员工权限选择的场景
 *
 * Props:
 * - visible: 控制弹窗显示/隐藏
 * - staffId: 员工ID，用于自动加载该员工的已分配权限
 * - staffData: 员工数据对象（包含姓名等信息）
 * - model: 视图模式：查看(view)/编辑(edit)
 *
 * Events:
 * - closeMeOk: 保存成功事件，返回 { return_flag, data: { staffId, permissions, permissionCount } }
 * - closeMeCancel: 取消事件
 *
 * 版本: v1.0 (基于岗位权限弹窗改造)
 * 创建时间: 2025-01-22
 */
-->
<template>
  <div class="staff-permission-select-dialog-container">
    <!-- 员工权限选择主弹窗 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      :title="dialogTitle"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="!PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="1200px"
      top="8vh"
      destroy-on-close
    >
      <!-- 权限列表组件 -->
      <permission-list
        ref="permissionList"
        :data="selectedPermissions"
        :height="450"
        @emitSelect="handlePermissionSelect"
        @viewPermission="handleViewPermission"
      />

      <!-- 已选权限展示 -->
      <el-footer>
        <footer-selected
          ref="footerSelected"
          :data="selectedPermissions"
          @emitRemovePermission="handleRemovePermission"
        />
      </el-footer>

      <!-- 底部按钮 -->
      <div class="button">
        <el-button
          v-if="model === 'edit'"
          type="primary"
          :disabled="!settings.btnShowStatus.showSave"
          :loading="settings.loading"
          @click="handleSave"
        >保存</el-button>
        <el-button
          :loading="settings.loading"
          @click="handleClose"
        >{{ model === 'edit' ? '关闭' : '关闭' }}</el-button>
      </div>
    </el-dialog>

    <!-- 权限查看弹窗 -->
    <permission-view-dialog
      v-if="viewDialogVisible"
      :visible="viewDialogVisible"
      :permission-id="viewPermissionData.permissionId"
      :head-info="viewPermissionData.headInfo"
      @closeMeCancel="handleViewDialogCancel"
    />
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import PermissionList from './list.vue'
import FooterSelected from './footerSelected.vue'
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'
import { getStaffAssignedPermissionIds, saveStaffPermissions } from '@/api/20_master/staff/staff'
import { getAllPermissionsApi } from '@/api/20_master/permission/permission'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'StaffPermissionSelectDialog',
  components: { PermissionList, FooterSelected, PermissionViewDialog },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    // 员工ID
    staffId: {
      type: [Number, String],
      default: null
    },
    // 员工数据对象
    staffData: {
      type: Object,
      default: null
    },
    // 视图模式：查看/编辑
    model: {
      type: String,
      default: 'edit'
    }
  },
  data () {
    return {
      dataJson: {},
      selectedPermissions: [], // 已选权限数据
      settings: {
        loading: false,
        btnShowStatus: {
          showSave: false
        }
      },
      // 权限查看弹窗状态
      viewDialogVisible: false,
      viewPermissionData: {
        permissionId: null,
        headInfo: ''
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    dialogTitle () {
      const staffName = this.staffData?.name || '未知员工'
      const action = this.model === 'view' ? '查看' : '设置'
      const count = this.selectedPermissions.length
      return `${action}员工权限 - ${staffName}（${count}）`
    }
  },
  watch: {
    staffId: {
      handler (newVal) {
        if (newVal && this.visible) {
          this.loadStaffAssignedPermissions()
        }
      },
      immediate: true
    },
    visible: {
      handler (newVal) {
        if (newVal && this.staffId) {
          this.loadStaffAssignedPermissions()
        } else if (!newVal) {
          this.resetDialog()
        }
      },
      immediate: true
    }
  },
  created () {
    console.log('[员工权限弹窗] 组件创建:', { 员工ID: this.staffId, 员工数据: this.staffData })
  },
  mounted () {
    // 监听EventBus事件
    EventBus.$on('staff-permission-dialog-refresh', this.handleRefresh)
  },
  beforeDestroy () {
    // 清除事件监听
    EventBus.$off('staff-permission-dialog-refresh', this.handleRefresh)
  },
  methods: {
    // 加载员工已分配的权限
    async loadStaffAssignedPermissions () {
      if (!this.staffId) {
        console.warn('[员工权限弹窗] 缺少员工ID，无法加载权限数据')
        return
      }

      console.log('[员工权限弹窗] 开始加载员工已分配权限:', this.staffId)
      this.settings.loading = true

      try {
        // 并行加载所有权限和已分配权限ID
        const [allPermissionsResponse, assignedIdsResponse] = await Promise.all([
          getAllPermissionsApi({ is_del: false }),
          getStaffAssignedPermissionIds({ staff_id: this.staffId })
        ])

        // 获取所有权限数据，共通已处理响应判断
        const allPermissions = allPermissionsResponse.data || []
        const assignedPermissionIds = assignedIdsResponse.data || []

        // 根据已分配的权限ID筛选出完整的权限对象
        const assignedPermissions = allPermissions.filter(permission =>
          assignedPermissionIds.includes(permission.id)
        )

        // 统一更新selectedPermissions数据
        this.selectedPermissions = assignedPermissions

        // 通过EventBus通知列表组件初始化选中状态
        this.$nextTick(() => {
          EventBus.$emit(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, assignedPermissions)
        })

        console.log('[员工权限弹窗] 加载员工权限成功:', assignedPermissions.length)
      } catch (error) {
        console.error('[员工权限弹窗] 加载员工权限失败:', error)
        this.$message.error('加载员工权限失败: ' + (error.message || '未知错误'))

        // 发生错误时初始化为空数组
        this.selectedPermissions = []
      } finally {
        this.settings.loading = false
      }
    },

    // 权限选择事件
    handlePermissionSelect (selectedPermissions) {
      console.log('[员工权限弹窗] 权限选择变化:', selectedPermissions.length)
      this.selectedPermissions = selectedPermissions || []

      // 更新底部已选权限展示
      if (this.$refs.footerSelected) {
        this.$refs.footerSelected.updateSelectedData(this.selectedPermissions)
      }

      // 用户操作后启用保存按钮
      this.settings.btnShowStatus.showSave = true
    },

    // 移除权限事件
    handleRemovePermission (permissionToRemove) {
      console.log('[员工权限弹窗] 移除权限:', permissionToRemove)
      this.selectedPermissions = this.selectedPermissions.filter(permission => permission.id !== permissionToRemove.id)

      // 用户操作后启用保存按钮
      this.settings.btnShowStatus.showSave = true

      // 通过EventBus通知列表组件更新选中状态
      this.$nextTick(() => {
        EventBus.$emit(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, this.selectedPermissions)
      })
    },

    // 查看权限详情事件
    handleViewPermission (permissionData) {
      this.viewPermissionData = {
        permissionId: permissionData.permissionId || permissionData.id,
        headInfo: permissionData.headInfo || permissionData.name || '权限详情'
      }
      this.viewDialogVisible = true
    },

    // 保存权限分配
    async handleSave () {
      if (!this.staffId) {
        this.$message.error('员工ID不能为空')
        return
      }

      console.log('[员工权限弹窗] 开始保存员工权限:', {
        员工ID: this.staffId,
        选中权限数量: this.selectedPermissions.length
      })

      this.settings.loading = true

      try {
        const permissionIds = this.selectedPermissions.map(permission => permission.id)

        await saveStaffPermissions({
          staffId: this.staffId,
          permissionIds: permissionIds
        })

        console.log('[员工权限弹窗] 保存员工权限成功')

        this.$emit('closeMeOk', {
          return_flag: true,
          data: {
            staffId: this.staffId,
            permissions: this.selectedPermissions,
            permissionCount: this.selectedPermissions.length
          }
        })
      } catch (error) {
        console.error('[员工权限弹窗] 保存员工权限失败:', error)
        this.$message.error('保存失败: ' + (error.message || '未知错误'))
      } finally {
        this.settings.loading = false
      }
    },

    // 关闭弹窗
    handleClose () {
      this.$emit('closeMeCancel')
    },

    // 权限查看弹窗关闭
    handleViewDialogCancel () {
      this.viewDialogVisible = false
      this.viewPermissionData = {
        permissionId: null,
        headInfo: ''
      }
    },

    // 重置弹窗状态
    resetDialog () {
      this.selectedPermissions = []
      this.settings.btnShowStatus.showSave = false
      this.viewDialogVisible = false
    },

    // 刷新数据
    handleRefresh () {
      if (this.visible && this.staffId) {
        this.loadStaffAssignedPermissions()
      }
    }
  }
}
</script>

<style scoped>
.staff-permission-select-dialog-container {
  /* 弹窗容器样式 */
}

.el-footer {
  padding: 0 3px;
}

.button {
  text-align: center;
  margin-top: 20px;
}

.button .el-button {
  margin: 0 10px;
}
</style>
