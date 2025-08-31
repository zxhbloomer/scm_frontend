<template>
  <div class="permission-list-container">
    <!-- 搜索表单区域 -->
    <el-form
      ref="searchForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
      class="search-form"
    >
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="权限名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          plain
          icon="el-icon-search"
          @click="handleSearch"
        >查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          plain
          icon="perfect-icon-reset"
          @click="doResetSearch"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格区域 -->
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="height"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <el-table-column
        type="selection"
        width="45"
        prop="id"
      />
      <!-- 序号列 -->
      <el-table-column
        label="No"
        type="index"
        width="50"
        align="center"
      >
        <template v-slot="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <!-- 权限名称 -->
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :auto-fit="true"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="权限名称"
      />
      <!-- 备注 -->
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="200"
        :auto-fit="true"
        :sort-orders="settings.sortOrders"
        prop="descr"
        label="备注"
      />
      <!-- 更新人 -->
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        :auto-fit="true"
        sortable="custom"
        :sort-orders="settings.sortOrders"
        width="80"
        prop="u_name"
        label="更新人"
      />
      <!-- 更新时间 -->
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        :sort-orders="settings.sortOrders"
        width="160"
        prop="u_time"
        label="更新时间"
      />
      <!-- 操作 -->
      <el-table-column
        label="操作"
        width="60"
        align="center"
      >
        <template v-slot="scope">
          <el-button
            type="text"
            size="mini"
            @click="handleViewPermission(scope.row)"
          >查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getAllPermissionsApi } from '@/api/20_master/permission/permission'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'PositionPermissionList',
  props: {
    // 传入的权限数据
    data: {
      type: Array,
      default: () => []
    },
    // 表格高度
    height: {
      type: [Number, String],
      default: 400
    }
  },
  data () {
    return {
      // 表单和数据json
      dataJson: {
        // 列表数据
        listData: [],
        // 查询表单数据
        searchForm: {
          name: ''
        },
        // 多选数据
        multipleSelection: [],
        // 当前行数据
        currentJson: {}
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        duration: 4000,
        sortOrders: ['ascending', 'descending', null]
      },
      // 防止死循环标志位
      isInitializing: false,
      // 待处理的选中数据
      pendingSelectedData: []
    }
  },
  computed: {},
  // 监听器
  watch: {
    // 监听父组件传入的已选数据，初始化选中状态
    data: {
      handler (newVal) {
        if (newVal && newVal.length > 0) {
          this.$nextTick(() => {
            this.initSelectedRows(newVal)
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    this.initShow()
    this.getDataList()
  },
  mounted () {
    // 监听EventBus事件，初始化选中状态
    EventBus.$on(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, this.handleDialogSelectEvent)
  },
  beforeDestroy () {
    // 移除EventBus监听
    EventBus.$off(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, this.handleDialogSelectEvent)
  },
  methods: {
    // 初始化页面显示
    initShow () {
      // 初始化查询条件 - 固定查询未删除数据
      this.dataJson.searchForm.is_del = false
    },

    // 处理EventBus选择事件
    handleDialogSelectEvent (selectedData) {
      // 存储选中数据，以备数据加载完成后使用
      this.pendingSelectedData = selectedData

      // 无论有无数据都要更新选中状态（包括清空的情况）
      this.$nextTick(() => {
        this.initSelectedRows(selectedData || [])
      })
    },

    // 初始化已选中的行
    initSelectedRows (selectedData) {
      if (!this.dataJson.listData) return
      if (!Array.isArray(selectedData)) return

      // 设置初始化标志位，防止死循环
      this.isInitializing = true

      // 清空之前的选择
      if (this.$refs.multipleTable) {
        this.$refs.multipleTable.clearSelection()
      }

      selectedData.forEach(selectedItem => {
        const row = this.dataJson.listData.find(item => item.id === selectedItem.id)
        if (row && this.$refs.multipleTable) {
          this.$refs.multipleTable.toggleRowSelection(row, true)
        }
      })

      // 重置标志位
      this.$nextTick(() => {
        this.isInitializing = false
      })
    },

    // 获取行索引
    getRowIndex (row) {
      return this.dataJson.listData.findIndex(item => item.id === row.id)
    },

    // 单击行
    handleRowClick (row, column, event) {
      // 当前行变化
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },

    // 当前行变化
    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },

    // 获取数据列表（无分页）
    getDataList (val) {
      // 查询逻辑
      this.settings.loading = true
      const condition = {
        ...{ name: this.dataJson.searchForm.name },
        ...{ is_del: this.dataJson.searchForm.is_del } // 固定查询未删除数据
      }

      getAllPermissionsApi(condition).then(response => {
        // 后端直接返回权限列表数组，共通已处理响应判断
        this.dataJson.listData = response.data || []

        // 重新初始化选中状态
        if (this.data && this.data.length > 0) {
          this.$nextTick(() => {
            this.initSelectedRows(this.data)
          })
        }

        // 如果有待处理的选中数据，应用它们
        if (this.pendingSelectedData && this.pendingSelectedData.length > 0) {
          this.$nextTick(() => {
            this.initSelectedRows(this.pendingSelectedData)
          })
        }
      }).catch(error => {
        console.error('加载权限列表失败:', error)
        this.dataJson.listData = []
      }).finally(() => {
        this.settings.loading = false
      })
    },

    // table选择框变化
    handleSelectionChange (arr) {
      this.dataJson.multipleSelection = arr

      // 如果正在初始化选中状态，跳过事件通知防止死循环
      if (this.isInitializing) {
        return
      }

      // 通知父组件选择变化
      this.$emit('emitSelect', arr)
    },

    // 表格排序变化
    handleSortChange (column) {
      const { prop, order } = column
      console.log('排序变化:', prop, order)
      // 这里可以添加排序逻辑
    },

    // 查询
    handleSearch () {
      this.getDataList()
    },

    // 重置搜索
    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
      this.dataJson.searchForm.is_del = false // 保持固定查询条件
      this.getDataList()
    },

    // 查看权限
    handleViewPermission (row) {
      this.$emit('viewPermission', {
        permissionId: row.id,
        headInfo: row.name
      })
    }
  }
}
</script>

<style scoped>
.permission-list-container {
  width: 100%;
  height: 100%;
}

.search-form {
  margin-bottom: 10px;
}

.search-form .el-form-item {
  margin-bottom: 10px;
}

.search-form .el-form-item__label {
  font-weight: 500;
}
</style>
