<!--
/**
 * 员工角色选择弹窗组件
 *
 * 功能特性：
 * - 支持角色搜索和选择
 * - 无分页设计，优化用户体验
 * - 替换原有穿梭框组件，提供更好的选择界面
 * - 自动过滤已删除角色（is_del = false）
 * - 专为员工角色管理设计
 *
 * 使用场景：
 * - 员工角色设置
 * - 其他需要员工角色选择的场景
 *
 * Props:
 * - visible: 控制弹窗显示/隐藏
 * - staffId: 员工ID，用于加载员工已分配角色
 * - staffData: 员工数据对象（包含姓名等信息）
 * - model: 视图模式：查看(view)/编辑(edit)
 *
 * Events:
 * - closeMeOk: 选择成功事件，返回 { return_flag, data: selectedRoles }
 * - closeMeCancel: 取消事件
 *
 * API集成：
 * - 使用员工角色相关API：getStaffAssignedRoleIds, saveStaffRoles
 *
 * 版本: v1.0 (基于岗位角色弹窗改造)
 * 创建时间: 2025-01-22
 */
-->
<template>
  <div class="staff-role-select-dialog-container">
    <!-- 员工角色选择主弹窗 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="正在加载角色数据，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      :title="dialogTitle"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="!PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="!PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="1000px"
      top="8vh"
      destroy-on-close
    >
      <!-- 角色列表组件 -->
      <role-list
        ref="roleList"
        :data="selectedRoles"
        :height="450"
        :multiple="multiple"
        :exclude-ids="excludeIds"
        @emitSelect="handleRoleSelect"
        @viewPermission="handleViewPermission"
      />

      <!-- 已选角色展示 -->
      <el-footer v-if="multiple">
        <footer-selected
          ref="footerSelected"
          :data="selectedRoles"
          :multiple="multiple"
          @emitButtonDisabledStatus="handleButtonDisabledStatus"
          @emitRemoveRole="handleRemoveRole"
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
        >确定</el-button>
        <el-button
          :loading="settings.loading"
          @click="handleClose"
        >{{ model === 'edit' ? '取消' : '关闭' }}</el-button>
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
import RoleList from '../position/list.vue'
import FooterSelected from '../position/footerSelected.vue'
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import { getStaffAssignedRoleIds, saveStaffRoles } from '@/api/20_master/staff/staff'
import { getAllRolesApi } from '@/api/10_system/role/role'

export default {
  name: 'StaffRoleSelectDialog',
  components: { RoleList, FooterSelected, PermissionViewDialog },
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
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true
    },
    // 排除的角色ID列表
    excludeIds: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      dataJson: {},
      selectedRoles: [], // 已选角色数据
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
      const count = this.selectedRoles.length
      return `${action}员工角色 - ${staffName}（${count}）`
    }
  },
  watch: {
    staffId: {
      handler (newVal) {
        if (newVal && this.visible) {
          this.loadStaffAssignedRoles()
        }
      },
      immediate: true
    },
    visible: {
      handler (newVal) {
        if (newVal && this.staffId) {
          this.loadStaffAssignedRoles()
        } else if (!newVal) {
          this.resetDialog()
        }
      },
      immediate: true
    }
  },
  created () {
    console.log('[员工角色弹窗] 组件创建:', { 员工ID: this.staffId, 员工数据: this.staffData })
  },
  mounted () {
    // 监听EventBus事件
    EventBus.$on('staff-role-dialog-refresh', this.handleRefresh)
  },
  beforeDestroy () {
    // 清除事件监听
    EventBus.$off('staff-role-dialog-refresh', this.handleRefresh)
  },
  methods: {
    // 加载员工已分配的角色
    async loadStaffAssignedRoles () {
      if (!this.staffId) {
        console.warn('[员工角色弹窗] 缺少员工ID，无法加载角色数据')
        return
      }

      console.log('[员工角色弹窗] 开始加载员工已分配角色:', this.staffId)
      this.settings.loading = true

      try {
        // 并行加载所有角色和已分配角色ID
        const [allRolesResponse, assignedIdsResponse] = await Promise.all([
          getAllRolesApi({ is_del: false }),
          getStaffAssignedRoleIds({ staff_id: this.staffId })
        ])

        // 获取所有角色数据，共通已处理响应判断
        const allRoles = allRolesResponse.data || []
        const assignedRoleIds = assignedIdsResponse.data || []

        // 根据已分配的角色ID筛选出完整的角色对象
        const assignedRoles = allRoles.filter(role =>
          assignedRoleIds.includes(role.id)
        )

        // 统一更新selectedRoles数据
        this.selectedRoles = assignedRoles

        // 通过EventBus通知列表组件初始化选中状态
        this.$nextTick(() => {
          EventBus.$emit(this.EMITS.EMIT_ROLE_DIALOG_SELECT, assignedRoles)
        })

        console.log('[员工角色弹窗] 加载员工角色成功:', assignedRoles.length)
      } catch (error) {
        console.error('[员工角色弹窗] 加载员工角色失败:', error)
        this.$message.error('加载员工角色失败: ' + (error.message || '未知错误'))

        // 发生错误时初始化为空数组
        this.selectedRoles = []
      } finally {
        this.settings.loading = false
      }
    },

    // 角色选择事件
    handleRoleSelect (selectedRoles) {
      console.log('[员工角色弹窗] 角色选择变化:', selectedRoles.length)
      this.selectedRoles = selectedRoles

      // 更新底部已选角色展示
      if (this.$refs.footerSelected) {
        this.$refs.footerSelected.updateSelectedData(selectedRoles)
      }

      // 检查是否可以保存
      this.checkSaveButtonStatus()
    },

    // 移除角色事件
    handleRemoveRole (roleToRemove) {
      console.log('[员工角色弹窗] 移除角色:', roleToRemove)
      this.selectedRoles = this.selectedRoles.filter(role => role.id !== roleToRemove.id)

      // 通知角色列表组件更新选中状态
      if (this.$refs.roleList) {
        this.$refs.roleList.removeSelectedRole(roleToRemove)
      }

      this.checkSaveButtonStatus()
    },

    // 查看权限事件
    handleViewPermission (permissionData) {
      this.viewPermissionData = {
        permissionId: permissionData.permissionId,
        headInfo: permissionData.headInfo || '权限详情'
      }
      this.viewDialogVisible = true
    },

    // 按钮状态更新
    handleButtonDisabledStatus (status) {
      this.settings.btnShowStatus.showSave = status
    },

    // 检查保存按钮状态
    checkSaveButtonStatus () {
      // 在编辑模式下，总是允许保存（即使选择为空也可以保存，表示清空所有角色）
      this.settings.btnShowStatus.showSave = this.model === 'edit'
    },

    // 保存角色分配
    async handleSave () {
      if (!this.staffId) {
        this.$message.error('员工ID不能为空')
        return
      }

      console.log('[员工角色弹窗] 开始保存员工角色:', {
        员工ID: this.staffId,
        选中角色数量: this.selectedRoles.length
      })

      this.settings.loading = true

      try {
        const roleIds = this.selectedRoles.map(role => role.id)

        await saveStaffRoles({
          staffId: this.staffId,
          roleIds: roleIds
        })

        console.log('[员工角色弹窗] 保存员工角色成功')

        this.$emit('closeMeOk', {
          return_flag: true,
          data: {
            staffId: this.staffId,
            roles: this.selectedRoles,
            roleCount: this.selectedRoles.length
          }
        })
      } catch (error) {
        console.error('[员工角色弹窗] 保存员工角色失败:', error)
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
      this.selectedRoles = []
      this.settings.btnShowStatus.showSave = false
      this.viewDialogVisible = false
    },

    // 刷新数据
    handleRefresh () {
      if (this.visible && this.staffId) {
        this.loadStaffAssignedRoles()
      }
    }
  }
}
</script>

<style scoped>
.staff-role-select-dialog-container {
  /* 弹窗容器样式 */
}

.button {
  text-align: center;
  margin-top: 20px;
}

.button .el-button {
  margin: 0 10px;
}
</style>
