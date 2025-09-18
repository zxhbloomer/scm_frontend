<template>
  <transition name="feedback-panel">
    <div v-if="visible" class="hewa-feedback-panel">
      <div class="feedback-overlay" @click="closeFeedback" />

      <div class="feedback-content">
        <!-- 头部 -->
        <div class="feedback-header">
          <div class="header-title">
            <i class="el-icon-chat-dot-round" />
            <span>反馈此回答</span>
          </div>
          <el-button
            type="text"
            icon="el-icon-close"
            class="close-btn"
            @click="closeFeedback"
          />
        </div>

        <!-- 反馈类型选择 -->
        <div class="feedback-section">
          <div class="section-title">请选择反馈类型</div>
          <div class="feedback-types">
            <div
              v-for="type in feedbackTypes"
              :key="type.key"
              class="feedback-type"
              :class="{ 'selected': selectedType === type.key }"
              @click="selectType(type.key)"
            >
              <div class="type-icon" :class="type.iconClass">
                <i :class="type.icon" />
              </div>
              <div class="type-info">
                <div class="type-name">{{ type.name }}</div>
                <div class="type-desc">{{ type.description }}</div>
              </div>
              <div class="type-check">
                <i class="el-icon-check" />
              </div>
            </div>
          </div>
        </div>

        <!-- 具体问题选择 -->
        <div v-if="selectedType" class="feedback-section">
          <div class="section-title">具体问题（可多选）</div>
          <div class="problem-list">
            <el-checkbox-group v-model="selectedProblems">
              <el-checkbox
                v-for="problem in currentProblems"
                :key="problem.key"
                :label="problem.key"
                class="problem-checkbox"
              >
                {{ problem.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- 详细描述 -->
        <div v-if="selectedType" class="feedback-section">
          <div class="section-title">
            详细描述
            <span class="optional-text">（选填）</span>
          </div>
          <el-input
            v-model="feedbackDetail"
            type="textarea"
            :rows="3"
            :maxlength="200"
            placeholder="请详细描述您遇到的问题或建议..."
            show-word-limit
            class="feedback-textarea"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="feedback-actions">
          <el-button
            type="default"
            size="medium"
            @click="closeFeedback"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            size="medium"
            :disabled="!canSubmit"
            :loading="isSubmitting"
            @click="submitFeedback"
          >
            提交反馈
          </el-button>
        </div>

        <!-- 感谢信息 -->
        <div v-if="showThanks" class="thanks-message">
          <div class="thanks-icon">
            <i class="el-icon-success" />
          </div>
          <div class="thanks-text">
            <div class="thanks-title">感谢您的反馈！</div>
            <div class="thanks-desc">您的建议对我们很重要，我们会持续改进</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'FeedbackPanel',

  props: {
    message: {
      type: Object,
      default: null
    },
    visible: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      selectedType: '',
      selectedProblems: [],
      feedbackDetail: '',
      isSubmitting: false,
      showThanks: false,

      // 反馈类型定义
      feedbackTypes: [
        {
          key: 'helpful',
          name: '很有帮助',
          description: '回答准确，解决了我的问题',
          icon: 'el-icon-thumb',
          iconClass: 'positive'
        },
        {
          key: 'partially',
          name: '部分有用',
          description: '有一定帮助，但不够完整',
          icon: 'el-icon-warning',
          iconClass: 'neutral'
        },
        {
          key: 'unhelpful',
          name: '没有帮助',
          description: '回答不准确或无关',
          icon: 'el-icon-close',
          iconClass: 'negative'
        }
      ],

      // 问题分类
      problemCategories: {
        helpful: [
          { key: 'accurate', name: '信息准确' },
          { key: 'comprehensive', name: '内容全面' },
          { key: 'clear', name: '表达清晰' },
          { key: 'actionable', name: '操作性强' }
        ],
        partially: [
          { key: 'incomplete', name: '信息不完整' },
          { key: 'unclear', name: '表达不够清晰' },
          { key: 'outdated', name: '信息过时' },
          { key: 'missing_details', name: '缺少操作细节' }
        ],
        unhelpful: [
          { key: 'incorrect', name: '信息错误' },
          { key: 'irrelevant', name: '与问题无关' },
          { key: 'confusing', name: '令人困惑' },
          { key: 'too_generic', name: '过于泛泛而谈' }
        ]
      }
    }
  },

  computed: {
    currentProblems () {
      return this.problemCategories[this.selectedType] || []
    },

    canSubmit () {
      return this.selectedType && !this.isSubmitting
    }
  },

  watch: {
    visible (newVal) {
      if (newVal) {
        this.resetForm()
      }
    },

    selectedType () {
      // 切换类型时清空已选问题
      this.selectedProblems = []
    }
  },

  methods: {
    selectType (type) {
      this.selectedType = type
    },

    resetForm () {
      this.selectedType = ''
      this.selectedProblems = []
      this.feedbackDetail = ''
      this.isSubmitting = false
      this.showThanks = false
    },

    async submitFeedback () {
      if (!this.canSubmit) return

      this.isSubmitting = true

      const feedbackData = {
        messageId: this.message?.id,
        type: this.selectedType,
        problems: this.selectedProblems,
        detail: this.feedbackDetail,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }

      try {
        // 模拟提交反馈
        await this.sendFeedbackToServer(feedbackData)

        // 显示感谢信息
        this.showThanks = true

        // 2秒后关闭面板
        setTimeout(() => {
          this.closeFeedback()
        }, 2000)

        // 触发反馈事件
        this.$emit('feedback', feedbackData)
      } catch (error) {
        console.error('提交反馈失败:', error)
        this.$message.error('提交失败，请稍后重试')
      } finally {
        this.isSubmitting = false
      }
    },

    async sendFeedbackToServer (feedbackData) {
      // 这里应该调用实际的反馈接口
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('反馈数据:', feedbackData)
          resolve({ success: true })
        }, 1000)
      })
    },

    closeFeedback () {
      this.$emit('close-feedback')
    }
  }
}
</script>

<style scoped>
.hewa-feedback-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

.feedback-content {
  position: relative;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 头部 */
.feedback-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  color: white;
  font-size: 18px;
  padding: 4px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 反馈区域 */
.feedback-section {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
}

.feedback-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.optional-text {
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}

/* 反馈类型 */
.feedback-types {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feedback-type {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.feedback-type:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.feedback-type.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  transition: all 0.3s ease;
}

.type-icon.positive {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.type-icon.neutral {
  background: linear-gradient(135deg, #e6a23c 0%, #f0a020 100%);
}

.type-icon.negative {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.type-info {
  flex: 1;
}

.type-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.type-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.type-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.feedback-type.selected .type-check {
  opacity: 1;
  transform: scale(1);
}

/* 问题列表 */
.problem-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.problem-checkbox {
  margin: 0;
  padding: 8px 0;
}

.problem-checkbox >>> .el-checkbox__label {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.problem-checkbox >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #667eea;
  border-color: #667eea;
}

/* 文本域 */
.feedback-textarea >>> .el-textarea__inner {
  border-radius: 8px;
  border-color: #dcdfe6;
  font-size: 13px;
  line-height: 1.5;
}

.feedback-textarea >>> .el-textarea__inner:focus {
  border-color: #667eea;
}

/* 操作按钮 */
.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  background: #f8fafc;
}

.feedback-actions .el-button {
  min-width: 80px;
  border-radius: 8px;
}

.feedback-actions .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.feedback-actions .el-button--primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* 感谢信息 */
.thanks-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(133, 206, 97, 0.05) 100%);
  border-top: 1px solid rgba(103, 194, 58, 0.2);
  animation: thanksFadeIn 0.5s ease-out;
}

@keyframes thanksFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.thanks-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.thanks-text {
  flex: 1;
}

.thanks-title {
  font-size: 16px;
  font-weight: 600;
  color: #67c23a;
  margin-bottom: 4px;
}

.thanks-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

/* 过渡动画 */
.feedback-panel-enter-active,
.feedback-panel-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.feedback-panel-enter,
.feedback-panel-leave-to {
  opacity: 0;
}

.feedback-panel-enter .feedback-content,
.feedback-panel-leave-to .feedback-content {
  transform: translateY(50px) scale(0.9);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .feedback-content {
    width: 95%;
    margin: 20px;
    max-height: calc(100vh - 40px);
  }

  .feedback-header {
    padding: 16px 20px;
  }

  .feedback-section {
    padding: 16px 20px;
  }

  .feedback-actions {
    padding: 16px 20px;
  }

  .feedback-type {
    padding: 10px 12px;
  }

  .type-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .type-name {
    font-size: 13px;
  }

  .type-desc {
    font-size: 11px;
  }

  .thanks-message {
    padding: 16px 20px;
  }

  .thanks-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}
</style>
