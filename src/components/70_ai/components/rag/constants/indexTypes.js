/**
 * 索引类型常量定义
 */

// 索引类型
export const INDEX_TYPE = {
  EMBEDDING: 'embedding', // 向量化
  GRAPHICAL: 'graphical' // 图谱化
}

// 索引类型选项
export const INDEX_TYPE_OPTIONS = [
  { label: '向量化', value: INDEX_TYPE.EMBEDDING },
  { label: '图谱化', value: INDEX_TYPE.GRAPHICAL }
]

// 默认索引类型
export const DEFAULT_INDEX_TYPES = [INDEX_TYPE.EMBEDDING]

// 索引状态
export const INDEX_STATUS = {
  PENDING: 'pending', // 待索引
  INDEXING: 'indexing', // 索引中
  COMPLETED: 'completed', // 已完成
  FAILED: 'failed' // 失败
}

// 索引检查间隔（毫秒）
export const INDEX_CHECK_INTERVAL = 3000
