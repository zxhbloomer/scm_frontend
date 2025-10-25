# Research: AI Workflow 工作流功能迁移

**Date**: 2025-10-21
**Phase**: Phase 0 - 技术调研与决策
**Input**: spec.md 中的 Clarifications 和 Technical Context

## 研究目标

解决 AI Workflow 功能迁移中的关键技术决策和实现细节，确保从 aideepin（Vue 3）到 SCM（Vue 2.7）的平滑迁移。

## 研究项 1: AntV X6 图编辑引擎集成

### 背景
aideepin 使用 @vue-flow/core v1.42.1 (Vue 3 专用)，SCM 前端使用 Vue 2.7，需要替代方案。

### 决策: 使用 AntV X6

**选择理由**:
1. **框架无关性**: X6 不依赖特定框架，支持 Vue 2/3、React
2. **功能完整**: 支持节点拖拽、连线、自定义节点/边、事件系统、SVG/HTML 渲染
3. **性能优秀**: 基于 SVG，支持大规模图形渲染（1000+ 节点）
4. **中文文档**: 阿里蚂蚁集团开源，有完善的中文文档和社区支持
5. **生产验证**: 已在蚂蚁金服、阿里云等大型项目中使用

**替代方案评估**:
- **Vue Flow (排除)**: 仅支持 Vue 3，不兼容 Vue 2.7
- **jsPlumb (考虑)**: 老牌图形库，但 API 复杂，性能较差
- **G6 (考虑)**: 同为 AntV 家族，但更适合图分析，不适合工作流编辑

### 实现方案

#### 1. X6 与 Vue Flow 功能映射

| Vue Flow 功能 | X6 对应实现 | 备注 |
|--------------|-------------|------|
| `VueFlow` 容器组件 | `Graph` 实例 | 通过 Vue 组件封装 Graph |
| `useVueFlow()` | `graph.on()` 事件监听 | 使用 X6 事件系统 |
| 节点拖拽 | `graph.enableHistory().enableSelection().enableSnapline()` | 内置支持 |
| 连线 | `graph.connect()` + `edge` 配置 | 支持自定义连线样式 |
| 自定义节点 | `Graph.registerNode()` | 支持 Vue 组件渲染 |
| 背景网格 | `grid` 配置 | 内置网格背景 |
| 缩放平移 | `graph.zoom()`, `graph.translate()` | 内置支持 |
| 小地图 | `Minimap` 插件 | 需要单独引入 |

#### 2. X6 初始化代码示例

```javascript
import { Graph, Shape } from '@antv/x6'

// 在 Vue 组件中初始化
mounted() {
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
    },
    connecting: {
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: { radius: 8 }
      },
      snap: true,
      allowBlank: false,
      allowMulti: false,
      allowLoop: false
    }
  })

  // 监听事件
  this.graph.on('node:click', ({ node }) => {
    this.handleNodeClick(node)
  })

  this.graph.on('edge:connected', ({ edge }) => {
    this.handleEdgeConnected(edge)
  })
}
```

#### 3. 自定义节点注册

```javascript
// 注册 LLM 节点类型
Shape.register({
  shape: 'llm-node',
  width: 200,
  height: 80,
  component: {
    template: `
      <div class="workflow-node llm-node">
        <div class="node-header">{{ node.data.title }}</div>
        <div class="node-content">
          <i class="el-icon-s-promotion"></i>
          <span>{{ node.data.modelName }}</span>
        </div>
      </div>
    `,
    props: ['node']
  },
  ports: {
    groups: {
      in: { position: 'left' },
      out: { position: 'right' }
    },
    items: [
      { id: 'in', group: 'in' },
      { id: 'out', group: 'out' }
    ]
  }
})
```

### 性能考虑

- **虚拟渲染**: X6 支持虚拟渲染，50+ 节点时性能优秀
- **Canvas 模式**: 大规模图形（100+ 节点）可切换到 Canvas 渲染
- **懒加载**: 节点配置面板按需加载，减少初始渲染时间

---

## 研究项 2: 节点间数据传递机制

### 背景
基于 aideepin 的 NodeIOData 结构，定义节点输入输出数据格式和传递逻辑。

### 数据结构定义 (来自 spec.md Clarifications)

```javascript
// NodeIOData 结构
{
  name: "参数名",
  content: {
    title: "显示标题",
    type: 1,  // 数据类型码
    value: "实际值"
  }
}

// WfIODataTypeEnum 类型映射
const DATA_TYPES = {
  TEXT: 1,        // 文本
  NUMBER: 2,      // 数字
  OPTIONS: 3,     // 下拉选项
  FILES: 4,       // 文件列表
  BOOL: 5,        // 布尔值
  REF_INPUT: 6,   // 引用节点输入参数
  REF_OUTPUT: 7   // 引用节点输出参数
}
```

### 实现方案

#### 1. 节点输出数据生成

```javascript
// 在节点执行完成后生成输出
generateNodeOutput(nodeUuid, result) {
  return {
    name: 'llm_response',
    content: {
      title: 'LLM 回答',
      type: DATA_TYPES.TEXT,
      value: result.text
    }
  }
}
```

#### 2. 节点输入数据解析

```javascript
// 解析节点输入，支持引用前序节点输出
resolveNodeInput(node, runtimeContext) {
  const inputs = []

  node.inputs.forEach(input => {
    if (input.content.type === DATA_TYPES.REF_OUTPUT) {
      // 引用前序节点输出
      const refNodeUuid = input.content.value.nodeUuid
      const refOutputName = input.content.value.outputName
      const refNodeOutput = runtimeContext.nodeOutputs[refNodeUuid]

      inputs.push({
        name: input.name,
        content: {
          title: input.content.title,
          type: DATA_TYPES.TEXT,
          value: refNodeOutput[refOutputName]
        }
      })
    } else {
      // 直接值
      inputs.push(input)
    }
  })

  return inputs
}
```

#### 3. 文件类型处理

```javascript
// 处理文件列表类型（用于文档提取节点）
handleFileInput(input) {
  if (input.content.type === DATA_TYPES.FILES) {
    // input.content.value 是 List<String>，包含文件 URL
    return input.content.value.map(fileUrl => ({
      url: fileUrl,
      name: fileUrl.split('/').pop()
    }))
  }
}
```

---

## 研究项 3: SSE 实时推送与事件处理

### 背景
工作流执行时通过 SSE 推送实时进度，需要复用 SCM 现有的 `sseUtils.js` 工具。

### SSE 事件类型 (来自 spec.md Clarifications)

```javascript
// 工作流执行 SSE 事件
const SSE_EVENTS = {
  START: '[START]',                          // 开始执行
  NODE_RUN: '[NODE_RUN_{nodeUuid}]',        // 节点开始运行
  NODE_INPUT: '[NODE_INPUT_{nodeUuid}]',    // 节点输入
  NODE_CHUNK: '[NODE_CHUNK_{nodeUuid}]',    // 节点流式输出（LLM）
  NODE_OUTPUT: '[NODE_OUTPUT_{nodeUuid}]',  // 节点输出
  NODE_WAIT_FEEDBACK: '[NODE_WAIT_FEEDBACK_BY_{nodeUuid}]', // 等待用户反馈
  DONE: '[DONE]',                            // 执行完成
  ERROR: '[ERROR]'                           // 执行错误
}
```

### 实现方案

#### 1. SSE 连接管理

```javascript
// 封装 SSE 工具函数（复用 src/components/70_ai/utils/sseUtils.js）
import { createKbQaStream } from '@/components/70_ai/utils/sseUtils'

startWorkflowExecution(workflowUuid, userInputs) {
  const url = `/scm/ai/workflow/run/${workflowUuid}`
  const requestBody = { inputs: userInputs }

  createKbQaStream(
    url,
    requestBody,
    {
      onMessage: (event, data) => {
        this.handleSseEvent(event, data)
      },
      onError: (error) => {
        this.$message.error('工作流执行失败：' + error)
      },
      onDone: () => {
        this.$message.success('工作流执行完成')
      }
    },
    150000 // 超时时间 2.5 分钟
  )
}
```

#### 2. SSE 事件分发

```javascript
handleSseEvent(eventName, eventData) {
  // 解析事件名，提取节点 UUID
  const nodeUuidMatch = eventName.match(/\{(.+?)\}/)
  const nodeUuid = nodeUuidMatch ? nodeUuidMatch[1] : null

  if (eventName === '[START]') {
    // 开始执行，初始化运行时状态
    this.initWorkflowRuntime(JSON.parse(eventData))
  }
  else if (eventName.startsWith('[NODE_RUN_')) {
    // 节点开始运行，高亮节点
    this.highlightNode(nodeUuid, 'running')
  }
  else if (eventName.startsWith('[NODE_INPUT_')) {
    // 节点输入，显示输入数据
    this.updateNodeInput(nodeUuid, JSON.parse(eventData))
  }
  else if (eventName.startsWith('[NODE_CHUNK_')) {
    // LLM 流式输出，追加文本块
    this.appendNodeChunk(nodeUuid, eventData)
  }
  else if (eventName.startsWith('[NODE_OUTPUT_')) {
    // 节点输出，标记节点完成
    this.updateNodeOutput(nodeUuid, JSON.parse(eventData))
    this.highlightNode(nodeUuid, 'success')
  }
  else if (eventName.startsWith('[NODE_WAIT_FEEDBACK_BY_')) {
    // 等待用户反馈，暂停执行
    this.promptUserFeedback(nodeUuid, eventData)
  }
  else if (eventName === '[DONE]') {
    // 执行完成
    this.completeWorkflowExecution()
  }
  else if (eventName === '[ERROR]') {
    // 执行错误
    this.handleExecutionError(eventData)
  }
}
```

#### 3. 节点状态视觉反馈

```javascript
// 在 X6 画布上更新节点状态
highlightNode(nodeUuid, status) {
  const node = this.graph.getCellById(nodeUuid)
  if (!node) return

  const statusColors = {
    running: '#1890ff',  // 蓝色 - 执行中
    success: '#52c41a',  // 绿色 - 成功
    fail: '#ff4d4f',     // 红色 - 失败
    waiting: '#faad14'   // 橙色 - 等待反馈
  }

  node.attr('body/stroke', statusColors[status])
  node.attr('body/strokeWidth', 3)

  // 添加动画效果（可选）
  if (status === 'running') {
    node.attr('body/stroke-dasharray', '5,5')
    node.attr('body/animation', 'running-dash 1s linear infinite')
  }
}
```

---

## 研究项 4: 工作流验证逻辑

### 背景
保存工作流前需要验证有效性：至少包含开始和结束节点、无孤立节点、无循环引用。

### 实现方案

#### 1. 拓扑排序检测循环

```javascript
// 使用拓扑排序检测有向图中的循环
detectCycle(nodes, edges) {
  const inDegree = {}
  const adjList = {}

  // 初始化入度和邻接表
  nodes.forEach(node => {
    inDegree[node.id] = 0
    adjList[node.id] = []
  })

  edges.forEach(edge => {
    adjList[edge.source].push(edge.target)
    inDegree[edge.target]++
  })

  // Kahn 算法
  const queue = []
  nodes.forEach(node => {
    if (inDegree[node.id] === 0) {
      queue.push(node.id)
    }
  })

  let processedCount = 0
  while (queue.length > 0) {
    const nodeId = queue.shift()
    processedCount++

    adjList[nodeId].forEach(neighbor => {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    })
  }

  // 如果处理的节点数少于总节点数，说明有循环
  return processedCount < nodes.length
}
```

#### 2. 孤立节点检测

```javascript
// 检测没有连接到任何其他节点的孤立节点
detectIsolatedNodes(nodes, edges) {
  const connectedNodes = new Set()

  edges.forEach(edge => {
    connectedNodes.add(edge.source)
    connectedNodes.add(edge.target)
  })

  return nodes.filter(node => {
    // 开始节点和结束节点允许单向连接
    if (node.type === 'start' || node.type === 'end') {
      return false
    }
    return !connectedNodes.has(node.id)
  })
}
```

#### 3. 必需节点检查

```javascript
// 检查是否包含开始节点和结束节点
validateRequiredNodes(nodes) {
  const hasStart = nodes.some(node => node.type === 'start')
  const hasEnd = nodes.some(node => node.type === 'end')

  const errors = []
  if (!hasStart) {
    errors.push('工作流必须包含开始节点')
  }
  if (!hasEnd) {
    errors.push('工作流必须包含结束节点')
  }

  return errors
}
```

#### 4. 节点配置完整性验证

```javascript
// 验证每个节点的必填配置是否完整
validateNodeConfigs(nodes) {
  const errors = []

  nodes.forEach(node => {
    if (node.type === 'llm' && !node.config.modelName) {
      errors.push(`LLM 节点 "${node.data.title}" 未选择模型`)
    }

    if (node.type === 'knowledge' && !node.config.kbUuid) {
      errors.push(`知识检索节点 "${node.data.title}" 未选择知识库`)
    }

    if (node.type === 'http' && !node.config.url) {
      errors.push(`HTTP 请求节点 "${node.data.title}" 未配置 URL`)
    }

    // ... 其他节点类型验证
  })

  return errors
}
```

#### 5. 综合验证函数

```javascript
// 在保存工作流前调用
validateWorkflow(workflow) {
  const errors = []

  // 1. 必需节点检查
  errors.push(...this.validateRequiredNodes(workflow.nodes))

  // 2. 循环引用检测
  if (this.detectCycle(workflow.nodes, workflow.edges)) {
    errors.push('工作流包含循环引用，请修正')
  }

  // 3. 孤立节点检测
  const isolatedNodes = this.detectIsolatedNodes(workflow.nodes, workflow.edges)
  if (isolatedNodes.length > 0) {
    errors.push(`存在孤立节点：${isolatedNodes.map(n => n.data.title).join(', ')}`)
  }

  // 4. 节点配置完整性
  errors.push(...this.validateNodeConfigs(workflow.nodes))

  if (errors.length > 0) {
    this.$message.error({
      message: '工作流验证失败',
      description: errors.join('\n')
    })
    return false
  }

  return true
}
```

---

## 研究项 5: HTTP 请求节点重试机制

### 背景
基于 aideepin 的 HttpRequestNode.java 和 WorkflowEngine.java 实现，HTTP 请求节点支持配置重试次数（0-10次）和超时时间（1-600秒）。

### 实现方案 (前端 Axios 配置)

```javascript
// HTTP 请求节点配置接口
interface HttpNodeConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers: Record<string, string>
  body?: any
  timeout: number        // 1-600 秒
  retryCount: number    // 0-10 次
}

// Axios 重试拦截器（类似 Apache HttpClient DefaultHttpRequestRetryHandler）
import axios from 'axios'
import axiosRetry from 'axios-retry'

function executeHttpNode(config: HttpNodeConfig) {
  const axiosInstance = axios.create({
    timeout: config.timeout * 1000, // 转换为毫秒
    headers: config.headers
  })

  // 配置重试逻辑
  axiosRetry(axiosInstance, {
    retries: config.retryCount,
    retryDelay: axiosRetry.exponentialDelay, // 指数退避
    retryCondition: (error) => {
      // 仅对网络错误和 5xx 错误重试
      return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
             (error.response && error.response.status >= 500)
    }
  })

  // 执行请求
  return axiosInstance.request({
    url: config.url,
    method: config.method,
    data: config.body
  })
  .then(response => {
    // HTTP 状态码非 200 时不抛出异常，返回错误内容继续执行
    if (response.status !== 200) {
      return {
        success: false,
        statusCode: response.status,
        error: response.data
      }
    }
    return {
      success: true,
      data: response.data
    }
  })
  .catch(error => {
    // 仅 IOException 等严重异常抛出
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      throw new Error(`HTTP 请求失败：${error.message}`)
    }
    // 其他错误返回错误内容继续执行
    return {
      success: false,
      error: error.message
    }
  })
}
```

**关键点**:
1. 前端使用 `axios-retry` 库实现类似 Apache HttpClient 的重试机制
2. HTTP 状态码非 200 时不中断工作流，返回错误内容继续执行
3. 仅网络错误（IOException 等）才标记工作流失败

---

## 研究项 6: Element UI 组件选择

### 背景
必须使用 Element UI 组件库构建工作流界面，保持与 SCM 系统一致的 UI 风格。

### 组件选型

| 功能模块 | Element UI 组件 | 用途 |
|---------|----------------|------|
| 工作流列表 | `el-table` + `el-pagination` | 分页表格显示工作流 |
| 工作流弹窗 | `el-dialog` | 主容器弹窗 |
| 标签页切换 | `el-tabs` | 我的工作流 / 公开市场 |
| 节点配置面板 | `el-form` + `el-form-item` | 节点属性表单 |
| 模型选择 | `el-select` | 下拉选择 AI 模型 |
| 文本输入 | `el-input` (type="textarea") | 提示词模板输入 |
| 数字输入 | `el-input-number` | 相似度阈值、超时时间等 |
| 开关控制 | `el-switch` | 布尔配置（严格模式等） |
| 按钮操作 | `el-button` | 保存、运行、删除等 |
| 消息提示 | `this.$message` | 操作反馈 |
| 确认对话框 | `this.$confirm` | 删除确认等 |
| 加载状态 | `el-loading` | 全屏 loading |
| 折叠面板 | `el-collapse` | 节点输入输出展示 |
| 进度条 | `el-progress` | 工作流执行进度 |

### 样式一致性

```scss
// 工作流样式继承 SCM 主题
.workflow-dialog {
  .el-dialog__header {
    // 复用 SCM dialog 样式
  }

  .workflow-canvas {
    border: 1px solid #dcdfe6; // Element UI 边框色
    border-radius: 4px;        // Element UI 圆角
  }

  .workflow-node {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
    // Element UI 默认字体
  }
}
```

---

## 研究总结

### 关键技术决策

1. **图编辑引擎**: AntV X6（替代 Vue Flow）
   - 理由：框架无关、功能完整、性能优秀、中文文档

2. **数据传递格式**: 严格遵循 aideepin 的 NodeIOData 结构
   - 7 种数据类型：TEXT、NUMBER、OPTIONS、FILES、BOOL、REF_INPUT、REF_OUTPUT

3. **SSE 事件处理**: 复用 SCM 现有 `sseUtils.js`
   - 8 种 SSE 事件：START、NODE_RUN、NODE_INPUT、NODE_CHUNK、NODE_OUTPUT、NODE_WAIT_FEEDBACK、DONE、ERROR

4. **工作流验证**: 拓扑排序 + 孤立节点检测 + 配置完整性
   - 保存前验证，提前发现问题

5. **HTTP 重试机制**: 使用 axios-retry 模拟 Apache HttpClient
   - 支持 0-10 次重试，1-600 秒超时

### 风险与缓解

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| X6 学习曲线 | 开发延迟 | 提前研究官方文档，参考示例代码 |
| Vue 2.7 兼容性 | 功能缺失 | 使用 Options API，避免 Vue 3 特性 |
| SSE 连接稳定性 | 执行中断 | 实现重连机制，错误提示 |
| 50+ 节点性能 | 渲染卡顿 | 使用 X6 虚拟渲染，懒加载节点配置 |

### 后续行动

1. **Phase 1**: 基于研究结果生成 data-model.md（数据模型）
2. **Phase 1**: 设计 API contracts（后端接口契约）
3. **Phase 1**: 编写 quickstart.md（快速开始指南）
4. **Phase 2**: 生成 tasks.md（实施任务分解）

---

**研究完成时间**: 2025-10-21
**下一阶段**: Phase 1 - 设计与契约定义
