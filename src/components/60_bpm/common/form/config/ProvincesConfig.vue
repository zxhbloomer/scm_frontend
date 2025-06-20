<template>
  <div>
    <el-form-item label="提示文字">
      <el-input v-model="value.placeholder" size="small" placeholder="请设置提示语" />
    </el-form-item>
    <el-form-item label="地区级别">
      <el-select v-model="value.level" size="small">
        <el-option :value="1" label="省" />
        <el-option :value="2" label="省-市" />
        <el-option :value="3" label="省-市-区" />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'Provinces',
  components: {

  },
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
