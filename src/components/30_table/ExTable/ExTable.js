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
     * 应用列配置 - 纯Element UI Store API方案
     * @param {Object} $table 表格实例
     * @param {Array} configData 配置数据
     */
    applyColumnConfiguration ($table, configData) {
      try {
        const store = $table.store
        if (!store || !store.states) {
          console.error('ExTable: 无法获取表格store')
          return
        }

        console.log('ExTable: 开始应用列配置（原生API方案）')
        console.log('ExTable: 配置数据条数:', configData.length)

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

        console.log('ExTable: 配置映射构建完成，configMap:', configMap.size, 'groupConfigMap:', groupConfigMap.size)

        // 获取当前列副本
        const currentColumns = [...store.states._columns]
        console.log('ExTable: 当前列数量:', currentColumns.length)
        
        // 先分离系统列和业务列
        const systemColumns = []
        const businessColumns = []
        
        currentColumns.forEach(column => {
          if (column.type && ['selection', 'index'].includes(column.type)) {
            // 系统列直接保留，不参与任何配置判断
            systemColumns.push(column)
          } else {
            businessColumns.push(column)
          }
        })
        
        console.log(`ExTable: 系统列数量: ${systemColumns.length}, 业务列数量: ${businessColumns.length}`)
        
        // 只对业务列进行过滤和排序
        const visibleBusinessColumns = businessColumns
          .filter(column => {
            // 根据配置决定是否显示
            const config = configMap.get(column.property) || groupConfigMap.get(column.property)
            const isVisible = config && config.is_enable === true
            if (!isVisible) {
              console.log(`ExTable: 隐藏列 ${column.property}`)
            }
            return isVisible
          })
          .sort((a, b) => {
            const configA = configMap.get(a.property) || groupConfigMap.get(a.property)
            const configB = configMap.get(b.property) || groupConfigMap.get(b.property)
            
            // 如果都没有配置，保持原顺序
            if (!configA && !configB) return 0
            if (!configA) return 1  // 没有配置的排在后面
            if (!configB) return -1  // 没有配置的排在后面
            
            return (configA.sort || 0) - (configB.sort || 0)
          })
        
        // 系统列在前，业务列在后
        const visibleColumns = [...systemColumns, ...visibleBusinessColumns]

        console.log('ExTable: 过滤后可见列数量:', visibleColumns.length)

        // 处理分组列的子列
        visibleColumns.forEach(column => {
          if (column.children && configMap.get(column.property)?.is_group === 1) {
            console.log(`ExTable: 处理分组列 ${column.property}，原始子列数: ${column.children.length}`)
            column.children = column.children.filter(child => {
              const config = groupConfigMap.get(child.property)
              return config && config.is_enable === true
            }).sort((a, b) => {
              const configA = groupConfigMap.get(a.property)
              const configB = groupConfigMap.get(b.property)
              return (configA?.sort || 0) - (configB?.sort || 0)
            })
            console.log(`ExTable: 分组列 ${column.property}，过滤后子列数: ${column.children.length}`)
          }
        })

        // 使用Element UI原生方法更新
        store.states._columns = visibleColumns
        store.updateColumns()
        
        console.log('ExTable: Element UI列更新完成')
        
        // 更新布局
        this.$nextTick(() => {
          store.scheduleLayout()
          $table.doLayout()
          console.log('ExTable: 布局更新完成')
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
    compare (obj1, obj2) {
      return obj1.sort - obj2.sort
    }
  }
}
