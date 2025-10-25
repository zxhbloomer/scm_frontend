<template>
  <el-select
    v-model="selectedOperator"
    placeholder="请选择运算符"
    style="width: 100%;"
    @change="handleSelect"
  >
    <el-option
      v-for="item in operatorOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script>
export default {
  name: 'OperatorSelector',

  props: {
    selected: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      selectedOperator: '',
      operatorOptions: []
    }
  },

  watch: {
    selected: {
      immediate: true,
      handler (val) {
        this.selectedOperator = val || ''
      }
    }
  },

  async mounted () {
    await this.loadOperators()
  },

  methods: {
    /**
     * 加载运算符列表
     */
    async loadOperators () {
      try {
        // 从store获取运算符列表
        const operators = this.$store.state.ai.workflow.operators || []

        // 如果store中没有，则加载
        if (operators.length === 0) {
          await this.$store.dispatch('ai/workflow/loadOperators')
        }

        // 获取运算符选项
        const loadedOperators = this.$store.state.ai.workflow.operators || []
        this.operatorOptions = loadedOperators.map(op => ({
          label: op.desc,
          value: op.name
        }))
      } catch (error) {
        console.error('加载运算符列表失败:', error)
      }
    },

    /**
     * 处理运算符选择
     */
    handleSelect (operator) {
      this.$emit('operator-selected', operator)
    }
  }
}
</script>
