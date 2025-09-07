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
      <el-form-item
        v-show="meDialogStatus"
        label=""
      >
        <select-dict
          v-model="dataJson.searchForm.dataModel"
          :para="CONSTANTS.DICT_ORG_USED_TYPE"
          init-placeholder="请选择"
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
    <el-button-group>
      <!-- <el-button
        v-permission="'P_POSITION:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button> -->
      <el-button
        v-permission="'P_POSITION:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        v-permission="'P_POSITION:DELETE'"
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDelButton"
      >删除</el-button>
      <!-- 导出按钮 开始 -->
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_POSITION:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_POSITION:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnShowStatus.hidenExport"
        v-permission="'P_POSITION:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <!-- 导出按钮 结束 -->
      <el-button
        v-permission="'P_POSITION:INFO'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
    </el-button-group>
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :columns-index-key="true"
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
        v-if="!meDialogStatus && settings.exportModel"
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
        v-if="!meDialogStatus"
        :auto-fit="true"
        sortable="custom"
        min-width="280"
        :sort-orders="settings.sortOrders"
        prop="group_simple_name"
        label="集团信息"
      />
      <el-table-column
        v-if="!meDialogStatus"
        :auto-fit="true"
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="company_simple_name"
        label="企业信息"
      />
      <el-table-column
        v-if="!meDialogStatus"
        :auto-fit="true"
        sortable="custom"
        min-width="180"
        :sort-orders="settings.sortOrders"
        prop="parent_dept_simple_name"
        label="部门信息"
      />
      <el-table-column
        :auto-fit="true"
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="code"
        label="岗位编号"
      />
      <el-table-column
        :auto-fit="true"
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="岗位名称"
      />
      <el-table-column
        :auto-fit="true"
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="simple_name"
        label="岗位简称"
      />
      <el-table-column
        :auto-fit="true"
        min-width="130"
        prop="staff_count"
        sortable="custom"
        label="添加岗位员工"
      >
        <template v-slot="scope">
          <el-link
            type="primary"
            @click="handleEditStaffMember(scope.row.id, scope.row)"
          >
            添加员工
          </el-link>
          <span>
            (
            <el-link
              type="primary"
              @click="handleEditStaffMember(scope.row.id, scope.row)"
            >
              {{ scope.row.staff_count }}
            </el-link>
            )
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :auto-fit="true"
        min-width="130"
        sortable="custom"
        prop="role_count"
        label="设置角色"
      >
        <template v-slot="scope">
          <el-link
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
        :auto-fit="true"
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="roleList"
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
        :auto-fit="true"
        min-width="130"
        prop="permission_count"
        label="设置权限"
      >
        <template v-slot="scope">
          <el-link
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
        prop="permission_info"
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
      <!-- <el-table-column
        :auto-fit="true"
        min-width="130"
        prop=""
        label="岗位设置仓库组"
      >
        <template v-slot="scope">
          <el-link
            type="primary"
            @click="handleEditWarehouseGroupPopup(scope.row.id, scope.row)"
          >
            仓库分组
          </el-link>
          <span>
            (
            <el-link
              type="primary"
              @click="handleEditWarehouseGroupPopup(scope.row.id, scope.row)"
            >
              {{ scope.row.warehouse_count }}
            </el-link>
            )
          </span>
        </template>
      </el-table-column> -->
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

    <!-- 岗位成员维护弹窗 -->
    <transfer-dialog
      v-if="popSettings.transfer.visible"
      :id="popSettings.transfer.id"
      :data="popSettings.transfer.data"
      :visible="popSettings.transfer.visible"
      :model="popSettings.transfer.model"
      @closeMeOk="handleTransferDialogOk"
      @closeMeCancel="handleTransferDialogCancel"
    />
    <set-warehouse-group-dialog
      v-if="popSettings.three.visible"
      :id="popSettings.three.props.id"
      :data="popSettings.three.props.data"
      :visible="popSettings.three.visible"
      :model="popSettings.three.props.model"
      :serial-data="popSettings.three.props.serialData"
      @closeMeOk="handleCloseDialogThreeOk"
      @closeMeCancel="handleCloseDialogThreeCancel"
    />
    <set-role-dialog
      v-if="popSettings.four.visible"
      :id="popSettings.four.props.id"
      :data="popSettings.four.props.data"
      :visible="popSettings.four.visible"
      :model="popSettings.four.props.model"
      @closeMeOk="handleCloseDialogFourOk"
      @closeMeCancel="handleCloseDialogFourCancel"
    />
    <set-permission-dialog
      v-if="popSettings.five.visible"
      :position-id="popSettings.five.props.positionId"
      :visible="popSettings.five.visible"
      @closeMeOk="handleCloseDialogFiveOk"
      @closeMeCancel="handleCloseDialogFiveCancel"
    />
    <!-- 权限详情弹窗 -->
    <permission-view-dialog
      v-if="popSettings.permissionDetail.visible"
      :visible="popSettings.permissionDetail.visible"
      :permission-id="popSettings.permissionDetail.permissionId"
      :head-info="popSettings.permissionDetail.headInfo"
      @closeMeCancel="handlePermissionDetailCancel"
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
.position_tag {
  cursor: pointer;
  margin: 2px;
}

.permission_tag {
  cursor: pointer;
  margin: 2px;
}

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
.perfect_popper .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>

<script>
import constants_program from '@/common/constants/constants_program'
import { getListApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/20_master/position/position'
import Pagination from '@/components/Pagination'
import SelectDict from '@/components/00_dict/select/SelectDict'
// 弹窗组件
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import TransferDialog from '../../dialog/50_transfer/index.vue'
import FloatMenu from '@/components/FloatMenu/index.vue'
import constants_para from '@/common/constants/constants_para'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令
import setWarehouseGroupDialog from '@/views/20_master/relation/dialog/dialog'
import setRoleDialog from '@/views/10_system/role/component/dialog/listfor/position/index.vue'
import setPermissionDialog from '@/views/20_master/permission/component/dialog/listfor/position/index.vue'
// 权限详情弹窗 - 用于查看具体权限信息
import PermissionViewDialog from '@/views/20_master/permission/component/dialog/view/index.vue'
import { savePositionRolesApi } from '@/api/20_master/position/position'

export default {
  name: constants_program.P_POSITION, // 页面id，和router中的name需要一致，作为缓存
  components: { setRoleDialog, setPermissionDialog, PermissionViewDialog, Pagination, SelectDict, NewDialog, EditDialog, ViewDialog, TransferDialog, setWarehouseGroupDialog, FloatMenu },
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
          id: this.id,
          dataModel: this.dataModel
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
          showExport: false,
          showDel: false,
          hidenExport: true
        },
        // loading 状态
        loading: true,
        duration: 4000,
        // 导出模式
        exportModel: false
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
      ],
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
        },
        // 岗位成员维护弹窗
        transfer: {
          visible: false,
          id: null,
          data: null,
          model: ''
        },
        // 设置数据页面:仓库分组
        three: {
          visible: false,
          props: {
            serialData: undefined,
            id: undefined,
            data: {},
            model: ''
          }
        },
        // 设置角色页面
        four: {
          visible: false,
          props: {
            serialData: undefined,
            id: undefined,
            data: {},
            model: ''
          }
        },
        // 设置权限页面
        five: {
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
    // 作为独立页面，通过route路由打开时
    this.$options.name = this.$route.meta.page_code

    if (this.$route.query.name !== undefined) {
      this.dataJson.searchForm.name = this.$route.query.name
    }
    if (this.$route.query.code !== undefined) {
      this.dataJson.searchForm.code = this.$route.query.code
    }
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
    // 自己作为弹出框设置初始化
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
      var _data = Object.assign({}, row)
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
      const selectionIds = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionIds.push(value.id) // 直接推送ID值，不是对象
      })
      const searchData = { ids: selectionIds }
      // 开始导出
      exportSelectionApi(searchData).then(response => {
        // this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        // this.settings.btnShowStatus.doInsert = true
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showDel = true
      } else {
        // this.settings.btnShowStatus.doInsert = false
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showDel = false
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
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
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
    // --------------弹出查询框：--------------

    handleCancel () {
      this.popSettings.one.visible = false
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
    // ------------------岗位设置员工弹出框 start--------------------
    handleViewStaffMember (val, row) {
      this.popSettings.transfer.id = val
      this.popSettings.transfer.data = row
      this.popSettings.transfer.model = constants_para.MODEL_VIEW
      this.popSettings.transfer.visible = true
    },
    handleEditStaffMember (val, row) {
      this.popSettings.transfer.id = val
      this.popSettings.transfer.data = row
      this.popSettings.transfer.model = constants_para.MODEL_EDIT
      this.popSettings.transfer.visible = true
    },
    // 岗位成员维护弹窗回调
    handleTransferDialogOk (val) {
      this.popSettings.transfer.visible = false
    },
    handleTransferDialogCancel () {
      this.popSettings.transfer.visible = false
    },

    // ------------------岗位仓库分组出框 start--------------------
    handleEditWarehouseGroupPopup (val, row) {
      this.popSettings.three.props.id = val
      this.popSettings.three.props.data = row
      this.popSettings.three.props.model = constants_para.MODEL_VIEW
      this.popSettings.three.props.serialData = ({
        serial_type: 'm_position',
        serial_id: val
      })
      this.popSettings.three.visible = true
    },
    handleCloseDialogThreeOk (val) {
      this.popSettings.three.visible = false
    },
    handleCloseDialogThreeCancel () {
      this.popSettings.three.visible = false
    },
    // ------------------岗位设置员工弹出框 end--------------------
    // 点击按钮 新增
    handleInsert () {
      this.popSettings.new.copyData = null
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
    // 删除按钮操作
    handleDelButton () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.settings.loading = true
        const selectionJson = []
        selectionJson.push({ 'id': this.dataJson.currentJson.id })
        deleteApi(selectionJson).then((_data) => {
          this.$notify({
            title: '删除成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
          this.getDataList()
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
    // 岗位设置角色
    handleViewRoleMember (val, row) {
      this.popSettings.four.props.id = val
      this.popSettings.four.props.data = row
      this.popSettings.four.props.model = constants_para.MODEL_VIEW
      this.popSettings.four.visible = true
    },
    handleEditRoleMember (val, row) {
      console.log('[岗位页面] handleEditRoleMember调用:', { 岗位ID: val, 岗位名称: row?.name })
      this.popSettings.four.props.id = val
      this.popSettings.four.props.data = row
      this.popSettings.four.props.model = constants_para.MODEL_EDIT
      console.log('[岗位页面] 设置弹窗props完成，准备显示弹窗')
      this.popSettings.four.visible = true
      console.log('[岗位页面] 弹窗visible已设置为true')
    },
    handleCloseDialogFourOk (val) {
      if (!val || !val.return_flag) {
        this.popSettings.four.visible = false
        return
      }

      // 提取选中的角色ID列表
      const selectedRoles = Array.isArray(val.data) ? val.data : [val.data]
      const roleIds = selectedRoles.map(role => role.id).filter(id => id)

      // 准备保存数据
      const saveData = {
        positionId: this.popSettings.four.props.id,
        roleIds: roleIds
      }

      // 调用API保存岗位-角色关系
      this.settings.loading = true
      savePositionRolesApi(saveData).then(response => {
        this.$notify({
          title: '角色设置成功',
          message: response.message || `成功为岗位【${this.popSettings.four.props.data.name}】设置了${roleIds.length}个角色`,
          type: 'success',
          duration: this.settings.duration
        })

        // 关闭弹窗
        this.popSettings.four.visible = false

        // 刷新列表数据以显示最新的角色信息
        this.getDataList()
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
    handleCloseDialogFourCancel () {
      this.popSettings.four.visible = false
    },
    // 岗位设置权限
    handleViewPermissionMember (val, row) {
      this.popSettings.five.props.positionId = val
      this.popSettings.five.props.data = row
      this.popSettings.five.visible = true
    },
    handleEditPermissionMember (val, row) {
      console.log('[岗位页面] handleEditPermissionMember调用:', { 岗位ID: val, 岗位名称: row?.name })
      this.popSettings.five.props.positionId = val
      this.popSettings.five.props.data = row
      console.log('[岗位页面] 设置权限弹窗props完成，准备显示弹窗')
      this.popSettings.five.visible = true
      console.log('[岗位页面] 权限弹窗visible已设置为true')
    },
    handleCloseDialogFiveOk (val) {
      if (!val || !val.return_flag) {
        this.popSettings.five.visible = false
        return
      }

      // 提取权限数量
      const permissionCount = val.data?.permissionCount || 0

      this.$notify({
        title: '权限设置成功',
        message: `成功为岗位【${this.popSettings.five.props.data?.name}】设置了${permissionCount}个权限`,
        type: 'success',
        duration: this.settings.duration
      })

      // 关闭弹窗
      this.popSettings.five.visible = false

      // 刷新列表数据以显示最新的权限信息
      this.getDataList()
    },
    handleCloseDialogFiveCancel () {
      this.popSettings.five.visible = false
    },
    handleRoleClick (val) {
      if (this.meDialogStatus) {
        return
      }
      // 通知路由，打开岗位页面
      this.$router.push({
        path: '/role', query: { name: val, fullpath: true }
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
