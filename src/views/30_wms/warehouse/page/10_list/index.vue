<template>
  <div>
    <FloatMenu />
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
    <el-button-group>
      <el-button
        v-permission="'P_WAREHOUSE:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_WAREHOUSE:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <el-button
        v-permission="'P_WAREHOUSE:DELETE'"
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDelButton"
      >删除</el-button>
      <el-button
        v-permission="'P_WAREHOUSE:INFO'"
        :disabled="!settings.btnShowStatus.showView"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleViewFromButton"
      >查看</el-button>
      <el-button
        v-permission="'P_WAREHOUSE:ENABLE'"
        :disabled="!settings.btnShowStatus.showEnable"
        type="primary"
        icon="el-icon-circle-check"
        :loading="settings.loading"
        @click="handleEnabled"
      >启用</el-button>
      <el-button
        v-permission="'P_WAREHOUSE:DISABLE'"
        :disabled="!settings.btnShowStatus.showDisable"
        type="primary"
        icon="el-icon-circle-close"
        :loading="settings.loading"
        @click="handleDisAbled"
      >停用</el-button>
      <!-- 导出按钮 开始 -->
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_WAREHOUSE:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_WAREHOUSE:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnShowStatus.hidenExport"
        v-permission="'P_WAREHOUSE:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
      <!-- 导出按钮 结束 -->
    </el-button-group>
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
      :total="dataJson.searchForm.pageCondition.total || 0"
      :page.sync="dataJson.searchForm.pageCondition.current"
      :limit.sync="dataJson.searchForm.pageCondition.size"
      @pagination="handleSearch"
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
</template>

<script>
import { getListApi, enabledSelectionApi, disAbledSelectionApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/30_wms/warehouse/warehouse'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import newDialog from '../../dialog/20_new/index.vue'
import editDialog from '../../dialog/30_edit/index.vue'
import viewDialog from '../../dialog/40_view/index.vue'
import deepCopy from 'deep-copy'
import permission from '@/directive/permission/index.js' // 权限判断指令
import SelectDict from '@/components/00_dict/select/SelectDict'
import ShowDict from '@/components/00_dict/show/ShowDict'
import FloatMenu from '@/components/FloatMenu/index.vue'
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'WarehouseList',
  components: {
    Pagination,
    newDialog,
    editDialog,
    viewDialog,
    SelectDict,
    ShowDict,
    FloatMenu
  },
  directives: { elDragDialog, permission },
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      searchsetting: {
        visible: true
      },
      // 监听器
      watch: {
        unwatch_tempJson: null
      },
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: Object.assign({ total: 0 }, deepCopy(this.PARAMETERS.PAGE_CONDITION)),
          // 查询条件
          name: '',
          code: '',
          warehouse_type: '',
          enable: 1
        },
        // 当前行选择的json
        currentJson: {},
        // 表格数据
        listData: [],
        // 行的索引
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: [],
        // 启用状态选项
        enableList: [
          { id: 1, value: '启用' },
          { id: 0, value: '停用' }
        ],
        isSelect: false
      },
      // 页面设置json
      settings: {
        loading: false,
        duration: 4000,
        // 排序配置
        sortOrders: ['ascending', 'descending', null],
        // 按钮状态：是否显示
        btnShowStatus: {
          showUpdate: false,
          showDel: false,
          showView: false,
          showEnable: false,
          showDisable: false,
          showExport: false,
          hidenExport: true
        },
        // 导出模式
        exportModel: false
      },
      // 弹出框设置
      popSettings: {
        new: {
          visible: false,
          copyData: null
        },
        edit: {
          visible: false,
          editData: {}
        },
        view: {
          visible: false,
          viewData: {}
        },
        two: {
          visible: false,
          props: {
            id: '',
            data: null,
            model: '',
            serialData: null
          }
        }
      },
      // Vue Tours 引导配置
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
      ]
    }
  },
  computed: {
  },
  // 监听器
  watch: {
  },
  created () {
    // 设置页面的name 页面id，和router中的name需要一致，作为缓存
    this.$options.name = this.$route.meta.page_code
    this.handleSearch()
  },
  mounted () {
    // 描绘完成 - 使用canvas-auto-height自动管理表格高度
  },
  destroyed () {
    // 清理工作
  },
  methods: {
    // 权限检查方法
    checkPermission,

    // 获取标签位置
    getLabelPosition () {
      return 'right'
    },

    // 多选变化处理
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },

    // 查询
    handleSearch () {
      this.settings.loading = true
      getListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.searchForm.pageCondition.total = response.data.total
        this.settings.loading = false
      }).catch(error => {
        this.$notify({
          title: '查询失败',
          message: error.message,
          type: 'error',
          duration: this.settings.duration
        })
        this.settings.loading = false
      })
    },

    // 重置查询
    doResetSearch () {
      this.dataJson.searchForm = {
        pageCondition: Object.assign({ total: 0 }, deepCopy(this.PARAMETERS.PAGE_CONDITION)),
        name: '',
        code: '',
        warehouse_type: '',
        enable: 1
      }
      this.handleSearch()
    },

    // 排序变化
    handleSortChange ({ column, prop, order }) {
      // 使用与岗位管理一致的排序格式
      if (order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = prop
      } else if (order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + prop
      } else {
        this.dataJson.searchForm.pageCondition.sort = null
      }
      this.handleSearch()
    },

    // 当前行变化
    handleCurrentChange (row) {
      if (row === null || row === undefined) {
        // 处理null行的情况（表格排序、数据清空等）
        this.dataJson.currentJson = {}
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showDel = false
        this.settings.btnShowStatus.showView = false
        this.settings.btnShowStatus.showEnable = false
        this.settings.btnShowStatus.showDisable = false
        this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
        return
      }

      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showDel = true
        this.settings.btnShowStatus.showView = true
        this.settings.btnShowStatus.showExport = true
        // 智能控制启用/停用按钮：根据当前行状态决定哪个按钮可用
        if (row.enable) {
          // 当前行已启用，只能点击"停用"按钮
          this.settings.btnShowStatus.showEnable = false
          this.settings.btnShowStatus.showDisable = true
        } else {
          // 当前行已停用，只能点击"启用"按钮
          this.settings.btnShowStatus.showEnable = true
          this.settings.btnShowStatus.showDisable = false
        }
      } else {
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showDel = false
        this.settings.btnShowStatus.showView = false
        this.settings.btnShowStatus.showEnable = false
        this.settings.btnShowStatus.showDisable = false
        this.settings.btnShowStatus.showExport = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },

    // 获取行索引
    getRowIndex (row) {
      if (row === null || row === undefined || row.id === undefined) {
        return -1
      }
      return this.dataJson.listData.findIndex(item => item.id === row.id)
    },

    // 行双点击
    handleRowDbClick (row) {
      // 空实现，保留接口兼容性
    },

    // 新增
    handleInsert () {
      this.popSettings.new.copyData = null
      this.popSettings.new.visible = true
    },

    // 修改
    handleUpdate () {
      if (this.dataJson.currentJson.id) {
        this.dataJson.rowIndex = this.dataJson.currentJson.index
        this.popSettings.edit.editData = deepCopy(this.dataJson.currentJson)
        this.popSettings.edit.visible = true
      } else {
        this.$notify({
          title: '操作提示',
          message: '请先选择要修改的数据',
          type: 'warning',
          duration: this.settings.duration
        })
      }
    },

    // 查看
    handleView (row) {
      this.popSettings.view.viewData = deepCopy(row)
      this.popSettings.view.visible = true
    },
    // 从主按钮组查看 (需要验证当前选择的行)
    handleViewFromButton () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$alert('请在表格中选择数据进行查看', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'warning'
        })
        return
      }
      this.handleView(this.dataJson.currentJson)
    },

    // 统一的启用/停用操作处理方法

    // 启用选中项
    handleEnabled () {
      // 参数验证：检查是否选中了行
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$alert('请在表格中选择数据进行启用', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }

      // 确认对话框
      this.$confirm('是否要启用选中的数据？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 设置加载状态
        this.settings.loading = true

        // 调用启用API - 改为单对象参数
        enabledSelectionApi({ id: this.dataJson.currentJson.id }).then(response => {
          // 获取更新后的数据
          const updatedRecord = response.data

          // 直接更新列表项
          const index = this.dataJson.listData.findIndex(item => item.id === updatedRecord.id)
          if (index !== -1) {
            this.$set(this.dataJson.listData, index, updatedRecord)
          }

          // 同步当前选中项
          if (this.dataJson.currentJson && this.dataJson.currentJson.id === updatedRecord.id) {
            this.dataJson.currentJson = Object.assign({}, updatedRecord)
          }

          // 成功通知
          this.$notify({
            title: '启用成功',
            message: response.message,
            type: 'success',
            duration: this.settings.duration
          })
        }).catch(error => {
          // 失败通知
          this.$notify({
            title: '启用失败',
            message: error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          // 清除加载状态
          this.settings.loading = false
        })
      }).catch(() => {
        // 用户取消操作，无需处理
      })
    },

    // 停用选中项
    handleDisAbled () {
      // 参数验证：检查是否选中了行
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$alert('请在表格中选择数据进行停用', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
        return
      }

      // 确认对话框
      this.$confirm('是否要停用选中的数据？注意：停用前会检查仓库库存。', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // 设置加载状态
        this.settings.loading = true

        // 调用停用API - 改为单对象参数
        disAbledSelectionApi({ id: this.dataJson.currentJson.id }).then(response => {
          // 获取更新后的数据
          const updatedRecord = response.data

          // 直接更新列表项
          const index = this.dataJson.listData.findIndex(item => item.id === updatedRecord.id)
          if (index !== -1) {
            this.$set(this.dataJson.listData, index, updatedRecord)
          }

          // 同步当前选中项
          if (this.dataJson.currentJson && this.dataJson.currentJson.id === updatedRecord.id) {
            this.dataJson.currentJson = Object.assign({}, updatedRecord)
          }

          // 成功通知
          this.$notify({
            title: '停用成功',
            message: response.message,
            type: 'success',
            duration: this.settings.duration
          })
        }).catch(error => {
          // 失败通知
          this.$notify({
            title: '停用失败',
            message: error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          // 清除加载状态
          this.settings.loading = false
        })
      }).catch(() => {
        // 用户取消操作，无需处理
      })
    },

    /**
     * 切换到导出模式
     */
    handleModelOpen () {
      this.settings.exportModel = true
      this.settings.btnShowStatus.hidenExport = false
      this.$tours['myTour'].start()
    },
    /**
     * 完成导出
     */
    handleExportOk () {
      this.settings.btnShowStatus.hidenExport = true
      this.settings.btnShowStatus.showExport = false
      this.settings.exportModel = false
      // 清空已选择的数据，确保完全退出导出模式
      this.$refs.multipleTable.clearSelection()
    },
    // 导出按钮（导出模式下）
    handleExport () {
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        })
      } else if (this.dataJson.multipleSelection.length === this.dataJson.listData.length) {
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全数据导出',
          cancelButtonText: '当前页数据导出'
        }).then(() => {
          this.handleExportAllData()
        }).catch(action => {
          if (action !== 'close') {
            this.handleExportSelectionData()
          }
        })
      } else {
        this.handleExportSelectionData()
      }
    },
    // 全部数据导出
    handleExportAllData () {
      // loading
      this.settings.loading = true
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // 选中行数据导出（多选模式）
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      // 多选模式：构造选中行ID数组
      const selectionIds = this.dataJson.multipleSelection.map(item => item.id)
      const searchData = { ids: selectionIds }
      // 开始导出
      exportSelectionApi(searchData).then(response => {
        // this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 新增对话框回调
    handleNewDialogOk (val) {
      this.doInsertModelCallBack(val)
    },

    handleNewDialogCancel () {
      this.popSettings.new.visible = false
    },

    // 编辑对话框回调
    handleEditDialogOk (val) {
      this.doUpdateModelCallBack(val)
    },

    handleEditDialogCancel () {
      this.popSettings.edit.visible = false
    },

    // 查看对话框回调
    handleViewDialogCancel () {
      this.popSettings.view.visible = false
    },

    // 处理插入回调
    doInsertModelCallBack (val) {
      if (val.return_flag) {
        this.popSettings.new.visible = false
        // 设置到table中绑定的json数据源
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

    // 处理更新回调
    doUpdateModelCallBack (val) {
      if (val.return_flag) {
        this.popSettings.edit.visible = false
        // 设置到table中绑定的json数据源
        this.dataJson.listData.splice(this.dataJson.rowIndex, 1, val.data.data)
        // 设置到currentjson中
        this.dataJson.currentJson = Object.assign({}, val.data.data)
        this.$notify({
          title: '更新处理成功',
          message: val.data.message,
          type: 'success',
          duration: this.settings.duration
        })
      } else {
        this.$notify({
          title: '更新处理失败',
          message: val.error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }
    },

    handleCloseDialogTwoOk (val) {
      this.popSettings.two.visible = false
    },

    handleCloseDialogTwoCancel () {
      this.popSettings.two.visible = false
    },

    // 删除按钮操作
    handleDelButton () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.$notify({
          title: '操作提示',
          message: '请先选择要删除的数据',
          type: 'warning',
          duration: this.settings.duration
        })
        return
      }
      this.$confirm('删除后无法恢复，确认要删除该条数据吗？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        this.settings.loading = true
        const selectionJson = { 'id': this.dataJson.currentJson.id }
        deleteApi(selectionJson).then((_data) => {
          this.$notify({
            title: '删除成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
          this.handleSearch()
        }, (_error) => {
          this.$notify({
            title: '删除失败',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
        }).finally(() => {
          this.settings.loading = false
        })
      }).catch(action => {
      })
    }
  }
}
</script>

<style scoped>
.el-button-group {
  margin-bottom: 10px;
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
.perfect_popper .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>
