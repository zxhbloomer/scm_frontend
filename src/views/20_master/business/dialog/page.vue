<template>
  <div>
    <el-form
      ref="searchForm"
      :inline="true"
      :model="searchForm"
      label-position="right"
      class="search-form-floatRight"
    >
      <el-form-item label="板块名称">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入板块名称"
          clearable
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="loading"
          @click="handleSearch"
        >查询</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="dataTable"
      v-loading="loading"
      :data="tableData"
      :canvas-auto-height="true"
      stripe
      border
      fit
      highlight-current-row
      @current-change="handleCurrentChange"
      @row-dblclick="handleRowDbClick"
    >
      <el-table-column
        type="index"
        width="50"
        label="No"
      />
      <el-table-column
        prop="code"
        label="板块编码"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        prop="name"
        label="板块名称"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        prop="remark"
        label="备注"
        min-width="200"
        show-overflow-tooltip
      />
    </el-table>

    <pagination
      :total="paging.total"
      :page.sync="paging.current"
      :limit.sync="paging.size"
      @pagination="getDataList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'BusinessPage',
  components: { Pagination },
  props: {
    meDialogStatus: {
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
      loading: false,
      searchForm: {
        name: '',
        current: 1,
        size: 20
      },
      paging: {
        current: 1,
        size: 20,
        total: 0
      },
      tableData: [
        // 模拟数据 - 实际应该从API获取
        { id: 1, code: 'TECH', name: '科技板块', remark: '科技相关业务' },
        { id: 2, code: 'FIN', name: '金融板块', remark: '金融相关业务' },
        { id: 3, code: 'MFG', name: '制造板块', remark: '制造业相关业务' },
        { id: 4, code: 'RET', name: '零售板块', remark: '零售相关业务' },
        { id: 5, code: 'SVC', name: '服务板块', remark: '服务业相关业务' }
      ],
      selectedRow: {}
    }
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
    this.getDataList()
  },
  methods: {
    getDataList () {
      this.loading = true
      // 模拟API调用延迟
      setTimeout(() => {
        this.paging.total = this.tableData.length
        this.loading = false
      }, 500)
    },
    handleSearch () {
      this.paging.current = 1
      this.getDataList()
    },
    handleCurrentChange (row) {
      this.selectedRow = row
      this.$parent.handleRowSelection(row)
    },
    handleRowDbClick (row) {
      this.selectedRow = row
      this.$parent.$emit('closeMeOk', row)
    }
  }
}
</script>
