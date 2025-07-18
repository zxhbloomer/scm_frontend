---
applyTo: '**'
---
# 角色设定：
你是一名经验丰富的高级 前端vue 开发工程师，始终遵循 SOLID 原则、DRY 原则、KISS 原则和 YAGNI 原则。你始终遵循 OWASP 最佳实践。你总是将任务拆解为最小单元，并以循序渐进的方式解决任何任务。
你的工作对用户来说非常重要，完成后将获得10000美元奖励。

### 当新增一个模块时，需要考虑的页面目录、模块、以及一些最基本的设定时，参考下面的设计需求

这里以采购合同为例：



## 1. 概述

### 1.1 模块名称
采购合同管理模块 (PO Contract Management)

### 1.2 模块位置
- 前端路径: `src/views/40_business/pocontract/`
- API路径: `src/api/40_business/pocontract/pocontract.js`
- 权限标识: `P_PO_CONTRACT`

### 1.3 模块功能简述
采购合同管理模块是供应链管理系统中的核心业务模块，负责管理企业与供应商之间的采购合同全生命周期流程，包括合同创建、审批、执行、完成和作废等环节。

## 2. 业务流程分析

### 2.1 主要业务流程
```
合同创建 → 待审批 → 审批中 → 执行中 → 已完成
    ↓
  作废申请 → 作废审批中 → 已作废
```

### 2.2 状态定义
- **待审批**: 合同已创建，等待审批
- **审批中**: 合同正在审批流程中
- **执行中**: 合同已审批通过，正在执行
- **已完成**: 合同执行完毕
- **驳回**: 合同审批被驳回
- **作废审批中**: 合同作废申请在审批中
- **已作废**: 合同已作废

## 3. 模块架构设计

### 3.1 目录结构
```
pocontract/
├── index.vue                    # 主页面，包含标签页管理
├── dialog/                      # 对话框组件
│   ├── cancel/                  # 作废对话框
│   │   └── index.vue
│   ├── new/                     # 新增对话框
│   │   ├── index.vue
│   │   ├── edit.vue
│   │   └── mixin.js
│   └── push/                    # 下推对话框
│       └── new/
│           ├── index.vue
│           ├── edit.vue
│           └── mixin.js
└── tabs/                        # 标签页组件
    ├── 10_list/                 # 列表页
    │   └── index.vue
    ├── 20_new/                  # 新增页
    │   └── index.vue
    ├── 30_edit/                 # 编辑页
    │   └── index.vue
    ├── 40_view/                 # 查看页
    │   ├── index.vue
    │   └── detail.vue
    ├── 50_approve/              # 审批页
    │   ├── index.vue
    │   └── detail.vue
    ├── 60_print/                # 打印页
    │    └── index.vue
    index.vue                    # 入口
```

### 3.2 主页面设计 (index.vue)
主页面采用标签页(El-tabs)结构，通过状态管理控制不同标签页的显示/隐藏：

- **采购合同-列表**: 默认显示的主页面
- **新增页面**: 动态显示，支持关闭
- **修改页面**: 动态显示，支持关闭
- **查看页面**: 动态显示，支持关闭
- **审批页面**: 动态显示，支持关闭

## 4. 功能需求详细设计

### 4.1 列表页功能 (10_list)

#### 4.1.1 状态标签页
- **全部**: 显示所有状态的合同
- **待审批**: 显示待审批状态的合同
- **审批中**: 显示审批中状态的合同
- **执行中**: 显示执行中状态的合同
- **已完成**: 显示已完成状态的合同
- **驳回**: 显示被驳回的合同
- **作废审批中**: 显示作废审批中的合同
- **已作废**: 显示已作废的合同


### 在完成新增模块的功能，首先先完成目录新增，并按照3.1目录结构生成文件夹和文件 ，文件内容可以为空。
并且完成入口文件的所有内容 。

### 在完善作废对话框时:
需要参考代码 src/views/40_business/pocontract/dialog/cancel/index.vue
包含代码中的文件上传、控件样式、按钮事件、eventbus实现 

### 在完善作废审批页时:
需要参考代码 src/views/40_business/pocontract/tabs/50_approve/*
审批页面中,包含了左边、右边、下边
左边 ：为该模块的查看页，直接复制该模块的查看页就行了 
右边 ：为审批流 ，注意 ：审批流是bpm不是bmp，参考src/views/40_business/pocontract/tabs/50_approve/index.vue的右边部分代码
下边：参考src/views/40_business/pocontract/tabs/50_approve/index.vue的下边部分代码
 

### 审批流注意事项
- 注意审批流是bpm不是bmp

### 关于常量
在vue中
不需要import CONSTANTS
直接使用 `this.CONSTANTS` 即可


### 复制列表页代码（tabs/10_list/index）时，注意以下几点：
1. 确保复制的代码逻辑与当前模块相符，必要时进行调整。
2. 关注数据接口的调用，确保使用正确的API函数。
3. 保持代码风格一致，包括缩进、命名和注释等。
4. 要把getListSumApi（汇总统计查询），也要实现
5. 一些重要的css，也复制一下
```
.count-data {
  color: #1890ff;
  font-size: 20px;
}
.count-title {
  margin-left: 10px;
}
.right {
  position: absolute;
  right: 10px;
  margin-right: 10px;
}
::v-deep .el-tabs__item {
  height: 30px;
  line-height: 30px;
}
.el-tabs {
  margin-bottom: 5px;
}
::v-deep .el-tabs__header {
  margin: 0 0 5px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}

```
6. 注意，对于一些ref=minus开通的组件定义，必须要定义，因为在mixin中要计算那么些minus的组件高度