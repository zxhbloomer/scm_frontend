# Quick Start: AI Workflow 工作流功能开发指南

**Date**: 2025-10-21
**Target Audience**: 前端开发者
**Estimated Time**: 30 分钟

本指南帮助开发者快速上手 AI Workflow 工作流功能的开发。

---

## 快速概览

AI Workflow 是一个可视化的工作流编排系统，允许用户通过拖拽节点的方式创建自动化流程。主要技术栈：

- **Vue.js 2.7.16** - 前端框架
- **AntV X6** - 图编辑引擎
- **Element UI** - UI 组件库
- **Vuex** - 状态管理
- **SSE** - 实时推送

---

## 前置条件

### 1. 开发环境

- **Node.js**: 14.x 或更高版本
- **npm**: 6.x 或更高版本
- **编辑器**: VS Code（推荐安装 Vetur 插件）

### 2. 项目依赖

确保以下依赖已安装（在 `package.json` 中）：

```json
{
  "dependencies": {
    "vue": "^2.7.16",
    "element-ui": "^2.15.14",
    "@antv/x6": "^2.0.0",
    "vuex": "^3.1.0",
    "axios": "^0.19.0"
  }
}
```

如需安装 X6：

```bash
npm install @antv/x6 --save
```

### 3. 后端 API

确保后端工作流 API 已就绪（参考 `contracts/workflow-api.md`）。

---

## 开发环境搭建

### 1. 启动开发服务器

```bash
cd D:\2025_project\20_project_in_github\01_scm_frontend\scm_frontend
npm run dev
```

访问：http://localhost:9528

### 2. 工作流模块目录结构

工作流相关代码位于 `src/components/70_ai` 模块：

```
src/components/70_ai/
├── components/workflow/  # Vue 组件
├── api/                 # API 服务
├── constants/           # 常量定义
├── store/modules/       # Vuex 状态
├── utils/               # 工具函数
└── styles/              # 样式文件
```

---

## 第一个工作流组件开发示例

### 示例：创建一个简单的节点配置面板

#### 1. 创建节点配置面板组件

**文件路径**: `src/components/70_ai/components/workflow/panels/NodeConfigPanel.vue`

```vue
<template>
  <el-drawer
    :visible.sync="visible"
    :title="node ? node.title : '节点配置'"
    direction="rtl"
    size="400px"
    :before-close="handleClose"
  >
    <div v-if="node" class="node-config-panel">
      <!-- 节点标题 -->
      <el-form ref="form" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="节点标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入节点标题" />
        </el-form-item>

        <!-- 根据节点类型显示不同的配置 -->
        <template v-if="node.component_name === 'LlmAnswer'">
          <!-- LLM 节点配置 -->
          <el-form-item label="AI 模型" prop="modelName">
            <el-select v-model="formData.modelName" placeholder="请选择模型">
              <el-option label="GPT-4" value="gpt-4" />
              <el-option label="GPT-3.5" value="gpt-3.5-turbo" />
            </el-select>
          </el-form-item>

          <el-form-item label="提示词模板" prop="promptTemplate">
            <el-input
              v-model="formData.promptTemplate"
              type="textarea"
              :rows="5"
              placeholder="请输入提示词模板"
            />
          </el-form-item>

          <el-form-item label="温度" prop="temperature">
            <el-slider v-model="formData.temperature" :min="0" :max="2" :step="0.1" />
          </el-form-item>
        </template>

        <!-- 保存按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleClose">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'NodeConfigPanel',
  props: {
    node: {
      type: Object,
      default: null
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        title: '',
        modelName: '',
        promptTemplate: '',
        temperature: 0.7
      },
      rules: {
        title: [
          { required: true, message: '请输入节点标题', trigger: 'blur' }
        ],
        modelName: [
          { required: true, message: '请选择 AI 模型', trigger: 'change' }
        ],
        promptTemplate: [
          { required: true, message: '请输入提示词模板', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    node: {
      handler(newNode) {
        if (newNode) {
          this.loadNodeConfig(newNode)
        }
      },
      immediate: true
    }
  },
  methods: {
    // 加载节点配置
    loadNodeConfig(node) {
      this.formData.title = node.title
      if (node.node_config) {
        this.formData.modelName = node.node_config.modelName || ''
        this.formData.promptTemplate = node.node_config.promptTemplate || ''
        this.formData.temperature = node.node_config.temperature || 0.7
      }
    },

    // 保存配置
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const updatedNode = {
            ...this.node,
            title: this.formData.title,
            node_config: {
              modelName: this.formData.modelName,
              promptTemplate: this.formData.promptTemplate,
              temperature: this.formData.temperature
            }
          }
          this.$emit('save', updatedNode)
          this.$message.success('节点配置已保存')
        }
      })
    },

    // 关闭面板
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped lang="scss">
.node-config-panel {
  padding: 20px;
}
</style>
```

#### 2. 在父组件中使用节点配置面板

**文件路径**: `src/components/70_ai/components/workflow/WorkflowCanvas.vue`

```vue
<template>
  <div class="workflow-canvas">
    <!-- X6 画布容器 -->
    <div ref="container" class="canvas-container"></div>

    <!-- 节点配置面板 -->
    <node-config-panel
      :node="selectedNode"
      :visible.sync="configPanelVisible"
      @save="handleNodeSave"
    />
  </div>
</template>

<script>
import { Graph } from '@antv/x6'
import NodeConfigPanel from './panels/NodeConfigPanel.vue'

export default {
  name: 'WorkflowCanvas',
  components: {
    NodeConfigPanel
  },
  props: {
    workflowUuid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      graph: null,
      selectedNode: null,
      configPanelVisible: false
    }
  },
  mounted() {
    this.initGraph()
    this.loadWorkflow()
  },
  methods: {
    // 初始化 X6 画布
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        width: 800,
        height: 600,
        grid: {
          size: 10,
          visible: true
        },
        panning: true,
        mousewheel: {
          enabled: true,
          modifiers: ['ctrl', 'meta']
        }
      })

      // 监听节点点击事件
      this.graph.on('node:click', ({ node }) => {
        this.selectedNode = node.getData()
        this.configPanelVisible = true
      })
    },

    // 加载工作流
    async loadWorkflow() {
      try {
        const response = await this.$axios.get(`/scm/ai/workflow/${this.workflowUuid}`)
        const { nodes, edges } = response.data.data

        // 渲染节点
        nodes.forEach(node => {
          this.graph.addNode({
            id: node.node_uuid,
            x: node.position_x,
            y: node.position_y,
            width: 200,
            height: 80,
            label: node.title,
            data: node
          })
        })

        // 渲染连线
        edges.forEach(edge => {
          this.graph.addEdge({
            id: edge.edge_uuid,
            source: edge.source_node_uuid,
            target: edge.target_node_uuid
          })
        })
      } catch (error) {
        this.$message.error('加载工作流失败：' + error.message)
      }
    },

    // 保存节点配置
    handleNodeSave(updatedNode) {
      // 更新 X6 节点
      const cell = this.graph.getCellById(updatedNode.node_uuid)
      if (cell) {
        cell.setData(updatedNode)
        cell.setAttrByPath('label/text', updatedNode.title)
      }

      // 保存到 Vuex
      this.$store.commit('workflow/UPDATE_NODE', {
        nodeUuid: updatedNode.node_uuid,
        updates: updatedNode
      })

      this.configPanelVisible = false
    }
  }
}
</script>

<style scoped lang="scss">
.workflow-canvas {
  width: 100%;
  height: 100%;

  .canvas-container {
    width: 100%;
    height: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
}
</style>
```

---

## 常见开发场景

### 场景 1: 添加新的节点类型

#### 步骤 1: 在常量文件中定义节点类型

**文件路径**: `src/components/70_ai/constants/nodeTypeDefinitions.js`

```javascript
export const NODE_TYPES = {
  START: {
    component_name: 'Start',
    title: '开始节点',
    icon: 'el-icon-video-play',
    category: 'input',
    defaultConfig: {}
  },
  LLM_ANSWER: {
    component_name: 'LlmAnswer',
    title: 'LLM 回答',
    icon: 'el-icon-chat-dot-round',
    category: 'ai',
    defaultConfig: {
      modelName: 'gpt-3.5-turbo',
      promptTemplate: '',
      temperature: 0.7,
      maxTokens: 2000
    }
  }
  // ... 添加更多节点类型
}
```

#### 步骤 2: 在节点配置面板中添加该类型的配置界面

（参考上面的 NodeConfigPanel 示例，添加对应的表单项）

---

### 场景 2: 调用 API 保存工作流

**文件路径**: `src/components/70_ai/api/workflowApi.js`

```javascript
import request from '@/utils/request'

// 保存工作流节点和连线（增量保存）
export function saveWorkflow(wfUuid, data) {
  return request({
    url: `/scm/ai/workflow/${wfUuid}/save`,
    method: 'post',
    data: {
      addedNodes: data.addedNodes || [],
      updatedNodes: data.updatedNodes || [],
      deletedNodeUuids: data.deletedNodeUuids || [],
      addedEdges: data.addedEdges || [],
      deletedEdgeUuids: data.deletedEdgeUuids || []
    }
  })
}

// 运行工作流（SSE）
export function runWorkflow(wfUuid, userInputs, onMessage, onError, onDone) {
  const url = `/scm/ai/workflow/${wfUuid}/run`
  const requestBody = { inputs: userInputs }

  // 复用 SSE 工具
  import('@/components/70_ai/utils/sseUtils').then(({ createKbQaStream }) => {
    createKbQaStream(
      url,
      requestBody,
      {
        onMessage: (event, data) => {
          onMessage(event, data)
        },
        onError: (error) => {
          onError(error)
        },
        onDone: () => {
          onDone()
        }
      },
      150000 // 超时时间 2.5 分钟
    )
  })
}
```

---

### 场景 3: 使用 Vuex 管理工作流状态

**文件路径**: `src/components/70_ai/store/modules/workflow.js`

```javascript
import { getWorkflowDetail, saveWorkflow } from '@/components/70_ai/api/workflowApi'

const state = {
  currentWorkflow: null,
  nodes: [],
  edges: [],
  isDirty: false
}

const mutations = {
  SET_CURRENT_WORKFLOW(state, workflow) {
    state.currentWorkflow = workflow
  },
  SET_NODES(state, nodes) {
    state.nodes = nodes
  },
  SET_EDGES(state, edges) {
    state.edges = edges
  },
  UPDATE_NODE(state, { nodeUuid, updates }) {
    const index = state.nodes.findIndex(n => n.node_uuid === nodeUuid)
    if (index !== -1) {
      state.nodes.splice(index, 1, { ...state.nodes[index], ...updates })
      state.isDirty = true
    }
  },
  ADD_NODE(state, node) {
    state.nodes.push(node)
    state.isDirty = true
  },
  DELETE_NODE(state, nodeUuid) {
    const index = state.nodes.findIndex(n => n.node_uuid === nodeUuid)
    if (index !== -1) {
      state.nodes.splice(index, 1)
      state.isDirty = true
    }
  },
  SET_DIRTY(state, isDirty) {
    state.isDirty = isDirty
  }
}

const actions = {
  // 加载工作流详情
  async loadWorkflow({ commit }, wfUuid) {
    try {
      const response = await getWorkflowDetail(wfUuid)
      const { workflow, nodes, edges } = response.data.data
      commit('SET_CURRENT_WORKFLOW', workflow)
      commit('SET_NODES', nodes)
      commit('SET_EDGES', edges)
      commit('SET_DIRTY', false)
    } catch (error) {
      console.error('加载工作流失败：', error)
      throw error
    }
  },

  // 保存工作流（增量保存）
  async saveWorkflow({ state, commit }) {
    if (!state.isDirty) {
      return
    }

    try {
      // 收集变更的节点和连线
      const changedData = {
        addedNodes: state.nodes.filter(n => n._isNew),
        updatedNodes: state.nodes.filter(n => n._isUpdated),
        deletedNodeUuids: state.nodes.filter(n => n._isDeleted).map(n => n.node_uuid),
        addedEdges: state.edges.filter(e => e._isNew),
        deletedEdgeUuids: state.edges.filter(e => e._isDeleted).map(e => e.edge_uuid)
      }

      await saveWorkflow(state.currentWorkflow.wf_uuid, changedData)
      commit('SET_DIRTY', false)
    } catch (error) {
      console.error('保存工作流失败：', error)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
```

**注册 Vuex 模块**:

在 `src/store/index.js` 中注册：

```javascript
import workflow from '@/components/70_ai/store/modules/workflow'

export default new Vuex.Store({
  modules: {
    // ... 其他模块
    workflow
  }
})
```

---

## 调试技巧

### 1. X6 画布调试

在浏览器控制台中访问 X6 实例：

```javascript
// 在 WorkflowCanvas 组件中
window.__graph = this.graph

// 在控制台中
__graph.getNodes()       // 获取所有节点
__graph.getEdges()       // 获取所有连线
__graph.getCellById(id)  // 根据 ID 获取节点或连线
```

### 2. SSE 事件调试

在 SSE 事件处理函数中添加日志：

```javascript
handleSseEvent(eventName, eventData) {
  console.log('[SSE Event]', eventName, eventData)

  // 处理事件...
}
```

### 3. Vuex 状态调试

安装 Vue Devtools 浏览器插件，在 Vuex 标签页中查看状态变化。

---

## 下一步

### 1. 阅读详细文档

- **研究文档**: `research.md` - 技术调研和决策
- **数据模型**: `data-model.md` - 数据结构定义
- **API 契约**: `contracts/workflow-api.md` - 后端 API 详细说明

### 2. 查看 aideepin 原始代码

参考 aideepin 的实现逻辑（严格遵循原有逻辑，不进行臆想或过度设计）：

- 工作流编辑器交互
- 节点配置逻辑
- 工作流运行引擎
- SSE 事件处理

### 3. 开始实施任务

执行 `/speckit.tasks` 命令生成详细的实施任务列表（`tasks.md`）。

---

## 常见问题

### Q: X6 节点如何自定义样式？

A: 使用 X6 的 `Graph.registerNode()` 方法注册自定义节点：

```javascript
import { Shape } from '@antv/x6'

Shape.register({
  shape: 'custom-node',
  width: 200,
  height: 80,
  markup: [
    {
      tagName: 'rect',
      selector: 'body'
    },
    {
      tagName: 'text',
      selector: 'label'
    }
  ],
  attrs: {
    body: {
      fill: '#f5f5f5',
      stroke: '#d9d9d9',
      strokeWidth: 2,
      rx: 6,
      ry: 6
    },
    label: {
      fontSize: 14,
      fill: '#333',
      textAnchor: 'middle',
      textVerticalAnchor: 'middle'
    }
  }
})
```

### Q: 如何处理 SSE 连接断开？

A: 在 SSE 工具中添加重连逻辑：

```javascript
let retryCount = 0
const maxRetries = 3

function connectSSE() {
  // ... 创建 SSE 连接

  eventSource.onerror = (error) => {
    if (retryCount < maxRetries) {
      retryCount++
      setTimeout(() => {
        connectSSE()
      }, 2000 * retryCount)
    } else {
      onError('SSE 连接失败，已达到最大重试次数')
    }
  }
}
```

### Q: 如何实现工作流的自动保存？

A: 使用 `watch` 监听 Vuex 状态变化，延迟保存：

```javascript
export default {
  data() {
    return {
      autoSaveTimer: null
    }
  },
  watch: {
    '$store.state.workflow.isDirty'(isDirty) {
      if (isDirty) {
        clearTimeout(this.autoSaveTimer)
        this.autoSaveTimer = setTimeout(() => {
          this.$store.dispatch('workflow/saveWorkflow')
        }, 5000) // 5 秒后自动保存
      }
    }
  }
}
```

---

**Quick Start 版本**: 1.0
**最后更新**: 2025-10-21
**下一步**: 执行 `/speckit.tasks` 生成实施任务列表
