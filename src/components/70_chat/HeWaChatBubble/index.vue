<!--
  HeWa智能助手聊天入口组件
  基于HeWa对话框样式设计，适配SCM业务场景
-->
<template>
  <div class="hewa-chat-entry">
    <!-- 聊天气泡按钮 (保持现有样式) -->
    <el-badge
      :value="unreadCount"
      :hidden="unreadCount === 0"
      class="chat-bubble-badge"
    >
      <div
        class="chat-bubble"
        :class="{ 'chat-bubble--expanded': isExpanded }"
        @click.stop="toggleChatPanel"
      >
        <i class="el-icon-chat-dot-round chat-bubble__icon" />
      </div>
    </el-badge>

    <!-- HeWa严格按照原始代码的Dialog结构 -->
    <el-dialog
      :visible.sync="isExpanded"
      custom-class="pm_assistant_dialog pm_assistant_inited_dialog"
      width="480px"
      :style="{ marginTop: '10vh', width: '480px', height: '80vh' }"
      :before-close="closeChatPanel"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      :show-close="false"
    >
      <!-- HeWa头部结构 - 使用Element UI的el-dialog__header -->
      <!--      <div slot="title" class="title">-->
      <!--        <div class="title_left">-->
      <!--          <img src="src/assets/images/TX465_06.jpg" alt="" class="title_left_icon">-->
      <!--          <div class="title_left_text">-->
      <!--            <div class="title_left_text_name">-->
      <!--              <span>为人民服务</span>-->
      <!--              <div class="title-right">-->
      <!--                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAAAAXNSR0IArs4c6QAABY5JREFUSEudVmtsVEUU/s6Ze3e3rSAIhBghIE0JGJQoYmJERQwGFOgDMChB+QFIu6WGCPLDBy1EfiA+sNuiJAaiKJFqX8QfIDUqhBgjQkzQaOMzilBseZbu7r0zx8xdlm6XlhYn2b3Zvd98851v5pwzhP8xKiuFj7ZfnOAYPckgcqahJvJZJk1x+YUZxkRmN9W6a/ujp74AJaVnxzG7t/tEY0X8CBu3jUBt2lXTILQIhsayCCCJDZNH5lZVVpJJcxVFkx+QUbPI4cn11fTXtURcJaCoLP6IkLMe4HsAOEICEkIKKBAQhAASgOGdaKgJjUr96h6F5f4hEr4Pgn+MyIa7RvL2TIEWOb+0s4gptPyKgMDWNrNFgAoiUv1ZF7wnGDaJBxtqcw5l4udF4y2M8AzAQFvJ5FVJMrJZOfoJQ+o2Fp0vxI+R4PMrAkpW+tWauTyI+DJ7ijQzuKt3TMhoiDzfXOO+nhZhuQxTecoYAUM6PDinGJhoVVPgJKBJqgLGueWX5pPJqaO00z0WHZAXdptea6ylNRZdvDIxySjnKCBOsHywqF06FYx9klBcQomJNHtVa9gx+a0EGd0z8oEtnEbZYEloU8M2eiEQEU1UCZyXNRjcg8oEMkjM2qZadwvNW5lYRMrZ3W11T/j1yYCQSFVjLW+orAR9d9pfR3A2We4gOBEL+J2AdY01zp7AjcJo1y6Cu9iQ+SUs/jEPKmzABQQuAOi61ZDYQyc7HOmoMJJb5HPkfZsvJDjC5K+4Y4R7LDMjaG65/h1CY9wQ5de/Qb+mI56z+tIt4QQ/rsmNCii/LycMSYdj/H2aHZu2+amEDL7+BqQToPGAAij5aVMsPCebxwqIs1A4ZM7fXbdtyJFswMLVkuMnElGf3Y3KUMTWgKzRwpzY2BmOfJvT5X9I4Hkpw+0nnUEEEe/t5tpQ6VUCCqPGJ4gCyZLGmLOrr0iLSpNTAOdjwxibpeFnkG71IJXDIu6PFy/5XwNqkukBIhiKL9sby3n3KgHFpdIubG4CIdYYU6uudehKlskoP4wWgoxP42wxFjJJJpnZVO0eLC7zpmnGQRJ7fNIqBI7yxn/yVqS1Fwe8Lw3xAwz5887h6tbskpk9Yf4zUuA75huAhmS+c41p9sMXnh7sKXUOuUcBGp0h4HhTDd+eXbKDLJhbnniVxV1jy6Yy8Zn122440F/qFUW7lghC73UvcHnHSc7DnjihvEwOQ/rFvTH3ld54qTjaPtNg6H77UkF/VV/jTO9NafbkwjK/DsQL+hMLyBkGFzTUUHuvAmwTOnY62SpwxwX7Kd7ivbXh3f0RL1x97iYdD/+kOTS8L2zQCShesTeWW90XJtULVnUtZRPaETQK0h3iOfc3vUM/ZE4qrvBmaYMLzTHncNqhhWVnF8Rp0B4G9XKvEGiW/Tkn1aN1daSvKcC6cORfv4XFmW4rGaBblaMfyzy188r1TiX0lIHZxbi0uqFmcGBpYTS+lcStkAwNlyvAcXHo4eatdOpabl5RPuM5GTMoLocgMkrZPk7Upoy/vH5bpDlw6dnkVMdXhyHGMaT+gMSfbKrNPWyTsCSqmzR4LtHlC4stQKS3Kz/xUsPbg9oGJMCCiqPx8T5CBwgYnapmIiy0z3CihYjHiHDUXhfY1i3Ag/HWjTDfx4ApOOnqGIFXdNcHY7czSaI+gnuhovHNoWd7PYTZf5ZEu8ZAh3drRfca0nA0wVcEllQ3T/f07nlyksh8rdm/6Ho8QrMaBvAEwOQB4gP4TejsQ82xEScGJMCCllb+Fuk4fXOZIXe9qzHYEKduMX1cYQXGF8jmYZ3Oxp07Kb5kzcm8eLJzGMR01VUXnB7wFmQDZ69qH+z6eU+yUvPJ0FRDfGMGpovgHUuS84WDeKw5ltdrhP2l83+E8nYjOPpWYgAAAABJRU5ErkJggg==" alt="DeepSeek" class="deepseek-logo">-->
      <!--                <div class="title-right-text">已接入DeepSeek-R1</div>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--            <div class="title_left_text_desc">AI 智能助手，您的供应链管理智能助手~ </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--        <div class="title_right">-->
      <!--          <el-popover-->
      <!--            placement="bottom"-->
      <!--            trigger="hover"-->
      <!--            content="切大屏"-->
      <!--            popper-class="public_common_popover"-->
      <!--          >-->
      <!--            <img-->
      <!--              slot="reference"-->
      <!--              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAMFBMVEUAAABSWn1TWXxQWIBTWX1QVHxSWn1RWXxTWntTWX1RWnxTWn1SWn1UWX1TWn5TWn0VIR3cAAAAD3RSTlMAn78g3xCAkICvkO/PcG+p+6DnAAAA4ElEQVQ4y92TMQ6CQBREN7G2sLA2sTbRgsRYewBig1yAmsJwBGoKD+AROIKJJ/EKGAIxFsjfYf2YUUsKp2AHHq/Yv1kzTIKJTdTriQV5Y1NJj3vdzPBS934qAB5zyVH6ri2LF7iZt3hfwMgn4ITSJwBhuyQAYcUAgmEAgYATGED4CHIRHMiwoItgThhimCgYH+S5Ts0/JcCmrvplH9klvtuxVgpmlQ7Ra2oFOl2cAwN3DgwgMOgEBp3AAAKDEgKDphMYOIHBpb0vU+mbueRc/F5qmbuQ2msMeWKTSg+1D5AnpEysXxBFaUQAAAAASUVORK5CYII="-->
      <!--              alt=""-->
      <!--              class="el-popover__reference big-screen-icon"-->
      <!--              @click="handleBigScreen"-->
      <!--            >-->
      <!--          </el-popover>-->
      <!--          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAM1BMVEUAAABTWn1QWIBTWnxTWn1SWX1VWoBSWnxQUHpTWXxTWn1TW35SWnxUWXxUWHtTWX1TWn0hFvQwAAAAEHRSTlMA3yB/714wzxCgn2+QcEC/S0/THwAAALdJREFUSMft1UsOgzAMRdEA4VMCrfe/2lYd9ClW5WuJKR6Gcwd8ZMo9+VlqnaLrW5v7g8HMgmL8XN+7k2q+8N6sOzrtW0R+7Q8nX3g/jOVfcaD3xQ4ei0U+VSxVngr2KtBrZhXOQyG/yofFz2+hVrE+5XOFyXPhPRfgOWAPBd80+4cea87rRed8+lNq8qlikvcFey7kgwK8lgZ5LrT6oECvgrwvXtfWfeUfyuFWaD1LMGObyz35eQNk3BWYzBrRJAAAAABJRU5ErkJggg==" alt="" @click="closeChatPanel">-->
      <!--        </div>-->
      <!--      </div>-->

      <!-- HeWa面板内容 -->
      <he-wa-chat-panel
        :messages="messages"
        :is-loading="isLoading"
        :visible="isExpanded"
        :quick-questions="quickQuestions"
        :user-info="userInfo"
        @send-message="handleSendMessage"
        @close="closeChatPanel"
        @switch-human="handleSwitchHuman"
        @feedback="handleFeedback"
        @message-action="handleMessageAction"
        @quick-question="handleQuickQuestion"
      />
    </el-dialog>
  </div>
</template>

<script>
import HeWaChatPanel from '../HeWaChatPanel/HeWaChatPanel.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'HeWaChatEntry',
  directives: {
    'click-outside': {
      bind (el, binding) {
        el.clickOutsideEvent = function (event) {
          const chatBubble = el.querySelector('.chat-bubble')
          const chatBubbleWrapper = el.closest('.hewa-chat-entry')

          if (!(el === event.target || el.contains(event.target)) &&
              !(chatBubble && (chatBubble === event.target || chatBubble.contains(event.target))) &&
              !(chatBubbleWrapper && chatBubbleWrapper.querySelector('.chat-bubble-badge') &&
                chatBubbleWrapper.querySelector('.chat-bubble-badge').contains(event.target))) {
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

      // 用户信息
      userInfo: {
        name: '用户',
        avatar: ''
      },

      // 快捷问题列表
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
      ]
    }
  },
  computed: {
    ...mapState('chat', {
      messages: 'messages',
      unreadCount: 'unreadCount',
      isLoading: 'isLoading',
      isTyping: 'isTyping',
      sessionId: 'sessionId'
    })
  },
  mounted () {
    // 初始化聊天服务
    this.initializeChat()
  },
  methods: {
    ...mapActions('chat', [
      'sendMessage',
      'markAsRead',
      'initializeChat',
      'switchToHuman',
      'submitFeedback'
    ]),

    toggleChatPanel () {
      this.isExpanded = !this.isExpanded
      if (this.isExpanded && this.unreadCount > 0) {
        this.markAsRead()
      }
    },

    closeChatPanel () {
      this.isExpanded = false
    },

    async handleSendMessage (messageContent) {
      try {
        await this.sendMessage(messageContent)
      } catch (error) {
        console.error('发送消息失败:', error)
        this.$message.error('发送消息失败，请稍后重试')
      }
    },

    async handleSwitchHuman () {
      try {
        await this.switchToHuman()
        this.$message.success('已为您转接人工客服')
      } catch (error) {
        console.error('转接人工客服失败:', error)
        this.$message.error('转接人工客服失败，请稍后重试')
      }
    },

    async handleFeedback (feedbackData) {
      try {
        await this.submitFeedback(feedbackData)
        this.$message.success('感谢您的反馈！')
      } catch (error) {
        console.error('提交反馈失败:', error)
        this.$message.error('提交反馈失败，请稍后重试')
      }
    },

    handleMessageAction (actionData) {
      const { action, message } = actionData
      switch (action) {
        case 'like':
          console.log('用户点赞:', message)
          break
        case 'dislike':
          console.log('用户点踩:', message)
          break
        case 'regenerate':
          this.handleSendMessage(message.content)
          break
        default:
          console.log('未知操作:', action)
      }
    },

    handleBigScreen () {
      // 切大屏功能 - 可以实现全屏显示或跳转到大屏模式
      console.log('切换到大屏模式')
      this.$message.info('切换到大屏模式')
      // TODO: 实现具体的大屏切换逻辑
    },

    handleQuickQuestion (question) {
      // 处理快捷问题点击
      console.log('选择快捷问题:', question)
      this.handleSendMessage(question)
    }
  }
}
</script>

<style>
.hewa-chat-entry {
  position: fixed;
  bottom: 50px;
  right: 20px;
  z-index: 9999;
}

/* 聊天气泡样式 */
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

.el-dialog.pm_assistant_dialog {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 80vh; /* 固定高度，配合三段式布局 */
  max-height: 80vh;
  max-width: 100vw;
  border-radius: 16px;
  background: linear-gradient(84.17deg, #e8f3fe .78%, #e3e4fd 21.8%, #d4effe 91.24%);
  box-shadow: 0 6px 40px rgba(0, 0, 0, .2);
  margin: 0 !important;
  position: absolute;
  overflow: hidden; /* 关键：防止dialog本身滚动 */
}

/* Element UI dialog header样式 - 添加圆角 */
.el-dialog.pm_assistant_dialog .el-dialog__header {
  padding: 0;
  background: transparent;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

/* Element UI dialog body样式 - 确保正确传递高度 */
.el-dialog.pm_assistant_dialog .el-dialog__body {
  padding: 0;
  background: transparent;
  height: 100%; /* 占满整个dialog */
  overflow: hidden; /* 防止body本身滚动 */
  display: flex; /* 让HeWaChatPanel能获得正确高度 */
  flex-direction: column;
}

/* HeWa聊天对话框头部样式 - 基于HeWa设计系统 */
.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  color: #303133;
}

.title_left {
  display: flex;
  align-items: center;
}
.title .title_left {
  align-items: center;
}
.title .title_left .title_left_text {
  margin-left: 10px;
}
.title .title_left .title_left_text .title_left_text_name {
  color: #1d2129;
  font-family: Alibaba PuHuiTi;
  font-weight: 700;
  font-size: 16px;
  line-height: 22px;
  display: flex
;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}
.title .title_left .title_left_text .title_left_text_name .title-right {
  display: flex
;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 154px;
  height: 24px;
  border-radius: 100px;
  background: #fff;
  box-shadow: 0 1px 4px 1px rgba(182, 186, 235, .2);
}
.title .title_left .title_left_text .title_left_text_name .title-right img {
  width: 16px;
  height: 12px;
}
.title .title_left .title_left_text .title_left_text_name .title-right .title-right-text {
  font-family: PingFang SC;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
  color: #4f69ee;
  background: white;
}
.title_left_icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
}

.title_left_text {
  display: flex;
  flex-direction: column;
}

.title_left_text_name {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.title_left_text_desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.title-right {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.deepseek-logo {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.title-right-text {
  font-size: 11px;
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
}

.title .title_right {
  position: absolute;
  right: 18px;
  top: 18px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title .title_right img {
  width: 14px;
  height: 14px;
  cursor: pointer;
  margin-left: 10px;
  margin-top: -2px;
}

.big-screen-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.big-screen-icon:hover {
  opacity: 1;
}

/* 确保popover在最顶层显示 */
.public_common_popover {
  z-index: 10000 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hewa-chat-entry {
    bottom: 45px;
    right: 15px;
  }

  .el-dialog.pm_assistant_dialog {
    width: calc(100vw - 30px) !important;
    height: 70vh;
  }
}

@media (max-width: 480px) {
  .el-dialog.pm_assistant_dialog {
    width: calc(100vw - 20px) !important;
    height: 75vh;
  }
}
</style>

<style>
/* 全局样式 - 确保popover在最顶层显示 */
.public_common_popover.el-popover {
  z-index: 10000 !important;
  min-width: auto !important;
  width: auto !important;
  padding: 6px 8px !important;
  font-size: 12px !important;
}
</style>

