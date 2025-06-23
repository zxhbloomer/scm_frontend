<template>
  <div :class="getClass()">
    {{ prefix }}
    <vue-autonumeric
      ref="refNumber"
      v-model="amount"
      :options="dataJson.options"
      class="el-input__inner"
      :disabled="disabled"
      :style="getStyle()"
    />
    {{ suffix }}
  </div>
</template>

<style scoped>
</style>

<script>
import VueAutonumeric from 'vue-autonumeric/src/components/VueAutonumeric.vue'

export default {
  name: 'NumberCurrency',
  components: { VueAutonumeric },
  directives: {},
  mixins: [],
  props: {
    // 启用禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 如果不需要显示货币符号，可以传空，代表为数值
    currencySymbol: {
      type: String,
      default: '¥'
    },
    // 如果没有填写数据，默认显示0
    emptyInputBehavior: {
      type: String,
      default: 'zero'
    },
    // 最小值，0意味着不可输入负数
    minimumValue: {
      type: Number,
      default: 0
    },
    // 最大值，1意味着不可大于1
    maximumValue: {
      type: Number,
      default: 10000000000
    },
    // 小数点
    decimalPlaces: {
      type: Number,
      default: 0
    },
    // 宽度百分比
    widthCss: {
      type: String,
      default: '100%'
    },
    // 前缀
    prefix: {
      type: String,
      default: ''
    },
    // 后缀
    suffix: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: 0
    },
    // 正百分比参数：只支持正百分比
    positivePercentage: {
      type: Boolean,
      default: false
    },
    // 百分比参数：支持正负百分比
    percentage: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      amount: this.value,
      dataJson: {
        // autonumeric的配置
        options: this.getOptionsValue()
      }
    }
  },
  computed: {
  },
  // 监听器
  watch: {
    amount: function (newVal) {
      this.$emit('input', newVal)
    },
    value: function (newVal, oldVal) {
      this.amount = newVal
      this.$emit('input', newVal)
    },
    // 监听百分比参数变化
    positivePercentage: function () {
      this.dataJson.options = this.getOptionsValue()
    },
    percentage: function () {
      this.dataJson.options = this.getOptionsValue()
    }
  },
  mounted () {
  },
  methods: {
    // 根据百分比参数获取options值
    getOptionsValue () {
      // 如果正百分比参数为true
      if (this.positivePercentage) {
        return 'percentageUS2decPos'
      }
      // 如果百分比参数为true
      if (this.percentage) {
        return 'percentageUS2dec'
      }
      // 其他情况返回原来的对象格式
      return {
        currencySymbol: this.currencySymbol,
        emptyInputBehavior: this.emptyInputBehavior,
        minimumValue: this.minimumValue,
        maximumValue: this.maximumValue,
        decimalPlaces: this.decimalPlaces
      }
    },
    getClass () {
      if (this.disabled) {
        return 'el-input el-input--mini is-disabled el-input--suffix'
      }
      return 'el-input el-input--mini el-input--suffix'
    },
    getStyle () {
      return 'width:' + this.widthCss
    }
  }
}
</script>
