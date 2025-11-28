<template>
  <div class="switcher-node-property">
    <!-- 分支情况列表 -->
    <el-collapse v-model="activeCases">
      <el-collapse-item
        v-for="(wfCase, idx) in nodeConfig.cases"
        :key="wfCase.uuid"
        :name="idx.toString()"
        class="case-item"
      >
        <template slot="title">
          <div class="case-title-wrapper">
            <span class="case-title-text">分支情况{{ idx + 1 }}</span>
            <el-button
              v-if="nodeConfig.cases.length > 1"
              type="text"
              icon="el-icon-delete"
              size="small"
              class="case-delete-btn"
              @click.stop="handleDeleteCase(wfCase)"
            />
          </div>
        </template>

        <div class="case-content">
          <!-- 条件列表 -->
          <div class="conditions-wrapper">
            <!-- 逻辑运算符切换（多个条件时显示） -->
            <div v-show="wfCase.conditions.length > 1" class="operator-toggle">
              <el-tag
                :type="wfCase.operator === 'and' ? 'success' : 'warning'"
                size="small"
                effect="plain"
                style="cursor: pointer;"
                @click="handleToggleOperator(wfCase)"
              >
                <i class="el-icon-refresh" />
                {{ wfCase.operator === 'and' ? '与' : '或' }}
              </el-tag>
              <div class="operator-line" />
            </div>

            <!-- 条件列表 -->
            <div class="conditions-list">
              <div v-for="(condition, condIdx) in wfCase.conditions" :key="condition.uuid || condIdx" class="condition-row">
                <!-- 变量选择 -->
                <wf-variable-selector
                  :workflow="workflow"
                  :wf-node="wfNode"
                  :wf-ref-var="condition"
                  :exclude-nodes="[wfNode.wfComponent.name]"
                  style="flex: 1; max-width: 150px; margin-right: 8px;"
                  @variable-selected="handleConditionSelected(condition, $event)"
                />

                <!-- 运算符选择 -->
                <operator-selector
                  :selected="condition.operator"
                  style="max-width: 120px; margin-right: 8px;"
                  @operator-selected="handleOperatorSelected(condition, $event)"
                />

                <!-- 值输入 -->
                <el-input
                  v-show="condition.operator !== 'empty' && condition.operator !== 'not empty'"
                  v-model="condition.value"
                  placeholder="值"
                  style="flex: 1; min-width: 100px;"
                />

                <!-- 删除条件按钮 -->
                <el-button
                  v-show="wfCase.conditions.length > 1"
                  type="text"
                  icon="el-icon-delete"
                  size="small"
                  style="margin-left: 4px;"
                  @click="handleDeleteCondition(wfCase, condition)"
                />
              </div>
            </div>
          </div>

          <!-- 下一步节点选择 -->
          <div class="next-node-section">
            <div class="tip-box">
              <i class="el-icon-info" />
              <span v-if="wfCase.operator === 'and'">
                以上所有的条件都满足时跳转到下面的节点
              </span>
              <span v-else>
                以上任意一个条件满足即可跳转到下面的节点
              </span>
            </div>
            <node-selector
              :workflow="workflow"
              :wf-node="wfNode"
              :selected="wfCase.target_node_uuid"
              @node-selected="handleCaseNextNodeSelected(wfCase, $event)"
            />
          </div>

          <!-- 新增条件按钮 -->
          <el-button
            type="primary"
            plain
            size="small"
            style="width: 100%; margin-top: 12px;"
            @click="handleAddCondition(wfCase)"
          >
            + 新增条件
          </el-button>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 新增分支按钮 -->
    <div style="margin-top: 16px;">
      <el-button type="primary" plain style="width: 100%;" @click="handleAddCase">
        + 新增情况
      </el-button>
    </div>

    <!-- 保底情况 -->
    <div class="default-case-section">
      <el-collapse v-model="activeDefault">
        <el-collapse-item name="default" class="default-case-item">
          <template slot="title">
            <span style="padding-left: 8px;">保底情况</span>
          </template>

          <div class="default-case-content">
            <div class="tip-box">
              <i class="el-icon-info" />
              <span>
                当以上{{ nodeConfig.cases.length }}种分支情况都不匹配时，自动匹配本情况，跳转到下面指定的节点
              </span>
            </div>
            <node-selector
              :workflow="workflow"
              :wf-node="wfNode"
              :selected="nodeConfig.default_target_node_uuid"
              @node-selected="handleDefaultCaseTarget"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import WfVariableSelector from '../WfVariableSelector.vue'
import OperatorSelector from '../OperatorSelector.vue'
import NodeSelector from '../NodeSelector.vue'
import { createNewEdge, deleteEdgesBySourceHandle, updateEdgeBySourceHandle } from '@/components/70_ai/components/workflow/utils/workflowUtil'

export default {
  name: 'SwitcherNodeProperty',

  components: {
    WfVariableSelector,
    OperatorSelector,
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
      activeCases: ['0'],
      activeDefault: ['default']
    }
  },

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.default_target_node_uuid) {
        this.$set(this.wfNode.nodeConfig, 'default_target_node_uuid', '')
      }
      if (!this.wfNode.nodeConfig.cases) {
        const startNode = this.getStartNode()
        const firstInput = startNode?.inputConfig.user_inputs[0]

        this.$set(this.wfNode.nodeConfig, 'cases', [
          {
            uuid: nanoid(32).replace(/-/g, ''),
            operator: 'and',
            target_node_uuid: '',
            conditions: [
              {
                uuid: nanoid(32).replace(/-/g, ''),
                node_uuid: startNode?.uuid || '',
                node_param_name: firstInput?.name || '',
                operator: '=',
                value: ''
              }
            ]
          }
        ])
      }
      return this.wfNode.nodeConfig
    }
  },

  methods: {
    /**
     * 获取Start节点
     */
    getStartNode () {
      const nodes = this.workflow.nodes || []
      return nodes.find(node => node.wfComponent && node.wfComponent.name === 'Start')
    },

    /**
     * 处理条件变量选择
     */
    handleConditionSelected (condition, nodeUuidParamName) {
      condition.node_uuid = nodeUuidParamName[0]
      condition.node_param_name = nodeUuidParamName[1]
    },

    /**
     * 处理运算符选择
     */
    handleOperatorSelected (condition, operator) {
      condition.operator = operator
    },

    /**
     * 处理case下一个节点选择
     */
    handleCaseNextNodeSelected (wfCase, nodeUuid) {
      wfCase.target_node_uuid = nodeUuid

      const params = {
        workflow: this.workflow,
        uiWorkflow: this.uiWorkflow,
        source: this.wfNode.uuid,
        sourceHandle: wfCase.uuid,
        target: nodeUuid
      }

      updateEdgeBySourceHandle(params)
    },

    /**
     * 处理默认情况目标节点选择
     */
    handleDefaultCaseTarget (nodeUuid) {
      this.nodeConfig.default_target_node_uuid = nodeUuid

      const params = {
        workflow: this.workflow,
        uiWorkflow: this.uiWorkflow,
        source: this.wfNode.uuid,
        sourceHandle: 'default_handle',
        target: nodeUuid
      }

      updateEdgeBySourceHandle(params)
    },

    /**
     * 切换逻辑运算符（与/或）
     */
    handleToggleOperator (wfCase) {
      wfCase.operator = wfCase.operator === 'and' ? 'or' : 'and'
    },

    /**
     * 新增条件
     */
    handleAddCondition (wfCase) {
      const startNode = this.getStartNode()
      const firstInput = startNode?.inputConfig.user_inputs[0]

      wfCase.conditions.push({
        uuid: nanoid(32).replace(/-/g, ''),
        node_uuid: startNode?.uuid || '',
        node_param_name: firstInput?.name || '',
        operator: '=',
        value: ''
      })
    },

    /**
     * 删除条件
     */
    handleDeleteCondition (wfCase, condition) {
      if (wfCase.conditions.length <= 1) {
        this.$message.warning('至少保留一个条件')
        return
      }

      const idx = wfCase.conditions.findIndex(item => item.uuid === condition.uuid)
      if (idx >= 0) {
        wfCase.conditions.splice(idx, 1)
      }
    },

    /**
     * 新增分支情况
     */
    handleAddCase () {
      const uuid = nanoid(32).replace(/-/g, '')
      const startNode = this.getStartNode()
      const firstInput = startNode?.inputConfig.user_inputs[0]

      const newCase = {
        uuid: uuid,
        operator: 'and',
        target_node_uuid: '',
        conditions: [
          {
            uuid: nanoid(32).replace(/-/g, ''),
            node_uuid: startNode?.uuid || '',
            node_param_name: firstInput?.name || '',
            operator: '=',
            value: ''
          }
        ]
      }

      this.nodeConfig.cases.push(newCase)

      // 创建一条新的边
      const params = {
        workflow: this.workflow,
        uiWorkflow: this.uiWorkflow,
        source: this.wfNode.uuid,
        sourceHandle: uuid,
        target: ''
      }
      createNewEdge(params)

      // 展开新增的case
      this.activeCases.push((this.nodeConfig.cases.length - 1).toString())
    },

    /**
     * 删除分支情况
     */
    handleDeleteCase (wfCase) {
      if (this.nodeConfig.cases.length <= 1) {
        this.$message.warning('至少保留一个分支情况')
        return
      }

      const idx = this.nodeConfig.cases.findIndex(item => item.uuid === wfCase.uuid)
      if (idx >= 0) {
        // 删除对应的边
        deleteEdgesBySourceHandle(this.workflow, this.uiWorkflow, this.wfNode.uuid, wfCase.uuid)

        // 删除case
        this.nodeConfig.cases.splice(idx, 1)

        // 触发画布节点更新
        this.$nextTick(() => {
          this.$root.$emit('workflow:update-node', {
            nodeUuid: this.wfNode.uuid,
            nodeData: this.wfNode
          })
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.switcher-node-property {
  padding: 16px 0;

  .case-item,
  .default-case-item {
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

  .case-title-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-left: 8px;
    padding-right: 24px;

    .case-title-text {
      flex: 1;
    }

    .case-delete-btn {
      color: #f56c6c;
      padding: 4px 8px;

      &:hover {
        color: #f78989;
        background-color: #fef0f0;
      }
    }
  }

  .case-content,
  .default-case-content {
    background-color: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
  }

  .conditions-wrapper {
    display: flex;
    margin-bottom: 16px;

    .operator-toggle {
      display: flex;
      align-items: center;
      margin-right: 12px;

      .operator-line {
        width: 8px;
        height: 100%;
        border: 1px solid #dcdfe6;
        border-right: none;
        border-radius: 4px 0 0 4px;
        margin-left: 8px;
      }
    }

    .conditions-list {
      flex: 1;

      .condition-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .next-node-section {
    margin: 16px 0;
    padding: 12px;
    background-color: #fff;
    border-radius: 4px;
  }

  .tip-box {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #ecf5ff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    margin-bottom: 12px;

    i {
      margin-right: 8px;
      color: #409eff;
      font-size: 16px;
    }

    span {
      font-size: 13px;
      color: #606266;
      flex: 1;
    }
  }

  .default-case-section {
    margin-top: 16px;
  }
}
</style>
