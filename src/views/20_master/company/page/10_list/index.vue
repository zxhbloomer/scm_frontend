<template>
  <div>
    <FloatMenu />
    <!-- 查询表单 -->
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="right"
    >
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="企业名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.code"
          clearable
          placeholder="企业编号"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.company_no"
          clearable
          placeholder="社会信用代码"
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

    <!-- 操作按钮 -->
    <el-button-group>
      <!-- 列表页面不可新增，需要在组织机构管理页面中进行新增 -->
      <!-- <el-button
        v-permission="'P_COMPANY:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button> -->
      <el-button
        v-permission="'P_COMPANY:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        v-permission="'P_COMPANY:COPY_INSERT'"
        :disabled="!settings.btnShowStatus.showCopyInsert"
        type="primary"
        icon="el-icon-camera-solid"
        :loading="settings.loading"
        @click="handleCopyInsert"
      >复制新增</el-button>
      <el-button
        v-permission="'P_COMPANY:EXPORT'"
        :disabled="!settings.btnShowStatus.showExport"
        type="primary"
        icon="el-icon-s-management"
        :loading="settings.loading"
        @click="handleExport"
      >导出</el-button>
      <el-button
        v-permission="'P_COMPANY:INFO'"
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
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        header-align="center"
        type="selection"
        width="45"
        prop="id"
      />
      <el-table-column
        header-align="center"
        type="index"
        width="45"
        label="No"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="180"
        :sort-orders="settings.sortOrders"
        prop="group_full_simple_name"
        label="集团信息"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="code"
        label="企业编号"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="company_no"
        label="社会信用代码"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="企业名称"
      />
      <el-table-column
        header-align="center"
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="simple_name"
        label="企业简称"
        :auto-fit="true"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="juridical_name"
        label="法定代表人"
      />
      <el-table-column
        header-align="center"
        align="right"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="register_capital"
        label="注册资本（万）"
      >
        <template v-slot="scope">
          {{ formatCurrency(scope.row.register_capital,'true',4) }}
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="130"
        :sort-orders="settings.sortOrders"
        prop="type_name"
        label="企业类型"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="setup_date"
        label="成立日期"
      >
        <template v-slot="scope">
          {{ formatDate(scope.row.setup_date) }}
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        min-width="150"
        prop="descr"
        label="说明"
      />
      <el-table-column
        header-align="center"
        min-width="80"
        :sort-orders="settings.sortOrders"
        label="删除"
      >
        <template v-slot:header>
          <span>
            删除
            <el-tooltip
              class="item"
              effect="dark"
              placement="bottom"
            >
              <div slot="content">
                删除状态提示：<br>
                绿色：未删除 <br>
                红色：已删除
              </div>
              <svg-icon
                icon-class="perfect-icon-question1_btn"
                style="margin-left: 5px"
              />
            </el-tooltip>
          </span>
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
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        :auto-fit="true"
        sortable="custom"
        min-width="100"
        :sort-orders="settings.sortOrders"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
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
  </div>
</template>

<script>
import constants_program from '@/common/constants/constants_program'
import { EventBus } from '@/common/eventbus/eventbus'
import { getListApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/20_master/company/company'
import Pagination from '@/components/Pagination'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import FloatMenu from '@/components/FloatMenu/index.vue'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令

export default {
  name: constants_program.P_COMPANY, // 页面id，和router中的name需要一致，作为缓存
  components: {
    Pagination,
    DeleteTypeNormal,
    NewDialog,
    EditDialog,
    ViewDialog,
    FloatMenu
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
          company_no: '',
          is_del: '0' // 未删除
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
    // 描绘完成
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
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },
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
    // 点击按钮 新增
    handleInsert () {
      this.dialogs.new = true
    },
    // 点击按钮 更新
    handleUpdate () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.dialogs.edit = true
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
    // 查看
    handleView () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.dialogs.view = true
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
        this.settings.loading = false
      })
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
    // 新增弹窗回调
    handleNewDialogOk (val) {
      if (val.return_flag) {
        this.dialogs.new = false
        // 设置到table中绑定的json数据源
        this.dataJson.listData.unshift(val.data.data)

        // 通知组织机构树刷新（按照现有架构逻辑）
        EventBus.$emit(this.EMITS.EMIT_ORG_LEFT)

        // 设置新增的数据为当前选中数据（按照group页面逻辑）
        this.dataJson.currentJson = deepCopy(val.data.data)

        // 更新按钮状态，使修改和复制新增按钮可用
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true

        this.$notify({
          title: '新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })

        // 新增成功后关闭整个选择弹窗并返回新增的数据（按照group页面逻辑）
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
.el-table ::v-deep.cell {
  white-space: nowrap;
  width: fit-content;
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
.perfect_popper .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>
<style >
.el-input-group__append_select {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}
.el-input-group__append_reset {
  color: #ffffff;
  background-color: #f56c6c;
  border-color: #f56c6c;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>
