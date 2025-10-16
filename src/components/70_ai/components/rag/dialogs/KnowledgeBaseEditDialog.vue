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

            <div class="form-item">
              <div class="form-label">Token计数器</div>
              <el-radio-group
                v-model="formData.ingestTokenEstimator"
                @change="handleTokenEstimatorChange"
              >
                <el-radio
                  v-for="item in tokenEstimatorOptions"
                  :key="item.value"
                  :label="item.value"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-collapse-item>

        <!-- 文档索引设置（图谱） -->
        <el-collapse-item title="文档索引设置（图谱）" name="graph">
          <div class="form-section">
            <div class="form-item">
              <div class="form-label">
                模型名称
                <el-tooltip placement="top">
                  <div slot="content">
                    抽取图数据时使用的模型，为空则使用第一个可用的模型
                  </div>
                  <i class="el-icon-question" />
                </el-tooltip>
              </div>
              <el-select
                v-model="formData.ingestModelId"
                style="width: 100%"
                placeholder="请选择模型"
                collapse-tags
                loading-text="拼命加载..."
                :popper-append-to-body="false"
              >
                <el-option
                  v-for="item in llmList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </div>
          </div>
        </el-collapse-item>

        <!-- 文档召回设置 -->
        <el-collapse-item title="文档召回设置" name="retrieve">
          <div class="form-section">
            <div class="form-item">
              <div class="form-label">文档召回最大数量</div>
              <el-input-number
                v-model="formData.retrieveMaxResults"
                style="width: 100%"
              />
            </div>

            <div class="form-item">
              <div class="form-label">文档召回最小分数</div>
              <el-input-number
                v-model="formData.retrieveMinScore"
                :precision="1"
                :min="0"
                :max="1"
                style="width: 100%"
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
              <div class="form-label">响应时的创造性/随机性</div>
              <el-input-number
                v-model="formData.queryLlmTemperature"
                :precision="1"
                :min="0"
                :max="1"
                style="width: 100%"
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
import { TOKEN_ESTIMATOR } from '../constants/knowledgeBase'
import { createEmptyKbInfo } from '../utils/knowledgeBaseUtils'
import knowledgeBaseService from '../api/knowledgeBaseService'
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
      activeNames: ['vector'],
      tokenEstimatorOptions: TOKEN_ESTIMATOR
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

      // 设置默认Token计数器
      if (!this.formData.ingestTokenEstimator && TOKEN_ESTIMATOR.length > 0) {
        this.formData.ingestTokenEstimator = TOKEN_ESTIMATOR[0].value
      }
    },

    /**
     * 处理Token计数器变化
     */
    handleTokenEstimatorChange (value) {
      this.formData.ingestTokenEstimator = value
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

.form-item {
  margin-bottom: 20px;
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
</style>
