# Data Model: AI Workflow 工作流功能

**Date**: 2025-10-21
**Phase**: Phase 1 - 数据模型设计
**Source**: spec.md Key Entities + aideepin 后端实体定义

## 概述

本文档定义 AI Workflow 功能的前后端数据模型，包括工作流定义、节点配置、运行时状态、历史记录等核心实体。

## 实体关系图

```
Workflow (工作流)
  ├── WorkflowNode (节点) [1:N]
  │     └── WorkflowComponent (节点类型定义) [N:1]
  ├── WorkflowEdge (连线) [1:N]
  └── WorkflowRuntime (运行时) [1:N]
        └── WorkflowRuntimeNode (运行时节点) [1:N]
```

---

## 核心实体

### 1. Workflow (工作流)

**描述**: 代表一个自动化流程定义，包含节点、连线和配置信息。

**属性**:

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `wf_uuid` | String | 是 | 工作流唯一标识 | UUID 格式 |
| `name` | String | 是 | 工作流名称 | 1-100 字符 |
| `description` | String | 否 | 工作流描述 | 最多 500 字符 |
| `is_public` | Boolean | 是 | 是否公开（显示在市场） | true/false，默认 false |
| `creator_id` | Long | 是 | 创建用户 ID | - |
| `creator_name` | String | 是 | 创建用户名称 | - |
| `c_time` | DateTime | 是 | 创建时间 | ISO 8601 格式 |
| `u_time` | DateTime | 是 | 修改时间 | ISO 8601 格式 |
| `is_deleted` | Boolean | 是 | 是否删除（软删除） | true/false，默认 false |
| `dbversion` | Integer | 是 | 数据版本（乐观锁） | 自增 |

**索引**:
- 主键: `wf_uuid`
- 普通索引: `creator_id`, `is_public`, `is_deleted`

**前端状态扩展** (仅前端 Vuex 状态):
```javascript
{
  // 后端字段
  wf_uuid: 'uuid-xxx',
  name: '客户咨询自动回复',
  description: '基于知识库自动回答客户问题',
  is_public: false,
  creator_id: 123,
  creator_name: '张三',
  c_time: '2025-10-21T10:00:00Z',
  u_time: '2025-10-21T11:30:00Z',
  is_deleted: false,
  dbversion: 5,

  // 前端扩展字段（不发送到后端）
  isDirty: false,        // 是否有未保存修改
  isRunning: false,      // 是否正在运行
  nodeCount: 5,          // 节点数量（前端计算）
  edgeCount: 4           // 连线数量（前端计算）
}
```

---

### 2. WorkflowNode (工作流节点)

**描述**: 工作流中的单个处理单元，包含类型、配置、输入输出定义和画布位置。

**属性**:

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `node_uuid` | String | 是 | 节点唯一标识 | UUID 格式 |
| `wf_uuid` | String | 是 | 所属工作流 UUID | 外键关联 Workflow |
| `component_name` | String | 是 | 组件名称（节点类型） | 参考 WorkflowComponent |
| `title` | String | 是 | 节点显示标题 | 1-50 字符 |
| `input_config` | JSON | 是 | 输入参数配置 | NodeIODefinition 数组 |
| `node_config` | JSON | 是 | 节点特定配置 | 根据节点类型变化 |
| `output_config` | JSON | 是 | 输出参数配置 | NodeIODefinition 数组 |
| `position_x` | Integer | 是 | 画布 X 坐标 | >= 0 |
| `position_y` | Integer | 是 | 画布 Y 坐标 | >= 0 |
| `is_deleted` | Boolean | 是 | 是否删除（软删除） | true/false，默认 false |
| `dbversion` | Integer | 是 | 数据版本（乐观锁） | 自增 |

**索引**:
- 主键: `node_uuid`
- 普通索引: `wf_uuid`, `component_name`, `is_deleted`

**示例 - LLM 回答节点**:
```javascript
{
  node_uuid: 'node-uuid-001',
  wf_uuid: 'wf-uuid-xxx',
  component_name: 'LlmAnswer',
  title: 'AI 客服回答',

  // 输入配置
  input_config: [
    {
      name: 'user_question',
      title: '用户问题',
      type: 1,  // TEXT
      required: true
    },
    {
      name: 'context',
      title: '上下文知识',
      type: 1,  // TEXT
      required: false
    }
  ],

  // 节点配置（LLM 特定）
  node_config: {
    modelName: 'gpt-4',
    modelUuid: 'model-uuid-001',
    promptTemplate: '请基于以下知识回答用户问题：\n知识：{{context}}\n问题：{{user_question}}',
    temperature: 0.7,
    maxTokens: 2000
  },

  // 输出配置
  output_config: [
    {
      name: 'answer',
      title: 'AI 回答',
      type: 1  // TEXT
    }
  ],

  position_x: 300,
  position_y: 200,
  is_deleted: false,
  dbversion: 1
}
```

**示例 - 知识检索节点**:
```javascript
{
  node_uuid: 'node-uuid-002',
  wf_uuid: 'wf-uuid-xxx',
  component_name: 'KnowledgeRetrieval',
  title: '知识库检索',

  input_config: [
    {
      name: 'query',
      title: '检索问题',
      type: 1,  // TEXT
      required: true
    }
  ],

  node_config: {
    kbUuid: 'kb-uuid-001',
    kbName: '产品知识库',
    retrieveMaxResults: 5,
    retrieveMinScore: 0.5,
    strictMode: false
  },

  output_config: [
    {
      name: 'knowledge',
      title: '检索结果',
      type: 1  // TEXT
    }
  ],

  position_x: 100,
  position_y: 200,
  is_deleted: false,
  dbversion: 1
}
```

**示例 - HTTP 请求节点**:
```javascript
{
  node_uuid: 'node-uuid-003',
  wf_uuid: 'wf-uuid-xxx',
  component_name: 'HttpRequest',
  title: 'API 调用',

  input_config: [
    {
      name: 'request_body',
      title: '请求参数',
      type: 1,  // TEXT
      required: false
    }
  ],

  node_config: {
    url: 'https://api.example.com/data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{api_token}}'
    },
    timeout: 30,      // 1-600 秒
    retryCount: 3     // 0-10 次
  },

  output_config: [
    {
      name: 'response',
      title: 'API 响应',
      type: 1  // TEXT
    }
  ],

  position_x: 500,
  position_y: 200,
  is_deleted: false,
  dbversion: 1
}
```

---

### 3. WorkflowEdge (工作流边/连线)

**描述**: 连接两个节点的线，定义数据流向。

**属性**:

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `edge_uuid` | String | 是 | 连线唯一标识 | UUID 格式 |
| `wf_uuid` | String | 是 | 所属工作流 UUID | 外键关联 Workflow |
| `source_node_uuid` | String | 是 | 源节点 UUID | 外键关联 WorkflowNode |
| `source_handle_id` | String | 否 | 源节点输出端口 ID | 默认 'out' |
| `target_node_uuid` | String | 是 | 目标节点 UUID | 外键关联 WorkflowNode |
| `target_handle_id` | String | 否 | 目标节点输入端口 ID | 默认 'in' |
| `is_deleted` | Boolean | 是 | 是否删除（软删除） | true/false，默认 false |
| `dbversion` | Integer | 是 | 数据版本（乐观锁） | 自增 |

**索引**:
- 主键: `edge_uuid`
- 普通索引: `wf_uuid`, `source_node_uuid`, `target_node_uuid`, `is_deleted`

**示例**:
```javascript
{
  edge_uuid: 'edge-uuid-001',
  wf_uuid: 'wf-uuid-xxx',
  source_node_uuid: 'node-uuid-001',  // 开始节点
  source_handle_id: 'out',
  target_node_uuid: 'node-uuid-002',  // 知识检索节点
  target_handle_id: 'in',
  is_deleted: false,
  dbversion: 1
}
```

---

### 4. WorkflowComponent (工作流组件)

**描述**: 节点类型的定义，系统预定义的组件库。

**属性**:

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `component_name` | String | 是 | 组件名称（唯一） | 驼峰命名 |
| `title` | String | 是 | 组件显示标题 | 1-50 字符 |
| `description` | String | 否 | 组件描述 | 最多 200 字符 |
| `icon` | String | 否 | 组件图标（Element UI icon） | el-icon-xxx |
| `is_enabled` | Boolean | 是 | 是否启用 | true/false，默认 true |
| `category` | String | 是 | 组件分类 | input/output/logic/ai/integration |

**索引**:
- 主键: `component_name`

**预定义组件列表**:

| component_name | title | category | description |
|----------------|-------|----------|-------------|
| `Start` | 开始节点 | input | 工作流入口，接收用户输入 |
| `End` | 结束节点 | output | 工作流出口，输出最终结果 |
| `LlmAnswer` | LLM 回答 | ai | 使用大语言模型生成文本回答 |
| `Classifier` | 分类器 | logic | 基于 LLM 分类结果路由流程 |
| `Branch` | 分支 | logic | 基于条件表达式路由流程 |
| `Template` | 模板 | logic | 文本模板填充变量 |
| `DocumentExtract` | 文档提取 | ai | 从 PDF/Word 提取文本内容 |
| `KeywordExtract` | 关键词提取 | ai | 从文本提取关键词 |
| `FaqExtract` | FAQ 提取 | ai | 从文本提取问答对 |
| `KnowledgeRetrieval` | 知识检索 | ai | 从知识库检索相关内容 |
| `HttpRequest` | HTTP 请求 | integration | 调用外部 API 接口 |
| `HumanFeedback` | 人工反馈 | input | 等待用户输入反馈 |
| `EmailSend` | 邮件发送 | integration | 发送邮件通知 |
| `GoogleSearch` | Google 搜索 | integration | 执行 Google 搜索 |
| `ImageGenDalle3` | Dalle3 图像生成 | ai | 使用 Dalle3 生成图像 |
| `ImageGenTongyi` | 通义万相图像生成 | ai | 使用通义万相生成图像 |

---

### 5. WorkflowRuntime (工作流运行时)

**描述**: 代表一次工作流执行实例，记录输入、输出、状态和执行时间。

**属性**:

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `runtime_uuid` | String | 是 | 运行时唯一标识 | UUID 格式 |
| `wf_uuid` | String | 是 | 工作流 UUID | 外键关联 Workflow |
| `user_inputs` | JSON | 是 | 用户输入参数 | NodeIOData 数组 |
| `outputs` | JSON | 否 | 输出结果 | NodeIOData 数组 |
| `status` | Integer | 是 | 执行状态 | 1=READY, 2=DOING, 3=SUCCESS, 4=FAIL, 5=WAITING_INPUT |
| `status_remark` | String | 否 | 状态说明（错误信息） | 最多 1000 字符 |
| `start_time` | DateTime | 是 | 开始执行时间 | ISO 8601 格式 |
| `end_time` | DateTime | 否 | 结束执行时间 | ISO 8601 格式 |
| `c_time` | DateTime | 是 | 创建时间 | ISO 8601 格式 |

**索引**:
- 主键: `runtime_uuid`
- 普通索引: `wf_uuid`, `status`, `start_time`

**状态码定义**:
```javascript
const WORKFLOW_STATUS = {
  READY: 1,          // 就绪（未开始）
  DOING: 2,          // 执行中
  SUCCESS: 3,        // 成功完成
  FAIL: 4,           // 执行失败
  WAITING_INPUT: 5   // 等待用户输入
}
```

**示例**:
```javascript
{
  runtime_uuid: 'runtime-uuid-001',
  wf_uuid: 'wf-uuid-xxx',

  user_inputs: [
    {
      name: 'user_question',
      content: {
        title: '用户问题',
        type: 1,  // TEXT
        value: '如何重置密码？'
      }
    }
  ],

  outputs: [
    {
      name: 'final_answer',
      content: {
        title: '最终回答',
        type: 1,  // TEXT
        value: '您可以通过以下步骤重置密码：1. 点击登录页的"忘记密码"...'
      }
    }
  ],

  status: 3,  // SUCCESS
  status_remark: null,
  start_time: '2025-10-21T10:00:00Z',
  end_time: '2025-10-21T10:00:15Z',
  c_time: '2025-10-21T10:00:00Z'
}
```

---

### 6. WorkflowRuntimeNode (工作流运行时节点)

**描述**: 单个节点的执行记录，包含输入、输出和执行状态。

**属性**:

| 字段名 | 类型 | 必填 | 说明 | 验证规则 |
|--------|------|------|------|----------|
| `runtime_node_uuid` | String | 是 | 运行时节点唯一标识 | UUID 格式 |
| `runtime_uuid` | String | 是 | 运行时 UUID | 外键关联 WorkflowRuntime |
| `node_uuid` | String | 是 | 节点 UUID | 外键关联 WorkflowNode |
| `inputs` | JSON | 是 | 节点输入数据 | NodeIOData 数组 |
| `outputs` | JSON | 否 | 节点输出数据 | NodeIOData 数组 |
| `status` | Integer | 是 | 节点执行状态 | 1=READY, 2=DOING, 3=SUCCESS, 4=FAIL |
| `status_remark` | String | 否 | 状态说明（错误信息） | 最多 1000 字符 |
| `start_time` | DateTime | 是 | 节点开始执行时间 | ISO 8601 格式 |
| `end_time` | DateTime | 否 | 节点结束执行时间 | ISO 8601 格式 |

**索引**:
- 主键: `runtime_node_uuid`
- 普通索引: `runtime_uuid`, `node_uuid`, `status`

**节点状态码定义**:
```javascript
const NODE_STATUS = {
  READY: 1,    // 就绪（未开始）
  DOING: 2,    // 执行中
  SUCCESS: 3,  // 成功完成
  FAIL: 4      // 执行失败
}
```

**示例**:
```javascript
{
  runtime_node_uuid: 'rn-uuid-001',
  runtime_uuid: 'runtime-uuid-001',
  node_uuid: 'node-uuid-002',  // 知识检索节点

  inputs: [
    {
      name: 'query',
      content: {
        title: '检索问题',
        type: 1,  // TEXT
        value: '如何重置密码？'
      }
    }
  ],

  outputs: [
    {
      name: 'knowledge',
      content: {
        title: '检索结果',
        type: 1,  // TEXT
        value: '找到 3 条相关知识：\n1. 密码重置流程...\n2. 忘记密码处理...\n3. 账户安全设置...'
      }
    }
  ],

  status: 3,  // SUCCESS
  status_remark: null,
  start_time: '2025-10-21T10:00:02Z',
  end_time: '2025-10-21T10:00:05Z'
}
```

---

## 辅助数据结构

### NodeIODefinition (节点输入输出定义)

**描述**: 定义节点的输入或输出参数。

**结构**:
```javascript
{
  name: String,        // 参数名称（唯一，驼峰命名）
  title: String,       // 显示标题（中文）
  type: Integer,       // 数据类型码（见 WfIODataTypeEnum）
  required: Boolean,   // 是否必填
  defaultValue?: Any   // 默认值（可选）
}
```

**示例**:
```javascript
{
  name: 'prompt',
  title: '提示词',
  type: 1,  // TEXT
  required: true,
  defaultValue: '请回答用户问题'
}
```

---

### NodeIOData (节点输入输出数据)

**描述**: 运行时节点间传递的数据。

**结构**:
```javascript
{
  name: String,     // 参数名称
  content: {
    title: String,  // 显示标题
    type: Integer,  // 数据类型码
    value: Any      // 实际值（根据 type 不同而变化）
  }
}
```

**数据类型码 (WfIODataTypeEnum)**:

| 类型码 | 类型名称 | value 类型 | 说明 |
|-------|---------|-----------|------|
| 1 | TEXT | String | 文本字符串 |
| 2 | NUMBER | Number | 数字 |
| 3 | OPTIONS | Array<String> | 下拉选项列表 |
| 4 | FILES | Array<String> | 文件 URL 列表 |
| 5 | BOOL | Boolean | 布尔值 |
| 6 | REF_INPUT | Object | 引用节点输入参数 |
| 7 | REF_OUTPUT | Object | 引用节点输出参数 |

**示例 - 文本类型**:
```javascript
{
  name: 'answer',
  content: {
    title: 'AI 回答',
    type: 1,  // TEXT
    value: '您可以通过以下步骤重置密码...'
  }
}
```

**示例 - 文件列表类型**:
```javascript
{
  name: 'documents',
  content: {
    title: '上传文档',
    type: 4,  // FILES
    value: [
      'https://file.example.com/doc1.pdf',
      'https://file.example.com/doc2.docx'
    ]
  }
}
```

**示例 - 引用节点输出**:
```javascript
{
  name: 'context',
  content: {
    title: '上下文知识',
    type: 7,  // REF_OUTPUT
    value: {
      nodeUuid: 'node-uuid-002',  // 引用知识检索节点
      outputName: 'knowledge'      // 引用该节点的 knowledge 输出
    }
  }
}
```

---

## 前端 Vuex 状态结构

### workflow 模块

```javascript
// src/components/70_ai/store/modules/workflow.js

state: {
  // 当前编辑的工作流
  currentWorkflow: {
    wf_uuid: null,
    name: '',
    description: '',
    is_public: false,
    creator_id: null,
    creator_name: '',
    c_time: null,
    u_time: null,
    is_deleted: false,
    dbversion: 0
  },

  // 当前工作流的节点列表
  nodes: [],  // WorkflowNode[]

  // 当前工作流的连线列表
  edges: [],  // WorkflowEdge[]

  // 工作流列表（我的工作流 + 公开市场）
  workflowList: [],

  // 节点组件库
  componentLibrary: [],  // WorkflowComponent[]

  // 编辑器状态
  editorState: {
    isDirty: false,       // 是否有未保存修改
    selectedNodeId: null, // 当前选中节点 ID
    isConfigPanelOpen: false  // 配置面板是否打开
  }
}

mutations: {
  SET_CURRENT_WORKFLOW(state, workflow) {},
  ADD_NODE(state, node) {},
  UPDATE_NODE(state, { nodeUuid, updates }) {},
  DELETE_NODE(state, nodeUuid) {},
  ADD_EDGE(state, edge) {},
  DELETE_EDGE(state, edgeUuid) {},
  SET_WORKFLOW_LIST(state, list) {},
  SET_COMPONENT_LIBRARY(state, components) {},
  SET_DIRTY(state, isDirty) {},
  SELECT_NODE(state, nodeUuid) {}
}

actions: {
  // 加载工作流
  async loadWorkflow({ commit }, wfUuid) {},

  // 保存工作流（增量保存）
  async saveWorkflow({ state, commit }) {},

  // 创建新工作流
  async createWorkflow({ commit }, { name, description }) {},

  // 删除工作流
  async deleteWorkflow({ commit }, wfUuid) {},

  // 复制工作流
  async duplicateWorkflow({ commit }, wfUuid) {},

  // 加载工作流列表
  async loadWorkflowList({ commit }, { type }) {},

  // 加载组件库
  async loadComponentLibrary({ commit }) {}
}
```

### workflowRuntime 模块

```javascript
// src/components/70_ai/store/modules/workflowRuntime.js

state: {
  // 当前运行的工作流
  currentRuntime: {
    runtime_uuid: null,
    wf_uuid: null,
    status: 1,  // READY
    status_remark: null,
    start_time: null,
    end_time: null
  },

  // 运行时节点状态
  runtimeNodes: {},  // { [nodeUuid]: WorkflowRuntimeNode }

  // SSE 连接状态
  sseConnected: false,
  sseError: null,

  // 运行历史列表
  runtimeHistory: [],

  // 当前查看的历史详情
  selectedHistory: null
}

mutations: {
  SET_CURRENT_RUNTIME(state, runtime) {},
  UPDATE_RUNTIME_STATUS(state, { status, statusRemark }) {},
  SET_NODE_STATUS(state, { nodeUuid, status, statusRemark }) {},
  UPDATE_NODE_INPUT(state, { nodeUuid, inputs }) {},
  UPDATE_NODE_OUTPUT(state, { nodeUuid, outputs }) {},
  APPEND_NODE_CHUNK(state, { nodeUuid, chunk }) {},
  SET_SSE_CONNECTED(state, connected) {},
  SET_SSE_ERROR(state, error) {},
  SET_RUNTIME_HISTORY(state, history) {},
  SET_SELECTED_HISTORY(state, history) {}
}

actions: {
  // 运行工作流
  async runWorkflow({ commit, dispatch }, { wfUuid, userInputs }) {},

  // 停止工作流
  async stopWorkflow({ state, commit }) {},

  // 提供人工反馈
  async provideFeedback({ state, commit }, { nodeUuid, feedback }) {},

  // 加载运行历史
  async loadRuntimeHistory({ commit }, wfUuid) {},

  // 加载历史详情
  async loadHistoryDetail({ commit }, runtimeUuid) {},

  // 删除运行历史
  async deleteRuntimeHistory({ commit }, runtimeUuid) {}
}
```

---

## 数据验证规则

### 工作流验证

```javascript
// 工作流名称验证
const validateWorkflowName = (name) => {
  if (!name || name.trim().length === 0) {
    return '工作流名称不能为空'
  }
  if (name.length > 100) {
    return '工作流名称不能超过 100 个字符'
  }
  return null
}

// 工作流完整性验证
const validateWorkflowIntegrity = (nodes, edges) => {
  const errors = []

  // 1. 必须包含开始节点和结束节点
  const hasStart = nodes.some(n => n.component_name === 'Start')
  const hasEnd = nodes.some(n => n.component_name === 'End')
  if (!hasStart) errors.push('工作流必须包含开始节点')
  if (!hasEnd) errors.push('工作流必须包含结束节点')

  // 2. 检测循环引用
  if (detectCycle(nodes, edges)) {
    errors.push('工作流包含循环引用，请修正')
  }

  // 3. 检测孤立节点
  const isolatedNodes = detectIsolatedNodes(nodes, edges)
  if (isolatedNodes.length > 0) {
    errors.push(`存在孤立节点：${isolatedNodes.map(n => n.title).join(', ')}`)
  }

  // 4. 检查节点配置完整性
  nodes.forEach(node => {
    const configErrors = validateNodeConfig(node)
    errors.push(...configErrors)
  })

  return errors
}
```

### 节点配置验证

```javascript
// LLM 节点配置验证
const validateLlmNodeConfig = (config) => {
  const errors = []
  if (!config.modelName) {
    errors.push('请选择 AI 模型')
  }
  if (!config.promptTemplate) {
    errors.push('请输入提示词模板')
  }
  return errors
}

// HTTP 请求节点配置验证
const validateHttpNodeConfig = (config) => {
  const errors = []
  if (!config.url) {
    errors.push('请输入请求 URL')
  } else if (!/^https?:\/\/.+/.test(config.url)) {
    errors.push('请输入有效的 HTTP/HTTPS URL')
  }
  if (config.timeout < 1 || config.timeout > 600) {
    errors.push('超时时间必须在 1-600 秒之间')
  }
  if (config.retryCount < 0 || config.retryCount > 10) {
    errors.push('重试次数必须在 0-10 次之间')
  }
  return errors
}
```

---

## 前端组件数据结构

### WorkflowCanvas 组件

**Props**:
```javascript
{
  workflowUuid: String,     // 工作流 UUID
  readonly: Boolean,        // 是否只读模式
  showMinimap: Boolean      // 是否显示缩略图
}
```

**Data**:
```javascript
{
  graph: null,              // X6 Graph 实例
  nodes: [],                // 画布节点列表
  edges: [],                // 画布连线列表
  selectedNode: null,       // 当前选中节点
  isDragging: false,        // 是否正在拖拽
  scale: 1.0                // 画布缩放比例
}
```

### NodeConfigPanel 组件

**Props**:
```javascript
{
  node: Object,             // 当前节点对象
  visible: Boolean          // 面板是否可见
}
```

**Data**:
```javascript
{
  formData: {},            // 节点配置表单数据
  rules: {},               // 表单验证规则
  loading: false           // 保存中状态
}
```

### WorkflowRunner 组件

**Props**:
```javascript
{
  workflowUuid: String,     // 工作流 UUID
  userInputs: Array         // 用户输入参数
}
```

**Data**:
```javascript
{
  runtimeUuid: null,        // 运行时 UUID
  status: 1,                // 执行状态
  currentNodeUuid: null,    // 当前执行节点
  nodeStatuses: {},         // 节点状态映射
  sseConnected: false,      // SSE 连接状态
  outputText: ''            // 输出文本（流式累积）
}
```

---

**数据模型版本**: 1.0
**最后更新**: 2025-10-21
**下一步**: 生成 API contracts (OpenAPI 规范)
