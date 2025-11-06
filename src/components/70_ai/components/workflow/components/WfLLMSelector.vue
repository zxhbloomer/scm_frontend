<template>
  <el-select
    v-model="selectedModelId"
    placeholder="请选择模型"
    filterable
    clearable
    style="width: 100%"
    @change="handleSelect"
  >
    <el-option
      v-for="option in llmOptions"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    >
      <span>{{ option.label }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">{{ option.provider }}</span>
    </el-option>
  </el-select>
</template>

<script>
/**
 * WfLLMSelector 组件
 * AI模型选择器组件，用于workflow节点中选择LLM模型
 *
 * 技术迁移：
 * - Naive UI NSelect → Element UI el-select
 * - TypeScript → JavaScript
 * - Composition API → Options API
 * - appStore.llms → this.$store.getters['app/llmOptions']
 */

import { mapGetters } from 'vuex'

export default {
  name: 'WfLLMSelector',

  props: {
    // 当前选中的模型显示名称(对应name字段，如"gj-deepseek")
    modelName: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      // 本地选中的模型ID
      selectedModelId: null
    }
  },

  computed: {
    ...mapGetters('ai/app', ['llmOptions', 'getLlmById'])
  },

  watch: {
    // 监听prop变化,同步到本地状态
    modelName (newVal) {
      this.updateSelectedModelId(newVal)
    },

    // 监听模型列表加载完成，初始化选中项
    llmOptions: {
      immediate: true,
      handler () {
        if (this.modelName && this.llmOptions.length > 0) {
          this.updateSelectedModelId(this.modelName)
        }
      }
    }
  },

  mounted () {
    // 组件挂载时，根据 modelName 查找对应的 ID
    if (this.modelName) {
      this.updateSelectedModelId(this.modelName)
    }
  },

  methods: {
    /**
     * 根据模型名称更新选中的模型ID
     * @param {String} modelName 模型显示名称（name字段值，如"gj-deepseek"）
     */
    updateSelectedModelId (modelName) {
      if (!modelName) {
        this.selectedModelId = null
        return
      }

      // 只接受字符串格式的模型名称
      if (typeof modelName !== 'string') {
        this.selectedModelId = null
        return
      }

      // 按显示名称（label就是name）查找对应的ID
      const model = this.llmOptions.find(opt => opt.label === modelName)

      if (model) {
        this.selectedModelId = model.value
      } else {
        this.selectedModelId = null
      }
    },

    /**
     * 处理模型选择
     * @param {Number} modelId 选中的模型ID
     */
    handleSelect (modelId) {
      // 根据ID查找模型对象
      const model = this.getLlmById(modelId)

      // 触发事件，传递模型显示名称（name字段）给父组件
      if (model) {
        this.$emit('llm-selected', model.name)
      } else {
        this.$emit('llm-selected', '')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 使用 Element UI 默认样式,无需额外定义
</style>
