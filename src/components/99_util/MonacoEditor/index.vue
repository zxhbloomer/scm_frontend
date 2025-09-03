<template>
  <div
    ref="editorContainer"
    class="monaco-editor-container"
    :style="{ height: editorHeight }"
  />
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
  name: 'MonacoEditor',
  props: {
    // 兼容原有富文本编辑器的API
    value: {
      type: String,
      default: ''
    },
    height: {
      type: [Number, String],
      default: 400
    },
    language: {
      type: String,
      default: 'html'
    },
    theme: {
      type: String,
      default: 'vs'
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    // Monaco Editor特有配置
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      editor: null,
      isInitialized: false
    }
  },
  computed: {
    editorHeight () {
      if (typeof this.height === 'number') {
        return `${this.height}px`
      }
      return this.height
    },
    editorOptions () {
      return {
        value: this.value,
        language: this.language,
        theme: this.theme,
        readOnly: this.readOnly,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: false,
          verticalHasArrows: true,
          horizontalHasArrows: true
        },
        wordWrap: 'on',
        ...this.options
      }
    }
  },
  watch: {
    value (newValue) {
      if (this.editor && this.isInitialized && newValue !== this.editor.getValue()) {
        this.editor.setValue(newValue || '')
      }
    },
    language (newLanguage) {
      if (this.editor && this.isInitialized) {
        const model = this.editor.getModel()
        monaco.editor.setModelLanguage(model, newLanguage)
      }
    },
    theme (newTheme) {
      if (this.editor && this.isInitialized) {
        monaco.editor.setTheme(newTheme)
      }
    },
    readOnly (newReadOnly) {
      if (this.editor && this.isInitialized) {
        this.editor.updateOptions({ readOnly: newReadOnly })
      }
    }
  },
  mounted () {
    this.initEditor()
  },
  beforeDestroy () {
    this.destroyEditor()
  },
  methods: {
    async initEditor () {
      try {
        // 确保容器存在
        if (!this.$refs.editorContainer) {
          console.error('Monaco Editor: 容器元素不存在')
          return
        }

        // 创建编辑器实例
        this.editor = monaco.editor.create(this.$refs.editorContainer, this.editorOptions)

        // 监听内容变化
        this.editor.onDidChangeModelContent(() => {
          const value = this.editor.getValue()
          this.$emit('input', value)
          this.$emit('change', value)
        })

        // 监听焦点事件
        this.editor.onDidFocusEditorWidget(() => {
          this.$emit('focus')
        })

        this.editor.onDidBlurEditorWidget(() => {
          this.$emit('blur')
        })

        this.isInitialized = true
        this.$emit('editor-ready', this.editor)
      } catch (error) {
        console.error('Monaco Editor 初始化失败:', error)
        this.$emit('editor-error', error)
      }
    },

    destroyEditor () {
      if (this.editor) {
        this.editor.dispose()
        this.editor = null
        this.isInitialized = false
      }
    },

    // 公共方法，兼容原有富文本编辑器的API
    getValue () {
      return this.editor ? this.editor.getValue() : ''
    },

    setValue (value) {
      if (this.editor && this.isInitialized) {
        this.editor.setValue(value || '')
      }
    },

    insertText (text) {
      if (this.editor && this.isInitialized) {
        const selection = this.editor.getSelection()
        const range = new monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        )
        this.editor.executeEdits('insert', [
          {
            range: range,
            text: text
          }
        ])
      }
    },

    focus () {
      if (this.editor && this.isInitialized) {
        this.editor.focus()
      }
    },

    // Monaco Editor特有方法
    getEditor () {
      return this.editor
    },

    updateOptions (options) {
      if (this.editor && this.isInitialized) {
        this.editor.updateOptions(options)
      }
    },

    layout () {
      if (this.editor && this.isInitialized) {
        this.editor.layout()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.monaco-editor-container {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  &:focus-within {
    border-color: #409eff;
  }
}
</style>
