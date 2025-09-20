<template>
  <div class="hewa-chat-bubble-wrapper">
    <!-- 聊天气泡按钮 -->
    <el-badge
      :value="unreadCount"
      :hidden="unreadCount === 0"
      class="hewa-chat-bubble-badge"
    >
      <div
        class="hewa-chat-bubble"
        :class="{ 'hewa-chat-bubble--expanded': isExpanded }"
        @click="toggleChatPanel"
      >
        <!-- AI助手图标 -->
        <div class="hewa-bubble-icon">
          <svg viewBox="0 0 24 24" class="ai-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>

        <!-- 脉冲效果 -->
        <div class="hewa-bubble-pulse" />
      </div>
    </el-badge>

    <!-- HeWa风格聊天面板 -->
    <transition name="hewa-chat-panel">
      <div
        v-if="isExpanded"
        v-click-outside="closeChatPanel"
        class="hewa-chat-panel-container"
      >
        <hewa-chat-panel
          :messages="messages"
          :is-loading="isLoading"
          :is-typing="isTyping"
          :user-info="userInfo"
          :quick-questions="quickQuestions"
          @send-message="handleSendMessage"
          @close="closeChatPanel"
          @switch-human="handleSwitchToHuman"
          @feedback="handleFeedback"
          @quick-question="handleQuickQuestion"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import HeWaChatPanel from '../HeWaChatPanel/HeWaChatPanel.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'HeWaChatBubble',

  // 点击外部关闭指令
  directives: {
    'click-outside': {
      bind (el, binding) {
        el.clickOutsideEvent = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value()
          }
        }
        document.addEventListener('click', el.clickOutsideEvent)
      },
      unbind (el) {
        document.removeEventListener('click', el.clickOutsideEvent)
      }
    }
  },

  components: {
    HeWaChatPanel
  },

  data () {
    return {
      isExpanded: false,
      unreadCount: 0,
      isLoading: false,
      isTyping: false,
      messages: [],
      sessionId: null,

      // HeWa AI助手配置
      aiAssistant: {
        name: 'HeWa智能助手',
        avatar: '/static/images/hewa-avatar.png',
        role: 'SCM业务专家',
        status: 'online'
      },

      // 快捷问题列表
      quickQuestions: [
        '如何创建采购订单？',
        '库存不足怎么处理？',
        '如何设置供应商信息？',
        '出库流程是什么？',
        '如何查看库存报表？',
        '采购审批流程说明'
      ]
    }
  },

  computed: {
    ...mapGetters(['userInfo']),

    // 用户信息
    currentUser () {
      return this.userInfo || {
        name: '用户',
        avatar: ''
      }
    }
  },

  created () {
    this.initializeChat()
  },

  mounted () {
    console.log('✅ HeWa聊天组件加载成功!')
    this.startPulseEffect()
  },

  methods: {
    // 初始化聊天
    initializeChat () {
      this.sessionId = this.generateSessionId()
      this.addWelcomeMessage()
    },

    // 生成会话ID
    generateSessionId () {
      return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },

    // 添加欢迎消息
    addWelcomeMessage () {
      const welcomeMessage = {
        id: 'welcome_' + Date.now(),
        type: 'ai',
        content: `你好${this.currentUser.name}！我是HeWa智能助手，专注于SCM供应链管理。有什么可以帮助您的吗？`,
        timestamp: Date.now(),
        avatar: this.aiAssistant.avatar,
        sender: this.aiAssistant
      }
      this.messages.push(welcomeMessage)
    },

    // 切换聊天面板
    toggleChatPanel () {
      console.log('=== HeWa聊天面板切换 ===')
      this.isExpanded = !this.isExpanded

      if (this.isExpanded) {
        this.unreadCount = 0
        this.trackUserAction('chat_panel_opened')
      } else {
        this.trackUserAction('chat_panel_closed')
      }
    },

    // 关闭聊天面板
    closeChatPanel () {
      this.isExpanded = false
      this.trackUserAction('chat_panel_closed_outside')
    },

    // 处理发送消息
    async handleSendMessage (messageContent) {
      console.log('=== 发送消息 ===', messageContent)

      // 添加用户消息
      const userMessage = {
        id: 'user_' + Date.now(),
        type: 'user',
        content: messageContent,
        timestamp: Date.now(),
        sender: this.currentUser
      }
      this.messages.push(userMessage)

      // 显示输入状态
      this.isTyping = true
      this.isLoading = true

      try {
        // 调用AI服务获取回复
        const aiResponse = await this.getAIResponse(messageContent)

        // 添加AI回复
        const aiMessage = {
          id: 'ai_' + Date.now(),
          type: 'ai',
          content: aiResponse.content,
          timestamp: Date.now(),
          avatar: this.aiAssistant.avatar,
          sender: this.aiAssistant,
          steps: aiResponse.steps || null,
          actions: aiResponse.actions || null
        }

        // 模拟打字效果
        setTimeout(() => {
          this.isTyping = false
          this.messages.push(aiMessage)
          this.isLoading = false
        }, 1500)
      } catch (error) {
        console.error('AI回复失败:', error)
        this.handleErrorResponse()
      }

      this.trackUserAction('message_sent', { content: messageContent })
    },

    // 处理快捷问题点击
    handleQuickQuestion (question) {
      this.handleSendMessage(question)
      this.trackUserAction('quick_question_clicked', { question })
    },

    // 获取AI回复
    async getAIResponse (userMessage) {
      // 这里应该调用实际的AI服务
      // 临时模拟响应
      return {
        content: `关于"${userMessage}"的问题，我为您查找到以下信息：\n\n根据SCM系统的操作流程，建议您按照以下步骤进行操作...`,
        steps: [
          '登录SCM系统',
          '进入相应业务模块',
          '按照提示完成操作',
          '保存并提交'
        ],
        actions: [
          { text: '查看详细教程', action: 'show_tutorial' },
          { text: '联系技术支持', action: 'contact_support' }
        ]
      }
    },

    // 处理错误响应
    handleErrorResponse () {
      this.isTyping = false
      this.isLoading = false

      const errorMessage = {
        id: 'error_' + Date.now(),
        type: 'ai',
        content: '抱歉，我暂时无法处理您的请求。请稍后再试或联系人工客服。',
        timestamp: Date.now(),
        avatar: this.aiAssistant.avatar,
        sender: this.aiAssistant,
        isError: true
      }
      this.messages.push(errorMessage)
    },

    // 切换到人工客服
    handleSwitchToHuman () {
      const humanMessage = {
        id: 'human_' + Date.now(),
        type: 'system',
        content: '正在为您转接人工客服，请稍候...',
        timestamp: Date.now()
      }
      this.messages.push(humanMessage)

      this.trackUserAction('switch_to_human')

      // 这里应该调用人工客服接口
      setTimeout(() => {
        const agentMessage = {
          id: 'agent_' + Date.now(),
          type: 'agent',
          content: '您好，我是人工客服小王，很高兴为您服务！',
          timestamp: Date.now(),
          avatar: '/static/images/agent-avatar.png',
          sender: {
            name: '客服小王',
            role: '人工客服'
          }
        }
        this.messages.push(agentMessage)
      }, 2000)
    },

    // 处理用户反馈
    handleFeedback (feedback) {
      console.log('用户反馈:', feedback)
      this.trackUserAction('user_feedback', feedback)

      this.$message.success('感谢您的反馈，我们会持续改进！')
    },

    // 启动脉冲效果
    startPulseEffect () {
      // 每隔几秒显示脉冲效果，提醒用户可以使用AI助手
      setInterval(() => {
        if (!this.isExpanded && this.unreadCount === 0) {
          const bubble = this.$el.querySelector('.hewa-bubble-pulse')
          if (bubble) {
            bubble.style.animation = 'none'
            setTimeout(() => {
              bubble.style.animation = 'hewa-pulse 2s ease-out'
            }, 10)
          }
        }
      }, 15000)
    },

    // 用户行为跟踪
    trackUserAction (action, data = {}) {
      console.log('用户行为跟踪:', action, data)
      // 这里可以集成数据分析服务
    }
  }
}
</script>

<style scoped>
/* HeWa聊天气泡样式 */
.hewa-chat-bubble-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.hewa-chat-bubble-badge {
  display: inline-block;
}

.hewa-chat-bubble {
  position: relative;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  overflow: hidden;
}

.hewa-chat-bubble:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.hewa-chat-bubble--expanded {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: scale(1.05);
}

.hewa-bubble-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.ai-icon {
  width: 28px;
  height: 28px;
  fill: white;
  transition: all 0.3s ease;
}

.hewa-chat-bubble--expanded .ai-icon {
  transform: rotate(180deg) scale(1.1);
}

/* 脉冲效果 */
.hewa-bubble-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
  z-index: 1;
}

@keyframes hewa-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

/* 聊天面板容器 */
.hewa-chat-panel-container {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 400px;
  height: 580px;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

/* 过渡动画 */
.hewa-chat-panel-enter-active,
.hewa-chat-panel-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: bottom right;
}

.hewa-chat-panel-enter,
.hewa-chat-panel-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(30px) rotateX(-10deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hewa-chat-bubble-wrapper {
    bottom: 15px;
    right: 15px;
  }

  .hewa-chat-bubble {
    width: 56px;
    height: 56px;
  }

  .ai-icon {
    width: 24px;
    height: 24px;
  }

  .hewa-chat-panel-container {
    width: calc(100vw - 30px);
    height: 75vh;
    right: -15px;
    bottom: 75px;
    border-radius: 16px;
  }
}

/* Badge样式调整 */
.hewa-chat-bubble-badge >>> .el-badge__content {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: 2px solid white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}
</style>
