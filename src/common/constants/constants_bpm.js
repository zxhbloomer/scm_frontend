/**
 * BPM（Business Process Management）审批流相关常量
 */

// ============ 基础审批流常量 ============
/**  采购项目管理审批流 */
const BPM_PO_B_PROJECT = 'b_po_project'

/**  销售项目管理审批流 */
const BPM_SO_B_PROJECT = 'b_so_project'

/**  应付款审批流 */
const BPM_B_AP = 'b_ap'

/**  销售订单审批流 */
const BPM_B_SO_ORDER = 'b_so_order'

/**  采购合同审批流 */
const BPM_B_PO_CONTRACT = 'b_po_contract'

/**  销售合同审批流 */
const BPM_B_SO_CONTRACT = 'b_so_contract'

/**  销售货权转移审批流 */
const BPM_B_SO_CARGO_RIGHT_TRANSFER = 'b_so_cargo_right_transfer'

/**  入库计划审批流 */
const BPM_B_IN_PLAN = 'b_in_plan'

/**  出库计划审批流 */
const BPM_B_OUT_PLAN = 'b_out_plan'

/**  入库审批流 */
const BPM_B_IN = 'b_in'

/**  出库审批流 */
const BPM_B_OUT = 'b_out'

/**  销售结算审批流 */
const BPM_B_SO_SETTLEMENT = 'b_so_settlement'

/**  采购结算审批流 */
const BPM_B_PO_SETTLEMENT = 'b_po_settlement'

/**  应收账款审批流 */
const BPM_B_AR = 'b_ar'

/**  采购订单审批流 */
const BPM_B_PO_ORDER = 'b_po_order'

/**  采购货权转移审批流 */
const BPM_B_PO_CARGO_RIGHT_TRANSFER = 'b_po_cargo_right_transfer'

/**  应付退款审批流 */
const BPM_B_AP_REFUND = 'b_ap_refund'

/**  应收退款审批流 */
const BPM_B_AR_REFUND = 'b_ar_refund'

// ============ 作废审批流常量 ============
/**  采购项目管理作废审批流 */
const BPM_PO_B_PROJECT_CANCEL = 'b_po_project_cancel'

/**  销售项目管理作废审批流 */
const BPM_SO_B_PROJECT_CANCEL = 'b_so_project_cancel'

/**  应付款作废审批流 */
const BPM_B_AP_CANCEL = 'b_ap_cancel'

/**  销售订单作废审批流 */
const BPM_B_SO_ORDER_CANCEL = 'b_so_order_cancel'

/**  销售合同作废审批流 */
const BPM_B_SO_CONTRACT_CANCEL = 'b_so_contract_cancel'

/**  采购合同作废审批流 */
const BPM_B_PO_CONTRACT_CANCEL = 'b_po_contract_cancel'

/**  出库计划作废审批流 */
const BPM_B_OUT_PLAN_CANCEL = 'b_out_plan_cancel'

/**  入库计划作废审批流 */
const BPM_B_IN_PLAN_CANCEL = 'b_in_plan_cancel'

/**  出库作废审批流 */
const BPM_B_OUT_CANCEL = 'b_out_cancel'

/**  入库作废审批流 */
const BPM_B_IN_CANCEL = 'b_in_cancel'

/**  销售货权转移作废审批流 */
const BPM_B_SO_CARGO_RIGHT_TRANSFER_CANCEL = 'b_so_cargo_right_transfer_cancel'

/**  销售结算作废审批流 */
const BPM_B_SO_SETTLEMENT_CANCEL = 'b_so_settlement_cancel'

/**  采购结算作废审批流 */
const BPM_B_PO_SETTLEMENT_CANCEL = 'b_po_settlement_cancel'

/**  应收账款作废审批流 */
const BPM_B_AR_CANCEL = 'b_ar_cancel'

/**  采购订单作废审批流 */
const BPM_B_PO_ORDER_CANCEL = 'b_po_order_cancel'

/**  采购货权转移作废审批流 */
const BPM_B_PO_CARGO_RIGHT_TRANSFER_CANCEL = 'b_po_cargo_right_transfer_cancel'

/**  应付退款作废审批流 */
const BPM_B_AP_REFUND_CANCEL = 'b_ap_refund_cancel'

/**  应收退款作废审批流 */
const BPM_B_AR_REFUND_CANCEL = 'b_ar_refund_cancel'

/**  应付退款付款作废审批流 */
const BPM_B_AP_REFUND_PAY_CANCEL = 'b_ap_refund_pay_cancel'

/**  应收退款收款作废审批流 */
const BPM_B_AR_REFUND_RECEIVE_CANCEL = 'b_ar_refund_receive_cancel'

export default {
  // 基础审批流常量
  BPM_PO_B_PROJECT,
  BPM_SO_B_PROJECT,
  BPM_B_AP,
  BPM_B_SO_ORDER,
  BPM_B_PO_CONTRACT,
  BPM_B_SO_CONTRACT,
  BPM_B_SO_CARGO_RIGHT_TRANSFER,
  BPM_B_IN_PLAN,
  BPM_B_OUT_PLAN,
  BPM_B_IN,
  BPM_B_OUT,
  BPM_B_SO_SETTLEMENT,
  BPM_B_PO_SETTLEMENT,
  BPM_B_AR,
  BPM_B_PO_ORDER,
  BPM_B_PO_CARGO_RIGHT_TRANSFER,
  BPM_B_AP_REFUND,
  BPM_B_AR_REFUND,

  // 作废审批流常量
  BPM_PO_B_PROJECT_CANCEL,
  BPM_SO_B_PROJECT_CANCEL,
  BPM_B_AP_CANCEL,
  BPM_B_SO_ORDER_CANCEL,
  BPM_B_SO_CONTRACT_CANCEL,
  BPM_B_PO_CONTRACT_CANCEL,
  BPM_B_OUT_PLAN_CANCEL,
  BPM_B_IN_PLAN_CANCEL,
  BPM_B_OUT_CANCEL,
  BPM_B_IN_CANCEL,
  BPM_B_SO_CARGO_RIGHT_TRANSFER_CANCEL,
  BPM_B_SO_SETTLEMENT_CANCEL,
  BPM_B_PO_SETTLEMENT_CANCEL,
  BPM_B_AR_CANCEL,
  BPM_B_PO_ORDER_CANCEL,
  BPM_B_PO_CARGO_RIGHT_TRANSFER_CANCEL,
  BPM_B_AP_REFUND_CANCEL,
  BPM_B_AR_REFUND_CANCEL,
  BPM_B_AP_REFUND_PAY_CANCEL,
  BPM_B_AR_REFUND_RECEIVE_CANCEL
}
