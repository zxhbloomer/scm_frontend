<template>
  <el-dialog
    :visible.sync="localVisible"
    title="请确认"
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div class="ai-interaction-desc">{{ interaction.description }}</div>
    <div v-if="detail" class="ai-confirm-detail">{{ detail }}</div>
    <span slot="footer" class="dialog-footer">
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
    </span>
  </el-dialog>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserConfirm',

  props: {
    visible: { type: Boolean, default: false },
    interaction: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      localVisible: false,
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

  watch: {
    visible (val) {
      this.localVisible = val
      if (val) {
        this.submitted = false
      }
    }
  },

  methods: {
    handleConfirm () {
      if (this.submitted) return
      this.submitted = true
      this.localVisible = false
      this.$emit('submit', 'confirm', { confirmed: true })
    },
    handleReject () {
      if (this.submitted) return
      this.submitted = true
      this.localVisible = false
      this.$emit('submit', 'reject', { confirmed: false })
    },
    handleCancel () {
      if (this.submitted) return
      this.submitted = true
      this.localVisible = false
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
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
.dialog-footer {
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
