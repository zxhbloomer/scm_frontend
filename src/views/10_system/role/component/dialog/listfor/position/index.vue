<!--
/**
 * 角色选择弹窗组件
 *
 * 功能特性：
 * - 支持角色搜索和选择
 * - 无分页设计，优化用户体验
 * - 替换原有穿梭框组件，提供更好的选择界面
 * - 自动过滤已删除角色（is_del = false）
 * - 模块化组件结构：查询区域、列表区域、foot区域
 *
 * 使用场景：
 * - 员工角色设置
 * - 其他需要角色选择的场景
 *
 * Props:
 * - visible: 控制弹窗显示/隐藏
 * - data: 已选角色数据（可选）
 * - multiple: 是否支持多选（默认单选）
 * - excludeIds: 排除的角色ID列表（可选）
 *
 * Events:
 * - closeMeOk: 选择成功事件，返回 { return_flag, data: selectedRoles }
 * - closeMeCancel: 取消事件
 *
 * API集成：
 * - 使用后端新接口：/api/v1/role/listForDialog
 *
 * 版本: v2.0 (模块化重构版本)
 * 更新时间: 2025-01-22
 */
-->
<template>
  <div class="role-select-dialog-container">
    <!-- 角色选择主弹窗 -->
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
          type="primary"
          :disabled="!settings.btnShowStatus.showSave"
          :loading="settings.loading"
          @click="handleSave"
        >确定</el-button>
        <el-button
          :loading="settings.loading"
          @click="handleClose"
        >取消</el-button>
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
import RoleList from './list.vue'
import FooterSelected from './footerSelected.vue'
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'
import { EventBus } from '@/common/eventbus/eventbus'
import { getPositionAssignedRoleIdsApi } from '@/api/20_master/position/position'

export default {
  name: 'RoleSelectDialog',
  components: { RoleList, FooterSelected, PermissionViewDialog },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    // 岗位ID
    id: {
      type: Number,
      default: null
    },
    // 岗位数据对象
    data: {
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
      if (this.data && this.data.name) {
        const actionText = this.model === 'view' ? '查看岗位' : '设置岗位'
        return `${actionText}【${this.data.name}】角色`
      }
      return '角色选择'
    }
  },
  watch: {
    visible: {
      handler (newVal) {
        if (newVal) {
          this.loadSelectedRoles()
        }
      },
      immediate: true // 立即执行，即使初始值就是true
    }
  },
  methods: {
    // 加载已选角色数据
    async loadSelectedRoles () {
      if (!this.id) {
        this.selectedRoles = []
        return
      }

      try {
        this.settings.loading = true

        // 步骤1：获取岗位已分配的角色ID列表
        const roleIdsResponse = await getPositionAssignedRoleIdsApi({ position_id: this.id })
        const assignedRoleIds = roleIdsResponse.data || []

        // 步骤2：获取所有角色列表，筛选出已分配的完整角色对象
        if (assignedRoleIds.length > 0) {
          const { getRoleListForDialogApi } = await import('@/api/10_system/role/role')
          const allRolesResponse = await getRoleListForDialogApi({ is_del: false })
          const allRoles = allRolesResponse.data || []

          // 筛选出已分配的完整角色对象
          this.selectedRoles = allRoles.filter(role =>
            assignedRoleIds.includes(role.id)
          )
        } else {
          this.selectedRoles = []
        }

        // 步骤3：通过EventBus通知列表组件初始化选中状态（传递完整角色对象）
        this.$nextTick(() => {
          EventBus.$emit(this.EMITS.EMIT_ROLE_DIALOG_SELECT, this.selectedRoles)
        })
      } catch (error) {
        console.error('加载岗位已分配角色失败:', error)
        this.selectedRoles = []
        this.$message.error('加载岗位角色信息失败')
      } finally {
        this.settings.loading = false
      }
    },

    // 角色选择事件处理
    handleRoleSelect (selectedData) {
      // 更新已选角色数据
      this.selectedRoles = selectedData || []
    },

    // 保存选择的角色
    handleSave () {
      // 验证角色数据
      if (!this.multiple && this.selectedRoles.length === 0) {
        this.showErrorMsg('请选择一个角色')
        return
      }

      if (this.multiple && this.selectedRoles.length === 0) {
        this.showErrorMsg('请选择至少一个角色')
        return
      }

      // 验证角色数据格式
      const invalidRoles = this.selectedRoles.filter(r => !r.id)
      if (invalidRoles.length > 0) {
        this.showErrorMsg('角色数据格式异常，请重新选择')
        console.error('无效的角色数据:', invalidRoles)
        return
      }

      this.$emit('closeMeOk', {
        return_flag: true,
        data: this.multiple ? [...this.selectedRoles] : this.selectedRoles[0]
      })
    },

    // 按钮状态控制
    handleButtonDisabledStatus (status) {
      this.settings.btnShowStatus.showSave = status
    },

    // 处理FooterSelected组件删除角色事件
    handleRemoveRole (removedRole) {
      // 从父组件的selectedRoles数组中移除角色
      this.selectedRoles = this.selectedRoles.filter(role => role.id !== removedRole.id)
    },

    // 关闭弹窗
    handleClose () {
      this.$emit('closeMeCancel')
    },

    // 权限查看事件处理
    handleViewPermission (permissionData) {
      this.viewPermissionData = {
        permissionId: permissionData.permissionId,
        headInfo: permissionData.headInfo
      }
      this.viewDialogVisible = true
    },

    // 关闭权限查看弹窗
    handleViewDialogCancel () {
      this.viewDialogVisible = false
      this.viewPermissionData = {
        permissionId: null,
        headInfo: ''
      }
    },

    // 错误提示
    showErrorMsg (message) {
      this.$message.error(message)
    }
  }
}
</script>

<style scoped>
/* 容器样式 - 不影响弹窗定位 */
.role-select-dialog-container {
  /* 透明容器，不占用空间 */
}

.el-footer {
  padding: 0 3px;
}

.button {
  padding-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button .el-button {
  margin: 0 5px;
}
</style>
