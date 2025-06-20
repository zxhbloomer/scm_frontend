<template>
  <div>
    <el-form-item label="提示文字">
      <el-input v-model="value.placeholder" size="small" placeholder="请设置提示语" />
    </el-form-item>
    <el-form-item label="笔画粗细">
      <el-input-number v-model="value.thickness" controls-position="right" :precision="0" :max="5" :min="1" size="small" placeholder="笔画粗细" />
    </el-form-item>
    <el-form-item label="笔迹颜色">
      <el-color-picker v-model="value.color" size="medium" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'SignPanelConfig',
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
