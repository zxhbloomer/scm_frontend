<template>
  <div class="dalle3-node-property">
    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

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

    <!-- 图像质量 -->
    <div class="property-section">
      <div class="section-title">图像质量</div>
      <el-select v-model="nodeConfig.quality" placeholder="请选择图像质量" style="width: 100%;">
        <el-option
          v-for="item in qualityOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'
import { DALLE3_SIZE_OPTIONS, DALLE3_QUALITY_OPTIONS } from '@/components/70_ai/components/workflow/constants'

export default {
  name: 'Dalle3NodeProperty',

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
      sizeOptions: DALLE3_SIZE_OPTIONS,
      qualityOptions: DALLE3_QUALITY_OPTIONS
    }
  },

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.prompt) {
        this.$set(this.wfNode.nodeConfig, 'prompt', '')
      }
      if (!this.wfNode.nodeConfig.size) {
        this.$set(this.wfNode.nodeConfig, 'size', '1024x1024')
      }
      if (!this.wfNode.nodeConfig.quality) {
        this.$set(this.wfNode.nodeConfig, 'quality', 'standard')
      }
      return this.wfNode.nodeConfig
    }
  }
}
</script>

<style lang="scss" scoped>
.dalle3-node-property {
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
