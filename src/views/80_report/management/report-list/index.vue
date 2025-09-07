<template>
  <div class="report-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="报表名称">
          <el-input v-model="searchForm.name" placeholder="请输入报表名称" clearable />
        </el-form-item>
        <el-form-item label="报表类型">
          <el-select v-model="searchForm.type" placeholder="请选择报表类型" clearable>
            <el-option label="表格报表" value="table" />
            <el-option label="图表报表" value="chart" />
            <el-option label="复合报表" value="complex" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已下线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作区域 -->
    <div class="action-area">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新建报表</el-button>
      <el-button type="success" icon="el-icon-download" @click="handleBatchExport">批量导出</el-button>
      <el-button type="danger" icon="el-icon-delete" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="报表名称" min-width="150">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleView(scope.row)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="报表类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="text" @click="handleDesign(scope.row)">设计</el-button>
            <el-button size="mini" type="text" @click="handlePreview(scope.row)">预览</el-button>
            <el-dropdown @command="handleCommand($event, scope.row)">
              <el-button size="mini" type="text">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="copy">复制</el-dropdown-item>
                <el-dropdown-item command="export">导出</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.status === 'draft'" command="publish">发布</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.status === 'published'" command="offline">下线</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-area">
        <el-pagination
          :current-page="pagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import reportApi from '@/api/80_report/management/report.js'

export default {
  name: 'ReportList',
  data () {
    return {
      loading: false,
      searchForm: {
        name: '',
        type: '',
        status: ''
      },
      tableData: [],
      selectedRows: [],
      pagination: {
        current: 1,
        size: 20,
        total: 0
      }
    }
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
    this.loadReportList()
  },
  methods: {
    /**
     * 加载报表列表
     */
    async loadReportList () {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          page: this.pagination.current,
          size: this.pagination.size
        }
        const result = await reportApi.getReportList(params)
        this.tableData = result.data.records
        this.pagination.total = result.data.total
      } catch (error) {
        this.$message.error('获取报表列表失败：' + error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 搜索
     */
    handleSearch () {
      this.pagination.current = 1
      this.loadReportList()
    },

    /**
     * 重置
     */
    handleReset () {
      this.searchForm = {
        name: '',
        type: '',
        status: ''
      }
      this.handleSearch()
    },

    /**
     * 新建报表
     */
    handleCreate () {
      this.$router.push('/report/management/report-list/create')
    },

    /**
     * 编辑报表
     */
    handleEdit (row) {
      this.$router.push(`/report/management/report-list/edit/${row.id}`)
    },

    /**
     * 设计报表
     */
    handleDesign (row) {
      this.$router.push(`/report/designer?reportId=${row.id}`)
    },

    /**
     * 预览报表
     */
    handlePreview (row) {
      this.$router.push(`/report/preview/${row.id}`)
    },

    /**
     * 查看报表
     */
    handleView (row) {
      this.$router.push(`/report/management/report-list/view/${row.id}`)
    },

    /**
     * 更多操作
     */
    async handleCommand (command, row) {
      switch (command) {
        case 'copy':
          await this.copyReport(row)
          break
        case 'export':
          await this.exportReport(row)
          break
        case 'publish':
          await this.publishReport(row)
          break
        case 'offline':
          await this.offlineReport(row)
          break
        case 'delete':
          await this.deleteReport(row)
          break
      }
    },

    /**
     * 复制报表
     */
    async copyReport (row) {
      try {
        await reportApi.copyReport(row.id)
        this.$message.success('复制成功')
        this.loadReportList()
      } catch (error) {
        this.$message.error('复制失败：' + error.message)
      }
    },

    /**
     * 发布报表
     */
    async publishReport (row) {
      try {
        await reportApi.publishReport(row.id)
        this.$message.success('发布成功')
        this.loadReportList()
      } catch (error) {
        this.$message.error('发布失败：' + error.message)
      }
    },

    /**
     * 选择变化
     */
    handleSelectionChange (selection) {
      this.selectedRows = selection
    },

    /**
     * 分页大小变化
     */
    handleSizeChange (size) {
      this.pagination.size = size
      this.loadReportList()
    },

    /**
     * 当前页变化
     */
    handleCurrentChange (current) {
      this.pagination.current = current
      this.loadReportList()
    },

    /**
     * 获取类型标签类型
     */
    getTypeTagType (type) {
      const typeMap = {
        table: '',
        chart: 'success',
        complex: 'warning'
      }
      return typeMap[type] || ''
    },

    /**
     * 获取类型名称
     */
    getTypeName (type) {
      const typeMap = {
        table: '表格报表',
        chart: '图表报表',
        complex: '复合报表'
      }
      return typeMap[type] || type
    },

    /**
     * 获取状态标签类型
     */
    getStatusTagType (status) {
      const statusMap = {
        draft: 'info',
        published: 'success',
        offline: 'danger'
      }
      return statusMap[status] || ''
    },

    /**
     * 获取状态名称
     */
    getStatusName (status) {
      const statusMap = {
        draft: '草稿',
        published: '已发布',
        offline: '已下线'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style lang="scss" scoped>
.report-list {
  .search-area {
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 4px;
  }

  .action-area {
    margin-bottom: 20px;

    .el-button {
      margin-right: 10px;
    }
  }

  .table-area {
    background: #fff;
    padding: 20px;
    border-radius: 4px;

    .pagination-area {
      margin-top: 20px;
      text-align: right;
    }
  }
}
</style>
