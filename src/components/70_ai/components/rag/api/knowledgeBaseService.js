/**
 * 知识库API服务
 * 基于aideepin API完整实现，使用scm的request封装
 */

import request from '@/utils/request'
import { createKbQaStream } from '../utils/sseUtils'
import { getTenantId } from '@/utils/tenant'

class KnowledgeBaseService {
  constructor () {
    this.baseURL = '/api/v1/ai/knowledge-base'
  }

  // ==================== 知识库管理 ====================

  /**
   * 搜索我的知识库
   * @param {string} keyword - 关键词
   * @param {number} currentPage - 当前页
   * @param {number} pageSize - 每页大小
   * @param {boolean} includeOthersPublic - 是否包含他人公开的知识库
   */
  searchMine (keyword = '', currentPage = 1, pageSize = 20, includeOthersPublic = false) {
    return request({
      url: `${this.baseURL}/mine/search`,
      method: 'get',
      params: {
        keyword,
        currentPage,
        pageSize,
        includeOthersPublic
      }
    })
  }

  /**
   * 搜索公开知识库
   */
  searchPublic (keyword = '', currentPage = 1, pageSize = 20) {
    return request({
      url: `${this.baseURL}/public/search`,
      method: 'get',
      params: {
        keyword,
        currentPage,
        pageSize
      }
    })
  }

  /**
   * 获取知识库详情
   * @param {string} uuid - 知识库UUID
   */
  getInfo (uuid) {
    return request({
      url: `${this.baseURL}/info/${uuid}`,
      method: 'get'
    })
  }

  /**
   * 创建或更新知识库
   * @param {Object} data - 知识库数据
   */
  saveOrUpdate (data) {
    return request({
      url: `${this.baseURL}/saveOrUpdate`,
      method: 'post',
      data
    })
  }

  /**
   * 删除知识库
   * @param {string} uuid - 知识库UUID
   */
  delete (uuid) {
    return request({
      url: `${this.baseURL}/del/${uuid}`,
      method: 'post'
    })
  }

  /**
   * 收藏/取消收藏知识库
   * @param {string} uuid - 知识库UUID
   */
  toggleStar (uuid) {
    return request({
      url: `${this.baseURL}/star/toggle`,
      method: 'post',
      params: { kbUuid: uuid }
    })
  }

  /**
   * 获取收藏的知识库列表
   */
  getStarList (currentPage = 1, pageSize = 20) {
    return request({
      url: `${this.baseURL}/star/mine`,
      method: 'get',
      params: {
        currentPage,
        pageSize
      }
    })
  }

  // ==================== 知识项管理 ====================

  /**
   * 搜索知识项
   * @param {number} currentPage - 当前页
   * @param {number} pageSize - 每页大小
   * @param {string} kbUuid - 知识库UUID
   * @param {string} keyword - 关键词
   */
  itemSearch (currentPage, pageSize, kbUuid, keyword = '') {
    return request({
      url: '/api/v1/ai/knowledge-base-item/search',
      method: 'get',
      params: {
        keyword,
        kbUuid,
        currentPage,
        pageSize
      }
    })
  }

  /**
   * 创建或更新知识项
   * @param {Object} data - 知识项数据
   * @param {boolean} indexAfterCreate - 新增时是否立即索引（默认false）
   */
  itemSaveOrUpdate (data, indexAfterCreate = false) {
    return request({
      url: '/api/v1/ai/knowledge-base-item/saveOrUpdate',
      method: 'post',
      params: {
        indexAfterCreate: indexAfterCreate
      },
      data
    })
  }

  /**
   * 删除知识项
   * @param {string} uuid - 知识项UUID
   */
  itemDelete (uuid) {
    return request({
      url: `/api/v1/ai/knowledge-base-item/del/${uuid}`,
      method: 'post'
    })
  }

  /**
   * 批量索引知识项
   * @param {Array<string>} uuids - 知识项UUID数组
   * @param {Array<string>} indexTypes - 索引类型数组 ['embedding', 'graphical']
   */
  itemsIndexing (uuids, indexTypes) {
    return request({
      url: `${this.baseURL}/item/indexing-list`,
      method: 'post',
      data: {
        uuids,
        indexTypes: indexTypes.join(',') // 将数组转换为逗号分隔的字符串
      }
    })
  }

  /**
   * 检查索引是否完成
   * @returns {Promise} { data: boolean } true表示已完成
   */
  indexingCheck () {
    return request({
      url: `${this.baseURL}/indexing/check`,
      method: 'get'
    })
  }

  // ==================== 嵌入和图谱 ====================

  /**
   * 获取嵌入列表
   * @param {string} kbItemUuid - 知识项UUID
   * @param {number} currentPage - 当前页
   * @param {number} pageSize - 每页大小
   */
  embeddingList (kbItemUuid, currentPage, pageSize) {
    return request({
      url: `/api/v1/ai/knowledge-base-embedding/list/${kbItemUuid}`,
      method: 'get',
      params: {
        currentPage,
        pageSize
      }
    })
  }

  /**
   * 获取图谱数据
   * @param {string} kbItemUuid - 知识项UUID
   * @param {number} maxVertextId - 最大顶点ID
   * @param {number} maxEdgeId - 最大边ID
   * @param {number} limit - 限制数量
   */
  graphList (kbItemUuid, maxVertextId, maxEdgeId, limit) {
    return request({
      url: `/api/v1/ai/knowledge-base-graph/list/${kbItemUuid}`,
      method: 'get',
      params: {
        limit,
        maxEdgeId,
        maxVertexId: maxVertextId
      }
    })
  }

  // ==================== QA 问答 ====================

  /**
   * 搜索QA记录
   * @param {string} kbUuid - 知识库UUID
   * @param {string} keyword - 关键词
   * @param {number} currentPage - 当前页
   * @param {number} pageSize - 每页大小
   */
  qaRecordSearch (kbUuid, keyword = '', currentPage = 1, pageSize = 20) {
    return request({
      url: `${this.baseURL}/qa/search`,
      method: 'get',
      params: {
        kbUuid,
        keyword,
        currentPage,
        pageSize
      }
    })
  }

  /**
   * 添加QA记录
   * @param {string} kbUuid - 知识库UUID
   * @param {Object} qaContent - QA内容 { question, modelName }
   */
  qaRecordAdd (kbUuid, qaContent) {
    return request({
      url: `${this.baseURL}/qa/add/${kbUuid}`,
      method: 'post',
      data: qaContent
    })
  }

  /**
   * 删除QA记录
   * @param {string} uuid - QA记录UUID
   */
  qaRecordDelete (uuid) {
    return request({
      url: `${this.baseURL}/qa/del/${uuid}`,
      method: 'post'
    })
  }

  /**
   * 清空所有QA记录
   */
  qaRecordClear () {
    return request({
      url: `${this.baseURL}/qa/clear`,
      method: 'post'
    })
  }

  /**
   * SSE流式问答
   * @param {string} qaRecordUuid - QA记录UUID
   * @param {Object} callbacks - 回调函数
   * @param {AbortSignal} signal - 中止信号
   * @returns {Function} 取消函数
   */
  qaAskStream (qaRecordUuid, callbacks, signal = null) {
    return createKbQaStream(qaRecordUuid, callbacks, signal)
  }

  /**
   * 获取嵌入引用
   * @param {string} qaRecordUuid - QA记录UUID
   */
  embeddingRef (qaRecordUuid) {
    return request({
      url: `${this.baseURL}/qa/embedding-ref/${qaRecordUuid}`,
      method: 'get'
    })
  }

  /**
   * 获取图谱引用
   * @param {string} qaRecordUuid - QA记录UUID
   */
  graphRef (qaRecordUuid) {
    return request({
      url: `${this.baseURL}/qa/graph-ref/${qaRecordUuid}`,
      method: 'get'
    })
  }

  /**
   * 批量创建知识项（从前端上传的文件数组）
   * @param {Object} params - 参数对象
   * @param {string} params.kbUuid - 知识库UUID
   * @param {Array} params.doc_att_files - 文件数组
   * @param {boolean} params.indexAfterUpload - 是否立即索引
   * @returns {Promise}
   */
  batchCreateItems (params) {
    return request({
      url: `${this.baseURL}/item/batch-create`,
      method: 'post',
      data: {
        kbUuid: params.kbUuid,
        doc_att_files: params.doc_att_files,
        indexAfterUpload: params.indexAfterUpload
      }
    })
  }

  // ==================== 文件操作 ====================

  /**
   * 加载文件内容
   * @param {string} fileUrl - 文件URL
   */
  loadFileContent (fileUrl) {
    return request({
      url: fileUrl,
      method: 'get',
      responseType: 'text'
    })
  }

  /**
   * 构建上传URL
   * @param {string} kbUuid - 知识库UUID
   * @param {boolean} indexAfterUpload - 是否上传后立即索引
   */
  getUploadUrl (kbUuid, indexAfterUpload = false) {
    const baseURL = process.env.VUE_APP_BASE_API || ''
    return `${baseURL}/api/v1/ai/knowledge-base/upload/${kbUuid}?indexAfterUpload=${indexAfterUpload}`
  }

  /**
   * 获取上传请求头
   */
  getUploadHeaders () {
    const token = this._getToken()
    const headers = {
      'wms-Token': token,
      'Authorization': token
    }

    // 添加租户ID（使用统一方法）
    const tenantId = getTenantId()
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId
    }

    return headers
  }

  // ==================== 私有方法 ====================

  /**
   * 获取Token（从Cookie）
   * @private
   */
  _getToken () {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(row => row.trim().startsWith('wms-Token='))
    return tokenCookie ? tokenCookie.split('=')[1] : ''
  }
}

// 创建单例实例
const knowledgeBaseService = new KnowledgeBaseService()

export default knowledgeBaseService
export { KnowledgeBaseService }
