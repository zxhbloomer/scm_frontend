<template>
  <div class="app-container">
    <!-- 头部信息显示 -->
    <el-alert
      v-if="headInfo"
      :title="headInfo"
      type="info"
      :closable="false"
      style="margin-bottom: 20px;"
    />

    <!-- 操作按钮区域（只读模式只有返回按钮） -->
    <el-form
      ref="viewForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
      class="search-form-floatRight"
    >
      <el-form-item label="">
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-circle-plus-outline"
            :loading="settings.loading"
            @click="handleCancel"
          >返回</el-button>
        </el-button-group>
      </el-form-item>
    </el-form>

    <!-- 权限操作表格（只读） -->
    <el-table
      v-cloak
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      :height="height"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%"
      default-expand-all
      row-key="menu_id"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
    >
      <el-table-column
        header-align="center"
        type="index"
        width="45"
      />
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        min-width="120"
        prop="name"
        label="菜单名称"
      >
        <template v-slot="scope">
          <svg-icon
            v-if="scope.row.meta_icon"
            :icon-class="scope.row.meta_icon"
            :class="scope.row.meta_icon"
          />
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        show-overflow-tooltip
        min-width="50"
        prop="type_name"
        label="类型"
      >
        <template v-slot="scope">
          <span class="menu_png">
            <em
              v-if="scope.row.type ===CONSTANTS.DICT_SYS_MENU_TYPE_ROOT"
              class="root"
            >根结点</em>
            <em
              v-if="scope.row.type ===CONSTANTS.DICT_SYS_MENU_TYPE_TOPNAV"
              class="top_nav"
            >顶部导航栏</em>
            <em
              v-if="scope.row.type ===CONSTANTS.DICT_SYS_MENU_TYPE_NODE"
              class="node"
            >结点</em>
            <em
              v-if="scope.row.type ===CONSTANTS.DICT_SYS_MENU_TYPE_PAGE"
              class="page"
            >页面</em>
            <em
              v-if="scope.row.is_default"
              class="default"
            >默认菜单</em>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        label="权限"
        min-width="260"
      >
        <template v-slot:header>
          <field-help
            field="permission_status"
            page="permission-operation"
            default-label="权限"
          />
        </template>
        <template v-slot="operations">
          <el-row>
            <el-col
              v-for="item in operations.row.function_info"
              :key="item.id"
              :span="5"
            >
              <el-checkbox
                v-model="item.is_enable"
                :disabled="true"
                :true-label="1"
                :false-label="0"
                readonly
              >{{ item.name }}</el-checkbox>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        label="权限状态"
        min-width="80"
      >
        <template v-slot="operations">
          <div v-if="operations.row.function_info.length > 0">
            <el-tag
              :type="getPermissionStatusType(operations.row.function_info)"
              size="small"
            >
              {{ getPermissionStatusText(operations.row.function_info) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import '@/styles/menu_png.scss'
import { getOperationListApi } from '@/api/20_master/permission/operation'
import deepCopy from 'deep-copy'
import FieldHelp from '@/components/30_table/FieldHelp'

export default {
  name: 'PermissionView',
  components: { FieldHelp },
  directives: {},
  props: {
    height: {
      type: Number,
      default: 400
    },
    headInfo: {
      type: String,
      default: ''
    },
    permissionId: {
      type: [Number, String],
      default: null
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 查询条件
          permission_id: this.permissionId
        },
        // table使用的json
        listData: null,
        listDataCount: 0,
        // 当前表格中的索引，第几条
        rowIndex: 0,
        canEdit: false // 只读模式
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true,
        duration: 4000
      }
    }
  },
  computed: {},
  // 监听器
  watch: {
    permissionId: {
      handler (newVal) {
        if (newVal) {
          this.dataJson.searchForm.permission_id = newVal
          this.getDataList()
        }
      },
      immediate: true
    }
  },
  created () {
    this.initShow()
  },
  mounted () {},
  methods: {
    initShow () {
      // 初始化查询
      this.getDataList()
    },
    // 行点击
    handleRowClick (row) {
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    handleCurrentChange (row) {
      this.dataJson.currentJson = deepCopy(row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
    },
    // 获取行索引
    getRowIndex (row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    getDataList () {
      // 查询逻辑
      this.dataJson.searchForm.permission_id = this.permissionId
      this.settings.loading = true
      getOperationListApi(this.dataJson.searchForm).then(response => {
        const recorders = response.data.menu_data
        this.dataJson.listData = recorders
        this.dataJson.listDataCount = response.data.data_count
      }).finally(() => {
        this.dataJson.currentJson = undefined
        this.settings.loading = false
        this.$refs.multipleTable.setCurrentRow()
      })
    },
    handleCancel () {
      this.$emit('emitReturn')
    },
    /**
     * 获取权限状态类型（用于标签显示）
     */
    getPermissionStatusType (functionInfo) {
      if (!functionInfo || functionInfo.length === 0) return 'info'
      const enabledCount = functionInfo.filter(item => item.is_enable === true || item.is_enable === 1).length
      const totalCount = functionInfo.length

      if (enabledCount === 0) return 'danger'
      if (enabledCount === totalCount) return 'success'
      return 'warning'
    },
    /**
     * 获取权限状态文本
     */
    getPermissionStatusText (functionInfo) {
      if (!functionInfo || functionInfo.length === 0) return '无权限'
      const enabledCount = functionInfo.filter(item => item.is_enable === true || item.is_enable === 1).length
      const totalCount = functionInfo.length

      if (enabledCount === 0) return '全部禁用'
      if (enabledCount === totalCount) return '全部启用'
      return `部分启用(${enabledCount}/${totalCount})`
    },
    /**
     * 获取已启用菜单数量
     */
    getEnabledMenuCount () {
      if (!this.dataJson.listData) return 0
      return this.dataJson.listData.filter(item => item.is_enable === true || item.is_enable === 1).length
    },
    /**
     * 获取已启用权限数量
     */
    getEnabledPermissionCount () {
      if (!this.dataJson.listData) return 0
      let enabledCount = 0
      this.dataJson.listData.forEach(menu => {
        if (menu.function_info && menu.function_info.length > 0) {
          enabledCount += menu.function_info.filter(func => func.is_enable === true || func.is_enable === 1).length
        }
      })
      return enabledCount
    },
    /**
     * 获取当前时间
     */
    getCurrentTime () {
      return this.formatDateTime(new Date())
    },
    /**
     * 获取权限信息（只读模式）
     */
    getPermissionInfo () {
      return {
        detail: this.permissionDetail,
        listData: this.dataJson.listData,
        enabledMenuCount: this.getEnabledMenuCount(),
        enabledPermissionCount: this.getEnabledPermissionCount(),
        totalCount: this.dataJson.listDataCount
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  margin: 0;
  padding: 0;
}

.floatRight {
  float: right;
}
.floatLeft {
  float: left;
}
.el-form-item .el-select {
  width: 100%;
}
.grid-content {
  border-radius: 2px;
  min-height: 36px;
  margin-bottom: 10px;
}
.bg-purple-light {
  background: #e5e9f2;
}

.permission-detail-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
}

/* 只读模式的复选框样式 */
.el-checkbox.is-disabled .el-checkbox__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
}

.el-checkbox.is-disabled .el-checkbox__label {
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 权限状态标签样式 */
.el-tag--success {
  background-color: #f0f9ff;
  border-color: #67c23a;
  color: #67c23a;
}

.el-tag--warning {
  background-color: #fdf6ec;
  border-color: #e6a23c;
  color: #e6a23c;
}

.el-tag--danger {
  background-color: #fef0f0;
  border-color: #f56c6c;
  color: #f56c6c;
}
</style>
