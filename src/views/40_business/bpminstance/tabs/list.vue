<template>
  <div class="app-container">
    <FloatMenu />
    <el-tabs
      ref="minusTabs"
      v-model="dataJson.tabs.active"
      type="card"
      class=""
      @tab-click="handleTabsClick"
    >
      <el-tab-pane name="0">
        <template slot="label">全部</template>
      </el-tab-pane>
      <!--      <el-tab-pane name="1">-->
      <!--        <template slot="label">待审核</template>-->
      <!--      </el-tab-pane>-->
    </el-tabs>
    <div>
      <el-form
        ref="minusForm"
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
      />
    </div>
    <el-button-group>

      <el-button
        v-permission="'P_ENTERPRISE:INFO'"
        :disabled="!settings.btnShowStatus.showView"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>

    </el-button-group>

    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      columns_index_key="true"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      :cell-class-name="tableCellClassName"
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
        type="index"
        width="45"
        prop="No"
        label="No"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="process_definition_name"
        label="审批单"
        align="center"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop=""
        label="版本"
        align="center"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="startUser"
        label="摘要"
        align="center"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="owner_name"
        label="发起人"
        align="center"
      />

      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_time"
        label="发起时间"
        align="center"
      />

      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="end_time"
        label="完成时间"
        align="center"
      />

      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="140"
        prop="status"
        label="流程状态"
        align="center"
      >
        <template v-slot="scope">
          <span v-if="scope.row.status!==constants_dict.DICT_BPM_INSTANCE_STATUS_ZERO">{{ scope.row.status_name }} </span>
          <span v-else>{{ scope.row.assignee_name }} ( {{ scope.row.current_task_name }} ) {{ scope.row.approve_type_name }} </span>
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

    <!-- pop窗口 数据批量导入：模版导出、excel导入-->
    <bpm-dialog
      v-if="popSettings.one.visible"
      :data="popSettings.one.props.data"
      :visible="popSettings.one.visible"
      :dialog-status="popSettings.one.props.dialogStatus"
      @closeMeCancel="handlCloseBpmProcessDialog"
    />

  </div>
</template>

<style scoped>
::v-deep .el-tabs__item {
  height: 30px;
  line-height: 30px;
}
::v-deep .el-tabs__header {
  margin: 0 0 5px;
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

.el-skeleton__paragraph {
  /* 设置骨架单元格的样式 */
  margin-top: 1px; /* 调整骨架之间的水平间距 */
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 371px;
}
.el-button-group {
  margin-bottom: 10px;
}
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
a {
  color: #52b5f2;
}
.div-sum {
  width: 100%;
  height: 35px;
  padding: 5px 5px;
  margin: 0;
  box-sizing: border-box;
  border-radius: 4px;
  transition: opacity 0.2s;
  background-color: #fff;
  color: #666;
  font-size: 16px;
  border-top: 1px solid #dfe6ec;
  border-left: 1px solid #dfe6ec;
  border-right: 1px solid #dfe6ec;
}
.count-data {
  color: #1890ff;
  font-size: 20px;
}
.count-title {
  margin-left: 10px;
}
.right {
  position: absolute;
  right: 10px;
  margin-right: 10px;
}
.font-class-red {
  color: #f00;
}
.perfect_popper .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
.el-tabs {
  margin-bottom: 5px;
}
/* sumData处的 el-link */
.el-link.el-link--default {
  font-size: 16px;
  vertical-align: top;
}
</style>
<style>
.el-table .warning-cell {
  background-color: #ffa4a4 !important;
}
</style>

<script>
import {
  formatBusinessStatus,
  getListApi
} from '@/api/40_business/bpmprocess/bpmprocess'
import resizeMixin from './mixin/listResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令
import urlUtil from '@/utils/urlUtil'
import bpmDialog from '@/components/60_bpm/designBpmDialog.vue'
import { selectPageList } from '@/api/40_business/bpminstance/bpminstance'
import constants_dict from '@/common/constants/constants_dict'
import constants_para from '@/common/constants/constants_para'

export default {
  components: { bpmDialog, Pagination },
  directives: { elDragDialog, permission },
  mixins: [resizeMixin],
  props: {
    data: {
      type: Object,
      default: undefined
    }
  },
  data () {
    return {
      meDialogStatus: false,
      bpmVisible: false,
      pickerOptions: {
      },
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      dataJson: {
        tabs: {
          active: '0'
        },
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          schedule_code: '',
          // settlement_status: null,
          waybill_contract_no: null
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        customerComboList: [],
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          config_key: '',
          value: '',
          descr: ''
        },
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
        // 重置
        reset1: false,
        reset2: false,
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showView: false
        },
        // 分页插件骨架 loading 状态
        skeletonLoading: true,
        sumLoading: false,
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      },
      popSettings: {
        // 弹出流程设计页面
        one: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            dialogStatus: ''
          }
        }
      },
      screenNum: 0
    }
  },
  computed: {
    constants_dict () {
      return constants_dict
    }

  },

  // 监听器
  watch: {
  },
  created () {
    // 获取url参数
    const p1 = urlUtil.getHashQueryVariable(window.location.href, 'p1')
    this.dataJson.searchForm.batch = this.dict_value
    this.init_List(p1)

    location.href = urlUtil.delParam(window.location.href, 'fullpath')
  },
  mounted () {
    // 描绘完成

  },
  beforeUpdate () {
    // 重新布局表格
    this.$nextTick(() => {
      this.$refs.multipleTable.doLayout()
    })
  },
  destroyed () {
  },
  methods: {
    formatBusinessStatus,
    // 初始化查询页面
    init_List (para) {
      // 初始化watch
      this.setWatch()
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
    },
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch('dataJson.multipleSelection', (newVal, oldVal) => {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showDel = true
          this.settings.btnShowStatus.showExport = true
        } else {
          this.settings.btnShowStatus.showDel = false
          this.settings.btnShowStatus.showExport = false
        }
      }, { deep: true })
    },
    unWatch () {
      if (this.watch.unwatch_tempJson) {
        this.watch.unwatch_tempJson()
      }
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
      this.dataJson.searchForm.id = null
      // 查询逻辑
      this.settings.loading = true
      this.settings.skeletonLoading = true

      selectPageList(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
        this.settings.skeletonLoading = false
      })
    },
    refreshList () {
      // 查询逻辑
      this.settings.loading = true
      this.settings.skeletonLoading = true
      getListApi(this.dataJson.searchForm).then(response => {
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
        this.dataJson.listData = response.data
      }).finally(() => {
        this.settings.loading = false
        this.settings.skeletonLoading = false
      })
    },
    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },

    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },

    // 点击按钮 查看
    handleView () {
      this.popSettings.one.props.data = Object.assign({}, this.dataJson.currentJson)
      if (this.popSettings.one.props.data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      const operate_tab_data = {
        operate_tab_info: { show: true, name: '查看' },
        canEdit: false,
        editStatus: constants_para.STATUS_VIEW,
        data: this.popSettings.one.props.data
      }

      this.$emit('emitEdit', operate_tab_data)

      console.log('进行查看', this.popSettings.one.props.data)
    },
    // 点击按钮 编辑
    handleQuash () {
      const data = Object.assign({}, this.dataJson.currentJson)
      if (data.taskId === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      console.log('撤销', data)
    },
    // Placeholder设置
    isPlaceholderShow (val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    // 弹出框关闭
    handleDialogClose () {
      this.settings.visible = false
    },

    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'validate_vehicle' && row.validate_vehicle !== '1') {
        return 'warning-cell'
      }
      return ''
    },
    handleCloseDialogTwoCancel () {
      this.popSettings.two.visible = false
    },
    // 点击查询, 同步状态为同步失败
    searchSyncError () {
      this.dataJson.searchForm.is_sync = '2'
      this.handleSearch()
    },
    handleTabsClick (tab, event) {
      if (this.dataJson.searchForm.active_tabs_index === tab.index) {
        return
      }

      switch (tab.index) {
        case '0':
          // 全部
          this.dataJson.searchForm.audit_status = null
          window.history.pushState({ pushState: true }, '', `#${this.$route.path}`)
          break
        case '1':
          // 待审核
          this.dataJson.searchForm.audit_status = '0'
          window.history.pushState({ pushState: true }, '', `#${this.$route.path}?p1=4`)
          break
      }

      this.getDataList()
      this.dataJson.searchForm.active_tabs_index = tab.index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.task_id !== undefined) {
        this.settings.btnShowStatus.showView = true
      } else {
        this.settings.btnShowStatus.showView = false
      }

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },
    // ------------------编辑弹出框 end--------------------
    renderHeaderIsEnabled: function (h, { column }) {
      return (
        <span>{column.label}
          <el-tooltip
            class='item'
            effect='dark'
            placement='bottom'
          >
            <div slot='content'>
              是否是黑名单状态提示：<br />
              绿色：否  <br />
              红色：是
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px' />
          </el-tooltip>
        </span>
      )
    },
    // 关闭弹出窗口
    handlCloseBpmProcessDialog () {
      this.popSettings.one.visible = false
    }

  }

}

</script>
