<template>
  <div>
    <el-form-item label="分栏数">
      <el-select v-model="value.number" size="small" placeholder="请选择要分几栏">
        <el-option :value="2" label="分2栏" />
        <el-option :value="3" label="分3栏" />
        <el-option :value="4" label="分4栏" />
        <el-option :value="6" label="分6栏" />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'SpanLayoutConfig',
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
