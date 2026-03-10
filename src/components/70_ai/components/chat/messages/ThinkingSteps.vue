<template>
  <div v-if="steps && steps.length" class="thinking-steps">
    <!-- 折叠头部条 -->
    <div class="thinking-header" @click="collapsed = !collapsed">
      <!-- 左侧思考图标 -->
      <div class="header-icon">
        <svg viewBox="0 0 16 16" class="thinking-icon" :class="isCompleted ? 'done' : 'running'">
          <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="currentColor" />
        </svg>
      </div>
      <!-- 文本 -->
      <span class="header-label">深度思考</span>
      <span class="header-desc">{{ headerDesc }}</span>
      <!-- 折叠箭头 -->
      <svg class="header-arrow" :class="{ collapsed }" viewBox="0 0 12 12">
        <path d="M3 5L6 8L9 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <!-- 可折叠的步骤列表 -->
    <div v-show="!collapsed" class="thinking-body">
      <div
        v-for="(step, index) in steps"
        :key="step.nodeUuid"
        class="step-row"
        :class="{ 'step-row--agent-call': step.nodeUuid === '__agent_call__' }"
      >
        <!-- 左侧：圆点 + 连接线 -->
        <div class="step-timeline">
          <div class="step-circle" :class="step.status">
            <template v-if="step.status === 'running'">
              <div class="circle-pulse" />
            </template>
            <template v-else>
              <svg viewBox="0 0 12 12" class="check-icon">
                <path d="M3.5 6L5.5 8L8.5 4" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </template>
          </div>
          <div v-if="index < steps.length - 1" class="step-line" />
        </div>

        <!-- 右侧：步骤内容 -->
        <div class="step-content" :class="{ 'step-content--last': index === steps.length - 1 }">
          <div class="step-header">
            <span class="step-title" :class="step.status">{{ getStepText(step) }}</span>
            <span v-if="step.duration != null" class="step-duration">{{ formatDuration(step.duration) }}</span>
          </div>
          <!-- Start节点参数：换行显示，格式：title = value -->
          <div v-if="step.nodeName === 'Start' && step.summary && step.summary.params && step.summary.params.length" class="step-output">
            <div class="step-output-text">
              <div v-for="p in step.summary.params" :key="p.name" class="step-output-param">
                <span class="param-title">{{ p.title }}</span>
                <span v-if="p.value" class="param-value"> = {{ p.value }}</span>
              </div>
            </div>
            <el-button
              type="text"
              size="mini"
              :icon="copiedUuid === step.nodeUuid ? 'el-icon-check' : 'el-icon-copy-document'"
              class="step-output-copy"
              :class="{ copied: copiedUuid === step.nodeUuid }"
              title="复制"
              @click.stop="copyStartParams(step)"
            />
          </div>
          <!-- outputText：show_process_output=true 时后端在 summary 中携带 -->
          <div v-if="step.summary && step.summary.outputText" class="step-output">
            <span class="step-output-text">{{ step.summary.outputText }}</span>
            <el-button
              type="text"
              size="mini"
              :icon="copiedUuid === step.nodeUuid ? 'el-icon-check' : 'el-icon-copy-document'"
              class="step-output-copy"
              :class="{ copied: copiedUuid === step.nodeUuid }"
              title="复制"
              @click.stop="copyOutput(step)"
            />
          </div>
          <!-- 子工作流折叠面板：summary.steps 存在时显示 -->
          <div v-if="step.summary && step.summary.steps && step.summary.steps.length" class="sub-steps-panel">
            <div class="sub-steps-toggle" @click.stop="toggleSubSteps(step.nodeUuid)">
              <span>查看详情</span>
              <svg class="sub-steps-arrow" :class="{ expanded: expandedSubSteps[step.nodeUuid] }" viewBox="0 0 12 12" width="10" height="10">
                <path d="M3 5L6 8L9 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div v-show="expandedSubSteps[step.nodeUuid]" class="sub-steps-body">
              <div v-for="subStep in step.summary.steps" :key="subStep.nodeUuid" class="sub-step-row">
                <div class="sub-step-circle" />
                <div class="sub-step-content">
                  <span class="sub-step-title">{{ getSubStepText(subStep) }}</span>
                  <span v-if="subStep.duration != null" class="step-duration">{{ formatDuration(subStep.duration) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部分割线 -->
    <div class="step-divider" />
  </div>
</template>

<script>
// Classifier/Answer/LLM 使用合并式文本（标题即全部内容）
// 其他节点使用 标题 + 摘要 分离式
const NODE_CONFIG = {
  KnowledgeRetrieval: { title: '知识库检索', runningText: '检索中...' },
  TempKnowledgeBase: { title: '临时知识库', runningText: '创建中...' },
  McpTool: { title: '调用工具', runningText: '执行中...' },
  DocumentExtractor: { title: '文档解析', runningText: '解析中...' },
  OpenPage: { title: '打开页面', runningText: '正在打开...' },
  Switcher: { title: '路由判断', runningText: '判断中...' },
  SubWorkflow: { title: '子工作流', runningText: '执行中...' },
  Template: { title: '合并结果', runningText: '处理中...' }
}

export default {
  name: 'ThinkingSteps',

  props: {
    steps: {
      type: Array,
      default: () => []
    },
    streamComplete: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      collapsed: this.streamComplete && this.steps && this.steps.length > 0 && this.steps.every(s => s.status === 'done'),
      expandedSubSteps: {},
      copiedUuid: null
    }
  },

  computed: {
    isAllDone () {
      return this.steps.length > 0 && this.steps.every(s => s.status === 'done')
    },

    // 真正完成的判定：
    // 1. SSE流已结束（streamComplete）→ 确定完成
    // 2. 流还在但最后一步是Answer/LLM且done → 工作流逻辑已完成（终端节点）
    // 注意：不能仅靠isAllDone，因为步骤间有SSE间隙会导致瞬间全done
    isCompleted () {
      if (!this.isAllDone) return false
      if (this.streamComplete) return true
      // 找最后一个非agent包裹行的步骤
      const realSteps = this.steps.filter(s => s.nodeUuid !== '__agent_call__')
      const lastStep = realSteps[realSteps.length - 1]
      return lastStep && (
        lastStep.nodeName === 'Answer' ||
        lastStep.nodeName === 'LLM' ||
        lastStep.nodeName === 'OpenPage' ||
        lastStep.nodeName === 'End'
      ) && lastStep.status === 'done'
    },

    totalDuration () {
      // 排除agent包裹行（其duration是内部步骤之和，避免重复计算）
      return this.steps
        .filter(s => s.nodeUuid !== '__agent_call__')
        .reduce((sum, s) => sum + (s.duration || 0), 0)
    },

    totalTokens () {
      return this.steps.reduce((sum, s) => sum + (s.summary && s.summary.totalTokens ? s.summary.totalTokens : 0), 0)
    },

    headerDesc () {
      if (this.isCompleted) {
        // 不计入agent包裹行
        const realStepCount = this.steps.filter(s => s.nodeUuid !== '__agent_call__').length
        let desc = `思考${this.formatDuration(this.totalDuration)} · ${realStepCount}个步骤`
        if (this.totalTokens > 0) {
          desc += ` · ${this.totalTokens} tokens`
        }
        return desc
      }
      // 执行中：看是否只有虚拟问题分析阶段
      const hasRealNode = this.steps.some(s => s.nodeUuid !== '__virtual_analysis__')
      return hasRealNode ? '正在思考...' : '正在分析问题...'
    }
  },

  watch: {
    isCompleted (val) {
      if (val) {
        this.collapsed = true
      }
    }
  },

  methods: {
    getStepText (step) {
      const name = step.nodeName

      // 虚拟问题分析步骤
      if (step.nodeUuid === '__virtual_analysis__') {
        return step.status === 'running' ? '问题分析中...' : '问题分析完成'
      }

      // Agent包裹行
      if (step.nodeUuid === '__agent_call__') {
        return step.status === 'running'
          ? `调用agent：${step.nodeTitle}...`
          : `调用agent：${step.nodeTitle} 完成`
      }

      // Start节点：标题行只显示节点标题，参数通过 summary.params 在 step-output 区域换行显示
      if (name === 'Start') {
        if (step.status === 'running') return `${step.nodeTitle || '开始'}...`
        return step.nodeTitle || '开始'
      }

      // End节点：直接用后端传来的nodeTitle
      if (name === 'End') {
        return step.nodeTitle || '结束'
      }

      // Classifier → 用节点标题显示
      if (name === 'Classifier') {
        const title = step.nodeTitle || '分析'
        return step.status === 'running' ? `${title}中...` : `${title}完成`
      }

      // Answer/LLM → 生成答案（合并式）
      if (name === 'Answer' || name === 'LLM') {
        return step.status === 'running' ? '正在生成答案...' : '答案生成完成'
      }

      // 其他节点 → 标题 + 摘要（分离式）
      // 优先使用后端传来的节点标题，NODE_CONFIG仅作fallback
      const cfg = NODE_CONFIG[name]
      const title = step.nodeTitle || (cfg ? cfg.title : name) || '执行'

      if (step.status === 'running') {
        const runText = cfg ? cfg.runningText : '执行中...'
        return `${title}  ${runText}`
      }

      const summary = this.getSummaryText(step)
      return summary ? `${title}  ${summary}` : `${title}  完成`
    },

    getSummaryText (step) {
      const s = step.summary
      if (!s) return null
      switch (step.nodeName) {
        case 'KnowledgeRetrieval':
          return s.matchCount != null ? `命中${s.matchCount}条` : null
        case 'McpTool':
          return s.toolName ? `→ ${s.toolName}` : null
        case 'SubWorkflow':
          return s.workflowName ? `→ ${s.workflowName}` : null
        default:
          return null
      }
    },

    toggleSubSteps (nodeUuid) {
      this.$set(this.expandedSubSteps, nodeUuid, !this.expandedSubSteps[nodeUuid])
    },

    getSubStepText (subStep) {
      const name = subStep.nodeName
      const cfg = NODE_CONFIG[name]
      // 优先用后端传来的 nodeTitle，NODE_CONFIG 仅作 fallback
      const title = subStep.nodeTitle || (cfg ? cfg.title : name) || '执行'
      const s = subStep.summary
      if (!s) return `${title}  完成`
      if (s.outputText) return `${title}  ${s.outputText}`
      if (name === 'Start' && s.params && s.params.length) {
        const paramText = s.params.map(p => p.value ? `${p.title} = ${p.value}` : p.title).join('，')
        return `${title}  ${paramText}`
      }
      if (name === 'KnowledgeRetrieval' && s.matchCount != null) return `${title}  命中${s.matchCount}条`
      if (name === 'McpTool' && s.toolName) return `${title}  → ${s.toolName}`
      return `${title}  完成`
    },

    copyOutput (step) {
      const text = step.summary && step.summary.outputText
      if (!text) return
      navigator.clipboard.writeText(text).then(() => {
        this.copiedUuid = step.nodeUuid
        setTimeout(() => { this.copiedUuid = null }, 1500)
      })
    },

    copyStartParams (step) {
      const params = step.summary && step.summary.params
      if (!params || !params.length) return
      const text = params.map(p => p.value ? `${p.title} = ${p.value}` : p.title).join('\n')
      navigator.clipboard.writeText(text).then(() => {
        this.copiedUuid = step.nodeUuid
        setTimeout(() => { this.copiedUuid = null }, 1500)
      })
    },

    formatDuration (ms) {
      if (ms >= 1000) {
        return (ms / 1000).toFixed(1) + 's'
      }
      return ms + 'ms'
    }
  }
}
</script>

<style scoped>
/* ===== 卡片容器 ===== */
.thinking-steps {
  background: #f7f8fa;
  border: 1px solid #e8e8ec;
  border-radius: 10px;
  padding: 4px 6px;
  margin-bottom: 8px;
}

/* ===== 折叠头部条 ===== */
.thinking-header {
  display: flex;
  align-items: center;
  padding: 8px 6px;
  cursor: pointer;
  border-radius: 8px;
  user-select: none;
}

.thinking-header:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 头部思考图标 */
.header-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thinking-icon {
  width: 16px;
  height: 16px;
}

.thinking-icon.done {
  color: #1a9c72;
}

.thinking-icon.running {
  color: #1890ff;
  animation: sparkle-rotate 2s linear infinite;
}

@keyframes sparkle-rotate {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(0.9); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(0.9); }
  100% { transform: rotate(360deg) scale(1); }
}

/* 头部文本 */
.header-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin-left: 8px;
}

.header-desc {
  font-size: 12px;
  color: #8a8f8d;
  margin-left: 8px;
  flex: 1;
}

/* 折叠箭头 */
.header-arrow {
  width: 12px;
  height: 12px;
  color: #bfbfbf;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.header-arrow.collapsed {
  transform: rotate(-90deg);
}

/* ===== 步骤列表 ===== */
.thinking-body {
  padding: 2px 6px 6px 8px;
}

/* 步骤行 */
.step-row {
  display: flex;
  align-items: stretch;
  min-height: 30px;
}

/* agent包裹行：加粗标题，视觉上作为分组标题 */
.step-row--agent-call .step-title {
  font-weight: 600;
  color: #1f2329;
}

.step-row--agent-call .step-title.running {
  color: #1890ff;
}

/* 左侧时间轴 */
.step-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

/* 状态圆点 */
.step-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  box-sizing: border-box;
}

.step-circle.done {
  background-color: #1a9c72;
}

.step-circle.running {
  border: 2px solid #1890ff;
  background: transparent;
}

/* 闪烁内圆 */
.circle-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #1890ff;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.6); }
}

/* 打勾图标 */
.check-icon {
  width: 12px;
  height: 12px;
}

/* 连接线 */
.step-line {
  width: 1.5px;
  flex-grow: 1;
  min-height: 8px;
  background-color: #dfe0e4;
}

/* 右侧内容 */
.step-content {
  flex: 1;
  padding-left: 10px;
  padding-bottom: 10px;
}

.step-content--last {
  padding-bottom: 2px;
}

.step-header {
  display: flex;
  align-items: center;
  line-height: 20px;
}

/* 步骤标题 */
.step-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2329;
}

.step-title.running {
  color: #1890ff;
}

/* 耗时 */
.step-duration {
  margin-left: auto;
  font-size: 12px;
  color: #bfbfbf;
  flex-shrink: 0;
  padding-left: 12px;
}

/* 底部分割线（卡片模式下隐藏） */
.step-divider {
  display: none;
}

/* 输出文本（show_process_output=true 时显示） */
.step-output {
  font-size: 12px;
  color: #4a4f5a;
  margin-top: 4px;
  padding: 4px 8px 4px 8px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  line-height: 1.6;
  word-break: break-all;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.step-output-text {
  flex: 1;
}

.step-output-copy {
  flex-shrink: 0;
  align-self: flex-end;
  padding: 2px 4px;
  font-size: 12px;
  color: #c0c4cc;
  min-height: auto;
  height: auto;
  border-radius: 4px;
}

.step-output-copy:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.step-output-copy.copied {
  color: #1a9c72;
}

/* Start节点参数行 */
.step-output-param {
  line-height: 1.8;
}

.param-title {
  color: #4a4f5a;
}

.param-value {
  color: #4a4f5a;
  font-weight: 400;
}

/* 子工作流折叠面板 */
.sub-steps-panel {
  margin-top: 4px;
}

.sub-steps-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
  user-select: none;
}

.sub-steps-toggle:hover {
  opacity: 0.8;
}

.sub-steps-arrow {
  transition: transform 0.2s ease;
  color: #1890ff;
}

.sub-steps-arrow.expanded {
  transform: rotate(180deg);
}

.sub-steps-body {
  margin-top: 6px;
  padding-left: 8px;
  border-left: 2px solid #e8e8ec;
}

.sub-step-row {
  display: flex;
  align-items: center;
  min-height: 24px;
  gap: 8px;
  padding: 2px 0;
}

.sub-step-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #1a9c72;
}

.sub-step-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.sub-step-title {
  font-size: 12px;
  color: #606266;
}
</style>
