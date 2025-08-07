<template>
  <span class="field-help-container">
    <!-- 显示字段标签 -->
    <span class="field-label">{{ displayLabel }}</span>

    <!-- 帮助图标 - 仅在有帮助文字时显示 -->
    <el-tooltip
      v-if="helpText"
      :content="helpText"
      placement="top"
      effect="dark"
    >
      <i class="el-icon-question field-help-icon" />
    </el-tooltip>
  </span>
</template>

<script>
/**
 * FieldHelp - 表格字段帮助组件
 * 用于显示表格列标题和帮助提示信息
 */

// 字段说明配置
const fieldHelpConfig = {
  // 采购合同列表页
  'pocontract-list': {
    'order_count': {
      label: '', // 空值使用默认标签
      help: '该合同下已创建的采购订单数量'
    },
    'progress': {
      label: '执行进度(%)', // 有值时覆盖默认标签
      help: '合同执行进度 = 已完成金额 ÷ 合同总金额 × 100%'
    }
  }
}

export default {
  name: 'FieldHelp',
  props: {
    // 字段名称
    field: {
      type: String,
      required: true
    },
    // 页面标识
    page: {
      type: String,
      required: true
    },
    // 默认标签文字
    defaultLabel: {
      type: String,
      required: true
    }
  },
  computed: {
    // 获取字段配置
    fieldConfig () {
      const pageConfig = fieldHelpConfig[this.page] || {}
      return pageConfig[this.field] || {}
    },

    // 显示的标签文字
    displayLabel () {
      // 如果JSON配置中有label且不为空，使用配置的label
      // 否则使用页面传入的defaultLabel
      return this.fieldConfig.label || this.defaultLabel
    },

    // 帮助文字
    helpText () {
      return this.fieldConfig.help || ''
    }
  }
}
</script>

<style scoped>
.field-help-container {
  display: inline-flex;
  align-items: center;
}

.field-label {
  margin-right: 4px;
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
