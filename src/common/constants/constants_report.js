/**
 * 报表系统常量定义
 * @description JimuReport集成SCM系统的常量配置
 * @author SCM Report Team
 */

/* ========== API接口常量 ========== */

/**
 * API基础路径
 */
export const REPORT_API_BASE = {
  // 设计相关
  DESIGN_BASE: '/scm/report/design',
  DATASOURCE: '/scm/report/design/datasource',
  DESIGNER: '/scm/report/design/designer',
  TEMPLATE: '/scm/report/design/template',
  PREVIEW: '/scm/report/design/preview',

  // BI相关
  BI_BASE: '/scm/report/bi',
  DASHBOARD: '/scm/report/bi/dashboard',
  CHART: '/scm/report/bi/chart',
  SCREEN: '/scm/report/bi/screen',

  // 管理相关
  MANAGEMENT_BASE: '/scm/report/management',
  REPORT: '/scm/report/management/report',
  PERMISSION: '/scm/report/management/permission',
  SYSTEM: '/scm/report/management/system'
}

/**
 * 报表URL常量
 */
export const REPORT_URL = {
  // 报表管理
  REPORT_LIST: '/report/management/report-list',
  REPORT_CREATE: '/report/management/report-list/create',
  REPORT_EDIT: '/report/management/report-list/edit',
  REPORT_VIEW: '/report/management/report-list/view',

  // 报表设计
  REPORT_DESIGNER: '/report/design/designer',
  DATASOURCE_LIST: '/report/design/datasource',
  TEMPLATE_LIST: '/report/design/template',

  // BI大屏
  DASHBOARD_LIST: '/report/bi/dashboard',
  CHART_LIST: '/report/bi/charts',
  SCREEN_DISPLAY: '/report/bi/screen',

  // 权限管理
  PERMISSION_LIST: '/report/management/permission',
  SYSTEM_CONFIG: '/report/management/system'
}

/* ========== 报表类型常量 ========== */

/**
 * 报表类型枚举
 */
export const REPORT_TYPE = {
  TABLE: 'table',
  CHART: 'chart',
  COMPLEX: 'complex',
  FORM: 'form',
  LABEL: 'label'
}

/**
 * 报表类型名称映射
 */
export const REPORT_TYPE_NAMES = {
  [REPORT_TYPE.TABLE]: '表格报表',
  [REPORT_TYPE.CHART]: '图表报表',
  [REPORT_TYPE.COMPLEX]: '复合报表',
  [REPORT_TYPE.FORM]: '表单报表',
  [REPORT_TYPE.LABEL]: '标签报表'
}

/**
 * 报表类型图标映射
 */
export const REPORT_TYPE_ICONS = {
  [REPORT_TYPE.TABLE]: 'el-icon-s-grid',
  [REPORT_TYPE.CHART]: 'el-icon-pie-chart',
  [REPORT_TYPE.COMPLEX]: 'el-icon-s-data',
  [REPORT_TYPE.FORM]: 'el-icon-document',
  [REPORT_TYPE.LABEL]: 'el-icon-price-tag'
}

/* ========== 报表状态常量 ========== */

/**
 * 报表状态枚举
 */
export const REPORT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  OFFLINE: 'offline',
  ARCHIVED: 'archived'
}

/**
 * 报表状态名称映射
 */
export const REPORT_STATUS_NAMES = {
  [REPORT_STATUS.DRAFT]: '草稿',
  [REPORT_STATUS.PUBLISHED]: '已发布',
  [REPORT_STATUS.OFFLINE]: '已下线',
  [REPORT_STATUS.ARCHIVED]: '已归档'
}

/**
 * 报表状态标签类型映射
 */
export const REPORT_STATUS_TAG_TYPES = {
  [REPORT_STATUS.DRAFT]: 'info',
  [REPORT_STATUS.PUBLISHED]: 'success',
  [REPORT_STATUS.OFFLINE]: 'warning',
  [REPORT_STATUS.ARCHIVED]: 'danger'
}

/* ========== 图表类型常量 ========== */

/**
 * 图表类型枚举
 */
export const CHART_TYPE = {
  // 基础图表
  BAR: 'bar',
  COLUMN: 'column',
  LINE: 'line',
  AREA: 'area',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',

  // 高级图表
  SCATTER: 'scatter',
  BUBBLE: 'bubble',
  RADAR: 'radar',
  GAUGE: 'gauge',
  FUNNEL: 'funnel',
  WATERFALL: 'waterfall',

  // 地图图表
  MAP: 'map',
  HEAT_MAP: 'heatmap',

  // 其他
  TABLE: 'table',
  TEXT: 'text',
  IMAGE: 'image'
}

/**
 * 图表类型名称映射
 */
export const CHART_TYPE_NAMES = {
  [CHART_TYPE.BAR]: '条形图',
  [CHART_TYPE.COLUMN]: '柱状图',
  [CHART_TYPE.LINE]: '折线图',
  [CHART_TYPE.AREA]: '面积图',
  [CHART_TYPE.PIE]: '饼图',
  [CHART_TYPE.DOUGHNUT]: '环形图',
  [CHART_TYPE.SCATTER]: '散点图',
  [CHART_TYPE.BUBBLE]: '气泡图',
  [CHART_TYPE.RADAR]: '雷达图',
  [CHART_TYPE.GAUGE]: '仪表盘',
  [CHART_TYPE.FUNNEL]: '漏斗图',
  [CHART_TYPE.WATERFALL]: '瀑布图',
  [CHART_TYPE.MAP]: '地图',
  [CHART_TYPE.HEAT_MAP]: '热力图',
  [CHART_TYPE.TABLE]: '表格',
  [CHART_TYPE.TEXT]: '文本',
  [CHART_TYPE.IMAGE]: '图片'
}

/* ========== 数据源类型常量 ========== */

/**
 * 数据源类型枚举
 */
export const DATASOURCE_TYPE = {
  MYSQL: 'mysql',
  POSTGRESQL: 'postgresql',
  ORACLE: 'oracle',
  SQLSERVER: 'sqlserver',
  SQLITE: 'sqlite',
  MONGODB: 'mongodb',
  REDIS: 'redis',
  ELASTICSEARCH: 'elasticsearch',
  API: 'api',
  JSON: 'json',
  XML: 'xml',
  CSV: 'csv',
  EXCEL: 'excel'
}

/**
 * 数据源类型名称映射
 */
export const DATASOURCE_TYPE_NAMES = {
  [DATASOURCE_TYPE.MYSQL]: 'MySQL',
  [DATASOURCE_TYPE.POSTGRESQL]: 'PostgreSQL',
  [DATASOURCE_TYPE.ORACLE]: 'Oracle',
  [DATASOURCE_TYPE.SQLSERVER]: 'SQL Server',
  [DATASOURCE_TYPE.SQLITE]: 'SQLite',
  [DATASOURCE_TYPE.MONGODB]: 'MongoDB',
  [DATASOURCE_TYPE.REDIS]: 'Redis',
  [DATASOURCE_TYPE.ELASTICSEARCH]: 'Elasticsearch',
  [DATASOURCE_TYPE.API]: 'REST API',
  [DATASOURCE_TYPE.JSON]: 'JSON',
  [DATASOURCE_TYPE.XML]: 'XML',
  [DATASOURCE_TYPE.CSV]: 'CSV',
  [DATASOURCE_TYPE.EXCEL]: 'Excel'
}

/* ========== 导出格式常量 ========== */

/**
 * 导出格式枚举
 */
export const EXPORT_FORMAT = {
  PDF: 'pdf',
  EXCEL: 'excel',
  WORD: 'word',
  IMAGE: 'image',
  HTML: 'html',
  CSV: 'csv',
  JSON: 'json'
}

/**
 * 导出格式名称映射
 */
export const EXPORT_FORMAT_NAMES = {
  [EXPORT_FORMAT.PDF]: 'PDF',
  [EXPORT_FORMAT.EXCEL]: 'Excel',
  [EXPORT_FORMAT.WORD]: 'Word',
  [EXPORT_FORMAT.IMAGE]: '图片',
  [EXPORT_FORMAT.HTML]: 'HTML',
  [EXPORT_FORMAT.CSV]: 'CSV',
  [EXPORT_FORMAT.JSON]: 'JSON'
}

/**
 * 导出格式文件扩展名映射
 */
export const EXPORT_FORMAT_EXTENSIONS = {
  [EXPORT_FORMAT.PDF]: '.pdf',
  [EXPORT_FORMAT.EXCEL]: '.xlsx',
  [EXPORT_FORMAT.WORD]: '.docx',
  [EXPORT_FORMAT.IMAGE]: '.png',
  [EXPORT_FORMAT.HTML]: '.html',
  [EXPORT_FORMAT.CSV]: '.csv',
  [EXPORT_FORMAT.JSON]: '.json'
}

/* ========== 权限相关常量 ========== */

/**
 * 权限操作枚举
 */
export const PERMISSION_ACTION = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  PUBLISH: 'publish',
  EXPORT: 'export',
  DESIGN: 'design',
  MANAGE: 'manage'
}

/**
 * 权限操作名称映射
 */
export const PERMISSION_ACTION_NAMES = {
  [PERMISSION_ACTION.VIEW]: '查看',
  [PERMISSION_ACTION.CREATE]: '创建',
  [PERMISSION_ACTION.EDIT]: '编辑',
  [PERMISSION_ACTION.DELETE]: '删除',
  [PERMISSION_ACTION.PUBLISH]: '发布',
  [PERMISSION_ACTION.EXPORT]: '导出',
  [PERMISSION_ACTION.DESIGN]: '设计',
  [PERMISSION_ACTION.MANAGE]: '管理'
}

/**
 * 权限资源类型枚举
 */
export const PERMISSION_RESOURCE = {
  REPORT: 'report',
  DATASOURCE: 'datasource',
  TEMPLATE: 'template',
  DASHBOARD: 'dashboard',
  CHART: 'chart',
  SYSTEM: 'system'
}

/* ========== 配置项常量 ========== */

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  DEFAULT_SIZE: 20,
  SIZE_OPTIONS: [10, 20, 50, 100],
  SHOW_TOTAL: true,
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true
}

/**
 * 表格配置
 */
export const TABLE_CONFIG = {
  STRIPE: true,
  BORDER: true,
  SIZE: 'medium',
  SHOW_HEADER: true,
  HIGHLIGHT_CURRENT_ROW: true,
  EMPTY_TEXT: '暂无数据'
}

/**
 * 表单配置
 */
export const FORM_CONFIG = {
  LABEL_WIDTH: '120px',
  LABEL_POSITION: 'right',
  SIZE: 'medium',
  SHOW_MESSAGE: true,
  INLINE_MESSAGE: false,
  STATUS_ICON: false
}

/**
 * 对话框配置
 */
export const DIALOG_CONFIG = {
  MODAL: true,
  CLOSE_ON_CLICK_MODAL: false,
  CLOSE_ON_PRESS_ESCAPE: true,
  SHOW_CLOSE: true,
  DESTROY_ON_CLOSE: false
}

/* ========== 主题配置常量 ========== */

/**
 * 主题色彩配置
 */
export const THEME_COLORS = {
  PRIMARY: '#409EFF',
  SUCCESS: '#67C23A',
  WARNING: '#E6A23C',
  DANGER: '#F56C6C',
  INFO: '#909399'
}

/**
 * 报表设计器配置
 */
export const DESIGNER_CONFIG = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND: '#ffffff',
    GRID_SIZE: 10,
    ZOOM_MIN: 50,
    ZOOM_MAX: 200,
    ZOOM_STEP: 10
  },
  TOOLBAR: {
    HEIGHT: 40,
    BACKGROUND: '#f5f5f5'
  },
  PANEL: {
    LEFT_WIDTH: 250,
    RIGHT_WIDTH: 300,
    BACKGROUND: '#ffffff'
  }
}

/* ========== 错误消息常量 ========== */

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  PERMISSION_DENIED: '权限不足，无法执行此操作',
  DATA_NOT_FOUND: '数据不存在或已被删除',
  VALIDATION_FAILED: '数据验证失败，请检查输入',
  OPERATION_FAILED: '操作失败，请重试',
  LOGIN_REQUIRED: '请先登录后再执行此操作',
  SESSION_EXPIRED: '会话已过期，请重新登录'
}

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  PUBLISH_SUCCESS: '发布成功',
  EXPORT_SUCCESS: '导出成功',
  IMPORT_SUCCESS: '导入成功',
  COPY_SUCCESS: '复制成功',
  OPERATION_SUCCESS: '操作成功'
}

/* ========== 默认值常量 ========== */

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  REPORT: {
    NAME: '新建报表',
    TYPE: REPORT_TYPE.TABLE,
    STATUS: REPORT_STATUS.DRAFT,
    DESCRIPTION: '',
    CATEGORY: '默认分类'
  },
  CHART: {
    TYPE: CHART_TYPE.BAR,
    WIDTH: 400,
    HEIGHT: 300,
    TITLE: '图表标题'
  },
  DATASOURCE: {
    TYPE: DATASOURCE_TYPE.MYSQL,
    HOST: 'localhost',
    PORT: 3306,
    TIMEOUT: 30000
  }
}
