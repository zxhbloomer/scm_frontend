# AI快速打开页面 + 人机交互 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现AI通过工作流指令打开RouterTab页面（支持参数传递和多种模式），并在Chat面板中进行人机交互（选择/确认/表单），交互结果回传工作流继续执行。

**Architecture:** 后端OpenPageNode增强支持route模式+交互中断，新增ai_workflow_interaction表持久化交互状态，前端新增AiPageRouter导航器+AiLoadingOverlay加载浮层+Chat交互组件，通过SSE推送open_page_command和interaction_request，反馈复用现有/chat/stream通道。

**Tech Stack:** Spring Boot 3.1.4 + Spring AI Alibaba Graph + MyBatis Plus / Vue 2.7.16 + Element UI + Vuex / MySQL 8.4

---

## Phase 1: 数据库 + 后端数据层

### Task 1: 创建 ai_workflow_interaction 数据库表

**Files:**
- Execute SQL on: `scm_tenant_20250519_001` database

**Step 1: 执行建表SQL**

```sql
CREATE TABLE ai_workflow_interaction (
  id                bigint       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  interaction_uuid  varchar(50)  NOT NULL COMMENT '交互UUID(业务主键)',
  conversation_id   varchar(100) NOT NULL COMMENT '对话ID，关联ai_conversation',
  runtime_uuid      varchar(100) NOT NULL COMMENT '运行时UUID，关联ai_conversation_runtime',
  node_uuid         varchar(100) NOT NULL COMMENT '触发交互的节点UUID',
  interaction_type  varchar(20)  NOT NULL COMMENT '交互类型: user_select/user_confirm/user_form',
  interaction_params json        NOT NULL COMMENT '交互参数JSON(选项列表/确认文案/表单定义)',
  description       text         DEFAULT NULL COMMENT '交互描述(显示给用户的提示文字)',
  status            varchar(20)  NOT NULL DEFAULT 'WAITING' COMMENT '状态: WAITING/SUBMITTED/TIMEOUT/CANCELLED',
  timeout_minutes   int          DEFAULT 30 COMMENT '超时时间(分钟)',
  timeout_at        datetime     DEFAULT NULL COMMENT '超时截止时间',
  feedback_data     json         DEFAULT NULL COMMENT '用户反馈数据JSON',
  feedback_action   varchar(50)  DEFAULT NULL COMMENT '用户操作: select_record/confirm/reject/cancel/__timeout',
  submitted_at      datetime     DEFAULT NULL COMMENT '提交时间',
  c_time            datetime     DEFAULT NULL COMMENT '创建时间',
  u_time            datetime     DEFAULT NULL COMMENT '修改时间',
  c_id              bigint       DEFAULT NULL COMMENT '创建人ID',
  u_id              bigint       DEFAULT NULL COMMENT '修改人ID',
  dbversion         int          DEFAULT 0 COMMENT '数据版本(乐观锁)',
  PRIMARY KEY (id),
  UNIQUE KEY uk_interaction_uuid (interaction_uuid),
  KEY idx_interaction_conversation (conversation_id),
  KEY idx_interaction_runtime (runtime_uuid),
  KEY idx_interaction_timeout (status, timeout_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='AI工作流人机交互表';
```

**Step 2: 验证表创建成功**

```bash
docker exec mysql8 mysql -uroot -p123456 -e "USE scm_tenant_20250519_001; DESC ai_workflow_interaction;"
```

### Task 2: 创建 AiWorkflowInteractionEntity 实体类

**Files:**
- Create: `scm-ai/src/main/java/com/xinyirun/scm/ai/bean/entity/workflow/AiWorkflowInteractionEntity.java`

**Step 1: 创建Entity类**

参考现有 `AiConversationRuntimeEntity.java` 的风格，字段使用snake_case与DB一致。包含所有字段的getter/setter（使用@Data注解或手写）。通用字段 c_time/u_time/c_id/u_id/dbversion 按项目规范添加 @TableField 和 fill 策略。

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/bean/entity/workflow/AiWorkflowInteractionEntity.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): 新增AI工作流人机交互实体类"
```

---

### Task 3: 创建 AiWorkflowInteractionMapper

**Files:**
- Create: `scm-ai/src/main/java/com/xinyirun/scm/ai/core/mapper/workflow/AiWorkflowInteractionMapper.java`

**Step 1: 创建Mapper接口**

继承 `BaseMapper<AiWorkflowInteractionEntity>`，添加自定义方法：
- `findWaitingByConversationId(String conversation_id)` — 查找对话中WAITING状态的交互
- `findExpiredInteractions()` — 查找 status=WAITING 且 timeout_at < NOW() 的记录

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/core/mapper/workflow/AiWorkflowInteractionMapper.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): 新增AI工作流人机交互Mapper"
```

---

### Task 4: 创建 AiWorkflowInteractionService

**Files:**
- Create: `scm-ai/src/main/java/com/xinyirun/scm/ai/core/service/workflow/AiWorkflowInteractionService.java`

**Step 1: 创建Service类**

核心方法：
- `createInteraction(conversation_id, runtime_uuid, node_uuid, type, params, description, timeout_minutes)` — 创建交互记录，计算timeout_at
- `submitFeedback(interaction_uuid, feedback_action, feedback_data)` — 更新状态为SUBMITTED
- `cancelInteraction(interaction_uuid)` — 更新状态为CANCELLED
- `timeoutInteraction(interaction_uuid)` — 更新状态为TIMEOUT
- `findWaitingByConversationId(conversation_id)` — 查找WAITING交互

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/core/service/workflow/AiWorkflowInteractionService.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): 新增AI工作流人机交互Service"
```

---

## Phase 2: 后端SSE传输层增强

### Task 5: ChatResponseVo 增加新字段

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/bean/vo/response/ChatResponseVo.java`

**Step 1: 添加2个新字段**

在现有 `ai_open_dialog_para` 字段附近添加：

```java
/**
 * 页面导航指令（JSON字符串）
 * OpenPage节点route模式输出，触发前端RouterTab导航
 */
private String open_page_command;

/**
 * 人机交互请求（JSON字符串）
 * OpenPage节点交互模式输出，触发前端Chat交互组件
 */
private String interaction_request;
```

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/bean/vo/response/ChatResponseVo.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): ChatResponseVo增加open_page_command和interaction_request字段"
```

---

### Task 6: WfState 增加侧通道字段

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/WfState.java`

**Step 1: 在现有 ai_open_dialog_para 附近添加**

```java
/**
 * 页面导航指令JSON（OpenPage route模式侧通道）
 */
private String open_page_command;

/**
 * 人机交互请求JSON（OpenPage交互模式侧通道）
 */
private String interaction_request;
```

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/WfState.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): WfState增加open_page_command和interaction_request侧通道"
```

---

### Task 7: WorkflowEventAdapter 适配新字段

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/core/adapter/WorkflowEventAdapter.java`

**Step 1: 在convert()方法中增加新字段透传**

参考现有 `ai_open_dialog_para` 的透传逻辑，在 "output" 事件处理分支中，从 WorkflowEventVo 提取 `open_page_command` 和 `interaction_request`，设置到 ChatResponseVo。

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/core/adapter/WorkflowEventAdapter.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): WorkflowEventAdapter适配open_page_command和interaction_request"
```

---

## Phase 3: 后端OpenPageNode增强

### Task 8: OpenPageNode 增加 route 模式

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/openpage/OpenPageNode.java`

**Step 1: 增强 onProcess() 方法**

在现有逻辑基础上，根据 `open_mode` 配置分支：
- `open_mode = "dialog"` → 现有逻辑不变（设置 ai_open_dialog_para）
- `open_mode = "route"` → 构建 open_page_command JSON，存入 wfState.open_page_command
  - 如果 `interaction_enabled = true`：
    - 调用 AiWorkflowInteractionService.createInteraction()
    - 构建 interaction_request JSON，存入 wfState.interaction_request
    - 设置 isWaitingInput = true（触发工作流中断）

**注意**: open_mode 默认为 "dialog" 以保持向后兼容。

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/workflow/node/openpage/OpenPageNode.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): OpenPageNode增加route模式支持页面导航和人机交互"
```

---

## Phase 4: 后端交互反馈 + 超时

### Task 9: AiConversationService 增加交互反馈处理

**Files:**
- Modify: `scm-ai/src/main/java/com/xinyirun/scm/ai/core/service/chat/AiConversationService.java`

**Step 1: 在chatStream处理中增加WAITING_INPUT分支**

当检测到 `workflow_state = WORKFLOW_WAITING_INPUT` 时：
1. 查询 ai_workflow_interaction (status=WAITING)
2. 解析用户消息为反馈数据（JSON解析）
3. 调用 interactionService.submitFeedback()
4. 注入 HUMAN_FEEDBACK 到工作流状态
5. 恢复工作流执行

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/core/service/chat/AiConversationService.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): 聊天服务增加人机交互反馈处理和工作流恢复"
```

---

### Task 10: 超时定时任务

**Files:**
- Create: `scm-ai/src/main/java/com/xinyirun/scm/ai/core/schedule/InteractionTimeoutScheduler.java`

**Step 1: 创建定时任务类**

```java
@Component
public class InteractionTimeoutScheduler {
    @Scheduled(fixedRate = 60000) // 每分钟扫描
    public void checkInteractionTimeout() {
        // 查找 status=WAITING 且 timeout_at < NOW()
        // 更新状态为 TIMEOUT
        // 恢复工作流走超时分支
        // Chat中保存超时提示消息
    }
}
```

**Step 2: Commit**

```bash
git -C 00_scm_backend/scm_backend add scm-ai/src/main/java/com/xinyirun/scm/ai/core/schedule/InteractionTimeoutScheduler.java
git -C 00_scm_backend/scm_backend commit -m "feat(ai): 新增人机交互超时定时扫描任务"
```

---

## Phase 5: 前端加载浮层 + 页面导航

### Task 11: AiLoadingOverlay 加载浮层组件

**Files:**
- Create: `src/components/70_ai/components/navigator/AiLoadingOverlay.vue`

**Step 1: 创建组件**

Element UI 风格的全屏半透明遮罩：
- 居中显示 "请稍候，正在打开页面..."
- z-index: 2000（高于业务页面，低于Chat面板的2100）
- 通过 `visible` prop 控制显示/隐藏
- 超过10秒自动显示"加载超时"提示
- 使用 `el-loading` 风格的旋转动画

**Step 2: 在 App.vue 或 layout 中全局挂载**

在 `src/layout/index.vue` 或 `src/App.vue` 中引入并挂载 AiLoadingOverlay。

**Step 3: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/navigator/AiLoadingOverlay.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): 新增AI页面加载浮层组件"
```

---

### Task 12: AiPageRouter 页面导航器

**Files:**
- Create: `src/components/70_ai/components/navigator/AiPageRouter.js`

**Step 1: 创建导航器模块**

导出核心方法 `navigateToPage(command, router, store)`：
1. 权限校验：通过 `store.getters.permission_routes` 检查目标路由是否在用户权限内
2. 显示加载浮层：`store.commit('SET_AI_LOADING_OVERLAY', true)`
3. 执行导航：`router.push({ path: command.route, query: { _ai: '1', ...command.query_params } })`
4. 等待导航完成：监听 `router.afterEach`
5. 根据 page_mode 执行后续操作（通过全局事件总线通知目标页面）
6. 关闭加载浮层

**Step 2: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/navigator/AiPageRouter.js
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): 新增AI页面导航器AiPageRouter"
```

---

## Phase 6: 前端SSE解析增强

### Task 13: aiChatService.js 增加新回调

**Files:**
- Modify: `src/components/70_ai/api/aiChatService.js`

**Step 1: sendMessageStream 增加回调参数**

在回调对象中新增：
- `onOpenPageCommand: (command) => {}` — 接收 open_page_command
- `onInteractionRequest: (request) => {}` — 接收 interaction_request

**Step 2: SSE解析逻辑中增加检测**

在现有SSE解析逻辑（约第135行之后）中，增加：

```javascript
// 检测页面导航指令
if (chatResponse.open_page_command) {
  const command = JSON.parse(chatResponse.open_page_command)
  callbacks.onOpenPageCommand && callbacks.onOpenPageCommand(command)
}

// 检测交互请求
if (chatResponse.interaction_request) {
  const request = JSON.parse(chatResponse.interaction_request)
  callbacks.onInteractionRequest && callbacks.onInteractionRequest(request)
}
```

**Step 3: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/api/aiChatService.js
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): aiChatService增加open_page_command和interaction_request回调"
```

---

## Phase 7: 前端交互状态管理

### Task 14: AiInteractionManager 交互状态管理器

**Files:**
- Create: `src/components/70_ai/components/interaction/AiInteractionManager.js`

**Step 1: 创建管理器**

管理交互状态生命周期：
- `startInteraction(request)` — 创建交互状态，启动倒计时
- `submitFeedback(action, data)` — 提交反馈，通过Chat消息发送
- `cancelInteraction()` — 取消交互
- `getActiveInteraction()` — 获取当前活跃交互
- 倒计时逻辑：每秒更新剩余时间，到期触发前端超时提示

状态存储在 Vuex chat 模块中（新增 `activeInteraction` state）。

**Step 2: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/interaction/AiInteractionManager.js
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): 新增AI人机交互状态管理器"
```

---

### Task 15: Vuex chat 模块增加交互状态

**Files:**
- Modify: `src/components/70_ai/store/modules/chat.js`

**Step 1: 增加state和mutations**

```javascript
// state 新增
activeInteraction: null,      // 当前活跃的交互请求
aiLoadingOverlay: false,      // 加载浮层显示状态

// mutations 新增
SET_ACTIVE_INTERACTION(state, interaction) { state.activeInteraction = interaction },
SET_AI_LOADING_OVERLAY(state, visible) { state.aiLoadingOverlay = visible },
```

**Step 2: sendMessage action 中增加回调处理**

在 `sendMessage` action 的 `sendMessageStream` 调用中，增加：
- `onOpenPageCommand` 回调：调用 AiPageRouter.navigateToPage()
- `onInteractionRequest` 回调：commit SET_ACTIVE_INTERACTION

**Step 3: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/store/modules/chat.js
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): Vuex chat模块增加交互状态管理和页面导航回调"
```

---

## Phase 8: 前端Chat交互组件

### Task 16: AiUserSelect 选择交互组件

**Files:**
- Create: `src/components/70_ai/components/interaction/AiUserSelect.vue`

**Step 1: 创建组件**

Props: `interaction` (交互请求对象)
Events: `@submit(action, data)`, `@cancel`

使用 Element UI `el-radio-group` 渲染选项列表，底部 `el-button` 确认/取消，右下角倒计时显示。

**Step 2: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/interaction/AiUserSelect.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): 新增AI用户选择交互组件"
```

---

### Task 17: AiUserConfirm 确认交互组件

**Files:**
- Create: `src/components/70_ai/components/interaction/AiUserConfirm.vue`

**Step 1: 创建组件**

Props: `interaction`
Events: `@submit(action, data)`, `@cancel`

显示确认描述文字，底部确认/驳回/取消按钮，倒计时。

**Step 2: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/interaction/AiUserConfirm.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): 新增AI用户确认交互组件"
```

---

### Task 18: AiUserForm 表单交互组件

**Files:**
- Create: `src/components/70_ai/components/interaction/AiUserForm.vue`

**Step 1: 创建组件**

Props: `interaction`
Events: `@submit(action, data)`, `@cancel`

根据 `interaction.params.fields` 动态渲染表单字段（el-input/el-input-number/el-select），使用 Element UI 表单验证，底部提交/取消按钮，倒计时。

**Step 2: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/interaction/AiUserForm.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): 新增AI用户表单交互组件"
```

---

## Phase 9: 前端集成

### Task 19: MessageList 渲染交互式消息

**Files:**
- Modify: `src/components/70_ai/components/chat/messages/MessageList.vue`

**Step 1: 增加交互式消息渲染**

在消息列表渲染逻辑中，检测 `activeInteraction` 状态，在最后一条AI消息后渲染对应的交互组件（AiUserSelect/AiUserConfirm/AiUserForm）。

监听交互组件的 `@submit` 和 `@cancel` 事件，调用 AiInteractionManager 处理。

**Step 2: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/chat/messages/MessageList.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): MessageList增加交互式消息渲染"
```

---

### Task 20: ChatPanel 集成页面导航和交互

**Files:**
- Modify: `src/components/70_ai/components/chat/panels/ChatPanel.vue`

**Step 1: 引入AiLoadingOverlay**

在ChatPanel模板中引入 AiLoadingOverlay 组件（或确认已在全局挂载）。

**Step 2: 处理交互反馈发送**

当用户在交互组件中提交反馈时，通过 `sendMessage` action 发送特殊格式的反馈消息。

**Step 3: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/chat/panels/ChatPanel.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): ChatPanel集成页面导航和交互反馈"
```

---

## Phase 10: 前端工作流编辑器增强

### Task 21: OpenPageNodeProperty 增加 route 模式配置

**Files:**
- Modify: `src/components/70_ai/components/workflow/components/properties/OpenPageNodeProperty.vue`

**Step 1: 增加配置项**

在现有模型选择器和提示词输入框之前，增加：
- `open_mode` 下拉选择：dialog(弹窗模式) / route(页面导航模式)
- 当 `open_mode = route` 时显示：
  - `route` 输入框（目标路由路径）
  - `page_mode` 下拉选择（list/new/view/edit/approve）
  - `interaction_enabled` 开关
  - 当开启交互时：`interaction_type` 下拉、`interaction_description` 输入框、`timeout_minutes` 数字输入

**Step 2: Commit**

```bash
git -C 01_scm_frontend/scm_frontend add src/components/70_ai/components/workflow/components/properties/OpenPageNodeProperty.vue
git -C 01_scm_frontend/scm_frontend commit -m "feat(ai): OpenPageNode属性面板增加route模式和交互配置"
```

---

## 实施顺序依赖图

```
Phase 1 (DB+数据层)     Phase 5 (前端浮层)
  Task 1 → 2 → 3 → 4     Task 11 → 12
         ↓                      ↓
Phase 2 (SSE传输)        Phase 6 (SSE解析)
  Task 5 → 6 → 7           Task 13
         ↓                      ↓
Phase 3 (节点增强)       Phase 7 (交互管理)
  Task 8                    Task 14 → 15
         ↓                      ↓
Phase 4 (反馈+超时)      Phase 8 (交互组件)
  Task 9 → 10              Task 16 → 17 → 18
                                 ↓
                           Phase 9 (集成)
                             Task 19 → 20
                                 ↓
                           Phase 10 (编辑器)
                             Task 21
```

**注意**: Phase 1-4（后端）和 Phase 5-8（前端）可以并行开发。Phase 9-10 依赖前面所有Phase完成。
