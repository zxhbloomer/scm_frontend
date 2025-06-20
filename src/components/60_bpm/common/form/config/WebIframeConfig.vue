<template>
  <div>
    <el-form-item label="URL地址">
      <el-input v-model="value.url" size="small" placeholder="请输入网页地址URL" />
    </el-form-item>
    <el-form-item label="网页高度">
      <el-input-number v-model="value.height" size="small" :max="2000" :min="50" placeholder="网页高度px" />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'WebIframeConfig',
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
