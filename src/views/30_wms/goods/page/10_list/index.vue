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
      <el-form-item label="">
        <el-select
          v-model="dataJson.searchForm.enable"
          placeholder="启用状态"
          clearable
        >
          <el-option
            v-for="item in dataJson.enableList"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
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
        v-permission="'P_GOODS:DELETE'"
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDelButton"
      >删除</el-button>
      <el-button
        v-permission="'P_GOODS:INFO'"
        :disabled="!settings.btnShowStatus.showView"
        type="primary"
        icon="el-icon-info"
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
      <!-- 导出按钮 开始 -->
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_GOODS:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_GOODS:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnShowStatus.hidenExport"
        v-permission="'P_GOODS:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <!-- 导出按钮 结束 -->
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
      :visible.sync="popSettings.view.visible"
      :data="popSettings.view.data"
      @closeMeCancel="handleViewDialogCancel"
    />

    <!-- 用户引导 -->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />
  </div>
</template>

<script>
import { getListApi, enabledSelectionApi, disAbledSelectionApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/30_wms/goods/goods'
import Pagination from '@/components/Pagination'
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js'

export default {
  name: 'GoodsList',
  components: {
    Pagination,
    NewDialog,
    EditDialog,
    ViewDialog
  },
  directives: { permission },
  props: {
  },
  data () {
    return {
      dataJson: {
        // 查询表单
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          category_name: '',
          name: '',
          enable: true
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
        multipleSelection: [],
        // 启用状态选项
        enableList: [
          { id: true, value: '启用' },
          { id: false, value: '停用' }
        ]
      },
      // 页面设置
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式
        exportModel: false,
        // 按钮显示状态
        btnShowStatus: {
          showUpdate: false,
          showView: false,
          showEnable: false,
          showDisable: false,
          showExport: false,
          showDel: false,
          hidenExport: true
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
      },
      // Vue Tour 用户引导配置
      tourOption: {
        useKeyboardNavigation: false, // 是否通过键盘的←, → 和 ESC 控制指引
        labels: { // 指引项的按钮文案
          buttonStop: '结束' // 结束文案
        }
      },
      steps: [
        {
          target: '.el-table-column--selection', // 当前项的id或class或data-v-step属性
          content: '请通过点击多选框，选择要导出的物料数据！', // 当前项指引内容
          params: {
            placement: 'top', // 指引在target的位置，支持上、下、左、右
            highlight: false, // 当前项激活时是否高亮显示
            enableScrolling: false // 指引到当前项时是否滚动轴滚动到改项位置
          }
        }
      ]
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
      // 确保enable默认值为启用状态
      this.dataJson.searchForm.enable = true
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
    },

    // 当前行变化
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showDel = true
        this.settings.btnShowStatus.showView = true
        this.settings.btnShowStatus.showExport = true

        // 智能控制启用/停用按钮：根据当前行状态决定哪个按钮可用
        if (row.enable) {
          // 当前行已启用，只能点击"停用"按钮
          this.settings.btnShowStatus.showEnable = false
          this.settings.btnShowStatus.showDisable = true
        } else {
          // 当前行已停用，只能点击"启用"按钮
          this.settings.btnShowStatus.showEnable = true
          this.settings.btnShowStatus.showDisable = false
        }
      } else {
        // 处理null行的情况（表格排序、数据清空等）
        this.dataJson.currentJson = {}
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showDel = false
        this.settings.btnShowStatus.showView = false
        this.settings.btnShowStatus.showExport = false
        this.settings.btnShowStatus.showEnable = false
        this.settings.btnShowStatus.showDisable = false
        this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      }
      // 设置dialog的返回数据
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },

    // 选择变化
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
      // 保存多选数据，删除按钮状态由行选中事件控制
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

    // 查看
    handleView () {
      if (this.dataJson.currentJson === null || this.dataJson.currentJson.id === undefined) {
        this.$alert('请在表格中选择数据进行查看', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }
      this.popSettings.view.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.view.visible = true
    },

    // 启用按钮
    handleEnabled () {
      // 检查是否有选中的当前行
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$alert('请先选择一条数据进行启用操作', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }

      // 单条启用操作
      this.handleEnabledSingleData()
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
      // 检查是否有选中的当前行
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$alert('请先选择一条数据进行停用操作', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }

      // 单条停用操作
      this.handleDisAbledSingleData()
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

    // 单条数据启用
    handleEnabledSingleData () {
      const row = this.dataJson.currentJson
      const selectionJson = [{ id: row.id }]

      this.$confirm('是否要启用该条数据？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.settings.loading = true
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
      })
    },

    // 单条数据停用
    handleDisAbledSingleData () {
      const row = this.dataJson.currentJson
      const selectionJson = [{ id: row.id }]

      this.$confirm('是否要停用该条数据？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.settings.loading = true
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
      })
    },

    // 导出按钮（导出模式下）
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
    // 全部数据导出 - 与类别管理完全一致
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
        this.downloadExcelFile(response, '物料信息全部导出')
        this.$notify({
          title: '导出成功',
          message: '物料数据已成功导出到Excel文件',
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
    // 选中行数据导出（多选模式）
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      // 多选模式：构造选中行ID数组
      const selectionIds = this.dataJson.multipleSelection.map(item => item.id)
      const searchData = { ids: selectionIds }
      // 开始导出
      exportSelectionApi(searchData).then(response => {
        this.downloadExcelFile(response, `物料信息选中导出_${selectionIds.length}条`)
        this.$notify({
          title: '导出成功',
          message: `已成功导出${selectionIds.length}条物料数据到Excel文件`,
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

    // 文件下载处理方法
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
    },

    /**
     * 切换到导出模式
     */
    handleModelOpen () {
      this.settings.exportModel = true
      this.settings.btnShowStatus.hidenExport = false
      // 启动用户引导
      this.$tours['myTour'].start()
    },

    /**
     * 完成导出
     */
    handleExportOk () {
      this.settings.btnShowStatus.hidenExport = true
      this.settings.btnShowStatus.showExport = false
      this.settings.exportModel = false
      // 清空已选择的数据，确保完全退出导出模式
      this.$refs.multipleTable.clearSelection()
    },

    /**
     * 删除按钮点击处理
     */
    handleDelButton () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$notify({
          title: '操作提示',
          message: '请先选择要删除的物料记录',
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
        // 构造与类别管理一致的请求参数
        const searchCondition = {
          id: this.dataJson.currentJson.id
        }

        deleteApi(searchCondition).then((_data) => {
          this.$notify({
            title: '删除成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
          this.handleSearch() // 与类别管理保持一致
        }).catch((_error) => {
          this.$notify({
            title: '删除失败',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          this.settings.loading = false
        })
      }).catch(() => {
        this.$notify({
          title: '操作提示',
          message: '已取消删除',
          type: 'info',
          duration: this.settings.duration
        })
      })
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
