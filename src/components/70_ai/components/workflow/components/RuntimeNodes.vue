<template>
  <div class="runtime-nodes">
    <!-- 错误信息 -->
    <div v-if="errorMsg" class="error-message">
      <i class="el-icon-warning" />
      <span>错误：{{ errorMsg }}</span>
    </div>

    <!-- 无内容提示 -->
    <div v-else-if="!nodes || nodes.length === 0" class="empty-nodes">
      <span>暂无节点执行记录</span>
    </div>

    <!-- 节点列表 -->
    <div v-else class="nodes-list">
      <div
        v-for="node in nodes"
        :key="node.node_runtime_uuid || node.runtimeNodeUuid || node.uuid"
        class="node-item"
      >
        <!-- 节点标题 -->
        <div class="node-header">
          <i
            v-if="node.wf_component || node.wfComponent"
            :class="getNodeIcon(node)"
            class="node-icon"
          />
          <span class="node-title">
            {{ node.node_title || node.nodeTitle || '未命名节点' }}
          </span>
          <el-tag
            :type="getNodeStatusType(node.status)"
            size="mini"
          >
            {{ getNodeStatusText(node.status) }}
          </el-tag>
        </div>

        <!-- 节点输入 -->
        <div class="node-section">
          <div class="section-title">输入</div>
          <div v-if="node.input && Object.keys(node.input).length" class="section-content">
            <div
              v-for="(content, name) in node.input"
              :key="`input_${name}`"
              class="io-item"
            >
              <span class="io-label">{{ name }}:</span>
              <span class="io-value">{{ formatIOValue(content) }}</span>
            </div>
          </div>
          <div v-else class="section-empty">
            <span>无输入</span>
          </div>
        </div>

        <!-- 节点输出 -->
        <div class="node-section">
          <div class="section-title">输出</div>
          <div v-if="node.output && Object.keys(node.output).length" class="section-content">
            <div
              v-for="(content, name) in node.output"
              :key="`output_${name}`"
              class="io-item"
            >
              <!-- 图片类型 (type === 4) -->
              <template v-if="content.type === 4 && Array.isArray(content.value)">
                <span class="io-label">{{ name }}:</span>
                <div class="image-list">
                  <el-image
                    v-for="(url, idx) in content.value"
                    :key="idx"
                    :src="url"
                    :preview-src-list="content.value"
                    class="image-item"
                  />
                </div>
              </template>

              <!-- 其他类型 -->
              <template v-else>
                <span class="io-label">{{ name }}:</span>
                <span class="io-value">{{ formatIOValue(content) }}</span>
              </template>
            </div>
          </div>
          <div v-else class="section-empty">
            <span>无输出</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * RuntimeNodes 组件
 * 用于显示工作流运行时节点的输入输出
 */
export default {
  name: 'RuntimeNodes',

  props: {
    // 运行时节点列表
    nodes: {
      type: Array,
      default: () => []
    },

    // 工作流信息（用于获取节点组件定义）
    workflow: {
      type: Object,
      default: () => ({})
    },

    // 错误信息
    errorMsg: {
      type: String,
      default: ''
    }
  },

  methods: {
    /**
     * 获取节点图标类名
     */
    getNodeIcon (node) {
      const component = node.wf_component || node.wfComponent
      if (!component) return 'el-icon-s-operation'

      const iconMap = {
        'Start': 'el-icon-video-play',
        'LLM': 'el-icon-chat-dot-round',
        'Branch': 'el-icon-share',
        'Answer': 'el-icon-s-comment',
        'DocumentExtractor': 'el-icon-document',
        'KnowledgeBase': 'el-icon-files',
        'VariableAggregator': 'el-icon-s-grid',
        'HttpRequest': 'el-icon-connection',
        'Email': 'el-icon-message'
      }

      return iconMap[component.name] || 'el-icon-s-operation'
    },

    /**
     * 获取节点状态类型（用于 el-tag）
     */
    getNodeStatusType (status) {
      const statusMap = {
        1: 'info', // 等待中
        2: 'warning', // 运行中
        3: 'success', // 成功
        4: 'danger' // 失败
      }
      return statusMap[status] || 'info'
    },

    /**
     * 获取节点状态文本
     */
    getNodeStatusText (status) {
      const statusMap = {
        1: '等待中',
        2: '运行中',
        3: '成功',
        4: '失败'
      }
      return statusMap[status] || '未知'
    },

    /**
     * 格式化输入输出值
     */
    formatIOValue (content) {
      if (!content) return '无内容'

      // 如果 content 直接是字符串（某些情况下）
      if (typeof content === 'string') {
        return content
      }

      // 标准格式：{value: xxx, type: 1, title: xxx}
      if (content.value === null || content.value === undefined) {
        return '无内容'
      }

      // 如果是对象或数组，转为 JSON 字符串
      if (typeof content.value === 'object') {
        try {
          return JSON.stringify(content.value, null, 2)
        } catch (e) {
          return String(content.value)
        }
      }

      return String(content.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.runtime-nodes {
  padding: 8px 0;
}

.error-message {
  padding: 12px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 18px;
  }
}

.empty-nodes {
  padding: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background-color: #fff;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;

  .node-icon {
    font-size: 16px;
    color: #409eff;
  }

  .node-title {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
}

.node-section {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 8px;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-empty {
  padding: 8px 0;
  color: #909399;
  font-size: 13px;
}

.io-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;

  .io-label {
    min-width: 100px;
    color: #606266;
    font-weight: 500;
    flex-shrink: 0;
  }

  .io-value {
    flex: 1;
    color: #303133;
    word-break: break-word;
    white-space: pre-wrap;
  }
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;

  .image-item {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>
