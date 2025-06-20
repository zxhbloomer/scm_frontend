<template>
  <span v-if="context.compare === 'IN_EQ' || context.compare === 'IN_NEQ'">
    <el-input-number v-model="context.compareVal[0]" size="small" controls-position="right" />
    <span style="margin: 5px"> ~ </span>
    <el-input-number v-model="context.compareVal[1]" size="small" controls-position="right" />
  </span>
  <el-select
    v-else-if="context.compare === 'IN' || context.compare === 'NIN'"
    v-model="context.compareVal"
    size="small"
    multiple
    default-first-option
    style="width: calc(100% - 410px);"
    allow-create
    filterable
    placeholder="输入可能的值"
  />
  <el-input-number v-else v-model="context.compareVal[0]" size="small" controls-position="right" />
</template>
<script>
export default {
  name: 'NumCompare',
  props: {
    context: {
      require: true,
      type: Object
    }
  }
}
</script>
