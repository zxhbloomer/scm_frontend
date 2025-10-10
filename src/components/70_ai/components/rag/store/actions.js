/**
 * 知识库Vuex异步操作
 * 基于aideepin的知识库异步逻辑
 */

import knowledgeBaseService from '../api/knowledgeBaseService'

export default {
  /**
   * 加载我的知识库列表
   */
  async loadMyKbList ({ commit }, { keyword = '', currentPage = 1, pageSize = 100 } = {}) {
    commit('SET_LOADING_KB_LIST', true)
    try {
      const response = await knowledgeBaseService.searchMine(keyword, currentPage, pageSize)
      const infos = response.data?.records || response.records || response || []
      commit('SET_MY_KB_INFOS', infos)
      return infos
    } finally {
      commit('SET_LOADING_KB_LIST', false)
    }
  },

  /**
   * 加载公开知识库列表
   */
  async loadPublicKbList ({ commit }, { keyword = '', currentPage = 1, pageSize = 100 } = {}) {
    commit('SET_LOADING_KB_LIST', true)
    try {
      const response = await knowledgeBaseService.searchPublic(keyword, currentPage, pageSize)
      const infos = response.data?.records || response.records || response || []
      commit('SET_PUBLIC_KB_INFOS', infos)
      return infos
    } finally {
      commit('SET_LOADING_KB_LIST', false)
    }
  },

  /**
   * 设置激活的知识库
   */
  setActiveKb ({ commit }, kbUuid) {
    commit('SET_ACTIVE_KB', kbUuid)
  },

  /**
   * 设置知识库类型
   */
  setKbType ({ commit }, type) {
    commit('SET_SELECTED_KB_TYPE', type)
  },

  /**
   * 加载QA记录列表
   */
  async loadQaRecords ({ commit }, { kbUuid, keyword = '', page = 1, pageSize = 20 }) {
    commit('SET_LOADING_RECORDS', { kbUuid, loading: true })
    try {
      const response = await knowledgeBaseService.qaRecordSearch(kbUuid, keyword, page, pageSize)
      const records = response.data?.records || response.records || response || []
      return {
        records,
        total: response.data?.total || response.total || records.length
      }
    } finally {
      commit('SET_LOADING_RECORDS', { kbUuid, loading: false })
    }
  },

  /**
   * 添加QA记录
   */
  appendQaRecord ({ commit }, { kbUuid, record }) {
    commit('APPEND_QA_RECORD', { kbUuid, record })
  },

  /**
   * 批量添加QA记录
   */
  appendQaRecords ({ commit }, { kbUuid, records }) {
    commit('APPEND_QA_RECORDS', { kbUuid, records })
  },

  /**
   * 在开头添加QA记录
   */
  unshiftQaRecord ({ commit }, { kbUuid, record }) {
    commit('UNSHIFT_QA_RECORD', { kbUuid, record })
  },

  /**
   * 更新QA记录
   */
  updateQaRecord ({ commit }, { kbUuid, recordUuid, data }) {
    commit('UPDATE_QA_RECORD', { kbUuid, recordUuid, data })
  },

  /**
   * 更新第一条QA记录
   */
  updateFirstQaRecord ({ commit }, { kbUuid, data }) {
    commit('UPDATE_FIRST_QA_RECORD', { kbUuid, data })
  },

  /**
   * 追加内容块
   */
  appendChunk ({ commit }, { kbUuid, recordUuid, chunk }) {
    commit('APPEND_CHUNK', { kbUuid, recordUuid, chunk })
  },

  /**
   * 删除QA记录
   */
  deleteQaRecord ({ commit }, { kbUuid, recordUuid }) {
    commit('DELETE_QA_RECORD', { kbUuid, recordUuid })
  },

  /**
   * 清空QA记录
   */
  clearQaRecords ({ commit }, kbUuid) {
    commit('CLEAR_QA_RECORDS', kbUuid)
  },

  /**
   * 加载引用列表（懒加载）
   */
  async loadReferences ({ commit, state }, qaRecordUuid) {
    // 检查是否已加载
    if (state.qaRecordToReferences[qaRecordUuid]) {
      return state.qaRecordToReferences[qaRecordUuid]
    }

    try {
      const response = await knowledgeBaseService.embeddingRef(qaRecordUuid)
      const references = response.data || response || []
      commit('SET_REFERENCES', { qaRecordUuid, references })
      return references
    } catch (error) {
      console.error('加载引用失败:', error)
      commit('SET_REFERENCES', { qaRecordUuid, references: [] })
      return []
    }
  },

  /**
   * 加载图谱引用（懒加载）
   */
  async loadGraphRef ({ commit, state }, qaRecordUuid) {
    // 检查是否已加载
    if (state.qaRecordToGraphRef[qaRecordUuid]) {
      return state.qaRecordToGraphRef[qaRecordUuid]
    }

    commit('SET_LOADING_GRAPH_REF', { qaRecordUuid, loading: true })
    try {
      const response = await knowledgeBaseService.graphRef(qaRecordUuid)
      const graphRef = response.data || response || { vertices: [], edges: [] }
      commit('SET_GRAPH_REF', { qaRecordUuid, graphRef })
      return graphRef
    } catch (error) {
      console.error('加载图谱引用失败:', error)
      const emptyGraphRef = { vertices: [], edges: [] }
      commit('SET_GRAPH_REF', { qaRecordUuid, graphRef: emptyGraphRef })
      return emptyGraphRef
    } finally {
      commit('SET_LOADING_GRAPH_REF', { qaRecordUuid, loading: false })
    }
  },

  /**
   * 设置收藏信息列表
   */
  setStarInfos ({ commit }, starInfos) {
    commit('APPEND_STAR_INFOS', starInfos)
  },

  /**
   * 更新收藏状态
   */
  updateStarInfo ({ commit }, starInfo) {
    commit('INSERT_OR_UPDATE_STAR_INFO', starInfo)
  },

  /**
   * 设置刷新信号
   */
  setReloadSignal ({ commit }, signal) {
    commit('SET_RELOAD_KB_INFOS_SIGNAL', signal)
  }
}
