// 聊天组件通用混入
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState('chat', {
      chatMessages: 'messages',
      chatUnreadCount: 'unreadCount',
      isChatLoading: 'isLoading',
      isChatTyping: 'isTyping',
      chatSessionId: 'sessionId',
      chatUserInfo: 'userInfo'
    }),

    ...mapGetters('chat', {
      chatConnectionStatus: 'connectionStatus',
      chatLatestMessages: 'latestMessages',
      chatUnreadMessages: 'unreadMessages',
      hasActiveChatSession: 'hasActiveSession'
    })
  },

  methods: {
    ...mapActions('chat', {
      initializeChatModule: 'initializeChat',
      sendChatMessage: 'sendMessage',
      markChatAsRead: 'markAsRead',
      setChatUserInfo: 'setUserInfo',
      endChatSession: 'endSession',
      connectChatWebSocket: 'connectWebSocket',
      disconnectChatWebSocket: 'disconnectWebSocket'
    }),

    // 通用消息处理方法
    handleChatMessageSend (content) {
      if (!content || !content.trim()) {
        this.$message.warning('请输入消息内容')
        return
      }

      this.sendChatMessage(content.trim()).catch(error => {
        this.$message.error('消息发送失败: ' + error.message)
      })
    },

    // 初始化聊天用户信息
    initChatUserInfo () {
      // 从当前登录用户获取信息
      const userInfo = this.$store.state.user || {}

      this.setChatUserInfo({
        userId: userInfo.id || null,
        userName: userInfo.name || userInfo.username || '访客',
        userEmail: userInfo.email || null
      })
    },

    // 格式化聊天时间
    formatChatTime (timestamp) {
      if (!timestamp) return ''

      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date

      // 1分钟内
      if (diff < 60000) {
        return '刚刚'
      }

      // 1小时内
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      }

      // 今天
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // 其他日期
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 检查聊天连接状态
    checkChatConnection () {
      if (!this.chatConnectionStatus.isConnected) {
        this.$message.warning('聊天服务连接中断，正在重新连接...')
        this.connectChatWebSocket()
      }
    },

    // 显示聊天通知
    showChatNotification (message) {
      // 检查浏览器通知权限
      if (Notification.permission === 'granted') {
        new Notification('新消息', {
          body: message.content,
          icon: '/favicon.ico',
          tag: 'chat-message'
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.showChatNotification(message)
          }
        })
      }

      // Element UI消息提示
      this.$message({
        message: `客服回复: ${message.content}`,
        type: 'info',
        duration: 3000,
        showClose: true
      })
    }
  },

  // 组件创建时初始化用户信息
  created () {
    this.initChatUserInfo()
  },

  // 监听新消息
  watch: {
    chatMessages: {
      handler (newMessages, oldMessages) {
        if (oldMessages && newMessages.length > oldMessages.length) {
          const latestMessage = newMessages[newMessages.length - 1]

          // 如果是客服消息且组件不在焦点状态，显示通知
          if (latestMessage.type === 'agent' && !this.isChatPanelVisible) {
            this.showChatNotification(latestMessage)
          }
        }
      },
      deep: true
    }
  },

  // 组件销毁时清理
  beforeDestroy () {
    // 子组件可以重写此方法来添加特定的清理逻辑
  }
}
