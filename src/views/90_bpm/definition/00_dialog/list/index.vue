<template>
  <div class="app-container">

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
        prop="code"
        label="审批编号"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="name"
        label="模板名称"
        align="left"
      />
      <el-table-column
        min-width="120"
        prop="version"
        label="版本"
        align="right"
      />

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_name"
        label="创建人"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_time"
        label="创建时间"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.c_time == null?'':formatDateTime(scope.row.c_time) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="c_name"
        label="更新人"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="u_time"
        label="更新时间"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.u_time == null?'':formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        min-width="100"
        label="操作"
        align="center"
      >
        <template v-slot="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleOperate(scope.row)"
          >
            操作
          </el-button>
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
    <bpm_dialog
      v-if="popSettings.one.visible"
      :data="popSettings.one.props.data"
      :visible="popSettings.one.visible"
      :dialog-status="popSettings.one.props.dialogStatus"
      @closeMeCancel="handlCloseBpmProcessDialog"
      @closeMeOk="handlCloseBpmProcessDialogOk"
    />

  </div>
</template>

<script>
import {
  getListApi
} from '@/api/40_business/bpmprocess/bpmprocess'
import mixin from './mixin.js'
import Pagination from '@/components/Pagination/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission' // 权限判断指令
import urlUtil from '@/utils/urlUtil'
import bpm_dialog from '@/components/60_bpm/designBpmDialog.vue'

export default {
  components: { bpm_dialog, Pagination },
  directives: { elDragDialog, permission },
  mixins: [mixin],
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
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          schedule_code: '',
          // 页面名称
          page_code: ''
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        sumData: {
          qty_loss: 0,
          in_qty: 0,
          out_qty: 0
        },
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
          showUpdate: false
        },
        // 分页插件骨架 loading 状态
        skeletonLoading: true,
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
      }
    }
  },
  computed: {
  },

  // 监听器
  watch: {
  },
  created () {
    // 获取url参数
    const p1 = urlUtil.getHashQueryVariable(window.location.href, 'p1')
    this.dataJson.searchForm.batch = this.dict_value
    this.init(p1)

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
    // 初始化查询页面
    init () {
      // 初始化watch
      this.setWatch()
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = deepCopy(this.dataJson.tempJsonOriginal)
    },
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
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
      // 查询逻辑
      this.settings.loading = true
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      this.dataJson.searchForm.page_code = this.data.page_code
      getListApi(this.dataJson.searchForm).then(response => {
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
    // 点击按钮 编辑
    handleUpdate () {
      this.popSettings.one.props.data = deepCopy(this.dataJson.currentJson)
      if (this.popSettings.one.props.data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      this.popSettings.one.visible = true
      this.popSettings.one.id = this.popSettings.one.props.data.id
      this.popSettings.one.props.dialogStatus = this.PARAMETERS.STATUS_UPDATE
      console.log(this.popSettings)
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
    handleCurrentChange (row) {
      this.dataJson.currentJson = deepCopy(row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnShowStatus.showUpdate = true
      } else {
        this.settings.btnShowStatus.showUpdate = false
      }

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', deepCopy(row))
    },
    // 关闭弹出窗口
    handlCloseBpmProcessDialog () {
      this.popSettings.one.visible = false
    },
    handlCloseBpmProcessDialogOk (val) {
      // 设置到table中绑定的json数据源
      this.dataJson.listData.splice(this.dataJson.rowIndex, 1, val)
      // 设置到currentjson中
      this.dataJson.currentJson = deepCopy(val)
      this.popSettings.one.visible = false
    },
    // 操作按钮点击事件
    handleOperate (row) {
      console.log('操作按钮被点击，当前行数据：', row)
      this.popSettings.one.props.data = deepCopy(row)
      this.popSettings.one.visible = true
      this.popSettings.one.id = this.popSettings.one.props.data.id
      this.popSettings.one.props.dialogStatus = this.PARAMETERS.STATUS_UPDATE
      console.log(this.popSettings)
    }
  }
}

</script>

<style scoped>
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>
