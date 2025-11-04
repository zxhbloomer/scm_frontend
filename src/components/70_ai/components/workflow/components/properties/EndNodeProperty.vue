<template>
  <div class="end-node-property">
    <!-- 引用输入配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 内容配置 -->
    <div class="property-section">
      <div class="section-title">内容</div>

      <!-- 引用提示 -->
      <refer-comment />

      <!-- 结果输入框 -->
      <el-input
        v-model="nodeConfig.result"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入任务完成后的内容"
        @input="handleResultChange"
      />
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'

export default {
  name: 'EndNodeProperty',

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

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.result) {
        this.$set(this.wfNode.nodeConfig, 'result', '任务执行完成')
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    handleResultChange () {
      // 手动触发 X6 节点重新渲染
      this.$nextTick(() => {
        // 通过事件总线通知 WorkflowDesigner 更新 X6
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.end-node-property {
  padding: 16px 0;

  .property-section {
    margin-top: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #303133;
    }
  }
}
</style>
