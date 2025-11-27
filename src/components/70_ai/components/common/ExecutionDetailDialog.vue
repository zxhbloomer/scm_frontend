<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="70%"
    top="5vh"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="execution-detail-container">
      <!-- 工作流基本信息 -->
      <div v-if="runtimeDetail" class="runtime-basic-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="消息ID">
            {{ messageId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="执行状态">
            <el-tag :type="getStatusType(runtimeDetail.status)">
              {{ getStatusText(runtimeDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="执行时间">
            {{ formatTimeRange(runtimeDetail.start_time, runtimeDetail.end_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="执行时长">
            {{ formatDuration(runtimeDetail.elapsed_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="总Token消耗">
            {{ formatTokens(runtimeDetail.totalTokens) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ runtimeDetail.c_name || runtimeDetail.c_id }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 节点执行详情列表 -->
      <div class="nodes-section">
        <h3 class="section-title">节点执行详情</h3>
        <el-timeline v-if="nodes && nodes.length > 0">
          <el-timeline-item
            v-for="(node, index) in nodes"
            :key="node.id || index"
            :type="getNodeTimelineType(node.status)"
            :icon="getNodeIcon(node.status)"
          >
            <div class="node-item">
              <div class="node-header">
                <span class="node-title">{{ node.nodeTitle || node.node_title || `节点 ${index + 1}` }}</span>
                <el-tag :type="getStatusType(node.status)" size="small">
                  {{ getStatusText(node.status) }}
                </el-tag>
              </div>

              <!-- 节点执行时间和Token消耗 -->
              <div v-if="node.c_time" class="node-time">
                <span>执行时间: {{ formatDateTime(node.c_time) }}</span>
                <span v-if="node.totalTokens != null" class="token-info">
                  消耗tokens: {{ formatTokens(node.totalTokens) }}
                </span>
              </div>

              <!-- 输入数据 -->
              <div v-if="node.inputData || node.input_data" class="node-data-section">
                <div class="data-label">输入数据:</div>
                <el-card shadow="never" class="data-card">
                  <pre class="json-content">{{ formatJSON(node.inputData || node.input_data) }}</pre>
                </el-card>
              </div>

              <!-- 输出数据 -->
              <div v-if="node.outputData || node.output_data" class="node-data-section">
                <div class="data-label">输出数据:</div>
                <el-card shadow="never" class="data-card">
                  <pre class="json-content">{{ formatJSON(node.outputData || node.output_data) }}</pre>
                </el-card>
              </div>

              <!-- 错误信息 -->
              <div v-if="node.status === 4 && (node.statusRemark || node.status_remark)" class="node-error">
                <el-alert
                  :title="node.statusRemark || node.status_remark"
                  type="error"
                  :closable="false"
                />
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>

        <el-empty v-else description="暂无节点执行数据" />
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'ExecutionDetailDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    runtimeDetail: {
      type: Object,
      default: null
    },
    nodes: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    messageId: {
      type: [Number, String],
      default: null
    }
  },
  computed: {
    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },
    dialogTitle () {
      if (this.runtimeDetail && this.runtimeDetail.workflow_name) {
        return `执行详情 - ${this.runtimeDetail.workflow_name}`
      }
      return '执行详情'
    }
  },
  watch: {
    runtimeDetail: {
      handler (newVal) {
        // 数据接收监听
      },
      immediate: true
    },
    nodes: {
      handler (newVal) {
        // 节点数据接收监听
      },
      immediate: true
    }
  },
  methods: {
    handleClose () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /**
     * 获取状态类型（用于Tag颜色）
     */
    getStatusType (status) {
      const typeMap = {
        1: 'info', // 等待中
        2: 'warning', // 运行中
        3: 'success', // 成功
        4: 'danger' // 失败
      }
      return typeMap[status] || 'info'
    },

    /**
     * 获取状态文本
     */
    getStatusText (status) {
      const textMap = {
        1: '等待中',
        2: '运行中',
        3: '成功',
        4: '失败'
      }
      return textMap[status] || '未知'
    },

    /**
     * 获取时间线节点类型
     */
    getNodeTimelineType (status) {
      const typeMap = {
        1: 'info',
        2: 'warning',
        3: 'success',
        4: 'danger'
      }
      return typeMap[status] || 'info'
    },

    /**
     * 获取节点图标
     */
    getNodeIcon (status) {
      const iconMap = {
        1: 'el-icon-time',
        2: 'el-icon-loading',
        3: 'el-icon-circle-check',
        4: 'el-icon-circle-close'
      }
      return iconMap[status] || 'el-icon-info'
    },

    /**
     * 格式化JSON
     */
    formatJSON (data) {
      if (!data) return ''
      try {
        if (typeof data === 'string') {
          return JSON.stringify(JSON.parse(data), null, 2)
        }
        return JSON.stringify(data, null, 2)
      } catch (e) {
        return String(data)
      }
    },

    /**
     * 格式化日期时间
     */
    formatDateTime (dateTime) {
      if (!dateTime) return '-'
      try {
        const date = new Date(dateTime)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (e) {
        return String(dateTime)
      }
    },

    /**
     * 格式化执行时长
     */
    formatDuration (milliseconds) {
      if (!milliseconds) return '-'
      const seconds = Math.floor(milliseconds / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) {
        return `${hours}小时${minutes % 60}分${seconds % 60}秒`
      } else if (minutes > 0) {
        return `${minutes}分${seconds % 60}秒`
      } else {
        return `${seconds}秒`
      }
    },

    /**
     * 格式化Token数量(带千分符)
     */
    formatTokens (tokens) {
      if (tokens == null) return '-'
      // 使用全局formatNumber方法(来自commonFunction.js)
      return this.formatNumber(tokens, false) || '-'
    },

    /**
     * 格式化时间范围(合并开始和结束时间)
     */
    formatTimeRange (startTime, endTime) {
      const start = this.formatDateTime(startTime)
      const end = this.formatDateTime(endTime)
      if (start === '-' && end === '-') return '-'
      if (start === '-') return `结束: ${end}`
      if (end === '-') return `开始: ${start}`
      return `${start} ~ ${end}`
    }
  }
}
</script>

<style scoped lang="scss">
.execution-detail-container {
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px 0;
}

.runtime-basic-info {
  margin-bottom: 24px;
}

.nodes-section {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #303133;
  }
}

.node-item {
  padding: 8px 0;

  .node-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .node-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
  }

  .node-time {
    font-size: 13px;
    color: #909399;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 16px;

    .token-info {
      color: #409EFF;
      font-weight: 500;
    }
  }

  .node-data-section {
    margin-bottom: 16px;

    .data-label {
      font-size: 13px;
      color: #606266;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .data-card {
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;

      .json-content {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        color: #303133;
        margin: 0;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 300px;
        overflow-y: auto;
      }
    }
  }

  .node-error {
    margin-top: 12px;
  }
}

/* Timeline自定义样式 */
::v-deep .el-timeline-item__node {
  font-size: 16px;
}

::v-deep .el-timeline-item__wrapper {
  padding-left: 20px;
}

/* Descriptions样式优化 */
::v-deep .el-descriptions__label {
  font-weight: 600;
  color: #606266;
}

::v-deep .el-descriptions__content {
  color: #303133;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .execution-detail-container {
    max-height: 60vh;
  }

  ::v-deep .el-descriptions {
    font-size: 12px;
  }

  .node-item {
    .node-header .node-title {
      font-size: 14px;
    }

    .node-data-section .data-card .json-content {
      font-size: 11px;
    }
  }
}
</style>
