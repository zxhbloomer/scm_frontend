<template>
  <component
    :is="aiDialog.component"
    v-if="aiDialog.visible && aiDialog.component"
    :visible="aiDialog.visible"
    :ai-data="aiDialog.data"
    @closeMeOk="close"
    @closeMeCancel="close"
  />
</template>

<script>
import PoProjectAiNew from '@/views/40_business/10_po/project/dialog/ai/new/index.vue'

/**
 * AI业务弹窗路由映射表
 * key: 知识库中配置的ai_new_route值
 * value: 对应的Vue组件
 *
 * 新增弹窗时，在此添加import和映射即可
 */
const AI_DIALOG_MAP = {
  'src/views/40_business/10_po/project/dialog/ai/new/index.vue': PoProjectAiNew
}

export default {
  name: 'AiBusinessDialogLoader',

  data () {
    return {
      aiDialog: {
        visible: false,
        component: null,
        data: null
      }
    }
  },

  methods: {
    /**
     * 检测工作流输出并打开对应业务弹窗
     * @param {string} output - 工作流输出文本（可能是JSON或markdown包裹的JSON）
     */
    open (output) {
      if (!output || typeof output !== 'string') return

      try {
        const jsonStr = this.stripMarkdownJson(output)
        const data = this.parseJsonSafe(jsonStr)
        if (!data || !data.ai_new_route) return

        const component = AI_DIALOG_MAP[data.ai_new_route]
        if (!component) {
          console.warn('[AiBusinessDialogLoader] 未注册的弹窗路由:', data.ai_new_route)
          return
        }

        this.aiDialog = { visible: true, component, data }

        // 确保弹窗在最高层级（el-dialog使用append-to-body后挂在body末尾）
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.ensureTopLayer()
          })
        })
      } catch (e) {
        // 非JSON输出，静默忽略
      }
    },

    /**
     * 去除LLM输出中的markdown代码块标记
     */
    stripMarkdownJson (text) {
      if (!text || typeof text !== 'string') return text
      const trimmed = text.trim()
      const match = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
      return match ? match[1].trim() : trimmed
    },

    /**
     * 安全解析JSON，处理工作流输出中可能存在的双转义
     * Synthesizer路径的ai_open_dialog_para经过多层JSON序列化，可能含有字面量\n和\"
     */
    parseJsonSafe (str) {
      try {
        return JSON.parse(str)
      } catch (e) {
        // 还原字面量转义字符后重试
        const unescaped = str.replace(/\\n/g, '\n').replace(/\\"/g, '"')
        return JSON.parse(unescaped)
      }
    },

    /**
     * 关闭弹窗
     */
    close () {
      this.aiDialog = { visible: false, component: null, data: null }
      this.$emit('close')
    },

    /**
     * 确保弹窗和遮罩层在最高层级
     */
    ensureTopLayer () {
      const wrappers = document.querySelectorAll('body > .el-dialog__wrapper')
      const modals = document.querySelectorAll('body > .v-modal')
      if (wrappers.length > 0) {
        wrappers[wrappers.length - 1].style.zIndex = '99999'
      }
      if (modals.length > 0) {
        modals[modals.length - 1].style.zIndex = '99998'
      }
    }
  }
}
</script>
