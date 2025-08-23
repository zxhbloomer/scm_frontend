<!--
/**
 * 岗位权限选择弹窗组件
 *
 * 功能特性：
 * - 支持多选权限，已选权限底部展示
 * - 接收positionId参数，自动加载岗位已分配权限
 * - 集成岗位权限API：getPositionAssignedPermissionIdsApi, savePositionPermissionsApi
 * - 基于角色权限弹窗改造，提供一致的用户体验
 *
 * 使用场景：
 * - 岗位权限设置
 * - 其他需要岗位权限选择的场景
 *
 * Props:
 * - visible: 控制弹窗显示/隐藏
 * - data: 已选权限数据（可选，会被positionId自动加载的数据覆盖）
 * - positionId: 岗位ID，用于自动加载该岗位的已分配权限
 *
 * Events:
 * - closeMeOk: 保存成功事件，返回 { return_flag, data: { positionId, permissions, permissionCount } }
 * - closeMeCancel: 取消事件
 *
 * 版本: v2.0 (基于角色权限弹窗改造)
 * 更新时间: 2025-01-22
 */
-->
<template>
  <div class="permission-select-dialog-container">
    <!-- 权限选择主弹窗 -->
    <el-dialog
      v-if="listenVisible"
      v-el-drag-dialog
      v-loading="settings.loading"
      element-loading-text="拼命加载中，请稍后..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      title="岗位权限选择"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="!PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="!PARAMETERS.DIALOG_SHOW_CLOSE"
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
          @emitButtonDisabledStatus="handleButtonDisabledStatus"
          @emitRemovePermission="handleRemovePermission"
        />
      </el-footer>

      <!-- 底部按钮 -->
      <div class="button">
        <el-button
          type="primary"
          :disabled="!settings.btnShowStatus.showSave"
          :loading="settings.loading"
          @click="handleSave"
        >保存</el-button>
        <el-button
          :loading="settings.loading"
          @click="handleClose"
        >关闭</el-button>
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
import PermissionList from '../role/list.vue'
import FooterSelected from '../role/footerSelected.vue'
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'
import { getAllPermissionsApi, getPositionAssignedPermissionIdsApi, savePositionPermissionsApi } from '@/api/20_master/permission/permission'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'PositionPermissionSelectDialog',
  components: { PermissionList, FooterSelected, PermissionViewDialog },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    // 已选权限数据
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 岗位ID
    positionId: {
      type: [Number, String],
      default: null
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
    }
  },
  watch: {
    positionId: {
      handler (newVal) {
        if (newVal && this.visible) {
          this.loadPositionPermissions()
        }
      },
      immediate: true
    },
    visible (newVal) {
      if (newVal && this.positionId) {
        this.loadPositionPermissions()
      }
    }
  },
  created () {
  },
  methods: {
    // 加载岗位权限数据
    async loadPositionPermissions () {
      if (!this.positionId) {
        console.warn('岗位ID为空，跳过权限加载')
        return
      }

      try {
        this.settings.loading = true

        // 并行加载所有权限和已分配权限ID
        const [allPermissionsResponse, assignedIdsResponse] = await Promise.all([
          getAllPermissionsApi({ is_del: false }),
          getPositionAssignedPermissionIdsApi({ position_id: this.positionId })
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

        console.info(`成功加载岗位权限: ${assignedPermissions.length}/${allPermissions.length}`)
      } catch (error) {
        console.error('加载岗位权限失败:', error)

        // 区分不同类型的错误
        if (error.response && error.response.status) {
          switch (error.response.status) {
            case 401:
              this.showErrorMsg('登录已过期，请重新登录')
              break
            case 403:
              this.showErrorMsg('权限不足，无法查看权限信息')
              break
            case 404:
              this.showErrorMsg('岗位不存在或已被删除')
              break
            case 500:
              this.showErrorMsg('服务器内部错误，请稍后重试')
              break
            default:
              this.showErrorMsg(error.response.data?.message || '加载权限数据失败')
          }
        } else if (error.message) {
          this.showErrorMsg(error.message)
        } else {
          this.showErrorMsg('网络连接异常，请检查网络后重试')
        }

        // 发生错误时初始化为空数组
        this.selectedPermissions = []
      } finally {
        this.settings.loading = false
      }
    },

    // 权限选择事件处理
    handlePermissionSelect (selectedData) {
      // 更新已选权限数据
      this.selectedPermissions = selectedData || []
    },

    // 保存选择的权限
    async handleSave () {
      // 验证岗位ID
      if (!this.positionId) {
        this.showErrorMsg('岗位信息缺失，请重新打开弹窗')
        return
      }

      // 验证权限数据
      if (!this.selectedPermissions || this.selectedPermissions.length === 0) {
        this.showErrorMsg('请选择至少一个权限')
        return
      }

      // 验证权限数据格式
      const invalidPermissions = this.selectedPermissions.filter(p => !p.id)
      if (invalidPermissions.length > 0) {
        this.showErrorMsg('权限数据格式异常，请重新选择')
        console.error('无效的权限数据:', invalidPermissions)
        return
      }

      try {
        this.settings.loading = true
        const permissionIds = this.selectedPermissions.map(p => p.id)

        // 调用岗位权限保存API，共通已处理响应判断
        await savePositionPermissionsApi({
          positionId: this.positionId,
          permissionIds: permissionIds
        })

        this.$emit('closeMeOk', {
          return_flag: true,
          data: {
            positionId: this.positionId,
            permissions: this.selectedPermissions,
            permissionCount: permissionIds.length
          }
        })
      } catch (error) {
        console.error('保存岗位权限失败:', error)

        // 区分不同类型的错误
        if (error.response && error.response.status) {
          switch (error.response.status) {
            case 401:
              this.showErrorMsg('登录已过期，请重新登录')
              break
            case 403:
              this.showErrorMsg('权限不足，无法保存权限设置')
              break
            case 404:
              this.showErrorMsg('岗位或权限不存在')
              break
            case 500:
              this.showErrorMsg('服务器内部错误，请稍后重试')
              break
            default:
              this.showErrorMsg(error.response.data?.message || '保存权限失败，请重试')
          }
        } else if (error.message) {
          this.showErrorMsg(error.message)
        } else {
          this.showErrorMsg('网络连接异常，请检查网络后重试')
        }
      } finally {
        this.settings.loading = false
      }
    },

    // 按钮状态控制
    handleButtonDisabledStatus (status) {
      this.settings.btnShowStatus.showSave = status
    },

    // 处理FooterSelected组件删除权限事件
    handleRemovePermission (removedPermission) {
      // 从父组件的selectedPermissions数组中移除权限
      this.selectedPermissions = this.selectedPermissions.filter(permission => permission.id !== removedPermission.id)
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
    }
  }
}
</script>

<style scoped>
/* 容器样式 - 不影响弹窗定位 */
.permission-select-dialog-container {
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
