<template>
  <div ref="messagesContainer" class="scm-message-list">
    <!-- 拖拽调整手柄 -->
    <div
      class="resize-handle"
      title="拖拽调整窗口宽度"
      @mousedown="startResize"
    >
      <div class="handle-dots">
        <span />
        <span />
        <span />
      </div>
    </div>

    <div ref="messagesWrapper" class="messages-wrapper">
      <!-- SCM欢迎区域 - 始终显示在最前面 -->
      <div class="scm-welcome-area">
        <!-- 欢迎消息 -->
        <div class="welcome-message">
          <div class="welcome-icon">
            <svg viewBox="0 0 24 24" class="sparkle-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <div class="welcome-content">
            <h3 class="welcome-title">
              你好{{ userInfo && userInfo.name ? '，' + userInfo.name : '' }}！👋
            </h3>
            <p class="welcome-subtitle">
              我是SCM智能助手，专注于SCM供应链管理。
              <br>有什么可以帮助您的吗？
            </p>
          </div>
        </div>

        <!-- 快捷问题区域 -->
        <div class="quick-questions-section">
          <div class="section-header">
            <div class="section-title">
              <i class="el-icon-magic-stick" />
              <span>猜你想问</span>
            </div>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-refresh"
              class="refresh-btn"
              @click="refreshQuestions"
            >
              换一批
            </el-button>
          </div>

          <div class="questions-grid">
            <transition-group name="question-card" tag="div" class="questions-container">
              <div
                v-for="(question, index) in displayQuestions"
                :key="question + index"
                class="question-card"
                :style="{ 'animation-delay': (index * 100) + 'ms' }"
                @click="selectQuestion(question)"
              >
                <div class="question-icon">
                  <i :class="getQuestionIcon(question)" />
                </div>
                <div class="question-text">{{ question }}</div>
                <div class="question-arrow">
                  <i class="el-icon-arrow-right" />
                </div>
              </div>
            </transition-group>
          </div>
        </div>

        <!-- 功能介绍 -->
        <div class="features-section">
          <div class="section-title">
            <i class="el-icon-trophy" />
            <span>我能为您做什么</span>
          </div>

          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">📋</div>
              <div class="feature-text">业务流程指导</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <div class="feature-text">数据查询分析</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔧</div>
              <div class="feature-text">系统操作帮助</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💡</div>
              <div class="feature-text">智能建议推荐</div>
            </div>
          </div>
        </div>

        <!-- 底部提示 -->
        <div class="bottom-tip">
          <i class="el-icon-info" />
          <span>支持语音输入和文字描述，我会尽力帮助您解决问题</span>
        </div>
      </div>

      <!-- 消息项 -->
      <transition-group name="message" tag="div" class="messages-container">
        <div
          v-for="(message, index) in visibleMessages"
          :key="`message-${index}`"
          class="message-item"
          :class="[`message-item--${message.type}`]"
        >
          <!-- 系统消息 -->
          <div v-if="message.type === 'system'" class="message-system">
            <div class="system-content">
              <i class="el-icon-info" />
              <md-renderer
                :source="message.content"
                :reasoning-content="message.reasoning"
                :send-message="sendMessage"
                :chat-record-id="message.id"
                :child-node="message.child_node"
                :runtime-node-id="message.runtime_node_id"
                :disabled="false"
                type="ai-chat"
              />
            </div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>

          <!-- 用户消息 -->
          <div v-else-if="message.type === 'user'" class="message-user">
            <div class="message-content">
              <div class="message-bubble message-bubble--user">
                <div class="bubble-content">{{ message.content }}</div>
              </div>
            </div>
            <div class="message-avatar">
              <el-avatar :size="32" :src="userInfo && userInfo.avatar ? userInfo.avatar : ''">
                <i class="el-icon-user" />
              </el-avatar>
            </div>
          </div>

          <!-- AI助手消息 -->
          <div v-else-if="message.type === 'ai'" class="message-ai">
            <div class="message-avatar">
              <el-avatar :size="32" :src="message.avatar" class="ai-avatar">
                <svg viewBox="0 0 24 24" class="ai-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </el-avatar>
            </div>

            <div class="message-content">
              <div class="message-bubble message-bubble--ai">
                <!-- 工作流执行步骤（仅对有步骤数据的AI消息显示） -->
                <thinking-steps
                  v-if="getNodeSteps(message.id)"
                  :steps="getNodeSteps(message.id)"
                  :stream-complete="isStreamComplete(message.id)"
                />
                <!-- 消息内容（思考中隐藏，完成后显示） -->
                <div v-show="!isThinking(message.id)" class="bubble-content">
                  <div v-if="message.isError" class="error-content">
                    <i class="el-icon-warning" />
                    <md-renderer
                      :source="message.content"
                      :reasoning-content="message.reasoning"
                      :send-message="sendMessage"
                      :chat-record-id="message.id"
                      :child-node="message.child_node"
                      :runtime-node-id="message.runtime_node_id"
                      :disabled="false"
                      type="ai-chat"
                    />
                  </div>
                  <div v-else class="ai-content">
                    <!-- 直接显示Markdown内容，移除打字机效果 -->
                    <md-renderer
                      :source="message.content"
                      :reasoning-content="message.reasoning"
                      :send-message="sendMessage"
                      :chat-record-id="message.id"
                      :child-node="message.child_node"
                      :runtime-node-id="message.runtime_node_id"
                      :disabled="false"
                      type="ai-chat"
                    />
                  </div>
                </div>

                <!-- 步骤化处理 -->
                <div v-if="message.steps && message.steps.length" class="ai-steps">
                  <div class="steps-title">操作步骤：</div>
                  <ol class="steps-list">
                    <li v-for="(step, stepIndex) in message.steps" :key="`step-${stepIndex}`" class="step-item">
                      {{ step }}
                    </li>
                  </ol>
                </div>

                <!-- 操作按钮 -->
                <div v-if="message.actions && message.actions.length" class="ai-actions">
                  <el-button
                    v-for="(action, actionIndex) in message.actions"
                    :key="`action-${actionIndex}`"
                    type="primary"
                    size="mini"
                    class="action-button"
                    @click="executeAction(action, message)"
                  >
                    {{ action.text }}
                  </el-button>
                </div>

                <!-- 打开页面按钮（OpenPage节点数据存在且未过期时显示） -->
                <div v-if="hasOpenPageData(message)" class="ai-open-page-action">
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-monitor"
                    class="open-page-button"
                    :disabled="isOpenPageExpired(message)"
                    @click="openPageFromMessage(message)"
                  >
                    {{ isOpenPageExpired(message) ? '页面已过期' : '打开页面' }}
                  </el-button>
                  <span v-if="isOpenPageExpired(message)" class="expired-tip">（超过24小时，数据可能已失效）</span>
                </div>

              </div>

              <div class="message-meta">
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                <!-- 消息操作栏 -->
                <div class="bubble-actions">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-copy-document"
                    class="bubble-action-btn"
                    title="复制"
                    @click="copyMessage(message)"
                  />
                  <el-button
                    v-if="message.type === 'ai' || message.type === 'assistant'"
                    type="text"
                    size="mini"
                    icon="el-icon-delete"
                    class="bubble-action-btn delete-btn"
                    title="删除消息"
                    @click="deleteWorkflowRuntime(message)"
                  />
                  <el-button
                    v-if="message.workflowRuntime && message.workflowRuntime.uuid"
                    type="text"
                    size="mini"
                    icon="el-icon-document"
                    class="bubble-action-btn"
                    title="执行详情"
                    @click="showExecutionDetail(message)"
                  />
                  <el-button
                    v-if="message.isError"
                    type="text"
                    size="mini"
                    icon="el-icon-refresh"
                    class="bubble-action-btn"
                    title="重试"
                    @click="retryMessage(message)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 人工客服消息 -->
          <div v-else-if="message.type === 'agent'" class="message-agent">
            <div class="message-avatar">
              <el-avatar :size="32" :src="message.avatar" class="agent-avatar">
                <i class="el-icon-service" />
              </el-avatar>
            </div>

            <div class="message-content">
              <div class="agent-info">
                <span class="agent-name">{{ message.sender && message.sender.name ? message.sender.name : 'SCM智能助手' }}</span>
                <span class="agent-role">{{ message.sender && message.sender.role ? message.sender.role : 'SCM业务专家' }}</span>
              </div>

              <div class="message-bubble message-bubble--agent">
                <div class="bubble-content">
                  <!-- 直接显示Markdown内容，移除打字机效果 -->
                  <md-renderer
                    :source="message.content"
                    :reasoning-content="message.reasoning"
                    :send-message="sendMessage"
                    :chat-record-id="message.id"
                    :child-node="message.child_node"
                    :runtime-node-id="message.runtime_node_id"
                    :disabled="false"
                    type="ai-chat"
                  />
                </div>
              </div>

              <div class="message-meta">
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                <div class="bubble-actions">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-copy-document"
                    class="bubble-action-btn"
                    title="复制"
                    @click="copyMessage(message)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- 人机交互组件（在消息列表末尾渲染） -->
      <div v-if="activeInteraction && activeInteraction.status === 'WAITING'" class="ai-interaction-area">
        <ai-user-select
          v-if="activeInteraction.type === 'user_select'"
          :interaction="activeInteraction"
          @submit="handleInteractionSubmit"
          @cancel="handleInteractionCancel"
        />
        <ai-user-confirm
          v-else-if="activeInteraction.type === 'user_confirm'"
          :interaction="activeInteraction"
          @submit="handleInteractionSubmit"
          @cancel="handleInteractionCancel"
        />
        <ai-user-form
          v-else-if="activeInteraction.type === 'user_form'"
          :interaction="activeInteraction"
          @submit="handleInteractionSubmit"
          @cancel="handleInteractionCancel"
        />
        <ai-user-table-select
          v-else-if="activeInteraction.type === 'user_table_select'"
          :interaction="activeInteraction"
          @submit="handleInteractionSubmit"
          @cancel="handleInteractionCancel"
        />
      </div>

      <!-- 正在输入指示器 -->
      <div v-if="isTyping" class="typing-indicator">
        <div class="message-avatar">
          <el-avatar :size="32" class="ai-avatar">
            <svg viewBox="0 0 24 24" class="ai-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </el-avatar>
        </div>

        <div class="typing-content">
          <div class="typing-bubble">
            <div class="typing-text">SCM正在思考</div>
            <div class="typing-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 滚动到底部按钮 -->
    <transition name="scroll-btn-fade">
      <div
        v-if="userScrolled"
        class="scroll-to-bottom-btn"
        title="滚动到底部"
        @click="scrollToBottomAndReset"
      >
        <i class="el-icon-arrow-down" />
      </div>
    </transition>

    <!-- 执行详情弹窗 -->
    <execution-detail-dialog
      :visible.sync="detailDialogVisible"
      :runtime-detail="currentRuntimeDetail"
      :nodes="currentNodes"
      :loading="detailLoading"
      :message-id="currentMessageId"
    />
  </div>
</template>

<script>
import { MdRenderer } from '../markdown'
import ExecutionDetailDialog from '../../common/ExecutionDetailDialog.vue'
import ThinkingSteps from './ThinkingSteps.vue'
import aiChatService from '../../../api/aiChatService'
import AiUserSelect from '../../interaction/AiUserSelect.vue'
import AiUserConfirm from '../../interaction/AiUserConfirm.vue'
import AiUserForm from '../../interaction/AiUserForm.vue'
import AiUserTableSelect from '../../interaction/AiUserTableSelect.vue'
import { submitFeedback, cancelInteraction } from '../../interaction/AiInteractionManager'

export default {
  name: 'MessageList',

  components: {
    MdRenderer,
    ExecutionDetailDialog,
    ThinkingSteps,
    AiUserSelect,
    AiUserConfirm,
    AiUserForm,
    AiUserTableSelect
  },

  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isTyping: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: () => ({
        id: null,
        name: '访客',
        avatar: ''
      })
    }
  },

  data () {
    return {
      quickQuestions: [
        '如何创建采购订单？',
        '库存不足怎么处理？',
        '如何设置供应商信息？',
        '出库流程是什么？',
        '如何查看库存报表？',
        '采购审批流程说明',
        '如何进行入库操作？',
        '供应商评价如何管理？',
        '库存预警如何设置？',
        '采购合同怎么录入？',
        '退货流程如何操作？',
        '物料主数据如何维护？',
        '成本核算怎么查看？',
        '质检流程是什么？',
        '仓库盘点如何进行？'
      ],
      displayQuestions: [],
      questionIcons: {
        '采购': 'el-icon-shopping-cart-2',
        '库存': 'el-icon-goods',
        '供应商': 'el-icon-user',
        '出库': 'el-icon-truck',
        '入库': 'el-icon-box',
        '报表': 'el-icon-data-analysis',
        '审批': 'el-icon-document-checked',
        '流程': 'el-icon-share'
      },
      // 执行详情相关
      detailDialogVisible: false,
      detailLoading: false,
      currentRuntimeDetail: null,
      currentNodes: [],
      currentMessageId: null, // 当前查看的消息ID(ai_conversation_content.id)
      userScrolled: false, // 用户是否已滚动离开底部（参考Dify开源模式）
      isAutoScrolling: false, // 程序化滚动中，防止scroll事件误判
      scrollToUserOnNextUpdate: false // 下次watcher触发时滚动到用户消息
    }
  },

  computed: {
    activeInteraction () {
      return this.$store.state.chat.activeInteraction
    },
    hasConversation () {
      return this.messages && this.messages.length > 0
    },
    workflowProcessNodes () {
      return this.$store.state.chat.workflowProcessNodes || {}
    },
    visibleMessages () {
      // 过滤掉隐藏的消息和实际内容为空的消息，避免显示空白区域
      return this.messages.filter(message => {
        // 有思考步骤（实时或持久化）的消息始终可见
        const activeSteps = this.workflowProcessNodes[message.id]
        if (activeSteps && activeSteps.steps && activeSteps.steps.length > 0) return true
        if (message.workflowSteps && message.workflowSteps.length > 0) return true

        if (message.isHidden) return false

        // 对AI和agent消息进行内容检查
        if (message.type === 'ai' || message.type === 'agent') {
          const content = (message.content || '').trim()
          // 确保有足够的实际内容才显示
          return content.length > 10 && content.replace(/\s+/g, ' ').length > 5
        }

        // 其他类型消息(用户、系统)正常显示
        return true
      })
    }
  },

  watch: {
    messages: {
      handler () {
        if (this.scrollToUserOnNextUpdate) {
          this.scrollToUserOnNextUpdate = false
          // 立即标记为已滚动离开底部，防止其他watcher抢先调scrollToBottom
          this.userScrolled = true
          this.doScrollToLastUserMessage()
          return
        }
        if (!this.userScrolled) {
          this.scrollToBottom()
        }
      },
      deep: true
    },

    visibleMessages: {
      handler () {
        if (!this.userScrolled) {
          this.scrollToBottom()
        }
      },
      deep: true
    },

    isTyping (newVal) {
      if (!this.userScrolled) {
        this.scrollToBottom()
      }
    }
  },

  mounted () {
    this.initializeQuestions()
    this.scrollToBottom()
    this.$nextTick(() => {
      const wrapper = this.$refs.messagesWrapper
      if (wrapper) {
        wrapper.addEventListener('scroll', this.handleScroll)
      }
    })
  },

  beforeDestroy () {
    const wrapper = this.$refs.messagesWrapper
    if (wrapper) {
      wrapper.removeEventListener('scroll', this.handleScroll)
    }
  },

  methods: {
    handleInteractionSubmit (action, data) {
      const feedbackMessage = submitFeedback(action, data, this.$store)
      if (feedbackMessage) {
        this.$store.dispatch('chat/sendMessage', feedbackMessage)
      }
    },
    handleInteractionCancel () {
      const feedbackMessage = cancelInteraction(this.$store)
      if (feedbackMessage) {
        this.$store.dispatch('chat/sendMessage', feedbackMessage)
      }
    },
    getNodeSteps (messageId) {
      // 优先读实时数据（执行中）
      const realtime = this.workflowProcessNodes[messageId]
      if (realtime && realtime.steps && realtime.steps.length > 0) {
        return realtime.steps
      }
      // 其次读持久化数据（完成后折叠回看）
      const message = this.visibleMessages.find(m => m.id === messageId)
      return (message && message.workflowSteps && message.workflowSteps.length > 0)
        ? message.workflowSteps
        : null
    },

    isThinking (messageId) {
      const steps = this.getNodeSteps(messageId)
      if (!steps || steps.length === 0) return false

      // Answer/LLM节点已出现 → 答案开始流式输出，显示内容
      if (steps.some(s => s.nodeName === 'Answer' || s.nodeName === 'LLM')) return false

      // 还没到Answer阶段 → 仅实时流模式下隐藏（排除历史消息）
      const realtime = this.workflowProcessNodes[messageId]
      return !!(realtime && realtime.steps && realtime.steps.length > 0)
    },

    isStreamComplete (messageId) {
      // 没有实时数据 = 流已完成（数据来自持久化的workflowSteps）
      const realtime = this.workflowProcessNodes[messageId]
      return !(realtime && realtime.steps && realtime.steps.length > 0)
    },

    initializeQuestions () {
      const shuffled = [...this.quickQuestions].sort(() => 0.5 - Math.random())
      this.displayQuestions = shuffled.slice(0, 6)
    },

    refreshQuestions () {
      this.initializeQuestions()
      this.$message.success('已为您更新推荐问题')
    },

    selectQuestion (question) {
      this.$emit('quick-question', question)
    },

    getQuestionIcon (question) {
      for (const [keyword, icon] of Object.entries(this.questionIcons)) {
        if (question.includes(keyword)) {
          return icon
        }
      }
      return 'el-icon-chat-dot-round'
    },

    // sendMessage方法，按照MaxKB的chatMessage实现
    sendMessage (question, type = 'new', other_params_data) {
      if (type === 'old') {
        // 处理表单提交等旧消息
        this.$emit('send-message', question, other_params_data)
      } else {
        // 处理快速问题等新消息
        this.$emit('quick-question', question)
      }
    },

    formatTime (timestamp) {
      if (!timestamp) return ''

      const date = new Date(timestamp)

      // 格式化为 "2025-09-24 20:45:18" 格式
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    scrollToBottom () {
      this.$nextTick(() => {
        const wrapper = this.$refs.messagesWrapper
        if (wrapper) {
          this.isAutoScrolling = true
          wrapper.scrollTo({
            top: wrapper.scrollHeight,
            behavior: 'smooth'
          })
          setTimeout(() => {
            this.isAutoScrolling = false
          }, 150)
        }
      })
    },

    /**
     * 滚动事件处理：检测用户是否手动滚动离开底部
     * 参考Dify开源项目的userScrolled模式
     */
    handleScroll () {
      if (this.isAutoScrolling) return
      const wrapper = this.$refs.messagesWrapper
      if (!wrapper) return
      const distanceToBottom = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight
      const wasScrolled = this.userScrolled
      this.userScrolled = distanceToBottom > 150
      // 用户滚动回底部时，移除额外的padding
      if (wasScrolled && !this.userScrolled && wrapper.style.paddingBottom) {
        this.isAutoScrolling = true
        wrapper.style.paddingBottom = ''
        this.$nextTick(() => {
          wrapper.scrollTo({ top: wrapper.scrollHeight, behavior: 'auto' })
          setTimeout(() => {
            this.isAutoScrolling = false
          }, 50)
        })
      }
    },

    /**
     * 准备滚动到用户消息（供父组件在发送消息前调用）
     */
    prepareScrollToUserMessage () {
      this.scrollToUserOnNextUpdate = true
    },

    /**
     * 将最后一条用户消息滚动到视口顶部
     */
    doScrollToLastUserMessage () {
      this.$nextTick(() => {
        const wrapper = this.$refs.messagesWrapper
        if (!wrapper) return

        const messageItems = wrapper.querySelectorAll('.message-item--user')
        const lastUserMessage = messageItems[messageItems.length - 1]
        if (!lastUserMessage) {
          this.userScrolled = false
          this.scrollToBottom()
          return
        }

        // 增大底部padding，确保用户消息能滚到视口顶部
        wrapper.style.paddingBottom = wrapper.clientHeight + 'px'

        const wrapperRect = wrapper.getBoundingClientRect()
        const messageRect = lastUserMessage.getBoundingClientRect()
        const scrollTarget = wrapper.scrollTop + (messageRect.top - wrapperRect.top) - 16

        wrapper.scrollTo({ top: scrollTarget, behavior: 'auto' })
        this.userScrolled = true
      })
    },

    /**
     * 点击"滚动到底部"按钮：移除padding，滚动到底部，恢复auto-scroll
     */
    scrollToBottomAndReset () {
      const wrapper = this.$refs.messagesWrapper
      if (!wrapper) return
      this.isAutoScrolling = true
      wrapper.style.paddingBottom = ''
      this.$nextTick(() => {
        wrapper.scrollTo({ top: wrapper.scrollHeight, behavior: 'smooth' })
        this.userScrolled = false
        setTimeout(() => {
          this.isAutoScrolling = false
        }, 300)
      })
    },

    copyMessage (message) {
      const text = message.content
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopyTextToClipboard(text)
        })
      } else {
        this.fallbackCopyTextToClipboard(text)
      }

      this.$emit('message-action', 'copy', message)
    },

    fallbackCopyTextToClipboard (text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        this.$message.success('已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }

      document.body.removeChild(textArea)
    },

    feedbackMessage (message, type) {
      const feedbackText = type === 'positive' ? '感谢您的反馈！' : '我们会改进回答质量'
      this.$message.success(feedbackText)
      this.$emit('message-action', 'feedback', { message, type })
    },

    retryMessage (message) {
      this.$emit('message-action', 'retry', message)
    },

    executeAction (action, message) {
      this.$emit('message-action', 'execute', { action, message })
    },

    /**
     * 检查消息是否包含OpenPage数据（含ai_new_route的JSON）
     */
    hasOpenPageData (message) {
      if (!message.ai_open_dialog_para) return false
      try {
        const str = message.ai_open_dialog_para
        return str.includes('ai_new_route')
      } catch (e) {
        return false
      }
    },

    /**
     * 检查OpenPage数据是否已过期（超过24小时）
     */
    isOpenPageExpired (message) {
      if (!message.timestamp) return true
      const messageTime = new Date(message.timestamp).getTime()
      const now = Date.now()
      const hours24 = 24 * 60 * 60 * 1000
      return (now - messageTime) > hours24
    },

    /**
     * 从消息中打开页面（点击"打开页面"按钮）
     */
    openPageFromMessage (message) {
      if (this.isOpenPageExpired(message)) {
        this.$message.warning('页面数据已过期（超过24小时），请重新执行工作流')
        return
      }
      this.$emit('open-page', message.ai_open_dialog_para)
    },

    handleQuickQuestion (question) {
      this.$emit('quick-question', question)
    },

    startResize (event) {
      event.preventDefault()

      const startX = event.clientX
      const startWidth = this.$parent.$el.offsetWidth || 480

      const minWidth = 480
      const maxWidth = Math.min(window.innerWidth * 0.8, 1200)

      const handleMouseMove = (e) => {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + (startX - e.clientX)))
        this.$emit('resize-chat', newWidth)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },

    /**
     * 显示工作流执行详情
     * @param {Object} message - AI消息对象
     */
    async showExecutionDetail (message) {
      if (!message.workflowRuntime) {
        this.$message.warning('该消息没有关联的工作流执行记录')
        return
      }

      if (!message.workflowRuntime.uuid) {
        this.$message.warning('该消息没有关联的工作流执行记录(缺少UUID)')
        return
      }

      try {
        this.detailLoading = true
        this.detailDialogVisible = true

        // 存储当前消息ID(用于ExecutionDetailDialog显示)
        this.currentMessageId = message.id

        // 使用UUID字符串作为参数,而不是数字ID
        const runtimeUuid = message.workflowRuntime.uuid

        // 获取完整的runtime详情(包括workflow_name、status、时间等)
        const runtimeDetail = await aiChatService.getConversationRuntimeDetail(runtimeUuid)
        this.currentRuntimeDetail = runtimeDetail || message.workflowRuntime

        // 调用API获取节点详情
        const nodes = await aiChatService.getConversationRuntimeNodeDetails(runtimeUuid)
        this.currentNodes = nodes || []

        if (this.currentNodes.length === 0) {
          this.$message.info('该工作流暂无节点执行记录')
        }
      } catch (error) {
        this.$message.error('获取执行详情失败: ' + (error.message || '未知错误'))
        console.error('获取执行详情失败:', error)
        this.detailDialogVisible = false
      } finally {
        this.detailLoading = false
      }
    },

    /**
     * 删除工作流运行时记录
     * @param {Object} message - AI消息对象
     */
    async deleteWorkflowRuntime (message) {
      if (!message.id) {
        this.$message.warning('该消息缺少ID信息')
        return
      }

      try {
        // 延迟设置 z-index，确保弹窗渲染完成后修改
        setTimeout(() => {
          const messageBoxWrapper = document.querySelector('.ai-chat-confirm-dialog')
          if (messageBoxWrapper) {
            messageBoxWrapper.style.zIndex = '10100'
            // 同时设置遮罩层（遮罩层是 wrapper 的兄弟元素）
            const wrapperParent = messageBoxWrapper.closest('.el-message-box__wrapper')
            if (wrapperParent) {
              wrapperParent.style.zIndex = '10100'
              const modal = wrapperParent.previousElementSibling
              if (modal && modal.classList.contains('v-modal')) {
                modal.style.zIndex = '10099'
              }
            }
          }
        }, 0)

        await this.$confirm('确定要删除这条聊天消息吗?', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'ai-chat-confirm-dialog'
        })

        const messageId = message.id

        // 调用删除API (传递message_id)
        await aiChatService.deleteConversationRuntime(messageId)

        // 从消息列表中移除该消息
        const index = this.messages.findIndex(msg => msg.id === messageId)
        if (index !== -1) {
          this.messages.splice(index, 1)
        }

        this.$message.success('删除成功')
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消删除,不显示错误
          return
        }
        this.$message.error('删除失败: ' + (error.message || '未知错误'))
        console.error('删除聊天消息失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.scm-message-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.resize-handle {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 50px;
  cursor: ew-resize;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.15);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(64, 158, 255, 0.25);
    border-color: rgba(64, 158, 255, 0.5);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    background: rgba(64, 158, 255, 0.35);
    border-color: #409EFF;
  }
}

.handle-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;

  span {
    width: 3px;
    height: 3px;
    background: rgba(64, 158, 255, 0.8);
    border-radius: 50%;
    transition: background 0.2s ease;
  }
}

.resize-handle:hover .handle-dots span {
  background: #409EFF;
  transform: scale(1.2);
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 滚动到底部浮动按钮 */
.scroll-to-bottom-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.scroll-to-bottom-btn:hover {
  background: #f0f7ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.scroll-to-bottom-btn i {
  font-size: 18px;
  color: #409eff;
}

/* 按钮淡入淡出动画 */
.scroll-btn-fade-enter-active,
.scroll-btn-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.scroll-btn-fade-enter,
.scroll-btn-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scm-welcome-area {
  padding: 24px 20px;
  background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
}

.welcome-message {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.welcome-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.sparkle-icon {
  width: 24px;
  height: 24px;
  fill: white;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.quick-questions-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-title i {
  color: #667eea;
}

.refresh-btn {
  color: #667eea;
  font-size: 12px;
  padding: 4px 8px;
}

.refresh-btn:hover {
  color: #764ba2;
  background: rgba(102, 126, 234, 0.1);
}

.questions-grid {
  display: grid;
  gap: 12px;
}

.questions-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.question-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: slideInUp 0.6s ease-out;
}

.question-card:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.03) 100%);
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.question-text {
  flex: 1;
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
}

.question-arrow {
  flex-shrink: 0;
  color: #c0c4cc;
  transition: all 0.3s ease;
}

.question-card:hover .question-arrow {
  color: #667eea;
  transform: translateX(4px);
}

.features-section {
  margin-bottom: 24px;
}

.features-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.feature-icon {
  font-size: 16px;
}

.feature-text {
  font-size: 13px;
  color: #606266;
}

.bottom-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #67c23a;
  text-align: center;
}

.question-card-enter-active,
.question-card-leave-active {
  transition: all 0.4s ease;
}

.question-card-enter,
.question-card-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.question-card-move {
  transition: transform 0.4s ease;
}

@media (max-width: 480px) {
  .scm-welcome-area {
    padding: 16px 12px;
  }

  .welcome-message {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .features-list {
    grid-template-columns: 1fr;
  }

  .questions-container {
    grid-template-columns: 1fr;
  }

  .question-card {
    padding: 10px 12px;
  }

  .question-text {
    font-size: 13px;
  }
}

.message-item {
  display: flex;
  animation: messageSlideIn 0.4s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-system {
  align-self: center;
  text-align: center;
}

.system-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.2);
  border-radius: 16px;
  color: #67c23a;
  font-size: 13px;
}

.message-item--user {
  flex-direction: row-reverse;
}

.message-user {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 80%;
  margin-left: auto;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-user .message-content {
  align-items: flex-end;
}

.message-item--ai {
  flex-direction: row;
}

.message-ai,
.message-agent {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 85%;
}

.message-ai .message-content,
.message-agent .message-content {
  align-items: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.agent-avatar {
  background: #67c23a;
  color: white;
}

.ai-icon {
  width: 18px;
  height: 18px;
  fill: white;
}

.message-bubble {
  position: relative;
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
  word-break: break-word;
  max-width: 100%;
  transition: all 0.3s ease;
}

/* 移除hover效果，因为按钮现在始终显示 */
/*
.message-bubble:hover .bubble-actions {
  opacity: 1;
  transform: translateY(0);
}
*/

.message-bubble--user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-bubble--ai {
  background: white;
  color: #303133;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.1);
}

.message-bubble--agent {
  background: white;
  color: #303133;
  border: 1px solid rgba(103, 194, 58, 0.2);
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.1);
}

.bubble-content {
  margin-bottom: 4px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
}

.ai-content {
}

.ai-steps {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.steps-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.steps-list {
  margin: 0;
  padding-left: 16px;
}

.step-item {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
  line-height: 1.4;
}

.ai-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-open-page-action {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.open-page-button {
  background: linear-gradient(135deg, #409EFF 0%, #667eea 100%);
  border: none;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 14px;
  height: auto;
}

.open-page-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #667eea 0%, #409EFF 100%);
  color: white;
}

.open-page-button:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

.expired-tip {
  font-size: 11px;
  color: #909399;
}

.action-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 12px;
  height: auto;
}

.action-button:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
}

/* 消息元信息容器 - 时间和按钮两端对齐 */
.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  min-height: 20px;
}

.bubble-actions {
  display: flex;
  gap: 4px;
  margin-top: 0;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.bubble-action-btn {
  padding: 4px 6px;
  font-size: 12px;
  color: #c0c4cc;
  min-height: auto;
  height: auto;
  border-radius: 4px;
}

.bubble-action-btn:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.delete-btn {
  color: #f56c6c !important;
}

.delete-btn:hover {
  color: #f78989 !important;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.agent-name {
  font-size: 12px;
  font-weight: 600;
  color: #67c23a;
}

.agent-role {
  font-size: 11px;
  color: #909399;
  background: rgba(103, 194, 58, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #c0c4cc;
  padding: 0 4px;
  white-space: nowrap;
}

.typing-indicator {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  animation: typing-fade-in 0.3s ease-out;
}

@keyframes typing-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.typing-bubble {
  background: white;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  border-bottom-left-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-text {
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background: #667eea;
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

.message-enter-active,
.message-leave-active {
  transition: all 0.4s ease;
}

.message-enter,
.message-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.message-move {
  transition: transform 0.4s ease;
}

.scm-message-list::-webkit-scrollbar {
  width: 6px;
}

.scm-message-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.scm-message-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.scm-message-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

@media (max-width: 480px) {
  .messages-wrapper {
    padding: 12px 16px;
  }

  .message-user,
  .message-ai,
  .message-agent {
    max-width: 95%;
  }

  .message-bubble {
    padding: 10px 12px;
    font-size: 14px;
  }

  .ai-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>

<!-- 全局样式：确保确认框显示在 AI Chat 窗口之上 -->
<style>
/* MessageBox wrapper 容器 */
.el-message-box__wrapper.ai-chat-confirm-dialog,
div.el-message-box__wrapper[aria-label="删除确认"] {
  z-index: 10100 !important;
}

/* MessageBox 本身 */
.ai-chat-confirm-dialog .el-message-box {
  z-index: 10100 !important;
}

/* 遮罩层 */
.v-modal {
  /* 默认不改变，只在 JS 中动态设置 */
}
</style>
