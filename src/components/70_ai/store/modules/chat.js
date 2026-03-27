import Vue from 'vue'
import aiChatService from '@/components/70_ai/api/aiChatService'
import router from '@/router'
// import SockJS from 'sockjs-client'
// import Stomp from 'stompjs'

const state = {
  isConnected: false,
  isConnecting: false,

  conversationId: null,
  conversationInfo: {},

  messages: [],
  unreadCount: 0,
  isLoading: false,
  isTyping: false,

  isPanelExpanded: false,

  userInfo: {
    userId: null,
    userName: '访客',
    userEmail: null
  },

  config: {
    maxRetries: 3,
    retryInterval: 5000,
    heartbeatInterval: 30000
  },

  lastError: null,
  retryCount: 0,

  // ==================== Workflow Slash Command 状态 (2025-11-24) ====================
  availableWorkflows: [], // 可用workflow列表
  selectedWorkflow: null, // 当前选中的workflow
  isWorkflowMode: false, // 是否处于workflow命令模式

  // AI业务弹窗触发状态
  pendingAiDialogOutput: null,

  // AI页面导航预填数据（route模式，consumed标记防止重复消费）
  aiPageAction: null, // { data: {}, consumed: false }

  // AI页面导航加载浮层
  aiLoadingOverlay: false,

  // 当前活跃的人机交互请求
  activeInteraction: null,

  // 工作流节点执行步骤（按消息ID索引）
  // 格式：{ [messageId]: { steps: [{ nodeUuid, nodeName, nodeTitle, status, timestamp, duration, summary }] } }
  workflowProcessNodes: {}
}

const mutations = {
  SET_CONNECTED (state, status) {
    state.isConnected = status
  },

  SET_CONNECTING (state, status) {
    state.isConnecting = status
  },

  SET_CONVERSATION_ID (state, conversationId) {
    state.conversationId = conversationId
  },

  SET_CONVERSATION_INFO (state, info) {
    state.conversationInfo = { ...state.conversationInfo, ...info }
  },

  SET_MESSAGES (state, messages) {
    state.messages = messages
  },

  ADD_MESSAGE (state, message) {
    const newMessage = {
      id: message.id || Date.now(),
      content: message.content,
      type: message.type || 'user', // user, agent, system
      timestamp: message.timestamp || new Date().toISOString(),
      avatar: message.avatar || null,
      status: message.status || 'sent' // sent, delivered, read, failed
    }
    state.messages.push(newMessage)
  },

  UPDATE_MESSAGE (state, { messageId, updates }) {
    const index = state.messages.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      const oldMessage = state.messages[index]
      const newMessage = { ...oldMessage, ...updates }
      state.messages.splice(index, 1, newMessage)
    }
  },

  SET_UNREAD_COUNT (state, count) {
    state.unreadCount = count
  },

  SET_LOADING (state, status) {
    state.isLoading = status
  },

  SET_TYPING (state, status) {
    state.isTyping = status
  },

  SET_PANEL_EXPANDED (state, expanded) {
    state.isPanelExpanded = expanded
    localStorage.setItem('chat_panel_expanded', expanded.toString())
  },

  TOGGLE_PANEL (state) {
    state.isPanelExpanded = !state.isPanelExpanded
    localStorage.setItem('chat_panel_expanded', state.isPanelExpanded.toString())
  },

  SET_USER_INFO (state, userInfo) {
    state.userInfo = { ...state.userInfo, ...userInfo }
  },

  SET_ERROR (state, error) {
    state.lastError = error
  },

  SET_RETRY_COUNT (state, count) {
    state.retryCount = count
  },

  RESET_CHAT_STATE (state) {
    state.conversationId = null
    state.messages = []
    state.unreadCount = 0
    state.isConnected = false
    state.isConnecting = false
    state.lastError = null
    state.retryCount = 0
  },

  // 初始化状态（从localStorage恢复UI状态）
  INIT_CHAT_STATE (state) {
    const savedPanelState = localStorage.getItem('chat_panel_expanded')
    if (savedPanelState !== null) {
      state.isPanelExpanded = savedPanelState === 'true'
    }
  },

  // ==================== Workflow Slash Command Mutations (2025-11-24) ====================

  SET_AVAILABLE_WORKFLOWS (state, workflows) {
    state.availableWorkflows = workflows
  },

  SET_SELECTED_WORKFLOW (state, workflow) {
    state.selectedWorkflow = workflow
  },

  SET_WORKFLOW_MODE (state, isWorkflowMode) {
    state.isWorkflowMode = isWorkflowMode
  },

  CLEAR_WORKFLOW_STATE (state) {
    state.selectedWorkflow = null
    state.isWorkflowMode = false
  },

  SET_PENDING_AI_DIALOG_OUTPUT (state, output) {
    state.pendingAiDialogOutput = output
  },

  SET_AI_PAGE_FORM_DATA (state, formData) {
    // 兼容旧调用，同时更新 aiPageAction
    state.aiPageAction = formData ? { data: formData, consumed: false } : null
  },

  CONSUME_AI_PAGE_ACTION (state) {
    if (state.aiPageAction) {
      state.aiPageAction = { ...state.aiPageAction, consumed: true }
    }
  },

  SET_AI_LOADING_OVERLAY (state, visible) {
    state.aiLoadingOverlay = visible
  },

  SET_ACTIVE_INTERACTION (state, interaction) {
    state.activeInteraction = interaction
  },

  CLEAR_WORKFLOW_PROCESS_NODE (state, messageId) {
    if (state.workflowProcessNodes[messageId]) {
      const copy = { ...state.workflowProcessNodes }
      delete copy[messageId]
      state.workflowProcessNodes = copy
    }
  },

  ADD_WORKFLOW_VIRTUAL_STEP (state, { messageId, step }) {
    if (!state.workflowProcessNodes[messageId]) {
      state.workflowProcessNodes = { ...state.workflowProcessNodes, [messageId]: { steps: [] }}
    }
    const steps = state.workflowProcessNodes[messageId].steps
    // 去重：同一 nodeUuid 的虚拟步骤只插入一次
    if (!steps.find(s => s.nodeUuid === step.nodeUuid)) {
      steps.push(step)
    }
  },

  SET_WORKFLOW_PROCESS_NODE (state, { messageId, nodeEvent }) {
    if (!state.workflowProcessNodes[messageId]) {
      // 注意：不再有 pendingCompletes 字段
      state.workflowProcessNodes = { ...state.workflowProcessNodes, [messageId]: { steps: [] }}
    }
    const processData = state.workflowProcessNodes[messageId]
    const steps = processData.steps

    if (nodeEvent.nodeEventType === 'node_complete') {
      // 处理虚拟"问题分析"步骤：第一个真实节点完成时，将虚拟步骤标记完成
      const virtualIdx = steps.findIndex(s => s.nodeUuid === '__virtual_analysis__')
      if (virtualIdx !== -1 && steps[virtualIdx].status !== 'done') {
        Vue.set(steps[virtualIdx], 'status', 'done')
        Vue.set(steps[virtualIdx], 'duration', nodeEvent.nodeTimestamp - steps[virtualIdx].timestamp)
      }
      // 先查找由 node_running 插入的步骤，找到则更新三个字段，找不到则兜底插入
      const existing = steps.find(s => s.nodeUuid === nodeEvent.nodeUuid)
      if (existing) {
        Vue.set(existing, 'status', 'done')
        Vue.set(existing, 'duration', nodeEvent.nodeDuration || null)
        Vue.set(existing, 'summary', nodeEvent.nodeSummary || null)
      } else {
        // 兜底：node_running 未到达时直接插入完成状态
        steps.push({
          nodeUuid: nodeEvent.nodeUuid,
          nodeName: nodeEvent.nodeName,
          nodeTitle: nodeEvent.nodeTitle,
          status: 'done',
          timestamp: nodeEvent.nodeTimestamp,
          duration: nodeEvent.nodeDuration || null,
          summary: nodeEvent.nodeSummary || null,
          depth: 1
        })
      }
    }
  },

  SET_WORKFLOW_NODE_RUNNING (state, { messageId, nodeEvent }) {
    if (!state.workflowProcessNodes[messageId]) {
      Vue.set(state.workflowProcessNodes, messageId, { steps: [] })
    }
    const steps = state.workflowProcessNodes[messageId].steps
    // 去重：同一 nodeUuid 只插入一次（当前系统为 DAG，不支持循环）
    if (!steps.find(s => s.nodeUuid === nodeEvent.nodeUuid)) {
      steps.push({
        nodeUuid: nodeEvent.nodeUuid,
        nodeName: nodeEvent.nodeName,
        nodeTitle: nodeEvent.nodeTitle,
        status: 'running',
        timestamp: nodeEvent.nodeTimestamp,
        duration: null,
        summary: null,
        depth: 1
      })
    }
  },

  // 刷新缓冲的node_complete（流结束时调用，确保最后一步正确标记为done）
  FLUSH_PENDING_NODE_COMPLETE (state, messageId) {
    const processData = state.workflowProcessNodes[messageId]
    // 标记 agent 包裹行完成（__agent_call__ 虚拟步骤在流结束时收尾）
    if (processData) {
      const agentStep = processData.steps.find(s => s.nodeUuid === '__agent_call__')
      if (agentStep && agentStep.status !== 'done') {
        Vue.set(agentStep, 'status', 'done')
      }
    }
  }
}

const actions = {
  async initializeChat ({ commit, dispatch, state, rootState }) {
    try {
      commit('SET_LOADING', true)

      commit('INIT_CHAT_STATE')

      // 必须从用户信息中获取conv_uuid
      const userInfo = rootState.user || {}
      const conversationId = userInfo.conv_uuid

      if (conversationId) {
        commit('SET_CONVERSATION_ID', conversationId)
        await dispatch('loadMessages', { page: 1 })
      } else {
        commit('SET_ERROR', '用户会话信息不完整，无法加载历史消息')
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createConversation ({ commit, rootState }, prompt = '您好，我是SCM智能助手，请问有什么可以帮助您的吗？') {
    try {
      // 必须使用用户的conv_uuid
      const userInfo = rootState.user || {}
      const conversationId = userInfo.conv_uuid

      if (!conversationId) {
        throw new Error('用户conv_uuid不存在，无法创建会话')
      }

      const response = await aiChatService.addConversation({
        prompt,
        chatModelId: 'default',
        conversationId,
        organizationId: 'default'
      })

      commit('SET_CONVERSATION_ID', conversationId)
      commit('SET_CONVERSATION_INFO', response)

      return { conversationId, ...response }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async sendMessage ({ commit, state, dispatch, rootState, rootGetters }, content) {
    if (!content.trim()) return

    // eslint-disable-next-line no-unused-vars
    let _cancelFunction = null

    try {
      commit('SET_LOADING', true)

      if (!state.conversationId) {
        await dispatch('createConversation', content)
      }

      // 获取当前页面上下文(用于MCP工具回答"我在哪个页面"等问题)
      const currentRoute = router.currentRoute
      const pageContext = currentRoute ? {
        page_code: currentRoute.meta?.page_code || currentRoute.name || '',
        title: currentRoute.meta?.title || '',
        path: currentRoute.path || ''
      } : null

      const userMessage = {
        id: 'temp_' + Date.now(),
        content: content.trim(),
        type: 'user',
        timestamp: new Date().toISOString(),
        status: 'sending'
      }
      commit('ADD_MESSAGE', userMessage)

      const aiMessageId = 'ai_' + Date.now()
      // 立即创建AI消息但设为隐藏状态，避免闪烁
      const aiMessage = {
        id: aiMessageId,
        content: '',
        type: 'ai',
        timestamp: new Date().toISOString(),
        status: 'thinking',
        isStreaming: true,
        isHidden: true // 标记为隐藏，不在UI中显示
      }
      commit('ADD_MESSAGE', aiMessage)
      // 立即显示"深度思考 · 问题分析中..."（虚拟步骤，等真实节点事件到来后标记完成）
      commit('ADD_WORKFLOW_VIRTUAL_STEP', {
        messageId: aiMessageId,
        step: {
          nodeUuid: '__virtual_analysis__',
          nodeName: 'Classifier',
          nodeTitle: '问题分析',
          status: 'running',
          timestamp: Date.now(),
          duration: null,
          summary: null,
          depth: 1
        }
      })
      // 关闭旧typing indicator，由ThinkingSteps接管显示
      commit('SET_TYPING', false)

      _cancelFunction = aiChatService.sendMessageStream({
        conversationId: state.conversationId,
        prompt: content.trim(),
        chatModelId: 'default',
        pageContext
      }, {
        onStart: () => {
          commit('UPDATE_MESSAGE', {
            messageId: userMessage.id,
            updates: { status: 'sent' }
          })
        },
        // 【新增】MCP页面跳转回调 - 当后端返回openPage指令时触发
        onOpenPage: ({ url, target }) => {
          // 使用Vue Router进行页面跳转
          // 注意: Vuex store中无法直接访问this.$router, 需要通过rootState或者全局router实例
          // 这里我们使用import导入的router实例
          if (rootState && rootState.router) {
            rootState.router.push(url).catch(err => {
              console.error('页面跳转失败:', err)
            })
          } else {
            // 降级方案: 使用window.location
            if (target === '_blank') {
              window.open(url, '_blank')
            } else {
              // 对于 Vue Router 的路由,使用hash模式跳转
              window.location.hash = '#' + url
            }
          }
        },
        onNodeEvent: (nodeEvent) => {
          if (nodeEvent.nodeEventType === 'runtime') {
            // runtime事件：插入"调用agent：xxx"包裹行
            commit('ADD_WORKFLOW_VIRTUAL_STEP', {
              messageId: aiMessageId,
              step: {
                nodeUuid: '__agent_call__',
                nodeName: 'AgentCall',
                nodeTitle: nodeEvent.workflowTitle || '工作流',
                status: 'running',
                timestamp: Date.now(),
                duration: null,
                summary: null,
                depth: 1
              }
            })
            return
          }
          if (nodeEvent.nodeEventType === 'node_running') {
            commit('SET_WORKFLOW_NODE_RUNNING', { messageId: aiMessageId, nodeEvent })
            return
          }
          if (nodeEvent.nodeEventType === 'node_complete') {
            commit('SET_WORKFLOW_PROCESS_NODE', {
              messageId: aiMessageId,
              nodeEvent
            })
          }
        },
        onOpenPageCommand: (command, realMessageId) => {
          import('@/components/70_ai/components/navigator/AiPageRouter.js').then(({ navigateToPage }) => {
            navigateToPage(command, router, { getters: rootGetters, commit, dispatch })
              .then((success) => {
                const routeLabel = command.page_mode === 'new' ? '新增页面'
                  : (command.page_mode === 'edit' ? '编辑页面' : '页面')
                const appendText = success ? `\n\n已为您打开${routeLabel}` : '\n\n页面打开失败'
                const finalMsgId = realMessageId || aiMessageId
                // 追加到已有内容，而不是覆盖
                const existingMsg = state.messages.find(msg => msg.id === finalMsgId)
                const existingContent = existingMsg?.content || ''
                const newContent = existingContent ? existingContent + appendText : appendText.trim()
                commit('UPDATE_MESSAGE', {
                  messageId: finalMsgId,
                  updates: {
                    content: newContent,
                    status: 'delivered',
                    isStreaming: false
                  }
                })
              })
          })
        },
        onInteractionRequest: (request) => {
          // 人机交互请求：更新AI气泡为等待状态，启动交互状态管理
          commit('SET_TYPING', false)
          commit('UPDATE_MESSAGE', {
            messageId: aiMessageId,
            updates: {
              status: 'delivered',
              isStreaming: false
            }
          })
          import('@/components/70_ai/components/interaction/AiInteractionManager.js').then(({ startInteraction }) => {
            startInteraction({ ...request, _aiMessageId: aiMessageId }, { state: { chat: state }, commit })
          })
        },
        onContent: (contentChunk) => {
          const currentMessage = state.messages.find(msg => msg.id === aiMessageId)

          if (currentMessage) {
            const accumulatedContent = (currentMessage.content || '') + (contentChunk || '')

            // 只有当累积内容有实际意义时才显示AI消息并隐藏思考状态
            // 提高阈值，确保有足够内容才显示，避免空白对话框
            const trimmedContent = accumulatedContent.trim()
            const hasValidContent = trimmedContent.length > 15 &&
                                  trimmedContent.replace(/\s+/g, ' ').length > 10 // 去除多余空格后仍有内容

            if (hasValidContent && state.isTyping) {
              commit('SET_TYPING', false)
            }

            commit('UPDATE_MESSAGE', {
              messageId: aiMessageId,
              updates: {
                content: accumulatedContent,
                status: hasValidContent ? 'streaming' : 'thinking',
                isStreaming: !hasValidContent,
                isHidden: !hasValidContent, // 有有效内容时才显示
                streamFormat: 'flux-chat-response'
              }
            })
          }
        },
        onComplete: (fullContent, chatResponse) => {
          // 确保思考状态结束
          commit('SET_TYPING', false)

          const currentMessage = state.messages.find(msg => msg.id === aiMessageId)
          const finalContent = fullContent || currentMessage?.content || ''

          if (currentMessage) {
            // 检查最终内容是否足够显示，避免空白消息
            const trimmedFinalContent = finalContent.trim()
            const hasEnoughContent = trimmedFinalContent.length > 5 &&
                                   trimmedFinalContent.replace(/\s+/g, ' ').length > 3

            // 构建工作流运行时信息
            let workflowRuntime = null
            if (chatResponse) {
              // 优先使用runtimeId(数字ID),如果没有则使用runtimeUuid
              const runtimeId = chatResponse.runtimeId || chatResponse.runtimeUuid

              if (runtimeId) {
                workflowRuntime = {
                  id: runtimeId,
                  uuid: chatResponse.runtimeUuid,
                  workflowUuid: chatResponse.workflowUuid,
                  isWaitingInput: chatResponse.isWaitingInput,
                  isComplete: chatResponse.isComplete
                }
              }
            }

            // 刷新缓冲的node_complete（确保最后一步标记为done后再持久化）
            commit('FLUSH_PENDING_NODE_COMPLETE', aiMessageId)

            // 持久化工作流步骤到消息对象（折叠模式：完成后保留，不消失）
            const processData = state.workflowProcessNodes[aiMessageId]
            const workflowSteps = processData && processData.steps
              ? JSON.parse(JSON.stringify(processData.steps))
              : null

            // 有open_page_command时，消息内容由onOpenPageCommand负责写入，onComplete不覆盖
            const hasOpenPageCommand = !!(chatResponse?.open_page_command)

            commit('UPDATE_MESSAGE', {
              messageId: aiMessageId,
              updates: {
                // 关键修复: 使用后端返回的真实messageId替换临时ID
                // 解决删除消息时因ID不匹配导致删除失败的问题
                id: chatResponse?.messageId || aiMessageId,
                // open_page_command时不覆盖content（导航进度已写入），否则用finalContent
                ...(hasOpenPageCommand ? {} : { content: finalContent }),
                status: 'delivered',
                isStreaming: false,
                isHidden: !hasOpenPageCommand && !hasEnoughContent, // open_page_command时消息可见
                streamFormat: 'flux-chat-response',
                completedAt: new Date().toISOString(),
                workflowRuntime: workflowRuntime, // 保存工作流运行时信息
                workflowSteps: workflowSteps,
                ai_open_dialog_para: chatResponse?.ai_open_dialog_para || null // OpenPage节点JSON数据，用于"打开页面"按钮
              }
            })

            // 触发AI业务弹窗检测
            // 优先使用ai_open_dialog_para(OpenPage节点或Synthesizer路径透传的含ai_new_route的原始JSON)
            const dialogOutput = chatResponse?.ai_open_dialog_para || finalContent

            // 上报完整workflowSteps到后端持久化（含虚拟节点和summary，刷新后可恢复）
            const realMessageId = chatResponse?.messageId || aiMessageId
            if (workflowSteps && workflowSteps.length > 0 && realMessageId) {
              aiChatService.updateWorkflowSteps(realMessageId, workflowSteps)
            }
            commit('SET_PENDING_AI_DIALOG_OUTPUT', dialogOutput)

            // 清除临时步骤数据（已持久化到消息对象）
            commit('CLEAR_WORKFLOW_PROCESS_NODE', aiMessageId)
          }
        },
        onError: (_error) => {
          // 错误时结束思考状态
          commit('SET_TYPING', false)
          // 清除工作流步骤（包括虚拟步骤）
          commit('CLEAR_WORKFLOW_PROCESS_NODE', aiMessageId)

          commit('UPDATE_MESSAGE', {
            messageId: userMessage.id,
            updates: {
              status: 'failed',
              content: content.trim()
            }
          })
          commit('UPDATE_MESSAGE', {
            messageId: aiMessageId,
            updates: {
              content: _error && _error.message ? _error.message : '抱歉，消息发送失败，请稍后重试。',
              status: 'error',
              isStreaming: false
            }
          })
        }
      })
    } catch (error) {
      // 异常时结束思考状态
      commit('SET_TYPING', false)
      commit('SET_ERROR', error.message)

      const failedMessage = state.messages.find(msg => msg.status === 'sending')
      if (failedMessage) {
        commit('UPDATE_MESSAGE', {
          messageId: failedMessage.id,
          updates: {
            status: 'failed',
            content: content.trim()
          }
        })
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async resumeInteraction ({ commit, state }) {
    const interaction = state.activeInteraction
    if (!interaction) return

    const aiMessageId = interaction._aiMessageId
    const conversationId = state.conversationId

    if (!aiMessageId || !conversationId) return

    // 构建 feedback 消息
    const feedbackMessage = JSON.stringify({
      type: 'ai_interaction_feedback',
      interaction_uuid: interaction.interaction_uuid,
      action: interaction._pendingAction,
      data: interaction._pendingData
    })

    // 标记气泡为 resuming 状态（不设 SET_TYPING，避免出现多余的 typing indicator）
    commit('UPDATE_MESSAGE', { messageId: aiMessageId, updates: { status: 'streaming', isStreaming: true, isHidden: false }})

    // 停止倒计时
    import('@/components/70_ai/components/interaction/AiInteractionManager.js').then(({ stopCountdown }) => {
      stopCountdown()
    })

    aiChatService.sendMessageStream(
      { conversationId, prompt: feedbackMessage, chatModelId: 'default' },
      {
        onContent: (content) => {
          const msg = state.messages.find(m => m.id === aiMessageId)
          commit('UPDATE_MESSAGE', {
            messageId: aiMessageId,
            updates: { content: (msg?.content || '') + content, status: 'streaming', isHidden: false }
          })
        },
        onComplete: (fullContent, chatResponse) => {
          commit('SET_TYPING', false)
          // 用气泡当前内容（已追加完毕），不用 fullContent（只含本轮内容，会抹掉第一轮输出）
          const finalContent = state.messages.find(m => m.id === aiMessageId)?.content || ''
          commit('UPDATE_MESSAGE', {
            messageId: aiMessageId,
            updates: {
              content: finalContent,
              status: 'delivered',
              isStreaming: false
            }
          })
        },
        onError: (error) => {
          commit('SET_TYPING', false)
          commit('UPDATE_MESSAGE', {
            messageId: aiMessageId,
            updates: { status: 'error', isStreaming: false, content: error.message || '执行失败' }
          })
        },
        onInteractionRequest: (request) => {
          // 多个连续 HumanFeedback 节点：更新气泡状态，继续存入新的 interaction
          commit('SET_TYPING', false)
          commit('UPDATE_MESSAGE', {
            messageId: aiMessageId,
            updates: { status: 'delivered', isStreaming: false }
          })
          import('@/components/70_ai/components/interaction/AiInteractionManager.js').then(({ startInteraction }) => {
            startInteraction({ ...request, _aiMessageId: aiMessageId }, { state: { chat: state }, commit })
          })
        }
      }
    )
  },

  async loadMessages ({ commit, state }, params = {}) {
    if (!state.conversationId) {
      return
    }

    try {
      const messages = await aiChatService.getAiChatDetail(state.conversationId)

      const formattedMessages = messages
        .filter(msg => {
          // 过滤掉 ai_interaction_feedback 类型的用户消息（HumanFeedback 中断产生的旧数据）
          if (msg.type === 'USER' || msg.type === 'user') {
            try {
              const parsed = JSON.parse(msg.content)
              if (parsed && parsed.type === 'ai_interaction_feedback') return false
            } catch (e) { /* 非 JSON，正常显示 */ }
          }
          return true
        })
        .map(msg => {
        // 将API返回的type转换为前端期望的格式
          let messageType = msg.type || 'agent'
          if (messageType === 'ASSISTANT' || messageType === 'assistant') {
            messageType = 'ai'
          } else if (messageType === 'USER' || messageType === 'user') {
            messageType = 'user'
          }

          // 时间戳格式化
          let formattedTimestamp = msg.c_time || msg.createTime || msg.timestamp || new Date().toISOString()
          if (typeof formattedTimestamp === 'number') {
            formattedTimestamp = new Date(formattedTimestamp).toISOString()
          }

          // 构建工作流运行时信息（如果存在）
          const runtimeUuid = msg.runtime_uuid || msg.runtimeUuid
          const workflowRuntime = runtimeUuid ? {
            id: runtimeUuid,
            uuid: runtimeUuid
          } : null

          // 恢复持久化的工作流思考步骤
          let workflowSteps = null
          if (msg.workflow_steps) {
            try {
              workflowSteps = JSON.parse(msg.workflow_steps)
            } catch (e) {
              console.warn('解析workflow_steps失败', e)
            }
          }

          return {
            id: msg.message_id || msg.id || Date.now(),
            content: msg.content,
            type: messageType,
            timestamp: formattedTimestamp,
            avatar: msg.avatar,
            status: 'delivered',
            workflowRuntime: workflowRuntime, // 工作流运行时信息对象
            ai_open_dialog_para: msg.ai_open_dialog_para || null, // OpenPage节点JSON数据，用于"打开页面"按钮
            workflowSteps: workflowSteps // 持久化的工作流思考步骤
          }
        })

      // 直接使用服务器数据,数据库是唯一数据源
      commit('SET_MESSAGES', formattedMessages)
    } catch (error) {
      commit('SET_ERROR', error.message)
    }
  },

  markAsRead ({ commit, state }) {
    if (!state.conversationId || state.unreadCount === 0) return
    commit('SET_UNREAD_COUNT', 0)
  },

  setUserInfo ({ commit }, userInfo) {
    commit('SET_USER_INFO', userInfo)
  },

  async endConversation ({ commit, state }) {
    if (!state.conversationId) return

    try {
      await aiChatService.deleteConversation(state.conversationId)
      commit('RESET_CHAT_STATE')
    } catch (error) {
      commit('SET_ERROR', error.message)
    }
  },

  async clearConversation ({ commit, state }) {
    if (!state.conversationId) return

    try {
      await aiChatService.clearConversationContent(state.conversationId)
      // 只清空前端消息列表，保留对话状态
      commit('SET_MESSAGES', [])
      commit('SET_UNREAD_COUNT', 0)
      commit('SET_LOADING', false)
      commit('SET_TYPING', false)
      commit('SET_ERROR', null)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  toggleChatPanel ({ commit, state }) {
    commit('TOGGLE_PANEL')
    if (state.isPanelExpanded && state.unreadCount > 0) {
      commit('SET_UNREAD_COUNT', 0)
    }
  },

  setChatPanelExpanded ({ commit }, expanded) {
    commit('SET_PANEL_EXPANDED', expanded)
  },

  initChatPanel ({ commit }) {
    commit('INIT_CHAT_STATE')
  },

  // ==================== Workflow Slash Command Actions (2025-11-24) ====================

  /**
   * 加载可用的workflow列表（无缓存，每次获取最新数据）
   */
  async loadAvailableWorkflows ({ commit }) {
    try {
      const workflows = await aiChatService.getAvailableWorkflows()
      commit('SET_AVAILABLE_WORKFLOWS', workflows)
      return workflows
    } catch (error) {
      console.error('加载workflow列表失败:', error)
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  /**
   * 选择workflow（进入workflow命令模式）
   */
  selectWorkflow ({ commit }, workflow) {
    commit('SET_SELECTED_WORKFLOW', workflow)
    commit('SET_WORKFLOW_MODE', true)
  },

  /**
   * 执行workflow命令（SSE流式响应）
   */
  async executeWorkflowCommand ({ commit, state, dispatch, rootGetters }, { userInput, fileUrls = [] }) {
    if (!state.selectedWorkflow) {
      throw new Error('未选择workflow')
    }

    // eslint-disable-next-line no-unused-vars
    let _cancelFunction = null

    try {
      commit('SET_LOADING', true)

      // 获取当前页面上下文(用于MCP工具回答"我在哪个页面"等问题)
      const currentRoute = router.currentRoute
      const pageContext = currentRoute ? {
        page_code: currentRoute.meta?.page_code || currentRoute.name || '',
        title: currentRoute.meta?.title || '',
        path: currentRoute.path || ''
      } : null

      // 创建用户消息（显示完整的命令输入）
      const userMessage = {
        id: 'temp_' + Date.now(),
        content: `@${state.selectedWorkflow.title} ${userInput}`,
        type: 'user',
        timestamp: new Date().toISOString(),
        status: 'sending'
      }
      commit('ADD_MESSAGE', userMessage)

      // 创建AI响应消息（初始为隐藏状态）
      const aiMessageId = 'ai_workflow_' + Date.now()
      const aiMessage = {
        id: aiMessageId,
        content: '',
        type: 'ai',
        timestamp: new Date().toISOString(),
        status: 'thinking',
        isStreaming: true,
        isHidden: true,
        workflowUuid: state.selectedWorkflow.workflowUuid
      }
      commit('ADD_MESSAGE', aiMessage)
      commit('SET_TYPING', false)
      // 立即显示"深度思考 · 问题分析中..."（虚拟步骤，等真实节点事件到来后标记完成）
      commit('ADD_WORKFLOW_VIRTUAL_STEP', {
        messageId: aiMessageId,
        step: {
          nodeUuid: '__virtual_analysis__',
          nodeName: 'Classifier',
          nodeTitle: '问题分析',
          status: 'running',
          timestamp: Date.now(),
          duration: null,
          summary: null,
          depth: 1
        }
      })

      _cancelFunction = aiChatService.executeWorkflowCommand({
        conversationId: state.conversationId,
        workflowUuid: state.selectedWorkflow.workflowUuid,
        userInput,
        fileUrls,
        pageContext
      }, {
        onStart: () => {
          commit('UPDATE_MESSAGE', {
            messageId: userMessage.id,
            updates: { status: 'sent' }
          })
        },
        onInteractionRequest: (request) => {
          import('@/components/70_ai/components/interaction/AiInteractionManager.js').then(({ startInteraction }) => {
            startInteraction(request, { state: { chat: state }, commit })
          })
        },
        onNodeEvent: (nodeEvent) => {
          if (nodeEvent.nodeEventType === 'node_running') {
            commit('SET_WORKFLOW_NODE_RUNNING', { messageId: aiMessageId, nodeEvent })
            return
          }
          if (nodeEvent.nodeEventType === 'node_complete') {
            commit('SET_WORKFLOW_PROCESS_NODE', {
              messageId: aiMessageId,
              nodeEvent
            })
          }
        },
        onContent: (contentChunk) => {
          const currentMessage = state.messages.find(msg => msg.id === aiMessageId)

          if (currentMessage) {
            const accumulatedContent = (currentMessage.content || '') + (contentChunk || '')

            // 内容足够时显示AI消息
            const trimmedContent = accumulatedContent.trim()
            const hasValidContent = trimmedContent.length > 15 &&
                                  trimmedContent.replace(/\s+/g, ' ').length > 10

            if (hasValidContent && state.isTyping) {
              commit('SET_TYPING', false)
            }

            commit('UPDATE_MESSAGE', {
              messageId: aiMessageId,
              updates: {
                content: accumulatedContent,
                status: hasValidContent ? 'streaming' : 'thinking',
                isStreaming: !hasValidContent,
                isHidden: !hasValidContent
              }
            })
          }
        },
        onComplete: (fullContent, workflowResponse) => {
          commit('SET_TYPING', false)

          const currentMessage = state.messages.find(msg => msg.id === aiMessageId)
          const finalContent = fullContent || currentMessage?.content || ''

          if (currentMessage) {
            const trimmedFinalContent = finalContent.trim()
            const hasOpenPageCommand = !!(workflowResponse?.open_page_command)
            const hasEnoughContent = trimmedFinalContent.length > 5 &&
                                   trimmedFinalContent.replace(/\s+/g, ' ').length > 3

            commit('UPDATE_MESSAGE', {
              messageId: aiMessageId,
              updates: {
                id: workflowResponse?.messageId || aiMessageId,
                ...(hasOpenPageCommand ? {} : { content: finalContent }),
                status: 'delivered',
                isStreaming: false,
                isHidden: !hasOpenPageCommand && !hasEnoughContent,
                completedAt: new Date().toISOString(),
                workflowUuid: state.selectedWorkflow.workflowUuid,
                // 设置workflowRuntime以显示执行详情icon
                workflowRuntime: workflowResponse?.runtimeUuid ? {
                  uuid: workflowResponse.runtimeUuid,
                  id: workflowResponse.runtimeId,
                  workflowUuid: workflowResponse.workflowUuid || state.selectedWorkflow.workflowUuid
                } : undefined,
                ai_open_dialog_para: workflowResponse?.ai_open_dialog_para || null // OpenPage节点JSON数据，用于"打开页面"按钮
              }
            })

            // 处理 open_page_command（route模式页面跳转）
            if (hasOpenPageCommand) {
              import('@/components/70_ai/components/navigator/AiPageRouter.js').then(({ navigateToPage }) => {
                const command = JSON.parse(workflowResponse.open_page_command)
                const realMessageId = workflowResponse?.messageId || aiMessageId
                navigateToPage(command, router, { getters: rootGetters, commit, dispatch })
                  .then((success) => {
                    const routeLabel = command.page_mode === 'new' ? '新增页面'
                      : (command.page_mode === 'edit' ? '编辑页面' : '页面')
                    const appendText = success ? `\n\n已为您打开${routeLabel}` : '\n\n页面打开失败'
                    // 追加到已有内容，而不是覆盖（工作流可能有多个End节点，前面分支已产生内容）
                    const existingMsg = state.messages.find(msg => msg.id === realMessageId)
                    const existingContent = existingMsg?.content || ''
                    const newContent = existingContent ? existingContent + appendText : appendText.trim()
                    commit('UPDATE_MESSAGE', {
                      messageId: realMessageId,
                      updates: { content: newContent, isHidden: false }
                    })
                  })
              })
            } else {
              // 触发AI业务弹窗检测
              const dialogOutput = workflowResponse?.ai_open_dialog_para || finalContent
              commit('SET_PENDING_AI_DIALOG_OUTPUT', dialogOutput)
            }
          }

          // 工作流完成后清除步骤列表（设计文档：步骤列表完成后消失）
          commit('FLUSH_PENDING_NODE_COMPLETE', aiMessageId)
          commit('CLEAR_WORKFLOW_PROCESS_NODE', aiMessageId)

          // 【2025-11-25】方案A: 保持workflow选择状态,不自动清除
          // 用户可以通过点击tag或重新输入/来切换workflow
          // commit('CLEAR_WORKFLOW_STATE')
        },
        onError: (_error) => {
          commit('SET_TYPING', false)

          commit('UPDATE_MESSAGE', {
            messageId: userMessage.id,
            updates: {
              status: 'failed',
              content: `@${state.selectedWorkflow.title} ${userInput}`
            }
          })
          commit('UPDATE_MESSAGE', {
            messageId: aiMessageId,
            updates: {
              content: _error && _error.message ? _error.message : '抱歉，workflow执行失败，请稍后重试。',
              status: 'error',
              isStreaming: false
            }
          })

          // 【2025-11-25】方案A: 即使出错也保持workflow选择状态
          // 用户下次可以继续使用同一workflow,或手动切换
          // commit('CLEAR_WORKFLOW_STATE')
        }
      })
    } catch (error) {
      commit('SET_TYPING', false)
      commit('SET_ERROR', error.message)
      commit('CLEAR_WORKFLOW_STATE')

      const failedMessage = state.messages.find(msg => msg.status === 'sending')
      if (failedMessage) {
        commit('UPDATE_MESSAGE', {
          messageId: failedMessage.id,
          updates: {
            status: 'failed',
            content: failedMessage.content
          }
        })
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 清除workflow选择状态
   */
  clearWorkflowSelection ({ commit }) {
    commit('CLEAR_WORKFLOW_STATE')
  }
}

const getters = {
  connectionStatus: (state) => ({
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    hasError: !!state.lastError
  }),

  latestMessages: (state) => (count = 10) => {
    return state.messages.slice(-count)
  },

  unreadMessages: (state) => {
    return state.messages.filter(msg =>
      msg.type === 'agent' && msg.status !== 'read'
    )
  },

  hasActiveSession: (state) => {
    return !!state.conversationId
  },

  isPanelExpanded: (state) => state.isPanelExpanded,

  // 聊天相关的getters
  chatMessages: (state) => state.messages,
  chatUnreadCount: (state) => state.unreadCount,
  chatIsLoading: (state) => state.isLoading,
  chatIsTyping: (state) => state.isTyping,
  chatPanelExpanded: (state) => state.isPanelExpanded
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
