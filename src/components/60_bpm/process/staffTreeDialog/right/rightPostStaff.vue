<template>
  <div>
    <el-tab-pane>
      <template slot="label">岗位信息
        <el-badge
          :value="dataJson.tabsCount.currentOrgStaffCount"
          type="danger"
        />
      </template>
    </el-tab-pane>
    <!--    </el-tabs>-->
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
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="45"
        prop="id"
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
        prop="group_full_simple_name"
        label="集团信息"
      />

      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="company_simple_name"
        label="企业信息"
      />

      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="group_full_simple_name"
        label="部门信息"
      />

      <el-table-column
        show-overflow-tooltip
        sortable="custom"
        min-width="120"
        :sort-orders="settings.sortOrders"
        prop="name"
        label="岗位名称"
      />

    </el-table>
  </div>
</template>

<script>
import { getPositionListApi } from '@/api/20_master/org/org'
import deepCopy from 'deep-copy'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  data () {
    return {
      dataJson: {
        searchForm: {
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
        multipleSelData: []
      },
      settings: {
        loading: false,
        btnShowStatus: {
          showInsert: false
        }
      }
    }
  },
  // 监听器
  watch: {
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler (newVal, oldVal) {
        if (newVal.length > 0 && newVal.length > oldVal.length) {
          // 第一次选择
          if (this.dataJson.multipleSelData.length === 0) {
            this.dataJson.multipleSelData = newVal
          } else {
            // 新增选择
            newVal.forEach(item => {
              const _index = this.dataJson.multipleSelData.find(k => k.id === item.id)
              if (_index == null) {
                this.dataJson.multipleSelData.push(item)
              }
            })
          }
        } else if (newVal.length > 0 && newVal.length < oldVal.length ||
          (this.dataJson.multipleSelData.length === 0 && this.dataJson.multipleSelection.length === 0)) {
          let selId = null
          oldVal.forEach(item => {
            const _index = newVal.find(k => k.id === item.id)
            if (_index == null) {
              selId = item
            }
          })

          // 删除数组选择
          this.dataJson.multipleSelData.forEach((item, index) => {
            if (item.id === selId.id) {
              this.dataJson.multipleSelData.splice(index, 1)
            }
          })
        }
        // 插入选择的
        EventBus.$emit(this.EMITS.EMIT_ORG_DIALOG_STAFF_SELECT, this.dataJson.multipleSelData)
      }
    }
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
    },
    initShow () {
      // 初始化查询
      this.getStaffDataList()
    },
    getStaffDataList () {
      // 查询逻辑
      this.settings.loading = true
      Object.assign(this.$data.dataJson.tabsCount, this.$options.data.call(this).dataJson.tabsCount)
      getPositionListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.tabsCount.currentOrgStaffCount = response.data.currentOrgStaffCount
        this.dataJson.tabsCount.allOrgStaffCount = response.data.allOrgStaffCount

        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
        // 反选
        this.toggleSelection()
      })
    },
    // table选择框
    handleSelectionChange (val) {
      this.dataJson.multipleSelection = val
    },
    // 反向勾选
    toggleSelection () {
      this.isLock = true
      if (this.dataJson.listData == null) {
        return
      }
      this.dataJson.listData.forEach((row) => {
        if (this.dataJson.multipleSelData.find(k => k.id === row.id) != null) {
          this.$refs.multipleTable.toggleRowSelection(row)
        }
      })
      this.isLock = false
    }
  }
}
</script>

<style scoped>
::v-deep .el-tabs__header {
  margin: 0 0 3px;
}
</style>
