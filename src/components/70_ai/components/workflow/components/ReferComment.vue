<template>
  <div class="refer-comment">
    <div>1. 使用大括号引用【输入】中已定义变量，如：{var_name1}</div>
    <div>2. 使用 {input} 引用上个节点的默认执行结果</div>
  </div>
</template>

<script>
export default {
  name: 'ReferComment'
}
</script>

<style lang="scss" scoped>
.refer-comment {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}
</style>
