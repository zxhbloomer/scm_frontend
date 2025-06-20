<template>
  <el-input
    v-model="context.compareVal[0]"
    size="small"
    placeholder="输入比较值"
  />
</template>
<script>
export default {
  name: 'StrArrCompare',
  components: {},
  props: {
    context: {
      require: true,
      type: Object
    }
  }
}
</script>

