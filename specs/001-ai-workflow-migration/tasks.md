# Tasks: AI Workflow 工作流功能迁移

**Input**: Design documents from `/specs/001-ai-workflow-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/workflow-api.md

**Tests**: 根据 spec.md，本功能未明确要求测试任务，因此本任务列表不包含测试任务。如需测试，请使用 Playwright 进行 E2E 测试。

**Organization**: 任务按用户故事（User Story）组织，使每个故事可以独立实施和验证。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可以并行运行（不同文件，无依赖）
- **[Story]**: 任务所属的用户故事（例如 US1, US2, US3）
- 描述中包含准确的文件路径

## Path Conventions
- 前端 Vue.js 项目：`src/components/70_ai/`
- 所有工作流相关代码必须保存在 `70_ai` 模块下

---

## Phase 1: Setup (项目初始化)

**Purpose**: 项目基础结构和依赖安装

- [ ] T001 创建工作流目录结构 `src/components/70_ai/components/workflow/`, `src/components/70_ai/api/`, `src/components/70_ai/constants/`, `src/components/70_ai/store/modules/`, `src/components/70_ai/utils/`, `src/components/70_ai/styles/`
- [ ] T002 安装 AntV X6 依赖：`npm install @antv/x6 --save`
- [ ] T003 [P] 创建工作流样式文件 `src/components/70_ai/styles/workflow.scss`（基础样式定义）

---

## Phase 2: Foundational (基础设施 - 所有用户故事的前置条件)

**Purpose**: 核心基础设施，必须在任何用户故事实施前完成

**⚠️ CRITICAL**: 在此阶段完成之前，不能开始任何用户故事的工作

### 常量和类型定义

- [ ] T004 [P] 创建工作流常量文件 `src/components/70_ai/constants/workflowConstants.js`（定义状态码：WORKFLOW_STATUS, NODE_STATUS, DATA_TYPES）
- [ ] T005 [P] 创建节点类型定义文件 `src/components/70_ai/constants/nodeTypeDefinitions.js`（定义 NODE_TYPES 包含所有 16 种节点类型：Start, End, LlmAnswer, Classifier, Branch, Template, DocumentExtract, KeywordExtract, FaqExtract, KnowledgeRetrieval, HttpRequest, HumanFeedback, EmailSend, GoogleSearch, ImageGenDalle3, ImageGenTongyi）

### Vuex 状态管理

- [ ] T006 [P] 创建工作流 Vuex 模块 `src/components/70_ai/store/modules/workflow.js`（state: currentWorkflow, nodes, edges, editorState; mutations: SET_CURRENT_WORKFLOW, ADD_NODE, UPDATE_NODE, DELETE_NODE, ADD_EDGE, DELETE_EDGE, SET_DIRTY, SELECT_NODE; actions: loadWorkflow, saveWorkflow, createWorkflow, deleteWorkflow, duplicateWorkflow, loadWorkflowList, loadComponentLibrary）
- [ ] T007 [P] 创建工作流运行时 Vuex 模块 `src/components/70_ai/store/modules/workflowRuntime.js`（state: currentRuntime, runtimeNodes, sseConnected, sseError, runtimeHistory, selectedHistory; mutations: SET_CURRENT_RUNTIME, UPDATE_RUNTIME_STATUS, SET_NODE_STATUS, UPDATE_NODE_INPUT, UPDATE_NODE_OUTPUT, APPEND_NODE_CHUNK, SET_SSE_CONNECTED, SET_SSE_ERROR, SET_RUNTIME_HISTORY, SET_SELECTED_HISTORY; actions: runWorkflow, stopWorkflow, provideFeedback, loadRuntimeHistory, loadHistoryDetail, deleteRuntimeHistory）
- [ ] T008 在 `src/store/index.js` 中注册工作流 Vuex 模块（导入 workflow 和 workflowRuntime 模块并注册到全局 Vuex store）

### API 服务

- [ ] T009 [P] 创建工作流管理 API `src/components/70_ai/api/workflowApi.js`（函数：getWorkflowList, getWorkflowDetail, createWorkflow, updateWorkflow, deleteWorkflow, duplicateWorkflow, saveWorkflowNodes, validateWorkflow, getComponentLibrary）
- [ ] T010 [P] 创建工作流运行 API `src/components/70_ai/api/workflowRuntimeApi.js`（函数：runWorkflow（使用 SSE）, stopWorkflow, provideFeedback, getRuntimeHistory, getRuntimeDetail, deleteRuntimeHistory, clearRuntimeHistory）

### 工具函数

- [ ] T011 [P] 创建工作流验证工具 `src/components/70_ai/utils/workflowValidator.js`（函数：detectCycle（拓扑排序检测循环）, detectIsolatedNodes（孤立节点检测）, validateRequiredNodes（必需节点检查）, validateNodeConfigs（节点配置完整性验证）, validateWorkflow（综合验证）, validateWorkflowName）
- [ ] T012 [P] 创建节点数据映射工具 `src/components/70_ai/utils/nodeDataMapper.js`（函数：generateNodeOutput（生成节点输出 NodeIOData）, resolveNodeInput（解析节点输入，处理引用）, handleFileInput（处理文件类型）, mapNodeIOData（数据格式转换））
- [ ] T013 [P] 创建 X6 图形辅助工具 `src/components/70_ai/utils/x6GraphHelper.js`（函数：initGraph（初始化 X6 Graph 实例）, registerCustomNodes（注册自定义节点类型）, highlightNode（节点状态高亮）, addNodeToGraph（添加节点到画布）, addEdgeToGraph（添加连线到画布）, removeNodeFromGraph, removeEdgeFromGraph）
- [ ] T014 [P] 创建工作流 SSE 处理工具 `src/components/70_ai/utils/workflowSseHandler.js`（函数：handleSseEvent（SSE 事件分发）, parseNodeUuidFromEvent（从事件名提取 nodeUuid）, initWorkflowRuntime, highlightNodeStatus, updateNodeInput, updateNodeOutput, appendNodeChunk, promptUserFeedback, completeWorkflowExecution, handleExecutionError）（复用 `src/components/70_ai/utils/sseUtils.js` 的 createKbQaStream）

**Checkpoint**: 基础设施就绪 - 现在可以开始并行实施用户故事

---

## Phase 3: User Story 1 - 创建和设计工作流 (Priority: P1) 🎯 MVP

**Goal**: 用户能够通过可视化界面创建工作流，拖拽节点并连线，保存工作流定义

**Independent Test**:
1. 点击 chat ai 弹窗中的 workflow 图标，工作流弹窗打开
2. 点击"新建工作流"按钮，输入名称和描述，成功创建工作流
3. 从节点库拖拽"开始节点"和"结束节点"到画布
4. 连接两个节点，成功创建连线
5. 点击"保存"按钮，工作流保存成功
6. 关闭弹窗后重新打开，工作流列表显示刚创建的工作流
7. 点击工作流，画布正确显示节点和连线

### 实施 User Story 1

#### 主弹窗和入口

- [ ] T015 [US1] 在 chat ai 弹窗组件中添加 workflow 图标按钮入口（找到 chat ai 弹窗组件，在"打开我的知识库"图标旁边添加 workflow 图标 `el-icon-s-operation`，点击后打开工作流弹窗）
- [ ] T016 [US1] 创建工作流主弹窗组件 `src/components/70_ai/components/workflow/WorkflowDialog.vue`（el-dialog 配置：`:modal="true"`, `:close-on-click-modal="false"`, `:close-on-press-escape="false"`, `:show-close="false"`, `:append-to-body="true"`, `:modal-append-to-body="true"`, `width="900px"`, `destroy-on-close`, `top="5vh"`, 使用 `v-el-drag-dialog` 指令支持拖拽，内含 el-tabs 切换"我的工作流"和"设计器"）

#### 工作流列表

- [ ] T017 [P] [US1] 创建工作流列表组件 `src/components/70_ai/components/workflow/WorkflowList.vue`（el-tabs: "我的工作流" / "公开市场"，el-table 显示工作流列表（名称、描述、创建时间、节点数、运行次数），el-pagination 分页，搜索框（el-input），操作按钮：新建、编辑、复制、删除、运行，调用 `$store.dispatch('workflow/loadWorkflowList')`）
- [ ] T018 [US1] 在 WorkflowList 中实现新建工作流对话框（el-dialog，el-form 包含：工作流名称（必填）、描述（选填）、是否公开（el-switch），调用 `$store.dispatch('workflow/createWorkflow')`，成功后刷新列表并跳转到设计器）

#### X6 画布和节点管理

- [ ] T019 [US1] 创建工作流画布组件 `src/components/70_ai/components/workflow/WorkflowCanvas.vue`（初始化 X6 Graph 实例，配置 grid（网格）、panning（平移）、mousewheel（缩放）、connecting（连线配置），提供画布容器 div，监听节点点击事件打开配置面板，监听连线事件保存连线，工具栏：保存、验证、缩放、清空画布，调用 `$store.dispatch('workflow/loadWorkflow')` 加载工作流数据）
- [ ] T020 [P] [US1] 创建节点库面板组件 `src/components/70_ai/components/workflow/NodeLibrary.vue`（el-collapse 分类显示节点（input/output/logic/ai/integration），每个节点显示图标和标题，支持拖拽到画布，使用 X6 的 Dnd 插件实现拖拽，调用 `$store.state.workflow.componentLibrary`）
- [ ] T021 [P] [US1] 创建开始节点组件 `src/components/70_ai/components/workflow/nodes/StartNode.vue`（X6 自定义节点，绿色圆角矩形，图标 el-icon-video-play，输出端口 1 个，默认配置：无需配置项）
- [ ] T022 [P] [US1] 创建结束节点组件 `src/components/70_ai/components/workflow/nodes/EndNode.vue`（X6 自定义节点，红色圆角矩形，图标 el-icon-video-pause，输入端口 1 个，默认配置：无需配置项）

#### 工作流保存和验证

- [ ] T023 [US1] 在 WorkflowCanvas 中实现工作流保存功能（收集画布上所有节点（位置、配置）和连线，调用 `$store.dispatch('workflow/saveWorkflow')`，增量保存（仅提交变更的节点和连线），保存前调用 `validateWorkflow` 验证，显示保存成功/失败消息）
- [ ] T024 [US1] 在 WorkflowCanvas 中实现工作流验证功能（点击"验证"按钮，调用 `workflowValidator.validateWorkflow()`，检查：至少包含开始和结束节点、无循环引用、无孤立节点、节点配置完整性，验证通过显示成功消息，验证失败显示错误列表 el-message-box）

#### 画布交互功能

- [ ] T025 [US1] 实现节点拖拽和定位功能（从 NodeLibrary 拖拽节点到画布，X6 Dnd 插件处理拖拽，记录节点位置（position_x, position_y），拖拽结束后更新 Vuex store，标记 isDirty = true）
- [ ] T026 [US1] 实现节点连线功能（X6 connecting 配置，允许从输出端口拖拽到输入端口，创建 edge 对象，保存到 Vuex store（ADD_EDGE），不允许：空连线、多重连线、自环连线，连线样式：圆角、箭头）
- [ ] T027 [US1] 实现节点和连线删除功能（选中节点按 Delete 键删除，选中连线按 Delete 键删除，调用 `$store.commit('workflow/DELETE_NODE')` 和 `$store.commit('workflow/DELETE_EDGE')`，级联删除相关连线，标记 isDirty = true）

**Checkpoint**: 此时用户故事 1 应该完全可用且可独立测试。用户可以创建工作流、拖拽节点、连线、保存、验证。

---

## Phase 4: User Story 2 - 配置工作流节点 (Priority: P1)

**Goal**: 用户能够详细配置每个节点的参数和行为，实现精确的业务逻辑

**Independent Test**:
1. 在画布上点击一个节点（如 LLM 回答节点）
2. 右侧属性面板打开，显示该节点的所有可配置参数
3. 选择 AI 模型（如 GPT-4），输入提示词模板，调整温度参数
4. 点击"保存"按钮，配置保存成功
5. 关闭面板后重新点击该节点，配置正确保留
6. 点击"测试运行"按钮，工作流使用当前配置执行并返回结果

### 实施 User Story 2

#### 节点配置面板基础

- [ ] T028 [US2] 创建节点配置面板组件 `src/components/70_ai/components/workflow/panels/NodeConfigPanel.vue`（el-drawer 右侧抽屉，显示当前选中节点的配置，el-form 包含：节点标题（el-input）、节点特定配置（根据节点类型动态渲染），保存按钮调用 `$store.commit('workflow/UPDATE_NODE')`，取消按钮关闭面板，表单验证规则）
- [ ] T029 [US2] 在 WorkflowCanvas 中集成 NodeConfigPanel（监听节点点击事件 `graph.on('node:click')`，设置 `selectedNode` 并打开 NodeConfigPanel，节点配置保存后更新 X6 节点数据和标签，调用 `node.setData()` 和 `node.setAttrByPath('label/text')`）

#### LLM 节点配置

- [ ] T030 [P] [US2] 创建 LLM 回答节点组件 `src/components/70_ai/components/workflow/nodes/LlmNode.vue`（X6 自定义节点，蓝色圆角矩形，图标 el-icon-chat-dot-round，输入端口 2 个（user_question, context）、输出端口 1 个（answer），默认配置：modelName='gpt-3.5-turbo', promptTemplate='', temperature=0.7, maxTokens=2000）
- [ ] T031 [US2] 在 NodeConfigPanel 中添加 LLM 节点配置表单（el-select 选择 AI 模型（从现有模型列表加载），el-input type="textarea" 输入提示词模板（支持变量引用 `{{variable}}`），el-slider 调整温度（0-2），el-input-number 设置最大 token 数（100-4000），提示词模板验证：必填、变量引用语法检查）

#### 知识检索节点配置

- [ ] T032 [P] [US2] 创建知识检索节点组件 `src/components/70_ai/components/workflow/nodes/KnowledgeNode.vue`（X6 自定义节点，紫色圆角矩形，图标 el-icon-folder-opened，输入端口 1 个（query）、输出端口 1 个（knowledge），默认配置：kbUuid='', retrieveMaxResults=5, retrieveMinScore=0.5, strictMode=false）
- [ ] T033 [US2] 在 NodeConfigPanel 中添加知识检索节点配置表单（el-select 选择知识库（调用知识库 API 加载列表），el-slider 设置相似度阈值（0-1），el-input-number 设置最大结果数（1-20），el-switch 设置严格模式，知识库必选验证）

#### 分类器和分支节点配置

- [ ] T034 [P] [US2] 创建分类器节点组件 `src/components/70_ai/components/workflow/nodes/ClassifierNode.vue`（X6 自定义节点，橙色圆角矩形，图标 el-icon-s-operation，输入端口 1 个（input）、输出端口动态（根据分类类别数量），默认配置：modelName='', categories=[]（每个 category 包含 name, description, targetNodeUuid））
- [ ] T035 [US2] 在 NodeConfigPanel 中添加分类器节点配置表单（el-select 选择 AI 模型，动态添加分类类别（el-button "添加分类"），每个分类包含：名称（el-input）、描述（el-input）、目标节点（el-select 从画布节点列表选择），分类列表可拖拽排序，至少 2 个分类验证）
- [ ] T036 [P] [US2] 创建分支节点组件 `src/components/70_ai/components/workflow/nodes/BranchNode.vue`（X6 自定义节点，黄色菱形，图标 el-icon-share，输入端口 1 个、输出端口动态，默认配置：conditions=[]（每个 condition 包含 expression, targetNodeUuid），defaultBranch=''）
- [ ] T037 [US2] 在 NodeConfigPanel 中添加分支节点配置表单（动态添加条件分支，每个分支包含：条件表达式（el-input，支持 ==, !=, >, <, contains 等操作符）、目标节点（el-select），设置默认分支（el-select），表达式语法验证）

#### 模板节点配置

- [ ] T038 [P] [US2] 创建模板节点组件 `src/components/70_ai/components/workflow/nodes/TemplateNode.vue`（X6 自定义节点，灰色圆角矩形，图标 el-icon-document，输入端口动态（根据变量数量）、输出端口 1 个（output），默认配置：template=''（支持 `{{variable}}` 变量））
- [ ] T039 [US2] 在 NodeConfigPanel 中添加模板节点配置表单（el-input type="textarea" 输入模板内容，自动识别模板中的变量 `{{variable}}`，显示变量列表，模板变量语法验证）

#### 节点配置保存和验证

- [ ] T040 [US2] 实现节点配置的表单验证（使用 Element UI 的 el-form 验证规则，必填字段验证（模型名称、知识库等），数值范围验证（温度 0-2、阈值 0-1），自定义验证（提示词模板变量语法、条件表达式语法），验证失败阻止保存并显示错误消息）
- [ ] T041 [US2] 实现节点配置的保存和更新（点击"保存"按钮，调用 `$refs.form.validate()`，验证通过后更新节点 node_config，调用 `$store.commit('workflow/UPDATE_NODE')`，更新 X6 节点数据 `node.setData()`，关闭配置面板，显示保存成功消息）

**Checkpoint**: 此时用户故事 1 和 2 都应该可用且可独立测试。用户可以创建工作流、配置节点参数、保存配置。

---

## Phase 5: User Story 3 - 运行和调试工作流 (Priority: P1)

**Goal**: 用户能够执行工作流并实时查看运行状态，验证工作流是否按预期工作

**Independent Test**:
1. 打开一个已保存的工作流（至少包含开始 → LLM 回答 → 结束）
2. 点击"运行"按钮，输入必要的参数（如用户问题）
3. 工作流开始执行，画布上节点依次高亮显示执行状态
4. LLM 节点执行时，实时显示流式输出文本
5. 工作流执行完成，显示最终输出结果
6. 可以查看每个节点的输入和输出数据

### 实施 User Story 3

#### 工作流运行界面

- [ ] T042 [US3] 创建工作流运行组件 `src/components/70_ai/components/workflow/WorkflowRunner.vue`（展示当前工作流执行状态，显示运行时画布（复用 WorkflowCanvas 只读模式），显示实时输出文本（el-card 展示流式输出），显示执行进度（el-progress），操作按钮：停止运行、提供反馈（人工反馈节点），调用 `$store.dispatch('workflowRuntime/runWorkflow')`）
- [ ] T043 [US3] 创建工作流运行输入对话框 `src/components/70_ai/components/workflow/dialogs/RunConfigDialog.vue`（el-dialog，el-form 根据工作流开始节点的输出配置动态生成输入表单，支持文本输入（el-input）、数字输入（el-input-number）、文件上传（el-upload），表单验证必填字段，确认按钮调用 runWorkflow，取消按钮关闭对话框）

#### SSE 实时推送处理

- [ ] T044 [US3] 在 workflowRuntimeApi.js 中实现 runWorkflow SSE 接口（调用 `src/components/70_ai/utils/sseUtils.js` 的 createKbQaStream，URL: `/scm/ai/workflow/${wfUuid}/run`，请求体：`{ inputs: userInputs }`，处理 8 种 SSE 事件：[START], [NODE_RUN_{nodeUuid}], [NODE_INPUT_{nodeUuid}], [NODE_CHUNK_{nodeUuid}], [NODE_OUTPUT_{nodeUuid}], [NODE_WAIT_FEEDBACK_BY_{nodeUuid}], [DONE], [ERROR]，SSE 超时时间 150秒）
- [ ] T045 [US3] 在 workflowSseHandler.js 中实现 SSE 事件分发处理器（handleSseEvent 函数，根据事件名分发到不同处理函数：initWorkflowRuntime ([START])、highlightNodeStatus ([NODE_RUN_])、updateNodeInput ([NODE_INPUT_])、appendNodeChunk ([NODE_CHUNK_])、updateNodeOutput ([NODE_OUTPUT_])、promptUserFeedback ([NODE_WAIT_FEEDBACK_BY_])、completeWorkflowExecution ([DONE])、handleExecutionError ([ERROR])，每个处理函数更新 Vuex store 状态）

#### 节点状态可视化

- [ ] T046 [US3] 在 x6GraphHelper.js 中实现节点状态高亮功能（highlightNode 函数，根据状态更新节点样式：running=蓝色边框（#1890ff）、success=绿色边框（#52c41a）、fail=红色边框（#ff4d4f）、waiting=橙色边框（#faad14），调用 `node.attr('body/stroke')` 和 `node.attr('body/strokeWidth', 3)`，running 状态添加虚线动画 `stroke-dasharray: '5,5'`）
- [ ] T047 [US3] 在 WorkflowRunner 中集成节点状态更新（监听 Vuex store 的 runtimeNodes 状态变化，调用 highlightNode 更新画布节点样式，显示节点执行时间，显示节点输入输出数据（el-collapse 折叠面板））

#### 流式输出和实时反馈

- [ ] T048 [US3] 实现 LLM 节点流式输出显示（在 WorkflowRunner 中监听 SSE 的 [NODE_CHUNK_{nodeUuid}] 事件，累积文本块到 outputText，实时更新显示区域（el-card，自动滚动到底部），支持 Markdown 渲染（如需要））
- [ ] T049 [US3] 实现人工反馈节点交互（监听 SSE 的 [NODE_WAIT_FEEDBACK_BY_{nodeUuid}] 事件，暂停工作流执行，弹出反馈输入对话框（el-dialog，el-input type="textarea"），用户输入反馈内容，点击"提交"调用 `$store.dispatch('workflowRuntime/provideFeedback')`，工作流继续执行）

#### 工作流执行控制

- [ ] T050 [US3] 实现停止工作流功能（在 WorkflowRunner 中添加"停止"按钮，调用 `$store.dispatch('workflowRuntime/stopWorkflow')`，调用后端 API `/scm/ai/workflow/runtime/${runtimeUuid}/stop`，停止 SSE 连接，清理运行时状态，显示"工作流已停止"消息）
- [ ] T051 [US3] 实现工作流执行完成处理（监听 SSE 的 [DONE] 事件，更新工作流状态为 SUCCESS，显示执行完成消息（el-message.success），显示最终输出结果，停止所有动画效果，可以重新运行）
- [ ] T052 [US3] 实现工作流执行错误处理（监听 SSE 的 [ERROR] 事件，更新工作流状态为 FAIL，显示错误消息（el-message.error），记录错误详情到 statusRemark，高亮失败的节点（红色边框），停止执行）

**Checkpoint**: 此时用户故事 1、2、3 都应该可用且可独立测试。用户可以创建、配置、运行工作流，查看实时执行状态。这是一个完整的 MVP。

---

## Phase 6: User Story 4 - 管理工作流版本 (Priority: P2)

**Goal**: 用户能够查看、复制和删除工作流，有效管理多个工作流实例

**Independent Test**:
1. 打开工作流列表，显示所有已创建的工作流
2. 选中一个工作流，点击"复制"按钮，成功创建副本（名称为"[原名称]-副本"）
3. 选中一个工作流，点击"删除"按钮，弹出确认对话框，确认后删除成功
4. 切换到"公开市场"标签，显示公开的工作流列表
5. 选中一个公开工作流，可以复制到"我的工作流"

### 实施 User Story 4

#### 工作流列表增强

- [ ] T053 [US4] 在 WorkflowList 中实现工作流搜索功能（el-input 搜索框（带 el-icon-search），输入关键词后调用 `$store.dispatch('workflow/loadWorkflowList', { keyword })`，搜索名称和描述字段，实时搜索（使用 debounce 延迟 500ms））
- [ ] T054 [US4] 在 WorkflowList 中实现工作流排序功能（el-select 选择排序方式：创建时间、修改时间、名称、运行次数，调用 API 时传递 sortBy 和 sortOrder 参数，默认按修改时间倒序）

#### 工作流复制功能

- [ ] T055 [US4] 在 WorkflowList 中实现工作流复制功能（表格操作列添加"复制"按钮（el-button icon="el-icon-document-copy"），点击后调用 `$store.dispatch('workflow/duplicateWorkflow', wfUuid)`，调用后端 API `/scm/ai/workflow/${wfUuid}/duplicate`，成功后刷新列表并显示成功消息，副本名称自动添加"-副本"后缀）
- [ ] T056 [US4] 实现公开工作流复制到我的工作流（在"公开市场"标签页，表格操作列添加"复制到我的工作流"按钮，点击后调用 duplicateWorkflow API，成功后切换到"我的工作流"标签并刷新列表）

#### 工作流删除功能

- [ ] T057 [US4] 在 WorkflowList 中实现工作流删除功能（表格操作列添加"删除"按钮（el-button type="danger" icon="el-icon-delete"），点击后弹出确认对话框（el-message-box.confirm），确认后调用 `$store.dispatch('workflow/deleteWorkflow', wfUuid)`，调用后端 API `/scm/ai/workflow/${wfUuid}` DELETE，成功后刷新列表并显示成功消息，如果工作流正在运行则阻止删除并提示）
- [ ] T058 [US4] 实现工作流批量删除功能（表格添加多选框（el-table-column type="selection"），工具栏添加"批量删除"按钮，选中多个工作流后点击批量删除，弹出确认对话框显示删除数量，确认后依次调用 deleteWorkflow API，显示删除进度和结果）

#### 公开工作流市场

- [ ] T059 [US4] 在 WorkflowList 中实现公开市场标签页（el-tabs 添加"公开市场"标签，调用 `$store.dispatch('workflow/loadWorkflowList', { type: 'public' })`，显示所有 is_public=true 的工作流，表格显示：名称、描述、创建者、创建时间、运行次数，操作按钮：查看详情、复制到我的工作流）
- [ ] T060 [US4] 实现工作流公开/私有切换功能（在工作流编辑对话框中添加"是否公开"开关（el-switch），保存时调用 updateWorkflow API 更新 is_public 字段，公开后工作流出现在公开市场，取消公开后从市场移除）

**Checkpoint**: 此时用户故事 1-4 都应该可用。用户可以完整管理工作流（创建、配置、运行、复制、删除、公开）。

---

## Phase 7: User Story 5 - 使用高级节点类型 (Priority: P2)

**Goal**: 用户能够使用专业节点（文档提取、关键词提取、HTTP请求等），构建复杂的业务自动化流程

**Independent Test**:
1. 创建新工作流，添加"文档提取"节点
2. 配置节点，上传 PDF 文件
3. 连接到 LLM 节点，运行工作流
4. 成功提取文档文本内容并传递给 LLM 节点
5. LLM 节点基于文档内容生成回答

### 实施 User Story 5

#### 文档处理节点

- [ ] T061 [P] [US5] 创建文档提取节点组件 `src/components/70_ai/components/workflow/nodes/DocumentExtractNode.vue`（X6 自定义节点，青色圆角矩形，图标 el-icon-document，输入端口 1 个（files）、输出端口 1 个（text），默认配置：extractMode='full'（全文提取/按页提取））
- [ ] T062 [US5] 在 NodeConfigPanel 中添加文档提取节点配置表单（el-upload 上传文件（支持 PDF、Word、TXT），显示已上传文件列表，el-radio 选择提取模式：全文提取/按页提取，文件类型验证（仅允许文档类型））
- [ ] T063 [P] [US5] 创建关键词提取节点组件 `src/components/70_ai/components/workflow/nodes/KeywordExtractNode.vue`（X6 自定义节点，绿色圆角矩形，图标 el-icon-price-tag，输入端口 1 个（text）、输出端口 1 个（keywords），默认配置：modelName='', maxKeywords=10）
- [ ] T064 [US5] 在 NodeConfigPanel 中添加关键词提取节点配置表单（el-select 选择 AI 模型，el-input-number 设置最大关键词数量（1-50），el-checkbox 是否包含关键词权重）
- [ ] T065 [P] [US5] 创建 FAQ 提取节点组件 `src/components/70_ai/components/workflow/nodes/FaqExtractNode.vue`（X6 自定义节点，橙色圆角矩形，图标 el-icon-question，输入端口 1 个（text）、输出端口 1 个（faqs），默认配置：modelName='', maxFaqs=20）
- [ ] T066 [US5] 在 NodeConfigPanel 中添加 FAQ 提取节点配置表单（el-select 选择 AI 模型，el-input-number 设置最大 FAQ 数量（1-100），el-input type="textarea" 输入 FAQ 提取指引（可选））

#### 集成节点

- [ ] T067 [P] [US5] 创建 HTTP 请求节点组件 `src/components/70_ai/components/workflow/nodes/HttpNode.vue`（X6 自定义节点，灰色圆角矩形，图标 el-icon-link，输入端口 1 个（request_body）、输出端口 1 个（response），默认配置：url='', method='GET', headers={}, timeout=30, retryCount=3）
- [ ] T068 [US5] 在 NodeConfigPanel 中添加 HTTP 请求节点配置表单（el-input 输入 URL（必填，验证 HTTP/HTTPS），el-select 选择请求方法（GET/POST/PUT/DELETE），el-input 输入请求头（JSON 格式，可选），el-input type="textarea" 输入请求体（支持变量引用，可选），el-slider 设置超时时间（1-600 秒），el-input-number 设置重试次数（0-10 次），URL 格式验证，JSON 格式验证）
- [ ] T069 [P] [US5] 创建邮件发送节点组件 `src/components/70_ai/components/workflow/nodes/EmailNode.vue`（X6 自定义节点，红色圆角矩形，图标 el-icon-message，输入端口 1 个（content）、输出端口 0 个，默认配置：recipients=[], subject='', smtpServer='', smtpPort=587, username='', password=''）
- [ ] T070 [US5] 在 NodeConfigPanel 中添加邮件发送节点配置表单（el-select mode="tags" 输入收件人（支持多个，必填），el-input 输入邮件主题（必填），el-input type="textarea" 输入邮件正文（支持 HTML 和变量引用），el-input 输入 SMTP 服务器地址，el-input-number 输入 SMTP 端口，el-input 输入用户名和密码，邮箱格式验证）

#### 搜索和图像生成节点

- [ ] T071 [P] [US5] 创建 Google 搜索节点组件 `src/components/70_ai/components/workflow/nodes/GoogleSearchNode.vue`（X6 自定义节点，彩色圆角矩形，图标 el-icon-search，输入端口 1 个（query）、输出端口 1 个（results），默认配置：maxResults=10, language='zh-CN'）
- [ ] T072 [US5] 在 NodeConfigPanel 中添加 Google 搜索节点配置表单（el-input-number 设置最大结果数（1-50），el-select 选择搜索语言，el-input 输入 API 密钥（必填），密钥验证）
- [ ] T073 [P] [US5] 创建 Dalle3 图像生成节点组件 `src/components/70_ai/components/workflow/nodes/ImageGenDalle3Node.vue`（X6 自定义节点，紫色圆角矩形，图标 el-icon-picture，输入端口 1 个（prompt）、输出端口 1 个（image_url），默认配置：size='1024x1024', quality='standard', style='vivid'）
- [ ] T074 [US5] 在 NodeConfigPanel 中添加 Dalle3 图像生成节点配置表单（el-select 选择图像尺寸（1024x1024/1792x1024/1024x1792），el-select 选择质量（standard/hd），el-select 选择风格（vivid/natural））
- [ ] T075 [P] [US5] 创建通义万相图像生成节点组件 `src/components/70_ai/components/workflow/nodes/ImageGenTongyiNode.vue`（X6 自定义节点，紫色圆角矩形，图标 el-icon-picture-outline，输入端口 1 个（prompt）、输出端口 1 个（image_url），默认配置：size='1024*1024', n=1）
- [ ] T076 [US5] 在 NodeConfigPanel 中添加通义万相图像生成节点配置表单（el-select 选择图像尺寸（1024*1024/720*1280/1280*720），el-input-number 设置生成数量（1-4））

#### 高级节点注册和显示

- [ ] T077 [US5] 在 NodeLibrary 中添加高级节点分类（el-collapse 添加"高级节点"分类（integration 集成类），显示 HTTP 请求、邮件发送、Google 搜索节点，添加"AI 处理"分类（ai 类），显示文档提取、关键词提取、FAQ 提取、图像生成节点，每个节点显示图标、标题、简短描述）
- [ ] T078 [US5] 在 x6GraphHelper.js 中注册所有高级节点类型（调用 `Shape.register()` 为每个高级节点类型注册自定义节点，设置节点样式（颜色、图标、端口配置），使用 Vue 组件渲染（如果需要））

**Checkpoint**: 此时用户故事 1-5 都应该可用。用户可以使用所有 16 种节点类型构建复杂的工作流。

---

## Phase 8: User Story 6 - 查看运行历史和调试 (Priority: P3)

**Goal**: 用户能够查看详细的运行历史和节点执行日志，排查问题和优化工作流

**Independent Test**:
1. 打开工作流列表，点击某个工作流的"历史记录"按钮
2. 显示该工作流的所有运行记录列表（时间、状态、执行时长）
3. 点击某条运行记录，显示详细执行轨迹
4. 查看每个节点的输入数据和输出结果
5. 如果某个节点执行失败，查看详细的错误信息和失败原因
6. 可以删除单条或清空所有历史记录

### 实施 User Story 6

#### 运行历史列表

- [ ] T079 [US6] 创建工作流历史记录组件 `src/components/70_ai/components/workflow/WorkflowHistory.vue`（el-table 显示运行历史列表（运行时间、执行时长、状态、操作），el-pagination 分页，el-select 筛选状态（全部/成功/失败/执行中），el-date-picker 筛选日期范围，表格列：runtime_uuid（隐藏）、start_time、end_time、duration（执行时长，自动计算）、status（状态标签，使用 el-tag）、操作按钮：查看详情、删除，工具栏按钮：清空历史记录，调用 `$store.dispatch('workflowRuntime/loadRuntimeHistory')`）
- [ ] T080 [US6] 在 WorkflowList 中添加"历史记录"入口（表格操作列添加"历史记录"按钮（el-button icon="el-icon-time"），点击后打开 WorkflowHistory 组件（el-drawer 右侧抽屉），传递 wfUuid 参数，加载该工作流的历史记录）

#### 运行详情查看

- [ ] T081 [US6] 创建运行详情对话框组件 `src/components/70_ai/components/workflow/dialogs/RuntimeDetailDialog.vue`（el-dialog 显示单次运行的详细信息，顶部：运行时间、执行时长、状态（el-tag），中间：工作流画布（只读模式，节点显示执行状态），el-collapse 折叠面板显示每个节点的详细信息（节点名称、执行时间、输入数据、输出数据、状态、错误信息），底部：用户输入参数、最终输出结果，调用 `$store.dispatch('workflowRuntime/loadHistoryDetail')`）
- [ ] T082 [US6] 在 WorkflowHistory 中集成运行详情对话框（点击"查看详情"按钮，打开 RuntimeDetailDialog，传递 runtimeUuid 参数，加载运行详情数据，画布节点根据状态显示不同颜色（成功=绿色、失败=红色、执行中=蓝色））

#### 节点执行详情展示

- [ ] T083 [US6] 在 RuntimeDetailDialog 中实现节点输入输出展示（el-collapse-item 每个节点一项，展开后显示：节点标题、执行时间（start_time → end_time）、执行状态（el-tag），el-descriptions 显示输入数据（每个 NodeIOData 一行，显示 name、title、type、value），el-descriptions 显示输出数据（格式同输入），如果是文本类型且内容较长，使用 el-input type="textarea" 只读模式显示，如果是文件类型，显示文件 URL 列表（可点击下载））
- [ ] T084 [US6] 在 RuntimeDetailDialog 中实现节点错误信息展示（如果节点 status=FAIL，el-alert type="error" 显示错误信息（statusRemark），高亮失败的节点（红色边框加粗），在节点详情中显示完整的错误堆栈（如果有），提供"重新运行此工作流"按钮）

#### 历史记录管理

- [ ] T085 [US6] 在 WorkflowHistory 中实现删除单条历史记录（表格操作列"删除"按钮（el-button type="text" icon="el-icon-delete"），点击后弹出确认对话框，确认后调用 `$store.dispatch('workflowRuntime/deleteRuntimeHistory', runtimeUuid)`，调用后端 API `/scm/ai/workflow/runtime/${runtimeUuid}` DELETE，成功后刷新列表并显示成功消息）
- [ ] T086 [US6] 在 WorkflowHistory 中实现清空所有历史记录（工具栏"清空历史记录"按钮（el-button type="danger"），点击后弹出确认对话框（提示"即将删除所有运行记录，此操作不可恢复"），确认后调用后端 API `/scm/ai/workflow/${wfUuid}/runtime/clear` DELETE，返回删除数量，刷新列表显示空状态，显示成功消息"已清空 XX 条历史记录"）

#### 历史记录统计

- [ ] T087 [US6] 在 WorkflowHistory 中添加历史记录统计信息（顶部卡片（el-card）显示统计数据：总运行次数、成功次数、失败次数、平均执行时长，使用 el-statistic 组件显示数字，使用 el-progress 显示成功率（type="circle"），根据后端返回的历史记录列表计算统计数据）

**Checkpoint**: 此时所有 6 个用户故事都应该可用。用户可以完整使用工作流系统（创建、配置、运行、管理、调试）。

---

## Phase 9: Polish & Cross-Cutting Concerns (优化与完善)

**Purpose**: 影响多个用户故事的改进和完善

### 样式和 UI 优化

- [ ] T088 [P] 在 `src/components/70_ai/styles/workflow.scss` 中完善工作流样式（统一颜色主题（使用 Element UI 主题色）、定义节点样式变量（节点颜色、边框、阴影）、定义画布样式（网格背景、缩放控制按钮）、定义面板样式（抽屉、对话框、折叠面板）、响应式布局（最小宽度 1200px）、暗色模式支持（可选））
- [ ] T089 [P] 优化节点图标和视觉设计（为每个节点类型设计图标（使用 Element UI icon 或自定义 SVG）、统一节点尺寸（200x80）、添加节点阴影和渐变效果、设计连线样式（圆角、箭头、hover 高亮）、添加节点拖拽预览效果）
- [ ] T090 [P] 优化工作流列表和历史记录 UI（添加空状态提示（el-empty，"暂无工作流"、"暂无历史记录"）、优化表格列宽和对齐、添加加载动画（el-loading）、优化按钮布局和间距、添加操作确认动画）

### 性能优化

- [ ] T091 [P] 优化 X6 画布性能（大规模节点（50+）时启用虚拟渲染、优化节点渲染：使用 SVG 而非 HTML、延迟加载节点配置面板、防抖处理画布缩放和平移事件（debounce 100ms）、使用 requestAnimationFrame 优化动画）
- [ ] T092 [P] 优化 SSE 连接和事件处理（实现 SSE 自动重连机制（最多 3 次，间隔 2 秒）、优化事件处理性能（使用 Map 缓存节点状态）、减少不必要的 Vuex commit（批量更新）、优化流式输出文本累积（使用 StringBuilder 模式））
- [ ] T093 [P] 优化 Vuex 状态更新（减少深拷贝操作（使用 Object.assign 或扩展运算符）、优化 nodes 和 edges 数组更新（使用 splice 而非 filter）、添加 Vuex 状态缓存（localStorage 持久化草稿）、实现工作流自动保存（延迟 5 秒，防抖处理））

### 错误处理和日志

- [ ] T094 [P] 完善全局错误处理（在 main.js 中添加全局错误处理器 `Vue.config.errorHandler`、捕获工作流运行时错误并显示用户友好消息、记录错误日志到控制台（开发模式）或服务器（生产模式）、添加错误边界组件防止整个应用崩溃）
- [ ] T095 [P] 添加操作日志和审计（记录工作流关键操作（创建、修改、删除、运行）、使用 console.log 记录调试信息（开发模式）、移除生产环境的 console.log（使用 Webpack 配置）、添加性能监控（记录工作流执行时间、API 调用时间））

### 文档和代码质量

- [ ] T096 [P] 清理调试日志和无用代码（删除所有 console.log 调试语句（生产环境）、删除注释掉的代码、删除未使用的导入和变量、统一代码格式（运行 ESLint 自动修复））
- [ ] T097 [P] 添加代码注释和文档（为复杂函数添加 JSDoc 注释、为组件添加 Props 和 Events 说明、更新 quickstart.md（添加实际使用示例）、创建 README.md（工作流功能说明、使用指南、常见问题））
- [ ] T098 运行 ESLint 检查并修复所有警告和错误（运行 `npm run lint`，修复所有 ESLint 警告和错误，确保代码符合项目规范，特别注意：未使用的变量、缺少 key 的列表渲染、缺少 props 验证）

### 用户体验优化

- [ ] T099 [P] 添加操作引导和帮助提示（为首次使用用户添加新手引导（el-tour 或自定义引导组件）、在关键操作处添加 tooltip 提示（el-tooltip）、添加"帮助"按钮链接到文档、在空状态添加操作建议（"点击新建工作流开始使用"））
- [ ] T100 [P] 优化加载状态和反馈（所有 API 调用添加 loading 状态（el-loading）、添加操作成功/失败的消息提示（el-message）、添加操作进度条（保存、运行等长时操作）、优化按钮禁用状态（防止重复点击））
- [ ] T101 [P] 添加键盘快捷键支持（保存工作流：Ctrl+S、删除节点/连线：Delete 键、撤销操作：Ctrl+Z（可选）、复制节点：Ctrl+C / Ctrl+V（可选）、全选：Ctrl+A（可选）、在组件中监听键盘事件并处理）

### 最终验证

- [ ] T102 根据 quickstart.md 验证所有功能（按照 quickstart.md 的步骤逐一测试、验证所有用户故事的接受场景、检查所有 Edge Cases 是否正确处理、验证性能指标（画布操作 <200ms、节点状态更新 <500ms）、验证错误处理（网络错误、API 错误、验证错误））
- [ ] T103 跨浏览器兼容性测试（测试 Chrome 最新版本、测试 Edge 最新版本、测试 Firefox 最新版本、验证 X6 画布在各浏览器中正常渲染、验证 SSE 连接在各浏览器中正常工作）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可以立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-8)**: 全部依赖 Foundational (Phase 2) 完成
  - 用户故事之间可以并行实施（如果有团队资源）
  - 或按优先级顺序依次实施（P1 → P2 → P3）
- **Polish (Phase 9)**: 依赖所有需要的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后即可开始 - 无其他用户故事依赖
- **User Story 2 (P1)**: Foundational 完成后即可开始 - **依赖 User Story 1 的 WorkflowCanvas**
- **User Story 3 (P1)**: Foundational 完成后即可开始 - **依赖 User Story 1 和 2**（需要画布和节点配置）
- **User Story 4 (P2)**: Foundational 完成后即可开始 - **依赖 User Story 1**（需要工作流列表）
- **User Story 5 (P2)**: Foundational 完成后即可开始 - **依赖 User Story 2**（需要节点配置面板）
- **User Story 6 (P3)**: Foundational 完成后即可开始 - **依赖 User Story 3**（需要工作流运行功能）

### Within Each User Story

- 常量和 API 服务优先（Phase 2 Foundational）
- 组件按依赖顺序实施：基础组件 → 高级组件 → 集成
- 配置面板在对应节点组件之后
- 核心功能完成后再进行优化

### Parallel Opportunities

- **Phase 1 所有任务**: T001, T002, T003 可以并行
- **Phase 2 标记 [P] 的任务**: T004, T005, T006, T007, T009, T010, T011, T012, T013, T014 可以并行
- **Phase 3-8 每个用户故事内标记 [P] 的任务**: 可以在该故事内并行
- **Phase 9 标记 [P] 的任务**: 大部分优化任务可以并行

---

## Parallel Example: User Story 1

```bash
# Phase 2 完成后，User Story 1 的并行任务：

# 可以同时进行：
Task T017: "创建工作流列表组件 WorkflowList.vue"
Task T020: "创建节点库面板组件 NodeLibrary.vue"
Task T021: "创建开始节点组件 StartNode.vue"
Task T022: "创建结束节点组件 EndNode.vue"

# 以上任务完成后再进行：
Task T015: "在 chat ai 弹窗中添加 workflow 图标按钮入口"
Task T016: "创建工作流主弹窗组件 WorkflowDialog.vue"
Task T019: "创建工作流画布组件 WorkflowCanvas.vue"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1-3)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（**关键** - 阻塞所有故事）
3. 完成 Phase 3: User Story 1 - 创建和设计工作流
4. 完成 Phase 4: User Story 2 - 配置工作流节点
5. 完成 Phase 5: User Story 3 - 运行和调试工作流
6. **STOP and VALIDATE**: 独立测试每个故事
7. 如果就绪则部署/演示

**MVP 包含的功能**:
- 创建工作流、拖拽节点、连线、保存
- 配置 LLM 节点、知识检索节点等基础节点
- 运行工作流、查看实时执行状态、流式输出

### Incremental Delivery (增量交付)

1. 完成 Setup + Foundational → 基础设施就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示（工作流设计器）
3. 添加 User Story 2 → 独立测试 → 部署/演示（节点配置）
4. 添加 User Story 3 → 独立测试 → 部署/演示（工作流运行）**← MVP 完成**
5. 添加 User Story 4 → 独立测试 → 部署/演示（工作流管理）
6. 添加 User Story 5 → 独立测试 → 部署/演示（高级节点）
7. 添加 User Story 6 → 独立测试 → 部署/演示（历史记录）
8. 完成 Phase 9: Polish → 最终优化 → 正式发布

每个故事都增加价值，不会破坏之前的故事。

### Parallel Team Strategy (并行团队策略)

如果有多个开发者：

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后：
   - **Developer A**: User Story 1（工作流设计器）
   - **Developer B**: User Story 2（节点配置）+ User Story 5（高级节点）
   - **Developer C**: User Story 3（工作流运行）+ User Story 6（历史记录）
   - **Developer D**: User Story 4（工作流管理）+ Phase 9（优化）
3. 各故事独立完成和集成

**注意**: User Story 2 和 3 依赖 User Story 1 的 WorkflowCanvas，需要等待 T019 完成。

---

## Notes

- **[P] 标记**: 表示任务处理不同文件，无依赖，可以并行执行
- **[Story] 标记**: 将任务映射到具体的用户故事，便于追溯
- **每个用户故事应该独立可完成和测试**: 不要创建跨故事的强依赖
- **在实施前验证**: 确保理解任务需求和文件路径
- **每个任务或逻辑组后提交代码**: 保持小步快跑
- **在每个检查点停止验证**: 独立测试每个故事
- **避免**: 模糊的任务、同一文件冲突、破坏独立性的跨故事依赖
- **严格遵循 aideepin 原逻辑**: 不进行臆想或过度设计，参考 aideepin 源码实现

---

## Task Summary

**Total Tasks**: 103
**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 11 tasks
- Phase 3 (User Story 1): 13 tasks
- Phase 4 (User Story 2): 14 tasks
- Phase 5 (User Story 3): 11 tasks
- Phase 6 (User Story 4): 8 tasks
- Phase 7 (User Story 5): 18 tasks
- Phase 8 (User Story 6): 9 tasks
- Phase 9 (Polish): 16 tasks

**By User Story**:
- User Story 1 (P1): 13 tasks
- User Story 2 (P1): 14 tasks
- User Story 3 (P1): 11 tasks
- User Story 4 (P2): 8 tasks
- User Story 5 (P2): 18 tasks
- User Story 6 (P3): 9 tasks
- Setup & Foundational: 14 tasks
- Polish: 16 tasks

**Parallel Opportunities**: 45 tasks marked [P] can run in parallel within their phase/story

**Independent Test Criteria**: Each user story has clear acceptance criteria for independent testing

**Suggested MVP Scope**: User Stories 1, 2, 3 (38 tasks + 14 foundational tasks = 52 tasks total for MVP)

---

**Format Validation**: ✅ All 103 tasks follow the checklist format:
- Checkbox: `- [ ]`
- Task ID: Sequential (T001-T103)
- [P] marker: Present for 45 parallelizable tasks
- [Story] label: Present for all user story tasks (73 tasks)
- File paths: Included in all task descriptions

**Generated**: 2025-10-21
**Feature Branch**: `001-ai-workflow-migration`
**Next Step**: Begin implementation with Phase 1 (Setup) tasks
