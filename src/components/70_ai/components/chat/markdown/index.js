/**
 * Markdown组件库
 * 基于MaxKB迁移的富文本渲染组件
 * 支持快速问题、HTML渲染、图表渲染、表单渲染等
 */

// 导入图标字体资源
import './assets/markdown-iconfont.js'

// 核心组件
import MdRenderer from './MdRenderer.vue'
import MdPreview from './MdPreview.vue'
import MdEditor from './MdEditor.vue'
import MdEditorMagnify from './MdEditorMagnify.vue'

// 渲染器组件
import HtmlRander from './HtmlRander.vue'
import EchartsRander from './EchartsRander.vue'
import FormRander from './FormRander.vue'
import ReasoningRander from './ReasoningRander.vue'

// 组件列表
const components = [
  MdRenderer,
  MdPreview,
  MdEditor,
  MdEditorMagnify,
  HtmlRander,
  EchartsRander,
  FormRander,
  ReasoningRander
]

// 安装函数
const install = function (Vue) {
  if (install.installed) return
  install.installed = true

  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

// 自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

// 默认导出
export default {
  version: '1.0.0',
  install,
  // 核心组件
  MdRenderer,
  MdPreview,
  MdEditor,
  MdEditorMagnify,
  // 渲染器组件
  HtmlRander,
  EchartsRander,
  FormRander,
  ReasoningRander
}

// 单独导出
export {
  // 核心组件
  MdRenderer,
  MdPreview,
  MdEditor,
  MdEditorMagnify,
  // 渲染器组件
  HtmlRander,
  EchartsRander,
  FormRander,
  ReasoningRander,
  // 安装函数
  install
}

/**
 * 使用说明：
 *
 * 1. 全量引入：
 * import MarkdownComponents from '@/components/70_chat/components/markdown'
 * Vue.use(MarkdownComponents)
 *
 * 2. 按需引入：
 * import { MdRenderer, MdPreview } from '@/components/70_chat/components/markdown'
 *
 * 3. 核心渲染器使用：
 * <MdRenderer
 *   :source="content"
 *   :reasoning-content="reasoning"
 *   :send-message="handleSendMessage"
 *   :chat-record-id="chatId"
 *   :disabled="false"
 *   type="ai-chat"
 * />
 *
 * 4. 支持的标签：
 * - <quick_question>问题内容</quick_question>
 * - <html_rander>HTML内容</html_rander>
 * - <echarts_rander>图表配置JSON</echarts_rander>
 * - <form_rander>表单配置JSON</form_rander>
 *
 * 5. 渲染器特性：
 * - 支持嵌套标签解析
 * - 支持Markdown + 自定义标签混合
 * - 支持AI推理过程显示
 * - 支持交互式问题按钮
 * - 支持动态表单渲染
 * - 支持ECharts图表展示
 * - 支持安全HTML渲染
 */
