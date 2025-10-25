<template>
  <div class="tongyiwanx-node-property">
    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 模型选择 -->
    <div class="property-section">
      <div class="section-title">模型</div>
      <el-select
        v-model="selectedModelName"
        placeholder="请选择图像模型"
        filterable
        style="width: 100%;"
        @change="handleModelSelected"
      >
        <el-option
          v-for="item in availableModels"
          :key="item.modelName"
          :label="item.modelLabel || item.modelName"
          :value="item.modelName"
        >
          <span style="float: left">{{ item.modelLabel || item.modelName }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">
            {{ item.modelPlatform || '' }}
          </span>
        </el-option>
      </el-select>
    </div>

    <!-- 提示词 -->
    <div class="property-section">
      <div class="section-title">
        提示词
        <el-tooltip content="为空则表示使用上一个节点的输出做为提示词" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <refer-comment />
      <el-input
        v-model="nodeConfig.prompt"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入图像生成提示词"
      />
    </div>

    <!-- 图像大小 -->
    <div class="property-section">
      <div class="section-title">图像大小</div>
      <el-select v-model="nodeConfig.size" placeholder="请选择图像大小" style="width: 100%;">
        <el-option
          v-for="item in sizeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- 随机种子 -->
    <div class="property-section">
      <div class="section-title">随机种子</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <el-input-number
          v-model="nodeConfig.seed"
          :min="-1"
          :max="2147483647"
          controls-position="right"
          style="flex: 1;"
        />
        <el-button
          type="primary"
          size="small"
          plain
          @click="generateRandomSeed"
        >
          随机生成
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'
import { TONGYI_WANX_SIZE_OPTIONS } from '@/components/70_ai/components/workflow/constants'

export default {
  name: 'TongyiwanxNodeProperty',

  components: {
    NodePropertyInput,
    ReferComment
  },

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      sizeOptions: TONGYI_WANX_SIZE_OPTIONS,
      selectedModelName: '',
      availableModels: []
    }
  },

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.model_name) {
        this.$set(this.wfNode.nodeConfig, 'model_name', '')
      }
      if (!this.wfNode.nodeConfig.prompt) {
        this.$set(this.wfNode.nodeConfig, 'prompt', '')
      }
      if (!this.wfNode.nodeConfig.size) {
        this.$set(this.wfNode.nodeConfig, 'size', '1024*1024')
      }
      if (this.wfNode.nodeConfig.seed === undefined) {
        this.$set(this.wfNode.nodeConfig, 'seed', -1)
      }
      return this.wfNode.nodeConfig
    }
  },

  mounted () {
    this.loadAvailableModels()
    this.selectedModelName = this.nodeConfig.model_name || ''
  },

  methods: {
    /**
     * 加载可用的图像模型
     */
    async loadAvailableModels () {
      try {
        const { modelList } = await import('@/components/70_ai/components/model/utils')
        const response = await modelList({ page: 1, pageSize: 100 })

        if (response.data && response.data.records) {
          // 筛选出图像模型，排除特定模型
          const excludeModels = ['wanx-background-generation-v2']
          this.availableModels = response.data.records.filter(model =>
            model.modelStatus === true &&
            (model.modelType === 3 || model.modelType === 'Image') && // Image类型
            model.modelPlatform === 'dashscope' && // dashscope平台
            !excludeModels.includes(model.modelName) &&
            model.modelName
          ).map(model => ({
            modelName: model.modelName,
            modelLabel: model.modelLabel || model.modelName,
            modelPlatform: model.modelPlatform
          }))

          // 如果没有选中的模型，选择第一个
          if (!this.selectedModelName && this.availableModels.length > 0) {
            this.selectedModelName = this.availableModels[0].modelName
            this.handleModelSelected(this.selectedModelName)
          }
        }
      } catch (error) {
        console.error('加载图像模型列表失败:', error)
        this.$message.error('加载图像模型列表失败')
      }
    },

    /**
     * 处理模型选择
     */
    handleModelSelected (modelName) {
      this.nodeConfig.model_name = modelName
    },

    /**
     * 生成随机种子
     */
    generateRandomSeed () {
      this.nodeConfig.seed = Math.floor(Math.random() * 2147483647)
    }
  }
}
</script>

<style lang="scss" scoped>
.tongyiwanx-node-property {
  padding: 16px 0;

  .property-section {
    margin-top: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #303133;
      display: flex;
      align-items: center;
    }
  }
}
</style>
