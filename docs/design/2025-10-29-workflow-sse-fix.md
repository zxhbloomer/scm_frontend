# 工作流SSE流式对话修复方案

**日期**: 2025-10-29
**优先级**: P0
**审批状态**: ✅ 已批准

---

## 问题诊断

### 现象
- 点击工作流"运行"按钮后报500错误
- 控制台错误：`TypeError: Cannot read properties of undefined (reading 'data')`
- 工作流执行功能完全不可用

### 根本原因
前端将SSE事件流当成Promise同步响应处理，违反了SSE的事件驱动本质。

**错误代码** (WorkflowRuntimeList.vue:370-437):
```javascript
// ❌ 致命错误：把SSE流当Promise处理
const response = await workflowRun({ wfUuid, input })
const runtime = { ...response.data }  // response.data根本不存在
```

### 调用链路分析
```
用户点击"运行"
  → WorkflowRuntimeList.handleRunWorkflow()  ← 💣 这里坏了
    → workflowService.workflowRun()          ← 实现正确
      → 后端 WorkflowController.run()        ← 实现正确
        → SseEmitter 流式返回
```

---

## Linus式5层问题分解

### 第1层：数据结构分析
> "Bad programmers worry about the code. Good programmers worry about data structures."

**核心数据**：SSE事件流
- 不是请求-响应对，是事件序列
- 事件类型：`[START] → [NODE_RUN_xxx] → [NODE_CHUNK_xxx] → [DONE]/[ERROR]`
- 每个事件独立到达，不能用Promise的`.data`访问

**根本问题**：把**流（Stream）**当成**值（Value）**处理

### 第2层：特殊情况识别
> "好代码没有特殊情况"

当前代码隐含一个错误假设："SSE是同步的"
- 这不是业务逻辑，是**设计错误**
- 解决方案：消除同步假设，改用事件驱动的回调函数

### 第3层：复杂度审查
> "如果实现需要超过3层缩进，重新设计它"

**功能本质**（一句话）：
> 监听工作流执行的SSE事件流，在不同事件到达时更新UI

**当前方案复杂度**：
- ❌ Promise + async/await + try-catch + response.data（4个概念，不work）

**正确方案复杂度**：
- ✅ 回调函数（1个概念）

### 第4层：破坏性分析
> "Never break userspace"

**影响范围**：
- ❌ 后端 `WorkflowController.run()` - 不受影响
- ❌ 其他API调用 - 不受影响
- ❌ Vuex store - 不受影响

**结论**：零破坏性，因为当前功能本来就坏了

### 第5层：实用性验证
> "Theory and practice sometimes clash. Theory loses."

- ✅ 生产环境真实存在
- ✅ 所有使用工作流的用户都遇到
- ✅ 解决方案复杂度与问题严重性匹配（P0 bug，改1个函数）

---

## KISS原则验证

1. **"这是个真问题还是臆想出来的?"**
   - ✅ 真问题，用户点按钮就500

2. **"有更简单的方法吗?"**
   - ✅ 已经是最简：复制知识库对话的回调方案

3. **"会破坏什么吗?"**
   - ✅ 零破坏，只修改1个坏掉的函数

4. **"当前项目真的需要这个功能吗?"**
   - ✅ 需要，工作流是核心功能

---

## 解决方案

### 核心判断
**✅ 值得做**

**品味评分**：🔴 垃圾（当前代码） → 🟢 好品味（修复后）

### 修改文件清单

| 文件 | 修改类型 | 工作量 | 优先级 |
|------|---------|--------|--------|
| WorkflowRuntimeList.vue | 重构 | 中 | P0 |
| workflowService.js | 小调整 | 低 | P1 |
| WorkflowController.java | 无需修改 | 无 | - |

### 关键代码对比

**Before（垃圾）**:
```javascript
async handleRunWorkflow (inputs) {
  const input = {}  // ❌ 后端期望数组
  inputs.forEach(item => { input[item.name] = item.content })

  const response = await workflowRun({ wfUuid, input })  // ❌ SSE不是Promise
  const runtime = { ...response.data }  // ❌ response.data不存在
}
```

**After（好品味）**:
```javascript
handleRunWorkflow (inputs) {
  const inputList = inputs.map(item => ({  // ✅ 数组格式
    name: item.name,
    content: item.content
  }))

  const controller = new AbortController()

  workflowRun({  // ✅ 事件驱动
    wfUuid: this.workflow.workflowUuid,
    inputs: inputList,
    signal: controller.signal,
    startCallback: (data) => { /* 创建runtime */ },
    messageReceived: (chunk, event) => { /* 更新节点状态 */ },
    doneCallback: (data) => { /* 标记完成 */ },
    errorCallback: (error) => { /* 显示错误 */ }
  })
}
```

---

## 实施步骤

### Phase 1: 代码修改
1. ✅ 修改 `workflowService.js` - 参数名 `uuid` → `wfUuid`
2. ✅ 重写 `WorkflowRuntimeList.vue` 的 `handleRunWorkflow()` 函数
3. ✅ 添加 `currentController` 数据属性（用于取消连接）
4. ✅ 添加 `beforeDestroy` 钩子（清理连接）

### Phase 2: 验证测试
1. 编译无错误
2. 点击"运行"按钮不再报500
3. 控制台能看到SSE事件输出
4. 聊天区域正确显示runtime卡片
5. 工作流执行完成后显示成功提示

---

## 风险分析

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 修改后仍报错 | 极低 | 中 | 知识库对话已验证方案可行 |
| 破坏其他功能 | 零 | - | 只改1个函数，不影响其他 |
| SSE连接失败 | 低 | 中 | errorCallback捕获错误 |
| 内存泄漏 | 低 | 中 | beforeDestroy中abort连接 |

---

## 参考实现

### 正确的SSE处理（知识库对话）
**文件**: `src/components/70_ai/api/ragService.js` (lines 43-153)
- 使用原生fetch + ReadableStream
- 通过回调函数处理事件：`onStart`, `onContent`, `onComplete`, `onError`

### aideepin原始实现
**文件**: `99_tools/aideepin/langchain4j-aideepin-web/src/views/workflow/components/RunDetail.vue` (lines 122-143)
- 使用相同的回调模式
- 已验证在生产环境稳定运行

### 后端正确实现
**文件**: `scm-ai/src/main/java/com/xinyirun/scm/ai/controller/workflow/WorkflowController.java` (lines 175-187)
- 返回 `SseEmitter` 流
- 接收 `List<JSONObject>` 参数
- 无需修改

---

## 完成标志

- [x] 方案文档已保存
- [ ] workflowService.js修改完成
- [ ] WorkflowRuntimeList.vue修改完成
- [ ] 编译无错误
- [ ] 功能测试通过
- [ ] SSE事件流正常

---

**审批**: ✅ 已批准（2025-10-29）
**实施人**: zzxxhh
**预计完成时间**: 30分钟
