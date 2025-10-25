<template>
  <div class="google-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="info-line">
        <span class="info-label">国家：</span>
        <span class="info-value">{{ getCountryLabel(node.nodeConfig.country) }}</span>
      </div>
      <div class="info-line">
        <span class="info-label">语言：</span>
        <span class="info-value">{{ getLanguageLabel(node.nodeConfig.language) }}</span>
      </div>
      <div class="info-line">
        <span class="info-label">提取数量：</span>
        <span class="info-value">{{ node.nodeConfig.top_n || 5 }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * GoogleNode 组件
 * Google 搜索节点
 * 严格参考 aideepin GoogleNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\GoogleNode.vue
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'GoogleNode',

  components: {
    CommonNodeHeader
  },

  inject: ['getNode'],

  computed: {
    node () {
      return this.getNode().data
    }
  },

  methods: {
    getCountryLabel (value) {
      const countryMap = {
        'cn': '中国',
        'us': '美国',
        'uk': '英国',
        'jp': '日本'
      }
      return countryMap[value] || value
    },

    getLanguageLabel (value) {
      const languageMap = {
        'zh-cn': '简体中文',
        'en': '英语',
        'ja': '日语'
      }
      return languageMap[value] || value
    }
  }
}
</script>

<style scoped>
.google-node {
  width: 220px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.node-content {
  display: flex;
  flex-direction: column;
}

.info-line {
  height: 40px;
  line-height: 40px;
  background: rgba(150, 150, 150, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

.info-line:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #909399;
  margin-right: 8px;
}

.info-value {
  flex: 1;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
