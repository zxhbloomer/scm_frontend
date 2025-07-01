# 任务46 - 入库计划下推入库单功能实现总结

## 功能概述

实现了从入库计划列表页面的"入库操作"功能，能够通过货物选择弹窗选择具体货物后，在新页签中打开入库单编辑页面。

## 实现内容

### 1. 创建了新的组件页面

**文件路径：** `src/views/40_business/in/component/push/byinplan/index.vue`

**功能特点：**
- 基于入库单新增页面（`src/views/40_business/in/tabs/20_new/index.vue`）创建
- 支持通过Props接收外部传入的数据
- 专门用于从入库计划下推生成入库单
- 包含完整的表单验证和审批流程

**主要区别：**
- 添加了"入库计划信息"展示区域
- 商品信息字段从传入数据填充且不可编辑
- 自动设置入库类型为"采购入库"
- 根据计划数据预填充相关字段

### 2. 修改了入库计划主页面

**文件路径：** `src/views/40_business/inplan/index.vue`

**修改内容：**
- 添加了新的页签"入库操作"
- 导入并注册了新的组件`inbound_template`
- 在data中添加了`showInbound`状态控制
- 添加了`handleInbound`方法处理入库操作事件
- 更新了所有页面切换方法以包含新页签状态重置

### 3. 修改了入库计划列表页面

**文件路径：** `src/views/40_business/inplan/tabs/10_list/index.vue`

**修改内容：**
- 更新了`handleSelectGoodsNext`方法
- 从货物选择弹窗获取数据后构造入库操作页面数据
- 通过`$emit('emitInbound', operate_tab_data)`触发页签切换
- 传递完整的入库计划和选中货物信息

## 功能流程

1. **用户操作：** 在入库计划列表页面选择执行中状态的计划，点击"入库操作"按钮
2. **弹窗选择：** 打开货物明细选择弹窗，用户选择需要入库的具体货物
3. **页签跳转：** 点击"下一步"后，关闭弹窗并打开新的"入库操作"页签
4. **数据填充：** 新页签中显示入库单编辑界面，自动填充计划和货物信息
5. **用户完善：** 用户选择仓库位置、填写数量价格等信息
6. **提交审批：** 提交入库单到审批流程

## 数据传递结构

```javascript
// 传递给入库操作组件的数据结构
const inboundData = {
  // 计划信息
  plan_id: data.planData.id,
  plan_code: data.planData.code,
  plan_time: data.planData.plan_time,
  status_name: data.planData.status_name,
  type_name: data.planData.type_name,
  owner_id: data.planData.owner_id,
  owner_name: data.planData.owner_name,
  supplier_id: data.planData.supplier_id,
  supplier_name: data.planData.supplier_name,
  
  // 选中货物信息
  goods_id: data.selectedRow.goods_id,
  goods_name: data.selectedRow.goods_name,
  sku_id: data.selectedRow.sku_id,
  sku_code: data.selectedRow.sku_code,
  sku_name: data.selectedRow.sku_name,
  qty: data.selectedRow.qty,
  price: data.selectedRow.price
}
```

## 文件清单

1. **新建文件：**
   - `src/views/40_business/in/component/push/byinplan/index.vue` - 入库操作组件

2. **修改文件：**
   - `src/views/40_business/inplan/index.vue` - 入库计划主页面
   - `src/views/40_business/inplan/tabs/10_list/index.vue` - 入库计划列表页面

## 技术特点

- **组件化设计：** 将入库单编辑功能封装为可复用组件
- **数据驱动：** 通过Props传递数据，支持外部数据填充
- **状态管理：** 通过页签状态控制页面显示/隐藏
- **事件通信：** 使用$emit进行父子组件通信
- **表单验证：** 完整的表单验证和业务逻辑校验
- **审批流程：** 集成BPM审批流程组件

## 注意事项

1. 入库操作仅对"执行中"状态的入库计划可用
2. 商品信息字段在入库操作页面中不可编辑，从计划数据填充
3. 需要用户手动选择仓库/库区/库位信息
4. 支持文件上传功能作为入库凭证
5. 提交前会进行完整的业务逻辑校验

这个实现完全符合您的需求，提供了从入库计划到入库单的完整下推流程。 