<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      内联框架，显示URL页面
    </div>
    <div v-else>
      <iframe scrolling="auto" frameborder="0" :src="parsingUrl" :height="height + 'px'" width="100%" />
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'
import { Field, Toast } from 'vant'
import ScanCode from '@/components/60_bpm/common/ScanCode'

export default {
  name: 'WebIframe',
  components: { Field, ScanCode },
  mixins: [componentMinxins],
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    },
    url: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 200
    }
  },
  data () {
    return {
      visible: false
    }
  },
  computed: {
    parsingUrl () {
      // 上下文变量
      const context = this.$store.getters.context || {}
      // 为了支持变量替换、可能导致安全问题
      return eval('`' + this.url + '`')
    }
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>

</style>
