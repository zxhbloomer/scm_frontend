<!--<template>-->
<!--  &lt;!&ndash;渲染表单&ndash;&gt;-->
<!--  <el-form v-if="mode === 'PC'" ref="form" class="process-form" label-position="top" :rules="rules" :model="_value">-->
<!--    <div v-for="(item, index) in forms" v-show="showItem(item)" :key="item.name + index" :class="{ readonly: isReadonly(item) }">-->
<!--      <el-form-item-->
<!--        v-if="item.name !== 'SpanLayout' &&-->
<!--          item.name !== 'ModuleBlock' &&-->
<!--          item.name !== 'Description'-->
<!--        "-->
<!--        :prop="item.id"-->
<!--        :label="item.title"-->
<!--      >-->
<!--        <form-design-render :ref="item.id" v-model="_value[item.id]" :readonly="isReadonly(item)" :form-data="_value" :mode="mode" :config="item" />-->
<!--        111111111111-->
<!--      </el-form-item>-->
<!--      <form-design-render v-else :ref="item.id" v-model="_value" :readonly="isReadonly(item)" :form-data="_value" :mode="mode" :config="item" />-->
<!--    </div>-->
<!--  </el-form>-->
<!--  <div v-else class="process-form">-->
<!--    <div v-for="(item, index) in forms" v-show="showItem(item)" :key="item.name + index" :class="{ readonly: isReadonly(item) }">-->
<!--      <form-item-->
<!--        v-if="item.name !== 'SpanLayout' &&-->
<!--          item.name !== 'ModuleBlock' &&-->
<!--          item.name !== 'Description'-->
<!--        "-->
<!--        :ref="item.id"-->
<!--        :model="_value"-->
<!--        :rule="rules[item.id]"-->
<!--        :prop="item.id"-->
<!--        :label="item.title"-->
<!--      >-->
<!--        <form-design-render :ref="item.id + '_item'" v-model="_value[item.id]" :readonly="isReadonly(item)" :form-data="_value" :mode="mode" :config="item" />-->
<!--      </form-item>-->
<!--      <form-design-render v-else :ref="item.id" v-model="_value" :readonly="isReadonly(item)" :form-data="_value" :mode="mode" :config="item" />-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { Field, Form } from 'vant'-->
<!--import { CompareFuncs } from './components/compare/CompareOptions'-->
<!--import FormItem from '@/components/60_bpm/common/FormItem.vue'-->
<!--import FormDesignRender from '@/views/admin/layout/form/FormDesignRender.vue'-->
<!--import { ValueType } from './ComponentsConfigExport'-->

<!--const VForm = Form-->
<!--export default {-->
<!--  name: 'FormRender',-->
<!--  components: { FormItem, FormDesignRender, VForm, Field },-->
<!--  props: {-->
<!--    forms: {-->
<!--      type: Array,-->
<!--      default: () => {-->
<!--        return []-->
<!--      }-->
<!--    },-->
<!--    config: {-->
<!--      type: Object,-->
<!--      default: () => {-->
<!--        return {-->
<!--          ruleType: 'SIMPLE',-->
<!--          rules: []-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    process: {-->
<!--      type: Object,-->
<!--      default: () => {-->
<!--        return {}-->
<!--      }-->
<!--    },-->
<!--    // 当前节点，用来联动表单权限-->
<!--    currentNode: {-->
<!--      type: String,-->
<!--      default: null-->
<!--    },-->
<!--    modelValue: {-->
<!--      type: Object,-->
<!--      default: () => {-->
<!--        return {}-->
<!--      }-->
<!--    },-->
<!--    mode: {-->
<!--      type: String,-->
<!--      default: 'PC'-->
<!--    }-->
<!--  },-->
<!--  data () {-->
<!--    return {-->
<!--      formRules: {},-->
<!--      // 缓存下原始权限设置-->
<!--      formPermHis: {},-->
<!--      compareFunc: {},-->
<!--      // 缓存旧值-->
<!--      oldFormData: {},-->
<!--      // 缓存所有用到的条件字段-->
<!--      conditionFields: new Set(),-->
<!--      execute: null,-->
<!--      rules: {}-->
<!--    }-->
<!--  },-->
<!--  computed: {-->
<!--    _value: {-->
<!--      get () {-->
<!--        return this.modelValue-->
<!--      },-->
<!--      set (val) {-->
<!--        this.$emit('update:modelValue', val)-->
<!--      }-->
<!--    },-->
<!--    formItemMap () {-->
<!--      const map = new Map()-->
<!--      this.loadFormItemMap(this.forms, map)-->
<!--      return map-->
<!--    }-->
<!--  },-->
<!--  watch: {-->
<!--    modelValue: {-->
<!--      deep: true,-->
<!--      handler () {-->
<!--        if (this.config) {-->
<!--          if (Object.keys(this.formPermHis).length === 0) {-->
<!--            this.formItemMap.forEach((item) => {-->
<!--              this.formPermHis[item.id] = item.perm-->
<!--            })-->
<!--          }-->
<!--          this.analyseFormRule()-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  created () {-->
<!--    this.loadFormConfig(this.forms, this.rules)-->
<!--  },-->
<!--  methods: {-->
<!--    showItem (item) {-->
<!--      return (-->
<!--        (!(this.isReadonly(item) && this.isBlank(this._value[item.id])) ||-->
<!--          item.name === 'SpanLayout' ||-->
<!--          item.name === 'ModuleBlock') &&-->
<!--        item.perm !== 'H'-->
<!--      )-->
<!--    },-->
<!--    isBlank (val) {-->
<!--      return (-->
<!--        !this.$isNotEmpty(val) ||-->
<!--        (val instanceof String && val.trim() === '') ||-->
<!--        (Array.isArray(val) && val.length === 0)-->
<!--      )-->
<!--    },-->
<!--    isReadonly (item) {-->
<!--      console.log('item=', item)-->
<!--      return item.perm === 'R'-->
<!--    },-->
<!--    validate (call) {-->
<!--      let success = true-->
<!--      console.log(this.rules)-->
<!--      if (this.mode === 'PC') {-->
<!--        this.$refs.form.validate((valid) => {-->
<!--          success = valid-->
<!--          if (valid) {-->
<!--            // 校验成功再校验内部-->
<!--            for (let i = 0; i < this.forms.length; i++) {-->
<!--              if (this.forms[i].name === 'TableList') {-->
<!--                const formRef = this.$refs[this.forms[i].id]-->
<!--                if (formRef && Array.isArray(formRef) && formRef.length > 0) {-->
<!--                  formRef[0].validate((subValid) => {-->
<!--                    success = subValid-->
<!--                  })-->
<!--                  if (!success) {-->
<!--                    break-->
<!--                  }-->
<!--                }-->
<!--              }-->
<!--            }-->
<!--          }-->
<!--          call(success)-->
<!--        })-->
<!--      } else {-->
<!--        this.forms.forEach((form) => {-->
<!--          const formRef = this.$refs[form.id]-->
<!--          if (formRef && Array.isArray(formRef) && formRef.length > 0) {-->
<!--            formRef[0].validate((subValid) => {-->
<!--              console.log('校验' + form.title, form.id, subValid)-->
<!--              if (!subValid) {-->
<!--                success = false-->
<!--              }-->
<!--            })-->
<!--            if (form.name === 'TableList') {-->
<!--              // 扫描明细表项-->
<!--              this.$refs[form.id + '_item'][0].validate((subValid) => {-->
<!--                if (!subValid) {-->
<!--                  success = false-->
<!--                }-->
<!--              })-->
<!--            }-->
<!--          }-->
<!--        })-->
<!--        call(success)-->
<!--      }-->
<!--    },-->
<!--    loadFormItemMap (forms, map) {-->
<!--      forms.forEach((item) => {-->
<!--        if (item.name === 'TableList' || item.name === 'SafetyMeasure') {-->
<!--          map.set(item.id, item)-->
<!--          this.loadFormItemMap(item.props.columns, map)-->
<!--        } else if (item.name === 'SpanLayout' || item.name === 'ModuleBlock') {-->
<!--          this.loadFormItemMap(item.props.items, map)-->
<!--        } else {-->
<!--          map.set(item.id, item)-->
<!--        }-->
<!--      })-->
<!--    },-->
<!--    loadFormConfig (forms, rules) {-->
<!--      forms.forEach((item) => {-->
<!--        if (item.name === 'SpanLayout' || item.name === 'ModuleBlock') {-->
<!--          this.loadFormConfig(item.props.items, this.rules)-->
<!--        } else {-->
<!--          this._value[item.id] = this.modelValue[item.id]-->
<!--          if (-->
<!--            item.props.required &&-->
<!--            this.showItem(item) &&-->
<!--            item.name !== 'SafetyMeasure'-->
<!--          ) {-->
<!--            this.rules[item.id] = [-->
<!--              {-->
<!--                type: ValueType.getValidType(item.valueType),-->
<!--                required: true,-->
<!--                message: `请完成${item.title}`,-->
<!--                trigger: 'blur'-->
<!--              }-->
<!--            ]-->
<!--          } else if (item.props.required && item.name === 'SafetyMeasure') {-->
<!--            this.rules[item.id] = [-->
<!--              {-->
<!--                required: true,-->
<!--                message: `请完成${item.title}`,-->
<!--                trigger: 'blur'-->
<!--              }-->
<!--            ]-->
<!--          }-->
<!--        }-->
<!--      })-->
<!--    },-->
<!--    // 解析表单联动规则-->
<!--    parserRule (cdRule) {-->
<!--      const condition = cdRule.condition-->
<!--      // 在这里可以实现一个算法，按条件层级去解析，不需要解析所有条件，先不实现-->
<!--      if (cdRule.children.length > 0) {-->
<!--        for (let i = 0; i < cdRule.children.length; i++) {-->
<!--          const result = this.parserRule(cdRule.children[i])-->
<!--          if (cdRule.logic) {-->
<!--            // 如果是且关系，有一个为假就是假-->
<!--            if (!result) {-->
<!--              return false-->
<!--            }-->
<!--          } else {-->
<!--            // 如果是或关系，有一个为真就是真-->
<!--            if (result) {-->
<!--              return true-->
<!--            }-->
<!--          }-->
<!--        }-->
<!--        // 遍历完了返回最终结果-->
<!--        return cdRule.logic-->
<!--      } else {-->
<!--        // 解析条件-->
<!--        try {-->
<!--          return this.compare(condition)-->
<!--        } catch (e) {-->
<!--          return false-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    async doActions (actions) {-->
<!--      (actions || []).forEach((action) => {-->
<!--        // 执行预设的动作-->
<!--        switch (action.type) {-->
<!--          case 'SHOW':-->
<!--            action.targets.forEach((tg) => this.showField(tg))-->
<!--            break-->
<!--          case 'HIDE':-->
<!--            action.targets.forEach((tg) => this.hideField(tg))-->
<!--            break-->
<!--          case 'DISABLE':-->
<!--            action.targets.forEach((tg) => this.disableField(tg))-->
<!--            break-->
<!--          case 'UPDATE':-->
<!--            action.targets.forEach((tg) => this.updateField(tg, action.value))-->
<!--            break-->
<!--          case 'ENABLE':-->
<!--            action.targets.forEach((tg) => this.enableField(tg, action.value))-->
<!--            break-->
<!--        }-->
<!--      })-->
<!--    },-->
<!--    analyseFormRule () {-->
<!--      if (this.config.ruleType === 'SIMPLE') {-->
<!--        this.analyseRules()-->
<!--      } else {-->
<!--        this.analyseJsRules()-->
<!--      }-->
<!--    },-->
<!--    async analyseJsRules () {-->
<!--      if (!(this.execute instanceof Function)) {-->
<!--        this.execute = new Function(-->
<!--          'formData',-->
<!--          'formMap',-->
<!--          `${this.config.ruleJs || 'function doChange(){}'-->
<!--          }\r\n doChange(formData, formMap);`-->
<!--        )-->
<!--      }-->
<!--      this.execute(this._value, this.formItemMap)-->
<!--    },-->
<!--    async analyseRules () {-->
<!--      (this.config.rules || []).forEach((rule, i) => {-->
<!--        // 解析表单联动条件-->
<!--        const result = this.parserRule(rule.condition)-->
<!--        console.log(`解析规则 ${i + 1}: ${result}`)-->
<!--        this.doActions(result ? rule.action.with : rule.action.other)-->
<!--      })-->
<!--    },-->
<!--    compare (condition) {-->
<!--      // 要判断组件类型，再取其值-->
<!--      const source = this._value[condition.field]-->
<!--      // 动态调用函数-->
<!--      let compareType = null-->
<!--      switch (condition.fieldType) {-->
<!--        case 'AmountInput':-->
<!--        case 'NumberInput':-->
<!--        case 'Score':-->
<!--        case 'CalcFormula':-->
<!--          compareType = 'numCompare'-->
<!--          break-->
<!--        case 'TextInput':-->
<!--        case 'TextareaInput':-->
<!--        case 'SelectInput':-->
<!--        case 'Location':-->
<!--        case 'Provinces':-->
<!--          compareType = 'strCompare'-->
<!--          break-->
<!--        case 'MultipleSelect':-->
<!--          compareType = 'strArrCompare'-->
<!--          break-->
<!--        case 'DateTime':-->
<!--          compareType = 'timeCompare'-->
<!--          break-->
<!--        case 'DateTimeRange':-->
<!--          compareType = 'timeArrCompare'-->
<!--          break-->
<!--        case 'DeptPicker':-->
<!--        case 'UserPicker':-->
<!--          compareType = 'orgCompare'-->
<!--          break-->
<!--      }-->
<!--      return CompareFuncs[compareType][condition.compare](-->
<!--        source,-->
<!--        condition.fixed-->
<!--          ? condition.compareVal-->
<!--          : this._value[condition.compareVal[0]]-->
<!--      )-->
<!--    },-->
<!--    isRequired (item) {-->
<!--      return this.rules[item.id] !== undefined-->
<!--    },-->
<!--    hideField (id) {-->
<!--      const field = this.formItemMap.get(id)-->
<!--      if (field) {-->
<!--        field.perm = 'H'-->
<!--      }-->
<!--    },-->
<!--    showField (id) {-->
<!--      const field = this.formItemMap.get(id)-->
<!--      if (field) {-->
<!--        field.perm = this.formPermHis[id] || 'E'-->
<!--      }-->
<!--    },-->
<!--    disableField (id) {-->
<!--      const field = this.formItemMap.get(id)-->
<!--      if (field) {-->
<!--        field.perm = 'R'-->
<!--      }-->
<!--    },-->
<!--    enableField (id) {-->
<!--      const field = this.formItemMap.get(id)-->
<!--      if (field) {-->
<!--        field.perm = 'E'-->
<!--      }-->
<!--    },-->
<!--    updateField (id, val) {-->
<!--      const field = this.formItemMap.get(id)-->
<!--      if (field) {-->
<!--        this._value[id] = val-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  emits: ['update:modelValue']-->
<!--}-->
<!--</script>-->

<!--<style lang="less" scoped>-->
<!--.process-form {-->
<!--  :deep(.el-form-item__label) {-->
<!--    height: 30px;-->
<!--    line-height: 30px;-->
<!--    padding: 0 0;-->
<!--  }-->

<!--  :deep(.van-cell) {-->
<!--    padding: 10px 0;-->
<!--    font-size: 1.2rem;-->
<!--  }-->
<!--}-->

<!--:deep(.el-form-item__label) {-->
<!--  margin-bottom: 0 !important;-->
<!--}-->

<!--:deep(.readonly) {-->
<!--  font-size: 16px;-->

<!--  .el-form-item {-->
<!--    margin-bottom: 10px;-->

<!--    .el-form-item__label::before {-->
<!--      display: none;-->
<!--    }-->

<!--    .el-form-item__content {-->
<!--      padding-left: 5px;-->
<!--      line-height: 30px;-->
<!--    }-->
<!--  }-->

<!--  .m-form-item {-->
<!--    padding: 10px 5px;-->
<!--    margin-bottom: 0;-->

<!--    .m-form-item_title {-->
<!--      font-size: 16px;-->

<!--      .title-required {-->
<!--        display: none;-->
<!--      }-->
<!--    }-->

<!--    .m-form-item_content {-->
<!--      padding-left: 4px;-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->
