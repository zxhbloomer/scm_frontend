<template>
  <div class="md-renderer">
    <!-- 推理过程组件 -->
    <reasoning-rander
      v-if="reasoningContent && reasoningContent.trim()"
      :content="reasoningContent"
    />

    <!-- 动态渲染内容列表 -->
    <template v-for="(item, index) in mdViewList">
      <!-- 快速问题按钮 -->
      <div
        v-if="item.type === 'question'"
        :key="`question-${index}`"
        class="problem-button mt-4 mb-4"
        :class="canSendMessage ? 'cursor' : 'disabled'"
        @click="handleQuestionClick(item.content)"
      >
        <div class="question-content">
          <i class="el-icon-edit-outline question-icon" />
          <span>{{ item.content }}</span>
        </div>
      </div>

      <!-- HTML渲染器 -->
      <html-rander
        v-else-if="item.type === 'html_rander'"
        :key="`html-${index}`"
        :source="item.content"
      />

      <!-- 图表渲染器 -->
      <echarts-rander
        v-else-if="item.type === 'echarts_rander'"
        :key="`echarts-${index}`"
        :option="item.content"
      />

      <!-- 表单渲染器 -->
      <form-rander
        v-else-if="item.type === 'form_rander'"
        :key="`form-${index}`"
        :form-setting="item.content"
        :chat-record-id="chatRecordId"
        :runtime-node-id="runtimeNodeId"
        :child-node="childNode"
        :disabled="disabled"
        :send-message="sendMessage"
      />

      <!-- Markdown预览 -->
      <md-preview
        v-else
        :key="`md-${index}`"
        :text="item.content"
        class="maxkb-md"
      />
    </template>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import MdPreview from './MdPreview.vue'
import HtmlRander from './HtmlRander.vue'
import EchartsRander from './EchartsRander.vue'
import FormRander from './FormRander.vue'
import ReasoningRander from './ReasoningRander.vue'

export default {
  name: 'MdRenderer',
  components: {
    MdPreview,
    HtmlRander,
    EchartsRander,
    FormRander,
    ReasoningRander
  },
  props: {
    source: {
      type: String,
      default: ''
    },
    reasoningContent: {
      type: String,
      default: ''
    },
    innerSuffix: {
      type: Boolean,
      default: false
    },
    sendMessage: {
      type: Function,
      default: null
    },
    childNode: {
      type: Object,
      default: null
    },
    chatRecordId: {
      type: String,
      default: ''
    },
    runtimeNodeId: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'ai-chat',
      validator: value => ['log', 'ai-chat', 'debug-ai-chat'].includes(value)
    }
  },
  computed: {
    mdViewList () {
      const tempSource = this.source
      return this.splitFormRander(
        this.splitEchartsRander(
          this.splitHtmlRander(
            this.splitQuickQuestion([tempSource])
          )
        )
      )
    },

    canSendMessage () {
      return this.sendMessage && this.type !== 'log'
    }
  },
  methods: {
    handleQuestionClick (content) {
      if (this.canSendMessage) {
        this.sendMessage(content, 'new')
      }
    },

    // 分割快速问题标签
    splitQuickQuestion (result) {
      return result
        .map(item => this.splitQuickQuestionItem(item))
        .reduce((x, y) => [...x, ...y], [])
    },

    splitQuickQuestionItem (source) {
      const tempMdQuickQuestionList = source.match(/<quick_question>[\d\D]*?<\/quick_question>/g)
      const mdQuickQuestionList = tempMdQuickQuestionList
        ? tempMdQuickQuestionList.filter(i => i)
        : []

      const splitQuickQuestionValue = source
        .split(/<quick_question>[\d\D]*?<\/quick_question>/g)
        .filter(item => item !== undefined)
        .filter(item => !mdQuickQuestionList?.includes(item))

      const result = Array.from(
        { length: mdQuickQuestionList.length + splitQuickQuestionValue.length },
        (v, i) => i
      ).map(index => {
        if (index % 2 === 0) {
          return {
            type: 'md',
            content: splitQuickQuestionValue[Math.floor(index / 2)]
          }
        } else {
          return {
            type: 'question',
            content: mdQuickQuestionList[Math.floor(index / 2)]
              .replace('<quick_question>', '')
              .replace('</quick_question>', '')
          }
        }
      })

      return result
    },

    // 分割HTML渲染标签
    splitHtmlRander (result) {
      return result
        .map(item => this.splitHtmlRanderItem(item.content, item.type))
        .reduce((x, y) => [...x, ...y], [])
    },

    splitHtmlRanderItem (source, type) {
      const tempMdHtmlList = source.match(/<html_rander>[\d\D]*?<\/html_rander>/g)
      const mdHtmlList = tempMdHtmlList
        ? tempMdHtmlList.filter(i => i)
        : []

      const splitHtmlValue = source
        .split(/<html_rander>[\d\D]*?<\/html_rander>/g)
        .filter(item => item !== undefined)
        .filter(item => !mdHtmlList?.includes(item))

      const result = Array.from(
        { length: mdHtmlList.length + splitHtmlValue.length },
        (v, i) => i
      ).map(index => {
        if (index % 2 === 0) {
          return {
            type: type,
            content: splitHtmlValue[Math.floor(index / 2)]
          }
        } else {
          return {
            type: 'html_rander',
            content: mdHtmlList[Math.floor(index / 2)]
              .replace('<html_rander>', '')
              .replace('</html_rander>', '')
          }
        }
      })

      return result
    },

    // 分割Echarts渲染标签
    splitEchartsRander (result) {
      return result
        .map(item => this.splitEchartsRanderItem(item.content, item.type))
        .reduce((x, y) => [...x, ...y], [])
    },

    splitEchartsRanderItem (source, type) {
      const tempMdEchartsList = source.match(/<echarts_rander>[\d\D]*?<\/echarts_rander>/g)
      const mdEchartsList = tempMdEchartsList
        ? tempMdEchartsList.filter(i => i)
        : []

      const splitEchartsValue = source
        .split(/<echarts_rander>[\d\D]*?<\/echarts_rander>/g)
        .filter(item => item !== undefined)
        .filter(item => !mdEchartsList?.includes(item))

      const result = Array.from(
        { length: mdEchartsList.length + splitEchartsValue.length },
        (v, i) => i
      ).map(index => {
        if (index % 2 === 0) {
          return {
            type: type,
            content: splitEchartsValue[Math.floor(index / 2)]
          }
        } else {
          return {
            type: 'echarts_rander',
            content: mdEchartsList[Math.floor(index / 2)]
              .replace('<echarts_rander>', '')
              .replace('</echarts_rander>', '')
          }
        }
      })

      return result
    },

    // 分割表单渲染标签
    splitFormRander (result) {
      return result
        .map(item => this.splitFormRanderItem(item.content, item.type))
        .reduce((x, y) => [...x, ...y], [])
    },

    splitFormRanderItem (source, type) {
      const tempMdFormList = this.extractFormRanderContent(source)
      const mdFormList = tempMdFormList
        ? tempMdFormList.filter(i => i)
        : []

      const splitFormValue = this.splitFormRanderContent(source, mdFormList)

      const result = Array.from(
        { length: mdFormList.length + splitFormValue.length },
        (v, i) => i
      ).map(index => {
        if (index % 2 === 0) {
          return {
            type: type,
            content: splitFormValue[Math.floor(index / 2)]
          }
        } else {
          return {
            type: 'form_rander',
            content: mdFormList[Math.floor(index / 2)]
          }
        }
      })

      return result
    },

    // 提取表单渲染器内容（支持嵌套）
    extractFormRanderContent (html) {
      const results = []
      const startTag = '<form_rander>'
      const endTag = '</form_rander>'

      let startIndex = html.indexOf(startTag)

      while (startIndex !== -1) {
        let endIndex = html.indexOf(endTag, startIndex)
        let depth = 1
        let tempIndex = startIndex + startTag.length

        // 查找匹配的结束标签
        while (depth > 0 && tempIndex < html.length) {
          const nextStart = html.indexOf(startTag, tempIndex)
          const nextEnd = html.indexOf(endTag, tempIndex)

          if (nextStart !== -1 && nextStart < nextEnd) {
            depth++
            tempIndex = nextStart + startTag.length
          } else if (nextEnd !== -1) {
            depth--
            tempIndex = nextEnd + endTag.length
            if (depth === 0) {
              endIndex = nextEnd
            }
          } else {
            break
          }
        }

        if (endIndex !== -1) {
          // 提取内容（去掉开始和结束标签）
          const contentStart = startIndex + startTag.length
          const content = html.substring(contentStart, endIndex)
          results.push(content)
          startIndex = html.indexOf(startTag, endIndex + endTag.length)
        } else {
          break
        }
      }

      return results
    },

    // 使用nanoid分割表单内容，避免嵌套问题
    splitFormRanderContent (source, formRanderList) {
      const uuid = nanoid()
      let tempSource = source

      if (formRanderList.length > 0) {
        formRanderList.forEach(item => {
          tempSource = tempSource.replace(`<form_rander>${item}</form_rander>`, uuid)
        })
      }

      return tempSource
        .split(uuid)
        .filter(item => item !== undefined)
        .filter(item => !formRanderList?.includes(item))
    }
  }
}
</script>

<style lang="scss" scoped>
.md-renderer {
  width: 100%;
  word-wrap: break-word;
  word-break: break-all;

  .problem-button {
    width: 100%;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    background: #F8F9FA;
    padding: 12px;
    box-sizing: border-box;
    color: #606266;
    transition: all 0.3s ease;

    &.cursor {
      cursor: pointer;

      &:hover {
        background: #E6F7FF;
        border-color: #409EFF;
        color: #409EFF;

        .question-icon {
          color: #409EFF;
        }
      }
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        background: #F8F9FA;
        border-color: #EBEEF5;
        color: #606266;
      }
    }

    .question-content {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      .question-icon {
        color: #909399;
        margin-top: 3px;
        font-size: 14px;
        flex-shrink: 0;
        transition: color 0.3s ease;
      }

      span {
        flex: 1;
        line-height: 1.4;
      }
    }
  }

  /* Markdown内容样式 */
  .maxkb-md {
    ::v-deep .github-markdown-body {
      font-family: inherit;
      font-size: 14px;
      line-height: 1.6;
      color: inherit;
      background: transparent;
    }

    ::v-deep img {
      display: inline-block;
      min-height: 33px;
      padding: 0;
      margin: 0;
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }

    ::v-deep a {
      color: #409EFF;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    ::v-deep pre {
      background-color: #F5F7FA;
      border: 1px solid #EBEEF5;
      border-radius: 4px;
      padding: 12px;
      overflow-x: auto;
      margin: 8px 0;
    }

    ::v-deep code {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
    }

    ::v-deep blockquote {
      border-left: 4px solid #409EFF;
      padding-left: 12px;
      margin: 12px 0;
      color: #606266;
      background-color: #F8F9FA;
      padding: 8px 12px;
      border-radius: 0 4px 4px 0;
    }

    ::v-deep table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;

      th, td {
        border: 1px solid #EBEEF5;
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background-color: #F5F7FA;
        font-weight: 500;
      }
    }
  }

  /* 间距优化 */
  .mt-4 {
    margin-top: 16px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }
}

/* 深色主题支持 */
.dark-theme .md-renderer {
  .problem-button {
    background: #2d2d2d;
    border-color: #404040;
    color: #ffffff;

    &.cursor:hover {
      background: #1a3a52;
      border-color: #409EFF;
    }

    &.disabled:hover {
      background: #2d2d2d;
      border-color: #404040;
    }
  }

  .maxkb-md {
    ::v-deep pre {
      background-color: #2d2d2d;
      border-color: #404040;
    }

    ::v-deep blockquote {
      background-color: #2d2d2d;
      border-left-color: #409EFF;
    }

    ::v-deep table {
      th, td {
        border-color: #404040;
      }

      th {
        background-color: #2d2d2d;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .md-renderer {
    .problem-button {
      padding: 10px;
      font-size: 14px;

      .question-content {
        gap: 6px;
      }
    }
  }
}
</style>
