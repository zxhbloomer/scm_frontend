<template>
  <div class="edit-container">
    <div style="padding-bottom: 10px">
      <el-button
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :columns-index-key="true"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      height="300"
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
        min-width="50"
        prop="version"
        label="版本"
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

    <detail_preview_template
      ref="detailPreviewTemplateRef"
      :visible="dataJson.popDetailDetail.visible"
      :title="dataJson.popDetailDetail.title"
      :data="dataJson.popDetailDetail.data"
      @closeMeCancel="handleCloseDetailPop"
    />
  </div>
</template>

<script>
import {
  getAdjustDataApi
} from '@/api/20_master/enterprise/enterprise.js'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令
import detail_preview_template from './dialog/index.vue'

export default {
  components: { detail_preview_template },
  directives: { elDragDialog, permission },
  mixins: [],
  props: {
    id: {
      type: Number,
      default: null
    },
    data: {
      type: Object,
      default: undefined
    },
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
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
        },
        popDetailDetail: {
          visible: false,
          title: '查看企业',
          data: {}
        },
        // 分页控件的json
        // table使用的json
        listData: null,
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        loading: true,
        duration: 4000
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
    this.init()
  },
  mounted () {
    // 描绘完成

  },
  beforeUpdate () {
    // 重新布局表格
    // this.$nextTick(() => {
    //   this.$refs.multipleTable.doLayout()
    // })
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
    },
    setWatch () {
      this.unWatch()
    },
    unWatch () {
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

      this.dataJson.searchForm.id = this.data.id

      getAdjustDataApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data
      }).finally(() => {
        this.settings.loading = false
      })
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

      this.dataJson.popDetailDetail.data = this.dataJson.currentJson
      this.dataJson.popDetailDetail.title = '查看企业名称[' + _data.enterprise_name + ']、版本[' + _data.version + ']的数据'
      this.dataJson.popDetailDetail.visible = true
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
    },
    /**
     * 关闭查看弹窗
     */
    handleCloseDetailPop () {
      this.dataJson.popDetailDetail.visible = false
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
  overflow-x: auto;
}
</style>
