<template>
  <node
    :title="config.name"
    :show-error="showError"
    :content="content"
    :error-info="errorInfo"
    placeholder="请设置抄送人"
    header-bgc="#409eff"
    header-icon="el-icon-s-promotion"
    @selected="$emit('selected')"
    @delNode="$emit('delNode')"
    @insertNode="type => $emit('insertNode', type)"
  />
</template>

<script>
import Node from './Node'

export default {
  name: 'CcNode',
  components: { Node },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      showError: false,
      errorInfo: ''
    }
  },
  computed: {
    content () {
      if (this.config.props.shouldAdd) {
        return '由发起人指定'
      } else if (this.config.props.assignedUser.length > 0) {
        const texts = []
        this.config.props.assignedUser.forEach(org => texts.push(org.name))
        return String(texts).replaceAll(',', '、')
      } else {
        return null
      }
    }
  },
  methods: {
    // 校验数据配置的合法性
    validate (err) {
      this.showError = false
      if (this.config.props.shouldAdd) {
        this.showError = false
      } else if (this.config.props.assignedUser.length === 0) {
        this.showError = true
        this.errorInfo = '请选择需要抄送的人员'
      }
      if (this.showError) {
        err.push(`抄送节点 ${this.config.name} 未设置抄送人`)
      }
      return !this.showError
    }
  }
}
</script>

<style scoped>

</style>
