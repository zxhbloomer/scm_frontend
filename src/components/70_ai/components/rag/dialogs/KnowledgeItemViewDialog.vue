<template>
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    :visible="visible"
    title="查看知识点"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="700px"
    destroy-on-close
    @close="handleClose"
  >
    <div class="item-view-container">
      <el-form ref="form" :model="formData" label-width="80px">
        <el-form-item label="标题">
          <el-input
            v-model="formData.title"
            disabled
            placeholder="无"
          />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="formData.brief"
            type="textarea"
            :rows="2"
            disabled
            placeholder="无"
          />
        </el-form-item>

        <el-form-item label="内容">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="5"
            disabled
            placeholder="无"
          />
        </el-form-item>

        <el-form-item v-if="formData.fileName" label="文件名">
          <el-input
            v-model="formData.fileName"
            disabled
          />
        </el-form-item>

        <el-form-item v-if="formData.c_time" label="创建时间">
          <el-input
            v-model="formData.c_time"
            disabled
          />
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createEmptyKbItem } from '../utils/knowledgeBaseUtils'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'KnowledgeItemViewDialog',
  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    itemInfo: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      formData: createEmptyKbItem()
    }
  },

  watch: {
    visible (val) {
      if (val) {
        this.initFormData()
      }
    },

    itemInfo: {
      handler (val) {
        if (val && this.visible) {
          this.initFormData()
        }
      },
      deep: true
    }
  },

  methods: {
    /**
     * 初始化表单数据
     */
    initFormData () {
      if (this.itemInfo) {
        this.formData = { ...this.itemInfo }
      } else {
        this.formData = createEmptyKbItem()
      }
    },

    /**
     * 关闭对话框
     */
    handleClose () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped lang="scss">
.item-view-container {
  padding: 20px;

  ::v-deep .el-form-item__label {
    font-weight: 600;
    color: #606266;
  }

  ::v-deep .el-input.is-disabled .el-input__inner,
  ::v-deep .el-textarea.is-disabled .el-textarea__inner {
    background-color: #f5f7fa;
    border-color: #dcdfe6;
    color: #606266;
    cursor: not-allowed;
  }
}
</style>
