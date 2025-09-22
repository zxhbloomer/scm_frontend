const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  // 菜单router
  permission_menus_routers: state => state.permission.menus,
  // 顶部导航栏
  permission_topNav: state => state.permission.topNav,
  permission_topNav_activeIndex: state => state.permission.topNavActiveIndex,
  permission_topNav_code: state => state.permission.topNavActiveCode,
  /** 菜单权限和操作权限信息 */
  userPermissionData: state => state.permission.permission_data,
  staff_id: state => state.permission.staff_id,
  session_id: state => state.permission.session_id,
  /** add by zxh */
  program: state => state.popUpSearchDialog.program,
  selectedDataJson: state => state.popUpSearchDialog.selectedDataJson,
  formatRouter: state => state.formatRouter.isdo,
  /** user session bean */
  userSessionBean: state => state.user.session_bean,
  /** 设置表格的vuex */
  // 设置表格顺序
  customTable: state => state.customTableColumns.table,
  // 重置列宽度
  customColumns: state => state.customTableColumns.columns,
  /** bpm */
  nodeMap: state => state.bpm.nodeMap,
  isEdit: state => state.bpm.isEdit,
  selectedNode: state => state.bpm.selectedNode,
  selectFormItem: state => state.bpm.selectFormItem,
  design: state => state.bpm.design,
  runningList: state => state.bpm.runningList,
  noTakeList: state => state.bpm.noTakeList,
  endList: state => state.bpm.endList,
  diagramMode: state => state.bpm.diagramMode,
  /** 消息通知 :
   * todo:待办
   * alarm:预警
   * messageCount：消息总数
   * */
  todoCount: state => state.headNotice.toDoCount,
  messageCount: state => state.headNotice.toDoCount + state.headNotice.alarmCount,
  /** 聊天相关 */
  // 聊天连接状态
  chatConnectionStatus: state => state.chat.isConnected,
  chatConnecting: state => state.chat.isConnecting,
  // 聊天消息
  chatMessages: state => state.chat.messages,
  chatUnreadCount: state => state.chat.unreadCount,
  chatIsLoading: state => state.chat.isLoading,
  chatIsTyping: state => state.chat.isTyping,
  // 聊天会话
  chatConversationId: state => state.chat.conversationId,
  chatHasActiveSession: state => state.chat.conversationId,
  // 聊天面板状态
  chatPanelExpanded: state => state.chat.isPanelExpanded,
  // 聊天错误状态
  chatLastError: state => state.chat.lastError
}
export default getters
