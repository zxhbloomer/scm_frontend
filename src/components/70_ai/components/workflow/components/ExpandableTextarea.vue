<template>
  <div class="expandable-textarea">
    <el-input
      :value="value"
      type="textarea"
      :autosize="{ minRows: minRows, maxRows: maxRows }"
      :placeholder="placeholder"
      @input="$emit('input', $event)"
    />
    <span class="expand-btn" title="展开编辑" @click="dialogVisible = true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </span>
    <el-dialog
      v-if="dialogVisible"
      v-el-drag-dialog
      :visible="dialogVisible"
      :title="dialogTitle"
      width="72%"
      top="5vh"
      custom-class="expandable-textarea-dialog"
      :modal="true"
      :close-on-click-modal="false"
      :append-to-body="true"
      :modal-append-to-body="true"
      @close="dialogVisible = false"
    >
      <el-input
        :value="value"
        type="textarea"
        :placeholder="placeholder"
        @input="$emit('input', $event)"
      />
      <div slot="footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'ExpandableTextarea',
  directives: { elDragDialog },
  props: {
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    minRows: { type: Number, default: 3 },
    maxRows: { type: Number, default: 10 },
    dialogTitle: { type: String, default: '编辑内容' }
  },
  data () {
    return { dialogVisible: false }
  }
}
</script>

<style lang="scss" scoped>
.expandable-textarea {
  position: relative;

  .expand-btn {
    position: absolute;
    top: 4px;
    right: 8px;
    cursor: pointer;
    color: #909399;
    z-index: 1;
    padding: 3px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: bounce 2s ease-in-out infinite;

    &:hover {
      color: #409eff;
      background-color: #ecf5ff;
      animation: none;
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}
</style>

<style lang="scss">
/* 不能scoped，因为el-dialog append-to-body后脱离当前组件 */
.expandable-textarea-dialog {
  height: 72vh;
  display: flex;
  flex-direction: column;

  .el-dialog__body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .el-textarea {
      flex: 1;
      display: flex;
      flex-direction: column;

      .el-textarea__inner {
        flex: 1;
        resize: none;
      }
    }
  }
}
</style>
