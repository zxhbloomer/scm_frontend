<template>
  <el-radio-group
    :value="value"
    :disabled="disabled"
    @input="handleChange"
  >
    <el-radio-button
      v-for="item in filteredOptions"
      :key="item.id"
      :value="item.id"
      :label="item.id"
    >{{ item.name }}
    </el-radio-button>
  </el-radio-group>
</template>

<script>
export default {
  name: 'RadioMenuComponent',
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    apiMethod: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      dataJson: {
        selectOptions: [],
        settings: {
          loading: false
        }
      }
    }
  },
  computed: {
    filteredOptions () {
      return this.dataJson.selectOptions.filter(item => item && item.id != null)
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    async loadData () {
      try {
        this.dataJson.settings.loading = true
        const response = await this.apiMethod()
        const rawData = response.data || []
        this.dataJson.selectOptions = Array.isArray(rawData)
          ? rawData.filter(item => item && item.id != null)
          : []
      } catch (error) {
        console.error('加载菜单数据失败:', error)
        this.dataJson.selectOptions = []
        this.$message.error('加载菜单数据失败')
      } finally {
        this.dataJson.settings.loading = false
      }
    },
    handleChange (val) {
      this.$emit('change', val)
    }
  }
}
</script>
