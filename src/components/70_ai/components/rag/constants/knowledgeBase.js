/**
 * 知识库常量定义
 * 基于aideepin知识库逻辑
 */

// Token计数器选项
export const TOKEN_ESTIMATOR = [
  { label: 'Openai', value: 'openai' },
  { label: '通义千问', value: 'qwen' },
  { label: 'Huggingface', value: 'huggingface' }
]

// 知识库类型
export const KB_TYPE = {
  MINE: 'mine',
  PUBLIC: 'public'
}

// 知识库空数据模板
export const EMPTY_KB_INFO = {
  id: '0',
  uuid: '',
  title: '',
  remark: '',
  isPublic: false,
  isStrict: true,
  ingestMaxOverlap: 200, // LangChain推荐值：200 tokens（10%重叠率，chunk_size=2000）
  ingestTokenEstimator: '',
  ingestModelName: '',
  ingestModelId: '',
  retrieveMaxResults: 5, // LangChain推荐值：5（适用于大多数场景）
  retrieveMinScore: 0.5, // LangChain推荐值：0.5（过滤低质量结果）
  querySystemMessage: '',
  queryLlmTemperature: 0
}

// 知识项空数据模板
export const EMPTY_KB_ITEM = {
  id: '0',
  uuid: '',
  kbId: '0',
  kbUuid: '',
  title: '',
  brief: '',
  remark: '',
  sourceFileName: '',
  sourceFileUrl: ''
}

// QA记录空数据模板
export const EMPTY_QA_RECORD = {
  uuid: '',
  question: '',
  answer: '',
  loading: false,
  error: false,
  aiModelPlatform: '',
  createTime: ''
}

// 文件类型映射
export const FILE_MIME_TYPE_MAP = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  html: 'text/html',
  txt: 'text/plain'
}

// 支持的文件扩展名
export const SUPPORTED_FILE_EXTENSIONS = ['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']

// 文件大小限制（字节）
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
