<template>
  <el-select
    v-if="context.compare === 'IN' || context.compare === 'NIN'"
    v-model="context.compareVal"
    size="small"
    multiple
    default-first-option
    style="width: calc(100% - 410px);"
    allow-create
    filterable
    placeholder="输入可能的值"
  />
  <el-input
    v-else
    v-model="context.compareVal[0]"
    size="small"
    style="width: calc(100% - 410px);"
    placeholder="输入比较值"
  />
</template>
<script>
export default {
  name: 'StrCompare',
  props: {
    context: {
      require: true,
      type: Object
    }
  }
}
</script>
