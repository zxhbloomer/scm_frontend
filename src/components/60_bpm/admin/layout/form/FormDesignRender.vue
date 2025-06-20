<template>
  <component :is="config.name" ref="form" v-model="_value" :index="index" :form-data="formData" :readonly="readonly" :mode="mode" v-bind="config.props" />
</template>
<script>

import components from '@/components/60_bpm/common/form/ComponentExport'

export default {
  name: 'FormRender',
  components: components,
  props: {
    mode: {
      type: String,
      default: 'DESIGN'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    value: {
      default: undefined
    },
    config: {
      type: Object,
      default: () => {
        return {}
      }
    },
    index: {
      type: Number,
      default: 0
    },
    formData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {}
  },
  computed: {
    _value: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    validate (call) {
      if (this.$refs.form.validate) {
        this.$refs.form.validate(call)
      } else {
        call(true)
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
