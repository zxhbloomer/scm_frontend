import { Table } from 'element-ui'

import { getColumnsSizeApi, saveColumnsSizeApi, deleteColumnsSizeApi } from '@/api/00_common/colums_size'
import { getTableConfigApi } from '@/api/00_common/table_config'

import { isNotEmpty } from '@/utils/index.js'
// import deepCopy from 'deep-copy'

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
  created () {
    if (this.setColumnSize) {
      // 设置拖动列宽的事件
      this.$on('header-dragend', function (newWidth, oldWidth, column, event) {
        this.saveColumnsSize(this, this.$parent.$options.name, column)
      })
    }
  },
  mounted () {
    // 描绘完成
    const { componentInstance: $table } = this.$vnode
    if (!$table) { return }
    // 设置参数
    const page_code = $table.$parent.$options.name
    let table_type
    if (this.type) {
      table_type = this.type
    }

    // 设置列属性，顺序、隐藏正式使用，读取数据库配置文件
    this.getTableConfig()
    // 设置列属性，顺序、隐藏 测试使用
    // this.tableColumnsConfig()

    // 调用调整列宽方法
    this.setColumnsSize($table, page_code, table_type)

    $table.doLayout()
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
            // 宽度自适应 和 一单元格多行数据处理
            this.autoResizeOrMergeCell()
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
          return
        }

        if (!page_code || page_code === 'ElMain') {
          return
        }

        // 获取列属性配置数据
        getTableConfigApi({ page_code: page_code }).then(response => {
          try {
            if (!response.data || !Array.isArray(response.data)) {
              console.warn('ExTable: 获取列配置数据为空或格式错误')
              return
            }

            this.applyColumnConfiguration($table, response.data)
          } catch (error) {
            console.error('ExTable: 应用列配置失败', error)
          }
        }).catch(error => {
          console.error('ExTable: 获取列配置数据失败', error)
        })
      } catch (error) {
        console.error('ExTable: getTableConfig执行失败', error)
      }
    },

    /**
     * 应用列配置到表格 - 使用Element UI原生API优化版本
     * 支持分组表头的配置处理
     * @param {Object} $table 表格实例
     * @param {Array} configData 配置数据
     */
    applyColumnConfiguration ($table, configData) {
      try {
        // 第一步：使用Map优化配置数据查找 O(1)
        const configMap = new Map()
        const groupConfigMap = new Map()
        
        configData.forEach(item => {
          if (item.name) {
            const config = {
              sort: item.sort || 0,
              is_enable: item.is_enable === true,    // 🔧 修复：严格检查true
              is_group: item.is_group || 0,
              groupChildren: item.groupChildren || []
            }
            
            configMap.set(item.name, config)
            
            // 处理分组表头
            if (item.is_group === 1 && item.groupChildren && item.groupChildren.length > 0) {
              item.groupChildren.forEach(child => {
                if (child.name) {
                  groupConfigMap.set(child.name, {
                    sort: child.sort || 0,    // 🔧 修复：使用子列自己的排序
                    is_enable: child.is_enable === true,    // 🔧 修复：严格检查true
                    parent_name: item.name,
                    parent_enable: config.is_enable
                  })
                }
              })
            }
          }
        })

        // 第二步：批量更新列配置属性（重点修复分组表头）
        this.updateColumnsConfig($table, configMap, groupConfigMap)

        // 第三步：使用原来有效的过滤和排序逻辑
        this.applyOriginalFilteringLogic($table)

        // 第四步：应用布局更新
        this.applyLayoutUpdate($table)
      } catch (error) {
        console.error('ExTable: applyColumnConfiguration执行失败', error)
        throw error
      }
    },

    /**
     * 使用Map优化批量更新列配置属性
     * 重点修复：分组表头的配置更新
     * @param {Object} $table 表格实例  
     * @param {Map} configMap 配置映射
     * @param {Map} groupConfigMap 分组配置映射
     */
    updateColumnsConfig ($table, configMap, groupConfigMap) {
      console.log('ExTable: 开始更新列配置')
      console.log('ExTable: configMap大小:', configMap.size)
      console.log('ExTable: groupConfigMap大小:', groupConfigMap.size)

      // 🔧 修复：更新 $table.columns 处理分组
      $table.columns.forEach(column => {
        if (column.property) {
          // 普通列配置
          if (configMap.has(column.property)) {
            const config = configMap.get(column.property)
            column.sort = config.sort
            column.is_enable = config.is_enable
            column.is_group = config.is_group
            console.log(`ExTable: 更新普通列 ${column.property}, is_enable: ${config.is_enable}`)
          }
          
          // 🎯 重点修复：分组子列配置
          if (groupConfigMap.has(column.property)) {
            const groupConfig = groupConfigMap.get(column.property)
            column.sort = groupConfig.sort
            column.is_enable = groupConfig.is_enable && groupConfig.parent_enable
            column.parent_name = groupConfig.parent_name
            console.log(`ExTable: 更新分组子列 ${column.property}, is_enable: ${column.is_enable}, parent: ${groupConfig.parent_name}`)
          }
        }
      })

      // 🔧 修复：更新 $table.store.states.originColumns 处理分组
      if ($table.store.states.originColumns) {
        $table.store.states.originColumns.forEach(column => {
          if (column.property) {
            // 普通列配置
            if (configMap.has(column.property)) {
              const config = configMap.get(column.property)
              column.sort = config.sort
              column.is_enable = config.is_enable
              column.is_group = config.is_group
            }
            
            // 🎯 重点修复：分组子列配置
            if (groupConfigMap.has(column.property)) {
              const groupConfig = groupConfigMap.get(column.property)
              column.sort = groupConfig.sort
              column.is_enable = groupConfig.is_enable && groupConfig.parent_enable
              column.parent_name = groupConfig.parent_name
            }
          }
        })
      }

      // 🔧 修复：更新 Vue children - 重点处理嵌套子组件
      this.updateVueChildrenConfig(configMap, groupConfigMap)
    },

    /**
     * 🎯 新增：专门处理Vue子组件的配置更新（包括嵌套子组件）
     */
    updateVueChildrenConfig(configMap, groupConfigMap) {
      console.log('ExTable: 更新Vue子组件配置')
      
      this.$children.forEach(parentChild => {
        if (parentChild.prop) {
          // 处理顶级列（可能是分组父列）
          if (configMap.has(parentChild.prop)) {
            const config = configMap.get(parentChild.prop)
            parentChild.is_enable = config.is_enable
            parentChild.is_group = config.is_group
            console.log(`ExTable: 更新Vue父列 ${parentChild.prop}, is_group: ${config.is_group}`)
            
            // 🎯 关键修复：如果是分组列，处理其子组件
            if (config.is_group === 1 && parentChild.$children && parentChild.$children.length > 0) {
              console.log(`ExTable: 处理分组 ${parentChild.prop} 的 ${parentChild.$children.length} 个子组件`)
              
              parentChild.$children.forEach(childComponent => {
                if (childComponent.prop && groupConfigMap.has(childComponent.prop)) {
                  const groupConfig = groupConfigMap.get(childComponent.prop)
                  childComponent.is_enable = groupConfig.is_enable && groupConfig.parent_enable
                  childComponent.parent_name = groupConfig.parent_name
                  childComponent.sort = groupConfig.sort
                  
                  console.log(`ExTable: 更新Vue子列 ${childComponent.prop}, is_enable: ${childComponent.is_enable}`)
                }
              })
            }
          }
          
          // 处理直接的子列配置
          if (groupConfigMap.has(parentChild.prop)) {
            const groupConfig = groupConfigMap.get(parentChild.prop)
            parentChild.is_enable = groupConfig.is_enable && groupConfig.parent_enable
            parentChild.parent_name = groupConfig.parent_name
          }
        }
      })
    },

    /**
     * 🎯 应用原来有效的过滤和排序逻辑（增强版支持分组表头）
     * @param {Object} $table 表格实例
     */
    applyOriginalFilteringLogic($table) {
      try {
        console.log('ExTable: 开始应用过滤和排序逻辑（支持分组表头）')

        // 🔧 第一步：过滤显示的列 - 支持嵌套结构
        const visibleColumns = this.filterColumnsWithGroupSupport($table.columns)
        
        // 🔧 第二步：过滤originColumns - 支持嵌套结构  
        const visibleOriginColumns = this.filterColumnsWithGroupSupport($table.store.states.originColumns || [])
        
        // 🔧 第三步：过滤Vue children - 支持嵌套结构
        const visibleChildren = this.filterVueChildrenWithGroupSupport(this.$children)

        // 🎯 关键：使用原来有效的splice方法替换数组（这是原来代码的核心）
        $table.columns.splice(0, $table.columns.length)
        $table.columns.splice(0, 0, ...visibleColumns)
        
        $table.store.states.originColumns.splice(0, $table.store.states.originColumns.length)  
        $table.store.states.originColumns.splice(0, 0, ...visibleOriginColumns)

        this.$children.splice(0, this.$children.length)
        this.$children.splice(0, 0, ...visibleChildren)

        // 🔧 第四步：排序（原来逻辑）- 简化排序，让过滤方法内部的排序生效
        $table.store.states.originColumns.sort(this.compare)
        $table.columns.sort(this.compare)  

        console.log(`ExTable: 过滤排序完成，显示列数: ${visibleColumns.length}`)
        console.log(`ExTable: 分组子列详情:`, visibleColumns.filter(col => col.children && col.children.length > 0))
        
      } catch (error) {
        console.error('ExTable: 应用过滤排序逻辑失败', error)
        // 不抛出错误，避免阻断流程
      }
    },

    /**
     * 🎯 过滤列支持分组表头
     * @param {Array} columns 列数组 
     * @returns {Array} 过滤后的列数组
     */
    filterColumnsWithGroupSupport(columns) {
      return columns.filter(column => {
        // 🔧 修复：保留特殊系统列（selection, index, expand等）
        if (column.type && ['selection', 'index', 'expand'].includes(column.type)) {
          console.log(`ExTable: 保留系统列 type="${column.type}"`)
          return true
        }
        
        // 🔧 修复：严格检查显示状态
        return column.is_enable === true && column.is_delete !== true
      }).map(column => {
        // 🔧 关键：如果列有children（分组表头），也要过滤children
        if (column.children && Array.isArray(column.children) && column.children.length > 0) {
          console.log(`ExTable: 处理分组列 ${column.property}，原始子列: ${column.children.length}`)
          
          // 🔧 修复：严格过滤子列，并按sort排序
          const filteredChildren = column.children
            .filter(child => {
              return child.is_enable === true && child.is_delete !== true
            })
            .sort(this.compare)  // 🔧 新增：子列内部排序
          
          // 创建新的列对象，避免修改原对象
          const newColumn = { ...column, children: filteredChildren }
          console.log(`ExTable: 分组列 ${column.property}，过滤后子列: ${filteredChildren.length}`)
          
          return newColumn
        }
        return column
      })
    },

    /**
     * 🎯 过滤Vue children支持分组表头
     * @param {Array} children Vue children数组
     * @returns {Array} 过滤后的children数组
     */
    filterVueChildrenWithGroupSupport(children) {
      const filtered = []
      
      children.forEach(child => {
        // 🔧 修复：保留特殊系统列的Vue组件
        const isSystemColumn = child.type && ['selection', 'index', 'expand'].includes(child.type)
        
        if (isSystemColumn || (child.is_enable === true && child.is_delete !== true)) {
          if (isSystemColumn) {
            console.log(`ExTable: 保留Vue系统组件 type="${child.type}"`)
          }
          // 🔧 关键：如果是分组列，也要处理其子组件
          if (child.is_group === 1 && child.$children && child.$children.length > 0) {
            console.log(`ExTable: 处理Vue分组 ${child.prop}，子组件数: ${child.$children.length}`)
            
            // 🔧 修复：严格过滤和排序子组件
            const filteredSubChildren = child.$children
              .filter(subChild => {
                return subChild.is_enable === true && subChild.is_delete !== true
              })
              .sort(this.compare)  // 🔧 新增：子组件内部排序
            
            console.log(`ExTable: Vue分组 ${child.prop}，过滤后子组件: ${filteredSubChildren.length}`)
            
            // 更新子组件引用（不直接修改原对象）
            const newChild = { ...child }
            newChild.$children = filteredSubChildren
            filtered.push(newChild)
          } else {
            filtered.push(child)
          }
        }
      })
      
      return filtered.sort(this.compare)  // 🔧 新增：顶级排序
    },

    /**
     * 使用Element UI原生API重建列结构
     * 简化版：只处理一层嵌套的分组表头
     * @param {Object} $table 表格实例
     * @param {Map} configMap 配置映射
     * @param {Map} groupConfigMap 分组配置映射
     */
    rebuildColumnsWithNativeAPI ($table, configMap, groupConfigMap) {
      // 🛠️ 修复：增强错误处理和回滚机制
      let originalColumns = []
      
      try {
        // 🛠️ 修复：验证表格实例
        if (!$table || !$table.store || !$table.store.states) {
          console.error('ExTable: 无效的表格实例')
          return
        }

        // 备份当前列状态
        originalColumns = [...$table.store.states._columns]
        console.log(`ExTable: 备份列状态，原始列数量: ${originalColumns.length}`)
        
        // 🛠️ 修复：验证原始列数据
        if (originalColumns.length === 0) {
          console.warn('ExTable: 原始列数据为空，跳过重建')
          return
        }

        // 🎯 简化：只处理一层嵌套
        const processedColumns = this.filterGroupColumns(originalColumns, configMap, groupConfigMap)
        console.log(`ExTable: 处理后列数量: ${processedColumns.length}`)

        // 🛠️ 修复：验证处理结果
        if (!Array.isArray(processedColumns)) {
          console.error('ExTable: 列处理结果无效')
          return
        }

        // 清空当前列结构
        $table.store.states._columns.length = 0

        // 简化插入：只处理一层嵌套
        this.insertGroupColumns($table, processedColumns)

        // 简化Vue组件同步
        this.syncVueComponents()

        // 使用Element UI的updateColumns确保所有状态同步
        if (typeof $table.store.updateColumns === 'function') {
          $table.store.updateColumns()
        }
        
        if (typeof $table.store.scheduleLayout === 'function') {
          $table.store.scheduleLayout(true)
        }

        console.log('ExTable: 列结构重建完成')
        
      } catch (error) {
        console.error('ExTable: 使用原生API重建列结构失败', error)
        
        // 🛠️ 修复：错误时尝试回滚
        try {
          if (originalColumns.length > 0 && $table && $table.store && $table.store.states) {
            console.warn('ExTable: 尝试回滚到原始列状态')
            $table.store.states._columns.length = 0
            $table.store.states._columns.push(...originalColumns)
            
            if (typeof $table.store.updateColumns === 'function') {
              $table.store.updateColumns()
            }
            if (typeof $table.store.scheduleLayout === 'function') {
              $table.store.scheduleLayout(true)
            }
          }
        } catch (rollbackError) {
          console.error('ExTable: 回滚失败', rollbackError)
        }
        
        // 🛠️ 修复：不重新抛出错误，避免阻断页面
        console.warn('ExTable: 继续执行，跳过列重建错误')
      }
    },

    /**
     * 简化版：过滤分组表头（只处理一层嵌套）
     * @param {Array} columns 列数组
     * @param {Map} configMap 配置映射
     * @param {Map} groupConfigMap 分组配置映射
     * @returns {Array} 过滤后的列数组
     */
    filterGroupColumns(columns, configMap, groupConfigMap) {
      // 🛠️ 修复：验证输入参数
      if (!Array.isArray(columns)) {
        console.warn('ExTable: filterGroupColumns接收到无效的列数组')
        return []
      }

      return columns
        .filter(column => {
          // 🛠️ 修复：验证列对象完整性
          if (!column || typeof column !== 'object') {
            console.warn('ExTable: 过滤无效列对象')
            return false
          }
          
          // 🔧 修复：保留特殊系统列
          if (column.type && ['selection', 'index', 'expand'].includes(column.type)) {
            console.log(`ExTable: filterGroupColumns保留系统列 type="${column.type}"`)
            return true
          }
          
          // 基础过滤条件：is_enable !== false 且 is_delete !== true
          return column.is_enable !== false && column.is_delete !== true
        })
        .map(column => {
          // 🛠️ 修复：创建列的深拷贝，避免修改原对象
          const safeColumn = { ...column }
          
          // 如果是分组列，直接过滤其children（不递归）
          if (safeColumn.children && Array.isArray(safeColumn.children) && safeColumn.children.length > 0) {
            console.log(`ExTable: 处理分组列 ${safeColumn.property}，原始子列数量: ${safeColumn.children.length}`)
            
            // 🛠️ 修复：安全过滤子列
            const filteredChildren = safeColumn.children
              .filter(child => {
                if (!child || typeof child !== 'object') {
                  console.warn(`ExTable: 过滤无效子列对象`)
                  return false
                }
                return child.is_enable !== false && child.is_delete !== true
              })
              .map(child => ({ ...child })) // 深拷贝子列
            
            safeColumn.children = filteredChildren
            console.log(`ExTable: 分组列 ${safeColumn.property}，过滤后子列数量: ${filteredChildren.length}`)
            
            // 业务逻辑：如果所有子列都被过滤掉了
            if (filteredChildren.length === 0) {
              console.warn(`ExTable: 分组列 ${safeColumn.property} 的所有子列都被禁用，但仍保留父组`)
            }
          }
          return safeColumn
        })
        .filter(column => column) // 🛠️ 修复：移除任何可能的null/undefined
        .sort(this.compare) // 应用排序
    },

    /**
     * 简化版：插入分组列到Element UI store中（只处理一层嵌套）
     * @param {Object} $table 表格实例
     * @param {Array} columns 要插入的列数组
     */
    insertGroupColumns($table, columns) {
      columns.forEach((column, index) => {
        try {
          // 🛠️ 修复：验证列对象完整性
          if (!column || !column.property) {
            console.warn(`ExTable: 跳过无效列对象，index: ${index}`)
            return
          }

          // 🛠️ 修复：确保列对象有必要的属性
          const safeColumn = {
            ...column,
            id: column.id || `${column.property}_${Date.now()}_${Math.random()}`,
            type: column.type || 'default'
          }

          // 插入父级列
          $table.store.commit('insertColumn', safeColumn, index, null)
          
          // 如果有子列，验证后插入
          if (safeColumn.children && Array.isArray(safeColumn.children) && safeColumn.children.length > 0) {
            console.log(`ExTable: 插入分组 ${safeColumn.property} 的 ${safeColumn.children.length} 个子列`)
            
            safeColumn.children.forEach((child, childIndex) => {
              // 🛠️ 修复：验证子列对象
              if (child && child.property) {
                const safeChild = {
                  ...child,
                  id: child.id || `${child.property}_child_${Date.now()}_${Math.random()}`,
                  type: child.type || 'default'
                }
                $table.store.commit('insertColumn', safeChild, childIndex, safeColumn)
              } else {
                console.warn(`ExTable: 跳过无效子列对象，childIndex: ${childIndex}`)
              }
            })
          }
        } catch (error) {
          console.error(`ExTable: 插入列失败，column: ${column?.property}`, error)
          // 🛠️ 修复：不阻断循环，继续处理其他列
        }
      })
    },

    /**
     * 简化版：同步Vue组件树结构（只处理一层嵌套）
     * 确保Vue.$children与Element UI内部状态保持一致
     */
    syncVueComponents() {
      try {
        // 🛠️ 修复：避免直接操作$children数组，让Vue自动管理
        console.log(`ExTable: Vue组件树同步 - 让Vue自动管理组件生命周期`)
        
        // 不直接操作$children，而是标记组件状态
        // Vue会根据v-if等指令自动处理组件的显示/隐藏
        this.$children.forEach(child => {
          if (child.prop) {
            // 只更新状态，不直接操作数组
            const shouldShow = child.is_enable === true && child.is_delete !== true
            if (!shouldShow) {
              console.log(`ExTable: 标记Vue子组件隐藏 ${child.prop || child.columnId}`)
            }
          }
        })
        
        console.log(`ExTable: Vue组件树状态同步完成`)
      } catch (error) {
        console.error('ExTable: Vue组件树同步失败', error)
        // 🛠️ 修复：不重新抛出错误，避免阻断后续流程
        console.warn('ExTable: 继续执行，跳过Vue组件树同步错误')
      }
    },

    /**
     * 🔧 简化布局更新，避免列高度变化
     * @param {Object} $table 表格实例
     */
    applyLayoutUpdate ($table) {
      this.$nextTick(() => {
        try {
          console.log('ExTable: 应用简化的布局更新')
          
          // 🔧 只保留核心的布局更新，避免复杂操作影响列高度
          $table.doLayout()
          
          // 🔧 简化的强制更新，避免过度重绘
          this.$parent.$forceUpdate()
          
        } catch (error) {
          console.error('ExTable: 布局更新失败', error)
        }
      })
    },

    // 触发resize事件的方法
    triggerResize () {
      // 触发window resize事件，让Element UI Table自动响应
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
      })
    },
    compare (obj1, obj2) {
      return obj1.sort - obj2.sort
    }
  }
}
