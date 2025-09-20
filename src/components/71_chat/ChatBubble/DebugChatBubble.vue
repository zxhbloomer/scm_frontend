<template>
  <div class="chat-bubble-wrapper">
    <div class="debug-info">
      <p>Debug Info:</p>
      <p>Component mounted: {{ isMounted }}</p>
      <p>Store exists: {{ storeExists }}</p>
      <p>Click count: {{ clickCount }}</p>
      <p>Error: {{ errorMsg }}</p>
    </div>

    <!-- 聊天气泡按钮 -->
    <el-badge
      :value="unreadCount"
      :hidden="unreadCount === 0"
      class="chat-bubble-badge"
    >
      <div
        class="chat-bubble"
        :class="{ 'chat-bubble--expanded': isExpanded }"
        @click="debugClick"
      >
        <i class="el-icon-chat-dot-round chat-bubble__icon" />
      </div>
    </el-badge>
  </div>
</template>

<script>
export default {
  name: 'DebugChatBubble',
  data () {
    return {
      isExpanded: false,
      isMounted: false,
      storeExists: false,
      clickCount: 0,
      errorMsg: '',
      unreadCount: 5 // 临时固定值用于测试
    }
  },
  mounted () {
    console.log('=== DebugChatBubble 开始加载 ===')

    try {
      this.isMounted = true
      console.log('✅ 组件已挂载')

      // 检查Vuex store是否存在
      if (this.$store) {
        this.storeExists = true
        console.log('✅ Vuex store 存在')

        // 检查命名空间模块是否存在
        if (this.$store.state.chat) {
          console.log('✅ chat 模块存在')
        } else {
          console.log('❌ chat 模块不存在')
        }
      } else {
        console.log('❌ Vuex store 不存在')
      }

      console.log('✅ DebugChatBubble 加载成功!')
    } catch (error) {
      console.error('❌ DebugChatBubble 加载失败:', error)
      this.errorMsg = error.message
    }
  },
  methods: {
    debugClick () {
      console.log('=== 点击事件触发 ===')
      this.clickCount++
      this.isExpanded = !this.isExpanded

      console.log('点击次数:', this.clickCount)
      console.log('展开状态:', this.isExpanded)

      // 简单的用户反馈
      this.$message({
        message: `调试点击 ${this.clickCount} 次，状态: ${this.isExpanded ? '展开' : '收起'}`,
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.debug-info {
  position: fixed !important;
  top: 10px !important;
  right: 10px !important;
  background: rgba(255, 0, 0, 0.9) !important;
  color: white !important;
  padding: 15px !important;
  border-radius: 5px !important;
  font-size: 14px !important;
  z-index: 99999 !important;
  max-width: 300px !important;
  border: 2px solid #ff0000 !important;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
}

.debug-info p {
  margin: 2px 0;
}

.chat-bubble-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.chat-bubble-badge {
  display: inline-block;
}

.chat-bubble {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  user-select: none;
}

.chat-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.chat-bubble--expanded {
  background: linear-gradient(135deg, #67c23a 0%, #409eff 100%);
}

.chat-bubble__icon {
  color: white;
  font-size: 24px;
  transition: all 0.3s ease;
}

.chat-bubble--expanded .chat-bubble__icon {
  transform: rotate(180deg);
}
</style>
