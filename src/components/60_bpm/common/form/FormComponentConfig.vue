<template>
  <div>
    <el-form v-if="true" label-width="90px">
      <template v-if="showPublicConfig">
        <el-form-item label="表单ID">
          <el-input v-model="form.id" size="small" disabled />
        </el-form-item>
        <el-form-item label="表单名称">
          <el-input v-model="form.title" size="small" clearable />
        </el-form-item>
      </template>
      <component :is="form.name" v-model="form.props" />
      <template v-if="showPublicConfig">
        <el-form-item label="必填项">
          <el-switch v-model="form.props.required" />
        </el-form-item>
        <el-form-item label="可打印">
          <el-switch v-model="form.props.enablePrint" />
        </el-form-item>
      </template>
    </el-form>
    <el-empty v-else description="当前组件不支持配置" />
  </div>

</template>

<script>
export default {
  name: 'FormComponentConfig',
  components: {
    TextInput: () => import ('./config/TextInputConfig.vue'),
    NumberInput: () => import ('./config/NumberInputConfig.vue'),
    AmountInput: () => import ('./config/AmountInputConfig.vue'),
    TextareaInput: () => import ('./config/TextareaInputConfig.vue'),
    SelectInput: () => import ('./config/SelectInputConfig.vue'),
    MultipleSelect: () => import ('./config/SelectInputConfig.vue'),
    TimePicker: () => import ('./config/TimePickerConfig.vue'),
    TimeRangePicker: () => import ('./config/TimeRangePickerConfig.vue'),
    DateTime: () => import ('./config/DateTimeConfig.vue'),
    DateTimeRange: () => import ('./config/DateTimeRangeConfig.vue'),
    ImageUpload: () => import ('./config/ImageUploadConfig.vue'),
    FileUpload: () => import ('./config/FileUploadConfig.vue'),
    Description: () => import ('./config/DescriptionConfig.vue'),
    MoneyInput: () => import ('./config/MoneyInputConfig.vue'),
    DeptPicker: () => import ('./config/DeptPickerConfig.vue'),
    UserPicker: () => import ('./config/UserPickerConfig.vue'),
    TableList: () => import ('./config/TableListConfig.vue'),
    Location: () => import ('./config/LocationConfig.vue'),
    Provinces: () => import ('./config/ProvincesConfig.vue'),
    SignPanel: () => import ('./config/SignPanelConfig.vue'),
    Score: () => import ('./config/ScoreConfig.vue'),
    WebIframe: () => import ('./config/WebIframeConfig.vue'),
    VueContainer: () => import ('./config/VueContainerConfig.vue'),
    ProcessIndex: () => import ('./config/ProcessIndexConfig.vue'),
    CalcFormula: () => import ('./config/CalcFormulaConfig.vue'),
    SpanLayout: () => import ('./config/SpanLayoutConfig.vue')
  },
  props: {},
  data () {
    return {}
  },
  computed: {
    form () {
      return this.$store.getters.selectFormItem
    },
    showPublicConfig () {
      return this.form.name !== 'SpanLayout'
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
