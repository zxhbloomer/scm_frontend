# 销售合同列表页面排序功能测试指南

## 📋 测试概述

本测试套件专门针对销售合同列表页面的排序功能，包含**28个可排序字段**的全面测试。测试分为两个层级：

- **单元测试**: 测试排序逻辑和状态管理
- **E2E测试**: 测试完整的用户交互流程

## 🚀 快速开始

### 环境准备

1. **启动后端服务**
   ```bash
   cd 00_scm_backend/scm_backend/scm-start
   mvn spring-boot:run
   ```

2. **启动前端服务**
   ```bash
   cd 01_scm_frontend/scm_frontend
   npm run dev
   ```

3. **确保测试数据**
   - 数据库中需要有足够的销售合同数据（建议至少20条）
   - 数据应包含不同的状态、类型、日期等，以便测试排序效果

### 运行测试

#### 单元测试
```bash
# 运行特定的排序功能单元测试
npm run test:unit -- --testNamePattern="销售合同列表页面排序功能单元测试"

# 运行所有单元测试
npm run test:unit
```

#### E2E测试
```bash
# 运行排序功能E2E测试
npm run test:e2e -- tests/e2e/socontract-sorting.spec.js

# 运行E2E测试（带界面）
npm run test:e2e:headed -- tests/e2e/socontract-sorting.spec.js

# 调试E2E测试
npm run test:e2e:debug -- tests/e2e/socontract-sorting.spec.js
```

## 📊 测试覆盖范围

### 可排序字段完整列表

| 序号 | 字段名 | 中文名称 | 数据类型 | 测试重点 |
|------|--------|----------|----------|----------|
| 1 | project_code | 项目编号 | text | 文本排序 |
| 2 | contract_code | 合同编号 | text | 文本排序 |
| 3 | type_name | 类型 | text | 枚举值排序 |
| 4 | order_volume | 订单量 | number | 数值排序 |
| 5 | status_name | 状态 | text | 状态排序 |
| 6 | customer_name | 客户 | text | 中文排序 |
| 7 | purchaser_name | 销售方 | text | 中文排序 |
| 8 | execution_progress | 执行进度 | text | 进度排序 |
| 9 | sign_date | 签约日期 | date | 日期排序 |
| 10 | expiry_date | 到期日期 | date | 日期排序 |
| 11 | delivery_date | 交货日期 | date | 日期排序 |
| 12 | delivery_type_name | 运输方式 | text | 文本排序 |
| 13 | settle_type_name | 结算方式 | text | 文本排序 |
| 14 | bill_type_name | 结算单据类型 | text | 文本排序 |
| 15 | payment_type_name | 付款方式 | text | 文本排序 |
| 16 | contract_amount_sum | 合同总金额 | number | 金额排序 |
| 17 | contract_total | 总销售数量 | number | 数量排序 |
| 18 | tax_amount_sum | 税额 | number | 金额排序 |
| 19 | settled_qty | 已结算数量 | number | 数量排序 |
| 20 | settled_price | 结算金额 | number | 金额排序 |
| 21 | advance_pay_price | 预收款金额 | number | 金额排序 |
| 22 | accumulated_act_price | 累计实收 | number | 金额排序 |
| 23 | unpaid_amount | 未收 | number | 金额排序 |
| 24 | advance_refund_amount_total | 预收款可退金额 | number | 金额排序 |
| 25 | already_invoice_price | 已开票金额 | number | 金额排序 |
| 26 | c_name | 创建人 | text | 用户名排序 |
| 27 | c_time | 创建时间 | datetime | 时间排序 |
| 28 | u_time | 更新时间 | datetime | 时间排序 |

### 测试场景

#### 单元测试场景
- ✅ 排序状态管理
- ✅ 排序参数生成（升序/降序）
- ✅ API调用验证
- ✅ 边界条件处理
- ✅ 排序状态持久化

#### E2E测试场景
- ✅ 页面初始化状态
- ✅ 每个字段的三态切换（无排序→升序→降序→无排序）
- ✅ 排序图标状态显示
- ✅ 排序结果数据验证
- ✅ 多字段排序互斥
- ✅ 排序与分页结合
- ✅ 排序与标签页切换
- ✅ 大数据量性能测试

## 🧪 测试数据要求

### 最小数据要求
- 销售合同数据：至少20条
- 状态覆盖：待审批、审批中、执行中、已完成、驳回等
- 日期范围：跨越不同月份的数据
- 金额范围：从小额到大额的分布
- 客户多样性：不同客户名称

### 测试数据示例
```sql
-- 插入测试数据示例（根据实际表结构调整）
INSERT INTO b_so_contract (
  contract_code, project_code, customer_name, 
  contract_amount_sum, sign_date, status, 
  c_time, u_time
) VALUES 
('CT2024001', 'PJ2024001', '客户A', 100000.00, '2024-01-15', '0', NOW(), NOW()),
('CT2024002', 'PJ2024002', '客户B', 250000.00, '2024-01-20', '1', NOW(), NOW()),
('CT2024003', 'PJ2024003', '客户C', 180000.00, '2024-02-01', '2', NOW(), NOW());
```

## 🎯 预期结果

### 单元测试预期
- ✅ 所有测试用例通过
- ✅ 覆盖率达到90%以上
- ✅ 排序逻辑正确性验证
- ✅ 边界条件处理验证

### E2E测试预期
- ✅ 用户界面交互正常
- ✅ 排序图标状态正确切换
- ✅ 数据排序结果符合预期
- ✅ 性能指标在合理范围内

## 🐛 常见问题与解决方案

### 1. 登录相关问题
**问题**: E2E测试无法登录
**解决方案**: 
- 检查登录凭据是否正确
- 确认后端服务正常运行
- 验证数据库连接

### 2. 数据不足问题
**问题**: 测试数据不够导致排序验证失败
**解决方案**:
```sql
-- 生成更多测试数据
INSERT INTO b_so_contract (contract_code, project_code, customer_name, contract_amount_sum, sign_date, status, c_time, u_time)
SELECT 
    CONCAT('CT', LPAD(ROW_NUMBER() OVER(), 6, '0')),
    CONCAT('PJ', LPAD(ROW_NUMBER() OVER(), 6, '0')),
    CONCAT('客户', CHAR(65 + (ROW_NUMBER() OVER() % 26))),
    ROUND(RAND() * 1000000, 2),
    DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND() * 365) DAY),
    FLOOR(RAND() * 6),
    NOW(),
    NOW()
FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t1
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t2;
```

### 3. 排序验证失败
**问题**: 排序结果验证不通过
**解决方案**:
- 检查数据类型转换逻辑
- 验证空值处理
- 确认服务器端排序逻辑

### 4. 性能测试超时
**问题**: 大数据量排序超时
**解决方案**:
- 增加超时时间配置
- 优化数据库索引
- 检查服务器性能

## 📈 性能指标

### 响应时间要求
- 单次排序操作：< 5秒
- 大数据量排序：< 10秒
- UI响应时间：< 1秒

### 内存使用
- 客户端内存：< 500MB
- 浏览器标签页：< 200MB

## 🔧 配置说明

### Jest配置 (jest.config.js)
```javascript
module.exports = {
  testMatch: [
    '**/tests/unit/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'src/views/40_business/20_so/socontract/**/*.{js,vue}',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Playwright配置
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:19528',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
};
```

## 📝 测试报告

### 生成测试报告
```bash
# 生成单元测试覆盖率报告
npm run test:unit -- --coverage

# 生成E2E测试报告
npm run test:e2e:report
```

### 报告查看
- 单元测试报告：`coverage/lcov-report/index.html`
- E2E测试报告：`playwright-report/index.html`

## 🤝 维护指南

### 新增排序字段测试
1. 更新 `sortableFields` 数组
2. 添加对应的测试用例
3. 更新文档说明

### 测试数据维护
1. 定期清理测试数据
2. 更新测试场景
3. 优化性能指标

### 问题反馈
如遇到测试问题，请提供：
- 错误截图
- 浏览器控制台日志
- 网络请求详情
- 测试环境信息

---

**测试负责人**: QA Team  
**最后更新**: 2024年1月  
**版本**: v1.0.0