<template>
  <el-dialog
    title="作废申请"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="cancelForm"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="入库计划" prop="code">
        <el-input v-model="formData.code" disabled />
      </el-form-item>

      <el-form-item label="作废原因" prop="cancel_reason">
        <el-input
          v-model="formData.cancel_reason"
          type="textarea"
          :rows="4"
          placeholder="请输入作废原因"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="附件">
        <file-upload
          v-model="formData.cancel_files"
          :limit="5"
          :file-size="10"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { cancelApi } from '@/api/40_business/inplan/inplan'

export default {
  name: 'InPlanCancelDialog',
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
      loading: false,
      formData: {
        id: null,
        code: '',
        cancel_reason: '',
        cancel_files: []
      },
      rules: {
        cancel_reason: [
          { required: true, message: '请输入作废原因', trigger: 'blur' },
          { min: 10, message: '作废原因至少10个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.initData()
      }
    }
  },
  methods: {
    /**
     * 初始化数据
     */
    initData () {
      if (this.data) {
        this.formData.id = this.data.id
        this.formData.code = this.data.code
        this.formData.cancel_reason = ''
        this.formData.cancel_files = []
      }
    },

    /**
     * 确认作废
     */
    async handleConfirm () {
      try {
        await this.$refs.cancelForm.validate()

        this.$confirm('确定要申请作废此入库计划吗？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            this.loading = true

            await cancelApi(this.formData)

            this.$message.success('作废申请提交成功')
            this.$emit('success')
            this.handleClose()
          } catch (error) {
            console.error('作废申请失败:', error)
            this.$message.error('作废申请失败')
          } finally {
            this.loading = false
          }
        })
      } catch (error) {
        // 表单验证失败
      }
    },

    /**
     * 取消
     */
    handleCancel () {
      this.handleClose()
    },

    /**
     * 关闭对话框
     */
    handleClose () {
      this.dialogVisible = false
      this.$refs.cancelForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
