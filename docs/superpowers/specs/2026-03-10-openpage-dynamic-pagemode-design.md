# OpenPage节点动态page_mode + 显示优化 设计方案

## 背景

工作流42（通用-打开页面-流程）中，OpenPage节点的`page_mode`（new/edit/view等）来自数据库静态配置，
而非LLM动态判断。同时ThinkingSteps中OpenPage节点不显示参数，End节点被过滤不显示。

## 工作流拓扑

```
开始 → MCP(获取pagecode路由,id=245) → Classifier(路由判断,id=253)
  ├─ 单个路由 → OpenPage(id=248) → 结束1
  ├─ 多个路由 → HumanFeedback → OpenPage1(id=249) → 结束
  └─ 没找到   → Answer(美化返回) → 结束2
```

## 改动清单

### 1. 数据库清理 — OpenPage节点垃圾数据

清理节点248/249的`node_config`中已删除功能的残留字段。

节点248清理后：
```json
{"prompt":"","open_mode":"route","model_name":"","show_process_output":true}
```

节点249清理后：
```json
{"prompt":"","open_mode":"route","model_name":""}
```

清理字段：`route`、`timeout_minutes`、`interaction_type`、`interaction_enabled`、
`interaction_description`、`page_mode`（后续由LLM动态生成）。

### 2. MCP prompt增加page_mode提取

修改节点245（获取pagecode路由）的`tool_input` prompt。

当前prompt关键段：
> "提取页面名称关键词（只提取页面名称，去掉新增/查看/编辑/审批等操作词）"

改为同时识别操作意图，映射为page_mode字段输出到routes JSON：
- 新增→new，编辑→edit，查看→view，审批→approve，列表/查询→list，未明确→null

输出格式变更：
```json
{"found_count":1,"routes":[{"page_code":"...","name":"...","path":"...","page_mode":"new"}]}
```

OpenPage节点现有`extractFromRoutesJson("page_mode")`自然读取，Java代码零改动。

### 3. 后端 — OpenPage route模式增加prompt+LLM

文件：`OpenPageNode.java` 的 `processRouteMode()`

逻辑：如果`nodeConfig.prompt`不为空，先调用LLM，从输出中解析参数覆盖command JSON。

```
prompt不为空？
  ├─ 是 → renderTemplate(prompt, inputs) → invokeLLM → 解析JSON
  │       → 提取page_mode/form_data/query_params覆盖command
  └─ 否 → 保持现有逻辑（从上游输入/routes JSON读取）
```

LLM输出期望格式（由prompt控制）：
```json
{"page_mode":"new","form_data":{"supplier_name":"XX"},"query_params":{}}
```

LLM解析出的字段优先级最高。LLM原始输出存入outputs供buildSummary显示。

### 4. 前端 — OpenPageNodeProperty.vue route模式增加prompt输入框

文件：`OpenPageNodeProperty.vue`

在route模式下复用dialog模式已有的WfLLMSelector和ExpandableTextarea组件：
- 模型选择器（可选）
- 提示词输入框（可选），tooltip："为空时直接从上游数据构建导航指令，不调用LLM"

组件已import，只需增加route模式的条件渲染。

### 5. 后端 — buildSummary OpenPage增加params + outputText含page_mode

文件：`WorkflowEngine.java` 的 `case "OpenPage"`

从`open_page_command` JSON解析：
- `params`数组：`[{name:"route",title:"路由",value:"/po/project"},{name:"page_mode",title:"页面模式",value:"new"}]`
- `outputText`：根据page_mode映射中文，如"已为您打开新增页面: /po/project"
- 如有LLM输出，追加到outputText

### 6. 前端 — End节点显示 + ThinkingSteps params条件扩展

**chat.js** `SET_WORKFLOW_PROCESS_NODE` mutation：
```js
// 之前: if (nodeEvent.nodeName === 'Start' || nodeEvent.nodeName === 'End') return
// 之后: if (nodeEvent.nodeName === 'Start') return
```

**ThinkingSteps.vue** params显示条件通用化：
```js
// 之前: v-if="step.nodeName === 'Start' && step.summary && step.summary.params ..."
// 之后: v-if="step.summary && step.summary.params && step.summary.params.length"
```

## 向后兼容性

- 数据库清理：仅工作流42的两个节点
- MCP prompt：输出增加字段，不影响现有消费方
- OpenPage prompt+LLM：prompt为空时行为不变
- buildSummary params：前端已有渲染逻辑，条件放宽
- End节点：ThinkingSteps.vue已有渲染逻辑，之前无数据

零破坏性。
