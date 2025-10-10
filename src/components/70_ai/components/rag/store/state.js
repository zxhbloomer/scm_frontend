/**
 * 知识库Vuex状态定义
 * 基于aideepin的知识库状态管理逻辑
 */

export default {
  // 知识库列表
  myKbInfos: [], // 我的知识库列表
  publicKbInfos: [], // 公开知识库列表

  // 当前激活的知识库
  activeKbUuid: '', // 当前选中的知识库UUID
  selectedKbType: 'mine', // 当前选择的知识库类型 'mine' | 'public'

  // QA记录映射表 (kbUuid -> QaRecords[])
  kbUuidToQaRecords: {},

  // 引用数据映射表 (qaRecordUuid -> References[])
  qaRecordToReferences: {},

  // 图谱引用映射表 (qaRecordUuid -> GraphRef)
  qaRecordToGraphRef: {},

  // 知识库收藏信息映射表 (kbUuid -> StarInfo)
  kbUuidToStarInfo: {},

  // 加载状态
  loadingRecords: {}, // 记录加载状态映射 (kbUuid -> boolean)
  loadingGraphRef: {}, // 图谱加载状态映射 (qaRecordUuid -> boolean)
  loaddingKbList: false, // 知识库列表加载状态

  // 刷新信号
  reloadKbInfosSignal: false // 知识库列表刷新信号
}
