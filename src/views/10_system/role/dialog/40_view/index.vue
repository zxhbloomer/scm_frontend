<template>
  <el-dialog
    v-el-drag-dialog
    title="查看角色"
    :visible="visible"
    width="720px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="false"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic">
        <el-form
          :model="formData"
          label-position="right"
          label-width="120px"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="角色编码：">
                <el-input v-model="formData.code" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色名称：">
                <el-input v-model="formData.name" :disabled="true" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注：">
            <el-input
              v-model="formData.descr"
              type="textarea"
              :rows="3"
              :disabled="true"
            />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="删除状态：">
                <el-tag :type="formData.is_del ? 'danger' : 'success'">
                  {{ formData.is_del ? '已删除' : '正常' }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="创建时间：">
                <el-input v-model="displayCreateTime" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间：">
                <el-input v-model="displayUpdateTime" :disabled="true" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="数据版本：">
                <el-input v-model="formData.dbversion" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="ID：">
                <el-input v-model="formData.id" :disabled="true" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="权限信息" name="permission">
        <div>
          <div style="margin-bottom: 15px; color: #606266;">
            <i class="el-icon-info" />
            已分配权限：{{ permissionList.length }} 个
          </div>
          <!-- 显示已分配的权限列表（只读） -->
          <el-table :data="permissionList" height="350" border>
            <el-table-column prop="code" label="权限编码" width="120" show-overflow-tooltip />
            <el-table-column prop="name" label="权限名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="module" label="所属模块" width="120" show-overflow-tooltip />
            <el-table-column prop="type" label="权限类型" width="100">
              <template v-slot="scope">
                <el-tag size="mini" :type="getPermissionTypeTag(scope.row.type)">
                  {{ getPermissionTypeText(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assign_time" label="分配时间" width="160">
              <template v-slot="scope">
                {{ formatDateTime(scope.row.assign_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="权限描述" min-width="200" show-overflow-tooltip />
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="员工信息" name="staff">
        <div>
          <div style="margin-bottom: 15px; color: #606266;">
            <i class="el-icon-user" />
            关联员工：{{ staffList.length }} 人
          </div>
          <!-- 显示已关联的员工列表（只读） -->
          <el-table :data="staffList" height="350" border>
            <el-table-column prop="code" label="员工编号" width="120" show-overflow-tooltip />
            <el-table-column prop="name" label="员工姓名" min-width="120" show-overflow-tooltip />
            <el-table-column prop="dept_name" label="所属部门" min-width="150" show-overflow-tooltip />
            <el-table-column prop="position_name" label="岗位" width="120" show-overflow-tooltip />
            <el-table-column prop="assign_time" label="关联时间" width="160">
              <template v-slot="scope">
                {{ formatDateTime(scope.row.assign_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template v-slot="scope">
                <el-tag size="mini" :type="scope.row.is_enable ? 'success' : 'info'">
                  {{ scope.row.is_enable ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="操作日志" name="logs">
        <div>
          <div style="margin-bottom: 15px; color: #606266;">
            <i class="el-icon-document" />
            操作记录：{{ operationLogs.length }} 条
          </div>
          <!-- 显示操作日志（只读） -->
          <el-table :data="operationLogs" height="350" border>
            <el-table-column prop="operation_type" label="操作类型" width="100">
              <template v-slot="scope">
                <el-tag size="mini" :type="getOperationTypeTag(scope.row.operation_type)">
                  {{ getOperationTypeText(scope.row.operation_type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operation_desc" label="操作描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="operator_name" label="操作人" width="120" show-overflow-tooltip />
            <el-table-column prop="operation_time" label="操作时间" width="160">
              <template v-slot="scope">
                {{ formatDateTime(scope.row.operation_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="operation_ip" label="操作IP" width="120" show-overflow-tooltip />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleEdit">编辑</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'RoleViewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      activeTab: 'basic',
      // 表单数据
      formData: {
        id: null,
        code: '',
        name: '',
        descr: '',
        simple_name: '',
        is_enable: true,
        is_del: false,
        dbversion: 0,
        c_time: '',
        u_time: ''
      },
      // 权限列表
      permissionList: [],
      // 员工列表
      staffList: [],
      // 操作日志
      operationLogs: []
    }
  },
  computed: {
    displayCreateTime () {
      return this.formatDateTime(this.formData.c_time)
    },
    displayUpdateTime () {
      return this.formatDateTime(this.formData.u_time)
    }
  },
  watch: {
    visible (newVal) {
      if (newVal && this.data && this.data.id) {
        this.initData()
      }
    },
    data: {
      handler (newVal) {
        if (newVal && newVal.id && this.visible) {
          this.initData()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    initData () {
      if (this.data && this.data.id) {
        this.formData = Object.assign({}, this.data)
        this.loadPermissionList()
        this.loadStaffList()
        this.loadOperationLogs()
      }
    },

    // 加载权限列表
    loadPermissionList () {
      // TODO: 实现权限列表加载
      this.permissionList = [
        {
          id: 1,
          code: 'P_ROLE:ADD',
          name: '角色新增',
          module: '系统管理',
          type: 'write',
          description: '允许新增角色',
          assign_time: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          code: 'P_ROLE:UPDATE',
          name: '角色修改',
          module: '系统管理',
          type: 'write',
          description: '允许修改角色信息',
          assign_time: '2024-01-15 10:30:00'
        }
      ]
    },

    // 加载员工列表
    loadStaffList () {
      // TODO: 实现员工列表加载
      this.staffList = [
        {
          id: 1,
          code: 'EMP001',
          name: '张三',
          dept_name: '研发部',
          position_name: '开发工程师',
          is_enable: true,
          assign_time: '2024-01-10 09:00:00'
        },
        {
          id: 2,
          code: 'EMP002',
          name: '李四',
          dept_name: '测试部',
          position_name: '测试工程师',
          is_enable: true,
          assign_time: '2024-01-12 14:20:00'
        }
      ]
    },

    // 加载操作日志
    loadOperationLogs () {
      // TODO: 实现操作日志加载
      this.operationLogs = [
        {
          id: 1,
          operation_type: 'create',
          operation_desc: '创建角色',
          operator_name: '管理员',
          operation_time: '2024-01-01 10:00:00',
          operation_ip: '192.168.1.100'
        },
        {
          id: 2,
          operation_type: 'update',
          operation_desc: '修改角色名称',
          operator_name: '管理员',
          operation_time: '2024-01-05 15:30:00',
          operation_ip: '192.168.1.100'
        }
      ]
    },

    // 权限类型标签
    getPermissionTypeTag (type) {
      const typeMap = {
        'read': 'info',
        'write': 'warning',
        'delete': 'danger',
        'admin': 'success'
      }
      return typeMap[type] || 'info'
    },

    getPermissionTypeText (type) {
      const typeMap = {
        'read': '查看',
        'write': '编辑',
        'delete': '删除',
        'admin': '管理'
      }
      return typeMap[type] || '未知'
    },

    // 操作类型标签
    getOperationTypeTag (type) {
      const typeMap = {
        'create': 'success',
        'update': 'warning',
        'delete': 'danger',
        'assign': 'info'
      }
      return typeMap[type] || 'info'
    },

    getOperationTypeText (type) {
      const typeMap = {
        'create': '创建',
        'update': '修改',
        'delete': '删除',
        'assign': '分配'
      }
      return typeMap[type] || '未知'
    },

    // 关闭弹窗
    handleClose () {
      this.$emit('closeMeCancel')
    },

    // 编辑角色
    handleEdit () {
      this.$emit('editRole', this.formData)
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: center;
}

.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}

.el-tag {
  margin: 2px;
}
</style>
