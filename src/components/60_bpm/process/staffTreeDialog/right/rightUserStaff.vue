<template>
  <div>
    <el-tabs
      style="float: left;"
      type="card"
      class="floatLeft"
      @tab-click="handleTabsClick"
    >
      <el-tab-pane>
        <template slot="label">当前组织下员工
          <el-badge
            :value="dataJson.tabsCount.currentOrgStaffCount"
            type="danger"
          />
        </template>
      </el-tab-pane>
    </el-tabs>
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      style="float: right;"
      label-position="getLabelPosition()"
    >
      <el-form-item>
        <el-input
          v-model.trim="dataJson.searchForm.login_name"
          clearable
          placeholder="用户名"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>

      <el-form-item>
        <el-input
          v-model.trim="dataJson.searchForm.name"
          clearable
          placeholder="员工姓名"
          @keyup.enter.native="handleSearch"
        />
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
      type="org_staff"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      height="500px"
      stripe
      border
      fit
      highlight-current-row
      tooltip-effect="light"
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
    >
      <el-table-column
        type="index"
        width="45"
        label="No"
      />

      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="login_name"
        label="用户名"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="员工姓名"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="company_simple_name"
        label="所属公司"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="dept_simple_name"
        label="默认部门"
      />
      <el-table-column
        sortable="custom"
        min-width="220"
        :sort-orders="settings.sortOrders"
        show-overflow-tooltip
        prop="simple_name"
        label="岗位信息"
      />
    </el-table>
  </div>
</template>

<script>
import { getStaffTabListApi } from '@/api/20_master/org/org'
import deepCopy from 'deep-copy'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  props: {
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
        // 当前表格中的索引，第几条
        rowIndex: 0,
        searchForm: {
          active_tabs_index: 0, // 当前被激活的页签
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION)
        },
        tabsCount: {
          currentOrgStaffCount: 0,
          allOrgStaffCount: 0
        },
        listData: [],
        currentJson: null,
        multipleSelection: [],
        // 选择的员工数据
        multipleSelData: this.data,
        nodes: []
      },
      settings: {
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        loading: false,
        btnShowStatus: {
          showInsert: false
        }
      }
    }
  },
  // 监听器
  watch: {
  },
  mounted () {
    // 描绘完成
    EventBus.$on(this.EMITS.EMIT_ORG_DIALOG_CHANGE, _data => {
      this.dataJson.searchForm.code = _data.code
      this.dataJson.searchForm.original_code = _data.code
      this.initShow()
    })
  },
  methods: {
    // tabs点击事件
    handleTabsClick (tab, event) {
      if (this.dataJson.searchForm.active_tabs_index === tab.index) {
        return
      }
      switch (tab.index) {
        case '0':
          // 当组织下员工
          this.initShow()
          break
        case '1':
          // 所有员工
          this.initShow()
          break
      }
      this.dataJson.searchForm.active_tabs_index = tab.index
    },
    initShow () {
      // 初始化查询
      this.getStaffDataList()
      // 插入选择的
      EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, this.data)
    },
    getStaffDataList () {
      // 查询逻辑
      this.settings.loading = true
      Object.assign(this.$data.dataJson.tabsCount, this.$options.data.call(this).dataJson.tabsCount)
      getStaffTabListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.tabsCount.currentOrgStaffCount = response.data.currentOrgStaffCount
        this.dataJson.tabsCount.allOrgStaffCount = response.data.allOrgStaffCount
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
        const recorders = response.data.list
        const newRecorders = recorders.map(v => {
          return { ...v, columnTypeShowIcon: false, columnNameShowIcon: false }
        })
        this.dataJson.listData = newRecorders
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}

      }).finally(() => {
        this.settings.loading = false

      })
    },
    // table选择框
    handleSelectionChange (val) {
        this.dataJson.multipleSelection = val
    },
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getStaffDataList()
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
      this.getStaffDataList()
    },
    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    // 行双点击，仅在dialog中有效
    handleRowDbClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      var _data = deepCopy(row)

      this.$emit('rowDbClick', _data)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = deepCopy(row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)

      // 点击添加已选
      EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, [])
      this.dataJson.multipleSelData = this.data
      this.dataJson.multipleSelData.push(row)

      // 插入选择的
      EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, this.dataJson.multipleSelData)
    },
  }
}
</script>

<style scoped>
::v-deep .el-tabs__header {
  margin: 0 0 3px;
}
</style>
