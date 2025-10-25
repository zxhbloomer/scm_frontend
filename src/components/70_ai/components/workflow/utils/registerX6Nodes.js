/**
 * X6 节点形状注册
 * 注册所有 Workflow 自定义节点
 * 严格参考 aideepin 的节点类型和逻辑
 *
 * 技术栈：Vue 2.7 + @antv/x6-vue-shape
 * 参考文档：https://x6.antv.vision/zh/docs/tutorial/intermediate/vue
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
import Dalle3Node from '../components/nodes/Dalle3Node.vue'
import TongyiwanxNode from '../components/nodes/TongyiwanxNode.vue'
import GoogleNode from '../components/nodes/GoogleNode.vue'
import HumanFeedbackNode from '../components/nodes/HumanFeedbackNode.vue'
import MailSendNode from '../components/nodes/MailSendNode.vue'
import HttpRequestNode from '../components/nodes/HttpRequestNode.vue'

/**
 * 注册所有工作流节点形状
 * 必须在 Graph 实例化之前调用
 */
export function registerAllWorkflowNodes () {
  // ==========================================================================
  // 阶段1：基础节点（Start, End, Answer）
  // ==========================================================================

  /**
   * Start 节点
   * - 只有右侧输出端口
   * - 显示所有用户输入字段
   * 参考：aideepin StartNode.vue:11-31
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
   * 参考：aideepin EndNode.vue:14-22
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
   * 参考：aideepin AnswerNode.vue:17-27
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

  // ==========================================================================
  // 阶段2：复杂节点（Switcher, Classifier）
  // ==========================================================================

  /**
   * Switcher 节点（条件分支）
   * - 左侧输入端口
   * - 右侧多个输出端口（动态，根据 cases 数量）
   * - 每个 case 对应一个输出端口（端口ID = case.uuid）
   * - 保底情况对应一个固定端口（端口ID = 'default_handle'）
   *
   * 参考：aideepin SwitcherNode.vue:26-64
   * 端口动态添加参考：X6 文档 node.addPort() API
   */
  register({
    shape: 'switcher',
    width: 220,
    component: SwitcherNode,
    ports: {
      groups: {
        // 输入端口组（左侧）
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
   *
   * 参考：aideepin ClassifierNode.vue:17-33
   * 端口动态添加参考：X6 文档 node.addPort() API
   */
  register({
    shape: 'classifier',
    width: 220,
    component: ClassifierNode,
    ports: {
      groups: {
        // 输入端口组（左侧）
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

  // ==========================================================================
  // 阶段3：其他节点
  // ==========================================================================

  /**
   * Template 节点（模板）
   * 参考：aideepin TemplateNode.vue:14-23
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
   * 参考：aideepin KnowledgeRetrievalNode.vue:12-24
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
   * 参考：aideepin DocumentExtractorNode.vue:26-41
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
   * 参考：aideepin KeywordExtractorNode.vue:17-27
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
   * 参考：aideepin FaqExtractorNode.vue
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
   * Dalle3 节点（DALL-E 3 图像生成）
   * 参考：aideepin Dalle3Node.vue:18-30
   */
  register({
    shape: 'dalle3',
    width: 220,
    height: 100,
    component: Dalle3Node,
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
   * Tongyiwanx 节点（通义万相图像生成）
   * 参考：aideepin TongyiwanxNode.vue
   */
  register({
    shape: 'tongyiwanx',
    width: 220,
    height: 100,
    component: TongyiwanxNode,
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
   * Google 节点（Google 搜索）
   * 参考：aideepin GoogleNode.vue:18-33
   */
  register({
    shape: 'google',
    width: 220,
    height: 120,
    component: GoogleNode,
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
   * 参考：aideepin HumanFeedbackNode.vue:10-20
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
   * 参考：aideepin MailSendNode.vue:10-28
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
   * 参考：aideepin HttpRequestNode.vue:10-33
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
}

