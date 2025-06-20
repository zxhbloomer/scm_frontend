<template>
  <div>
    <el-form-item label="提示文字">
      <el-input v-model="value.placeholder" size="small" placeholder="请设置提示语" />
    </el-form-item>
    <el-form-item label="扫码录入">
      <el-switch v-model="value.enableScan" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TextInput',
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
    return {
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
