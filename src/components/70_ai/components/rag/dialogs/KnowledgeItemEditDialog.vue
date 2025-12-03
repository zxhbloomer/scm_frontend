<template>
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    :visible="visible"
    :title="isEdit ? '编辑知识点' : '新增知识点'"
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

        <!-- 新增时的立即索引开关 -->
        <el-form-item v-if="!isEdit" label="立即索引">
          <el-switch
            v-model="indexAfterCreate"
            active-text="是"
            inactive-text="否"
          />
          <span class="form-tip">（开启后将自动创建向量索引和知识图谱）</span>
        </el-form-item>

        <!-- 编辑时的立即索引开关 -->
        <el-form-item v-if="isEdit" label="立即索引">
          <el-switch
            v-model="indexAfterEdit"
            active-text="是"
            inactive-text="否"
          />
          <span class="form-tip">（开启后将删除旧索引并重建向量和图谱数据）</span>
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
import knowledgeBaseService from '../../../api/knowledgeBaseService'
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
      formData: createEmptyKbItem(),
      indexAfterCreate: true, // 新增时立即索引开关，默认开启
      indexAfterEdit: true // 编辑时立即索引开关，默认开启
    }
  },

  computed: {
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
        // 调用API时根据是新增还是编辑传递对应的索引参数
        const response = await knowledgeBaseService.itemSaveOrUpdate(
          this.formData,
          this.indexAfterCreate,
          this.indexAfterEdit
        )
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
      this.$emit('update:visible', false)
      this.$emit('close')
      this.formData = createEmptyKbItem()
      this.indexAfterCreate = true // 重置为默认值
      this.indexAfterEdit = true // 重置为默认值
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

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}
</style>
