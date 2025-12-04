/**
 * X6 节点形状注册
 * 注册所有 Workflow 自定义节点
 */

import { register } from '@antv/x6-vue-shape'
import StartNode from '../components/nodes/StartNode.vue'
import EndNode from '../components/nodes/EndNode.vue'
import AnswerNode from '../components/nodes/AnswerNode.vue'
import SwitcherNode from '../components/nodes/SwitcherNode.vue'
import ClassifierNode from '../components/nodes/ClassifierNode.vue'
import TemplateNode from '../components/nodes/TemplateNode.vue'
import KnowledgeRetrievalNode from '../components/nodes/KnowledgeRetrievalNode.vue'
import DocumentExtractorNode from '../components/nodes/DocumentExtractorNode.vue'
import KeywordExtractorNode from '../components/nodes/KeywordExtractorNode.vue'
import FaqExtractorNode from '../components/nodes/FaqExtractorNode.vue'
import HumanFeedbackNode from '../components/nodes/HumanFeedbackNode.vue'
import MailSendNode from '../components/nodes/MailSendNode.vue'
import HttpRequestNode from '../components/nodes/HttpRequestNode.vue'
import SubWorkflowNode from '../components/nodes/SubWorkflowNode.vue'
import McpNode from '../components/nodes/McpNode.vue'
import TempKnowledgeBaseNode from '../components/nodes/TempKnowledgeBaseNode.vue'

/**
 * 注册所有工作流节点形状
 * 必须在 Graph 实例化之前调用
 */
export function registerAllWorkflowNodes () {
  /**
   * Start 节点
   * - 只有右侧输出端口
   * - 显示所有用户输入字段
   */
  register({
    shape: 'start',
    width: 220,
    height: 100,
    component: StartNode,
    ports: {
      groups: {
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * End 节点
   * - 只有左侧输入端口
   * - 显示结果配置
   */
  register({
    shape: 'end',
    width: 220,
    height: 80,
    component: EndNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' }
      ]
    }
  })

  /**
   * Answer 节点（LLM 回答）
   * - 左侧输入端口 + 右侧输出端口
   * - 显示模型名称
   */
  register({
    shape: 'answer',
    width: 220,
    height: 80,
    component: AnswerNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * Switcher 节点（条件分支）
   * - 左侧输入端口
   * - 右侧多个输出端口（动态，根据 cases 数量）
   * - 每个 case 对应一个输出端口（端口ID = case.uuid）
   * - 保底情况对应一个固定端口（端口ID = 'default_handle'）
   */
  register({
    shape: 'switcher',
    width: 220,
    component: SwitcherNode,
    ports: {
      groups: {
        // 输入端口组（左侧）- 使用绝对定位，与头部对齐
        target: {
          position: {
            name: 'absolute',
            args: { x: 0, y: 40 } // 左侧边缘，y=30 对齐节点头部中心位置
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        // 输出端口组（右侧）
        source: {
          position: {
            name: 'absolute', // 使用绝对定位
            args: { x: '100%', y: 0 } // 右侧边缘
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        // 固定的输入端口
        { group: 'target', id: 'left' }
        // 输出端口将在组件 mounted 时动态添加
      ]
    }
  })

  /**
   * Classifier 节点（内容分类）
   * - 左侧输入端口
   * - 右侧多个输出端口（动态，根据 categories 数量）
   * - 每个 category 对应一个输出端口（端口ID = category.category_uuid）
   */
  register({
    shape: 'classifier',
    width: 220,
    component: ClassifierNode,
    ports: {
      groups: {
        // 输入端口组（左侧）- 使用绝对定位，与头部对齐
        target: {
          position: {
            name: 'absolute',
            args: { x: 0, y: 40 } // 左侧边缘，y=30 对齐节点头部中心位置
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        // 输出端口组（右侧）
        source: {
          position: {
            name: 'absolute', // 使用绝对定位
            args: { x: '100%', y: 0 } // 右侧边缘
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        // 固定的输入端口
        { group: 'target', id: 'left' }
        // 输出端口将在组件 mounted 时动态添加
      ]
    }
  })

  /**
   * Template 节点（模板）
   */
  register({
    shape: 'template',
    width: 220,
    height: 80,
    component: TemplateNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * KnowledgeRetrieval 节点（知识库检索）
   */
  register({
    shape: 'knowledgeretrieval',
    width: 220,
    height: 80,
    component: KnowledgeRetrievalNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * DocumentExtractor 节点（文档提取）
   */
  register({
    shape: 'documentextractor',
    width: 220,
    height: 80,
    component: DocumentExtractorNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * KeywordExtractor 节点（关键词提取）
   */
  register({
    shape: 'keywordextractor',
    width: 220,
    height: 80,
    component: KeywordExtractorNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * FaqExtractor 节点（FAQ提取）
   */
  register({
    shape: 'faqextractor',
    width: 220,
    height: 80,
    component: FaqExtractorNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * HumanFeedback 节点（人工反馈）
   */
  register({
    shape: 'humanfeedback',
    width: 220,
    height: 80,
    component: HumanFeedbackNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * MailSend 节点（邮件发送）
   */
  register({
    shape: 'mailsend',
    width: 220,
    height: 120,
    component: MailSendNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * HttpRequest 节点（HTTP 请求）
   */
  register({
    shape: 'httprequest',
    width: 220,
    height: 160,
    component: HttpRequestNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * SubWorkflow 节点（子工作流）
   * - 左侧输入端口 + 右侧输出端口
   * - 显示工作流名称
   */
  register({
    shape: 'subworkflow',
    width: 220,
    height: 80,
    component: SubWorkflowNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * McpTool 节点（MCP工具）
   * - 左侧输入端口 + 右侧输出端口
   * - 显示MCP工具信息
   */
  register({
    shape: 'mcptool',
    width: 220,
    height: 80,
    component: McpNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })

  /**
   * TempKnowledgeBase 节点（临时知识库）
   * - 左侧输入端口 + 右侧输出端口
   * - 创建2小时自动过期的临时知识库，同步完成向量索引
   */
  register({
    shape: 'tempknowledgebase',
    width: 220,
    height: 80,
    component: TempKnowledgeBaseNode,
    ports: {
      groups: {
        target: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        source: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#555',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'target', id: 'left' },
        { group: 'source', id: 'right' }
      ]
    }
  })
}

