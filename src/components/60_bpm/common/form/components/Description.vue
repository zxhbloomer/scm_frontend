<template>
  <div :style="{'color': color}">
    <el-icon class="el-icon-warning-outline" />
    <span> {{ placeholder }}</span>
  </div>

</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  name: 'Description',
  components: {},
  mixins: [componentMinxins],
  props: {
    color: {
      type: String,
      default: '#868686'
    },
    placeholder: {
      type: String,
      default: '只是一段说明文字'
    }
  },
  data () {
    return {}
  },
  methods: {}
}
</script>

<style scoped>

</style>
