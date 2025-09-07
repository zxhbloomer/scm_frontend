<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="仓库名称">
          <el-input v-model="listQuery.name" placeholder="仓库名称" clearable style="width: 200px;" class="filter-item" />
        </el-form-item>
        <el-form-item label="仓库编码">
          <el-input v-model="listQuery.code" placeholder="仓库编码" clearable style="width: 200px;" class="filter-item" />
        </el-form-item>
        <el-form-item label="仓库类型">
          <el-select v-model="listQuery.warehouse_type" clearable style="width:200px" class="filter-item" placeholder="请选择仓库类型">
            <el-option
              v-for="item in warehouseTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="listQuery.enable" placeholder="全部" clearable class="filter-item" style="width: 130px">
            <el-option
              v-for="item in enableOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
            查询
          </el-button>
          <el-button class="filter-item" type="primary" icon="el-icon-refresh" @click="resetQuery">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column label="仓库编码" prop="code" sortable="custom" min-width="120" align="center" />
      <el-table-column label="仓库名称" prop="name" sortable="custom" min-width="150" />
      <el-table-column label="仓库简称" prop="short_name" sortable="custom" min-width="120" />
      <el-table-column label="仓库类型" prop="warehouse_type" min-width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ getWarehouseTypeLabel(row.warehouse_type) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="监管企业" prop="charge_company_name" sortable="custom" min-width="150" />
      <el-table-column label="运营企业" prop="operate_company_name" sortable="custom" min-width="150" />
      <el-table-column label="联系人" prop="contact_person" sortable="custom" min-width="100" />
      <el-table-column label="联系电话" prop="mobile_phone" sortable="custom" min-width="120" />
      <el-table-column label="省份" prop="province" sortable="custom" min-width="100" />
      <el-table-column label="城市" prop="city" sortable="custom" min-width="100" />
      <el-table-column label="区域" prop="district" sortable="custom" min-width="100" />
      <el-table-column label="详细地址" prop="address" sortable="custom" min-width="200" />
      <el-table-column label="面积" prop="area" sortable="custom" min-width="100" align="center" />
      <el-table-column label="仓储容量" prop="warehouse_capacity" sortable="custom" min-width="100" align="center" />
      <el-table-column label="状态" prop="enable" min-width="80" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.enable === true ? 'success' : 'info'">
            {{ row.enable === true ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="c_name" sortable="custom" min-width="100" />
      <el-table-column label="创建时间" prop="c_time" sortable="custom" min-width="150" align="center">
        <template slot-scope="{row}">
          <span>{{ formatDateTime(row.c_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" prop="u_name" sortable="custom" min-width="100" />
      <el-table-column label="修改时间" prop="u_time" sortable="custom" min-width="150" align="center">
        <template slot-scope="{row}">
          <span>{{ formatDateTime(row.u_time) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { getListApi } from '@/api/30_wms/warehouse/warehouse'
import Pagination from '@/components/Pagination'

export default {
  name: 'WarehouseDialogList',
  components: {
    Pagination
  },
  data () {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        code: undefined,
        warehouse_type: undefined,
        enable: undefined,
        sort: '+id'
      },
      enableOptions: [
        { key: true, display_name: '启用' },
        { key: false, display_name: '停用' }
      ],
      warehouseTypeOptions: [
        { value: '1', label: '中央储备库' },
        { value: '2', label: '地方储备库' },
        { value: '3', label: '企业储备库' },
        { value: '4', label: '加工库' },
        { value: '5', label: '物流库' }
      ],
      multipleSelection: []
    }
  },
  created () {
    this.getList()
  },
  methods: {
    getList () {
      this.listLoading = true
      getListApi(this.listQuery).then(response => {
        this.list = response.data.list || response.data.items || []
        this.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter () {
      this.listQuery.page = 1
      this.getList()
    },
    resetQuery () {
      this.listQuery = {
        page: 1,
        limit: 20,
        name: undefined,
        code: undefined,
        warehouse_type: undefined,
        enable: undefined,
        sort: '+id'
      }
      this.getList()
    },
    sortChange (data) {
      const { prop, order } = data
      if (prop) {
        this.listQuery.sort = order === 'ascending' ? `+${prop}` : `-${prop}`
        this.handleFilter()
      }
    },
    handleSelectionChange (selection) {
      this.multipleSelection = selection
    },
    getWarehouseTypeLabel (value) {
      const option = this.warehouseTypeOptions.find(item => item.value === value)
      return option ? option.label : value
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 20px;
}
</style>
