<template>
  <div>
    <el-select
      v-model="selectedModelId"
      placeholder="请选择模型"
      filterable
      clearable
      style="width: 100%"
      @change="handleSelect"
    >
      <el-option
        v-for="option in allOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      >
        <span>{{ option.label }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">{{ option.provider }}</span>
      </el-option>
    </el-select>

    <el-alert
      v-if="unavailableModelName"
      :title="'模型 ' + unavailableModelName + ' 已不可用，请重新选择'"
      type="warning"
      :closable="false"
      show-icon
      style="margin-top: 8px;"
    />
  </div>
</template>

<script>
/**
 * WfLLMSelector 组件
 * AI模型选择器组件，用于workflow节点中选择LLM模型
 *
 * 功能：
 * 1. 下拉列表首项为"默认模型"（使用系统配置的默认模型）
 * 2. 其余选项为已启用的具体模型
 * 3. 当已保存的模型被删除/停用时，显示警告提示
 */

import { mapGetters } from 'vuex'

/** "默认模型"特殊选项的value值 */
const DEFAULT_MODEL_VALUE = -1

export default {
  name: 'WfLLMSelector',

  props: {
    // 当前选中的模型显示名称(对应name字段，如"gj-deepseek")，空字符串表示"默认模型"
    modelName: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      selectedModelId: null,
      // 已保存但不可用的模型名称（模型被删除/停用时显示警告）
      unavailableModelName: ''
    }
  },

  computed: {
    ...mapGetters('ai/app', ['llmOptions', 'getLlmById']),

    /**
     * 完整选项列表：默认模型 + 具体模型
     */
    allOptions () {
      return [
        { label: '默认模型', value: DEFAULT_MODEL_VALUE, provider: '系统配置' },
        ...this.llmOptions
      ]
    }
  },

  watch: {
    modelName (newVal) {
      this.updateSelectedModelId(newVal)
    },

    llmOptions: {
      immediate: true,
      handler () {
        if (this.llmOptions.length > 0) {
          this.updateSelectedModelId(this.modelName)
        }
      }
    }
  },

  mounted () {
    this.updateSelectedModelId(this.modelName)
  },

  methods: {
    /**
     * 根据模型名称更新选中的模型ID
     * @param {String} modelName 模型显示名称，空字符串表示"默认模型"
     */
    updateSelectedModelId (modelName) {
      // 空值或空字符串 → 选中"默认模型"
      if (!modelName) {
        this.selectedModelId = DEFAULT_MODEL_VALUE
        this.unavailableModelName = ''
        return
      }

      if (typeof modelName !== 'string') {
        this.selectedModelId = DEFAULT_MODEL_VALUE
        this.unavailableModelName = ''
        return
      }

      // 按显示名称查找对应的模型ID
      const model = this.llmOptions.find(opt => opt.label === modelName)

      if (model) {
        this.selectedModelId = model.value
        this.unavailableModelName = ''
      } else if (this.llmOptions.length > 0) {
        // 模型列表已加载但找不到该模型 → 模型已被删除/停用
        this.selectedModelId = null
        this.unavailableModelName = modelName
      }
    },

    /**
     * 处理模型选择
     * @param {Number} modelId 选中的模型ID（-1表示默认模型）
     */
    handleSelect (modelId) {
      this.unavailableModelName = ''

      // 选择"默认模型" → emit空字符串
      if (modelId === DEFAULT_MODEL_VALUE) {
        this.$emit('llm-selected', '')
        return
      }

      // 选择具体模型 → emit模型name
      const model = this.getLlmById(modelId)
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
