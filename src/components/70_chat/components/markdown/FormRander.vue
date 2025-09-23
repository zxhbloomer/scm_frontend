<template>
  <div class="chat-form-render">
    <el-form
      ref="chatFormRef"
      :model="formData"
      :rules="formRules"
      label-position="top"
      require-asterisk-position="right"
      label-suffix=":"
      :disabled="isSubmit || disabled"
    >
      <!-- 动态表单字段渲染 -->
      <el-form-item
        v-for="field in formFieldList"
        :key="field.id"
        :prop="field.id"
        :label="field.label || field.title"
        :required="field.required"
      >
        <!-- 文本输入 -->
        <el-input
          v-if="field.type === 'input' || field.type === 'text'"
          v-model="formData[field.id]"
          :placeholder="field.placeholder"
          :maxlength="field.maxlength"
        />

        <!-- 多行文本 -->
        <el-input
          v-else-if="field.type === 'textarea'"
          v-model="formData[field.id]"
          type="textarea"
          :placeholder="field.placeholder"
          :rows="field.rows || 3"
          :maxlength="field.maxlength"
        />

        <!-- 数字输入 -->
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.id]"
          :min="field.min"
          :max="field.max"
          :step="field.step || 1"
          style="width: 100%;"
        />

        <!-- 选择器 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.id]"
          :placeholder="field.placeholder"
          style="width: 100%;"
          :multiple="field.multiple"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <!-- 单选按钮 -->
        <el-radio-group
          v-else-if="field.type === 'radio'"
          v-model="formData[field.id]"
        >
          <el-radio
            v-for="option in field.options"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>

        <!-- 复选框 -->
        <el-checkbox-group
          v-else-if="field.type === 'checkbox'"
          v-model="formData[field.id]"
        >
          <el-checkbox
            v-for="option in field.options"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-checkbox>
        </el-checkbox-group>

        <!-- 日期选择 -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.id]"
          type="date"
          :placeholder="field.placeholder"
          style="width: 100%;"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
        />

        <!-- 时间选择 -->
        <el-time-picker
          v-else-if="field.type === 'time'"
          v-model="formData[field.id]"
          :placeholder="field.placeholder"
          style="width: 100%;"
          format="HH:mm:ss"
          value-format="HH:mm:ss"
        />

        <!-- 开关 -->
        <el-switch
          v-else-if="field.type === 'switch'"
          v-model="formData[field.id]"
        />

        <!-- 默认文本输入 -->
        <el-input
          v-else
          v-model="formData[field.id]"
          :placeholder="field.placeholder"
        />
      </el-form-item>
    </el-form>

    <!-- 提交按钮 -->
    <div class="form-submit-area" style="margin-top: 16px;">
      <el-button
        :type="isSubmit ? 'info' : 'primary'"
        :disabled="isSubmit || disabled"
        @click="handleSubmit"
      >
        {{ isSubmit ? '已提交' : '提交' }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormRander',
  props: {
    formSetting: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    sendMessage: {
      type: Function,
      default: null
    },
    childNode: {
      type: Object,
      default: null
    },
    chatRecordId: {
      type: String,
      default: ''
    },
    runtimeNodeId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      isSubmitting: false,
      internalFormData: {}
    }
  },
  computed: {
    formSettingData () {
      if (this.formSetting) {
        try {
          return JSON.parse(this.formSetting)
        } catch (e) {
          console.warn('表单配置解析失败:', e)
          return {}
        }
      }
      return {}
    },

    formFieldList () {
      return this.formSettingData.form_field_list || []
    },

    isSubmit () {
      return this.isSubmitting || this.formSettingData.is_submit || false
    },

    formData: {
      get () {
        if (this.formSettingData.is_submit) {
          return this.formSettingData.form_data || {}
        }
        return this.internalFormData
      },
      set (value) {
        this.internalFormData = value
      }
    },

    formRules () {
      const rules = {}
      this.formFieldList.forEach(field => {
        if (field.required) {
          rules[field.id] = [
            {
              required: true,
              message: `请输入${field.label || field.title}`,
              trigger: field.type === 'select' ? 'change' : 'blur'
            }
          ]
        }

        // 添加字段类型特定的验证规则
        if (field.type === 'email') {
          rules[field.id] = rules[field.id] || []
          rules[field.id].push({
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur'
          })
        }

        if (field.pattern) {
          rules[field.id] = rules[field.id] || []
          rules[field.id].push({
            pattern: new RegExp(field.pattern),
            message: field.patternMessage || '格式不正确',
            trigger: 'blur'
          })
        }

        if (field.minLength || field.maxLength) {
          rules[field.id] = rules[field.id] || []
          rules[field.id].push({
            min: field.minLength,
            max: field.maxLength,
            message: `长度在${field.minLength || 0}到${field.maxLength || 999}个字符`,
            trigger: 'blur'
          })
        }
      })
      return rules
    }
  },
  mounted () {
    // 初始化表单数据
    this.initFormData()
  },
  methods: {
    initFormData () {
      // 根据字段配置初始化表单数据
      const initData = {}
      this.formFieldList.forEach(field => {
        if (field.defaultValue !== undefined) {
          initData[field.id] = field.defaultValue
        } else {
          // 根据字段类型设置默认值
          switch (field.type) {
            case 'checkbox':
              initData[field.id] = []
              break
            case 'switch':
              initData[field.id] = false
              break
            case 'number':
              initData[field.id] = field.min || 0
              break
            default:
              initData[field.id] = ''
          }
        }
      })
      this.internalFormData = { ...initData }
    },

    handleSubmit () {
      this.$refs.chatFormRef.validate((valid) => {
        if (valid) {
          this.isSubmitting = true

          if (this.sendMessage && typeof this.sendMessage === 'function') {
            this.sendMessage('', 'old', {
              child_node: this.childNode,
              runtime_node_id: this.runtimeNodeId,
              chat_record_id: this.chatRecordId,
              node_data: this.formData
            })
          }

          // 触发表单提交事件
          this.$emit('submit', {
            formData: this.formData,
            isValid: true
          })
        } else {
          this.$emit('submit', {
            formData: this.formData,
            isValid: false
          })
          return false
        }
      })
    },

    // 重置表单
    resetForm () {
      this.$refs.chatFormRef.resetFields()
      this.isSubmitting = false
      this.initFormData()
    },

    // 验证表单
    validateForm () {
      return new Promise((resolve) => {
        this.$refs.chatFormRef.validate((valid) => {
          resolve(valid)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-form-render {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  .el-form {
    .el-form-item {
      margin-bottom: 16px;

      ::v-deep .el-form-item__label {
        font-weight: 500;
        color: #606266;
        padding-bottom: 8px;
      }

      ::v-deep .el-form-item__content {
        line-height: normal;
      }
    }
  }

  .form-submit-area {
    text-align: center;
    border-top: 1px solid #e9ecef;
    padding-top: 16px;

    .el-button {
      min-width: 100px;
    }
  }
}

/* 已提交状态样式 */
.chat-form-render.submitted {
  background: #f0f9ff;
  border-color: #c3ddfd;

  ::v-deep .el-input,
  ::v-deep .el-select,
  ::v-deep .el-textarea {
    .el-input__inner,
    .el-textarea__inner {
      background-color: #f5f5f5;
      color: #909399;
    }
  }
}
</style>
