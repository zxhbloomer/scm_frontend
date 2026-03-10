# OpenPage节点动态page_mode + 显示优化 实施计划

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让OpenPage节点的page_mode由LLM动态判断，同时在ThinkingSteps中显示参数和End节点。

**Architecture:** MCP prompt增加page_mode提取 → OpenPage route模式可选LLM增强 → buildSummary输出params → 前端显示优化

**Tech Stack:** Java Spring Boot (后端), Vue.js 2.7 + Element UI (前端), MySQL (数据库)

---

## Task 1: 数据库清理 — OpenPage节点垃圾数据

**操作:** 直接执行SQL

- [ ] **Step 1: 清理节点248的node_config**

```sql
UPDATE ai_workflow_node
SET node_config = '{"prompt":"","open_mode":"route","model_name":"","show_process_output":true}'
WHERE id = 248;
```

- [ ] **Step 2: 清理节点249的node_config**

```sql
UPDATE ai_workflow_node
SET node_config = '{"prompt":"","open_mode":"route","model_name":""}'
WHERE id = 249;
```

- [ ] **Step 3: 验证清理结果**

```sql
SELECT id, title, node_config FROM ai_workflow_node WHERE id IN (248, 249);
```

预期：248的node_config无route/timeout_minutes/interaction_*/page_mode字段，249同理。

---

## Task 2: MCP prompt增加page_mode提取

**操作:** 更新节点245的tool_input字段

- [ ] **Step 1: 更新MCP节点prompt**

```sql
UPDATE ai_workflow_node
SET node_config = JSON_SET(
  node_config,
  '$.tool_input',
  CONCAT(
    '用户想要打开某个页面，请根据用户输入理解其意图，完成以下两件事：\n',
    '\n',
    '一、提取页面名称关键词（去掉"新增""查看""编辑""审批"等操作词，例如"采购项目新增页面"提取为"采购项目"）\n',
    '\n',
    '二、识别用户的操作意图，映射为page_mode：\n',
    '- 新增/创建/添加 → new\n',
    '- 编辑/修改 → edit\n',
    '- 查看/详情 → view\n',
    '- 审批/审核 → approve\n',
    '- 列表/查询/搜索 → list\n',
    '- 未明确操作意图 → null\n',
    '\n',
    '然后：\n',
    '1. 调用 checkPageAccess 工具，用提取的页面名称关键词查询用户可访问的页面列表；\n',
    '2. 如果找到页面，对每个 page_code 调用 getPageMenuPaths 工具获取菜单路径；\n',
    '3. 整合所有结果，以如下 JSON 格式输出（不要输出其他内容）：\n',
    '{"found_count": <数量>, "routes": [{"page_code": "...", "name": "...", "meta_title": "...", "path": "...", "component": "...", "page_mode": "<操作意图或null>"}]}\n',
    '其中 path 来自 getPageMenuPaths 返回的 paths[].path 字段，page_mode 来自第二步识别的操作意图。\n',
    '\n',
    '用户输入：${input}'
  )
)
WHERE id = 245;
```

- [ ] **Step 2: 验证更新结果**

```sql
SELECT id, title, JSON_EXTRACT(node_config, '$.tool_input') as tool_input
FROM ai_workflow_node WHERE id = 245;
```

预期：tool_input中包含page_mode映射规则和输出格式中的page_mode字段。

---

## Task 3: 后端 — OpenPage route模式增加prompt+LLM

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/openpage/OpenPageNode.java:67-105`

- [ ] **Step 1: 修改processRouteMode方法**

将 `processRouteMode` 方法替换为以下实现。核心变化：如果prompt不为空，先调用LLM解析参数，LLM输出的字段优先级最高。

```java
    /**
     * route模式：构建导航指令
     * 如果配置了prompt，先调用LLM动态解析参数（page_mode/form_data等）
     * 否则从上游输入变量或MCP output JSON中读取
     */
    private NodeProcessResult processRouteMode(OpenPageNodeConfig nodeConfig) {
        // 优先从上游输入读取路由，fallback到上游MCP output JSON
        String path = extractInputValue("path");
        if (path == null) {
            path = extractFromRoutesJson("path");
        }

        log.info("OpenPage节点[route模式]开始，path={}", path);

        String pageMode = null;
        JSONObject formData = null;
        JSONObject queryParams = null;
        String recordId = null;

        // 如果配置了prompt，调用LLM动态解析参数
        String promptTemplate = nodeConfig.getPrompt();
        if (promptTemplate != null && !promptTemplate.trim().isEmpty()) {
            String prompt = WorkflowUtil.renderTemplate(promptTemplate, state.getInputs());
            log.info("OpenPage节点[route模式]调用LLM，prompt长度: {}", prompt.length());

            NodeIOData llmOutput = WorkflowUtil.invokeLLM(wfState, nodeConfig.getModelName(), prompt);
            state.getOutputs().add(llmOutput);

            String llmResult = llmOutput.valueToString();
            log.info("OpenPage节点[route模式]LLM输出: {}", llmResult);

            // 解析LLM输出的JSON
            if (llmResult != null && !llmResult.isEmpty()) {
                try {
                    int start = llmResult.indexOf('{');
                    int end = llmResult.lastIndexOf('}');
                    if (start >= 0 && end > start) {
                        JSONObject llmJson = JSONObject.parseObject(llmResult.substring(start, end + 1));
                        if (llmJson.getString("page_mode") != null) {
                            pageMode = llmJson.getString("page_mode");
                        }
                        if (llmJson.getJSONObject("form_data") != null) {
                            formData = llmJson.getJSONObject("form_data");
                        }
                        if (llmJson.getJSONObject("query_params") != null) {
                            queryParams = llmJson.getJSONObject("query_params");
                        }
                        if (llmJson.getString("record_id") != null) {
                            recordId = llmJson.getString("record_id");
                        }
                    }
                } catch (Exception e) {
                    log.warn("OpenPage节点解析LLM输出JSON失败: {}", e.getMessage());
                }
            }
        }

        // LLM未提供的字段，fallback到上游输入/routes JSON/静态配置
        if (pageMode == null) {
            pageMode = extractInputValue("page_mode");
        }
        if (pageMode == null) {
            pageMode = extractFromRoutesJson("page_mode");
        }
        if (pageMode == null) {
            pageMode = nodeConfig.getPageMode();
        }
        if (formData == null) {
            formData = extractInputAsJson("form_data");
        }
        if (queryParams == null) {
            queryParams = extractInputAsJson("query_params");
        }
        if (recordId == null) {
            recordId = extractInputValue("record_id");
        }

        JSONObject command = new JSONObject();
        command.put("route", path);
        if (pageMode != null) command.put("page_mode", pageMode);
        command.put("query_params", queryParams);
        command.put("form_data", formData);
        command.put("record_id", recordId);

        String commandJson = command.toJSONString();
        wfState.setOpen_page_command(commandJson);
        log.info("OpenPage节点[route模式]导航指令: {}", commandJson);

        state.getOutputs().add(NodeIOData.createByText("open_page_command", "页面导航指令", commandJson));

        return new NodeProcessResult();
    }
```

- [ ] **Step 2: 更新类注释**

将文件顶部注释（line 14-21）中的"可选启用人机交互"改为：

```java
/**
 * 打开前端页面节点
 *
 * 支持两种模式：
 * 1. dialog模式（默认）：调用LLM生成业务JSON，通过ai_open_dialog_para触发前端弹窗
 * 2. route模式：构建导航指令，通过open_page_command触发前端RouterTab导航
 *    可选配置prompt调用LLM动态解析page_mode/form_data等参数
 */
```

- [ ] **Step 3: Commit**

```bash
git -C "D:/2025_project/20_project_in_github/00_scm_backend/scm_backend" add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/openpage/OpenPageNode.java
git -C "D:/2025_project/20_project_in_github/00_scm_backend/scm_backend" commit -m "feat(ai): OpenPage route模式支持prompt+LLM动态解析参数"
```

---

## Task 4: 前端 — OpenPageNodeProperty.vue route模式增加prompt输入框

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/properties/OpenPageNodeProperty.vue`

- [ ] **Step 1: 将dialog模式的模型+提示词配置改为dialog和route共享**

将 template 中 line 27-53 的 `<template v-if="nodeConfig.open_mode === 'dialog'">` 改为两个模式都显示模型和提示词，只是tooltip文案不同：

```html
    <!-- 模型选择（dialog和route模式共享） -->
    <div class="property-section">
      <div class="section-title">模型</div>
      <WfLLMSelector
        :model-name="nodeConfig.model_name"
        @llm-selected="handleLLMSelected"
      />
    </div>

    <!-- 提示词配置（dialog和route模式共享） -->
    <div class="property-section">
      <div class="section-title">
        提示词
        <el-tooltip
          :content="nodeConfig.open_mode === 'route'
            ? '为空时直接从上游数据构建导航指令，不调用LLM'
            : '为空时仅存储数据并打开页面，不调用LLM'"
          placement="top"
        >
          <i class="el-icon-question" style="color: #909399; font-size: 14px; margin-left: 4px;" />
        </el-tooltip>
      </div>
      <refer-comment />
      <expandable-textarea
        v-model="nodeConfig.prompt"
        placeholder="请输入提示词，可使用 {变量名} 引用输入变量"
        dialog-title="编辑提示词"
      />
    </div>
```

即：删除 `<template v-if="nodeConfig.open_mode === 'dialog'">` 和对应的 `</template>`，让模型和提示词在两种模式下都显示。tooltip根据模式动态切换。

- [ ] **Step 2: Commit**

```bash
git -C "D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend" add src/components/70_ai/components/workflow/components/properties/OpenPageNodeProperty.vue
git -C "D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend" commit -m "feat(ai): OpenPage属性面板route模式增加模型和提示词配置"
```

---

## Task 5: 后端 — buildSummary OpenPage增加params + outputText含page_mode

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/WorkflowEngine.java:1750-1764`

- [ ] **Step 1: 替换case "OpenPage"代码块**

将 WorkflowEngine.java 中 line 1750-1764 的 `case "OpenPage"` 替换为：

```java
                    case "OpenPage": {
                        String commandJson = findOutputValue(outputList, "open_page_command");
                        String route = null;
                        String pageMode = null;
                        if (commandJson != null) {
                            try {
                                com.alibaba.fastjson2.JSONObject cmd = com.alibaba.fastjson2.JSONObject.parseObject(commandJson);
                                route = cmd.getString("route");
                                pageMode = cmd.getString("page_mode");
                            } catch (Exception ignored) {}
                        }
                        // params：显示导航指令的关键参数
                        summary = new HashMap<>();
                        List<Map<String, String>> params = new ArrayList<>();
                        if (route != null) {
                            Map<String, String> p = new HashMap<>();
                            p.put("name", "route");
                            p.put("title", "路由");
                            p.put("value", route);
                            params.add(p);
                        }
                        if (pageMode != null) {
                            Map<String, String> p = new HashMap<>();
                            p.put("name", "page_mode");
                            p.put("title", "页面模式");
                            p.put("value", pageMode);
                            params.add(p);
                        }
                        if (!params.isEmpty()) {
                            summary.put("params", params);
                        }
                        // outputText：含page_mode的中文描述
                        if (showOutput) {
                            String modeLabel = "new".equals(pageMode) ? "新增"
                                : "edit".equals(pageMode) ? "编辑"
                                : "view".equals(pageMode) ? "查看"
                                : "approve".equals(pageMode) ? "审批"
                                : "list".equals(pageMode) ? "列表" : "";
                            String text = route != null
                                ? "已为您打开" + modeLabel + "页面: " + route
                                : "已为您打开页面";
                            summary.put("outputText", text);
                        }
                        break;
                    }
```

注意：`List` 和 `Map` 已在文件顶部 import（java.util.*），`ArrayList` 和 `HashMap` 在 Start case 中已使用。

- [ ] **Step 2: Commit**

```bash
git -C "D:/2025_project/20_project_in_github/00_scm_backend/scm_backend" add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/WorkflowEngine.java
git -C "D:/2025_project/20_project_in_github/00_scm_backend/scm_backend" commit -m "feat(ai): buildSummary OpenPage增加params和page_mode到outputText"
```

---

## Task 6: 前端 — End节点显示 + ThinkingSteps params条件扩展

**Files:**
- Modify: `src/components/70_ai/store/modules/chat.js:197,227`
- Modify: `src/components/70_ai/components/chat/messages/ThinkingSteps.vue:50`

- [ ] **Step 1: chat.js — 移除End节点过滤（node_start）**

文件 `chat.js` line 197，将：
```js
      if (nodeEvent.nodeName === 'Start' || nodeEvent.nodeName === 'End') return
```
改为：
```js
      if (nodeEvent.nodeName === 'Start') return
```

- [ ] **Step 2: chat.js — 移除End节点过滤（node_complete）**

文件 `chat.js` line 227，将：
```js
      if (nodeEvent.nodeName === 'Start' || nodeEvent.nodeName === 'End') return
```
改为：
```js
      if (nodeEvent.nodeName === 'Start') return
```

- [ ] **Step 3: chat.js — 更新两处注释**

line 196 注释改为：
```js
      // Start节点只在子工作流summary.steps里显示，不加入顶层步骤列表
```

line 226 注释改为：
```js
      // Start节点不在顶层显示，跳过
```

- [ ] **Step 4: ThinkingSteps.vue — params显示条件通用化**

文件 `ThinkingSteps.vue` line 50，将：
```html
          <div v-if="step.nodeName === 'Start' && step.summary && step.summary.params && step.summary.params.length" class="step-output">
```
改为：
```html
          <div v-if="step.summary && step.summary.params && step.summary.params.length" class="step-output">
```

同时更新 line 49 的注释：
```html
          <!-- 节点参数：换行显示，格式：title = value -->
```

- [ ] **Step 5: Commit**

```bash
git -C "D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend" add src/components/70_ai/store/modules/chat.js src/components/70_ai/components/chat/messages/ThinkingSteps.vue
git -C "D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend" commit -m "feat(ai): ThinkingSteps显示End节点+OpenPage参数"
```
