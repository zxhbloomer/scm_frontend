<template>
  <div>
    <FloatMenu />

    <!-- 查询表单区域 -->
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

      <!-- 操作按钮 -->
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

    <!-- 功能按钮组 -->
    <el-button-group v-if="searchsetting.visible">
      <el-button
        v-permission="'P_LOCATION:ADD'"
        type="primary"
        icon="el-icon-circle-plus-outline"
        :loading="settings.loading"
        @click="handleInsert"
      >新增</el-button>
      <el-button
        v-permission="'P_LOCATION:UPDATE'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-edit-outline"
        :loading="settings.loading"
        @click="handleUpdate"
      >修改</el-button>
      <!--      导出按钮 结束-->
      <el-button
        v-permission="'P_LOCATION:DELETE'"
        :disabled="!settings.btnShowStatus.showDel"
        type="danger"
        icon="el-icon-delete"
        :loading="settings.loading"
        @click="handleDelButton"
      >删除</el-button>
      <el-button
        v-permission="'P_LOCATION:INFO'"
        :disabled="!settings.btnShowStatus.showUpdate"
        type="primary"
        icon="el-icon-info"
        :loading="settings.loading"
        @click="handleView"
      >查看</el-button>
      <el-button
        v-permission="'P_LOCATION:ENABLE'"
        :disabled="!settings.btnShowStatus.showEnable"
        type="primary"
        icon="el-icon-circle-check"
        :loading="settings.loading"
        @click="handleEnabled"
      >启用</el-button>
      <el-button
        v-permission="'P_LOCATION:DISABLE'"
        :disabled="!settings.btnShowStatus.showDisable"
        type="primary"
        icon="el-icon-circle-close"
        :loading="settings.loading"
        @click="handleDisAbled"
      >停用</el-button>
      <!--      导出按钮 开始-->
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_LOCATION:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExport"
      >开始导出</el-button>
      <el-button
        v-if="!settings.btnShowStatus.hidenExport"
        v-permission="'P_LOCATION:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleExportOk"
      >关闭导出</el-button>
      <el-button
        v-if="settings.btnShowStatus.hidenExport"
        v-permission="'P_LOCATION:EXPORT'"
        type="primary"
        icon="el-icon-zoom-in"
        :loading="settings.loading"
        @click="handleModelOpen"
      >导出</el-button>
    </el-button-group>

    <!-- 标准化数据表格 -->
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
      @selection-change="handleSelectionChange"
    >

      <!-- 多选框列 -->
      <el-table-column
        v-if="settings.exportModel"
        type="selection"
        width="45"
        prop="id"
      />

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

    <!-- 新增弹窗 -->
    <new-dialog
      v-if="popSettings.new.visible"
      :visible="popSettings.new.visible"
      @closeMeOk="handleNewDialogOk"
      @closeMeCancel="handleNewDialogCancel"
    />

    <!-- 编辑弹窗 -->
    <edit-dialog
      v-if="popSettings.edit.visible"
      :visible.sync="popSettings.edit.visible"
      :edit-data="popSettings.edit.data"
      @closeMeOk="handleEditDialogOk"
      @closeMeCancel="handleEditDialogCancel"
    />

    <!-- 查看弹窗 -->
    <view-dialog
      v-if="popSettings.view.visible"
      :visible="popSettings.view.visible"
      :data="popSettings.view.data"
      @closeMeCancel="handleViewDialogCancel"
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
.el-button-group {
  margin-bottom: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
</style>

<script>
import { getListApi, enabledSelectionApi, disAbledSelectionApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/30_wms/location/location'
import Pagination from '@/components/Pagination'
import NewDialog from '../../dialog/20_new/index.vue'
import EditDialog from '../../dialog/30_edit/index.vue'
import ViewDialog from '../../dialog/40_view/index.vue'
import FloatMenu from '@/components/FloatMenu/index.vue'
import permission from '@/directive/permission/index.js'
import constants_program from '@/common/constants/constants_program'
import deepCopy from 'deep-copy'

export default {
  name: constants_program.P_LOCATION,
  components: {
    Pagination,
    NewDialog,
    EditDialog,
    ViewDialog,
    FloatMenu
  },
  directives: { permission },
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
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          warehouse_name: '',
          warehouse_code: '',
          config_key: '',
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
        // 导出模式
        exportModel: false,
        // 按钮状态
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
      // 标准化弹窗状态管理
      popSettings: {
        // 新增弹窗
        new: {
          visible: false
        },
        // 编辑弹窗
        edit: {
          visible: false,
          data: null
        },
        // 查看弹窗
        view: {
          visible: false,
          data: null
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
  created () {
    // 作为独立页面，通过route路由打开时
    this.$options.name = this.$route.meta.page_code

    this.initShow()
    // 数据初始化 - 使用标准的Vue方式
    this.dataJson.tempJson = this.$options.data.call(this).dataJson.tempJson
  },
  mounted () {
    // 标准化：使用canvas-auto-height，无需手动高度计算
  },
  methods: {
    // 初始化显示
    initShow () {
      this.getDataList()
    },

    // 弹出框设置初始化
    initDialogStatus () {
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
      // 双击行 - 通常触发查看操作
      this.handleView()
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

    // 点击按钮 新增
    handleInsert () {
      this.popSettings.new.visible = true
    },

    // 点击按钮 更新
    handleUpdate () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.edit.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.edit.visible = true
    },

    // 查看
    handleView () {
      if (!this.dataJson.currentJson || !this.dataJson.currentJson.id) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      this.popSettings.view.data = Object.assign({}, this.dataJson.currentJson)
      this.popSettings.view.visible = true
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
      })
    },

    // 启用按钮
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

    // 停用按钮
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
      this.$confirm('是否要停用选中的数据？', '确认信息', {
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

    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      if (this.dataJson.currentJson.id !== undefined) {
        // 检查是否为默认库区 - 默认库区不允许修改、删除、启用、停用操作
        const isDefaultLocation = row.is_default === true

        if (isDefaultLocation) {
          // 默认库区：禁用所有修改操作按钮
          this.settings.btnShowStatus.showUpdate = false
          this.settings.btnShowStatus.showDel = false
          this.settings.btnShowStatus.showEnable = false
          this.settings.btnShowStatus.showDisable = false
        } else {
          // 非默认库区：正常的按钮控制逻辑
          this.settings.btnShowStatus.showUpdate = true
          this.settings.btnShowStatus.showDel = true

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
        }
      } else {
        // this.settings.btnShowStatus.doInsert = false
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showDel = false
        this.settings.btnShowStatus.showEnable = false
        this.settings.btnShowStatus.showDisable = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
    },

    // 表格多选变化处理
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
      // 更新按钮状态
      this.settings.btnShowStatus.showExport = val.length > 0
    },

    // 导出按钮 - 开始导出
    handleExport () {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnShowStatus.showExport = false
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
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // 部分数据导出
    handleExportSelectionData () {
      // loading
      this.settings.loading = true
      const selectionIds = []
      this.dataJson.multipleSelection.forEach(function (value, index, array) {
        selectionIds.push(value.id) // 直接推送ID值，不是对象
      })
      const searchData = { ids: selectionIds }
      // 开始导出
      exportSelectionApi(searchData).then(response => {
        // this.settings.loading = false
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // ------------------弹窗回调处理 start--------------------
    // 新增弹窗回调
    handleNewDialogOk (val) {
      this.doInsertModelCallBack(val)
    },

    handleNewDialogCancel () {
      this.popSettings.new.visible = false
    },

    // 编辑弹窗回调
    handleEditDialogOk (data) {
      // 编辑成功，关闭弹窗并更新数据
      this.popSettings.edit.visible = false
      // 设置到table中绑定的json数据源
      this.dataJson.listData.splice(this.dataJson.rowIndex, 1, data)
      // 设置到currentjson中
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

    // 处理插入回调
    doInsertModelCallBack (val) {
      console.log('新增回调数据:', val)
      if (val.return_flag) {
        this.popSettings.new.visible = false
        // 检查数据结构
        console.log('API响应数据:', val.data)
        console.log('要添加的数据:', val.data.data)

        // 设置到table中绑定的json数据源
        if (val.data && val.data.data) {
          this.dataJson.listData.unshift(val.data.data)
          console.log('数据已添加到列表，当前列表长度:', this.dataJson.listData.length)
        } else {
          console.warn('数据结构异常，尝试使用 val.data:', val.data)
          this.dataJson.listData.unshift(val.data)
        }

        this.$notify({
          title: '新增处理成功',
          message: val.data.message || '新增成功',
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
    }
    // ------------------弹窗回调处理 end--------------------
  }
}
</script>
