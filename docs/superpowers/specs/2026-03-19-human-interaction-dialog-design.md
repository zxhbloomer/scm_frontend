# 人机交互弹窗改造设计文档

> **For agentic workers:** Use superpowers:executing-plans to implement this spec.

**Goal:** 将4种人机交互组件从内联渲染改为 el-dialog 弹窗，提升交互体验。

**Architecture:** 方案C——每个交互组件自治，各自包含 el-dialog，通过 `visible` prop 控制显隐。MessageList.vue 删除内联渲染区域，改为同时挂载4个 dialog 组件。

**Tech Stack:** Vue 2.7, Element UI 2.x, Vuex

---

## 现状

4种人机交互组件全部内联渲染在消息列表末尾（`MessageList.vue` 第332-358行的 `ai-interaction-area` div）：

| 类型 | 组件 | 当前形态 |
|------|------|---------|
| `user_confirm` | `AiUserConfirm.vue` | 内联按钮组 |
| `user_select` | `AiUserSelect.vue` | 内联 radio 列表 |
| `user_table_select` | `AiUserTableSelect.vue` | 内联 el-table |
| `user_form` | `AiUserForm.vue` | 内联 el-form |

## 目标

所有人机交互类型改为 el-dialog 弹窗，不再内联在消息流中。

## 文件变更范围

**改造（原地修改，路径不变）：**
- `src/components/70_ai/components/interaction/AiUserConfirm.vue`
- `src/components/70_ai/components/interaction/AiUserSelect.vue`
- `src/components/70_ai/components/interaction/AiUserTableSelect.vue`
- `src/components/70_ai/components/interaction/AiUserForm.vue`

**修改：**
- `src/components/70_ai/components/chat/messages/MessageList.vue`

**不动：**
- `src/components/70_ai/components/interaction/AiInteractionManager.js`
- `src/components/70_ai/store/modules/chat.js`
- 所有后端文件

---

## 组件改造规范

### 统一 el-dialog 配置

每个组件的 el-dialog 必须包含以下属性：

```html
<el-dialog
  :visible.sync="localVisible"
  :title="dialogTitle"
  :width="dialogWidth"
  append-to-body
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  @close="handleCancel"
>
```

- `append-to-body`：防止被父容器 overflow/z-index 裁剪
- `close-on-click-modal="false"`：防止误触遮罩关闭（交互需要明确操作）
- `close-on-press-escape="false"`：防止 ESC 误关
- `@close`：触发 cancel 逻辑，发送 cancel 反馈消息

### visible 管理

组件接收 `visible` prop（Boolean），内部用 `localVisible` data 同步：

```js
props: {
  visible: { type: Boolean, default: false },
  interaction: { type: Object, default: () => ({}) }  // 不用 required，避免始终挂载时的 prop 警告
},
watch: {
  visible (val) {
    this.localVisible = val
    if (val) {
      // 弹窗重新打开时，重置所有交互状态（防止跨交互数据污染）
      this.submitted = false
      // AiUserSelect 需额外重置：this.selectedKey = ''
      // AiUserTableSelect 需额外重置：this.selectedRow = null
      // AiUserForm 需额外调用：this.initFormData()
    }
  }
}
```

不使用 `.sync` 修饰符向上传递 visible 变化（关闭由 `@close` 触发 cancel 事件处理）。

**重要**：由于4个组件始终挂载，`visible` watcher 的 `val === true` 分支必须重置所有本地状态，否则上一次交互的数据会污染下一次：

| 组件 | 必须重置的字段 |
|------|--------------|
| `AiUserConfirm` | `submitted = false` |
| `AiUserSelect` | `submitted = false`、`selectedKey = ''` |
| `AiUserTableSelect` | `submitted = false`、`selectedRow = null` |
| `AiUserForm` | `submitted = false`、调用 `initFormData()` |

### @close 与 handleCancel 的双重触发防护

el-dialog 的 `@close` 事件在以下两种路径都会触发：
1. 用户点击右上角 X 按钮
2. `localVisible` 被设为 false（组件内部操作后）

为防止 `handleCancel` 被调用两次（导致 `sendMessage` 发送两次 cancel 消息），**每个组件的 `handleCancel` 方法必须有 `submitted` 守卫**：

```js
handleCancel () {
  if (this.submitted) return  // 防止 @close 双重触发
  this.submitted = true
  this.$emit('cancel')
}
```

现有代码中 `AiUserConfirm` 的 `handleCancel` 没有 `submitted` 守卫（只有 `handleConfirm`/`handleReject` 有），改造时需要补上。

### 各组件差异化配置

| 组件 | dialogTitle | dialogWidth |
|------|-------------|-------------|
| `AiUserConfirm` | 请确认 | 400px |
| `AiUserSelect` | 请选择 | 480px |
| `AiUserTableSelect` | 请选择 | 700px |
| `AiUserForm` | 请填写 | 520px |

### 倒计时显示位置

从底部 footer 移到 dialog 标题右侧（通过 `el-dialog` 的 `title` slot 实现），或保留在 footer 均可，不强制要求。

---

## MessageList.vue 改动

### 删除

```html
<!-- 删除整个 ai-interaction-area div（第332-358行） -->
<div v-if="activeInteraction && activeInteraction.status === 'WAITING'" class="ai-interaction-area">
  <ai-user-select v-if="..." ... />
  <ai-user-confirm v-else-if="..." ... />
  <ai-user-form v-else-if="..." ... />
  <ai-user-table-select v-else-if="..." ... />
</div>
```

### 新增（替换位置，4个 dialog 同时挂载）

```html
<!-- 人机交互弹窗（4个同时挂载，各自通过 visible 控制显隐） -->
<ai-user-confirm
  :visible="isInteractionVisible('user_confirm')"
  :interaction="activeInteraction || {}"
  @submit="handleInteractionSubmit"
  @cancel="handleInteractionCancel"
/>
<ai-user-select
  :visible="isInteractionVisible('user_select')"
  :interaction="activeInteraction || {}"
  @submit="handleInteractionSubmit"
  @cancel="handleInteractionCancel"
/>
<ai-user-form
  :visible="isInteractionVisible('user_form')"
  :interaction="activeInteraction || {}"
  @submit="handleInteractionSubmit"
  @cancel="handleInteractionCancel"
/>
<ai-user-table-select
  :visible="isInteractionVisible('user_table_select')"
  :interaction="activeInteraction || {}"
  @submit="handleInteractionSubmit"
  @cancel="handleInteractionCancel"
/>
```

### 新增 computed

```js
// 返回函数的 computed，响应式正确（内部箭头函数访问 this.activeInteraction，Vue 2 依赖追踪有效）
// 注意：性能与 method 相同（每次调用都执行箭头函数），但函数引用稳定，不触发子组件不必要的 prop 更新
interactionVisibleFor () {
  return (type) => !!(this.activeInteraction &&
    this.activeInteraction.type === type &&
    this.activeInteraction.status === 'WAITING')
}
```

模板中使用：`:visible="interactionVisibleFor('user_confirm')"`

### AiUserForm 特殊处理

`AiUserForm.vue` 在 `data()` 中通过 `this.interaction.params.fields` 初始化 `formData` 和 `formRules`。由于组件始终挂载，初始化时 `interaction` 为空对象，`fields` 为空，`formData` 不含任何字段。

**必须**在 `watch` 中监听 `interaction` 变化，重新初始化 `formData` 和 `formRules`：

```js
watch: {
  visible (val) {
    this.localVisible = val
    if (val) {
      this.submitted = false
      this.initFormData()
    }
  }
},
methods: {
  initFormData () {
    const fields = (this.interaction.params && this.interaction.params.fields) || []
    const formData = {}
    const formRules = {}
    fields.forEach(f => {
      formData[f.key] = f.type === 'number' ? null : ''
      if (f.required) {
        formRules[f.key] = [{ required: true, message: f.label + '不能为空', trigger: 'blur' }]
      }
    })
    this.formData = formData
    this.formRules = formRules
    // 清除上一次的校验状态（el-form 缓存了初始值和 dirty 标记）
    this.$nextTick(() => {
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    })
  }
}
```

`fields` computed 属性已经正确处理显示，只需补充 `formData`/`formRules` 的重新初始化。

```
activeInteraction (Vuex) → MessageList computed → visible prop → el-dialog 显示
用户操作 → @submit/@cancel → handleInteractionSubmit/Cancel → submitFeedback/cancelInteraction → sendMessage
```

数据流与现有实现完全一致，只是渲染形态从内联改为弹窗。

---

## 不在本次范围内

- `user_text` 类型（自由文本）：无对应组件，用聊天框输入，不需要弹窗
- 后端任何改动
- `AiInteractionManager.js` 逻辑改动
- Vuex store 改动
