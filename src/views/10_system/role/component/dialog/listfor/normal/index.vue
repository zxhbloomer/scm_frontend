<!--
/**
 * 角色选择弹窗组件
 *
 * 功能特性：
 * - 支持角色搜索和选择
 * - 无分页设计，优化用户体验
 * - 替换原有穿梭框组件，提供更好的选择界面
 * - 自动过滤已删除角色（is_del = false）
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
 * 版本: v1.0 (新实现，替换穿梭框)
 * 更新时间: 2025-01-21
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
      title="角色选择"
      :visible="visible"
      :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
      :close-on-press-escape="!PARAMETERS.DIALOG_CLOSE_BY_ESC"
      :show-close="!PARAMETERS.DIALOG_SHOW_CLOSE"
      :append-to-body="true"
      :modal-append-to-body="true"
      width="800px"
      top="10vh"
      destroy-on-close
    >
      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form
          ref="searchForm"
          :inline="true"
          :model="searchForm"
          label-position="getLabelPosition()"
        >
          <el-form-item label="">
            <el-input
              v-model.trim="searchForm.name"
              clearable
              placeholder="角色名称"
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item label="">
            <el-input
              v-model.trim="searchForm.code"
              clearable
              placeholder="角色编码"
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item style="float:right">
            <el-button
              type="primary"
              plain
              icon="perfect-icon-reset"
              @click="handleReset"
            >重置</el-button>
          </el-form-item>
          <el-form-item style="float:right">
            <el-button
              type="primary"
              plain
              icon="el-icon-search"
              @click="handleSearch"
            >查询</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 角色列表区域 -->
      <div class="role-list-container">
        <el-table
          ref="roleTable"
          v-loading="settings.loading"
          :data="filteredRoleList"
          :height="400"
          stripe
          border
          highlight-current-row
          :row-key="getRowKey"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <el-table-column
            v-if="multiple"
            type="selection"
            width="38"
            :reserve-selection="true"
            prop="id"
          />
          <el-table-column
            type="index"
            width="50"
            label="No"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="code"
            label="角色编码"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="name"
            label="角色名称"
          />
          <el-table-column
            header-align="center"
            label="权限信息"
            min-width="150"
          >
            <template v-slot="scope">
              <el-tag
                v-for="(item, index) in scope.row.permissionList"
                :key="index"
                class="permission_tag"
                effect="dark"
                @click.stop="handlePermissionClick(item)"
              >
                {{ item.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            min-width="150"
            prop="descr"
            label="备注"
          />
          <el-table-column
            min-width="180"
            show-overflow-tooltip
            prop="u_time"
            label="更新时间"
          >
            <template v-slot="scope">
              {{ formatDateTime(scope.row.u_time) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 已选角色展示（仅多选时显示） -->
      <div v-if="multiple && selectedRoles.length > 0" class="selected-container">
        <el-divider content-position="left">已选角色 ({{ selectedRoles.length }})</el-divider>
        <div class="selected-tags">
          <el-tag
            v-for="role in selectedRoles"
            :key="role.id"
            type="info"
            closable
            @close="handleRemoveSelected(role)"
          >
            {{ role.name }}
          </el-tag>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :disabled="!hasSelection"
          :loading="settings.loading"
          @click="handleConfirm"
        >确定</el-button>
        <el-button
          :loading="settings.loading"
          @click="handleCancel"
        >取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getRoleListForDialogApi } from '@/api/10_system/role/role'

export default {
  name: 'RoleSelectDialog',
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    // 已选角色数据
    data: {
      type: Array,
      default: () => []
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 排除的角色ID列表
    excludeIds: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      // 搜索表单
      searchForm: {
        name: '',
        code: '',
        is_del: false // 固定为false，只显示未删除的角色
      },
      // 所有角色列表
      allRoleList: [],
      // 已选择的角色
      selectedRoles: [],
      // 页面设置
      settings: {
        loading: false
      }
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    },
    // 过滤后的角色列表
    filteredRoleList () {
      let list = this.allRoleList

      // 排除指定的角色ID
      if (this.excludeIds && this.excludeIds.length > 0) {
        list = list.filter(role => !this.excludeIds.includes(role.id))
      }

      return list
    },
    // 是否有选择
    hasSelection () {
      return this.selectedRoles.length > 0
    }
  },
  watch: {
    visible: {
      handler (newVal) {
        if (newVal) {
          // 弹窗打开时自动查询数据
          console.info('角色选择弹窗打开，开始加载数据')
          this.initSelectedRoles()
          this.loadRoleList()
        } else {
          this.resetData()
        }
      },
      immediate: false
    }
  },
  methods: {
    // 加载角色列表数据
    async loadRoleList () {
      try {
        this.settings.loading = true

        // 构建搜索条件，包含搜索参数
        const searchParams = {
          is_del: false, // 只获取未删除的角色
          name: this.searchForm.name || null,
          code: this.searchForm.code || null
        }

        // 调用后端新接口，获取角色列表
        const response = await getRoleListForDialogApi(searchParams)

        this.allRoleList = response.data || []
        console.info(`成功加载角色数据: ${this.allRoleList.length} 条`)

        // 恢复已选角色的选中状态
        this.$nextTick(() => {
          this.restoreSelection()
        })
      } catch (error) {
        console.error('加载角色列表失败:', error)
        this.showErrorMsg('加载角色数据失败，请重试')
        this.allRoleList = []
      } finally {
        this.settings.loading = false
      }
    },

    // 初始化已选角色
    initSelectedRoles () {
      if (this.data && Array.isArray(this.data)) {
        this.selectedRoles = [...this.data]
      } else {
        this.selectedRoles = []
      }
    },

    // 恢复表格选中状态
    restoreSelection () {
      if (!this.multiple || !this.$refs.roleTable) {
        return
      }

      // 清除之前的选择
      this.$refs.roleTable.clearSelection()

      // 恢复已选角色的选中状态
      this.selectedRoles.forEach(selectedRole => {
        const tableRow = this.filteredRoleList.find(row => row.id === selectedRole.id)
        if (tableRow) {
          this.$refs.roleTable.toggleRowSelection(tableRow, true)
        }
      })
    },

    // 搜索
    handleSearch () {
      console.info('执行角色搜索:', this.searchForm)
      // 重新加载数据，后端会根据搜索条件过滤
      this.loadRoleList()
    },

    // 重置搜索
    handleReset () {
      this.searchForm.name = ''
      this.searchForm.code = ''
      console.info('重置搜索条件')
      // 重新加载所有数据
      this.loadRoleList()
    },

    // 表格行点击事件（单选模式）
    handleRowClick (row) {
      if (!this.multiple) {
        this.selectedRoles = [row]
      }
    },

    // 表格多选事件（多选模式）
    handleSelectionChange (selection) {
      if (this.multiple) {
        this.selectedRoles = [...selection]
      }
    },

    // 移除已选角色
    handleRemoveSelected (role) {
      const index = this.selectedRoles.findIndex(item => item.id === role.id)
      if (index > -1) {
        this.selectedRoles.splice(index, 1)

        // 同步更新表格选择状态
        if (this.multiple && this.$refs.roleTable) {
          this.$refs.roleTable.toggleRowSelection(role, false)
        }
      }
    },

    // 确定选择
    handleConfirm () {
      if (!this.hasSelection) {
        this.showWarningMsg('请先选择角色')
        return
      }

      // 返回选择结果
      this.$emit('closeMeOk', {
        return_flag: true,
        data: this.multiple ? [...this.selectedRoles] : this.selectedRoles[0]
      })
    },

    // 取消选择
    handleCancel () {
      this.$emit('closeMeCancel')
    },

    // 重置数据
    resetData () {
      this.searchForm.name = ''
      this.searchForm.code = ''
      this.allRoleList = []
      this.selectedRoles = []
    },

    // 获取行key
    getRowKey (row) {
      return row.id
    },

    // 错误提示
    showErrorMsg (message) {
      this.$message.error(message)
    },

    // 警告提示
    showWarningMsg (message) {
      this.$message.warning(message)
    },

    // 权限标签点击处理（仅显示提示，不做操作）
    handlePermissionClick (permissionItem) {
      if (permissionItem && permissionItem.label) {
        this.$message.info(`权限：${permissionItem.label}`)
      }
    }
  }
}
</script>

<style scoped>
/* 容器样式 */
.role-select-dialog-container {
  /* 透明容器，不占用空间 */
}

/* 搜索区域样式 */
.search-container {
  margin-bottom: 15px;
}

.search-container .el-form-item {
  margin-bottom: 0;
  margin-right: 10px;
}

/* 角色列表容器 */
.role-list-container {
  margin-bottom: 20px;
}

/* 已选角色展示区域 */
.selected-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.selected-tags {
  max-height: 120px;
  overflow-y: auto;
}

.selected-tags .el-tag {
  margin: 5px 8px 5px 0;
  max-width: 200px;
}

/* 底部按钮样式 */
.dialog-footer {
  text-align: center;
}

.dialog-footer .el-button {
  margin: 0 10px;
  min-width: 80px;
}

/* 权限标签样式 */
.permission_tag {
  cursor: pointer;
  margin: 2px;
}
</style>
