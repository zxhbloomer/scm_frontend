<template>
  <el-select
    v-model="selectedModelName"
    placeholder="请选择LLM模型"
    filterable
    @change="handleSelect"
  >
    <el-option
      v-for="item in availableLLMs"
      :key="item.modelName"
      :label="item.modelLabel || item.modelName"
      :value="item.modelName"
    >
      <span style="float: left">{{ item.modelLabel || item.modelName }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">
        {{ item.modelPlatform || '' }}
      </span>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'WfLLMSelector',

  props: {
    modelName: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      selectedModelName: '',
      availableLLMs: []
    }
  },

  watch: {
    modelName: {
      immediate: true,
      handler (val) {
        this.selectedModelName = val || ''
      }
    }
  },

  async mounted () {
    await this.loadAvailableLLMs()
  },

  methods: {
    async loadAvailableLLMs () {
      try {
        // 从 AI 模块的 model API 获取可用模型
        const { modelList } = await import('@/components/70_ai/components/model/utils')
        const response = await modelList({ page: 1, pageSize: 100 })

        if (response.data && response.data.records) {
          // 筛选出可用的 LLM 模型
          this.availableLLMs = response.data.records.filter(model =>
            model.modelStatus === true && // 状态启用
            (model.modelType === 1 || model.modelType === 'LLM') && // LLM 类型
            model.modelName
          ).map(model => ({
            modelName: model.modelName,
            modelLabel: model.modelLabel || model.modelName,
            modelPlatform: model.modelPlatform
          }))

          // 如果没有选中的模型，选择第一个
          if (!this.selectedModelName && this.availableLLMs.length > 0) {
            this.selectedModelName = this.availableLLMs[0].modelName
            this.handleSelect(this.selectedModelName)
          }
        }
      } catch (error) {
        console.error('加载LLM模型列表失败:', error)
        this.$message.error('加载LLM模型列表失败')
      }
    },

    handleSelect (modelName) {
      this.$emit('llm-selected', modelName)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-select {
  width: 100%;
}
</style>
