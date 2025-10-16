<template>
  <el-dialog
    v-if="visible"
    v-el-drag-dialog
    :visible="visible"
    title="批量上传文档"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    class="kb-upload-dialog"
    width="800px"
    destroy-on-close
    @close="handleClose"
  >
    <el-form :model="formData" label-width="120px">
      <!-- 上传文档 -->
      <el-form-item label="上传文档" required>
        <SimpleUploadMutilFile
          :accept="'.pdf,.doc,.docx,.txt,.md,.html,.json'"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
        />
        <div class="upload-tip">
          支持格式：PDF、Word、TXT、Markdown、HTML、JSON
        </div>
      </el-form-item>

      <!-- 显示已上传文件列表 -->
      <el-form-item v-if="uploadedFiles.length > 0" label="已上传文件">
        <el-row :gutter="12">
          <el-col
            v-for="(file, index) in uploadedFiles"
            :key="index"
            :span="12"
          >
            <div class="file-card">
              <span class="file-name">{{ file.fileName }}</span>
              <el-button
                type="text"
                icon="el-icon-delete"
                @click="removeFile(index)"
              />
            </div>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 是否立即索引 -->
      <el-form-item label="立即索引">
        <el-switch
          v-model="formData.indexAfterUpload"
          active-text="是"
          inactive-text="否"
        />
        <span class="form-tip">（开启后将自动创建向量索引和知识图谱）</span>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="uploadedFiles.length === 0"
        @click="handleBatchCreate"
      >
        确定创建 ({{ uploadedFiles.length }})
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
// ✅ 引入 SCM 标准上传组件
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile'
import knowledgeBaseService from '../api/knowledgeBaseService'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'KnowledgeItemUploadDialog',

  components: {
    SimpleUploadMutilFile
  },

  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    kbUuid: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      formData: {
        indexAfterUpload: true
      },
      uploadedFiles: [], // ✅ 存储上传的文件信息数组
      submitting: false
    }
  },

  watch: {
    visible (val) {
      if (val) {
        this.resetForm()
      }
    }
  },

  methods: {
    /**
     * ✅ 处理文件上传成功
     * res.response.data 结构：
     * {
     *   url: "http://file.service.com/xxx.pdf",
     *   fileName: "文档.pdf",
     *   fileSize: 1024000,
     *   timestamp: "2025-01-15 10:30:00"
     * }
     */
    handleUploadSuccess (res) {
      // 参考comment.vue的实现：将timestamp设置到data中
      const timestamp = res.response.data.timestamp || res.response.timestamp

      const fileInfo = {
        url: res.response.data.url,
        fileName: res.response.data.fileName || res.file.name,
        file_size: res.response.data.file_size || res.file.size, // 使用下划线命名匹配SFileInfoVo
        timestamp: timestamp
      }

      this.uploadedFiles.push(fileInfo)
      this.$message.success(`文件 ${fileInfo.fileName} 上传成功`)
    },

    handleUploadError (err) {
      console.error('文件上传失败:', err)
      this.$message.error('文件上传失败，请重试')
    },

    removeFile (index) {
      this.uploadedFiles.splice(index, 1)
    },

    /**
     * ✅ 批量创建知识项
     */
    async handleBatchCreate () {
      // 验证知识库UUID
      if (!this.kbUuid || this.kbUuid.trim() === '') {
        this.$message.error('知识库UUID不能为空，请先选择知识库')
        return
      }

      if (this.uploadedFiles.length === 0) {
        this.$message.warning('请至少上传一个文件')
        return
      }

      this.submitting = true

      try {
        // ✅ 调用批量创建API，传递文件数组
        const params = {
          kbUuid: this.kbUuid,
          doc_att_files: this.uploadedFiles, // ✅ 关键：传递文件数组
          indexAfterUpload: this.formData.indexAfterUpload
        }

        const response = await knowledgeBaseService.batchCreateItems(params)

        this.$message.success(`成功创建 ${response.data.length} 个知识项`)
        this.$emit('success')
        this.$emit('update:visible', false)
      } catch (error) {
        console.error('批量创建知识项失败:', error)
        this.$message.error('批量创建失败：' + (error.message || '未知错误'))
      } finally {
        this.submitting = false
      }
    },

    resetForm () {
      this.formData = {
        indexAfterUpload: true
      }
      this.uploadedFiles = []
    },

    handleClose () {
      this.$emit('update:visible', false)
      this.$emit('close')
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.file-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  margin-bottom: 8px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.dialog-footer {
  text-align: right;
}
</style>
