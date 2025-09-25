<template>
  <div
    class="emoji-dialog"
    @click.stop
  >
    <div class="emoji-dialog-content">
      <!-- 搜索框 -->
      <div class="emoji-search-container">
        <el-input
          ref="searchInput"
          v-model="search"
          size="mini"
          placeholder="搜索表情..."
          prefix-icon="el-icon-search"
          clearable
          @input="handleSearch"
        />
      </div>

      <!-- emoji内容区域 -->
      <div ref="emojiContent" class="emoji-content">
        <!-- 搜索模式 -->
        <div v-if="isSearchMode" class="emoji-search-results">
          <div v-if="searchResults.length === 0" class="emoji-no-results">
            <i class="el-icon-warning-outline" />
            <span>未找到相关表情</span>
          </div>
          <div v-else>
            <div
              v-for="category in searchResults"
              :key="category.slug"
              class="emoji-category"
            >
              <h5 v-if="category.emojis.length > 0" class="emoji-category-title">
                {{ category.name }}
              </h5>
              <div v-if="category.emojis.length > 0" class="emoji-grid">
                <button
                  v-for="emoji in category.emojis"
                  :key="emoji.slug"
                  class="emoji-item"
                  :title="emoji.name"
                  @click="selectEmoji(emoji.emoji)"
                >
                  {{ emoji.emoji }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分类浏览模式 -->
        <div v-else class="emoji-category-view">
          <h5 class="emoji-category-title">{{ selectedCategory.name }}</h5>
          <div class="emoji-grid">
            <button
              v-for="emoji in selectedCategory.emojis"
              :key="emoji.slug"
              class="emoji-item"
              :title="emoji.name"
              @click="selectEmoji(emoji.emoji)"
            >
              {{ emoji.emoji }}
            </button>
          </div>
        </div>
      </div>

      <!-- 底部分类切换 -->
      <div class="emoji-footer">
        <div class="emoji-categories">
          <!-- 搜索按钮 -->
          <button
            class="emoji-category-btn"
            :class="{ active: selectedCategorySlug === 'search' }"
            title="搜索"
            @click="changeCategory('search')"
          >
            <i class="el-icon-search" />
          </button>

          <!-- 分类按钮 -->
          <button
            v-for="category in categories"
            :key="category.slug"
            class="emoji-category-btn"
            :class="{ active: selectedCategorySlug === category.slug }"
            :title="category.name"
            @click="changeCategory(category.slug)"
          >
            {{ getFirstEmojiByCategory(category) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import emojisData from './emojisGroup.json'

export default {
  name: 'EmojiInput',

  props: {
    onSelect: {
      type: Function,
      default: () => {}
    }
  },

  data () {
    return {
      categories: emojisData,
      selectedCategorySlug: 'smileys_emotion', // 默认选择表情符号
      search: '',
      searchResults: []
    }
  },

  computed: {
    selectedCategory () {
      return this.categories.find(cat => cat.slug === this.selectedCategorySlug) || this.categories[0]
    },

    isSearchMode () {
      return this.selectedCategorySlug === 'search' || this.search.trim() !== ''
    }
  },

  mounted () {
    this.$nextTick(() => {
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus()
      }
    })
  },

  methods: {
    /**
     * 切换分类
     */
    changeCategory (categorySlug) {
      this.selectedCategorySlug = categorySlug
      this.search = ''
      this.searchResults = []

      // 滚动到顶部
      if (this.$refs.emojiContent) {
        this.$refs.emojiContent.scrollTop = 0
      }

      // 如果是搜索模式，聚焦搜索框
      if (categorySlug === 'search') {
        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            this.$refs.searchInput.focus()
          }
        })
      }
    },

    /**
     * 获取分类的第一个emoji作为图标
     */
    getFirstEmojiByCategory (category) {
      return category.emojis && category.emojis.length > 0 ? category.emojis[0].emoji : '😀'
    },

    /**
     * 处理搜索
     */
    handleSearch () {
      if (!this.search.trim()) {
        this.searchResults = []
        return
      }

      const searchTerm = this.search.toLowerCase().trim()

      this.searchResults = this.categories.map(category => {
        const filteredEmojis = category.emojis.filter(emoji =>
          emoji.name.toLowerCase().includes(searchTerm) ||
          emoji.slug.toLowerCase().includes(searchTerm)
        )

        return {
          ...category,
          emojis: filteredEmojis
        }
      }).filter(category => category.emojis.length > 0)
    },

    /**
     * 选择emoji
     */
    selectEmoji (emoji) {
      this.onSelect(emoji)
      this.$emit('select', emoji)

      // 可选：选择后关闭面板
      this.$emit('close')
    },

    /**
     * 处理键盘事件
     */
    handleKeydown (event) {
      if (event.key === 'Escape') {
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
.emoji-dialog {
  position: absolute;
  bottom: 45px;
  right: 0;
  width: 320px;
  height: 300px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  user-select: none;
}

.emoji-dialog::before {
  content: '';
  position: absolute;
  bottom: -6px;
  right: 16px;
  width: 12px;
  height: 12px;
  background: white;
  border-right: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
  transform: rotate(45deg);
  z-index: -1;
}

.emoji-dialog-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.emoji-search-container {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.emoji-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

.emoji-search-results,
.emoji-category-view {
  min-height: 180px;
}

.emoji-no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #909399;
  font-size: 14px;
}

.emoji-no-results i {
  font-size: 32px;
  margin-bottom: 8px;
}

.emoji-category-title {
  font-size: 12px;
  color: #606266;
  margin: 0 0 8px 0;
  font-weight: 500;
  text-transform: capitalize;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  margin-bottom: 16px;
}

.emoji-item {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-item:hover {
  background-color: #f5f7fa;
}

.emoji-item:active {
  background-color: #e4e7ed;
}

.emoji-footer {
  border-top: 1px solid #f0f0f0;
  padding: 8px 12px;
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
}

.emoji-categories {
  display: flex;
  gap: 4px;
  overflow-x: auto;
}

.emoji-category-btn {
  min-width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.emoji-category-btn:hover {
  background-color: #e4e7ed;
}

.emoji-category-btn.active {
  background-color: #409eff;
  color: white;
}

.emoji-category-btn i {
  font-size: 14px;
}

/* 滚动条样式 */
.emoji-content::-webkit-scrollbar {
  width: 6px;
}

.emoji-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.emoji-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.emoji-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.emoji-categories::-webkit-scrollbar {
  height: 4px;
}

.emoji-categories::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-categories::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
</style>
