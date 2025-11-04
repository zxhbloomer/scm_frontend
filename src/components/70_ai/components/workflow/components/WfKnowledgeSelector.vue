<template>
  <el-select
    v-model="selectedKnowledgeUuid"
    placeholder="搜索知识库"
    filterable
    remote
    clearable
    :remote-method="handleSearch"
    @change="handleSelect"
  >
    <el-option-group
      v-for="group in optionGroups"
      :key="group.key"
      :label="group.label"
    >
      <el-option
        v-for="item in group.children"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
        <span style="float: left">
          <i :class="item.is_public ? 'el-icon-share' : 'el-icon-lock'" style="margin-right: 8px;" />
          {{ item.label }}
        </span>
      </el-option>
    </el-option-group>
  </el-select>
</template>

<script>
export default {
  name: 'WfKnowledgeSelector',

  props: {
    knowledgeBaseUuid: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      selectedKnowledgeUuid: '',
      mineGroup: {
        key: 'g_mine',
        label: '我的',
        children: []
      },
      publicGroup: {
        key: 'g_public',
        label: '公开的',
        children: []
      },
      currentPage: 1,
      pageSize: 10
    }
  },

  computed: {
    optionGroups () {
      return [this.mineGroup, this.publicGroup]
    }
  },

  watch: {
    knowledgeBaseUuid: {
      immediate: true,
      handler (val) {
        this.selectedKnowledgeUuid = val || ''
      }
    }
  },

  mounted () {
    this.init()
  },

  methods: {
    async init () {
      await this.search('')
      await this.checkAndGetSelected()
    },

    async search (query) {
      try {
        await this.searchMine(query)
        await this.searchPublic(query)
      } catch (error) {
        console.error('搜索知识库失败:', error)
      }
    },

    async searchMine (query) {
      try {
        const { knowledgeBaseSearchMine } = await import('@/components/70_ai/components/rag/utils')
        const response = await knowledgeBaseSearchMine(query, this.currentPage, this.pageSize)

        this.mineGroup.children = []
        if (response.data && response.data.records) {
          this.mineGroup.children = response.data.records.map(item => ({
            value: item.kbUuid,
            label: item.title,
            is_public: item.isPublic
          }))
        }
      } catch (error) {
        console.error('搜索我的知识库失败:', error)
      }
    },

    async searchPublic (query) {
      try {
        const { knowledgeBaseSearchPublic } = await import('@/components/70_ai/components/rag/utils')
        const response = await knowledgeBaseSearchPublic(query, this.currentPage, this.pageSize)

        this.publicGroup.children = []
        if (response.data && response.data.records) {
          this.publicGroup.children = response.data.records.map(item => ({
            value: item.kbUuid,
            label: item.title,
            is_public: item.isPublic
          }))
        }
      } catch (error) {
        console.error('搜索公开知识库失败:', error)
      }
    },

    async checkAndGetSelected () {
      if (!this.selectedKnowledgeUuid) {
        // 没有选中项，选择第一个
        if (this.mineGroup.children.length > 0) {
          this.selectedKnowledgeUuid = this.mineGroup.children[0].value
        } else if (this.publicGroup.children.length > 0) {
          this.selectedKnowledgeUuid = this.publicGroup.children[0].value
        }

        if (this.selectedKnowledgeUuid) {
          this.handleSelect(this.selectedKnowledgeUuid)
        }
        return
      }

      // 检查选中项是否在列表中
      let hit = this.mineGroup.children.find(child => child.value === this.selectedKnowledgeUuid)
      if (!hit) {
        hit = this.publicGroup.children.find(child => child.value === this.selectedKnowledgeUuid)
      }

      // 如果不在列表中，获取详情并添加
      if (!hit) {
        try {
          const { knowledgeBaseInfo } = await import('@/components/70_ai/components/rag/utils')
          const response = await knowledgeBaseInfo(this.selectedKnowledgeUuid)

          if (response.data) {
            const item = {
              value: response.data.kbUuid, // 修复：使用 kbUuid 而不是 uuid
              label: response.data.title,
              is_public: response.data.isPublic
            }

            // 修正：使用userId比较（知识库可能也使用userId而不是ownerUuid）
            // 注意：如果后端知识库确实使用ownerUuid，需要确保用户信息中也有uuid字段
            const currentUserId = this.$store.state.user.userId
            if (response.data.ownerId === currentUserId || response.data.ownerUuid === String(currentUserId)) {
              this.mineGroup.children.push(item)
            } else {
              this.publicGroup.children.push(item)
            }
          }
        } catch (error) {
          console.error('获取知识库详情失败:', error)
        }
      }
    },

    handleSearch (query) {
      // 防抖搜索
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.search(query)
      }, 300)
    },

    handleSelect (knowledgeBaseUuid) {
      let kbName = ''
      let hit = this.mineGroup.children.find(child => child.value === knowledgeBaseUuid)
      if (!hit) {
        hit = this.publicGroup.children.find(child => child.value === knowledgeBaseUuid)
      }

      if (hit) {
        kbName = hit.label
      }

      this.$emit('selected', knowledgeBaseUuid, kbName)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-select {
  width: 100%;
}
</style>
