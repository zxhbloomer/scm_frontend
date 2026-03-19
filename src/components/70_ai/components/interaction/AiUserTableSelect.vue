<template>
  <el-dialog
    :visible.sync="localVisible"
    title="请选择"
    width="700px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div class="ai-interaction-desc">{{ interaction.description }}</div>

    <el-table
      :data="tableData"
      :highlight-current-row="true"
      size="small"
      border
      style="width: 100%"
      @current-change="handleRowSelect"
    >
      <template v-if="columns.length === 0">
        <el-table-column prop="label" label="名称" />
      </template>
      <template v-else>
        <el-table-column
          v-for="col in columns"
          :key="col.key"
          :prop="col.key"
          :label="col.label"
          :width="col.width || ''"
        />
      </template>
    </el-table>

    <div v-if="tableData.length === 0" class="ai-table-empty">暂无数据</div>

    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="small"
        :disabled="!selectedRow || submitted"
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
  name: 'AiUserTableSelect',

  props: {
    visible: { type: Boolean, default: false },
    interaction: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      localVisible: false,
      selectedRow: null,
      submitted: false
    }
  },

  computed: {
    columns () {
      return (this.interaction.params && this.interaction.params.columns) || []
    },
    options () {
      return (this.interaction.params && this.interaction.params.options) || []
    },
    tableData () {
      return this.options.map(opt => ({
        _key: opt.key,
        _label: opt.label,
        ...(opt.data || {}),
        label: opt.label
      }))
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
        this.selectedRow = null
      }
    }
  },

  methods: {
    handleRowSelect (row) {
      this.selectedRow = row
    },
    handleSubmit () {
      if (!this.selectedRow || this.submitted) return
      this.submitted = true
      const submitData = {
        ...this.selectedRow,
        key: this.selectedRow._key,
        label: this.selectedRow._label
      }
      delete submitData._key
      delete submitData._label
      this.$emit('submit', 'select_record', submitData)
    },
    handleCancel () {
      if (this.submitted) return
      this.submitted = true
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
.ai-table-empty {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 16px 0;
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
