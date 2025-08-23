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
          v-model.trim="dataJson.searchForm.position_name"
          clearable
          placeholder="岗位"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
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
        <delete-type-normal v-model="dataJson.searchForm.is_del" />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model.trim="dataJson.searchForm.id_card"
          clearable
          placeholder="身份证号"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="dataJson.searchForm.is_enable"
          clearable
          placeholder="是否开启登录"
        >
          <el-option
            v-for="item in dataJson.enableList"
            :key="item.status"
            :label="item.enable_name"
            :value="item.status"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model.trim="dataJson.searchForm.c_name"
          clearable
          placeholder="创建人"
          @keyup.enter.native="handleSearch"
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
        v-permission="'P_STAFF:COPY_INSERT'"
        :disabled="!settings.btnShowStatus.showCopyInsert"
        type="primary"
        icon="el-icon-camera-solid"
        :loading="settings.loading"
        @click="handleCopyInsert"
      >复制新增</el-button>
      <el-button
        v-permission="'P_STAFF:EXPORT'"
        :disabled="!settings.btnShowStatus.showExport"
        type="primary"
        icon="el-icon-s-management"
        :loading="settings.loading"
        @click="handleExport"
      >导出</el-button>
      <el-button
        v-permission="'P_STAFF:INFO'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
    </el-button-group>
    <el-button-group>
      <el-button
        v-permission="'P_STAFF:STAFF_POSITION'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-user-solid"
        :loading="settings.loading"
        @click="handleSetPosition"
      >设置岗位员工</el-button>
      <el-button
        v-permission="'P_STAFF:STAFF_ROLE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-user"
        :loading="settings.loading"
        @click="handleSetRole"
      >设置角色</el-button>
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
      <el-table-column
        type="selection"
        width="45"
        prop="id"
      />
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
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="login_name"
        label="用户名"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="员工姓名"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="80"
        :sort-orders="settings.sortOrders"
        prop="sex_text"
        label="性别"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="80"
        :sort-orders="settings.sortOrders"
        prop="birthday"
        label="生日"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="130"
        :sort-orders="settings.sortOrders"
        prop="id_card"
        label="身份证号"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="email"
        label="邮箱地址"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        prop="company_name"
        label="所属主体企业"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
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
            @click.stop="handlePositionClick(item.position_name)"
          >
            {{ item.position_name }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 员工角色权限管理4列 -->
      <el-table-column
        header-align="center"
        :auto-fit="true"
        min-width="120"
        label="设置角色"
      >
        <template v-slot="scope">
          <el-link
            type="primary"
            @click="handleEditStaffRole(scope.row.id, scope.row)"
          >
            设置角色
          </el-link>
          <span>
            （
            <el-link
              type="primary"
              @click="handleViewStaffRole(scope.row.id, scope.row)"
            >
              {{ scope.row.role_count || 0 }}
            </el-link>
            ）
          </span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        :auto-fit="true"
        min-width="150"
        label="角色信息"
      >
        <template v-slot="column_lists">
          <el-tag
            v-for="item in column_lists.row.roleList"
            :key="item.key"
            class="position_tag"
            effect="dark"
            @click.stop="handleRoleClick(item.label)"
          >
            {{ item.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        :auto-fit="true"
        min-width="120"
        label="设置权限"
      >
        <template v-slot="scope">
          <el-link
            type="primary"
            @click="handleEditStaffPermission(scope.row.id, scope.row)"
          >
            设置权限
          </el-link>
          <span>
            （
            <el-link
              type="primary"
              @click="handleViewStaffPermission(scope.row.id, scope.row)"
            >
              {{ scope.row.permission_count || 0 }}
            </el-link>
            ）
          </span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        label="权限信息"
        min-width="150"
      >
        <template v-slot="scope">
          <el-tag
            v-for="(item, index) in scope.row.permissionList"
            :key="index"
            class="permission_tag"
            effect="dark"
            @click.stop="handlePermissionClick(item)"
          >
            {{ item.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        :auto-fit="true"
        min-width="120"
        label="排除权限"
      >
        <template v-slot="scope">
          <el-link
            type="danger"
            @click="handleEditStaffExcludePermission(scope.row.id, scope.row)"
          >
            设置排除权限
          </el-link>
          <span>
            （
            <el-link
              type="danger"
              @click="handleViewStaffExcludePermission(scope.row.id, scope.row)"
            >
              {{ scope.row.exclude_permission_count || 0 }}
            </el-link>
            ）
          </span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        label="排除权限信息"
        min-width="150"
      >
        <template v-slot="scope">
          <el-tag
            v-for="(item, index) in scope.row.excludePermissionList"
            :key="index"
            class="permission_tag"
            type="danger"
            effect="dark"
            @click.stop="handlePermissionClick(item)"
          >
            {{ item.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        :auto-fit="true"
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
        :auto-fit="true"
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
        :auto-fit="true"
        :sort-orders="settings.sortOrders"
        label="删除"
      >
        <template v-slot:header>
          <field-help default-label="删除" help="删除状态提示：<br>绿色：未删除<br>红色：已删除" />
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
              :disabled="meDialogStatus"
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="90"
        :sort-orders="settings.sortOrders"
        prop="c_name"
        label="创建人"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
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
        :auto-fit="true"
        show-overflow-tooltip
        sortable="custom"
        min-width="90"
        :sort-orders="settings.sortOrders"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
        header-align="center"
        :auto-fit="true"
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
      :dialog-status="dialogStatus"
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

    <!-- 设置岗位弹窗 -->
    <position-dialog
      v-if="dialogs.position"
      :visible="dialogs.position"
      :data="dataJson.currentJson"
      @closeMeOk="handlePositionDialogOk"
      @closeMeCancel="handlePositionDialogCancel"
    />

    <!-- 设置密码弹窗 -->
    <password-dialog
      v-if="dialogs.password"
      :visible="dialogs.password"
      :data="dataJson.currentJson"
      @closeMeOk="handlePasswordDialogOk"
      @closeMeCancel="handlePasswordDialogCancel"
    />

    <!-- 员工角色设置弹窗 -->
    <staff-role-dialog
      v-if="popSettings.staffRole.visible"
      :visible="popSettings.staffRole.visible"
      :staff-id="popSettings.staffRole.props.staffId"
      :staff-data="popSettings.staffRole.props.staffData"
      :model="popSettings.staffRole.props.model"
      @closeMeOk="handleStaffRoleDialogOk"
      @closeMeCancel="handleStaffRoleDialogCancel"
    />

    <!-- 员工权限设置弹窗 -->
    <staff-permission-dialog
      v-if="popSettings.staffPermission.visible"
      :visible="popSettings.staffPermission.visible"
      :staff-id="popSettings.staffPermission.props.staffId"
      :staff-data="popSettings.staffPermission.props.staffData"
      :model="popSettings.staffPermission.props.model"
      @closeMeOk="handleStaffPermissionDialogOk"
      @closeMeCancel="handleStaffPermissionDialogCancel"
    />

    <!-- 员工排除权限设置弹窗 -->
    <staff-exclude-permission-dialog
      v-if="popSettings.staffExcludePermission.visible"
      :visible="popSettings.staffExcludePermission.visible"
      :staff-id="popSettings.staffExcludePermission.props.staffId"
      :staff-data="popSettings.staffExcludePermission.props.staffData"
      :model="popSettings.staffExcludePermission.props.model"
      @closeMeOk="handleStaffExcludePermissionDialogOk"
      @closeMeCancel="handleStaffExcludePermissionDialogCancel"
    />

    <!-- 权限详情弹窗 -->
    <permission-view-dialog
      v-if="popSettings.permissionDetail.visible"
      :visible="popSettings.permissionDetail.visible"
      :permission-id="popSettings.permissionDetail.permissionId"
      :head-info="popSettings.permissionDetail.headInfo"
      @closeMeCancel="handlePermissionDetailCancel"
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
.el-button-group {
  margin-bottom: 10px;
}
.position_tag {
  cursor: pointer;
  margin-right: 5px;
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
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>

<script>
import permission from '@/directive/permission/index.js' // 权限判断指令
import { getListApi, exportSelectionApi, exportAllApi, deleteApi } from '@/api/20_master/staff/staff'
import Pagination from '@/components/Pagination'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import FloatMenu from '@/components/FloatMenu/index.vue'
import FieldHelp from '@/components/30_table/FieldHelp'
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import PositionDialog from '../../dialog/50_position/index.vue'
import PasswordDialog from '../../dialog/60_password/index.vue'
// 员工角色权限弹窗组件
import StaffRoleDialog from '@/views/10_system/role/component/dialog/listfor/staff/index.vue'
import StaffPermissionDialog from '@/views/20_master/permission/component/dialog/listfor/staff/index.vue'
import StaffExcludePermissionDialog from '@/views/20_master/permission/component/dialog/listfor/staffexclude/index.vue'
// 权限详情弹窗 - 用于查看具体权限信息
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'
import deepCopy from 'deep-copy'

export default {
  name: 'StaffList',
  components: {
    Pagination,
    DeleteTypeNormal,
    FloatMenu,
    FieldHelp,
    NewDialog,
    EditDialog,
    ViewDialog,
    PositionDialog,
    PasswordDialog,
    StaffRoleDialog,
    StaffPermissionDialog,
    StaffExcludePermissionDialog,
    PermissionViewDialog
  },
  directives: { permission },
  props: {
    // 自己作为弹出框时的参数
    meDialogStatus: {
      type: Boolean,
      default: false
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
          position_name: '',
          login_name: '',
          name: '',
          id_card: '',
          is_enable: '',
          c_name: '',
          is_del: '0' // 未删除
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
        view: false,
        position: false,
        password: false
      },
      dialogStatus: '',
      // 员工角色权限弹窗配置
      popSettings: {
        // 员工角色设置弹窗
        staffRole: {
          visible: false,
          props: {
            staffId: null,
            staffData: null,
            model: 'edit' // 'edit' 或 'view'
          }
        },
        // 员工权限设置弹窗
        staffPermission: {
          visible: false,
          props: {
            staffId: null,
            staffData: null,
            model: 'edit' // 'edit' 或 'view'
          }
        },
        // 权限详情弹窗
        permissionDetail: {
          visible: false,
          permissionId: null,
          headInfo: ''
        },
        // 员工排除权限设置弹窗
        staffExcludePermission: {
          visible: false,
          props: {
            staffId: null,
            staffData: null,
            model: 'edit' // 'edit' 或 'view'
          }
        }
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
    this.initShow()
    if (this.$route.params.name !== undefined) {
      this.dataJson.searchForm.name = this.$route.params.name
    }
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
    // 行双点击，仅在dialog中有效
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      var _data = deepCopy(row)
      if (this.meDialogStatus) {
        this.$emit('rowDbClick', _data)
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
    // 点击按钮 新增
    handleInsert () {
      this.dialogStatus = this.PARAMETERS.STATUS_INSERT
      this.dialogs.new = true
    },
    // 点击按钮 复制新增
    handleCopyInsert () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.dialogStatus = this.PARAMETERS.STATUS_COPY_INSERT
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
      this.dialogStatus = this.PARAMETERS.STATUS_UPDATE
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
        this.$notify({
          title: '新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.getDataList()
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
    },
    // 设置岗位弹窗
    handleSetPosition () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.dialogs.position = true
    },
    handlePositionDialogOk () {
      this.dialogs.position = false
    },
    handlePositionDialogCancel () {
      this.dialogs.position = false
    },
    // 设置角色
    handleSetRole () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // TODO: 实现设置角色功能
      this.showErrorMsg('设置角色功能待实现')
    },
    // 设置密码弹窗
    handleSetPassword () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.dialogs.password = true
    },
    handlePasswordDialogOk () {
      this.dialogs.password = false
    },
    handlePasswordDialogCancel () {
      this.dialogs.password = false
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
    // 岗位点击
    handlePositionClick (val) {
      if (this.meDialogStatus) {
        return
      }
      // 通知路由，打开岗位页面
      this.$router.push({
        path: '/position/position', query: { name: val, fullpath: true }
      })
    },

    // ===================【员工角色权限事件处理器】===================

    // 员工设置角色
    handleEditStaffRole (staffId, staffData) {
      console.log('[员工页面] handleEditStaffRole调用:', { 员工ID: staffId, 员工名称: staffData?.name })
      this.popSettings.staffRole.props.staffId = staffId
      this.popSettings.staffRole.props.staffData = staffData
      this.popSettings.staffRole.props.model = 'edit'
      console.log('[员工页面] 设置角色弹窗props完成，准备显示弹窗')
      this.popSettings.staffRole.visible = true
    },

    handleViewStaffRole (staffId, staffData) {
      console.log('[员工页面] handleViewStaffRole调用:', { 员工ID: staffId, 员工名称: staffData?.name })
      this.popSettings.staffRole.props.staffId = staffId
      this.popSettings.staffRole.props.staffData = staffData
      this.popSettings.staffRole.props.model = 'view'
      this.popSettings.staffRole.visible = true
    },

    handleStaffRoleDialogOk (val) {
      if (!val || !val.return_flag) {
        this.popSettings.staffRole.visible = false
        return
      }

      this.$notify({
        title: '角色设置成功',
        message: `员工角色已成功设置`,
        type: 'success',
        duration: this.settings.duration
      })

      this.popSettings.staffRole.visible = false
      // 刷新列表数据以显示最新的角色信息
      this.getDataList()
    },

    handleStaffRoleDialogCancel () {
      this.popSettings.staffRole.visible = false
    },

    // 员工设置权限
    handleEditStaffPermission (staffId, staffData) {
      console.log('[员工页面] handleEditStaffPermission调用:', { 员工ID: staffId, 员工名称: staffData?.name })
      this.popSettings.staffPermission.props.staffId = staffId
      this.popSettings.staffPermission.props.staffData = staffData
      this.popSettings.staffPermission.props.model = 'edit'
      this.popSettings.staffPermission.visible = true
    },

    handleViewStaffPermission (staffId, staffData) {
      console.log('[员工页面] handleViewStaffPermission调用:', { 员工ID: staffId, 员工名称: staffData?.name })
      this.popSettings.staffPermission.props.staffId = staffId
      this.popSettings.staffPermission.props.staffData = staffData
      this.popSettings.staffPermission.props.model = 'view'
      this.popSettings.staffPermission.visible = true
    },

    handleStaffPermissionDialogOk (val) {
      if (!val || !val.return_flag) {
        this.popSettings.staffPermission.visible = false
        return
      }

      this.$notify({
        title: '权限设置成功',
        message: `员工权限已成功设置`,
        type: 'success',
        duration: this.settings.duration
      })

      this.popSettings.staffPermission.visible = false
      // 刷新列表数据以显示最新的权限信息
      this.getDataList()
    },

    handleStaffPermissionDialogCancel () {
      this.popSettings.staffPermission.visible = false
    },

    // 员工设置排除权限
    handleEditStaffExcludePermission (staffId, staffData) {
      console.log('[员工页面] handleEditStaffExcludePermission调用:', { 员工ID: staffId, 员工名称: staffData?.name })
      this.popSettings.staffExcludePermission.props.staffId = staffId
      this.popSettings.staffExcludePermission.props.staffData = staffData
      this.popSettings.staffExcludePermission.props.model = 'edit'
      this.popSettings.staffExcludePermission.visible = true
    },

    handleViewStaffExcludePermission (staffId, staffData) {
      console.log('[员工页面] handleViewStaffExcludePermission调用:', { 员工ID: staffId, 员工名称: staffData?.name })
      this.popSettings.staffExcludePermission.props.staffId = staffId
      this.popSettings.staffExcludePermission.props.staffData = staffData
      this.popSettings.staffExcludePermission.props.model = 'view'
      this.popSettings.staffExcludePermission.visible = true
    },

    handleStaffExcludePermissionDialogOk (val) {
      if (!val || !val.return_flag) {
        this.popSettings.staffExcludePermission.visible = false
        return
      }

      this.$notify({
        title: '排除权限设置成功',
        message: `员工排除权限已成功设置`,
        type: 'success',
        duration: this.settings.duration
      })

      this.popSettings.staffExcludePermission.visible = false
      // 刷新列表数据以显示最新的排除权限信息
      this.getDataList()
    },

    handleStaffExcludePermissionDialogCancel () {
      this.popSettings.staffExcludePermission.visible = false
    },

    // 角色标签点击事件
    handleRoleClick (roleName) {
      if (this.meDialogStatus) {
        return
      }
      // 通知路由，打开角色页面
      this.$router.push({
        path: '/role', query: { name: roleName, fullpath: true }
      })
    },

    // 权限标签点击事件 - 打开权限详情弹窗
    handlePermissionClick (permissionItem) {
      if (this.meDialogStatus) {
        return
      }

      if (!permissionItem || !permissionItem.id) {
        this.$message.warning('权限信息不完整，无法查看详情')
        return
      }

      // 设置权限详情弹窗数据
      this.popSettings.permissionDetail.permissionId = permissionItem.id
      this.popSettings.permissionDetail.headInfo = permissionItem.label || permissionItem.key || '未知权限'
      // 打开权限详情弹窗
      this.popSettings.permissionDetail.visible = true
    },

    // 权限详情弹窗回调 - 关闭操作
    handlePermissionDetailCancel () {
      this.popSettings.permissionDetail.visible = false
      // 清空权限详情数据
      this.popSettings.permissionDetail.permissionId = null
      this.popSettings.permissionDetail.headInfo = ''
    }
  }
}
</script>
