<template>
  <div>
    <el-form-item label="提示文字">
      <el-input v-model="value.placeholder" size="small" placeholder="请设置时间提示" />
    </el-form-item>
    <el-form-item label="时间格式">
      <el-select v-model="value.format" size="small">
        <el-option value="HH:mm:ss" label="时分秒" />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TimePickerConfig',
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {}
  },
  methods: {}
}
</script>

<style scoped>

</style>
