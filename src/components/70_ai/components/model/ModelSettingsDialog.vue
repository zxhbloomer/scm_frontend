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
                  owner: '',
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
                        <el-tooltip :content="item.name" :disabled="item.name.length <= 20">
                          <div class="one-line-text model-name">{{ item.name }}</div>
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
                        <el-tooltip :content="getTypeName(item)" :disabled="getTypeName(item).length <= 20">
                          <div class="one-line-text body-value-item">{{ getTypeName(item) }}</div>
                        </el-tooltip>
                        <el-tooltip :content="item.baseName" :disabled="(item.baseName || '').length <= 20">
                          <div class="one-line-text body-value-item">{{ item.baseName || '-' }}</div>
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
                        :value="item.status"
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

    <!-- 模型编辑弹窗 -->
    <ModelEditDialog
      :visible="showModelConfigDrawer"
      :current-model-id="currentModelId"
      :supplier-model-item="supplierModelItem"
      :model-key="'system'"
      @close="handleCancel"
      @refresh="refreshHandler"
      @update:visible="showModelConfigDrawer = $event"
    />
  </el-dialog>
</template>

<script>
import { modelList, modelTypeOptions } from '../../constants/model'
import { getModelSvg, characterLimit } from '../../utils/modelUtils'
import { getModelConfigList, editModelConfig, deleteModelConfig } from '../../api/model'
import ModelEditDialog from './ModelEditDialog.vue'
import ScmCardList from '../common/ScmCardList.vue'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'ModelSettingsDialog',
  components: {
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
      activeModelType: 'DeepSeek', // 默认选中DeepSeek
      supplierModelItem: modelList[0], // 当前选中的供应商
      keyword: '', // 搜索关键词
      loading: false,
      showModelConfigDrawer: false, // 编辑抽屉显示状态
      currentModelId: '' // 当前编辑的模型ID
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
      // 设置默认选中的供应商
      this.supplierModelItem = this.modelList[0]
      this.activeModelType = this.modelList[0].value
    },

    /**
     * 包装getModelConfigList，适配ScmCardList组件
     */
    async getModelConfigListWrapper (params) {
      const response = await getModelConfigList(params)
      return response
    },

    /**
     * 切换模型供应商
     */
    changeModelType (item) {
      this.keyword = ''
      this.activeModelType = item.value
      this.supplierModelItem = item
      // 通过ScmCardList组件重新加载数据
      this.$refs.modelCardListRef?.reload()
    },

    /**
     * 搜索数据
     */
    searchData () {
      // 通过ScmCardList组件重新加载数据
      this.$refs.modelCardListRef?.reload()
    },

    /**
     * 添加模型
     */
    addModel () {
      this.currentModelId = ''
      this.showModelConfigDrawer = true
    },

    /**
     * 编辑模型
     */
    editModel (item) {
      this.currentModelId = item.id
      this.showModelConfigDrawer = true
    },

    /**
     * 删除模型
     */
    deleteModel (item) {
      this.$confirm(
        `确定要删除模型 "${characterLimit(item.name)}" 吗？`,
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
          console.error('删除模型失败:', error)
          this.$message.error('删除模型失败')
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

      if (!newValue) {
        // 禁用时需要确认
        try {
          await this.$confirm(
            `确定要${action}模型 "${characterLimit(item.name)}" 吗？`,
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
        await editModelConfig({
          ...item,
          status: newValue
        })
        this.$message.success(`${action}成功`)
        this.$refs.modelCardListRef?.reload()
      } catch (error) {
        console.error(`${action}模型失败:`, error)
        this.$message.error(`${action}模型失败`)
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
     * 获取类型名称
     */
    getTypeName (item) {
      const typeOption = modelTypeOptions.find(e => e.value === item.type)
      return typeOption ? typeOption.label : item.type || '-'
    },

    /**
     * 检查权限
     */
    hasPermission () {
      // 根据SCM的权限系统来检查权限
      // 这里先返回true，实际应该检查用户权限
      return true
    }
  }
}
</script>

<style scoped>
.model-settings-dialog {
  min-height: 600px;
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
}
</style>
