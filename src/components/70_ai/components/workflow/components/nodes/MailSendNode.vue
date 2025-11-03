<template>
  <div class="mail-send-node">
    <!-- 节点头部 -->
    <common-node-header :wf-node="node" />

    <!-- 节点内容 -->
    <div class="node-content">
      <div v-if="node.nodeConfig.subject" class="info-line">
        <span class="info-label">主题：</span>
        <span class="info-value">{{ node.nodeConfig.subject }}</span>
      </div>
      <div class="info-line">
        <span class="info-label">发送人：</span>
        <span class="info-value">{{ getSenderText() }}</span>
      </div>
      <div class="info-line">
        <span class="info-label">接收人：</span>
        <span class="info-value">{{ node.nodeConfig.to_mails || '未设置' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * MailSendNode 组件
 * 邮件发送节点
 */
import CommonNodeHeader from './CommonNodeHeader.vue'

export default {
  name: 'MailSendNode',

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
    getSenderText () {
      if (this.node.nodeConfig.sender_type === 1) {
        return '系统'
      } else if (this.node.nodeConfig.sender_type === 2) {
        return this.node.nodeConfig.sender?.mail || '未设置'
      }
      return '未知'
    }
  }
}
</script>

<style scoped>
.mail-send-node {
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
  margin-right: 4px;
  flex: none;
}

.info-value {
  flex: 1;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
