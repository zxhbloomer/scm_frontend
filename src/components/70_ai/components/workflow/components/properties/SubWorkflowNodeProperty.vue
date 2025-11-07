<template>
  <div class="subworkflow-node-property">
    <!-- 说明文字 -->
    <div class="property-description">
      <i class="el-icon-info" />
      <span>子工作流节点用于快速复用其他已定义的工作流，实现流程模块化。</span>
    </div>

    <!-- 输入参数配置 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 工作流选择器 -->
    <div class="property-section">
      <div class="section-title">
        <span>可使用的工作流</span>
        <el-tooltip content="选择要调用的子工作流" placement="top">
          <i class="el-icon-question" />
        </el-tooltip>
      </div>

      <el-select
        v-model="nodeConfig.workflow_uuid"
        placeholder="请选择工作流"
        filterable
        @change="handleWorkflowChange"
      >
        <el-option-group
          v-for="group in workflowOptions"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="item in group.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-option-group>
      </el-select>
    </div>

    <!-- 参数映射配置 -->
    <div v-if="nodeConfig.workflow_uuid" class="property-section">
      <div class="section-title">
        <span>参数映射</span>
        <el-tooltip placement="top">
          <div slot="content">将父工作流的参数映射到子工作流的输入参数</div>
          <i class="el-icon-question" />
        </el-tooltip>
      </div>

      <el-table
        :data="nodeConfig.input_mapping"
        border
        size="small"
        style="margin-bottom: 8px;"
      >
        <el-table-column label="父流程参数" width="180">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.source_key"
              placeholder="请输入参数名"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="子流程参数" width="180">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.target_key"
              placeholder="请输入参数名"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-delete"
              size="small"
              @click="handleDeleteMapping(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>

      <el-button size="small" @click="handleAddMapping">+ 添加映射</el-button>
    </div>
  </div>
</template>

<script>
import NodePropertyInput from '../NodePropertyInput.vue'
import { getAvailableWorkflows } from '@/components/70_ai/api/workflowService'

export default {
  name: 'SubWorkflowNodeProperty',
  components: { NodePropertyInput },
  props: {
    workflow: { type: Object, required: true },
    wfNode: { type: Object, required: true }
  },
  data () {
    return {
      workflowOptions: []
    }
  },
  computed: {
    nodeConfig () {
      if (!this.wfNode.nodeConfig) {
        this.$set(this.wfNode, 'nodeConfig', {})
      }
      // 确保 input_mapping 字段存在
      if (!this.wfNode.nodeConfig.input_mapping) {
        this.$set(this.wfNode.nodeConfig, 'input_mapping', [])
      }
      return this.wfNode.nodeConfig
    }
  },
  mounted () {
    this.loadWorkflowOptions()
  },
  methods: {
    async loadWorkflowOptions () {
      try {
        const response = await getAvailableWorkflows()
        const data = response.data || []
        const publicWorkflows = data.filter(wf => wf.isPublic === 1)
        const myWorkflows = data.filter(wf => wf.isPublic === 0)

        this.workflowOptions = [
          {
            label: '公开工作流',
            options: publicWorkflows.map(wf => ({
              value: wf.workflowUuid,
              label: wf.name
            }))
          },
          {
            label: '我的工作流',
            options: myWorkflows.map(wf => ({
              value: wf.workflowUuid,
              label: wf.name
            }))
          }
        ]
      } catch (error) {
        this.$message.error('加载工作流列表失败')
        console.error(error)
      }
    },

    handleWorkflowChange (workflowUuid) {
      // 查找选中的工作流名称
      let workflowName = ''
      for (const group of this.workflowOptions) {
        const found = group.options.find(opt => opt.value === workflowUuid)
        if (found) {
          workflowName = found.label
          break
        }
      }

      // 更新nodeConfig
      this.$set(this.nodeConfig, 'workflow_name', workflowName)

      // 触发X6更新（联动到节点body显示）
      this.$root.$emit('workflow:update-node', {
        nodeUuid: this.wfNode.uuid,
        nodeData: this.wfNode
      })
    },

    handleAddMapping () {
      const newMapping = {
        source_key: '',
        target_key: ''
      }
      // 使用$set确保新对象是响应式的
      const currentMappings = this.nodeConfig.input_mapping
      this.$set(this.nodeConfig, 'input_mapping', [
        ...currentMappings,
        newMapping
      ])
    },

    handleDeleteMapping (index) {
      this.nodeConfig.input_mapping.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.subworkflow-node-property {
  padding: 16px;
}

.property-description {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #ecf5ff;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #409eff;
}

.property-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>
