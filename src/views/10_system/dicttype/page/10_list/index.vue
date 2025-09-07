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
          v-model.trim="dataJson.searchForm.code"
          clearable
          placeholder="字典类型"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="字典名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <delete-type-normal v-model="dataJson.searchForm.is_del" />
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
    <el-button-group v-show="!meDialogSetting.dialogStatus">
      <el-button
        v-permission="'P_SYSCODE:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_SYSCODE:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        v-permission="'P_SYSCODE:EXPORT'"
        :disabled="!settings.btnShowStatus.showExport"
        type="primary"
        icon="el-icon-s-management"
        :loading="settings.loading"
        @click="handleExport"
      >导出</el-button>
      <el-button
        v-permission="'P_SYSCODE:INFO'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
    </el-button-group>

    <el-button-group v-show="!meDialogSetting.dialogStatus">
      <el-button
        v-permission="'P_SYSCODE:IMPORT'"
        type="primary"
        icon="el-icon-upload"
        @click="handleOpenImportDialog"
      >数据批量导入</el-button>
    </el-button-group>
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
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
      @cell-mouse-enter="handleCellMouseEnter"
      @cell-mouse-leave="handleCellMouseLeave"
    >
      <el-table-column
        v-if="!meDialogSetting.dialogStatus"
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
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="code"
        label="字典类型"
        column-key="columnCode"
      >
        <template v-slot="scope">
          <el-link
            v-if="!meDialogSetting.dialogStatus"
            type="primary"
            :href="'#/sys/dic/dictdata?dictTypeCode=' + scope.row.code"
          >{{ scope.row.code }}
            <svg-icon
              v-show="scope.row.columnTypeShowIcon"
              icon-class="perfect-icon-eye-open1"
              class="el-icon--right"
            />
          </el-link>
          <span v-if="meDialogSetting.dialogStatus"> {{ scope.row.code }} </span>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="80"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="字典名称"
        column-key="columnName"
      >
        <template v-slot="scope">
          <el-link
            v-if="!meDialogSetting.dialogStatus"
            type="primary"
            :href="'#/sys/dic/dictdata?dictTypeName=' + scope.row.name"
          >{{ scope.row.name }}
            <svg-icon
              v-show="scope.row.columnNameShowIcon"
              icon-class="perfect-icon-eye-open1"
              class="el-icon--right"
            />
          </el-link>
          <span v-if="meDialogSetting.dialogStatus"> {{ scope.row.name }} </span>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        min-width="150"
        prop="descr"
        label="说明"
      />
      <el-table-column
        min-width="45"
        :sort-orders="settings.sortOrders"
        prop="is_del"
        align="center"
      >
        <template v-slot:header>
          <FieldHelp
            default-label="删除状态"
            help="删除状态提示：<br />绿色：未删除<br />红色：已删除"
            placement="bottom"
          />
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
              :disabled="meDialogSetting.dialogStatus"
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        min-width="180"
        :sort-orders="settings.sortOrders"
        show-overflow-tooltip
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
      :data="popSettings.new.data"
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

    <!-- 批量导入弹窗 -->
    <import-dialog
      v-if="popSettings.import.visible"
      :visible="popSettings.import.visible"
      @closeMeOk="handleImportDialogOk"
      @closeMeCancel="handleImportDialogCancel"
    />

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

<script>
import constants_program from '@/common/constants/constants_program'
import { getListApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/10_system/dicttype/dicttype'
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'
import Pagination from '@/components/Pagination'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import FieldHelp from '@/components/30_table/FieldHelp'
import FloatMenu from '@/components/FloatMenu/index.vue'
// 弹窗组件
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import ImportDialog from '../../dialog/50_import/index.vue'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令

export default {
  name: constants_program.P_DICTTYPE, // 页面id，和router中的name需要一致，作为缓存
  components: {
    Pagination,
    DeleteTypeNormal,
    FieldHelp,
    FloatMenu,
    NewDialog,
    EditDialog,
    ViewDialog,
    ImportDialog
  },
  directives: { permission },
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
          is_del: 'null',
          isenable: ''
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          code: '',
          descr: '',
          dbversion: 0
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200,
            dbversion: 0
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
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false
        },
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      },
      // 标准化的弹窗状态管理
      popSettings: {
        // 新增弹窗
        new: {
          visible: false,
          data: null
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
        },
        // 导入弹窗
        import: {
          visible: false
        }
      },
      meDialogSetting: {
        program: this.$store.getters.program,
        selectedDataJson: this.$store.getters.selectedDataJson,
        dialogStatus: false
      }
    }
  },
  // 监听器
  watch: {
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
  created () {
    // 作为独立页面，通过route路由打开时
    this.$options.name = this.$route.meta.page_code
    this.initShow()
  },
  mounted () {
    this.setUIheight()
    this.$nextTick(() => {
      addResizeListener(window.document.body, this.doResize)
    })
  },
  // 生命周期结束时销毁事件
  destroyed () {
    if (this.resizeListener) removeResizeListener(window.document.body, this.doResize)
  },
  methods: {
    // ========== 标准化方法：集成mixin功能 ==========
    doResize () {
      this.setUIheight()
    },
    setUIheight () {
      try {
        // 定义高度
        const elementHeight = document.documentElement.clientHeight - 85
        // 获取所有的ref，主要判断minus的refs
        const listRefsNames = Object.keys(this.$refs).map((key) => {
          return this.$refs[key]
        })
        let val = 0
        for (let i = 0; i < Object.keys(this.$refs).length; i++) {
          if (Object.keys(this.$refs)[i].indexOf('minus') >= 0) {
            val = val + listRefsNames[i].$el.offsetHeight
          }
        }
        let rtnVal = elementHeight - val - 57

        // 判断是否是弹出框
        if (this.meDialogSetting.dialogStatus) {
          rtnVal = rtnVal - 170
        }
        // 此处使用的是页面上的值
        this.settings.tableHeight = rtnVal
        return rtnVal
      } catch (error) {
        console.log('setUIheight error')
      }
    },

    // ========== 初始化方法 ==========
    initShow () {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
    },
    // 弹出框设置初始化
    initDialogStatus () {
      if (this.$store.getters.program !== undefined &&
        this.$store.getters.program !== null &&
        this.$store.getters.program.status === 'open') {
        this.meDialogSetting.dialogStatus = true
      } else {
        this.meDialogSetting.dialogStatus = false
      }
    },

    // ========== 表格操作方法 ==========
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    // 行点击
    handleRowClick (row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    // 行双点击，仅在dialog中有效
    handleRowDbClick (row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
      if (this.meDialogSetting.dialogStatus) {
        this.$emit('rowDbClick', this.dataJson.tempJson)
      }
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true
      } else {
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
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
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },

    // ========== 搜索相关方法 ==========
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },
    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },

    // ========== 数据获取方法 ==========
    getDataList () {
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.loading = true
      getListApi(this.dataJson.searchForm).then(response => {
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
        const recorders = response.data.records
        const newRecorders = recorders.map(v => {
          return { ...v, columnTypeShowIcon: false, columnNameShowIcon: false }
        })
        this.dataJson.listData = newRecorders
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // ========== 按钮操作方法 ==========
    // 点击按钮 新增
    handleInsert () {
      this.popSettings.new.data = Object.assign({}, this.dataJson.tempJsonOriginal)
      this.popSettings.new.visible = true
    },
    // 点击按钮 更新
    handleUpdate () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.edit.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.edit.visible = true
    },
    // 查看
    handleView () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.view.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.view.visible = true
    },
    // 数据批量导入按钮
    handleOpenImportDialog () {
      this.popSettings.import.visible = true
    },

    // ========== 弹窗回调方法 ==========
    // 新增弹窗回调
    handleNewDialogOk (val) {
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
    handleNewDialogCancel () {
      this.popSettings.new.visible = false
    },
    // 编辑弹窗回调
    handleEditDialogOk (val) {
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
    handleEditDialogCancel () {
      this.popSettings.edit.visible = false
    },
    // 查看弹窗回调
    handleViewDialogCancel () {
      this.popSettings.view.visible = false
    },
    // 导入弹窗回调
    handleImportDialogOk (val) {
      this.popSettings.import.visible = false
      if (val && val.return_flag) {
        // 重新加载数据
        this.getDataList()
      }
    },
    handleImportDialogCancel () {
      this.popSettings.import.visible = false
    },

    // ========== 导出相关方法 ==========
    // 导出按钮
    handleExport () {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnShowStatus.showExport = false
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
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 部分数据导出
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push({ 'id': value.id })
      })
      // 开始导出
      exportSelectionApi(selectionJson).then(response => {
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // ========== 删除相关方法 ==========
    // 删除操作
    handleDel (row) {
      let _message = ''
      const _value = row.is_del
      const selectionJson = []
      selectionJson.push({ 'id': row.id })
      if (_value === true) {
        _message = '是否要删除选择的数据？'
      } else {
        _message = '是否要复原该条数据？'
      }
      // 选择全部的时候
      this.$confirm(_message, '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // loading
        this.settings.loading = true
        deleteApi(selectionJson).then((_data) => {
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
          row.is_del = !row.is_del
        }).finally(() => {
          this.settings.loading = false
        })
      }).catch(action => {
        row.is_del = !row.is_del
      })
    },

    // ========== 表格交互方法 ==========
    /** 当单元格 hover 进入时会触发该事件 */
    handleCellMouseEnter (row, column, cell, event) {
      switch (column.columnKey) {
        case 'columnCode':
          // 字典类型列时
          row.columnTypeShowIcon = true
          break
        case 'columnName':
          // 字典名称列时
          row.columnNameShowIcon = true
          break
      }
    },
    /** 当单元格 hover 退出时会触发该事件 */
    handleCellMouseLeave (row, column, cell, event) {
      switch (column.columnKey) {
        case 'columnCode':
          // 字典类型列时
          row.columnTypeShowIcon = false
          break
        case 'columnName':
          // 字典名称列时
          row.columnNameShowIcon = false
          break
      }
    }
  }
}
</script>
