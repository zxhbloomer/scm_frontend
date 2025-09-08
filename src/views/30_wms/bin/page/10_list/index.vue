<template>
  <div>
    <FloatMenu />
    <el-form
      v-if="searchsetting.visible"
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
    >
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.warehouse_name"
          clearable
          placeholder="仓库名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-select
          v-model="dataJson.searchForm.enable"
          clearable
          placeholder="启用状态"
          @keyup.enter.native="handleSearch"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="已启用" :value="true" />
          <el-option label="未启用" :value="false" />
        </el-select>
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
    <el-button-group v-if="searchsetting.visible">
      <el-button
        v-permission="'P_BIN:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_BIN:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <!-- 导出按钮 结束 -->
      <el-button
        v-permission="'P_BIN:DELETE'"
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDelButton"
      >删除</el-button>
      <el-button
        v-permission="'P_BIN:INFO'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
      <el-button
        v-permission="'P_BIN:ENABLE'"
        :disabled="!settings.btnShowStatus.showEnable"
        type="primary"
        icon="el-icon-circle-check"
        :loading="settings.loading"
        @click="handleEnabled"
      >启用</el-button>
      <el-button
        v-permission="'P_BIN:DISABLE'"
        :disabled="!settings.btnShowStatus.showDisable"
        type="primary"
        icon="el-icon-circle-close"
        :loading="settings.loading"
        @click="handleDisAbled"
      >停用</el-button>
      <!-- 导出按钮 开始 -->
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_BIN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_BIN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnShowStatus.hidenExport"
        v-permission="'P_BIN:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
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
        v-if="settings.exportModel"
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
        prop="warehouse_name"
        label="所属仓库"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="location_name"
        label="所属库区"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="name"
        label="库位名称"
      />
      <el-table-column
        :auto-fit="true"
        min-width="80"
        align="left"
        prop="enable"
        label="状态"
      >
        <template v-slot="scope">
          <span
            :style="{
              color: scope.row.enable ? '#67C23A' : '#F56C6C',
              fontWeight: 'bold',
              cursor: 'pointer'
            }"
            :title="scope.row.enable ? '点击停用' : '点击启用'"
            @click="handleEnableDisableRow(scope.row)"
          >
            {{ scope.row.enable ? '启用' : '停用' }}
          </span>
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

    <!-- 新增对话框 -->
    <new-dialog
      v-if="popSettings.new.visible"
      :visible="popSettings.new.visible"
      :data="popSettings.new.data"
      @closeMeOk="handleNewDialogOk"
      @closeMeCancel="handleNewDialogCancel"
    />

    <!-- 编辑对话框 -->
    <edit-dialog
      v-if="popSettings.edit.visible"
      :visible="popSettings.edit.visible"
      :data="popSettings.edit.data"
      @closeMeOk="handleEditDialogOk"
      @closeMeCancel="handleEditDialogCancel"
    />

    <!-- 查看对话框 -->
    <view-dialog
      v-if="popSettings.view.visible"
      :visible="popSettings.view.visible"
      :data="popSettings.view.data"
      @closeMeOk="handleViewDialogOk"
      @closeMeCancel="handleViewDialogCancel"
    />

    <!--    vue-tour组件-->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />
  </div>
</template>

<style scoped>
.el-form-item .el-select {
  width: 100%;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
.el-button-group {
  margin-bottom: 10px;
}
</style>
<style >
.el-input-group__append_select,
.el-input-group__append {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
.el-input-group__append_reset {
  color: #ffffff;
  background-color: #f56c6c;
  border-color: #f56c6c;
}
</style>

<script>
import { getListApi, enabledSelectionApi, disAbledSelectionApi, exportAllApi, exportApi, deleteApi } from '@/api/30_wms/bin/bin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import newDialog from '@/views/30_wms/bin/dialog/20_new'
import editDialog from '@/views/30_wms/bin/dialog/30_edit'
import viewDialog from '@/views/30_wms/bin/dialog/40_view'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令

export default {
  name: 'BinList',
  components: { Pagination, newDialog, editDialog, viewDialog },
  directives: { elDragDialog, permission },
  data () {
    return {
      searchsetting: {
        visible: true
      },
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '',
          config_key: '',
          warehouse_name: '',
          enable: '',
          ids: []
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            config_key: 20,
            value: 50,
            descr: 200
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式（控制多选框显示）
        exportModel: false,
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false,
          showEnable: false,
          showDisable: false,
          showDel: false,
          hidenExport: true
        },
        // loading 状态
        loading: true,
        duration: 4000
      },
      popSettings: {
        // 新增对话框
        new: {
          visible: false,
          data: null
        },
        // 编辑对话框
        edit: {
          visible: false,
          data: null
        },
        // 查看对话框
        view: {
          visible: false,
          data: null
        }
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
  computed: {
  },
  // 监听器
  watch: {
    // 多选数据监听（仅用于导出按钮控制）
    'dataJson.multipleSelection': {
      handler (newVal, oldVal) {
        // 导出按钮基于多选状态控制
        this.settings.btnShowStatus.showExport = newVal.length > 0
      }
    }
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code

    // 初始化查询
    this.getDataList()
  },
  mounted () {
    // 标准化：使用canvas-auto-height，无需手动高度计算和resize监听
  },
  methods: {
    initShow () {
      // 初始化查询
      this.getDataList()
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
    // 行双点击
    handleRowDbClick (row) {
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
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
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

    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },

    // 点击按钮 新增
    handleInsert () {
      // 新增
      this.popSettings.new.visible = true
      this.popSettings.new.data = null
    },

    // 点击按钮 复制新增
    handleCopyInsert () {
      // 复制新增 - 使用新增对话框但传递复制数据
      this.popSettings.new.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.new.visible = true
    },
    // 点击按钮 更新
    handleUpdate () {
      if (this.dataJson.currentJson === null || this.dataJson.currentJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 更新
      this.popSettings.edit.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.edit.visible = true
    },
    // 查看按钮
    handleView () {
      if (this.dataJson.currentJson === null || this.dataJson.currentJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 查看
      this.popSettings.view.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.view.visible = true
    },
    // 统一的启用/停用操作处理方法（基于单行选择）
    handleEnableDisableOperation ({
      action, // 'enable' | 'disable'
      row = null // 单行操作时传入行数据，否则使用当前行
    }) {
      // 确定操作的行数据
      const targetRow = row || this.dataJson.currentJson

      // 检查是否有选中的行
      if (!targetRow || !targetRow.id) {
        const actionText = action === 'enable' ? '启用' : '停用'
        this.$alert(`请在表格中选择数据进行${actionText}`, '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }

      // 构建确认消息和API调用
      const confirmMessage = action === 'enable' ? '是否要启用该条数据？' : '是否要停用该条数据？'
      const apiCall = action === 'enable' ? enabledSelectionApi : disAbledSelectionApi
      const successTitle = action === 'enable' ? '启用成功' : '停用成功'
      const failureTitle = action === 'enable' ? '启用失败' : '停用失败'

      // 显示确认对话框
      this.$confirm(confirmMessage, '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 构建请求数据（单行操作）
        const selectionJson = [{ 'id': targetRow.id }]

        // 执行API调用
        this.settings.loading = true
        apiCall(selectionJson).then((_data) => {
          this.$notify({
            title: successTitle,
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
          this.getDataList()
        }, (_error) => {
          this.$notify({
            title: failureTitle,
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          this.settings.loading = false
        })
      })
    },

    // 启用选中项
    handleEnabled () {
      this.handleEnableDisableOperation({ action: 'enable' })
    },

    // 停用选中项
    handleDisAbled () {
      this.handleEnableDisableOperation({ action: 'disable' })
    },

    // 启用/停用单行
    handleEnableDisableRow (row) {
      const action = row.enable ? 'disable' : 'enable'
      this.handleEnableDisableOperation({ action, row })
    },
    // ------------------编辑弹出框 start--------------------
    // 新增对话框回调
    handleNewDialogOk (val) {
      this.doInsertModelCallBack(val)
    },
    handleNewDialogCancel () {
      this.popSettings.new.visible = false
    },
    // 编辑对话框回调
    handleEditDialogOk (val) {
      this.doUpdateModelCallBack(val)
    },
    handleEditDialogCancel () {
      this.popSettings.edit.visible = false
    },
    // 查看对话框回调
    handleViewDialogOk (val) {
      // 查看模式不需要处理数据更新
      this.popSettings.view.visible = false
    },
    handleViewDialogCancel () {
      this.popSettings.view.visible = false
    },
    // 处理插入回调
    doInsertModelCallBack (val) {
      if (val.return_flag) {
        this.popSettings.new.visible = false

        // 设置到table中绑定的json数据源
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
    // 处理更新回调
    doUpdateModelCallBack (val) {
      if (val.return_flag) {
        this.popSettings.edit.visible = false

        // 设置到table中绑定的json数据源
        this.dataJson.listData.splice(this.dataJson.rowIndex, 1, val.data.data)
        // 设置到currentjson中
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
    // ------------------编辑弹出框 end--------------------
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        // 基础按钮状态
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showDel = true

        // 智能按钮控制：根据当前行的启用状态控制启用/停用按钮
        if (row.enable) {
          // 当前行是启用状态，显示停用按钮，隐藏启用按钮
          this.settings.btnShowStatus.showEnable = false
          this.settings.btnShowStatus.showDisable = true
        } else {
          // 当前行是停用状态，显示启用按钮，隐藏停用按钮
          this.settings.btnShowStatus.showEnable = true
          this.settings.btnShowStatus.showDisable = false
        }
      } else {
        // 未选择任何行时的状态
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showEnable = false
        this.settings.btnShowStatus.showDisable = false
        this.settings.btnShowStatus.showDel = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },
    // 导出按钮
    handleExport () {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnStatus.showExport = false
        })
      } else if (this.dataJson.multipleSelection.length === this.dataJson.listData.length) {
        // 选择全部的时候
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全数据导出',
          cancelButtonText: '当前页数据导出'
        }).then(() => {
          this.handleExportAllData()
        }).catch(action => {
          // 右上角X
          if (action !== 'close') {
            // 当前页所选择的数据导出
            this.handleExportSelectionData()
          }
        })
      } else {
        // 部分数据导出
        this.handleExportSelectionData()
      }
    },
    // 全部数据导出
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出 - 使用全部导出API
      exportAllApi(this.dataJson.searchForm).then(response => {
        this.settings.loading = false
      })
    },
    // 部分数据导出
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push(value.id)
      })
      this.dataJson.searchForm.ids = selectionJson
      // 开始导出
      exportApi(this.dataJson.searchForm).then(response => {
        this.settings.loading = false
      })
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
     * 完成导出，退出导出模式
     */
    handleExportOk () {
      this.settings.btnShowStatus.hidenExport = true
      this.settings.btnShowStatus.showExport = false
      this.settings.exportModel = false
      // 清空已选择的数据，确保完全退出导出模式
      this.$refs.multipleTable.clearSelection()
    },

    // 删除按钮操作
    handleDelButton () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$notify({
          title: '操作提示',
          message: '请先选择要删除的数据',
          type: 'warning',
          duration: this.settings.duration
        })
        return
      }
      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.settings.loading = true
        const selectionJson = { 'id': this.dataJson.currentJson.id }
        deleteApi(selectionJson).then((_data) => {
          this.$notify({
            title: '删除成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
          this.handleSearch()
        }, (_error) => {
          this.$notify({
            title: '删除失败',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          this.settings.loading = false
        })
      }).catch(action => {
      })
    }
  }
}
</script>
