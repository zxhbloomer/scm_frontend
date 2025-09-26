<template>
  <div class="scm-chat-header">
    <!-- 背景装饰 -->
    <div class="header-bg" />

    <div class="header-content">
      <!-- AI助手信息 -->
      <div class="assistant-info">
        <!-- 头像区域 -->
        <div class="avatar-container">
          <el-avatar
            :size="44"
            :src="assistant.avatar"
            class="assistant-avatar"
          >
            <svg viewBox="0 0 24 24" class="avatar-fallback">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </el-avatar>

          <!-- 在线状态指示器 -->
          <div
            class="status-indicator"
            :class="[`status-indicator--${onlineStatus}`]"
            :title="statusText"
          />
        </div>

        <!-- 助手详情 -->
        <div class="assistant-details">
          <div class="assistant-name">
            {{ assistant.name }}
            <span class="tech-badge">AI</span>
          </div>
          <div class="assistant-role">{{ assistant.role }}</div>
          <div class="assistant-status">{{ statusText }}</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="header-actions">
        <!-- 切换人工客服 -->
        <el-tooltip content="切换人工客服" placement="bottom">
          <el-button
            type="text"
            icon="el-icon-user"
            class="action-btn human-service-btn"
            @click="$emit('switch-human')"
          />
        </el-tooltip>

        <!-- 最大化/还原按钮 -->
        <el-tooltip :content="isMaximized ? '还原窗口' : '最大化窗口'" placement="bottom">
          <el-button
            type="text"
            :icon="isMaximized ? 'el-icon-copy-document' : 'el-icon-full-screen'"
            class="action-btn maximize-btn"
            @click="$emit('toggle-maximize')"
          />
        </el-tooltip>

        <!-- 更多选项 - 直接打开模型设置 -->
        <el-tooltip content="模型设置" placement="bottom">
          <el-button
            type="text"
            icon="el-icon-more"
            class="action-btn more-btn"
            @click="handleMoreButtonClick"
          />
        </el-tooltip>

        <!-- 关闭按钮 -->
        <el-button
          type="text"
          icon="el-icon-close"
          class="action-btn close-btn"
          @click="$emit('close')"
        />
      </div>
    </div>

    <!-- 底部装饰线 -->
    <div class="header-border" />

    <!-- 模型设置弹窗 -->
    <ModelSettingsDialog
      :visible="showModelSettings"
      @close="handleModelSettingsClose"
      @update:visible="showModelSettings = $event"
    />
  </div>
</template>

<script>
import ModelSettingsDialog from '../../model/ModelSettingsDialog.vue'

export default {
  name: 'ChatHeader',

  components: {
    ModelSettingsDialog
  },

  props: {
    assistant: {
      type: Object,
      required: true,
      default: () => ({
        name: 'SCM智能助手',
        avatar: '',
        role: 'SCM业务专家'
      })
    },
    onlineStatus: {
      type: String,
      default: 'online',
      validator: value => ['online', 'offline', 'away', 'busy'].includes(value)
    },
    isMaximized: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      showModelSettings: false
    }
  },

  computed: {
    statusText () {
      const statusMap = {
        online: '在线服务中',
        offline: '离线',
        away: '暂时离开',
        busy: '繁忙'
      }
      return statusMap[this.onlineStatus] || '未知状态'
    }
  },

  methods: {

    openModelSettings () {
      console.log('🔧 [ChatHeader] 打开模型设置弹窗')
      this.showModelSettings = true
    },

    handleModelSettingsClose () {
      console.log('🔧 [ChatHeader] 关闭模型设置弹窗')
      this.showModelSettings = false
    },

    handleMoreButtonClick () {
      console.log('🔧 [ChatHeader] 更多按钮被点击 - 打开模型设置')
      this.openModelSettings()
    }
  }
}
</script>

<style scoped>
.scm-chat-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

/* 背景装饰 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(240, 147, 251, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  z-index: 1;
}

/* 助手信息区域 */
.assistant-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.avatar-container {
  position: relative;
}

.assistant-avatar {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.avatar-fallback {
  width: 24px;
  height: 24px;
  fill: white;
}

/* 在线状态指示器 */
.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: #67c23a;
}

.status-indicator--online {
  background: #67c23a;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.6);
}

.status-indicator--offline {
  background: #909399;
}

.status-indicator--away {
  background: #e6a23c;
}

.status-indicator--busy {
  background: #f56c6c;
}

/* 助手详情 */
.assistant-details {
  flex: 1;
}

.assistant-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 16px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  backdrop-filter: blur(10px);
}

.assistant-role {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 1px;
}

.assistant-status {
  font-size: 11px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 操作按钮区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: scale(1.1);
  backdrop-filter: blur(10px);
}

.human-service-btn:hover {
  background: rgba(103, 194, 58, 0.3);
}

.maximize-btn:hover {
  background: rgba(64, 158, 255, 0.3);
}

.close-btn:hover {
  background: rgba(245, 108, 108, 0.3);
}

/* 底部装饰线 */
.header-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
}

/* 更多按钮样式增强 */
.more-btn:hover {
  background: rgba(103, 194, 58, 0.3);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .header-content {
    padding: 12px 16px;
  }

  .assistant-avatar {
    width: 36px;
    height: 36px;
  }

  .assistant-name {
    font-size: 14px;
  }

  .assistant-role {
    font-size: 12px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}
</style>
