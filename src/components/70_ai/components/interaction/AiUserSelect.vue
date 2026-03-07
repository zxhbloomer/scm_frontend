<template>
  <div class="ai-user-select">
    <div class="ai-interaction-desc">{{ interaction.description }}</div>
    <el-radio-group v-model="selectedKey" class="ai-select-options">
      <el-radio
        v-for="option in options"
        :key="option.key"
        :label="option.key"
        class="ai-select-option"
      >
        {{ option.label }}
      </el-radio>
    </el-radio-group>
    <div class="ai-interaction-footer">
      <el-button
        type="primary"
        size="small"
        :disabled="!selectedKey || submitted"
        @click="handleSubmit"
      >
        确认选择
      </el-button>
      <el-button
        size="small"
        :disabled="submitted"
        @click="handleCancel"
      >
        取消
      </el-button>
      <span class="ai-countdown">{{ formattedTime }}</span>
    </div>
  </div>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserSelect',

  props: {
    interaction: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      selectedKey: '',
      submitted: false
    }
  },

  computed: {
    options () {
      return (this.interaction.params && this.interaction.params.options) || []
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  methods: {
    handleSubmit () {
      if (!this.selectedKey) return
      this.submitted = true
      const selected = this.options.find(o => o.key === this.selectedKey)
      this.$emit('submit', 'select_record', selected ? selected.data : { key: this.selectedKey })
    },
    handleCancel () {
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-user-select {
  padding: 12px;
  background: #f4f7fe;
  border-radius: 8px;
  margin-top: 8px;
}
.ai-interaction-desc {
  font-size: 13px;
  color: #303133;
  margin-bottom: 10px;
}
.ai-select-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ai-select-option {
  margin-right: 0;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}
.ai-interaction-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-countdown {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}
</style>
