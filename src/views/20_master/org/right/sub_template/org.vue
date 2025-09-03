<template>
  <div>
    <el-table
      ref="dataSubmitForm"
      v-loading="settings.loading"
      type="org"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="height"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      row-key="id"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="index"
        width="45"
        label="No"
      />
      <el-table-column
        show-overflow-tooltip
        min-width="250"
        prop="name"
        label="组织机构名称"
      />
      <el-table-column
        show-overflow-tooltip
        min-width="150"
        prop="simple_name"
        label="组织机构简称"
      />
      <!-- <el-table-column show-overflow-tooltip min-width="250" prop="code" label="组织机构编码" /> -->
      <el-table-column
        show-overflow-tooltip
        min-width="60"
        prop="type_text"
        label="分类"
      >
        <template v-slot="scope">
          <el-tag
            :type="getOrgTagType(scope.row.type)"
            size="mini"
            :effect="scope.row.type === CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF ? 'plain' : 'dark'"
          >
            {{ getOrgTagText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column show-overflow-tooltip min-width="150" prop="son_count" label="子组织机构数量">
        <template slot-scope="scope">
          <span>数量（</span>
          <el-link type="primary" :href="'#/sys/module/button?module_code=' + scope.row.code">{{ scope.row.son_count }}
            <svg-icon v-show="scope.row.columnTypeShowIcon" icon-class="perfect-icon-eye-open1" class="el-icon--right" />
          </el-link>
          <span>）</span>
        </template>
      </el-table-column> -->
      <el-table-column
        min-width="180"
        show-overflow-tooltip
        prop="u_time"
        label="更新时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>

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
.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
.grid-content {
  border-radius: 2px;
  min-height: 36px;
  margin-bottom: 10px;
}
.bg-purple-light {
  background: #e5e9f2;
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
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getListApi, getSubCountApi } from '@/api/20_master/org/org'
import deepCopy from 'deep-copy'
// import '@/styles/org_png.scss' // 已改用el-tag，不再需要图片样式
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  // name: 'P00000173', // 页面id，和router中的name需要一致，作为缓存
  components: {},
  directives: { elDragDialog },
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
        // 级联选择器数据
        cascader: {
          data: null,
          value: ''
        },
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '',
          code: '',
          visible: 'null',
          is_del: '0' // 未删除
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: [],
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          code: '',
          descr: '',
          dbversion: 0
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200,
            simple_name: 20
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
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
      popSettingsData: {
        // 弹出窗口状态名称
        textMap: {
          update: '修改',
          insert: '新增',
          copyInsert: '添加子菜单'
        },
        // 按钮状态
        btnShowStatus: {
          showInsert: false,
          showUpdate: false,
          showCopyInsert: false
        },
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledReset: false,
          disabledInsert: false,
          disabledUpdate: false,
          disabledCopyInsert: false
        },
        // 重置按钮点击后
        btnResetStatus: false,
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: '',
        dialogFormVisible: false,
        // pop的check内容
        rules: [],
        rulesFirst: {
          code: [{ required: true, message: '请输入菜单组编号', trigger: 'change' }],
          name: [{ required: true, message: '请输入菜单组名称', trigger: 'change' }]
        },
        rulesSecond: {
          parent_id: [{ required: true, message: '请输入上级菜单', trigger: 'change' }],
          name: [{ required: true, message: '请选择菜单名称', trigger: 'change' }]
        },
        // 弹出的查询框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          dialogVisible: false,
          // 当前设置状态:false->选择（select）;true->重置(reset)----选择后置为true，修改时有数据置为true
          selectOrReset: false,
          selectOrResetName: '选择',
          selectOrResetIcon: 'el-icon-search',
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        // 弹出的查询框参数设置
        searchDialogDataTwo: {
          // 弹出框显示参数
          dialogVisible: false,
          // 当前设置状态:false->选择（select）;true->重置(reset)----选择后置为true，修改时有数据置为true
          selectOrReset: false,
          selectOrResetName: '选择',
          selectOrResetIcon: 'el-icon-search',
          // 点击确定以后返回的值
          selectedDataJson: {}
        }
      },
      // 导入窗口的状态
      popSettingsImport: {
        // 弹出窗口会否显示
        dialogFormVisible: false,
        // 模版文件地址
        templateFilePath: process.env.VUE_APP_BASE_API + '/api/v1/template.html?id=P00000030',
        // 错误数据文件
        errorFileUrl: ''
      },
      meDialogSetting: {
        program: this.$store.getters.program,
        selectedDataJson: this.$store.getters.selectedDataJson,
        dialogStatus: false
      }
    }
  },
  computed: {
    // 是否为新增菜单组
    isNewMenuGroup () {
      if (this.popSettingsData.dialogStatus === 'insert') {
        return true
      } else {
        return false
      }
    },
    // 是否为新增子菜单
    isNewMenu () {
      if (this.popSettingsData.dialogStatus === 'copyInsert') {
        return true
      } else {
        return false
      }
    },
    // 是否为修改
    isChangeModel () {
      if (this.popSettingsData.dialogStatus === this.PARAMETERS.STATUS_UPDATE) {
        return true
      } else {
        return false
      }
    },
    // 是否为根结点
    isRootNode () {
      if (this.dataJson.tempJson.type === null || this.dataJson.tempJson.type === '') {
        return true
      } else {
        return false
      }
    },
    // 是否为目录结点
    isCONTENTSNode () {
      if (this.dataJson.tempJson.type === this.CONSTANTS.DICT_SYS_MODULE_TYPE_CONTENTS) {
        return true
      } else {
        return false
      }
    },
    // 是否为菜单结点
    isMENUNode () {
      if (this.dataJson.tempJson.type === this.CONSTANTS.DICT_SYS_MODULE_TYPE_MENU) {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler (newVal, oldVal) {
        if (this.popSettingsData.btnResetStatus === true) {
          // 点击了重置按钮
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
          this.popSettingsData.btnDisabledStatus.disabledUpdate = true
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
          this.popSettingsData.btnResetStatus = false
        } else if (this.popSettingsData.dialogFormVisible) {
          // 有修改按钮高亮
          this.popSettingsData.btnDisabledStatus.disabledReset = false
          this.popSettingsData.btnDisabledStatus.disabledInsert = false
          this.popSettingsData.btnDisabledStatus.disabledUpdate = false
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = false
        }
      },
      deep: true
    },
    // 弹出窗口初始化，按钮不可用
    'popSettingsData.dialogFormVisible': {
      handler (newVal, oldVal) {
        if (this.popSettingsData.dialogFormVisible) {
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
          this.popSettingsData.btnDisabledStatus.disabledUpdate = true
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
        }
      }
    },
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler (newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showExport = true
        } else {
          this.settings.btnShowStatus.showExport = false
        }
      }
    },
    // 当前行的选中
    'dataJson.currentJson': {
      handler (newVal, oldVal) {
        if (this.dataJson.currentJson.id !== undefined) {
          // this.settings.btnShowStatus.doInsert = true
          this.settings.btnShowStatus.showUpdate = true
          this.settings.btnShowStatus.showCopyInsert = true
          this.settings.btnShowStatus.showExport = true
        } else {
          // this.settings.btnShowStatus.doInsert = false
          this.settings.btnShowStatus.showUpdate = false
          this.settings.btnShowStatus.showCopyInsert = false
          this.settings.btnShowStatus.showExport = false
        }
      },
      deep: true
    },
    'popSettingsData.searchDialogDataTwo.selectedDataJson': {
      handler (newVal, oldVal) {
        if (!newVal || Object.keys(newVal).length === 0) {
          this.dataJson.tempJson.type = null
          this.dataJson.tempJson.name = null
          this.dataJson.tempJson.module_id = null
          this.dataJson.tempJson.path = null
          this.dataJson.tempJson.route_name = null
          this.dataJson.tempJson.meta_title = null
          this.dataJson.tempJson.meta_icon = null
          this.dataJson.tempJson.component = null
          this.dataJson.tempJson.affix = null
        } else {
          this.dataJson.tempJson.type = this.popSettingsData.searchDialogDataTwo.selectedDataJson.type
          this.dataJson.tempJson.name = this.popSettingsData.searchDialogDataTwo.selectedDataJson.name
          this.dataJson.tempJson.module_id = this.popSettingsData.searchDialogDataTwo.selectedDataJson.id
          this.dataJson.tempJson.path = this.popSettingsData.searchDialogDataTwo.selectedDataJson.path
          this.dataJson.tempJson.route_name = this.popSettingsData.searchDialogDataTwo.selectedDataJson.route_name
          this.dataJson.tempJson.meta_title = this.popSettingsData.searchDialogDataTwo.selectedDataJson.meta_title
          this.dataJson.tempJson.meta_icon = this.popSettingsData.searchDialogDataTwo.selectedDataJson.meta_icon
          this.dataJson.tempJson.component = this.popSettingsData.searchDialogDataTwo.selectedDataJson.component
          this.dataJson.tempJson.affix = this.popSettingsData.searchDialogDataTwo.selectedDataJson.affix
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
    EventBus.$on(this.EMITS.EMIT_ORG_CHANGE, _data => {
      this.getDataList(_data)
    })
  },
  methods: {
    initTempJsonOriginal () {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal =
      {
        id: undefined,
        name: '',
        code: '',
        descr: '',
        dbversion: 0
      }
    },
    initShow () {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
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
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    // 行双点击，仅在dialog中有效
    handleRowDbClick (row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
      if (this.meDialogSetting.dialogStatus) {
        this.$emit('rowDbClick', this.dataJson.tempJson)
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
      this.dataJson.currentJson.id = undefined
    },
    handleRowUpdate (row, _rowIndex) {
      // 修改
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = _rowIndex
      this.popSettingsData.dialogStatus = this.PARAMETERS.STATUS_UPDATE
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },
    getDataList (val) {
      // 通知兄弟组件
      // this.$off(this.EMITS.EMIT_ORG_LOADING)
      EventBus.$emit(this.EMITS.EMIT_ORG_LOADING)
      // 查询逻辑
      this.settings.loading = true
      this.dataJson.searchForm = Object.assign({}, val)
      getListApi(this.dataJson.searchForm).then(response => {
        const recorders = response.data
        const newRecorders = recorders.map(v => {
          return { ...v, columnTypeShowIcon: false, columnNameShowIcon: false }
        })
        this.dataJson.listData = newRecorders
        // 为集团类型节点异步加载子节点数量
        this.loadSubCount(this.dataJson.listData)
        // 通知兄弟组件
        // this.$off(this.EMITS.EMIT_ORG_LOADING_OK)
        EventBus.$emit(this.EMITS.EMIT_ORG_LOADING_OK)
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },
    // 重置按钮
    doReset () {
      this.popSettingsData.btnResetStatus = true
      switch (this.popSettingsData.dialogStatus) {
        case this.PARAMETERS.STATUS_UPDATE:
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 初始化数据
          this.handleSelectOrReset()
          // 设置控件焦点focus
          this.$nextTick(() => {
            // this.$refs['selectOne'].focus()
          })
          break
        default:
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 设置控件焦点focus
          this.$nextTick(() => {
            // this.$refs['selectOne'].focus()
          })
          break
      }

      // 去除validate信息
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    // 关闭弹出窗口
    handlCloseDialog () {
      this.popSettingsImport.dialogFormVisible = false
      this.popSettingsData.dialogFormVisible = false
    },
    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (arr) {
      arr.forEach(function (val, index, arr) {
        // console.log(val, index, arr)
      })
      this.dataJson.multipleSelection = arr
    },
    renderHeaderIsDel: function (h, { column }) {
      return h('field-help', {
        props: {
          field: 'visibility',
          page: 'org-list',
          defaultLabel: column.label
        }
      })
    },
    // --------------弹出查询框：--------------

    // --------------弹出查询框：模块页面--------------
    // 选择or重置按钮的初始化
    initModuleSelectButton () {
      this.$nextTick(() => {
        this.$refs.selectOne.$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
      })
      this.popSettingsData.searchDialogDataTwo.selectOrReset = false
      this.popSettingsData.searchDialogDataTwo.selectOrResetName = '选择'
      this.popSettingsData.searchDialogDataTwo.selectOrResetIcon = 'el-icon-search'
    },
    handleModuleDialogClick () {
      if (this.popSettingsData.searchDialogDataTwo.selectOrReset === false) {
        // 选择按钮
        this.popSettingsData.searchDialogDataTwo.dialogVisible = true
      } else {
        // 重置按钮
        this.popSettingsData.searchDialogDataTwo.selectedDataJson = {}
      }
    },
    // 关闭对话框：确定
    handleModuleCloseOk (val) {
      this.popSettingsData.searchDialogDataTwo.selectedDataJson = val
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
      this.initSelectOrResectButton()
    },
    // 关闭对话框：取消
    handleModuletCloseCancel () {
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
    },
    // 级联事件
    handleCascaderChange (val) {
      // 数组中最后一个才是parent_id
      this.dataJson.tempJson.parent_id = val[val.length - 1]
    },
    // 删除按钮
    handleRealyDelete () {
      // 没有选择任何数据的情况
      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 选择全部的时候
      this.$confirm('请注意：将会删除当前结点以及子结点数据！！', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.settings.loading = true
        this.handleRealDeleteData()
      }).catch(action => {
        // 右上角X
        if (action !== 'close') {
          // 当前页所选择的数据导出
        }
      })
    },
    // 获取组织类型标签颜色
    getOrgTagType (type) {
      switch (type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          return 'warning' // 橙色
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          return '' // 蓝色（默认）
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          return 'success' // 绿色
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          return 'info' // 灰色
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
          return 'success' // 绿色，与左边树保持一致
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT:
          return 'primary' // 蓝色
        default:
          return 'info'
      }
    },
    // 获取组织类型标签文本
    getOrgTagText (type) {
      switch (type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          return '集团'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          return '企业'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          return '部门'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          return '岗位'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
          return '员工'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENANT:
          return '租户'
        default:
          return ''
      }
    },
    // 为集团、企业、部门类型节点异步加载子节点数量
    loadSubCount (listData) {
      if (!listData || !Array.isArray(listData)) return

      listData.forEach(item => {
        // 如果是集团、企业或部门类型，异步获取子节点数量
        if (item.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP ||
            item.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY ||
            item.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT) {
          // 集团类型传递org_type以获得详细分类统计，其他类型使用简单计数
          const orgType = item.type === this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP ? item.type : null
          getSubCountApi(item.id, orgType).then(response => {
            // 使用this.$set确保响应式更新
            this.$set(item, 'sub_count', response.data)
          }).catch(error => {
            console.error('获取子节点数量失败:', error)
            this.$set(item, 'sub_count', 0)
          })
        }

        // 如果有子数据，递归处理
        if (item.children && item.children.length > 0) {
          this.loadSubCount(item.children)
        }
      })
    },
    // 获取集团节点的显示文本
    getGroupDisplayText (subCount) {
      // 如果subCount是详细分类对象（包含sub_group_count和company_count）
      if (subCount && typeof subCount === 'object' &&
          subCount.hasOwnProperty('sub_group_count') &&
          subCount.hasOwnProperty('company_count')) {
        const parts = []

        // 子集团数量大于0时才显示
        if (subCount.sub_group_count > 0) {
          parts.push(`子集团:${subCount.sub_group_count}`)
        }

        // 企业数量大于0时才显示
        if (subCount.company_count > 0) {
          parts.push(`企业:${subCount.company_count}`)
        }

        // 如果有内容就用括号包围，没有就显示空
        return parts.length > 0 ? `(${parts.join('、')})` : ''
      } else {
        // 如果是简单数字，继续显示原格式
        return `(${subCount || 0})`
      }
    }
  }
}
</script>
