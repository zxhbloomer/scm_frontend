# 工作流共享输出（Workflow Shared Output）设计文档

**日期**: 2026-03-13
**状态**: 已审批，待实现
**范围**: 前端 + 后端，无数据库变更

---

## 背景与问题

当前工作流变量选择器（`WfVariableSelector.vue`）只允许引用**直接上游节点**的输出变量。
当节点之间存在中间节点（如分类器）时，下游节点无法引用非直接上游节点的输出。

**示例**：`查询商品(MCP)` → `内容归类(Classifier)` → `数据调整(Answer)`
`数据调整` 无法引用 `查询商品` 的输出，因为它们不直接相连。

**解决方案**：为特定节点类型增加"工作流共享"开关。开启后，该节点的输出在所有其他节点的变量选择器中可见，形成一个独立的"工作流共享"分组。

---

## 涉及文件清单

### 前端文件（6个属性页 + 1个选择器）

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `WfVariableSelector.vue` | 修改 | 核心：增加"工作流共享"分组逻辑 |
| `McpNodeProperty.vue` | 修改 | 增加 shared_output 开关 |
| `AnswerNodeProperty.vue` | 修改 | 增加 shared_output 开关 |
| `KnowledgeRetrievalNodeProperty.vue` | 修改 | 增加 shared_output 开关 |
| `TempKnowledgeBaseNodeProperty.vue` | 修改 | 增加 shared_output 开关 |
| `TemplateNodeProperty.vue` | 修改 | 增加 shared_output 开关 |
| `ClassifierNodeProperty.vue` | 修改 | 增加 shared_output 开关 |

### 后端文件（6个 Config 类）

| 文件 | 变更类型 | 注解类型 |
|------|---------|---------|
| `McpToolNodeConfig.java` | 修改 | `@JSONField`（Fastjson2） |
| `LLMAnswerNodeConfig.java` | 修改 | `@JsonProperty`（Jackson） |
| `KnowledgeRetrievalNodeConfig.java` | 修改 | `@JsonProperty`（Jackson） |
| `TempKnowledgeBaseNodeConfig.java` | 修改 | `@JsonProperty`（Jackson） |
| `TemplateNodeConfig.java` | 修改 | `@JsonProperty`（Jackson，与其他 Config 类保持一致） |
| `ClassifierNodeConfig.java` | 修改 | `@JsonProperty`（Jackson） |

---

## 文件级设计

---

### 1. `WfVariableSelector.vue`

**路径**: `src/components/70_ai/components/workflow/components/WfVariableSelector.vue`

**当前问题**：`optionGroups` computed 中过滤掉非直接上游节点：
```js
if (!this.upstreamNodeUuids.has(node.uuid)) {
  continue  // 阻止非直接上游节点
}
```

**变更**：在 `optionGroups` computed 中，在现有分组之后追加"工作流共享"分组。

```js
// 在 optionGroups computed 末尾追加（在 return groups 之前）
const sharedOutputGroup = {
  key: 'sharedOutput',
  label: '工作流共享',
  children: []
}

const currentNodeUuid = this.wfNode.uuid || this.wfNode.nodeUuid
// 注意：使用 excludeUuids 避免遮蔽同名 prop this.excludeNodes
const excludeUuids = [...(this.excludeNodes || []), currentNodeUuid]

;(this.workflow.nodes || []).forEach(node => {
  if (excludeUuids.includes(node.uuid)) return
  if (!node.wfComponent) return
  if (['End', 'Start'].includes(node.wfComponent.name)) return
  if (!node.nodeConfig || !node.nodeConfig.shared_output) return
  // 已在直接上游分组中的节点，不重复显示
  if (this.upstreamNodeUuids.has(node.uuid)) return

  sharedOutputGroup.children.push({
    label: node.title || node.wfComponent.title,
    value: `${node.uuid}::output`
  })
})

if (sharedOutputGroup.children.length > 0) {
  groups.push(sharedOutputGroup)
}
```

**说明**：`children` 中每项的 `value` 格式与现有直接上游分组保持一致（`uuid::output` 扁平结构），不引入新的层级。

---

### 2. `McpNodeProperty.vue`

**路径**: `src/components/70_ai/components/workflow/components/properties/McpNodeProperty.vue`

**参考**：该文件已有 `show_process_output` 开关，照此模式添加。

**变更 1**：在 `computed.nodeConfig` 的默认值初始化中增加 `shared_output: false`：
```js
// 在 nodeConfig computed 的 return 对象中增加
shared_output: config.shared_output || false,
```

**变更 2**：在属性面板末尾增加"工作流共享"section（参考 `show_process_output` 的 section 位置）：
```vue
<div class="property-section">
  <div class="section-title">
    工作流共享
    <el-tooltip content="开启后，本节点的输出可被工作流中任意节点引用" placement="top">
      <i class="el-icon-question" style="margin-left: 4px; color: #909399;" />
    </el-tooltip>
  </div>
  <el-switch
    v-model="nodeConfig.shared_output"
    active-text="开启"
    inactive-text="关闭"
  />
</div>
```

---

### 3. `AnswerNodeProperty.vue`

**路径**: `src/components/70_ai/components/workflow/components/properties/AnswerNodeProperty.vue`

**变更**：同 `McpNodeProperty.vue`，在 `computed.nodeConfig` 初始化中增加 `shared_output: false`，并在属性面板末尾增加相同的"工作流共享"section。

---

### 4. `KnowledgeRetrievalNodeProperty.vue`

**路径**: `src/components/70_ai/components/workflow/components/properties/KnowledgeRetrievalNodeProperty.vue`

**变更**：同上。

---

### 5. `TempKnowledgeBaseNodeProperty.vue`

**路径**: `src/components/70_ai/components/workflow/components/properties/TempKnowledgeBaseNodeProperty.vue`

**变更**：同上。

---

### 6. `TemplateNodeProperty.vue`

**路径**: `src/components/70_ai/components/workflow/components/properties/TemplateNodeProperty.vue`

**变更**：同上。

---

### 7. `ClassifierNodeProperty.vue`

**路径**: `src/components/70_ai/components/workflow/components/properties/ClassifierNodeProperty.vue`

**参考**：该文件已有 `show_process_output` 开关（前端有，后端 Config 暂无对应字段，属已有遗留问题，本次不处理）。

**注意**：该文件的初始化逻辑在 `created()` 钩子中，而非 `computed.nodeConfig`（`computed` 只是 `return this.wfNode.nodeConfig`）。

**变更 1**：在 `created()` 钩子的初始化块中增加：
```js
if (this.wfNode.nodeConfig.shared_output === undefined) {
  this.$set(this.wfNode.nodeConfig, 'shared_output', false)
}
```

**变更 2**：在属性面板末尾增加"工作流共享"section（同其他属性页）。

---

### 8. `McpToolNodeConfig.java`

**路径**: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/mcptool/McpToolNodeConfig.java`

**注解规范**：该文件使用 `@JSONField`（Fastjson2）。

**变更**：增加字段：
```java
/**
 * 工作流共享输出，开启后其他节点可引用本节点输出
 */
@JSONField(name = "shared_output")
private Boolean sharedOutput = false;
```

---

### 9. `LLMAnswerNodeConfig.java`

**路径**: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/answer/LLMAnswerNodeConfig.java`

**注解规范**：该文件使用 `@JsonProperty`（Jackson）。

**变更**：增加字段：
```java
/**
 * 工作流共享输出，开启后其他节点可引用本节点输出
 */
@JsonProperty("shared_output")
private Boolean sharedOutput = false;
```

---

### 10. `KnowledgeRetrievalNodeConfig.java`

**路径**: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/knowledgeretrieval/KnowledgeRetrievalNodeConfig.java`

**注解规范**：`@JsonProperty`（Jackson）。

**变更**：增加字段：
```java
/**
 * 工作流共享输出，开启后其他节点可引用本节点输出
 */
@JsonProperty("shared_output")
private Boolean sharedOutput = false;
```

---

### 11. `TempKnowledgeBaseNodeConfig.java`

**路径**: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/tempknowledgebase/TempKnowledgeBaseNodeConfig.java`

**注解规范**：`@JsonProperty`（Jackson）。

**变更**：增加字段（同上）。

---

### 12. `TemplateNodeConfig.java`

**路径**: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/template/TemplateNodeConfig.java`

**注解规范**：该文件目前无 JSON 注解，本次统一补充 `@JsonProperty`（与其他 Config 类保持一致）。

**变更**：增加字段：
```java
/**
 * 工作流共享输出，开启后其他节点可引用本节点输出
 */
@JsonProperty("shared_output")
private Boolean sharedOutput = false;
```

---

### 13. `ClassifierNodeConfig.java`

**路径**: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/classifier/ClassifierNodeConfig.java`

**注解规范**：`@JsonProperty`（Jackson）。

**变更**：增加字段（同上）。

---

## 数据流说明

```
用户在 McpNodeProperty 开启"工作流共享"
  → nodeConfig.shared_output = true
  → 保存到 ai_workflow_node.node_config JSON 字段（无 DB schema 变更）

其他节点打开变量选择器
  → WfVariableSelector.optionGroups computed 执行
  → 遍历 workflow.nodes，找到 shared_output=true 的节点
  → 追加到"工作流共享"分组（排除直接上游中已有的节点）
  → 用户选择后，生成 ref_input 引用

后端执行时
  → AbstractWfNode.initInput() 处理 ref_inputs
  → createByReferParam() → wfState.getIOByNodeUuid(nodeUuid)
  → 已支持跨节点引用，无需修改
```

---

## 约束与边界

1. **不修改数据库**：`shared_output` 存储在已有的 `node_config` JSON 字段中
2. **不修改后端运行时**：`AbstractWfNode` 已支持跨节点引用
3. **不影响现有功能**：`shared_output` 默认 `false`，现有工作流行为不变
4. **不在直接上游分组重复显示**：已在直接上游的节点不出现在"工作流共享"分组
5. **Start/End 节点不参与**：这两个节点无实际输出，排除在外
6. **不处理循环引用**：后端运行时按节点执行顺序处理，未执行的节点输出为空，不会产生死循环

---

## 实现顺序建议

1. 后端 6 个 Config 类（加字段，风险最低）
2. 前端 6 个属性页（加开关 UI + computed 初始化）
3. 前端 `WfVariableSelector.vue`（核心逻辑，最后改）
