<template>
  <div class="app-container">
    <!-- 稻谷入库进度表 -->
    <FloatMenu />
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
    >
      <el-form-item>
        <el-input
          v-model.trim="dataJson.searchForm.contract_no"
          clearable
          placeholder="采购合同号"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <WarehouseSelect
          v-model="dataJson.searchForm.warehouse_id"
          init-placeholder="发货单位"
          :show-full-name="true"
          :warehouse-type="'1'"
          @change="(val) => dataJson.searchForm.warehouse_id = val"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model.trim="dataJson.searchForm.goods_name"
          clearable
          placeholder="物料名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="dataJson.searchForm.daterange"
          value-format="yyyy-MM-dd"
          type="daterange"
          align="right"
          style="width: 285px"
          unlink-panels
          range-separator="至"
          start-placeholder="开库开始日期"
          end-placeholder="开库结束日期"
          :picker-options="pickerOptions"
        />
      </el-form-item>
      <el-form-item>
        <select-dict
          v-model="dataJson.searchForm.batch"
          :para="CONSTANTS.DICT_BUSINESS_START_TIME"
          init-placeholder="业务启动日期"
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
          :loading="settings.loading"
          @click="handleSearch"
        >查询</el-button>
      </el-form-item>
    </el-form>

    <el-button-group>
      <el-button
        v-permission="'P_PURCAHSE_CONTRACT:EXPORT'"
        :disabled="!settings.btnShowStatus.showExport"
        type="primary"
        icon="el-icon-s-management"
        :loading="settings.loading"
        @click="handleExport"
      >导出</el-button>
    </el-button-group>

    <div class="div-sum">
      <div class="right">
        <span class="count-title">合计合同数量：</span><span class="count-data">{{ dataJson.sumData.contract_num == null?'0': isZhongLin ? formatNumber3(dataJson.sumData.contract_num) : formatNumberTwo(dataJson.sumData.contract_num,true,2) }}</span>
        <span class="count-title">合计入库数量：</span><span class="count-data">{{ dataJson.sumData.in_qty == null?'0': isZhongLin ? formatNumber3(dataJson.sumData.in_qty) : formatNumberTwo(dataJson.sumData.in_qty,true,2) }}</span>
        <span class="count-title">合计当日出库数量：</span><span class="count-data">{{ dataJson.sumData.today_out_qty == null?'0': isZhongLin ? formatNumber3(dataJson.sumData.today_out_qty) : formatNumberTwo(dataJson.sumData.today_out_qty,true,2) }}</span>
        <span class="count-title">合计出库数量：</span><span class="count-data">{{ dataJson.sumData.out_qty == null?'0': isZhongLin ? formatNumber3(dataJson.sumData.out_qty) : formatNumberTwo(dataJson.sumData.out_qty,true,2) }}</span>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      columns_index_key="true"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'start_date', order: 'ascending'}"
      style="width: 100%"
      @row-click="handleRowClick"
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
        align="left"
        min-width="160"
        prop="contract_no"
        label="采购合同号"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        align="left"
        prop="warehouse_name"
        label="直属库名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="200"
        align="left"
        prop="goods_name"
        label="物料名称"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="200"
        align="left"
        prop="spec"
        label="商品规格"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        align="right"
        prop="contract_num"
        label="合同数量"
      >
        <template v-slot="scope">
          {{ scope.row.contract_num === null?'': isZhongLin ? formatNumber3(scope.row.contract_num) : formatNumberTwo(scope.row.contract_num,true,2) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        :auto-fit="true"
        min-width="160"
        align="right"
        prop="in_qty"
        label="入库数量"
      >
        <template v-slot="scope">
          {{ scope.row.in_qty === null?'': isZhongLin ? formatNumber3(scope.row.in_qty) : formatNumberTwo(scope.row.in_qty,true,2) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="160"
        :auto-fit="true"
        align="right"
        prop="today_out_qty"
        label="当日出库数量"
      >
        <template v-slot="scope">
          {{ scope.row.today_out_qty === null?'': isZhongLin ? formatNumber3(scope.row.today_out_qty) : formatNumberTwo(scope.row.today_out_qty,true,2) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="160"
        :auto-fit="true"
        align="right"
        prop="out_qty"
        label="累计出库数量"
      >
        <template v-slot="scope">
          {{ scope.row.out_qty === null?'': isZhongLin ? formatNumber3(scope.row.out_qty) : formatNumberTwo(scope.row.out_qty,true,2) }}
        </template>
      </el-table-column>
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="160"
        :auto-fit="true"
        align="right"
        prop="start_date"
        label="开库日期"
      />
      <el-table-column
        sortable="custom"
        :sort-orders="settings.sortOrders"
        min-width="160"
        :auto-fit="true"
        align="right"
        prop="start_time"
        label="开库时间"
      />
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
.right {
  position: absolute;
  right: 10px;
  margin-right: 10px;
}
.left {
  position: absolute;
  left: 10px;
  margin-left: 10px;
}
.count-data {
  color: #1890ff;
  font-size: 20px;
}
.count-title {
  margin-left: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>

<script>
import { getPurchasePageListApi, getPurchaseListSumAPi, exportPurchaseApi } from '@/api/50_query/contract'
import Pagination from '@/components/Pagination'
import deepCopy from 'deep-copy'
import resizeMixin from './mixin/resizeHandlerMixin'
import permission from '@/directive/permission/index.js'
import constants_program from '@/common/constants/constants_program'
import WarehouseSelect from '@/views/30_wms/warehouse/components/warehouseSelect.vue'
import SelectDict from '@/components/00_dict/select/SelectDict.vue'
import { mapState } from 'vuex'

export default {
  components: { SelectDict, WarehouseSelect, Pagination },
  directives: { permission },
  mixins: [resizeMixin],
  props: {
  },
  data () {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近三个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }]
      },
      dataJson: {
        constants_program: constants_program,
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: {
            current: 1,
            size: 20,
            sort: 'start_date' // 排序
          },
          batch: '',
          warehouse_id: null,
          e_dt: null,
          daterange: []
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        sumData: {
          out_qty: 0,
          today_out_qty: 0,
          in_qty: 0,
          contract_num: 0
        },
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {},
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
        reset1: false,
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态
        btnShowStatus: {
          showExport: false
        },
        // loading 状态
        loading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      }
    }
  },
  computed: {
    ...mapState('dictDefaultValue', ['dict_value']),
    // 判断是否是中林环境
    isZhongLin () {
      const href = window.location.href
      if (href.indexOf('shyiyuanth') !== -1 || href.indexOf('172.21.1.249') !== -1 || href.indexOf('localhost') !== -1) {
        return true
      } else {
        return false
      }
    }
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
    },
    'dataJson.searchForm': {
      deep: true,
      handler () {
        if (this.dataJson.searchForm.daterange === null) {
          this.dataJson.searchForm.start_date_start = null
          this.dataJson.searchForm.start_date_end = null
        }
      }
    }
  },
  created () {
    this.dataJson.searchForm.batch = this.dict_value
    // 初始化查询
    this.getDataList()
  },
  mounted () {
    // 描绘完成
  },
  methods: {
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      if (this.dataJson.searchForm.daterange !== null && this.dataJson.searchForm.daterange !== undefined && this.dataJson.searchForm.daterange !== '') {
        this.dataJson.searchForm.start_date_start = this.dataJson.searchForm.daterange[0]
        this.dataJson.searchForm.start_date_end = this.dataJson.searchForm.daterange[1]
      }
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
      // 查询逻辑
      this.settings.loading = true
      getPurchasePageListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
      getPurchaseListSumAPi(this.dataJson.searchForm).then(response => {
        if (response.data !== null) {
          this.dataJson.sumData = response.data
        } else {
          this.dataJson.sumData = this.$options.data.call(this).dataJson.sumData
        }
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
      this.settings.reset1 = !this.settings.reset1
    },
    // 获取row-key
    getRowKeys (row) {
      return row.id
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
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
      if (this.dataJson.searchForm.daterange !== null && this.dataJson.searchForm.daterange !== undefined && this.dataJson.searchForm.daterange !== '') {
        this.dataJson.searchForm.start_date_start = this.dataJson.searchForm.daterange[0]
        this.dataJson.searchForm.start_date_end = this.dataJson.searchForm.daterange[1]
      }
      // 开始导出
      exportPurchaseApi(this.dataJson.searchForm).then(response => {
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
      this.dataJson.multipleSelection.forEach(function (value, index, map) {
        selectionJson.push(value.id)
      })
      // 开始导出
      exportPurchaseApi({ ids: selectionJson }).then(response => {
        this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    }

  }
}
</script>
