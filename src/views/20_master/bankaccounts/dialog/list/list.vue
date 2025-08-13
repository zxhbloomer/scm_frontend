<template>
  <div class="app-container">
    <FloatMenu />

    <div>
      <el-form
        ref="minusForm"
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
      >
        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.enterprise_name"
            clearable
            :disabled="data!=null&&data.enterprise_name!=null"
            placeholder="主体企业"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model.trim="dataJson.searchForm.name"
            clearable
            placeholder="账户名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.bank_name"
            clearable
            placeholder="开户行"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <select-dicts
            v-model="dataJson.searchForm.bank_type"
            :para="CONSTANTS.DICT_M_BANK_TYPE"
            init-placeholder="请选择账户类型"
            disabled
          />
        </el-form-item>

        <el-form-item style="float:right">
          <el-button
            v-popover:popover
            type="primary"
            plain
            @click="doResetSearch"
          >重置
          </el-button>
        </el-form-item>

        <el-form-item style="float:right">
          <el-button
            type="primary"
            plain
            icon="el-icon-search"
            :loading="settings.loading"
            @click="handleSearch"
          >查询
          </el-button>
        </el-form-item>

      </el-form>
    </div>

    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      columns_index_key="false"
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
        v-if="settings.exportModel"
        type="selection"
        width="45"
        prop="id"
      />
      <el-table-column
        fixed
        type="index"
        width="45"
        prop="No"
        label="No"
      />
      <el-table-column
        fixed
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="enterprise_name"
        label="主体企业"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="code"
        label="账户编码"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="name"
        label="账户名称"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="account_number"
        label="银行账户"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="holder_name"
        label="开户名"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="bank_name"
        label="开户行"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="bank_type_name"
        label="账户类型"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        prop="currency"
        label="币别"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="is_default"
        label="是否默认"
        align="center"
      >
        <template v-slot="scope">
          <span style="color: #1bbf1b;text-align: center">{{ scope.row.is_default === 1 ? '&check;' : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="remarks"
        label="备注"
        align="left"
      />
      <el-table-column
        header-align="center"
        min-width="80"
        :sort-orders="settings.sortOrders"
        label="状态"
      >
        <template v-slot:header>
          <span>
            状态
            <el-tooltip
              class="item"
              effect="dark"
              placement="bottom"
            >
              <div slot="content">
                状态提示：<br>
                绿色：启用 <br>
                红色：禁用
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
            :content="scope.row.status === '0' ? '状态：禁用' : '状态：可用' "
            placement="top"
            :open-delay="500"
          >
            <el-switch
              :value="scope.row.status === '0'"
              active-color="#ff4949"
              inactive-color="#13ce66"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              :disabled="true"
              @change="handleUpdateStatus(scope.row)"
            />
          </el-tooltip>
        </template>

      </el-table-column>

      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="link_status_name"
        label="银企互联状态"
        align="left"
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
        min-width="150"
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
        min-width="150"
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
    </el-table>
    <pagination
      ref="minusPaging"
      :total="dataJson.paging.total"
      :page.sync="dataJson.paging.current"
      :limit.sync="dataJson.paging.size"
      @pagination="getDataList"
    />

    <!--    vue-tour组件-->
    <v-tour name="myTour" :steps="steps" :options="tourOption" />

    <!--  新增弹窗-->
    <new_template
      v-if="popNewSettings.dialogVisible"
      :visible="popNewSettings.dialogVisible"
      :data="popNewSettings.data"
      title="新增账户"
      @closeMeOk="handleNewCancel"
      @closeMeCancel="handleNewCancel"
    />

    <!--  修改账户-->
    <edit_template
      v-if="popEditSettings.dialogVisible"
      :visible="popEditSettings.dialogVisible"
      :data="popEditSettings.data"
      title="修改账户"
      @closeMeOk="handleEditCancel"
      @closeMeCancel="handleEditCancel"
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
.el-form-item .el-select {
  width: 100%;
}
a {
  color: #52b5f2;
}
br {
  display: block;
  margin: 10px;
  content: ' ';
}
.perfect_popper .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>

<script>
import {
  exportApi,
  delApi, updateStatusApi, getDialogListApi
} from '@/api/20_master/bankaccounts/bankaccounts'
import constants_para from '@/common/constants/constants_para'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import mixin from './mixin'
import permission from '@/directive/permission/index.js' // 权限判断指令
import { EventBus } from '@/common/eventbus/eventbus'
import new_template from '@/views/20_master/bankaccounts/dialog/new'
import edit_template from '@/views/20_master/bankaccounts/dialog/edit'
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'

export default {
  components: { SelectDicts, edit_template, new_template, Pagination },
  directives: { elDragDialog, permission },
  mixins: [mixin],
  props: {
    // 自己作为弹出框时的参数
    meDialogStatus: {
      type: Boolean,
      default: false
    },
    dataModel: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      // 导入窗口的状态
      popSettingsImport: {
        // 弹出窗口会否显示
        dialogFormVisible: false,
        // 错误数据文件
        errorFileUrl: ''
      },
      dataJson: {
        tabsCount: {
          all: 0,
          todo: 0
        },
        tabs: {
          active: ''
        },
        // 查询使用的json
        searchForm: {
          code: '',
          plan_code: '',
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '', // 账户名称
          bank_name: '', // 开户行
          bank_type: [], // 账户类型列表
          // 启动日期
          batch: '',
          active_tabs_index: '' // 当前被激活的页签
        },
        todoSearchForm: {},
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        sumData: {},
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined
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
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式
        exportModel: false,
        // 按钮状态
        btnStatus: {
          showDel: false,
          showDisable: false,
          showUpdate: false,
          bankView: false,
          showExport: false,
          hidenExport: true
        },
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      },
      // vue-tour组件
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
        // 弹出编辑页面
        one: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            dialogStatus: ''
          }
        }
      },
      // 新增弹出款
      popNewSettings: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      // 修改弹出款
      popEditSettings: {
        dialogVisible: false,
        editStatus: null,
        data: null
      },
      screenNum: 0
    }
  },
  computed: {
  },
  // 监听器
  watch: {
    // 全屏loading
    'settings.loading': {
      handler (newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在查询，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_MST_BANK_ACCOUNTS_NEW_OK)
  },
  created () {
    // 描绘完成
    this.init()

    // 新增提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_BANK_ACCOUNTS_NEW_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_BANK_ACCOUNTS_NEW_OK', _data)
      // EventBus.$off(this.EMITS.EMIT_MST_ENTERPRISE_NEW_OK)
      // 设置到table中绑定的json数据源
      console.log('新增数据：', _data)
      this.dataJson.listData.unshift(_data)
    })

    // 更新提交数据时监听
    EventBus.$on(this.EMITS.EMIT_MST_BANK_ACCOUNTS_UPDATE_OK, _data => {
      console.log('来自兄弟组件的消息：this.EMITS.EMIT_MST_BANK_ACCOUNTS_UPDATE_OK', _data)
      // EventBus.$off(this.EMITS.EMIT_MST_BANK_ACCOUNTS_UPDATE_OK)
      // 设置到table中绑定的json数据源
      console.log('更新数据：', _data)
      // 设置到table中绑定的json数据源
      this.dataJson.listData.splice(this.dataJson.rowIndex, 1, _data)
      this.$nextTick(() => {
        this.$refs.multipleTable.setCurrentRow(this.dataJson.listData[this.dataJson.rowIndex])
      })
    })
  },
  beforeUpdate () {
    // 重新布局表格
    this.$nextTick(() => {
      this.$refs.multipleTable.doLayout()
    })
  },
  mounted () {
  },
  destroyed () {
    this.unWatch()
  },
  methods: {
    // 初始化页面
    init (parm) {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
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
      this.$emit('rowDbClick', _data)
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
      // 启动全屏loading
      this.showLoading('正在查询，请稍后...')

      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size

      // 查询条件企业编码
      if (this.data != null && this.data.enterprise_code !== null && this.data.enterprise_code !== undefined) {
        this.dataJson.searchForm.enterprise_code = this.data.enterprise_code
      }

      // 查询编号企业名称
      if (this.data != null && this.data.enterprise_name !== null && this.data.enterprise_name !== undefined) {
        this.dataJson.searchForm.enterprise_name = this.data.enterprise_name
      }

      // 银行账户类型
      if (this.data != null && this.data.accounts_purpose_type !== null && this.data.accounts_purpose_type !== undefined) {
        this.dataJson.searchForm.accounts_purpose_type = this.data.accounts_purpose_type
      }

      // 银行账户类型列表 - 从父页面传递
      if (this.data != null && this.data.bank_type !== null && this.data.bank_type !== undefined) {
        this.dataJson.searchForm.bank_type = this.data.bank_type
      }

      // 查询逻辑
      this.settings.loading = true
      getDialogListApi(this.dataJson.searchForm).then(response => {
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
      // 确保数组字段被正确重置为空数组
      this.dataJson.searchForm.bank_type = []
    },
    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },
    // 点击按钮 更新
    handleUpdate () {
      this.popEditSettings.data = Object.assign({}, this.dataJson.currentJson)
      if (this.popEditSettings.data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popEditSettings.editStatus = constants_para.STATUS_UPDATE
      this.popEditSettings.dialogVisible = true
    },
    // 点击按钮 新增
    handleNew () {
      this.popNewSettings.editStatus = constants_para.STATUS_INSERT
      this.popNewSettings.dialogVisible = true
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnStatus.showUpdate = true
        this.settings.btnStatus.showDel = true
      } else {
        this.settings.btnStatus.showUpdate = false
        this.settings.btnStatus.showDel = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },
    // 删除按钮
    handleDel () {
      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
      }).then(() => {
        this.handleDelOk()
      }).catch(action => {
        // 右上角X
        if (action !== 'close') {
          // 当前页所选择的数据导出
          // this.handleExportSelectionData()
        }
      })
    },
    handleDelOk () {
      // 设置到table中绑定的json数据源
      this.settings.loading = true
      // 开始作废
      delApi({ id: this.dataJson.currentJson.id }).then((_data) => {
        this.getDataList()
        this.$notify({
          title: '删除成功',
          message: _data.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      }, (_error) => {
        this.$notify({
          title: '删除失败',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.loading = false
        this.closeLoading()
      })
    },
    // 状态修改
    handleUpdateStatus (val) {
      // 设置到table中绑定的json数据源
      this.settings.loading = true
      // 开始作废
      updateStatusApi({ id: val.id }).then((_data) => {
        this.$notify({
          title: '删除成功',
          message: _data.data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.popSettings.one.visible = false
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
        this.closeLoading()
      })
    },
    handleCloseDialogOneCancel () {
      this.popSettings.one.visible = false
    },
    handleTabsClick (tab, event) {
      if (this.dataJson.searchForm.active_tabs_index === tab.index) {
        return
      }
      // switch (tab.index) {
      //   case '1':
      //     this.dataJson.searchForm.status = '0'
      //     break
      //   case '2':
      //     this.dataJson.searchForm.status = '1'
      //     break
      // }

      this.dataJson.searchForm.active_tabs_index = tab.index
      this.getDataList()
    },
    /**
     * 完成导出
     */
    handleExportOk () {
      this.settings.btnStatus.hidenExport = true
      this.settings.btnStatus.showExport = false
      this.settings.exportModel = false
    },
    /**
     * 切换到导出模式
     */
    handleModelOpen () {
      this.settings.exportModel = true
      this.settings.btnStatus.hidenExport = false
      this.$tours['myTour'].start()
    },
    // 导出按钮
    handleExport () {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnStatus.showExport = false
        })
      } else if (this.dataJson.multipleSelection.length === this.dataJson.listData.length) {
        // 选择全部的时候
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全部导出',
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
    // 部分数据导出
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionJson.push(value.id)
      })
      const searchData = { ids: selectionJson }
      // 开始导出
      exportApi(searchData).then(response => {
        this.settings.loading = false
      })
    },
    // 全部数据导出
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出
      exportApi(this.dataJson.searchForm).then(response => {
        this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'validate_vehicle' && row.validate_vehicle !== '1') {
        return 'warning-cell'
      }
      return ''
    },
    /**
     * 新增弹窗关闭
     */
    handleNewCancel () {
      this.popNewSettings.dialogVisible = false
    },
    /**
     * 修改账户关闭
     */
    handleEditCancel () {
      this.popEditSettings.dialogVisible = false
    }
  }
}
</script>
