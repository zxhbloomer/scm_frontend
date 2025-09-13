<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    title="库区选择页面"
    :visible="visible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1300px"
    destroy-on-close
    top="5vh"
  >
    <div class="app-container">
      <!-- 搜索表单 -->
      <el-form
        v-if="searchsetting.visible"
        ref="minusForm"
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
      >
        <!-- 仓库名称搜索 -->
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.warehouse_name"
            clearable
            placeholder="仓库名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <!-- 仓库编码搜索 -->
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.warehouse_code"
            clearable
            placeholder="仓库编码"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>

        <!-- 启用状态筛选 -->
        <el-form-item label="">
          <el-select
            v-model="dataJson.searchForm.enable"
            clearable
            placeholder="启用状态"
          >
            <el-option
              v-for="item in dataJson.enableList"
              :key="item.id"
              :label="item.value"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button
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

      <!-- 选择表格 -->
      <el-table
        ref="multipleTable"
        v-loading="settings.loading"
        :data="dataJson.listData"
        :element-loading-text="'正在拼命加载中...'"
        element-loading-background="rgba(255, 255, 255, 0.5)"
        :canvas-auto-height="true"
        :columns-index-key="true"
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
      >
        <!-- 序号列 -->
        <el-table-column
          type="index"
          width="45"
          label="No"
          align="center"
        />

        <!-- 标准化业务列配置 -->
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="130"
          :sort-orders="settings.sortOrders"
          prop="name"
          label="库区名称"
        />

        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="120"
          :sort-orders="settings.sortOrders"
          prop="short_name"
          label="库区简称"
        />

        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="120"
          :sort-orders="settings.sortOrders"
          prop="warehouse_name"
          label="所属仓库"
        />

        <!-- 状态列 -->
        <el-table-column
          :auto-fit="true"
          min-width="80"
          align="left"
          prop="enable"
          label="状态"
        >
          <template slot-scope="{row}">
            <span
              :style="{
                color: row.enable ? '#67C23A' : '#F56C6C',
                fontWeight: 'bold'
              }"
            >
              {{ row.enable ? '启用' : '停用' }}
            </span>
          </template>
        </el-table-column>

        <!-- 默认库位列 -->
        <el-table-column
          :auto-fit="true"
          min-width="80"
          align="center"
          prop="is_default"
          label="默认库位"
        >
          <template slot-scope="{row}">
            {{ row.is_default ? '是' : '否' }}
          </template>
        </el-table-column>

        <!-- 标准化系统字段 -->
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="120"
          :sort-orders="settings.sortOrders"
          prop="c_name"
          label="创建人"
        />

        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="180"
          :sort-orders="settings.sortOrders"
          prop="c_time"
          label="创建时间"
        >
          <template v-slot="scope">
            {{ formatDateTime(scope.row.c_time) }}
          </template>
        </el-table-column>

        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="120"
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

      <!-- 分页组件 -->
      <pagination
        ref="minusPaging"
        :total="dataJson.paging.total"
        :page.sync="dataJson.paging.current"
        :limit.sync="dataJson.paging.size"
        @pagination="getDataList"
      />
    </div>

    <!-- 弹窗按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button
        plain
        @click="handleDoCancel()"
      >取消</el-button>
      <el-button
        :disabled="btnDisabledStatus.disabledOk"
        @click="handleDoOk()"
      >确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getListApi } from '@/api/30_wms/location/location'
import Pagination from '@/components/Pagination'
import deepCopy from 'deep-copy'

export default {
  name: 'LocationDialogList',
  components: { Pagination },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      // 搜索设置
      searchsetting: {
        visible: true
      },
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          warehouse_name: '',
          warehouse_code: '',
          enable: 1,
          ids: []
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
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
        // 启用状态选项
        enableList: [
          { id: 1, value: '启用' },
          { id: 0, value: '停用' }
        ],
        // 表格多选数据
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式（弹窗中不需要，保持false）
        exportModel: false,
        // 按钮状态（弹窗中不需要操作按钮）
        btnShowStatus: {
          showEnable: false,
          showDisable: false,
          showUpdate: false,
          showDel: false,
          showExport: false,
          hidenExport: true
        },
        // loading 状态
        loading: true,
        duration: 4000
      },
      // 按钮状态：是否可用
      btnDisabledStatus: {
        disabledOk: false
      },
      // 当前选中行
      currentRowData: null
    }
  },
  computed: {
    listenSelectedDataJson () {
      return this.$store.getters.selectedDataJson
    },
    listenVisible () {
      return this.visible
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有选择
    listenSelectedDataJson: {
      handler (newVal, oldVal) {
        if (newVal === undefined || newVal === null || JSON.stringify(newVal) === '{}') {
          this.btnDisabledStatus.disabledOk = true
        } else {
          this.btnDisabledStatus.disabledOk = false
        }
      },
      deep: true,
      immediate: true
    },
    // 监听页面是否打开
    listenVisible: {
      handler (newVal, oldVal) {
        if (newVal) {
          // dialog打开后初始化
          this.$nextTick(() => {
            this.initDialogStatus()
            this.initShow()
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    // 设置dialog的返回
    this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
  },
  mounted () {
    // 使用canvas-auto-height，无需手动计算表格高度
  },
  methods: {
    // 初始化显示
    initShow () {
      this.getDataList()
    },

    // 弹出框设置初始化
    initDialogStatus () {
      // 重置选中状态
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
    },

    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },

    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      // 设置选中数据到store
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },

    // 行双击，直接选择
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      // 设置选中数据到store
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
      // 直接确认选择
      this.$emit('closeMeOk', this.$store.getters.selectedDataJson)
    },

    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getDataList()
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

    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
      // 确保enable默认值为启用状态
      this.dataJson.searchForm.enable = 1
    },

    // 获取row-key
    getRowKeys (row) {
      return row.id
    },

    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },

    // 确定
    handleDoOk () {
      this.$emit('closeMeOk', this.$store.getters.selectedDataJson)
    },

    // 取消
    handleDoCancel () {
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      this.$emit('closeMeCancel')
    }
  }
}
</script>

<style scoped>
.pagination-container {
  padding: 20px 0;
  text-align: right;
}
</style>
