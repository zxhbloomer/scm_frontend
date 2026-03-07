<template>
  <transition name="ai-loading-fade">
    <div
      v-if="visible"
      class="ai-loading-overlay"
    >
      <div class="ai-loading-content">
        <i class="el-icon-loading ai-loading-icon" />
        <span class="ai-loading-text">{{ displayText }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AiLoadingOverlay',

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isTimeout: false,
      timer: null,
      autoCloseTimer: null
    }
  },

  computed: {
    displayText () {
      return this.isTimeout
        ? '加载超时，请重试'
        : '请稍候，正在打开页面...'
    }
  },

  watch: {
    visible (val) {
      if (val) {
        this.isTimeout = false
        this.startTimer()
      } else {
        this.clearTimer()
      }
    }
  },

  beforeDestroy () {
    this.clearTimer()
  },

  methods: {
    startTimer () {
      this.clearTimer()
      this.timer = setTimeout(() => {
        this.isTimeout = true
        // 超时后3秒自动关闭遮罩，避免用户被阻塞
        this.autoCloseTimer = setTimeout(() => {
          this.$emit('timeout')
        }, 3000)
      }, 10000)
    },

    clearTimer () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer)
        this.autoCloseTimer = null
      }
    }
  }
}
</script>

<style scoped>
.ai-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-loading-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px 40px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ai-loading-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.ai-loading-text {
  font-size: 14px;
  color: #606266;
}

.ai-loading-fade-enter-active,
.ai-loading-fade-leave-active {
  transition: opacity 0.3s;
}

.ai-loading-fade-enter,
.ai-loading-fade-leave-to {
  opacity: 0;
}
</style>
