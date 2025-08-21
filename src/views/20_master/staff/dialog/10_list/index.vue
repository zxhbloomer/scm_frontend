<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="选择员工"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1200px"
    destroy-on-close
  >
    <!-- 查询表单 -->
    <el-form
      ref="searchForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="right"
    >
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.login_name"
          clearable
          placeholder="用户名"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="员工名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.id_card"
          clearable
          placeholder="身份证号"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <delete-type-normal v-model="dataJson.searchForm.is_del" disabled />
      </el-form-item>
      <el-form-item label="">
        <select-dict
          v-model="dataJson.searchForm.dataModel"
          :para="CONSTANTS.DICT_ORG_USED_TYPE"
          init-placeholder="仅显示未使用组织"
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
        v-permission="'P_STAFF:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_STAFF:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        v-permission="'P_STAFF:INFO'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
    </el-button-group>

    <!-- 数据表格 -->
    <el-table
      ref="staffTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="400"
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
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="login_name"
        label="用户名"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="员工姓名"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="60"
        :sort-orders="settings.sortOrders"
        prop="sex_text"
        label="性别"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="80"
        :sort-orders="settings.sortOrders"
        prop="birthday"
        label="生日"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="130"
        :sort-orders="settings.sortOrders"
        prop="id_card"
        label="身份证号"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="100"
        :sort-orders="settings.sortOrders"
        prop="email"
        label="邮箱地址"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        prop="company_name"
        label="所属主体企业"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        prop="dept_name"
        label="默认部门"
      />
      <el-table-column
        header-align="center"
        label="岗位信息"
        min-width="150"
      >
        <template v-slot="column_lists">
          <el-tag
            v-for="item in column_lists.row.positions"
            :key="item.position_id"
            class="position_tag"
          >
            {{ item.position_name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        prop="last_login_date"
        label="最后登录时间"
      >
        <template v-slot="scope">
          {{ scope.row.last_login_date == null ? '-' : formatDateTime(scope.row.last_login_date) }}
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        prop="last_logout_date"
        label="最后主动登出时间"
      >
        <template v-slot="scope">
          {{ scope.row.last_logout_date == null ? '-' : formatDateTime(scope.row.last_logout_date) }}
        </template>
      </el-table-column>
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
              disabled
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="90"
        :sort-orders="settings.sortOrders"
        prop="c_name"
        label="创建人"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="180"
        :sort-orders="settings.sortOrders"
        prop="c_time"
        label="创建时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.c_time) }}
        </template>
      </el-table-column>
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
        min-width="180"
        :sort-orders="settings.sortOrders"
        prop="u_time"
        label="更新时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        min-width="60"
        label="状态"
      >
        <template v-slot="scope">
          <el-tag :type="scope.row.is_enable ? 'success' : 'danger'">
            {{ scope.row.is_enable ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      ref="staffPaging"
      :total="dataJson.paging.total"
      :page.sync="dataJson.paging.current"
      :limit.sync="dataJson.paging.size"
      @pagination="getDataList"
    />

    <!-- 新增弹窗 -->
    <new-dialog
      v-if="dialogs.new"
      :visible="dialogs.new"
      :organization-context="organizationContext"
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

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        v-show="settings.btnShowStatus.showSelect && !isViewModel"
        plain
        type="primary"
        :disabled="settings.loading || !dataJson.currentJson.id"
        @click="handleSelect()"
      >确定</el-button>
      <el-button
        plain
        :disabled="settings.loading"
        @click="handleCancel()"
      >取消</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
.position_tag {
  margin-right: 5px;
  margin-bottom: 2px;
  font-size: 12px;
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getListApi } from '@/api/20_master/staff/staff'
import Pagination from '@/components/Pagination'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import SelectDict from '@/components/00_dict/select/SelectDict'
import NewDialog from '../20_new/index.vue'
import EditDialog from '../30_edit/index.vue'
import ViewDialog from '../40_view/index.vue'
import deepCopy from 'deep-copy'

export default {
  name: 'StaffSelectDialog',
  components: {
    Pagination,
    DeleteTypeNormal,
    SelectDict,
    NewDialog,
    EditDialog,
    ViewDialog
  },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 已选择的数据（用于多选回显）
    selectedData: {
      type: Array,
      default: () => []
    },
    // 组织上下文信息（用于传递给新增弹窗）
    organizationContext: {
      type: Object,
      default: () => ({
        selectedNode: null,
        companyInfo: null,
        departmentInfo: null
      })
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
          login_name: '',
          name: '',
          id_card: '',
          is_enable: '',
          is_del: '0', // 未删除
          dataModel: this.CONSTANTS.DICT_ORG_USED_TYPE_SHOW_UNUSED // 弹出框模式，默认显示未使用组织
        },
        enableList: [
          { 'enable_name': '已开启', 'status': true },
          { 'enable_name': '未开启', 'status': false }
        ],
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 单条数据 json
        currentJson: {},
        // 当前表格中的索引，第几条
        rowIndex: 0
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态
        btnShowStatus: {
          showSelect: true,
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
      },
      isViewModel: false
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  // 监听器
  watch: {
    // 监听页面是否打开
    listenVisible: {
      handler (newVal, oldVal) {
        if (newVal) {
          this.init()
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    // 设置当前打开的页面
  },
  methods: {
    init () {
      // 初始化查询
      this.getDataList()
      this.dataJson.currentJson = {}
      this.settings.btnShowStatus.showSelect = true
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
    // 行双点击，直接选择
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      this.dataJson.currentJson = Object.assign({}, row)
      this.handleSelect()
    },
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      // 更新按钮状态
      if (row && row.id) {
        this.settings.btnShowStatus.showUpdate = true
      } else {
        this.settings.btnShowStatus.showUpdate = false
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
    // 选择
    handleSelect () {
      if (!this.dataJson.currentJson.id) {
        this.$message.warning('请选择一条数据')
        return
      }
      this.$emit('closeMeOk', this.dataJson.currentJson)
    },
    // 取消
    handleCancel () {
      this.$emit('closeMeCancel')
    },
    // 点击按钮 新增
    handleInsert () {
      this.dialogs.new = true
    },
    // 点击按钮 修改
    handleUpdate () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$message.warning('请选择一条数据')
        return
      }
      this.dialogs.edit = true
    },
    // 查看
    handleView () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$message.warning('请选择一条数据')
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
        this.dataJson.currentJson = Object.assign({}, val.data.data)
        this.settings.btnShowStatus.showUpdate = true

        this.$notify({
          title: '新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })

        // 新增成功后关闭整个选择弹窗并返回新增的数据
        this.$emit('closeMeOk', Object.assign({}, this.dataJson.currentJson))
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
        this.getDataList()
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
