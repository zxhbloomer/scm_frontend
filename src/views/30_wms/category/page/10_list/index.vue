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
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="类别名称"
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
    <el-button-group v-if="searchsetting.visible">
      <el-button
        v-permission="'P_CATEGORY:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_CATEGORY:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        v-permission="'P_CATEGORY:DELETE'"
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDelButton"
      >删除</el-button>
      <el-button
        v-permission="'P_CATEGORY:INFO'"
        :disabled="!settings.btnShowStatus.showView"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
      <el-button
        v-permission="'P_CATEGORY:ENABLE'"
        :disabled="!settings.btnShowStatus.showEnable"
        type="primary"
        icon="el-icon-circle-check"
        :loading="settings.loading"
        @click="handleEnabled"
      >启用</el-button>
      <el-button
        v-permission="'P_CATEGORY:DISABLE'"
        :disabled="!settings.btnShowStatus.showDisable"
        type="primary"
        icon="el-icon-circle-close"
        :loading="settings.loading"
        @click="handleDisAbled"
      >停用</el-button>
      <!-- 导出按钮 开始 -->
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_CATEGORY:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_CATEGORY:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnShowStatus.hidenExport"
        v-permission="'P_CATEGORY:EXPORT'"
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
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @row-dblclick="handleRowDbClick"
      @selection-change="handleSelectionChange"
    >
      <!-- 多选框列 -->
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
        align="center"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="name"
        label="类别名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="code"
        label="类别编号"
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
      :visible="popSettings.view.visible"
      :data="popSettings.view.data"
      @closeMeCancel="handleViewDialogCancel"
    />

    <!--    vue-tour组件-->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />

    <iframe
      id="refIframe"
      ref="refIframe"
      scrolling="no"
      frameborder="0"
      style="display:none"
      name="refIframe"
    >x</iframe>

  </div>
</template>

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
.el-button-group {
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
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
import { getListApi, enabledSelectionApi, disAbledSelectionApi, enableOrDisAbleApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/30_wms/category/category'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令
import FieldHelp from '@/components/30_table/FieldHelp/index.vue'
import FloatMenu from '@/components/FloatMenu/index.vue'

export default {
  components: { Pagination, NewDialog, EditDialog, ViewDialog, FieldHelp, FloatMenu },
  directives: { elDragDialog, permission },
  props: {
    data: {
      type: Object,
      default: null
    }
  },
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
          config_key: ''
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
      popSettingsData: {
        dialogFormVisible: false
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false,
          showDel: false,
          showView: false,
          showEnable: false,
          showDisable: false,
          hidenExport: true
        },
        // 导出模式
        exportModel: false,
        // loading 状态
        loading: true,
        duration: 4000
      },
      popSettings: {
        // 新增弹窗
        new: {
          visible: false,
          copyData: null
        },
        // 编辑弹窗
        edit: {
          visible: false,
          data: {}
        },
        // 查看弹窗
        view: {
          visible: false,
          data: {}
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
  // 监听器
  watch: {
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code

    // 初始化查询
    this.getDataList()
    // 数据初始化
    this.dataJson.tempJson = this.$options.data.call(this).dataJson.tempJson
  },
  methods: {
    // 获取标签位置 - 与仓库管理一致
    getLabelPosition () {
      return 'right'
    },

    initShow () {
      // 初始化查询
      this.getDataList()
    },
    // 弹出框设置初始化
    initDialogStatus () {
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
    // 行双点击，仅在dialog中有效
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      var _data = deepCopy(row)
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
      this.popSettings.new.copyData = null
      this.popSettings.new.visible = true
    },

    // 点击按钮 复制新增
    handleCopyInsert () {
      // 复制新增
      this.popSettings.new.copyData = Object.assign({}, this.dataJson.currentJson)
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
    // 查看
    handleView () {
      if (this.dataJson.currentJson === null || this.dataJson.currentJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.view.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.view.visible = true
    },
    // 启用选中项 - 与仓库管理一致的单选模式
    handleEnabled () {
      // 参数验证：检查是否选中了行
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$alert('请在表格中选择数据进行启用', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }

      // 确认对话框
      this.$confirm('是否要启用选中的数据？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 构造单行ID参数数组（参考现有标准模式）
        const selectionJson = [{ id: this.dataJson.currentJson.id }]

        // 设置加载状态
        this.settings.loading = true

        // 调用启用API
        enabledSelectionApi(selectionJson).then(response => {
          // 成功通知
          this.$notify({
            title: '启用成功',
            message: response.message,
            type: 'success',
            duration: this.settings.duration
          })
          // 刷新列表数据
          this.getDataList()
        }).catch(error => {
          // 失败通知
          this.$notify({
            title: '启用失败',
            message: error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          // 清除加载状态
          this.settings.loading = false
        })
      }).catch(() => {
        // 用户取消操作，无需处理
      })
    },

    // 停用选中项 - 与仓库管理一致的单选模式
    handleDisAbled () {
      // 参数验证：检查是否选中了行
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$alert('请在表格中选择数据进行停用', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }

      // 确认对话框
      this.$confirm('是否要停用选中的数据？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 构造单行ID参数数组（参考现有标准模式）
        const selectionJson = [{ id: this.dataJson.currentJson.id }]

        // 设置加载状态
        this.settings.loading = true

        // 调用停用API
        disAbledSelectionApi(selectionJson).then(response => {
          // 成功通知
          this.$notify({
            title: '停用成功',
            message: response.message,
            type: 'success',
            duration: this.settings.duration
          })
          // 刷新列表数据
          this.getDataList()
        }).catch(error => {
          // 失败通知
          this.$notify({
            title: '停用失败',
            message: error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          // 清除加载状态
          this.settings.loading = false
        })
      }).catch(() => {
        // 用户取消操作，无需处理
      })
    },
    // ------------------编辑弹出框 start--------------------
    // 新增弹窗回调
    handleNewDialogOk (val) {
      this.doInsertModelCallBack(val)
    },
    handleNewDialogCancel () {
      this.popSettings.new.visible = false
      this.popSettings.new.copyData = null
    },
    // 编辑弹窗回调
    handleEditDialogOk (val) {
      this.doUpdateModelCallBack(val)
    },
    handleEditDialogCancel () {
      this.popSettings.edit.visible = false
    },
    // 查看弹窗回调
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
    // 启用/停用
    handledEnableOrDisAbleApi (row) {
      let _message = ''
      const _value = row.enable
      const selectionJson = []
      selectionJson.push({ 'id': row.id })
      if (_value === true) {
        _message = '是否要启用该条数据？'
      } else {
        _message = '是否要停用该条数据？'
      }
      // 选择全部的时候
      this.$confirm(_message, '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // loading
        this.settings.loading = true
        enableOrDisAbleApi(selectionJson).then((_data) => {
          this.$notify({
            title: '更新处理成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
        }, (_error) => {
          this.$notify({
            title: '更新处理失败',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
          row.enable = !row.enable
        }).finally(() => {
          this.popSettingsData.dialogFormVisible = false
          this.settings.loading = false
        })
      }).catch(action => {
        row.enable = !row.enable
      })
    },
    handleCurrentChange (row) {
      if (row === null || row === undefined) {
        // 处理null行的情况（表格排序、数据清空等）
        this.dataJson.currentJson = {}
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showDel = false
        this.settings.btnShowStatus.showView = false
        this.settings.btnShowStatus.showExport = false
        this.settings.btnShowStatus.showEnable = false
        this.settings.btnShowStatus.showDisable = false
        this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
        return
      }

      this.dataJson.currentJson = Object.assign({}, row) // copy obj
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
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showDel = false
        this.settings.btnShowStatus.showView = false
        this.settings.btnShowStatus.showEnable = false
        this.settings.btnShowStatus.showDisable = false
        this.settings.btnShowStatus.showExport = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
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
      }).catch(() => {
        // 取消删除
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
     * 完成导出
     */
    handleExportOk () {
      this.settings.btnShowStatus.hidenExport = true
      this.settings.btnShowStatus.showExport = false
      this.settings.exportModel = false
      // 清空已选择的数据，确保完全退出导出模式
      this.$refs.multipleTable.clearSelection()
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
    // 全部数据导出 - 与仓库管理完全一致
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
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
      }).finally(() => {
        this.settings.loading = false
      })
    }
  }
}
</script>
