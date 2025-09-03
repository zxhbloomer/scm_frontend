/**
 * Element UI Tree 动态拖拽区域增强混入
 * 方案一：悬停时动态放大敏感区域系统
 * @author Winston Architect
 */

export default {
  name: 'EnhancedTreeDrag',

  data () {
    return {
      // 拖拽状态管理
      enhancedDragState: {
        isHovering: false,
        currentHoverNode: null,
        dragStartTime: null,
        mouseTrail: [],
        activeZones: null
      }
    }
  },

  mounted () {
    this.initEnhancedDragSystem()
  },

  beforeDestroy () {
    this.cleanupEnhancedDragSystem()
  },

  methods: {
    /**
     * 初始化增强拖拽系统
     */
    initEnhancedDragSystem () {
      if (!this.$el || !this.draggable) {
        return
      }

      // 监听全局拖拽事件
      this.$el.addEventListener('dragenter', this.handleEnhancedDragEnter)
      this.$el.addEventListener('dragleave', this.handleEnhancedDragLeave)
      this.$el.addEventListener('dragover', this.handleEnhancedDragOver)
      this.$el.addEventListener('drop', this.handleEnhancedDrop)

      // 增强的拖拽区域计算系统
      this.setupDynamicZoneCalculation()
    },

    /**
     * 清理增强拖拽系统
     */
    cleanupEnhancedDragSystem () {
      if (this.$el) {
        this.$el.removeEventListener('dragenter', this.handleEnhancedDragEnter)
        this.$el.removeEventListener('dragleave', this.handleEnhancedDragLeave)
        this.$el.removeEventListener('dragover', this.handleEnhancedDragOver)
        this.$el.removeEventListener('drop', this.handleEnhancedDrop)
      }

      // 清理悬停状态
      this.clearAllHoverStates()
    },

    /**
     * 设置动态区域计算系统
     */
    setupDynamicZoneCalculation () {
      // 重写原始的拖拽处理逻辑
      const originalDragOver = this.$el.ondragover

      this.$el.ondragover = (event) => {
        // 先执行原始逻辑
        if (originalDragOver) {
          originalDragOver.call(this.$el, event)
        }

        // 执行增强的区域计算
        this.calculateEnhancedDropZones(event)
      }
    },

    /**
     * 增强的拖拽进入处理 - 立即触发明显效果
     */
    handleEnhancedDragEnter (event) {
      const treeNode = this.findNearestTreeNode(event.target)
      if (!treeNode) return

      // 立即设置悬停状态
      this.enhancedDragState.isHovering = true
      this.enhancedDragState.currentHoverNode = treeNode

      // 立即添加悬停样式类 - 让效果立即可见
      this.addHoverEnhancementClass(treeNode)

      // 记录悬停开始时间
      this.enhancedDragState.dragStartTime = Date.now()

      // 立即触发区域计算，让用户立即看到反馈
      this.calculateEnhancedDropZones(event)

      console.log('Enhanced drag enter:', treeNode)
    },

    /**
     * 增强的拖拽离开处理
     */
    handleEnhancedDragLeave (event) {
      const treeNode = this.findNearestTreeNode(event.target)
      if (!treeNode) return

      // 移除悬停样式类
      this.removeHoverEnhancementClass(treeNode)

      // 重置悬停状态
      if (this.enhancedDragState.currentHoverNode === treeNode) {
        this.enhancedDragState.isHovering = false
        this.enhancedDragState.currentHoverNode = null
      }
    },

    /**
     * 增强的拖拽悬停处理
     */
    handleEnhancedDragOver (event) {
      if (!this.enhancedDragState.isHovering) return

      // 记录鼠标轨迹用于意图分析
      this.recordMouseTrail(event)

      // 动态调整区域大小
      this.adjustDropZoneSizes(event)
    },

    /**
     * 增强的拖拽放置处理
     */
    handleEnhancedDrop (event) {
      // 清理所有增强状态
      this.clearAllHoverStates()

      // 重置拖拽状态
      this.resetEnhancedDragState()
    },

    /**
     * 计算增强的拖拽区域
     */
    calculateEnhancedDropZones (event) {
      const treeNode = this.findNearestTreeNode(event.target)
      if (!treeNode) return

      const nodeRect = treeNode.getBoundingClientRect()
      const mouseY = event.clientY
      const relativeY = mouseY - nodeRect.top

      // 改进方案配置：更明显的动态区域
      const config = {
        // 立即触发区域放大效果
        hoverExpansion: 2.0, // 增加到2倍放大
        // 更大的最小区域高度
        minZoneHeight: this.isMobileDevice() ? 32 : 24,
        // 优化的区域比例 - 更大的before/after区域
        baseRatios: {
          before: 0.4, // 40%
          inner: 0.2, // 20% - 缩小inner区域让before/after更突出
          after: 0.4 // 40%
        }
      }

      // 计算实际区域大小 - 使用更大的基础区域
      const enhancedHeight = Math.max(nodeRect.height * config.hoverExpansion, 60) // 最小60px高度
      const zones = {
        before: Math.max(enhancedHeight * config.baseRatios.before, config.minZoneHeight),
        inner: Math.max(enhancedHeight * config.baseRatios.inner, 20), // 至少20px的inner区域
        after: Math.max(enhancedHeight * config.baseRatios.after, config.minZoneHeight)
      }

      // 更宽松的区域判定逻辑 - 让用户更容易命中目标区域
      let dropType = 'inner' // 默认为inner
      const beforeThreshold = zones.before
      const afterThreshold = enhancedHeight - zones.after

      if (relativeY <= beforeThreshold) {
        dropType = 'before'
      } else if (relativeY >= afterThreshold) {
        dropType = 'after'
      }

      console.log('Enhanced Tree Drag:', {
        relativeY,
        enhancedHeight,
        zones,
        dropType,
        nodeHeight: nodeRect.height
      })

      // 存储活动区域信息
      this.enhancedDragState.activeZones = {
        ...zones,
        dropType,
        nodeRect,
        relativeY
      }

      // 应用动态样式
      this.applyDynamicZoneStyles(treeNode, dropType, zones)
    },

    /**
     * 应用动态区域样式
     */
    applyDynamicZoneStyles (treeNode, dropType, zones) {
      // 移除之前的样式类
      treeNode.classList.remove(
        'enhanced-drop-before',
        'enhanced-drop-inner',
        'enhanced-drop-after'
      )

      // 添加当前区域的样式类
      switch (dropType) {
        case 'before':
          treeNode.classList.add('enhanced-drop-before')
          this.showEnhancedDropIndicator(treeNode, 'before', zones.before)
          break
        case 'after':
          treeNode.classList.add('enhanced-drop-after')
          this.showEnhancedDropIndicator(treeNode, 'after', zones.after)
          break
        case 'inner':
          treeNode.classList.add('enhanced-drop-inner')
          this.hideEnhancedDropIndicator()
          break
        default:
          this.hideEnhancedDropIndicator()
      }
    },

    /**
     * 显示增强的拖拽指示器 - 更大更明显的指示器
     */
    showEnhancedDropIndicator (treeNode, position, zoneSize) {
      let indicator = this.$el.querySelector('.enhanced-drop-indicator')

      if (!indicator) {
        indicator = document.createElement('div')
        indicator.className = 'enhanced-drop-indicator'
        this.$el.appendChild(indicator)
      }

      const nodeRect = treeNode.getBoundingClientRect()
      const treeRect = this.$el.getBoundingClientRect()

      // 计算指示器位置 - 扩展到更明显的位置
      let indicatorTop
      const isMobile = this.isMobileDevice()
      const indicatorHeight = isMobile ? 12 : 8
      const offset = isMobile ? 6 : 4

      if (position === 'before') {
        indicatorTop = nodeRect.top - treeRect.top - offset
      } else {
        indicatorTop = nodeRect.bottom - treeRect.top + offset
      }

      // 应用增强样式 - 更大更亮的指示器
      indicator.style.cssText = `
        display: block;
        position: absolute;
        top: ${indicatorTop}px;
        left: ${nodeRect.left - treeRect.left - 10}px;
        width: ${nodeRect.width + 20}px;
        height: ${indicatorHeight}px;
        background: linear-gradient(90deg, #409EFF 0%, #66B1FF 50%, #409EFF 100%);
        border-radius: ${indicatorHeight / 2}px;
        box-shadow: 
          0 0 16px rgba(64, 158, 255, 0.8),
          0 0 32px rgba(64, 158, 255, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
        z-index: 9999;
        transition: all 0.3s ease;
        animation: enhanced-pulse 1.5s ease-in-out infinite;
        transform: scaleX(1.1);
      `

      console.log('显示指示器:', position, indicatorTop)
    },

    /**
     * 隐藏增强的拖拽指示器
     */
    hideEnhancedDropIndicator () {
      const indicator = this.$el.querySelector('.enhanced-drop-indicator')
      if (indicator) {
        indicator.style.display = 'none'
      }
    },

    /**
     * 添加悬停增强样式类
     */
    addHoverEnhancementClass (treeNode) {
      treeNode.classList.add('enhanced-drag-hover')
    },

    /**
     * 移除悬停增强样式类
     */
    removeHoverEnhancementClass (treeNode) {
      treeNode.classList.remove(
        'enhanced-drag-hover',
        'enhanced-drop-before',
        'enhanced-drop-inner',
        'enhanced-drop-after'
      )
    },

    /**
     * 清理所有悬停状态
     */
    clearAllHoverStates () {
      const allNodes = this.$el.querySelectorAll('.el-tree-node')
      allNodes.forEach(node => {
        this.removeHoverEnhancementClass(node)
      })

      this.hideEnhancedDropIndicator()
    },

    /**
     * 重置增强拖拽状态
     */
    resetEnhancedDragState () {
      this.enhancedDragState = {
        isHovering: false,
        currentHoverNode: null,
        dragStartTime: null,
        mouseTrail: [],
        activeZones: null
      }
    },

    /**
     * 记录鼠标轨迹
     */
    recordMouseTrail (event) {
      const trail = this.enhancedDragState.mouseTrail
      trail.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      })

      // 保持轨迹长度在合理范围内
      if (trail.length > 10) {
        trail.shift()
      }
    },

    /**
     * 动态调整区域大小
     */
    adjustDropZoneSizes (event) {
      // 根据悬停时长动态调整区域敏感度
      const hoverDuration = Date.now() - this.enhancedDragState.dragStartTime

      // 悬停时间越长，区域越敏感(边缘区域放大)
      if (hoverDuration > 1000) { // 1秒后
        this.enhancedDragState.isHovering = true
      }
    },

    /**
     * 查找最近的树节点元素
     */
    findNearestTreeNode (element) {
      let current = element
      while (current && current !== this.$el) {
        if (current.classList && current.classList.contains('el-tree-node')) {
          return current
        }
        current = current.parentElement
      }
      return null
    },

    /**
     * 检测是否为移动设备
     */
    isMobileDevice () {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
  }
}
