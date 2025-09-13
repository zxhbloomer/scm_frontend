# 仓库管理页面排序功能测试

## 📋 测试概述

这是一个专门测试仓库管理页面 (http://localhost:9528/#/master/warehouse) 排序功能的 Playwright 自动化测试套件。

### 🎯 测试目标

- 测试所有 **19个可排序字段** 的升序和降序排序功能
- 自动检测和记录测试过程中的错误
- 生成详细的测试报告和错误截图
- 处理横向滚动问题，确保所有列都能被测试到

### 📊 测试覆盖范围

| 字段类别 | 字段数量 | 测试字段 |
|---------|---------|---------|
| 基础信息 | 3 | warehouse_code, warehouse_name, warehouse_short_name |
| 地理位置 | 4 | province, city, district, address |
| 数值字段 | 2 | sort, dbversion |
| 企业相关 | 3 | org_id, org_code, org_name |
| 时间人员 | 4 | c_time, u_time, c_name, u_name |
| 其他字段 | 3 | warehouse_type_name, enabled_name, remark |

**总计**: 19个字段 × 2种排序方式 = **38个测试用例**

## 🛠️ 环境要求

### 前置条件
1. **SCM系统运行中**: 确保系统在 http://localhost:9528 正常运行
2. **Node.js**: 版本 ≥ 16.0.0
3. **Playwright**: 已安装并配置

### 测试账户
- 用户名: `administrator`
- 密码: `654321`
- 验证码: `1`

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在测试目录中安装 Playwright
npm init -y
npm install -D @playwright/test
npx playwright install chromium
```

### 2. 运行测试

```bash
# 运行排序功能测试
npx playwright test warehouse-sorting.spec.ts

# 运行测试并显示浏览器（推荐）
npx playwright test warehouse-sorting.spec.ts --headed

# 运行测试并启用调试模式
npx playwright test warehouse-sorting.spec.ts --debug

# 生成HTML测试报告
npx playwright show-report
```

### 3. 查看测试结果

测试完成后，可以查看以下输出：

- **控制台输出**: 实时测试进度和结果
- **HTML报告**: `./test-results/html-report/index.html`
- **错误截图**: `./error/` 目录中的PNG文件
- **测试报告**: `./error/` 目录中的Markdown报告
- **JSON结果**: `./test-results/results.json`

## 📁 目录结构

```
00_仓库管理/
├── warehouse-sorting.spec.ts    # 主测试脚本
├── playwright.config.ts         # Playwright配置
├── global-setup.ts             # 全局设置
├── global-teardown.ts          # 全局清理
├── README.md                   # 本说明文件
├── error/                      # 错误截图和报告目录
└── test-results/              # 测试结果目录
    ├── html-report/           # HTML测试报告
    ├── artifacts/             # 测试工件
    └── *.json                 # JSON格式结果
```

## 🔧 测试特性

### ✅ 自动化登录
- 自动填写登录表单
- 处理已知的登录后错误对话框
- 验证登录成功并跳转到仓库管理页面

### 🔄 智能滚动处理
- 自动检测列是否在视窗内
- 智能横向滚动查找隐藏的列
- 确保每个字段都能被正确测试

### 📸 错误检测和截图
- 实时错误检测和记录
- 自动截图保存错误状态
- 错误截图命名规则: `{测试字段}_{错误类型}_{时间戳}.png`

### 📊 详细的测试报告
- 按字段类别分组的测试结果
- 性能分析（响应时间统计）
- 错误汇总和建议
- 支持HTML和Markdown格式报告

### 🎯 精确的排序验证
- 验证升序排序指示器
- 验证降序排序指示器
- 测量排序操作的响应时间
- 恢复默认排序状态

## ⚙️ 配置说明

### Playwright 配置 (playwright.config.ts)
- **超时时间**: 单个测试10分钟，全局测试30分钟
- **浏览器**: 默认使用 Chromium
- **视窗大小**: 1920×1080 (确保能看到更多列)
- **并发设置**: 单线程执行避免排序干扰
- **重试次数**: 本地1次，CI环境2次

### 测试参数 (warehouse-sorting.spec.ts)
- **基础URL**: http://localhost:9528
- **目标页面**: /#/master/warehouse
- **等待时间**: 适当的延迟确保操作稳定性
- **截图模式**: 仅在失败时截图

## 🐛 故障排除

### 常见问题

1. **登录失败**
   - 检查系统是否在 http://localhost:9528 正常运行
   - 确认登录凭据正确 (administrator/654321/1)

2. **找不到列头**
   - 检查页面是否完全加载
   - 确认仓库数据存在
   - 查看错误截图了解页面状态

3. **排序测试失败**
   - 检查Element UI表格排序配置
   - 确认Vue组件的排序事件处理
   - 查看浏览器控制台错误

4. **测试超时**
   - 检查网络连接和系统性能
   - 增加配置中的超时时间
   - 使用 `--headed` 模式观察测试过程

### 调试技巧

```bash
# 逐步调试模式
npx playwright test --debug

# 显示浏览器运行
npx playwright test --headed

# 详细输出模式
npx playwright test --reporter=list

# 特定测试用例调试
npx playwright test warehouse-sorting.spec.ts --grep "仓库编码"
```

## 📈 性能指标

### 预期性能基准
- **单字段排序时间**: < 2秒
- **总测试时间**: < 10分钟
- **错误率**: < 5%
- **成功率目标**: > 95%

### 监控指标
- 排序响应时间
- 页面加载时间
- 网络请求状态
- JavaScript错误数量

## 🔄 持续集成

### CI/CD 集成示例

```yaml
# GitHub Actions 示例
name: 仓库管理排序测试
on: [push, pull_request]
jobs:
  warehouse-sorting-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test warehouse-sorting.spec.ts
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: warehouse-test-results
          path: test-results/
```

## 📞 支持和反馈

如遇到问题或需要支持，请：

1. 查看 `./error/` 目录中的错误截图
2. 检查 `./test-results/` 中的详细报告
3. 查看控制台输出的详细日志
4. 参考本README的故障排除部分

---

**测试脚本版本**: 1.0.0  
**最后更新**: 2025-01-13  
**兼容系统**: SCM仓库管理系统 v1.0+