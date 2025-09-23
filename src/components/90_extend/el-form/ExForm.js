import { Form } from 'element-ui'

export default {
  name: 'ElForm',
  componentName: 'ElForm',
  extends: Form,

  props: {
    // 是否启用表单成员监控
    enableMemberTracking: {
      type: Boolean,
      default: true
    },
    // 自动获取字段值变化
    autoTrackValues: {
      type: Boolean,
      default: false
    },
    // 表单提交前验证增强
    beforeSubmitValidate: {
      type: Function,
      default: null
    }
  },

  data () {
    return {
      // 扩展数据
      memberTracker: {
        fieldsSnapshot: {},
        validationHistory: [],
        changeLog: []
      },
      formInitialized: false
    }
  },

  computed: {
    // 获取所有表单成员的计算属性
    allFormMembers () {
      return {
        // Props 属性
        props: this.$props,

        // 表单字段集合
        fields: this.fields || [],

        // 表单数据模型
        model: this.model,

        // 验证规则
        rules: this.rules,

        // 表单状态
        status: {
          fieldsCount: (this.fields || []).length,
          hasErrors: this.hasValidationErrors,
          isValid: this.isFormValid
        },

        // 计算属性
        computed: {
          autoLabelWidth: this.autoLabelWidth,
          potentialLabelWidthArr: this.potentialLabelWidthArr || []
        },

        // 表单方法
        methods: {
          validate: this.validate,
          validateField: this.validateField,
          resetFields: this.resetFields,
          clearValidate: this.clearValidate
        }
      }
    },

    // 检查表单是否有验证错误
    hasValidationErrors () {
      return (this.fields || []).some(field => field.validateState === 'error')
    },

    // 检查表单是否完全有效
    isFormValid () {
      return (this.fields || []).every(field =>
        field.validateState === 'success' || field.validateState === ''
      )
    },

    // 获取所有字段的值
    allFieldValues () {
      const values = {}
      if (this.fields && this.model) {
        this.fields.forEach(field => {
          if (field.prop) {
            values[field.prop] = this.getFieldValue(field.prop)
          }
        })
      }
      return values
    }
  },

  watch: {
    // 监控字段变化
    fields: {
      handler (newFields, oldFields) {
        if (this.enableMemberTracking) {
          this.trackFieldsChange(newFields, oldFields)
        }
      },
      deep: true
    },

    // 监控值变化
    allFieldValues: {
      handler (newValues, oldValues) {
        if (this.autoTrackValues && this.formInitialized) {
          this.trackValuesChange(newValues, oldValues)
        }
      },
      deep: true
    }
  },

  methods: {
    // 增强版validate方法
    async validateEnhanced (callback) {
      // 执行前置验证
      if (this.beforeSubmitValidate) {
        try {
          const preValidResult = await this.beforeSubmitValidate(this.allFieldValues)
          if (preValidResult === false) {
            if (callback) callback(false, {})
            return Promise.reject(new Error('前置验证失败'))
          }
        } catch (error) {
          if (callback) callback(false, { preValidation: error.message })
          return Promise.reject(error)
        }
      }

      // 执行标准验证
      return this.validate(callback)
    },

    // 获取指定字段的值
    getFieldValue (prop) {
      if (!this.model || !prop) return undefined

      // 支持嵌套路径，如 'user.name'
      const paths = prop.split('.')
      let value = this.model

      for (const path of paths) {
        if (value && typeof value === 'object') {
          value = value[path]
        } else {
          return undefined
        }
      }

      return value
    },

    // 设置字段值
    setFieldValue (prop, value) {
      if (!this.model || !prop) return

      const paths = prop.split('.')
      let obj = this.model

      // 导航到最后一层的父对象
      for (let i = 0; i < paths.length - 1; i++) {
        if (!obj[paths[i]]) {
          this.$set(obj, paths[i], {})
        }
        obj = obj[paths[i]]
      }

      // 设置最终值
      this.$set(obj, paths[paths.length - 1], value)
    },

    // 获取字段验证状态
    getFieldValidationState (prop) {
      const field = this.fields?.find(f => f.prop === prop)
      return field ? {
        state: field.validateState,
        message: field.validateMessage,
        isRequired: field.isRequired
      } : null
    },

    // 批量设置字段值
    setFieldValues (values) {
      if (!values || typeof values !== 'object') return

      Object.keys(values).forEach(prop => {
        this.setFieldValue(prop, values[prop])
      })
    },

    // 获取表单摘要信息
    getFormSummary () {
      return {
        totalFields: (this.fields || []).length,
        validFields: (this.fields || []).filter(f => f.validateState === 'success').length,
        errorFields: (this.fields || []).filter(f => f.validateState === 'error').length,
        pendingFields: (this.fields || []).filter(f => f.validateState === 'validating').length,
        emptyFields: (this.fields || []).filter(f => !f.validateState).length,
        requiredFields: (this.fields || []).filter(f => f.isRequired).length,
        filledRequiredFields: (this.fields || []).filter(f => f.isRequired && this.getFieldValue(f.prop)).length
      }
    },

    // 重置表单增强版
    resetFieldsEnhanced () {
      this.resetFields()

      // 清除追踪数据
      if (this.enableMemberTracking) {
        this.memberTracker = {
          fieldsSnapshot: {},
          validationHistory: [],
          changeLog: []
        }
      }
    },

    // 追踪字段变化
    trackFieldsChange (newFields, oldFields) {
      const change = {
        timestamp: new Date(),
        type: 'fields',
        before: oldFields ? oldFields.length : 0,
        after: newFields ? newFields.length : 0,
        details: {
          added: [],
          removed: []
        }
      }

      if (oldFields && newFields) {
        // 检测新增字段
        newFields.forEach(field => {
          if (!oldFields.find(old => old.prop === field.prop)) {
            change.details.added.push(field.prop)
          }
        })

        // 检测删除字段
        oldFields.forEach(field => {
          if (!newFields.find(newF => newF.prop === field.prop)) {
            change.details.removed.push(field.prop)
          }
        })
      }

      this.memberTracker.changeLog.push(change)
    },

    // 追踪值变化
    trackValuesChange (newValues, oldValues) {
      const changes = []

      Object.keys(newValues).forEach(prop => {
        if (newValues[prop] !== oldValues?.[prop]) {
          changes.push({
            prop,
            before: oldValues?.[prop],
            after: newValues[prop]
          })
        }
      })

      if (changes.length > 0) {
        const change = {
          timestamp: new Date(),
          type: 'values',
          changes
        }

        this.memberTracker.changeLog.push(change)
      }
    },

    // 获取所有表单成员的详细信息
    getAllFormMembers () {
      // 方式1: 使用正式注册的fields（有prop属性的el-form-item）
      const registeredMembers = this.fields ? this.fields.map(field => ({
        source: 'registered',
        prop: field.prop,
        label: field.label,
        currentValue: field.fieldValue,
        initialValue: field.initialValue,
        validateState: field.validateState || '',
        validateMessage: field.validateMessage || '',
        isRequired: field.isRequired || false,
        rules: typeof field.getRules === 'function' ? field.getRules() : [],
        isValid: field.validateState === 'success' || field.validateState === '',
        hasError: field.validateState === 'error',
        isValidating: field.validateState === 'validating',
        fieldInstance: field
      })) : []

      // 方式2: 从$children中直接获取所有ElFormItem（包括没有prop的）
      const allFormItems = this.$children ? this.$children.filter(child =>
        child.$options.componentName === 'ElFormItem'
      ).map(child => {
        // 深度分析：尝试多种方式获取字段值
        let currentValue = child.fieldValue // 标准方式（需要prop）

        // 获取FormItem包裹的表单控件
        const formControls = []
        if (child.$children && child.$children.length > 0) {
          child.$children.forEach(subChild => {
            const componentName = subChild.$options.componentName || subChild.$options.name || ''
            const isStandardControl = componentName && (
              componentName.includes('Input') ||
              componentName.includes('Select') ||
              componentName.includes('DatePicker') ||
              componentName.includes('Cascader') ||
              componentName.includes('Switch') ||
              componentName.includes('Slider') ||
              componentName.includes('Rate') ||
              componentName.includes('ColorPicker') ||
              componentName.includes('Upload') ||
              componentName.includes('Transfer') ||
              componentName.includes('Tree') ||
              componentName.includes('Button')
            )

            // 检测自定义组件（通过组件名或v-model属性判断）
            const isCustomControl = componentName && (
              componentName.includes('Supplier') ||
              componentName.includes('Customer') ||
              componentName.includes('Dicts') ||
              componentName.includes('Dict') ||
              componentName.includes('Picker') ||
              componentName.toLowerCase().includes('select') ||
              // 或者有v-model属性的组件
              subChild.$attrs && ('value' in subChild.$attrs || 'modelValue' in subChild.$attrs) ||
              subChild.$props && ('value' in subChild.$props || 'modelValue' in subChild.$props)
            )

            if (isStandardControl || isCustomControl) {
              formControls.push({
                componentName: subChild.$options.componentName,
                value: subChild.value,
                placeholder: subChild.placeholder || subChild.$props?.placeholder,
                disabled: subChild.disabled || subChild.$props?.disabled,
                readonly: subChild.readonly || subChild.$props?.readonly,
                clearable: subChild.clearable || subChild.$props?.clearable,
                size: subChild.size || subChild.$props?.size,
                controlInstance: subChild, // 控件实例引用
                // 控件特有属性
                props: subChild.$props,
                attrs: subChild.$attrs,
                // 控件方法
                methods: {
                  focus: typeof subChild.focus === 'function' ? subChild.focus.bind(subChild) : null,
                  blur: typeof subChild.blur === 'function' ? subChild.blur.bind(subChild) : null,
                  select: typeof subChild.select === 'function' ? subChild.select.bind(subChild) : null,
                  clear: typeof subChild.clear === 'function' ? subChild.clear.bind(subChild) : null
                }
              })
            }
          })
        }

        // 如果没有prop，尝试从子组件获取值
        if (!child.prop && formControls.length > 0) {
          const primaryControl = formControls[0]
          if (primaryControl && primaryControl.value !== undefined) {
            currentValue = primaryControl.value
          }
        }

        // 深度分析：获取完整的标签信息
        const label = child.label || child.$props?.label || child.$attrs?.label ||
                     (child.$slots.label && child.$slots.label[0]?.text) || null

        // 深度分析：获取完整的验证规则
        const rules = typeof child.getRules === 'function' ? child.getRules() : []
        const hasRequired = child.required !== undefined ? child.required
          : (rules.some(rule => rule.required))

        return {
          source: 'children',
          prop: child.prop || null,
          label,

          // 值信息（增强版）
          currentValue,
          initialValue: child.initialValue,

          // 验证信息（完整版）
          validateState: child.validateState || '',
          validateMessage: child.validateMessage || '',
          isRequired: hasRequired,
          rules,

          // 状态信息
          isValid: child.validateState === 'success' || child.validateState === '',
          hasError: child.validateState === 'error',
          isValidating: child.validateState === 'validating',

          // 样式和尺寸信息
          size: child.elFormItemSize || null,
          isNested: child.isNested || false,

          // 事件和验证控制
          validateDisabled: child.validateDisabled || false,

          // 表单控件信息
          formControls,
          hasControls: formControls.length > 0,
          primaryControl: formControls.length > 0 ? formControls[0] : null,

          // 标记和引用
          hasNoProp: !child.prop,
          fieldInstance: child
        }
      }) : []

      // 合并去重（优先使用registered的，补充children中的）
      const members = [...registeredMembers]
      allFormItems.forEach(item => {
        // 如果这个item在registered中不存在，就添加进去
        if (!registeredMembers.find(reg => reg.prop && reg.prop === item.prop)) {
          members.push(item)
        }
      })

      const summary = {
        totalCount: members.length,
        registeredCount: registeredMembers.length,
        unregisteredCount: allFormItems.length - registeredMembers.length,
        validCount: members.filter(m => m.isValid).length,
        errorCount: members.filter(m => m.hasError).length,
        pendingCount: members.filter(m => m.isValidating).length,
        requiredCount: members.filter(m => m.isRequired).length,
        filledRequiredCount: members.filter(m => m.isRequired && m.currentValue != null && m.currentValue !== '').length,
        noPropCount: members.filter(m => m.hasNoProp).length
      }

      return {
        members,
        summary,
        formInfo: {
          model: this.model,
          rules: this.rules,
          props: this.$props,
          isFormValid: this.isFormValid,
          hasValidationErrors: this.hasValidationErrors
        },
        // 提示信息
        tips: summary.noPropCount > 0
          ? `发现${summary.noPropCount}个el-form-item没有设置prop属性，建议设置prop以启用完整功能` : null
      }
    },

    // 根据属性名获取字段成员信息
    getFormMemberByProp (prop) {
      const allMembers = this.getAllFormMembers()
      return allMembers.members.find(member => member.prop === prop) || null
    },

    // 获取所有错误字段
    getErrorMembers () {
      const allMembers = this.getAllFormMembers()
      return allMembers.members.filter(member => member.hasError)
    },

    // 获取所有必填字段
    getRequiredMembers () {
      const allMembers = this.getAllFormMembers()
      return allMembers.members.filter(member => member.isRequired)
    },

    // 获取所有未填写的必填字段
    getUnfilledRequiredMembers () {
      const allMembers = this.getAllFormMembers()
      return allMembers.members.filter(member =>
        member.isRequired && (member.currentValue == null || member.currentValue === '')
      )
    },

    // 获取有值的字段
    getFilledMembers () {
      const allMembers = this.getAllFormMembers()
      return allMembers.members.filter(member =>
        member.currentValue != null && member.currentValue !== ''
      )
    },

    // 获取字段值映射对象 { prop: value }
    getFieldValuesMap () {
      const allMembers = this.getAllFormMembers()
      const valuesMap = {}
      allMembers.members.forEach(member => {
        if (member.prop) {
          valuesMap[member.prop] = member.currentValue
        }
      })
      return valuesMap
    },

    // 获取所有字段的标签映射 { prop: label }
    getFieldLabelsMap () {
      const allMembers = this.getAllFormMembers()
      const labelsMap = {}
      allMembers.members.forEach(member => {
        if (member.prop && member.label) {
          labelsMap[member.prop] = member.label
        }
      })
      return labelsMap
    },

    // 检查表单完整性
    checkFormCompleteness () {
      const allMembers = this.getAllFormMembers()
      const required = allMembers.members.filter(m => m.isRequired)
      const filled = required.filter(m => m.currentValue != null && m.currentValue !== '')

      return {
        isComplete: filled.length === required.length,
        totalRequired: required.length,
        filledRequired: filled.length,
        missingFields: required.filter(m => m.currentValue == null || m.currentValue === ''),
        progress: required.length > 0 ? Math.round((filled.length / required.length) * 100) : 100
      }
    },

    // 获取所有表单控件
    getAllFormControls () {
      const allMembers = this.getAllFormMembers()
      const controls = []

      allMembers.members.forEach(member => {
        if (member.formControls && member.formControls.length > 0) {
          member.formControls.forEach(control => {
            controls.push({
              ...control,
              parentFormItem: member.fieldInstance,
              parentLabel: member.label,
              parentProp: member.prop
            })
          })
        }
      })

      return controls
    },

    // 根据控件类型获取控件
    getControlsByType (componentName) {
      const allControls = this.getAllFormControls()
      return allControls.filter(control =>
        control.componentName === componentName ||
        control.componentName.includes(componentName)
      )
    },

    // 聚焦到第一个输入控件
    focusFirstInput () {
      const inputs = this.getControlsByType('Input')
      if (inputs.length > 0 && inputs[0].methods.focus) {
        inputs[0].methods.focus()
      }
    },

    // 清空所有可清空的控件
    clearAllControls () {
      const allControls = this.getAllFormControls()
      allControls.forEach(control => {
        if (control.clearable && control.methods.clear) {
          control.methods.clear()
        }
      })
    },

    // 获取控件值映射
    getControlValuesMap () {
      const allControls = this.getAllFormControls()
      const valuesMap = {}

      allControls.forEach((control, index) => {
        const key = control.parentProp || control.parentLabel || `control_${index}`
        valuesMap[key] = control.value
      })

      return valuesMap
    },

    // 导出表单配置
    exportFormConfig () {
      return {
        model: this.model,
        rules: this.rules,
        props: this.$props,
        fields: (this.fields || []).map(field => ({
          prop: field.prop,
          label: field.label,
          required: field.isRequired,
          validateState: field.validateState,
          validateMessage: field.validateMessage
        })),
        summary: this.getFormSummary(),
        tracking: this.memberTracker
      }
    }
  },

  created () {
  },

  mounted () {
    this.formInitialized = true

    // 监听字段注册事件
    this.$on('el.form.addField', (field) => {
      // 字段注册处理
    })
  },

  beforeDestroy () {
    this.formInitialized = false
  }
}
