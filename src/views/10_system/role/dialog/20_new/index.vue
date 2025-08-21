<template>
  <el-dialog
    v-el-drag-dialog
    title="新增角色"
    :visible="visible"
    width="620px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="false"
    @close="handleClose"
  >
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
              clearable
              show-word-limit
              :maxlength="inputSettings.maxLength.code"
              placeholder="请输入角色编码"
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
              autofocus
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
    </el-form>

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
  </el-dialog>
</template>

<script>
import { insertApi } from '@/api/10_system/role/role'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'RoleNewDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    copyData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      // 表单数据
      formData: {
        id: undefined,
        code: '',
        name: '',
        descr: '',
        simple_name: '',
        is_del: false,
        dbversion: 0
      },
      // 原始数据
      originalData: {
        id: undefined,
        code: '',
        name: '',
        descr: '',
        simple_name: '',
        is_del: false,
        dbversion: 0
      },
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
        code: [
          { max: 10, message: '长度不能超过 10 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        descr: [
          { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
        ]
      },
      // 状态
      loading: false,
      btnDisabled: true,
      // 监听器
      unwatch: null
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        // 先清除之前的监听器
        this.unWatch()
        // 初始化表单
        this.initForm()
        // 设置新的监听器
        this.setWatch()
        this.$nextTick(() => {
          this.$refs.dataForm && this.$refs.dataForm.clearValidate()
          // 设置焦点到角色名称字段
          this.$refs.nameInput && this.$refs.nameInput.focus()
        })
      } else {
        this.unWatch()
      }
    },
    // 直接监听角色名称变化，确保按钮状态及时更新
    'formData.name': {
      handler (newVal) {
        this.checkFormChange()
      },
      immediate: true
    }
  },
  beforeDestroy () {
    this.unWatch()
  },
  methods: {
    // 初始化表单
    initForm () {
      // 如果有复制数据，使用复制数据初始化
      if (this.copyData && Object.keys(this.copyData).length > 0) {
        this.formData = Object.assign({}, this.originalData, this.copyData)
        // 清除复制数据的ID相关字段
        this.formData.id = undefined
        this.formData.u_time = ''
        this.formData.c_time = ''
        this.formData.dbversion = 0
      } else {
        this.formData = Object.assign({}, this.originalData)
      }
      // 初始化后立即检查表单状态
      this.$nextTick(() => {
        this.checkFormChange()
      })
    },

    // 设置监听器
    setWatch () {
      this.unwatch = this.$watch('formData', () => {
        this.checkFormChange()
      }, { deep: true })
    },

    // 清除监听器
    unWatch () {
      if (this.unwatch) {
        this.unwatch()
        this.unwatch = null
      }
    },

    // 检查表单变化
    checkFormChange () {
      // 检查必填字段：角色名称
      const hasName = this.formData.name && this.formData.name.trim() !== ''
      // 当有角色名称时启用确定按钮
      this.btnDisabled = !hasName
    },

    // 关闭弹窗
    handleClose () {
      this.$emit('closeMeCancel')
    },

    // 提交表单
    handleSubmit () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.doInsert()
        }
      })
    },

    // 执行新增
    doInsert () {
      const tempData = Object.assign({}, this.formData)
      this.loading = true

      insertApi(tempData).then((response) => {
        this.$notify({
          title: '新增处理成功',
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
          title: '新增处理失败',
          message: error.message,
          type: 'error',
          duration: 4000
        })
        this.loading = false
      })
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
