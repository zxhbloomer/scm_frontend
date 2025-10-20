<template>
  <!-- AI模型设置主弹窗 -->
  <el-dialog
    v-el-drag-dialog
    :visible="visible"
    title="AI模型设置"
    width="80%"
    :before-close="handleClose"
    :close-on-click-modal="false"
    class="model-settings-dialog"
    :append-to-body="true"
    :modal-append-to-body="true"
  >
    <div class="h-full w-full">
      <!-- 默认模型配置区域 -->
      <div class="default-models-section">
        <div class="section-title">
          <svg-icon icon-class="setting" class="title-icon" />
          默认模型配置
        </div>
        <div class="default-models-grid">
          <div class="default-model-item">
            <span class="model-label">默认语言模型：</span>
            <el-select
              v-model="defaultModels.llm"
              placeholder="请选择默认语言模型"
              clearable
              filterable
              @change="updateDefaultModel('LLM')"
            >
              <el-option
                v-for="model in llmModels"
                :key="model.id"
                :label="getModelOptionLabel(model)"
                :value="model.id"
              >
                <span class="model-option">
                  <svg-icon :icon-class="getModelSvg(model)" class="option-icon" />
                  <span>{{ getModelName(model) }}</span>
                </span>
              </el-option>
            </el-select>
          </div>

          <div class="default-model-item">
            <span class="model-label">默认视觉模型：</span>
            <el-select
              v-model="defaultModels.vision"
              placeholder="请选择默认视觉模型"
              clearable
              filterable
              @change="updateDefaultModel('VISION')"
            >
              <el-option
                v-for="model in visionModels"
                :key="model.id"
                :label="getModelOptionLabel(model)"
                :value="model.id"
              >
                <span class="model-option">
                  <svg-icon :icon-class="getModelSvg(model)" class="option-icon" />
                  <span>{{ getModelName(model) }}</span>
                </span>
              </el-option>
            </el-select>
          </div>

          <div class="default-model-item">
            <span class="model-label">默认嵌入模型：</span>
            <el-select
              v-model="defaultModels.embedding"
              placeholder="请选择默认嵌入模型"
              clearable
              filterable
              @change="updateDefaultModel('EMBEDDING')"
            >
              <el-option
                v-for="model in embeddingModels"
                :key="model.id"
                :label="getModelOptionLabel(model)"
                :value="model.id"
              >
                <span class="model-option">
                  <svg-icon :icon-class="getModelSvg(model)" class="option-icon" />
                  <span>{{ getModelName(model) }}</span>
                </span>
              </el-option>
            </el-select>
          </div>
        </div>
      </div>

      <!-- 分割面板：左侧供应商列表，右侧模型列表 -->
      <div class="model-settings-container">
        <!-- 左侧供应商列表 -->
        <div class="model-list-wrapper">
          <div class="model-config-title">供应商</div>
          <div>
            <div
              v-for="item of modelList"
              :key="item.value"
              :class="`model-item supplier-item ${item.value === activeModelType ? 'active' : ''}`"
              @click="changeModelType(item)"
            >
              <div class="supplier-icon-wrapper">
                <svg-icon :icon-class="item.icon" class="supplier-icon" />
              </div>
              <div>{{ item.name }}</div>
            </div>
          </div>
        </div>

        <!-- 右侧模型配置区域 -->
        <div class="model-config-content">
          <div class="content-padding">
            <!-- 顶部操作栏 - 搜索框在右上角 -->
            <div class="top-toolbar">
              <!-- 左侧：添加按钮 -->
              <div class="left-actions">
                <el-button v-if="hasPermission()" type="primary" @click="addModel">
                  添加模型
                </el-button>
              </div>
              <!-- 右侧：搜索框 -->
              <div class="right-actions">
                <el-input
                  v-model="keyword"
                  placeholder="请输入模型名称搜索"
                  class="search-input"
                  clearable
                  @clear="searchData"
                  @input="searchData"
                >
                  <template #suffix>
                    <i class="el-icon-search" />
                  </template>
                </el-input>
              </div>
            </div>

            <!-- 模型卡片列表 -->
            <div class="model-config-card-list-wrapper">
              <ScmCardList
                ref="modelCardListRef"
                mode="remote"
                :remote-func="getModelConfigListWrapper"
                :remote-params="{
                  keyword: keyword,
                  providerName: activeModelType
                }"
                :card-min-width="320"
                class="flex-1"
                :shadow-limit="50"
                :is-proportional="false"
                :gap="16"
              >
                <template #item="{ item }">
                  <div class="model-card">
                    <!-- 模型卡片头部 -->
                    <div class="model-item-header">
                      <div class="model-item-img">
                        <svg-icon :icon-class="getModelSvg(item)" class="model-icon" />
                      </div>
                      <div class="model-item-info">
                        <el-tooltip :content="getModelName(item)" :disabled="(getModelName(item) || '').length <= 20">
                          <div class="one-line-text model-name">{{ getModelName(item) }}</div>
                        </el-tooltip>
                        <div class="model-creator">
                          <span class="creator-label">创建者</span>
                          <el-tooltip :content="item.createUserName" :disabled="(item.createUserName || '').length <= 15">
                            <span class="one-line-text creator-name">{{ item.createUserName || '-' }}</span>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>

                    <!-- 模型卡片内容 -->
                    <div class="model-item-body">
                      <div class="model-item-body-label">
                        <div class="body-label-item">模型类型</div>
                        <div class="body-label-item">基础模型</div>
                      </div>
                      <div class="model-item-body-value">
                        <el-tooltip :content="getTypeName(item)" :disabled="(getTypeName(item) || '').length <= 20">
                          <div class="one-line-text body-value-item">{{ getTypeName(item) }}</div>
                        </el-tooltip>
                        <el-tooltip :content="getDeploymentName(item)" :disabled="(getDeploymentName(item) || '').length <= 20">
                          <div class="one-line-text body-value-item">{{ getDeploymentName(item) }}</div>
                        </el-tooltip>
                      </div>
                    </div>

                    <!-- 模型卡片底部操作 -->
                    <div class="model-item-footer">
                      <div class="footer-buttons">
                        <el-button
                          v-if="hasPermission()"
                          type="primary"
                          size="small"
                          plain
                          @click="editModel(item)"
                        >
                          编辑
                        </el-button>
                        <el-button
                          v-if="hasPermission()"
                          type="danger"
                          size="small"
                          plain
                          @click="deleteModel(item)"
                        >
                          删除
                        </el-button>
                      </div>

                      <el-switch
                        :value="item.enabled"
                        :disabled="!hasPermission()"
                        @change="(val) => changeStatus(val, item)"
                      />
                    </div>
                  </div>
                </template>
              </ScmCardList>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型添加弹窗 -->
    <ModelAddDialog
      :visible="showModelAddDrawer"
      :supplier-model-item="supplierModelItem"
      :model-key="'system'"
      @close="showModelAddDrawer = false"
      @refresh="refreshHandler"
      @update:visible="showModelAddDrawer = $event"
    />

    <!-- 模型编辑弹窗 -->
    <ModelEditDialog
      :visible="showModelEditDrawer"
      :current-model-id="currentModelId"
      :supplier-model-item="supplierModelItem"
      :model-key="'system'"
      @close="handleCancel"
      @refresh="refreshHandler"
      @update:visible="showModelEditDrawer = $event"
    />
  </el-dialog>
</template>

<script>
import { modelList, modelTypeOptions } from '../../constants/model'
import { getModelSvg, characterLimit } from '../../utils/modelUtils'
import { getModelConfigList, editModelConfig, deleteModelConfig, getLlmModels, getVisionModels, getEmbeddingModels, getDefaultModels, setDefaultModel } from '../../api/model'
import ModelAddDialog from './ModelAddDialog.vue'
import ModelEditDialog from './ModelEditDialog.vue'
import ScmCardList from '../common/ScmCardList.vue'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'ModelSettingsDialog',
  components: {
    ModelAddDialog,
    ModelEditDialog,
    ScmCardList
  },
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      modelList: modelList,
      activeModelType: 'ALL', // 默认选中"全部"
      supplierModelItem: modelList[0], // 当前选中的供应商（"全部"）
      keyword: '', // 搜索关键词
      loading: false,
      showModelAddDrawer: false, // 添加对话框显示状态
      showModelEditDrawer: false, // 编辑对话框显示状态
      currentModelId: '', // 当前编辑的模型ID
      llmModels: [], // 可用的语言模型列表
      visionModels: [], // 可用的视觉模型列表
      embeddingModels: [], // 可用的嵌入模型列表
      defaultModels: {
        llm: null,
        vision: null,
        embedding: null
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.loadDefaultModels()
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    /**
     * 初始化
     */
    init () {
      // 设置默认选中"全部"（modelList[0]）
      this.supplierModelItem = this.modelList[0]
      this.activeModelType = this.modelList[0].value
    },

    /**
     * 包装getModelConfigList，适配ScmCardList组件
     */
    async getModelConfigListWrapper (params) {
      // 构建查询参数
      const queryParams = {
        keyword: params.keyword || ''
      }

      // 只有不是"全部"时，才传providerName参数
      if (params.providerName && params.providerName !== 'ALL') {
        queryParams.providerName = params.providerName
      }

      const response = await getModelConfigList(queryParams)
      return response
    },

    /**
     * 切换模型供应商
     */
    changeModelType (item) {
      this.keyword = ''
      this.activeModelType = item.value
      this.supplierModelItem = item
      // ScmCardList会通过watch remoteParams自动重新加载数据，无需手动调用reload
    },

    /**
     * 搜索数据
     */
    searchData () {
      // ScmCardList会通过watch remoteParams自动重新加载数据，无需手动调用reload
    },

    /**
     * 添加模型
     */
    addModel () {
      // 判断是否选择了"全部"
      if (this.activeModelType === 'ALL') {
        this.showErrorMsg('请先选择供应商，然后点击"添加模型"按钮完成模型的添加')
        return
      }

      this.showModelAddDrawer = true
    },

    /**
     * 编辑模型
     */
    editModel (item) {
      // 设置当前编辑的模型ID
      this.currentModelId = String(item.id || '')

      // 根据模型的provider字段找到对应的供应商配置
      const foundSupplier = this.modelList.find(supplier => supplier.value === item.provider)
      if (foundSupplier) {
        this.supplierModelItem = foundSupplier
      }

      // 显示编辑对话框
      this.showModelEditDrawer = true
    },

    /**
     * 删除模型
     */
    deleteModel (item) {
      const modelName = item.modelName || item.model_name
      this.$confirm(
        `确定要删除模型 "${characterLimit(modelName)}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await deleteModelConfig(item.id)
          this.$message.success('删除成功')
          this.$refs.modelCardListRef?.reload()
        } catch (error) {
          this.showErrorMsg('删除模型失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },

    /**
     * 切换模型状态
     */
    async changeStatus (newValue, item) {
      const action = newValue ? '启用' : '禁用'
      const modelName = item.modelName || item.model_name

      if (!newValue) {
        // 禁用时需要确认
        try {
          await this.$confirm(
            `确定要${action}模型 "${characterLimit(modelName)}" 吗？`,
            '状态确认',
            {
              confirmButtonText: `确认${action}`,
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
        } catch {
          return // 用户取消
        }
      }

      this.loading = true
      try {
        // 后端字段映射：兼容两种命名方式
        await editModelConfig({
          id: item.id,
          modelName: item.modelName || item.model_name,
          modelType: item.modelType || item.type,
          provider: item.provider,
          enabled: newValue,
          deploymentName: item.deploymentName || item.base_name,
          apiKey: item.apiKey || item.api_key,
          baseUrl: item.baseUrl || item.api_url
        })
        this.$message.success(`${action}成功`)
        this.$refs.modelCardListRef?.reload()
      } catch (error) {
        this.showErrorMsg(`${action}模型失败`)
      } finally {
        this.loading = false
      }
    },

    /**
     * 编辑抽屉取消
     */
    handleCancel () {
      this.currentModelId = ''
    },

    /**
     * 刷新处理
     */
    refreshHandler () {
      this.$refs.modelCardListRef?.reload()
      // 同时刷新默认模型配置下拉框数据
      this.loadDefaultModels()
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /**
     * 获取模型图标
     */
    getModelSvg (item) {
      return getModelSvg(item)
    },

    /**
     * 获取模型名称（兼容多种命名方式）
     */
    getModelName (item) {
      if (!item) return '-'
      // 优先使用name字段(显示名称),其次是modelName/model_name(基础模型)
      return item.name || item.modelName || item.model_name || '-'
    },

    /**
     * 获取类型名称
     */
    getTypeName (item) {
      if (!item) return '-'
      // 兼容两种命名：modelType 或 type
      const type = item.modelType || item.type
      const typeOption = modelTypeOptions.find(e => e.value === type)
      return typeOption ? typeOption.label : type || '-'
    },

    /**
     * 获取基础模型名称（兼容两种命名方式）
     */
    getDeploymentName (item) {
      if (!item) return '-'
      // 兼容两种命名：deploymentName 或 base_name
      return item.deploymentName || item.base_name || '-'
    },

    /**
     * 检查权限
     */
    hasPermission () {
      return true
    },

    /**
     * 加载默认模型配置（分别调用4个API）
     */
    async loadDefaultModels () {
      try {
        // 1. 获取语言模型列表
        const llmResponse = await getLlmModels()
        const llmData = llmResponse.data || llmResponse
        this.llmModels = llmData || []

        // 2. 获取视觉模型列表
        const visionResponse = await getVisionModels()
        const visionData = visionResponse.data || visionResponse
        this.visionModels = visionData || []

        // 3. 获取嵌入模型列表
        const embeddingResponse = await getEmbeddingModels()
        const embeddingData = embeddingResponse.data || embeddingResponse
        this.embeddingModels = embeddingData || []

        // 4. 获取默认选中的模型ID
        const defaultResponse = await getDefaultModels()
        const defaultData = defaultResponse.data || defaultResponse
        this.defaultModels = {
          llm: defaultData.defaultLlm || null,
          vision: defaultData.defaultVision || null,
          embedding: defaultData.defaultEmbedding || null
        }
      } catch (error) {
        this.showErrorMsg('加载默认模型配置失败')
      }
    },

    /**
     * 更新默认模型
     * @param {string} modelType - 模型类型：LLM/VISION/EMBEDDING
     */
    async updateDefaultModel (modelType) {
      const modelIdMap = {
        LLM: this.defaultModels.llm,
        VISION: this.defaultModels.vision,
        EMBEDDING: this.defaultModels.embedding
      }

      const modelId = modelIdMap[modelType]

      try {
        await setDefaultModel({
          modelType,
          modelId
        })
        this.$message.success('默认模型设置成功')

        // 更新成功后，重新加载默认模型配置
        await this.loadDefaultModels()
      } catch (error) {
        this.showErrorMsg('设置默认模型失败')
        // 回滚到之前的值
        this.loadDefaultModels()
      }
    },

    /**
     * 获取模型选项标签
     * @param {Object} model - 模型对象
     * @returns {string} - 标签文本
     */
    getModelOptionLabel (model) {
      if (!model) return ''
      // 后端返回的字段是下划线命名：model_name, base_name
      const modelName = model.model_name || model.modelName || ''
      const baseName = model.base_name || model.deploymentName || ''

      if (baseName) {
        return `${modelName} (${baseName})`
      }
      return modelName
    }
  }
}
</script>

<style scoped>
.model-settings-dialog {
  min-height: 700px;
}

/* 默认模型配置区域样式 */
.default-models-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #ecf0f1 100%);
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.title-icon {
  width: 18px !important;
  height: 18px !important;
  margin-right: 8px;
  color: #409eff;
}

.default-models-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.default-model-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  min-width: 110px;
}

.default-model-item .el-select {
  flex: 1;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  width: 16px !important;
  height: 16px !important;
}

.model-settings-container {
  display: flex;
  height: 500px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.model-list-wrapper {
  width: 200px;
  padding: 24px;
  border-right: 1px solid #e4e7ed;
  background-color: #fafafa;
}

.model-config-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 16px;
}

/* 左侧供应商列表样式 */
.model-item {
  padding: 12px 16px;
  border: 1px solid transparent;
  cursor: pointer;
  margin-bottom: 4px;
}

.supplier-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
}

.supplier-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.supplier-icon {
  width: 20px !important;
  height: 20px !important;
}

.model-item:hover {
  background: #f5f5f5;
}

.model-item.active {
  border: 1px solid #409eff;
  color: #409eff;
  background: #ecf5ff;
}

.model-config-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.model-config-card-list-wrapper {
  flex: 1;
  overflow: hidden;
}

.model-config-card-list {
  padding: 16px;
  height: 100%;
  border-radius: 4px;
  background: #f5f5f5;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.model-card {
  border-radius: .375rem;
  background-color: #ffffff;
  padding: 24px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.model-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 卡片头部样式 */
.model-item-header {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
}

.model-item-img {
  display: flex;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f5f5f5;
}

.model-icon {
  width: 24px !important;
  height: 24px !important;
}

.model-item-info {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
}

.model-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.model-creator {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.creator-label {
  color: #959598;
}

.creator-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 卡片内容样式 */
.model-item-body {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-item-body-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #959598;
}

.model-item-body-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.body-value-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 卡片底部样式 */
.model-item-footer {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.one-line-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
}

/* 顶部工具栏样式 */
.top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  width: 100%;
}

.left-actions {
  flex-shrink: 0;
}

.right-actions {
  flex-shrink: 0;
}

.search-input {
  width: 240px;
}

/* 内容区域padding */
.content-padding {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
