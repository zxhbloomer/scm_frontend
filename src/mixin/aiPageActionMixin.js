import { EventBus } from '@/common/eventbus/eventbus'

export default {
  mounted () {
    this.$handleAiPageAction()
    EventBus.$on('ai-page-action-repeat', this._onAiPageActionRepeat)
  },

  beforeDestroy () {
    EventBus.$off('ai-page-action-repeat', this._onAiPageActionRepeat)
  },

  methods: {
    _onAiPageActionRepeat (payload) {
      if (payload && payload.route && this.$route.path !== payload.route) return
      this.$handleAiPageAction(payload && payload.mode)
    },

    $handleAiPageAction (modeOverride) {
      const query = this.$route && this.$route.query
      const aiMode = modeOverride || (query && query._ai_mode)
      if (!aiMode) return

      let formData = {}
      // 从 store 读取 form_data，用 consumed flag 防止重复消费
      const aiPageAction = this.$store && this.$store.state.chat && this.$store.state.chat.aiPageAction
      if (aiPageAction && !aiPageAction.consumed) {
        this.$store.commit('chat/CONSUME_AI_PAGE_ACTION') // 立即标记，防止并发
        formData = aiPageAction.data || {}
      }

      if (aiMode === 'new' && typeof this.handleNew === 'function') {
        this.handleNew({
          data: {},
          operate_tab_info: { show: true, name: '新增' },
          canEdit: false,
          editStatus: 'insert'
        })
        if (Object.keys(formData).length > 0) {
          this.$nextTick(() => {
            EventBus.$emit('ai-form-prefill', formData)
          })
        }
      } else if (aiMode === 'new') {
        console.warn('[aiPageActionMixin] handleNew is not a function:', typeof this.handleNew)
      }
    }
  }
}
