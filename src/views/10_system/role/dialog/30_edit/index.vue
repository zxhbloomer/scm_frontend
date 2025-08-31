<template>
  <el-dialog
    v-el-drag-dialog
    title="编辑角色"
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
          ref="dataForm"
          :model="formData"
          :rules="rules"
          label-position="right"
          label-width="120px"
          status-icon
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="角色编码：" prop="code">
                <el-input
                  v-model.trim="formData.code"
                  disabled
                  placeholder="角色编码（不可编辑）"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色名称：" prop="name">
                <el-input
                  ref="nameInput"
                  v-model.trim="formData.name"
                  clearable
                  show-word-limit
                  :maxlength="inputSettings.maxLength.name"
                  placeholder="请输入角色名称"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注：" prop="descr">
            <el-input
              v-model.trim="formData.descr"
              clearable
              type="textarea"
              show-word-limit
              :maxlength="inputSettings.maxLength.descr"
              placeholder="请输入角色描述"
            />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="创建时间：">
                <el-input
                  v-model="formData.c_time"
                  disabled
                  placeholder="系统自动生成"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间：">
                <el-input
                  v-model="formData.u_time"
                  disabled
                  placeholder="系统自动更新"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="权限信息" name="permission">
        <div>
          <div style="margin-bottom: 15px;">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleAddPermission"
            >权限管理</el-button>
            <span style="margin-left: 15px; color: #909399; font-size: 12px;">
              注：权限的添加和移除请通过"权限管理"对话框进行操作
            </span>
          </div>
          <!-- 显示已分配的权限列表 -->
          <el-table
            ref="permissionTable"
            :data="permissionList"
            height="300"
          >
            <el-table-column prop="code" label="权限编码" width="120" />
            <el-table-column prop="name" label="权限名称" min-width="150" />
            <el-table-column prop="module" label="所属模块" width="120" />
            <el-table-column prop="assign_time" label="分配时间" width="160">
              <template v-slot="scope">
                {{ formatDateTime(scope.row.assign_time) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

    </el-tabs>

    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button
        plain
        type="primary"
        :disabled="loading || btnDisabled"
        @click="handleSubmit"
      >确定</el-button>
      <el-button
        plain
        :disabled="loading"
        @click="handleClose"
      >取消</el-button>
    </div>

    <!-- 权限选择弹窗 -->
    <permission-select-dialog
      v-if="permissionDialogVisible"
      :visible="permissionDialogVisible"
      :role-id="formData.id"
      @closeMeOk="handlePermissionDialogOk"
      @closeMeCancel="handlePermissionDialogCancel"
    />

  </el-dialog>
</template>

<script>
import { updateApi } from '@/api/10_system/role/role'
import elDragDialog from '@/directive/el-drag-dialog'
import PermissionSelectDialog from '@/views/20_master/permission/component/dialog/listfor/role/index.vue'

export default {
  name: 'RoleEditDialog',
  components: {
    PermissionSelectDialog
  },
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
        is_del: false,
        dbversion: 0,
        c_time: '',
        u_time: ''
      },
      // 原始数据
      originalData: {},
      // 输入限制
      inputSettings: {
        maxLength: {
          code: 10,
          name: 10,
          descr: 200,
          simple_name: 10
        }
      },
      // 验证规则
      rules: {
        code: [],
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        descr: [
          { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
        ]
      },
      // 权限列表
      permissionList: [],
      // 状态
      loading: false,
      btnDisabled: true,
      permissionDialogVisible: false
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        this.initForm()
        this.$nextTick(() => {
          this.$refs.dataForm && this.$refs.dataForm.clearValidate()
          // 设置角色名称输入框自动聚焦
          this.$refs.nameInput && this.$refs.nameInput.focus()
        })
      }
    },
    data: {
      handler (newVal) {
        if (newVal && newVal.id && this.visible) {
          this.initForm()
        }
      },
      deep: true,
      immediate: true
    },
    formData: {
      handler () {
        // 只有在弹窗打开时才检查表单变化
        if (this.visible) {
          this.$nextTick(() => {
            this.checkFormChange()
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 初始化表单
    initForm () {
      if (this.data && this.data.id) {
        // 只复制需要的字段，避免将多余字段发送给后端
        this.formData = {
          id: this.data.id,
          code: this.data.code || '',
          name: this.data.name || '',
          descr: this.data.descr || '',
          simple_name: this.data.simple_name || '',
          is_del: this.data.is_del || false,
          dbversion: this.data.dbversion !== undefined ? this.data.dbversion : 0,
          c_time: this.data.c_time || '',
          u_time: this.data.u_time || ''
        }

        this.originalData = Object.assign({}, this.formData)
        this.loadPermissionList()

        // 延迟执行 checkFormChange，确保数据完全初始化
        this.$nextTick(() => {
          this.checkFormChange()
        })
      }
    },

    // 检查表单变化
    checkFormChange () {
      const hasName = this.formData.name && this.formData.name.trim() !== ''
      const formChanged = JSON.stringify(this.formData) !== JSON.stringify(this.originalData)
      this.btnDisabled = !(hasName && formChanged)
    },

    // 加载权限列表
    loadPermissionList () {
      if (this.data && this.data.permissionList && this.data.permissionList.length > 0) {
        this.permissionList = this.data.permissionList.map(item => ({
          id: item.key || item.id,
          code: item.code || item.key,
          name: item.label || item.name,
          module: item.module || '系统模块',
          assign_time: item.assign_time || new Date().toISOString()
        }))
      } else {
        this.permissionList = []
      }
    },

    // 关闭弹窗
    handleClose () {
      this.$emit('closeMeCancel')
    },

    // 重置表单
    handleReset () {
      this.$refs.dataForm.resetFields()
      this.formData = Object.assign({}, this.originalData)
      this.checkFormChange()
    },

    // 提交表单
    handleSubmit () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.doUpdate()
        }
      })
    },

    // 执行更新
    doUpdate () {
      const tempData = Object.assign({}, this.formData)
      this.loading = true

      updateApi(tempData).then((response) => {
        this.$notify({
          title: '更新处理成功',
          message: response.message,
          type: 'success',
          duration: 4000
        })
        this.loading = false
        this.$emit('closeMeOk', {
          return_flag: true,
          data: response.data
        })
      }).catch((error) => {
        this.$notify({
          title: '更新处理失败',
          message: error.message,
          type: 'error',
          duration: 4000
        })
        this.loading = false
      })
    },

    // 权限管理
    handleAddPermission () {
      this.permissionDialogVisible = true
    },

    handleRemovePermission () {
      this.$message.info('权限管理请通过"添加权限"对话框进行操作')
    },

    handlePermissionDialogOk (result) {
      this.permissionDialogVisible = false
      if (result.return_flag) {
        // 权限变更成功，重新获取最新数据更新当前表单
        this.refreshCurrentData()
        this.$message.success('权限设置成功')
      }
    },

    handlePermissionDialogCancel () {
      this.permissionDialogVisible = false
    },

    // 刷新当前编辑数据
    refreshCurrentData () {
      // 通知父组件刷新数据，但不关闭弹窗
      this.$emit('refreshData', { roleId: this.formData.id })
    },

    // 从父组件接收更新的数据（解决乐观锁版本问题）
    updateFormData (newData) {
      if (newData && newData.id === this.formData.id) {
        console.log('同步最新数据版本:', newData)
        // 只更新版本号和权限相关数据，保持用户正在编辑的内容不变
        this.formData.dbversion = newData.dbversion
        this.formData.c_time = newData.c_time
        this.formData.u_time = newData.u_time
        // 更新原始数据的版本号，但保持其他字段为用户编辑的内容
        this.originalData.dbversion = newData.dbversion
        this.originalData.c_time = newData.c_time
        this.originalData.u_time = newData.u_time

        // 重新加载权限列表
        if (newData.permissionList) {
          this.data.permissionList = newData.permissionList
          this.loadPermissionList()
        }

        console.log('表单数据版本已同步:', this.formData.dbversion)
      }
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
</style>
