<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    :title="isEdit ? '编辑知识库' : '新建知识库'"
    width="700px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    destroy-on-close
    class="kb-edit-dialog"
    @close="handleClose"
  >
    <div class="kb-edit-container">
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="form-item">
          <div class="form-label">
            标题<span class="required">*</span>
          </div>
          <el-input
            v-model="formData.title"
            maxlength="100"
            show-word-limit
            placeholder="请输入标题"
          />
        </div>

        <div class="form-item">
          <div class="form-label">描述</div>
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入描述"
          />
        </div>

        <div class="form-item">
          <div class="form-label">是否公开</div>
          <el-radio-group v-model="formData.isPublic">
            <el-radio :label="true">公开</el-radio>
            <el-radio :label="false">私有</el-radio>
          </el-radio-group>
        </div>

        <div class="form-item">
          <div class="form-label">
            严格模式
            <el-tooltip placement="top">
              <div slot="content">
                严格模式：严格匹配知识库，知识库中如无搜索结果，直接返回无答案<br>
                宽松模式：知识库中如无搜索结果，将用户提问传给LLM继续请求答案
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
          </div>
          <el-radio-group v-model="formData.isStrict">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 高级配置 -->
      <el-collapse v-model="activeNames" class="config-collapse">
        <!-- 文档索引设置（向量） -->
        <el-collapse-item title="文档索引设置（向量）" name="vector">
          <div class="form-section">
            <div class="form-item">
              <div class="form-label">
                文档切割时重叠数量（改动后对新索引生效）
              </div>
              <el-input-number
                v-model="formData.ingestMaxOverlap"
                style="width: 100%"
              />
            </div>
          </div>
        </el-collapse-item>

        <!-- 文档召回设置 -->
        <el-collapse-item title="文档召回设置" name="retrieve">
          <div class="form-section">
            <div class="form-item">
              <div class="form-label">
                文档召回最大数量
                <el-tooltip placement="top">
                  <div slot="content">
                    控制返回文档片段的数量（Top-K检索）<br>
                    LangChain推荐值：5（适用于大多数场景）<br>
                    合理范围：3-100
                  </div>
                  <i class="el-icon-question" />
                </el-tooltip>
              </div>
              <el-slider
                v-model="formData.retrieveMaxResults"
                :min="1"
                :max="100"
                :step="1"
                :marks="{5: '推荐'}"
                show-input
                :show-input-controls="false"
              />
            </div>

            <div class="form-item">
              <div class="form-label">
                文档召回最小分数
                <el-tooltip placement="top">
                  <div slot="content">
                    过滤低质量结果，只保留相似度 ≥ 阈值的文档<br>
                    LangChain推荐值：0.5（标准模式）<br>
                    0.0-0.5：宽松模式，0.5-0.7：标准模式，0.7-1.0：严格模式
                  </div>
                  <i class="el-icon-question" />
                </el-tooltip>
              </div>
              <el-slider
                v-model="formData.retrieveMinScore"
                :min="0"
                :max="1"
                :step="0.05"
                :marks="{0.5: '推荐'}"
                show-input
                :show-input-controls="false"
              />
            </div>
          </div>
        </el-collapse-item>

        <!-- 大模型参数设置 -->
        <el-collapse-item title="大模型参数设置" name="llm">
          <div class="form-section">
            <div class="form-item">
              <div class="form-label">系统提示词（角色设定）</div>
              <el-input
                v-model="formData.querySystemMessage"
                type="textarea"
                :rows="3"
                placeholder="请输入系统提示词"
              />
            </div>

            <div class="form-item">
              <div class="form-label">
                响应时的创造性/随机性（Temperature）
                <el-tooltip placement="top">
                  <div slot="content">
                    控制LLM输出的随机性和创造性<br>
                    0：完全确定性（每次相同问题得到相同答案）<br>
                    0-0.3：推荐用于知识库问答（准确性优先）<br>
                    0.5-0.7：适合对话场景（平衡准确性和自然性）<br>
                    0.7-1.0：高创造性（适合创意写作，可能产生幻觉）
                  </div>
                  <i class="el-icon-question" />
                </el-tooltip>
              </div>
              <el-slider
                v-model="formData.queryLlmTemperature"
                :min="0"
                :max="1"
                :step="0.1"
                :marks="{0: '推荐', 0.5: '平衡', 1.0: '创造'}"
                show-input
                :show-input-controls="false"
              />
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
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
import { createEmptyKbInfo } from '../utils/knowledgeBaseUtils'
import knowledgeBaseService from '../../../api/knowledgeBaseService'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'KnowledgeBaseEditDialog',

  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    kbInfo: {
      type: Object,
      default: null
    },
    llmList: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      submitting: false,
      formData: createEmptyKbInfo(),
      activeNames: ['vector']
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

    kbInfo: {
      handler (val) {
        if (val && this.visible) {
          this.initFormData()
        }
      },
      deep: true
    },

    llmList: {
      handler (val) {
        if (this.visible && val && val.length > 0) {
          this.initFormData()
        }
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    /**
     * 初始化表单数据
     */
    initFormData () {
      if (this.kbInfo && this.kbInfo.id !== '0') {
        // 编辑模式
        this.formData = { ...this.kbInfo }

        // 类型转换：将数字转换为布尔值
        this.formData.isPublic = Boolean(this.formData.isPublic)
        this.formData.isStrict = Boolean(this.formData.isStrict)

        // 确保模型ID有效
        if (this.formData.ingestModelId) {
          const modelExists = this.llmList.find(
            item => item.id === this.formData.ingestModelId
          )
          if (!modelExists) {
            this.formData.ingestModelId = ''
          }
        }
      } else {
        // 新建模式
        this.formData = createEmptyKbInfo()

        // 设置默认模型（选择第一个模型）
        if (this.llmList && this.llmList.length > 0) {
          const firstModel = this.llmList[0]
          if (firstModel) {
            this.formData.ingestModelId = firstModel.id
          }
        }
      }
    },

    /**
     * 提交表单
     */
    async handleSubmit () {
      this.submitting = true
      try {
        const response = await knowledgeBaseService.saveOrUpdate(this.formData)
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
      this.formData = createEmptyKbInfo()
      this.activeNames = ['vector']
    }
  }
}
</script>

<style scoped>
.kb-edit-container {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.form-section {
  margin-bottom: 20px;
}

/* 折叠面板内的 form-section 不需要底部间距 */
.config-collapse .form-section {
  margin-bottom: 0;
}

.form-item {
  margin-bottom: 20px;
}

/* 折叠面板内最后一个 form-item 不需要底部间距 */
.config-collapse .form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.required {
  color: #f56c6c;
  margin-left: 4px;
}

.form-label .el-icon-question {
  margin-left: 5px;
  color: #909399;
  cursor: pointer;
}

.config-collapse {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>

<style>
/* 知识库编辑弹窗样式调整（非scoped，全局生效） */
.kb-edit-dialog .el-dialog {
  margin-top: 5vh !important;
}

/* 手风琴折叠面板样式 */
.kb-edit-dialog .el-collapse-item__content {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.kb-edit-dialog .el-collapse-item__wrap {
  border-bottom: none;
}

.kb-edit-dialog .el-collapse-item {
  margin-bottom: 10px;
}
</style>
