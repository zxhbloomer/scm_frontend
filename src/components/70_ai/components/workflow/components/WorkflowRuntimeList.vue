<template>
  <div class="workflow-runtime-list">
    <!-- 内容区域：运行历史列表 -->
    <div ref="scrollContainer" class="runtime-scroll-container" @scroll="handleScroll">
      <div v-if="!runtimeList.length" class="empty-state">
        <i class="el-icon-finished" />
        <p>暂无运行记录</p>
        <p class="hint">点击下方"运行"按钮开始执行工作流</p>
      </div>

      <div v-else class="runtime-list">
        <div v-for="runtime in runtimeList" :key="runtime.runtime_uuid || runtime.uuid" class="runtime-item">
          <!-- 用户输入消息 -->
          <div class="message-wrapper user-message">
            <div class="message-header">
              <div class="message-info">
                <i class="el-icon-user" />
                <span class="message-label">用户输入</span>
                <span class="message-time">{{ formatTime(runtime.cTime || runtime.c_time) }}</span>
              </div>
              <el-button
                type="text"
                size="small"
                icon="el-icon-delete"
                class="delete-btn"
                @click="handleDelete(runtime.runtime_uuid || runtime.uuid)"
              >
                删除
              </el-button>
            </div>
            <div class="message-content">
              <div v-if="runtime.input && Object.keys(runtime.input).length" class="input-content">
                <div v-for="(value, key) in runtime.input" :key="key" class="input-item">
                  <span class="input-label">{{ key }}:</span>
                  <span class="input-value">{{ formatValue(value) }}</span>
                </div>
              </div>
              <div v-else class="no-input">
                <span>无输入</span>
              </div>
            </div>
          </div>

          <!-- AI 输出消息 -->
          <div class="message-wrapper ai-message">
            <div class="message-header">
              <div class="message-info">
                <i class="el-icon-s-operation" />
                <span class="message-label">工作流输出</span>
                <el-tag :type="getStatusType(runtime.status)" size="mini">
                  {{ getStatusText(runtime.status) }}
                </el-tag>
              </div>
              <el-button
                v-if="!runtime.loading && runtime.status !== 1"
                type="text"
                size="small"
                @click="showExecutionDetail(runtime)"
              >
                执行详情
              </el-button>
            </div>
            <div class="message-content">
              <!-- 运行中状态 -->
              <div v-if="runtime.loading || runtime.status === 1" class="loading-content">
                <i class="el-icon-loading" />
                <span>工作流执行中...</span>
              </div>

              <!-- 成功状态 -->
              <div v-else-if="runtime.status === 2 && runtime.output" class="output-content">
                <div v-if="typeof runtime.output === 'string'" class="output-text">
                  {{ runtime.output }}
                </div>
                <div v-else-if="typeof runtime.output === 'object'" class="output-object">
                  <div v-for="(value, key) in runtime.output" :key="key" class="output-item">
                    <span class="output-label">{{ key }}:</span>
                    <span class="output-value">{{ formatValue(value) }}</span>
                  </div>
                </div>
              </div>

              <!-- 失败状态 -->
              <div v-else-if="runtime.status === 4" class="error-content">
                <i class="el-icon-warning" />
                <span>{{ runtime.status_remark || runtime.statusRemark || '工作流执行失败' }}</span>
              </div>

              <!-- 其他状态 -->
              <div v-else class="no-output">
                <span>无输出</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多提示 -->
      <div v-if="loading" class="loading-more">
        <i class="el-icon-loading" />
        <span>加载中...</span>
      </div>
      <div v-if="loadedAll && runtimeList.length" class="loaded-all">
        <span>已加载全部记录</span>
      </div>
    </div>

    <!-- 底部：运行工作流区域 -->
    <div class="runtime-footer">
      <div class="run-section">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="3"
          placeholder="请输入内容（可选）"
          :disabled="running"
        />
        <div class="run-actions">
          <el-button
            type="primary"
            icon="el-icon-video-play"
            :loading="running"
            :disabled="!canRun"
            @click="handleRun"
          >
            {{ running ? '运行中...' : '运行' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 执行详情对话框 -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      title="执行详情"
      width="800px"
      :close-on-click-modal="false"
      :show-close="true"
      destroy-on-close
    >
      <div v-if="currentRuntimeDetail" class="execution-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="执行状态">
              <el-tag :type="getStatusType(currentRuntimeDetail.status)" size="mini">
                {{ getStatusText(currentRuntimeDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行时间">
              {{ formatTime(currentRuntimeDetail.cTime || currentRuntimeDetail.c_time) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRuntimeDetail.elapsedMs || currentRuntimeDetail.elapsed_ms" label="耗时">
              {{ currentRuntimeDetail.elapsedMs || currentRuntimeDetail.elapsed_ms }}ms
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 节点执行详情 -->
        <div v-if="currentRuntimeDetail.nodes && currentRuntimeDetail.nodes.length" class="detail-section">
          <h4>节点执行详情</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(node, index) in currentRuntimeDetail.nodes"
              :key="index"
              :type="getNodeStatusType(node.status)"
              :icon="getNodeStatusIcon(node.status)"
            >
              <div class="node-detail">
                <div class="node-header">
                  <span class="node-name">{{ node.name || node.componentName || node.component_name }}</span>
                  <el-tag :type="getStatusType(node.status)" size="mini">
                    {{ getStatusText(node.status) }}
                  </el-tag>
                </div>
                <div v-if="node.output" class="node-output">
                  <div class="output-label">输出:</div>
                  <div class="output-value">{{ formatValue(node.output) }}</div>
                </div>
                <div v-if="node.errorMsg || node.error_msg" class="node-error">
                  <i class="el-icon-warning" />
                  <span>{{ node.errorMsg || node.error_msg }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 错误信息 -->
        <div v-if="currentRuntimeDetail.status === 4" class="detail-section">
          <h4>错误信息</h4>
          <el-alert
            :title="currentRuntimeDetail.status_remark || currentRuntimeDetail.statusRemark || '工作流执行失败'"
            type="error"
            :closable="false"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import { workflowRun, workflowRuntimeSearch, workflowRuntimeDelete } from '@/components/70_ai/api/workflowService'

export default {
  name: 'WorkflowRuntimeList',

  props: {
    workflow: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      userInput: '',
      running: false,
      loading: false,
      loadedAll: false,
      currentPage: 1,
      pageSize: 20,
      detailDialogVisible: false,
      currentRuntimeDetail: null
    }
  },

  computed: {
    ...mapState({
      activeUuid: state => state.ai.workflow.activeUuid
    }),

    ...mapGetters({
      getRuntimes: 'ai/workflowRuntime/getRuntimes'
    }),

    runtimeList () {
      if (!this.workflow.uuid) return []
      return this.getRuntimes(this.workflow.uuid) || []
    },

    canRun () {
      // 判断工作流是否可以运行
      if (!this.workflow.uuid || !this.workflow.nodes || this.workflow.nodes.length < 2) {
        return false
      }

      const hasStart = this.workflow.nodes.some(n => n.wfComponent && n.wfComponent.name === 'Start')
      const hasEnd = this.workflow.nodes.some(n => n.wfComponent && n.wfComponent.name === 'End')

      return hasStart && hasEnd
    }
  },

  watch: {
    'workflow.id': {
      immediate: true,
      handler (newId) {
        if (newId) {
          this.loadRuntimeList()
        }
      }
    }
  },

  methods: {
    ...mapMutations({
      setRuntimes: 'ai/workflowRuntime/SET_RUNTIMES',
      unshiftRuntimes: 'ai/workflowRuntime/UNSHIFT_RUNTIMES',
      deleteRuntimeMutation: 'ai/workflowRuntime/DELETE_RUNTIME',
      updateRuntimeSuccess: 'ai/workflowRuntime/UPDATE_RUNTIME_SUCCESS',
      updateRuntimeError: 'ai/workflowRuntime/UPDATE_RUNTIME_ERROR',
      updateRuntimeRunning: 'ai/workflowRuntime/UPDATE_RUNTIME_RUNNING'
    }),

    async loadRuntimeList (loadMore = false) {
      if (this.loading || !this.workflow.id) return

      if (!loadMore) {
        this.currentPage = 1
        this.loadedAll = false
      }

      this.loading = true
      try {
        const response = await workflowRuntimeSearch({
          workflowId: this.workflow.id, // 使用数字型 ID
          currentPage: this.currentPage,
          pageSize: this.pageSize
        })

        const records = response.data.records || []

        if (loadMore) {
          // 加载更多：追加到列表前面（因为是倒序）
          const existingList = this.getRuntimes(this.workflow.uuid) || []
          this.setRuntimes({
            wfUuid: this.workflow.uuid,
            runtimes: [...records, ...existingList]
          })
        } else {
          // 首次加载：直接设置
          this.setRuntimes({
            wfUuid: this.workflow.uuid,
            runtimes: records
          })
        }

        if (records.length < this.pageSize) {
          this.loadedAll = true
        } else {
          this.currentPage++
        }
      } catch (error) {
        console.error('加载运行历史失败:', error)
        this.$message.error(error.message || '加载运行历史失败')
      } finally {
        this.loading = false
      }
    },

    handleScroll (event) {
      const { scrollTop, scrollHeight } = event.target

      // 滚动到顶部时加载更多
      if (scrollTop < 50 && !this.loading && !this.loadedAll) {
        const prevScrollHeight = scrollHeight
        this.loadRuntimeList(true).then(() => {
          this.$nextTick(() => {
            // 保持滚动位置
            event.target.scrollTop = event.target.scrollHeight - prevScrollHeight
          })
        })
      }
    },

    async handleRun () {
      if (this.running || !this.canRun) return

      this.running = true
      try {
        const input = this.userInput.trim() ? { user_input: this.userInput } : {}

        const response = await workflowRun({
          wfUuid: this.workflow.uuid,
          input
        })

        // 添加新的运行记录到列表头部
        // 转换后端返回的 camelCase 字段为 snake_case (Vuex 模块期望的格式)
        const runtime = {
          ...response.data,
          runtime_uuid: response.data.uuid || response.data.runtime_uuid,
          wf_uuid: this.workflow.uuid,
          status_remark: response.data.statusRemark || response.data.status_remark,
          loading: true,
          status: 1 // 运行中
        }

        this.unshiftRuntimes({
          wfUuid: this.workflow.uuid,
          runtimes: [runtime]
        })

        this.userInput = ''
        this.$message.success('工作流已开始执行')

        // 滚动到底部
        this.$nextTick(() => {
          const container = this.$refs.scrollContainer
          if (container) {
            container.scrollTop = container.scrollHeight
          }
        })

        // TODO: 实现 SSE 监听执行状态
        // 模拟执行完成
        setTimeout(() => {
          this.updateRuntimeSuccess({
            wfUuid: this.workflow.uuid,
            runtimeUuid: runtime.runtime_uuid,
            outputJson: JSON.stringify({ result: '执行完成（模拟）' })
          })
        }, 3000)
      } catch (error) {
        console.error('运行工作流失败:', error)
        this.$message.error(error.message || '运行工作流失败')
      } finally {
        this.running = false
      }
    },

    handleDelete (runtimeUuid) {
      this.$confirm('确定要删除这条运行记录吗？输入与输出会一起删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await workflowRuntimeDelete(runtimeUuid)
          this.deleteRuntimeMutation({
            wfUuid: this.workflow.uuid,
            runtimeUuid
          })
          this.$message.success('删除成功')
        } catch (error) {
          console.error('删除运行记录失败:', error)
          this.$message.error(error.message || '删除失败')
        }
      }).catch(() => {
        // 取消删除
      })
    },

    showExecutionDetail (runtime) {
      this.currentRuntimeDetail = runtime
      this.detailDialogVisible = true
      // TODO: 如果没有节点详情，从后端加载
    },

    formatTime (time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleString('zh-CN')
      }
    },

    formatValue (value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    },

    getStatusType (status) {
      const typeMap = {
        1: 'info', // 运行中
        2: 'success', // 成功
        3: 'warning', // 部分成功
        4: 'danger' // 失败
      }
      return typeMap[status] || 'info'
    },

    getStatusText (status) {
      const textMap = {
        1: '运行中',
        2: '成功',
        3: '部分成功',
        4: '失败'
      }
      return textMap[status] || '未知'
    },

    getNodeStatusType (status) {
      const typeMap = {
        1: 'primary',
        2: 'success',
        3: 'warning',
        4: 'danger'
      }
      return typeMap[status] || 'info'
    },

    getNodeStatusIcon (status) {
      const iconMap = {
        1: 'el-icon-loading',
        2: 'el-icon-check',
        3: 'el-icon-warning',
        4: 'el-icon-close'
      }
      return iconMap[status] || 'el-icon-info'
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-runtime-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.runtime-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;

  i {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  p {
    font-size: 16px;
    margin: 8px 0;
  }

  .hint {
    font-size: 14px;
    color: #c0c4cc;
  }
}

.runtime-list {
  max-width: 900px;
  margin: 0 auto;
}

.runtime-item {
  margin-bottom: 32px;
}

.message-wrapper {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &.user-message {
    border-left: 3px solid #409eff;
  }

  &.ai-message {
    border-left: 3px solid #67c23a;
  }
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 16px;
    color: #909399;
  }

  .message-label {
    font-weight: 500;
    color: #303133;
  }

  .message-time {
    font-size: 12px;
    color: #909399;
  }
}

.delete-btn {
  color: #f56c6c;

  &:hover {
    color: #f78989;
  }
}

.message-content {
  line-height: 1.6;
  color: #606266;
}

.input-content,
.output-object {
  .input-item,
  .output-item {
    margin-bottom: 8px;

    .input-label,
    .output-label {
      font-weight: 500;
      margin-right: 8px;
      color: #606266;
    }

    .input-value,
    .output-value {
      color: #303133;
      word-break: break-all;
    }
  }
}

.no-input,
.no-output {
  color: #c0c4cc;
  font-style: italic;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;

  i {
    font-size: 16px;
  }
}

.output-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;

  i {
    font-size: 16px;
  }
}

.loading-more,
.loaded-all {
  text-align: center;
  padding: 16px;
  color: #909399;
  font-size: 14px;
}

.loading-more i {
  margin-right: 8px;
}

.runtime-footer {
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
  padding: 16px;
}

.run-section {
  max-width: 900px;
  margin: 0 auto;
}

.run-actions {
  margin-top: 12px;
  text-align: right;
}

.execution-detail {
  .detail-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .node-detail {
    .node-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .node-name {
        font-weight: 500;
        color: #303133;
      }
    }

    .node-output {
      margin-top: 8px;
      padding: 8px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .output-label {
        font-weight: 500;
        color: #606266;
        margin-bottom: 4px;
      }

      .output-value {
        color: #303133;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }

    .node-error {
      margin-top: 8px;
      padding: 8px;
      background-color: #fef0f0;
      border-radius: 4px;
      color: #f56c6c;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 16px;
      }
    }
  }
}
</style>
