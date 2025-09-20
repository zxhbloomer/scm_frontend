<template>
  <div class="simple-chat-bubble">
    <div class="bubble-test" @click="testClick">
      <span>聊天测试</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleChatBubble',
  data () {
    return {
      testMessage: 'Chat component loaded!'
    }
  },
  mounted () {
    console.log('SimpleChatBubble mounted successfully!')
  },
  methods: {
    testClick () {
      alert('ChatBubble点击测试成功！')
      console.log('ChatBubble clicked!')
    }
  }
}
</script>

<style scoped>
.simple-chat-bubble {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.bubble-test {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.bubble-test:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}
</style>
