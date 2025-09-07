<template>
  <div>
    <FloatMenu />
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
    >
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.business_name"
          clearable
          placeholder="所属板块"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.industry_name"
          clearable
          placeholder="所属行业"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.category_name"
          clearable
          placeholder="所属类别"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="物料名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item style="float:right">
        <el-button
          v-popover:popover
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
    <el-button-group>
      <el-button
        v-permission="'P_GOODS:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_GOODS:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        v-permission="'P_GOODS:VIEW'"
        :disabled="!settings.btnShowStatus.showView"
        type="primary"
        icon="el-icon-view"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
      <el-button
        v-permission="'P_GOODS:ENABLE'"
        :disabled="!settings.btnShowStatus.showEnable"
        type="primary"
        icon="el-icon-circle-check"
        :loading="settings.loading"
        @click="handleEnabled"
      >启用</el-button>
      <el-button
        v-permission="'P_GOODS:DISABLE'"
        :disabled="!settings.btnShowStatus.showDisable"
        type="primary"
        icon="el-icon-circle-close"
        :loading="settings.loading"
        @click="handleDisAbled"
      >停用</el-button>
      <el-button
        v-permission="'P_GOODS:EXPORT'"
        :disabled="!settings.btnShowStatus.showExport"
        type="primary"
        icon="el-icon-s-management"
        :loading="settings.loading"
        @click="handleExport"
      >导出</el-button>
    </el-button-group>

    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :canvas-auto-height="true"
      :columns-index-key="true"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
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
        type="index"
        width="45"
        label="No"
        prop="No"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="business_name"
        label="板块名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="industry_name"
        label="行业名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="category_name"
        label="类别名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="name"
        label="物料名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="code"
        label="物料编号"
      />
      <el-table-column
        min-width="100"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        label="启用状态"
        prop="enable"
      >
        <template v-slot:header>
          <field-help
            default-label="启用状态"
            help="启用状态提示：<br>绿色：已启用<br>红色：未启用"
          />
        </template>
        <template v-slot="scope">
          <el-tooltip
            :content="scope.row.enable === 'false' ? '启用状态：未启用' : '启用状态：已启用' "
            placement="top"
            :open-delay="500"
          >
            <el-switch
              v-model="scope.row.enable"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              @change="handledEnableOrDisAbleApi(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_name"
        label="创建人"
      />
      <el-table-column
        sortable="custom"
        min-width="180"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        prop="c_time"
        label="创建时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.c_time) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
        sortable="custom"
        min-width="180"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        prop="u_time"
        label="更新时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      ref="minusPaging"
      :total="dataJson.paging.total"
      :page.sync="dataJson.paging.current"
      :limit.sync="dataJson.paging.size"
      @pagination="getDataList"
    />

    <!-- 新增弹窗 -->
    <new-dialog
      v-if="popSettings.new.visible"
      :visible="popSettings.new.visible"
      :copy-data="popSettings.new.copyData"
      @closeMeOk="handleNewDialogOk"
      @closeMeCancel="handleNewDialogCancel"
    />

    <!-- 编辑弹窗 -->
    <edit-dialog
      v-if="popSettings.edit.visible"
      :visible="popSettings.edit.visible"
      :data="popSettings.edit.data"
      @closeMeOk="handleEditDialogOk"
      @closeMeCancel="handleEditDialogCancel"
    />

    <!-- 查看弹窗 -->
    <view-dialog
      v-if="popSettings.view.visible"
      :visible="popSettings.view.visible"
      :data="popSettings.view.data"
      @closeMeCancel="handleViewDialogCancel"
    />
  </div>
</template>

<script>
import { getListApi, enabledSelectionApi, disAbledSelectionApi, enableOrDisAbleApi, exportApi } from '@/api/30_wms/goods/goods'
import Pagination from '@/components/Pagination'
import FieldHelp from '@/components/30_table/FieldHelp/index.vue'
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js'

export default {
  name: 'GoodsList',
  components: {
    Pagination,
    FieldHelp,
    NewDialog,
    EditDialog,
    ViewDialog
  },
  directives: { permission },
  props: {
    // 作为选择对话框时的属性
    meDialogStatus: {
      type: Boolean,
      default: false
    },
    dataModel: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dataJson: {
        // 查询表单
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          business_name: '',
          industry_name: '',
          category_name: '',
          name: ''
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table数据
        listData: [],
        // 当前选中行
        currentJson: null,
        // 当前行索引
        rowIndex: 0,
        // 选中的多行数据
        multipleSelection: []
      },
      // 页面设置
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮显示状态
        btnShowStatus: {
          showUpdate: false,
          showView: false,
          showEnable: false,
          showDisable: false,
          showExport: false
        },
        // 加载状态
        loading: true,
        duration: 4000
      },
      // 对话框设置 (标准化为Position模式)
      popSettings: {
        // 新增弹窗
        new: {
          visible: false,
          copyData: null
        },
        // 编辑弹窗
        edit: {
          visible: false,
          data: null
        },
        // 查看弹窗
        view: {
          visible: false,
          data: null
        }
      }
    }
  },
  watch: {
    // 选中数据变化时更新按钮状态
    'dataJson.multipleSelection': {
      handler (newVal) {
        const hasSelection = newVal.length > 0
        this.settings.btnShowStatus.showEnable = hasSelection
        this.settings.btnShowStatus.showDisable = hasSelection
        this.settings.btnShowStatus.showExport = hasSelection
      }
    }
  },
  created () {
    // 初始化查询
    this.getDataList()

    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
  },
  methods: {
    // 获取数据列表
    getDataList () {
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size

      this.settings.loading = true
      getListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 查询
    handleSearch () {
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },

    // 重置查询
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },

    // 表格排序变化
    handleSortChange (column) {
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },

    // 获取行索引
    getRowIndex (row) {
      return this.dataJson.listData.indexOf(row)
    },

    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },

    // 行双击
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      if (this.meDialogStatus) {
        this.$emit('rowDbClick', deepCopy(row))
      }
    },

    // 当前行变化
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showView = true
      } else {
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showView = false
      }
    },

    // 选择变化
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },

    // 新增按钮
    handleInsert () {
      this.popSettings.new.copyData = null
      this.popSettings.new.visible = true
    },

    // 修改按钮
    handleUpdate () {
      if (!this.dataJson.currentJson || this.dataJson.currentJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.edit.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.edit.visible = true
    },

    // 查看按钮
    handleView () {
      if (!this.dataJson.currentJson || this.dataJson.currentJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.view.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.view.visible = true
    },

    // 启用按钮
    handleEnabled () {
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行启用', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
      } else {
        this.handleEnabledSelectionData()
      }
    },

    // 启用选中数据
    handleEnabledSelectionData () {
      this.settings.loading = true
      const selectionJson = this.dataJson.multipleSelection.map(item => ({ id: item.id }))

      enabledSelectionApi(selectionJson).then((response) => {
        this.$notify({
          title: '启用成功',
          message: response.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.getDataList()
      }).catch((error) => {
        this.$notify({
          title: '启用错误',
          message: error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 停用按钮
    handleDisAbled () {
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行停用', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
      } else {
        this.handleDisAbledSelectionData()
      }
    },

    // 停用选中数据
    handleDisAbledSelectionData () {
      this.settings.loading = true
      const selectionJson = this.dataJson.multipleSelection.map(item => ({ id: item.id }))

      disAbledSelectionApi(selectionJson).then((response) => {
        this.$notify({
          title: '停用成功',
          message: response.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.getDataList()
      }).catch((error) => {
        this.$notify({
          title: '停用错误',
          message: error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 启用/停用开关
    handledEnableOrDisAbleApi (row) {
      const message = row.enable === true ? '是否要启用该条数据？' : '是否要停用该条数据？'
      const selectionJson = [{ id: row.id }]

      this.$confirm(message, '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.settings.loading = true
        enableOrDisAbleApi(selectionJson).then((response) => {
          this.$notify({
            title: '更新处理成功',
            message: response.message,
            type: 'success',
            duration: this.settings.duration
          })
        }).catch((error) => {
          this.$notify({
            title: '更新处理失败',
            message: error.message,
            type: 'error',
            duration: this.settings.duration
          })
          row.enable = !row.enable
        }).finally(() => {
          this.settings.loading = false
        })
      }).catch(() => {
        row.enable = !row.enable
      })
    },

    // 导出按钮
    handleExport () {
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
      } else if (this.dataJson.multipleSelection.length === this.dataJson.listData.length) {
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全数据导出',
          cancelButtonText: '当前页数据导出'
        }).then(() => {
          this.handleExportAllData()
        }).catch(action => {
          if (action !== 'close') {
            this.handleExportSelectionData()
          }
        })
      } else {
        this.handleExportSelectionData()
      }
    },

    // 全部数据导出
    handleExportAllData () {
      this.settings.loading = true
      this.dataJson.searchForm.ids = []
      exportApi(this.dataJson.searchForm).then(() => {
        this.settings.loading = false
      })
    },

    // 部分数据导出
    handleExportSelectionData () {
      this.settings.loading = true
      const selectionIds = this.dataJson.multipleSelection.map(item => item.id)
      this.dataJson.searchForm.ids = selectionIds
      exportApi(this.dataJson.searchForm).then(() => {
        this.settings.loading = false
      })
    },

    // 新增对话框确认
    handleNewDialogOk (val) {
      if (val.return_flag) {
        this.popSettings.new.visible = false
        this.dataJson.listData.unshift(val.data.data)
        this.$notify({
          title: '新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '新增处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },

    // 新增对话框取消
    handleNewDialogCancel () {
      this.popSettings.new.visible = false
      this.popSettings.new.copyData = null
    },

    // 编辑对话框确认
    handleEditDialogOk (val) {
      if (val.return_flag) {
        this.popSettings.edit.visible = false
        this.dataJson.listData.splice(this.dataJson.rowIndex, 1, val.data.data)
        this.dataJson.currentJson = Object.assign({}, val.data.data)
        this.$notify({
          title: '更新处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '更新处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },

    // 编辑对话框取消
    handleEditDialogCancel () {
      this.popSettings.edit.visible = false
    },

    // 查看对话框取消
    handleViewDialogCancel () {
      this.popSettings.view.visible = false
    }
  }
}
</script>

<style scoped>
.el-form-item .el-select {
  width: 100%;
}
.el-button-group {
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>
