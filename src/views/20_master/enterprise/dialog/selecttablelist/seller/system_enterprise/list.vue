<template>
  <div class="app-container">
    <div>
      <el-form
        ref="minusForm"
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
      >

        <el-form-item label="">

          <el-input
            v-model.trim="dataJson.searchForm.uscc"
            clearable
            placeholder="统一社会信用代码"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.name"
            clearable
            placeholder="企业名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="">
          <select-dicts
            v-model="dataJson.searchForm.type_ids"
            :para="CONSTANTS.DICT_M_ENTERPRISE_TYPE"
            init-placeholder="企业类型"
            disabled
          />
        </el-form-item>
        <el-form-item label="">
          <select-dict
            v-model="dataJson.searchForm.status"
            :para="CONSTANTS.DICT_M_ENTERPRISE_STATUS"
            init-placeholder="状态"
            disabled
          />
        </el-form-item>

        <div style="text-align: right;float: right">
          <el-button
            type="primary"
            plain
            :loading="settings.loading"
            icon="el-icon-search"
            @click="handleSearch"
          >查询</el-button>
          <el-button
            v-popover:popover
            type="primary"
            plain
            icon="perfect-icon-reset"
            @click="doResetSearch"
          >重置</el-button>
        </div>

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
        type="index"
        width="45"
        prop="No"
        label="No"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="uscc"
        label="统一社会信用代码"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="130"
        prop="name"
        label="企业名称"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="type_names"
        label="企业类型"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="status_name"
        label="状态"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="former_name"
        label="曾用名"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="legal_person"
        label="法定代表人"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="registration_capital"
        label="注册资本（万）"
        align="right"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="150"
        prop="est_date"
        label="成立时间"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.est_date == null?'':formatDate(scope.row.est_date) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="140"
        prop="contact_person"
        label="联系人"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="contact_phone"
        label="联系电话"
        align="left"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="120"
        prop="address"
        label="地址"
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
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="140"
        prop="next_approve_name"
        label="流程状态"
        align="left"
      >
        <template v-slot="scope">
          {{ scope.row.status === '1' ? scope.row.next_approve_name + '处理中' : scope.row.next_approve_name }}
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

  </div>
</template>

<script>
import SelectDicts from '@/components/00_dict/select/SelectDicts.vue'
import SelectDict from '@/components/00_dict/select/SelectDict.vue'
import {
  getSystemEnterpriseCustomerListApi, deleteApi, exportApi, exportAllApi, importApi
} from '@/api/20_master/enterprise/enterprise.js'
import constants_para from '@/common/constants/constants_para'
import Pagination from '@/components/Pagination/index.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令
import { getPageApi } from '@/api/10_system/pages/page'
import constants_dict from '@/common/constants/constants_dict'
import { isEmpty } from '@/components/30_table/ExTable/util'
import { MessageBox } from 'element-ui'
import mixin from './mixin'

export default {
  components: { Pagination, SelectDicts, SelectDict },
  directives: { elDragDialog, permission },
  mixins: [mixin],
  props: {
  },
  data () {
    return {
      pickerOptions: {
      },
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      // 请输入修改理由弹窗
      popModifyProcess: {
        dialogVisible: false
      },
      // 版本列表弹窗
      popVersionList: {
        dialogVisible: false,
        data: null
      },
      // 导入窗口的状态
      popSettingsImport: {
        // 弹出窗口会否显示
        dialogFormVisible: false,
        // 模版文件地址
        templateFilePath: import.meta.env.VITE_BASE_API + '/api/v1/template.html?id=P00000160',
        // 错误数据文件
        errorFileUrl: ''
      },
      dataJson: {
        // 修改理由腿甲回复
        modify_reason: '',
        suggestedRepliesData: [{ label: '企业内部结构调整' }, { label: '业务调整' }, { label: '风险测评' }],
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
          waybill_contract_no: null,
          status: '2',
          type_ids: ['1']
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
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态
        btnShowStatus: {
          showEnable: false,
          showDisable: false,
          showUpdate: false,
          showView: false,
          showDel: false,
          showExport: false,
          showInExport: false,
          showAudit: false
        },
        sumLoading: false,
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      }
    }
  },
  computed: {
  },

  // 监听器
  watch: {
  },
  created () {
    // 描绘完成
    this.init()
  },
  mounted () {
    this.dataJson.searchForm.status = '2'
  },
  beforeUpdate () {
    // 重新布局表格
    this.$nextTick(() => {
      this.$refs.multipleTable.doLayout()
    })
  },
  methods: {
    getTemplate () {
      const tempData = {}
      tempData.code = this.$route.meta.page_code
      getPageApi(tempData).then(response => {
        this.settings.loading = false
        this.popSettingsImport.templateFilePath = response.data.template_url
      }, (_error) => {
        // this.showErrorMsg('发生了异常，请联系管理员！', _error.data)
        console.log('发生了异常，请联系管理员！:' + JSON.stringify(_error))
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 初始化查询页面
    init (parm) {
      // 初始化watch
      this.setWatch()
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
      // 获取模板文件
      this.getTemplate()
    },
    setWatch () {
      this.unWatch()
      // 监听页面上面是否有修改，有修改按钮高亮
      this.watch.unwatch_tempJson = this.$watch('dataJson.multipleSelection', (newVal, oldVal) => {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showExport = true
        } else {
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
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      this.dataJson.searchForm.id = null
      if (!this.dataJson.searchForm.status || isEmpty(this.dataJson.searchForm.status)) {
        this.dataJson.searchForm.status = null
      }
      // 查询逻辑
      this.settings.loading = true

      getSystemEnterpriseCustomerListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
    },
    refreshList () {
      // 查询逻辑
      this.settings.loading = true
      getSystemEnterpriseCustomerListApi(this.dataJson.searchForm).then(response => {
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
        this.dataJson.listData = response.data
      }).finally(() => {
        this.settings.loading = false
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
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      const operate_tab_data = {
        operate_tab_info: { showEdit: true, name: '查看企业' },
        canEdit: false,
        editStatus: constants_para.STATUS_VIEW,
        data: _data
      }

      this.$router.push({
        query: {
          p2: this.dataJson.currentJson.id
        }
      })
      this.$emit('emitView', operate_tab_data)
    },
    // 点击按钮新增
    handleNew () {
      const operate_tab_data = {
        operate_tab_info: { showEdit: true, name: '新增企业' },
        canEdit: true,
        editStatus: constants_para.STATUS_INSERT,
        data: this.dataJson.searchForm
      }

      this.$emit('emitNew', operate_tab_data)
    },

    // 点击按钮修改
    handleUpdate () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      /**
       * 判断选择行数据是否已经审批通过，如果审批通过，需要弹窗输入修改理由
       */
      this.dataJson.modify_reason = ''
      if (_data.status === constants_dict.DICT_M_ENTERPRISE_STATUS_TWO) {
        this.popModifyProcess.dialogVisible = true
        return
      }

      _data.searchForm = this.dataJson.searchForm
      this.dataJson.searchForm.id = _data.id

      const operate_tab_data = {
        operate_tab_info: { showEdit: true, name: '修改企业' },
        canEdit: false,
        editStatus: constants_para.STATUS_UPDATE,
        data: this.dataJson.searchForm
      }

      this.$router.push({
        query: {
          p2: this.dataJson.currentJson.id
        }
      })

      this.$emit('emitUpdate', operate_tab_data)
    },

    // 点击按钮 审核
    handleApprove () {
      const _data = deepCopy(this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }

      _data.serial_id = _data.id
      _data.serial_type = constants_dict.DICT_M_ENTERPRISE
      const operate_tab_data = {
        operate_tab_info: { show: true, name: '审核' },
        canEdit: false,
        editStatus: constants_para.STATUS_AUDIT,
        data: _data,
        enableCancel: true // 撤销按钮显示
      }

      this.$emit('emitApprove', operate_tab_data)

      console.log('进行审核', _data)
    },
    // 点击按钮 删除
    handleDel () {
      const _data = Object.assign({}, this.dataJson.currentJson)
      if (_data.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
      }).then(() => {
        deleteApi({ id: this.dataJson.currentJson.id }).then(_data => {
          this.$notify({
            title: '删除成功',
            message: _data.data.message,
            type: 'success',
            duration: this.settings.duration
          })
        }, (_error) => {
          this.$notify({
            title: '删除失败',
            message: _error.error.message,
            type: 'error',
            duration: this.settings.duration
          })
        })
      }).catch(action => {
      }).finally(() => {
        this.settings.loading = false
        this.closeLoading()
      })
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
    // 全部数据导出
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
        this.settings.loading = false
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
        selectionJson.push(value.id)
      })
      const searchData = { ids: selectionJson }
      // 开始导出
      exportApi(searchData).then(response => {
        this.settings.loading = false
      })
    },

    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'validate_vehicle' && row.validate_vehicle !== '1') {
        return 'warning-cell'
      }
      return ''
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
        case '1':
          // 待审核
          this.dataJson.searchForm.status = '0'
          window.history.pushState({ pushState: true }, '', `#${this.$route.path}?p1=4`)
          break
        case '2':
          // 审核中
          this.dataJson.searchForm.status = '1'
          window.history.pushState({ pushState: true }, '', `#${this.$route.path}?p1=4`)
          break
        case '3':
          // 审核通过
          this.dataJson.searchForm.status = '2'
          window.history.pushState({ pushState: true }, '', `#${this.$route.path}?p1=4`)
          break
        default:
          // 全部
          this.dataJson.searchForm.status = null
          window.history.pushState({ pushState: true }, '', `#${this.$route.path}`)
          break
      }

      this.getDataList()
      this.dataJson.searchForm.active_tabs_index = tab.index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = deepCopy(row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnShowStatus.showView = true

        // 审核中 审核按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_M_ENTERPRISE_STATUS_ONE) {
          this.settings.btnShowStatus.showAudit = true
        } else {
          this.settings.btnShowStatus.showAudit = false
        }

        // 驳回状态删除按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_M_ENTERPRISE_STATUS_THREE) {
          this.settings.btnShowStatus.showDel = true
        } else {
          this.settings.btnShowStatus.showDel = false
        }

        // 待审批状态删除按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_M_ENTERPRISE_STATUS_ZERO) {
          this.settings.btnShowStatus.showDel = true
        } else {
          this.settings.btnShowStatus.showDel = false
        }

        // 审核通过和驳回状态，修改按钮高亮
        if (this.dataJson.currentJson.status === constants_dict.DICT_M_ENTERPRISE_STATUS_THREE ||
          this.dataJson.currentJson.status === constants_dict.DICT_M_ENTERPRISE_STATUS_ZERO ||
          this.dataJson.currentJson.status === constants_dict.DICT_M_ENTERPRISE_STATUS_TWO) {
          this.settings.btnShowStatus.showUpdate = true
        } else {
          this.settings.btnShowStatus.showUpdate = false
        }
      } else {
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showView = false
        this.settings.btnShowStatus.showAudit = false
        this.settings.btnShowStatus.showDel = false
      }

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },
    // ------------------编辑弹出框 end--------------------
    renderHeaderIsEnabled: function (h, { column }) {
      return h('field-help', {
        props: {
          field: 'is_blacklist',
          page: 'enterprise-list',
          defaultLabel: column.label
        }
      })
    },
    // 数据批量导入按钮
    handleOpenImportDialog () {
      this.popSettingsImport.dialogFormVisible = true
    },
    // 关闭弹出窗口
    handlCloseDialog () {
      this.popSettingsImport.dialogFormVisible = false
      this.popSettingsData.dialogFormVisible = false
    },
    // 文件上传成功
    handleUploadFileSuccess (res) {
      this.settings.loading = true
      this.showLoading('正在上传，请稍后...')
      // 开始导入
      const tempData = res.response.data
      tempData.page_code = this.$route.meta.page_code
      importApi(tempData).then(response => {
        this.popSettingsImport.errorFileUrl = ''
        if (response.system_code !== 0) {
          this.popSettingsImport.errorFileUrl = response.data.url
          this.showErrorMsg('您上传的excel数据有错误，请点击错误信息进行查看！')
        } else if (response.system_code === 0) {
          const successList = '成功导入 ' + response.data.length + ' 条数据'
          this.$alert(successList, '导入成功', {
            confirmButtonText: '关闭',
            type: 'success'
          }).then(() => {
            this.popSettingsImport.dialogFormVisible = false
          })
        }
      }, (_error) => {
        // this.showErrorMsg('发生了异常，请联系管理员！', _error.data)
        console.log('发生了异常，请联系管理员！:' + JSON.stringify(_error))
      }).finally(() => {
        this.settings.loading = false
        this.closeLoading()
      })
    },
    // 文件上传失败
    handleUploadFileError () {
      console.debug('文件上传失败')
      this.$notify({
        title: '导入错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 快速回复
    handleFastReplay (val) {
      this.dataJson.modify_reason = val.label
    },
    /**
     * 修改下一步操作
     */
    handlUpdateProcessNextStep () {
      if (this.dataJson.modify_reason === '') {
        MessageBox.alert('请输入修改理由', '错误信息', {
          confirmButtonText: '确定',
          showClose: false,
          type: 'error'
        }).then(() => {
        })
        return
      }
      this.popModifyProcess.dialogVisible = false
      // 配置数据，开始跳转
      const operate_tab_data = {
        operate_tab_info: { showEdit: true, name: '修改企业' },
        canEdit: false,
        editStatus: constants_para.STATUS_UPDATE,
        data: this.dataJson.currentJson,
        modifyReason: this.dataJson.modify_reason
      }

      this.$router.push({
        query: {
          p2: this.dataJson.currentJson.id
        }
      })

      this.$emit('emitUpdate', operate_tab_data)
    },
    /**
     * 修改取消操作
     */
    handlUpdateProcessCancel () {
      this.popModifyProcess.dialogVisible = false
    },
    /**
     * 点击版本号
     * @param row
     */
    handleVersionClick (row) {
      this.popVersionList.dialogVisible = true
      this.popVersionList.data = row
    },
    /**
     * 取消版本列表弹窗
     */
    handleVersionListCancel () {
      this.popVersionList.dialogVisible = false
    }
  }
}

</script>

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
