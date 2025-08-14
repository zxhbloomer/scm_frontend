<template>
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="部门选择页面"
    :visible="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :modal="true"
    :append-to-body="true"
    :modal-append-to-body="false"
    width="1200px"
    destroy-on-close
    top="5vh"
  >
    <!-- 查询表单 -->
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="right"
    >
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.code"
          clearable
          placeholder="部门编号"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="部门名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <delete-type-normal v-model="dataJson.searchForm.is_del" disabled />
      </el-form-item>
      <el-form-item label="">
        <select-dict
          v-model="dataJson.searchForm.dataModel"
          :para="CONSTANTS.DICT_ORG_USED_TYPE"
          init-placeholder="请选择"
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

    <!-- 按钮组 -->
    <el-button-group>
      <el-button
        v-permission="'P_DEPT:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_DEPT:INFO'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
      <el-button
        v-permission="'P_DEPT:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <!-- 注释掉导出按钮
      <el-button
        v-permission="'P_DEPT:EXPORT'"
        :disabled="!settings.btnShowStatus.showExport"
        type="primary"
        icon="el-icon-s-management"
        :loading="settings.loading"
        @click="handleExport"
      >导出</el-button>
      -->
    </el-button-group>

    <!-- 数据表格 -->
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :canvas-auto-height="true"
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
      <!-- 注释掉多选框列
      <el-table-column
        type="selection"
        width="45"
        prop="id"
      />
      -->
      <el-table-column
        type="index"
        width="45"
        label="No"
      />
      <el-table-column
        :auto-fit="true"
        header-align="center"
        sortable="custom"
        min-width="180"
        :sort-orders="settings.sortOrders"
        prop="group_full_simple_name"
        label="集团信息"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="company_simple_name"
        label="企业信息"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="200"
        :sort-orders="settings.sortOrders"
        prop="parent_dept_simple_name"
        label="上级部门"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="170"
        :sort-orders="settings.sortOrders"
        prop="code"
        label="部门编号"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="200"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="部门名称"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="simple_name"
        label="部门简称"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="handler_id_name"
        label="部门主管"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="sub_handler_id_name"
        label="部门副主管"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="leader_id_name"
        label="上级主管领导"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="response_leader_id_name"
        label="上级分管领导"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        min-width="150"
        prop="descr"
        label="说明"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="90"
        :sort-orders="settings.sortOrders"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="200"
        :sort-orders="settings.sortOrders"
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
      ref="minusPaging"
      :total="dataJson.paging.total"
      :page.sync="dataJson.paging.current"
      :limit.sync="dataJson.paging.size"
      @pagination="getDataList"
    />

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        @click="handleDoCancel()"
      >取消</el-button>
      <el-button
        type="primary"
        :disabled="settings.btnDisabledStatus.disabledOk"
        @click="handleDoOk()"
      >确定</el-button>
    </div>

    <!-- 新增弹窗 -->
    <new-dialog
      v-if="dialogs.new"
      ref="newDialog"
      :visible="dialogs.new"
      @closeMeOk="handleNewDialogOk"
      @closeMeCancel="handleNewDialogCancel"
    />

    <!-- 查看弹窗 -->
    <view-dialog
      v-if="dialogs.view"
      :visible="dialogs.view"
      :data="dataJson.currentJson"
      @closeMeCancel="handleViewDialogCancel"
    />

    <!-- 编辑弹窗 -->
    <edit-dialog
      v-if="dialogs.edit"
      :visible="dialogs.edit"
      :data="dataJson.currentJson"
      @closeMeOk="handleEditDialogOk"
      @closeMeCancel="handleEditDialogCancel"
    />
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import permission from '@/directive/permission/index.js' // 权限判断指令
import { getListApi, exportAllApi, exportSelectionApi } from '@/api/20_master/dept/dept'
import Pagination from '@/components/Pagination'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import SelectDict from '@/components/00_dict/select/SelectDict'
import NewDialog from '../20_new/index.vue'
import ViewDialog from '../40_view/index.vue'
import EditDialog from '../30_edit/index.vue'
import deepCopy from 'deep-copy'

export default {
  name: 'DeptSelectDialog',
  components: {
    Pagination,
    DeleteTypeNormal,
    SelectDict,
    NewDialog,
    ViewDialog,
    EditDialog
  },
  directives: { elDragDialog, permission },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    dataModel: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '',
          code: '',
          is_del: '0', // 未删除
          id: this.id,
          dataModel: this.dataModel // 弹出框模式
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
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态
        btnDisabledStatus: {
          disabledOk: true
        },
        // 按钮显示状态
        btnShowStatus: {
          showUpdate: false,
          showExport: false
        },
        // loading 状态
        loading: true,
        duration: 4000
      },
      // 弹窗控制
      dialogs: {
        new: false,
        view: false,
        edit: false
      }
    }
  },
  computed: {},
  // 监听器
  watch: {
    visible: {
      handler (newVal, oldVal) {
        if (newVal) {
          this.initShow()
          // 设置dialog的返回
          this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
        }
      },
      immediate: true
    },
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler (newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showExport = true
        } else {
          this.settings.btnShowStatus.showExport = false
        }
      }
    }
  },
  methods: {
    initShow () {
      // 初始化查询
      this.getDataList()
    },
    initDialogStatus () {
      // 初始化弹窗状态
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    // 行双击
    handleRowDbClick (row) {
      this.dataJson.currentJson = deepCopy(row)
      this.handleDoOk()
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnDisabledStatus.disabledOk = false
        this.settings.btnShowStatus.showUpdate = true
      } else {
        this.settings.btnDisabledStatus.disabledOk = true
        this.settings.btnShowStatus.showUpdate = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
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
    handleSortChange (column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },
    getDataList () {
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.loading = true
      getListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },
    // 确定按钮
    handleDoOk () {
      if (this.dataJson.currentJson && this.dataJson.currentJson.id) {
        this.$emit('closeMeOk', this.$store.getters.selectedDataJson || deepCopy(this.dataJson.currentJson))
      }
    },
    // 取消按钮
    handleDoCancel () {
      this.$emit('closeMeCancel')
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },
    // 新增按钮
    handleInsert () {
      this.dialogs.new = true
    },
    // 查看按钮
    handleView () {
      if (this.dataJson.currentJson && this.dataJson.currentJson.id) {
        this.dialogs.view = true
      }
    },
    // 修改按钮
    handleUpdate () {
      if (this.dataJson.currentJson && this.dataJson.currentJson.id) {
        this.dialogs.edit = true
      }
    },
    // 导出按钮
    handleExport () {
      if (this.dataJson.multipleSelection.length === 0) {
        // 导出全部
        exportAllApi(this.dataJson.searchForm).then(response => {
          const blob = new Blob([response.data], {
            type: 'application/vnd.ms-excel'
          })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = '部门数据.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        })
      } else {
        // 导出选中的
        const ids = this.dataJson.multipleSelection.map(item => item.id)
        exportSelectionApi(ids).then(response => {
          const blob = new Blob([response.data], {
            type: 'application/vnd.ms-excel'
          })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = '部门数据.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        })
      }
    },
    // 新增弹窗确定
    handleNewDialogOk (val) {
      if (val.return_flag) {
        this.dialogs.new = false
        // 设置到table中绑定的json数据源
        this.dataJson.listData.unshift(val.data.data)

        // 设置新增的数据为当前选中数据
        this.dataJson.currentJson = deepCopy(val.data.data)

        this.$notify({
          title: '新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })

        // 新增成功后关闭整个选择弹窗并返回新增的数据
        this.$emit('closeMeOk', deepCopy(this.dataJson.currentJson))
      } else {
        this.$notify({
          title: '新增处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 新增弹窗取消
    handleNewDialogCancel () {
      this.dialogs.new = false
    },
    // 编辑弹窗确定
    handleEditDialogOk (val) {
      this.dialogs.edit = false
      if (val.return_flag) {
        // 刷新列表
        this.getDataList()
      }
    },
    // 编辑弹窗取消
    handleEditDialogCancel () {
      this.dialogs.edit = false
    },
    // 查看弹窗取消
    handleViewDialogCancel () {
      this.dialogs.view = false
    }
  }
}
</script>

<style scoped>
.el-button-group {
  margin-bottom: 10px;
}
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
</style>
