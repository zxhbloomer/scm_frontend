<template>
  <!-- AI模型编辑弹窗 -->
  <el-dialog
    v-el-drag-dialog
    :visible="visible"
    :title="modelTitle"
    width="800px"
    :before-close="handleDialogCancel"
    :close-on-click-modal="false"
    class="model-edit-dialog"
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
            <!-- 只读信息展示区域 -->
            <div class="readonly-info-section">
              <div class="info-row">
                <span class="info-label">模型名称：</span>
                <span class="info-value">{{ form.name || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">模型类型：</span>
                <span class="info-value">{{ getModelTypeLabel(form.modelType) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">基础模型：</span>
                <span class="info-value">{{ form.modelName || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">部署名称：</span>
                <span class="info-value">{{ form.deploymentName || '-' }} <span style="color: #909399; font-size: 12px;">(Azure场景使用)</span></span>
              </div>
            </div>

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
        @click="handleDialogConfirm"
      >
        更新
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
import {
  editModelConfig,
  getModelConfigDetail
} from '../../api/model'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'ModelEditDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentModelId: {
      type: String,
      required: true // 编辑对话框必须提供模型ID
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
        id: '',
        name: '',
        modelName: '',
        modelType: ModelTypeEnum.LLM,
        provider: ModelBaseTypeEnum.DeepSeek,
        enabled: true,
        deploymentName: '',
        apiKey: '',
        baseUrl: '',
        temperature: 0.7,
        maxTokens: 1024,
        topP: 1.0,
        timeout: 60,
        supportChat: false,
        supportVision: false,
        supportEmbedding: false,
        advSettingDTOList: []
      }
    }
  },

  computed: {
    /**
     * 弹窗标题
     */
    modelTitle () {
      return `编辑模型（${this.supplierModelItem.name}）`
    },

    /**
     * 表单验证规则 - 编辑模式下modelName/modelType/deploymentName不可修改，无需验证
     */
    formRules () {
      return {
        baseUrl: [
          { required: true, message: '请输入API地址', trigger: 'blur' }
        ],
        apiKey: [
          { required: true, message: '请输入API密钥', trigger: 'blur' }
        ]
      }
    }
  },

  watch: {
    visible (val) {
      if (val && this.currentModelId) {
        // 对话框打开且有模型ID时加载数据
        this.loadData()
      }
    },

    currentModelId (val) {
      if (val && this.visible) {
        // 有模型ID且对话框已打开时加载数据
        this.loadData()
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
     * 加载数据（统一入口）
     */
    loadData () {
      this.initForm()
      this.initBaseModelName()
      this.getDetail()
    },

    /**
     * 初始化表单
     */
    initForm () {
      this.form = {
        id: '',
        name: '',
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
     * 获取模型详情
     */
    async getDetail () {
      // 检查currentModelId是否有效
      if (!this.currentModelId) {
        return
      }

      try {
        const response = await getModelConfigDetail(this.currentModelId)
        const detail = response.data || response

        // 兼容驼峰命名和下划线命名
        const name = detail.name || ''
        const modelName = detail.modelName || detail.model_name || ''
        const deploymentName = detail.deploymentName || detail.base_name || ''
        const modelType = detail.modelType || detail.type || ModelTypeEnum.LLM
        const apiKey = detail.apiKey || detail.api_key || ''
        const baseUrl = detail.baseUrl || detail.api_url || ''
        const enabled = detail.enabled !== undefined ? detail.enabled : (detail.status !== undefined ? detail.status : true)

        const advSettings = this.buildAdvSettingDTOList(detail)

        // 使用兼容后的字段
        this.form = {
          ...this.form,
          id: detail.id || '',
          name: name,
          modelName: modelName,
          modelType: modelType,
          provider: detail.provider || this.supplierModelItem.value,
          enabled: enabled,
          deploymentName: deploymentName,
          apiKey: apiKey,
          baseUrl: baseUrl,
          advSettingDTOList: advSettings
        }
      } catch (error) {
        this.showErrorMsg('获取模型详情失败')
      }
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
    handleDialogConfirm () {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return

        // 验证高级参数
        if (!this.validateAdvancedParams()) {
          return
        }

        await this.handleSave()
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
    async handleSave () {
      this.loading = true
      try {
        // 将advSettingDTOList转换为直接字段
        const submitData = {
          id: this.form.id,
          name: this.form.name,
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

        this.$message.success('更新成功')
        this.$emit('refresh')

        // 关闭对话框
        this.handleDialogCancel()
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
    },

    /**
     * 获取模型类型的显示标签
     */
    getModelTypeLabel (modelType) {
      const option = this.modelTypeOptions.find(opt => opt.value === modelType)
      return option ? option.label : modelType || '-'
    }
  }
}
</script>

<style scoped>
.model-edit-dialog :deep(.el-dialog__body) {
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

/* 只读信息展示区域 */
.readonly-info-section {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  line-height: 1.5;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 90px;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #303133;
  flex: 1;
  word-break: break-all;
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
</style>
