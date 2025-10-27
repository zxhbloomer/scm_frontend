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
 * 严格参考 aideepin 的 WfLLMSelector.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\WfLLMSelector.vue
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
    // 当前选中的模型名称(对应model_name字段)
    modelName: {
      type: [String, Number],
      default: ''
    }
  },

  data () {
    return {
      // 本地选中的模型ID
      selectedModelId: this.modelName
    }
  },

  computed: {
    ...mapGetters('ai/app', ['llmOptions', 'getLlmById'])
  },

  watch: {
    // 监听prop变化,同步到本地状态
    modelName (newVal) {
      this.selectedModelId = newVal
    }
  },

  methods: {
    /**
     * 处理模型选择
     * 严格参考 aideepin 的 handleSelect 方法
     * @param {Number} modelId 选中的模型ID
     */
    handleSelect (modelId) {
      // 触发事件,传递模型名称给父组件
      // 注意: aideepin 传递 modelName, scm-ai 这里传递 modelId
      // 因为 scm-ai 使用数据库主键ID, aideepin 使用 modelName 字符串
      this.$emit('llm-selected', modelId)
    }
  }
}
</script>

<style lang="scss" scoped>
// 使用 Element UI 默认样式,无需额外定义
</style>
