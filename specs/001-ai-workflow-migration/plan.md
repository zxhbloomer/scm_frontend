# Implementation Plan: AI Workflow 工作流功能迁移

**Branch**: `001-ai-workflow-migration` | **Date**: 2025-10-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-workflow-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将 aideepin 的 AI Workflow 工作流功能完整迁移到 SCM 前端 70_ai 模块。包括可视化工作流设计器、15+ 种节点类型、工作流运行引擎、SSE 实时执行反馈、运行历史管理等核心功能。技术方案：使用 AntV X6 替代 Vue Flow（Vue 3 专用）实现可视化画布，保持与 aideepin 相同的交互逻辑和用户体验，严格按照原有业务逻辑实现，不进行过度设计。

## Technical Context

**Language/Version**: Vue.js 2.7.16 (Composition API 支持) + JavaScript ES6+
**Primary Dependencies**:
- Element UI 2.15.14 (UI 组件库，必须使用)
- AntV X6 (图编辑引擎，替代 aideepin 的 @vue-flow/core，Vue 2 兼容)
- Axios 0.19.0 (HTTP 客户端，已有 SSE 工具复用)
- Vuex 3.1.0 (状态管理)
- Vue Router 3.1.3 (路由管理)

**Storage**:
- MySQL (后端存储：工作流定义、节点配置、运行记录、历史数据)
- Vuex Store (前端状态：当前工作流、运行时状态、画布配置)
- LocalStorage (可选：草稿自动保存)

**Testing**: Playwright 1.54.2 (E2E 测试，重点测试工作流创建、运行、节点配置流程)

**Target Platform**: 现代浏览器（Chrome、Edge、Firefox 最新版本），PC 端优先，无需移动端适配

**Project Type**: Web 应用 (前端 Vue.js 2.7 + 后端 Spring Boot 3.1.4)

**Performance Goals**:
- 画布操作响应时间 < 200ms (支持 50+ 节点)
- 节点状态更新延迟 < 500ms (SSE 实时推送)
- 90% 工作流在 10 秒内完成执行
- 工作流保存成功率 > 99.9%

**Constraints**:
- 必须使用 Element UI 组件库，不得引入其他 UI 框架
- 所有代码必须保存在 `src/components/70_ai` 模块下
- 中文系统，所有 UI 文本使用中文
- 不支持 IE 或旧版浏览器
- 严格遵循 aideepin 原有逻辑，不得随意修改或重新设计
- 代码完整性要求：不得因长度而简化或省略功能逻辑

**Scale/Scope**:
- 单个工作流支持至少 50 个节点
- 支持 15+ 种节点类型 (LLM、知识检索、HTTP 请求、文档提取、分类器等)
- 公开工作流市场至少 10 个可复用模板
- 支持工作流运行历史分页查询

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: N/A - 项目宪法文件为空模板，无具体约束规则需要验证。

**项目特定约束验证**:
- ✅ 代码必须保存在 `src/components/70_ai` 模块下（已确认）
- ✅ 必须使用 Element UI 组件库（已确认，不引入其他 UI 框架）
- ✅ 严格遵循 aideepin 原有逻辑（已明确，不进行过度设计）
- ✅ 中文系统要求（已确认，所有 UI 文本使用中文）
- ✅ 代码完整性要求（已确认，不得简化或省略功能逻辑）

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/components/70_ai/
├── components/
│   └── workflow/                    # 工作流 Vue 组件
│       ├── WorkflowDialog.vue       # 工作流主弹窗容器
│       ├── WorkflowList.vue         # 工作流列表（我的工作流 + 公开市场）
│       ├── WorkflowCanvas.vue       # X6 画布容器组件
│       ├── WorkflowRunner.vue       # 工作流运行界面
│       ├── WorkflowHistory.vue      # 运行历史记录
│       ├── nodes/                   # 节点组件
│       │   ├── BaseNode.vue         # 节点基础组件
│       │   ├── StartNode.vue        # 开始节点
│       │   ├── EndNode.vue          # 结束节点
│       │   ├── LlmNode.vue          # LLM 回答节点
│       │   ├── KnowledgeNode.vue    # 知识检索节点
│       │   ├── HttpNode.vue         # HTTP 请求节点
│       │   ├── ClassifierNode.vue   # 分类器节点
│       │   └── ...                  # 其他节点类型
│       ├── panels/                  # 属性面板
│       │   ├── NodeConfigPanel.vue  # 节点配置面板
│       │   └── WorkflowSettings.vue # 工作流设置面板
│       └── dialogs/                 # 子对话框
│           ├── NodeEditorDialog.vue # 节点编辑器
│           └── RunConfigDialog.vue  # 运行配置对话框
│
├── api/
│   ├── workflowApi.js              # 工作流 CRUD API
│   ├── workflowRuntimeApi.js       # 工作流运行 API
│   └── workflowNodeApi.js          # 节点配置 API
│
├── constants/
│   ├── workflowConstants.js        # 工作流常量（状态码、节点类型等）
│   └── nodeTypeDefinitions.js      # 节点类型定义
│
├── store/
│   └── modules/
│       ├── workflow.js             # 工作流状态管理
│       └── workflowRuntime.js      # 运行时状态管理
│
├── utils/
│   ├── workflowValidator.js        # 工作流验证逻辑
│   ├── nodeDataMapper.js           # 节点数据映射
│   ├── x6GraphHelper.js            # X6 图形操作辅助
│   └── workflowSseHandler.js       # SSE 事件处理（复用现有 sseUtils）
│
└── styles/
    └── workflow.scss               # 工作流样式

tests/e2e/
└── workflow/                       # Playwright E2E 测试
    ├── workflow-creation.spec.js   # 工作流创建测试
    ├── workflow-execution.spec.js  # 工作流执行测试
    └── node-configuration.spec.js  # 节点配置测试
```

**Structure Decision**:
采用 Web 应用前端模块化结构，严格遵循 SCM 项目的 `70_ai` 模块组织规范。所有工作流相关代码集中在 `src/components/70_ai` 下的专用子目录中，与现有 AI 功能（chat、knowledge base、model settings 等）保持一致的组织模式。

**关键设计原则**:
1. **模块隔离**: 工作流功能完全独立，不影响现有 70_ai 模块的其他功能
2. **组件复用**: 复用现有 SSE 工具、API 请求封装、Element UI 组件
3. **Vue 2.7 兼容**: 所有组件使用 Vue 2.7 Options API 或 Composition API
4. **X6 集成**: 使用 AntV X6 替代 Vue Flow，保持框架无关性

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: 无违规项，无需复杂度跟踪。

所有设计决策均符合项目约束和最佳实践：
- 使用 Element UI（项目标准）
- 代码保存在 `src/components/70_ai` 模块（项目规范）
- 遵循 aideepin 原有逻辑（需求明确要求）
- 使用 X6 替代 Vue Flow（技术兼容性需要）

