# SCM-AI RAG 知识库模块架构设计

> **基于 aideepin 知识库逻辑的完整实现方案**

## 一、设计原则

### 1.1 核心原则
- ✅ **严格遵循 aideepin 原逻辑**：知识库的向量+图谱双索引机制完整保留
- ✅ **弹窗化实现**：所有页面改为 Element UI Dialog 弹窗组件
- ✅ **完整功能不简化**：保留 aideepin 所有核心功能
- ✅ **代码质量标准**：标准注释、逻辑连贯、无缝合怪
- ✅ **适配 scm-ai**：使用 Vue 2.7 + Element UI + Vuex

### 1.2 技术栈对比

| 技术点 | aideepin (源) | scm-ai (目标) |
|--------|--------------|---------------|
| Vue 版本 | Vue 3 | Vue 2.7 |
| UI 框架 | Naive UI | Element UI |
| 状态管理 | Pinia | Vuex |
| 请求库 | axios | axios (scm 封装) |
| 图谱库 | cytoscape | cytoscape (保留) |
| SSE 库 | @microsoft/fetch-event-source | fetch (原生) |

---

## 二、目录结构设计

```
src/components/70_ai/components/rag/
├── dialogs/                                    # 弹窗组件目录
│   ├── KnowledgeBaseManageDialog.vue          # 知识库管理主弹窗（列表+搜索）
│   ├── KnowledgeBaseEditDialog.vue            # 知识库编辑弹窗（创建/编辑配置）
│   ├── KnowledgeBaseDetailDialog.vue          # 知识库详情弹窗（知识项管理）
│   ├── KnowledgeBaseQaDialog.vue              # 知识库问答弹窗（RAG对话）
│   ├── KnowledgeItemEditDialog.vue            # 知识项编辑弹窗（表单创建）
│   ├── KnowledgeItemUploadDialog.vue          # 知识项上传弹窗（文件上传）
│   ├── ItemEmbeddingDialog.vue                # 向量嵌入列表弹窗
│   ├── ItemGraphDialog.vue                    # 知识图谱可视化弹窗
│   ├── KnowledgeReferenceDialog.vue           # 引用资料弹窗（向量引用）
│   ├── KnowledgeGraphRefDialog.vue            # 引用图谱弹窗（图谱引用）
│   ├── KnowledgeSelectorDialog.vue            # 知识库选择器弹窗（多选）
│   └── KnowledgeIndexDialog.vue               # 索引配置弹窗（向量化/图谱化）
│
├── components/                                 # 子组件目录
│   ├── KnowledgeBaseList.vue                  # 知识库列表组件
│   ├── KnowledgeItemList.vue                  # 知识项列表组件
│   ├── ItemEmbeddingList.vue                  # 嵌入列表组件
│   ├── ItemGraphViewer.vue                    # 图谱查看器组件
│   ├── QaMessageList.vue                      # QA消息列表组件
│   ├── ReferenceViewer.vue                    # 引用查看器组件
│   └── FilePreview.vue                        # 文件预览组件
│
├── api/                                        # API服务层
│   └── knowledgeBaseService.js                # 知识库API服务（统一封装）
│
├── store/                                      # Vuex状态管理
│   ├── index.js                               # 知识库 Vuex 模块入口
│   ├── state.js                               # 状态定义
│   ├── getters.js                             # 计算属性
│   ├── mutations.js                           # 同步修改
│   └── actions.js                             # 异步操作
│
├── utils/                                      # 工具函数
│   ├── knowledgeBaseUtils.js                  # 知识库工具函数
│   ├── graphUtils.js                          # 图谱工具函数
│   └── sseUtils.js                            # SSE流式处理工具
│
├── constants/                                  # 常量定义
│   ├── knowledgeBase.js                       # 知识库常量
│   └── indexTypes.js                          # 索引类型常量
│
├── mixins/                                     # 混入
│   └── knowledgeBaseMixin.js                  # 知识库通用混入
│
└── index.js                                    # 统一导出入口
```

---

## 三、核心功能模块设计

### 3.1 知识库管理模块

#### 功能清单
- ✅ 知识库列表（搜索、分页）
- ✅ 创建知识库（基本信息 + 高级配置）
- ✅ 编辑知识库（所有配置项）
- ✅ 删除知识库
- ✅ 公开/私有切换
- ✅ 严格/宽松模式切换

#### 配置项（完整保留）
```javascript
// 基本配置
{
  title: '',              // 标题
  remark: '',            // 描述
  isPublic: false,       // 是否公开
  isStrict: false,       // 严格模式
}

// 文档索引设置（向量）
{
  ingestMaxOverlap: 100,           // 文档切割重叠数量
  ingestTokenEstimator: 'cl100k',  // Token计数器
}

// 文档索引设置（图谱）
{
  ingestModelName: '',    // 模型名称（用于图谱抽取）
  ingestModelId: '',      // 模型ID
}

// 文档召回设置
{
  retrieveMaxResults: 5,    // 召回最大数量
  retrieveMinScore: 0.5,    // 召回最小分数
}

// 大模型参数设置
{
  querySystemMessage: '',      // 系统提示词
  queryLlmTemperature: 0.7,    // temperature参数
}
```

#### 组件映射
| aideepin | scm-ai | 说明 |
|----------|--------|------|
| knowledge-base-manage/index.vue | KnowledgeBaseManageDialog.vue | 列表弹窗 |
| NModal(编辑) | KnowledgeBaseEditDialog.vue | 编辑弹窗 |

---

### 3.2 知识库详情模块

#### 功能清单
- ✅ 知识项列表（搜索、分页、批量选择）
- ✅ 新增知识项（表单方式）
- ✅ 新增知识项（文件上传）
- ✅ 编辑知识项
- ✅ 删除知识项
- ✅ 批量索引（向量化 + 图谱化）
- ✅ 查看嵌入列表
- ✅ 查看知识图谱
- ✅ 文件预览

#### 索引流程
```javascript
// 索引类型选择
indexTypes: ['embedding', 'graphical']

// 索引流程
1. 用户选择知识项（批量）
2. 选择索引类型（向量化/图谱化/两者）
3. 后台异步执行索引
4. 轮询检查索引完成状态
5. 刷新列表显示索引结果
```

#### 组件映射
| aideepin | scm-ai | 说明 |
|----------|--------|------|
| KnowledgeBaseDetail.vue | KnowledgeBaseDetailDialog.vue | 详情弹窗 |
| NModal(新增) | KnowledgeItemEditDialog.vue | 表单编辑 |
| NModal(上传) | KnowledgeItemUploadDialog.vue | 文件上传 |
| NModal(嵌入) | ItemEmbeddingDialog.vue | 嵌入列表 |
| NModal(图谱) | ItemGraphDialog.vue | 图谱可视化 |

---

### 3.3 知识库问答模块

#### 功能清单
- ✅ 知识库选择器（多选）
- ✅ QA 对话界面
- ✅ SSE 流式回复
- ✅ 引用资料展示（向量检索结果）
- ✅ 引用图谱展示（知识图谱可视化）
- ✅ 历史记录加载（分页、滚动加载）
- ✅ 消息删除

#### QA 记录数据结构
```javascript
{
  uuid: '',                  // QA记录UUID
  question: '',             // 用户提问
  answer: '',               // AI回答
  loading: false,           // 是否加载中
  error: false,             // 是否错误
  aiModelPlatform: '',      // AI模型平台
  createTime: '',           // 创建时间

  // 引用数据（懒加载）
  references: [],           // 向量引用列表
  graphRef: {               // 图谱引用
    vertices: [],           // 顶点列表
    edges: []               // 边列表
  }
}
```

#### 组件映射
| aideepin | scm-ai | 说明 |
|----------|--------|------|
| knowledge-base/index.vue | KnowledgeBaseQaDialog.vue | 问答弹窗 |
| ConvKnowledgeSelector.vue | KnowledgeSelectorDialog.vue | 选择器 |
| NModal(引用) | KnowledgeReferenceDialog.vue | 引用资料 |
| NModal(图谱) | KnowledgeGraphRefDialog.vue | 引用图谱 |

---

### 3.4 引用追溯模块

#### 向量引用
```javascript
// 引用数据结构
{
  id: '',           // 嵌入ID
  text: '',         // 文档片段
  embedding: [],    // 向量数组
  score: 0.8        // 相似度分数
}

// 展示逻辑
1. 点击"引用"按钮
2. 懒加载引用数据（如未加载）
3. Collapse折叠面板展示
4. 点击可查看完整文本
```

#### 图谱引用
```javascript
// 图谱数据结构
{
  vertices: [        // 顶点（实体）
    {
      id: '',
      name: '',
      description: ''
    }
  ],
  edges: [           // 边（关系）
    {
      id: '',
      startId: '',
      endId: '',
      label: '',
      description: ''
    }
  ]
}

// 可视化逻辑
1. 使用 cytoscape.js 渲染
2. 点击节点/边显示详情
3. 支持重新布局（cose算法）
4. 交互式图谱探索
```

---

## 四、Vuex 状态管理设计

### 4.1 State 定义
```javascript
// store/state.js
export default {
  // 知识库列表
  myKbInfos: [],           // 我的知识库
  publicKbInfos: [],       // 公开知识库

  // 当前激活
  activeKbUuid: '',        // 当前知识库UUID

  // QA记录映射 (kbUuid -> QaRecords[])
  kbUuidToQaRecords: {},

  // 引用数据映射 (qaRecordUuid -> References[])
  qaRecordToReferences: {},

  // 图谱引用映射 (qaRecordUuid -> GraphRef)
  qaRecordToGraphRef: {},

  // 加载状态
  loadingRecords: {},      // 记录加载状态
  loadingGraphRef: {},     // 图谱加载状态
  loaddingKbList: false,   // 列表加载状态

  // 刷新信号
  reloadKbInfosSignal: false
}
```

### 4.2 Getters 定义
```javascript
// store/getters.js
export default {
  // 获取知识库的QA记录
  getRecords: (state) => (kbUuid) => {
    return state.kbUuidToQaRecords[kbUuid] || []
  },

  // 获取QA记录的引用
  getReferences: (state) => (qaRecordUuid) => {
    return state.qaRecordToReferences[qaRecordUuid] || []
  },

  // 获取QA记录的图谱引用
  getGraphRef: (state) => (qaRecordUuid) => {
    return state.qaRecordToGraphRef[qaRecordUuid] || null
  },

  // 获取当前选中的知识库
  getSelectedKb: (state) => {
    const kbUuid = state.activeKbUuid
    let kb = state.myKbInfos.find(item => item.uuid === kbUuid)
    if (!kb) {
      kb = state.publicKbInfos.find(item => item.uuid === kbUuid)
    }
    return kb
  }
}
```

### 4.3 Mutations 定义
```javascript
// store/mutations.js
export default {
  SET_ACTIVE_KB(state, kbUuid) {
    state.activeKbUuid = kbUuid
  },

  SET_MY_KB_INFOS(state, infos) {
    state.myKbInfos = infos
  },

  SET_PUBLIC_KB_INFOS(state, infos) {
    state.publicKbInfos = infos
  },

  APPEND_QA_RECORD(state, { kbUuid, record }) {
    if (!state.kbUuidToQaRecords[kbUuid]) {
      state.kbUuidToQaRecords[kbUuid] = []
    }
    state.kbUuidToQaRecords[kbUuid].push(record)
  },

  UPDATE_QA_RECORD(state, { kbUuid, recordUuid, data }) {
    const records = state.kbUuidToQaRecords[kbUuid]
    if (records) {
      const record = records.find(r => r.uuid === recordUuid)
      if (record) {
        Object.assign(record, data)
      }
    }
  },

  APPEND_CHUNK(state, { kbUuid, recordUuid, chunk }) {
    const records = state.kbUuidToQaRecords[kbUuid]
    if (records) {
      const record = records.find(r => r.uuid === recordUuid)
      if (record) {
        record.answer += chunk
      }
    }
  },

  DELETE_QA_RECORD(state, { kbUuid, recordUuid }) {
    const records = state.kbUuidToQaRecords[kbUuid]
    if (records) {
      const index = records.findIndex(r => r.uuid === recordUuid)
      if (index !== -1) {
        records.splice(index, 1)
      }
    }
  },

  SET_REFERENCES(state, { qaRecordUuid, references }) {
    state.qaRecordToReferences[qaRecordUuid] = references
  },

  SET_GRAPH_REF(state, { qaRecordUuid, graphRef }) {
    state.qaRecordToGraphRef[qaRecordUuid] = graphRef
  },

  SET_LOADING_RECORDS(state, { kbUuid, loading }) {
    state.loadingRecords[kbUuid] = loading
  },

  SET_LOADING_GRAPH_REF(state, { qaRecordUuid, loading }) {
    state.loadingGraphRef[qaRecordUuid] = loading
  }
}
```

### 4.4 Actions 定义
```javascript
// store/actions.js
export default {
  async loadMyKbList({ commit }) {
    const response = await knowledgeBaseService.searchMine('', 1, 100)
    commit('SET_MY_KB_INFOS', response.data.records)
  },

  async loadPublicKbList({ commit }) {
    const response = await knowledgeBaseService.searchPublic('', 1, 100)
    commit('SET_PUBLIC_KB_INFOS', response.data.records)
  },

  async loadQaRecords({ commit }, { kbUuid, page, pageSize }) {
    commit('SET_LOADING_RECORDS', { kbUuid, loading: true })
    try {
      const response = await knowledgeBaseService.qaRecordSearch(kbUuid, '', page, pageSize)
      return response.data
    } finally {
      commit('SET_LOADING_RECORDS', { kbUuid, loading: false })
    }
  },

  async loadReferences({ commit, state }, qaRecordUuid) {
    // 检查是否已加载
    if (state.qaRecordToReferences[qaRecordUuid]) {
      return
    }

    const response = await knowledgeBaseService.embeddingRef(qaRecordUuid)
    commit('SET_REFERENCES', { qaRecordUuid, references: response.data })
  },

  async loadGraphRef({ commit, state }, qaRecordUuid) {
    // 检查是否已加载
    if (state.qaRecordToGraphRef[qaRecordUuid]) {
      return
    }

    commit('SET_LOADING_GRAPH_REF', { qaRecordUuid, loading: true })
    try {
      const response = await knowledgeBaseService.graphRef(qaRecordUuid)
      commit('SET_GRAPH_REF', { qaRecordUuid, graphRef: response.data })
    } finally {
      commit('SET_LOADING_GRAPH_REF', { qaRecordUuid, loading: false })
    }
  }
}
```

---

## 五、API 服务层设计

### 5.1 服务接口定义
```javascript
// api/knowledgeBaseService.js

/**
 * 知识库API服务
 * 基于aideepin API完整实现
 */
import request from '@/utils/request'

class KnowledgeBaseService {
  constructor() {
    this.baseURL = '/api/knowledge-base'
  }

  // ==================== 知识库管理 ====================

  /**
   * 搜索我的知识库
   */
  searchMine(keyword, currentPage, pageSize, includeOthersPublic = false) {
    return request({
      url: `${this.baseURL}/mine/search`,
      method: 'get',
      params: { keyword, currentPage, pageSize, includeOthersPublic }
    })
  }

  /**
   * 搜索公开知识库
   */
  searchPublic(keyword, currentPage, pageSize) {
    return request({
      url: `${this.baseURL}/public/search`,
      method: 'get',
      params: { keyword, currentPage, pageSize }
    })
  }

  /**
   * 获取知识库详情
   */
  getInfo(uuid) {
    return request({
      url: `${this.baseURL}/info/${uuid}`,
      method: 'get'
    })
  }

  /**
   * 创建或更新知识库
   */
  saveOrUpdate(data) {
    return request({
      url: `${this.baseURL}/saveOrUpdate`,
      method: 'post',
      data
    })
  }

  /**
   * 删除知识库
   */
  delete(uuid) {
    return request({
      url: `${this.baseURL}/del/${uuid}`,
      method: 'post'
    })
  }

  // ==================== 知识项管理 ====================

  /**
   * 搜索知识项
   */
  itemSearch(currentPage, pageSize, kbUuid, keyword = '') {
    return request({
      url: '/api/knowledge-base-item/search',
      method: 'get',
      params: { keyword, kbUuid, currentPage, pageSize }
    })
  }

  /**
   * 创建或更新知识项
   */
  itemSaveOrUpdate(data) {
    return request({
      url: '/api/knowledge-base-item/saveOrUpdate',
      method: 'post',
      data
    })
  }

  /**
   * 删除知识项
   */
  itemDelete(uuid) {
    return request({
      url: `/api/knowledge-base-item/del/${uuid}`,
      method: 'post'
    })
  }

  /**
   * 批量索引知识项
   */
  itemsIndexing(uuids, indexTypes) {
    return request({
      url: `${this.baseURL}/item/indexing-list`,
      method: 'post',
      data: { uuids, indexTypes }
    })
  }

  /**
   * 检查索引是否完成
   */
  indexingCheck() {
    return request({
      url: `${this.baseURL}/indexing/check`,
      method: 'get'
    })
  }

  // ==================== 嵌入和图谱 ====================

  /**
   * 获取嵌入列表
   */
  embeddingList(kbItemUuid, currentPage, pageSize) {
    return request({
      url: `/api/knowledge-base-embedding/list/${kbItemUuid}`,
      method: 'get',
      params: { currentPage, pageSize }
    })
  }

  /**
   * 获取图谱数据
   */
  graphList(kbItemUuid, maxVertextId, maxEdgeId, limit) {
    return request({
      url: `/api/knowledge-base-graph/list/${kbItemUuid}`,
      method: 'get',
      params: { limit, maxEdgeId, maxVertexId: maxVertextId }
    })
  }

  // ==================== QA 问答 ====================

  /**
   * 搜索QA记录
   */
  qaRecordSearch(kbUuid, keyword, currentPage, pageSize) {
    return request({
      url: `${this.baseURL}/qa/search`,
      method: 'get',
      params: { kbUuid, keyword, currentPage, pageSize }
    })
  }

  /**
   * 添加QA记录
   */
  qaRecordAdd(kbUuid, qaContent) {
    return request({
      url: `${this.baseURL}/qa/add/${kbUuid}`,
      method: 'post',
      data: qaContent
    })
  }

  /**
   * 删除QA记录
   */
  qaRecordDelete(uuid) {
    return request({
      url: `${this.baseURL}/qa/del/${uuid}`,
      method: 'post'
    })
  }

  /**
   * SSE流式问答
   */
  qaAskStream(qaRecordUuid, callbacks) {
    return this._sseProcess(
      `/api${this.baseURL}/qa/process/${qaRecordUuid}`,
      callbacks
    )
  }

  /**
   * 获取嵌入引用
   */
  embeddingRef(qaRecordUuid) {
    return request({
      url: `${this.baseURL}/qa/embedding-ref/${qaRecordUuid}`,
      method: 'get'
    })
  }

  /**
   * 获取图谱引用
   */
  graphRef(qaRecordUuid) {
    return request({
      url: `${this.baseURL}/qa/graph-ref/${qaRecordUuid}`,
      method: 'get'
    })
  }

  // ==================== SSE 流式处理 ====================

  _sseProcess(url, callbacks) {
    const {
      onStart = () => {},
      onContent = () => {},
      onThinking = () => {},
      onComplete = () => {},
      onError = () => {}
    } = callbacks

    let cancelled = false
    const controller = new AbortController()

    const connectSSE = async () => {
      try {
        const token = this._getToken()
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': token
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (!cancelled) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          const messages = buffer.split('\n\n')
          buffer = messages.pop() || ''

          for (const message of messages) {
            if (message.trim() === '') continue

            let eventType = null
            let eventData = ''

            const lines = message.split('\n')
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.slice(6).trim()
              } else if (line.startsWith('data:')) {
                eventData = line.slice(5).trim()
              }
            }

            switch (eventType) {
              case '[START]':
                onStart(eventData)
                break
              case '[THINKING]':
                onThinking(eventData)
                break
              case '[ERROR]':
                onError(eventData)
                return
              case '[DONE]':
                onComplete(eventData)
                return
              default:
                if (eventData) {
                  onContent(eventData)
                }
            }
          }
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          onError(error.message)
        }
      }
    }

    connectSSE()

    return () => {
      cancelled = true
      controller.abort()
    }
  }

  _getToken() {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(row => row.trim().startsWith('wms-Token='))
    return tokenCookie ? tokenCookie.split('=')[1] : ''
  }
}

export default new KnowledgeBaseService()
```

---

## 六、组件实现要点

### 6.1 弹窗组件通用模式

#### Element UI Dialog 配置
```vue
<template>
  <el-dialog
    :visible.sync="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <!-- 内容区 -->
    <div class="dialog-content">
      <!-- 具体内容 -->
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'XXXDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      // 组件数据
    }
  },

  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },

    handleCancel() {
      this.handleClose()
    },

    handleConfirm() {
      // 确认逻辑
      this.handleClose()
    }
  }
}
</script>
```

### 6.2 Naive UI → Element UI 组件映射

| Naive UI | Element UI | 说明 |
|----------|-----------|------|
| NModal | el-dialog | 弹窗 |
| NButton | el-button | 按钮 |
| NInput | el-input | 输入框 |
| NDataTable | el-table | 表格 |
| NCheckbox | el-checkbox | 复选框 |
| NSelect | el-select | 下拉选择 |
| NRadioGroup | el-radio-group | 单选组 |
| NCollapse | el-collapse | 折叠面板 |
| NUpload | el-upload | 文件上传 |
| NTag | el-tag | 标签 |
| NCard | el-card | 卡片 |
| NFlex | div.flex | Flex布局 |
| NSpace | div.space | 间距 |

### 6.3 SSE 流式处理适配

#### aideepin 的 SSE 格式
```
event: [START]
data:

event: [THINKING]
data: thinking content

data: content chunk

event: [DONE]
data: final content

event: [ERROR]
data: error message
```

#### scm-ai 适配方案
```javascript
// 使用原生 fetch + TextDecoder
async function sseProcess(url, callbacks) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    }
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    // 解析 SSE 格式
    // ...
  }
}
```

### 6.4 图谱可视化实现

#### cytoscape.js 配置
```javascript
// 初始化图谱
initCytoscape() {
  this.cy = cytoscape({
    container: document.getElementById('graph-container'),
    elements: [],
    style: [
      {
        selector: 'node',
        style: {
          'content': 'data(name)',
          'width': 30,
          'height': 30,
          'background-color': '#409EFF',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      }
    ],
    layout: {
      name: 'cose'
    }
  })
}

// 渲染图谱
renderGraph(vertices, edges) {
  this.cy.$('node').remove()
  this.cy.$('edge').remove()

  const nodes = vertices.map(v => ({
    group: 'nodes',
    data: { id: String(v.id), name: v.name, description: v.description }
  }))

  const edgeElements = edges.map(e => ({
    group: 'edges',
    data: {
      id: String(e.id),
      source: String(e.startId),
      target: String(e.endId),
      label: e.label,
      description: e.description
    }
  }))

  this.cy.add([...nodes, ...edgeElements])
  this.cy.layout({ name: 'cose' }).run()
}
```

---

## 七、实施计划

### 阶段一：基础架构（优先级：最高）
- [ ] 创建目录结构
- [ ] 实现 Vuex 状态管理模块
- [ ] 实现 API 服务层
- [ ] 实现工具函数和常量

### 阶段二：知识库管理（优先级：高）
- [ ] KnowledgeBaseManageDialog.vue - 知识库列表弹窗
- [ ] KnowledgeBaseEditDialog.vue - 知识库编辑弹窗
- [ ] KnowledgeBaseDetailDialog.vue - 知识库详情弹窗
- [ ] KnowledgeItemEditDialog.vue - 知识项编辑弹窗
- [ ] KnowledgeItemUploadDialog.vue - 知识项上传弹窗
- [ ] KnowledgeIndexDialog.vue - 索引配置弹窗

### 阶段三：知识库问答（优先级：高）
- [ ] KnowledgeBaseQaDialog.vue - 知识库问答弹窗
- [ ] KnowledgeSelectorDialog.vue - 知识库选择器弹窗
- [ ] QaMessageList.vue - QA消息列表组件
- [ ] SSE 流式处理实现

### 阶段四：引用追溯（优先级：中）
- [ ] KnowledgeReferenceDialog.vue - 引用资料弹窗
- [ ] KnowledgeGraphRefDialog.vue - 引用图谱弹窗
- [ ] ItemEmbeddingDialog.vue - 嵌入列表弹窗
- [ ] ItemGraphDialog.vue - 知识图谱弹窗
- [ ] 图谱可视化实现

### 阶段五：优化和测试（优先级：低）
- [ ] 性能优化
- [ ] 边界条件处理
- [ ] 错误处理完善
- [ ] 用户体验优化

---

## 八、关键注意事项

### 8.1 功能完整性检查清单

- [ ] **知识库配置**：所有配置项完整实现（基本信息、向量索引、图谱索引、召回设置、LLM参数）
- [ ] **知识项管理**：支持表单创建和文件上传两种方式
- [ ] **索引机制**：向量化和图谱化双索引完整保留
- [ ] **QA 问答**：SSE 流式回复、历史记录、消息删除
- [ ] **引用追溯**：向量引用和图谱引用完整实现
- [ ] **图谱可视化**：cytoscape.js 完整集成
- [ ] **权限控制**：公开/私有、严格/宽松模式

### 8.2 代码质量标准

#### 注释规范
```javascript
/**
 * 函数功能描述
 * @param {类型} 参数名 - 参数说明
 * @returns {类型} 返回值说明
 */

// 业务逻辑说明
// 关键算法说明
// 特殊处理说明

/* 禁止的注释类型 */
// 临时的...
// 迁移的...
// 对齐的...
// 补丁式的...
```

#### 逻辑连贯性
- ✅ 数据流清晰：API → Store → Component
- ✅ 状态管理统一：所有状态通过 Vuex
- ✅ 错误处理完整：try-catch + 用户提示
- ✅ 加载状态管理：防止重复请求

### 8.3 适配要点

#### Vue 2.7 特性
```javascript
// 支持 Composition API（可选）
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const data = ref({})

    onMounted(() => {
      // 初始化
    })

    return {
      data
    }
  }
}
```

#### Element UI 最佳实践
```javascript
// 表格选择
<el-table
  ref="table"
  :data="tableData"
  @selection-change="handleSelectionChange"
>
  <el-table-column type="selection" />
</el-table>

// 文件上传
<el-upload
  :action="uploadUrl"
  :on-success="handleUploadSuccess"
  :before-upload="beforeUpload"
>
  <el-button>上传文件</el-button>
</el-upload>

// 折叠面板
<el-collapse v-model="activeNames">
  <el-collapse-item name="1">
    <template slot="title">标题</template>
    内容
  </el-collapse-item>
</el-collapse>
```

---

## 九、验收标准

### 功能验收
- [ ] 所有 aideepin 知识库功能完整实现
- [ ] 弹窗交互流畅，无卡顿
- [ ] SSE 流式回复正常工作
- [ ] 图谱可视化正确渲染
- [ ] 引用追溯数据准确

### 代码质量验收
- [ ] 无 ESLint 错误
- [ ] 注释清晰规范
- [ ] 逻辑连贯无缝合
- [ ] 无冗余代码

### 性能验收
- [ ] 列表加载 < 2s
- [ ] 弹窗打开 < 500ms
- [ ] 图谱渲染 < 1s
- [ ] SSE 流式无延迟

---

## 十、总结

本设计文档基于 aideepin 知识库的完整逻辑，为 scm-ai 提供了：

1. **完整的功能覆盖**：知识库管理、知识项管理、QA 问答、引用追溯
2. **清晰的架构设计**：目录结构、组件划分、状态管理
3. **详细的实现指导**：API 服务、组件模式、适配方案
4. **严格的质量标准**：功能完整性、代码质量、性能要求

**下一步行动**：
1. 创建基础目录结构
2. 实现 Vuex 状态管理
3. 实现 API 服务层
4. 按阶段逐步实现弹窗组件

---

**文档版本**: v1.0
**创建日期**: 2025-10-06
**作者**: Claude Code
**状态**: 待实施
