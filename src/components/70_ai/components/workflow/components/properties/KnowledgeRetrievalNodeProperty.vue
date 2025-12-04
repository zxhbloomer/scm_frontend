<template>
  <div class="knowledge-retrieval-node-property">
    <!-- 输入变量定义 -->
    <node-property-input
      :workflow="workflow"
      :wf-node="wfNode"
    />

    <!-- 知识库选择 -->
    <div class="property-section">
      <div class="section-title">知识库</div>

      <!-- 统一的知识库选择器,支持永久知识库和临时知识库 -->
      <el-select
        v-model="selectedKbSource"
        placeholder="请选择知识库"
        filterable
        clearable
        @change="handleKbSourceChange"
        @clear="handleKbClear"
      >
        <!-- 永久知识库选项组 -->
        <el-option-group label="永久知识库">
          <el-option
            v-for="kb in permanentKbs"
            :key="kb.value"
            :label="kb.label"
            :value="`permanent_${kb.value}`"
          >
            <span style="float: left">
              <i :class="kb.is_public ? 'el-icon-share' : 'el-icon-lock'" style="margin-right: 8px;" />
              {{ kb.label }}
            </span>
          </el-option>
        </el-option-group>

        <!-- 临时知识库选项组(仅在有上游临时知识库节点时显示) -->
        <el-option-group
          v-if="upstreamTempKbNodes.length > 0"
          label="临时知识库(上游节点)"
        >
          <el-option
            v-for="node in upstreamTempKbNodes"
            :key="node.uuid"
            :label="`${node.title} (临时)`"
            :value="`temp_${node.uuid}`"
          >
            <span>{{ node.title }}</span>
            <el-tag size="mini" type="warning" style="margin-left: 8px;">临时</el-tag>
          </el-option>
        </el-option-group>
      </el-select>
    </div>

    <!-- 查询关键词 -->
    <div class="property-section">
      <div class="section-title">
        查询关键词
        <el-tooltip content="为空则使用上一个节点的输出作为查询关键词" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <refer-comment />
      <el-input
        v-model="nodeConfig.query_template"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        placeholder="请输入查询关键词,可使用 ${变量名} 引用输入变量"
      />
    </div>

    <!-- 召回数量 -->
    <div class="property-section">
      <div class="section-title">召回数量 ({{ nodeConfig.top_n }})</div>
      <div class="slider-container">
        <el-slider
          v-model="nodeConfig.top_n"
          :min="1"
          :max="30"
          :step="1"
          show-stops
        />
      </div>
    </div>

    <!-- 命中最低分数 -->
    <div class="property-section">
      <div class="section-title">命中最低分数 ({{ nodeConfig.score }})</div>
      <div class="slider-container">
        <el-slider
          v-model="nodeConfig.score"
          :min="0.1"
          :max="1"
          :step="0.1"
          show-stops
        />
      </div>
    </div>

    <!-- 严格模式 -->
    <div class="property-section">
      <div class="section-title">
        严格模式
        <el-tooltip placement="top">
          <div slot="content">
            <div>严格模式：严格匹配知识库，知识库中如无搜索结果，直接返回无答案</div>
            <div>宽松模式：知识库中如无搜索结果，将用户提问传给LLM继续请求答案</div>
          </div>
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-radio-group v-model="nodeConfig.is_strict">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </div>

    <!-- 图谱检索 -->
    <div class="property-section">
      <div class="section-title">
        图谱检索
        <el-tooltip placement="top">
          <div slot="content">
            <div>启用后将同时执行向量检索和图谱检索，合并实体和关系信息</div>
            <div>需要知识库完成图谱化索引</div>
          </div>
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-switch
        v-model="nodeConfig.enable_graph_retrieval"
        active-text="启用"
        inactive-text="关闭"
      />
    </div>

    <!-- 图谱检索模型选择（仅当启用图谱检索时显示） -->
    <div v-if="nodeConfig.enable_graph_retrieval" class="property-section">
      <div class="section-title">
        图谱检索模型
        <el-tooltip placement="top">
          <div slot="content">
            <div>用于从问题中提取实体的LLM模型</div>
            <div>建议使用较快的模型（如GPT-3.5）以降低成本</div>
          </div>
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <wf-llm-selector
        :model-name="nodeConfig.graph_model_name"
        @llm-selected="handleGraphModelSelected"
      />
    </div>

    <!-- 默认回复内容 -->
    <div class="property-section">
      <div class="section-title">
        默认回复内容
        <el-tooltip content="如果没有答案，则采用本内容" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-input
        v-model="nodeConfig.default_response"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="请输入默认回复内容"
      />
    </div>
  </div>
</template>

<script>
import WfLlmSelector from '../WfLLMSelector.vue'
import NodePropertyInput from '../NodePropertyInput.vue'
import ReferComment from '../ReferComment.vue'

export default {
  name: 'KnowledgeRetrievalNodeProperty',

  components: {
    WfLlmSelector,
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
    },
    uiWorkflow: {
      type: Object,
      default: () => ({ nodes: [], edges: [], graph: null })
    }
  },

  data () {
    return {
      // 上游临时知识库节点列表
      upstreamTempKbNodes: [],
      // 永久知识库列表
      permanentKbs: [],
      // 当前选择的知识库来源(格式: permanent_{uuid} 或 temp_{nodeUuid})
      selectedKbSource: ''
    }
  },

  computed: {
    nodeConfig () {
      // 初始化默认值
      if (!this.wfNode.nodeConfig.knowledge_base_uuid) {
        this.$set(this.wfNode.nodeConfig, 'knowledge_base_uuid', '')
      }
      if (!this.wfNode.nodeConfig.knowledge_base_name) {
        this.$set(this.wfNode.nodeConfig, 'knowledge_base_name', '')
      }
      if (!this.wfNode.nodeConfig.top_n) {
        this.$set(this.wfNode.nodeConfig, 'top_n', 5)
      }
      if (!this.wfNode.nodeConfig.score) {
        this.$set(this.wfNode.nodeConfig, 'score', 0.5)
      }
      if (this.wfNode.nodeConfig.is_strict === undefined) {
        this.$set(this.wfNode.nodeConfig, 'is_strict', true)
      }
      if (this.wfNode.nodeConfig.enable_graph_retrieval === undefined) {
        this.$set(this.wfNode.nodeConfig, 'enable_graph_retrieval', false)
      }
      if (!this.wfNode.nodeConfig.default_response) {
        this.$set(this.wfNode.nodeConfig, 'default_response', '很抱歉，我无法找到相关答案。')
      }
      if (!this.wfNode.nodeConfig.graph_model_name) {
        this.$set(this.wfNode.nodeConfig, 'graph_model_name', '')
      }
      if (!this.wfNode.nodeConfig.query_template) {
        this.$set(this.wfNode.nodeConfig, 'query_template', '${input}')
      }
      // 初始化临时知识库相关字段
      if (this.wfNode.nodeConfig.is_temp_kb === undefined) {
        this.$set(this.wfNode.nodeConfig, 'is_temp_kb', false)
      }
      if (!this.wfNode.nodeConfig.temp_kb_node_uuid) {
        this.$set(this.wfNode.nodeConfig, 'temp_kb_node_uuid', null)
      }
      return this.wfNode.nodeConfig
    }
  },

  mounted () {
    console.log('=== KnowledgeRetrievalNodeProperty mounted ===')

    // 初始化:检测上游临时知识库节点
    this.detectUpstreamTempKbNodes()

    // 加载永久知识库列表
    this.loadPermanentKnowledgeBases()

    // 初始化当前选择
    this.initializeSelection()

    // 监听X6 graph事件
    this.watchGraphChanges()

    console.log('=== mounted完成, upstreamTempKbNodes:', this.upstreamTempKbNodes.length, '个 ===')
  },

  beforeDestroy () {
    // 移除事件监听
    if (this.edgeRemovedHandler) {
      const graph = this.uiWorkflow.graph
      if (graph) {
        graph.off('cell:removed', this.edgeRemovedHandler)
      }
    }
  },

  methods: {
    /**
     * 检测上游临时知识库节点
     */
    detectUpstreamTempKbNodes () {
      const graph = this.uiWorkflow.graph
      if (!graph) {
        this.upstreamTempKbNodes = []
        return
      }

      const currentNodeId = this.wfNode.uuid
      const incomingEdges = graph.getIncomingEdges(currentNodeId)

      if (!incomingEdges || incomingEdges.length === 0) {
        this.upstreamTempKbNodes = []
        return
      }

      const tempKbNodes = []
      incomingEdges.forEach(edge => {
        const sourceId = edge.source.cell || edge.source
        const sourceNode = graph.getCellById(sourceId)

        if (sourceNode && sourceNode.data &&
            sourceNode.data.wfComponent &&
            sourceNode.data.wfComponent.name === 'TempKnowledgeBase') {
          tempKbNodes.push(sourceNode.data)
        }
      })

      this.upstreamTempKbNodes = tempKbNodes
      console.log('检测到上游临时知识库节点:', tempKbNodes.length, '个')
    },

    /**
     * 监听X6 graph变化事件
     */
    watchGraphChanges () {
      const graph = this.uiWorkflow.graph
      if (!graph) {
        return
      }

      // 监听边删除事件
      this.edgeRemovedHandler = ({ cell }) => {
        if (cell.isEdge && cell.isEdge()) {
          const targetNodeId = cell.target && cell.target.cell
          if (targetNodeId === this.wfNode.uuid) {
            this.$nextTick(() => {
              this.detectUpstreamTempKbNodes()
              this.validateTempKbSelection()
            })
          }
        }
      }

      graph.on('cell:removed', this.edgeRemovedHandler)
    },

    /**
     * 验证临时知识库选择的有效性
     */
    validateTempKbSelection () {
      if (!this.nodeConfig.is_temp_kb || !this.nodeConfig.temp_kb_node_uuid) {
        return
      }

      const stillExists = this.upstreamTempKbNodes.some(
        node => node.uuid === this.nodeConfig.temp_kb_node_uuid
      )

      if (!stillExists) {
        this.nodeConfig.knowledge_base_uuid = ''
        this.nodeConfig.knowledge_base_name = ''
        this.nodeConfig.is_temp_kb = false
        this.nodeConfig.temp_kb_node_uuid = null
        this.selectedKbSource = ''

        this.$message.warning('上游临时知识库节点已移除,已清除选择')

        this.$nextTick(() => {
          this.$root.$emit('workflow:update-node', {
            nodeUuid: this.wfNode.uuid,
            nodeData: this.wfNode
          })
        })
      }
    },

    /**
     * 加载永久知识库列表
     */
    async loadPermanentKnowledgeBases () {
      try {
        const { knowledgeBaseSearchMine, knowledgeBaseSearchPublic } =
          await import('@/components/70_ai/components/rag/utils')

        const [mineResponse, publicResponse] = await Promise.all([
          knowledgeBaseSearchMine('', 1, 100),
          knowledgeBaseSearchPublic('', 1, 100)
        ])

        this.permanentKbs = []

        if (mineResponse.data && mineResponse.data.records) {
          this.permanentKbs = this.permanentKbs.concat(
            mineResponse.data.records.map(item => ({
              value: item.kbUuid,
              label: item.title,
              is_public: item.isPublic
            }))
          )
        }

        if (publicResponse.data && publicResponse.data.records) {
          this.permanentKbs = this.permanentKbs.concat(
            publicResponse.data.records.map(item => ({
              value: item.kbUuid,
              label: item.title,
              is_public: item.isPublic
            }))
          )
        }

        // 去重
        this.permanentKbs = this.permanentKbs.filter(
          (kb, index, self) => self.findIndex(k => k.value === kb.value) === index
        )
      } catch (error) {
        console.error('加载永久知识库列表失败:', error)
      }
    },

    /**
     * 初始化当前选择
     */
    initializeSelection () {
      if (this.nodeConfig.is_temp_kb && this.nodeConfig.temp_kb_node_uuid) {
        this.selectedKbSource = `temp_${this.nodeConfig.temp_kb_node_uuid}`
      } else if (this.nodeConfig.knowledge_base_uuid) {
        const uuidWithoutBraces = this.nodeConfig.knowledge_base_uuid
          .replace(/^{/, '')
          .replace(/}$/, '')

        if (!uuidWithoutBraces.includes('_')) {
          this.selectedKbSource = `permanent_${this.nodeConfig.knowledge_base_uuid}`
        }
      }
    },

    /**
     * 处理知识库来源选择变化
     */
    handleKbSourceChange (value) {
      if (!value) {
        return
      }

      if (value.startsWith('permanent_')) {
        this.handlePermanentKbSelected(value.replace('permanent_', ''))
      } else if (value.startsWith('temp_')) {
        this.handleTempKbSelected(value.replace('temp_', ''))
      }
    },

    /**
     * 处理永久知识库选择
     */
    handlePermanentKbSelected (kbUuid) {
      const kb = this.permanentKbs.find(k => k.value === kbUuid)
      const kbName = kb ? kb.label : ''

      this.nodeConfig.knowledge_base_uuid = kbUuid
      this.nodeConfig.knowledge_base_name = kbName
      this.nodeConfig.is_temp_kb = false
      this.nodeConfig.temp_kb_node_uuid = null

      this.$set(this.wfNode.nodeConfig, 'knowledge_base_uuid', kbUuid)
      this.$set(this.wfNode.nodeConfig, 'knowledge_base_name', kbName)
      this.$set(this.wfNode.nodeConfig, 'is_temp_kb', false)
      this.$set(this.wfNode.nodeConfig, 'temp_kb_node_uuid', null)

      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    },

    /**
     * 处理临时知识库选择
     */
    handleTempKbSelected (tempKbNodeUuid) {
      const tempKbNode = this.upstreamTempKbNodes.find(node => node.uuid === tempKbNodeUuid)

      if (!tempKbNode) {
        this.$message.error('未找到指定的临时知识库节点')
        return
      }

      const variableRef = `{${tempKbNodeUuid}_kbUuid}`

      this.nodeConfig.knowledge_base_uuid = variableRef
      this.nodeConfig.knowledge_base_name = `${tempKbNode.title}(临时)`
      this.nodeConfig.is_temp_kb = true
      this.nodeConfig.temp_kb_node_uuid = tempKbNodeUuid

      this.$set(this.wfNode.nodeConfig, 'knowledge_base_uuid', variableRef)
      this.$set(this.wfNode.nodeConfig, 'knowledge_base_name', `${tempKbNode.title}(临时)`)
      this.$set(this.wfNode.nodeConfig, 'is_temp_kb', true)
      this.$set(this.wfNode.nodeConfig, 'temp_kb_node_uuid', tempKbNodeUuid)

      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    },

    /**
     * 处理知识库清除
     */
    handleKbClear () {
      this.nodeConfig.knowledge_base_uuid = ''
      this.nodeConfig.knowledge_base_name = ''
      this.nodeConfig.is_temp_kb = false
      this.nodeConfig.temp_kb_node_uuid = null
      this.selectedKbSource = ''

      this.$set(this.wfNode.nodeConfig, 'knowledge_base_uuid', '')
      this.$set(this.wfNode.nodeConfig, 'knowledge_base_name', '')
      this.$set(this.wfNode.nodeConfig, 'is_temp_kb', false)
      this.$set(this.wfNode.nodeConfig, 'temp_kb_node_uuid', null)

      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    },

    /**
     * 处理图谱检索模型选择
     */
    handleGraphModelSelected (modelName) {
      this.nodeConfig.graph_model_name = modelName

      this.$set(this.wfNode.nodeConfig, 'graph_model_name', modelName)

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
.knowledge-retrieval-node-property {
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

  .slider-container {
    padding: 0 12px;
  }
}
</style>
