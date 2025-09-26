<template>
  <!-- AI模型编辑抽屉 - 基于MeterSphere modelEditDrawer.vue实现 -->
  <el-drawer
    :visible="visible"
    :title="modelTitle"
    size="50%"
    :before-close="handleDrawerCancel"
    class="model-edit-drawer"
    destroy-on-close
  >
    <div class="drawer-content">
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
            <el-form-item label="模型名称" prop="name" class="model-name-form">
              <template #label>
                <div class="flex items-center">
                  模型名称
                  <el-tooltip content="为模型设置一个易于识别的名称" placement="top">
                    <i class="el-icon-question ml-1 text-gray-400" />
                  </el-tooltip>
                </div>
              </template>
              <el-input
                v-model="form.name"
                maxlength="255"
                placeholder="请输入模型名称"
                show-word-limit
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="模型类型" prop="type">
                  <el-select v-model="form.type" placeholder="请选择模型类型" class="w-full">
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
                <el-form-item label="基础模型" prop="baseName">
                  <el-autocomplete
                    v-model="form.baseName"
                    :fetch-suggestions="fetchSuggestions"
                    placeholder="请输入或选择基础模型"
                    class="w-full"
                    clearable
                    @select="selectAutoComplete"
                    @clear="clearBaseName"
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

            <el-form-item label="API地址" prop="apiUrl">
              <el-input
                v-model="form.apiUrl"
                maxlength="255"
                placeholder="请输入API地址"
              />
            </el-form-item>

            <el-form-item label="API密钥" prop="appKey">
              <el-input
                v-model="form.appKey"
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
            <div class="advanced-params">
              <div
                v-for="param in form.advSettingDTOList"
                :key="param.name"
                class="param-item"
              >
                <div class="param-header">
                  <div class="param-info">
                    <label class="param-name">{{ param.name }}</label>
                    <span class="param-label">{{ param.label }}</span>
                  </div>
                  <el-switch
                    v-model="param.enable"
                    class="param-switch"
                  />
                </div>

                <div v-if="param.enable" class="param-control">
                  <el-input-number
                    v-model="param.value"
                    :min="param.minValue"
                    :max="param.maxValue"
                    :precision="param.name === 'maxTokens' ? 0 : 1"
                    :step="param.name === 'maxTokens' ? 1 : 0.1"
                    class="w-full"
                  />
                  <div class="param-range">
                    范围：{{ param.minValue }} - {{ param.maxValue }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 底部操作按钮 -->
    <div class="drawer-footer">
      <el-button @click="handleDrawerCancel">取消</el-button>
      <el-button
        v-if="!currentModelId"
        type="primary"
        :loading="loading"
        @click="handleDrawerConfirm(true)"
      >
        保存并继续
      </el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleDrawerConfirm(false)"
      >
        {{ currentModelId ? '更新' : '保存' }}
      </el-button>
    </div>
  </el-drawer>
</template>

<script>
import {
  modelTypeOptions,
  ModelTypeEnum,
  ModelPermissionTypeEnum,
  ModelOwnerTypeTypeEnum,
  baseModelTypeMap,
  ModelBaseTypeEnum
} from '../../constants/model'
import {
  getModelDefaultConfig,
  transformModelConfig
} from '../../utils/modelUtils'
import {
  editModelConfig,
  getModelConfigDetail
} from '../../api/model'

export default {
  name: 'ModelEditDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentModelId: {
      type: String,
      default: ''
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
        type: ModelTypeEnum.LLM,
        providerName: ModelBaseTypeEnum.DeepSeek,
        permissionType: ModelPermissionTypeEnum.PUBLIC,
        status: true,
        owner: '',
        ownerType: ModelOwnerTypeTypeEnum.SYSTEM,
        baseName: '',
        appKey: '',
        apiUrl: '',
        advSettingDTOList: []
      },

      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择模型类型', trigger: 'change' }
        ],
        baseName: [
          { required: true, message: '请选择基础模型', trigger: 'blur' }
        ],
        apiUrl: [
          { required: true, message: '请输入API地址', trigger: 'blur' }
        ],
        appKey: [
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
      const action = this.currentModelId ? '编辑模型' : '添加模型'
      return `${action}（${this.supplierModelItem.name}）`
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.initForm()
        this.initBaseModelName()
        if (this.currentModelId) {
          this.getDetail()
        }
      }
    }
  },
  methods: {
    /**
     * 初始化表单
     */
    initForm () {
      this.form = {
        id: '',
        name: '',
        type: ModelTypeEnum.LLM,
        providerName: this.supplierModelItem.value,
        permissionType: this.modelKey === 'personal'
          ? ModelPermissionTypeEnum.PRIVATE
          : ModelPermissionTypeEnum.PUBLIC,
        status: true,
        owner: this.modelKey === 'personal' ? this.getCurrentUserId() : '',
        ownerType: this.modelKey === 'personal'
          ? ModelOwnerTypeTypeEnum.PERSONAL
          : ModelOwnerTypeTypeEnum.SYSTEM,
        baseName: '',
        appKey: '',
        apiUrl: '',
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
      if (!this.currentModelId) return

      try {
        const detail = await getModelConfigDetail(this.currentModelId)
        this.form = {
          ...this.form,
          ...detail
        }
      } catch (error) {
        console.error('获取模型详情失败:', error)
        this.$message.error('获取模型详情失败')
      }
    },

    /**
     * 自动完成建议
     */
    fetchSuggestions (queryString, callback) {
      const suggestions = this.baseModelTypeOptions
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
     * 选择自动完成选项
     */
    selectAutoComplete (item) {
      this.form.baseName = item.value
      this.form.advSettingDTOList = getModelDefaultConfig(
        this.supplierModelItem.value,
        this.form.baseName
      )
    },

    /**
     * 清空基础模型
     */
    clearBaseName () {
      this.form.advSettingDTOList = []
    },

    /**
     * 取消操作
     */
    handleDrawerCancel () {
      this.$refs.formRef?.resetFields()
      this.initForm()
      this.$emit('close')
      this.$emit('update:visible', false)
    },

    /**
     * 确认操作
     */
    handleDrawerConfirm (isContinue = false) {
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
            this.$message.error(`参数 ${param.label} 的值必须在 ${param.minValue} - ${param.maxValue} 之间`)
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
        // 转换数据格式
        const submitData = transformModelConfig(this.form)

        await editModelConfig(submitData)

        const action = this.form.id ? '更新' : '创建'
        this.$message.success(`${action}成功`)

        this.$emit('refresh')

        if (isContinue) {
          // 继续添加，重置表单
          this.initForm()
          this.$refs.formRef?.resetFields()
        } else {
          // 关闭抽屉
          this.handleDrawerCancel()
        }
      } catch (error) {
        console.error('保存模型失败:', error)
        this.$message.error('保存模型失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取当前用户ID
     */
    getCurrentUserId () {
      // 根据SCM前端的用户管理方式获取用户ID
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        return userInfo.id || ''
      } catch (e) {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.model-edit-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.drawer-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.drawer-footer {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
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

.advanced-params {
  space-y: 16px;
}

.param-item {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}

.param-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.param-info {
  flex: 1;
}

.param-name {
  display: block;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.param-label {
  font-size: 12px;
  color: #909399;
}

.param-switch {
  flex-shrink: 0;
}

.param-control {
  margin-top: 12px;
}

.param-range {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
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
</style>
