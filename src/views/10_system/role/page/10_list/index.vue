<template>
  <div class="app-container">
    <FloatMenu />
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
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="loading"
        @click="handleEdit"
      >修改</el-button>
      <el-button
        v-permission="'P_ROLE:DELETE'"
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="loading"
        @click="handleDelButton"
      >删除</el-button>
      <!--      导出按钮 开始-->
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_ROLE:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_ROLE:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnShowStatus.hidenExport"
        v-permission="'P_ROLE:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="loading"
        @click="handleModelOpen"
      >导出</el-button>
      <!--      导出按钮 结束-->
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
        v-if="settings.exportModel"
        type="selection"
        width="45"
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
        sortable="custom"
        min-width="150"
        :sort-orders="sortOrders"
        prop="descr"
        label="备注"
      />
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
      ref="editDialog"
      :visible="dialogVisible.edit"
      :data="selectedRow"
      @closeMeOk="handleEditOk"
      @closeMeCancel="handleEditCancel"
      @refreshData="handleRefreshData"
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

    <!--    vue-tour组件-->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />

  </div>
</template>

<script>
import { getListApi, deleteApi, exportAllApi, exportSelectionApi } from '@/api/10_system/role/role'
import Pagination from '@/components/Pagination'
import permission from '@/directive/permission/index.js'
import deepCopy from 'deep-copy'
import FloatMenu from '@/components/FloatMenu/index.vue'

// 弹窗组件
import RoleNewDialog from '../../dialog/20_new/index.vue'
import RoleEditDialog from '../../dialog/30_edit/index.vue'
import RoleViewDialog from '../../dialog/40_view/index.vue'
// 权限选择弹窗 - 替换原有穿梭框组件，提供更好的用户体验
import PermissionSelectDialog from '@/views/20_master/permission/component/dialog/listfor/role/index.vue'
// 权限详情弹窗 - 用于查看具体权限信息
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'

export default {
  name: 'RoleList',
  components: {
    FloatMenu,
    Pagination,
    PermissionSelectDialog,
    PermissionViewDialog,
    RoleEditDialog,
    RoleNewDialog,
    RoleViewDialog
  },
  directives: { permission },
  data () {
    return {
      // 搜索表单
      searchForm: {
        pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
        name: '',
        code: ''
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
      // 设置参数
      settings: {
        // 导出模式
        exportModel: false,
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showDel: false,
          showExport: false,
          hidenExport: true
        }
      },
      // 弹窗显示状态
      dialogVisible: {
        new: false,
        edit: false,
        view: false,
        permission: false,
        permissionDetail: false
      },
      // 权限详情弹窗相关数据
      selectedPermission: {
        id: null,
        label: ''
      },
      // Vue Tours 引导配置
      tourOption: {
        useKeyboardNavigation: false, // 是否通过键盘的←, → 和 ESC 控制指引
        labels: { // 指引项的按钮文案
          buttonStop: '结束' // 结束文案
        },
        highlight: false // 是否高亮显示激活的的target项
      },
      steps: [
        {
          target: '.el-table-column--selection', // 当前项的id或class或data-v-step属性
          content: '请通过点击多选框，选择要导出的数据！', // 当前项指引内容
          params: {
            placement: 'top', // 指引在target的位置，支持上、下、左、右
            highlight: false, // 当前项激活时是否高亮显示
            enableScrolling: false // 指引到当前项时是否滚动轴滚动到改项位置
          },
          // 在进行下一步时处理UI渲染或异步操作，例如打开弹窗，调用api等。当执行reject时，指引不会执行下一步
          before: type => new Promise((resolve, reject) => {
            // 耗时的UI渲染或异步操作
            resolve('foo')
          })
        }
      ]
    }
  },
  watch: {
    // 监听导出模式变化
    'settings.exportModel': {
      handler (newVal, oldVal) {
        if (newVal) {
          console.log('进入导出模式')
        } else {
          console.log('退出导出模式')
        }
      }
    },
    // 监听加载状态
    'settings.loading': {
      handler (newVal, oldVal) {
        this.loading = newVal
      }
    }
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
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
        code: ''
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

    // 刷新编辑数据（权限变更后）
    handleRefreshData (params) {
      const roleId = params.roleId
      // 刷新表格数据
      this.loadData()
      // 重新设置选中行为最新数据，并同步到编辑弹窗
      this.$nextTick(() => {
        const updatedRow = this.tableData.find(row => row.id === roleId)
        if (updatedRow) {
          this.selectedRow = Object.assign({}, updatedRow)
          console.log('刷新后的角色数据:', this.selectedRow)

          // 同步最新数据到编辑弹窗，解决乐观锁版本问题
          if (this.$refs.editDialog && this.dialogVisible.edit) {
            this.$refs.editDialog.updateFormData(updatedRow)
          }
        }
      })
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
      exportAllApi(this.searchForm).then(response => {
      }).finally(() => {
        this.loading = false
      })
    },

    // 部分数据导出
    handleExportSelection () {
      this.loading = true
      const selectionIds = []
      this.multipleSelection.forEach(function (value, index, array) {
        selectionIds.push(value.id) // 直接推送ID值，不是对象
      })
      const searchData = { ids: selectionIds }
      exportSelectionApi(searchData).then(response => {
      }).finally(() => {
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

    // 删除按钮事件
    handleDelButton () {
      if (!this.selectedRow.id) {
        this.$message.warning('请选择一条数据')
        return
      }
      const message = '确定要删除选中的数据吗？'
      this.$confirm(message, '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.loading = true
        const selectionJson = [{ id: this.selectedRow.id }]
        deleteApi(selectionJson).then((response) => {
          this.$notify({
            title: '删除处理成功',
            message: response.message,
            type: 'success',
            duration: 4000
          })
          this.loadData()
        }).catch((error) => {
          this.$notify({
            title: '删除处理失败',
            message: error.message,
            type: 'error',
            duration: 4000
          })
        }).finally(() => {
          this.loading = false
        })
      })
    },

    // 表格事件
    handleRowClick (row) {
      this.selectedRow = Object.assign({}, row)
    },

    handleCurrentChange (row) {
      this.selectedRow = Object.assign({}, row || {})

      if (this.selectedRow.id !== undefined) {
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showDel = true
      } else {
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showDel = false
      }
    },

    handleSortChange (column) {
      if (column.order === 'ascending') {
        this.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.searchForm.pageCondition.sort = '-' + column.prop
      } else {
        // 修复：处理取消排序情况
        this.searchForm.pageCondition.sort = null
      }
      this.loadData()
    },

    handleSelectionChange (selection) {
      this.multipleSelection = selection
    },

    /**
     * 切换到导出模式
     */
    handleModelOpen () {
      this.settings.exportModel = true
      this.settings.btnShowStatus.hidenExport = false
      this.$tours['myTour'].start()
    },

    /**
     * 完成导出
     */
    handleExportOk () {
      this.settings.exportModel = false
      this.settings.btnShowStatus.hidenExport = true
      this.settings.btnShowStatus.showExport = false
      // 清空选中状态
      this.multipleSelection = []
      this.$refs.dataTable.clearSelection()
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
