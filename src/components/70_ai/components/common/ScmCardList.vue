<template>
  <div ref="cardListContainerRef" class="scm-card-list-container">
    <div
      ref="cardListRef"
      class="scm-card-list"
      :style="{
        'grid-template-columns': `repeat(auto-fill, minmax(${cardMinWidth}px, 1fr))`,
        'gap': `${gap}px`,
        'padding-bottom': paddingBottomSpace || 0,
      }"
    >
      <div v-if="topLoading" class="scm-card-list-loading">
        <div v-loading="topLoading" class="loading-content" />
      </div>
      <div
        v-for="(item, index) in mode === 'remote' ? remoteList : list"
        :key="item.id || index"
        class="scm-card-list-item"
        :style="{ 'aspect-ratio': isProportional ? '1 / 1' : 'none' }"
      >
        <slot name="item" :item="item" :index="index" />
      </div>
      <div v-if="bottomLoading" class="scm-card-list-loading">
        <div v-loading="bottomLoading" class="loading-content" />
      </div>
    </div>
    <div v-if="showEmpty" class="empty-state">
      <p class="text-center text-[var(--color-text-4)]">暂无数据</p>
    </div>
  </div>
</template>

<script>
import { debounce } from '@/utils'

export default {
  name: 'ScmCardList',
  props: {
    mode: {
      type: String,
      default: 'static', // 'static' | 'remote'
      validator: value => ['static', 'remote'].includes(value)
    },
    list: {
      type: Array,
      default: () => []
    },
    cardMinWidth: {
      type: Number,
      required: true
    },
    shadowLimit: {
      type: Number,
      default: 50
    },
    remoteParams: {
      type: Object,
      default: () => ({})
    },
    gap: {
      type: Number,
      default: 24
    },
    isProportional: {
      type: Boolean,
      default: true
    },
    paddingBottomSpace: {
      type: [String, Number],
      default: 0
    },
    remoteFunc: {
      type: Function,
      default: null
    }
  },
  data () {
    return {
      listSize: 0,
      listTotal: 0,
      remoteList: [],
      noMore: false,
      isInit: false,
      endPage: 0,
      topLoading: false,
      bottomLoading: false,
      isLoadError: false,
      resizeObserver: null
    }
  },
  computed: {
    showEmpty () {
      if (this.mode === 'static') {
        return this.list?.length === 0
      }
      return !this.topLoading && !this.bottomLoading && this.remoteList.length === 0
    }
  },
  watch: {
    list: {
      handler (val) {
        if (this.mode === 'static') {
          this.initListListener(val)
        }
      },
      immediate: true
    },
    remoteParams: {
      handler () {
        if (this.mode === 'remote') {
          this.reload()
        }
      },
      deep: true
    }
  },
  mounted () {
    if (this.mode === 'remote') {
      this.$nextTick(async () => {
        await this.computedListSize()
        this.initListListener(this.remoteList)
      })
    }
    this.$nextTick(() => {
      this.initResizeObserver()
    })
  },
  beforeDestroy () {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
  methods: {
    /**
     * 初始化列表滚动监听
     */
    initListListener (arr) {
      if (arr && arr.length > 0) {
        this.$nextTick(() => {
          if (this.$refs.cardListRef) {
            this.initScrollListener()
          }
        })
      }
    },

    /**
     * 初始化滚动监听
     */
    initScrollListener () {
      if (this.$refs.cardListRef) {
        this.$refs.cardListRef.addEventListener('scroll', this.handleScroll)
      }
    },

    /**
     * 处理滚动事件
     */
    handleScroll: debounce(function () {
      if (this.mode === 'remote' && this.$refs.cardListRef) {
        const { scrollTop, scrollHeight, clientHeight } = this.$refs.cardListRef
        const isBottom = scrollTop + clientHeight >= scrollHeight - 10

        if (isBottom && !this.noMore && !this.bottomLoading && !this.isLoadError) {
          this.loadNextList()
        }
      }
    }, 100),

    /**
     * 加载下一页
     */
    async loadNextList (isReload = false) {
      try {
        if (this.mode === 'remote' && typeof this.remoteFunc === 'function') {
          this.bottomLoading = true
          this.endPage += 1
          if (isReload) {
            this.endPage = 1
          }

          const res = await this.remoteFunc({
            current: this.endPage,
            pageSize: this.listSize,
            ...this.remoteParams
          })

          // 适配不同的响应格式
          let list = []
          let total = 0

          if (res && Array.isArray(res)) {
            // 直接返回数组格式
            list = res
            total = res.length
          } else if (res && res.records) {
            // 标准格式
            list = res.records
            total = res.total
          } else if (res && res.list) {
            // 其他格式
            list = res.list
            total = res.total
          }

          if (isReload) {
            this.remoteList = list
          } else {
            this.remoteList = this.remoteList.concat(list)
          }
          this.listTotal = total
          this.noMore = this.listSize * this.endPage >= this.listTotal
        }
      } catch (error) {
        console.error('加载列表数据失败:', error)
        this.isLoadError = true
      } finally {
        this.bottomLoading = false
      }
    },

    /**
     * 计算列表每页显示数量
     */
    async computedListSize (width, height) {
      let clientWidth = 0
      let clientHeight = 0

      if (width !== undefined && height !== undefined) {
        clientWidth = width
        clientHeight = height
      } else if (this.$refs.cardListContainerRef && this.$refs.cardListRef) {
        clientWidth = this.$refs.cardListRef.clientWidth
        clientHeight = this.$refs.cardListContainerRef.clientHeight
      }

      if (clientWidth === 0 || clientHeight === 0) {
        this.listSize = 10 // 默认值
        // 即使无法计算准确大小，也要加载数据
        setTimeout(() => {
          this.isInit = true
        }, 400)
        this.endPage = 0
        await this.loadNextList(true)
        return
      }

      // 最大列数
      const maxCols = Math.floor((clientWidth + this.gap) / (this.cardMinWidth + this.gap))
      // 最大行数，多加载2行
      const maxRows = Math.round((clientHeight + this.gap) / (this.cardMinWidth + this.gap)) + 2
      // 确保最小为5，最大为500（后端限制）
      this.listSize = Math.min(500, Math.max(5, maxCols * maxRows))

      setTimeout(() => {
        this.isInit = true
      }, 400)

      // 重新加载列表
      this.endPage = 0
      await this.loadNextList(true)
    },

    /**
     * 初始化ResizeObserver
     */
    initResizeObserver () {
      if (window.ResizeObserver && this.$refs.cardListContainerRef) {
        this.resizeObserver = new ResizeObserver(debounce((entries) => {
          if (entries && entries.length > 0) {
            const entry = entries[0]
            const { width, height } = entry.contentRect
            if (this.isInit && !this.isLoadError && !this.noMore) {
              this.computedListSize(width, height)
            }
          }
        }, 300))

        this.resizeObserver.observe(this.$refs.cardListContainerRef)
      }
    },

    /**
     * 重新加载
     */
    reload () {
      this.isLoadError = false
      this.noMore = false
      this.loadNextList(true)
    }
  }
}
</script>

<style scoped>
.scm-card-list-container {
  height: 100%;
  overflow: hidden;
  position: relative;
  background: #f9f9fe;
  padding: 16px;
  border-radius: 6px;
}

.scm-card-list {
  display: grid;
  max-height: 100%;
  overflow: auto;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.scm-card-list-item {
  position: relative;
  width: 100%;
}

.scm-card-list-loading {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.loading-content {
  width: 100%;
  height: 40px;
}

.empty-state {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 滚动条样式 */
.scm-card-list::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scm-card-list::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: var(--color-text-4);
}

.scm-card-list::-webkit-scrollbar-track {
  background: transparent;
}
</style>
