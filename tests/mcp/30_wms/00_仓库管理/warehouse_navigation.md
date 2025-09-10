# MCP Playwright 仓库管理页面导航测试

## 🚨 统一错误处理策略

**任何MCP命令失败时，自动执行以下操作**：

### 标准错误处理流程：
1. **立即截图**
   ```javascript
   mcp__playwright__browser_take_screenshot({
     filename: './error/{失败步骤}_{时间戳}.png'
   })
   ```

2. **收集错误信息**
   ```javascript
   mcp__playwright__browser_console_messages()
   ```

3. **记录错误** (复制以下模板填写)
   ```
   ❌ 错误报告
   失败步骤：[哪一步失败了]
   错误现象：[看到什么页面/状态]
   错误信息：[MCP返回的具体错误文本]
   截图路径：[./error/文件名.png]
   时间：[发生时间]
   ```

---

## 前置条件
- 系统已有成功登录记录，可参考：
  - `../00_login_success.md` (同目录下的登录记录)
  - `../../login_success.md` (mcp根目录下的登录记录)
- 登录凭据信息:
  - 用户名: `adminstrator`
  - 密码: `654321`
  - 验证码: `1`
- 系统服务状态:
  - 后端服务: `http://localhost:8088` (运行中)
  - 前端服务: `http://localhost:9528` (运行中)

## 测试步骤

### 1. 读取登录记录
```javascript
// 参考登录记录文件
Read ../00_login_success.md
```
**预期**: 获取登录凭据和流程信息

### 2. 导航到首页
```javascript
mcp__playwright__browser_navigate('http://localhost:9528')
```
**预期**: 打开工作台或登录页面

### 3. 检查登录状态
```javascript
mcp__playwright__browser_snapshot()
```
**预期**: 显示工作台界面 (如果是登录页，按照login_success.md登录)

### 4. 导航到仓库管理
```javascript
mcp__playwright__browser_navigate('http://localhost:9528/#/master/warehouse')
```
**预期**: 显示仓库管理页面，页面标题包含"仓库管理"

### 5. 验证页面加载
```javascript
mcp__playwright__browser_wait_for({ time: 3 })
mcp__playwright__browser_snapshot()
```
**预期**: 仓库列表正常显示，操作按钮可见

### 6. 检查控制台错误
```javascript
mcp__playwright__browser_console_messages()
```
**预期**: 无严重错误信息

## 页面功能验证清单

**快速验证以下功能区域是否正常显示**：

### ✅ 核心检查项
- **导航栏**: 左侧菜单、顶部菜单、面包屑导航
- **搜索区**: 仓库名称、编码输入框，类型、状态下拉框
- **操作按钮**: 新增(可用)、修改/删除(禁用)、导出(可用)
- **数据表格**: 字段显示完整，数据正常加载
- **分页控件**: 显示总数、页码、跳转功能正常

---

## 📊 测试结果

**✅ 全部成功**: 所有步骤按预期执行  
**❌ 有错误**: 检查error目录截图，按照统一错误处理流程记录问题

---

**测试完成时间**: [填写]  
**执行人**: [填写]  
**测试状态**: [成功/失败]  
**error目录文件**: [如果有错误，列出截图文件名]

## 下一步操作建议
- **深入功能测试**: 新增、修改、删除仓库记录
- **搜索功能测试**: 验证各种筛选条件
- **分页功能测试**: 翻页和跳转操作