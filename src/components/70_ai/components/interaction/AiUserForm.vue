<template>
  <el-dialog
    :visible.sync="localVisible"
    title="请填写"
    width="520px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div class="ai-interaction-desc">{{ interaction.description }}</div>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-position="top"
      size="small"
    >
      <el-form-item
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :prop="field.key"
      >
        <el-input
          v-if="field.type === 'text' || field.type === 'textarea'"
          v-model="formData[field.key]"
          :type="field.type === 'textarea' ? 'textarea' : 'text'"
          :rows="field.type === 'textarea' ? 3 : undefined"
          :placeholder="'请输入' + field.label"
        />
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.key]"
          :placeholder="'请输入' + field.label"
          style="width: 100%"
        />
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.key]"
          :placeholder="'请选择' + field.label"
          style="width: 100%"
        >
          <el-option
            v-for="opt in (field.options || [])"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-input
          v-else
          v-model="formData[field.key]"
          :placeholder="'请输入' + field.label"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="small"
        :disabled="submitted"
        @click="handleSubmit"
      >
        提交
      </el-button>
      <el-button
        size="small"
        :disabled="submitted"
        @click="handleCancel"
      >
        取消
      </el-button>
      <span class="ai-countdown">{{ formattedTime }}</span>
    </span>
  </el-dialog>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserForm',

  props: {
    visible: { type: Boolean, default: false },
    interaction: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      localVisible: false,
      formData: {},
      formRules: {},
      submitted: false
    }
  },

  computed: {
    fields () {
      return (this.interaction.params && this.interaction.params.fields) || []
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  watch: {
    visible (val) {
      this.localVisible = val
      if (val) {
        this.submitted = false
        this.initFormData()
      }
    },
    // interaction 变化时重新初始化（防止父组件先设 visible 后更新 interaction 的时序问题）
    interaction (val) {
      if (val && this.localVisible) {
        this.initFormData()
      }
    }
  },

  methods: {
    initFormData () {
      const fields = (this.interaction.params && this.interaction.params.fields) || []
      const formData = {}
      const formRules = {}
      fields.forEach(f => {
        formData[f.key] = f.type === 'number' ? null : ''
        if (f.required) {
          formRules[f.key] = [{ required: true, message: f.label + '不能为空', trigger: 'blur' }]
        }
      })
      this.formData = formData
      this.formRules = formRules
      // 清除上一次的校验状态
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    handleSubmit () {
      if (this.submitted) return
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.submitted = true
        this.$emit('submit', 'form_submit', { ...this.formData })
      })
    },
    handleCancel () {
      if (this.submitted) return
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-interaction-desc {
  font-size: 13px;
  color: #303133;
  margin-bottom: 10px;
}
.dialog-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-countdown {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}
</style>
