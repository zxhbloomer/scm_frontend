# AI快速打开页面 + 人机交互 全栈设计方案

> 日期：2026-03-06
> 状态：已确认
> 范围：前端 + 后端 + 数据库

## 1. 需求概述

AI通过工作流指令，模拟真实用户操作路径（顶部导航→菜单→页面），实现RouterTab级别的页面跳转，支持参数传递和多种打开模式，并在需要时通过Chat面板与用户进行人机交互（选择、确认、表单填写），交互结果回传工作流继续执行。

### 1.1 核心能力

| 能力 | 说明 |
|------|------|
| 页面导航 | 模拟用户点击菜单，RouterTab级别跳转，必须校验权限 |
| 参数传递 | 列表页查询条件自动填充、新增页JSON预填、指定记录打开 |
| 加载提示 | 悬浮框"请稍候，正在打开页面..." |
| 人机交互 | Chat面板中显示交互式消息（选择/确认/表单），或Chat调起弹窗 |
| 超时管理 | 可配置超时时间 + 超时分支（参考Dify） |
| 反馈回传 | 用户操作结果作为Chat消息回传，工作流恢复执行 |

### 1.2 触发来源

所有页面打开都通过工作流触发：
- 工作流OpenPage节点直接触发
- Chat输入（如"打开采购订单页面"）→ 调用通用OpenPage工作流 → 触发

### 1.3 打开场景

| 场景 | page_mode | 附加数据 |
|------|-----------|---------|
| 列表页 + 查询条件 | `list` | `query_params` |
| 新增页 + JSON预填 | `new` | `form_data` |
| 查看指定记录 | `view` | `record_id` |
| 编辑指定记录 | `edit` | `record_id` |
| 审批指定记录 | `approve` | `record_id` |

## 2. 整体架构

```
                    ┌──────────────────────┐
                    │   工作流引擎(后端)     │
                    │ Spring AI Alibaba    │
                    │ Graph + OpenPageNode │
                    └──────────┬───────────┘
                               │
                    SSE (open_page_command / interaction_request)
                               │
                               ▼
                    ┌──────────────────────┐
                    │  aiChatService(前端)  │
                    │  SSE事件解析分发       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌──────────────┐  ┌───────────┐  ┌──────────────────┐
     │ AiPageRouter │  │ ChatPanel │  │AiInteractionMgr  │
     │ (页面导航器)  │  │ (聊天面板) │  │(交互状态管理器)   │
     └──────────────┘  └───────────┘  └──────────────────┘
           │                │                  │
     RouterTab导航     交互式消息渲染      超时/取消管理
     参数填充          用户选择/确认        状态持久化
     Tab切换           表单填写
     加载浮层
```

### 2.1 三个新增核心模块

| 模块 | 位置 | 职责 |
|------|------|------|
| AiPageRouter | 前端 `70_ai/components/navigator/` | 页面导航、参数填充、加载提示 |
| AiInteractionManager | 前端 `70_ai/components/interaction/` | 交互状态生命周期、超时管理 |
| Chat交互组件 | 前端 `70_ai/components/interaction/` | 渲染选择/确认/表单交互式消息 |

### 2.2 后端增强模块

| 模块 | 位置 | 职责 |
|------|------|------|
| OpenPageNode增强 | `scm-ai/workflow/node/openpage/` | 支持route模式 + 交互等待 |
| InteractionService | `scm-ai/core/service/interaction/` | 交互记录CRUD + 超时扫描 |
| ChatResponseVo增强 | `scm-ai/bean/vo/response/` | 新增open_page_command、interaction_request字段 |

## 3. 数据库设计

### 3.1 新增表：ai_workflow_interaction

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

### 3.2 interaction_params JSON结构

```json
// type = user_select（用户选择）
{
  "options": [
    {"key": "record_1", "label": "PO-001 供应商A ¥5,000", "data": {"id": 1, "code": "PO-001"}},
    {"key": "record_2", "label": "PO-002 供应商B ¥8,000", "data": {"id": 2, "code": "PO-002"}}
  ]
}

// type = user_confirm（用户确认）
{
  "confirm_text": "确认审批",
  "cancel_text": "取消",
  "detail": "订单PO-002，金额¥8,000"
}

// type = user_form（用户表单）
{
  "fields": [
    {"key": "reason", "type": "textarea", "label": "审批意见", "required": true},
    {"key": "amount", "type": "number", "label": "调整金额", "required": false}
  ]
}
```

### 3.3 现有表无修改

以下表保持不变，通过字段复用实现集成：
- `ai_conversation.workflow_state` = `WORKFLOW_WAITING_INPUT`（已有状态）
- `ai_conversation.current_runtime_uuid`（已有，用于恢复）
- `ai_conversation_content.ai_open_dialog_para`（已有，弹窗模式继续使用）

## 4. 后端设计

### 4.1 Entity类：AiWorkflowInteractionEntity

字段与DB保持一致，使用snake_case：

```java
@TableName("ai_workflow_interaction")
public class AiWorkflowInteractionEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("interaction_uuid")
    private String interaction_uuid;
    @TableField("conversation_id")
    private String conversation_id;
    @TableField("runtime_uuid")
    private String runtime_uuid;
    @TableField("node_uuid")
    private String node_uuid;
    @TableField("interaction_type")
    private String interaction_type;
    @TableField("interaction_params")
    private String interaction_params;
    @TableField("description")
    private String description;
    @TableField("status")
    private String status;
    @TableField("timeout_minutes")
    private Integer timeout_minutes;
    @TableField("timeout_at")
    private LocalDateTime timeout_at;
    @TableField("feedback_data")
    private String feedback_data;
    @TableField("feedback_action")
    private String feedback_action;
    @TableField("submitted_at")
    private LocalDateTime submitted_at;
    // c_time, u_time, c_id, u_id, dbversion 通用字段
}
```

### 4.2 OpenPageNode增强

现有OpenPageNode增加route模式配置：

```java
// OpenPageNodeConfig 新增字段
public class OpenPageNodeConfig {
    // 现有字段
    private String model_name;
    private String prompt;

    // 新增字段
    private String open_mode;           // "dialog"(现有) | "route"(新增)
    private String route;               // 目标路由路径，如 "/po/order"
    private String page_mode;           // "list" | "new" | "view" | "edit" | "approve"
    private Boolean interaction_enabled; // 是否需要人机交互
    private String interaction_type;    // "user_select" | "user_confirm" | "user_form"
    private String interaction_description; // 交互描述
    private Integer timeout_minutes;    // 超时时间(分钟)，默认30
}
```

执行流程：

```
OpenPageNode.onProcess()
│
├── open_mode = "dialog" → 现有逻辑不变（ai_open_dialog_para）
│
└── open_mode = "route" →
    ├── 1. 构建 open_page_command JSON
    ├── 2. 存入 wfState 侧通道
    ├── 3. 如果 interaction_enabled = true：
    │      ├── 创建 ai_workflow_interaction 记录(WAITING)
    │      ├── 构建 interaction_request JSON
    │      ├── 存入 wfState 侧通道
    │      └── 工作流进入中断状态(WORKFLOW_WAITING_INPUT)
    └── 4. 如果 interaction_enabled = false：
           └── 节点完成，工作流继续
```

### 4.3 ChatResponseVo增强

```java
public class ChatResponseVo {
    // 现有字段保持不变
    private String ai_open_dialog_para;
    private Boolean isWaitingInput;
    // ...

    // 新增：页面导航指令（JSON字符串）
    private String open_page_command;

    // 新增：交互请求（JSON字符串）
    private String interaction_request;
}
```

### 4.4 交互反馈处理

复用现有 `/chat/stream` 端点，当 `workflow_state = WORKFLOW_WAITING_INPUT` 时：

```
POST /api/v1/ai/conversation/chat/stream
│
├── 检查 ai_conversation.workflow_state
│
├── IDLE → 正常路由选择工作流
│
└── WORKFLOW_WAITING_INPUT →
    ├── 查询 ai_workflow_interaction (status=WAITING)
    ├── 解析用户消息为反馈数据
    ├── 更新 interaction: status=SUBMITTED, feedback_data, feedback_action
    ├── 注入 HUMAN_FEEDBACK_METADATA_KEY 到工作流状态
    └── 恢复工作流执行
```

### 4.5 超时定时任务

```java
@Scheduled(fixedRate = 60000) // 每分钟扫描
public void checkInteractionTimeout() {
    // 查找 status=WAITING 且 timeout_at < NOW()
    List<AiWorkflowInteractionEntity> expired = mapper.findExpired();
    for (AiWorkflowInteractionEntity interaction : expired) {
        interaction.setStatus("TIMEOUT");
        interaction.setFeedback_action("__timeout");
        // 恢复工作流走超时分支
        workflowResumeService.resumeWithTimeout(interaction);
        // Chat中显示超时提示
        contentService.saveSystemMessage(interaction.getConversation_id(),
            "⏱ 操作已超时，工作流将继续执行默认流程");
    }
}
```

## 5. 前端设计

### 5.1 AiPageRouter — 页面导航器

位置：`src/components/70_ai/components/navigator/AiPageRouter.js`

接收 `open_page_command` 指令，执行导航：

```javascript
// open_page_command 格式
{
  "route": "/po/order",
  "page_mode": "list",          // list | new | view | edit | approve
  "query_params": {             // page_mode=list 时
    "supplier_name": "供应商A",
    "status": "待审批"
  },
  "form_data": { ... },         // page_mode=new 时
  "record_id": 12345            // page_mode=view/edit/approve 时
}
```

执行流程：
1. 权限校验（通过Vuex permission模块检查路由权限）
2. 显示加载浮层
3. `$router.push({ path: route, query: { _ai: '1', ...query_params } })`
4. 等待页面mounted完成
5. 根据page_mode执行后续操作（填充查询/切换Tab）
6. 关闭加载浮层

### 5.2 AiLoadingOverlay — 加载浮层

位置：`src/components/70_ai/components/navigator/AiLoadingOverlay.vue`

全局挂载在App.vue中，半透明遮罩 + 居中提示：
- 显示："🤖 请稍候，正在打开页面..."
- z-index高于业务页面，低于Chat面板
- 超过10秒显示"加载超时，请重试"
- 页面加载完成后自动消失

### 5.3 AiInteractionManager — 交互状态管理器

位置：`src/components/70_ai/components/interaction/AiInteractionManager.js`

交互状态机：
```
WAITING → SUBMITTED（用户响应）
       → TIMEOUT（超时）
       → CANCELLED（取消）
```

职责：
- 接收 `interaction_request`，创建交互状态
- 启动前端倒计时（与后端timeout_at同步）
- 用户操作后，通过Chat消息发送反馈
- 状态持久化到Vuex + sessionStorage（刷新恢复）

### 5.4 Chat交互组件

位置：`src/components/70_ai/components/interaction/`

三种交互组件：

**AiUserSelect.vue** — 用户选择
```
┌─────────────────────────────────┐
│ 🤖 查询到3条记录，请选择：        │
│ ┌─────────────────────────────┐ │
│ │ ○ PO-001 供应商A ¥5,000    │ │
│ │ ● PO-002 供应商B ¥8,000    │ │
│ │ ○ PO-003 供应商C ¥3,200    │ │
│ └─────────────────────────────┘ │
│ [确认选择]  [取消]  ⏱ 29:45     │
└─────────────────────────────────┘
```

**AiUserConfirm.vue** — 用户确认
```
┌─────────────────────────────────┐
│ 🤖 确认审批通过订单 PO-002？     │
│ [确认审批]  [驳回]  [取消]       │
│ ⏱ 29:45                        │
└─────────────────────────────────┘
```

**AiUserForm.vue** — 用户表单
```
┌─────────────────────────────────┐
│ 🤖 请补充以下信息：              │
│ 审批意见：[____________]         │
│ 调整金额：[____________]         │
│ [提交]  [取消]  ⏱ 29:45         │
└─────────────────────────────────┘
```

### 5.5 aiChatService.js 回调增强

```javascript
sendMessageStream(params, {
  // 现有回调
  onStart: () => {},
  onContent: (chunk) => {},
  onComplete: (content, response) => {},
  onError: (error) => {},
  onOpenPage: ({ url, target }) => {},       // 现有：MCP工具触发弹窗
  onNodeEvent: (event) => {},                // 现有：节点事件

  // 新增回调
  onOpenPageCommand: (command) => {},        // 新增：RouterTab页面导航
  onInteractionRequest: (request) => {},     // 新增：人机交互请求
})
```

### 5.6 新增文件清单

```
src/components/70_ai/
├── components/
│   ├── navigator/
│   │   ├── AiPageRouter.js              # 页面导航器
│   │   └── AiLoadingOverlay.vue         # 加载浮层
│   ├── interaction/
│   │   ├── AiInteractionManager.js      # 交互状态管理器
│   │   ├── AiUserSelect.vue             # 选择交互组件
│   │   ├── AiUserConfirm.vue            # 确认交互组件
│   │   └── AiUserForm.vue               # 表单交互组件
```

## 6. 前后端数据流对齐

### 6.1 SSE事件字段映射

| 后端 ChatResponseVo 字段 | 前端接收字段 | 格式 | 说明 |
|--------------------------|-------------|------|------|
| `open_page_command` | `chatResponse.open_page_command` | JSON字符串 | 新增：RouterTab导航指令 |
| `interaction_request` | `chatResponse.interaction_request` | JSON字符串 | 新增：交互请求 |
| `isWaitingInput` | `chatResponse.isWaitingInput` | Boolean | 现有：等待输入标志 |
| `ai_open_dialog_para` | `chatResponse.ai_open_dialog_para` | JSON字符串 | 现有：弹窗模式 |

### 6.2 open_page_command JSON结构

```json
{
  "route": "/po/order",
  "page_mode": "list",
  "query_params": {"supplier_name": "供应商A", "status": "待审批"},
  "form_data": null,
  "record_id": null
}
```

### 6.3 interaction_request JSON结构

```json
{
  "interaction_uuid": "int_001",
  "type": "user_select",
  "description": "查询到3条待审批订单，请选择：",
  "params": {
    "options": [
      {"key": "1", "label": "PO-001 供应商A ¥5,000", "data": {"id": 1, "code": "PO-001"}}
    ]
  },
  "timeout_minutes": 30,
  "timeout_at": "2026-03-06T10:30:00"
}
```

### 6.4 反馈回传（前端→后端）

用户操作后，通过现有Chat消息通道发送反馈：

```javascript
// 前端发送（复用sendMessageStream）
{
  conversationId: "conv_001",
  prompt: JSON.stringify({
    type: "ai_interaction_feedback",
    interaction_uuid: "int_001",
    action: "select_record",
    data: { id: 456, code: "PO-002" }
  })
}
```

后端接收时，检测 `workflow_state = WORKFLOW_WAITING_INPUT`，解析为交互反馈而非普通消息。

## 7. 端到端时序（完整场景）

场景：AI帮用户查找采购订单并审批

```
T0  用户Chat输入："帮我查供应商A的待审批采购订单"
T1  后端：路由选择工作流 → 执行OpenPageNode
T2  后端：OpenPageNode生成指令：
    - open_page_command: {route:"/po/order", page_mode:"list", query_params:{...}}
    - interaction_request: {type:"user_select", options:[...]}
    - 创建 ai_workflow_interaction 记录(WAITING)
    - workflow_state → WORKFLOW_WAITING_INPUT
T3  SSE推送 → 前端接收
T4  前端AiPageRouter：显示加载浮层 → 导航到采购订单页 → 填充查询 → 关闭浮层
T5  前端Chat面板：渲染AiUserSelect交互组件（3条记录选项）
T6  用户选择PO-002，点击"确认选择"
T7  前端：发送反馈消息到 /chat/stream
T8  后端：检测WAITING_INPUT → 解析反馈 → 更新interaction(SUBMITTED)
T9  后端：恢复工作流 → 执行下一个OpenPageNode(mode:approve, record_id:456)
T10 SSE推送 → 前端：切换到审批Tab，加载PO-002
T11 Chat面板：渲染AiUserConfirm（确认审批？）
T12 用户点击"确认审批"
T13 反馈回传 → 工作流继续 → 调用审批API → 完成
T14 Chat显示："✅ 采购订单 PO-002 已审批通过"

超时场景：
T6' 用户30分钟未操作
T7' 后端定时任务：检测超时 → 更新interaction(TIMEOUT)
T8' 恢复工作流走__timeout分支
T9' Chat显示："⏱ 操作已超时，工作流将继续执行默认流程"
```

## 8. 设计参考来源

| 参考项目 | 采纳的设计 |
|---------|-----------|
| Spring AI Alibaba | InterruptableAction中断模式、HUMAN_FEEDBACK恢复机制、Graph工作流引擎 |
| Dify | 交互状态生命周期(WAITING/SUBMITTED/TIMEOUT)、超时分支(__timeout)、数据库持久化 |
| FastGPT | Chat面板交互式消息(UserSelect/FormInput)、反馈作为聊天消息回传 |
| Spring AI | Advisor Chain拦截模式（未直接采用，但影响了架构思路） |

## 9. 与现有代码的集成影响

| 现有模块 | 改动 | 说明 |
|---------|------|------|
| `aiChatService.js` | 小改 | 增加open_page_command和interaction_request解析 |
| `chat.js` (Vuex) | 中改 | 增加交互状态管理 |
| `ChatPanel.vue` | 中改 | 渲染交互式消息组件 |
| `MessageList.vue` | 中改 | 增加交互式消息类型渲染 |
| `OpenPageNode.vue` (前端工作流编辑器) | 小改 | 增加route模式和交互配置项 |
| `OpenPageNode.java` (后端节点) | 中改 | 增加route模式执行逻辑 |
| `ChatResponseVo.java` | 小改 | 增加2个字段 |
| `WorkflowEventAdapter.java` | 小改 | 适配新字段 |
| RouterTab / 业务页面 | **无改动** | 通过$router.push正常使用 |
