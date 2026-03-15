# 工作流共享输出 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 6 种节点类型增加"工作流共享"开关，开启后该节点的输出可被工作流中任意其他节点的变量选择器引用。

**Architecture:** 后端 6 个 Config 类各增加 `sharedOutput` 字段（存入已有 JSON 列，无 DB 变更）；前端 6 个属性页各增加开关 UI；`WfVariableSelector.vue` 在 `optionGroups` computed 末尾追加"工作流共享"分组，读取 `node.nodeConfig.shared_output` 标志。

**Tech Stack:** Java 17 + Fastjson2/Jackson（后端）；Vue.js 2.7 + Element UI（前端）

---

## Chunk 1: 后端 Config 类

### Task 1: McpToolNodeConfig.java

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/mcptool/McpToolNodeConfig.java`

**注意**：该文件使用 `@JSONField`（Fastjson2），不是 Jackson。

- [ ] **Step 1: 在 `toolNames` 字段后追加新字段**

在文件末尾 `}` 前，`toolNames` 字段之后，插入：

```java
    /**
     * 工作流共享输出，开启后其他节点可引用本节点输出
     */
    @JSONField(name = "shared_output")
    private Boolean sharedOutput = false;
```

- [ ] **Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/mcptool/McpToolNodeConfig.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): McpToolNodeConfig增加sharedOutput字段"
```

---

### Task 2: LLMAnswerNodeConfig.java

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/answer/LLMAnswerNodeConfig.java`

**注意**：该文件使用 `@JsonProperty`（Jackson）。

- [ ] **Step 1: 在 `streaming` 字段后追加新字段**

```java
    /**
     * 工作流共享输出，开启后其他节点可引用本节点输出
     */
    @JsonProperty("shared_output")
    private Boolean sharedOutput = false;
```

- [ ] **Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/answer/LLMAnswerNodeConfig.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): LLMAnswerNodeConfig增加sharedOutput字段"
```

---

### Task 3: KnowledgeRetrievalNodeConfig.java

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/knowledgeretrieval/KnowledgeRetrievalNodeConfig.java`

**注意**：`@JsonProperty`（Jackson）。在 `showProcessOutput` 字段之后追加。

- [ ] **Step 1: 在 `showProcessOutput` 字段后追加新字段**

```java
    /**
     * 工作流共享输出，开启后其他节点可引用本节点输出
     */
    @JsonProperty("shared_output")
    private Boolean sharedOutput = false;
```

- [ ] **Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/knowledgeretrieval/KnowledgeRetrievalNodeConfig.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): KnowledgeRetrievalNodeConfig增加sharedOutput字段"
```

---

### Task 4: TempKnowledgeBaseNodeConfig.java

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/tempknowledgebase/TempKnowledgeBaseNodeConfig.java`

**注意**：`@JsonProperty`（Jackson）。在 `showProcessOutput` 字段之后追加。

- [ ] **Step 1: 在 `showProcessOutput` 字段后追加新字段**

```java
    /**
     * 工作流共享输出，开启后其他节点可引用本节点输出
     */
    @JsonProperty("shared_output")
    private Boolean sharedOutput = false;
```

- [ ] **Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/tempknowledgebase/TempKnowledgeBaseNodeConfig.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): TempKnowledgeBaseNodeConfig增加sharedOutput字段"
```

---

### Task 5: TemplateNodeConfig.java

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/template/TemplateNodeConfig.java`

**注意**：该文件目前无任何 JSON 注解，需先 import Jackson，再加字段。

- [ ] **Step 1: 在 `import lombok.Data;` 之后增加 Jackson 导入**

```java
import com.fasterxml.jackson.annotation.JsonProperty;
```

- [ ] **Step 2: 在 `template` 字段后追加新字段**

```java
    /**
     * 工作流共享输出，开启后其他节点可引用本节点输出
     */
    @JsonProperty("shared_output")
    private Boolean sharedOutput = false;
```

- [ ] **Step 3: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/template/TemplateNodeConfig.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): TemplateNodeConfig增加sharedOutput字段"
```

---

### Task 6: ClassifierNodeConfig.java

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/classifier/ClassifierNodeConfig.java`

**注意**：`@JsonProperty`（Jackson）。在 `instruction` 字段之后追加。

- [ ] **Step 1: 在 `instruction` 字段后追加新字段**

```java
    /**
     * 工作流共享输出，开启后其他节点可引用本节点输出
     */
    @JsonProperty("shared_output")
    private Boolean sharedOutput = false;
```

- [ ] **Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/classifier/ClassifierNodeConfig.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): ClassifierNodeConfig增加sharedOutput字段"
```

---

## Chunk 2: 前端属性页（computed 初始化模式）

### Task 7: McpNodeProperty.vue

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/properties/McpNodeProperty.vue`

初始化在 `computed.nodeConfig` 里用 `$set`（已有 `show_process_output` 为参考）。

- [ ] **Step 1: 在 computed.nodeConfig 中增加初始化**

在 `show_process_output` 的 `$set` 之后，`return this.wfNode.nodeConfig` 之前，插入：
```js
      // 工作流共享输出开关，默认为false（关闭）
      if (this.wfNode.nodeConfig.shared_output === undefined) {
        this.$set(this.wfNode.nodeConfig, 'shared_output', false)
      }
```

- [ ] **Step 2: 在 template 末尾（show_process_output section 之后）增加 UI**

在 `show_process_output` 的 `</div>` 之后，外层 `</div>` 之前，插入：
```vue
    <!-- 工作流共享 -->
    <div class="property-section">
      <div class="section-title">
        工作流共享
        <el-tooltip content="开启后，本节点的输出可被工作流中任意节点引用" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-switch
        v-model="nodeConfig.shared_output"
        active-text="开启"
        inactive-text="关闭"
      />
    </div>
```

- [ ] **Step 3: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/workflow/components/properties/McpNodeProperty.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): McpNodeProperty增加工作流共享开关"
```

---

### Task 8: AnswerNodeProperty.vue

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/properties/AnswerNodeProperty.vue`

**注意**：该文件目前没有 `show_process_output` 开关，直接在 `computed.nodeConfig` 末尾加初始化，在 template 末尾加 section。

- [ ] **Step 1: 在 computed.nodeConfig 中增加初始化**

在 `model_name` 的 `$set` 之后，`return this.wfNode.nodeConfig` 之前，插入：
```js
      if (this.wfNode.nodeConfig.shared_output === undefined) {
        this.$set(this.wfNode.nodeConfig, 'shared_output', false)
      }
```

- [ ] **Step 2: 在 template 末尾（提示词 section 之后）增加 UI**

在 `提示词配置` section 的 `</div>` 之后，外层 `</div>` 之前，插入（同 Task 7 Step 2 的 UI 代码）。

- [ ] **Step 3: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/workflow/components/properties/AnswerNodeProperty.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): AnswerNodeProperty增加工作流共享开关"
```

---

### Task 9: KnowledgeRetrievalNodeProperty.vue

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/properties/KnowledgeRetrievalNodeProperty.vue`

- [ ] **Step 1: 读取文件，找到 `show_process_output` 的初始化位置（computed 还是 created）**

- [ ] **Step 2: 在相同位置增加 shared_output 初始化**

```js
      if (this.wfNode.nodeConfig.shared_output === undefined) {
        this.$set(this.wfNode.nodeConfig, 'shared_output', false)
      }
```

- [ ] **Step 3: 在 template 末尾（show_process_output section 之后）增加 UI（同 Task 7 Step 2）**

- [ ] **Step 4: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/workflow/components/properties/KnowledgeRetrievalNodeProperty.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): KnowledgeRetrievalNodeProperty增加工作流共享开关"
```

---

### Task 10: TempKnowledgeBaseNodeProperty.vue

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/properties/TempKnowledgeBaseNodeProperty.vue`

- [ ] **Step 1: 读取文件，找到 `show_process_output` 的初始化位置**

- [ ] **Step 2: 在相同位置增加 shared_output 初始化（同上）**

- [ ] **Step 3: 在 template 末尾增加 UI（同 Task 7 Step 2）**

- [ ] **Step 4: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/workflow/components/properties/TempKnowledgeBaseNodeProperty.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): TempKnowledgeBaseNodeProperty增加工作流共享开关"
```

---

### Task 11: TemplateNodeProperty.vue

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/properties/TemplateNodeProperty.vue`

- [ ] **Step 1: 读取文件，找到初始化位置**

- [ ] **Step 2: 在相同位置增加 shared_output 初始化（同上）**

- [ ] **Step 3: 在 template 末尾增加 UI（同 Task 7 Step 2）**

- [ ] **Step 4: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/workflow/components/properties/TemplateNodeProperty.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): TemplateNodeProperty增加工作流共享开关"
```

---

## Chunk 3: ClassifierNodeProperty（created 模式）

### Task 12: ClassifierNodeProperty.vue

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/properties/ClassifierNodeProperty.vue`

**关键**：该文件初始化在 `created()` 钩子中，不是 `computed`。必须加到 `created()` 里。

- [ ] **Step 1: 在 created() 中，show_process_output 的 $set 之后，增加初始化**

```js
    if (this.wfNode.nodeConfig.shared_output === undefined) {
      this.$set(this.wfNode.nodeConfig, 'shared_output', false)
    }
```

- [ ] **Step 2: 在 template 末尾（show_process_output section 之后）增加 UI**

```vue
    <!-- 工作流共享 -->
    <div class="property-section">
      <div class="section-title">
        工作流共享
        <el-tooltip content="开启后，本节点的输出可被工作流中任意节点引用" placement="top">
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <el-switch
        v-model="nodeConfig.shared_output"
        active-text="开启"
        inactive-text="关闭"
      />
    </div>
```

- [ ] **Step 3: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/workflow/components/properties/ClassifierNodeProperty.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): ClassifierNodeProperty增加工作流共享开关"
```

---

## Chunk 4: WfVariableSelector（核心逻辑）

### Task 13: WfVariableSelector.vue

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/WfVariableSelector.vue`

**关键位置**：`optionGroups` computed，第 160 行 `return [userInputGroup, componentOutputGroup]`。

- [ ] **Step 1: 将 return 语句替换为带共享分组的版本**

将：
```js
      return [userInputGroup, componentOutputGroup]
```

替换为：
```js
      // 工作流共享分组：显示开启了 shared_output 的非直接上游节点
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
          label: node.title || node.wfComponent.title || node.wfComponent.name,
          value: `${node.uuid}::output`
        })
      })

      const groups = [userInputGroup, componentOutputGroup]
      if (sharedOutputGroup.children.length > 0) {
        groups.push(sharedOutputGroup)
      }
      return groups
```

- [ ] **Step 2: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/workflow/components/WfVariableSelector.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): WfVariableSelector增加工作流共享分组"
```

---

## 验证步骤

完成所有 Task 后，手动验证：

1. 打开工作流设计器，创建 `MCP节点 → 分类器节点 → 大模型节点` 的工作流
2. 点击 MCP 节点，在属性面板底部找到"工作流共享"开关，打开
3. 点击大模型节点，打开输入变量选择器
4. 确认下拉中出现"工作流共享"分组，且包含 MCP 节点
5. 选择后保存工作流，刷新页面，确认 `shared_output` 状态已持久化
