import { Table } from 'element-ui'

import { getColumnsSizeApi, saveColumnsSizeApi, deleteColumnsSizeApi } from '@/api/00_common/colums_size'
import { getTableConfigApi } from '@/api/00_common/table_config'

import { isNotEmpty } from '@/utils/index.js'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  name: 'ElTable',
  extends: Table,
  props: {
    // 启用列调整后记录模式
    setColumnSize: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: undefined
    },
    page_code: {
      type: String,
      default: undefined
    },
    // Canvas自动高度相关props
    canvasAutoHeight: {
      type: Boolean,
      default: false
    },
    canvasBottomReserve: {
      type: Number,
      default: 10 // 默认0，精确计算最大高度
    }
  },

  data () {
    return {
      configLoading: true, // 配置加载中状态
      configLoaded: false, // 配置加载完成状态
      tableKey: 0, // 用于强制重新渲染表格
      originalColumns: null, // 保存原始完整的列定义
      columnsBeforeAnimation: null, // 动画用：记录列变化前的位置
      resizeTimer: null, // 窗口resize防抖计时器
      canvasAutoHeightEnabled: false, // Canvas自动高度是否启用
      canvasCalculatedHeight: null, // Canvas计算的表格高度
      internalHeight: null, // Element UI内部设置的高度（避免setter警告）
      canvasHeightConfig: null, // Canvas高度计算配置参数

      // 智能复制系统相关状态
      copyMenuVisible: false, // 复制菜单是否显示
      copyMenuPosition: { x: 0, y: 0 }, // 复制菜单位置
      lastMousePosition: { x: 0, y: 0 }, // 最后的鼠标位置
      pendingCopyData: null, // 待复制的数据
      copyMenuElement: null, // 复制菜单DOM元素
      handleGlobalClick: null, // 全局点击事件处理器

      // 原生文本选择系统状态
      currentSelection: null, // 当前的文本选择对象
      selectionInTable: false, // 选择是否在表格内
      selectionAnalysis: null, // 选择内容分析结果
      selectionChangeHandler: null, // 选择变化事件处理器
      copyEventHandler: null // 复制事件处理器
    }
  },
  created () {
    if (this.setColumnSize) {
      // 设置拖动列宽的事件
      this.$on('header-dragend', function (newWidth, oldWidth, column, event) {
        this.saveColumnsSize(this, this.$parent.$options.name, column)
      })
    }

    // 监听配置更新事件
    EventBus.$on(this.EMITS.EMIT_TABLE_COLUMNS_CONFIG_UPDATED, this.handleConfigUpdate)

    // 监听获取列配置事件（用于重置功能）
    EventBus.$on('TABLE_COLUMNS_GET_CONFIG', this.handleGetColumnConfig)
  },
  mounted () {
    // 如果启用了列配置，先隐藏表格，添加过渡效果
    if (this.$attrs.columns_index_key === 'true') {
      this.$el.style.transition = 'opacity 0.3s ease-in-out'
      this.$el.style.opacity = '0'
    }

    // 描绘完成
    const { componentInstance: $table } = this.$vnode
    if (!$table) { return }

    // 关键修复：立即保存原始完整的列定义，在任何配置应用之前
    if ($table.store && $table.store.states && this.originalColumns === null) {
      // 使用浅拷贝保存原始列定义，保持对象完整性
      this.originalColumns = [...$table.store.states._columns]
    }

    // 设置参数
    const page_code = $table.$parent.$options.name
    let table_type
    if (this.type) {
      table_type = this.type
    }

    // 调用调整列宽方法
    this.setColumnsSize($table, page_code, table_type)

    // Canvas自动高度计算（使用props）
    if (this.canvasAutoHeight) {
      this.canvasAutoHeightEnabled = true

      // 获取底部预留空间（使用props，默认为0）
      const bottomReserve = this.canvasBottomReserve

      // 保存配置供resize时使用
      this.canvasHeightConfig = { bottomReserve }

      // 使用Element UI风格的DOM检测机制
      this.initCanvasHeight(bottomReserve)

      // 添加窗口resize事件监听，实现动态高度调整
      this.setupWindowResizeListener()
    }

    // 检查是否需要应用列配置
    if ($table.$attrs.columns_index_key === 'true' && page_code && page_code !== 'ElMain') {
      // 设置列属性，顺序、隐藏正式使用，读取数据库配置文件
      this.getTableConfig()
    } else {
      this.configLoading = false
      this.$el.style.opacity = '1'
    }

    // 初始化智能复制系统
    this.initSmartCopySystem()

    $table.doLayout()

    // 表头自适应：初始化时触发表头宽度计算（解决FieldHelp组件换行）
    this.$nextTick(() => {
      this.triggerHeaderAutoResize()
    })

    // 第3步：添加数据变化深度监听，主动触发自适应
    this.$watch('data', () => {
      if (isNotEmpty(this.data)) {
        this.$nextTick(() => {
          // 数据变化时主动触发内容自适应
          this.autoResizeOrMergeCell()
          this.doLayout() // Element UI 原生布局更新
        })
      }
    }, {
      deep: true, // 深度监听数组内容变化
      immediate: false // 不立即执行，避免重复
    })
  },
  activated () {
    // 解决切换tab页签，表格列宽度不正确问题
    this.$nextTick(() => {
      this.autoResizeOrMergeCell()
      this.doLayout()

      // 修复：页签切换时重新计算Canvas自动高度
      if (this.canvasAutoHeightEnabled) {
        // 延迟确保DOM完全渲染和可见
        setTimeout(() => {
          this.updateCanvasTableHeight()
        }, 100)
      }
    })
  },
  computed: {
    // table数据
    values () {
      const data = this.data
      return data
    },

    // Canvas计算的表格高度（优先级高于原始height属性）
    computedHeight () {
      // 如果启用Canvas自动高度且已计算出结果，使用Canvas高度
      if (this.canvasAutoHeightEnabled && this.canvasCalculatedHeight !== null) {
        return this.canvasCalculatedHeight
      }

      // 否则使用原始的height属性（如果有的话）
      return this.$attrs.height || this.internalHeight || null
    }

    // 覆盖Element UI Table的height计算属性（带setter避免警告）
    // height: {
    //   get () {
    //     return this.computedHeight
    //   },
    //   set (val) {
    //     // 存储Element UI内部设置的高度值
    //     // 但优先使用Canvas计算的高度
    //     this.internalHeight = val
    //   }
    // }
  },
  watch: {
    values: {
      handler (newVal, oldVal) {
        if (isNotEmpty(this.data)) {
          this.$nextTick(() => {
            // 第2步：先执行自定义的内容自适应
            this.autoResizeOrMergeCell()

            // 再调用继承的Element UI布局更新
            this.doLayout() // 继承自 Table，触发Element UI原生布局计算
          })
        }
      }
    },

    // 监听Canvas计算的高度变化，应用到Element UI Table
    computedHeight: {
      handler (newHeight, oldHeight) {
        if (newHeight !== oldHeight && newHeight !== null) {
          // 高度变化已通过computedHeight自动处理
          this.$nextTick(() => {
            this.updateTableHeight(newHeight)
          })
        }
      },
      immediate: false
    },

    '$store.getters.customColumns': function (val) {
      // 你需要执行的代码
      this.deleteColumnsSize(val.page_code)
    }
  },
  methods: {
    // tableColumnsConfig () {
    //   const { componentInstance: $table } = this.$vnode
    //   /**
    //  * 关于列的排序：显示、隐藏、顺序
    //  * 在页面上el-table，增加属性：columns_index_key="columns_index_key"
    //  * 在这里判断属性：$table.$attrs.columns_index_key="columns_index_key"
    //  * $table.columns.splice(2 - 1, 0, $table.columns.splice(2, 1)[0]);
    //  *
    //  * $table.store.states.originColumns.splice(2 - 1, 0, $table.store.states.originColumns.splice(2, 1)[0]);
    //  */
    //   if ($table.$attrs.columns_index_key === 'true') {
    //     /**
    //    * 隐藏列，只能删除列的数组了
    //    * 先循环删除不需要显示的列
    //    * 再排序
    //    */

    //     // 具体明细数据
    //     var _colums = deepCopy($table.columns)
    //     _colums.splice(1, 1)
    //     $table.columns.splice(0, $table.columns.length)
    //     $table.columns.splice(0, 0, ..._colums)

    //     // 头部
    //     var originColumns = deepCopy($table.store.states.originColumns)
    //     originColumns.splice(1, 1)
    //     $table.store.states.originColumns.splice(0, $table.store.states.originColumns.length)
    //     $table.store.states.originColumns.splice(0, 0, ...originColumns)
    //   }
    // },

    autoResizeOrMergeCell () {
      // 表格自适应
      for (let i = 0, j = this.$children.length; i < j; i++) {
        const element = this.$children[i]
        const _colums = this.columns
        // 判断是否有children，如果有循环children
        if (element.mergeGroup) {
          for (let _i = 0, _j = element.$children.length; _i < _j; _i++) {
            const __element = element.$children[_i]
            if (__element.mergeCells) {
              __element.setMergeCells(__element)
            }
            if (__element.autoFit) {
              var _rtn = __element.updateAutoWidth(__element)
              if (_rtn.nothing) {
                // 没有数据，执行跳出
                break
              }
              if (_rtn.donothing) {
                // 无需执行，下一列
                continue
              }
              const __data = element.$children.find(item => item.id === __element.columnConfig.id)
              if (__data) {
                __data.realWidth = _rtn.realWidth
                __data.width = _rtn.width
              }
            }
          }
        }

        // 多条数据在一个单元格中的处理
        if (element.mergeCells) {
          element.setMergeCells(element)
        }
        if (element.autoFit) {
          var rtn = element.updateAutoWidth(element)
          if (rtn.nothing) {
            // 没有数据，执行跳出
            break
          }
          if (rtn.donothing) {
            // 无需执行，下一列
            continue
          }

          const _data = _colums.find(item => item.id === element.columnConfig.id)
          if (_data) {
            _data.realWidth = rtn.realWidth
            _data.width = rtn.width
          }
        }
      }
    },

    // 删除列宽度
    deleteColumnsSize (page_code) {
      // this.showLoading('正在重置...')
      // 获取数据
      deleteColumnsSizeApi({
        page_code: page_code
      }).then(response => {
      }).finally(() => {
        const { componentInstance: $table } = this.$vnode
        this.$nextTick(() => {
          this.autoResizeOrMergeCell()
          $table.doLayout()
          // 需要触发resize事件
          this.$parent.$forceUpdate()
          // this.closeLoading()
        })
      })
    },

    // 设置表格上的列宽度，如果有数据
    saveColumnsSize (table_obj, page_code, column) {
      // 获取当前列的index
      if (page_code === undefined || page_code === 'ElForm') {
        return
      }
      let column_index = 0
      for (var i = 0; i < table_obj.columns.length; i++) {
        if (table_obj.columns[i].id === column.id) {
          column_index = i
          break
        }
      }
      // 获取数据
      saveColumnsSizeApi({
        page_code: page_code,
        column_label: column.label,
        column_property: column.property,
        column_index: column_index,
        type: this.type,
        min_width: column.minWidth,
        real_width: column.realWidth
      }).then(response => {
      }).finally(() => {
      })
    },
    // 调整列宽方法
    setColumnsSize (table_object, page_code, table_type) {
      if (page_code !== undefined && page_code !== 'ElMain' && page_code !== 'ElForm') {
        // 获取数据
        getColumnsSizeApi({ page_code: page_code, type: table_type }).then(response => {
          for (const item of response.data) {
            // for (const column of table_object.columns) {
            //   if (item.column_id === column.id) {
            //     column.width = item.real_width
            //   }
            // }
            table_object.columns[item.column_index].width = item.real_width
            table_object.columns[item.column_index].realWidth = item.real_width
          }
        }).finally(() => {
          // table_object.doLayout()
        })
      }
    }, // // 设置列宽
    // setColgroupWidth () {
    //   const cols = this.$el.querySelectorAll('colgroup > col')
    //   if (!cols.length) return
    //   // const flattenColumns = deepCopy(_colums)
    //   const flattenColumns = this.layout.getFlattenColumns()
    //   const columnsMap = {}
    //   flattenColumns.forEach((column) => {
    //     columnsMap[column.id] = column
    //   })
    //   for (let i = 0, j = cols.length; i < j; i++) {
    //     const col = cols[i]
    //     const name = col.getAttribute('name')
    //     const column = columnsMap[name]
    //     if (column) {
    //       col.setAttribute('width', column.realWidth || column.width)
    //     }
    //   }
    // }
    /**
     * 获取并应用表格列配置 - 使用Element UI原生API优化版本
     *
     * 功能说明：
     * 1. 根据数据库配置控制列的显示/隐藏和位置调整
     * 2. 使用Element UI官方API保持响应式系统完整性
     * 3. 优化算法复杂度从O(n³)到O(n)
     * 4. 支持列位置变换和持久化配置
     * 5. 支持分组表头的显示/隐藏控制
     */
    getTableConfig () {
      try {
        // 获取table实例和基础参数
        const { componentInstance: $table } = this.$vnode
        if (!$table) {
          return
        }

        const table_object = $table
        const page_code = $table.$parent.$options.name

        // 检查是否启用列配置功能
        if (table_object.$attrs.columns_index_key !== 'true') {
          this.configLoading = false
          this.$el.style.opacity = '1'
          return
        }

        if (!page_code || page_code === 'ElMain') {
          this.configLoading = false
          this.$el.style.opacity = '1'
          return
        }

        // 获取列属性配置数据
        getTableConfigApi({ page_code: page_code }).then(response => {
          try {
            if (!response.data || !Array.isArray(response.data)) {
              this.configLoading = false
              this.$el.style.opacity = '1' // 没有配置数据也要显示表格
              return
            }

            this.applyColumnConfiguration($table, response.data)

            // 配置应用完成，更新状态
            this.$nextTick(() => {
              this.configLoading = false
              this.configLoaded = true
              // 显示表格
              this.$el.style.opacity = '1'
            })
          } catch (error) {
            this.configLoading = false // 错误时也要更新状态
            this.$el.style.opacity = '1' // 错误时也要显示表格
          }
        }).catch(error => {
          // 处理配置加载错误，确保表格仍然可以正常显示
          console.warn('表格配置加载失败:', error)
          this.configLoading = false // 错误时也要更新状态
          this.$el.style.opacity = '1' // 错误时也要显示表格
        })
      } catch (error) {
        this.configLoading = false
        this.$el.style.opacity = '1' // 错误时也要显示表格
      }
    },

    /**
     * 应用列配置 - 纯Element UI Store API方案
     * @param {Object} $table 表格实例
     * @param {Array} configData 配置数据
     */
    applyColumnConfiguration ($table, configData) {
      try {
        // 动画：记录变化前的列位置
        this.recordColumnPositionsForAnimation()

        const store = $table.store
        if (!store || !store.states) {
          return
        }

        // 检查原始列定义是否已保存
        if (this.originalColumns === null) {
          return
        }

        // 构建配置映射
        const configMap = new Map()
        const groupConfigMap = new Map()

        configData.forEach(item => {
          if (item.name) {
            configMap.set(item.name, {
              sort: item.sort || 0,
              is_enable: item.is_enable === true,
              is_group: item.is_group || 0
            })

            // 处理分组子列
            if (item.is_group === 1 && item.groupChildren) {
              item.groupChildren.forEach(child => {
                if (child.name) {
                  groupConfigMap.set(child.name, {
                    sort: child.sort || 0,
                    is_enable: child.is_enable === true,
                    parent_name: item.name
                  })
                }
              })
            }
          }
        })

        // 预处理分组列

        // 预处理阶段：处理所有分组列的children，创建新对象而不修改原对象
        const preprocessedColumns = this.originalColumns.map(column => {
          if (column.children && configMap.get(column.property)?.is_group === 1) {
            // 根据groupConfigMap过滤并排序子列
            const visibleChildren = column.children
              .filter(child => {
                const config = groupConfigMap.get(child.property)
                let isVisible = true // 默认显示
                if (config !== undefined) {
                  isVisible = config.is_enable === true
                }
                return isVisible
              })
              .sort((a, b) => {
                // 根据API配置的sort字段排序
                const configA = groupConfigMap.get(a.property)
                const configB = groupConfigMap.get(b.property)
                const sortA = configA?.sort || 0
                const sortB = configB?.sort || 0
                return sortA - sortB
              })

            // 关键：创建新对象，不修改原对象
            return { ...column, children: visibleChildren }
          }
          return column
        })

        // 从预处理后的列分离系统列和业务列（完全按照非组列模式）
        const systemColumns = []
        const businessColumns = []

        preprocessedColumns.forEach(column => {
          if (column.type && ['selection', 'index'].includes(column.type)) {
            // 系统列直接保留，不参与任何配置判断
            systemColumns.push(column)
          } else {
            businessColumns.push(column)
          }
        })

        // 只对业务列进行过滤和排序
        const visibleBusinessColumns = businessColumns
          .filter(column => {
            // 根据配置决定是否显示
            const config = configMap.get(column.property) || groupConfigMap.get(column.property)

            // 正确逻辑：如果有配置，按配置显示；如果没有配置，默认显示
            let isVisible = true // 默认显示
            if (config !== undefined) {
              isVisible = config.is_enable === true
            }
            return isVisible
          })
          .sort((a, b) => {
            const configA = configMap.get(a.property) || groupConfigMap.get(a.property)
            const configB = configMap.get(b.property) || groupConfigMap.get(b.property)

            // 如果都没有配置，保持原顺序
            if (!configA && !configB) return 0
            if (!configA) return 1 // 没有配置的排在后面
            if (!configB) return -1 // 没有配置的排在后面

            return (configA.sort || 0) - (configB.sort || 0)
          })

        // 系统列在前，业务列在后
        const visibleColumns = [...systemColumns, ...visibleBusinessColumns]

        // 使用Element UI原生方法更新
        store.states._columns = visibleColumns
        store.updateColumns()

        // 强制触发Vue响应式更新和Element UI重渲染
        this.$nextTick(() => {
          // 1. 强制重新布局
          store.scheduleLayout(true) // 传入true强制更新列
          $table.doLayout()

          // 2. 强制触发表格重渲染
          this.$forceUpdate()

          // 3. 触发父组件更新
          if (this.$parent && this.$parent.$forceUpdate) {
            this.$parent.$forceUpdate()
          }

          // 4. 触发resize事件让Element UI重新计算
          this.triggerResize()

          // 动画：布局完成后执行列变化动画
          this.$nextTick(() => {
            this.executeColumnAnimation()

            // 配置应用完成后，触发表头自适应（重要：解决FieldHelp组件换行）
            this.triggerHeaderAutoResize()

            // 新增：列顺序变化后强制重新计算宽度（等待动画完成）
            setTimeout(() => {
              this.autoResizeOrMergeCell() // 重用现有方法
              this.doLayout()
            }, 400) // 等待动画完成
          })
        })
      } catch (error) {
        // 静默处理配置应用错误，不影响表格基本功能
      }
    },

    // 触发resize事件的方法
    triggerResize () {
      // 触发window resize事件，让Element UI Table自动响应
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
      })
    },

    // 处理配置更新事件
    handleConfigUpdate (data) {
      const { componentInstance: $table } = this.$vnode
      if (!$table) return

      const page_code = $table.$parent.$options.name

      if (data.page_code === page_code) {
        // 通知父组件需要刷新表格
        // 父组件可以通过改变表格的key属性来强制重新渲染
        if (this.$parent && this.$parent.handleTableConfigUpdate) {
          this.$parent.handleTableConfigUpdate()
        } else {
          // 如果父组件没有处理方法，则发送事件
          this.$emit('config-updated')

          // 同时尝试重新加载配置
          this.getTableConfig()
        }
      }
    },

    // 处理获取列配置事件（用于重置功能）
    handleGetColumnConfig (data) {
      const { componentInstance: $table } = this.$vnode
      if (!$table) {
        console.warn('ExTable: 无法获取表格实例')
        return
      }

      const page_code = $table.$parent.$options.name

      if (data.page_code === page_code && data.callback && typeof data.callback === 'function') {
        // 获取当前表格的列配置
        const tableColumns = this.getTableColumnSort()

        // 调用回调函数，返回配置数据
        data.callback(tableColumns)
      }
    },

    compare (obj1, obj2) {
      return obj1.sort - obj2.sort
    },

    // 动画：记录列变化前的位置
    recordColumnPositionsForAnimation () {
      try {
        // 查找表头所有行
        const headerRows = this.$el.querySelectorAll('.el-table__header-wrapper tr')
        if (headerRows.length === 0) {
          return
        }

        this.columnsBeforeAnimation = []

        // 处理每一行的表头
        headerRows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('th')

          cells.forEach((cell, cellIndex) => {
            const rect = cell.getBoundingClientRect()
            const cellText = cell.textContent.trim()

            // 获取列的属性标识，优先使用data-属性
            const columnKey = cell.getAttribute('data-column-key') ||
                           cell.getAttribute('data-property') ||
                           cellText

            // 对于分组表头，添加行级别信息
            const uniqueKey = `${rowIndex}-${columnKey}-${cellIndex}`

            this.columnsBeforeAnimation.push({
              text: cellText,
              left: rect.left,
              top: rect.top,
              rowIndex: rowIndex,
              cellIndex: cellIndex,
              columnKey: columnKey,
              uniqueKey: uniqueKey,
              element: cell,
              colspan: parseInt(cell.getAttribute('colspan')) || 1,
              rowspan: parseInt(cell.getAttribute('rowspan')) || 1
            })
          })
        })
      } catch (error) {
        // 静默处理列位置记录错误，不影响主要功能
      }
    },

    // 动画：执行列变化动画
    executeColumnAnimation () {
      try {
        if (!this.columnsBeforeAnimation || this.columnsBeforeAnimation.length === 0) {
          return
        }

        // 查找表头所有行
        const headerRows = this.$el.querySelectorAll('.el-table__header-wrapper tr')
        if (headerRows.length === 0) {
          return
        }

        // 处理每一行的表头
        headerRows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('th')

          cells.forEach((currentCell, cellIndex) => {
            const currentRect = currentCell.getBoundingClientRect()
            const currentText = currentCell.textContent.trim()

            // 获取当前单元格的标识信息
            const currentColumnKey = currentCell.getAttribute('data-column-key') ||
                                  currentCell.getAttribute('data-property') ||
                                  currentText

            const currentUniqueKey = `${rowIndex}-${currentColumnKey}-${cellIndex}`

            // 查找这个单元格在变化前的位置
            const beforeInfo = this.columnsBeforeAnimation.find(item => {
              // 优先通过uniqueKey匹配，再尝试其他方式
              return item.uniqueKey === currentUniqueKey ||
                     (item.rowIndex === rowIndex && item.cellIndex === cellIndex) ||
                     (item.rowIndex === rowIndex && item.columnKey === currentColumnKey) ||
                     (item.rowIndex === rowIndex && item.text === currentText)
            })

            if (beforeInfo) {
              const deltaX = beforeInfo.left - currentRect.left
              const deltaY = beforeInfo.top - currentRect.top

              // 如果位置有明显变化，执行移动动画
              if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                if (currentCell.animate) {
                  // Web Animations API - 移动动画
                  currentCell.animate([
                    { transform: `translate(${deltaX}px, ${deltaY}px)`, opacity: '0.85' },
                    { transform: 'translate(0px, 0px)', opacity: '1' }
                  ], {
                    duration: 350,
                    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                  })
                } else {
                  // CSS Transition fallback - 移动动画
                  currentCell.style.transition = 'all 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)'
                  currentCell.style.transform = `translate(${deltaX}px, ${deltaY}px)`
                  currentCell.style.opacity = '0.85'

                  // 启动动画
                  setTimeout(() => {
                    currentCell.style.transform = 'translate(0px, 0px)'
                    currentCell.style.opacity = '1'

                    // 清理样式
                    setTimeout(() => {
                      currentCell.style.transition = ''
                      currentCell.style.transform = ''
                      currentCell.style.opacity = ''
                    }, 350)
                  }, 16)
                }
              }
            } else {
              // 新出现的列（之前隐藏，现在显示），执行淡入动画

              if (currentCell.animate) {
                // Web Animations API - 淡入动画
                currentCell.animate([
                  { opacity: '0', transform: 'scale(0.95)', filter: 'blur(1px)' },
                  { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' }
                ], {
                  duration: 400,
                  easing: 'cubic-bezier(0.2, 0.0, 0.2, 1)'
                })
              } else {
                // CSS Transition fallback - 淡入动画
                currentCell.style.opacity = '0'
                currentCell.style.transform = 'scale(0.95)'
                currentCell.style.filter = 'blur(1px)'
                currentCell.style.transition = 'all 0.4s cubic-bezier(0.2, 0.0, 0.2, 1)'

                // 启动淡入动画
                setTimeout(() => {
                  currentCell.style.opacity = '1'
                  currentCell.style.transform = 'scale(1)'
                  currentCell.style.filter = 'blur(0px)'

                  // 清理样式
                  setTimeout(() => {
                    currentCell.style.transition = ''
                    currentCell.style.opacity = ''
                    currentCell.style.transform = ''
                    currentCell.style.filter = ''
                  }, 400)
                }, 16)
              }
            }
          })
        })

        // 清理记录
        this.columnsBeforeAnimation = null
      } catch (error) {
        this.columnsBeforeAnimation = null
      }
    },

    // 新增：表头自适应触发方法（解决FieldHelp组件换行）
    triggerHeaderAutoResize () {
      try {
        // 遍历所有列组件，触发表头宽度重新计算
        for (let i = 0, j = this.$children.length; i < j; i++) {
          const columnComponent = this.$children[i]

          // 跳过非列组件
          if (!columnComponent.columnConfig || !columnComponent.autoFit) {
            continue
          }

          // 特别处理FieldHelp组件列
          const isFieldHelpColumn = columnComponent.columnConfig.property &&
                                   ['order_count', 'virtual_progress'].includes(columnComponent.columnConfig.property)

          if (isFieldHelpColumn) {
            // 强制重新计算该列的宽度（包含表头）
            columnComponent.updateAutoWidth(columnComponent)
          }
        }

        // 触发表格重新布局
        this.$nextTick(() => {
          this.doLayout()
        })
      } catch (error) {
        // 静默处理表头自适应错误，不影响表格正常显示
      }
    },

    /**
     * Canvas精确高度计算（Element UI优化版）
     * 借鉴Element UI源码，使用clientHeight和offsetHeight简化计算
     * @param {number} bottomReserve - 额外的底部预留空间（默认为0）
     * @returns {number} 计算得出的表格最大可用高度
     */
    calculateCanvasTableHeight (bottomReserve = 0) {
      try {
        const tableElement = this.$el
        if (!tableElement) {
          return 400 // 最小默认值
        }

        // 关键修复：临时重置高度为auto，获取真实的表格位置
        // 避免已设置的高度影响位置计算
        const originalHeight = tableElement.style.height
        tableElement.style.height = 'auto'

        // Element UI方法：使用getBoundingClientRect获取精确位置
        const viewportHeight = window.innerHeight
        const tableRect = tableElement.getBoundingClientRect()

        // 恢复原始高度样式
        tableElement.style.height = originalHeight

        // 优化方法1：查找内容区域的实际底部边界
        // 不再逐个计算margin/padding，而是找到实际可用的容器边界
        let availableBottom = viewportHeight // 默认使用视口底部

        // 查找父容器（通常是.el-main或内容区域）
        const mainContainer = tableElement.closest('.el-main') ||
                             tableElement.closest('.app-main') ||
                             tableElement.parentElement

        if (mainContainer) {
          // 关键修复：临时重置容器高度，避免被撑大的影响
          const originalContainerHeight = mainContainer.style.height
          mainContainer.style.height = 'auto'

          const containerRect = mainContainer.getBoundingClientRect()
          // 使用容器的内部可用高度（clientHeight不包含滚动条）
          const containerPadding = parseInt(window.getComputedStyle(mainContainer).paddingBottom) || 0
          const containerBottom = containerRect.bottom - containerPadding

          // 恢复容器高度
          mainContainer.style.height = originalContainerHeight

          // 关键：使用视口高度和容器底部的较小值，避免容器被撑大
          availableBottom = Math.min(viewportHeight, containerBottom)
        }

        // 优化方法2：使用offsetHeight自动包含padding和border
        let paginationSpace = 0

        // 查找分页组件（保持原有的自动检测逻辑）
        let nextElement = tableElement.nextElementSibling
        while (nextElement) {
          if (nextElement.classList.contains('el-pagination') ||
              nextElement.querySelector('.el-pagination')) {
            // 使用offsetHeight获取完整高度（包含padding和border）
            paginationSpace = nextElement.offsetHeight

            // 只需要额外加上margin（offsetHeight不包含margin）
            const style = window.getComputedStyle(nextElement)
            const marginTop = parseInt(style.marginTop) || 0
            const marginBottom = parseInt(style.marginBottom) || 0
            paginationSpace += marginTop + marginBottom

            // 分页组件检测完成
            break
          }
          nextElement = nextElement.nextElementSibling
        }

        // 优化方法3：简化的高度计算公式（参考Element UI）
        // 可用高度 = 容器底部 - 表格顶部 - 分页空间 - 预留空间
        const maxHeight = availableBottom - tableRect.top - paginationSpace - bottomReserve

        // 确保最小高度，避免表格过小
        const minHeight = 200
        const finalHeight = Math.max(maxHeight, minHeight)

        return finalHeight
      } catch (error) {
        return 400 // 错误时返回最小值
      }
    },

    /**
     * Canvas测量页面已占用空间（已废弃，由优化版calculateCanvasTableHeight替代）
     * @deprecated 使用tableRect.top直接获取表格位置更准确
     * @returns {number} 已占用空间的像素值（保留作为后备方案）
     */
    measureReservedSpaceWithCanvas () {
      // 新版本直接使用表格位置计算，无需复杂DOM查询
      return 200 // 保留作为后备默认值
    },

    /**
     * Canvas批量测量列标题（性能优化版本）
     * 一次性测量所有表头元素，避免重复Canvas操作
     * @returns {Map} 列标题测量结果映射表
     */
    canvasMeasureAllColumnHeaders () {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const measurements = new Map()

        // 查找所有表头单元格
        const headerCells = this.$el.querySelectorAll('.el-table__header th')

        headerCells.forEach(cell => {
          try {
            // 设置字体样式
            const computedStyle = window.getComputedStyle(cell)
            ctx.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`

            // 获取单元格内容
            const cellText = cell.textContent || ''
            const columnProperty = cell.getAttribute('data-property') || cellText

            // Canvas精确测量
            const metrics = ctx.measureText(cellText)
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || 16

            // 检查是否是FieldHelp类型
            const isFieldHelp = cell.querySelector('.field-help') !== null
            const extraPadding = isFieldHelp ? 24 : 16

            measurements.set(columnProperty, {
              width: metrics.width,
              height: textHeight,
              padding: extraPadding,
              isFieldHelp: isFieldHelp,
              originalText: cellText
            })
          } catch (cellError) {
            // 静默处理单个表头单元格测量错误
          }
        })

        return measurements
      } catch (error) {
        return new Map()
      }
    },

    /**
     * 初始化Canvas高度计算（Element UI风格的DOM检测）
     * 直接借鉴Element UI table-layout.js的优雅检测机制
     * @param {number} bottomReserve 底部预留空间
     */
    initCanvasHeight (bottomReserve) {
      const tableEl = this.$el

      // 直接借鉴Element UI table-layout.js:63的检测逻辑
      if (!tableEl || tableEl.offsetWidth === 0) {
        return this.$nextTick(() => this.initCanvasHeight(bottomReserve))
      }

      // DOM已准备好，直接执行高度计算
      const calculatedHeight = this.calculateCanvasTableHeight(bottomReserve)
      if (calculatedHeight > 0) {
        // 重要改进：将高度存储到data中，而不是直接设置DOM样式
        this.canvasCalculatedHeight = calculatedHeight
      }
    },

    /**
     * 设置窗口resize事件监听
     * 实现窗口大小变化时的动态高度调整
     */
    setupWindowResizeListener () {
      try {
        // 绑定this上下文的resize处理函数
        this.boundResizeHandler = this.handleWindowResize.bind(this)

        // 添加resize事件监听
        window.addEventListener('resize', this.boundResizeHandler)
      } catch (error) {
        // 静默处理窗口监听器设置错误
      }
    },

    /**
     * 窗口resize事件处理（防抖版本）
     * 避免频繁计算，提升性能
     */
    handleWindowResize () {
      try {
        // 清除之前的计时器
        if (this.resizeTimer) {
          clearTimeout(this.resizeTimer)
        }

        // 设置防抖延迟（300ms）
        this.resizeTimer = setTimeout(() => {
          if (this.canvasAutoHeightEnabled) {
            this.updateCanvasTableHeight()
          }
        }, 300)
      } catch (error) {
        // 静默处理窗口resize事件错误
      }
    },

    /**
     * 更新Canvas表格高度
     * 重新计算并更新到data中，触发响应式更新
     */
    updateCanvasTableHeight () {
      try {
        // 页签切换场景：确保DOM完全可见和稳定
        const tableEl = this.$el
        if (!tableEl || tableEl.offsetWidth === 0 || !tableEl.offsetParent) {
          // DOM还未完全可见，延迟重试
          setTimeout(() => {
            if (this.canvasAutoHeightEnabled) {
              this.updateCanvasTableHeight()
            }
          }, 50)
          return
        }

        // 记录当前高度用于对比
        const oldHeight = this.canvasCalculatedHeight

        // 使用保存的配置参数重新计算Canvas高度
        const bottomReserve = this.canvasHeightConfig?.bottomReserve || 0
        const newHeight = this.calculateCanvasTableHeight(bottomReserve)

        if (newHeight > 0 && newHeight !== oldHeight) {
          // 重要改进：更新data中的高度，而不是直接操作DOM
          this.canvasCalculatedHeight = newHeight
        }
      } catch (error) {
        // 静默处理表格高度更新错误
      }
    },

    /**
     * 更新Element UI Table的高度
     * 通过多种方式确保表格高度正确设置
     * @param {number} height 新的表格高度
     */
    updateTableHeight (height) {
      try {
        if (!height || height <= 0) {
          return
        }

        // 方法1：通过layout实例更新高度
        if (this.layout) {
          this.layout.setHeight(height)
          this.layout.updateElsHeight() // 更新表格内部元素高度
        }

        // 方法2：直接设置height属性（已移除 - 违反Vue单向数据流原则）
        // this.$set(this, 'height', height) // 移除：避免直接变异继承的prop

        // 方法3：强制设置DOM样式（确保生效）
        if (this.$el) {
          this.$el.style.height = height + 'px'

          // 额外：设置表格容器的高度
          const tableWrapper = this.$el.querySelector('.el-table__body-wrapper')
          if (tableWrapper) {
            const headerHeight = this.$el.querySelector('.el-table__header-wrapper')?.offsetHeight || 40
            const bodyHeight = height - headerHeight - 2 // 减去头部高度和边框
            tableWrapper.style.height = bodyHeight + 'px'
          }
        }

        // 触发Element UI Table重新布局
        this.$nextTick(() => {
          this.doLayout()
        })
      } catch (error) {
        // 降级处理：最基础的DOM样式设置
        try {
          if (this.$el) {
            this.$el.style.height = height + 'px'
            this.$el.style.minHeight = height + 'px'
          }
        } catch (domError) {
          // 静默处理DOM高度设置错误
        }
      }
    },

    /**
     * 初始化智能复制系统
     * 基于浏览器原生文本选择功能的智能复制
     */
    initSmartCopySystem () {
      try {
        // 初始化原生文本选择监听
        this.initNativeTextSelection()

        // 初始化鼠标位置追踪
        this.initMouseTracker()

        // 初始化复制拦截器
        this.initCopyInterceptor()

        // 初始化复制菜单DOM元素
        this.initCopyMenu()
      } catch (error) {
        // 静默处理智能复制系统初始化错误，不影响表格基本功能
      }
    },

    /**
     * 初始化原生文本选择监听
     * 监听浏览器原生的文本选择变化事件
     */
    initNativeTextSelection () {
      try {
        // 创建选择变化处理器
        this.selectionChangeHandler = this.handleSelectionChange.bind(this)

        // 监听全局的选择变化事件
        document.addEventListener('selectionchange', this.selectionChangeHandler)
      } catch (error) {
        // 静默处理原生文本选择监听初始化错误
      }
    },

    /**
     * 处理选择变化事件
     * 当用户选择文本时触发
     */
    handleSelectionChange () {
      try {
        // 获取当前选择
        const selection = window.getSelection()

        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
          // 没有选择或选择为空
          this.currentSelection = null
          this.selectionInTable = false
          this.selectionAnalysis = null
          this.hideSelectionHint()
          return
        }

        // 分析选择内容
        const analysis = this.analyzeCurrentSelection()

        // 如果选择在表格内，显示提示
        if (this.selectionInTable && analysis) {
          this.showSelectionHint()
        } else {
          this.hideSelectionHint()
        }
      } catch (error) {
        // 静默处理选择变化事件错误，不影响表格正常使用
      }
    },

    /**
     * 显示选择提示
     * 提醒用户可以使用智能复制功能
     */
    showSelectionHint () {
      // 如果已经有提示，不重复创建
      if (this.selectionHintElement) {
        return
      }

      // 创建提示元素
      const hint = document.createElement('div')
      hint.className = 'extable-selection-hint'
      hint.innerHTML = `
        <span style="color: #67C23A;">✓ 已选择表格数据</span>
        <span style="margin-left: 10px; color: #909399;">
          右键菜单或按 Alt+C 智能复制
        </span>
      `
      hint.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #fff;
        border: 1px solid #DCDFE6;
        border-radius: 4px;
        padding: 12px 20px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        z-index: 2000;
        font-size: 14px;
        animation: slideInUp 0.3s ease;
      `

      // 添加动画样式
      if (!document.getElementById('extable-hint-styles')) {
        const style = document.createElement('style')
        style.id = 'extable-hint-styles'
        style.textContent = `
          @keyframes slideInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `
        document.head.appendChild(style)
      }

      document.body.appendChild(hint)
      this.selectionHintElement = hint

      // 3秒后自动隐藏
      this.selectionHintTimer = setTimeout(() => {
        this.hideSelectionHint()
      }, 3000)
    },

    /**
     * 隐藏选择提示
     */
    hideSelectionHint () {
      if (this.selectionHintElement) {
        document.body.removeChild(this.selectionHintElement)
        this.selectionHintElement = null
      }

      if (this.selectionHintTimer) {
        clearTimeout(this.selectionHintTimer)
        this.selectionHintTimer = null
      }
    },

    /**
     * 分析当前文本选择
     * 判断选择是否在表格内，涉及多少单元格/行
     */
    analyzeCurrentSelection () {
      try {
        const selection = window.getSelection()

        if (!selection || selection.rangeCount === 0) {
          this.currentSelection = null
          this.selectionInTable = false
          this.selectionAnalysis = null
          return null
        }

        // 获取选择的第一个范围
        const range = selection.getRangeAt(0)
        const selectedText = selection.toString().trim()

        // 检查选择是否在当前表格内
        const isInTable = this.isSelectionInCurrentTable(range)

        if (!isInTable) {
          this.currentSelection = null
          this.selectionInTable = false
          this.selectionAnalysis = null
          return null
        }

        // 分析选择涉及的单元格和行
        const analysis = this.analyzeSelectionRange(range, selectedText)

        // 保存分析结果
        this.currentSelection = selection
        this.selectionInTable = true
        this.selectionAnalysis = analysis

        return analysis
      } catch (error) {
        // 静默处理选择内容分析错误，返回空结果
        return null
      }
    },

    /**
     * 检查选择范围是否在当前表格内
     */
    isSelectionInCurrentTable (range) {
      try {
        // 获取选择的开始和结束节点
        const startContainer = range.startContainer
        const endContainer = range.endContainer

        // 检查开始节点是否在表格内
        const startInTable = this.isNodeInCurrentTable(startContainer)
        // 检查结束节点是否在表格内
        const endInTable = this.isNodeInCurrentTable(endContainer)

        // 只有当选择的开始和结束都在表格内时才认为选择在表格内
        return startInTable && endInTable
      } catch (error) {
        // 静默处理选择范围检查错误，默认不在表格内
        return false
      }
    },

    /**
     * 检查节点是否在当前表格内
     */
    isNodeInCurrentTable (node) {
      try {
        // 从节点向上遍历DOM树，查找是否包含在当前表格元素中
        let current = node

        // 如果是文本节点，先获取其父元素
        if (current.nodeType === Node.TEXT_NODE) {
          current = current.parentElement
        }

        while (current && current !== document.body) {
          // 如果找到当前表格元素，说明节点在表格内
          if (current === this.$el) {
            return true
          }
          current = current.parentElement
        }

        return false
      } catch (error) {
        // 静默处理节点查找错误，默认不在表格内
        return false
      }
    },

    /**
     * 分析选择范围涉及的单元格和行
     */
    analyzeSelectionRange (range, selectedText) {
      try {
        // Element UI的DOM结构可能有多种情况
        let tableBody = null

        // 尝试标准结构：.el-table__body-wrapper tbody (不需要中间的table选择器)
        tableBody = this.$el.querySelector('.el-table__body-wrapper tbody')

        // 如果失败，尝试带table选择器
        if (!tableBody) {
          tableBody = this.$el.querySelector('.el-table__body-wrapper table tbody')
        }

        // 固定列的情况
        if (!tableBody) {
          tableBody = this.$el.querySelector('.el-table__fixed-body-wrapper tbody')
        }

        // 直接查找tbody
        if (!tableBody) {
          tableBody = this.$el.querySelector('tbody')
        }

        if (!tableBody) {
          return { type: 'unknown', count: 0, cells: [], rows: [], data: [] }
        }

        // 新增：分析合并单元格
        const mergedCellsMap = this.analyzeMergedCells(this.$el)

        const allRows = Array.from(tableBody.querySelectorAll('tr'))
        const affectedCells = []
        const affectedRows = new Set()

        // 遍历所有行和单元格，检查哪些与选择范围有交集
        allRows.forEach((row, rowIndex) => {
          const cells = Array.from(row.querySelectorAll('td'))

          cells.forEach((cell, cellIndex) => {
            // 检查单元格是否与选择范围有交集
            if (this.doesRangeIntersectElement(range, cell)) {
              const cellText = cell.textContent?.trim() || ''

              // 检查是否是合并单元格
              const mergedInfo = mergedCellsMap.get(`${rowIndex}-${cellIndex}`)

              affectedCells.push({
                rowIndex,
                cellIndex,
                element: cell,
                text: cellText,
                mergedInfo: mergedInfo || null // 添加合并信息
              })
              affectedRows.add(rowIndex)
            }
          })
        })

        // 获取受影响行的数据
        const tableData = this.store?.states?.data || this.data || []
        const affectedRowData = []

        affectedRows.forEach(rowIndex => {
          if (tableData[rowIndex]) {
            affectedRowData.push(tableData[rowIndex])
          }
        })

        // 确定选择类型 - 修复：优先判断单元格数量
        let selectionType = 'unknown'
        let selectionCount = 0

        if (affectedCells.length === 1) {
          selectionType = 'cell'
          selectionCount = 1
        } else if (affectedCells.length > 1) {
          // 多个单元格：优先按单元格数量计算
          selectionType = 'cell'
          selectionCount = affectedCells.length
        } else if (affectedRows.size === 1) {
          selectionType = 'row'
          selectionCount = 1
        } else if (affectedRows.size > 1) {
          selectionType = 'row'
          selectionCount = affectedRows.size
        }

        return {
          type: selectionType,
          count: selectionCount,
          cells: affectedCells,
          rows: Array.from(affectedRows),
          data: affectedRowData,
          selectedText: selectedText,
          columns: this.getVisibleColumns(),
          mergedCellsMap: mergedCellsMap //  传递合并单元格信息
        }
      } catch (error) {
        return { type: 'unknown', count: 0, cells: [], rows: [], data: [] }
      }
    },

    /**
     * 检测和记录合并单元格信息
     * @param {Element} tableElement 表格元素
     * @returns {Map} 合并单元格映射表
     */
    analyzeMergedCells (tableElement) {
      const mergedCellsMap = new Map()

      try {
        // 1. 检测传统HTML合并单元格 (rowspan/colspan)
        const htmlMergedCells = tableElement.querySelectorAll('td[colspan], td[rowspan], th[colspan], th[rowspan]')

        htmlMergedCells.forEach(cell => {
          const row = cell.parentElement
          const rowIndex = row.rowIndex
          const cellIndex = cell.cellIndex
          const colspan = parseInt(cell.getAttribute('colspan')) || 1
          const rowspan = parseInt(cell.getAttribute('rowspan')) || 1
          const cellValue = cell.textContent?.trim() || ''

          // 记录这个合并单元格影响的所有逻辑位置
          for (let r = rowIndex; r < rowIndex + rowspan; r++) {
            for (let c = cellIndex; c < cellIndex + colspan; c++) {
              const key = `${r}-${c}`
              mergedCellsMap.set(key, {
                value: cellValue,
                originalRow: rowIndex,
                originalCol: cellIndex,
                colspan: colspan,
                rowspan: rowspan,
                isMerged: true,
                type: 'html'
              })
            }
          }
        })

        // 2.  检测Element UI的merge-cells合并单元格 (通过多个div实现)
        const elementUiMergedCells = tableElement.querySelectorAll('td')

        elementUiMergedCells.forEach(cell => {
          // 检查是否包含多个div子元素（Element UI合并单元格的特征）
          const divChildren = cell.querySelectorAll('div')
          if (divChildren.length > 1) {
            const row = cell.parentElement
            const rowIndex = row.rowIndex
            const cellIndex = cell.cellIndex

            //  改进的文本提取逻辑 - 深度获取所有文本内容
            const divTexts = Array.from(divChildren).map(div => {
              // 优先使用textContent，如果为空则尝试获取所有子元素的文本
              let text = div.textContent?.trim() || ''

              // 如果textContent为空，尝试深度获取文本
              if (!text) {
                // 获取所有文本节点和元素的textContent
                const allTextNodes = []
                const walker = document.createTreeWalker(
                  div,
                  NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                  null,
                  false
                )

                let node
                while ((node = walker.nextNode())) {
                  if (node.nodeType === Node.TEXT_NODE) {
                    const nodeText = node.textContent?.trim()
                    if (nodeText) allTextNodes.push(nodeText)
                  } else if (node.nodeType === Node.ELEMENT_NODE && node.textContent) {
                    const elemText = node.textContent?.trim()
                    if (elemText && !allTextNodes.includes(elemText)) {
                      allTextNodes.push(elemText)
                    }
                  }
                }
                text = allTextNodes.join(' ').trim()
              }

              return text
            })

            // 过滤掉空字符串
            const nonEmptyTexts = divTexts.filter(text => text.length > 0)
            const allText = nonEmptyTexts.join('\n') // 多行数据用换行符连接

            // 将这个单元格标记为Element UI合并单元格 (只有当有实际内容时才记录)
            if (nonEmptyTexts.length > 0) {
              const key = `${rowIndex}-${cellIndex}`
              mergedCellsMap.set(key, {
                value: allText,
                originalRow: rowIndex,
                originalCol: cellIndex,
                colspan: 1,
                rowspan: 1,
                isMerged: true,
                type: 'element-ui',
                divTexts: nonEmptyTexts //  保存过滤后的非空数据
              })
            }
          }
        })
      } catch (error) {
        // 静默处理合并单元格检测错误，不影响正常功能
      }

      return mergedCellsMap
    },

    /**
     * 检查Range是否与指定元素有交集 - 原生API简单版本
     */
    doesRangeIntersectElement (range, element) {
      try {
        // 使用浏览器原生的 intersectsNode API - 最简单直接
        return range.intersectsNode(element)
      } catch (error) {
        // 如果原生API不支持，回退到简单的contain检查
        try {
          const startContainer = range.startContainer
          const endContainer = range.endContainer

          return element.contains(startContainer) ||
                 element.contains(endContainer) ||
                 startContainer === element ||
                 endContainer === element
        } catch (e) {
          return false
        }
      }
    },

    /**
     * 初始化复制拦截器
     * 监听Ctrl+C、右键菜单和复制操作
     */
    initCopyInterceptor () {
      try {
        // 1. 使表格可聚焦
        this.$el.setAttribute('tabindex', '-1')
        this.$el.style.outline = 'none' // 移除焦点边框

        // 2. 监听document级别的键盘事件（更可靠）
        this.keydownHandler = this.handleKeyDown.bind(this)
        document.addEventListener('keydown', this.keydownHandler, true)

        // 3. 监听表格的右键菜单事件（最可靠的方案）
        this.contextmenuHandler = this.handleContextMenu.bind(this)
        this.$el.addEventListener('contextmenu', this.contextmenuHandler)

        // 4. 监听copy事件作为备用
        this.copyEventHandler = this.handleCopyEvent.bind(this)
        document.addEventListener('copy', this.copyEventHandler, true)

        // 5. 监听表格点击，自动获取焦点
        this.$el.addEventListener('click', () => {
          this.$el.focus()
        })
      } catch (error) {
        // 静默处理复制拦截器初始化错误
      }
    },

    /**
     * 处理右键菜单事件
     * 提供更可靠的复制入口
     */
    handleContextMenu (event) {
      // 检查是否有文本选择
      if (!this.selectionInTable || !this.selectionAnalysis) {
        return // 没有选择，显示默认右键菜单
      }

      // 阻止默认右键菜单
      event.preventDefault()

      // 记录鼠标位置
      this.lastMousePosition = { x: event.clientX, y: event.clientY }

      // 显示自定义复制菜单
      this.showSmartCopyMenu(event)
    },

    /**
     * 显示智能复制菜单
     */
    showSmartCopyMenu (event) {
      const selectionInfo = this.getSelectionInfo()

      if (selectionInfo.count === 0) {
        return // 没有选择
      }

      if (selectionInfo.count === 1) {
        // 单选，直接复制
        this.directCopy(selectionInfo)
        this.$message.success('已复制到剪贴板')
      } else {
        // 多选，显示格式菜单
        this.showCopyFormatMenu(selectionInfo)
      }
    },

    /**
     * 初始化鼠标位置追踪
     * 用于菜单定位
     */
    initMouseTracker () {
      this.$el.addEventListener('mousemove', (e) => {
        this.lastMousePosition = { x: e.clientX, y: e.clientY }
      })
    },

    /**
     * 处理键盘事件
     * 主要捕获Ctrl+C组合键
     */
    handleKeyDown (event) {
      // 检测Ctrl+C组合键
      if (event.ctrlKey && event.key === 'c') {
        // 检查是否有表格内的文本选择
        if (this.selectionInTable && this.selectionAnalysis) {
          // 尝试处理智能复制
          const handled = this.handleSmartCopy()

          if (handled) {
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()
            return false
          }
        }
      }

      // 添加Alt+C作为备用快捷键（更可靠）
      if (event.altKey && event.key === 'c') {
        if (this.selectionInTable && this.selectionAnalysis) {
          this.handleSmartCopy()
          event.preventDefault()
        }
      }
    },

    /**
     * 处理copy事件
     * 捕获右键复制操作
     */
    handleCopyEvent (event) {
      // 检查是否在表格内触发
      if (this.$el && this.$el.contains(event.target)) {
        if (this.handleSmartCopy()) {
          event.preventDefault()
        }
      }
    },

    /**
     * 智能复制处理核心逻辑
     * 根据选择状态决定直接复制还是显示菜单
     */
    handleSmartCopy () {
      const selectionInfo = this.getSelectionInfo()

      if (selectionInfo.count === 0) {
        return false // 没有选择，不处理
      }

      if (selectionInfo.count === 1) {
        // 单个选择 - 直接复制
        this.directCopy(selectionInfo)
        return true
      } else {
        // 多个选择 - 显示格式菜单
        this.showCopyFormatMenu(selectionInfo)
        return true
      }
    },

    /**
     * 获取当前选择信息 - 基于原生文本选择
     * 返回选择类型、数量和数据
     */
    getSelectionInfo () {
      // 检查是否有原生文本选择分析结果
      if (!this.selectionAnalysis || !this.selectionInTable) {
        return { type: null, count: 0, rows: null, columns: null }
      }

      const analysis = this.selectionAnalysis

      // 构建符合复制系统期望格式的选择信息
      if (analysis.type === 'row') {
        return {
          type: 'row',
          count: analysis.count,
          rows: analysis.data, // 已经是行数据数组
          columns: analysis.columns
        }
      } else if (analysis.type === 'cell') {
        return {
          type: 'cell',
          count: analysis.count,
          cells: analysis.cells,
          rows: analysis.data, // 涉及的行数据
          columns: analysis.columns
        }
      }

      return { type: null, count: 0, rows: null, columns: null }
    },

    /**
     * 获取可见的列配置
     * 排除系统列（selection、index等）
     */
    getVisibleColumns () {
      if (!this.store || !this.store.states) return []

      return this.store.states.columns.filter(col =>
        col.type !== 'selection' &&
        col.type !== 'index' &&
        col.property &&
        !col.hidden
      )
    },

    /**
     * 获取所有可见列配置（包含行号列）
     * 用于整行复制，包含行号列但排除选择框列
     */
    getAllVisibleColumnsWithIndex () {
      if (!this.store || !this.store.states) return []

      return this.store.states.columns.filter(col =>
        col.type !== 'selection' && // 只排除选择框列
        !col.hidden
      )
    },

    /**
     * 直接复制（单行或单个单元格）
     * 单个单元格：纯文本，无格式
     * 单行数据：TSV格式带表头
     */
    async directCopy (selectionInfo) {
      try {
        let copyText = ''

        if (selectionInfo.type === 'cell' && selectionInfo.count === 1) {
          // 单个单元格：直接复制纯文本内容，无任何格式
          const cell = selectionInfo.cells[0]
          copyText = cell.text || ''
        } else if (selectionInfo.type === 'row') {
          // 复制单行数据 - 保持TSV格式
          const row = selectionInfo.rows[0]
          const columns = selectionInfo.columns

          // 生成表头
          const headers = columns.map(col => col.label || col.property || '').join('\t')
          // 生成数据行
          const values = columns.map(col => this.getCellValue(row, col)).join('\t')

          copyText = headers + '\n' + values
        }

        // 使用现代Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(copyText)
          // 根据类型显示不同的提示信息
          if (selectionInfo.type === 'cell' && selectionInfo.count === 1) {
            this.$message.success('已复制到剪贴板')
          } else {
            this.$message.success('已复制到剪贴板 (Excel格式)')
          }
        } else {
          // 降级方案
          this.copyTextFallback(copyText)
          if (selectionInfo.type === 'cell' && selectionInfo.count === 1) {
            this.$message.success('已复制到剪贴板')
          } else {
            this.$message.success('已复制到剪贴板 (Excel格式)')
          }
        }
      } catch (error) {
        this.$message.error('复制失败，请重试')
      }
    },

    /**
     * 显示复制格式选择菜单
     * 在鼠标位置显示格式选项
     */
    showCopyFormatMenu (selectionInfo) {
      // 保存待复制数据
      this.pendingCopyData = selectionInfo

      // 设置菜单位置
      const position = {
        x: this.lastMousePosition.x,
        y: this.lastMousePosition.y
      }

      // 显示菜单
      this.showCopyMenu(position)
      this.copyMenuVisible = true
    },

    /**
     * 获取单元格的值
     * 支持formatter和原始值
     */
    getCellValue (row, column) {
      if (!row || !column) return ''

      const rawValue = row[column.property]

      // 如果有formatter，使用formatter处理
      if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(row, column, rawValue) || ''
      }

      // 返回原始值
      return rawValue == null ? '' : String(rawValue)
    },

    /**
     * 获取表格列排序配置
     * 使用 store.states._columns 获取Vue模板中定义的原始列配置
     * 这样reset操作可以恢复到模板的初始状态
     * @returns {Array} 列配置数组，符合后端要求的JSON格式
     */
    getTableColumnSort () {
      const columns = []
      let sortIndex = 0

      // 获取表格实例
      const { componentInstance: $table } = this.$vnode
      if (!$table || !$table.$refs || !$table.$refs.hiddenColumns) {
        console.warn('ExTable: 无法获取表格实例或hiddenColumns')
        return columns
      }

      // 使用$table.$refs.hiddenColumns.children获取Vue模板中定义的真实DOM顺序
      // 这是Element UI在table-column.js中用来确定列初始顺序的方法
      const hiddenColumns = $table.$refs.hiddenColumns
      const columnElements = Array.from(hiddenColumns.children)

      // 从DOM元素获取对应的列配置信息
      columnElements.forEach((columnEl, domIndex) => {
        // 获取每个DOM元素对应的Vue组件实例
        const columnComponent = columnEl.__vue__
        if (!columnComponent) {
          return
        }

        // 跳过系统列
        if (columnComponent.type === 'selection' || columnComponent.type === 'index' || columnComponent.type === 'expand') {
          return
        }

        const columnKey = columnComponent.prop || columnComponent.property
        if (!columnKey) {
          return
        }

        // 检查是否是分组列（有子列元素）
        const hasChildren = columnEl.children && columnEl.children.length > 0
        if (hasChildren) {
          const groupColumn = {
            is_group: 1,
            label: columnComponent.label || '',
            name: columnKey,
            sort: sortIndex++,
            groupChildren: []
          }

          // 处理分组的子列（按DOM顺序）
          let childSortIndex = 0
          Array.from(columnEl.children).forEach(childEl => {
            const childComponent = childEl.__vue__
            if (!childComponent) {
              return
            }

            // 跳过系统列
            if (childComponent.type === 'selection' || childComponent.type === 'index' || childComponent.type === 'expand') {
              return
            }

            const childKey = childComponent.prop || childComponent.property
            if (childKey) {
              groupColumn.groupChildren.push({
                is_group: null,
                label: childComponent.label || '',
                name: childKey,
                sort: childSortIndex++
              })
            }
          })

          // 只有当分组有有效子列时才添加
          if (groupColumn.groupChildren.length > 0) {
            columns.push(groupColumn)
          }
        } else {
          // 普通列（非分组列）
          columns.push({
            is_group: 0,
            label: columnComponent.label || '',
            name: columnKey,
            sort: sortIndex++
          })
        }
      })

      return columns
    },

    /**
     * 清理resize事件监听
     * 组件销毁时清理事件监听器
     */
    cleanupWindowResizeListener () {
      try {
        if (this.boundResizeHandler) {
          window.removeEventListener('resize', this.boundResizeHandler)
          this.boundResizeHandler = null
        }

        if (this.resizeTimer) {
          clearTimeout(this.resizeTimer)
          this.resizeTimer = null
        }
      } catch (error) {
        // 静默处理resize事件清理错误
      }
    },

    /**
     * 初始化复制菜单DOM元素
     * 创建悬浮菜单用于格式选择
     */
    initCopyMenu () {
      // 创建菜单容器
      const menuContainer = document.createElement('div')
      menuContainer.className = 'extable-copy-menu'
      menuContainer.style.cssText = `
        position: fixed;
        z-index: 9999;
        background: #fff;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        padding: 6px 0;
        font-size: 14px;
        color: #606266;
        display: none;
        min-width: 160px;
      `

      // 创建菜单头部
      const menuHeader = document.createElement('div')
      menuHeader.className = 'extable-copy-menu-header'
      menuHeader.innerHTML = '复制选中数据'
      menuHeader.style.cssText = `
        padding: 8px 16px;
        border-bottom: 1px solid #e4e7ed;
        font-size: 13px;
        font-weight: bold;
        text-align: center;
      `
      menuContainer.appendChild(menuHeader)

      // 创建菜单选项（移除HTML和JSON格式）
      const menuItems = [
        { key: 'tsv', label: 'Tab分隔符格式 (Excel)', icon: '📊' },
        { key: 'tsv-header', label: 'Tab分隔符格式 (Excel)含表头', icon: '📈' },
        { key: 'tsv-fullrow-header', label: 'Tab分隔符格式 (Excel)整行复制含表头', icon: '📋' },
        { key: 'csv', label: 'CSV格式', icon: '📄' },
        { key: 'text', label: '纯文本格式', icon: '📝' }
      ]

      menuItems.forEach(item => {
        const menuItem = document.createElement('div')
        menuItem.className = 'extable-copy-menu-item'
        menuItem.dataset.copyFormat = item.key
        menuItem.innerHTML = `<span class="icon">${item.icon}</span><span class="label">${item.label}</span>`
        menuItem.style.cssText = `
          padding: 8px 16px;
          cursor: pointer;
          transition: background-color 0.3s;
          display: flex;
          align-items: center;
        `

        // 添加悬停效果
        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.backgroundColor = '#f5f7fa'
        })
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.backgroundColor = 'transparent'
        })

        // 添加点击事件
        menuItem.addEventListener('click', (e) => {
          e.stopPropagation()
          this.handleCopyFormatSelect(item.key)
        })

        menuContainer.appendChild(menuItem)
      })

      // 添加到页面
      document.body.appendChild(menuContainer)
      this.copyMenuElement = menuContainer

      // 添加全局点击事件，点击外部关闭菜单
      this.handleGlobalClick = (e) => {
        if (!menuContainer.contains(e.target)) {
          this.hideCopyMenu()
        }
      }

      document.addEventListener('click', this.handleGlobalClick)
    },

    /**
     * 显示复制菜单
     */
    showCopyMenu (position) {
      if (!this.copyMenuElement) return

      // 设置菜单位置
      this.copyMenuElement.style.left = position.x + 'px'
      this.copyMenuElement.style.top = position.y + 'px'
      this.copyMenuElement.style.display = 'block'

      // 确保菜单不会超出视窗
      this.$nextTick(() => {
        const rect = this.copyMenuElement.getBoundingClientRect()
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        if (rect.right > windowWidth) {
          this.copyMenuElement.style.left = (windowWidth - rect.width - 10) + 'px'
        }
        if (rect.bottom > windowHeight) {
          this.copyMenuElement.style.top = (windowHeight - rect.height - 10) + 'px'
        }
      })
    },

    /**
     * 隐藏复制菜单
     */
    hideCopyMenu () {
      if (this.copyMenuElement) {
        this.copyMenuElement.style.display = 'none'
      }
      this.copyMenuVisible = false
    },

    /**
     * 处理复制格式选择
     */
    handleCopyFormatSelect (format) {
      if (!this.pendingCopyData) {
        return
      }

      // 隐藏菜单
      this.hideCopyMenu()

      // 根据格式复制数据
      this.copyDataInFormat(this.pendingCopyData, format)

      // 清除待复制数据
      this.pendingCopyData = null
    },

    /**
     * 根据指定格式复制数据
     */
    copyDataInFormat (selectionInfo, format) {
      try {
        let copyText = ''

        switch (format) {
          case 'tsv':
            copyText = this.formatAsTSV(selectionInfo)
            break
          case 'tsv-header':
            copyText = this.formatAsTSVWithHeader(selectionInfo)
            break
          case 'tsv-fullrow-header':
            copyText = this.formatAsTSVFullRowWithHeader(selectionInfo)
            break
          case 'csv':
            copyText = this.formatAsCSV(selectionInfo)
            break
          case 'html':
            copyText = this.formatAsHTML(selectionInfo)
            break
          case 'json':
            copyText = this.formatAsJSON(selectionInfo)
            break
          case 'text':
            copyText = this.formatAsPlainText(selectionInfo)
            break
          default:
            copyText = this.formatAsTSV(selectionInfo) // 默认TSV格式
        }

        // 格式名称映射
        const formatNames = {
          'tsv': 'Excel格式',
          'tsv-header': 'Excel格式(含表头)',
          'tsv-fullrow-header': 'Excel格式(整行复制含表头)',
          'csv': 'CSV格式',
          'text': '纯文本格式'
        }
        const formatName = formatNames[format] || `${format.toUpperCase()}格式`

        // 使用现代 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(copyText).then(() => {
            // 整行复制格式使用简化消息
            if (format === 'tsv-fullrow-header') {
              this.$message.success(`已复制到剪贴板 (${formatName})`)
            } else {
              this.$message.success(`已复制${selectionInfo.count}个${selectionInfo.type} (${formatName})`)
            }
          }).catch(error => {
            console.warn('复制失败:', error)
            this.$message.error('复制失败，请重试')
          })
        } else {
          // 降级方案 - 使用传统方法
          this.copyTextFallback(copyText)
          // 整行复制格式使用简化消息
          if (format === 'tsv-fullrow-header') {
            this.$message.success(`已复制到剪贴板 (${formatName})`)
          } else {
            this.$message.success(`已复制${selectionInfo.count}个${selectionInfo.type} (${formatName})`)
          }
        }
      } catch (error) {
        this.$message.error('复制失败，请重试')
      }
    },

    /**
     * 传统复制方法 - 降级方案
     */
    copyTextFallback (text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    },

    /**
     * 构建基于选中单元格的表格数据 - 支持合并单元格
     * @param {Array} cells - 选中的单元格数组
     * @param {string} separator - 分隔符
     * @param {Map} mergedCellsMap - 合并单元格映射表
     * @returns {string} 格式化的表格文本
     */
    buildCellBasedTableWithMerged (cells, separator, mergedCellsMap) {
      if (!cells || cells.length === 0) return ''

      // 1. 分析行列范围
      const rowIndices = [...new Set(cells.map(cell => cell.rowIndex))].sort((a, b) => a - b)
      const colIndices = [...new Set(cells.map(cell => cell.cellIndex))].sort((a, b) => a - b)

      //  如果映射表为空，重新分析合并单元格
      if (!mergedCellsMap || mergedCellsMap.size === 0) {
        mergedCellsMap = this.analyzeMergedCells(this.$el)
      }

      //  第一步：分析每一行的列信息，检测明细数据
      const rowDataList = []

      rowIndices.forEach((rowIndex, rIdx) => {
        // 收集该行所有列的信息
        const columnInfoList = colIndices.map((colIndex, cIdx) => {
          const key = `${rowIndex}-${colIndex}`

          if (mergedCellsMap && mergedCellsMap.has(key)) {
            const mergedInfo = mergedCellsMap.get(key)

            // 如果是Element UI合并单元格且包含多个明细数据
            if (mergedInfo.type === 'element-ui' && mergedInfo.divTexts && mergedInfo.divTexts.length > 1) {
              // 过滤掉第一个元素（合并显示的完整文本），只保留实际的明细数据
              const actualDetails = mergedInfo.divTexts.length > 2
                ? mergedInfo.divTexts.slice(1)
                : mergedInfo.divTexts

              return {
                type: 'detail',
                value: actualDetails.join(' | '),
                detailValues: actualDetails
              }
            } else {
              // 单值合并单元格，作为基本信息
              return {
                type: 'basic',
                value: mergedInfo.value,
                detailValues: [mergedInfo.value]
              }
            }
          } else {
            // 从原始选择中查找对应的单元格
            const matchedCell = cells.find(cell =>
              cell.rowIndex === rowIndex && cell.cellIndex === colIndex
            )
            const cellValue = matchedCell ? matchedCell.text : ''

            return {
              type: 'basic',
              value: cellValue,
              detailValues: [cellValue]
            }
          }
        })

        // 找出明细列（包含多个值的列）
        const detailColumns = columnInfoList.filter(info => info.type === 'detail')

        if (detailColumns.length > 0) {
          // 找出最大明细数量
          const maxDetailCount = Math.max(...detailColumns.map(info => info.detailValues.length))

          // 为每个明细行生成数据
          for (let detailIdx = 0; detailIdx < maxDetailCount; detailIdx++) {
            const detailRowData = columnInfoList.map((columnInfo, colIdx) => {
              if (columnInfo.type === 'detail') {
                // 明细列：使用对应索引的明细值，如果不够就用空字符串
                return columnInfo.detailValues[detailIdx] || ''
              } else {
                // 基本信息列：在每个明细行中重复显示
                return columnInfo.value
              }
            })

            rowDataList.push(detailRowData)
          }
        } else {
          // 没有明细数据，使用传统单行模式
          const rowData = columnInfoList.map(info => info.value)
          rowDataList.push(rowData)
        }
      })

      // 3. 构建最终输出
      const result = rowDataList.map(row => row.join(separator)).join('\n')
      return result
    },

    /**
     * 构建基于选中单元格的表格数据 - 兼容接口
     * @param {Array} cells - 选中的单元格数组
     * @param {string} separator - 分隔符
     * @returns {string} 格式化的表格文本
     */
    buildCellBasedTable (cells, separator) {
      //  获取合并单元格信息
      const mergedCellsMap = this.analyzeMergedCells(this.$el)
      return this.buildCellBasedTableWithMerged(cells, separator, mergedCellsMap)
    },

    /**
     * 构建基于选中单元格的表格数据（含表头）
     * @param {Object} selectionInfo - 选择信息
     * @param {string} separator - 分隔符
     * @returns {string} 格式化的表格文本（含表头）
     */
    buildCellBasedTableWithHeader (selectionInfo, separator) {
      if (!selectionInfo.cells || selectionInfo.cells.length === 0) return ''

      const cells = selectionInfo.cells

      // 1. 分析列范围，确定需要哪些列的表头
      const colIndices = [...new Set(cells.map(cell => cell.cellIndex))].sort((a, b) => a - b)

      // 2. 构建表头
      const headers = []
      colIndices.forEach(colIndex => {
        // 从列配置中获取表头标签
        const column = selectionInfo.columns && selectionInfo.columns[colIndex]
        const headerText = column ? (column.label || column.property || '') : ''
        headers.push(headerText)
      })

      // 3. 构建数据部分（重用现有逻辑）
      const dataContent = this.buildCellBasedTable(cells, separator)

      // 4. 合并表头和数据
      const lines = [headers.join(separator)]
      if (dataContent) {
        lines.push(dataContent)
      }

      return lines.join('\n')
    },

    /**
     * 构建基于选中单元格的表格数据（含表头）- 支持合并单元格
     * @param {Object} selectionInfo - 选择信息
     * @param {string} separator - 分隔符
     * @returns {string} 格式化的表格文本（含表头）
     */
    buildCellBasedTableWithHeaderAndMerged (selectionInfo, separator) {
      if (!selectionInfo.cells || selectionInfo.cells.length === 0) return ''

      const cells = selectionInfo.cells

      // 1. 分析列范围，确定需要哪些列的表头
      const colIndices = [...new Set(cells.map(cell => cell.cellIndex))].sort((a, b) => a - b)

      // 2. 构建表头
      const headers = []
      colIndices.forEach(colIndex => {
        // 从列配置中获取表头标签
        const column = selectionInfo.columns && selectionInfo.columns[colIndex]
        const headerText = column ? (column.label || column.property || '') : ''
        headers.push(headerText)
      })

      // 3.  构建数据部分（使用支持合并单元格的方法）
      const dataContent = this.buildCellBasedTableWithMerged(
        cells,
        separator,
        selectionInfo.mergedCellsMap
      )

      // 4. 合并表头和数据
      const lines = [headers.join(separator)]
      if (dataContent) {
        lines.push(dataContent)
      }

      return lines.join('\n')
    },

    /**
     * 格式化为TSV (Tab分隔符) - Excel兼容
     * 支持基于选中单元格的精确复制
     */
    formatAsTSV (selectionInfo) {
      // 如果是单元格选择，使用改进后的合并单元格支持
      if (selectionInfo.type === 'cell' && selectionInfo.cells && selectionInfo.cells.length > 0) {
        //  使用包含合并单元格信息的方法
        return this.buildCellBasedTableWithMerged(
          selectionInfo.cells,
          '\t',
          selectionInfo.mergedCellsMap
        )
      }

      // 否则使用原有的整行复制逻辑（向后兼容）
      const lines = []

      //  获取合并单元格映射表以支持Element UI合并单元格
      const mergedCellsMap = this.analyzeMergedCells(this.$el)

      //  显示映射表中的一些key样例
      // if (mergedCellsMap && mergedCellsMap.size > 0) {
      //   // 保留：用于调试合并单元格映射表的代码块
      // }

      // 添加表头
      if (selectionInfo.columns && selectionInfo.columns.length > 0) {
        lines.push(selectionInfo.columns.map(col => col.label || col.property || '').join('\t'))
      }

      //  添加数据行 - 支持明细数据展开
      if (selectionInfo.rows && selectionInfo.rows.length > 0) {
        selectionInfo.rows.forEach((row, rowIdx) => {
          // 收集该行所有列的信息，区分基本信息和明细信息
          const columnInfoList = selectionInfo.columns.map((column, colIdx) => {
            // 尝试从合并单元格映射表获取实际显示的内容
            const key = `${rowIdx}-${colIdx}`

            if (mergedCellsMap && mergedCellsMap.has(key)) {
              const mergedInfo = mergedCellsMap.get(key)

              // 如果是Element UI合并单元格且包含多个明细数据
              if (mergedInfo.type === 'element-ui' && mergedInfo.divTexts && mergedInfo.divTexts.length > 1) {
                // 过滤掉第一个元素（合并显示的完整文本），只保留实际的明细数据
                const actualDetails = mergedInfo.divTexts.length > 2
                  ? mergedInfo.divTexts.slice(1)
                  : mergedInfo.divTexts

                return {
                  type: 'detail',
                  value: actualDetails.join(' | '),
                  detailValues: actualDetails
                }
              } else {
                // 单值合并单元格，作为基本信息
                return {
                  type: 'basic',
                  value: mergedInfo.value,
                  detailValues: [mergedInfo.value]
                }
              }
            } else {
              // 使用原有的getCellValue方法
              const value = this.getCellValue(row, column)
              return {
                type: 'basic',
                value: value,
                detailValues: [value]
              }
            }
          })

          // 找出明细列（包含多个值的列）
          const detailColumns = columnInfoList.filter(info => info.type === 'detail')

          if (detailColumns.length > 0) {
            // 找出最大明细数量
            const maxDetailCount = Math.max(...detailColumns.map(info => info.detailValues.length))

            // 为每个明细行生成数据
            for (let detailIdx = 0; detailIdx < maxDetailCount; detailIdx++) {
              const detailRowData = columnInfoList.map((columnInfo, colIdx) => {
                if (columnInfo.type === 'detail') {
                  // 明细列：使用对应索引的明细值，如果不够就用空字符串
                  return columnInfo.detailValues[detailIdx] || ''
                } else {
                  // 基本信息列：在每个明细行中重复显示
                  return columnInfo.value
                }
              })

              lines.push(detailRowData.join('\t'))
            }
          } else {
            // 没有明细数据，使用传统单行模式
            const rowData = columnInfoList.map(info => info.value)
            lines.push(rowData.join('\t'))
          }
        })
      }

      return lines.join('\n')
    },

    /**
     * 格式化为TSV (Tab分隔符) - Excel兼容 含表头
     * 单元格选择时也包含表头
     */
    formatAsTSVWithHeader (selectionInfo) {
      if (selectionInfo.type === 'cell' && selectionInfo.cells && selectionInfo.cells.length > 0) {
        //  单元格选择时，使用支持合并单元格的表头构建
        return this.buildCellBasedTableWithHeaderAndMerged(selectionInfo, '\t')
      }

      // 整行选择时，使用原有逻辑（已包含表头）
      return this.formatAsTSV(selectionInfo)
    },

    /**
     * 格式化为TSV (Tab分隔符) - Excel兼容 整行复制含表头
     * 始终使用整行复制模式并包含表头，包含行号列
     */
    formatAsTSVFullRowWithHeader (selectionInfo) {
      // 强制使用整行模式，忽略单元格选择
      const lines = []

      // 获取包含行号列的完整列配置
      const allColumns = this.getAllVisibleColumnsWithIndex()

      // 添加表头（包含行号列）
      if (allColumns && allColumns.length > 0) {
        const headers = allColumns.map(col => {
          // 处理行号列的表头
          if (col.type === 'index') {
            return col.label || 'No' // 行号列默认标题
          }
          return col.label || col.property || ''
        })
        lines.push(headers.join('\t'))
      }

      // 添加数据行（包含行号列）

      //  获取合并单元格映射表以支持Element UI合并单元格
      const mergedCellsMap = this.analyzeMergedCells(this.$el)

      if (selectionInfo.rows && selectionInfo.rows.length > 0) {
        selectionInfo.rows.forEach((row, rowIdx) => {
          // 收集该行所有列的信息，区分基本信息和明细信息
          const columnInfoList = allColumns.map((column, colIdx) => {
            // 处理行号列的值
            if (column.type === 'index') {
              const actualIndex = this.getActualRowIndex(row, rowIdx)
              return {
                type: 'basic',
                value: actualIndex.toString(),
                detailValues: [actualIndex.toString()]
              }
            }

            // 尝试从合并单元格映射表获取实际显示的内容
            const key = `${rowIdx}-${colIdx}`

            if (mergedCellsMap && mergedCellsMap.has(key)) {
              const mergedInfo = mergedCellsMap.get(key)

              // 如果是Element UI合并单元格且包含多个明细数据
              if (mergedInfo.type === 'element-ui' && mergedInfo.divTexts && mergedInfo.divTexts.length > 1) {
                // 过滤掉第一个元素（合并显示的完整文本），只保留实际的明细数据
                const actualDetails = mergedInfo.divTexts.length > 2
                  ? mergedInfo.divTexts.slice(1)
                  : mergedInfo.divTexts

                return {
                  type: 'detail',
                  value: actualDetails.join(' | '), // 用于显示的合并值
                  detailValues: actualDetails // 实际明细值数组
                }
              } else {
                // 单值合并单元格，作为基本信息处理
                return {
                  type: 'basic',
                  value: mergedInfo.value,
                  detailValues: [mergedInfo.value]
                }
              }
            } else {
              // 使用原有的getCellValue方法
              const value = this.getCellValue(row, column)
              return {
                type: 'basic',
                value: value,
                detailValues: [value]
              }
            }
          })

          //  第二步：确定需要展开的行数（最大明细数量）
          const detailColumns = columnInfoList.filter(info => info.type === 'detail')
          const maxDetailCount = detailColumns.length > 0
            ? Math.max(...detailColumns.map(info => info.detailValues.length))
            : 1

          //  第三步：生成多行输出
          for (let detailIdx = 0; detailIdx < maxDetailCount; detailIdx++) {
            const outputRowData = columnInfoList.map(columnInfo => {
              if (columnInfo.type === 'basic') {
                // 基本信息在所有展开行中保持相同
                return columnInfo.value
              } else {
                // 明细信息按索引分配，如果索引超出范围则返回空值
                return columnInfo.detailValues[detailIdx] || ''
              }
            })

            lines.push(outputRowData.join('\t'))
          }
        })
      }

      return lines.join('\n')
    },

    /**
     * 获取行的实际索引（用于行号列）
     * @param {Object} row - 行数据
     * @param {number} fallbackIndex - 备用索引
     * @returns {number} 实际行号（从1开始）
     */
    getActualRowIndex (row, fallbackIndex) {
      try {
        // 尝试从表格数据中找到行的真实位置
        if (this.data && Array.isArray(this.data)) {
          const actualIndex = this.data.findIndex(dataRow => dataRow === row)
          if (actualIndex !== -1) {
            return actualIndex + 1 // 行号从1开始
          }
        }

        // 如果找不到，尝试从store状态中查找
        if (this.store && this.store.states && this.store.states.data) {
          const actualIndex = this.store.states.data.findIndex(dataRow => dataRow === row)
          if (actualIndex !== -1) {
            return actualIndex + 1 // 行号从1开始
          }
        }

        // 回退方案：使用传入的索引
        return fallbackIndex + 1
      } catch (error) {
        // 出错时使用备用索引
        return fallbackIndex + 1
      }
    },

    /**
     * 构建基于选中单元格的CSV表格数据
     */
    buildCellBasedCSV (cells) {
      if (!cells || cells.length === 0) return ''

      // CSV转义函数
      const csvEscape = (value) => {
        const str = String(value || '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"'
        }
        return str
      }

      // 分析行列范围
      const rowIndices = [...new Set(cells.map(cell => cell.rowIndex))].sort((a, b) => a - b)
      const colIndices = [...new Set(cells.map(cell => cell.cellIndex))].sort((a, b) => a - b)

      // 创建单元格映射表
      const cellMap = new Map()
      cells.forEach(cell => {
        const key = `${cell.rowIndex}-${cell.cellIndex}`
        cellMap.set(key, csvEscape(cell.text || ''))
      })

      // 构建表格
      const lines = []
      rowIndices.forEach(rowIndex => {
        const rowData = []
        colIndices.forEach(colIndex => {
          const key = `${rowIndex}-${colIndex}`
          const cellValue = cellMap.get(key) || ''
          rowData.push(cellValue)
        })
        lines.push(rowData.join(','))
      })

      return lines.join('\n')
    },

    /**
     * 构建基于单元格的CSV表格 - 支持合并单元格
     * @param {Array} cells - 选中的单元格数组
     * @param {Map} mergedCellsMap - 合并单元格映射表
     * @returns {String} CSV格式的字符串
     */
    buildCellBasedCSVWithMerged (cells, mergedCellsMap) {
      if (!cells || cells.length === 0) return ''

      // CSV转义函数
      const csvEscape = (value) => {
        const str = String(value || '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"'
        }
        return str
      }

      // 1. 分析行列范围
      const rowIndices = [...new Set(cells.map(cell => cell.rowIndex))].sort((a, b) => a - b)
      const colIndices = [...new Set(cells.map(cell => cell.cellIndex))].sort((a, b) => a - b)

      //  如果映射表为空，重新分析合并单元格
      if (!mergedCellsMap || mergedCellsMap.size === 0) {
        mergedCellsMap = this.analyzeMergedCells(this.$el)
      }

      //  第一步：分析每一行的列信息，检测明细数据
      const rowDataList = []

      rowIndices.forEach((rowIndex, rIdx) => {
        // 收集该行所有列的信息
        const columnInfoList = colIndices.map((colIndex, cIdx) => {
          const key = `${rowIndex}-${colIndex}`

          if (mergedCellsMap && mergedCellsMap.has(key)) {
            const mergedInfo = mergedCellsMap.get(key)

            // 如果是Element UI合并单元格且包含多个明细数据
            if (mergedInfo.type === 'element-ui' && mergedInfo.divTexts && mergedInfo.divTexts.length > 1) {
              // 过滤掉第一个元素（合并显示的完整文本），只保留实际的明细数据
              const actualDetails = mergedInfo.divTexts.length > 2
                ? mergedInfo.divTexts.slice(1)
                : mergedInfo.divTexts

              return {
                type: 'detail',
                value: actualDetails.join(' | '),
                detailValues: actualDetails
              }
            } else {
              // 单值合并单元格，作为基本信息
              return {
                type: 'basic',
                value: mergedInfo.value,
                detailValues: [mergedInfo.value]
              }
            }
          } else {
            // 从原始选择中查找对应的单元格
            const matchedCell = cells.find(cell =>
              cell.rowIndex === rowIndex && cell.cellIndex === colIndex
            )
            const cellValue = matchedCell ? matchedCell.text : ''

            return {
              type: 'basic',
              value: cellValue,
              detailValues: [cellValue]
            }
          }
        })

        // 找出明细列（包含多个值的列）
        const detailColumns = columnInfoList.filter(info => info.type === 'detail')

        if (detailColumns.length > 0) {
          // 找出最大明细数量
          const maxDetailCount = Math.max(...detailColumns.map(info => info.detailValues.length))

          // 为每个明细行生成数据
          for (let detailIdx = 0; detailIdx < maxDetailCount; detailIdx++) {
            const detailRowData = columnInfoList.map((columnInfo, colIdx) => {
              let value
              if (columnInfo.type === 'detail') {
                // 明细列：使用对应索引的明细值，如果不够就用空字符串
                value = columnInfo.detailValues[detailIdx] || ''
              } else {
                // 基本信息列：在每个明细行中重复显示
                value = columnInfo.value
              }
              return csvEscape(value)
            })

            rowDataList.push(detailRowData)
          }
        } else {
          // 没有明细数据，使用传统单行模式
          const rowData = columnInfoList.map(info => csvEscape(info.value))
          rowDataList.push(rowData)
        }
      })

      // 3. 构建最终输出
      const result = rowDataList.map(row => row.join(',')).join('\n')
      return result
    },

    /**
     * 格式化为CSV
     * 支持基于选中单元格的精确复制
     */
    formatAsCSV (selectionInfo) {
      // 如果是单元格选择，使用基于单元格的复制
      if (selectionInfo.type === 'cell' && selectionInfo.cells && selectionInfo.cells.length > 0) {
        // 检测合并单元格
        const mergedCellsMap = this.analyzeMergedCells(this.$el)
        return this.buildCellBasedCSVWithMerged(selectionInfo.cells, mergedCellsMap)
      }

      // 否则使用原有的整行复制逻辑（向后兼容）
      const lines = []

      //  获取合并单元格映射表以支持Element UI合并单元格
      const mergedCellsMap = this.analyzeMergedCells(this.$el)

      // CSV转义函数
      const csvEscape = (value) => {
        const str = String(value || '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"'
        }
        return str
      }

      // 添加表头
      if (selectionInfo.columns && selectionInfo.columns.length > 0) {
        lines.push(selectionInfo.columns.map(col => csvEscape(col.label || col.property || '')).join(','))
      }

      //  添加数据行 - 支持明细数据展开
      if (selectionInfo.rows && selectionInfo.rows.length > 0) {
        selectionInfo.rows.forEach((row, rowIdx) => {
          // 收集该行所有列的信息，区分基本信息和明细信息
          const columnInfoList = selectionInfo.columns.map((column, colIdx) => {
            // 尝试从合并单元格映射表获取实际显示的内容
            const key = `${rowIdx}-${colIdx}`

            if (mergedCellsMap && mergedCellsMap.has(key)) {
              const mergedInfo = mergedCellsMap.get(key)

              // 如果是Element UI合并单元格且包含多个明细数据
              if (mergedInfo.type === 'element-ui' && mergedInfo.divTexts && mergedInfo.divTexts.length > 1) {
                // 过滤掉第一个元素（合并显示的完整文本），只保留实际的明细数据
                const actualDetails = mergedInfo.divTexts.length > 2
                  ? mergedInfo.divTexts.slice(1)
                  : mergedInfo.divTexts

                return {
                  type: 'detail',
                  value: actualDetails.join(' | '),
                  detailValues: actualDetails
                }
              } else {
                // 单值合并单元格，作为基本信息
                return {
                  type: 'basic',
                  value: mergedInfo.value,
                  detailValues: [mergedInfo.value]
                }
              }
            } else {
              // 使用原有的getCellValue方法
              const value = this.getCellValue(row, column)
              return {
                type: 'basic',
                value: value,
                detailValues: [value]
              }
            }
          })

          // 找出明细列（包含多个值的列）
          const detailColumns = columnInfoList.filter(info => info.type === 'detail')

          if (detailColumns.length > 0) {
            // 找出最大明细数量
            const maxDetailCount = Math.max(...detailColumns.map(info => info.detailValues.length))

            // 为每个明细行生成数据
            for (let detailIdx = 0; detailIdx < maxDetailCount; detailIdx++) {
              const detailRowData = columnInfoList.map((columnInfo, colIdx) => {
                let value
                if (columnInfo.type === 'detail') {
                  // 明细列：使用对应索引的明细值，如果不够就用空字符串
                  value = columnInfo.detailValues[detailIdx] || ''
                } else {
                  // 基本信息列：在每个明细行中重复显示
                  value = columnInfo.value
                }
                return csvEscape(value)
              })

              lines.push(detailRowData.join(','))
            }
          } else {
            // 没有明细数据，使用传统单行模式
            const rowData = columnInfoList.map(info => csvEscape(info.value))
            lines.push(rowData.join(','))
          }
        })
      }

      return lines.join('\n')
    },

    /**
     * 格式化为HTML表格
     */
    formatAsHTML (selectionInfo) {
      let html = '<table border="1" style="border-collapse: collapse;">\n'

      // 添加表头
      if (selectionInfo.columns && selectionInfo.columns.length > 0) {
        html += '  <thead>\n    <tr>\n'
        selectionInfo.columns.forEach(column => {
          const label = column.label || column.property || ''
          html += `      <th>${this.htmlEscape(label)}</th>\n`
        })
        html += '    </tr>\n  </thead>\n'
      }

      // 添加数据行
      html += '  <tbody>\n'
      selectionInfo.rows.forEach(row => {
        html += '    <tr>\n'
        selectionInfo.columns.forEach(column => {
          const value = this.getCellValue(row, column)
          html += `      <td>${this.htmlEscape(value)}</td>\n`
        })
        html += '    </tr>\n'
      })
      html += '  </tbody>\n</table>'

      return html
    },

    /**
     * 格式化为JSON
     */
    formatAsJSON (selectionInfo) {
      const data = selectionInfo.rows.map(row => {
        const rowObj = {}
        selectionInfo.columns.forEach(column => {
          const key = column.label || column.property || 'field'
          rowObj[key] = this.getCellValue(row, column)
        })
        return rowObj
      })

      return JSON.stringify(data, null, 2)
    },

    /**
     * 格式化为纯文本
     * 支持基于选中单元格的精确复制
     */
    formatAsPlainText (selectionInfo) {
      // 如果是单元格选择，使用基于单元格的复制
      if (selectionInfo.type === 'cell' && selectionInfo.cells && selectionInfo.cells.length > 0) {
        // 检测合并单元格
        const mergedCellsMap = this.analyzeMergedCells(this.$el)
        return this.buildCellBasedTableWithMerged(selectionInfo.cells, ' | ', mergedCellsMap)
      }

      // 否则使用原有的整行复制逻辑（向后兼容）
      const lines = []

      //  获取合并单元格映射表以支持Element UI合并单元格
      const mergedCellsMap = this.analyzeMergedCells(this.$el)

      if (selectionInfo.rows && selectionInfo.rows.length > 0) {
        selectionInfo.rows.forEach((row, rowIdx) => {
          // 收集该行所有列的信息，区分基本信息和明细信息
          const columnInfoList = selectionInfo.columns.map((column, colIdx) => {
            // 尝试从合并单元格映射表获取实际显示的内容
            const key = `${rowIdx}-${colIdx}`

            if (mergedCellsMap && mergedCellsMap.has(key)) {
              const mergedInfo = mergedCellsMap.get(key)

              // 如果是Element UI合并单元格且包含多个明细数据
              if (mergedInfo.type === 'element-ui' && mergedInfo.divTexts && mergedInfo.divTexts.length > 1) {
                // 过滤掉第一个元素（合并显示的完整文本），只保留实际的明细数据
                const actualDetails = mergedInfo.divTexts.length > 2
                  ? mergedInfo.divTexts.slice(1)
                  : mergedInfo.divTexts

                return {
                  type: 'detail',
                  value: actualDetails.join(' | '),
                  detailValues: actualDetails
                }
              } else {
                // 单值合并单元格，作为基本信息
                return {
                  type: 'basic',
                  value: mergedInfo.value,
                  detailValues: [mergedInfo.value]
                }
              }
            } else {
              // 使用原有的getCellValue方法
              const value = this.getCellValue(row, column)
              return {
                type: 'basic',
                value: value,
                detailValues: [value]
              }
            }
          })

          // 找出明细列（包含多个值的列）
          const detailColumns = columnInfoList.filter(info => info.type === 'detail')

          if (detailColumns.length > 0) {
            // 找出最大明细数量
            const maxDetailCount = Math.max(...detailColumns.map(info => info.detailValues.length))

            // 为每个明细行生成数据
            for (let detailIdx = 0; detailIdx < maxDetailCount; detailIdx++) {
              const detailRowData = columnInfoList.map((columnInfo, colIdx) => {
                if (columnInfo.type === 'detail') {
                  // 明细列：使用对应索引的明细值，如果不够就用空字符串
                  return columnInfo.detailValues[detailIdx] || ''
                } else {
                  // 基本信息列：在每个明细行中重复显示
                  return columnInfo.value
                }
              })

              lines.push(detailRowData.join(' | '))
            }
          } else {
            // 没有明细数据，使用传统单行模式
            const rowData = columnInfoList.map(info => info.value)
            lines.push(rowData.join(' | '))
          }
        })
      }

      return lines.join('\n')
    },

    /**
     * HTML转义
     */
    htmlEscape (str) {
      const div = document.createElement('div')
      div.textContent = str
      return div.innerHTML
    },

    /**
     * 清理复制菜单资源
     */
    cleanupCopyMenu () {
      if (this.copyMenuElement) {
        document.body.removeChild(this.copyMenuElement)
        this.copyMenuElement = null
      }

      if (this.handleGlobalClick) {
        document.removeEventListener('click', this.handleGlobalClick)
        this.handleGlobalClick = null
      }
    },

    /**
     * 清理原生文本选择系统
     */
    cleanupNativeTextSelection () {
      // 清除选择状态
      this.currentSelection = null
      this.selectionInTable = false
      this.selectionAnalysis = null

      // 隐藏提示
      this.hideSelectionHint()

      // 移除选择变化事件监听
      if (this.selectionChangeHandler) {
        document.removeEventListener('selectionchange', this.selectionChangeHandler)
        this.selectionChangeHandler = null
      }

      // 移除键盘事件监听
      if (this.keydownHandler) {
        document.removeEventListener('keydown', this.keydownHandler, true)
        this.keydownHandler = null
      }

      // 移除右键菜单事件监听
      if (this.contextmenuHandler && this.$el) {
        this.$el.removeEventListener('contextmenu', this.contextmenuHandler)
        this.contextmenuHandler = null
      }

      // 移除复制事件监听
      if (this.copyEventHandler) {
        document.removeEventListener('copy', this.copyEventHandler, true)
        this.copyEventHandler = null
      }
    }

  },

  destroyed () {
    // 清理事件监听
    EventBus.$off(this.EMITS.EMIT_TABLE_COLUMNS_CONFIG_UPDATED, this.handleConfigUpdate)
    EventBus.$off('TABLE_COLUMNS_GET_CONFIG', this.handleGetColumnConfig)

    // 清理窗口resize监听器
    if (this.canvasAutoHeightEnabled) {
      this.cleanupWindowResizeListener()
    }

    // 清理智能复制系统
    this.cleanupCopyMenu()
    this.cleanupNativeTextSelection()
  }
}

