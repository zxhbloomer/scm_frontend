<template>
  <div v-if="!isTask">
    <el-tag v-if="instance.status === 'RUNNING'" type="primary" :size="size">进行中</el-tag>
    <el-tag v-else-if="instance.result === 'refuse-end'" type="danger" :size="size">审批驳回</el-tag>
    <el-tag v-else-if="instance.result === 'cancel-end'" type="info" :size="size">已撤销</el-tag>
    <el-tag v-else type="success" :size="size">审批通过</el-tag>
  </div>
  <el-tag v-else :type="(taskStatus[instance.taskResult] || {}).type" size="medium">{{ (taskStatus[instance.taskResult] || {}).text }}</el-tag>
</template>

<script>
export default {
  name: 'ProcessStatus',
  components: {},
  props: {
    instance: {
      type: Object,
      default: () => {
        return {}
      }
    },
    size: {
      type: String,
      default: 'medium'
    },
    isTask: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      taskStatus: {
        agree: { type: 'success', text: '已同意' },
        refuse: { type: 'danger', text: '已拒绝' },
        recall: { type: 'warning', text: '已退回' },
        transfer: { type: 'primary', text: '已转交' }
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
