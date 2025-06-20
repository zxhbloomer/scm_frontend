<template>
  <el-date-picker
    v-if="context.compare === 'IN' || context.compare === 'NIN'"
    v-model="context.compareVal"
    type="datetimerange"
    size="small"
    placeholder="选择比较时间区间"
  />
  <el-date-picker
    v-else
    v-model="context.compareVal[0]"
    size="small"
    type="datetime"
    placeholder="选择比较时间点"
  />
</template>
<script>
export default {
  name: 'TimeCompare',
  components: {},
  props: {
    context: {
      require: true,
      type: Object
    }
  }
}
</script>
