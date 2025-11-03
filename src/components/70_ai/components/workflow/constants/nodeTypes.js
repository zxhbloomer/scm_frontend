/**
 * Workflow 节点类型常量
 */

// 节点类型枚举
export const NODE_TYPES = {
  START: 'start',
  END: 'end',
  LLM: 'answer', // 对应LLM节点
  CLASSIFIER: 'classifier',
  BRANCH: 'switcher', // 对应分支节点
  TEMPLATE: 'template',
  DOCUMENT_EXTRACT: 'documentextractor',
  KEYWORD_EXTRACT: 'keywordextractor',
  FAQ_EXTRACT: 'faqextractor',
  KNOWLEDGE_RETRIEVAL: 'knowledgeretrieval',
  HTTP_REQUEST: 'httprequest',
  HUMAN_FEEDBACK: 'humanfeedback',
  EMAIL_SEND: 'mailsend'
}

// 节点类型中文名称映射
export const NODE_TYPE_LABELS = {
  [NODE_TYPES.START]: '开始',
  [NODE_TYPES.END]: '结束',
  [NODE_TYPES.LLM]: 'LLM',
  [NODE_TYPES.CLASSIFIER]: '分类器',
  [NODE_TYPES.BRANCH]: '条件分支',
  [NODE_TYPES.TEMPLATE]: '模板转换',
  [NODE_TYPES.DOCUMENT_EXTRACT]: '文档提取',
  [NODE_TYPES.KEYWORD_EXTRACT]: '关键词提取',
  [NODE_TYPES.FAQ_EXTRACT]: 'FAQ提取',
  [NODE_TYPES.KNOWLEDGE_RETRIEVAL]: '知识检索',
  [NODE_TYPES.HTTP_REQUEST]: 'HTTP请求',
  [NODE_TYPES.HUMAN_FEEDBACK]: '人工反馈',
  [NODE_TYPES.EMAIL_SEND]: '邮件发送'
}

// 节点分类
export const NODE_CATEGORIES = {
  CONTROL: 'control', // 控制节点
  LLM: 'llm', // LLM节点
  TOOLS: 'tools', // 工具节点
  OUTPUT: 'output' // 输出节点
}

// 节点类型分类映射
export const NODE_TYPE_CATEGORY_MAP = {
  [NODE_TYPES.START]: NODE_CATEGORIES.CONTROL,
  [NODE_TYPES.END]: NODE_CATEGORIES.CONTROL,
  [NODE_TYPES.CLASSIFIER]: NODE_CATEGORIES.CONTROL,
  [NODE_TYPES.BRANCH]: NODE_CATEGORIES.CONTROL,
  [NODE_TYPES.LLM]: NODE_CATEGORIES.LLM,
  [NODE_TYPES.TEMPLATE]: NODE_CATEGORIES.TOOLS,
  [NODE_TYPES.DOCUMENT_EXTRACT]: NODE_CATEGORIES.TOOLS,
  [NODE_TYPES.KEYWORD_EXTRACT]: NODE_CATEGORIES.TOOLS,
  [NODE_TYPES.FAQ_EXTRACT]: NODE_CATEGORIES.TOOLS,
  [NODE_TYPES.KNOWLEDGE_RETRIEVAL]: NODE_CATEGORIES.TOOLS,
  [NODE_TYPES.HTTP_REQUEST]: NODE_CATEGORIES.TOOLS,
  [NODE_TYPES.HUMAN_FEEDBACK]: NODE_CATEGORIES.OUTPUT,
  [NODE_TYPES.EMAIL_SEND]: NODE_CATEGORIES.OUTPUT
}

// 节点图标映射 (使用Element UI图标)
export const NODE_TYPE_ICONS = {
  [NODE_TYPES.START]: 'el-icon-video-play',
  [NODE_TYPES.END]: 'el-icon-video-pause',
  [NODE_TYPES.LLM]: 'el-icon-chat-dot-round',
  [NODE_TYPES.CLASSIFIER]: 'el-icon-guide',
  [NODE_TYPES.BRANCH]: 'el-icon-share',
  [NODE_TYPES.TEMPLATE]: 'el-icon-document',
  [NODE_TYPES.DOCUMENT_EXTRACT]: 'el-icon-document-copy',
  [NODE_TYPES.KEYWORD_EXTRACT]: 'el-icon-key',
  [NODE_TYPES.FAQ_EXTRACT]: 'el-icon-question',
  [NODE_TYPES.KNOWLEDGE_RETRIEVAL]: 'el-icon-reading',
  [NODE_TYPES.HTTP_REQUEST]: 'el-icon-link',
  [NODE_TYPES.HUMAN_FEEDBACK]: 'el-icon-user',
  [NODE_TYPES.EMAIL_SEND]: 'el-icon-message'
}

// 节点颜色映射
export const NODE_TYPE_COLORS = {
  [NODE_TYPES.START]: '#67C23A',
  [NODE_TYPES.END]: '#909399',
  [NODE_TYPES.LLM]: '#409EFF',
  [NODE_TYPES.CLASSIFIER]: '#E6A23C',
  [NODE_TYPES.BRANCH]: '#E6A23C',
  [NODE_TYPES.TEMPLATE]: '#909399',
  [NODE_TYPES.DOCUMENT_EXTRACT]: '#409EFF',
  [NODE_TYPES.KEYWORD_EXTRACT]: '#409EFF',
  [NODE_TYPES.FAQ_EXTRACT]: '#409EFF',
  [NODE_TYPES.KNOWLEDGE_RETRIEVAL]: '#409EFF',
  [NODE_TYPES.HTTP_REQUEST]: '#909399',
  [NODE_TYPES.HUMAN_FEEDBACK]: '#E6A23C',
  [NODE_TYPES.EMAIL_SEND]: '#67C23A'
}

// 节点是否允许多个实例
export const NODE_TYPE_MULTIPLE_ALLOWED = {
  [NODE_TYPES.START]: false, // 开始节点只能有一个
  [NODE_TYPES.END]: true,
  [NODE_TYPES.LLM]: true,
  [NODE_TYPES.CLASSIFIER]: true,
  [NODE_TYPES.BRANCH]: true,
  [NODE_TYPES.TEMPLATE]: true,
  [NODE_TYPES.DOCUMENT_EXTRACT]: true,
  [NODE_TYPES.KEYWORD_EXTRACT]: true,
  [NODE_TYPES.FAQ_EXTRACT]: true,
  [NODE_TYPES.KNOWLEDGE_RETRIEVAL]: true,
  [NODE_TYPES.HTTP_REQUEST]: true,
  [NODE_TYPES.HUMAN_FEEDBACK]: true,
  [NODE_TYPES.EMAIL_SEND]: true
}

// 节点默认配置
export const NODE_DEFAULT_CONFIG = {
  [NODE_TYPES.START]: {
    prologue: ''
  },
  [NODE_TYPES.END]: {
    result: ''
  },
  [NODE_TYPES.LLM]: {
    model_name: '',
    prompt: ''
  },
  [NODE_TYPES.CLASSIFIER]: {
    model_name: '',
    categories: []
  },
  [NODE_TYPES.BRANCH]: {
    default_target_node_uuid: '',
    cases: []
  },
  [NODE_TYPES.TEMPLATE]: {
    template: ''
  },
  [NODE_TYPES.DOCUMENT_EXTRACT]: {},
  [NODE_TYPES.KEYWORD_EXTRACT]: {
    model_name: '',
    top_n: 10
  },
  [NODE_TYPES.FAQ_EXTRACT]: {
    model_name: '',
    top_n: 10
  },
  [NODE_TYPES.KNOWLEDGE_RETRIEVAL]: {
    knowledge_base_uuid: '',
    knowledge_base_name: '',
    score: 0.7,
    top_n: 3,
    is_strict: false,
    default_response: ''
  },
  [NODE_TYPES.HTTP_REQUEST]: {
    method: 'GET',
    url: '',
    headers: [],
    params: [],
    text_body: '',
    json_body: {},
    form_data_body: [],
    form_urlencoded_body: [],
    content_type: 'application/json',
    timeout: 10000,
    retry_times: 0,
    clear_html: false
  },
  [NODE_TYPES.HUMAN_FEEDBACK]: {
    tip: ''
  },
  [NODE_TYPES.EMAIL_SEND]: {
    sender_type: 1,
    cc_mails: '',
    to_mails: '',
    subject: '',
    content: '',
    smtp: {
      host: '',
      port: 587
    },
    sender: {
      name: '',
      mail: '',
      password: ''
    }
  }
}
