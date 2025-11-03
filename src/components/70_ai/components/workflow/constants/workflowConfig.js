/**
 * Workflow 工作流配置常量
 */

// 工作流状态
export const WORKFLOW_STATUS = {
  DRAFT: 0, // 草稿
  PUBLISHED: 1, // 已发布
  ARCHIVED: 2 // 已归档
}

// 工作流状态中文名称映射
export const WORKFLOW_STATUS_LABELS = {
  [WORKFLOW_STATUS.DRAFT]: '草稿',
  [WORKFLOW_STATUS.PUBLISHED]: '已发布',
  [WORKFLOW_STATUS.ARCHIVED]: '已归档'
}

// 工作流运行时状态
export const RUNTIME_STATUS = {
  RUNNING: 1, // 运行中
  SUCCESS: 2, // 成功
  FAILED: 3, // 失败
  WAITING_FEEDBACK: 4, // 等待人工反馈
  STOPPED: 5 // 已停止
}

// 运行时状态中文名称映射
export const RUNTIME_STATUS_LABELS = {
  [RUNTIME_STATUS.RUNNING]: '运行中',
  [RUNTIME_STATUS.SUCCESS]: '成功',
  [RUNTIME_STATUS.FAILED]: '失败',
  [RUNTIME_STATUS.WAITING_FEEDBACK]: '等待反馈',
  [RUNTIME_STATUS.STOPPED]: '已停止'
}

// 运行时状态图标映射
export const RUNTIME_STATUS_ICONS = {
  [RUNTIME_STATUS.RUNNING]: 'el-icon-loading',
  [RUNTIME_STATUS.SUCCESS]: 'el-icon-success',
  [RUNTIME_STATUS.FAILED]: 'el-icon-error',
  [RUNTIME_STATUS.WAITING_FEEDBACK]: 'el-icon-warning',
  [RUNTIME_STATUS.STOPPED]: 'el-icon-circle-close'
}

// 运行时状态颜色映射
export const RUNTIME_STATUS_COLORS = {
  [RUNTIME_STATUS.RUNNING]: '#409EFF',
  [RUNTIME_STATUS.SUCCESS]: '#67C23A',
  [RUNTIME_STATUS.FAILED]: '#F56C6C',
  [RUNTIME_STATUS.WAITING_FEEDBACK]: '#E6A23C',
  [RUNTIME_STATUS.STOPPED]: '#909399'
}

// 节点运行时状态
export const NODE_RUNTIME_STATUS = {
  PENDING: 0, // 待运行
  RUNNING: 1, // 运行中
  SUCCESS: 2, // 成功
  FAILED: 3, // 失败
  WAITING_FEEDBACK: 4, // 等待人工反馈
  SKIPPED: 5 // 已跳过
}

// 节点运行时状态中文名称映射
export const NODE_RUNTIME_STATUS_LABELS = {
  [NODE_RUNTIME_STATUS.PENDING]: '待运行',
  [NODE_RUNTIME_STATUS.RUNNING]: '运行中',
  [NODE_RUNTIME_STATUS.SUCCESS]: '成功',
  [NODE_RUNTIME_STATUS.FAILED]: '失败',
  [NODE_RUNTIME_STATUS.WAITING_FEEDBACK]: '等待反馈',
  [NODE_RUNTIME_STATUS.SKIPPED]: '已跳过'
}

// AntV X6 画布配置
export const CANVAS_CONFIG = {
  // 画布默认宽高
  WIDTH: 'auto',
  HEIGHT: 'auto',

  // 网格配置
  GRID: {
    size: 10,
    visible: true,
    type: 'dot',
    args: {
      color: '#E5E5E5',
      thickness: 1
    }
  },

  // 背景配置
  BACKGROUND: {
    color: '#F5F5F5'
  },

  // 缩放配置
  SCALING: {
    min: 0.1,
    max: 3
  },

  // 连线配置
  CONNECTING: {
    router: {
      name: 'orth' // 正交路由
    },
    connector: {
      name: 'rounded',
      args: {
        radius: 8
      }
    },
    anchor: 'center',
    connectionPoint: 'anchor',
    allowBlank: false,
    allowLoop: false,
    allowNode: false,
    allowEdge: false,
    allowMulti: true,
    highlight: true,
    snap: {
      radius: 20
    },
    createEdge () {
      return {
        shape: 'workflow-edge',
        attrs: {
          line: {
            stroke: '#A2B1C3',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8
            }
          }
        },
        zIndex: 0
      }
    },
    validateConnection ({ targetMagnet }) {
      return !!targetMagnet
    }
  },

  // 高亮配置
  HIGHLIGHTING: {
    magnetAvailable: {
      name: 'stroke',
      args: {
        attrs: {
          fill: '#fff',
          stroke: '#47C769'
        }
      }
    },
    magnetAdsorbed: {
      name: 'stroke',
      args: {
        attrs: {
          fill: '#fff',
          stroke: '#31d0c6'
        }
      }
    }
  },

  // 键盘快捷键
  KEYBOARD: {
    enabled: true,
    global: false
  },

  // 剪贴板
  CLIPBOARD: {
    enabled: true
  },

  // 历史记录
  HISTORY: {
    enabled: true
  },

  // 选择框
  SELECTING: {
    enabled: true,
    rubberband: true
  },

  // 对齐线
  SNAPLINE: {
    enabled: true
  },

  // 鼠标滚轮缩放
  MOUSEWHEEL: {
    enabled: true,
    modifiers: ['ctrl', 'meta']
  },

  // 平移
  PANNING: {
    enabled: true,
    eventTypes: ['leftMouseDown', 'mouseWheel']
  }
}

// 节点默认尺寸
export const NODE_SIZE = {
  WIDTH: 220,
  HEIGHT: 'auto',
  MIN_HEIGHT: 60
}

// 端口配置
export const PORT_CONFIG = {
  // 输入端口组
  INPUT: {
    position: 'left',
    attrs: {
      circle: {
        r: 6,
        magnet: true,
        stroke: '#31d0c6',
        strokeWidth: 2,
        fill: '#fff'
      }
    }
  },
  // 输出端口组
  OUTPUT: {
    position: 'right',
    attrs: {
      circle: {
        r: 6,
        magnet: true,
        stroke: '#31d0c6',
        strokeWidth: 2,
        fill: '#fff'
      }
    }
  }
}

// 边(连线)配置
export const EDGE_CONFIG = {
  STROKE: '#A2B1C3',
  STROKE_WIDTH: 2,
  STROKE_HOVER: '#409EFF',
  STROKE_SELECTED: '#409EFF'
}

// 验证规则
export const VALIDATION_RULES = {
  // 工作流名称
  WORKFLOW_NAME: {
    required: true,
    maxLength: 100,
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/,
    message: '工作流名称只能包含中文、英文、数字、下划线和横线'
  },
  // 节点标题
  NODE_TITLE: {
    required: true,
    maxLength: 50,
    message: '节点标题最多50个字符'
  },
  // URL
  URL: {
    pattern: /^https?:\/\/.+/,
    message: '请输入有效的HTTP或HTTPS URL'
  },
  // 邮箱
  EMAIL: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: '请输入有效的邮箱地址'
  }
}

// 默认空工作流信息
export const EMPTY_WORKFLOW_INFO = () => ({
  id: '',
  uuid: '',
  title: '',
  remark: '',
  isPublic: false,
  nodes: [],
  edges: [],
  userId: '',
  userUuid: '',
  userName: '',
  createTime: '',
  deleteNodes: [],
  deleteEdges: []
})

// 默认空节点信息
export const EMPTY_NODE_INFO = () => ({
  id: '',
  uuid: '',
  workflowId: '',
  workflowComponentId: '',
  title: '',
  remark: '',
  inputConfig: {
    user_inputs: [],
    ref_inputs: []
  },
  nodeConfig: {},
  outputConfig: {},
  positionX: 0,
  positionY: 0,
  workflowUuid: '',
  wfComponent: null,
  sourceHandleIds: [],
  targetHandleIds: []
})

// 默认空边信息
export const EMPTY_EDGE_INFO = () => ({
  id: '',
  uuid: '',
  workflowId: '',
  sourceNodeUuid: '',
  sourceHandle: '',
  targetNodeUuid: '',
  workflowUuid: ''
})

// 工作流列表查询参数
export const WORKFLOW_LIST_QUERY = {
  page: 1,
  pageSize: 20,
  title: '',
  isPublic: null
}

// 运行时列表查询参数
export const RUNTIME_LIST_QUERY = {
  page: 1,
  pageSize: 20,
  workflowUuid: ''
}
