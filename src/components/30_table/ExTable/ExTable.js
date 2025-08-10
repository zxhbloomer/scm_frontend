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
    }
  },
  data () {
    return {
      configLoading: true, // 配置加载中状态
      configLoaded: false, // 配置加载完成状态
      tableKey: 0, // 用于强制重新渲染表格
      originalColumns: null, // 🔑 保存原始完整的列定义
      columnsBeforeAnimation: null // 🎬 动画用：记录列变化前的位置
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

    // 检查是否需要应用列配置
    if ($table.$attrs.columns_index_key === 'true' && page_code && page_code !== 'ElMain') {
      // 设置列属性，顺序、隐藏正式使用，读取数据库配置文件
      this.getTableConfig()
    } else {
      this.configLoading = false
      this.$el.style.opacity = '1'
    }

    $table.doLayout()

    // 🎯 表头自适应：初始化时触发表头宽度计算（解决FieldHelp组件换行）
    this.$nextTick(() => {
      this.triggerHeaderAutoResize()
    })

    // 🎯 第3步：添加数据变化深度监听，主动触发自适应
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
    })
  },
  computed: {
    // table数据
    values () {
      const data = this.data
      return data
    }
  },
  watch: {
    values: {
      handler (newVal, oldVal) {
        if (isNotEmpty(this.data)) {
          this.$nextTick(() => {
            // 🎯 第2步：先执行自定义的内容自适应
            this.autoResizeOrMergeCell()

            // 🎯 再调用继承的Element UI布局更新
            this.doLayout() // 继承自 Table，触发Element UI原生布局计算
          })
        }
      }
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
          console.error('ExTable: 无法获取表格实例')
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
              console.warn('ExTable: 获取列配置数据为空或格式错误')
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
            console.error('ExTable: 应用列配置失败', error)
          }
        }).catch(error => {
          this.configLoading = false // 错误时也要更新状态
          this.$el.style.opacity = '1' // 错误时也要显示表格
          console.error('ExTable: 获取列配置数据失败', error)
        })
      } catch (error) {
        this.configLoading = false
        this.$el.style.opacity = '1' // 错误时也要显示表格
        console.error('ExTable: getTableConfig执行失败', error)
      }
    },

    /**
     * 应用列配置 - 纯Element UI Store API方案
     * @param {Object} $table 表格实例
     * @param {Array} configData 配置数据
     */
    applyColumnConfiguration ($table, configData) {
      try {
        // 🎬 动画：记录变化前的列位置
        this.recordColumnPositionsForAnimation()

        const store = $table.store
        if (!store || !store.states) {
          console.error('ExTable: 无法获取表格store')
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

          // 🎬 动画：布局完成后执行列变化动画
          this.$nextTick(() => {
            this.executeColumnAnimation()

            // 🎯 配置应用完成后，触发表头自适应（重要：解决FieldHelp组件换行）
            this.triggerHeaderAutoResize()
          })
        })
      } catch (error) {
        console.error('ExTable: 应用列配置失败', error)
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

    compare (obj1, obj2) {
      return obj1.sort - obj2.sort
    },

    // 🎬 动画：记录列变化前的位置
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
        console.error('ExTable: 记录列位置失败', error)
      }
    },

    // 🎬 动画：执行列变化动画
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

        let animationCount = 0
        let totalAnimations = 0

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
                totalAnimations++

                if (currentCell.animate) {
                  // Web Animations API - 移动动画
                  currentCell.animate([
                    { transform: `translate(${deltaX}px, ${deltaY}px)`, opacity: '0.85' },
                    { transform: 'translate(0px, 0px)', opacity: '1' }
                  ], {
                    duration: 350,
                    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                  }).onfinish = () => {
                    animationCount++
                    // Animation completed
                  }
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
                      animationCount++
                      if (animationCount === totalAnimations) {
                        console.log('ExTable: 所有列动画执行完成')
                      }
                    }, 350)
                  }, 16)
                }
              }
            } else {
              // 新出现的列（之前隐藏，现在显示），执行淡入动画
              totalAnimations++

              if (currentCell.animate) {
                // Web Animations API - 淡入动画
                currentCell.animate([
                  { opacity: '0', transform: 'scale(0.95)', filter: 'blur(1px)' },
                  { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' }
                ], {
                  duration: 400,
                  easing: 'cubic-bezier(0.2, 0.0, 0.2, 1)'
                }).onfinish = () => {
                  animationCount++
                  // Animation completed
                }
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
                    animationCount++
                    // Animation completed
                  }, 400)
                }, 16)
              }
            }
          })
        })

        // Animation system ready

        // 清理记录
        this.columnsBeforeAnimation = null
      } catch (error) {
        console.error('ExTable: 执行列动画失败', error)
        this.columnsBeforeAnimation = null
      }
    },

    // 🧪 测试：简单动画测试
    testSimpleAnimation () {
      try {
        const tableEl = this.$el
        if (!tableEl) {
          return
        }

        // 表格整体动画
        tableEl.style.transition = 'all 0.3s ease'
        tableEl.style.border = '2px solid #409EFF'

        // 添加列头动画测试
        this.testColumnHeaderAnimation()

        setTimeout(() => {
          tableEl.style.border = ''
          setTimeout(() => {
            tableEl.style.transition = ''
          }, 300)
        }, 300)
      } catch (error) {
        console.error('ExTable: 简单动画测试失败', error)
      }
    },

    // 🧪 测试：列头动画
    testColumnHeaderAnimation () {
      try {
        // 找到所有列头
        const headerCells = this.$el.querySelectorAll('.el-table__header-wrapper th')

        if (headerCells.length === 0) {
          return
        }

        // 给每个列头添加动画
        headerCells.forEach((cell, index) => {
          setTimeout(() => {
            if (cell.animate) {
              // 使用Web Animations API
              cell.animate([
                { backgroundColor: 'transparent', transform: 'translateY(0px)' },
                { backgroundColor: '#E6F7FF', transform: 'translateY(-2px)' },
                { backgroundColor: 'transparent', transform: 'translateY(0px)' }
              ], {
                duration: 400,
                easing: 'ease-out'
              })
            } else {
              // CSS fallback
              cell.style.transition = 'all 0.4s ease-out'
              cell.style.backgroundColor = '#E6F7FF'
              cell.style.transform = 'translateY(-2px)'

              setTimeout(() => {
                cell.style.backgroundColor = ''
                cell.style.transform = ''
                setTimeout(() => {
                  cell.style.transition = ''
                }, 400)
              }, 200)
            }
          }, index * 50) // 依次执行，每个延迟50ms
        })
      } catch (error) {
        console.error('ExTable: 列头动画测试失败', error)
      }
    },

    // 🧪 测试：手动测试列动画效果
    testColumnAnimation () {
      try {
        const headerRows = this.$el.querySelectorAll('.el-table__header-wrapper tr')
        if (headerRows.length === 0) {
          return
        }

        // 模拟记录初始位置
        this.recordColumnPositionsForAnimation()

        // 人为修改一些单元格的记录位置，模拟不同类型的动画
        if (this.columnsBeforeAnimation && this.columnsBeforeAnimation.length > 0) {
          // 1. 模拟列移动动画：修改第一个单元格位置
          this.columnsBeforeAnimation[0].left += 80

          // 2. 模拟新列淡入动画：删除一个记录，让对应列无法找到匹配
          if (this.columnsBeforeAnimation.length > 1) {
            this.columnsBeforeAnimation.splice(1, 1)
          }

          // 3. 如果有多行表头，也测试第二行
          const secondRowCells = this.columnsBeforeAnimation.filter(item => item.rowIndex === 1)
          if (secondRowCells.length > 0) {
            secondRowCells[0].left += 60
          }

          // 执行动画
          this.$nextTick(() => {
            this.executeColumnAnimation()
          })
        }
      } catch (error) {
        console.error('ExTable: 测试列动画失败', error)
      }
    },

    // 🎯 新增：表头自适应触发方法（解决FieldHelp组件换行）
    triggerHeaderAutoResize () {
      try {
        console.log('开始表头自适应计算...')

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
            console.log(`检测到FieldHelp列: ${columnComponent.columnConfig.property}，开始重新计算表头宽度`)

            // 强制重新计算该列的宽度（包含表头）
            const result = columnComponent.updateAutoWidth(columnComponent)

            if (result && !result.nothing && !result.donothing) {
              console.log(`FieldHelp列 ${columnComponent.columnConfig.property} 宽度更新为: ${result.width}px`)
            }
          }
        }

        // 触发表格重新布局
        this.$nextTick(() => {
          this.doLayout()
        })

        console.log('表头自适应计算完成')
      } catch (error) {
        console.error('表头自适应触发失败:', error)
      }
    }
  },

  destroyed () {
    // 清理事件监听
    EventBus.$off(this.EMITS.EMIT_TABLE_COLUMNS_CONFIG_UPDATED, this.handleConfigUpdate)
  }
}
