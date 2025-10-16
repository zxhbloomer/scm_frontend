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
      tooltip-effect="light"
      :default-sort="{prop: 'u_time', order: 'descending'}"
      row-key="login_name"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <el-table-column
        type="selection"
        width="55"
        :reserve-selection="true"
      />
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
        prop="company_name"
        label="所属公司"
      />
      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="150"
        :sort-orders="settings.sortOrders"
        prop="dept_name"
        label="默认部门"
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
        // 选择的员工数据，初始化为空数组，将在created/watch中设置
        multipleSelData: [],
        nodes: []
      },
      settings: {
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        loading: false,
        btnShowStatus: {
          showInsert: false
        }
      },
      // 防止循环调用的标志
      isSyncing: false
    }
  },
  // 监听器
  watch: {
    // 监听props数据变化
    'data': {
      handler (newVal) {
        if (newVal && Array.isArray(newVal)) {
          this.dataJson.multipleSelData = [...newVal]

          // 如果有新数据，发送给底部组件
          if (newVal.length > 0) {
            this.$nextTick(() => {
              EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, this.dataJson.multipleSelData)
            })
          }
        }
      },
      immediate: true
    }
  },
  created () {
    // 初始化选择数据
    if (this.data && Array.isArray(this.data) && this.data.length > 0) {
      this.dataJson.multipleSelData = deepCopy(this.data)
    }
  },
  mounted () {
    // 描绘完成
    EventBus.$on(this.EMITS.EMIT_ORG_DIALOG_CHANGE, _data => {
      this.dataJson.searchForm.code = _data.code
      this.dataJson.searchForm.original_code = _data.code
      this.initShow()
    })
    // 监听员工选择事件，同步更新内部数据
    EventBus.$on(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, _data => {
      // 更新内部维护的已选择数据，避免从props重新获取
      if (_data && Array.isArray(_data)) {
        // 检查数据是否真的有变化，避免不必要的同步
        const currentCount = this.dataJson.multipleSelData ? this.dataJson.multipleSelData.length : 0
        const newCount = _data.length

        if (currentCount !== newCount || this.hasDataChanged(_data)) {
          this.dataJson.multipleSelData = _data
          // 同步表格选择状态
          this.$nextTick(() => {
            this.syncTableSelection()
          })
        }
      }
    })

    // 如果有初始选择数据，发送给底部组件显示
    if (this.dataJson.multipleSelData && this.dataJson.multipleSelData.length > 0) {
      this.$nextTick(() => {
        EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, this.dataJson.multipleSelData)
      })
    }

    // 默认初始化显示（如果没有组织代码，使用默认值）
    this.$nextTick(() => {
      if (!this.dataJson.searchForm.code) {
        this.initShow()
      }
    })
  },
  beforeDestroy () {
    // 组件销毁时移除事件监听，避免内存泄漏
    EventBus.$off(this.EMITS.EMIT_ORG_DIALOG_CHANGE)
    EventBus.$off(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT)
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
      // 不要清空已选择的数据，保持之前的选择
      // 查询完成后会自动同步选择状态
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
          return {
            ...v,
            columnTypeShowIcon: false,
            columnNameShowIcon: false
          }
        })
        this.dataJson.listData = newRecorders
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}

        // 加载完成后，自动勾选已经选择的员工
        this.$nextTick(() => {
          this.syncTableSelection()
        })
      }).finally(() => {
        this.settings.loading = false
      })
    },
    // table选择框
    handleSelectionChange (val) {
      // 防止循环调用：如果正在同步选择状态，则不处理
      if (this.isSyncing) {
        return
      }

      this.dataJson.multipleSelection = val
      // 更新内部维护的已选择数据
      this.dataJson.multipleSelData = deepCopy(val)

      // 发送事件更新底部标签
      EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, this.dataJson.multipleSelData)
    },
    handleSearch () {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.paging.current = 1
      this.getStaffDataList()
      // 不清空已选择的数据，保持选择状态
      // 查询完成后会自动同步选择状态
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
    handleRowClick (row, column, event) {
      this.dataJson.rowIndex = this.getRowIndex(row)
      // 如果点击的不是checkbox列，则切换选择状态
      if (column && column.type !== 'selection' && this.$refs.multipleTable) {
        this.$refs.multipleTable.toggleRowSelection(row)
      }
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    // 同步表格选择状态，根据已选择的数据勾选表格中对应的行
    syncTableSelection () {
      if (!this.$refs.multipleTable) {
        return
      }

      // 设置同步标志，防止触发handleSelectionChange
      this.isSyncing = true

      try {
        // 先清空所有选择
        this.$refs.multipleTable.clearSelection()

        // 遍历已选择的数据
        if (this.dataJson.multipleSelData && this.dataJson.multipleSelData.length > 0) {
          this.dataJson.multipleSelData.forEach(selectedItem => {
            let row = null

            // 策略1：尝试多种标识字段匹配
            const selectedIdentifiers = [
              selectedItem.login_name,
              selectedItem.code,
              selectedItem.staff_code,
              selectedItem.user_code,
              selectedItem.employee_code,
              selectedItem.staff_id,
              selectedItem.user_id,
              selectedItem.id,
              String(selectedItem.staff_id),
              String(selectedItem.user_id),
              String(selectedItem.id)
            ].filter(Boolean) // 过滤掉undefined和null

            // 尝试用所有可能的标识进行匹配
            for (const selectedId of selectedIdentifiers) {
              row = this.dataJson.listData.find(item => {
                if (!item) return false
                return item.login_name === selectedId ||
                       item.code === selectedId ||
                       item.staff_code === selectedId ||
                       item.user_code === selectedId ||
                       item.employee_code === selectedId ||
                       item.staff_id === selectedId ||
                       item.user_id === selectedId ||
                       item.id === selectedId ||
                       String(item.staff_id) === selectedId ||
                       String(item.user_id) === selectedId ||
                       String(item.id) === selectedId
              })

              if (row) {
                break
              }
            }

            // 策略2：如果按标识找不到，尝试按姓名匹配
            if (!row && selectedItem.name) {
              row = this.dataJson.listData.find(item => {
                return item && item.name === selectedItem.name
              })
            }

            // 如果找到，勾选该行
            if (row) {
              this.$nextTick(() => {
                this.$refs.multipleTable.toggleRowSelection(row, true)
              })
            }
          })
        }
      } finally {
        // 确保同步标志被清除
        this.$nextTick(() => {
          this.isSyncing = false
        })
      }
    },
    // 检查数据是否有变化
    hasDataChanged (newData) {
      if (!this.dataJson.multipleSelData || !newData) {
        return true
      }

      if (this.dataJson.multipleSelData.length !== newData.length) {
        return true
      }

      // 检查是否有不同的login_name
      const currentLoginNames = new Set(this.dataJson.multipleSelData.map(item => item.login_name))
      const newLoginNames = new Set(newData.map(item => item.login_name))

      if (currentLoginNames.size !== newLoginNames.size) {
        return true
      }

      for (const loginName of newLoginNames) {
        if (!currentLoginNames.has(loginName)) {
          return true
        }
      }

      return false
    }
  }
}
</script>

<style scoped>
::v-deep .el-tabs__header {
  margin: 0 0 3px;
}
</style>
