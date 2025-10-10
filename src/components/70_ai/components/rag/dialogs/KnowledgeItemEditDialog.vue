<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    :title="isEdit ? '编辑知识点' : '新增知识点'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="item-edit-container">
      <el-form ref="form" :model="formData" label-width="80px">
        <el-form-item label="标题" required>
          <el-input
            v-model="formData.title"
            maxlength="100"
            show-word-limit
            placeholder="请输入标题"
          />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="formData.brief"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            placeholder="请输入摘要"
          />
        </el-form-item>

        <el-form-item label="内容">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="5"
            show-word-limit
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!isFormValid"
        @click="handleSubmit"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createEmptyKbItem } from '../utils/knowledgeBaseUtils'
import knowledgeBaseService from '../api/knowledgeBaseService'
import elDragDialog from '@/directive/el-drag-dialog'

export default {

  name: 'KnowledgeItemEditDialog',
  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    kbUuid: {
      type: String,
      default: ''
    },
    itemInfo: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      submitting: false,
      formData: createEmptyKbItem()
    }
  },

  computed: {
    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },

    isEdit () {
      return this.formData.id && this.formData.id !== '0'
    },

    isFormValid () {
      return this.formData.title && this.formData.title.trim().length > 0
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
      if (this.itemInfo && this.itemInfo.id !== '0') {
        // 编辑模式
        this.formData = { ...this.itemInfo }
      } else {
        // 新建模式
        this.formData = createEmptyKbItem()
        this.formData.kbUuid = this.kbUuid
      }
    },

    /**
     * 提交表单
     */
    async handleSubmit () {
      if (!this.isFormValid) {
        this.$message.warning('请填写标题')
        return
      }

      this.submitting = true
      try {
        const response = await knowledgeBaseService.itemSaveOrUpdate(this.formData)
        const data = response.data || response

        this.$message.success(this.isEdit ? '编辑成功' : '创建成功')
        this.$emit('success', data)
        this.handleClose()
      } catch (error) {
        this.$message.error('保存失败: ' + (error.message || '未知错误'))
      } finally {
        this.submitting = false
      }
    },

    /**
     * 取消
     */
    handleCancel () {
      this.handleClose()
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.dialogVisible = false
      this.formData = createEmptyKbItem()
    }
  }
}
</script>

<style scoped>
.item-edit-container {
  padding: 10px;
}

.dialog-footer {
  text-align: right;
}
</style>
