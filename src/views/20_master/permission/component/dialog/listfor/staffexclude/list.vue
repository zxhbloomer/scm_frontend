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
  name: 'StaffExcludePermissionList',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    height: {
      type: [Number, String],
      default: 400
    }
  },
  data () {
    return {
      dataJson: {
        listData: [],
        searchForm: {
          name: ''
        },
        multipleSelection: [],
        currentJson: {}
      },
      settings: {
        loading: false,
        duration: 4000,
        sortOrders: ['ascending', 'descending', null]
      },
      isInitializing: false,
      pendingSelectedData: []
    }
  },
  computed: {},
  watch: {
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
    EventBus.$on(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, this.handleDialogSelectEvent)
  },
  beforeDestroy () {
    EventBus.$off(this.EMITS.EMIT_PERMISSION_DIALOG_SELECT, this.handleDialogSelectEvent)
  },
  methods: {
    initShow () {
      this.dataJson.searchForm.is_del = false
    },

    handleDialogSelectEvent (selectedData) {
      this.pendingSelectedData = selectedData

      this.$nextTick(() => {
        this.initSelectedRows(selectedData || [])
      })
    },

    initSelectedRows (selectedData) {
      if (!this.dataJson.listData) return
      if (!Array.isArray(selectedData)) return

      this.isInitializing = true

      if (this.$refs.multipleTable) {
        this.$refs.multipleTable.clearSelection()
      }

      selectedData.forEach(selectedItem => {
        const row = this.dataJson.listData.find(item => item.id === selectedItem.id)
        if (row && this.$refs.multipleTable) {
          this.$refs.multipleTable.toggleRowSelection(row, true)
        }
      })

      this.$nextTick(() => {
        this.isInitializing = false
      })
    },

    getRowIndex (row) {
      return this.dataJson.listData.findIndex(item => item.id === row.id)
    },

    handleRowClick (row, column, event) {
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },

    handleCurrentChange (row) {
      this.dataJson.currentJson = Object.assign({}, row)
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },

    getDataList (val) {
      this.settings.loading = true
      const condition = {
        ...{ name: this.dataJson.searchForm.name },
        ...{ is_del: this.dataJson.searchForm.is_del }
      }

      getAllPermissionsApi(condition).then(response => {
        this.dataJson.listData = response.data || []

        if (this.data && this.data.length > 0) {
          this.$nextTick(() => {
            this.initSelectedRows(this.data)
          })
        }

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

    handleSelectionChange (arr) {
      this.dataJson.multipleSelection = arr

      if (this.isInitializing) {
        return
      }

      this.$emit('emitSelect', arr)
    },

    handleSortChange (column) {
      const { prop, order } = column
      console.log('排序变化:', prop, order)
    },

    handleSearch () {
      this.getDataList()
    },

    doResetSearch () {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
      this.dataJson.searchForm.is_del = false
      this.getDataList()
    },

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
