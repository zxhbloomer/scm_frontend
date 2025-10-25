<template>
  <div class="google-node-property">
    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 查询内容 -->
    <div class="property-section">
      <div class="section-title">
        查询内容
        <el-tooltip content="为空则表示使用上一个节点的输出做为查询内容" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <refer-comment />
      <el-input
        v-model="nodeConfig.query"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入搜索查询内容"
      />
    </div>

    <!-- 提取数量 -->
    <div class="property-section">
      <div class="section-title">提取数量</div>
      <el-input-number
        v-model="nodeConfig.top_n"
        :min="1"
        :max="30"
        controls-position="right"
        style="width: 100%;"
      />
    </div>

    <!-- 国家和地区 -->
    <div class="property-section">
      <div class="section-title">国家和地区</div>
      <el-select v-model="nodeConfig.country" placeholder="请选择国家和地区" style="width: 100%;">
        <el-option
          v-for="item in countryOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- 语言 -->
    <div class="property-section">
      <div class="section-title">语言</div>
      <el-select v-model="nodeConfig.language" placeholder="请选择语言" style="width: 100%;">
        <el-option
          v-for="item in languageOptions"
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
import { GOOGLE_COUNTRY_OPTIONS, GOOGLE_LANGUAGE_OPTIONS } from '@/components/70_ai/components/workflow/constants'

export default {
  name: 'GoogleNodeProperty',

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
      countryOptions: GOOGLE_COUNTRY_OPTIONS,
      languageOptions: GOOGLE_LANGUAGE_OPTIONS
    }
  },

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.query) {
        this.$set(this.wfNode.nodeConfig, 'query', '')
      }
      if (!this.wfNode.nodeConfig.top_n) {
        this.$set(this.wfNode.nodeConfig, 'top_n', 5)
      }
      if (!this.wfNode.nodeConfig.country) {
        this.$set(this.wfNode.nodeConfig, 'country', 'cn')
      }
      if (!this.wfNode.nodeConfig.language) {
        this.$set(this.wfNode.nodeConfig, 'language', 'zh-CN')
      }
      return this.wfNode.nodeConfig
    }
  }
}
</script>

<style lang="scss" scoped>
.google-node-property {
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
