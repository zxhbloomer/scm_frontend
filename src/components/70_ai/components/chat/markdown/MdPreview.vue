<template>
  <div>
    <v-md-preview
      :text="text"
      :language="language"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn'

// 配置主题和插件
VMdPreview.use(githubTheme)
VMdPreview.use(createKatexPlugin())

export default {
  name: 'MdPreview',
  components: {
    'v-md-preview': VMdPreview
  },
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  computed: {
    language () {
      // 获取语言设置，兼容 SCM 系统
      return this.$store.getters.language ||
             localStorage.getItem('scm-locale') ||
             'zh-CN'
    }
  },
  methods: {
    handleClickPreview (event, data) {
      this.$emit('click-preview', event, data)
    }
  }
}
</script>

<style lang="scss" scoped>
/* 音频元素样式 */
::v-deep audio {
  width: 300px;
  height: 43px;
}

/* SCM 主题适配 */
.v-md-preview {
  background: transparent;
  color: inherit;
}

/* 代码块样式适配 */
::v-deep .v-md-preview-wrapper {
  padding: 0;
}

::v-deep .github-markdown-body {
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}

</style>
