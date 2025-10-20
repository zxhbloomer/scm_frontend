<template>
  <!-- AI模型添加弹窗 -->
  <el-dialog
    v-el-drag-dialog
    :visible="visible"
    :title="modelTitle"
    width="800px"
    :before-close="handleDialogCancel"
    :close-on-click-modal="false"
    class="model-add-dialog"
    destroy-on-close
    :append-to-body="true"
    :modal-append-to-body="true"
  >
    <div class="dialog-content">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        label-width="auto"
      >
        <!-- 基础信息 -->
        <div class="form-section">
          <div class="section-title">
            <h3>基础信息</h3>
          </div>

          <div class="section-content">
            <el-form-item prop="modelName" class="model-name-form" required>
              <template #label>
                <div class="flex items-center">
                  模型名称
                  <el-tooltip content="为模型设置一个易于识别的名称" placement="top">
                    <i class="el-icon-question ml-1 text-gray-400" />
                  </el-tooltip>
                </div>
              </template>
              <el-input
                v-model="form.modelName"
                maxlength="255"
                placeholder="请输入模型名称"
                show-word-limit
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="modelType" required>
                  <template #label>
                    <div class="flex items-center">
                      模型类型
                    </div>
                  </template>
                  <el-select
                    v-model="form.modelType"
                    placeholder="请选择模型类型"
                    class="w-full"
                  >
                    <el-option
                      v-for="option in modelTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="deploymentName" required>
                  <template #label>
                    <div class="flex items-center">
                      基础模型
                    </div>
                  </template>
                  <el-autocomplete
                    v-model="form.deploymentName"
                    :fetch-suggestions="fetchSuggestions"
                    placeholder="请输入或选择基础模型"
                    class="w-full"
                    clearable
                    @select="selectAutoComplete"
                    @clear="clearDeploymentName"
                  >
                    <template #default="{ item }">
                      <div class="flex w-full items-center gap-2">
                        <span>{{ item.label }}</span>
                        <el-tooltip v-if="item.tooltip" :content="item.tooltip">
                          <i class="el-icon-info text-gray-400" />
                        </el-tooltip>
                      </div>
                    </template>
                  </el-autocomplete>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="API地址" prop="baseUrl">
              <el-input
                v-model="form.baseUrl"
                maxlength="255"
                placeholder="请输入API地址"
              />
            </el-form-item>

            <el-form-item label="API密钥" prop="apiKey">
              <el-input
                v-model="form.apiKey"
                type="password"
                maxlength="255"
                placeholder="请输入API密钥"
                show-password
              />
            </el-form-item>
          </div>
        </div>

        <!-- 高级设置 -->
        <div v-if="form.advSettingDTOList.length" class="form-section advanced-section">
          <div class="section-title">
            <h3>高级设置</h3>
          </div>

          <div class="section-content">
            <!-- 表格表头 -->
            <div class="advanced-params-header">
              <div class="param-col param-name-col">参数 <span class="required">*</span></div>
              <div class="param-col param-label-col">显示名称 <span class="required">*</span></div>
              <div class="param-col param-value-col">参数值 <span class="required">*</span></div>
              <div class="param-col param-switch-col" />
            </div>

            <!-- 表格内容 -->
            <div class="advanced-params">
              <div
                v-for="param in form.advSettingDTOList"
                :key="param.name"
                class="param-row"
              >
                <div class="param-col param-name-col">
                  <span class="param-name-text">{{ param.name }}</span>
                </div>
                <div class="param-col param-label-col">
                  <span class="param-label-text">{{ param.label }}</span>
                </div>
                <div class="param-col param-value-col">
                  <el-input-number
                    v-model="param.value"
                    :min="param.minValue"
                    :max="param.maxValue"
                    :precision="param.name === 'max_tokens' ? 0 : 1"
                    :step="param.name === 'max_tokens' ? 1 : 0.1"
                    :disabled="!param.enable"
                    class="param-input"
                  />
                </div>
                <div class="param-col param-switch-col">
                  <el-switch
                    v-model="param.enable"
                    class="param-switch"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 底部操作按钮 -->
    <div class="dialog-footer">
      <el-button
        type="primary"
        :loading="loading"
        @click="handleDialogConfirm(false)"
      >
        保存
      </el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleDialogConfirm(true)"
      >
        保存并继续
      </el-button>
      <el-button @click="handleDialogCancel">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  modelTypeOptions,
  ModelTypeEnum,
  baseModelTypeMap,
  ModelBaseTypeEnum
} from '../../constants/model'
import { editModelConfig } from '../../api/model'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'ModelAddDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    supplierModelItem: {
      type: Object,
      default: () => ({
        value: ModelBaseTypeEnum.DeepSeek,
        name: 'DeepSeek',
        icon: 'deepSeek'
      })
    },
    modelKey: {
      type: String,
      default: 'system', // 'system' | 'personal'
      validator: value => ['system', 'personal'].includes(value)
    }
  },
  data () {
    return {
      modelTypeOptions: modelTypeOptions,
      loading: false,
      baseModelTypeOptions: [],

      // 表单数据
      form: {
        modelName: '',
        modelType: ModelTypeEnum.LLM,
        provider: ModelBaseTypeEnum.DeepSeek,
        enabled: true,
        deploymentName: '',
        apiKey: '',
        baseUrl: '',
        // 高级参数直接字段
        temperature: 0.7,
        maxTokens: 1024,
        topP: 1.0,
        timeout: 60,
        // 模型能力标记
        supportChat: false,
        supportVision: false,
        supportEmbedding: false,
        // 保留advSettingDTOList用于UI展示
        advSettingDTOList: []
      },

      // 表单验证规则 - 所有字段必填
      formRules: {
        modelName: [
          { required: true, message: '请输入模型名称', trigger: 'blur' }
        ],
        modelType: [
          { required: true, message: '请选择模型类型', trigger: 'change' }
        ],
        deploymentName: [
          { required: true, message: '请选择基础模型', trigger: 'blur' }
        ],
        baseUrl: [
          { required: true, message: '请输入API地址', trigger: 'blur' }
        ],
        apiKey: [
          { required: true, message: '请输入API密钥', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    /**
     * 弹窗标题
     */
    modelTitle () {
      return `添加模型（${this.supplierModelItem.name}）`
    },

    /**
     * 根据模型类型过滤基础模型列表
     */
    filteredBaseModelOptions () {
      if (!this.form.modelType) {
        return this.baseModelTypeOptions
      }

      // 根据模型类型筛选对应能力的模型
      return this.baseModelTypeOptions.filter(model => {
        switch (this.form.modelType) {
          case 'LLM':
            return model.supportChat === true
          case 'VISION':
            return model.supportVision === true
          case 'EMBEDDING':
            return model.supportEmbedding === true
          default:
            return true
        }
      })
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.initForm()
        this.initBaseModelName()
      }
    },

    /**
     * 监听模型类型变化，清空基础模型选择和能力标记
     */
    'form.modelType' (newVal, oldVal) {
      if (oldVal && newVal !== oldVal) {
        this.form.deploymentName = ''
        this.form.supportChat = false
        this.form.supportVision = false
        this.form.supportEmbedding = false
        this.form.advSettingDTOList = []
      }
    }
  },
  methods: {
    /**
     * 初始化表单
     */
    initForm () {
      this.form = {
        modelName: '',
        modelType: ModelTypeEnum.LLM,
        provider: this.supplierModelItem.value,
        enabled: true,
        deploymentName: '',
        apiKey: '',
        baseUrl: '',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
        timeout: 60,
        // 模型能力标记
        supportChat: false,
        supportVision: false,
        supportEmbedding: false,
        advSettingDTOList: []
      }
    },

    /**
     * 初始化基础模型选项
     */
    initBaseModelName () {
      const models = baseModelTypeMap[this.supplierModelItem.value] || []
      this.baseModelTypeOptions = models.map(e => ({
        ...e,
        value: e.value,
        isShow: true
      }))
    },

    /**
     * 将后端字段转换为前端advSettingDTOList
     */
    buildAdvSettingDTOList (detail) {
      return [
        {
          name: 'temperature',
          label: 'Temperature',
          value: detail.temperature || 0.7,
          minValue: 0,
          maxValue: 2,
          enable: true
        },
        {
          name: 'top_p',
          label: 'Top P',
          value: detail.topP || 1.0,
          minValue: 0,
          maxValue: 1,
          enable: true
        },
        {
          name: 'max_tokens',
          label: 'Max Tokens',
          value: detail.maxTokens || 4096,
          minValue: 1,
          maxValue: 100000,
          enable: true
        },
        {
          name: 'timeout',
          label: 'Timeout (秒)',
          value: detail.timeout || 60,
          minValue: 1,
          maxValue: 600,
          enable: true
        }
      ]
    },

    /**
     * 自动完成建议 - 使用根据模型类型过滤后的选项
     */
    fetchSuggestions (queryString, callback) {
      const suggestions = this.filteredBaseModelOptions
        .filter(item => {
          if (!queryString) return true
          return item.label.toLowerCase().includes(queryString.toLowerCase())
        })
        .map(item => ({
          value: item.value,
          label: item.label,
          tooltip: item.tooltip
        }))

      callback(suggestions)
    },

    /**
     * 选择自动完成选项 - 自动填充能力标记（不显示在UI）
     */
    selectAutoComplete (item) {
      this.form.deploymentName = item.value

      // 自动填充模型能力标记（不显示在UI，但保存到后端）
      const selectedModel = this.filteredBaseModelOptions.find(m => m.value === item.value)
      if (selectedModel) {
        this.form.supportChat = selectedModel.supportChat || false
        this.form.supportVision = selectedModel.supportVision || false
        this.form.supportEmbedding = selectedModel.supportEmbedding || false
      }

      // 生成默认高级设置用于UI展示
      this.form.advSettingDTOList = this.buildAdvSettingDTOList({
        temperature: 0.7,
        topP: 1.0,
        maxTokens: 4096,
        timeout: 60
      })
    },

    /**
     * 清空基础模型
     */
    clearDeploymentName () {
      this.form.advSettingDTOList = []
    },

    /**
     * 取消操作
     */
    handleDialogCancel () {
      this.$refs.formRef?.resetFields()
      this.initForm()
      this.$emit('close')
      this.$emit('update:visible', false)
    },

    /**
     * 确认操作
     */
    handleDialogConfirm (isContinue = false) {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return

        // 验证高级参数
        if (!this.validateAdvancedParams()) {
          return
        }

        await this.handleSave(isContinue)
      })
    },

    /**
     * 验证高级参数
     */
    validateAdvancedParams () {
      for (const param of this.form.advSettingDTOList) {
        if (param.enable) {
          if (param.value < param.minValue || param.value > param.maxValue) {
            this.showErrorMsg(`参数 ${param.label} 的值必须在 ${param.minValue} - ${param.maxValue} 之间`)
            return false
          }
        }
      }
      return true
    },

    /**
     * 保存数据
     */
    async handleSave (isContinue = false) {
      this.loading = true
      try {
        // 将advSettingDTOList转换为直接字段
        const submitData = {
          modelName: this.form.modelName,
          modelType: this.form.modelType,
          provider: this.form.provider,
          enabled: this.form.enabled,
          deploymentName: this.form.deploymentName,
          apiKey: this.form.apiKey,
          baseUrl: this.form.baseUrl,
          // 从advSettingDTOList中提取参数值
          temperature: this.getParamValue('temperature'),
          maxTokens: this.getParamValue('max_tokens'),
          topP: this.getParamValue('top_p'),
          timeout: this.getParamValue('timeout'),
          // 能力标记
          supportChat: this.form.supportChat,
          supportVision: this.form.supportVision,
          supportEmbedding: this.form.supportEmbedding
        }

        await editModelConfig(submitData)

        this.$message.success('创建成功')
        this.$emit('refresh')

        if (isContinue) {
          // 继续添加，重置表单
          this.initForm()
          this.$refs.formRef?.resetFields()
        } else {
          // 关闭弹窗
          this.handleDialogCancel()
        }
      } catch (error) {
        this.showErrorMsg('保存模型失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 从advSettingDTOList中获取参数值
     */
    getParamValue (paramName) {
      const param = this.form.advSettingDTOList.find(p => p.name === paramName)
      return param && param.enable ? param.value : null
    }
  }
}
</script>

<style scoped>
.model-add-dialog :deep(.el-dialog__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 650px;
}

.dialog-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
  gap: 10px;
  background: #fff;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.section-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.section-content {
  padding-left: 0;
}

.advanced-section {
  border-top: 1px dotted #dcdfe6;
  padding-top: 16px;
}

/* 表格表头 */
.advanced-params-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-bottom: none;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.advanced-params-header .required {
  color: #f56c6c;
  margin-left: 2px;
}

/* 表格内容 */
.advanced-params {
  border: 1px solid #e4e7ed;
}

.param-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.param-row:last-child {
  border-bottom: none;
}

.param-row:hover {
  background-color: #f5f7fa;
}

/* 列宽设置 */
.param-col {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.param-name-col {
  flex: 0 0 180px;
  color: #606266;
  font-size: 14px;
}

.param-label-col {
  flex: 0 0 200px;
  color: #606266;
  font-size: 14px;
}

.param-value-col {
  flex: 1;
  min-width: 200px;
}

.param-switch-col {
  flex: 0 0 80px;
  justify-content: center;
}

/* 输入框样式 */
.param-input {
  width: 100%;
}

.param-input :deep(.el-input__inner) {
  text-align: left;
}

/* 开关样式 */
.param-switch {
  flex-shrink: 0;
}

.model-name-form :deep(.el-form-item__label) {
  display: flex !important;
  align-items: center;
  flex-wrap: nowrap;
}

.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 8px;
}

.ml-1 {
  margin-left: 4px;
}

.text-gray-400 {
  color: #909399;
}

/* 模型能力复选框样式 */
.capability-checkboxes {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.capability-checkboxes :deep(.el-checkbox) {
  margin-right: 0;
}
</style>
