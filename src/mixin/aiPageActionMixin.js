/**
 * AI页面动作 Mixin
 *
 * 在业务页面 index.vue 中引入此 mixin，
 * 当 AI 工作流通过 open_page_command 跳转到本页面时，
 * 自动根据 $route.query._ai_mode 触发对应操作。
 *
 * 支持的 _ai_mode 值：
 * - new: 自动打开新增 tab（调用 handleNew）
 */
/**
 * AI页面动作 Mixin
 *
 * 在业务页面 index.vue 中引入此 mixin，
 * 当 AI 工作流通过 open_page_command 跳转到本页面时，
 * 自动根据 $route.query._ai_mode 触发对应操作。
 *
 * 支持的 _ai_mode 值：
 * - new: 自动打开新增 tab（调用 handleNew）
 *
 * 两种触发场景：
 * 1. 页面首次打开：mounted() → $handleAiPageAction()
 * 2. 页面已存在（RouterTab缓存）：$bus.$on('ai-page-action-repeat') → $handleAiPageAction()
 */
export default {
  mounted () {
    this.$handleAiPageAction()
    // 监听"页面已存在时重复触发"事件
    this.$bus && this.$bus.$on('ai-page-action-repeat', this._onAiPageActionRepeat)
  },

  beforeDestroy () {
    this.$bus && this.$bus.$off('ai-page-action-repeat', this._onAiPageActionRepeat)
  },

  methods: {
    _onAiPageActionRepeat (payload) {
      // 只响应当前页面的路由
      if (payload && payload.route && this.$route.path !== payload.route) return
      this.$handleAiPageAction()
    },

    $handleAiPageAction () {
      const aiMode = this.$route && this.$route.query && this.$route.query._ai_mode
      console.log('[aiPageActionMixin] $handleAiPageAction called, aiMode:', aiMode, 'route:', this.$route && this.$route.fullPath)
      if (!aiMode) return

      if (aiMode === 'new' && typeof this.handleNew === 'function') {
        console.log('[aiPageActionMixin] will call handleNew in 300ms')
        setTimeout(() => {
          console.log('[aiPageActionMixin] calling handleNew now')
          this.handleNew({
            data: {},
            operate_tab_info: { show: true, name: '新增' },
            canEdit: false,
            editStatus: 'insert'
          })
        }, 300)
      } else if (aiMode === 'new') {
        console.warn('[aiPageActionMixin] handleNew is not a function on this component:', typeof this.handleNew)
      }
    }
  }
}
