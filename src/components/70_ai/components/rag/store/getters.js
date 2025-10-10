/**
 * 知识库Vuex计算属性
 * 基于aideepin的知识库状态计算逻辑
 */

export default {
  /**
   * 获取指定知识库的QA记录列表
   * @param {Object} state - 状态对象
   * @returns {Function} 返回获取函数
   */
  getRecords: (state) => (kbUuid) => {
    return state.kbUuidToQaRecords[kbUuid] || []
  },

  /**
   * 获取指定QA记录的引用列表
   * @param {Object} state - 状态对象
   * @returns {Function} 返回获取函数
   */
  getReferences: (state) => (qaRecordUuid) => {
    return state.qaRecordToReferences[qaRecordUuid] || []
  },

  /**
   * 获取指定QA记录的图谱引用
   * @param {Object} state - 状态对象
   * @returns {Function} 返回获取函数
   */
  getGraphRef: (state) => (qaRecordUuid) => {
    return state.qaRecordToGraphRef[qaRecordUuid] || null
  },

  /**
   * 检查图谱引用是否正在加载
   * @param {Object} state - 状态对象
   * @returns {Function} 返回获取函数
   */
  isLoadingGraphRef: (state) => (qaRecordUuid) => {
    return state.loadingGraphRef[qaRecordUuid] || false
  },

  /**
   * 检查QA记录是否正在加载
   * @param {Object} state - 状态对象
   * @returns {Function} 返回获取函数
   */
  isLoadingRecords: (state) => (kbUuid) => {
    return state.loadingRecords[kbUuid] || false
  },

  /**
   * 获取当前选中的知识库信息
   * @param {Object} state - 状态对象
   * @returns {Object|null} 知识库信息对象
   */
  getSelectedKb: (state) => {
    const kbUuid = state.activeKbUuid
    if (!kbUuid) return null

    // 先在我的知识库中查找
    let kbInfo = state.myKbInfos.find(item => item.uuid === kbUuid)
    if (kbInfo) return kbInfo

    // 再在公开知识库中查找
    kbInfo = state.publicKbInfos.find(item => item.uuid === kbUuid)
    return kbInfo || null
  },

  /**
   * 获取知识库的收藏状态
   * @param {Object} state - 状态对象
   * @returns {Function} 返回获取函数
   */
  getKbStarStatus: (state) => (kbUuid) => {
    const starInfo = state.kbUuidToStarInfo[kbUuid]
    return starInfo ? starInfo.star : false
  },

  /**
   * 获取所有知识库列表（我的+公开）
   * @param {Object} state - 状态对象
   * @returns {Array} 知识库列表
   */
  getAllKbInfos: (state) => {
    return [...state.myKbInfos, ...state.publicKbInfos]
  }
}
