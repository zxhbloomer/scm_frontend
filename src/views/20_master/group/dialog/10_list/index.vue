<template>
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="集团选择页面"
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
          placeholder="集团编号"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="集团名称"
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

    <!-- 操作按钮 -->
    <el-button-group>
      <el-button
        v-permission="'P_GROUP:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_GROUP:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <!-- 注释掉复制新增按钮
      <el-button
        v-permission="'P_GROUP:COPY_INSERT'"
        :disabled="!settings.btnShowStatus.showCopyInsert"
        type="primary"
        icon="el-icon-camera-solid"
        :loading="settings.loading"
        @click="handleCopyInsert"
      >复制新增</el-button>
      -->
      <!-- 注释掉导出按钮
      <el-button
        v-permission="'P_GROUP:EXPORT'"
        :disabled="!settings.btnShowStatus.showExport"
        type="primary"
        icon="el-icon-s-management"
        :loading="settings.loading"
        @click="handleExport"
      >导出</el-button>
      -->
      <el-button
        v-permission="'P_GROUP:INFO'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
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
      <!-- 删除多选框列
      <el-table-column
        type="selection"
        width="45"
        prop="id"
      />
      -->
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
        :auto-fit="true"
        sortable="custom"
        min-width="130"
        :sort-orders="settings.sortOrders"
        prop="parent_group_simple_name"
        label="上级集团"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="130"
        :sort-orders="settings.sortOrders"
        prop="code"
        label="集团编号"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="集团名称"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="140"
        :sort-orders="settings.sortOrders"
        prop="simple_name"
        label="集团简称"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="90"
        :sort-orders="settings.sortOrders"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="180"
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
        type="primary"
        :disabled="settings.btnDisabledStatus.disabledOk"
        @click="handleDoOk()"
      >确定</el-button>
      <el-button
        plain
        @click="handleDoCancel()"
      >取消</el-button>
    </div>

    <!-- 新增弹窗 -->
    <new-dialog
      v-if="dialogs.new"
      ref="newDialog"
      :visible="dialogs.new"
      @closeMeOk="handleNewDialogOk"
      @closeMeCancel="handleNewDialogCancel"
    />

    <!-- 编辑弹窗 -->
    <edit-dialog
      v-if="dialogs.edit"
      :visible="dialogs.edit"
      :data="dataJson.currentJson"
      @closeMeOk="handleEditDialogOk"
      @closeMeCancel="handleEditDialogCancel"
    />

    <!-- 查看弹窗 -->
    <view-dialog
      v-if="dialogs.view"
      :visible="dialogs.view"
      :data="dataJson.currentJson"
      @closeMeCancel="handleViewDialogCancel"
    />

    <iframe
      id="refIframe"
      ref="refIframe"
      scrolling="no"
      frameborder="0"
      style="display:none"
      name="refIframe"
    >x</iframe>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import permission from '@/directive/permission/index.js' // 权限判断指令
import { EventBus } from '@/common/eventbus/eventbus'
import { getListApi, exportSelectionApi, exportAllApi } from '@/api/20_master/group/group'
import Pagination from '@/components/Pagination'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import SelectDict from '@/components/00_dict/select/SelectDict'
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import deepCopy from 'deep-copy'

export default {
  name: 'GroupSelectDialog',
  components: {
    Pagination,
    DeleteTypeNormal,
    SelectDict,
    NewDialog,
    EditDialog,
    ViewDialog
  },
  directives: { elDragDialog, permission },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    dataModel: {
      type: String,
      default: '' // 将在data中设置默认值
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
          dataModel: this.dataModel || this.CONSTANTS.DICT_ORG_USED_TYPE_SHOW_UNUSED // 弹出框模式，默认显示未使用组织
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
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false
        },
        // loading 状态
        loading: true,
        duration: 4000
      },
      // 弹窗控制
      dialogs: {
        new: false,
        edit: false,
        view: false
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
        this.settings.btnShowStatus.showCopyInsert = true
      } else {
        this.settings.btnDisabledStatus.disabledOk = true
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
      }
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
        this.$emit('closeMeOk', deepCopy(this.dataJson.currentJson))
      }
    },
    // 取消按钮
    handleDoCancel () {
      this.$emit('closeMeCancel')
    },
    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },
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
    // 点击按钮 新增
    handleInsert () {
      this.dialogs.new = true
    },
    // 点击按钮 复制新增
    handleCopyInsert () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.dialogs.new = true
      // 复制新增时，将当前数据传递给新增弹窗
      this.$nextTick(() => {
        this.$refs.newDialog && this.$refs.newDialog.setCopyData(this.dataJson.currentJson)
      })
    },
    // 点击按钮 更新
    handleUpdate () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.dialogs.edit = true
    },
    // 查看
    handleView () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.dialogs.view = true
    },
    // 新增弹窗回调
    handleNewDialogOk (val) {
      if (val.return_flag) {
        this.dialogs.new = false
        // 设置到table中绑定的json数据源
        this.dataJson.listData.unshift(val.data.data)

        // 通知组织机构树刷新（按照现有架构逻辑）
        EventBus.$emit(this.EMITS.EMIT_ORG_LEFT)

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
    handleNewDialogCancel () {
      this.dialogs.new = false
    },
    // 编辑弹窗回调
    handleEditDialogOk (val) {
      if (val.return_flag) {
        this.dialogs.edit = false
        // 设置到table中绑定的json数据源
        this.dataJson.listData.splice(this.dataJson.rowIndex, 1, val.data.data)
        // 设置到currentjson中
        this.dataJson.currentJson = Object.assign({}, val.data.data)

        // 通知组织机构树刷新（按照现有架构逻辑）
        EventBus.$emit(this.EMITS.EMIT_ORG_LEFT)

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
      this.dialogs.edit = false
    },
    // 查看弹窗回调
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
