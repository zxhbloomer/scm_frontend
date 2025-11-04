<template>
  <div class="classifier-node-property">
    <!-- 模型选择 -->
    <div class="property-section">
      <div class="section-title">模型</div>
      <WfLLMSelector
        :model-name="nodeConfig.model_name"
        @llm-selected="handleLLMSelected"
      />
    </div>

    <!-- 类别列表 -->
    <div class="property-section">
      <div class="section-title">类别</div>
      <el-collapse v-model="activeCategories">
        <el-collapse-item
          v-for="(category, idx) in nodeConfig.categories"
          :key="category.category_uuid"
          :name="idx.toString()"
          class="category-item"
        >
          <template slot="title">
            <span style="padding-left: 8px;">分类{{ idx + 1 }}：{{ category.category_name.substring(0, 30) }}</span>
          </template>
          <template v-if="nodeConfig.categories.length > 2" slot="extra">
            <el-button
              type="text"
              icon="el-icon-delete"
              size="small"
              @click.stop="handleDeleteCategory(category)"
            />
          </template>

          <div class="category-content">
            <div class="category-field">
              <span class="field-label">类别名称</span>
              <el-input
                v-model="category.category_name"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 3 }"
                placeholder="请输入类别名称"
                @input="handleCategoryNameChange"
              />
            </div>
            <div class="category-field">
              <span class="field-label">下一步</span>
              <node-selector
                :workflow="workflow"
                :wf-node="wfNode"
                :selected="category.target_node_uuid"
                @node-selected="handleCategoryTargetSelected(category, $event)"
              />
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 新增类别按钮 -->
    <div style="margin-top: 16px;">
      <el-button type="primary" plain style="width: 100%;" @click="handleAddCategory">
        + 新增类别
      </el-button>
    </div>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import WfLLMSelector from '../WfLLMSelector.vue'
import NodeSelector from '../NodeSelector.vue'
import { createNewEdge, deleteEdgesBySourceHandle, updateEdgeBySourceHandle } from '@/components/70_ai/components/workflow/utils/workflowUtil'

export default {
  name: 'ClassifierNodeProperty',

  components: {
    WfLLMSelector,
    NodeSelector
  },

  props: {
    workflow: {
      type: Object,
      required: true
    },
    wfNode: {
      type: Object,
      required: true
    },
    uiWorkflow: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      activeCategories: ['0']
    }
  },

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.model_name) {
        this.$set(this.wfNode.nodeConfig, 'model_name', '')
      }
      if (!this.wfNode.nodeConfig.categories) {
        this.$set(this.wfNode.nodeConfig, 'categories', [
          {
            category_uuid: nanoid(32).replace(/-/g, ''),
            category_name: '',
            target_node_uuid: ''
          },
          {
            category_uuid: nanoid(32).replace(/-/g, ''),
            category_name: '',
            target_node_uuid: ''
          }
        ])
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    /**
     * 处理LLM模型选择
     */
    handleLLMSelected (modelName) {
      this.nodeConfig.model_name = modelName

      // 手动触发 X6 节点重新渲染
      // 使用 Vue.set 确保响应式更新
      this.$set(this.wfNode.nodeConfig, 'model_name', modelName)

      // 强制更新父组件
      this.$nextTick(() => {
        // 通过事件总线通知 WorkflowDesigner 更新 X6
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    },

    /**
     * 处理类别目标节点选择
     */
    handleCategoryTargetSelected (category, nodeUuid) {
      category.target_node_uuid = nodeUuid

      const params = {
        workflow: this.workflow,
        uiWorkflow: this.uiWorkflow,
        source: this.wfNode.uuid,
        sourceHandle: category.category_uuid,
        target: nodeUuid
      }

      updateEdgeBySourceHandle(params)
    },

    /**
     * 新增类别
     */
    handleAddCategory () {
      const uuid = nanoid(32).replace(/-/g, '')
      const newCategory = {
        category_uuid: uuid,
        category_name: `category_${Math.random().toString(36).substring(2, 8)}`,
        target_node_uuid: ''
      }

      this.nodeConfig.categories.push(newCategory)

      // 创建一条新的边
      const params = {
        workflow: this.workflow,
        uiWorkflow: this.uiWorkflow,
        uuid: uuid,
        source: this.wfNode.uuid,
        sourceHandle: uuid,
        target: ''
      }
      createNewEdge(params)

      // 展开新增的类别
      this.activeCategories.push((this.nodeConfig.categories.length - 1).toString())

      // 触发节点更新
      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    },

    /**
     * 删除类别
     */
    handleDeleteCategory (category) {
      if (this.nodeConfig.categories.length <= 2) {
        this.$message.warning('至少保留两个类别')
        return
      }

      const idx = this.nodeConfig.categories.findIndex(item => item.category_uuid === category.category_uuid)
      if (idx >= 0) {
        // 删除对应的边
        deleteEdgesBySourceHandle(this.workflow, this.uiWorkflow, this.wfNode.uuid, category.category_uuid)

        // 删除类别
        this.nodeConfig.categories.splice(idx, 1)

        // 触发节点更新
        this.$nextTick(() => {
          this.$root.$emit('workflow:update-node', {
            nodeUuid: this.wfNode.uuid,
            nodeData: this.wfNode
          })
        })
      }
    },

    /**
     * 处理分类名称变化
     */
    handleCategoryNameChange () {
      // 触发节点更新
      this.$nextTick(() => {
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
.classifier-node-property {
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

  .category-item {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    margin-bottom: 8px;

    ::v-deep .el-collapse-item__header {
      background-color: #f5f7fa;
      padding: 12px 16px;
    }

    ::v-deep .el-collapse-item__content {
      padding: 16px;
    }
  }

  .category-content {
    background-color: #f5f7fa;
    padding: 12px;
    border-radius: 4px;

    .category-field {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .field-label {
        display: block;
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
