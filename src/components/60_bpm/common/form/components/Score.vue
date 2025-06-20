<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-rate :max="max" disabled />
      <span>{{ placeholder }}</span>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-rate v-model="_value" :show-score="showScore" :allow-half="enableHalf" :max="max" />
      <span v-if="!$isNotEmpty(_value) || _value === 0">{{ placeholder }}</span>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <div>
        <rate v-model="_value" :allow-half="enableHalf" :count="max" />
        <span v-show="showScore" style="margin-left: 10px">{{ _value }}</span>
      </div>
      <span v-if="!$isNotEmpty(_value) && _value === 0">{{ placeholder }}</span>
    </div>
    <div v-else>
      <el-rate v-model="_value" :allow-half="enableHalf" :show-score="showScore" disabled :max="max" />
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'
import { Rate } from 'vant'

export default {
  name: 'TextInput',
  components: { Rate },
  mixins: [componentMinxins],
  props: {
    value: {
      type: Number,
      default: 0
    },
    placeholder: {
      type: String,
      default: '请打分'
    },
    max: {
      type: Number,
      default: 5
    },
    enableHalf: {
      type: Boolean,
      default: false
    },
    showScore: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
