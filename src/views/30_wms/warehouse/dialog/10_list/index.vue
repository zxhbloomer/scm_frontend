<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    title="仓库选择页面"
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
    <div>
      <el-form
        ref="minusForm"
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
      >
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.name"
            clearable
            placeholder="仓库名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
            v-model.trim="dataJson.searchForm.code"
            clearable
            placeholder="仓库编码"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="">
          <select-dict
            v-model="dataJson.searchForm.warehouse_type"
            :para="CONSTANTS.DICT_M_WAREHOUSE_TYPE"
            init-placeholder="仓库类型"
          />
        </el-form-item>
        <el-form-item label="">
          <el-select
            v-model="dataJson.searchForm.enable"
            clearable
            :disabled="dataJson.isSelect"
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
            @click="handleSearch"
          >查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        ref="multipleTable"
        v-loading="settings.loading"
        :data="dataJson.listData"
        :element-loading-text="'正在拼命加载中...'"
        element-loading-background="rgba(255, 255, 255, 0.5)"
        :columns-index-key="true"
        :canvas-auto-height="true"
        stripe
        border
        fit
        highlight-current-row
        :default-sort="{prop: 'u_time', order: 'descending'}"
        style="width: 100%"
        @current-change="handleCurrentChange"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
        @row-dblclick="handleRowDbClick"
        @selection-change="handleSelectionChange"
      >
        <!-- 多选框列 -->
        <el-table-column
          v-if="settings.exportModel"
          type="selection"
          width="45"
          prop="id"
        />
        <el-table-column
          type="index"
          width="45"
          label="No"
          align="center"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="120"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="code"
          label="仓库编码"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="150"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="name"
          label="仓库名称"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="120"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="short_name"
          label="仓库简称"
        />
        <el-table-column
          :auto-fit="true"
          min-width="100"
          align="center"
          prop="warehouse_type"
          label="仓库类型"
        >
          <template slot-scope="{row}">
            <show-dict :para="CONSTANTS.DICT_M_WAREHOUSE_TYPE" :value="row.warehouse_type" />
          </template>
        </el-table-column>
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="150"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="charge_company_name"
          label="监管企业"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="150"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="operate_company_name"
          label="运营企业"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="100"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="contact_person"
          label="联系人"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="120"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="mobile_phone"
          label="联系电话"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="100"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="province"
          label="省份"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="100"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="city"
          label="城市"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="100"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="district"
          label="区域"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="200"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="address"
          label="详细地址"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="150"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="cascader_areas_name"
          label="级联区域名称"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="120"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="zone_name"
          label="区域名称"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="100"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="area"
          label="面积"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="100"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="warehouse_capacity"
          label="仓储容量"
        />
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
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="100"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="c_name"
          label="创建人"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="150"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="c_time"
          label="创建时间"
        >
          <template slot-scope="{row}">
            {{ formatDateTime(row.c_time) }}
          </template>
        </el-table-column>
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="100"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="u_name"
          label="修改人"
        />
        <el-table-column
          :auto-fit="true"
          sortable="custom"
          min-width="150"
          :sort-orders="settings.sortOrders"
          show-overflow-tooltip
          prop="u_time"
          label="修改时间"
        >
          <template slot-scope="{row}">
            {{ formatDateTime(row.u_time) }}
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

      <!-- 新增仓库对话框 -->
      <new-dialog
        v-if="popSettings.new.visible"
        :visible.sync="popSettings.new.visible"
        :copy-data="popSettings.new.copyData"
        @closeMeOk="handleNewDialogOk"
        @closeMeCancel="handleNewDialogCancel"
      />

      <!-- 编辑仓库对话框 -->
      <edit-dialog
        v-if="popSettings.edit.visible"
        :visible.sync="popSettings.edit.visible"
        :edit-data="popSettings.edit.editData"
        @closeMeOk="handleEditDialogOk"
        @closeMeCancel="handleEditDialogCancel"
      />

      <!-- 查看仓库对话框 -->
      <view-dialog
        v-if="popSettings.view.visible"
        :visible.sync="popSettings.view.visible"
        :view-data="popSettings.view.viewData"
        @closeMeCancel="handleViewDialogCancel"
      />

      <!-- 仓库分组对话框 -->
      <set-warehouse-group-dialog
        v-if="popSettings.two.visible"
        :visible.sync="popSettings.two.visible"
        :props="popSettings.two.props"
        @closeMeOk="handleCloseDialogTwoOk"
        @closeMeCancel="handleCloseDialogTwoCancel"
      />

      <!--    vue-tour组件-->
      <v-tour name="myTour" :steps="steps" :options="tourOption" />

      <iframe
        id="refIframe"
        ref="refIframe"
        scrolling="no"
        frameborder="0"
        style="display:none"
        name="refIframe"
      >x</iframe>

    </div>

    <!-- 对话框底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button
        type="primary"
        :disabled="settings.btnDisabledStatus.disabledOk"
        @click="handleDoOk"
      >确定</el-button>
      <el-button
        plain
        @click="handleDoCancel"
      >取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getListApi } from '@/api/30_wms/warehouse/warehouse'
import Pagination from '@/components/Pagination'
import ShowDict from '@/components/00_dict/show/ShowDict.vue'
import newDialog from '@/views/30_wms/warehouse/dialog/20_new/index.vue'
import editDialog from '@/views/30_wms/warehouse/dialog/30_edit/index.vue'
import viewDialog from '@/views/30_wms/warehouse/dialog/40_view/index.vue'
import SelectDict from '@/components/00_dict/select/SelectDict.vue'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'

export default {
  name: 'WarehouseDialogList',
  components: {
    SelectDict, viewDialog, editDialog, newDialog, ShowDict,
    Pagination
  },
  directives: { elDragDialog },
  props: {
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
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '',
          code: '',
          warehouse_type: '',
          enable: 1,
          ids: []
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 单条数据 json
        currentJson: null,
        // 启用状态选项
        enableList: [
          { id: 1, value: '启用' },
          { id: 0, value: '停用' }
        ],
        // 是否为选择模式
        isSelect: true
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 导出模式
        exportModel: false,
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showDel: false,
          showEnable: false,
          showDisable: false,
          showExport: false,
          hidenExport: true
        },
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledOk: true
        },
        // loading 状态
        loading: true,
        duration: 4000
      },
      // 标准化弹窗状态管理
      popSettings: {
        new: { visible: false, copyData: null },
        edit: { visible: false, editData: null },
        view: { visible: false, viewData: null },
        two: { visible: false, props: null }
      },
      // Vue Tours 引导配置
      tourOption: {
        useKeyboardNavigation: false,
        labels: { buttonStop: '结束' },
        highlight: false
      },
      steps: [],
      // 多选数据
      multipleSelection: []
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
          this.settings.btnDisabledStatus.disabledOk = true
        } else {
          this.settings.btnDisabledStatus.disabledOk = false
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

    // 行双点击，直接选择
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

    // 表格多选变化处理
    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    // 确定
    handleDoOk () {
      this.$emit('closeMeOk', this.$store.getters.selectedDataJson)
    },

    // 取消
    handleDoCancel () {
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      this.$emit('closeMeCancel')
    },

    // 新增弹窗回调
    handleNewDialogOk (val) {
      this.popSettings.new.visible = false
      if (val.return_flag) {
        this.dataJson.listData.unshift(val.data.data)
        this.$notify({
          title: '新增处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '新增处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },

    handleNewDialogCancel () {
      this.popSettings.new.visible = false
    },

    // 编辑弹窗回调
    handleEditDialogOk (data) {
      this.popSettings.edit.visible = false
      this.dataJson.listData.splice(this.dataJson.rowIndex, 1, data)
      this.dataJson.currentJson = Object.assign({}, data)
      this.$notify({
        title: '更新处理成功',
        message: '编辑成功',
        type: 'success',
        duration: this.settings.duration
      })
    },

    handleEditDialogCancel () {
      this.popSettings.edit.visible = false
    },

    // 查看弹窗回调
    handleViewDialogCancel () {
      this.popSettings.view.visible = false
    },

    // 分组弹窗回调
    handleCloseDialogTwoOk () {
      this.popSettings.two.visible = false
    },

    handleCloseDialogTwoCancel () {
      this.popSettings.two.visible = false
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 20px;
}
.dialog-footer {
  text-align: center;
}
</style>
