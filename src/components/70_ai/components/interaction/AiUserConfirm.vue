<template>
  <div class="ai-user-confirm">
    <div class="ai-interaction-desc">{{ interaction.description }}</div>
    <div v-if="detail" class="ai-confirm-detail">{{ detail }}</div>
    <div class="ai-interaction-footer">
      <el-button
        type="primary"
        size="small"
        :disabled="submitted"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
      <el-button
        type="warning"
        size="small"
        :disabled="submitted"
        @click="handleReject"
      >
        驳回
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
  name: 'AiUserConfirm',

  props: {
    interaction: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      submitted: false
    }
  },

  computed: {
    confirmText () {
      return (this.interaction.params && this.interaction.params.confirm_text) || '确认'
    },
    detail () {
      return this.interaction.params && this.interaction.params.detail
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  methods: {
    handleConfirm () {
      this.submitted = true
      this.$emit('submit', 'confirm', { confirmed: true })
    },
    handleReject () {
      this.submitted = true
      this.$emit('submit', 'reject', { confirmed: false })
    },
    handleCancel () {
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-user-confirm {
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
.ai-confirm-detail {
  font-size: 12px;
  color: #606266;
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}
.ai-interaction-footer {
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
