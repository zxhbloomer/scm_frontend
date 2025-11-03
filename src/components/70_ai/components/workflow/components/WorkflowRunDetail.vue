<template>
  <div class="workflow-run-detail">
    <!-- 用户输入表单区域 -->
    <div class="user-inputs-section">
      <!-- 常规用户输入 -->
      <template v-if="!humanFeedback">
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

              <!-- 类型4: FILES - 文件上传 (SCM标准模式) -->
              <template v-if="userInput.content.type === 4">
                <!-- 上传组件 -->
                <Simple-upload-mutil-file
                  :accept="'*'"
                  @upload-success="handleUploadFileSuccess"
                  @upload-error="handleUploadFileError"
                />

                <!-- 已上传附件列表 -->
                <div v-if="doc_att.length > 0" style="margin-top: 10px;">
                  <el-descriptions
                    title=""
                    :column="1"
                    :label-style="{ display: 'none' }"
                    direction="horizontal"
                    border
                  >
                    <el-descriptions-item
                      v-for="(file, index) in doc_att"
                      :key="index"
                    >
                      <span>
                        附件名称：{{ file.fileName }} &nbsp;
                        文件上传日期：{{ formatTimestamp(file.timestamp) }} &nbsp;
                        <span class="clickable" @click="handleRemoveFile(file)">删除</span>
                      </span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </template>

              <!-- 类型5: BOOL - 开关 -->
              <el-switch
                v-if="userInput.content.type === 5"
                v-model="userInput.content.value"
                :disabled="submitting"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 人机交互输入区域 -->
      <template v-if="humanFeedback">
        <div class="human-feedback-section">
          <!-- 红色警告提示 -->
          <div class="feedback-alert">
            <i class="el-icon-warning" />
            <span class="alert-text">流程已暂停，等待用户输入中...</span>
          </div>

          <!-- 输入区域 -->
          <div class="feedback-input-area">
            <div v-if="humanFeedbackTip" class="feedback-tip">
              提示：{{ humanFeedbackTip }}
            </div>
            <el-input
              v-model="humanFeedbackContent"
              type="textarea"
              :rows="3"
              placeholder="请输入您的反馈内容"
            />
          </div>

          <!-- 提交按钮 -->
          <div class="feedback-actions">
            <el-button type="primary" @click="handleResume">
              提交
            </el-button>
          </div>
        </div>
      </template>
    </div>

    <!-- 运行按钮（仅在非人机交互模式显示）-->
    <div v-if="!humanFeedback" class="run-actions">
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
import SimpleUploadMutilFile from '@/components/10_file/SimpleUploadMutilFile/index.vue'

export default {
  name: 'WorkflowRunDetail',
  components: {
    SimpleUploadMutilFile
  },

  props: {
    workflow: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      userInputs: [],
      // SCM标准附件数据结构
      doc_att: [], // 完整附件对象数组
      doc_att_file: [], // URL数组
      submitting: false,
      // 人机交互相关状态
      humanFeedback: false,
      humanFeedbackTip: '',
      humanFeedbackContent: '',
      currentRuntimeUuid: '' // 保存当前运行的runtimeUuid，用于resume
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

      // SCM使用user_inputs字段名（下划线）
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

          // 重置附件数据
          this.doc_att = []
          this.doc_att_file = []
        })
      }
    }
  },

  methods: {
    // 上传成功处理
    handleUploadFileSuccess (res) {
      // res.response 结构: {code: 0, data: {url, fileName}, timestamp}

      // 1. 添加时间戳到附件对象
      res.response.data.timestamp = res.response.timestamp

      // 2. 保存完整附件对象（用于页面展示）
      this.doc_att.push(res.response.data)

      // 3. 保存附件URL（用于快速查找和删除）
      this.doc_att_file.push(res.response.data.url)

      // 4. 更新到userInput.content.value（运行时传递给后端）
      const fileInput = this.userInputs.find(input => input.content.type === 4)
      if (fileInput) {
        fileInput.content.value = this.doc_att_file // 保存URL数组
      }

      // 5. 上传附件后，footer高度变化，需要通知父组件重新计算布局
      // 使用$nextTick确保DOM更新后再触发父组件的布局重算
      this.$nextTick(() => {
        if (this.$parent && this.$parent.calculateMainHeight) {
          this.$parent.calculateMainHeight()
        }
      })
    },

    // 上传失败处理
    handleUploadFileError () {
      this.$message.error('文件上传发生错误！')
    },

    // 删除文件
    handleRemoveFile (file) {
      // 1. 根据URL查找索引
      const _index = this.doc_att_file.lastIndexOf(file.url)

      // 2. 从两个数组中同步删除
      this.doc_att.splice(_index, 1)
      this.doc_att_file.splice(_index, 1)

      // 3. 同步到userInput.content.value
      const fileInput = this.userInputs.find(input => input.content.type === 4)
      if (fileInput) {
        fileInput.content.value = this.doc_att_file
      }

      // 4. 删除附件后，footer高度变化，需要通知父组件重新计算布局
      // 使用$nextTick确保DOM更新后再触发父组件的布局重算
      this.$nextTick(() => {
        // 触发父组件的updated生命周期（通过强制更新父组件）
        if (this.$parent && this.$parent.calculateMainHeight) {
          this.$parent.calculateMainHeight()
        }
      })
    },

    // 格式化时间戳
    formatTimestamp (timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },

    // 验证用户输入
    validateUserInputs () {
      // 检查所有必填参数（包括附件）
      for (const input of this.userInputs) {
        if (input.required) {
          // 附件类型：检查 doc_att_file 是否有内容
          if (input.content.type === 4) {
            if (this.doc_att_file.length === 0) {
              this.$message.warning('请上传文件')
              return false
            }
          } else {
            // 其他类型：检查 value 是否为空
            if (input.content.value === null || input.content.value === '') {
              this.$message.warning('请输入所有必填参数')
              return false
            }
          }
        }
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

      // 构造输入数据（添加附件支持）
      const inputs = this.userInputs.map(input => ({
        name: input.name,
        content: {
          type: input.content.type,
          value: input.content.value, // 对于FILES类型，这是URL数组
          title: input.content.title
        },
        required: input.required,
        // 新增：如果是附件类型，附加完整附件对象（用于展示）
        attachments: input.content.type === 4 ? this.doc_att : undefined
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
      // 清空附件
      this.doc_att = []
      this.doc_att_file = []

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
    },

    /**
     * 设置人机交互模式（由父组件调用）
     */
    setHumanFeedback (runtimeUuid, tip) {
      this.humanFeedback = true
      this.humanFeedbackTip = tip || '请输入您的反馈'
      this.humanFeedbackContent = ''
      this.currentRuntimeUuid = runtimeUuid
      this.$message.info(this.humanFeedbackTip)
    },

    /**
     * 恢复工作流执行（人机交互）
     */
    async handleResume () {
      if (!this.humanFeedbackContent || this.humanFeedbackContent.trim() === '') {
        this.$message.warning('请输入反馈内容')
        return
      }

      this.submitting = true
      try {
        // 需要通过runtime.id获取，所以需要父组件传递
        this.$emit('resume', {
          runtimeUuid: this.currentRuntimeUuid,
          feedbackContent: this.humanFeedbackContent
        })
      } catch (error) {
        console.error('恢复工作流失败:', error)
        this.$message.error(error.message || '恢复工作流失败')
      } finally {
        // 重置人机交互状态
        this.humanFeedback = false
        this.humanFeedbackTip = ''
        this.humanFeedbackContent = ''
        this.currentRuntimeUuid = ''
      }
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

/* 人机交互输入区域样式 */
.human-feedback-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  width: 100%;
}

.feedback-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;

  i {
    font-size: 18px;
    color: #f56c6c;
  }

  .alert-text {
    font-size: 14px;
    color: #f56c6c;
    font-weight: 500;
  }
}

.feedback-input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  .feedback-tip {
    font-size: 13px;
    line-height: 1.6;
    color: #606266;
  }
}

// 附件删除链接样式
.clickable {
  cursor: pointer;
  color: #409EFF;
  text-decoration: underline;

  &:hover {
    color: #66b1ff;
  }
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;

  ::v-deep .el-button--primary {
    background-color: #409eff;
    border-color: #409eff;

    &:hover {
      background-color: #66b1ff;
      border-color: #66b1ff;
    }
  }
}
</style>
