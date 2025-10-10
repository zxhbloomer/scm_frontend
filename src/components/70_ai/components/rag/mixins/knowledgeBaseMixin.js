import { mapState, mapGetters, mapActions } from 'vuex'

/**
 * 知识库通用混入
 * 提供知识库管理的通用功能和状态
 */
export default {
  computed: {
    ...mapState('knowledgeBase', [
      'myKbInfos',
      'publicKbInfos',
      'activeKbUuid',
      'selectedKbType',
      'loaddingKbList',
      'reloadKbInfosSignal'
    ]),

    ...mapGetters('knowledgeBase', [
      'getRecords',
      'getReferences',
      'getGraphRef',
      'getSelectedKb',
      'isLoadingGraphRef'
    ]),

    /**
     * 所有知识库列表
     */
    allKbInfos () {
      return [...this.myKbInfos, ...this.publicKbInfos]
    },

    /**
     * 当前选中的知识库类型列表
     */
    currentKbList () {
      return this.selectedKbType === 'mine' ? this.myKbInfos : this.publicKbInfos
    }
  },

  watch: {
    /**
     * 监听重新加载信号
     */
    reloadKbInfosSignal (val) {
      if (val) {
        this.handleReloadKbInfos()
      }
    }
  },

  methods: {
    ...mapActions('knowledgeBase', [
      'loadMyKbList',
      'loadPublicKbList',
      'loadQaRecords',
      'loadReferences',
      'loadGraphRef',
      'addQaRecord',
      'deleteQaRecord'
    ]),

    /**
     * 初始化知识库数据
     */
    async initKnowledgeBase () {
      try {
        await Promise.all([
          this.loadMyKbList(),
          this.loadPublicKbList()
        ])
      } catch (error) {
        console.error('初始化知识库失败:', error)
        this.$message.error('加载知识库列表失败')
      }
    },

    /**
     * 重新加载知识库列表
     */
    async handleReloadKbInfos () {
      try {
        if (this.selectedKbType === 'mine') {
          await this.loadMyKbList()
        } else {
          await this.loadPublicKbList()
        }
      } catch (error) {
        console.error('重新加载知识库失败:', error)
      }
    },

    /**
     * 根据UUID查找知识库
     */
    findKbByUuid (uuid) {
      return this.allKbInfos.find(kb => kb.uuid === uuid)
    },

    /**
     * 设置活动知识库
     */
    setActiveKb (uuid) {
      this.$store.commit('knowledgeBase/SET_ACTIVE_KB', uuid)
    },

    /**
     * 切换知识库类型
     */
    switchKbType (type) {
      this.$store.commit('knowledgeBase/SET_SELECTED_KB_TYPE', type)
    },

    /**
     * 格式化时间
     */
    formatDateTime (dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    /**
     * 格式化日期
     */
    formatDate (dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
