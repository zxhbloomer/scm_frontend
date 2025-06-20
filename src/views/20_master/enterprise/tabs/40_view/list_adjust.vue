<template>
  <div class="app-container">
    <div class="edit-container">
      <div>
      <!--      <el-form-->
      <!--        ref="minusForm"-->
      <!--        :inline="true"-->
      <!--        :model="dataJson.searchForm"-->
      <!--        label-position="getLabelPosition()"-->
      <!--      >-->

      <!--        <el-form-item label="">-->

      <!--          <el-input-->
      <!--            v-model.trim="dataJson.searchForm.uscc"-->
      <!--            clearable-->
      <!--            placeholder="统一社会信用代码"-->
      <!--            @keyup.enter.native="handleSearch"-->
      <!--          />-->
      <!--        </el-form-item>-->
      <!--        <el-form-item label="">-->
      <!--          <el-input-->
      <!--            v-model.trim="dataJson.searchForm.name"-->
      <!--            clearable-->
      <!--            placeholder="企业名称"-->
      <!--            @keyup.enter.native="handleSearch"-->
      <!--          />-->
      <!--        </el-form-item>-->
      <!--        <el-form-item label="">-->
      <!--          <select-dicts-->
      <!--            v-model="dataJson.searchForm.type_ids"-->
      <!--            :filter-para="['8']"-->
      <!--            :para="CONSTANTS.DICT_M_CUSTOMER_TYPE"-->
      <!--            init-placeholder="企业类型"-->
      <!--          />-->
      <!--        </el-form-item>-->

      <!--        <el-form-item label="">-->
      <!--          <el-date-picker-->
      <!--            v-model="dataJson.searchForm.daterange"-->
      <!--            value-format="yyyy-MM-dd"-->
      <!--            type="daterange"-->
      <!--            align="right"-->
      <!--            unlink-panels-->
      <!--            range-separator="至"-->
      <!--            start-placeholder="创建开始日期"-->
      <!--            end-placeholder="创建结束日期"-->
      <!--            :picker-options="pickerOptions"-->
      <!--          />-->
      <!--        </el-form-item>-->
      <!--        <el-form-item label="">-->
      <!--          <select-dict-->
      <!--            v-model="dataJson.searchForm.audit_status"-->
      <!--            :para="CONSTANTS.DICT_M_CUSTOMER_STATUS"-->
      <!--            init-placeholder="状态"-->
      <!--          />-->
      <!--        </el-form-item>-->

      <!--        <el-form-item label="">-->
      <!--          <select-dict-->
      <!--            v-model="dataJson.searchForm.blacklist"-->
      <!--            :para="CONSTANTS.DICT_M_CUSTOMER_BLACKLIST"-->
      <!--            init-placeholder="是否黑名单"-->
      <!--          />-->
      <!--        </el-form-item>-->

      <!--        <el-form-item style="float:right">-->
      <!--          <el-button-->
      <!--            type="primary"-->
      <!--            plain-->
      <!--            :loading="settings.loading"-->
      <!--            icon="el-icon-search"-->
      <!--            @click="handleSearch"-->
      <!--          >查询</el-button>-->
      <!--        </el-form-item>-->
      <!--        <el-form-item style="float:right">-->
      <!--          <el-button-->
      <!--            v-popover:popover-->
      <!--            type="primary"-->
      <!--            plain-->
      <!--            icon="perfect-icon-reset"-->
      <!--            @click="doResetSearch"-->
      <!--          >重置</el-button>-->
      <!--        </el-form-item>-->

      <!--      </el-form>-->
      </div>

      <el-button
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
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
          :auto-fit="true"
          min-width="150"
          prop="uscc"
          label="统一社会信用代码"
          align="center"
        />
        <el-table-column
          sortable="custom"
          :auto-fit="true"
          min-width="120"
          prop="enterprise_name"
          label="企业名称"
          align="center"
        />

        <el-table-column
          sortable="custom"
          :auto-fit="true"
          min-width="120"
          prop="modify_reason"
          label="调整理由"
          align="center"
        />

        <el-table-column
          sortable="custom"
          :auto-fit="true"
          min-width="200"
          prop="c_time"
          label="审核时间"
          align="center"
        >
          <template v-slot="scope">
            {{ scope.row.c_time == null?'':formatDate(scope.row.c_time) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >

      <el-button-group class="floatRight">
        <el-button
          style="margin-left:10px;margin-top:auto"
          :disabled="settings.loading"
          size="medium"
          @click="handleCancel()"
        >返回</el-button>
      </el-button-group>

    </div>
  </div>
</template>

<script>
import {
  getAdjustDataApi
} from '@/api/20_master/enterprise/enterprise.js'
import constants_para from '@/common/constants/constants_para'
import resizeMixin from './list_adjustmixin'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission' // 权限判断指令
import urlUtil from '@/utils/urlUtil'

export default {
  components: { },
  directives: { elDragDialog, permission },
  mixins: [resizeMixin],
  props: {
    id: {
      type: Number,
      default: null
    },
    data: {
      type: Object,
      default: undefined
    }
  },
  data () {
    return {
      meDialogStatus: false,
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
          // 查询条件
          schedule_code: '',
          // settlement_status: null,
          waybill_contract_no: null
        },
        // 分页控件的json
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
        // 分页插件骨架 loading 状态
        skeletonLoading: true,
        sumLoading: false,
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      },
      popSettings: {
        // 弹出编辑页面
        one: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            dialogStatus: ''
          }
        },
        // 弹出编辑页面
        two: {
          visible: false,
          props: {
            id: undefined,
            data: {},
            dialogStatus: ''
          }
        },
        // 文件导出弹出编辑页面
        three: {
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

  },

  // 监听器
  watch: {
  },
  created () {
    this.init_List()

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
    getDataList () {
      // 查询逻辑
      this.settings.loading = true
      this.settings.skeletonLoading = true

      this.dataJson.searchForm.id = this.data.id

      if (this.dataJson.searchForm.daterange !== null && this.dataJson.searchForm.daterange !== undefined && this.dataJson.searchForm.daterange !== '') {
        this.dataJson.searchForm.start_time = this.dataJson.searchForm.daterange[0]
        this.dataJson.searchForm.over_time = this.dataJson.searchForm.daterange[1]
      }
      getAdjustDataApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data
      }).finally(() => {
        this.settings.loading = false
        this.settings.skeletonLoading = false
      })
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

      this.popSettings.one.props.data.searchForm = this.dataJson.searchForm
      this.dataJson.searchForm.id = this.popSettings.one.props.data.id

      const operate_tab_data = {
        operate_tab_info: { showEdit: true, name: '查看企业' },
        canEdit: false,
        editStatus: constants_para.STATUS_VIEW,
        data: this.dataJson.searchForm
      }

      this.$router.push({
        query: {
          p2: this.dataJson.currentJson.id
        }
      })

      this.$emit('emitView', operate_tab_data)
    },
    tableCellClassName ({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'validate_vehicle' && row.validate_vehicle !== '1') {
        return 'warning-cell'
      }
      return ''
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },
    // 取消按钮
    handleCancel () {
      this.$emit('emitReturn')
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
  margin: 0 0 1px;
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
.edit-container {
  height: calc(100vh - 190px);
  overflow-x: auto;
}
</style>
