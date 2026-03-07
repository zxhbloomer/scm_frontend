<template>
  <div class="ai-user-form">
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
    <div class="ai-interaction-footer">
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
    </div>
  </div>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserForm',

  props: {
    interaction: {
      type: Object,
      required: true
    }
  },

  data () {
    const formData = {}
    const formRules = {}
    const fields = (this.interaction.params && this.interaction.params.fields) || []
    fields.forEach(f => {
      formData[f.key] = f.type === 'number' ? null : ''
      if (f.required) {
        formRules[f.key] = [{ required: true, message: f.label + '不能为空', trigger: 'blur' }]
      }
    })
    return { formData, formRules, submitted: false }
  },

  computed: {
    fields () {
      return (this.interaction.params && this.interaction.params.fields) || []
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  methods: {
    handleSubmit () {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.submitted = true
        this.$emit('submit', 'form_submit', { ...this.formData })
      })
    },
    handleCancel () {
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-user-form {
  padding: 12px;
  background: #f4f7fe;
  border-radius: 8px;
  margin-top: 8px;
}
.ai-interaction-desc {
  font-size: 13px;
  color: #303133;
  margin-bottom: 10px;
}
.ai-interaction-footer {
  margin-top: 8px;
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
