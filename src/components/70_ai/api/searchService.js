// AI智能搜索API服务
// 严格参照 AIDeepin index.ts 中的 Search API 实现
import request from '@/utils/request'

// API基础路径 - 对应SCM后端SearchController
const API_BASE = '/api/v1/ai/search'

/**
 * AI搜索 - SSE流式传输
 * 对应AIDeepin: aiSearch(params: AiSearchParams, onMessage: (message: string) => void)
 * 对应后端: SearchController.search(@RequestBody AiSearchRecordVo searchVo) - SSE endpoint
 *
 * @param {Object} params - 搜索参数
 * @param {string} params.question - 用户问题
 * @param {string} params.searchEngine - 搜索引擎类型(可选)
 * @param {number} params.maxResults - 最大结果数(可选)
 * @param {Function} onMessage - SSE消息回调函数
 * @param {Function} onError - SSE错误回调函数(可选)
 * @param {Function} onComplete - SSE完成回调函数(可选)
 * @returns {Object} - 包含close方法的对象，用于关闭SSE连接
 */
export function aiSearch (params, onMessage, onError, onComplete) {
  const eventSource = new EventSource(
    `${API_BASE}/search?` +
    `question=${encodeURIComponent(params.question)}` +
    (params.searchEngine ? `&searchEngine=${params.searchEngine}` : '') +
    (params.maxResults ? `&maxResults=${params.maxResults}` : ''),
    {
      withCredentials: true
    }
  )

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource.close()
      if (onComplete) {
        onComplete()
      }
      return
    }

    try {
      const data = JSON.parse(event.data)
      if (onMessage) {
        onMessage(data)
      }
    } catch (error) {
      console.error('解析SSE消息失败:', error)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE连接错误:', error)
    eventSource.close()
    if (onError) {
      onError(error)
    }
  }

  return {
    close: () => {
      eventSource.close()
    }
  }
}

/**
 * 获取搜索历史记录列表
 * 对应AIDeepin: getSearchHistory(currentPage: number, pageSize: number)
 * 对应后端: SearchController.listByPage(@RequestParam int currentPage, @RequestParam int pageSize)
 * @param {number} currentPage - 当前页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise} - 搜索历史分页数据
 */
export function getSearchHistory (currentPage, pageSize) {
  return request({
    url: `${API_BASE}/list`,
    method: 'post',
    data: {
      current_page: currentPage,
      page_size: pageSize
    }
  })
}

/**
 * 删除搜索历史记录
 * 对应AIDeepin: deleteSearchRecord(id: number)
 * 对应后端: SearchController.delete(@PathVariable Long id)
 * @param {number} id - 搜索记录ID
 * @returns {Promise} - 删除结果
 */
export function deleteSearchRecord (id) {
  return request({
    url: `${API_BASE}/${id}`,
    method: 'delete'
  })
}

/**
 * 获取搜索记录详情
 * 对应AIDeepin: getSearchDetail(id: number)
 * 对应后端: SearchController.getDetail(@PathVariable Long id)
 * @param {number} id - 搜索记录ID
 * @returns {Promise} - 搜索记录详情数据
 */
export function getSearchDetail (id) {
  return request({
    url: `${API_BASE}/${id}`,
    method: 'get'
  })
}

/**
 * 批量删除搜索历史记录
 * 对应AIDeepin: batchDeleteSearchRecords(ids: number[])
 * 对应后端: SearchController.batchDelete(@RequestBody List<Long> ids)
 * @param {number[]} ids - 搜索记录ID数组
 * @returns {Promise} - 删除结果
 */
export function batchDeleteSearchRecords (ids) {
  return request({
    url: `${API_BASE}/batch-delete`,
    method: 'post',
    data: ids
  })
}

/**
 * 清空所有搜索历史记录
 * 对应AIDeepin: clearAllSearchHistory()
 * 对应后端: SearchController.clearAll()
 * @returns {Promise} - 清空结果
 */
export function clearAllSearchHistory () {
  return request({
    url: `${API_BASE}/clear-all`,
    method: 'post'
  })
}

// 导出所有API函数
export default {
  aiSearch,
  getSearchHistory,
  deleteSearchRecord,
  getSearchDetail,
  batchDeleteSearchRecords,
  clearAllSearchHistory
}
