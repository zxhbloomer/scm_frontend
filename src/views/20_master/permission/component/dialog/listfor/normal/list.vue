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
        min-width="100"
        :sort-orders="settings.sortOrders"
        prop="u_name"
        label="更新人"
      />
      <!-- 更新时间 -->
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        sortable="custom"
        min-width="180"
        :auto-fit="true"
        :sort-orders="settings.sortOrders"
        prop="u_time"
        label="更新时间"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column
        header-align="center"
        align="center"
        width="80"
        label="操作"
      >
        <template v-slot="scope">
          <el-button
            type="text"
            size="mini"
            icon="el-icon-view"
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
  name: 'PermissionListSelect',
  components: {},
  props: {
    height: {
      type: Number,
      default: 400
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          condition: null,
          // 查询条件
          name: '',
          is_del: false // 固定查询未删除的数据
        },
        // table使用的json
        listData: null,
        // 单条数据 json
        currentJson: null,
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: false,
        duration: 4000,
        sortOrders: ['ascending', 'descending', null]
      },
      // 防止死循环标志位
      isInitializing: false
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
    initShow () {
      // 初始化查询条件 - 固定查询未删除数据
      this.dataJson.searchForm.is_del = false
    },

    // 处理EventBus选择事件
    handleDialogSelectEvent (selectedData) {
      if (selectedData && selectedData.length > 0) {
        this.$nextTick(() => {
          this.initSelectedRows(selectedData)
        })
      }
    },

    // 初始化已选中的行
    initSelectedRows (selectedData) {
      if (!this.dataJson.listData || !selectedData) return

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
      if (this.dataJson.listData !== null) {
        const _index = this.dataJson.listData.lastIndexOf(row)
        return _index
      }
    },

    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },

    // 搜索
    handleSearch () {
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      if (this.$refs.multipleTable) {
        this.$refs.multipleTable.clearSelection()
      }
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

    // 排序变化（无分页版本 - 前端排序）
    handleSortChange (column) {
      if (!this.dataJson.listData || this.dataJson.listData.length === 0) {
        return
      }

      const prop = column.prop
      const order = column.order

      if (order === 'ascending') {
        this.dataJson.listData.sort((a, b) => {
          const aVal = a[prop] || ''
          const bVal = b[prop] || ''
          return aVal.toString().localeCompare(bVal.toString())
        })
      } else if (order === 'descending') {
        this.dataJson.listData.sort((a, b) => {
          const aVal = a[prop] || ''
          const bVal = b[prop] || ''
          return bVal.toString().localeCompare(aVal.toString())
        })
      }
    },

    // 重置查询区域
    doResetSearch () {
      this.dataJson.searchForm.name = ''
      this.handleSearch()
    },

    // 查看权限详情
    handleViewPermission (row) {
      // 通知父组件打开权限查看弹窗
      this.$emit('viewPermission', {
        permissionId: row.id,
        permissionName: row.name,
        permissionCode: row.code || '',
        headInfo: `权限详情：${row.name}（${row.code || row.id}）`
      })
    }
  }
}
</script>

<style scoped>
.permission-list-container {
  margin: 0;
  padding: 0;
}

.search-form {
  margin-bottom: 15px;
}

.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}

.el-button-group {
  margin-bottom: 10px;
}
</style>
