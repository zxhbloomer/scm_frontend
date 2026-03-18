<template>
  <div class="ai-user-table-select">
    <div class="ai-interaction-desc">{{ interaction.description }}</div>

    <el-table
      :data="tableData"
      :highlight-current-row="true"
      size="small"
      border
      style="width: 100%"
      @current-change="handleRowSelect"
    >
      <!-- 无列定义时降级：只显示label列 -->
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

    <div class="ai-interaction-footer">
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
    </div>
  </div>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserTableSelect',

  props: {
    interaction: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
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
    // 把 options 展开为表格行数据：{ key, label, ...data }
    tableData () {
      return this.options.map(opt => ({
        _key: opt.key,
        _label: opt.label,
        ...(opt.data || {}),
        // 无列定义时降级用
        label: opt.label
      }))
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  methods: {
    handleRowSelect (row) {
      this.selectedRow = row
    },
    handleSubmit () {
      if (!this.selectedRow) return
      this.submitted = true
      const submitData = {
        ...this.selectedRow,
        key: this.selectedRow._key,
        label: this.selectedRow._label
      }
      // 清理内部字段
      delete submitData._key
      delete submitData._label
      this.$emit('submit', 'select_record', submitData)
    },
    handleCancel () {
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-user-table-select {
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
.ai-table-empty {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 16px 0;
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
