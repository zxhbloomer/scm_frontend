<template>
  <div>
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      type="org_position"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="height"
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
      <!-- <el-table-column type="selection" width="45" prop="id" /> -->
      <el-table-column
        type="index"
        width="45"
        label="No"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="280"
        :sort-orders="settings.sortOrders"
        prop="group_simple_name"
        label="集团信息"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="company_simple_name"
        label="企业信息"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="180"
        :sort-orders="settings.sortOrders"
        prop="parent_dept_simple_name"
        label="部门信息"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="岗位名称"
      >
        <template v-slot="scope">
          <el-link
            style="float: right"
            type="primary"
            @click="handleView(scope.row)"
          ><i class="el-icon-info" /></el-link>
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        min-width="130"
        prop=""
        label="操作"
      >
        <template v-slot="scope">
          <el-link
            type="primary"
            @click="handleEditStaffMember(scope.row.id, scope.row)"
          >
            添加员工
          </el-link>
          <span>
            （
            <el-link
              type="primary"
              @click="handleViewStaffMember(scope.row.id, scope.row)"
            >
              {{ scope.row.staff_count }}
            </el-link>
            ）
          </span>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="230"
        :sort-orders="settings.sortOrders"
        prop="code"
        label="岗位编号"
      >
        <template v-slot="scope">
          <el-button-group style="float: right">
            <el-button
              v-permission="'P_ORG:EDIT'"
              type="primary"
              icon="el-icon-edit"
              style="padding:4px 4px; "
              @click="handleEdit(scope.row)"
            />
          </el-button-group>
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <!-- 新增的4个列：角色和权限管理 -->
      <el-table-column
        :auto-fit="true"
        min-width="130"
        sortable="custom"
        prop="role_count"
        label="设置角色"
      >
        <template v-slot="scope">
          <el-link
            v-permission="'P_ORG:ADD_ROLE'"
            type="primary"
            @click="handleEditRoleMember(scope.row.id, scope.row)"
          >
            设置角色
          </el-link>
          <span>
            （
            <el-link
              type="primary"
              @click="handleViewRoleMember(scope.row.id, scope.row)"
            >
              {{ scope.row.role_count }}
            </el-link>
            ）
          </span>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="roleList"
        label="角色信息"
      >
        <template v-slot="column_lists">
          <el-tag
            v-for="item in column_lists.row.roleList"
            :key="item.id"
            class="position_tag"
            effect="dark"
            @click.stop="handleRoleClick(item.label)"
          >
            {{ item.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        min-width="130"
        prop="permission_count"
        label="设置权限"
      >
        <template v-slot="scope">
          <el-link
            v-permission="'P_ORG:ADD_PERMISSION'"
            type="primary"
            @click="handleEditPermissionMember(scope.row.id, scope.row)"
          >
            设置权限
          </el-link>
          <span>
            （
            <el-link
              type="primary"
              @click="handleViewPermissionMember(scope.row.id, scope.row)"
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
            v-for="item in scope.row.permissionList"
            :key="item.id"
            class="permission_tag"
            effect="dark"
            @click.stop="handlePermissionClick(item)"
          >
            {{ item.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="false"
        min-width="100"
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
              :disabled="true"
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="100"
        :sort-orders="settings.sortOrders"
        prop="u_name"
        label="更新人"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="200"
        :sort-orders="settings.sortOrders"
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

    <view-dialog
      v-if="popSettings.one.visible && popSettings.one.type === 'view'"
      :data="popSettings.one.props.data"
      :visible="popSettings.one.visible"
      @closeMeCancel="handleCloseDialogOneCancel"
    />
    <edit-dialog
      v-if="popSettings.one.visible && popSettings.one.type === 'edit'"
      :data="popSettings.one.props.data"
      :visible="popSettings.one.visible"
      @closeMeOk="handleCloseDialogOneOk"
      @closeMeCancel="handleCloseDialogOneCancel"
    />

    <set-position-dialog
      v-if="popSettings.two.visible"
      :id="popSettings.two.props.id"
      :data="popSettings.two.props.data"
      :visible="popSettings.two.visible"
      :model="popSettings.two.props.model"
      @closeMeOk="handleCloseDialogTwoOk"
      @closeMeCancel="handleCloseDialogTwoOk"
    />

    <!-- 角色设置弹窗 -->
    <set-role-dialog
      v-if="popSettings.role.visible"
      :id="popSettings.role.props.id"
      :data="popSettings.role.props.data"
      :visible="popSettings.role.visible"
      :model="popSettings.role.props.model"
      @closeMeOk="handleCloseDialogRoleOk"
      @closeMeCancel="handleCloseDialogRoleCancel"
    />

    <!-- 权限设置弹窗 -->
    <set-permission-dialog
      v-if="popSettings.permission.visible"
      :position-id="popSettings.permission.props.positionId"
      :visible="popSettings.permission.visible"
      @closeMeOk="handleCloseDialogPermissionOk"
      @closeMeCancel="handleCloseDialogPermissionCancel"
    />

    <!-- 权限详情弹窗 -->
    <permission-view-dialog
      v-if="popSettings.permissionDetail.visible"
      :visible="popSettings.permissionDetail.visible"
      :permission-id="popSettings.permissionDetail.permissionId"
      :head-info="popSettings.permissionDetail.headInfo"
      @closeMeCancel="handlePermissionDetailCancel"
    />
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
.transferCenter {
  display: flex;
  justify-content: center;
}

.position_tag {
  cursor: pointer;
  margin: 2px;
}

.permission_tag {
  cursor: pointer;
  margin: 2px;
}
</style>

<script>
import { EventBus } from '@/common/eventbus/eventbus'
// import { getPositionListApi } from '@/api/20_master/org/org'
import Pagination from '@/components/Pagination'
import FieldHelp from '@/components/30_table/FieldHelp'
import setPositionDialog from '@/views/20_master/position/dialog/50_transfer/index.vue'
import constants_para from '@/common/constants/constants_para'
import editDialog from '@/views/20_master/position/dialog/30_edit/index.vue'
import viewDialog from '@/views/20_master/position/dialog/40_view/index.vue'
// 角色和权限管理组件
import setRoleDialog from '@/views/10_system/role/component/dialog/listfor/position/index.vue'
import setPermissionDialog from '@/views/20_master/permission/component/dialog/listfor/position/index.vue'
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'
import deepCopy from 'deep-copy'
import { getPositionListApi } from '@/api/20_master/org/org'
import { savePositionRolesApi } from '@/api/20_master/position/position'
import permission from '@/directive/permission/index.js' // 权限判断指令

export default {
  components: { Pagination, FieldHelp, setPositionDialog, editDialog, viewDialog, setRoleDialog, setPermissionDialog, PermissionViewDialog },
  directives: { permission },
  mixins: [],
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data () {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          condition: null,
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION)
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
      popSettings: {
        // 弹出编辑页面
        one: {
          visible: false,
          type: '', // 'view' 或 'edit'
          props: {
            id: undefined,
            data: {}
          }
        },
        // 设置数据页面
        two: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            model: ''
          }
        },
        // 角色设置弹窗
        role: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            model: ''
          }
        },
        // 权限设置弹窗
        permission: {
          visible: false,
          props: {
            positionId: undefined,
            data: {}
          }
        },
        // 权限详情弹窗
        permissionDetail: {
          visible: false,
          permissionId: null,
          headInfo: ''
        }
      }
    }
  },
  computed: {
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
    // this.$options.name = this.PROGRAMS.P_ORG_RIGHT_POSITION
    // 因为全局事件已经进行了查询，所以此处页面查询就不需要了
    this.initShow()
  },
  mounted () {
    // 描绘完成
    EventBus.$on(this.EMITS.EMIT_ORG_CHANGE, _data => {
      this.dataJson.searchForm.condition = _data
      this.getDataList()
    })
  },
  methods: {
    initShow () {
      // 初始化查询
      this.getDataList()
    },
    // 下拉选项控件事件
    handleSelectChange (val) {
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
    },
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      // this.$refs.multipleTable.clearSelection()
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        // this.settings.btnShowStatus.doInsert = true
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true
      } else {
        // this.settings.btnShowStatus.doInsert = false
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
    getDataList (val) {
      // 通知兄弟组件
      // this.$off(this.EMITS.EMIT_ORG_LOADING)
      EventBus.$emit(this.EMITS.EMIT_ORG_LOADING)
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.loading = true
      const condition = {
        ...this.dataJson.searchForm.condition,
        ...{ pageCondition: this.dataJson.searchForm.pageCondition }
      }
      getPositionListApi(condition).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
        // 通知兄弟组件
        // this.$off(this.EMITS.EMIT_ORG_LOADING_OK)
        EventBus.$emit(this.EMITS.EMIT_ORG_LOADING_OK)
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },
    // ------------------岗位master弹出框--------------------
    handleEdit (val) {
      this.popSettings.one.props.data = Object.assign({}, val)
      this.popSettings.one.type = 'edit'
      this.popSettings.one.visible = true
    },
    handleView (val) {
      this.popSettings.one.props.data = Object.assign({}, val)
      this.popSettings.one.type = 'view'
      this.popSettings.one.visible = true
    },
    handleCloseDialogOneOk (val) {
      // 通知兄弟组件
      // this.$off(this.EMITS.EMIT_ORG_LEFT)
      EventBus.$emit(this.EMITS.EMIT_ORG_LEFT)

      // 只有编辑操作才需要处理回调
      if (this.popSettings.one.type === 'edit') {
        this.doUpdateModelCallBack(val)
      }
    },
    handleCloseDialogOneCancel () {
      this.popSettings.one.visible = false
    },
    // 处理插入回调
    doInsertModelCallBack (val) {
      if (val.return_flag) {
        this.popSettings.one.visible = false

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
    // 处理复制新增回调
    doCopyInsertModelCallBack (val) {
      if (val.return_flag) {
        this.popSettings.one.visible = false

        // 设置到table中绑定的json数据源
        this.dataJson.listData.unshift(val.data.data)
        // 设置到currentjson中
        this.dataJson.currentJson = Object.assign({}, val.data.data)
        this.$notify({
          title: '复制新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '复制新增处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },
    // 处理更新回调
    doUpdateModelCallBack (val) {
      if (val.return_flag) {
        this.popSettings.one.visible = false

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

    // ------------------岗位设置员工弹出框--------------------
    handleViewStaffMember (val, row) {
      this.popSettings.two.props.id = val
      this.popSettings.two.props.data = row
      this.popSettings.two.props.model = constants_para.MODEL_VIEW
      this.popSettings.two.visible = true
    },
    handleEditStaffMember (val, row) {
      this.popSettings.two.props.id = val
      this.popSettings.two.props.data = row
      this.popSettings.two.props.model = constants_para.MODEL_EDIT
      this.popSettings.two.visible = true
    },
    handleCloseDialogTwoOk (val) {
      if (!val || !val.return_flag) {
        this.popSettings.two.visible = false
        return
      }

      this.$notify({
        title: '员工设置成功',
        message: val.message || `成功为岗位【${this.popSettings.two.props.data.name}】设置员工`,
        type: 'success',
        duration: this.settings.duration
      })

      // 关闭弹窗
      this.popSettings.two.visible = false

      // 刷新岗位列表数据以显示最新的员工数量
      this.getDataList()

      // 通知组织树刷新
      EventBus.$emit(this.EMITS.EMIT_ORG_LEFT)
    },
    handleCloseDialogTwoCancel () {
      this.popSettings.two.visible = false
    },

    // ------------------角色管理功能 start--------------------
    // 角色设置 - 查看模式
    handleViewRoleMember (val, row) {
      this.popSettings.role.props.id = val
      this.popSettings.role.props.data = row
      this.popSettings.role.props.model = constants_para.MODEL_VIEW
      this.popSettings.role.visible = true
    },
    // 角色设置 - 编辑模式
    handleEditRoleMember (val, row) {
      console.log('[组织岗位页面] handleEditRoleMember调用:', { 岗位ID: val, 岗位名称: row?.name })
      this.popSettings.role.props.id = val
      this.popSettings.role.props.data = row
      this.popSettings.role.props.model = constants_para.MODEL_EDIT
      console.log('[组织岗位页面] 设置角色弹窗props完成，准备显示弹窗')
      this.popSettings.role.visible = true
      console.log('[组织岗位页面] 角色弹窗visible已设置为true')
    },
    // 角色设置弹窗 - 成功回调
    handleCloseDialogRoleOk (val) {
      if (!val || !val.return_flag) {
        this.popSettings.role.visible = false
        return
      }

      // 提取选中的角色ID列表
      const selectedRoles = Array.isArray(val.data) ? val.data : [val.data]
      const roleIds = selectedRoles.map(role => role.id).filter(id => id)

      // 准备保存数据
      const saveData = {
        positionId: this.popSettings.role.props.id,
        roleIds: roleIds
      }

      // 调用API保存岗位-角色关系
      this.settings.loading = true
      savePositionRolesApi(saveData).then(response => {
        this.$notify({
          title: '角色设置成功',
          message: response.message || `成功为岗位【${this.popSettings.role.props.data.name}】设置了${roleIds.length}个角色`,
          type: 'success',
          duration: this.settings.duration
        })

        // 关闭弹窗
        this.popSettings.role.visible = false

        // 刷新列表数据以显示最新的角色信息
        this.getDataList()

        // 通知组织树刷新
        EventBus.$emit(this.EMITS.EMIT_ORG_LEFT)
      }).catch(error => {
        this.$notify({
          title: '角色设置失败',
          message: error.message || '保存岗位角色关系时发生错误',
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 角色设置弹窗 - 取消回调
    handleCloseDialogRoleCancel () {
      this.popSettings.role.visible = false
    },
    // 角色标签点击 - 导航到角色页面
    handleRoleClick (val) {
      // 通知路由，打开角色页面
      this.$router.push({
        path: '/role', query: { name: val, fullpath: true }
      })
    },
    // ------------------角色管理功能 end--------------------

    // ------------------权限管理功能 start--------------------
    // 权限设置 - 查看模式
    handleViewPermissionMember (val, row) {
      this.popSettings.permission.props.positionId = val
      this.popSettings.permission.props.data = row
      this.popSettings.permission.visible = true
    },
    // 权限设置 - 编辑模式
    handleEditPermissionMember (val, row) {
      console.log('[组织岗位页面] handleEditPermissionMember调用:', { 岗位ID: val, 岗位名称: row?.name })
      this.popSettings.permission.props.positionId = val
      this.popSettings.permission.props.data = row
      console.log('[组织岗位页面] 设置权限弹窗props完成，准备显示弹窗')
      this.popSettings.permission.visible = true
      console.log('[组织岗位页面] 权限弹窗visible已设置为true')
    },
    // 权限设置弹窗 - 成功回调
    handleCloseDialogPermissionOk (val) {
      if (!val || !val.return_flag) {
        this.popSettings.permission.visible = false
        return
      }

      // 提取权限数量
      const permissionCount = val.data?.permissionCount || 0

      this.$notify({
        title: '权限设置成功',
        message: `成功为岗位【${this.popSettings.permission.props.data?.name}】设置了${permissionCount}个权限`,
        type: 'success',
        duration: this.settings.duration
      })

      // 关闭弹窗
      this.popSettings.permission.visible = false

      // 刷新列表数据以显示最新的权限信息
      this.getDataList()

      // 通知组织树刷新
      EventBus.$emit(this.EMITS.EMIT_ORG_LEFT)
    },
    // 权限设置弹窗 - 取消回调
    handleCloseDialogPermissionCancel () {
      this.popSettings.permission.visible = false
    },
    // 权限标签点击 - 打开权限详情弹窗
    handlePermissionClick (permissionItem) {
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
    // 权限详情弹窗 - 关闭操作
    handlePermissionDetailCancel () {
      this.popSettings.permissionDetail.visible = false
      // 清空权限详情数据
      this.popSettings.permissionDetail.permissionId = null
      this.popSettings.permissionDetail.headInfo = ''
    }
    // ------------------权限管理功能 end--------------------

    // ------------------岗位设置仓库弹出框 start--------------------
    // ------------------编辑弹出框 end--------------------
  }
}
</script>
