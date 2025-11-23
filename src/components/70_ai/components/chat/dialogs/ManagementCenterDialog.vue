<template>
  <el-dialog
    v-el-drag-dialog
    :visible="visible"
    width="680px"
    :close-on-click-modal="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    class="management-center-dialog"
    @close="handleClose"
  >
    <!-- 自定义标题 -->
    <div slot="title" class="dialog-header">
      <div class="header-icon">
        <i class="el-icon-s-tools" />
      </div>
      <div class="header-text">
        <div class="header-title">管理中心</div>
        <div class="header-subtitle">选择您要管理的功能模块</div>
      </div>
    </div>

    <!-- 选项卡片列表 -->
    <div class="management-options">
      <div
        v-for="(option, index) in options"
        :key="option.key"
        class="option-card"
        :class="`option-card--${option.key}`"
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="handleSelect(option.key)"
      >
        <div class="card-background" />
        <div class="card-content">
          <div class="option-icon-wrapper">
            <div class="option-icon" :class="`option-icon--${option.key}`">
              <i :class="option.icon" />
            </div>
          </div>
          <div class="option-info">
            <div class="option-name">{{ option.name }}</div>
            <div class="option-description">{{ option.description }}</div>
          </div>
          <div class="option-arrow">
            <i class="el-icon-arrow-right" />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'ManagementCenterDialog',

  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      options: [
        {
          key: 'model',
          icon: 'el-icon-setting',
          name: '模型管理',
          description: '配置和管理AI对话模型、默认模型设置'
        },
        {
          key: 'knowledge',
          icon: 'el-icon-files',
          name: '知识库管理',
          description: '管理知识库文档、向量数据和RAG配置'
        },
        {
          key: 'workflow',
          icon: 'el-icon-s-operation',
          name: '工作流管理',
          description: '配置和管理工作流模板、节点定义'
        }
      ]
    }
  },

  methods: {
    /**
     * 处理选项选择
     */
    handleSelect (optionKey) {
      this.$emit('select', optionKey)
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
/* 对话框样式 */
.management-center-dialog >>> .el-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.management-center-dialog >>> .el-dialog__header {
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
}

.management-center-dialog >>> .el-dialog__body {
  padding: 32px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

/* 自定义标题区域 */
.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  font-size: 24px;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 400;
}

/* 选项列表容器 */
.management-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 选项卡片 */
.option-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 卡片背景渐变 */
.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.08;
  transition: opacity 0.3s ease;
}

.option-card--model .card-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.option-card--knowledge .card-background {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.option-card--workflow .card-background {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.option-card:hover .card-background {
  opacity: 0.12;
}

/* 卡片内容 */
.card-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.option-card:hover .card-content {
  border-color: transparent;
}

.option-card--model:hover .card-content {
  border-color: #667eea;
}

.option-card--knowledge:hover .card-content {
  border-color: #f093fb;
}

.option-card--workflow:hover .card-content {
  border-color: #4facfe;
}

/* 图标包装器 */
.option-icon-wrapper {
  flex-shrink: 0;
}

.option-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 28px;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.option-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.option-card:hover .option-icon {
  transform: scale(1.1) rotate(5deg);
}

.option-card:hover .option-icon::before {
  opacity: 0.3;
}

/* 模型管理图标 */
.option-icon--model {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.option-card--model:hover .option-icon--model {
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
}

/* 知识库管理图标 */
.option-icon--knowledge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

.option-card--knowledge:hover .option-icon--knowledge {
  box-shadow: 0 8px 20px rgba(240, 147, 251, 0.5);
}

/* 工作流管理图标 */
.option-icon--workflow {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.option-card--workflow:hover .option-icon--workflow {
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.5);
}

/* 选项信息 */
.option-info {
  flex: 1;
  min-width: 0;
}

.option-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.option-description {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

/* 箭头 */
.option-arrow {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f5f7fa;
  transition: all 0.3s ease;
}

.option-arrow i {
  font-size: 18px;
  color: #909399;
  transition: all 0.3s ease;
}

.option-card:hover .option-arrow {
  background: #409eff;
  transform: translateX(4px);
}

.option-card:hover .option-arrow i {
  color: white;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .management-center-dialog >>> .el-dialog {
    width: 90% !important;
    margin: 5vh auto !important;
  }

  .dialog-header {
    padding: 20px 16px 16px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .header-title {
    font-size: 18px;
  }

  .management-center-dialog >>> .el-dialog__body {
    padding: 24px 16px;
  }

  .card-content {
    padding: 20px;
  }

  .option-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .option-name {
    font-size: 16px;
  }

  .option-description {
    font-size: 13px;
  }
}
</style>
