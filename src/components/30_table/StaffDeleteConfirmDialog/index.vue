<template>
  <div>
    <!-- 员工删除确认对话框 -->
    <el-dialog
      title="删除员工确认"
      :visible.sync="visible"
      width="520px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      custom-class="staff-delete-confirm-dialog"
      @open="onDialogOpen"
      @closed="onDialogClosed"
    >
      <div class="staff-delete-content">
        <!-- 员工信息显示 -->
        <div class="staff-info-section">
          <i class="el-icon-user staff-icon" />
          <div class="staff-details">
            <h4 class="staff-name">{{ staffInfo.name }}</h4>
            <p class="staff-code">员工编码：{{ staffInfo.code }}</p>
          </div>
        </div>

        <!-- 删除方式选择 -->
        <div class="delete-options-section">
          <h4 class="options-title">请选择删除方式：</h4>
          <el-radio-group v-model="selectedDeleteType" class="delete-radio-group">
            <!-- 选项1：仅从组织架构移除 -->
            <div class="option-item safe">
              <el-radio label="remove_only" class="option-radio">
                <div class="option-content">
                  <div class="option-header">
                    <i class="el-icon-remove-outline option-icon" />
                    <span class="option-title">仅从组织架构移除</span>
                    <el-tag type="success" size="mini" class="option-tag">可恢复</el-tag>
                  </div>
                  <div class="option-description">
                    <p>• 保留员工基本信息和账号</p>
                    <p>• 可重新分配到其他岗位</p>
                    <p>• 保留所有历史业务数据</p>
                    <p class="note-tip">注：员工可暂时无岗位状态，后续可重新分配</p>
                  </div>
                </div>
              </el-radio>
            </div>

            <!-- 选项2：彻底删除员工 -->
            <div class="option-item danger">
              <el-radio label="delete_completely" class="option-radio">
                <div class="option-content">
                  <div class="option-header">
                    <i class="el-icon-delete option-icon" />
                    <span class="option-title">彻底删除员工</span>
                    <el-tag type="danger" size="mini" class="option-tag">不可恢复</el-tag>
                  </div>
                  <div class="option-description">
                    <p>• 逻辑删除员工及账号</p>
                    <p>• 移除所有岗位关联</p>
                    <p>• 无法登录系统</p>
                  </div>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
        </div>

        <!-- 警告提示 -->
        <div v-if="selectedDeleteType === 'delete_completely'" class="warning-section">
          <el-alert
            title="警告：此操作不可恢复"
            type="warning"
            description="彻底删除员工后，该员工将无法登录系统，且无法恢复。请谨慎操作！"
            show-icon
            :closable="false"
          />
        </div>
      </div>

      <!-- 对话框底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button
          type="primary"
          :class="{ 'is-danger': selectedDeleteType === 'delete_completely' }"
          @click="handleConfirm"
        >
          确认删除
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'StaffDeleteConfirmDialog',
  props: {
    // 对话框显示控制
    value: {
      type: Boolean,
      default: false
    },
    // 员工信息
    staffInfo: {
      type: Object,
      default: () => ({
        name: '',
        code: '',
        id: null
      })
    }
  },

  data () {
    return {
      // 选中的删除类型
      selectedDeleteType: 'remove_only'
    }
  },

  computed: {
    // 对话框显示状态
    visible: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },

  methods: {
    /**
     * 对话框打开事件
     */
    onDialogOpen () {
      // 重置选择状态为安全选项
      this.selectedDeleteType = 'remove_only'
    },

    /**
     * 对话框关闭事件
     */
    onDialogClosed () {
      this.selectedDeleteType = 'remove_only'
    },

    /**
     * 取消按钮点击
     */
    handleCancel () {
      this.visible = false
      this.$emit('cancel')
    },

    /**
     * 确认删除按钮点击
     */
    handleConfirm () {
      if (!this.selectedDeleteType) {
        this.$message.warning('请选择删除方式')
        return
      }

      // 发送确认事件，传递删除类型
      this.$emit('confirm', {
        deleteType: this.selectedDeleteType,
        staffInfo: this.staffInfo
      })

      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
/* 对话框自定义样式 */
::v-deep .staff-delete-confirm-dialog {
  .el-dialog__header {
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    padding: 15px 20px;
    .el-dialog__title {
      font-weight: 600;
      color: #303133;
    }
  }
}

/* 主要内容区域 */
.staff-delete-content {
  padding: 10px;
}

/* 员工信息区域 */
.staff-info-section {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;

  .staff-icon {
    font-size: 32px;
    color: #409eff;
    margin-right: 15px;
  }

  .staff-details {
    flex: 1;
    .staff-name {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .staff-code {
      margin: 0;
      font-size: 14px;
      color: #606266;
    }
  }
}

/* 删除选项区域 */
.delete-options-section {
  margin-bottom: 20px;

  .options-title {
    margin: 0 0 15px 0;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .delete-radio-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .option-item {
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      transition: all 0.3s ease;
      &:hover {
        border-color: #c0c4cc;
      }

      &.safe {
        &:has(.el-radio.is-checked) {
          border-color: #67c23a;
          background-color: #f0f9ff;
        }
      }

      &.danger {
        &:has(.el-radio.is-checked) {
          border-color: #f56c6c;
          background-color: #fef0f0;
        }
      }

      .option-radio {
        width: 100%;
        margin: 0;
        padding: 16px;

        ::v-deep .el-radio__label {
          width: calc(100% - 20px);
          padding-left: 10px;
        }
      }
    }
  }
}

/* 选项内容 */
.option-content {
  width: 100%;

  .option-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .option-icon {
      font-size: 18px;
      margin-right: 8px;
      color: #909399;
    }

    .option-title {
      flex: 1;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }

    .option-tag {
      margin-left: 8px;
    }
  }

  .option-description {
    margin-left: 26px;

    p {
      margin: 4px 0;
      font-size: 13px;
      color: #606266;
      line-height: 1.4;
    }
  }
}

/* 警告区域 */
.warning-section {
  margin-top: 15px;
}

/* 对话框底部 */
.dialog-footer {
  padding: 15px 20px 0;
  text-align: right;
  border-top: 1px solid #e4e7ed;

  .el-button.is-danger {
    background-color: #f56c6c;
    border-color: #f56c6c;

    &:hover {
      background-color: #f78989;
      border-color: #f78989;
    }
  }
}
</style>
