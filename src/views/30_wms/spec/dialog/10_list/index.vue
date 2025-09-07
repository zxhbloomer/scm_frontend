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
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
    >
      <el-table-column
        type="selection"
        width="55"
      />

      <el-table-column
        prop="sku_code"
        label="规格编号"
        min-width="120"
        align="center"
      />

      <el-table-column
        prop="spec"
        label="规格名称"
        min-width="150"
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
        label="创建人"
        min-width="100"
      />

      <el-table-column
        prop="c_time"
        label="创建时间"
        min-width="180"
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
      <div class="floatLeft">
        <span class="dialog-footer-text">
          已选择 {{ dataJson.multipleSelection.length }} 条数据
        </span>
      </div>
      <div class="floatRight">
        <el-button
          plain
          @click="handleDoCancel()"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :disabled="dataJson.multipleSelection.length === 0"
          @click="handleDoOk()"
        >
          确定
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getListApi } from '@/api/30_wms/spec/spec'
import Pagination from '@/components/Pagination'
import deepCopy from 'deep-copy'

export default {
  name: 'SpecListDialog',
  components: { Pagination },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 是否允许多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 已选择的数据
    selectedData: {
      type: Array,
      default: () => []
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
          enable: ''
        },
        // 分页数据
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // 表格数据
        listData: [],
        // 当前选中数据
        multipleSelection: []
      },

      // 页面设置
      settings: {
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

    // 重置搜索
    doResetSearch () {
      this.dataJson.searchForm = {
        pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
        spec: '',
        sku_code: '',
        enable: ''
      }
      this.dataJson.paging.current = 1
      this.getDataList()
    },

    // 选择变化
    handleSelectionChange (selection) {
      this.dataJson.multipleSelection = selection
    },

    // 单击行
    handleRowClick (row) {
      if (!this.multiple) {
        this.dataJson.multipleSelection = [row]
        this.$refs.minusTable.clearSelection()
        this.$refs.minusTable.toggleRowSelection(row, true)
      }
    },

    // 双击行
    handleRowDbClick (row) {
      if (!this.multiple) {
        this.dataJson.multipleSelection = [row]
        this.handleDoOk()
      }
    },

    // 确定
    handleDoOk () {
      this.$emit('closeMeOk', {
        selection: this.dataJson.multipleSelection
      })
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
.floatLeft {
  float: left;
}
.floatRight {
  float: right;
}
</style>
