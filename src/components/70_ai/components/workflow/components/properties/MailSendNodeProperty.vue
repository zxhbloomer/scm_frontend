<template>
  <div class="mail-send-node-property">
    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 发送人 -->
    <div class="property-section">
      <div class="section-title">发送人</div>
      <el-radio-group v-model="nodeConfig.sender_type">
        <el-radio :label="1">系统</el-radio>
        <el-radio :label="2">自定义</el-radio>
      </el-radio-group>
    </div>

    <!-- 自定义SMTP配置 -->
    <div v-show="nodeConfig.sender_type === 2" class="smtp-config">
      <div class="config-item">
        <span class="config-label">SMTP服务器</span>
        <el-input v-model="nodeConfig.smtp.host" placeholder="eg: smtp.exmail.qq.com" />
      </div>
      <div class="config-item">
        <span class="config-label">SMTP端口</span>
        <el-input-number
          v-model="nodeConfig.smtp.port"
          :min="1"
          :max="65535"
          controls-position="right"
          style="width: 100%;"
        />
      </div>
      <div class="config-item">
        <span class="config-label">发送人名称</span>
        <el-input v-model="nodeConfig.sender.name" />
      </div>
      <div class="config-item">
        <span class="config-label">发送人邮箱</span>
        <el-input v-model="nodeConfig.sender.mail" />
      </div>
      <div class="config-item">
        <span class="config-label">发送人密码</span>
        <el-input v-model="nodeConfig.sender.password" type="password" show-password />
      </div>
    </div>

    <!-- 接收人邮箱 -->
    <div class="property-section">
      <div class="section-title">
        接收人邮箱
        <refer-tooltip />
        <span class="required-mark">*</span>
      </div>
      <el-input v-model="nodeConfig.to_mails" placeholder="多个邮箱以逗号隔开" />
    </div>

    <!-- 抄送人邮箱 -->
    <div class="property-section">
      <div class="section-title">
        抄送人邮箱
        <refer-tooltip />
      </div>
      <el-input v-model="nodeConfig.cc_mails" placeholder="多个邮箱以逗号隔开" />
    </div>

    <!-- 邮件标题 -->
    <div class="property-section">
      <div class="section-title">
        邮件标题
        <refer-tooltip :brief="true" />
        <span class="required-mark">*</span>
      </div>
      <refer-comment />
      <el-input
        v-model="nodeConfig.subject"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 3 }"
        placeholder="请输入邮件标题"
      />
    </div>

    <!-- 邮件内容 -->
    <div class="property-section">
      <div class="section-title">
        邮件内容
        <refer-tooltip :brief="true" />
        <span class="required-mark">*</span>
      </div>
      <refer-comment />
      <el-input
        v-model="nodeConfig.content"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入邮件内容"
      />
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'
import ReferTooltip from '../ReferTooltip.vue'

export default {
  name: 'MailSendNodeProperty',

  components: {
    NodePropertyInput,
    ReferComment,
    ReferTooltip
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

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.sender_type) {
        this.$set(this.wfNode.nodeConfig, 'sender_type', 1)
      }
      if (!this.wfNode.nodeConfig.smtp) {
        this.$set(this.wfNode.nodeConfig, 'smtp', { host: '', port: 465 })
      }
      if (!this.wfNode.nodeConfig.sender) {
        this.$set(this.wfNode.nodeConfig, 'sender', { name: '', mail: '', password: '' })
      }
      if (!this.wfNode.nodeConfig.to_mails) {
        this.$set(this.wfNode.nodeConfig, 'to_mails', '')
      }
      if (!this.wfNode.nodeConfig.cc_mails) {
        this.$set(this.wfNode.nodeConfig, 'cc_mails', '')
      }
      if (!this.wfNode.nodeConfig.subject) {
        this.$set(this.wfNode.nodeConfig, 'subject', '')
      }
      if (!this.wfNode.nodeConfig.content) {
        this.$set(this.wfNode.nodeConfig, 'content', '')
      }
      return this.wfNode.nodeConfig
    }
  }
}
</script>

<style lang="scss" scoped>
.mail-send-node-property {
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

      .required-mark {
        color: #f56c6c;
        font-size: 14px;
        margin-left: 4px;
      }
    }
  }

  .smtp-config {
    margin-top: 12px;
    padding: 12px;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    .config-item {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .config-label {
        display: block;
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
