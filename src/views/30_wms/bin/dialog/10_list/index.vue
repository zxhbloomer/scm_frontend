<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    title="库位选择页面"
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
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.warehouse_name"
            clearable
            placeholder="仓库名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.location_name"
            clearable
            placeholder="库区名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.name"
            clearable
            placeholder="库位名称"
            @keyup.enter.native="handleSearch"
          />
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
        <el-table-column
          type="index"
          width="45"
          label="No"
          prop="No"
        />
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="130"
          prop="warehouse_name"
          label="所属仓库"
        />
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="130"
          prop="location_name"
          label="所属库区"
        />
        <el-table-column
          sortable="custom"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          min-width="130"
          prop="name"
          label="库位名称"
        />
        <el-table-column
          min-width="100"
          :sort-orders="settings.sortOrders"
          :auto-fit="true"
          label="启用状态"
          prop="enable"
        >
          <template v-slot="scope">
            <el-tooltip
              :content="scope.row.enable === 'false' ? '启用状态：未启用' : '启用状态：已启用'"
              placement="top"
            >
              <el-tag
                :type="scope.row.enable === 'false' ? 'danger' : 'success'"
                size="mini"
                effect="dark"
              >
                {{ scope.row.enable === 'false' ? '未启用' : '已启用' }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="dataJson.pageInfo.pageNum"
          :page-size="dataJson.pageInfo.pageSize"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="dataJson.pageInfo.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentPageChange"
        />
      </div>
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
import { getListApi } from '@/api/30_wms/bin/bin'

export default {
  name: 'BinDialogList',
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
      // 主数据结构
      dataJson: {
        // 搜索表单
        searchForm: {
          warehouse_name: '',
          location_name: '',
          name: ''
        },
        // 分页信息
        pageInfo: {
          pageNum: 1,
          pageSize: 20,
          total: 0
        },
        // 列表数据
        listData: []
      },
      // 页面设置
      settings: {
        loading: false,
        // 排序设置
        sortOrders: ['ascending', 'descending']
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
    // 初始化弹窗状态
    initDialogStatus () {
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
    },

    // 初始化显示
    initShow () {
      this.doResetSearch()
      this.loadData()
    },

    // 获取标签位置
    getLabelPosition () {
      return 'left'
    },

    // 加载数据
    async loadData () {
      try {
        this.settings.loading = true
        const params = {
          ...this.dataJson.searchForm,
          pageNum: this.dataJson.pageInfo.pageNum,
          pageSize: this.dataJson.pageInfo.pageSize
        }

        const response = await getListApi(params)

        if (response && response.data) {
          this.dataJson.listData = response.data.list || []
          this.dataJson.pageInfo.total = response.data.total || 0
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.showErrorMsg('加载数据失败')
      } finally {
        this.settings.loading = false
      }
    },

    // 搜索
    handleSearch () {
      this.dataJson.pageInfo.pageNum = 1
      this.loadData()
    },

    // 重置搜索
    doResetSearch () {
      this.dataJson.searchForm = {
        warehouse_name: '',
        location_name: '',
        name: ''
      }
      this.dataJson.pageInfo.pageNum = 1
      this.loadData()
    },

    // 行点击
    handleRowClick (row) {
      this.currentRowData = row
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', row)
    },

    // 行双击
    handleRowDbClick (row) {
      this.currentRowData = row
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', row)
      this.$emit('closeMeOk', this.$store.getters.selectedDataJson)
    },

    // 当前行改变
    handleCurrentChange (currentRow) {
      if (currentRow) {
        this.currentRowData = currentRow
        this.$store.dispatch('popUpSearchDialog/selectedDataJson', currentRow)
      }
    },

    // 排序改变
    handleSortChange (column) {
      // 处理排序逻辑
      this.loadData()
    },

    // 每页条数改变
    handleSizeChange (val) {
      this.dataJson.pageInfo.pageSize = val
      this.dataJson.pageInfo.pageNum = 1
      this.loadData()
    },

    // 当前页改变
    handleCurrentPageChange (val) {
      this.dataJson.pageInfo.pageNum = val
      this.loadData()
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
