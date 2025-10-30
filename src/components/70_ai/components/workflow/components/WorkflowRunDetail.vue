<template>
  <div class="workflow-run-detail">
    <!-- 用户输入表单区域 -->
    <div class="user-inputs-section">
      <!-- 无参数提示 -->
      <div v-if="!userInputDefinitions || userInputDefinitions.length === 0" class="no-params-tip">
        <i class="el-icon-info" />
        <span>此工作流无需输入参数</span>
      </div>

      <!-- 动态表单：根据startNode.inputConfig.userInputs渲染 -->
      <div v-else class="user-inputs-form">
        <div
          v-for="(userInput, idx) in userInputs"
          :key="`${idx}_${userInput.name}`"
          class="input-row"
        >
          <!-- 参数标题 -->
          <div class="input-label">
            <span>{{ userInput.content.title }}</span>
            <span v-if="userInput.required" class="required-mark">*</span>
          </div>

          <!-- 输入控件容器 -->
          <div class="input-control">
            <!-- 类型1: TEXT - 文本输入 -->
            <el-input
              v-if="userInput.content.type === 1"
              v-model="userInput.content.value"
              type="textarea"
              :rows="3"
              :placeholder="`请输入${userInput.content.title}`"
              :disabled="submitting"
            />

            <!-- 类型2: NUMBER - 数字输入 -->
            <el-input-number
              v-if="userInput.content.type === 2"
              v-model="userInput.content.value"
              :placeholder="`请输入${userInput.content.title}`"
              :disabled="submitting"
              controls-position="right"
              style="width: 100%;"
            />

            <!-- 类型3: OPTIONS - 下拉选择 -->
            <div v-if="userInput.content.type === 3">
              <!-- TODO: 后续实现,需要options数据 -->
              <span class="placeholder-text">下拉选择(待实现)</span>
            </div>

            <!-- 类型4: FILES - 文件上传 -->
            <el-upload
              v-if="userInput.content.type === 4"
              ref="uploadRef"
              class="upload-area"
              drag
              action="/scm/api/v1/ai/file/upload"
              :multiple="true"
              :limit="getFileLimit(userInput.uuid)"
              :on-change="handleFileListChange"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :disabled="submitting"
              :auto-upload="false"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <div slot="tip" class="el-upload__tip">
                支持格式: TXT、PDF、DOC、DOCX、XLS、XLSX、PPT、PPTX；文件大小: 不超过10M
              </div>
            </el-upload>

            <!-- 类型5: BOOL - 开关 -->
            <el-switch
              v-if="userInput.content.type === 5"
              v-model="userInput.content.value"
              :disabled="submitting"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 运行按钮 -->
    <div class="run-actions">
      <el-button
        type="primary"
        icon="el-icon-video-play"
        :loading="submitting"
        :disabled="!canRun || submitting"
        @click="handleRun"
      >
        {{ submitting ? '运行中...' : '运行' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'WorkflowRunDetail',

  props: {
    workflow: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      userInputs: [],
      uploadedFileUuids: [],
      fileListLength: 0,
      submitting: false
    }
  },

  computed: {
    ...mapGetters({
      getStartNode: 'ai/workflow/getStartNode'
    }),

    // 获取StartNode
    startNode () {
      if (!this.workflow.workflowUuid) {
        return null
      }
      return this.getStartNode(this.workflow.workflowUuid)
    },

    // 获取用户输入定义
    userInputDefinitions () {
      if (!this.startNode || !this.startNode.inputConfig) {
        return []
      }

      // SCM使用user_inputs字段名（下划线），aideepin使用userInputs（驼峰）
      const userInputs = this.startNode.inputConfig.user_inputs ||
                      this.startNode.inputConfig.userInputs

      return userInputs || []
    },

    // 是否可以运行
    canRun () {
      if (!this.workflow.workflowUuid || !this.workflow.nodes || this.workflow.nodes.length < 2) {
        return false
      }
      return true
    }
  },

  watch: {
    'workflow.workflowUuid': {
      immediate: true,
      handler (newUuid) {
        if (!newUuid) {
          this.userInputs = []
          return
        }

        this.$nextTick(() => {
          const definitions = this.userInputDefinitions
          this.userInputs = definitions.map(input => ({
            uuid: input.uuid,
            name: input.name,
            content: {
              title: input.title,
              value: null,
              type: input.type
            },
            required: input.required || false
          }))

          this.uploadedFileUuids = []
          this.fileListLength = 0
        })
      }
    }
  },

  methods: {
    // 获取文件上传数量限制
    getFileLimit (inputUuid) {
      const input = this.userInputDefinitions.find(item => item.uuid === inputUuid)
      return input?.limit || 10
    },

    // 文件列表变化
    handleFileListChange (file, fileList) {
      this.fileListLength = fileList.length

      // 如果所有文件都上传完成，触发运行
      if (this.uploadedFileUuids.length === this.fileListLength) {
        this.handleRun()
      }
    },

    // 文件上传成功
    handleUploadSuccess (response, file, fileList) {
      if (response.code === 20000 && response.data) {
        this.uploadedFileUuids.push(response.data.uuid)

        // 如果所有文件都上传完成，触发运行
        if (this.uploadedFileUuids.length === this.fileListLength) {
          this.handleRun()
        }
      } else {
        this.$message.error(`文件上传失败: ${response.msg || '未知错误'}`)
      }
    },

    // 文件上传失败
    handleUploadError (err, file) {
      console.error('文件上传错误:', err)
      this.$message.error(`文件上传失败: ${file.name}`)
    },

    // 触发文件上传
    uploadBeforeRun () {
      this.uploadedFileUuids = []
      const uploadRef = this.$refs.uploadRef

      if (uploadRef) {
        if (Array.isArray(uploadRef)) {
          uploadRef.forEach(ref => ref.submit())
        } else {
          uploadRef.submit()
        }
      }
    },

    // 验证用户输入
    validateUserInputs () {
      // 检查必填的文件参数
      for (const input of this.userInputs) {
        if (input.required && input.content.type === 4 && input.content.value === null && this.fileListLength === 0) {
          this.$message.warning('请上传文件')
          return false
        }
      }

      // 如果有文件待上传，先触发上传
      if (this.fileListLength > 0 && this.uploadedFileUuids.length !== this.fileListLength) {
        this.uploadBeforeRun()
        return false
      }

      // 将上传成功的文件UUID赋值给文件类型参数
      const fileInput = this.userInputs.find(input => input.content.type === 4 && input.content.value === null)
      if (fileInput) {
        fileInput.content.value = this.uploadedFileUuids
      }

      // 检查所有必填参数
      if (this.userInputs.some(input => input.required && input.content.value === null)) {
        this.$message.warning('请输入所有必填参数')
        return false
      }

      return true
    },

    // 运行工作流
    async handleRun () {
      if (this.submitting || !this.canRun) return

      this.submitting = true

      // 验证用户输入
      if (!this.validateUserInputs()) {
        this.submitting = false
        return
      }

      // 构造输入数据
      const inputs = this.userInputs.map(input => ({
        name: input.name,
        content: {
          type: input.content.type,
          value: input.content.value,
          title: input.content.title
        },
        required: input.required
      }))

      try {
        // 触发父组件的运行事件
        this.$emit('run', inputs)
      } catch (error) {
        this.$message.error(`运行失败: ${error.message || '未知错误'}`)
        this.submitting = false
      }
    },

    // 重置输入
    resetInputs () {
      // 清空文件上传
      const uploadRef = this.$refs.uploadRef
      if (uploadRef) {
        if (Array.isArray(uploadRef)) {
          uploadRef.forEach(ref => ref.clearFiles())
        } else {
          uploadRef.clearFiles()
        }
      }

      this.uploadedFileUuids = []
      this.fileListLength = 0

      // 清空用户输入
      this.userInputs.forEach(input => {
        input.content.value = null
      })
    },

    // 运行完成（由父组件调用）
    runDone () {
      this.submitting = false
      this.resetInputs()
    },

    // 运行失败（由父组件调用）
    runError () {
      this.submitting = false
      this.resetInputs()
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-run-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
}

.user-inputs-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-params-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-size: 14px;

  i {
    font-size: 18px;
  }
}

.user-inputs-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: flex-start;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 400;
  color: #606266;
  padding-top: 8px;
  line-height: 1.5;

  .required-mark {
    color: #f56c6c;
    font-size: 14px;
  }
}

.input-control {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.placeholder-text {
  color: #909399;
  font-size: 14px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}

.upload-area {
  ::v-deep .el-upload {
    width: 100%;
  }

  ::v-deep .el-upload-dragger {
    width: 100%;
    height: auto;
    min-height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    background-color: #fafafa;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }

  ::v-deep .el-icon-upload {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 12px;
  }

  ::v-deep .el-upload__text {
    color: #606266;
    font-size: 14px;
    line-height: 1.5;

    em {
      color: #409eff;
      font-style: normal;
    }
  }

  ::v-deep .el-upload__tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
    text-align: center;
  }
}

.run-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  margin-top: 4px;

  ::v-deep .el-button--primary {
    background-color: #67c23a;
    border-color: #67c23a;

    &:hover {
      background-color: #85ce61;
      border-color: #85ce61;
    }
  }
}
</style>
