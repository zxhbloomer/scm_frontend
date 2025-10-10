/**
 * 知识库Vuex同步修改
 * 基于aideepin的知识库状态修改逻辑
 */

import Vue from 'vue'

export default {
  /**
   * 设置当前激活的知识库
   */
  SET_ACTIVE_KB (state, kbUuid) {
    state.activeKbUuid = kbUuid
  },

  /**
   * 设置当前选择的知识库类型
   */
  SET_SELECTED_KB_TYPE (state, type) {
    state.selectedKbType = type
  },

  /**
   * 设置我的知识库列表
   */
  SET_MY_KB_INFOS (state, infos) {
    state.myKbInfos = infos || []
  },

  /**
   * 设置公开知识库列表
   */
  SET_PUBLIC_KB_INFOS (state, infos) {
    state.publicKbInfos = infos || []
  },

  /**
   * 设置知识库列表加载状态
   */
  SET_LOADING_KB_LIST (state, loading) {
    state.loaddingKbList = loading
  },

  /**
   * 设置QA记录加载状态
   */
  SET_LOADING_RECORDS (state, { kbUuid, loading }) {
    Vue.set(state.loadingRecords, kbUuid, loading)
  },

  /**
   * 设置图谱引用加载状态
   */
  SET_LOADING_GRAPH_REF (state, { qaRecordUuid, loading }) {
    Vue.set(state.loadingGraphRef, qaRecordUuid, loading)
  },

  /**
   * 设置知识库列表刷新信号
   */
  SET_RELOAD_KB_INFOS_SIGNAL (state, signal) {
    state.reloadKbInfosSignal = signal
  },

  /**
   * 添加QA记录到列表末尾
   */
  APPEND_QA_RECORD (state, { kbUuid, record }) {
    if (!state.kbUuidToQaRecords[kbUuid]) {
      Vue.set(state.kbUuidToQaRecords, kbUuid, [])
    }
    // 设置其他记录为非加载状态
    state.kbUuidToQaRecords[kbUuid].forEach(item => {
      item.loading = false
    })
    state.kbUuidToQaRecords[kbUuid].push(record)
  },

  /**
   * 批量添加QA记录（用于历史记录加载）
   */
  APPEND_QA_RECORDS (state, { kbUuid, records }) {
    if (!state.kbUuidToQaRecords[kbUuid]) {
      Vue.set(state.kbUuidToQaRecords, kbUuid, [])
    }
    // 反转记录顺序（新的在前）
    state.kbUuidToQaRecords[kbUuid].push(...records.reverse())
  },

  /**
   * 在列表开头添加QA记录
   */
  UNSHIFT_QA_RECORD (state, { kbUuid, record }) {
    if (!state.kbUuidToQaRecords[kbUuid]) {
      Vue.set(state.kbUuidToQaRecords, kbUuid, [])
    }
    state.kbUuidToQaRecords[kbUuid].unshift(record)
  },

  /**
   * 更新指定的QA记录
   */
  UPDATE_QA_RECORD (state, { kbUuid, recordUuid, data }) {
    const records = state.kbUuidToQaRecords[kbUuid]
    if (!records) return

    const record = records.find(r => r.uuid === recordUuid)
    if (record) {
      Object.assign(record, data)
    }
  },

  /**
   * 更新QA记录列表的第一条记录
   */
  UPDATE_FIRST_QA_RECORD (state, { kbUuid, data }) {
    const records = state.kbUuidToQaRecords[kbUuid]
    if (!records || records.length === 0) return

    Object.assign(records[0], data)
  },

  /**
   * 追加内容块到QA记录的回答中
   */
  APPEND_CHUNK (state, { kbUuid, recordUuid, chunk }) {
    const records = state.kbUuidToQaRecords[kbUuid]
    if (!records) return

    const record = records.find(r => r.uuid === recordUuid)
    if (record) {
      record.answer = (record.answer || '') + chunk
    }
  },

  /**
   * 删除QA记录
   */
  DELETE_QA_RECORD (state, { kbUuid, recordUuid }) {
    const records = state.kbUuidToQaRecords[kbUuid]
    if (!records) return

    const index = records.findIndex(r => r.uuid === recordUuid)
    if (index !== -1) {
      records.splice(index, 1)
    }
  },

  /**
   * 清空指定知识库的所有QA记录
   */
  CLEAR_QA_RECORDS (state, kbUuid) {
    Vue.set(state.kbUuidToQaRecords, kbUuid, [])
  },

  /**
   * 设置QA记录的引用列表
   */
  SET_REFERENCES (state, { qaRecordUuid, references }) {
    Vue.set(state.qaRecordToReferences, qaRecordUuid, references || [])
  },

  /**
   * 设置QA记录的图谱引用
   */
  SET_GRAPH_REF (state, { qaRecordUuid, graphRef }) {
    Vue.set(state.qaRecordToGraphRef, qaRecordUuid, graphRef)
  },

  /**
   * 批量添加知识库收藏信息
   */
  APPEND_STAR_INFOS (state, starInfos) {
    if (!starInfos || !Array.isArray(starInfos)) return

    starInfos.forEach(item => {
      // 默认值为true（来自服务器）
      if (item.star === undefined) {
        item.star = true
      }
      Vue.set(state.kbUuidToStarInfo, item.kbUuid, item)
    })
  },

  /**
   * 插入或更新知识库收藏信息
   */
  INSERT_OR_UPDATE_STAR_INFO (state, starInfo) {
    const existData = state.kbUuidToStarInfo[starInfo.kbUuid]
    if (!existData) {
      Vue.set(state.kbUuidToStarInfo, starInfo.kbUuid, starInfo)
    } else {
      existData.star = starInfo.star
    }
  }
}
