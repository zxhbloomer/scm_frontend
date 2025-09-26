<template>
  <v-md-editor
    :language="language"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    <template #toolbar-left>
      <slot name="toolbar-left" />
    </template>
    <template #toolbar-right>
      <slot name="toolbar-right" />
    </template>
  </v-md-editor>
</template>

<script>
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn'

// 配置主题和插件
VMdEditor.use(githubTheme)
VMdEditor.use(createKatexPlugin())

export default {
  name: 'MdEditor',
  components: {
    'v-md-editor': VMdEditor
  },
  computed: {
    language () {
      // 获取语言设置，兼容 SCM 系统
      return this.$store.getters.language ||
             localStorage.getItem('scm-locale') ||
             'zh-CN'
    }
  }
}
</script>

<style scoped>
/* SCM 系统样式适配 */
.v-md-editor {
  border: 1px solid #DCDFE6;
  border-radius: 4px;
}
</style>
