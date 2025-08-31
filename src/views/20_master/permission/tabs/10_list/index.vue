<template>
  <div class="app-container">
    <!-- 搜索表单区域 -->
    <el-form
      ref="searchForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
    >
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="权限名称"
        />
      </el-form-item>
      <el-form-item style="float:right">
        <el-button
          type="primary"
          plain
          icon="perfect-icon-reset"
          @click="doResetSearch"
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

    <!-- 操作按钮区域 -->
    <el-button-group>
      <el-button
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDelete"
      >删除</el-button>
      <el-button
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
    </el-button-group>

    <!-- 数据表格区域 -->
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="height"
      :columns-index-key="true"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="45"
        prop="id"
      />
      <el-table-column
        label="No"
        type="index"
        width="50"
        align="center"
      >
        <template v-slot="scope">
          <span>{{ (dataJson.searchForm.pageCondition.current - 1) * dataJson.searchForm.pageCondition.size + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="130"
        :auto-fit="true"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="label"
      >
        <template v-slot="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :auto-fit="true"
        :sort-orders="settings.sortOrders"
        prop="menu_name"
        label="关联菜单"
      >
        <template v-slot="scope">
          <span>{{ scope.row.menu_name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="140"
        :auto-fit="true"
        :sort-orders="settings.sortOrders"
        prop="descr"
        label="备注"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        min-width="200"
        prop="oper"
        label="权限操作"
      >
        <template v-slot="scope">
          <el-button-group>
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="handleSetUpOperation(scope.row)"
            >设置</el-button>
            <el-button
              type="info"
              icon="el-icon-search"
              @click="handleViewOperation(scope.row)"
            >查看</el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        :auto-fit="true"
        sortable="custom"
        min-width="100"
        :sort-orders="settings.sortOrders"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="180"
        :auto-fit="true"
        :sort-orders="settings.sortOrders"
        prop="u_time"
        label="更新时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      ref="paging"
      :total="dataJson.paging.total"
      :page.sync="dataJson.paging.current"
      :limit.sync="dataJson.paging.size"
      @pagination="getDataList"
    />

    <!-- 编辑弹窗 -->
    <edit-dialog
      v-if="popSettings.editDialog.visible"
      :data="popSettings.editDialog.data"
      :visible.sync="popSettings.editDialog.visible"
      @onSuccess="handleEditDialogSuccess"
      @onCancel="handleEditDialogCancel"
    />

    <!-- 新增弹窗 -->
    <new-dialog
      v-if="popSettings.newDialog.visible"
      :visible.sync="popSettings.newDialog.visible"
      @onSuccess="handleNewDialogSuccess"
      @onCancel="handleNewDialogCancel"
    />

    <!-- 查看弹窗 -->
    <view-dialog
      v-if="popSettings.viewDialog.visible"
      :visible.sync="popSettings.viewDialog.visible"
      :permission-data="popSettings.viewDialog.data"
      @onCancel="handleViewDialogCancel"
    />
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getListApi, deleteApi } from '@/api/20_master/permission/permission'
import deepCopy from 'deep-copy'
import Pagination from '@/components/Pagination/index.vue'
import editDialog from '../../dialog/30_edit/index.vue'
import newDialog from '../../dialog/20_new/index.vue'
import viewDialog from '../../dialog/40_view/index.vue'

export default {
  name: 'PermissionList',
  components: { Pagination, editDialog, newDialog, viewDialog },
  directives: { elDragDialog },
  props: {
    height: {
      type: Number,
      default: 400
    }
  },
  data () {
    return {
      dataJson: {
        // 头部提示栏
        head: {
          info: ''
        },
        // 查询使用的json
        searchForm: {
          condition: null,
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: ''
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 单条数据 json
        currentJson: null,
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showExport: false,
          showDel: false
        },
        // loading 状态
        loading: false,
        duration: 4000,
        sortOrders: ['ascending', 'descending', null]
      },
      popSettings: {
        // 弹出编辑页面
        editDialog: {
          visible: false,
          data: {}
        },
        // 弹出新增页面
        newDialog: {
          visible: false
        },
        // 弹出查看页面
        viewDialog: {
          visible: false,
          data: {}
        }
      }
    }
  },
  computed: {},
  // 监听器
  watch: {
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler (newVal, oldVal) {
        this.updateButtonStatus()
      }
    },
    // 当前行的选中
    'dataJson.currentJson': {
      handler (newVal, oldVal) {
        this.updateButtonStatus()
      },
      deep: true
    }
  },
  created () {
    if (this.$route.query.name !== undefined) {
      this.dataJson.searchForm.name = this.$route.query.name
    }
    this.getDataList()
    this.initShow()
  },
  mounted () {},
  methods: {
    initShow () {
    },
    // 更新按钮状态，支持多选和单选
    updateButtonStatus () {
      const hasMultipleSelection = this.dataJson.multipleSelection && this.dataJson.multipleSelection.length > 0
      const hasSingleSelection = this.dataJson.currentJson && this.dataJson.currentJson.id !== undefined

      // 导出按钮：多选或单选任一有效时启用
      this.settings.btnShowStatus.showExport = hasMultipleSelection || hasSingleSelection

      // 修改按钮：只有单选且没有多选时启用（避免操作对象不一致）
      this.settings.btnShowStatus.showUpdate = hasSingleSelection && !hasMultipleSelection

      // 删除按钮：多选或单选任一有效时启用
      this.settings.btnShowStatus.showDel = hasMultipleSelection || hasSingleSelection
    },
    // 获取行索引
    getRowIndex (row) {
      if (this.dataJson.listData !== null) {
        const _index = this.dataJson.listData.lastIndexOf(row)
        return _index
      }
    },
    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },
    getDataList (val) {
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size

      // 查询逻辑
      this.settings.loading = true
      const condition = {
        ...{ type: this.dataJson.searchForm.condition !== null ? this.dataJson.searchForm.condition.type : null },
        ...{ serial_type: this.dataJson.searchForm.condition !== null ? this.dataJson.searchForm.condition.serial_type : null },
        ...{ serial_id: this.dataJson.searchForm.condition !== null ? this.dataJson.searchForm.condition.serial_id : null },
        ...{ pageCondition: this.dataJson.searchForm.pageCondition },
        ...{ name: this.dataJson.searchForm.name }
      }
      getListApi(condition).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // table选择框
    handleSelectionChange (arr) {
      this.dataJson.multipleSelection = arr
    },
    handleSortChange (column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },
    // 点击按钮 新增
    handleInsert () {
      // 新增
      this.popSettings.newDialog.visible = true
    },
    // 点击按钮 更新
    handleUpdate () {
      if (!this.dataJson.currentJson || this.dataJson.currentJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 更新
      this.popSettings.editDialog.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.editDialog.visible = true
    },
    // 查看
    handleView () {
      if (!this.dataJson.currentJson || this.dataJson.currentJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 查看
      this.popSettings.viewDialog.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.viewDialog.visible = true
    },
    // 删除
    handleDelete () {
      const hasMultipleSelection = this.dataJson.multipleSelection && this.dataJson.multipleSelection.length > 0
      const hasSingleSelection = this.dataJson.currentJson && this.dataJson.currentJson.id !== undefined

      // 检查是否有选择数据
      if (!hasMultipleSelection && !hasSingleSelection) {
        this.showErrorMsg('请选择要删除的数据')
        return
      }

      let confirmMessage = ''
      if (hasMultipleSelection) {
        // 多选删除
        confirmMessage = `确定要删除选中的 ${this.dataJson.multipleSelection.length} 条权限记录吗？`
      } else {
        // 单选删除
        confirmMessage = `确定要删除权限【${this.dataJson.currentJson.name}】吗？`
      }

      // 删除确认
      this.$confirm(confirmMessage, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.executeDelete()
      }).catch(() => {
        // 取消删除
      })
    },
    // 执行删除操作
    async executeDelete () {
      try {
        this.settings.loading = true
        let deleteData = []

        const hasMultipleSelection = this.dataJson.multipleSelection && this.dataJson.multipleSelection.length > 0

        if (hasMultipleSelection) {
          // 多选删除：使用多选框选中的数据
          deleteData = this.dataJson.multipleSelection.map(item => ({
            id: item.id,
            dbversion: item.dbversion
          }))
        } else {
          // 单选删除：使用当前选中行的数据
          deleteData = [{
            id: this.dataJson.currentJson.id,
            dbversion: this.dataJson.currentJson.dbversion
          }]
        }

        const response = await deleteApi(deleteData)
        if (response.success) {
          const count = deleteData.length
          this.$message.success(`成功删除 ${count} 条权限记录`)

          // 刷新列表数据
          this.getDataList()

          // 清空选择状态
          this.dataJson.currentJson = null
          this.dataJson.multipleSelection = []
          this.$refs.multipleTable.setCurrentRow()
          this.$refs.multipleTable.clearSelection()
        } else {
          this.showErrorMsg(response.message || '删除失败')
        }
      } catch (error) {
        // 全局拦截器已处理错误显示，这里只记录日志
        console.error('删除操作异常:', error)
      } finally {
        this.settings.loading = false
      }
    },
    // ------------------编辑弹出框 start--------------------
    handleEditDialogSuccess (val) {
      // 更新列表中的数据
      this.dataJson.listData.splice(this.dataJson.rowIndex, 1, val.data.data)
      // 设置到currentjson中
      this.dataJson.currentJson = Object.assign({}, val.data.data)
      // 刷新列表以确保数据同步
      this.getDataList()
    },
    handleEditDialogCancel () {
      // 对话框通过.sync自动关闭
    },
    // ------------------编辑弹出框 end--------------------
    // ------------------新增弹出框 start--------------------
    handleNewDialogSuccess (val) {
      // 添加新数据到列表顶部
      this.dataJson.listData.unshift(val.data.data)
      // 刷新列表以确保数据同步
      this.getDataList()
    },
    handleNewDialogCancel () {
      // 对话框通过.sync自动关闭，这里可以处理其他逻辑
    },
    // ------------------新增弹出框 end--------------------
    // ------------------查看弹出框 start--------------------
    handleViewDialogCancel () {
      // 对话框通过.sync自动关闭
    },
    // ------------------查看弹出框 end--------------------
    // 权限操作设置
    handleSetUpOperation (val) {
      this.openPermissionEditTab(val)
    },
    // 打开权限编辑页面
    openPermissionEditTab (val) {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '正在编辑操作权限：【' + val.name + '】' },
        operate_tab_header_info: { info: this.dataJson.head.info },
        permission: { permissionId: val.id }
      }
      this.$emit('emitEdit', operate_tab_data)
    },
    handleViewOperation (val) {
      this.openPermissionViewTab(val)
    },
    // 打开权限查看页面
    openPermissionViewTab (val) {
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '正在查看操作权限：【' + val.name + '】' },
        operate_tab_header_info: { info: this.dataJson.head.info },
        permission: { permissionId: val.id }
      }
      this.$emit('emitView', operate_tab_data)
    },
    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    }
  }
}
</script>

<style scoped>
.app-container {
  margin: 0;
  padding: 0;
}

.switch {
  text-align: center;
}
.switch ::v-deep .el-switch__label {
  position: absolute;
  display: none;
  color: #fff;
}

/*打开时文字位置设置*/
.switch ::v-deep .el-switch__label--right {
  z-index: 1;
  right: 19px;
}
/*关闭时文字位置设置*/
.switch ::v-deep .el-switch__label--left {
  z-index: 1;
  left: 19px;
}
/*显示文字*/
.switch ::v-deep .el-switch__label.is-active {
  display: block;
}

.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-button-group {
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>
