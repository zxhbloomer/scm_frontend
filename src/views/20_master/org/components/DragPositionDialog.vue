<template>
  <el-dialog
    title="选择拖拽位置"
    :visible.sync="visible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    append-to-body
    destroy-on-close
  >
    <div class="drag-position-content">
      <div class="drag-info">
        <p class="drag-message">
          <strong>{{ dragMessage }}</strong>
        </p>
        <p class="position-tip">请选择拖拽位置：</p>
      </div>

      <el-radio-group v-model="selectedPosition" class="position-options">
        <el-radio label="before" class="position-option">
          <i class="el-icon-top position-icon" />
          <span class="position-text">插入到目标节点之前</span>
          <span class="position-desc">作为兄弟节点，排在目标节点前面</span>
        </el-radio>

        <el-radio label="after" class="position-option">
          <i class="el-icon-bottom position-icon" />
          <span class="position-text">插入到目标节点之后</span>
          <span class="position-desc">作为兄弟节点，排在目标节点后面</span>
        </el-radio>

        <el-radio label="inner" class="position-option">
          <i class="el-icon-right position-icon" />
          <span class="position-text">作为目标节点的子节点</span>
          <span class="position-desc">成为目标节点的下级组织</span>
        </el-radio>
      </el-radio-group>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :disabled="!selectedPosition" @click="handleConfirm">
        确定调整
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DragPositionDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dragMessage: {
      type: String,
      default: ''
    },
    defaultPosition: {
      type: String,
      default: 'inner'
    }
  },
  data () {
    return {
      selectedPosition: ''
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        // 对话框打开时设置默认选中位置
        this.selectedPosition = this.defaultPosition
      }
    }
  },
  methods: {
    handleConfirm () {
      if (!this.selectedPosition) {
        this.$message.warning('请选择拖拽位置')
        return
      }
      this.$emit('confirm', this.selectedPosition)
    },
    handleCancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.drag-position-content {
  padding: 10px 0;
}

.drag-info {
  margin-bottom: 20px;
}

.drag-message {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.4;
}

.position-tip {
  font-size: 14px;
  color: #303133;
  margin: 0;
  font-weight: 500;
}

.position-options {
  width: 100%;
}

.position-options .el-radio {
  width: 100%;
  margin: 0 0 15px 0;
  align-items: flex-start;
}

.position-option {
  display: flex !important;
  align-items: flex-start !important;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.2s;
}

.position-option:hover {
  border-color: #409eff;
  background-color: #f0f8ff;
}

.position-option.is-checked {
  border-color: #409eff;
  background-color: #f0f8ff;
}

.position-icon {
  font-size: 16px;
  color: #409eff;
  margin-right: 8px;
  margin-top: 2px;
}

.position-text {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: block;
  margin-bottom: 4px;
}

.position-desc {
  font-size: 12px;
  color: #909399;
  display: block;
  line-height: 1.3;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 8px;
}

/* 覆盖Element UI的radio样式 */
.position-options .el-radio__input {
  margin-top: 2px;
}

.position-options .el-radio__label {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  flex: 1;
}
</style>
