# Workflow API Contract

**Version**: 1.0
**Date**: 2025-10-21
**Base URL**: `/scm/ai/workflow`

本文档定义前端调用的所有工作流相关后端 API 接口契约。

---

## 1. 工作流管理 API

### 1.1 获取工作流列表

**接口**: `GET /list`

**描述**: 获取用户的工作流列表或公开市场工作流列表

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `type` | String | 是 | 列表类型：`my`（我的工作流）/ `public`（公开市场） |
| `page` | Integer | 否 | 页码，默认 1 |
| `pageSize` | Integer | 否 | 每页数量，默认 20 |
| `keyword` | String | 否 | 搜索关键词（搜索名称和描述） |

**请求示例**:
```http
GET /scm/ai/workflow/list?type=my&page=1&pageSize=20&keyword=客服
```

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "list": [
      {
        "wf_uuid": "wf-uuid-001",
        "name": "客户咨询自动回复",
        "description": "基于知识库自动回答客户问题",
        "is_public": false,
        "creator_id": 123,
        "creator_name": "张三",
        "c_time": "2025-10-21T10:00:00Z",
        "u_time": "2025-10-21T11:30:00Z",
        "node_count": 5,      // 节点数量
        "run_count": 120      // 运行次数
      }
      // ... 更多工作流
    ]
  }
}
```

---

### 1.2 获取工作流详情

**接口**: `GET /{wfUuid}`

**描述**: 获取工作流完整定义，包括节点和连线

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 工作流 UUID |

**请求示例**:
```http
GET /scm/ai/workflow/wf-uuid-001
```

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "workflow": {
      "wf_uuid": "wf-uuid-001",
      "name": "客户咨询自动回复",
      "description": "基于知识库自动回答客户问题",
      "is_public": false,
      "creator_id": 123,
      "creator_name": "张三",
      "c_time": "2025-10-21T10:00:00Z",
      "u_time": "2025-10-21T11:30:00Z",
      "dbversion": 5
    },
    "nodes": [
      {
        "node_uuid": "node-uuid-001",
        "wf_uuid": "wf-uuid-001",
        "component_name": "Start",
        "title": "开始",
        "input_config": [],
        "node_config": {},
        "output_config": [
          {
            "name": "user_input",
            "title": "用户输入",
            "type": 1,
            "required": true
          }
        ],
        "position_x": 100,
        "position_y": 200,
        "dbversion": 1
      }
      // ... 更多节点
    ],
    "edges": [
      {
        "edge_uuid": "edge-uuid-001",
        "wf_uuid": "wf-uuid-001",
        "source_node_uuid": "node-uuid-001",
        "source_handle_id": "out",
        "target_node_uuid": "node-uuid-002",
        "target_handle_id": "in",
        "dbversion": 1
      }
      // ... 更多连线
    ]
  }
}
```

---

### 1.3 创建工作流

**接口**: `POST /create`

**描述**: 创建新的工作流

**请求体**:
```javascript
{
  "name": "新工作流",
  "description": "工作流描述",
  "is_public": false
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `name` | String | 是 | 工作流名称（1-100 字符） |
| `description` | String | 否 | 工作流描述（最多 500 字符） |
| `is_public` | Boolean | 是 | 是否公开 |

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "wf_uuid": "wf-uuid-new",
    "name": "新工作流",
    "description": "工作流描述",
    "is_public": false,
    "creator_id": 123,
    "creator_name": "张三",
    "c_time": "2025-10-21T12:00:00Z",
    "u_time": "2025-10-21T12:00:00Z",
    "dbversion": 1
  }
}
```

---

### 1.4 更新工作流

**接口**: `PUT /{wfUuid}`

**描述**: 更新工作流基本信息

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 工作流 UUID |

**请求体**:
```javascript
{
  "name": "更新后的名称",
  "description": "更新后的描述",
  "is_public": true,
  "dbversion": 5  // 乐观锁版本号
}
```

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "wf_uuid": "wf-uuid-001",
    "dbversion": 6  // 更新后的版本号
  }
}
```

**错误响应** (乐观锁冲突):
```javascript
{
  "code": 409,
  "message": "工作流已被其他用户修改，请刷新后重试",
  "data": null
}
```

---

### 1.5 删除工作流

**接口**: `DELETE /{wfUuid}`

**描述**: 删除工作流（软删除）

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 工作流 UUID |

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**错误响应** (工作流正在运行):
```javascript
{
  "code": 400,
  "message": "工作流正在运行中，无法删除",
  "data": null
}
```

---

### 1.6 复制工作流

**接口**: `POST /{wfUuid}/duplicate`

**描述**: 复制工作流，创建副本

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 源工作流 UUID |

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "wf_uuid": "wf-uuid-new-copy",
    "name": "客户咨询自动回复-副本",
    "description": "基于知识库自动回答客户问题",
    "is_public": false,
    "creator_id": 123,
    "creator_name": "张三",
    "c_time": "2025-10-21T12:30:00Z",
    "u_time": "2025-10-21T12:30:00Z",
    "dbversion": 1
  }
}
```

---

## 2. 工作流设计 API

### 2.1 保存工作流节点和连线（增量保存）

**接口**: `POST /{wfUuid}/save`

**描述**: 增量保存工作流的节点和连线变更

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 工作流 UUID |

**请求体**:
```javascript
{
  "addedNodes": [
    {
      "node_uuid": "node-uuid-new",
      "component_name": "LlmAnswer",
      "title": "AI 回答",
      "input_config": [...],
      "node_config": {...},
      "output_config": [...],
      "position_x": 300,
      "position_y": 200
    }
  ],
  "updatedNodes": [
    {
      "node_uuid": "node-uuid-001",
      "title": "更新后的标题",
      "node_config": {...},
      "position_x": 150,
      "position_y": 250,
      "dbversion": 2
    }
  ],
  "deletedNodeUuids": ["node-uuid-old"],

  "addedEdges": [
    {
      "edge_uuid": "edge-uuid-new",
      "source_node_uuid": "node-uuid-001",
      "source_handle_id": "out",
      "target_node_uuid": "node-uuid-new",
      "target_handle_id": "in"
    }
  ],
  "deletedEdgeUuids": ["edge-uuid-old"]
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `addedNodes` | Array | 否 | 新增的节点列表 |
| `updatedNodes` | Array | 否 | 更新的节点列表 |
| `deletedNodeUuids` | Array | 否 | 删除的节点 UUID 列表 |
| `addedEdges` | Array | 否 | 新增的连线列表 |
| `deletedEdgeUuids` | Array | 否 | 删除的连线 UUID 列表 |

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "savedNodeCount": 2,
    "savedEdgeCount": 1,
    "updatedDbversions": {
      "node-uuid-001": 3,
      "wf-uuid-001": 6
    }
  }
}
```

---

### 2.2 验证工作流

**接口**: `POST /{wfUuid}/validate`

**描述**: 验证工作流的有效性（循环引用、孤立节点、配置完整性）

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 工作流 UUID |

**响应格式** (验证通过):
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "valid": true,
    "errors": []
  }
}
```

**响应格式** (验证失败):
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "valid": false,
    "errors": [
      "工作流包含循环引用，请修正",
      "存在孤立节点：节点A、节点B",
      "LLM 节点 \"AI 回答\" 未选择模型"
    ]
  }
}
```

---

## 3. 工作流组件 API

### 3.1 获取组件库

**接口**: `GET /components`

**描述**: 获取所有可用的工作流组件定义

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "component_name": "Start",
      "title": "开始节点",
      "description": "工作流入口，接收用户输入",
      "icon": "el-icon-video-play",
      "category": "input",
      "is_enabled": true
    },
    {
      "component_name": "LlmAnswer",
      "title": "LLM 回答",
      "description": "使用大语言模型生成文本回答",
      "icon": "el-icon-chat-dot-round",
      "category": "ai",
      "is_enabled": true
    }
    // ... 更多组件
  ]
}
```

---

## 4. 工作流运行 API

### 4.1 运行工作流 (SSE)

**接口**: `POST /{wfUuid}/run` (SSE)

**描述**: 运行工作流并通过 SSE 流式返回执行进度

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 工作流 UUID |

**请求体**:
```javascript
{
  "inputs": [
    {
      "name": "user_question",
      "content": {
        "title": "用户问题",
        "type": 1,
        "value": "如何重置密码？"
      }
    }
  ]
}
```

**SSE 事件流**:

```
event: [START]
data: {"runtime_uuid":"rt-uuid-001","wf_uuid":"wf-uuid-001","status":2}

event: [NODE_RUN_node-uuid-001]
data: {"node_uuid":"node-uuid-001","title":"开始","status":2}

event: [NODE_INPUT_node-uuid-001]
data: {"name":"user_question","content":{"title":"用户问题","type":1,"value":"如何重置密码？"}}

event: [NODE_OUTPUT_node-uuid-001]
data: {"name":"user_input","content":{"title":"用户输入","type":1,"value":"如何重置密码？"}}

event: [NODE_RUN_node-uuid-002]
data: {"node_uuid":"node-uuid-002","title":"知识检索","status":2}

event: [NODE_OUTPUT_node-uuid-002]
data: {"name":"knowledge","content":{"title":"检索结果","type":1,"value":"找到 3 条相关知识..."}}

event: [NODE_RUN_node-uuid-003]
data: {"node_uuid":"node-uuid-003","title":"AI 回答","status":2}

event: [NODE_CHUNK_node-uuid-003]
data: 您可以

event: [NODE_CHUNK_node-uuid-003]
data: 通过以下步骤

event: [NODE_CHUNK_node-uuid-003]
data: 重置密码...

event: [NODE_OUTPUT_node-uuid-003]
data: {"name":"answer","content":{"title":"AI 回答","type":1,"value":"您可以通过以下步骤重置密码..."}}

event: [DONE]
data: {"runtime_uuid":"rt-uuid-001","status":3,"outputs":[...]}
```

**SSE 事件类型说明**:
| 事件名 | 数据格式 | 说明 |
|--------|---------|------|
| `[START]` | WfRuntimeResp JSON | 工作流开始执行 |
| `[NODE_RUN_{nodeUuid}]` | WfRuntimeNodeDto JSON | 节点开始运行 |
| `[NODE_INPUT_{nodeUuid}]` | NodeIOData JSON | 节点输入数据 |
| `[NODE_CHUNK_{nodeUuid}]` | String | 节点流式输出块（LLM） |
| `[NODE_OUTPUT_{nodeUuid}]` | NodeIOData JSON | 节点输出数据 |
| `[NODE_WAIT_FEEDBACK_BY_{nodeUuid}]` | String | 等待用户反馈 |
| `[DONE]` | WfRuntimeResp JSON | 工作流执行完成 |
| `[ERROR]` | String | 工作流执行错误 |

**错误事件示例**:
```
event: [ERROR]
data: HTTP 请求节点执行失败：连接超时
```

**SSE 超时**: 150 秒（2.5 分钟）

---

### 4.2 停止工作流运行

**接口**: `POST /runtime/{runtimeUuid}/stop`

**描述**: 停止正在运行的工作流

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `runtimeUuid` | String | 是 | 运行时 UUID |

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 4.3 提供人工反馈

**接口**: `POST /runtime/{runtimeUuid}/feedback`

**描述**: 为等待反馈的节点提供用户输入

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `runtimeUuid` | String | 是 | 运行时 UUID |

**请求体**:
```javascript
{
  "node_uuid": "node-uuid-005",
  "feedback": "用户反馈内容"
}
```

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 5. 工作流运行历史 API

### 5.1 获取运行历史列表

**接口**: `GET /{wfUuid}/runtime/list`

**描述**: 获取工作流的运行历史记录

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 工作流 UUID |

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `page` | Integer | 否 | 页码，默认 1 |
| `pageSize` | Integer | 否 | 每页数量，默认 20 |
| `status` | Integer | 否 | 状态筛选（1=READY, 2=DOING, 3=SUCCESS, 4=FAIL, 5=WAITING_INPUT） |

**请求示例**:
```http
GET /scm/ai/workflow/wf-uuid-001/runtime/list?page=1&pageSize=20&status=3
```

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "list": [
      {
        "runtime_uuid": "rt-uuid-001",
        "wf_uuid": "wf-uuid-001",
        "status": 3,
        "status_remark": null,
        "start_time": "2025-10-21T10:00:00Z",
        "end_time": "2025-10-21T10:00:15Z",
        "c_time": "2025-10-21T10:00:00Z",
        "duration": 15  // 执行时长（秒）
      }
      // ... 更多运行记录
    ]
  }
}
```

---

### 5.2 获取运行历史详情

**接口**: `GET /runtime/{runtimeUuid}`

**描述**: 获取单次运行的详细信息，包括所有节点的输入输出

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `runtimeUuid` | String | 是 | 运行时 UUID |

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "runtime": {
      "runtime_uuid": "rt-uuid-001",
      "wf_uuid": "wf-uuid-001",
      "user_inputs": [...],
      "outputs": [...],
      "status": 3,
      "status_remark": null,
      "start_time": "2025-10-21T10:00:00Z",
      "end_time": "2025-10-21T10:00:15Z",
      "c_time": "2025-10-21T10:00:00Z"
    },
    "nodes": [
      {
        "runtime_node_uuid": "rn-uuid-001",
        "runtime_uuid": "rt-uuid-001",
        "node_uuid": "node-uuid-001",
        "node_title": "开始",
        "inputs": [...],
        "outputs": [...],
        "status": 3,
        "status_remark": null,
        "start_time": "2025-10-21T10:00:00Z",
        "end_time": "2025-10-21T10:00:02Z"
      }
      // ... 更多节点记录
    ]
  }
}
```

---

### 5.3 删除运行历史

**接口**: `DELETE /runtime/{runtimeUuid}`

**描述**: 删除单条运行历史记录

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `runtimeUuid` | String | 是 | 运行时 UUID |

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 5.4 清空运行历史

**接口**: `DELETE /{wfUuid}/runtime/clear`

**描述**: 清空工作流的所有运行历史记录

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `wfUuid` | String | 是 | 工作流 UUID |

**响应格式**:
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "deletedCount": 50
  }
}
```

---

## 错误码说明

| HTTP 状态码 | code | message | 说明 |
|-----------|------|---------|------|
| 200 | 200 | success | 请求成功 |
| 400 | 400 | 参数错误 | 请求参数验证失败 |
| 401 | 401 | 未授权 | 未登录或 token 过期 |
| 403 | 403 | 无权限 | 无权访问该资源 |
| 404 | 404 | 资源不存在 | 工作流或运行记录不存在 |
| 409 | 409 | 冲突 | 乐观锁冲突，数据已被修改 |
| 500 | 500 | 服务器错误 | 服务器内部错误 |

---

**API Contract 版本**: 1.0
**最后更新**: 2025-10-21
**下一步**: 生成 quickstart.md (快速开始指南)
