<template>
  <div>
    <FloatMenu />
    <!-- ======================== 搜索区域 ======================== -->
    <div v-show="searchsetting.visible">
      <el-form
        ref="minusForm"
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
      >
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.name"
            clearable
            placeholder="规格名称"
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
    </div>

    <!-- ======================== 按钮工具栏 ======================== -->
    <el-button-group>
      <el-button
        v-permission="'P_SPEC:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>

      <el-button
        v-permission="'P_SPEC:UPDATE'"
        type="primary"
        icon="el-icon-edit-outline"
        :disabled="!settings.btnShowStatus.showUpdate"
        :loading="settings.loading"
        @click="handleUpdate"
      >编辑</el-button>

      <el-button
        v-permission="'P_SPEC:COPY'"
        type="primary"
        icon="el-icon-copy-document"
        :disabled="!settings.btnShowStatus.showCopyInsert"
        :loading="settings.loading"
        @click="handleCopyInsert"
      >复制新增</el-button>

      <el-button
        v-permission="'P_SPEC:INFO'"
        type="primary"
        icon="el-icon-info"
        :disabled="!settings.btnShowStatus.showView"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>

      <el-button
        v-permission="'P_SPEC:ENABLE'"
        type="primary"
        icon="el-icon-circle-check"
        :disabled="!settings.btnShowStatus.showEnable"
        :loading="settings.loading"
        @click="handleEnabled"
      >启用</el-button>

      <el-button
        v-permission="'P_SPEC:DISABLE'"
        type="primary"
        icon="el-icon-circle-close"
        :disabled="!settings.btnShowStatus.showDisable"
        :loading="settings.loading"
        @click="handleDisabled"
      >停用</el-button>

      <el-button
        v-permission="'P_SPEC:DELETE'"
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDelButton"
      >删除</el-button>

      <!-- 导出按钮 开始 - 完全按照物料管理模式实现 -->
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_SPEC:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_SPEC:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnShowStatus.hidenExport"
        v-permission="'P_SPEC:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <!-- 导出按钮 结束 -->

      <el-button
        v-permission="'P_SPEC:UNIT'"
        type="primary"
        icon="el-icon-s-operation"
        :loading="settings.loading"
        @click="handleUnit"
      >单位换算</el-button>
    </el-button-group>
    <div style="padding-top: 10px" />
    <!-- ======================== 数据表格 ======================== -->
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
      <!-- 多选列 - 完全按照仓库管理模式实现 -->
      <el-table-column
        v-if="settings.exportModel"
        type="selection"
        width="45"
        prop="id"
      />

      <!-- 序号列 -->
      <el-table-column
        type="index"
        width="45"
        label="No"
        prop="No"
      />

      <!-- 业务数据列 -->

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="category_name"
        label="所属类别"
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
        prop="prop_name"
        label="商品属性"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="spec"
        label="规格"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="sku_code"
        align="center"
        label="规格编号"
      />

      <el-table-column
        :auto-fit="true"
        min-width="80"
        align="left"
        prop="enable"
        label="状态"
      >
        <template slot-scope="{row}">
          <span
            :style="{
              color: row.enable ? '#67C23A' : '#F56C6C',
              fontWeight: 'bold'
            }"
          >
            {{ row.enable ? '启用' : '停用' }}
          </span>
        </template>
      </el-table-column>

      <!-- 系统字段列 -->
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

    <!-- ======================== 分页组件 ======================== -->
    <pagination
      ref="minusPaging"
      :total="dataJson.paging.total"
      :page.sync="dataJson.paging.current"
      :limit.sync="dataJson.paging.size"
      @pagination="getDataList"
    />

    <!-- ======================== 对话框区域 ======================== -->
    <!-- 新增对话框 -->
    <new-dialog
      v-if="popSettings.new.visible"
      :visible="popSettings.new.visible"
      :copy-data="popSettings.new.copyData"
      @closeMeOk="handleNewDialogOk"
      @closeMeCancel="handleNewDialogCancel"
    />

    <!-- 编辑对话框 -->
    <edit-dialog
      v-if="popSettings.edit.visible"
      :data="popSettings.edit.data"
      :visible="popSettings.edit.visible"
      :dialog-status="popSettings.edit.dialogStatus"
      @closeMeOk="handleEditDialogOk"
      @closeMeCancel="handleEditDialogCancel"
    />

    <!-- 查看对话框 -->
    <view-dialog
      v-if="popSettings.view.visible"
      :data="popSettings.view.data"
      :visible="popSettings.view.visible"
      @closeMeOk="handleViewDialogOk"
      @closeMeCancel="handleViewDialogCancel"
    />

    <!-- 单位换算对话框 -->
    <unit-calculator-dialog
      v-if="popSettings.unitCalculator.visible"
      :id="dataJson.currentJson.id"
      :visible="popSettings.unitCalculator.visible"
      :dialog-status="popSettings.unitCalculator.dialogStatus"
      @closeMeOk="handleUnitCalculatorDialogOk"
      @closeMeCancel="handleUnitCalculatorDialogCancel"
    />

    <!-- Vue Tours导出引导组件 - 完全按照物料管理模式实现 -->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />
  </div>
</template>

<script>
import permission from '@/directive/permission/index.js'
import { getListApi, enabledSelectionApi, disAbledSelectionApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/30_wms/spec/spec'
import Pagination from '@/components/Pagination'
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import UnitCalculatorDialog from '../../unit/unitCalculator/unitCalculator'
import FloatMenu from '@/components/FloatMenu/index.vue'
import deepCopy from 'deep-copy'

export default {
  name: 'SpecList',
  components: {
    Pagination,
    NewDialog,
    EditDialog,
    ViewDialog,
    UnitCalculatorDialog,
    FloatMenu
  },
  directives: { permission },
  props: {
    // 自己作为弹出框时的参数
    meDialogStatus: {
      type: Boolean,
      default: false
    },
    dataModel: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // ======================== 搜索设置 ========================
      searchsetting: {
        visible: true
      },

      // ======================== 业务数据 ========================
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '',
          config_key: ''
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

      // ======================== 页面设置 ========================
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式开关 - 完全按照仓库管理模式实现
        exportModel: false,
        // 按钮状态 - 标准化状态管理
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showView: false,
          showEnable: false,
          showDisable: false,
          showExport: false,
          // 导出按钮显示状态：true=单导出按钮，false=三按钮模式
          hidenExport: true
        },
        // loading 状态
        loading: true,
        duration: 4000
      },

      // ======================== 对话框状态 ========================
      popSettings: {
        // 新增对话框
        new: {
          visible: false,
          copyData: null
        },
        // 编辑对话框
        edit: {
          visible: false,
          data: null,
          dialogStatus: ''
        },
        // 查看对话框
        view: {
          visible: false,
          data: null
        },
        // 单位换算对话框
        unitCalculator: {
          visible: false,
          dialogStatus: ''
        }
      },

      // ======================== Vue Tours配置 - 完全按照物料管理模式实现 ========================
      tourOption: {
        useKeyboardNavigation: false, // 是否通过键盘的←, → 和 ESC 控制指引
        labels: { // 指引项的按钮文案
          buttonStop: '结束' // 结束文案
        }
      },
      steps: [
        {
          target: '.el-table-column--selection', // 当前项的id或class或data-v-step属性
          content: '请通过点击多选框，选择要导出的规格数据！', // 当前项指引内容
          params: {
            placement: 'top', // 指引在target的位置，支持上、下、左、右
            highlight: false, // 当前项激活时是否高亮显示
            enableScrolling: false // 指引到当前项时是否滚动轴滚动到改项位置
          }
        }
      ]
    }
  },

  // ======================== 计算属性 ========================
  computed: {
    // 权限常量
    P_SPEC_INSERT () {
      return this.PARAMETERS.P_SPEC + ':insert'
    },
    P_SPEC_UPDATE () {
      return this.PARAMETERS.P_SPEC + ':update'
    },
    P_SPEC_COPY_INSERT () {
      return this.PARAMETERS.P_SPEC + ':copy_insert'
    },
    P_SPEC_VIEW () {
      return this.PARAMETERS.P_SPEC + ':view'
    },
    P_SPEC_ENABLED () {
      return this.PARAMETERS.P_SPEC + ':enabled'
    },
    P_SPEC_DISABLED () {
      return this.PARAMETERS.P_SPEC + ':disabled'
    },
    P_SPEC_EXPORT () {
      return this.PARAMETERS.P_SPEC + ':export'
    },
    P_SPEC_UNIT_CALCULATOR () {
      return this.PARAMETERS.P_SPEC + ':unit_calculator'
    }
  },

  // ======================== 监听器 ========================
  watch: {
    // 选中的数据，使得按钮状态联动
    'dataJson.multipleSelection': {
      handler (newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showEnable = true
          this.settings.btnShowStatus.showDisable = true
          this.settings.btnShowStatus.showExport = true
        } else {
          this.settings.btnShowStatus.showEnable = false
          this.settings.btnShowStatus.showDisable = false
          this.settings.btnShowStatus.showExport = false
        }
      }
    }
  },

  // ======================== 生命周期 ========================
  created () {
    // 初始化查询
    this.getDataList()
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code

    if (this.meDialogStatus) {
      this.searchsetting.visible = false
    }
  },

  mounted () {
    // 描绘完成
  },

  // ======================== 方法集合 ========================
  methods: {
    // -------------------- 基础方法 --------------------
    initShow () {
      this.getDataList()
    },

    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },

    getRowKeys (row) {
      return row.id
    },

    // -------------------- 搜索相关 --------------------
    handleSearch () {
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },

    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },

    // -------------------- 表格相关 --------------------
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },

    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      const _data = deepCopy(row)
      if (this.meDialogStatus) {
        this.$emit('rowDbClick', _data)
      }
    },

    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true
        this.settings.btnShowStatus.showView = true
      } else {
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
        this.settings.btnShowStatus.showView = false
      }

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },

    handleSortChange (column) {
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },

    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },

    // -------------------- 数据获取 --------------------
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

    // -------------------- 按钮操作 --------------------
    // 新增
    handleInsert () {
      this.popSettings.new.visible = true
      this.popSettings.new.copyData = null
    },

    // 复制新增
    handleCopyInsert () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.new.visible = true
      this.popSettings.new.copyData = Object.assign({}, this.dataJson.currentJson)
    },

    // 编辑
    handleUpdate () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.edit.visible = true
      this.popSettings.edit.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.edit.dialogStatus = this.PARAMETERS.STATUS_UPDATE
    },

    // 查看
    handleView () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.view.visible = true
      this.popSettings.view.data = Object.assign({}, this.dataJson.currentJson)
    },

    // 启用
    handleEnabled () {
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行启用', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }
      this.handleEnabledSelectionData()
    },

    handleEnabledSelectionData () {
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push({ 'id': value.id })
      })

      enabledSelectionApi(selectionJson).then((_data) => {
        this.$notify({
          title: '启用成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.getDataList()
      }, (_error) => {
        this.$notify({
          title: '启用错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 停用
    handleDisabled () {
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行停用', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }
      this.handleDisAbledSelectionData()
    },

    handleDisAbledSelectionData () {
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push({ 'id': value.id })
      })

      disAbledSelectionApi(selectionJson).then((_data) => {
        this.$notify({
          title: '停用成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.getDataList()
      }, (_error) => {
        this.$notify({
          title: '停用错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
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
    },

    // 单位换算
    handleUnit () {
      this.popSettings.unitCalculator.visible = true
    },

    // 导出模式相关方法 - 完全按照仓库管理模式实现

    // 进入导出模式
    handleModelOpen () {
      this.settings.exportModel = true
      this.settings.btnShowStatus.hidenExport = false
      // 启动用户引导
      this.$tours['myTour'].start()
    },

    // 退出导出模式
    handleModelClose () {
      this.settings.exportModel = false
      this.settings.btnShowStatus.hidenExport = true
      this.dataJson.multipleSelection = []
    },

    // 智能导出判断方法 - 完全按照物料管理模式实现
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

    // 导出全部数据 - 完全按照物料管理模式实现
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
        this.downloadExcelFile(response, '规格信息全部导出')
        this.$notify({
          title: '导出成功',
          message: '规格数据已成功导出到Excel文件',
          type: 'success',
          duration: this.settings.duration
        })
      }).catch(error => {
        this.$notify({
          title: '导出失败',
          message: error.message || '导出过程中发生错误',
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 选中行数据导出（多选模式）- 完全按照物料管理模式实现
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      // 多选模式：构造选中行ID数组
      const selectionIds = this.dataJson.multipleSelection.map(item => item.id)
      const searchData = { ids: selectionIds }
      // 开始导出
      exportSelectionApi(searchData).then(response => {
        this.downloadExcelFile(response, `规格信息选中导出_${selectionIds.length}条`)
        this.$notify({
          title: '导出成功',
          message: `已成功导出${selectionIds.length}条规格数据到Excel文件`,
          type: 'success',
          duration: this.settings.duration
        })
      }).catch(error => {
        this.$notify({
          title: '导出失败',
          message: error.message || '导出过程中发生错误',
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 标准退出导出模式方法 - 完全按照物料管理模式实现
    handleExportOk () {
      this.settings.btnShowStatus.hidenExport = true
      this.settings.btnShowStatus.showExport = false
      this.settings.exportModel = false
      // 清空已选择的数据，确保完全退出导出模式
      this.$refs.multipleTable.clearSelection()
    },

    // 文件下载处理方法 - 完全按照物料管理模式实现
    downloadExcelFile (response, fileName) {
      try {
        // 创建blob对象
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        // 创建下载链接
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${fileName}_${new Date().getTime()}.xlsx`

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 释放URL对象
        URL.revokeObjectURL(link.href)
      } catch (error) {
        console.error('文件下载失败:', error)
        this.$notify({
          title: '下载失败',
          message: '文件下载过程中发生错误',
          type: 'error',
          duration: this.settings.duration
        })
      }
    },

    // -------------------- 对话框回调 --------------------
    // 新增对话框回调
    handleNewDialogOk (val) {
      this.popSettings.new.visible = false
      if (val.return_flag) {
        // 成功处理
        this.dataJson.listData.unshift(val.data.data)
        this.$notify({
          title: '操作成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        // 失败处理
        this.$notify({
          title: '操作失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },

    handleNewDialogCancel () {
      this.popSettings.new.visible = false
    },

    // 编辑对话框回调
    handleEditDialogOk (val) {
      this.popSettings.edit.visible = false
      if (val.return_flag) {
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

    handleEditDialogCancel () {
      this.popSettings.edit.visible = false
    },

    // 查看对话框回调
    handleViewDialogOk () {
      this.popSettings.view.visible = false
    },

    handleViewDialogCancel () {
      this.popSettings.view.visible = false
    },

    // 单位换算对话框回调
    handleUnitCalculatorDialogOk (val) {
      this.popSettings.unitCalculator.visible = false
      this.getDataList()
    },

    handleUnitCalculatorDialogCancel () {
      this.popSettings.unitCalculator.visible = false
    }

  }
}
</script>

<style scoped>
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>

<style>
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
