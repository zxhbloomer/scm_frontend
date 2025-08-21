<template>
  <!-- 权限查看弹窗 -->
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    :title="getDialogTitle()"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="900px"
    destroy-on-close
  >
    <div class="permission-view-dialog-content">
      <!-- 权限基本信息展示 -->
      <el-descriptions title="权限基本信息" :column="2" border>
        <el-descriptions-item label="权限名称">{{ permissionData.name || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="启用状态">
          <el-tag :type="permissionData.is_enable ? 'success' : 'danger'">
            {{ permissionData.is_enable ? '已启用' : '已禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="删除状态">
          <el-tag :type="permissionData.is_del ? 'danger' : 'success'">
            {{ permissionData.is_del ? '已删除' : '正常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数据权限">
          <el-tag :type="permissionData.is_admin ? 'warning' : 'info'">
            {{ permissionData.is_admin ? '所有仓库权限' : '按仓库权限' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="权限描述" :span="2">
          {{ permissionData.descr || '暂无描述' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="permissionData.u_name" label="更新人">
          {{ permissionData.u_name }}
        </el-descriptions-item>
        <el-descriptions-item v-if="permissionData.u_time" label="更新时间">
          {{ formatDateTime(permissionData.u_time) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 权限操作详情（只读展示） -->
      <div v-if="operationData && operationData.length > 0" style="margin-top: 20px;">
        <h4 style="margin-bottom: 15px;">
          <i class="el-icon-key" style="margin-right: 5px;" />
          权限操作详情
        </h4>
        <el-tree
          :data="operationData"
          :props="treeProps"
          show-checkbox
          node-key="menu_id"
          :default-expanded-keys="expandedKeys"
          :default-checked-keys="checkedKeys"
          disabled
          class="permission-tree"
        >
          <template v-slot="{ node, data }">
            <span class="custom-tree-node">
              <svg-icon
                v-if="data.meta_icon"
                :icon-class="data.meta_icon"
                style="margin-right: 5px;"
              />
              <span>{{ data.name }}</span>
              <span v-if="data.type_name" class="tree-node-type">
                [{{ data.type_name }}]
              </span>
              <!-- 显示操作权限 -->
              <div v-if="data.function_info && data.function_info.length > 0" class="operation-info">
                <el-tag
                  v-for="item in data.function_info"
                  :key="item.id"
                  :type="item.is_enable ? 'success' : 'info'"
                  size="mini"
                  style="margin-right: 3px; margin-top: 3px;"
                >
                  {{ item.name }}
                </el-tag>
              </div>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 权限统计信息 -->
      <div style="margin-top: 20px;">
        <el-card class="box-card">
          <div slot="header">
            <span><i class="el-icon-data-analysis" /> 权限统计信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ getEnabledMenuCount() }}</div>
                <div class="stat-label">已启用菜单</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ getTotalMenuCount() }}</div>
                <div class="stat-label">菜单总数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ getEnabledOperationCount() }}</div>
                <div class="stat-label">已启用操作</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ getTotalOperationCount() }}</div>
                <div class="stat-label">操作总数</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getOperationListApi } from '@/api/20_master/permission/operation'

export default {
  name: 'PermissionViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    permissionData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      // 设置
      settings: {
        loading: false
      },
      // 权限操作数据
      operationData: [],
      // 树形控件配置
      treeProps: {
        children: 'children',
        label: 'name'
      },
      // 展开的节点
      expandedKeys: [],
      // 选中的节点
      checkedKeys: []
    }
  },
  computed: {
    listenVisible () {
      return this.visible
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        this.initDialog()
      }
    }
  },
  created () {},
  mounted () {},
  methods: {
    /**
     * 获取弹窗标题
     */
    getDialogTitle () {
      return `查看权限信息 - ${this.permissionData.name || ''}`
    },

    /**
     * 初始化弹窗
     */
    initDialog () {
      console.log('初始化权限查看弹窗', this.permissionData)
      if (this.permissionData && this.permissionData.id) {
        this.loadOperationData()
      }
    },

    /**
     * 加载权限操作数据
     */
    loadOperationData () {
      this.settings.loading = true
      const params = {
        permission_id: this.permissionData.id
      }

      getOperationListApi(params).then(response => {
        this.operationData = response.data.menu_data || []
        this.initTreeKeys()
      }).catch(error => {
        console.error('加载权限操作数据失败:', error)
        this.operationData = []
      }).finally(() => {
        this.settings.loading = false
      })
    },

    /**
     * 初始化树形控件的展开和选中状态
     */
    initTreeKeys () {
      const expandedKeys = []
      const checkedKeys = []

      const processNode = (nodes) => {
        nodes.forEach(node => {
          // 自动展开所有节点
          expandedKeys.push(node.menu_id)

          // 如果菜单启用，则选中
          if (node.is_enable) {
            checkedKeys.push(node.menu_id)
          }

          // 递归处理子节点
          if (node.children && node.children.length > 0) {
            processNode(node.children)
          }
        })
      }

      if (this.operationData && this.operationData.length > 0) {
        processNode(this.operationData)
      }

      this.expandedKeys = expandedKeys
      this.checkedKeys = checkedKeys
    },

    /**
     * 获取已启用菜单数量
     */
    getEnabledMenuCount () {
      if (!this.operationData) return 0

      let count = 0
      const countEnabled = (nodes) => {
        nodes.forEach(node => {
          if (node.is_enable) {
            count++
          }
          if (node.children && node.children.length > 0) {
            countEnabled(node.children)
          }
        })
      }

      countEnabled(this.operationData)
      return count
    },

    /**
     * 获取菜单总数
     */
    getTotalMenuCount () {
      if (!this.operationData) return 0

      let count = 0
      const countTotal = (nodes) => {
        nodes.forEach(node => {
          count++
          if (node.children && node.children.length > 0) {
            countTotal(node.children)
          }
        })
      }

      countTotal(this.operationData)
      return count
    },

    /**
     * 获取已启用操作数量
     */
    getEnabledOperationCount () {
      if (!this.operationData) return 0

      let count = 0
      const countOperations = (nodes) => {
        nodes.forEach(node => {
          if (node.function_info && node.function_info.length > 0) {
            count += node.function_info.filter(func => func.is_enable === true || func.is_enable === 1).length
          }
          if (node.children && node.children.length > 0) {
            countOperations(node.children)
          }
        })
      }

      countOperations(this.operationData)
      return count
    },

    /**
     * 获取操作总数
     */
    getTotalOperationCount () {
      if (!this.operationData) return 0

      let count = 0
      const countTotal = (nodes) => {
        nodes.forEach(node => {
          if (node.function_info && node.function_info.length > 0) {
            count += node.function_info.length
          }
          if (node.children && node.children.length > 0) {
            countTotal(node.children)
          }
        })
      }

      countTotal(this.operationData)
      return count
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.$emit('update:visible', false)
      this.$emit('onClose')
    }
  }
}
</script>

<style scoped>
.permission-view-dialog-content {
  padding: 10px 0;
}

.dialog-footer {
  text-align: right;
}

.custom-tree-node {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.tree-node-type {
  color: #909399;
  font-size: 12px;
  margin-left: 5px;
}

.operation-info {
  margin-top: 5px;
  width: 100%;
}

.permission-tree {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.box-card {
  margin-top: 10px;
}

.stat-item {
  text-align: center;
  padding: 15px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  line-height: 1;
}

/* 树形控件样式优化 */
.permission-tree ::v-deep .el-tree-node__content {
  padding: 8px 0;
}

.permission-tree ::v-deep .el-tree-node__label {
  font-weight: normal;
}

.permission-tree ::v-deep .el-checkbox__input.is-disabled .el-checkbox__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.permission-tree ::v-deep .el-checkbox__input.is-checked.is-disabled .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff;
}
</style>
