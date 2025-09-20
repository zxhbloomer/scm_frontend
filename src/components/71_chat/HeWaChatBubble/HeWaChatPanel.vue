<!--
  HeWa智能助手聊天面板 - 严格按照HeWa原始代码结构
-->
<template>
  <div class="pm_assistant">
    <div class="pm_assistant_body">
      <!-- 初始问题区域 - 严格按照HeWa结构 -->
      <div v-if="!hasConversation" class="pm_assistant_init_questions">
        <div class="pm_assistant_init_questions_content">
          <div class="pm_assistant_init_questions_content_title">猜你想问</div>
          <div class="pm_assistant_init_questions_content_list">
            <div
              v-for="(question, index) in quickQuestions"
              :key="index"
              class="pm_assistant_init_questions_content_list_item"
              @click="handleQuickQuestion(question)"
            >
              <div class="pm_assistant_init_questions_content_list_item_index">{{ index + 1 }} </div>
              <div class="pm_assistant_init_questions_content_list_item_content">{{ question }} </div>
              <div class="pm_assistant_init_questions_content_list_item_icon">
                <div class="ai_icon" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话历史区域 -->
      <div v-if="hasConversation" class="conversation-history">
        <div v-for="message in messages" :key="message.id" class="message-item">
          <div v-if="message.type === 'user'" class="user-message">
            {{ message.content }}
          </div>
          <div v-else class="ai-message">
            <div class="ai-content">{{ message.content }}</div>
            <div class="message-actions">
              <div class="btn_line_left">
                <div class="good_btn" @click="handleLike(message)">
                  <span>👍</span>
                </div>
                <div class="bad_btn" @click="handleDislike(message)">
                  <span>👎</span>
                </div>
                <div class="btn_line_deliver" />
                <div class="re_answer" @click="handleRegenerate(message)">
                  <span>重新回答</span>
                </div>
              </div>
              <div class="btn_line_right">
                <div class="copy_answer_btn" @click="handleCopy(message)">
                  <span>复制</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="height: 24px;" />
      </div>

      <!-- 新对话分割线 - 严格按照HeWa结构 -->
      <div v-if="hasConversation" class="history_conversation_new">
        <div class="history_conversation_new_line" />
        <div class="history_conversation_new_text">以下是新对话</div>
        <div class="history_conversation_new_line" />
      </div>
    </div>

    <!-- HeWa严格按照原始结构的底部 -->
    <div class="pm_assistant_foot">
      <div class="foot_top">
        <div class="foot_top_item" @click="handleFeedback">
          <div class="foot_top_item_icon1" />
          <div class="foot_top_item_text">吐槽/夸夸</div>
        </div>
        <div class="foot_top_item" @click="handleHumanService">
          <div class="foot_top_item_icon2" />
          <div class="foot_top_item_text">人工</div>
        </div>
      </div>
      <div class="pm_assistant_foot_to_bottom">
        <span>⬇</span>
      </div>
      <div class="foot_content">
        <div class="foot_input el-textarea">
          <textarea
            v-model="inputText"
            autocomplete="off"
            placeholder="输入供应链问题，HeWa将用AI模型回答哦～"
            class="el-textarea__inner"
            style="resize: none; min-height: 24px; height: 24px;"
            @keyup.enter="handleSend"
          />
        </div>
        <div class="foot_send_icon" @click="handleSend">
          <span>发送</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeWaChatPanel',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      inputText: '',
      // SCM业务场景的快捷问题
      quickQuestions: [
        '如何创建采购订单？',
        '库存不足怎么处理？',
        '怎么查看出库记录？',
        '如何生成库存报表？',
        '审批流程如何操作？',
        '商品调拨怎么办理？'
      ]
    }
  },
  computed: {
    hasConversation () {
      return this.messages && this.messages.length > 0
    }
  },
  methods: {
    handleQuickQuestion (question) {
      this.$emit('send-message', question)
    },

    handleSend () {
      if (!this.inputText.trim()) return

      this.$emit('send-message', this.inputText.trim())
      this.inputText = ''
    },

    handleLike (message) {
      this.$emit('message-action', { action: 'like', message })
    },

    handleDislike (message) {
      this.$emit('message-action', { action: 'dislike', message })
    },

    handleRegenerate (message) {
      this.$emit('message-action', { action: 'regenerate', message })
    },

    handleCopy (message) {
      navigator.clipboard.writeText(message.content)
      this.$message.success('已复制到剪贴板')
    },

    handleFeedback () {
      this.$emit('feedback')
    },

    handleHumanService () {
      this.$emit('switch-human')
    },

    handleClose () {
      this.$emit('close')
    }
  }
}
</script>

<style>
/* HeWa对话框严格按照原始CSS样式 */
.pm_assistant {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pm_assistant_body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 初始问题区域 */
.pm_assistant_init_questions {
  margin-bottom: 20px;
}

.pm_assistant_init_questions_content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.pm_assistant_init_questions_content_title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.pm_assistant_init_questions_content_list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pm_assistant_init_questions_content_list_item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pm_assistant_init_questions_content_list_item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.pm_assistant_init_questions_content_list_item_index {
  font-weight: 600;
  color: #409eff;
  margin-right: 8px;
  min-width: 20px;
}

.pm_assistant_init_questions_content_list_item_content {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.pm_assistant_init_questions_content_list_item_icon {
  margin-left: 8px;
}

.ai_icon {
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.ai_icon::before {
  content: "AI";
}

/* 对话历史区域 */
.conversation-history {
  margin-bottom: 20px;
}

.message-item {
  margin-bottom: 16px;
}

.user-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 18px 18px 6px 18px;
  margin-left: 20%;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
}

.ai-message {
  margin-right: 20%;
}

.ai-content {
  background: rgba(255, 255, 255, 0.9);
  color: #303133;
  padding: 12px 16px;
  border-radius: 6px 18px 18px 18px;
  margin-bottom: 8px;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.message-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.btn_line_left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn_line_right {
  display: flex;
  align-items: center;
}

.good_btn, .bad_btn, .copy_answer_btn {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #606266;
  transition: all 0.3s ease;
}

.good_btn:hover, .bad_btn:hover, .copy_answer_btn:hover {
  background: rgba(255, 255, 255, 0.9);
}

.btn_line_deliver {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.6);
  margin: 0 8px;
}

.re_answer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #606266;
  transition: all 0.3s ease;
}

.re_answer:hover {
  background: rgba(255, 255, 255, 0.9);
}

/* 新对话分割线 */
.history_conversation_new {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.history_conversation_new_line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.history_conversation_new_text {
  padding: 0 16px;
  font-size: 12px;
  color: #909399;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

/* 底部区域 */
.pm_assistant_foot {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 20px;
}

.foot_top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.foot_top_item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #606266;
  transition: all 0.3s ease;
}

.foot_top_item:hover {
  background: rgba(255, 255, 255, 0.9);
}

.foot_top_item_icon1, .foot_top_item_icon2 {
  width: 14px;
  height: 14px;
  background: #409eff;
  border-radius: 50%;
}

.foot_top_item_text {
  font-size: 12px;
}

.pm_assistant_foot_to_bottom {
  text-align: center;
  margin-bottom: 12px;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
}

.foot_content {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.foot_input {
  flex: 1;
}

.foot_input .el-textarea__inner {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
}

.foot_input .el-textarea__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.foot_send_icon {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 60px;
  text-align: center;
}

.foot_send_icon:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
</style>
