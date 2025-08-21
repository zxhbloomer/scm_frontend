<template>
  <div class="app-container">
    <!-- 搜索表单 -->
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
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="searchForm.code"
          clearable
          placeholder="角色编码"
        />
      </el-form-item>
      <el-form-item label="">
        <delete-type-normal v-model="searchForm.is_del" />
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

    <!-- 操作按钮组 -->
    <el-button-group>
      <el-button
        v-permission="'P_ROLE:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="loading"
        @click="handleNew"
      >新增</el-button>
      <el-button
        v-permission="'P_ROLE:UPDATE'"
        :disabled="!selectedRow.id"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="loading"
        @click="handleEdit"
      >修改</el-button>
      <el-button
        v-permission="'P_ROLE:EXPORT'"
        :disabled="multipleSelection.length === 0"
        type="primary"
        icon="el-icon-s-management"
        :loading="loading"
        @click="handleExport"
      >导出</el-button>
    </el-button-group>

    <!-- 数据表格 -->
    <el-table
      ref="dataTable"
      v-loading="loading"
      :data="tableData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :canvas-auto-height="true"
      :canvas-bottom-reserve="10"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      :row-key="getRowKeys"
      style="width: 100%"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
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
        sortable="custom"
        min-width="150"
        :sort-orders="sortOrders"
        prop="code"
        label="角色编码"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="sortOrders"
        prop="name"
        label="角色名称"
      />
      <el-table-column
        show-overflow-tooltip
        min-width="130"
        prop=""
        label="设置权限"
      >
        <template v-slot="scope">
          <el-link
            type="primary"
            @click="handleEditPermission(scope.row)"
          >
            添加权限
          </el-link>
          <span>
            （
            <el-link
              type="primary"
              @click="handleViewPermission(scope.row)"
            >
              {{ scope.row.permission_count || 0 }}
            </el-link>
            ）
          </span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        label="权限信息"
        min-width="150"
      >
        <template v-slot="scope">
          <el-tag
            v-for="item in scope.row.permissionList"
            :key="item.key"
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
        sortable="custom"
        min-width="150"
        :sort-orders="sortOrders"
        prop="descr"
        label="备注"
      />
      <el-table-column
        min-width="65"
        :sort-orders="sortOrders"
        label="删除"
      >
        <template v-slot:header>
          <field-help default-label="删除" help="删除状态提示：<br>绿色：未删除<br>红色：已删除" />
        </template>
        <template v-slot="scope">
          <el-tooltip
            :content="scope.row.is_del === 'false' ? '删除状态：已删除' : '删除状态：未删除' "
            placement="top"
            :open-delay="500"
          >
            <el-switch
              v-model="scope.row.is_del"
              active-color="#ff4949"
              inactive-color="#13ce66"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              @change="handleDelete(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        min-width="180"
        :sort-orders="sortOrders"
        show-overflow-tooltip
        prop="u_time"
        label="更新时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      ref="pagination"
      :total="pagination.total"
      :page.sync="pagination.current"
      :limit.sync="pagination.size"
      @pagination="loadData"
    />

    <!-- 新增角色弹窗 -->
    <role-new-dialog
      v-if="dialogVisible.new"
      :visible="dialogVisible.new"
      @closeMeOk="handleNewOk"
      @closeMeCancel="handleNewCancel"
    />

    <!-- 编辑角色弹窗 -->
    <role-edit-dialog
      v-if="dialogVisible.edit"
      :visible="dialogVisible.edit"
      :data="selectedRow"
      @closeMeOk="handleEditOk"
      @closeMeCancel="handleEditCancel"
    />

    <!-- 查看角色弹窗 -->
    <role-view-dialog
      v-if="dialogVisible.view"
      :visible="dialogVisible.view"
      :data="selectedRow"
      @closeMeCancel="handleViewCancel"
    />

    <!-- 权限选择弹窗 -->
    <permission-select-dialog
      v-if="dialogVisible.permission"
      :visible="dialogVisible.permission"
      :role-id="selectedRow.id"
      @closeMeOk="handlePermissionSelectOk"
      @closeMeCancel="handlePermissionSelectCancel"
    />

    <!-- 权限详情弹窗 -->
    <permission-view-dialog
      v-if="dialogVisible.permissionDetail"
      :visible="dialogVisible.permissionDetail"
      :permission-id="selectedPermission.id"
      :head-info="selectedPermission.label"
      @closeMeCancel="handlePermissionDetailCancel"
    />

    <!-- 员工关联弹窗 -->
    <role-staff-transfer-dialog
      v-if="dialogVisible.staff"
      :visible="dialogVisible.staff"
      :role-id="selectedRow.id"
      :role-data="selectedRow"
      mode="view"
      @closeMeOk="handleStaffOk"
      @closeMeCancel="handleStaffCancel"
    />
  </div>
</template>

<script>
import { getListApi, deleteApi, exportAllApi, exportSelectionApi } from '@/api/10_system/role/role'
import Pagination from '@/components/Pagination'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import permission from '@/directive/permission/index.js'
import deepCopy from 'deep-copy'
import FieldHelp from '@/components/30_table/FieldHelp'

// 弹窗组件
import RoleNewDialog from '../../dialog/20_new/index.vue'
import RoleEditDialog from '../../dialog/30_edit/index.vue'
import RoleViewDialog from '../../dialog/40_view/index.vue'
// 权限选择弹窗 - 替换原有穿梭框组件，提供更好的用户体验
import PermissionSelectDialog from '@/views/20_master/permission/component/dialog/listfor/role/index.vue'
// 权限详情弹窗 - 用于查看具体权限信息
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'
import RoleStaffTransferDialog from '../../dialog/50_transfer/index.vue'

export default {
  name: 'RoleList',
  components: {
    Pagination,
    DeleteTypeNormal,
    FieldHelp,
    RoleNewDialog,
    RoleEditDialog,
    RoleViewDialog,
    PermissionSelectDialog,
    PermissionViewDialog,
    RoleStaffTransferDialog
  },
  directives: { permission },
  data () {
    return {
      // 搜索表单
      searchForm: {
        pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
        name: '',
        code: '',
        is_del: '0'
      },
      // 表格数据
      tableData: [],
      // 分页
      pagination: deepCopy(this.PARAMETERS.PAGE_JSON),
      // 加载状态
      loading: false,
      // 排序规则
      sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
      // 当前选中行
      selectedRow: {},
      // 多选数据
      multipleSelection: [],
      // 弹窗显示状态
      dialogVisible: {
        new: false,
        edit: false,
        view: false,
        permission: false,
        permissionDetail: false,
        staff: false
      },
      // 权限详情弹窗相关数据
      selectedPermission: {
        id: null,
        label: ''
      }
    }
  },
  created () {
    this.loadData()
    // 处理路由查询参数
    if (this.$route.query.code !== undefined) {
      this.searchForm.code = this.$route.query.code
    }
    if (this.$route.query.name !== undefined) {
      this.searchForm.name = this.$route.query.name
    }
  },
  methods: {
    // 加载数据
    loadData () {
      this.searchForm.pageCondition.current = this.pagination.current
      this.searchForm.pageCondition.size = this.pagination.size
      this.loading = true

      getListApi(this.searchForm).then(response => {
        this.tableData = response.data.records
        this.pagination = response.data
        this.pagination.records = {}
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    // 搜索
    handleSearch () {
      this.searchForm.pageCondition.current = 1
      this.pagination.current = 1
      this.loadData()
      // 清空选择
      this.multipleSelection = []
      this.$refs.dataTable.clearSelection()
    },

    // 重置搜索
    handleReset () {
      this.searchForm = {
        pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
        name: '',
        code: '',
        is_del: '0'
      }
      this.handleSearch()
    },

    // 新增
    handleNew () {
      this.dialogVisible.new = true
    },

    handleNewOk (result) {
      this.dialogVisible.new = false
      if (result.return_flag) {
        this.loadData()
        this.$message.success('新增成功')
      }
    },

    handleNewCancel () {
      this.dialogVisible.new = false
    },

    // 编辑
    handleEdit () {
      if (!this.selectedRow.id) {
        this.$message.warning('请选择一条数据')
        return
      }
      this.dialogVisible.edit = true
    },

    handleEditOk (result) {
      this.dialogVisible.edit = false
      if (result.return_flag) {
        this.loadData()
        this.$message.success('编辑成功')
      }
    },

    handleEditCancel () {
      this.dialogVisible.edit = false
    },
    // 查看
    handleView () {
      if (!this.selectedRow.id) {
        this.$message.warning('请选择一条数据')
        return
      }
      this.dialogVisible.view = true
    },

    handleViewCancel () {
      this.dialogVisible.view = false
    },

    // 删除/恢复
    handleDelete (row) {
      const message = row.is_del === true ? '是否要删除选择的数据？' : '是否要复原该条数据？'
      this.$confirm(message, '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.loading = true
        const selectionJson = [{ id: row.id }]
        deleteApi(selectionJson).then((response) => {
          this.$notify({
            title: '更新处理成功',
            message: response.message,
            type: 'success',
            duration: 4000
          })
          this.loading = false
          this.loadData()
        }).catch(() => {
          row.is_del = !row.is_del
          this.loading = false
        })
      }).catch(() => {
        row.is_del = !row.is_del
      })
    },

    // 导出
    handleExport () {
      if (this.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }

      if (this.multipleSelection.length === this.tableData.length) {
        // 选择全部的时候
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全数据导出',
          cancelButtonText: '当前页数据导出'
        }).then(() => {
          this.handleExportAll()
        }).catch(action => {
          if (action !== 'close') {
            this.handleExportSelection()
          }
        })
      } else {
        this.handleExportSelection()
      }
    },

    // 全部数据导出
    handleExportAll () {
      this.loading = true
      exportAllApi(this.searchForm).then(() => {
        this.loading = false
        this.$message.success('导出成功')
      }).catch(() => {
        this.loading = false
      })
    },

    // 部分数据导出
    handleExportSelection () {
      this.loading = true
      const selectionJson = this.multipleSelection.map(item => ({ id: item.id }))
      exportSelectionApi(selectionJson).then(() => {
        this.loading = false
        this.$message.success('导出成功')
      }).catch(() => {
        this.loading = false
      })
    },

    // 权限管理 - 使用新的权限选择弹窗组件
    handleEditPermission (row) {
      this.selectedRow = row
      this.dialogVisible.permission = true
    },

    handleViewPermission (row) {
      this.selectedRow = row
      this.dialogVisible.permission = true
    },

    // 权限选择弹窗回调 - 保存成功
    handlePermissionSelectOk (result) {
      this.dialogVisible.permission = false
      if (result.return_flag) {
        this.loadData()
        this.$message.success('权限设置成功')
      }
    },

    // 权限选择弹窗回调 - 取消操作
    handlePermissionSelectCancel () {
      this.dialogVisible.permission = false
    },

    // 权限标签点击事件 - 打开权限详情弹窗
    handlePermissionClick (permissionItem) {
      if (!permissionItem || !permissionItem.id) {
        this.$message.warning('权限信息不完整，无法查看详情')
        return
      }
      // 设置选中的权限信息
      this.selectedPermission = {
        id: permissionItem.id,
        label: permissionItem.label || permissionItem.key || '未知权限'
      }
      // 打开权限详情弹窗
      this.dialogVisible.permissionDetail = true
    },

    // 权限详情弹窗回调 - 关闭操作
    handlePermissionDetailCancel () {
      this.dialogVisible.permissionDetail = false
      // 清空选中权限信息
      this.selectedPermission = {
        id: null,
        label: ''
      }
    },
    // 员工关联
    handleViewStaff (row) {
      this.selectedRow = row
      this.dialogVisible.staff = true
    },

    handleStaffOk (result) {
      this.dialogVisible.staff = false
      if (result.return_flag) {
        this.loadData()
        this.$message.success('员工关联成功')
      }
    },

    handleStaffCancel () {
      this.dialogVisible.staff = false
    },

    // 表格事件
    handleRowClick (row) {
      this.selectedRow = Object.assign({}, row)
    },

    handleCurrentChange (row) {
      this.selectedRow = Object.assign({}, row || {})
    },

    handleSortChange (column) {
      if (column.order === 'ascending') {
        this.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.loadData()
    },

    handleSelectionChange (selection) {
      this.multipleSelection = selection
    },

    getRowKeys (row) {
      return row.id
    }
  }
}
</script>

<style scoped>
.permission_tag {
  cursor: pointer;
  margin: 2px;
}

.el-button-group {
  margin-bottom: 10px;
}
</style>
