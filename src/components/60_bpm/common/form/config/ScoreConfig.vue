<template>
  <div>
    <el-form-item label="提示文字">
      <el-input v-model="value.placeholder" size="small" placeholder="请设置提示语" />
    </el-form-item>
    <el-form-item label="最大分值">
      <el-input-number v-model="value.max" controls-position="right" :precision="0" :max="20" :min="1" size="small" placeholder="最大分值" />
    </el-form-item>
    <el-form-item label="允许半分">
      <el-switch v-model="value.enableHalf" />
    </el-form-item>
    <el-form-item label="显示分值">
      <el-switch v-model="value.showScore" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'ScoreConfig',
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
