<template>
  <span class="field-help-container">
    <!-- 显示字段标签 -->
    <span>{{ displayLabel }}</span>

    <!-- 帮助图标 - 仅在有帮助文字时显示 -->
    <el-tooltip
      v-if="help"
      :placement="placement"
      :effect="effect"
    >
      <div slot="content" v-html="help" />
      <i class="el-icon-question field-help-icon" />
    </el-tooltip>
  </span>
</template>

<script>
/**
 * FieldHelp - 表格字段帮助组件
 * 用于显示表格列标题和帮助提示信息
 */

export default {
  name: 'FieldHelp',
  props: {
    // 默认标签文字（必需）
    defaultLabel: {
      type: String,
      required: true
    },
    // 帮助提示文本，支持HTML格式
    help: {
      type: String,
      default: ''
    },
    // 覆盖默认标签的文字
    label: {
      type: String,
      default: ''
    },
    // tooltip位置
    placement: {
      type: String,
      default: 'top'
    },
    // tooltip效果
    effect: {
      type: String,
      default: 'dark'
    }
  },
  computed: {
    // 显示的标签文字
    displayLabel () {
      // 如果有自定义label且不为空，使用自定义label
      // 否则使用defaultLabel
      return this.label || this.defaultLabel
    }
  }
}
</script>

<style scoped>
.field-help-container {
  display: inline-flex;
  align-items: center;
}

.field-help-icon {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  margin-left: 2px;
}

.field-help-icon:hover {
  color: #40a9ff;
}
</style>
