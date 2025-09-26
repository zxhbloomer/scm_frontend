<template>
  <!-- AI模型设置主弹窗 - 基于MeterSphere实现，转换为弹窗形式 -->
  <el-dialog
    :visible="visible"
    title="AI模型设置"
    width="80%"
    :before-close="handleClose"
    class="model-settings-dialog"
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
              :class="`model-item flex gap-[8px] rounded ${item.value === activeModelType ? 'active' : ''}`"
              @click="changeModelType(item)"
            >
              <div class="model-item-img h-[24px] w-[24px]">
                <i :class="getModelIcon(item.icon)" />
              </div>
              <div>{{ item.name }}</div>
            </div>
          </div>
        </div>

        <!-- 右侧模型配置区域 -->
        <div class="model-config-content">
          <div class="p-[16px]">
            <div
              :class="`mb-[16px] flex items-center ${
                hasPermission() ? 'justify-between' : 'justify-end'
              }`"
            >
              <el-button v-if="hasPermission()" type="primary" @click="addModel">
                添加模型
              </el-button>
              <el-input
                v-model="keyword"
                placeholder="请输入模型名称搜索"
                class="w-[240px]"
                clearable
                @clear="searchData"
                @input="searchData"
              >
                <template #suffix>
                  <i class="el-icon-search" />
                </template>
              </el-input>
            </div>

            <!-- 模型卡片列表 -->
            <div class="model-config-card-list-wrapper">
              <el-scrollbar class="h-full">
                <div v-loading="loading" class="model-config-card-list relative">
                  <div v-if="modelData.length === 0 && !loading" class="empty-state">
                    <p class="text-center text-[var(--color-text-4)]">暂无模型数据</p>
                  </div>

                  <div v-else class="model-grid">
                    <div
                      v-for="item in modelData"
                      :key="item.id"
                      class="model-card rounded-md bg-white p-[24px]"
                    >
                      <!-- 模型卡片头部 -->
                      <div class="model-item-header mb-[16px] flex flex-nowrap items-center gap-[8px]">
                        <div class="model-item-img flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center">
                          <i :class="getModelIcon(getModelSvg(item))" class="text-[24px]" />
                        </div>
                        <div class="one-line-text flex flex-1 flex-col">
                          <el-tooltip :content="item.name" :disabled="item.name.length <= 20">
                            <div class="one-line-text font-medium">{{ item.name }}</div>
                          </el-tooltip>
                          <div class="flex gap-[8px] text-[12px]">
                            <div class="text-[var(--color-text-4)]">创建用户</div>
                            <el-tooltip :content="item.createUserName" :disabled="(item.createUserName || '').length <= 15">
                              <div class="one-line-text">{{ item.createUserName || '-' }}</div>
                            </el-tooltip>
                          </div>
                        </div>
                      </div>

                      <!-- 模型卡片内容 -->
                      <div class="model-item-body one-line-text flex items-center gap-[8px]">
                        <div class="model-item-body-label flex flex-col gap-[8px] text-[var(--color-text-4)]">
                          <div>模型类型</div>
                          <div>基础模型</div>
                        </div>
                        <div class="one-line-text flex flex-col gap-[8px]">
                          <el-tooltip :content="getTypeName(item)" :disabled="getTypeName(item).length <= 20">
                            <div class="one-line-text">{{ getTypeName(item) }}</div>
                          </el-tooltip>
                          <el-tooltip :content="item.baseName" :disabled="(item.baseName || '').length <= 20">
                            <div class="one-line-text">{{ item.baseName || '-' }}</div>
                          </el-tooltip>
                        </div>
                      </div>

                      <!-- 模型卡片底部操作 -->
                      <div class="model-item-footer mt-[24px] flex items-center justify-between">
                        <div class="flex items-center gap-[12px]">
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
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型编辑抽屉 -->
    <ModelEditDrawer
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
import ModelEditDrawer from './ModelEditDrawer.vue'

export default {
  name: 'ModelSettingsDialog',
  components: {
    ModelEditDrawer
  },
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
      modelData: [], // 模型数据列表
      showModelConfigDrawer: false, // 编辑抽屉显示状态
      currentModelId: '', // 当前编辑的模型ID
      pagination: {
        current: 1,
        pageSize: 50,
        total: 0
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
      // 设置默认选中的供应商
      this.supplierModelItem = this.modelList[0]
      this.activeModelType = this.modelList[0].value
      this.loadModelData()
    },

    /**
     * 加载模型数据
     */
    async loadModelData () {
      this.loading = true
      try {
        const params = {
          current: this.pagination.current,
          pageSize: this.pagination.pageSize,
          owner: '', // 系统级模型，owner为空
          keyword: this.keyword,
          providerName: this.activeModelType
        }

        console.log('🔧 [ModelSettingsDialog] 开始加载模型数据:', params)
        const response = await getModelConfigList(params)
        console.log('🔧 [ModelSettingsDialog] 模型数据响应:', response)

        if (response && response.records) {
          this.modelData = response.records
          this.pagination.total = response.total || 0
        } else {
          this.modelData = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('加载模型数据失败:', error)
        this.$message.error('加载模型数据失败')
        this.modelData = []
      } finally {
        this.loading = false
      }
    },

    /**
     * 切换模型供应商
     */
    changeModelType (item) {
      this.keyword = ''
      this.activeModelType = item.value
      this.supplierModelItem = item
      this.pagination.current = 1
      this.loadModelData()
    },

    /**
     * 搜索数据
     */
    searchData () {
      this.pagination.current = 1
      this.loadModelData()
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
          this.loadModelData()
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
        this.loadModelData()
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
      this.loadModelData()
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
     * 获取模型图标CSS类名
     */
    getModelIcon (iconName) {
      // 根据SCM前端的图标系统来映射
      const iconMap = {
        deepSeek: 'icon-deepseek',
        openAi: 'icon-openai',
        zhiPuAi: 'icon-zhipuai',
        qianFan: 'icon-qianfan',
        ollama: 'icon-ollama'
      }
      return iconMap[iconName] || 'icon-default'
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

.model-item {
  padding: 12px 16px;
  border: 1px solid transparent;
  cursor: pointer;
  margin-bottom: 4px;
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
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.model-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.model-item-img {
  border-radius: 4px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
