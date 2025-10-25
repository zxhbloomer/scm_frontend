<template>
  <div class="http-request-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div class="method-line">
        <el-tag size="small" :type="getMethodType(node.nodeConfig.method)">
          {{ node.nodeConfig.method || 'GET' }}
        </el-tag>
        <span class="url-text">{{ node.nodeConfig.url || '未设置URL' }}</span>
      </div>
      <div class="info-line">
        <span class="info-label">ContentType：</span>
        <span class="info-value">{{ node.nodeConfig.content_type || 'text/plain' }}</span>
      </div>
      <div class="info-line">
        <span class="info-label">超时时间：</span>
        <span class="info-value">{{ node.nodeConfig.timeout || 10 }} 秒</span>
      </div>
      <div class="info-line">
        <span class="info-label">重试次数：</span>
        <span class="info-value">{{ node.nodeConfig.retry_times || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * HttpRequestNode 组件
 * HTTP 请求节点
 * 严格参考 aideepin HttpRequestNode.vue 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\views\workflow\components\nodes\HttpRequestNode.vue
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'HttpRequestNode',

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
    getMethodType (method) {
      const typeMap = {
        'GET': 'success',
        'POST': 'primary',
        'PUT': 'warning',
        'DELETE': 'danger',
        'PATCH': 'info'
      }
      return typeMap[method] || 'info'
    }
  }
}
</script>

<style scoped>
.http-request-node {
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

.method-line {
  height: 40px;
  background: rgba(150, 150, 150, 0.1);
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.url-text {
  flex: 1;
  margin-left: 8px;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  margin-right: 4px;
}

.info-value {
  flex: 1;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
