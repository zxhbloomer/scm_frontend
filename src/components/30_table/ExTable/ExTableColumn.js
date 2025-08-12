import { TableColumn } from 'element-ui'
import { max, map, isEmpty } from './util'
import {
  parseMinWidth
} from 'element-ui/packages/table/src/util.js'

// 🎯 Canvas文本测量工具类 - 高性能精确测量
class CanvasTextMeasurer {
  constructor () {
    this.canvas = null
    this.ctx = null
    this.cache = new Map() // 缓存相同内容的测量结果
    this.maxCacheSize = 500 // 限制缓存大小，防止内存泄漏
  }

  // 延迟创建Canvas，提升性能
  ensureCanvas () {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }
  }

  // 精确测量文本宽度
  measureText (text, font) {
    if (!text || text.trim() === '') return 0

    const cacheKey = `${text}-${font}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      this.ensureCanvas()
      this.ctx.font = font
      const width = this.ctx.measureText(String(text)).width

      // 缓存管理：防止内存泄漏
      if (this.cache.size >= this.maxCacheSize) {
        // 删除最旧的缓存项
        const firstKey = this.cache.keys().next().value
        this.cache.delete(firstKey)
      }

      this.cache.set(cacheKey, width)
      return width
    } catch (error) {
      return 0
    }
  }

  // 清理资源
  destroy () {
    this.cache.clear()
    this.canvas = null
    this.ctx = null
  }
}

// 🎯 全局Canvas测量实例
const canvasMeasurer = new CanvasTextMeasurer()

// 🎯 从DOM元素获取字体样式
function getFontFromElement (element) {
  try {
    const styles = window.getComputedStyle(element)
    const fontSize = styles.fontSize || '14px'
    const fontFamily = styles.fontFamily || 'Arial, sans-serif'
    const fontWeight = styles.fontWeight || 'normal'
    return `${fontWeight} ${fontSize} ${fontFamily}`
  } catch (error) {
    return '14px Arial, sans-serif' // 默认字体
  }
}

// 🎯 浏览器兼容性检测
function isCanvasSupported () {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext && canvas.getContext('2d'))
  } catch (e) {
    return false
  }
}

export default {
  name: 'ElTableColumn',
  extends: TableColumn,
  props: {
    fitByClass: {
      type: String,
      default: 'cell'
    },
    autoFit: {
      type: Boolean,
      default: false
    },
    fitGap: {
      type: Number,
      default: 0
    },
    fitHeader: {
      type: Boolean,
      default: false
    },
    mergeCells: {
      type: Boolean,
      default: false
    },
    mergeGroup: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      autoWidth: 0
    }
  },
  computed: {
    // 覆盖el-clumns中的方法
    realMinWidth () {
      if (this.autoFit) {
        return parseMinWidth(max([this.minWidth, this.autoWidth]))
      }
      return TableColumn.computed.realMinWidth.call(this)
    },
    realWidth () {
      if (this.autoFit) {
        return parseMinWidth(max([this.minWidth, this.autoWidth]))
      }
      return TableColumn.computed.realWidth.call(this)
    }
    // // table数据
    // values () {
    //   const data = this.$parent.data
    //   return data
    // }
  },
  // watch: {
  //   values: {
  //     handler (newVal, oldVal) {
  //       this.updateAutoWidth()
  //     }
  //   }
  // },
  methods: {
    updateAutoWidth (val) {
      // ✅ 保持：现有的DOM查询逻辑
      const cellWrapperClass = this.fitHeader ? `.${this.columnId}` : `td.${this.columnId}`

      let cells = window.document.querySelectorAll(`${cellWrapperClass} .${this.fitByClass}`)
      if (isEmpty(cells)) {
        cells = window.document.querySelectorAll(`${cellWrapperClass} `)
      }
      if (isEmpty(cells)) {
        return { nothing: true }
      }

      // 🎯 Canvas高性能测量 - 替换原有的CSS + getBoundingClientRect方案
      let autoMinWidth
      try {
        if (isCanvasSupported()) {
          autoMinWidth = this.calculateWidthWithCanvas(cells) + this.fitGap + 1
        } else {
          autoMinWidth = this.fallbackMeasurement(cells) + this.fitGap + 1
        }
      } catch (error) {
        autoMinWidth = this.fallbackMeasurement(cells) + this.fitGap + 1
      }

      // ✅ 保持：现有的宽度比较和设置逻辑
      if (this.autoWidth !== autoMinWidth) {
        // 如果自适应行间距变小，则忽略
        if (this.autoWidth >= autoMinWidth) {
          // return
        } else {
          this.autoWidth = autoMinWidth
        }
      }

      // ✅ 保持：现有的Element UI集成
      TableColumn.methods.setColumnWidth.call(this, this.columnConfig)
      this.columnConfig.width = this.autoWidth
      return { width: max([this.minWidth, this.autoWidth]), realWidth: max([this.minWidth, this.autoWidth]) }
    },

    // 🎯 新增：Canvas精确测量方法 - 核心优化逻辑
    calculateWidthWithCanvas (cells) {
      try {
        if (!cells || cells.length === 0) return 0

        // 获取字体样式（使用第一个单元格作为基准）
        const sampleCell = cells[0]
        const font = getFontFromElement(sampleCell)

        let maxWidth = 0

        // 遍历所有单元格，进行Canvas精确测量
        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i]
          const text = cell.textContent || cell.innerText || ''

          if (text.trim()) {
            // Canvas精确测量文本宽度
            let textWidth = canvasMeasurer.measureText(text, font)

            // 处理右对齐列：解决右对齐显示问题
            textWidth = this.handleRightAlignColumn(cell, textWidth)

            // 考虑单元格的padding和边距
            const cellPadding = this.getCellPadding(cell)
            const totalWidth = textWidth + cellPadding

            maxWidth = Math.max(maxWidth, totalWidth)
          }
        }

        // 🎯 表头自适应增强：智能混合方案（精确测量优先，估算兜底）
        const headerWidth = this.calculateHeaderWidth()
        maxWidth = Math.max(maxWidth, headerWidth)

        return Math.ceil(maxWidth) // 向上取整，确保完整显示
      } catch (error) {
        throw error
      }
    },

    // 🎯 新增：处理右对齐列的特殊逻辑
    handleRightAlignColumn (cell, measuredWidth) {
      try {
        const parent = cell.parentElement
        if (parent && parent.className.indexOf('is-right') > -1) {
          // 右对齐列：添加额外边距确保文本完全显示
          return measuredWidth + 8 // 额外8px边距
        }
        return measuredWidth
      } catch (error) {
        return measuredWidth
      }
    },

    // 🎯 新增：获取单元格padding值
    getCellPadding (cell) {
      try {
        const styles = window.getComputedStyle(cell)
        const paddingLeft = parseFloat(styles.paddingLeft) || 0
        const paddingRight = parseFloat(styles.paddingRight) || 0
        const borderLeft = parseFloat(styles.borderLeftWidth) || 0
        const borderRight = parseFloat(styles.borderRightWidth) || 0
        return paddingLeft + paddingRight + borderLeft + borderRight
      } catch (error) {
        return 16
      }
    },

    // 🎯 新增：降级方案 - Canvas不支持时的备选方案
    fallbackMeasurement (cells) {
      try {
        // 使用原有的CSS + getBoundingClientRect方案
        map(cells, item => {
          const parent = item.parentElement
          if (parent && parent.className.indexOf('is-right') > -1) {
            // 右对齐列专用CSS
            item.setAttribute('style', 'white-space: nowrap; width: max-content; text-align: right;')
          } else {
            // 默认CSS（左对齐、居中对齐）
            item.setAttribute('style', 'white-space: nowrap; width: fit-content;')
          }
        })

        return max(map(cells, item => item.getBoundingClientRect().width))
      } catch (error) {
        return 120
      }
    },

    // 🎯 新增：智能混合表头宽度测量（方案3：精确测量优先，估算兜底）
    calculateHeaderWidth () {
      try {
        const preciseWidth = this.tryPreciseHeaderMeasurement()
        if (preciseWidth > 0) {
          return preciseWidth
        }

        return this.estimateHeaderWidthFromLabel()
      } catch (error) {
        return this.estimateHeaderWidthFromLabel()
      }
    },

    // 🎯 新增：尝试精确表头测量
    tryPreciseHeaderMeasurement () {
      try {
        // 🔍 智能查找表头单元格（多种方式）
        const headerCell = this.findHeaderCell()

        if (!headerCell) {
          return 0 // 未找到，触发降级
        }

        // 获取表头真实字体样式（通常加粗）
        const headerFont = getFontFromElement(headerCell)

        // 获取纯文本内容（排除图标）
        const headerText = this.getHeaderText(headerCell)

        if (!headerText.trim()) {
          return 0 // 无文本，触发降级
        }

        // Canvas精确测量表头文本
        let headerTextWidth = canvasMeasurer.measureText(headerText, headerFont)

        // 考虑表头特殊元素宽度
        const extraWidth = this.getHeaderExtraWidth(headerCell)
        headerTextWidth += extraWidth

        // 考虑表头padding和边距
        const headerPadding = this.getCellPadding(headerCell)

        const totalWidth = headerTextWidth + headerPadding

        // ✅ 成功获得精确测量结果
        return totalWidth
      } catch (error) {
        return 0
      }
    },

    // 🎯 优化：智能表头查找（多种策略）
    findHeaderCell () {
      try {
        // 策略1: 通过data-column-key属性查找（最可靠）
        let headerCell = document.querySelector(`th[data-column-key="${this.columnConfig.property}"]`)
        if (headerCell) return headerCell

        // 策略2: 通过columnId类名查找
        headerCell = document.querySelector(`th.${this.columnId}`)
        if (headerCell) return headerCell

        // 策略3: 通过文本内容查找（兼容性最好）
        headerCell = this.findHeaderByText()
        if (headerCell) return headerCell

        // 策略4: 通过表格结构位置推算
        headerCell = this.findHeaderByPosition()
        if (headerCell) return headerCell

        return null
      } catch (error) {
        return null
      }
    },

    // 🎯 新增：通过表格位置推算表头
    findHeaderByPosition () {
      try {
        // 获取当前列在表格中的位置索引
        const parentTable = this.$parent
        if (!parentTable || !parentTable.$children) return null

        let columnIndex = -1
        for (let i = 0; i < parentTable.$children.length; i++) {
          if (parentTable.$children[i] === this) {
            columnIndex = i
            break
          }
        }

        if (columnIndex === -1) return null

        // 根据位置找到对应的表头
        const headerCells = document.querySelectorAll('th')
        if (headerCells.length > columnIndex) {
          return headerCells[columnIndex]
        }

        return null
      } catch (error) {
        return null
      }
    },

    // 🎯 新增：通过文本内容查找表头
    findHeaderByText () {
      try {
        const headerCells = document.querySelectorAll('th')
        const targetLabel = this.columnConfig.label || this.label

        for (let i = 0; i < headerCells.length; i++) {
          const cell = headerCells[i]
          const cellText = cell.textContent || cell.innerText || ''
          if (cellText.trim() === targetLabel) {
            return cell
          }
        }
        return null
      } catch (error) {
        return null
      }
    },

    // 🎯 新增：获取表头纯文本内容（排除图标） - 专门处理FieldHelp组件
    getHeaderText (headerCell) {
      try {
        const fieldLabel = headerCell.querySelector('.field-label')
        if (fieldLabel) {
          const fieldLabelText = fieldLabel.textContent || fieldLabel.innerText || ''
          if (fieldLabelText.trim()) {
            return fieldLabelText.trim()
          }
        }

        // 尝试获取纯文本，排除排序图标等
        let text = headerCell.textContent || headerCell.innerText || ''

        // 移除常见的图标字符
        text = text.replace(/[↑↓⬆⬇▲▼]/g, '').trim()

        // 如果还是为空，使用列配置的标签
        if (!text) {
          text = this.columnConfig.label || this.label || ''
        }

        return text
      } catch (error) {
        return this.columnConfig.label || this.label || ''
      }
    },

    // 🎯 新增：计算表头额外元素宽度（图标、按钮等） - 增强FieldHelp组件支持
    getHeaderExtraWidth (headerCell) {
      try {
        let extraWidth = 0

        // 🎯 特殊处理：FieldHelp组件（订单笔数等使用该组件的列）
        const fieldHelpContainer = headerCell.querySelector('.field-help-container')
        if (fieldHelpContainer) {
          const helpIcon = fieldHelpContainer.querySelector('.field-help-icon')
          if (helpIcon) {
            extraWidth += 18 // 图标宽度 + 边距
          }
          return extraWidth
        }

        // 排序图标宽度
        const sortIcon = headerCell.querySelector('.caret-wrapper') ||
                        headerCell.querySelector('.sort-caret')
        if (sortIcon) {
          extraWidth += 20 // 排序图标大约20px
        }

        // 筛选按钮宽度
        const filterIcon = headerCell.querySelector('.el-table__column-filter-trigger')
        if (filterIcon) {
          extraWidth += 16 // 筛选图标大约16px
        }

        // 其他图标
        const otherIcons = headerCell.querySelectorAll('i, .el-icon')
        let iconCount = otherIcons.length

        if (fieldHelpContainer) {
          const fieldHelpIcons = fieldHelpContainer.querySelectorAll('i, .el-icon')
          iconCount -= fieldHelpIcons.length
        }

        extraWidth += Math.max(0, iconCount) * 14

        return extraWidth
      } catch (error) {
        console.warn('计算表头额外宽度失败:', error)
        return 20 // 默认预留20px给可能的图标
      }
    },

    // Canvas标签估算表头宽度
    estimateHeaderWidthFromLabel () {
      try {
        const label = this.columnConfig.label || this.label || ''
        if (!label) return 120 // 无标签时返回默认宽度

        const estimatedHeaderFont = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        const textWidth = canvasMeasurer.measureText(label, estimatedHeaderFont)

        let extraSpace = 0
        extraSpace += 20 // 排序图标
        extraSpace += 24 // padding

        if (this.columnConfig.filterable !== false) {
          extraSpace += 16 // 筛选按钮
        }

        const isFieldHelpColumn = this.columnConfig.property &&
                                 ['order_count', 'virtual_progress'].includes(this.columnConfig.property)
        if (isFieldHelpColumn) {
          extraSpace += 22
        }

        const chineseCharCount = (label.match(/[\u4e00-\u9fa5]/g) || []).length
        if (chineseCharCount > 0) {
          extraSpace += chineseCharCount * 12
        }

        const totalWidth = Math.ceil(textWidth + extraSpace)
        const minWidthForNoWrap = textWidth * 1.2
        const finalWidth = Math.max(totalWidth, minWidthForNoWrap)
        return Math.max(80, Math.min(finalWidth, 300))
      } catch (error) {
        return 120
      }
    },
    /**
       * 合并单元格
       * @param val
       * @returns {{width: any, realWidth: any}|{nothing: boolean}}
       */
    setMergeCells (val) {
      const cellWrapperClass = this.fitHeader ? `.${this.columnId}` : `td.${this.columnId}`
      let cells = window.document.querySelectorAll(`${cellWrapperClass} .${this.fitByClass}`)
      if (isEmpty(cells)) {
        cells = window.document.querySelectorAll(`${cellWrapperClass} `)
      }
      if (isEmpty(cells)) {
        return { nothing: true }
      }
      map(cells, item => {
        item.setAttribute('style', 'white-space: nowrap ;  width: fit-content ')
        const hasMergeCells = Array.from(item.classList).some(className => className.includes('merge_cells'))
        if (!hasMergeCells) {
          item.classList.remove('cell')
        }
      })

      const autoMinWidth = max(map(cells, item => item.getBoundingClientRect().width)) + this.fitGap + 1
      if (this.autoWidth !== autoMinWidth) {
        // 如果自适应行间距变小，则忽略
        if (this.autoWidth >= autoMinWidth) {
          // return
        } else {
          this.autoWidth = autoMinWidth
        }
      }
      TableColumn.methods.setColumnWidth.call(this, this.columnConfig)
      this.columnConfig.width = max([this.columnConfig.minWidth, this.autoWidth])
      map(cells, item => {
        item.setAttribute('style', `white-space: nowrap; width: ${this.columnConfig.width}px`)
      })
      return { width: max([this.minWidth, this.autoWidth]), realWidth: max([this.minWidth, this.autoWidth]) }
    }

  },
  mounted () {
  }
}
