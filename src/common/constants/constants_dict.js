/** 隐藏显示类型： 0：显示 1：隐藏 null:全部 */
const DICT_SYS_VISIBLE_TYPE = 'sys_visible_type'
const DICT_SYS_VISIBLE_TYPE_SHOW = '0'
const DICT_SYS_VISIBLE_TYPE_HIDDEN = '1'
const DICT_SYS_VISIBLE_TYPE_ALL = 'null'

/** 按钮类型： */
const DICT_BTN_NAME_TYPE = 'sys_btn_type'

/** 地址簿_tag标签  */
const DICT_SYS_ADDRESS_TAG_TYPE = 'sys_address_tag_type'

/** 企业类型  */
const DICT_SYS_COMPANY_TYPE = 'sys_company_type'

/** 性别  */
const DICT_SYS_SEX_TYPE = 'sys_sex_type'

/** 在职情况  */
const DICT_USR_SERVICE_TYPE = 'usr_service_type'

/** 学历  */
const DICT_USR_DEGREE_TYPE = 'usr_degree_type'

/** 婚否  */
const DICT_USR_WED_TYPE = 'usr_wed_type'

/** 登录用户类型  */
const DICT_USR_LOGIN_TYPE = 'usr_login_type'

/** 组织机构类型  */
const DICT_ORG_SETTING_TYPE = 'org_setting_type'
/** 组织机构类型：租户  */
const DICT_ORG_SETTING_TYPE_TENANT = '10'
/** 组织机构类型：集团  */
const DICT_ORG_SETTING_TYPE_GROUP = '20'
/** 组织机构类型：企业  */
const DICT_ORG_SETTING_TYPE_COMPANY = '30'
/** 组织机构类型：部门  */
const DICT_ORG_SETTING_TYPE_DEPT = '40'
/** 组织机构类型：岗位  */
const DICT_ORG_SETTING_TYPE_POSITION = '50'
/** 组织机构类型：人员  */
const DICT_ORG_SETTING_TYPE_STAFF = '60'
/** 登录模式：（10：手机号码；20：邮箱） */
const DICT_SYS_LOGIN_TYPE = 'sys_login_type'
/** 自动编码类型 */
const DICT_SYS_CODE_RULE_TYPE = 'sys_coderule_type'
/** 自动编码名称 */
const DICT_SYS_CODE_TYPE = 'sys_code_type'
/** 组织架构中已被使用 */
const DICT_ORG_USED_TYPE = 'org_used_type'
/** 显示组织机构中未被使用  */
const DICT_ORG_USED_TYPE_SHOW_UNUSED = '10'
/** 显示所有  */
const DICT_ORG_USED_TYPE_SHOW_ALL = null
/** 菜单类型  */
const DICT_SYS_MENU_TYPE = 'sys_menu_type'
/** 根结点  */
const DICT_SYS_MENU_TYPE_ROOT = 'R'
/** 顶部导航栏  */
const DICT_SYS_MENU_TYPE_TOPNAV = 'T'
/** 结点  */
const DICT_SYS_MENU_TYPE_NODE = 'N'
/** 页面  */
const DICT_SYS_MENU_TYPE_PAGE = 'P'
/** 权限类型  */
const DICT_MSTR_PERMISSION_TYPE = 'mstr_permission_type'
/** 部门权限  */
const DICT_MSTR_PERMISSION_TYPE_DEPT = '10'
/** 岗位权限  */
const DICT_MSTR_PERMISSION_TYPE_POSITION = '20'
/** 用户权限  */
const DICT_MSTR_PERMISSION_TYPE_USER = '30'
/** 排除权限  */
const DICT_MSTR_PERMISSION_TYPE_OUT = '40'
/** 部门权限  */
const DICT_MSTR_PERMISSION_TYPE_ROLE = '50'

/** 委托方  */
const DICT_CONSIGNOR = '1'
/** 货主  */
const DICT_OWNER = '2'
/** 供应商  */
const DICT_SUPPLIER = '3'

/** 删除类型：0：未删除 1：已删除  */
const DICT_SYS_DELETE_MAP = 'mstr_permission_type'
const DICT_SYS_DELETE_MAP_YES = '1'
const DICT_SYS_DELETE_MAP_NO = '0'
const DICT_SYS_DELETE_MAP_ALL = 'null'

/** 仓库类型 1. 直属库, 2加工厂库, 3.铁路码头虚拟库, 4.饲料厂库  */
const DICT_M_WAREHOUSE_TYPE = 'm_warehouse_type'
const DICT_M_WAREHOUSE_TYPE_ZX = '1'
const DICT_M_WAREHOUSE_TYPE_WD = '2'
const DICT_M_WAREHOUSE_TYPE_TL = '3'
const DICT_M_WAREHOUSE_TYPE_CL = '4'

/** 企业性质（1民营，2国企，3合资，4外资）*/
const DICT_M_CUSTOMER = 'm_customer'
const DICT_M_ENTERPRISE = 'm_enterprise'
const DICT_M_CUSTOMER_SCOPE = 'm_customer_scope'
const DICT_M_CUSTOMER_SCOPE_MY = '1'
const DICT_M_CUSTOMER_SCOPE_GQ = '2'
const DICT_M_CUSTOMER_SCOPE_HZ = '3'
const DICT_M_CUSTOMER_SCOPE_WZ = '4'

/**  客户来源（1独立开发） */
const DICT_M_CUSTOMER_SOURCE = 'm_customer_source'
const DICT_M_CUSTOMER_SOURCE_DL = '1'

/** 客户类别：1借款方，2贷款方，3担保方，4管理企业，5其他 */
const DICT_M_CUSTOMER_TYPE = 'm_customer_type'
const DICT_M_CUSTOMER_TYPE_JK = '1'
const DICT_M_CUSTOMER_TYPE_DK = '2'
const DICT_M_CUSTOMER_TYPE_DB = '3'
const DICT_M_CUSTOMER_TYPE_GL = '4'
const DICT_M_CUSTOMER_TYPE_QT = '5'

/**  企业类型：1有限责任公司（自然人投资或控股），2股份有限公司分公司（上市、国有股份） */
const DICT_M_CUSTOMER_MOLD = 'm_customer_mold'
const DICT_M_CUSTOMER_MOLD_YX = '1'
const DICT_M_CUSTOMER_MOLD_GF = '2'

/**  企业审核状态 审核状态 0-待审核 1-审核中 2-审核通过 3-驳回 */
const DICT_M_CUSTOMER_STATUS = 'm_customer_status'
const DICT_M_CUSTOMER_STATUS_ZERO = '0'
const DICT_M_CUSTOMER_STATUS_ONE = '1'
const DICT_M_CUSTOMER_STATUS_TWO = '2'
const DICT_M_CUSTOMER_STATUS_THREE = '3'

/**  企业审核状态 审核状态 0-待审批 1-审批中 2-审批通过 3-驳回 */
const DICT_M_ENTERPRISE_STATUS = 'm_enterprise_status'
const DICT_M_ENTERPRISE_STATUS_ZERO = '0'
const DICT_M_ENTERPRISE_STATUS_ONE = '1'
const DICT_M_ENTERPRISE_STATUS_TWO = '2'
const DICT_M_ENTERPRISE_STATUS_THREE = '3'

/**  企业是否黑名单  0=否 1=是 */
const DICT_M_CUSTOMER_BLACKLIST = 'm_customer_blacklist'
const DICT_M_CUSTOMER_BLACKLIST_ZERO = '0'
const DICT_M_CUSTOMER_BLACKLIST_ONE = '1'

/**  单位：1吨,2湿吨，3卷，4扎，5根 */
const DICT_M_UNIT = 'm_unit'
const DICT_M_UNIT_D = '1'
const DICT_M_UNIT_SD = '2'
const DICT_M_UNIT_J = '3'
const DICT_M_UNIT_Z = '4'
const DICT_M_UNIT_G = '4'

/** 入库类型：0采购入库，1调拨入库，2退货入库，5生产入库，9监管入库，10普通入库 */
const DICT_B_IN_TYPE = 'b_in_type'
const DICT_B_IN_TYPE_CG = '0'
const DICT_B_IN_TYPE_DB = '1'
const DICT_B_IN_TYPE_TH = '2'
const DICT_B_IN_TYPE_SC = '5'
const DICT_B_IN_TYPE_JG = '9'
const DICT_B_IN_TYPE_PT = '10'

/** 入库计划状态：状态：0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成 */
const DICT_B_IN_STATUS = 'b_in_status'
const DICT_B_IN_STATUS_ZERO = '0'
const DICT_B_IN_STATUS_ONE = '1'
const DICT_B_IN_STATUS_TWO = '2'
const DICT_B_IN_STATUS_THREE = '3'
const DICT_B_IN_STATUS_FOUR = '4'
const DICT_B_IN_STATUS_FIVE = '5'
const DICT_B_IN_STATUS_SIX = '6'

/** 入库计划表 审批流 */
const DICT_B_IN_PLAN = 'b_in_plan'
/** 入库计划表 审批作废流 */
const DICT_B_IN_PLAN_CANCEL = 'b_in_plan_cancel'

/** 入库计划状态：状态：0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成 */
const DICT_B_IN_PLAN_STATUS = 'b_in_plan_status'
const DICT_B_IN_PLAN_STATUS_ZERO = '0'
const DICT_B_IN_PLAN_STATUS_ONE = '1'
const DICT_B_IN_PLAN_STATUS_TWO = '2'
const DICT_B_IN_PLAN_STATUS_THREE = '3'
const DICT_B_IN_PLAN_STATUS_FOUR = '4'
const DICT_B_IN_PLAN_STATUS_FIVE = '5'
const DICT_B_IN_PLAN_STATUS_SIX = '6'

/** 出库计划状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成 6过期 7中止*/
const DICT_B_OUT_PLAN_STATUS = 'b_out_plan_status'
const DICT_B_OUT_PLAN_STATUS_ZD = '0'
const DICT_B_OUT_PLAN_STATUS_YTJ = '1'
const DICT_B_OUT_PLAN_STATUS_TG = '2'
const DICT_B_OUT_PLAN_STATUS_BH = '3'
const DICT_B_OUT_PLAN_STATUS_ZF = '4'
const DICT_B_OUT_PLAN_STATUS_FINISH = '5'
const DICT_B_OUT_PLAN_STATUS_EXPIRES = '6'
const DICT_B_OUT_PLAN_STATUS_DISCONTINUE = '7'
const DICT_B_OUT_PLAN_STATUS_CANCEL_BEING_AUDITED = '8'

/** 出库状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成 6过期 7作废审核*/
const DICT_B_OUT_STATUS = 'b_out_status'
const DICT_B_OUT_STATUS_ZD = '0'
const DICT_B_OUT_STATUS_YTJ = '1'
const DICT_B_OUT_STATUS_TG = '2'
const DICT_B_OUT_STATUS_BH = '3'
const DICT_B_OUT_STATUS_ZF = '4'
const DICT_B_OUT_STATUS_FINISH = '5'
const DICT_B_OUT_STATUS_EXPIRES = '6'
const DICT_B_OUT_STATUS_CANCEL_BEING_AUDITED = '7'

/** 入库单业务流程标识 */
const DICT_B_IN = 'b_in'

/** 入库单作废流程标识 */
const DICT_B_IN_CANCEL = 'b_in_cancel'

/**  单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 */
const DICT_B_IN_BUSINESS_TYPE = 'b_in_bill_type'
const DICT_B_IN_BUSINESS_TYPE_GYL = '0'
const DICT_B_IN_BUSINESS_TYPE_DL = '1'
const DICT_B_IN_BUSINESS_TYPE_ZX = '2'
const DICT_B_IN_BUSINESS_TYPE_FG = '3'

/**  入库计划 单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 */
const DICT_B_IN_PLAN_BUSINESS_TYPE = 'b_in_bill_type'
const DICT_B_IN_PLAN_BUSINESS_TYPE_GYL = '0'
const DICT_B_IN_PLAN_BUSINESS_TYPE_DL = '1'
const DICT_B_IN_PLAN_BUSINESS_TYPE_ZX = '2'
const DICT_B_IN_PLAN_BUSINESS_TYPE_FG = '3'

/** 出库计划类型：0调拨出库，1库存调整，2盘亏出库，3监管出库，4普通出库， 5销售出库,6退货出库，7领料出库 8 直采出库 */
const DICT_B_OUT_PLAN_TYPE = 'b_out_plan_type'
const DICT_B_OUT_PLAN_TYPE_DB = '0'
const DICT_B_OUT_PLAN_TYPE_KC = '1'
const DICT_B_OUT_PLAN_TYPE_PK = '2'
const DICT_B_OUT_PLAN_TYPE_JG = '3'
const DICT_B_OUT_PLAN_TYPE_PT = '4'
const DICT_B_OUT_PLAN_TYPE_XS = '5'
const DICT_B_OUT_PLAN_TYPE_TH = '6'
const DICT_B_OUT_PLAN_TYPE_LL = '7'
const DICT_B_OUT_PLAN_TYPE_ZC = '8'

/** 出库单类型：0调拨出库，1库存调整，2盘亏出库，3监管出库，4普通出库， 5销售出库，6退货出库，7领料出库 */
const DICT_B_OUT_TYPE = 'b_out_plan_type'
const DICT_B_OUT_TYPE_DB = '0'
const DICT_B_OUT_TYPE_KC = '1'
const DICT_B_OUT_TYPE_PK = '2'
const DICT_B_OUT_TYPE_JG = '3'
const DICT_B_OUT_TYPE_PT = '4'
const DICT_B_OUT_TYPE_XS = '5'
const DICT_B_OUT_TYPE_TH = '6'
const DICT_B_OUT_TYPE_LL = '7'

/**  出库计划单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 4直销业务*/
const DICT_B_OUT_PLAN_BUSINESS_TYPE = 'b_out_plan_bill_type'
const DICT_B_OUT_PLAN_BUSINESS_TYPE_GYL = '0'
const DICT_B_OUT_PLAN_BUSINESS_TYPE_DL = '1'
const DICT_B_OUT_PLAN_BUSINESS_TYPE_ZX = '2'
const DICT_B_OUT_PLAN_BUSINESS_TYPE_FG = '3'
const DICT_B_OUT_PLAN_BUSINESS_TYPE_ZXCK = '4'

/**  采购 入库计划单据:0供应链业务 1代理业务 2直销业务 3废钢业务 4,直采业务 */
const DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE = 'b_in_plan_bill_type'
const DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_GYL = '0'
const DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_DL = '1'
const DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_ZX = '2'
const DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_FG = '3'
const DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_ZXCK = '4'

/** 调整单状态：0制单，1已提交，2审核通过，3审核驳回 */
const DICT_B_ADJUST_STATUS = 'b_adjust_status'
const DICT_B_ADJUST_STATUS_SAVED = '0'
const DICT_B_ADJUST_STATUS_SUBMITTED = '1'
const DICT_B_ADJUST_STATUS_PASSED = '2'
const DICT_B_ADJUST_STATUS_RETURN = '3'

/** 调整单类型：1调整调整，2盘盈调整，3盘亏调整 */
const DICT_B_ADJUST_TYPE = 'b_adjust_type'
const DICT_B_ADJUST_TYPE_NORMAL = '1'
const DICT_B_ADJUST_TYPE_MORE = '2'
const DICT_B_ADJUST_TYPE_LESS = '3'

/** 库存调整类型：1保持库存货值不变，2调整货值, 3调整调整量 */
const DICT_B_ADJUST_RULE = 'b_adjust_rule'
const DICT_B_ADJUST_RULE_ONE = '1'
const DICT_B_ADJUST_RULE_TWO = '2'
const DICT_B_ADJUST_RULE_THREE = '3'

/** 入库计划明细编号 */
const DICT_SYS_CODE_TYPE_B_IN_PLAN_DETAIL = 'b_in_plan_detail'

/** 定时任务组:00系统、01每日库存 */
const DICT_SYS_JOB_GROUP_TYPE = 's_job_group_type'
const DICT_SYS_JOB_GROUP_TYPE_SYS = '00'
const DICT_SYS_JOB_GROUP_TYPE_DAILY_INVENTORY = '01'
const DICT_SYS_JOB_GROUP_TYPE_DAILY_INVENTORY_DIFF = '02'

/** 交货方式: 1自提  2物流 */
const DICT_DELIVERY_TYPE = 'delivery_type'
const DICT_DELIVERY_TYPE_ONE = '1'
const DICT_DELIVERY_TYPE_TWO = '2'

/** 监管任务收货类型:0入库，1卸货 */
const DICT_MONITOR_TYPE_IN = 'b_monitor_type_in'
const DICT_MONITOR_TYPE_IN_ONE = '0'
const DICT_MONITOR_TYPE_IN_TWO = '1'

/** 监管任务发货类型:0出库，1提货 */
const DICT_MONITOR_TYPE_OUT = 'b_monitor_type_out'
const DICT_MONITOR_TYPE_OUT_ONE = '0'
const DICT_MONITOR_TYPE_OUT_TWO = '1'

/**
 * 仓库分组定义：1一级；2二级；3三级
 */
const DICT_B_WAREHOUSE_GROUP = 'b_warehouse_group'
// 一级
const DICT_B_WAREHOUSE_GROUP_1 = '1'
// 二级
const DICT_B_WAREHOUSE_GROUP_2 = '2'
// 三级
const DICT_B_WAREHOUSE_GROUP_3 = '3'

/**
 * 物流订单 出库计划生成方式：0 系统生成出库计划 1 手动选择出库计划
 */
const DICT_B_LOGISTICS_OUT_RULE = 'b_logistics_out_rule'
// 系统生成出库计划
const DICT_B_LOGISTICS_OUT_RULE_0 = '0'
// 手动选择出库计划
const DICT_B_LOGISTICS_OUT_RULE_1 = '1'

/**
 * 物流订单 入库计划生成方式：0 系统生成入库计划 1 手动选择入库计划
 */
const DICT_B_LOGISTICS_IN_RULE = 'b_logistics_in_rule'
// 系统生成入库计划
const DICT_B_LOGISTICS_IN_RULE_0 = '0'
// 手动选择入库计划
const DICT_B_LOGISTICS_IN_RULE_1 = '1'

/**
* app版本更新类型：0 非强制；1强制；
 */
const DICT_S_APP_NOTICE_TYPE = 's_app_notice_type'
// 非强制
const DICT_S_APP_NOTICE_TYPE0 = '0'
// 强制
const DICT_S_APP_NOTICE_TYPE1 = '1'

/**
* 0待调度，1已完成，2制单，3已提交，4已驳回, 5已作废
*/
const DICT_B_SCHEDULE_STATUS = 'b_schedule_status'
const DICT_B_SCHEDULE_STATUS_ZERO = '0'
const DICT_B_SCHEDULE_STATUS_ONE = '1'
const DICT_B_SCHEDULE_STATUS_TWO = '2'
const DICT_B_SCHEDULE_STATUS_THREE = '3'
const DICT_B_SCHEDULE_STATUS_FOUR = '4'
const DICT_B_SCHEDULE_STATUS_FIVE = '5'

/**
* 类型 1:物流订单 2:物流调度 3:物流直达 4:直采入库 5:直销出库
*/
const DICT_B_SCHEDULE_TYPE = 'b_schedule_type'
const DICT_B_SCHEDULE_TYPE_ONE = '1'
const DICT_B_SCHEDULE_TYPE_TWO = '2'
const DICT_B_SCHEDULE_TYPE_THREE = '3'
const DICT_B_SCHEDULE_TYPE_FOUR = '4'
const DICT_B_SCHEDULE_TYPE_FIVE = '5'

/**
   * 监管任务_状态：0空车过磅，1正在装货，2重车出库，3装货完成 4重车过磅，5正在卸货，6空车出库，7卸货完成（完成）,8作废
   */
const DICT_B_MONITOR_STATUS = 'b_monitor_status'
const DICT_B_MONITOR_STATUS_ZERO = '0'
const DICT_B_MONITOR_STATUS_ONE = '1'
const DICT_B_MONITOR_STATUS_TWO = '2'
const DICT_B_MONITOR_STATUS_THREE = '3'
const DICT_B_MONITOR_STATUS_FOUR = '4'
const DICT_B_MONITOR_STATUS_FIVE = '5'
const DICT_B_MONITOR_STATUS_SIX = '6'
const DICT_B_MONITOR_STATUS_SEVEN = '7'
const DICT_B_MONITOR_STATUS_EIGHT = '8'

/**
 * 监管任务同步状态
 */
const DICT_B_MONITOR_SYNC_STATUS = 'b_monitor_sync_status'
const DICT_B_MONITOR_SYNC_STATUS_ZERO = '0'
const DICT_B_MONITOR_SYNC_STATUS_ONE = '1'
const DICT_B_MONITOR_SYNC_STATUS_TWO = '2'
const DICT_B_MONITOR_SYNC_STATUS_N = '-1'

/**
   * 订单类型 b_in_order:采购订单 b_out_order 销售订单
   */
const DICT_B_ORDER_TYPE = 'b_order_type'
const DICT_B_ORDER_IN = 'b_in_order'
const DICT_B_ORDER_OUT = 'b_out_order'

/**
   * 物料转换执行类型：0单次任务 1定时任务
   */
const DICT_B_MATERIAL_CONVERT_TYPE = 'b_material_convert_type'
const DICT_B_MATERIAL_CONVERT_TYPE_ZERO = '0'
const DICT_B_MATERIAL_CONVERT_TYPE_ONE = '1'

/**
   * 物料转换执行类型：0每分钟 1每小时 2每天
   */
const DICT_B_MATERIAL_CONVERT_FREQUENCY = 'b_material_convert_frequency'
const DICT_B_MATERIAL_CONVERT_FREQUENCY_ZERO = '0'
const DICT_B_MATERIAL_CONVERT_FREQUENCY_ONE = '1'
const DICT_B_MATERIAL_CONVERT_FREQUENCY_TWO = '2'

/** 物料转换状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成*/
const DICT_B_MATERIAL_CONVERT_STATUS = 'b_material_convert_status'
const DICT_B_MATERIAL_CONVERT_STATUS_ZD = '0'
const DICT_B_MATERIAL_CONVERT_STATUS_YTJ = '1'
const DICT_B_MATERIAL_CONVERT_STATUS_TG = '2'
const DICT_B_MATERIAL_CONVERT_STATUS_BH = '3'
const DICT_B_MATERIAL_CONVERT_STATUS_ZF = '4'

/**
   * 采购订单状态： 状态 0执行中 1已完成 -1作废
   */
const DICT_B_IN_ORDER_STATUS = 'b_in_order_status'
const DICT_B_IN_ORDER_STATUS_ONE = '-1'
const DICT_B_IN_ORDER_STATUS_TWO = '0'
const DICT_B_IN_ORDER_STATUS_THREE = '1'

/**
  * 销售订单状态： 状态 0执行中 1已完成 -1作废
  */
const DICT_B_OUT_ORDER_STATUS = 'b_out_order_status'
const DICT_B_OUT_ORDER_STATUS_ONE = '-1'
const DICT_B_OUT_ORDER_STATUS_TWO = '0'
const DICT_B_OUT_ORDER_STATUS_THREE = '1'

/**
   * 物流订单运输方式：0公运、1铁运、2水运
   */
const DICT_B_SCHEDULE_TRANSPORT_TYPE = 'b_schedule_transport_type'
const DICT_B_SCHEDULE_TRANSPORT_TYPE_0 = '0'
const DICT_B_SCHEDULE_TRANSPORT_TYPE_1 = '1'
const DICT_B_SCHEDULE_TRANSPORT_TYPE_2 = '2'

/**
 * 仓库片区
*/
const DICT_M_WAREHOUSE_ZONE = 'm_warehouse_zone'
const DICT_M_WAREHOUSE_ZONE1 = '1'
const DICT_M_WAREHOUSE_ZONE2 = '2'
const DICT_M_WAREHOUSE_ZONE3 = '3'
const DICT_M_WAREHOUSE_ZONE4 = '4'

const DICT_B_ALLOCATION_STATUS = 'b_allocate_status'
const DICT_B_ALLOCATION_STATUS_ZONE0 = '0'
const DICT_B_ALLOCATION_STATUS_ZONE1 = '1'
const DICT_B_ALLOCATION_STATUS_ZONE2 = '2'
const DICT_B_ALLOCATION_STATUS_ZONE3 = '3'
const DICT_B_ALLOCATION_STATUS_ZONE4 = '4'

const DICT_B_MATERIAL_CONVERT_EFFECTIVE = 'b_material_convert_effective'
const DICT_B_MATERIAL_CONVERT_EFFECTIVE0 = '0'
const DICT_B_MATERIAL_CONVERT_EFFECTIVE1 = '1'

const DICT_B_ROUTER_PRODUCT_TYPE = 'b_router_pro_type'
const DICT_B_ROUTER_PRODUCT_TYPE_C = '1'
const DICT_B_ROUTER_PRODUCT_TYPE_F = '2'

/** 0禁用, 1启用 */
const DICT_B_ROUTER_ENABLE = 'b_wo_router_enable'
const DICT_B_ROUTER_ENABLE_0 = '0'
const DICT_B_ROUTER_ENABLE_1 = '1'

/** 1制单, 2已提交, 3审核通过, 4审核驳回, 5作废 */
const DICT_B_WO_STATUS = 'b_wo_status'
const DICT_B_WO_STATUS_1 = '1'
const DICT_B_WO_STATUS_2 = '2'
const DICT_B_WO_STATUS_3 = '3'
const DICT_B_WO_STATUS_4 = '4'
const DICT_B_WO_STATUS_5 = '5'

/** 0未结算, 1已结算 */
const DICT_B_MONITOR_SETTLEMENT_STATUS = 'b_monitor_settlement_status'
const DICT_B_MONITOR_SETTLEMENT_STATUS_0 = '0'
const DICT_B_MONITOR_SETTLEMENT_STATUS_1 = '1'

/** 0通用 */
const DICT_B_BPM_TYPE = 'b_bpm_type'
const DICT_B_DICT_B_BPM_TYPE_0 = '0'

/** 1 备份, 2恢复 */
const DICT_B_BK_MONITOR_TYPE = 'b_bk_monitor_type'
const DICT_B_BK_MONITOR_TYPE_B = '1'
const DICT_B_BK_MONITOR_TYPE_R = '2'

/** 预警类型 0.事件预警, 1阈值预警 */
const DICT_B_ALARM_RULES_TYPE = 'b_alarm_rules_type'
const DICT_B_ALARM_RULES_TYPE_0 = '0'
const DICT_B_ALARM_RULES_TYPE_1 = '1'

/** 预警规则类型  1实时预警, 2定时任务*/
const DICT_B_ALARM_SETTINGS_RULES = 'b_alarm_setting_rules'
const DICT_B_ALARM_SETTINGS_RULES_1 = '1'
const DICT_B_ALARM_SETTINGS_RULES_2 = '2'

/** 预警通知方式 0消息通知, 1弹出通知 */
const DICT_B_ALARM_NOTICE_TYPE = 'b_alarm_rules_notice_type'
const DICT_B_ALARM_NOTICE_TYPE_0 = '0'
const DICT_B_ALARM_NOTICE_TYPE_1 = '1'

/** 监管任务审核 */
const DICT_B_MONITOR_AUDIT_STATUS = 'b_monitor_audit_status'
const DICT_B_MONITOR_AUDIT_STATUS_0 = '0'
const DICT_B_MONITOR_AUDIT_STATUS_1 = '1'
const DICT_B_MONITOR_AUDIT_STATUS_2 = '2'
const DICT_B_MONITOR_AUDIT_STATUS_3 = '3'
const DICT_B_MONITOR_AUDIT_STATUS_4 = '4'

/** 放货指令类型 */
const DICT_B_RELEASE_ORDER_TYPE = 'b_release_order_type'
const DICT_B_RELEASE_ORDER_TYPE_1 = '0'

/** 放货指令业务类型 */
const DICT_B_RELEASE_ORDER_BUSINESS_TYPE = 'b_release_order_business_type'
const DICT_B_RELEASE_ORDER_BUSINESS_TYPE_0 = '0'

const DICT_BUSINESS_START_TIME = 'b_report_business_start_date'
const DICT_BUSINESS_START_TIME_1 = '2023-08-03'

const DICT_CARRIAGE_ORDER_TRANSPORT = 'b_carriage_order_transport'
const DICT_CARRIAGE_ORDER_TRANSPORT_0 = '0'

/** 承运订单状态 */
const DICT_CARRIAGE_ORDER_STATUS = 'b_carriage_order_status'
const DICT_CARRIAGE_ORDER_STATUS_0 = '0'
const DICT_CARRIAGE_ORDER_STATUS_1 = '1'
const DICT_CARRIAGE_ORDER_STATUS_2 = '2'

/** 车辆颜色 */
const DICT_M_VEHICLE_COLOR = 'm_vehicle_no_color'
const DICT_M_VEHICLE_COLOR_BLUE = '1'
const DICT_M_VEHICLE_COLOR_YELLOW = '2'
const DICT_M_VEHICLE_COLOR_YELLOW_GREEN = '3'

/** 库存流水 单据类型 */
const DICT_INVENTORY_BILL_TYPE = 'inventory_bill_type'
const DICT_INVENTORY_BILL_TYPE_IN = 'b_in'
const DICT_INVENTORY_BILL_TYPE_OUT = 'b_out'
const DICT_INVENTORY_BILL_TYPE_ADJUST = 'b_adjust'

/** 通知类型 */
const DICT_B_NOTICE_TYPE = 'b_notice_type'
const DICT_B_NOTICE_TYPE_0 = '0'

/**  生产计划状态：0制单，1已提交，2审核通过，3审核驳回，4作废，5作废审核中，6已完成 */
const DICT_B_PP_STATUS = 'b_pp_status'
const DICT_B_PP_STATUS_0 = '0'
const DICT_B_PP_STATUS_1 = '1'
const DICT_B_PP_STATUS_2 = '2'
const DICT_B_PP_STATUS_3 = '3'
const DICT_B_PP_STATUS_4 = '4'
const DICT_B_PP_STATUS_5 = '5'
const DICT_B_PP_STATUS_6 = '6'

/**  库存流水 业务类型 */
const DICT_B_INVENTORY_ACCOUNT_TYPE = 'b_inventory_account_type'

/**   数据看板穿透 0-默认 1-累计完成量（吨）2-在途数量 3-饲料厂收货数量 4-出库单页面稻壳 5-出库单页面杂质 6-出库页面销售累计出库量 */
const DICT_LOGISTICS_LARGE_SCREEN_ZERO = '0'
const DICT_LOGISTICS_LARGE_SCREEN_ONE = '1'
const DICT_LOGISTICS_LARGE_SCREEN_TWO = '2'
const DICT_LOGISTICS_LARGE_SCREEN_THREE = '3'
const DICT_LOGISTICS_LARGE_SCREEN_FOUR = '4'
const DICT_LOGISTICS_LARGE_SCREEN_FIVE = '5'
const DICT_LOGISTICS_LARGE_SCREEN_SIX = '6'

/**  是否包含发货指令  1-是 2-否*/
const DICT_B_OUT_RELEASE_STATUS = 'b_out_release_status'

/**  是否去除稻壳杂质  1-是 2-否*/
const DICT_B_IN_REMOVE_IMPURITY = 'b_in_remove_impurity'

/**  提货单 单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 */
const DICT_B_DELIVERY_BUSINESS_TYPE = 'b_delivery_bill_type'

/**  提货单 入库类型:6=提货入库 */
const DICT_B_DELIVERY_TYPE = 'b_delivery_type'

/** 提货单状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成 6作废审核中*/
const DICT_B_DELIVERY_STATUS = 'b_delivery_status'
const DICT_B_DELIVERY_STATUS_ZD = '0'
const DICT_B_DELIVERY_STATUS_YTJ = '1'
const DICT_B_DELIVERY_STATUS_TG = '2'
const DICT_B_DELIVERY_STATUS_BH = '3'
const DICT_B_DELIVERY_STATUS_ZF = '4'
const DICT_B_DELIVERY_STATUS_FINISH = '5'
const DICT_B_DELIVERY_STATUS_CANCEL_BEING_AUDITED = '6'

/** 收获单类型：8 = 直采出库 */
const DICT_B_RECEIVE_TYPE = 'b_receive_type'
const DICT_B_RECEIVE_TYPE_EIGHT = '8'

/** 收货状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成 6过期 7作废审核*/
const DICT_B_RECEIVE_STATUS = 'b_receive_status'
const DICT_B_RECEIVE_STATUS_ZD = '0'
const DICT_B_RECEIVE_STATUS_YTJ = '1'
const DICT_B_RECEIVE_STATUS_TG = '2'
const DICT_B_RECEIVE_STATUS_BH = '3'
const DICT_B_RECEIVE_STATUS_ZF = '4'
const DICT_B_RECEIVE_STATUS_FINISH = '5'
const DICT_B_RECEIVE_STATUS_EXPIRES = '6'
const DICT_B_RECEIVE_STATUS_CANCEL_BEING_AUDITED = '7'

/**  收货单 单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 */
const DICT_B_RECEIVE_BUSINESS_TYPE = 'b_receive_bill_type'

/**  退货管理 1-审核通过 2=作废 */
const DICT_B_RETURN_RELATION_STATUS = 'b_return_relation_status'
const DICT_B_RETURN_RELATION_STATUS_TG = '1'
const DICT_B_RETURN_RELATION_STATUS_ZF = '2'

/**  是否有退货 0-全部 1=是 2=否 */
const DICT_B_MONITOR_IF_RETURN_QTY = 'if_return_qty'

/**  0-正在处理 1-已撤销 2-办结（已完成） */
const DICT_BPM_INSTANCE_STATUS = 'bpm_instance_status'
const DICT_BPM_INSTANCE_STATUS_ZERO = '0'
const DICT_BPM_INSTANCE_STATUS_ONE = '1'
const DICT_BPM_INSTANCE_STATUS_TWO = '2'

/**  b_out_plan = 出库计划 */
const DICT_BPM_TODO_SERIAL_TYPE_OUT_PLAN = 'b_out_plan'

/**  按钮类型 agree = 同意  refuse=拒绝 transfer=转交  recall=退回 afterAdd=加签 cancel=撤回 comment=评论  */
const DICT_BPM_INSTANCE_PROCESS_BTN_AGREE = 'agree'
const DICT_BPM_INSTANCE_PROCESS_BTN_REFUSE = 'refuse'
const DICT_BPM_INSTANCE_PROCESS_BTN_TRANSFER = 'transfer'
const DICT_BPM_INSTANCE_PROCESS_BTN_RECALL = 'recall'
const DICT_BPM_INSTANCE_PROCESS_BTN_AFTERADD = 'afterAdd'
const DICT_BPM_INSTANCE_PROCESS_BTN_CANCEL = 'cancel'
const DICT_BPM_INSTANCE_PROCESS_BTN_COMMENT = 'comment'

/** 企业类型 1客户 2供应商 3仓储方 4承运商 5加工厂 */
const DICT_M_ENTERPRISE_TYPE = 'm_enterprise_type'
const DICT_M_ENTERPRISE_TYPE_ONE = '1'
const DICT_M_ENTERPRISE_TYPE_TWO = '2'
const DICT_M_ENTERPRISE_TYPE_THREE = '3'
const DICT_M_ENTERPRISE_TYPE_FOUR = '4'
const DICT_M_ENTERPRISE_TYPE_FIVE = '5'

const DICT_B_PROJECT = 'b_project'

/** 项目类型 0全托 1代采 2代销 */
const DICT_B_PROJECT_TYPE = 'b_project_type'
const DICT_B_PROJECT_TYPE_ZERO = '0'
const DICT_B_PROJECT_TYPE_ONE = '1'
const DICT_B_PROJECT_TYPE_TWO = '2'

/** 状态：0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成 */
const DICT_B_PROJECT_STATUS = 'b_project_status'
const DICT_B_PROJECT_STATUS_ZERO = '0'
const DICT_B_PROJECT_STATUS_ONE = '1'
const DICT_B_PROJECT_STATUS_TWO = '2'
const DICT_B_PROJECT_STATUS_THREE = '3'
const DICT_B_PROJECT_STATUS_FOUR = '4'
const DICT_B_PROJECT_STATUS_FIVE = '5'
const DICT_B_PROJECT_STATUS_SIX = '6'

/** 项目企业类型  0 供应商 1 客户 */
const DICT_B_PROJECT_ENTERPRISE_TYPE = 'b_project_enterprise_type'
const DICT_B_PROJECT_ENTERPRISE_TYPE_ZERO = '0'
const DICT_B_PROJECT_ENTERPRISE_TYPE_ONE = '1'

/** 项目运输方式  0 公路 1 铁路 2 多式联运 */
const DICT_B_PROJECT_DELIVERY_TYPE = 'b_project_delivery_type'
const DICT_B_PROJECT_DELIVERY_TYPE_ZERO = '0'
const DICT_B_PROJECT_DELIVERY_TYPE_ONE = '1'
const DICT_B_PROJECT_DELIVERY_TYPE_TWO = '2'

/** 项目付款方式 0依据合同 1预付款 2先款后货 */
const DICT_B_PROJECT_PAYMENT_METHOD = 'b_project_payment_method'
const DICT_B_PROJECT_PAYMENT_METHOD_ZERO = '0'
const DICT_B_PROJECT_PAYMENT_METHOD_ONE = '1'
const DICT_B_PROJECT_PAYMENT_METHOD_TWO = '2'

/**  项目管理作废审批流 */
const DICT_B_PROJECT_CANCEL = 'b_project_cancel'

/**  采购合同审批流 */
const DICT_B_PO_CONTRACT = 'b_po_contract'
/**  采购合同作废审批流 */
const DICT_B_PO_CONTRACT_CANCEL = 'b_po_contract_cancel'

/**  采购合同审批状态  0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成*/
const DICT_B_PO_CONTRACT_STATUS = 'b_po_contract_status'
const DICT_B_PO_CONTRACT_STATUS_ZERO = '0'
const DICT_B_PO_CONTRACT_STATUS_ONE = '1'
const DICT_B_PO_CONTRACT_STATUS_TWO = '2'
const DICT_B_PO_CONTRACT_STATUS_THREE = '3'
const DICT_B_PO_CONTRACT_STATUS_FOUR = '4'
const DICT_B_PO_CONTRACT_STATUS_FIVE = '5'
const DICT_B_PO_CONTRACT_STATUS_SIX = '6'

/**  采购合同类型  类型：0：标准合同；1：框架合同*/
const DICT_B_PO_CONTRACT_TYPE = 'b_po_contract_type'
const DICT_B_PO_CONTRACT_TYPE_ZERO = '0'
const DICT_B_PO_CONTRACT_TYPE_ONE = '1'

/**  税率：9%、13%、17%、6% */
const DICT_S_TAX_TYPE = 's_tax_type'
const DICT_S_TAX_TYPE_ONE = '6%'
const DICT_S_TAX_TYPE_TWO = '17%'
const DICT_S_TAX_TYPE_THREE = '13%'
const DICT_S_TAX_TYPE_FOUR = '9%'
/**  采购合同运输方式：1-公路；2-铁路；3-多式联运；*/
const DICT_B_PO_CONTRACT_DELIVERY_TYPE = 'b_po_contract_delivery_type'
const DICT_B_PO_CONTRACT_DELIVERY_TYPE_ONE = '1'
const DICT_B_PO_CONTRACT_DELIVERY_TYPE_TWO = '2'
const DICT_B_PO_CONTRACT_DELIVERY_TYPE_THREE = '3'

/**  采购合同结算方式：1-先款后货；2-先货后款；3-货到付款；*/
const DICT_B_PO_CONTRACT_SETTLE_TYPE = 'b_po_contract_settle_type'
const DICT_B_PO_CONTRACT_SETTLE_TYPE_ONE = '1'
const DICT_B_PO_CONTRACT_SETTLE_TYPE_TWO = '2'
const DICT_B_PO_CONTRACT_SETTLE_TYPE_THREE = '3'

/**  采购合同结算单据类型：1-实际到货结算；2-货转凭证结算*/
const DICT_B_PO_CONTRACT_BILL_TYPE = 'b_po_contract_bill_type'
const DICT_B_PO_CONTRACT_BILL_TYPE_ONE = '1'
const DICT_B_PO_CONTRACT_BILL_TYPE_TWO = '2'

/**  采购合同付款方式：1-银行转账*/
const DICT_B_PO_CONTRACT_PAYMENT_TYPE = 'b_po_contract_payment_type'
const DICT_B_PO_CONTRACT_PAYMENT_TYPE_ONE = '1'

/**  采购合同审批后自动生成订单 0-FALSE 1=TRUE*/
const DICT_B_PO_CONTRACT_AUTO_CREATE_ORDER = 'b_po_contract_auto_create'
const DICT_B_PO_CONTRACT_AUTO_CREATE_ORDER_ZERO = '0'
const DICT_B_PO_CONTRACT_AUTO_CREATE_ORDER_ONE = '1'

/**  销售合同表 */
const DICT_B_SO_CONTRACT = 'b_so_contract'

/**  销售合同审批状态  0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成*/
const DICT_B_SO_CONTRACT_CANCEL = 'b_so_contract_cancel'
const DICT_B_SO_CONTRACT_STATUS = 'b_so_contract_status'
const DICT_B_SO_CONTRACT_STATUS_ZERO = '0'
const DICT_B_SO_CONTRACT_STATUS_ONE = '1'
const DICT_B_SO_CONTRACT_STATUS_TWO = '2'
const DICT_B_SO_CONTRACT_STATUS_THREE = '3'
const DICT_B_SO_CONTRACT_STATUS_FOUR = '4'
const DICT_B_SO_CONTRACT_STATUS_FIVE = '5'
const DICT_B_SO_CONTRACT_STATUS_SIX = '6'

/**  销售合同类型  类型：0：标准合同；1：框架合同*/
const DICT_B_SO_CONTRACT_TYPE = 'b_so_contract_type'
const DICT_B_SO_CONTRACT_TYPE_ZERO = '0'
const DICT_B_SO_CONTRACT_TYPE_ONE = '1'

/**  销售合同运输方式：1-公路；2-铁路；3-多式联运；*/
const DICT_B_SO_CONTRACT_DELIVERY_TYPE = 'b_so_contract_delivery_type'
const DICT_B_SO_CONTRACT_DELIVERY_TYPE_ONE = '1'
const DICT_B_SO_CONTRACT_DELIVERY_TYPE_TWO = '2'
const DICT_B_SO_CONTRACT_DELIVERY_TYPE_THREE = '3'

/**  销售合同结算方式：1-先款后货；2-先货后款；3-货到付款；*/
const DICT_B_SO_CONTRACT_SETTLE_TYPE = 'b_so_contract_settle_type'
const DICT_B_SO_CONTRACT_SETTLE_TYPE_ONE = '1'
const DICT_B_SO_CONTRACT_SETTLE_TYPE_TWO = '2'
const DICT_B_SO_CONTRACT_SETTLE_TYPE_THREE = '3'

/**  销售合同结算单据类型：1-实际到货结算；2-货转凭证结算*/
const DICT_B_SO_CONTRACT_BILL_TYPE = 'b_so_contract_bill_type'
const DICT_B_SO_CONTRACT_BILL_TYPE_ONE = '1'
const DICT_B_SO_CONTRACT_BILL_TYPE_TWO = '2'

/**  销售合同付款方式：1-银行转账*/
const DICT_B_SO_CONTRACT_PAYMENT_TYPE = 'b_so_contract_payment_type'
const DICT_B_SO_CONTRACT_PAYMENT_TYPE_ONE = '1'

/**  销售合同审批后自动生成订单 0-FALSE 1=TRUE*/
const DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER = 'b_so_contract_auto_create'
const DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER_ZERO = '0'
const DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER_ONE = '1'

/** 评论类型：0-已阅、1-收到、2-已核对、3-合格、4-情况属实、5-确认、6-已复核、7-知悉、8-辛苦了 */
const DICT_APPROVE_COMMENT_TYPE = 'approve_comment_type'
const DICT_APPROVE_COMMENT_TYPE_ZERO = '0'
const DICT_APPROVE_COMMENT_TYPE_ONE = '1'
const DICT_APPROVE_COMMENT_TYPE_TWO = '2'
const DICT_APPROVE_COMMENT_TYPE_THREE = '3'
const DICT_APPROVE_COMMENT_TYPE_FOUR = '4'
const DICT_APPROVE_COMMENT_TYPE_FIVE = '5'
const DICT_APPROVE_COMMENT_TYPE_SIX = '6'
const DICT_APPROVE_COMMENT_TYPE_SEVEN = '7'
const DICT_APPROVE_COMMENT_TYPE_EIGHT = '8'

/**  采购订单表 */
const DICT_B_PO_ORDER = 'b_po_order'

/**  采购订单审批状态  0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成*/
const DICT_B_PO_ORDER_CANCEL = 'b_po_order_cancel'
const DICT_B_PO_ORDER_STATUS = 'b_po_order_status'
const DICT_B_PO_ORDER_STATUS_ZERO = '0'
const DICT_B_PO_ORDER_STATUS_ONE = '1'
const DICT_B_PO_ORDER_STATUS_TWO = '2'
const DICT_B_PO_ORDER_STATUS_THREE = '3'
const DICT_B_PO_ORDER_STATUS_FOUR = '4'
const DICT_B_PO_ORDER_STATUS_FIVE = '5'
const DICT_B_PO_ORDER_STATUS_SIX = '6'

/**  采购订单类型  类型：0：标准合同；1：框架合同*/
const DICT_B_PO_ORDER_TYPE = 'b_po_order_type'
const DICT_B_PO_ORDER_TYPE_ZERO = '0'
const DICT_B_PO_ORDER_TYPE_ONE = '1'

/**  采购订单运输方式：1-公路；2-铁路；3-多式联运；*/
const DICT_B_PO_ORDER_DELIVERY_TYPE = 'b_po_order_delivery_type'
const DICT_B_PO_ORDER_DELIVERY_TYPE_ONE = '1'
const DICT_B_PO_ORDER_DELIVERY_TYPE_TWO = '2'
const DICT_B_PO_ORDER_DELIVERY_TYPE_THREE = '3'

/**  采购订单结算方式：1-先款后货；2-先货后款；3-货到付款；*/
const DICT_B_PO_ORDER_SETTLE_TYPE = 'b_po_order_settle_type'
const DICT_B_PO_ORDER_SETTLE_TYPE_ONE = '1'
const DICT_B_PO_ORDER_SETTLE_TYPE_TWO = '2'
const DICT_B_PO_ORDER_SETTLE_TYPE_THREE = '3'

/**  采购订单结算单据类型：1-实际到货结算；2-货转凭证结算*/
const DICT_B_PO_ORDER_BILL_TYPE = 'b_po_order_bill_type'
const DICT_B_PO_ORDER_BILL_TYPE_ONE = '1'
const DICT_B_PO_ORDER_BILL_TYPE_TWO = '2'

/**  采购订单付款方式：1-银行转账*/
const DICT_B_PO_ORDER_PAYMENT_TYPE = 'b_po_order_payment_type'
const DICT_B_PO_ORDER_PAYMENT_TYPE_ONE = '1'

/**  销售订单表 */
const DICT_B_SO_ORDER = 'b_so_order'

/**  销售订单审批状态  0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成*/
const DICT_B_SO_ORDER_CANCEL = 'b_so_order_cancel'
const DICT_B_SO_ORDER_STATUS = 'b_so_order_status'
const DICT_B_SO_ORDER_STATUS_ZERO = '0'
const DICT_B_SO_ORDER_STATUS_ONE = '1'
const DICT_B_SO_ORDER_STATUS_TWO = '2'
const DICT_B_SO_ORDER_STATUS_THREE = '3'
const DICT_B_SO_ORDER_STATUS_FOUR = '4'
const DICT_B_SO_ORDER_STATUS_FIVE = '5'
const DICT_B_SO_ORDER_STATUS_SIX = '6'

/**  销售订单类型  类型：0：标准合同；1：框架合同*/
const DICT_B_SO_ORDER_TYPE = 'b_so_order_type'
const DICT_B_SO_ORDER_TYPE_ZERO = '0'
const DICT_B_SO_ORDER_TYPE_ONE = '1'

/**  销售订单运输方式：1-公路；2-铁路；3-多式联运；*/
const DICT_B_SO_ORDER_DELIVERY_TYPE = 'b_so_order_delivery_type'
const DICT_B_SO_ORDER_DELIVERY_TYPE_ONE = '1'
const DICT_B_SO_ORDER_DELIVERY_TYPE_TWO = '2'
const DICT_B_SO_ORDER_DELIVERY_TYPE_THREE = '3'

/**  销售订单结算方式：1-先款后货；2-先货后款；3-货到付款；*/
const DICT_B_SO_ORDER_SETTLE_TYPE = 'b_so_order_settle_type'
const DICT_B_SO_ORDER_SETTLE_TYPE_ONE = '1'
const DICT_B_SO_ORDER_SETTLE_TYPE_TWO = '2'
const DICT_B_SO_ORDER_SETTLE_TYPE_THREE = '3'

/**  销售订单结算单据类型：1-实际到货结算；2-货转凭证结算*/
const DICT_B_SO_ORDER_BILL_TYPE = 'b_so_order_bill_type'
const DICT_B_SO_ORDER_BILL_TYPE_ONE = '1'
const DICT_B_SO_ORDER_BILL_TYPE_TWO = '2'

/**  销售订单付款方式：1-银行转账*/
const DICT_B_SO_ORDER_PAYMENT_TYPE = 'b_so_order_payment_type'
const DICT_B_SO_ORDER_PAYMENT_TYPE_ONE = '1'

/**
 *  企业银行类型（YUFUKUAN-预付款、YUSHOUKUAN-预收款、YINFUKUAN-应付款、YINSHOUKUAN-应收款
 */
const DICT_M_BANK_TYPE_ONE = 'YUFUKUAN'
const DICT_M_BANK_TYPE_TWO = 'YUSHOUKUAN'
const DICT_M_BANK_TYPE_THREE = 'YINFUKUAN'
const DICT_M_BANK_TYPE_FOUR = 'YINFUKUAN'

/**
 *  企业银行账户表 0-禁用 1-可用 -1-删除
 */
const DICT_M_BANK_STATUS = 'm_bank_status'
const DICT_M_BANK_STATUS_ZERO = '0'
const DICT_M_BANK_STATUS_ONE = '1'
const DICT_M_BANK_STATUS_DEL = '-1'

/** 应付账款管理表 */
const DICT_B_AP = 'b_ap'

/** 应付账款管理业务类型 1-应付、2-预付、3-其他支出 */
const DICT_B_AP_CANCEL = 'b_ap_cancel'
const DICT_B_AP_TYPE = 'b_ap_type'
const DICT_B_AP_TYPE_ONE = '1'
const DICT_B_AP_TYPE_TWO = '2'
const DICT_B_AP_TYPE_THREE = '3'

/** 应付账款管理审批状态 0-待审批 1-审批中 2-审批通过 3-驳回 4-作废审批中 5-已作废 6-已完成 */
const DICT_B_AP_STATUS = 'b_ap_status'
const DICT_B_AP_STATUS_ZERO = '0'
const DICT_B_AP_STATUS_ONE = '1'
const DICT_B_AP_STATUS_TWO = '2'
const DICT_B_AP_STATUS_THREE = '3'
const DICT_B_AP_STATUS_FOUR = '4'
const DICT_B_AP_STATUS_FIVE = '5'
const DICT_B_AP_STATUS_SIX = '6'

/** 应付账款管理付款状态 付款状态：0-未付款、1-部分付款、2-已付款、-1-中止付款 */
const DICT_B_AP_PAY_STATUS = 'b_ap_pay_status'
const DICT_B_AP_PAY_STATUS_ZERO = '0'
const DICT_B_AP_PAY_STATUS_ONE = '1'
const DICT_B_AP_PAY_STATUS_TWO = '2'
const DICT_B_AP_PAY_STATUS_STOP = '-1'

/** 付款单状态：状态（0-待付款、1已付款、2-作废、-1-中止付款） */
const DICT_B_AP_PAY_BILL_STATUS = 'b_ap_pay_bill_status'
const DICT_B_AP_PAY_BILL_STATUS_ZERO = '0'
const DICT_B_AP_PAY_BILL_STATUS_ONE = '1'
const DICT_B_AP_PAY_BILL_STATUS_TWO = '2'
const DICT_B_AP_PAY_BILL_STATUS_STOP = '-1'

/** 应付退款管理业务类型 1-应付、2-预付、3-其他支出 */
const DICT_B_AP_REFUND = 'b_ap_refund'
const DICT_B_AP_REFUND_CANCEL = 'b_ap_refund_cancel'
const DICT_B_AP_REFUND_TYPE = 'b_ap_refund_type'
const DICT_B_AP_REFUND_TYPE_ONE = '1'
const DICT_B_AP_REFUND_TYPE_TWO = '2'
const DICT_B_AP_REFUND_TYPE_THREE = '3'

/** 应付退款管理审批状态 0-待审批 1-审批中 2-审批通过 3-驳回 4-作废审批中 5-已作废 6-已完成 */
const DICT_B_AP_REFUND_STATUS = 'b_ap_refund_status'
const DICT_B_AP_REFUND_STATUS_ZERO = '0'
const DICT_B_AP_REFUND_STATUS_ONE = '1'
const DICT_B_AP_REFUND_STATUS_TWO = '2'
const DICT_B_AP_REFUND_STATUS_THREE = '3'
const DICT_B_AP_REFUND_STATUS_FOUR = '4'
const DICT_B_AP_REFUND_STATUS_FIVE = '5'
const DICT_B_AP_REFUND_STATUS_SIX = '6'

/** 应付退款管理付款状态 付款状态：0-未付款、1-部分付款、2-已付款、-1-中止付款 */
const DICT_B_AP_REFUND_PAY_STATUS = 'b_ap_refund_pay_status'
const DICT_B_AP_REFUND_PAY_STATUS_ZERO = '0'
const DICT_B_AP_REFUND_PAY_STATUS_ONE = '1'
const DICT_B_AP_REFUND_PAY_STATUS_TWO = '2'
const DICT_B_AP_REFUND_PAY_STATUS_STOP = '-1'

/** 退款单状态：状态（1-待付款、2已付款、3-作废 -1-中止付款）*/
const DICT_B_AP_REFUND_PAY_ONE_STATUS = 'b_ap_refund_pay_one_status'
const DICT_B_AP_REFUND_PAY_ONE_STATUS_ONE = '1'
const DICT_B_AP_REFUND_PAY_ONE_STATUS_TWO = '2'
const DICT_B_AP_REFUND_PAY_ONE_STATUS_THREE = '3'
const DICT_B_AP_REFUND_PAY_ONE_STATUS_STOP = '-1'

export default {
  /** 隐藏显示类型： 0：显示 1：隐藏 null:全部 */
  DICT_SYS_VISIBLE_TYPE,
  DICT_SYS_VISIBLE_TYPE_SHOW,
  DICT_SYS_VISIBLE_TYPE_HIDDEN,
  DICT_SYS_VISIBLE_TYPE_ALL,
  /** 按钮类型： */
  DICT_BTN_NAME_TYPE,
  /** 地址簿_tag标签  */
  DICT_SYS_ADDRESS_TAG_TYPE,
  /** 企业类型  */
  DICT_SYS_COMPANY_TYPE,
  /** 性别  */
  DICT_SYS_SEX_TYPE,
  /** 在职情况  */
  DICT_USR_SERVICE_TYPE,
  /** 学历  */
  DICT_USR_DEGREE_TYPE,
  /** 婚否  */
  DICT_USR_WED_TYPE,
  /** 登录用户类型  */
  DICT_USR_LOGIN_TYPE,
  /** 组织机构类型  */
  DICT_ORG_SETTING_TYPE,
  /** 组织机构类型：租户  */
  DICT_ORG_SETTING_TYPE_TENANT,
  /** 组织机构类型：集团  */
  DICT_ORG_SETTING_TYPE_GROUP,
  /** 组织机构类型：企业  */
  DICT_ORG_SETTING_TYPE_COMPANY,
  /** 组织机构类型：部门  */
  DICT_ORG_SETTING_TYPE_DEPT,
  /** 组织机构类型：岗位  */
  DICT_ORG_SETTING_TYPE_POSITION,
  /** 组织机构类型：人员  */
  DICT_ORG_SETTING_TYPE_STAFF,
  /** 登录模式：（10：手机号码；20：邮箱） */
  DICT_SYS_LOGIN_TYPE,
  /** 自动编码类型 */
  DICT_SYS_CODE_RULE_TYPE,
  /** 自动编码名称 */
  DICT_SYS_CODE_TYPE,
  /** 组织架构中已被使用 */
  DICT_ORG_USED_TYPE,
  /** 显示组织机构中未被使用  */
  DICT_ORG_USED_TYPE_SHOW_UNUSED,
  /** 显示所有  */
  DICT_ORG_USED_TYPE_SHOW_ALL,
  /** 菜单类型  */
  DICT_SYS_MENU_TYPE,
  /** 根结点  */
  DICT_SYS_MENU_TYPE_ROOT,
  /** 顶部导航栏  */
  DICT_SYS_MENU_TYPE_TOPNAV,
  /** 结点  */
  DICT_SYS_MENU_TYPE_NODE,
  /** 页面  */
  DICT_SYS_MENU_TYPE_PAGE,
  /** 权限类型  */
  DICT_MSTR_PERMISSION_TYPE,
  /** 部门权限  */
  DICT_MSTR_PERMISSION_TYPE_DEPT,
  /** 岗位权限  */
  DICT_MSTR_PERMISSION_TYPE_POSITION,
  /** 用户权限  */
  DICT_MSTR_PERMISSION_TYPE_USER,
  /** 排除权限  */
  DICT_MSTR_PERMISSION_TYPE_OUT,
  /** 角色权限  */
  DICT_MSTR_PERMISSION_TYPE_ROLE,
  /** 删除类型：0：未删除 1：已删除  */
  DICT_SYS_DELETE_MAP,
  DICT_SYS_DELETE_MAP_YES,
  DICT_SYS_DELETE_MAP_NO,
  DICT_SYS_DELETE_MAP_ALL,
  /** 仓库类型 1. 直属库, 2加工厂库, 3.铁路码头虚拟库, 4.饲料厂库  */
  DICT_M_WAREHOUSE_TYPE,
  DICT_M_WAREHOUSE_TYPE_ZX,
  DICT_M_WAREHOUSE_TYPE_WD,
  DICT_M_WAREHOUSE_TYPE_TL,
  DICT_M_WAREHOUSE_TYPE_CL,

  /** 企业性质（1民营，2国企，3合资，4外资）*/
  DICT_M_CUSTOMER,
  DICT_M_ENTERPRISE,
  DICT_M_CUSTOMER_SCOPE,
  DICT_M_CUSTOMER_SCOPE_MY,
  DICT_M_CUSTOMER_SCOPE_GQ,
  DICT_M_CUSTOMER_SCOPE_HZ,
  DICT_M_CUSTOMER_SCOPE_WZ,

  /**  客户来源（1独立开发） */
  DICT_M_CUSTOMER_SOURCE,
  DICT_M_CUSTOMER_SOURCE_DL,

  /** 客户类别：1借款方，2贷款方，3担保方，4管理企业，5其他 */
  DICT_M_CUSTOMER_TYPE,
  DICT_M_CUSTOMER_TYPE_JK,
  DICT_M_CUSTOMER_TYPE_DK,
  DICT_M_CUSTOMER_TYPE_DB,
  DICT_M_CUSTOMER_TYPE_GL,
  DICT_M_CUSTOMER_TYPE_QT,

  /**  企业类型：1有限责任公司（自然人投资或控股），2股份有限公司分公司（上市、国有股份） */
  DICT_M_CUSTOMER_MOLD,
  DICT_M_CUSTOMER_MOLD_YX,
  DICT_M_CUSTOMER_MOLD_GF,

  /**  企业状态 */
  DICT_M_CUSTOMER_STATUS,
  DICT_M_CUSTOMER_STATUS_ZERO,
  DICT_M_CUSTOMER_STATUS_ONE,
  DICT_M_CUSTOMER_STATUS_TWO,
  DICT_M_CUSTOMER_STATUS_THREE,

  /**  企业状态 */
  DICT_M_ENTERPRISE_STATUS,
  DICT_M_ENTERPRISE_STATUS_ZERO,
  DICT_M_ENTERPRISE_STATUS_ONE,
  DICT_M_ENTERPRISE_STATUS_TWO,
  DICT_M_ENTERPRISE_STATUS_THREE,

  /**  企业状态：0=否 1=是 */
  DICT_M_CUSTOMER_BLACKLIST,
  DICT_M_CUSTOMER_BLACKLIST_ZERO,
  DICT_M_CUSTOMER_BLACKLIST_ONE,

  /**  单位：1吨,2湿吨，3卷，4扎，5根 */
  DICT_M_UNIT,
  DICT_M_UNIT_D,
  DICT_M_UNIT_SD,
  DICT_M_UNIT_J,
  DICT_M_UNIT_Z,
  DICT_M_UNIT_G,

  /** 入库计划状态：状态：0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成 */
  DICT_B_IN_STATUS,
  DICT_B_IN_STATUS_ZERO,
  DICT_B_IN_STATUS_ONE,
  DICT_B_IN_STATUS_TWO,
  DICT_B_IN_STATUS_THREE,
  DICT_B_IN_STATUS_FOUR,
  DICT_B_IN_STATUS_FIVE,
  DICT_B_IN_STATUS_SIX,

  /** 入库类型：0采购入库，1调拨入库，2退货入库，5生产入库，9监管入库，10普通入库 */
  DICT_B_IN_TYPE,
  DICT_B_IN_TYPE_CG,
  DICT_B_IN_TYPE_DB,
  DICT_B_IN_TYPE_TH,
  DICT_B_IN_TYPE_SC,
  DICT_B_IN_TYPE_JG,
  DICT_B_IN_TYPE_PT,

  /** 入库计划表 审批流 */
  DICT_B_IN_PLAN,
  /** 入库计划表 审批作废流 */
  DICT_B_IN_PLAN_CANCEL,

  /** 入库计划状态  0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成*/
  DICT_B_IN_PLAN_STATUS,
  DICT_B_IN_PLAN_STATUS_ZERO,
  DICT_B_IN_PLAN_STATUS_ONE,
  DICT_B_IN_PLAN_STATUS_TWO,
  DICT_B_IN_PLAN_STATUS_THREE,
  DICT_B_IN_PLAN_STATUS_FOUR,
  DICT_B_IN_PLAN_STATUS_FIVE,
  DICT_B_IN_PLAN_STATUS_SIX,

  /** 出库计划状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成 */
  DICT_B_OUT_PLAN_STATUS,
  DICT_B_OUT_PLAN_STATUS_ZD,
  DICT_B_OUT_PLAN_STATUS_YTJ,
  DICT_B_OUT_PLAN_STATUS_TG,
  DICT_B_OUT_PLAN_STATUS_BH,
  DICT_B_OUT_PLAN_STATUS_ZF,
  DICT_B_OUT_PLAN_STATUS_FINISH,
  DICT_B_OUT_PLAN_STATUS_EXPIRES,
  DICT_B_OUT_PLAN_STATUS_DISCONTINUE,
  DICT_B_OUT_PLAN_STATUS_CANCEL_BEING_AUDITED,

  /** 出库状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成 */
  DICT_B_OUT_STATUS,
  DICT_B_OUT_STATUS_ZD,
  DICT_B_OUT_STATUS_YTJ,
  DICT_B_OUT_STATUS_TG,
  DICT_B_OUT_STATUS_BH,
  DICT_B_OUT_STATUS_ZF,
  DICT_B_OUT_STATUS_FINISH,
  DICT_B_OUT_STATUS_EXPIRES,
  DICT_B_OUT_STATUS_CANCEL_BEING_AUDITED,

  /**  单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 */
  DICT_B_IN_BUSINESS_TYPE,
  DICT_B_IN_BUSINESS_TYPE_GYL,
  DICT_B_IN_BUSINESS_TYPE_DL,
  DICT_B_IN_BUSINESS_TYPE_ZX,
  DICT_B_IN_BUSINESS_TYPE_FG,

  /** 出库计划类型：0调拨出库，1库存调整，2盘亏出库，3监管出库，4普通出库， 5销售出库，6退货出库,7领料出库 */
  DICT_B_OUT_PLAN_TYPE,
  DICT_B_OUT_PLAN_TYPE_DB,
  DICT_B_OUT_PLAN_TYPE_KC,
  DICT_B_OUT_PLAN_TYPE_PK,
  DICT_B_OUT_PLAN_TYPE_JG,
  DICT_B_OUT_PLAN_TYPE_PT,
  DICT_B_OUT_PLAN_TYPE_XS,
  DICT_B_OUT_PLAN_TYPE_TH,
  DICT_B_OUT_PLAN_TYPE_LL,
  DICT_B_OUT_PLAN_TYPE_ZC,

  /** 出库单类型：0调拨出库，1库存调整，2盘亏出库，3监管出库，4普通出库， 5销售出库，6退货出库,7领料出库 */
  DICT_B_OUT_TYPE,
  DICT_B_OUT_TYPE_DB,
  DICT_B_OUT_TYPE_KC,
  DICT_B_OUT_TYPE_PK,
  DICT_B_OUT_TYPE_JG,
  DICT_B_OUT_TYPE_PT,
  DICT_B_OUT_TYPE_XS,
  DICT_B_OUT_TYPE_TH,
  DICT_B_OUT_TYPE_LL,

  /**  出库计划单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 4直销业务*/
  DICT_B_OUT_PLAN_BUSINESS_TYPE,
  DICT_B_OUT_PLAN_BUSINESS_TYPE_GYL,
  DICT_B_OUT_PLAN_BUSINESS_TYPE_DL,
  DICT_B_OUT_PLAN_BUSINESS_TYPE_ZX,
  DICT_B_OUT_PLAN_BUSINESS_TYPE_FG,
  DICT_B_OUT_PLAN_BUSINESS_TYPE_ZXCK,

  /**  出库计划单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 4直销出库*/
  DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE,
  DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_GYL,
  DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_DL,
  DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_ZX,
  DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_FG,
  DICT_B_IN_ORDER_PLAN_BUSINESS_TYPE_ZXCK,

  /**  入库计划 单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 */
  DICT_B_IN_PLAN_BUSINESS_TYPE,
  DICT_B_IN_PLAN_BUSINESS_TYPE_GYL,
  DICT_B_IN_PLAN_BUSINESS_TYPE_DL,
  DICT_B_IN_PLAN_BUSINESS_TYPE_ZX,
  DICT_B_IN_PLAN_BUSINESS_TYPE_FG,

  /** 调整单状态：0制单，1已提交，2审核通过，3审核驳回 */
  DICT_B_ADJUST_STATUS,
  DICT_B_ADJUST_STATUS_SAVED,
  DICT_B_ADJUST_STATUS_SUBMITTED,
  DICT_B_ADJUST_STATUS_PASSED,
  DICT_B_ADJUST_STATUS_RETURN,

  /** 调整单类型：1调整调整，2盘盈调整，3盘亏调整 */
  DICT_B_ADJUST_TYPE,
  DICT_B_ADJUST_TYPE_NORMAL,
  DICT_B_ADJUST_TYPE_MORE,
  DICT_B_ADJUST_TYPE_LESS,

  /** 库存调整类型：1保持库存货值不变，2调整货值 */
  DICT_B_ADJUST_RULE,
  DICT_B_ADJUST_RULE_ONE,
  DICT_B_ADJUST_RULE_TWO,
  DICT_B_ADJUST_RULE_THREE,

  /** 委托方  */
  DICT_CONSIGNOR,
  /** 货主  */
  DICT_OWNER,
  /** 供应商  */
  DICT_SUPPLIER,
  /** 入库计划明细编号 */
  DICT_SYS_CODE_TYPE_B_IN_PLAN_DETAIL,
  /** 定时任务组:00系统、01每日库存 */
  DICT_SYS_JOB_GROUP_TYPE,
  DICT_SYS_JOB_GROUP_TYPE_SYS,
  DICT_SYS_JOB_GROUP_TYPE_DAILY_INVENTORY,
  DICT_SYS_JOB_GROUP_TYPE_DAILY_INVENTORY_DIFF,

  /** 交货方式: 1自提  2物流 */
  DICT_DELIVERY_TYPE,
  DICT_DELIVERY_TYPE_ONE,
  DICT_DELIVERY_TYPE_TWO,

  /** 监管任务发货类型:0入库，1卸货 */
  DICT_MONITOR_TYPE_IN,
  DICT_MONITOR_TYPE_IN_ONE,
  DICT_MONITOR_TYPE_IN_TWO,

  /** 监管任务发货类型:0出库，1提货 */
  DICT_MONITOR_TYPE_OUT,
  DICT_MONITOR_TYPE_OUT_ONE,
  DICT_MONITOR_TYPE_OUT_TWO,

  /**
              * 仓库分组定义：1一级；2二级；3三级
              */
  DICT_B_WAREHOUSE_GROUP,
  // 一级
  DICT_B_WAREHOUSE_GROUP_1,
  // 二级
  DICT_B_WAREHOUSE_GROUP_2,
  // 三级
  DICT_B_WAREHOUSE_GROUP_3,

  /**
              * 物流订单 出库计划生成方式：0 系统生成出库计划 1 手动选择出库计划
              */
  DICT_B_LOGISTICS_OUT_RULE,
  // 系统生成出库计划
  DICT_B_LOGISTICS_OUT_RULE_0,
  // 手动选择出库计划
  DICT_B_LOGISTICS_OUT_RULE_1,

  /**
              * 物流订单 入库计划生成方式：0 系统生成入库计划 1 手动选择入库计划
              */
  DICT_B_LOGISTICS_IN_RULE,
  // 系统生成入库计划
  DICT_B_LOGISTICS_IN_RULE_0,
  // 手动选择入库计划
  DICT_B_LOGISTICS_IN_RULE_1,

  /**
              * app版本更新类型：0 非强制；1强制；
              */
  DICT_S_APP_NOTICE_TYPE,
  // 非强制
  DICT_S_APP_NOTICE_TYPE0,
  // 强制
  DICT_S_APP_NOTICE_TYPE1,

  /**
              * 0待调度，1已完成，2制单，3已提交，4已驳回, 5已作废
              */
  DICT_B_SCHEDULE_STATUS,
  DICT_B_SCHEDULE_STATUS_ZERO,
  DICT_B_SCHEDULE_STATUS_ONE,
  DICT_B_SCHEDULE_STATUS_TWO,
  DICT_B_SCHEDULE_STATUS_THREE,
  DICT_B_SCHEDULE_STATUS_FOUR,
  DICT_B_SCHEDULE_STATUS_FIVE,

  /**
          * 1物流订单, 2物流调度 3物流直达
          */
  DICT_B_SCHEDULE_TYPE,
  DICT_B_SCHEDULE_TYPE_ONE,
  DICT_B_SCHEDULE_TYPE_TWO,
  DICT_B_SCHEDULE_TYPE_THREE,
  DICT_B_SCHEDULE_TYPE_FOUR,
  DICT_B_SCHEDULE_TYPE_FIVE,

  /**
                * 监管任务_状态：0空车过磅，1正在装货，2重车出库，3装货完成 4重车过磅，5正在卸货，6空车出库，7卸货完成（完成）,8作废
                */
  DICT_B_MONITOR_STATUS,
  DICT_B_MONITOR_STATUS_ZERO,
  DICT_B_MONITOR_STATUS_ONE,
  DICT_B_MONITOR_STATUS_TWO,
  DICT_B_MONITOR_STATUS_THREE,
  DICT_B_MONITOR_STATUS_FOUR,
  DICT_B_MONITOR_STATUS_FIVE,
  DICT_B_MONITOR_STATUS_SIX,
  DICT_B_MONITOR_STATUS_SEVEN,
  DICT_B_MONITOR_STATUS_EIGHT,

  /**
                * 订单类型 b_in_order:采购订单 b_out_order 销售订单
                */
  DICT_B_ORDER_TYPE,
  DICT_B_ORDER_IN,
  DICT_B_ORDER_OUT,

  /**
                * 物料转换执行类型：0单次任务 1定时任务
                */
  DICT_B_MATERIAL_CONVERT_TYPE,
  DICT_B_MATERIAL_CONVERT_TYPE_ZERO,
  DICT_B_MATERIAL_CONVERT_TYPE_ONE,

  /**
                * 物料转换频次：0每分钟 1每小时 2每天
                */
  DICT_B_MATERIAL_CONVERT_FREQUENCY,
  DICT_B_MATERIAL_CONVERT_FREQUENCY_ZERO,
  DICT_B_MATERIAL_CONVERT_FREQUENCY_ONE,
  DICT_B_MATERIAL_CONVERT_FREQUENCY_TWO,

  /**
                * 采购订单状态： 状态 0执行中 1已完成 -1作废
                */
  DICT_B_IN_ORDER_STATUS,
  DICT_B_IN_ORDER_STATUS_ONE,
  DICT_B_IN_ORDER_STATUS_TWO,
  DICT_B_IN_ORDER_STATUS_THREE,

  /**
               * 销售订单状态： 状态 0执行中 1已完成 -1作废
               */
  DICT_B_OUT_ORDER_STATUS,
  DICT_B_OUT_ORDER_STATUS_ONE,
  DICT_B_OUT_ORDER_STATUS_TWO,
  DICT_B_OUT_ORDER_STATUS_THREE,

  /** 物料转换状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成*/
  DICT_B_MATERIAL_CONVERT_STATUS,
  DICT_B_MATERIAL_CONVERT_STATUS_ZD,
  DICT_B_MATERIAL_CONVERT_STATUS_YTJ,
  DICT_B_MATERIAL_CONVERT_STATUS_TG,
  DICT_B_MATERIAL_CONVERT_STATUS_BH,
  DICT_B_MATERIAL_CONVERT_STATUS_ZF,

  /**
                * 物流订单运输方式：0公运、1铁运、2水运
                */
  DICT_B_SCHEDULE_TRANSPORT_TYPE,
  DICT_B_SCHEDULE_TRANSPORT_TYPE_0,
  DICT_B_SCHEDULE_TRANSPORT_TYPE_1,
  DICT_B_SCHEDULE_TRANSPORT_TYPE_2,

  /**
              * 仓库片区
              */
  DICT_M_WAREHOUSE_ZONE,
  DICT_M_WAREHOUSE_ZONE1,
  DICT_M_WAREHOUSE_ZONE2,
  DICT_M_WAREHOUSE_ZONE3,
  DICT_M_WAREHOUSE_ZONE4,

  DICT_B_ALLOCATION_STATUS,
  DICT_B_ALLOCATION_STATUS_ZONE0,
  DICT_B_ALLOCATION_STATUS_ZONE1,
  DICT_B_ALLOCATION_STATUS_ZONE2,
  DICT_B_ALLOCATION_STATUS_ZONE3,
  DICT_B_ALLOCATION_STATUS_ZONE4,

  DICT_B_MATERIAL_CONVERT_EFFECTIVE,
  DICT_B_MATERIAL_CONVERT_EFFECTIVE0,
  DICT_B_MATERIAL_CONVERT_EFFECTIVE1,

  /** 产成品, 副产品 */
  DICT_B_ROUTER_PRODUCT_TYPE,
  DICT_B_ROUTER_PRODUCT_TYPE_C,
  DICT_B_ROUTER_PRODUCT_TYPE_F,

  /** 生产配方, 1 启用 0禁用 */
  DICT_B_ROUTER_ENABLE,
  DICT_B_ROUTER_ENABLE_0,
  DICT_B_ROUTER_ENABLE_1,

  DICT_B_WO_STATUS,
  DICT_B_WO_STATUS_1,
  DICT_B_WO_STATUS_2,
  DICT_B_WO_STATUS_3,
  DICT_B_WO_STATUS_4,
  DICT_B_WO_STATUS_5,

  /** 0未结算, 1已结算 */
  DICT_B_MONITOR_SETTLEMENT_STATUS,
  DICT_B_MONITOR_SETTLEMENT_STATUS_0,
  DICT_B_MONITOR_SETTLEMENT_STATUS_1,

  /** 监管任务审核 */
  DICT_B_MONITOR_AUDIT_STATUS,
  DICT_B_MONITOR_AUDIT_STATUS_0,
  DICT_B_MONITOR_AUDIT_STATUS_1,
  DICT_B_MONITOR_AUDIT_STATUS_2,
  DICT_B_MONITOR_AUDIT_STATUS_3,
  DICT_B_MONITOR_AUDIT_STATUS_4,

  /** 0通用 */
  DICT_B_BPM_TYPE,
  DICT_B_DICT_B_BPM_TYPE_0,

  DICT_B_BK_MONITOR_TYPE,
  DICT_B_BK_MONITOR_TYPE_B,
  DICT_B_BK_MONITOR_TYPE_R,

  /** 预警类型 0.事件预警, 1阈值预警 */
  DICT_B_ALARM_RULES_TYPE,
  DICT_B_ALARM_RULES_TYPE_0,
  DICT_B_ALARM_RULES_TYPE_1,

  /** 预警规则类型  1实时预警, 2定时任务*/
  DICT_B_ALARM_SETTINGS_RULES,
  DICT_B_ALARM_SETTINGS_RULES_1,
  DICT_B_ALARM_SETTINGS_RULES_2,

  /** 预警通知方式 0消息通知, 1弹出通知 */
  DICT_B_ALARM_NOTICE_TYPE,
  DICT_B_ALARM_NOTICE_TYPE_0,
  DICT_B_ALARM_NOTICE_TYPE_1,

  /** 放货指令类型 */
  DICT_B_RELEASE_ORDER_TYPE,
  DICT_B_RELEASE_ORDER_TYPE_1,

  /** 放货指令业务类型 */
  DICT_B_RELEASE_ORDER_BUSINESS_TYPE,
  DICT_B_RELEASE_ORDER_BUSINESS_TYPE_0,

  /** 报表业务启动时间 */
  DICT_BUSINESS_START_TIME,
  DICT_BUSINESS_START_TIME_1,

  /** 承运订单运输方式 */
  DICT_CARRIAGE_ORDER_TRANSPORT,
  DICT_CARRIAGE_ORDER_TRANSPORT_0,

  /** 承运订单状态 */
  DICT_CARRIAGE_ORDER_STATUS,
  DICT_CARRIAGE_ORDER_STATUS_0,
  DICT_CARRIAGE_ORDER_STATUS_1,
  DICT_CARRIAGE_ORDER_STATUS_2,

  /** 监管任务状态 */
  DICT_B_MONITOR_SYNC_STATUS,
  DICT_B_MONITOR_SYNC_STATUS_ZERO,
  DICT_B_MONITOR_SYNC_STATUS_ONE,
  DICT_B_MONITOR_SYNC_STATUS_TWO,
  DICT_B_MONITOR_SYNC_STATUS_N,

  /** 车辆颜色 */
  DICT_M_VEHICLE_COLOR,
  DICT_M_VEHICLE_COLOR_BLUE,
  DICT_M_VEHICLE_COLOR_YELLOW,
  DICT_M_VEHICLE_COLOR_YELLOW_GREEN,

  /** 库存流水 单据类型 */
  DICT_INVENTORY_BILL_TYPE,
  DICT_INVENTORY_BILL_TYPE_IN,
  DICT_INVENTORY_BILL_TYPE_OUT,
  DICT_INVENTORY_BILL_TYPE_ADJUST,

  /** 通知类型 */
  DICT_B_NOTICE_TYPE,
  DICT_B_NOTICE_TYPE_0,

  /**  生产计划状态：0制单，1已提交，2审核通过，3审核驳回，4作废，5作废审核中，6已完成 */
  DICT_B_PP_STATUS,
  DICT_B_PP_STATUS_0,
  DICT_B_PP_STATUS_1,
  DICT_B_PP_STATUS_2,
  DICT_B_PP_STATUS_3,
  DICT_B_PP_STATUS_4,
  DICT_B_PP_STATUS_5,
  DICT_B_PP_STATUS_6,

  /**  库存流水 业务类型 */
  DICT_B_INVENTORY_ACCOUNT_TYPE,

  /**   数据看板穿透 0-默认 1-累计完成量（吨）2-在途数量 3-饲料厂收货数量 4-出库单页面稻壳 5-出库单页面杂质 6-出库页面销售累计出库量 */
  DICT_LOGISTICS_LARGE_SCREEN_ZERO,
  DICT_LOGISTICS_LARGE_SCREEN_ONE,
  DICT_LOGISTICS_LARGE_SCREEN_TWO,
  DICT_LOGISTICS_LARGE_SCREEN_THREE,
  DICT_LOGISTICS_LARGE_SCREEN_FOUR,
  DICT_LOGISTICS_LARGE_SCREEN_FIVE,
  DICT_LOGISTICS_LARGE_SCREEN_SIX,
  DICT_B_OUT_RELEASE_STATUS,

  /**  是否去除稻壳杂质  1-是 2-否*/
  DICT_B_IN_REMOVE_IMPURITY,

  /**  提货单 单据类型:0供应链业务 1代理业务 2直销业务 3废钢业务 */
  DICT_B_DELIVERY_BUSINESS_TYPE,

  /** 提货单状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成 6作废审核中*/
  DICT_B_DELIVERY_STATUS,
  DICT_B_DELIVERY_STATUS_ZD,
  DICT_B_DELIVERY_STATUS_YTJ,
  DICT_B_DELIVERY_STATUS_TG,
  DICT_B_DELIVERY_STATUS_BH,
  DICT_B_DELIVERY_STATUS_ZF,
  DICT_B_DELIVERY_STATUS_FINISH,
  DICT_B_DELIVERY_STATUS_CANCEL_BEING_AUDITED,

  /**  提货单 入库类型:6=提货入库 */
  DICT_B_DELIVERY_TYPE,

  /** 收获单类型：8 = 直采出库 */
  DICT_B_RECEIVE_TYPE,
  DICT_B_RECEIVE_TYPE_EIGHT,

  /** 收货状态：0制单，1已提交，2审核通过，3审核驳回，4作废 5完成 6过期 7作废审核*/
  DICT_B_RECEIVE_STATUS,
  DICT_B_RECEIVE_STATUS_ZD,
  DICT_B_RECEIVE_STATUS_YTJ,
  DICT_B_RECEIVE_STATUS_TG,
  DICT_B_RECEIVE_STATUS_BH,
  DICT_B_RECEIVE_STATUS_ZF,
  DICT_B_RECEIVE_STATUS_FINISH,
  DICT_B_RECEIVE_STATUS_EXPIRES,
  DICT_B_RECEIVE_STATUS_CANCEL_BEING_AUDITED,

  /** 收货单据状态*/
  DICT_B_RECEIVE_BUSINESS_TYPE,

  /** 退货管理 1-审核通过 2=作废*/
  DICT_B_RETURN_RELATION_STATUS,
  DICT_B_RETURN_RELATION_STATUS_TG,
  DICT_B_RETURN_RELATION_STATUS_ZF,

  /**  是否有退货 0-全部 1=是 2=否 */
  DICT_B_MONITOR_IF_RETURN_QTY,

  /**  0-正在处理 1-已撤销 2-办结（已完成） */
  DICT_BPM_INSTANCE_STATUS,
  DICT_BPM_INSTANCE_STATUS_ZERO,
  DICT_BPM_INSTANCE_STATUS_ONE,
  DICT_BPM_INSTANCE_STATUS_TWO,

  /**  b_out_plan = 出库计划 */
  DICT_BPM_TODO_SERIAL_TYPE_OUT_PLAN,

  DICT_BPM_INSTANCE_PROCESS_BTN_AGREE,
  DICT_BPM_INSTANCE_PROCESS_BTN_REFUSE,
  DICT_BPM_INSTANCE_PROCESS_BTN_TRANSFER,
  DICT_BPM_INSTANCE_PROCESS_BTN_RECALL,
  DICT_BPM_INSTANCE_PROCESS_BTN_AFTERADD,
  DICT_BPM_INSTANCE_PROCESS_BTN_CANCEL,
  DICT_BPM_INSTANCE_PROCESS_BTN_COMMENT,

  /** 项目类型 0全托 1代采 2代销 */
  DICT_B_PROJECT_TYPE,
  DICT_B_PROJECT_TYPE_ZERO,
  DICT_B_PROJECT_TYPE_ONE,
  DICT_B_PROJECT_TYPE_TWO,

  /** 项目企业类型  0 供应商 1 客户 */
  DICT_B_PROJECT_ENTERPRISE_TYPE,
  DICT_B_PROJECT_ENTERPRISE_TYPE_ZERO,
  DICT_B_PROJECT_ENTERPRISE_TYPE_ONE,

  /** 项目运输方式  0 公路 1 铁路 2 多式联运 */
  DICT_B_PROJECT_DELIVERY_TYPE,
  DICT_B_PROJECT_DELIVERY_TYPE_ZERO,
  DICT_B_PROJECT_DELIVERY_TYPE_ONE,
  DICT_B_PROJECT_DELIVERY_TYPE_TWO,

  /** 项目付款方式 0依据合同 1预付款 2先款后货 */
  DICT_B_PROJECT_PAYMENT_METHOD,
  DICT_B_PROJECT_PAYMENT_METHOD_ZERO,
  DICT_B_PROJECT_PAYMENT_METHOD_ONE,
  DICT_B_PROJECT_PAYMENT_METHOD_TWO,

  /** 状态：0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成 */
  DICT_B_PROJECT_STATUS,
  DICT_B_PROJECT_STATUS_ZERO,
  DICT_B_PROJECT_STATUS_ONE,
  DICT_B_PROJECT_STATUS_TWO,
  DICT_B_PROJECT_STATUS_THREE,
  DICT_B_PROJECT_STATUS_FOUR,
  DICT_B_PROJECT_STATUS_FIVE,
  DICT_B_PROJECT_STATUS_SIX,

  DICT_B_PROJECT,

  /**  采购合同表 */
  DICT_B_PO_CONTRACT,

  /** 项目管理作废 */
  DICT_B_PROJECT_CANCEL,

  /**  采购合同审批状态  0-待审批 1-审批中 2-审批通过 3-驳回 4-作废审批中 5-已作废 6-已完成*/
  DICT_B_PO_CONTRACT_CANCEL,
  DICT_B_PO_CONTRACT_STATUS,
  DICT_B_PO_CONTRACT_STATUS_ZERO,
  DICT_B_PO_CONTRACT_STATUS_ONE,
  DICT_B_PO_CONTRACT_STATUS_TWO,
  DICT_B_PO_CONTRACT_STATUS_THREE,
  DICT_B_PO_CONTRACT_STATUS_FOUR,
  DICT_B_PO_CONTRACT_STATUS_FIVE,
  DICT_B_PO_CONTRACT_STATUS_SIX,

  /**  采购合同类型  类型：0：标准合同；1：框架合同*/
  DICT_B_PO_CONTRACT_TYPE,
  DICT_B_PO_CONTRACT_TYPE_ZERO,
  DICT_B_PO_CONTRACT_TYPE_ONE,

  /**  采购合同运输方式：1-公路；2-铁路；3-多式联运；*/
  DICT_B_PO_CONTRACT_DELIVERY_TYPE,
  DICT_B_PO_CONTRACT_DELIVERY_TYPE_ONE,
  DICT_B_PO_CONTRACT_DELIVERY_TYPE_TWO,
  DICT_B_PO_CONTRACT_DELIVERY_TYPE_THREE,

  /**  采购合同结算方式：1-先款后货；2-先货后款；3-货到付款；*/
  DICT_B_PO_CONTRACT_SETTLE_TYPE,
  DICT_B_PO_CONTRACT_SETTLE_TYPE_ONE,
  DICT_B_PO_CONTRACT_SETTLE_TYPE_TWO,
  DICT_B_PO_CONTRACT_SETTLE_TYPE_THREE,

  /**  采购合同结算方式：1-先款后货；2-先货后款；3-货到付款；*/
  DICT_B_PO_CONTRACT_BILL_TYPE,
  DICT_B_PO_CONTRACT_BILL_TYPE_ONE,
  DICT_B_PO_CONTRACT_BILL_TYPE_TWO,

  /**  采购合同付款方式：1-银行转账*/
  DICT_B_PO_CONTRACT_PAYMENT_TYPE,
  DICT_B_PO_CONTRACT_PAYMENT_TYPE_ONE,

  /** 企业类型 1客户 2供应商 3仓储方 4承运商 5加工厂 */
  DICT_M_ENTERPRISE_TYPE,
  DICT_M_ENTERPRISE_TYPE_ONE,
  DICT_M_ENTERPRISE_TYPE_TWO,
  DICT_M_ENTERPRISE_TYPE_THREE,
  DICT_M_ENTERPRISE_TYPE_FOUR,
  DICT_M_ENTERPRISE_TYPE_FIVE,

  DICT_B_PO_CONTRACT_AUTO_CREATE_ORDER,
  DICT_B_PO_CONTRACT_AUTO_CREATE_ORDER_ZERO,
  DICT_B_PO_CONTRACT_AUTO_CREATE_ORDER_ONE,

  /**  采购合同表 */
  DICT_B_SO_CONTRACT,

  /**  采购合同审批状态  0-待审批 1-审批中 2-审批通过 3-驳回 4-作废审批中 5-已作废 6-已完成*/
  DICT_B_SO_CONTRACT_CANCEL,
  DICT_B_SO_CONTRACT_STATUS,
  DICT_B_SO_CONTRACT_STATUS_ZERO,
  DICT_B_SO_CONTRACT_STATUS_ONE,
  DICT_B_SO_CONTRACT_STATUS_TWO,
  DICT_B_SO_CONTRACT_STATUS_THREE,
  DICT_B_SO_CONTRACT_STATUS_FOUR,
  DICT_B_SO_CONTRACT_STATUS_FIVE,
  DICT_B_SO_CONTRACT_STATUS_SIX,

  /**  采购合同类型  类型：0：标准合同；1：框架合同*/
  DICT_B_SO_CONTRACT_TYPE,
  DICT_B_SO_CONTRACT_TYPE_ZERO,
  DICT_B_SO_CONTRACT_TYPE_ONE,

  /**  采购合同运输方式：1-公路；2-铁路；3-多式联运；*/
  DICT_B_SO_CONTRACT_DELIVERY_TYPE,
  DICT_B_SO_CONTRACT_DELIVERY_TYPE_ONE,
  DICT_B_SO_CONTRACT_DELIVERY_TYPE_TWO,
  DICT_B_SO_CONTRACT_DELIVERY_TYPE_THREE,

  /**  采购合同结算方式：1-先款后货；2-先货后款；3-货到付款；*/
  DICT_B_SO_CONTRACT_SETTLE_TYPE,
  DICT_B_SO_CONTRACT_SETTLE_TYPE_ONE,
  DICT_B_SO_CONTRACT_SETTLE_TYPE_TWO,
  DICT_B_SO_CONTRACT_SETTLE_TYPE_THREE,

  /**  采购合同结算方式：1-先款后货；2-先货后款；3-货到付款；*/
  DICT_B_SO_CONTRACT_BILL_TYPE,
  DICT_B_SO_CONTRACT_BILL_TYPE_ONE,
  DICT_B_SO_CONTRACT_BILL_TYPE_TWO,

  /**  采购合同付款方式：1-银行转账*/
  DICT_B_SO_CONTRACT_PAYMENT_TYPE,
  DICT_B_SO_CONTRACT_PAYMENT_TYPE_ONE,

  DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER,
  DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER_ZERO,
  DICT_B_SO_CONTRACT_AUTO_CREATE_ORDER_ONE,

  /** 评论类型：0-已阅、1-收到、2-已核对、3-合格、4-情况属实、5-确认、6-已复核、7-知悉、8-辛苦了 */
  DICT_APPROVE_COMMENT_TYPE,
  DICT_APPROVE_COMMENT_TYPE_ZERO,
  DICT_APPROVE_COMMENT_TYPE_ONE,
  DICT_APPROVE_COMMENT_TYPE_TWO,
  DICT_APPROVE_COMMENT_TYPE_THREE,
  DICT_APPROVE_COMMENT_TYPE_FOUR,
  DICT_APPROVE_COMMENT_TYPE_FIVE,
  DICT_APPROVE_COMMENT_TYPE_SIX,
  DICT_APPROVE_COMMENT_TYPE_SEVEN,
  DICT_APPROVE_COMMENT_TYPE_EIGHT,

  /**  采购订单表 */
  DICT_B_PO_ORDER,

  /**  采购订单审批状态  0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成*/
  DICT_B_PO_ORDER_CANCEL,
  DICT_B_PO_ORDER_STATUS,
  DICT_B_PO_ORDER_STATUS_ZERO,
  DICT_B_PO_ORDER_STATUS_ONE,
  DICT_B_PO_ORDER_STATUS_TWO,
  DICT_B_PO_ORDER_STATUS_THREE,
  DICT_B_PO_ORDER_STATUS_FOUR,
  DICT_B_PO_ORDER_STATUS_FIVE,
  DICT_B_PO_ORDER_STATUS_SIX,

  /**  采购订单类型  类型：0：标准合同；1：框架合同*/
  DICT_B_PO_ORDER_TYPE,
  DICT_B_PO_ORDER_TYPE_ZERO,
  DICT_B_PO_ORDER_TYPE_ONE,

  /**  采购订单运输方式：1-公路；2-铁路；3-多式联运；*/
  DICT_B_PO_ORDER_DELIVERY_TYPE,
  DICT_B_PO_ORDER_DELIVERY_TYPE_ONE,
  DICT_B_PO_ORDER_DELIVERY_TYPE_TWO,
  DICT_B_PO_ORDER_DELIVERY_TYPE_THREE,

  /**  采购订单结算方式：1-先款后货；2-先货后款；3-货到付款；*/
  DICT_B_PO_ORDER_SETTLE_TYPE,
  DICT_B_PO_ORDER_SETTLE_TYPE_ONE,
  DICT_B_PO_ORDER_SETTLE_TYPE_TWO,
  DICT_B_PO_ORDER_SETTLE_TYPE_THREE,

  /**  采购订单结算单据类型：1-实际到货结算；2-货转凭证结算*/
  DICT_B_PO_ORDER_BILL_TYPE,
  DICT_B_PO_ORDER_BILL_TYPE_ONE,
  DICT_B_PO_ORDER_BILL_TYPE_TWO,

  /**  采购订单付款方式：1-银行转账*/
  DICT_B_PO_ORDER_PAYMENT_TYPE,
  DICT_B_PO_ORDER_PAYMENT_TYPE_ONE,

  /**  销售订单表 */
  DICT_B_SO_ORDER,

  /**  销售订单审批状态  0-待审批 1-审批中 2-执行中 3-驳回 4-作废审批中 5-已作废 6-已完成*/
  DICT_B_SO_ORDER_CANCEL,
  DICT_B_SO_ORDER_STATUS,
  DICT_B_SO_ORDER_STATUS_ZERO,
  DICT_B_SO_ORDER_STATUS_ONE,
  DICT_B_SO_ORDER_STATUS_TWO,
  DICT_B_SO_ORDER_STATUS_THREE,
  DICT_B_SO_ORDER_STATUS_FOUR,
  DICT_B_SO_ORDER_STATUS_FIVE,
  DICT_B_SO_ORDER_STATUS_SIX,

  /**  销售订单类型  类型：0：标准合同；1：框架合同*/
  DICT_B_SO_ORDER_TYPE,
  DICT_B_SO_ORDER_TYPE_ZERO,
  DICT_B_SO_ORDER_TYPE_ONE,

  /**  销售订单运输方式：1-公路；2-铁路；3-多式联运；*/
  DICT_B_SO_ORDER_DELIVERY_TYPE,
  DICT_B_SO_ORDER_DELIVERY_TYPE_ONE,
  DICT_B_SO_ORDER_DELIVERY_TYPE_TWO,
  DICT_B_SO_ORDER_DELIVERY_TYPE_THREE,

  /**  销售订单结算方式：1-先款后货；2-先货后款；3-货到付款；*/
  DICT_B_SO_ORDER_SETTLE_TYPE,
  DICT_B_SO_ORDER_SETTLE_TYPE_ONE,
  DICT_B_SO_ORDER_SETTLE_TYPE_TWO,
  DICT_B_SO_ORDER_SETTLE_TYPE_THREE,

  /**  销售订单结算单据类型：1-实际到货结算；2-货转凭证结算*/
  DICT_B_SO_ORDER_BILL_TYPE,
  DICT_B_SO_ORDER_BILL_TYPE_ONE,
  DICT_B_SO_ORDER_BILL_TYPE_TWO,

  /**  销售订单付款方式：1-银行转账*/
  DICT_B_SO_ORDER_PAYMENT_TYPE,
  DICT_B_SO_ORDER_PAYMENT_TYPE_ONE,

  /**
   *  企业银行类型（1-预付款、2-预收款、3-应付款、4-应收款、5-保证金、6-其他付款、7-其他收款）
   */
  DICT_M_BANK_TYPE_ONE,
  DICT_M_BANK_TYPE_TWO,
  DICT_M_BANK_TYPE_THREE,
  DICT_M_BANK_TYPE_FOUR,

  /**
   *  企业银行账户表 0-禁用 1-可用 -1-删除
   */
  DICT_M_BANK_STATUS,
  DICT_M_BANK_STATUS_ZERO,
  DICT_M_BANK_STATUS_ONE,
  DICT_M_BANK_STATUS_DEL,

  /** 应付账款管理表 */
  DICT_B_AP,

  /** 应付账款管理业务类型 1-应付、2-预付、3-其他支出 */
  DICT_B_AP_CANCEL,
  DICT_B_AP_TYPE,
  DICT_B_AP_TYPE_ONE,
  DICT_B_AP_TYPE_TWO,
  DICT_B_AP_TYPE_THREE,

  /** 应付账款管理审批状态 0-待审批 1-审批中 2-审批通过 3-驳回 4-作废审批中 5-已作废 6-已完成 */
  DICT_B_AP_STATUS,
  DICT_B_AP_STATUS_ZERO,
  DICT_B_AP_STATUS_ONE,
  DICT_B_AP_STATUS_TWO,
  DICT_B_AP_STATUS_THREE,
  DICT_B_AP_STATUS_FOUR,
  DICT_B_AP_STATUS_FIVE,
  DICT_B_AP_STATUS_SIX,

  /** 应付账款管理付款状态 付款状态：0-未付款、1-部分付款、2-已付款、-1-中止付款 */
  DICT_B_AP_PAY_STATUS,
  DICT_B_AP_PAY_STATUS_ZERO,
  DICT_B_AP_PAY_STATUS_ONE,
  DICT_B_AP_PAY_STATUS_TWO,
  DICT_B_AP_PAY_STATUS_STOP,

  /** 付款单状态：状态（0-待付款、1已付款、2-作废、-1-中止付款） */
  DICT_B_AP_PAY_BILL_STATUS,
  DICT_B_AP_PAY_BILL_STATUS_ZERO,
  DICT_B_AP_PAY_BILL_STATUS_ONE,
  DICT_B_AP_PAY_BILL_STATUS_TWO,
  DICT_B_AP_PAY_BILL_STATUS_STOP,

  /** 应付退款管理业务类型 1-应付、2-预付、3-其他支出 */
  DICT_B_AP_REFUND,
  DICT_B_AP_REFUND_CANCEL,
  DICT_B_AP_REFUND_TYPE,
  DICT_B_AP_REFUND_TYPE_ONE,
  DICT_B_AP_REFUND_TYPE_TWO,
  DICT_B_AP_REFUND_TYPE_THREE,

  /** 应付退款管理审批状态 0-待审批 1-审批中 2-审批通过 3-驳回 4-作废审批中 5-已作废 6-已完成 */
  DICT_B_AP_REFUND_STATUS,
  DICT_B_AP_REFUND_STATUS_ZERO,
  DICT_B_AP_REFUND_STATUS_ONE,
  DICT_B_AP_REFUND_STATUS_TWO,
  DICT_B_AP_REFUND_STATUS_THREE,
  DICT_B_AP_REFUND_STATUS_FOUR,
  DICT_B_AP_REFUND_STATUS_FIVE,
  DICT_B_AP_REFUND_STATUS_SIX,

  /** 应付退款管理付款状态 付款状态：0-未付款、1-部分付款、2-已付款、-1-中止付款 */
  DICT_B_AP_REFUND_PAY_STATUS,
  DICT_B_AP_REFUND_PAY_STATUS_ZERO,
  DICT_B_AP_REFUND_PAY_STATUS_ONE,
  DICT_B_AP_REFUND_PAY_STATUS_TWO,
  DICT_B_AP_REFUND_PAY_STATUS_STOP,

  /** 退款单状态：状态（1-待付款、2已付款、3-作废 -1-中止付款）*/
  DICT_B_AP_REFUND_PAY_ONE_STATUS,
  DICT_B_AP_REFUND_PAY_ONE_STATUS_ONE,
  DICT_B_AP_REFUND_PAY_ONE_STATUS_TWO,
  DICT_B_AP_REFUND_PAY_ONE_STATUS_THREE,
  DICT_B_AP_REFUND_PAY_ONE_STATUS_STOP,

  /**  税率：9%、13%、17%、6% */
  DICT_S_TAX_TYPE,
  DICT_S_TAX_TYPE_ONE,
  DICT_S_TAX_TYPE_TWO,
  DICT_S_TAX_TYPE_THREE,
  DICT_S_TAX_TYPE_FOUR,

  /** 入库单业务流程标识 */
  DICT_B_IN,

  /** 入库单作废流程标识 */
  DICT_B_IN_CANCEL

}
