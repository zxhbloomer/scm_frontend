<template>
  <node
    title="发起人"
    :is-root="true"
    :content="content"
    placeholder="所有人"
    header-bgc="#7a939d"
    header-icon="el-icon-user-solid"
    @selected="$emit('selected')"
    @insertNode="type => $emit('insertNode', type)"
  />
</template>

<script>
import Node from './Node'

export default {
  name: 'RootNode',
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
    }
  },
  computed: {
    content () {
      if (this.config.props.assignedUser.length > 0) {
        const texts = []
        this.config.props.assignedUser.forEach(org => texts.push(org.name))
        return String(texts).replaceAll(',', '、')
      } else {
        return '所有人'
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
