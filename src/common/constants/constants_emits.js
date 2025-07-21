/**
 * 组织机构管理页面之间，进行通讯，兄弟通讯，
 * left：树
 * right：tabs
 *        tab1：组织机构
 *        tab2：集团信息
 *        tab3：企业信息
 *        tab4：部门信息
 *        tab5：岗位信息
 *        tab6：员工信息
 */
const EMIT_ORG_LEFT = 'global:org:getDataListLeft'
const EMIT_ORG_CHANGE = 'global:org:getDataList'
const EMIT_ORG_LOADING = 'global:org:getDataList_loading'
const EMIT_ORG_LOADING_OK = 'global:org:getDataList_loading_ok'
const EMIT_ORG_POSITION_UPDATED = 'global:org:position_updated'

/**
 * 部门权限页面之间，进行通讯，兄弟通讯，
 * left：树
 * right：tabs
 *        tab1：权限列表
 *        tab2：操作权限
 */
const EMIT_PERMISSION_DEPT_LEFT = 'global:permission_dept:getDataListLeft'
const EMIT_PERMISSION_DEPT_CHANGE = 'global:permission_dept:getDataList'
const EMIT_PERMISSION_DEPT_OPERATE_EDIT = 'global:permission_dept:edit_permission'
const EMIT_PERMISSION_DEPT_OPERATE_EDIT_OK = 'global:permission_dept:edit_permission_ok'
const EMIT_PERMISSION_DEPT_OPERATE_INFO = 'global:permission_dept:info_permission'
const EMIT_PERMISSION_DEPT_OPERATE_INFO_OK = 'global:permission_dept:info_permission_ok'
const EMIT_PERMISSION_DEPT_LOADING = 'global:permission_dept:getDataList_loading'
const EMIT_PERMISSION_DEPT_LOADING_OK = 'global:permission_dept:getDataList_loading_ok'
const EMIT_PERMISSION_DEPT_IS_EDIT = 'global:permission_dept:is_edit'

/**
 * 权限页面之间，进行通讯，
 * left：树
 * right：tabs
 *        tab1：权限列表
 *        tab2：操作权限
 */

const EMIT_PERMISSION_ROLE_OPERATE_EDIT = 'global:permission_role:edit_permission'
const EMIT_PERMISSION_ROLE_OPERATE_EDIT_OK = 'global:permission_role:edit_permission_ok'

/**
 * 物料规格页面之间，进行通讯，兄弟通讯，
 * left：树
 * right：tabs
 *        tab1：物料规格
 */
const EMIT_SPEC_LEFT = 'global:org:getDataListLeft'
const EMIT_SPEC_RIGHT = 'global:org:getDataList'
const EMIT_SPEC_LOADING = 'global:org:getDataList_loading'
const EMIT_SPEC_LOADING_OK = 'global:org:getDataList_loading_ok'

/**
 * 入库计划页面之间，进行通讯，兄弟通讯，
 * 页签1：入库计划list
 * 页签2：入库计划数据维护
 */
const EMIT_INPLAN_CHANGE = 'global:inplan:getDataList'
const EMIT_INPLAN_LOADING = 'global:inplan:getDataList_loading'
const EMIT_INPLAN_LOADING_OK = 'global:inplan:getDataList_loading_ok'

/**
 * 出库计划页面之间，进行通讯，兄弟通讯，
 * 页签1：出库计划list
 * 页签2：出库计划数据维护
 */
const EMIT_OUTPLAN_CHANGE = 'global:outplan:getDataList'
const EMIT_OUTPLAN_LOADING = 'global:outplan:getDataList_loading'
const EMIT_OUTPLAN_LOADING_OK = 'global:outplan:getDataList_loading_ok'

/**
 * 仓库分组页面之间，进行通讯，兄弟通讯，
 * left：树
 * right：tabs
 *        tab1：仓库分组页面
 *        tab2：仓库
 */
const EMIT_RELATION_LEFT = 'global:relation:getDataListLeft'
const EMIT_RELATION_LEFT_CHECKED = 'global:relation:getDataListLeftChecked'
const EMIT_RELATION_CHANGE = 'global:relation:getDataList'
const EMIT_RELATION_LOADING = 'global:relation:getDataList_loading'
const EMIT_RELATION_LOADING_OK = 'global:relation:getDataList_loading_ok'

/**
 * 设置列属性，兄弟通讯,全局
 *
 */
const EMIT_TABLE_COLUMNS_CONFIG_START = 'global:table:config:start'
const EMIT_TABLE_COLUMNS_CONFIG_LOADING = 'global:table:config:loading'
const EMIT_TABLE_COLUMNS_CONFIG_LOADING_OK = 'global:table:config:loading_ok'

/**
 * 组织机构弹窗页面之间，进行通讯，兄弟通讯，
 */
const EMIT_ORG_DIALOG_CHANGE = 'global:org:dialog:getDataList'
const EMIT_ORG_DIALOG_STAFF_SELECT = 'global:org:dialog:staff:select'

/**
 * 因考虑：分为左侧、右侧、下册
 * 左侧：业务数据
 * 右侧：流程流
 * 下册：按钮
 */
const EMIT_BPM_PROCESS_COMMENT = 'global:bpm:process:comment'

/**
 * 项目管理，新增完成
 * @type {string}
 */
const EMIT_BUS_PROJECT_NEW_OK = 'global:business:project:new:ok'
const EMIT_BUS_PROJECT_UPDATE_OK = 'global:business:project:update:ok'
const EMIT_BUS_PROJECT_BPM_OK = 'global:business:project:bpm:ok'

/**
 * 企业登记，新增完成
 * @type {string}
 */
const EMIT_MST_ENTERPRISE_NEW_OK = 'global:mst:enterprise:new:ok'
const EMIT_MST_ENTERPRISE_UPDATE_OK = 'global:mst:enterprise:update:ok'
const EMIT_MST_ENTERPRISE_BPM_OK = 'global:mst:enterprise:bpm:ok'

/**
 * 采购合同，新增完成
 * @type {string}
 */
const EMIT_MST_POCONTRACT_NEW_OK = 'global:mst:pocontract:new:ok'
const EMIT_MST_POCONTRACT_UPDATE_OK = 'global:mst:pocontract:update:ok'
const EMIT_MST_POCONTRACT_BPM_OK = 'global:mst:pocontract:bpm:ok'

/**
 * 货权转移，新增完成
 * @type {string}
 */
const EMIT_MST_CARGO_RIGHT_TRANSFER_NEW_OK = 'global:mst:cargo_right_transfer:new:ok'
const EMIT_MST_CARGO_RIGHT_TRANSFER_UPDATE_OK = 'global:mst:cargo_right_transfer:update:ok'
const EMIT_MST_CARGO_RIGHT_TRANSFER_BPM_OK = 'global:mst:cargo_right_transfer:bpm:ok'

/**
 * 采购结算，新增完成
 * @type {string}
 */
const EMIT_MST_SETTLEMENT_NEW_OK = 'global:mst:posettlement:new:ok'
const EMIT_MST_SETTLEMENT_UPDATE_OK = 'global:mst:posettlement:update:ok'
const EMIT_MST_SETTLEMENT_BPM_OK = 'global:mst:posettlement:bpm:ok'

/**
 * 销售合同，新增完成
 * @type {string}
 */
const EMIT_MST_SOCONTRACT_NEW_OK = 'global:mst:socontract:new:ok'
const EMIT_MST_SOCONTRACT_UPDATE_OK = 'global:mst:socontract:update:ok'
const EMIT_MST_SOCONTRACT_BPM_OK = 'global:mst:socontract:bpm:ok'

/**
 * 采购订单，新增完成
 * @type {string}
 */
const EMIT_MST_POORDER_NEW_OK = 'global:mst:poorder:new:ok'
const EMIT_MST_POORDER_UPDATE_OK = 'global:mst:poorder:update:ok'
const EMIT_MST_POORDER_BPM_OK = 'global:mst:poorder:bpm:ok'

/**
 * 销售订单，新增完成
 * @type {string}
 */
const EMIT_MST_SOORDER_NEW_OK = 'global:mst:soorder:new:ok'
const EMIT_MST_SOORDER_UPDATE_OK = 'global:mst:soorder:update:ok'
const EMIT_MST_SOORDER_BPM_OK = 'global:mst:soorder:bpm:ok'

/**
 * 采购合同，新增完成
 * @type {string}
 */
const EMIT_MST_BANK_ACCOUNTS_NEW_OK = 'global:mst:bank_accounts:new:ok'
const EMIT_MST_BANK_ACCOUNTS_UPDATE_OK = 'global:mst:bank_accounts:update:ok'
const EMIT_MST_BANK_ACCOUNTS_BPM_OK = 'global:mst:bank_accounts:bpm:ok'

/**
 * 付款管理，新增完成
 * @type {string}
 */
const EMIT_MST_B_AP_NEW_OK = 'global:mst:b_ap:new:ok'
const EMIT_MST_B_AP_UPDATE_OK = 'global:mst:b_ap:update:ok'
const EMIT_MST_B_AP_BPM_OK = 'global:mst:b_ap:bpm:ok'

/**
 * 付款单管理，新增完成
 * @type {string}
 */
const EMIT_MST_B_AP_PAY_NEW_OK = 'global:mst:b_ap_pay:new:ok'
const EMIT_MST_B_AP_PAY_UPDATE_OK = 'global:mst:b_ap_pay:update:ok'
const EMIT_MST_B_AP_PAY_BPM_OK = 'global:mst:b_ap_pay:bpm:ok'

/**
 * 退款管理，新增完成
 * @type {string}
 */
const EMIT_MST_B_AP_REFUND_NEW_OK = 'global:mst:b_ap_refund:new:ok'
const EMIT_MST_B_AP_REFUND_UPDATE_OK = 'global:mst:b_ap_refund:update:ok'
const EMIT_MST_B_AP_REFUND_BPM_OK = 'global:mst:b_ap_refund:bpm:ok'

/**
 * 入库计划管理，新增完成
 * @type {string}
 */
const EMIT_MST_B_IN_PLAN_NEW_OK = 'global:mst:b_in_plan:new:ok'
const EMIT_MST_B_IN_PLAN_UPDATE_OK = 'global:mst:b_in_plan:update:ok'
const EMIT_MST_B_IN_PLAN_BPM_OK = 'global:mst:b_in_plan:bpm:ok'

/**
 * 入库计划模块(inplan)，新增完成
 * @type {string}
 */
const EMIT_MST_INPLAN_NEW_OK = 'global:mst:inplan:new:ok'
const EMIT_MST_INPLAN_UPDATE_OK = 'global:mst:inplan:update:ok'
const EMIT_MST_INPLAN_BPM_OK = 'global:mst:inplan:bpm:ok'

/**
 * 入库单模块(in)，新增完成
 * @type {string}
 */
const EMIT_MST_B_IN_NEW_OK = 'global:mst:b_in:new:ok'
const EMIT_MST_B_IN_UPDATE_OK = 'global:mst:b_in:update:ok'
const EMIT_MST_B_IN_BPM_OK = 'global:mst:b_in:bpm:ok'

/**
 * 消息通知
 * @type {string}
 */
const EMIT_NOTISE_BPM = 'global:notice:bpm'

export default {
  /**
   * 组织机构管理页面之间，进行通讯，兄弟通讯，
   */
  EMIT_ORG_LEFT,
  EMIT_ORG_CHANGE,
  EMIT_ORG_LOADING,
  EMIT_ORG_LOADING_OK,
  EMIT_ORG_POSITION_UPDATED,
  /**
   * 部门权限页面之间，进行通讯，兄弟通讯，
   */
  EMIT_PERMISSION_DEPT_LEFT,
  EMIT_PERMISSION_DEPT_CHANGE,
  EMIT_PERMISSION_DEPT_OPERATE_EDIT,
  EMIT_PERMISSION_DEPT_OPERATE_EDIT_OK,
  EMIT_PERMISSION_DEPT_OPERATE_INFO,
  EMIT_PERMISSION_DEPT_OPERATE_INFO_OK,
  EMIT_PERMISSION_DEPT_LOADING,
  EMIT_PERMISSION_DEPT_LOADING_OK,
  EMIT_PERMISSION_DEPT_IS_EDIT,

  EMIT_PERMISSION_ROLE_OPERATE_EDIT,
  EMIT_PERMISSION_ROLE_OPERATE_EDIT_OK,

  EMIT_SPEC_LEFT,
  EMIT_SPEC_RIGHT,
  EMIT_SPEC_LOADING,
  EMIT_SPEC_LOADING_OK,

  EMIT_INPLAN_CHANGE,
  EMIT_INPLAN_LOADING,
  EMIT_INPLAN_LOADING_OK,

  EMIT_OUTPLAN_CHANGE,
  EMIT_OUTPLAN_LOADING,
  EMIT_OUTPLAN_LOADING_OK,

  EMIT_RELATION_LEFT,
  EMIT_RELATION_LEFT_CHECKED,
  EMIT_RELATION_CHANGE,
  EMIT_RELATION_LOADING,
  EMIT_RELATION_LOADING_OK,

  EMIT_TABLE_COLUMNS_CONFIG_START,
  EMIT_TABLE_COLUMNS_CONFIG_LOADING,
  EMIT_TABLE_COLUMNS_CONFIG_LOADING_OK,
  EMIT_ORG_DIALOG_CHANGE,
  EMIT_ORG_DIALOG_STAFF_SELECT,

  EMIT_BPM_PROCESS_COMMENT,

  EMIT_BUS_PROJECT_NEW_OK,
  EMIT_BUS_PROJECT_UPDATE_OK,
  EMIT_BUS_PROJECT_BPM_OK,

  EMIT_MST_ENTERPRISE_NEW_OK,
  EMIT_MST_ENTERPRISE_UPDATE_OK,
  EMIT_MST_ENTERPRISE_BPM_OK,

  EMIT_MST_POCONTRACT_NEW_OK,
  EMIT_MST_POCONTRACT_UPDATE_OK,
  EMIT_MST_POCONTRACT_BPM_OK,

  EMIT_MST_CARGO_RIGHT_TRANSFER_NEW_OK,
  EMIT_MST_CARGO_RIGHT_TRANSFER_UPDATE_OK,
  EMIT_MST_CARGO_RIGHT_TRANSFER_BPM_OK,

  EMIT_MST_SETTLEMENT_NEW_OK,
  EMIT_MST_SETTLEMENT_UPDATE_OK,
  EMIT_MST_SETTLEMENT_BPM_OK,

  EMIT_MST_SOCONTRACT_NEW_OK,
  EMIT_MST_SOCONTRACT_UPDATE_OK,
  EMIT_MST_SOCONTRACT_BPM_OK,

  EMIT_MST_POORDER_NEW_OK,
  EMIT_MST_POORDER_UPDATE_OK,
  EMIT_MST_POORDER_BPM_OK,

  EMIT_MST_SOORDER_NEW_OK,
  EMIT_MST_SOORDER_UPDATE_OK,
  EMIT_MST_SOORDER_BPM_OK,

  EMIT_MST_BANK_ACCOUNTS_NEW_OK,
  EMIT_MST_BANK_ACCOUNTS_UPDATE_OK,
  EMIT_MST_BANK_ACCOUNTS_BPM_OK,

  EMIT_MST_B_AP_NEW_OK,
  EMIT_MST_B_AP_UPDATE_OK,
  EMIT_MST_B_AP_BPM_OK,

  EMIT_MST_B_AP_PAY_NEW_OK,
  EMIT_MST_B_AP_PAY_UPDATE_OK,
  EMIT_MST_B_AP_PAY_BPM_OK,

  EMIT_MST_B_AP_REFUND_NEW_OK,
  EMIT_MST_B_AP_REFUND_UPDATE_OK,
  EMIT_MST_B_AP_REFUND_BPM_OK,

  EMIT_MST_B_IN_PLAN_NEW_OK,
  EMIT_MST_B_IN_PLAN_UPDATE_OK,
  EMIT_MST_B_IN_PLAN_BPM_OK,

  EMIT_MST_INPLAN_NEW_OK,
  EMIT_MST_INPLAN_UPDATE_OK,
  EMIT_MST_INPLAN_BPM_OK,

  EMIT_MST_B_IN_NEW_OK,
  EMIT_MST_B_IN_UPDATE_OK,
  EMIT_MST_B_IN_BPM_OK,

  EMIT_NOTISE_BPM
}

