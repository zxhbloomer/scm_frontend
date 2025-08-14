<template>
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="岗位选择页面"
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
          placeholder="岗位编号"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="岗位名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <delete-type-normal v-model="dataJson.searchForm.is_del" disabled />
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
        v-permission="'P_POSITION:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_POSITION:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        v-permission="'P_POSITION:INFO'"
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
    >
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
        prop="code"
        label="岗位编号"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="岗位名称"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="140"
        :sort-orders="settings.sortOrders"
        prop="simple_name"
        label="岗位简称"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        sortable="custom"
        min-width="90"
        :sort-orders="settings.sortOrders"
        prop="staff_count"
        label="成员数量"
      >
        <template v-slot="scope">
          <span>{{ scope.row.staff_count || 0 }}</span>
        </template>
      </el-table-column>
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
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import permission from '@/directive/permission/index.js'
import { getListApi } from '@/api/20_master/position/position'
import Pagination from '@/components/Pagination'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import NewDialog from '../20_new/index.vue'
import EditDialog from '../30_edit/index.vue'
import ViewDialog from '../40_view/index.vue'
import deepCopy from 'deep-copy'

export default {
  name: 'PositionSelectDialog',
  components: {
    Pagination,
    DeleteTypeNormal,
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
          dataModel: this.dataModel // 弹出框模式
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 单条数据 json
        currentJson: null,
        // 当前表格中的索引，第几条
        rowIndex: 0
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
          showUpdate: false
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
      } else {
        this.settings.btnDisabledStatus.disabledOk = true
        this.settings.btnShowStatus.showUpdate = false
      }
    },
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
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
