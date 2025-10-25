<template>
  <el-tooltip
    :content="tooltipContent"
    placement="top"
  >
    <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
  </el-tooltip>
</template>

<script>
export default {
  name: 'ReferTooltip',

  props: {
    brief: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    tooltipContent () {
      if (this.brief) {
        return '可使用 {变量名} 引用输入变量'
      }
      return '可使用大括号引用【输入】中已定义变量，如：{var_name1}'
    }
  }
}
</script>
