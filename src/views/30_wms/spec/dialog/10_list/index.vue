<template>
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    title="规格选择页面"
    :visible="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :modal="true"
    :append-to-body="true"
    :modal-append-to-body="false"
    width="1200px"
    destroy-on-close
    top="5vh"
  >
    <!-- 查询表单 -->
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="right"
    >
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.sku_code"
          clearable
          placeholder="规格编号"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="dataJson.searchForm.spec"
          clearable
          placeholder="规格名称"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="">
        <el-select
          v-model="dataJson.searchForm.enable"
          clearable
          placeholder="启用状态"
          disabled
        >
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item style="float:right">
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleSearch"
        >
          查询
        </el-button>
        <el-button
          icon="el-icon-refresh"
          @click="doResetSearch"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      ref="minusTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :canvas-auto-height="true"
      border
      highlight-current-row
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @sort-change="handleSortChange"
    >
      <el-table-column
        type="index"
        label="No"
        width="60"
        align="center"
      />

      <el-table-column
        prop="category_name"
        :auto-fit="true"
        label="商品类别"
        min-width="120"
        sortable="custom"
        :sort-orders="settings.sortOrders"
      />

      <el-table-column
        prop="goods_name"
        :auto-fit="true"
        label="物料名称"
        min-width="150"
        sortable="custom"
        :sort-orders="settings.sortOrders"
      />

      <el-table-column
        prop="spec"
        :auto-fit="true"
        label="规格名称"
        min-width="150"
        sortable="custom"
        :sort-orders="settings.sortOrders"
      />

      <el-table-column
        prop="sku_code"
        :auto-fit="true"
        label="规格编号"
        min-width="120"
        sortable="custom"
        :sort-orders="settings.sortOrders"
      />

      <el-table-column
        prop="enable"
        label="启用状态"
        min-width="100"
        align="center"
      >
        <template v-slot="scope">
          <el-tag
            :type="scope.row.enable ? 'success' : 'danger'"
            effect="plain"
          >
            {{ scope.row.enable ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="c_name"
        :auto-fit="true"
        label="创建人"
        min-width="100"
        sortable="custom"
        :sort-orders="settings.sortOrders"
      />

      <el-table-column
        prop="c_time"
        :auto-fit="true"
        label="创建时间"
        min-width="180"
        sortable="custom"
        :sort-orders="settings.sortOrders"
      >
        <template v-slot="scope">
          {{ formatDateTime(scope.row.c_time) }}
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

    <!-- 底部按钮 -->
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-divider />
      <el-button
        plain
        @click="handleDoCancel()"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        :disabled="dataJson.selectedRow === null"
        @click="handleDoOk()"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getListApi } from '@/api/30_wms/spec/spec'
import Pagination from '@/components/Pagination'
import deepCopy from 'deep-copy'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'SpecListDialog',
  components: { Pagination },
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // 业务数据
      dataJson: {
        // 查询表单
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          spec: '',
          sku_code: '',
          enable: true // 默认启用
        },
        // 分页数据
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // 表格数据
        listData: [],
        // 当前选中行
        selectedRow: null
      },

      // 页面设置
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        loading: false,
        duration: 4000
      }
    }
  },

  created () {
    this.getDataList()
  },

  methods: {
    // 获取数据列表
    async getDataList () {
      this.settings.loading = true
      try {
        // 设置查询参数
        this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
        this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size

        const response = await getListApi(this.dataJson.searchForm)
        this.dataJson.listData = response.data.records
        this.dataJson.paging.total = response.data.total
      } catch (error) {
        this.$notify({
          title: '查询失败',
          message: error.message,
          type: 'error',
          duration: this.settings.duration
        })
      } finally {
        this.settings.loading = false
      }
    },

    // 查询
    handleSearch () {
      this.dataJson.paging.current = 1
      this.getDataList()
    },

    // 排序变化处理
    handleSortChange (column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },

    // 重置搜索
    doResetSearch () {
      this.dataJson.searchForm.spec = ''
      this.dataJson.searchForm.sku_code = ''
      // 启用状态保持为true,不重置
      this.dataJson.paging.current = 1
      this.getDataList()
    },

    // 单击行
    handleRowClick (row) {
      this.dataJson.selectedRow = row
      this.$refs.minusTable.setCurrentRow(row)
    },

    // 双击行
    handleRowDbClick (row) {
      this.dataJson.selectedRow = row
      this.handleDoOk()
    },

    // 确定
    handleDoOk () {
      if (this.dataJson.selectedRow === null) {
        this.$message.warning('请选择一条数据')
        return
      }
      this.$emit('closeMeOk', this.dataJson.selectedRow)
    },

    // 取消
    handleDoCancel () {
      this.$emit('closeMeCancel')
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}
.dialog-footer-text {
  color: #606266;
  font-size: 14px;
}
</style>
