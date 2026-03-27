<template>
  <el-dialog
    :visible.sync="localVisible"
    title="请选择"
    width="480px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
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
    <span slot="footer" class="dialog-footer">
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
    </span>
  </el-dialog>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserSelect',

  props: {
    visible: { type: Boolean, default: false },
    interaction: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      localVisible: false,
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

  watch: {
    visible (val) {
      this.localVisible = val
      if (val) {
        this.submitted = false
        this.selectedKey = ''
      }
    }
  },

  methods: {
    handleSubmit () {
      if (!this.selectedKey || this.submitted) return
      this.submitted = true
      const selected = this.options.find(o => o.key === this.selectedKey)
      const submitData = {
        ...(selected && selected.data ? selected.data : {}),
        key: this.selectedKey,
        label: selected ? selected.label : this.selectedKey
      }
      this.localVisible = false
      this.$emit('submit', 'select_record', submitData)
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
