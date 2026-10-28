# 人机交互弹窗改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将4种人机交互组件（confirm/select/table_select/form）从内联渲染改为 el-dialog 弹窗。

**Architecture:** 方案C——每个组件自治，各自包含 el-dialog，通过 `visible` prop 控制显隐。MessageList.vue 删除内联渲染区域，改为同时挂载4个 dialog 组件（始终挂载，靠 visible 控制显隐）。

**Tech Stack:** Vue 2.7, Element UI 2.x, Vuex

**Spec:** `docs/superpowers/specs/2026-03-19-human-interaction-dialog-design.md`

---

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/components/70_ai/components/interaction/AiUserConfirm.vue` | 改造为 el-dialog |
| `src/components/70_ai/components/interaction/AiUserSelect.vue` | 改造为 el-dialog |
| `src/components/70_ai/components/interaction/AiUserTableSelect.vue` | 改造为 el-dialog |
| `src/components/70_ai/components/interaction/AiUserForm.vue` | 改造为 el-dialog |
| `src/components/70_ai/components/chat/messages/MessageList.vue` | 删除内联区域，挂载4个 dialog |

---

## Task 1: 改造 AiUserConfirm.vue

**Files:**
- Modify: `src/components/70_ai/components/interaction/AiUserConfirm.vue`

- [ ] **Step 1: 完整替换 AiUserConfirm.vue**

将文件内容替换为：

```vue
<template>
  <el-dialog
    :visible.sync="localVisible"
    title="请确认"
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div class="ai-interaction-desc">{{ interaction.description }}</div>
    <div v-if="detail" class="ai-confirm-detail">{{ detail }}</div>
    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="small"
        :disabled="submitted"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
      <el-button
        type="warning"
        size="small"
        :disabled="submitted"
        @click="handleReject"
      >
        驳回
      </el-button>
      <el-button
        size="small"
        :disabled="submitted"
        @click="handleCancel"
      >
        取消
      </el-button>
      <span class="ai-countdown">{{ formattedTime }}</span>
    </span>
  </el-dialog>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserConfirm',

  props: {
    visible: { type: Boolean, default: false },
    interaction: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      localVisible: false,
      submitted: false
    }
  },

  computed: {
    confirmText () {
      return (this.interaction.params && this.interaction.params.confirm_text) || '确认'
    },
    detail () {
      return this.interaction.params && this.interaction.params.detail
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  watch: {
    visible (val) {
      this.localVisible = val
      if (val) {
        this.submitted = false
      }
    }
  },

  methods: {
    handleConfirm () {
      if (this.submitted) return
      this.submitted = true
      this.$emit('submit', 'confirm', { confirmed: true })
    },
    handleReject () {
      if (this.submitted) return
      this.submitted = true
      this.$emit('submit', 'reject', { confirmed: false })
    },
    handleCancel () {
      if (this.submitted) return
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-interaction-desc {
  font-size: 13px;
  color: #303133;
  margin-bottom: 10px;
}
.ai-confirm-detail {
  font-size: 12px;
  color: #606266;
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}
.dialog-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-countdown {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}
</style>
```

- [ ] **Step 2: 验证文件保存正确**

检查文件内容，确认：
- `el-dialog` 有 `append-to-body`、`close-on-click-modal="false"`、`close-on-press-escape="false"`
- `handleCancel` 有 `if (this.submitted) return` 守卫
- `visible` watcher 在 `val === true` 时重置 `submitted = false`
- prop `interaction` 使用 `default: () => ({})`，不用 `required: true`

- [ ] **Step 3: Commit**

```bash
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend add src/components/70_ai/components/interaction/AiUserConfirm.vue
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend commit -m "feat(ai): AiUserConfirm改为el-dialog弹窗"
```

---

## Task 2: 改造 AiUserSelect.vue

**Files:**
- Modify: `src/components/70_ai/components/interaction/AiUserSelect.vue`

- [ ] **Step 1: 完整替换 AiUserSelect.vue**

```vue
<template>
  <el-dialog
    :visible.sync="localVisible"
    title="请选择"
    width="480px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div class="ai-interaction-desc">{{ interaction.description }}</div>
    <el-radio-group v-model="selectedKey" class="ai-select-options">
      <el-radio
        v-for="option in options"
        :key="option.key"
        :label="option.key"
        class="ai-select-option"
      >
        {{ option.label }}
      </el-radio>
    </el-radio-group>
    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="small"
        :disabled="!selectedKey || submitted"
        @click="handleSubmit"
      >
        确认选择
      </el-button>
      <el-button
        size="small"
        :disabled="submitted"
        @click="handleCancel"
      >
        取消
      </el-button>
      <span class="ai-countdown">{{ formattedTime }}</span>
    </span>
  </el-dialog>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserSelect',

  props: {
    visible: { type: Boolean, default: false },
    interaction: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      localVisible: false,
      selectedKey: '',
      submitted: false
    }
  },

  computed: {
    options () {
      return (this.interaction.params && this.interaction.params.options) || []
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  watch: {
    visible (val) {
      this.localVisible = val
      if (val) {
        this.submitted = false
        this.selectedKey = ''
      }
    }
  },

  methods: {
    handleSubmit () {
      if (!this.selectedKey || this.submitted) return
      this.submitted = true
      const selected = this.options.find(o => o.key === this.selectedKey)
      const submitData = {
        ...(selected && selected.data ? selected.data : {}),
        key: this.selectedKey,
        label: selected ? selected.label : this.selectedKey
      }
      this.$emit('submit', 'select_record', submitData)
    },
    handleCancel () {
      if (this.submitted) return
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-interaction-desc {
  font-size: 13px;
  color: #303133;
  margin-bottom: 10px;
}
.ai-select-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ai-select-option {
  margin-right: 0;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}
.dialog-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-countdown {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}
</style>
```

- [ ] **Step 2: 验证**

确认：
- `visible` watcher 在 `val === true` 时同时重置 `submitted = false` 和 `selectedKey = ''`
- `handleCancel` 有 `if (this.submitted) return` 守卫

- [ ] **Step 3: Commit**

```bash
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend add src/components/70_ai/components/interaction/AiUserSelect.vue
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend commit -m "feat(ai): AiUserSelect改为el-dialog弹窗"
```

---

## Task 3: 改造 AiUserTableSelect.vue

**Files:**
- Modify: `src/components/70_ai/components/interaction/AiUserTableSelect.vue`

- [ ] **Step 1: 完整替换 AiUserTableSelect.vue**

```vue
<template>
  <el-dialog
    :visible.sync="localVisible"
    title="请选择"
    width="700px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div class="ai-interaction-desc">{{ interaction.description }}</div>

    <el-table
      :data="tableData"
      :highlight-current-row="true"
      size="small"
      border
      style="width: 100%"
      @current-change="handleRowSelect"
    >
      <template v-if="columns.length === 0">
        <el-table-column prop="label" label="名称" />
      </template>
      <template v-else>
        <el-table-column
          v-for="col in columns"
          :key="col.key"
          :prop="col.key"
          :label="col.label"
          :width="col.width || ''"
        />
      </template>
    </el-table>

    <div v-if="tableData.length === 0" class="ai-table-empty">暂无数据</div>

    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="small"
        :disabled="!selectedRow || submitted"
        @click="handleSubmit"
      >
        确认选择
      </el-button>
      <el-button
        size="small"
        :disabled="submitted"
        @click="handleCancel"
      >
        取消
      </el-button>
      <span class="ai-countdown">{{ formattedTime }}</span>
    </span>
  </el-dialog>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserTableSelect',

  props: {
    visible: { type: Boolean, default: false },
    interaction: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      localVisible: false,
      selectedRow: null,
      submitted: false
    }
  },

  computed: {
    columns () {
      return (this.interaction.params && this.interaction.params.columns) || []
    },
    options () {
      return (this.interaction.params && this.interaction.params.options) || []
    },
    tableData () {
      return this.options.map(opt => ({
        _key: opt.key,
        _label: opt.label,
        ...(opt.data || {}),
        label: opt.label
      }))
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  watch: {
    visible (val) {
      this.localVisible = val
      if (val) {
        this.submitted = false
        this.selectedRow = null
      }
    }
  },

  methods: {
    handleRowSelect (row) {
      this.selectedRow = row
    },
    handleSubmit () {
      if (!this.selectedRow || this.submitted) return
      this.submitted = true
      const submitData = {
        ...this.selectedRow,
        key: this.selectedRow._key,
        label: this.selectedRow._label
      }
      delete submitData._key
      delete submitData._label
      this.$emit('submit', 'select_record', submitData)
    },
    handleCancel () {
      if (this.submitted) return
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-interaction-desc {
  font-size: 13px;
  color: #303133;
  margin-bottom: 10px;
}
.ai-table-empty {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 16px 0;
}
.dialog-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-countdown {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}
</style>
```

- [ ] **Step 2: 验证**

确认：
- `visible` watcher 在 `val === true` 时同时重置 `submitted = false` 和 `selectedRow = null`
- `handleCancel` 有 `if (this.submitted) return` 守卫

- [ ] **Step 3: Commit**

```bash
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend add src/components/70_ai/components/interaction/AiUserTableSelect.vue
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend commit -m "feat(ai): AiUserTableSelect改为el-dialog弹窗"
```

---

## Task 4: 改造 AiUserForm.vue

**Files:**
- Modify: `src/components/70_ai/components/interaction/AiUserForm.vue`

- [ ] **Step 1: 完整替换 AiUserForm.vue**

```vue
<template>
  <el-dialog
    :visible.sync="localVisible"
    title="请填写"
    width="520px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div class="ai-interaction-desc">{{ interaction.description }}</div>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-position="top"
      size="small"
    >
      <el-form-item
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :prop="field.key"
      >
        <el-input
          v-if="field.type === 'text' || field.type === 'textarea'"
          v-model="formData[field.key]"
          :type="field.type === 'textarea' ? 'textarea' : 'text'"
          :rows="field.type === 'textarea' ? 3 : undefined"
          :placeholder="'请输入' + field.label"
        />
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.key]"
          :placeholder="'请输入' + field.label"
          style="width: 100%"
        />
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.key]"
          :placeholder="'请选择' + field.label"
          style="width: 100%"
        >
          <el-option
            v-for="opt in (field.options || [])"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-input
          v-else
          v-model="formData[field.key]"
          :placeholder="'请输入' + field.label"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="small"
        :disabled="submitted"
        @click="handleSubmit"
      >
        提交
      </el-button>
      <el-button
        size="small"
        :disabled="submitted"
        @click="handleCancel"
      >
        取消
      </el-button>
      <span class="ai-countdown">{{ formattedTime }}</span>
    </span>
  </el-dialog>
</template>

<script>
import { formatRemainingTime } from './AiInteractionManager'

export default {
  name: 'AiUserForm',

  props: {
    visible: { type: Boolean, default: false },
    interaction: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      localVisible: false,
      formData: {},
      formRules: {},
      submitted: false
    }
  },

  computed: {
    fields () {
      return (this.interaction.params && this.interaction.params.fields) || []
    },
    formattedTime () {
      return formatRemainingTime(this.interaction.remainingSeconds)
    }
  },

  watch: {
    visible (val) {
      this.localVisible = val
      if (val) {
        this.submitted = false
        this.initFormData()
      }
    },
    // interaction 变化时重新初始化（防止父组件先设 visible 后更新 interaction 的时序问题）
    interaction (val) {
      if (val && this.localVisible) {
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
      // 清除上一次的校验状态
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    handleSubmit () {
      if (this.submitted) return
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.submitted = true
        this.$emit('submit', 'form_submit', { ...this.formData })
      })
    },
    handleCancel () {
      if (this.submitted) return
      this.submitted = true
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ai-interaction-desc {
  font-size: 13px;
  color: #303133;
  margin-bottom: 10px;
}
.dialog-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-countdown {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}
</style>
```

- [ ] **Step 2: 验证**

确认：
- `visible` watcher 在 `val === true` 时调用 `initFormData()`
- `initFormData` 末尾有 `$nextTick` 调用 `clearValidate()`
- `handleCancel` 有 `if (this.submitted) return` 守卫

- [ ] **Step 3: Commit**

```bash
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend add src/components/70_ai/components/interaction/AiUserForm.vue
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend commit -m "feat(ai): AiUserForm改为el-dialog弹窗"
```

---

## Task 5: 改造 MessageList.vue

**Files:**
- Modify: `src/components/70_ai/components/chat/messages/MessageList.vue`

- [ ] **Step 1: 删除内联渲染区域**

找到并删除第332-358行的 `ai-interaction-area` div（含内部所有子组件）：

```html
<!-- 删除这整段 -->
<div v-if="activeInteraction && activeInteraction.status === 'WAITING'" class="ai-interaction-area">
  <ai-user-select
    v-if="activeInteraction.type === 'user_select'"
    :interaction="activeInteraction"
    @submit="handleInteractionSubmit"
    @cancel="handleInteractionCancel"
  />
  <ai-user-confirm
    v-else-if="activeInteraction.type === 'user_confirm'"
    :interaction="activeInteraction"
    @submit="handleInteractionSubmit"
    @cancel="handleInteractionCancel"
  />
  <ai-user-form
    v-else-if="activeInteraction.type === 'user_form'"
    :interaction="activeInteraction"
    @submit="handleInteractionSubmit"
    @cancel="handleInteractionCancel"
  />
  <ai-user-table-select
    v-else-if="activeInteraction.type === 'user_table_select'"
    :interaction="activeInteraction"
    @submit="handleInteractionSubmit"
    @cancel="handleInteractionCancel"
  />
</div>
```

- [ ] **Step 2: 在 messages-wrapper 结束标签前插入4个 dialog 组件**

在 `</div><!-- end messages-wrapper -->` 之前（即 `<!-- 正在输入指示器 -->` 注释之前）插入：

```html
<!-- 人机交互弹窗（4个同时挂载，各自通过 visible 控制显隐） -->
<ai-user-confirm
  :visible="interactionVisibleFor('user_confirm')"
  :interaction="activeInteraction || {}"
  @submit="handleInteractionSubmit"
  @cancel="handleInteractionCancel"
/>
<ai-user-select
  :visible="interactionVisibleFor('user_select')"
  :interaction="activeInteraction || {}"
  @submit="handleInteractionSubmit"
  @cancel="handleInteractionCancel"
/>
<ai-user-form
  :visible="interactionVisibleFor('user_form')"
  :interaction="activeInteraction || {}"
  @submit="handleInteractionSubmit"
  @cancel="handleInteractionCancel"
/>
<ai-user-table-select
  :visible="interactionVisibleFor('user_table_select')"
  :interaction="activeInteraction || {}"
  @submit="handleInteractionSubmit"
  @cancel="handleInteractionCancel"
/>
```

- [ ] **Step 3: 在 computed 中添加 interactionVisibleFor**

在 `computed` 块中，找到 `activeInteraction` computed 之后，添加：

```js
interactionVisibleFor () {
  return (type) => !!(this.activeInteraction &&
    this.activeInteraction.type === type &&
    this.activeInteraction.status === 'WAITING')
},
```

- [ ] **Step 4: 删除 ai-interaction-area 的 CSS（如有）**

在 `<style>` 块中搜索 `.ai-interaction-area`，如果存在则删除该样式规则。

- [ ] **Step 5: 验证模板和 computed 正确**

检查：
- 模板中不再有 `ai-interaction-area` div
- 4个 dialog 组件已挂载，使用 `interactionVisibleFor(...)` 控制 visible
- `interactionVisibleFor` computed 已添加到 computed 块
- import 语句不需要改动（4个组件路径不变）

- [ ] **Step 6: Commit**

```bash
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend add src/components/70_ai/components/chat/messages/MessageList.vue
git -C D:/2025_project/20_project_in_github/01_scm_frontend/scm_frontend commit -m "feat(ai): MessageList改为挂载4个人机交互dialog组件"
```

---

## 验收标准

完成所有 Task 后，手动验证：

1. 触发一个 `user_confirm` 类型的人机交互 → 应弹出 400px 宽的确认弹窗，不再内联在消息流末尾
2. 触发一个 `user_select` 类型 → 应弹出 480px 宽的 radio 选择弹窗
3. 触发一个 `user_table_select` 类型 → 应弹出 700px 宽的表格选择弹窗
4. 触发一个 `user_form` 类型 → 应弹出 520px 宽的表单填写弹窗
5. 点击弹窗右上角 X → 触发 cancel，流程正常中断
6. 连续触发两次同类型交互 → 第二次弹窗打开时，上一次的选择/输入已清空
