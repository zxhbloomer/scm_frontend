<template>
  <div class="hewa-welcome-area">
    <!-- 欢迎消息 -->
    <div class="welcome-message">
      <div class="welcome-icon">
        <svg viewBox="0 0 24 24" class="sparkle-icon">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      <div class="welcome-content">
        <h3 class="welcome-title">
          你好{{ userName ? '，' + userName : '' }}！👋
        </h3>
        <p class="welcome-subtitle">
          我是HeWa智能助手，专注于SCM供应链管理。
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
</template>

<script>
export default {
  name: 'WelcomeArea',

  props: {
    quickQuestions: {
      type: Array,
      default: () => []
    },
    userName: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
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
      }
    }
  },

  mounted () {
    this.initializeQuestions()
  },

  watch: {
    quickQuestions: {
      handler () {
        this.initializeQuestions()
      },
      immediate: true
    }
  },

  methods: {
    initializeQuestions() {
      // 随机选择6个问题显示
      const shuffled = [...this.quickQuestions].sort(() => 0.5 - Math.random())
      this.displayQuestions = shuffled.slice(0, 6)
    },

    refreshQuestions() {
      // 重新随机选择问题
      this.initializeQuestions()
      this.$message.success('已为您更新推荐问题')
    },

    selectQuestion(question) {
      console.log('选择问题:', question)
      this.$emit('quick-question', question)
    },

    getQuestionIcon(question) {
      // 根据问题内容返回对应图标
      for (const [keyword, icon] of Object.entries(this.questionIcons)) {
        if (question.includes(keyword)) {
          return icon
        }
      }
      return 'el-icon-chat-dot-round'
    }
  }
}
</script>

<style scoped>
.hewa-welcome-area {
  padding: 24px 20px;
  background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
}

/* 欢迎消息 */
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

/* 快捷问题区域 */
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

/* 功能介绍 */
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

/* 底部提示 */
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

/* 过渡动画 */
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

/* 响应式调整 */
@media (max-width: 480px) {
  .hewa-welcome-area {
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

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .hewa-welcome-area {
    background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .welcome-title {
    color: #ffffff;
  }

  .welcome-subtitle {
    color: #b0b0b0;
  }

  .question-card {
    background: #333333;
    border-color: #444444;
    color: #ffffff;
  }

  .question-text {
    color: #ffffff;
  }
}
</style>
