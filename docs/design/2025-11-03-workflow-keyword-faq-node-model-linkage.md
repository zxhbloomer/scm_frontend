# 工作流节点模型联动功能实现方案

## 文档信息
- **日期**: 2025-11-03
- **功能**: 关键词提取节点和FAQ提取节点实现模型联动
- **参考**: AnswerNode的模型联动机制
- **影响范围**: 前端4个Vue组件

## 一、问题描述

### 用户反馈
用户指出：
> "你看看大模型节点，节点中的模型和节点属性弹窗中的模型是联动的，注意这个很重要，你要学习，然后排查问题，关键词提起节点、常见问题提取节点，中也有模型的显示，所以也需要和节点属性窗体中的模型进行联动。"

### 当前问题
1. **KeywordExtractorNode（关键词提取节点）**：
   - 属性弹窗可以选择模型
   - 但画布节点显示不会实时更新
   - 需要刷新页面才能看到变化

2. **FaqExtractorNode（FAQ提取节点）**：
   - 属性弹窗可以选择模型
   - 但画布节点显示不会实时更新
   - 需要刷新页面才能看到变化

3. **AnswerNode（大模型节点）**：
   - ✅ 已正确实现模型联动
   - 属性弹窗选择模型后，画布节点实时更新显示

### 问题影响
- 破坏用户体验一致性（不同节点行为不一致）
- 需要刷新页面才能看到更新
- 用户误以为配置未保存

---

## 二、根因分析

### 技术原因

#### AnswerNode的正确实现（参考）

**AnswerNode.vue**（画布节点组件）：
```vue
<script>
export default {
  name: 'AnswerNode',
  inject: ['getNode'],

  data () {
    return {
      // ⭐ 关键1：本地响应式状态
      localModelName: ''
    }
  },

  computed: {
    node () {
      return this.getNode().data
    }
  },

  mounted () {
    // ⭐ 关键2：初始化本地状态
    const node = this.getNode()
    this.localModelName = node.data.nodeConfig?.model_name || ''

    // ⭐ 关键3：监听 X6 节点数据变化事件
    node.on('change:data', ({ current }) => {
      // 更新本地状态，触发视图更新
      this.localModelName = current.nodeConfig?.model_name || ''
    })
  }
}
</script>

<template>
  <!-- ⭐ 关键4：模板绑定本地状态 -->
  <span class="model-name">{{ localModelName || '未选择模型' }}</span>
</template>
```

**AnswerNodeProperty.vue**（属性弹窗组件）：
```vue
<script>
export default {
  methods: {
    handleLLMSelected (modelName) {
      // ⭐ 关键5：更新配置
      this.nodeConfig.model_name = modelName

      // ⭐ 关键6：使用 Vue.set 确保响应式更新
      this.$set(this.wfNode.nodeConfig, 'model_name', modelName)

      // ⭐ 关键7：通过事件总线通知 X6 更新
      this.$nextTick(() => {
        this.$root.$emit('workflow:update-node', {
          nodeUuid: this.wfNode.uuid,
          nodeData: this.wfNode
        })
      })
    }
  }
}
</script>
```

#### KeywordExtractorNode的错误实现（当前）

**KeywordExtractorNode.vue**：
```vue
<script>
export default {
  name: 'KeywordExtractorNode',
  inject: ['getNode'],

  // ❌ 问题1：缺少 data() 中的 localModelName
  // ❌ 问题2：缺少 mounted() 钩子
  // ❌ 问题3：缺少 change:data 事件监听

  computed: {
    node () {
      return this.getNode().data
    }
  }
}
</script>

<template>
  <!-- ❌ 问题4：直接绑定 node.nodeConfig.model_name，无法响应更新 -->
  <span class="model-name">{{ node.nodeConfig.model_name || '未选择模型' }}</span>
</template>
```

**KeywordExtractorNodeProperty.vue**：
```vue
<script>
export default {
  methods: {
    handleLLMSelected (modelName) {
      // ❌ 问题5：只更新了配置，但没有通知 X6
      this.nodeConfig.model_name = modelName
      // ❌ 问题6：缺少 $set
      // ❌ 问题7：缺少 $root.$emit
    }
  }
}
</script>
```

### 联动机制原理

```
┌─────────────────────────────────────────────────┐
│         用户在属性弹窗选择模型                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Property.handleLLMSelected()                   │
│  1. 更新 nodeConfig.model_name                  │
│  2. this.$set() 确保响应式                      │
│  3. this.$root.$emit('workflow:update-node')    │
└────────────────┬────────────────────────────────┘
                 │ 事件总线
                 ▼
┌─────────────────────────────────────────────────┐
│  WorkflowDesigner（父组件）                      │
│  监听 'workflow:update-node' 事件                │
│  更新 X6 Graph 中的节点数据                      │
└────────────────┬────────────────────────────────┘
                 │ X6 触发 change:data 事件
                 ▼
┌─────────────────────────────────────────────────┐
│  Node.mounted() 监听器                          │
│  node.on('change:data', ({ current }) => {      │
│    this.localModelName = current.nodeConfig...  │
│  })                                             │
└────────────────┬────────────────────────────────┘
                 │ Vue 响应式系统
                 ▼
┌─────────────────────────────────────────────────┐
│  视图自动更新，用户看到新的模型名称 ✅            │
└─────────────────────────────────────────────────┘
```

---

## 三、KISS原则评估

### 1. "这是个真问题还是臆想出来的？"
**✅ 真问题**
- 用户明确指出AnswerNode有此功能
- KeywordExtractorNode和FaqExtractorNode需要一致性
- 当前体验差：需要刷新页面才能看到更新

### 2. "有更简单的方法吗？"
**✅ 已是最简方案**
- 复用AnswerNode已验证的联动机制
- 不引入新的依赖或架构
- 直接复制粘贴成熟代码，无需重新设计

### 3. "会破坏什么吗？"
**✅ 零破坏性**
- 只增加代码，不修改现有逻辑
- 完全向后兼容，不影响已保存的工作流
- 不改变任何API接口或数据结构
- 不影响其他节点（如AnswerNode继续正常工作）

### 4. "当前项目真的需要这个功能吗？"
**✅ 必要功能**
- 保持节点行为一致性（所有LLM节点应有相同交互）
- 提升用户体验（实时反馈）
- 遵循已建立的设计模式

---

## 四、详细设计方案

### 修改文件清单

#### 前端文件（4个）
1. `src/components/70_ai/components/workflow/components/nodes/KeywordExtractorNode.vue`
   - 增加 `localModelName` 响应式状态
   - 增加 `mounted()` 钩子
   - 增加 X6 `change:data` 事件监听
   - 修改模板绑定到 `localModelName`

2. `src/components/70_ai/components/workflow/components/nodes/FaqExtractorNode.vue`
   - 增加 `localModelName` 响应式状态
   - 增加 `mounted()` 钩子
   - 增加 X6 `change:data` 事件监听
   - 修改模板绑定到 `localModelName`

3. `src/components/70_ai/components/workflow/components/properties/KeywordExtractorNodeProperty.vue`
   - 修改 `handleLLMSelected()` 方法
   - 增加 `this.$set()` 确保响应式更新
   - 增加 `this.$root.$emit()` 通知 X6 更新

4. `src/components/70_ai/components/workflow/components/properties/FaqExtractorNodeProperty.vue`
   - 修改 `handleLLMSelected()` 方法
   - 增加 `this.$set()` 确保响应式更新
   - 增加 `this.$root.$emit()` 通知 X6 更新

#### 后端文件
无需修改

---

### KeywordExtractorNode.vue 修改方案

#### 修改1：增加响应式状态（第34-39行）

**修改前**：
```vue
data () {
  return {
    // 空
  }
},
```

**修改后**：
```vue
data () {
  return {
    // ⭐ 新增：本地响应式状态，用于显示
    localModelName: ''
  }
},
```

#### 修改2：增加mounted钩子和事件监听（第41-53行后增加）

**修改前**：
```vue
computed: {
  node () {
    return this.getNode().data
  }
}
// 无 mounted 钩子
```

**修改后**：
```vue
computed: {
  node () {
    return this.getNode().data
  }
},

// ⭐ 新增：mounted 钩子
mounted () {
  // 初始化本地状态
  const node = this.getNode()
  this.localModelName = node.data.nodeConfig?.model_name || ''

  // 🔥 关键：监听 X6 节点数据变化事件
  node.on('change:data', ({ current }) => {
    // 更新本地状态，触发视图更新
    this.localModelName = current.nodeConfig?.model_name || ''
  })
}
```

#### 修改3：修改模板绑定（第10行）

**修改前**：
```vue
<span class="model-name">{{ node.nodeConfig.model_name || '未选择模型' }}</span>
```

**修改后**：
```vue
<span class="model-name">{{ localModelName || '未选择模型' }}</span>
```

---

### KeywordExtractorNodeProperty.vue 修改方案

#### 修改：增强handleLLMSelected方法（第70-72行）

**修改前**：
```vue
methods: {
  handleLLMSelected (modelName) {
    this.nodeConfig.model_name = modelName
  }
}
```

**修改后**：
```vue
methods: {
  handleLLMSelected (modelName) {
    this.nodeConfig.model_name = modelName

    // ⭐ 新增：手动触发 X6 节点重新渲染
    // 使用 Vue.set 确保响应式更新
    this.$set(this.wfNode.nodeConfig, 'model_name', modelName)

    // ⭐ 新增：强制更新父组件
    this.$nextTick(() => {
      // 🔥 关键：通过事件总线通知 WorkflowDesigner 更新 X6
      this.$root.$emit('workflow:update-node', {
        nodeUuid: this.wfNode.uuid,
        nodeData: this.wfNode
      })
    })
  }
}
```

---

### FaqExtractorNode.vue 修改方案

**与 KeywordExtractorNode.vue 完全相同**：
1. 增加 `localModelName` 响应式状态
2. 增加 `mounted()` 钩子和事件监听
3. 修改模板绑定

---

### FaqExtractorNodeProperty.vue 修改方案

**与 KeywordExtractorNodeProperty.vue 完全相同**：
1. 增强 `handleLLMSelected()` 方法
2. 增加 `$set` 和 `$emit` 逻辑

---

## 五、测试场景

### 测试场景1：KeywordExtractorNode模型联动

**前置条件**：
- 打开工作流设计器
- 拖入关键词提取节点到画布

**测试步骤**：
1. 画布节点应显示"未选择模型"
2. 双击节点打开属性弹窗
3. 在"模型"下拉框选择"deepseek-chat"
4. 点击弹窗外关闭弹窗

**预期结果**：
- ✅ 画布节点应实时显示"deepseek-chat"
- ✅ 无需刷新页面
- ✅ 再次打开弹窗，模型选择器显示"deepseek-chat"

### 测试场景2：FaqExtractorNode模型联动

**前置条件**：
- 打开工作流设计器
- 拖入FAQ提取节点到画布

**测试步骤**：
1. 画布节点应显示"未选择模型"
2. 双击节点打开属性弹窗
3. 在"模型"下拉框选择"qwen-turbo"
4. 修改为"glm-4-flash"
5. 点击弹窗外关闭弹窗

**预期结果**：
- ✅ 画布节点应实时显示"glm-4-flash"
- ✅ 显示最后一次选择的模型
- ✅ 无需刷新页面

### 测试场景3：工作流保存和加载

**前置条件**：
- 创建包含关键词提取和FAQ提取节点的工作流
- 为两个节点分别配置不同模型

**测试步骤**：
1. 保存工作流
2. 关闭页面
3. 重新打开该工作流

**预期结果**：
- ✅ 两个节点应正确显示之前配置的模型名称
- ✅ 再次打开属性弹窗，模型配置正确

### 测试场景4：节点复制

**前置条件**：
- 画布上有一个已配置模型的关键词提取节点

**测试步骤**：
1. 复制该节点（Ctrl+C, Ctrl+V）
2. 观察复制后的节点

**预期结果**：
- ✅ 复制后的节点应显示相同的模型名称
- ✅ 两个节点独立配置，互不影响

---

## 六、风险分析

### 技术风险：无

| 风险项 | 评估 | 说明 |
|--------|------|------|
| 破坏现有功能 | 🟢 无风险 | 只增加代码，不修改现有逻辑 |
| 数据兼容性 | 🟢 无风险 | 不改变数据结构，完全向后兼容 |
| 性能影响 | 🟢 无风险 | 仅增加轻量级事件监听 |
| 浏览器兼容性 | 🟢 无风险 | 使用Vue标准API，无新特性 |
| 其他节点影响 | 🟢 无风险 | 改动仅限2个节点，不影响其他节点 |

### 实施风险：低

| 风险项 | 评估 | 缓解措施 |
|--------|------|----------|
| 代码复制错误 | 🟡 低风险 | 代码审查确保正确性 |
| 测试遗漏 | 🟡 低风险 | 执行完整测试场景 |
| 文档不一致 | 🟢 无风险 | 代码注释清晰 |

---

## 七、实施计划

### 阶段1：代码修改（预计15分钟）
1. 修改 `KeywordExtractorNode.vue`
2. 修改 `KeywordExtractorNodeProperty.vue`
3. 修改 `FaqExtractorNode.vue`
4. 修改 `FaqExtractorNodeProperty.vue`

### 阶段2：代码审查（预计5分钟）
1. 检查代码风格一致性
2. 检查注释完整性
3. 检查逻辑正确性

### 阶段3：功能测试（预计10分钟）
1. 测试场景1：KeywordExtractorNode模型联动
2. 测试场景2：FaqExtractorNode模型联动
3. 测试场景3：工作流保存和加载
4. 测试场景4：节点复制

### 总计时间：约30分钟

---

## 八、总结

### 核心价值
- ✅ 提升用户体验：实时反馈，无需刷新
- ✅ 保持行为一致：所有LLM节点统一交互模式
- ✅ 零破坏性：完全向后兼容
- ✅ 实施简单：复用成熟代码，风险低

### 技术亮点
- 使用Vue响应式系统确保视图更新
- 使用X6事件机制解耦组件通信
- 使用事件总线统一通知机制
- 代码简洁，最大缩进仅2层

### KISS原则符合度：✅ 100%
1. 真问题：用户明确需求
2. 最简方案：复用现有模式
3. 零破坏：完全兼容
4. 真需要：提升一致性和体验

---

## 附录：完整代码对比

### KeywordExtractorNode.vue 对比

```diff
 export default {
   name: 'KeywordExtractorNode',
   inject: ['getNode'],
+
+  data () {
+    return {
+      // 本地响应式状态，用于显示
+      localModelName: ''
+    }
+  },

   computed: {
     node () {
       return this.getNode().data
     }
+  },
+
+  mounted () {
+    // 初始化本地状态
+    const node = this.getNode()
+    this.localModelName = node.data.nodeConfig?.model_name || ''
+
+    // 🔥 关键：监听 X6 节点数据变化事件
+    node.on('change:data', ({ current }) => {
+      // 更新本地状态，触发视图更新
+      this.localModelName = current.nodeConfig?.model_name || ''
+    })
   }
 }
```

模板：
```diff
-<span class="model-name">{{ node.nodeConfig.model_name || '未选择模型' }}</span>
+<span class="model-name">{{ localModelName || '未选择模型' }}</span>
```

### KeywordExtractorNodeProperty.vue 对比

```diff
 methods: {
   handleLLMSelected (modelName) {
     this.nodeConfig.model_name = modelName
+
+    // 手动触发 X6 节点重新渲染
+    this.$set(this.wfNode.nodeConfig, 'model_name', modelName)
+
+    // 强制更新父组件
+    this.$nextTick(() => {
+      // 通过事件总线通知 WorkflowDesigner 更新 X6
+      this.$root.$emit('workflow:update-node', {
+        nodeUuid: this.wfNode.uuid,
+        nodeData: this.wfNode
+      })
+    })
   }
 }
```

---

**文档结束**
