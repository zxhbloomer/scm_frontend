# Vite环境变量迁移方案设计

**文档编号**: SCM-FE-2025-11-02-001
**创建日期**: 2025-11-02
**设计者**: Claude Code
**状态**: 待审批

---

## 1. 概述

### 1.1 问题背景

当前前端项目使用Vite构建,但通过第三方插件`vite-plugin-environment`模拟Webpack的`process.env`行为,存在以下问题:

1. **环境变量undefined**: `process.env.VUE_APP_FILE_PIC_PREVIEW_URL`等5个预览相关变量未正确注入
2. **双重维护**: 环境变量需要在`.env`文件和`vite.config.js`两处配置,容易不同步
3. **架构不合理**: 使用第三方插件模拟Webpack,不符合Vite最佳实践
4. **配置冲突**: `define: { 'process.env': {} }`与`EnvironmentPlugin`存在潜在冲突

### 1.2 解决方案

采用**方案B: 彻底迁移到Vite原生import.meta.env**

**核心改动**:
- 将所有`process.env.VUE_APP_*`替换为`import.meta.env.VITE_*`
- 修改所有.env文件,将变量前缀从`VUE_APP_`改为`VITE_`
- 简化vite.config.js,删除`EnvironmentPlugin`配置
- 利用Vite原生能力自动加载环境变量

---

## 2. KISS原则评估

### 2.1 四个关键问题

**1. "这是个真问题还是臆想出来的?"**
✅ **真问题**
- 生产环境实际问题: 文件预览功能因环境变量undefined而失效
- 架构问题: 双重维护导致配置遗漏(5个预览变量未添加到vite.config.js)
- 技术债务: 不符合Vite官方推荐实践

**2. "有更简单的方法吗?"**
⚠️ **存在更简单的临时方案,但不根本**
- 方案A(补充变量): 在vite.config.js添加5行代码,5分钟解决
- 方案B(彻底迁移): 1-2小时工作量,但根本解决架构问题

**选择方案B的理由**:
- 一次性消除双重维护问题
- 未来新增环境变量无需修改vite.config.js
- 符合"治本不治标"的原则

**3. "会破坏什么吗?"**
⚠️ **可控风险,向前兼容**
- 需要修改43个业务文件
- 需要全面回归测试
- 但不会破坏业务逻辑(纯语法替换)
- 不影响Vite未来升级路径

**4. "当前项目真的需要这个功能吗?"**
✅ **值得做**
- 解决当前undefined问题
- 降低长期维护成本(只维护.env)
- 提升代码质量和架构合理性
- 符合团队技术演进方向

### 2.2 数据支撑

✅ **充足的数据支撑方案设计**:
- 已完整梳理所有.env文件的环境变量(14个变量)
- 已分析所有使用process.env的文件(43个文件,94处)
- 已统计使用模式(4种模式,分布明确)
- 已验证无重复实现(无import.meta.env使用)
- 已确认vite.config.js当前配置问题

---

## 3. 调用链路分析

### 3.1 当前调用链路

```
用户访问 → 组件加载
    ↓
组件代码: process.env.VUE_APP_FILE_PIC_PREVIEW_URL
    ↓
Vite构建时处理:
    ├─ define: { 'process.env': {} } ← 定义为空对象
    └─ EnvironmentPlugin({...}) ← 尝试注入变量
    ↓
运行时结果: undefined (因为变量未在EnvironmentPlugin中配置)
    ↓
功能失效: 预览URL拼接为 "undefined?width=undefined&height=undefined&url=..."
```

### 3.2 目标调用链路

```
用户访问 → 组件加载
    ↓
组件代码: import.meta.env.VITE_FILE_PIC_PREVIEW_URL
    ↓
Vite构建时处理:
    └─ 自动加载.env文件 ← Vite原生能力
    └─ 构建时替换为静态值
    ↓
运行时结果: "http://preview.xinyirunscm.com/picview"
    ↓
功能正常: 预览URL正确拼接
```

**优势**:
- 减少1层抽象(无需EnvironmentPlugin)
- 消除配置冲突风险
- 构建时静态替换,运行时性能更好

---

## 4. 详细实施方案

### 4.1 修改.env文件

**文件清单**:
1. `.env.development`
2. `.env.staging`
3. `.env.test1`

**修改内容**: 将所有`VUE_APP_`前缀替换为`VITE_`

**变量映射表**:

| 原变量名 | 新变量名 | 类型 |
|---------|---------|------|
| VUE_APP_BASE_API | VITE_BASE_API | String |
| VUE_APP_FILE_SYSTEM_UPLOAD_URL | VITE_FILE_SYSTEM_UPLOAD_URL | String |
| VUE_APP_FILE_SYSTEM_APP_KEY | VITE_FILE_SYSTEM_APP_KEY | String |
| VUE_APP_FILE_SYSTEM_SECRET_KEY | VITE_FILE_SYSTEM_SECRET_KEY | String |
| VUE_APP_FILE_PIC_PREVIEW_URL | VITE_FILE_PIC_PREVIEW_URL | String |
| VUE_APP_FILE_PICS_PREVIEW_URL | VITE_FILE_PICS_PREVIEW_URL | String |
| VUE_APP_FILE_ONLINE_PREVIEW_URL | VITE_FILE_ONLINE_PREVIEW_URL | String |
| VUE_APP_FILE_ONLINE_PREVIEW_WIDTH | VITE_FILE_ONLINE_PREVIEW_WIDTH | String |
| VUE_APP_FILE_ONLINE_PREVIEW_HEIGHT | VITE_FILE_ONLINE_PREVIEW_HEIGHT | String |
| VUE_APP_FILE_UPLOAD_URL | VITE_FILE_UPLOAD_URL | String |
| VUE_APP_WEBSOCKET_NOTICE | VITE_WEBSOCKET_NOTICE | String |
| VUE_APP_Version | VITE_VERSION | String |
| VUE_APP_Tenant | VITE_TENANT | String |
| VUE_APP_TENANT_ID | VITE_TENANT_ID | String |

**特殊处理**:
- `.env.staging`和`.env.test1`缺少`VUE_APP_TENANT_ID`,需要补充添加
- 保持值不变,只修改变量名

**示例 (.env.development修改后)**:
```bash
# just a flag
ENV = 'development'

# base api
VITE_BASE_API = '/scm'

# 文件系统
VITE_FILE_SYSTEM_UPLOAD_URL = '/fs'
VITE_FILE_SYSTEM_APP_KEY = '8a90e44e-2a14-5c02-b3a5-95a1ce3a9eb6'
VITE_FILE_SYSTEM_SECRET_KEY = '1d7ee618-2fcb-5ec3-b0b2-d6df9115301d'

# 文件预览url
VITE_FILE_PIC_PREVIEW_URL = 'http://preview.xinyirunscm.com/picview'
VITE_FILE_PICS_PREVIEW_URL = 'http://preview.xinyirunscm.com/picturesPreview'
VITE_FILE_ONLINE_PREVIEW_URL = 'http://preview.xinyirunscm.com/onlinePreview'
VITE_FILE_ONLINE_PREVIEW_WIDTH = '200'
VITE_FILE_ONLINE_PREVIEW_HEIGHT = '150'

# 文件上传url
VITE_FILE_UPLOAD_URL = 'http://file.xinyirunscm.com/'

# websocket
VITE_WEBSOCKET_NOTICE = '/scm/notice'

# 版本号
VITE_VERSION = '1.0.0'

# 多租户配置
VITE_TENANT = 'false'
VITE_TENANT_ID = 'scm_tenant_20250519_001'
```

---

### 4.2 修改vite.config.js

**文件**: `vite.config.js`

**删除内容**:
1. 删除`import EnvironmentPlugin from 'vite-plugin-environment'` (第6行)
2. 简化`define`配置 (第19-22行)
3. 删除`EnvironmentPlugin`插件配置 (第33-43行)

**修改前**:
```javascript
import EnvironmentPlugin from 'vite-plugin-environment'

export default defineConfig(() => {
  return {
    define: {
      global: 'globalThis',
      'process.env': {}  // ← 删除
    },
    plugins: [
      vue(),
      vue2Jsx({ injectH: true }),
      requireContext(),
      // ← 删除整个EnvironmentPlugin配置
      EnvironmentPlugin({
        NODE_ENV: 'production',
        VUE_APP_BASE_API: '/scm',
        // ... 其他变量
      }),
      // 其他插件...
    ]
  }
})
```

**修改后**:
```javascript
// ✅ 删除EnvironmentPlugin导入

export default defineConfig(() => {
  return {
    define: {
      global: 'globalThis'
      // ✅ 删除process.env定义
    },
    plugins: [
      vue(),
      vue2Jsx({ injectH: true }),
      requireContext(),
      // ✅ 删除EnvironmentPlugin配置,Vite自动加载.env
      // 其他插件...
    ]
  }
})
```

**原理**: Vite原生自动加载`.env`文件中的`VITE_`前缀变量,无需任何配置

---

### 4.3 修改业务代码

**影响范围**: 43个文件,94处代码

**替换规则**:
```javascript
// 替换前
process.env.VUE_APP_BASE_API
process.env.VUE_APP_FILE_PIC_PREVIEW_URL
process.env.VUE_APP_Tenant

// 替换后
import.meta.env.VITE_BASE_API
import.meta.env.VITE_FILE_PIC_PREVIEW_URL
import.meta.env.VITE_TENANT
```

**分模块修改文件清单**:

#### 模块1: 文件预览组件 (6个文件)
1. `src/components/50_preview_card/preview_card.vue`
2. `src/components/50_preview_card/preview_card_new.vue`
3. `src/components/50_preview_card/preview_card_zl.vue`
4. `src/components/50_preview_card/preview_card_video_zl.vue`
5. `src/components/50_preview_card/preview_process.vue`
6. `src/components/51_preview_description/index.vue`

**典型修改示例 (preview_card.vue:207-212)**:
```javascript
// 修改前
init () {
  const base64_encode = encodeURIComponent(Base64.encode(this.url))
  this.dataJson.preview_online_url =
    process.env.VUE_APP_FILE_ONLINE_PREVIEW_URL + '?url=' + base64_encode
  this.dataJson.preview_pic_url =
    process.env.VUE_APP_FILE_PIC_PREVIEW_URL +
    '?width=' + process.env.VUE_APP_FILE_ONLINE_PREVIEW_WIDTH +
    '&height=' + process.env.VUE_APP_FILE_ONLINE_PREVIEW_HEIGHT +
    '&url=' + base64_encode
}

// 修改后
init () {
  const base64_encode = encodeURIComponent(Base64.encode(this.url))
  this.dataJson.preview_online_url =
    import.meta.env.VITE_FILE_ONLINE_PREVIEW_URL + '?url=' + base64_encode
  this.dataJson.preview_pic_url =
    import.meta.env.VITE_FILE_PIC_PREVIEW_URL +
    '?width=' + import.meta.env.VITE_FILE_ONLINE_PREVIEW_WIDTH +
    '&height=' + import.meta.env.VITE_FILE_ONLINE_PREVIEW_HEIGHT +
    '&url=' + base64_encode
}
```

#### 模块2: 文件上传组件 (3个文件)
1. `src/components/10_file/SimpleUpload/index.vue`
2. `src/components/10_file/SimpleUploadMutilFile/index.vue`
3. `src/components/10_file/SimpleApkUpload/index.vue`

**典型修改示例**:
```javascript
// 修改前
fsRequest.post(
  this.getActionUrl() +
  '?app_key=' + process.env.VUE_APP_FILE_SYSTEM_APP_KEY +
  '&secret_key=' + process.env.VUE_APP_FILE_SYSTEM_SECRET_KEY,
  param, config
)

// 修改后
fsRequest.post(
  this.getActionUrl() +
  '?app_key=' + import.meta.env.VITE_FILE_SYSTEM_APP_KEY +
  '&secret_key=' + import.meta.env.VITE_FILE_SYSTEM_SECRET_KEY,
  param, config
)
```

#### 模块3: 工具类文件 (4个文件)
1. `src/utils/request.js`
2. `src/utils/fsRequest.js`
3. `src/utils/tenant.js`
4. `src/utils/fetchConfig.js`

#### 模块4: AI相关组件 (5个文件)
1. `src/components/70_ai/api/workflowService.js`
2. `src/components/70_ai/api/aiChatService.js`
3. `src/components/70_ai/api/ragService.js`
4. `src/components/70_ai/components/workflow/utils/workflowApi.js`
5. `src/components/70_ai/components/rag/utils/sseUtils.js`

#### 模块5: 系统管理视图 (6个文件)
1. `src/views/10_system/config/config.vue`
2. `src/views/10_system/dictdata/dictdata.vue`
3. `src/views/10_system/dicttype/dicttype.vue`
4. `src/views/10_system/dicttype/dialog/50_import/index.vue`
5. `src/views/10_system/pages/page/page.vue`
6. `src/views/10_system/schedule/schedule.vue`

#### 模块6: 主数据管理视图 (9个文件)
1. `src/views/20_master/address/address.vue`
2. `src/views/20_master/user/userAvatar.vue`
3. `src/views/20_master/staff/dialog/40_view/index.vue`
4. `src/views/20_master/org/right/sub_template/org.vue`
5. `src/views/20_master/enterprise/tabs/10_list/index.vue`
6. `src/views/20_master/enterprise/dialog/list/list.vue`
7-9. `src/views/20_master/enterprise/dialog/selecttablelist/*` (3个文件)

#### 模块7: 其他文件 (10个文件)
1. `src/views/login/index.vue`
2. `src/views/00_platform/signup/index.vue`
3. `src/views/40_business/delivery/tabs/list.vue`
4. `src/store/modules/websocket.js`
5. `src/components/markdown/editor.vue`
6. `src/components/CropPicture/cropPrcture.vue`
7. `src/components/70_ai/components/rag/components/FilePreview.vue`
8. `src/api/60_ai/rag.js`

---

### 4.4 使用模式适配

**4种使用模式的替换方式**:

**模式1: URL字符串拼接** (60%, 约56处)
```javascript
// 修改前
`${process.env.VUE_APP_BASE_API}/api/v1/user`
process.env.VUE_APP_FILE_UPLOAD_URL + '/upload'

// 修改后
`${import.meta.env.VITE_BASE_API}/api/v1/user`
import.meta.env.VITE_FILE_UPLOAD_URL + '/upload'
```

**模式2: 对象属性配置** (25%, 约24处)
```javascript
// 修改前
{
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
}

// 修改后
{
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 10000
}
```

**模式3: 条件判断** (10%, 约9处)
```javascript
// 修改前
if (process.env.VUE_APP_Tenant === 'true') {
  // 多租户逻辑
}

// 修改后
if (import.meta.env.VITE_TENANT === 'true') {
  // 多租户逻辑
}
```
**⚠️ 注意**: 保持字符串比较`=== 'true'`,因为环境变量值是字符串,不是布尔值

**模式4: 查询参数拼接** (5%, 约5处)
```javascript
// 修改前
'?app_key=' + process.env.VUE_APP_FILE_SYSTEM_APP_KEY +
'&secret_key=' + process.env.VUE_APP_FILE_SYSTEM_SECRET_KEY

// 修改后
'?app_key=' + import.meta.env.VITE_FILE_SYSTEM_APP_KEY +
'&secret_key=' + import.meta.env.VITE_FILE_SYSTEM_SECRET_KEY
```

---

## 5. 风险分析与缓解措施

### 5.1 风险清单

| 风险项 | 风险等级 | 影响范围 | 缓解措施 |
|-------|---------|---------|---------|
| 文件遗漏,部分代码未替换 | 🔴 高 | 功能失效 | 1. 全局搜索process.env.VUE_APP_<br>2. 构建后检查console错误<br>3. 全面回归测试 |
| .env文件遗漏变量 | 🟡 中 | 特定环境失效 | 1. 对比3个.env文件<br>2. 补充缺失的TENANT_ID |
| 变量名拼写错误 | 🟡 中 | 功能失效 | 1. 保持原变量名逻辑<br>2. 只修改前缀VUE_APP→VITE |
| 布尔值判断错误 | 🟢 低 | 逻辑错误 | 保持字符串比较不变 |
| 构建缓存问题 | 🟢 低 | 变量未更新 | 清理node_modules/.vite缓存 |

### 5.2 缓解措施详细说明

**措施1: 全局搜索验证**
```bash
# 修改完成后执行,确保无遗漏
grep -r "process\.env\.VUE_APP_" src/
# 预期结果: 无匹配项

grep -r "import\.meta\.env\.VITE_" src/
# 预期结果: 约94处匹配
```

**措施2: 构建验证**
```bash
# 开发环境构建
npm run dev:vite

# 检查浏览器console是否有:
# - undefined变量错误
# - import.meta.env相关错误
```

**措施3: 环境变量完整性检查**
```javascript
// 在main.js添加临时验证代码
const requiredEnvVars = [
  'VITE_BASE_API',
  'VITE_FILE_PIC_PREVIEW_URL',
  'VITE_FILE_ONLINE_PREVIEW_URL',
  'VITE_TENANT'
]

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    console.error(`❌ Missing: ${varName}`)
  } else {
    console.log(`✅ ${varName}: ${import.meta.env[varName]}`)
  }
})
```

**措施4: 清理构建缓存**
```bash
# Windows
rmdir /s /q node_modules\.vite
npm run dev:vite

# 或重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

---

## 6. 测试验证计划

### 6.1 单元测试清单

| 测试项 | 测试方法 | 预期结果 |
|-------|---------|---------|
| 环境变量加载 | 浏览器console检查import.meta.env | 所有VITE_*变量有值 |
| 文件预览功能 | 上传文件后点击预览 | URL正确拼接,预览正常 |
| 文件上传功能 | 上传文件 | 上传成功,app_key/secret_key正确 |
| API请求 | 登录/查询等 | baseURL正确,请求成功 |
| WebSocket连接 | 消息通知 | WebSocket连接正常 |
| 多租户逻辑 | 切换租户 | 租户ID正确 |

### 6.2 回归测试清单

**核心功能测试**:
1. ✅ 用户登录
2. ✅ 文件上传(单文件/多文件/APK)
3. ✅ 文件预览(图片/文档/在线预览)
4. ✅ 系统管理(字典/配置/调度)
5. ✅ 主数据管理(用户/员工/企业/地址)
6. ✅ AI功能(RAG知识库/工作流/聊天)
7. ✅ WebSocket通知

**环境测试**:
1. ✅ development环境: `npm run dev:vite`
2. ✅ staging环境构建: `npm run build:vite --mode staging`
3. ✅ test1环境构建: `npm run build:vite --mode test1`

### 6.3 验收标准

**必须通过**:
- [ ] 所有.env文件已修改,无VUE_APP_前缀
- [ ] vite.config.js已简化,无EnvironmentPlugin
- [ ] 43个业务文件已全部修改
- [ ] 全局搜索无process.env.VUE_APP_残留
- [ ] 开发环境启动正常,无console错误
- [ ] 文件预览功能正常(当前问题已解决)
- [ ] 所有核心功能回归测试通过
- [ ] 3个环境构建成功

---

## 7. 实施步骤

### 7.1 实施阶段划分

**阶段1: 环境文件修改** (预计15分钟)
1. 修改`.env.development`
2. 修改`.env.staging`(补充TENANT_ID)
3. 修改`.env.test1`(补充TENANT_ID)
4. 验证3个文件内容一致性

**阶段2: vite.config.js简化** (预计5分钟)
1. 删除`import EnvironmentPlugin`
2. 简化`define`配置
3. 删除`EnvironmentPlugin`插件配置

**阶段3: 业务代码分模块迁移** (预计40-60分钟)
1. 模块1: 文件预览组件(6个文件)
2. 模块2: 文件上传组件(3个文件)
3. 模块3: 工具类(4个文件)
4. 模块4: AI组件(5个文件)
5. 模块5: 系统管理视图(6个文件)
6. 模块6: 主数据视图(9个文件)
7. 模块7: 其他文件(10个文件)

**阶段4: 验证测试** (预计20-30分钟)
1. 全局搜索验证
2. 清理构建缓存
3. 启动开发环境
4. 核心功能回归测试

**总预计时间**: 1.5-2小时

### 7.2 回滚方案

如果实施失败,可以通过Git回滚:

```bash
# 回滚所有修改
git checkout .

# 或回滚特定文件
git checkout .env.development
git checkout vite.config.js
git checkout src/
```

**前提**: 实施前创建Git commit作为还原点

---

## 8. 长期收益分析

### 8.1 维护成本对比

| 项目 | 修改前 | 修改后 | 改进 |
|------|-------|-------|------|
| 新增环境变量 | 需修改.env + vite.config.js | 只需修改.env | ✅ 工作量减半 |
| 配置一致性风险 | 高(双重维护易遗漏) | 低(单一来源) | ✅ 降低错误率 |
| 依赖第三方插件 | 是(vite-plugin-environment) | 否 | ✅ 减少依赖 |
| 符合最佳实践 | 否(模拟Webpack) | 是(Vite原生) | ✅ 技术正确性 |
| 构建性能 | 较慢(插件处理) | 较快(原生替换) | ✅ 性能提升 |

### 8.2 技术债务消除

**消除的技术债务**:
1. ✅ 第三方插件依赖风险
2. ✅ 双重配置维护负担
3. ✅ 配置冲突隐患(define vs EnvironmentPlugin)
4. ✅ 不符合Vite最佳实践的架构

**带来的技术收益**:
1. ✅ 代码更简洁(删除vite.config.js约15行配置)
2. ✅ 维护更容易(只需关注.env)
3. ✅ 性能更好(构建时静态替换)
4. ✅ 未来升级无障碍(符合Vite演进方向)

---

## 9. 附录

### 9.1 完整文件清单

**需修改的文件总数**: 46个

**配置文件** (4个):
1. `.env.development`
2. `.env.staging`
3. `.env.test1`
4. `vite.config.js`

**业务文件** (43个):
- 见"4.3 修改业务代码"章节详细清单

### 9.2 参考资料

- [Vite官方文档 - 环境变量](https://vitejs.dev/guide/env-and-mode.html)
- [Vite官方文档 - 从Webpack迁移](https://vitejs.dev/guide/migration.html)
- [import.meta.env类型定义](https://vitejs.dev/guide/env-and-mode.html#intellisense)

---

## 10. 方案审批

**待解答问题**:
1. 是否同意采用方案B(彻底迁移)?
2. 是否接受1.5-2小时的实施时间?
3. 是否接受全面回归测试的时间成本?
4. 实施时间安排建议?

**批准后下一步**:
- 进入阶段5: 方案审批等待
- 批准后进入阶段6: 代码实施

---

**文档状态**: ✅ 完成,待审批
