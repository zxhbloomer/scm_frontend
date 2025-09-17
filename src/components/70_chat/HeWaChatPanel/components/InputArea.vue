<template>
  <div class="hewa-input-area">

    <!-- 完全按照chatwoot设计的输入区域 -->
    <div
      class="chatwoot-input-wrap"
      :class="{ 'focused': isInputFocused }"
    >
      <!-- 输入框 -->
      <el-input
        ref="messageInput"
        v-model="messageText"
        type="textarea"
        :rows="inputRows"
        :maxlength="maxLength"
        placeholder="输入您的消息"
        :disabled="isLoading"
        resize="none"
        class="message-input"
        @keydown.native="handleKeyDown"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        @input="handleInput"
      />

      <!-- 右侧图标按钮 -->
      <div class="input-actions">
        <!-- 附件图标 -->
        <button class="action-btn">
          <i class="el-icon-paperclip" />
        </button>
        <!-- emoji图标 -->
        <button class="action-btn">
          <i class="el-icon-sunny" />
        </button>
      </div>
    </div>

    <!-- 智能提示区域 -->
    <div v-if="showSuggestions && suggestions.length" class="suggestions-area">
      <div class="suggestions-header">
        <i class="el-icon-lightbulb" />
        <span>智能建议</span>
      </div>
      <div class="suggestions-list">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="applySuggestion(suggestion)"
        >
          <i class="el-icon-right" />
          <span>{{ suggestion }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'InputArea',

  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入您的问题...'
    },
    maxLength: {
      type: Number,
      default: 500
    }
  },

  data () {
    return {
      messageText: '',
      inputRows: 1,
      maxRows: 4,
      showSuggestions: false,
      isInputFocused: false,

      // 智能建议
      suggestions: [],

      // 输入建议的关键词映射
      suggestionKeywords: {
        '采购': ['如何创建采购订单？', '采购审批流程是什么？', '供应商管理在哪里？'],
        '库存': ['库存不足怎么处理？', '如何查看库存报表？', '库存盘点怎么做？'],
        '出库': ['出库流程是什么？', '如何打印出库单？', '出库审批权限设置'],
        '入库': ['入库单如何创建？', '质检流程说明', '入库异常处理方法']
      }
    }
  },

  computed: {
    hasContent () {
      return this.messageText.trim().length > 0
    },

    canSend () {
      return this.hasContent && !this.isLoading
    }
  },

  watch: {
    messageText (newVal) {
      this.adjustTextareaHeight()
      this.updateSuggestions(newVal)
    },

    isLoading (newVal) {
      if (!newVal) {
        // 当加载完成时，聚焦到输入框
        this.$nextTick(() => {
          this.focusInput()
        })
      }
    }
  },

  mounted () {
    this.focusInput()
  },

  methods: {
    // 处理键盘事件
    handleKeyDown (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.handleSendMessage()
      } else if (event.key === 'Enter' && event.shiftKey) {
        // Shift+Enter 换行，由浏览器默认处理
      }
    },

    // 处理输入事件
    handleInput () {
      this.adjustTextareaHeight()
    },

    // 调整输入框高度
    adjustTextareaHeight () {
      this.$nextTick(() => {
        const textarea = this.$refs.messageInput.$el.querySelector('textarea')
        if (textarea) {
          textarea.style.height = 'auto'
          const scrollHeight = textarea.scrollHeight
          const lineHeight = 20 // 假设行高为20px
          const newRows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), 1), this.maxRows)
          this.inputRows = newRows
          textarea.style.height = scrollHeight + 'px'
        }
      })
    },

    // 处理输入框焦点
    handleInputFocus () {
      this.isInputFocused = true
    },

    handleInputBlur () {
      this.isInputFocused = false
      // 延迟隐藏建议，防止点击建议时失焦
      setTimeout(() => {
        if (!this.isInputFocused) {
          this.showSuggestions = false
        }
      }, 200)
    },

    // 聚焦输入框
    focusInput () {
      if (this.$refs.messageInput) {
        this.$refs.messageInput.focus()
      }
    },

    // 发送消息
    handleSendMessage () {
      if (!this.canSend) return

      const message = this.messageText.trim()
      this.messageText = ''
      this.inputRows = 1
      this.showSuggestions = false

      this.$emit('send-message', message)

      // 重新聚焦输入框
      this.$nextTick(() => {
        this.focusInput()
      })
    },

    // 更新智能建议
    updateSuggestions (text) {
      if (!text || text.length < 2) {
        this.suggestions = []
        this.showSuggestions = false
        return
      }

      const newSuggestions = []

      // 根据关键词匹配建议
      Object.keys(this.suggestionKeywords).forEach(keyword => {
        if (text.includes(keyword)) {
          newSuggestions.push(...this.suggestionKeywords[keyword])
        }
      })

      // 通用建议
      if (newSuggestions.length === 0) {
        const genericSuggestions = [
          '如何操作？',
          '有什么注意事项吗？',
          '能详细说明一下吗？'
        ]
        newSuggestions.push(...genericSuggestions)
      }

      this.suggestions = [...new Set(newSuggestions)].slice(0, 3)
      this.showSuggestions = this.suggestions.length > 0 && this.isInputFocused
    },

    // 应用建议
    applySuggestion (suggestion) {
      this.messageText = suggestion
      this.showSuggestions = false
      this.focusInput()
    }
  }
}
</script>

<style scoped>
.hewa-input-area {
  background: white;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
}

/* 完全按照chatwoot真实Vue代码的样式 */
/* 主容器: items-center flex ltr:pl-3 rtl:pr-3 ltr:pr-2 rtl:pl-2 rounded-[7px] transition-all duration-200 bg-n-background !shadow-[0_0_0_1px,0_0_2px_3px] */
.chatwoot-input-wrap {
  display: flex;
  align-items: center;
  padding-left: 12px; /* ltr:pl-3 */
  padding-right: 8px;  /* ltr:pr-2 */
  border-radius: 7px;  /* rounded-[7px] */
  transition: all 200ms ease; /* transition-all duration-200 */
  background: #ffffff; /* bg-n-background */
  /* !shadow-[0_0_0_1px,0_0_2px_3px] !shadow-n-strong */
  box-shadow: 0 0 0 1px #64748b, 0 0 2px 3px rgba(100, 116, 139, 0.1);
}

/* 聚焦状态: !shadow-n-brand dark:!shadow-n-brand */
.chatwoot-input-wrap.focused {
  box-shadow: 0 0 0 1px #3b82f6, 0 0 2px 3px rgba(59, 130, 246, 0.1);
}

/* 输入框: user-message-input reset-base */
/* @apply border-none outline-none w-full placeholder:text-n-slate-10 resize-none h-8 min-h-8 max-h-60 py-1 px-0 my-2 bg-n-background text-n-slate-12 transition-all duration-200 */
.message-input {
  width: 100%; /* w-full */
  border: none; /* border-none */
}

.message-input >>> .el-textarea__inner {
  border: none;          /* border-none */
  outline: none;         /* outline-none */
  background: transparent; /* bg-n-background */
  resize: none;          /* resize-none */
  height: 32px;          /* h-8 */
  min-height: 32px;      /* min-h-8 */
  max-height: 240px;     /* max-h-60 */
  padding: 4px 0;        /* py-1 px-0 */
  margin: 8px 0;         /* my-2 */
  color: #0f172a;        /* text-n-slate-12 */
  transition: all 200ms ease; /* transition-all duration-200 */
  font-size: 14px;
  line-height: 1.5;
  box-shadow: none;
}

.message-input >>> .el-textarea__inner::placeholder {
  color: #64748b; /* placeholder:text-n-slate-10 */
}

.message-input >>> .el-textarea__inner:focus {
  border: none;
  box-shadow: none;
  background: transparent;
}

.message-input >>> .el-textarea__inner:disabled {
  background: transparent;
  color: #64748b;
}

/* 按钮容器: flex items-center ltr:pl-2 rtl:pr-2 */
.input-actions {
  display: flex;
  align-items: center;
  padding-left: 8px; /* ltr:pl-2 */
}

/* 按钮: flex items-center justify-center min-h-8 min-w-8 */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px; /* min-h-8 */
  min-width: 32px;  /* min-w-8 */
  border: none;
  background: transparent;
  color: #0f172a; /* text-n-slate-12 */
  cursor: pointer;
  transition: all 150ms ease; /* transition-all duration-150 */
  font-size: 16px;
  border-radius: 4px;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.action-btn:active {
  transform: scale(0.95);
}

/* 智能建议区域 */
.suggestions-area {
  background: rgba(102, 126, 234, 0.02);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  padding: 12px 16px;
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 8px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: white;
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.03) 100%);
  border-color: #667eea;
  color: #667eea;
  transform: translateX(4px);
}

.suggestion-item i {
  color: #667eea;
  font-size: 12px;
}

/* 过渡动画 */

/* 响应式调整 - 按照chatwoot风格 */
@media (max-width: 480px) {
  .chatwoot-input-wrap {
    padding: 6px 10px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .message-input >>> .el-textarea__inner {
    padding: 6px 0;
    font-size: 13px;
    min-height: 20px;
  }

  .input-actions {
    gap: 2px;
    margin-left: 6px;
  }
}
</style>
