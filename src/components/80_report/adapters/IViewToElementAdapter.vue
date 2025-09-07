<template>
  <component
    :is="adaptedComponent"
    v-bind="adaptedProps"
    v-on="adaptedEvents"
    @hook:mounted="handleMounted"
  >
    <slot />
  </component>
</template>

<script>
/**
 * iView到Element UI的组件适配器
 * @description 将JimuReport中的iView组件适配为Element UI组件
 */
export default {
  name: 'IViewToElementAdapter',
  props: {
    // 原始iView组件类型
    originalType: {
      type: String,
      required: true
    },
    // 原始iView属性
    originalProps: {
      type: Object,
      default: () => ({})
    },
    // 原始iView事件
    originalEvents: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    /**
     * 适配后的组件类型
     */
    adaptedComponent () {
      const componentMapping = {
        'i-button': 'el-button',
        'i-input': 'el-input',
        'i-table': 'el-table',
        'i-form': 'el-form',
        'i-form-item': 'el-form-item',
        'i-select': 'el-select',
        'i-option': 'el-option',
        'i-date-picker': 'el-date-picker',
        'i-tree': 'el-tree',
        'i-modal': 'el-dialog',
        'i-tabs': 'el-tabs',
        'i-tab-pane': 'el-tab-pane',
        'i-card': 'el-card',
        'i-row': 'el-row',
        'i-col': 'el-col',
        'i-menu': 'el-menu',
        'i-menu-item': 'el-menu-item',
        'i-submenu': 'el-submenu'
      }
      return componentMapping[this.originalType] || this.originalType
    },

    /**
     * 适配后的属性
     */
    adaptedProps () {
      return this.convertProps(this.originalType, this.originalProps)
    },

    /**
     * 适配后的事件
     */
    adaptedEvents () {
      return this.convertEvents(this.originalType, this.originalEvents)
    }
  },
  methods: {
    /**
     * 转换属性
     */
    convertProps (type, props) {
      const propsMapping = {
        'i-button': {
          'type': 'type',
          'size': 'size',
          'loading': 'loading',
          'disabled': 'disabled',
          'ghost': 'plain', // iView的ghost对应Element的plain
          'shape': (value) => value === 'circle' ? 'circle' : undefined,
          'icon': 'icon'
        },
        'i-input': {
          'value': 'value',
          'placeholder': 'placeholder',
          'disabled': 'disabled',
          'readonly': 'readonly',
          'clearable': 'clearable',
          'show-password': 'show-password',
          'maxlength': 'maxlength',
          'minlength': 'minlength'
        },
        'i-modal': {
          'v-model': 'visible',
          'title': 'title',
          'width': 'width',
          'mask-closable': 'close-on-click-modal',
          'closable': 'show-close'
        },
        'i-table': {
          'data': 'data',
          'columns': (value) => this.convertTableColumns(value),
          'loading': 'v-loading',
          'stripe': 'stripe',
          'border': 'border',
          'show-header': 'show-header',
          'highlight-row': 'highlight-current-row'
        },
        'i-form': {
          'model': 'model',
          'rules': 'rules',
          'inline': 'inline',
          'label-position': 'label-position',
          'label-width': 'label-width'
        },
        'i-select': {
          'value': 'value',
          'placeholder': 'placeholder',
          'disabled': 'disabled',
          'clearable': 'clearable',
          'filterable': 'filterable',
          'multiple': 'multiple'
        },
        'i-date-picker': {
          'value': 'value',
          'type': 'type',
          'placeholder': 'placeholder',
          'disabled': 'disabled',
          'clearable': 'clearable',
          'format': 'format',
          'value-format': 'value-format'
        },
        'i-tree': {
          'data': 'data',
          'show-checkbox': 'show-checkbox',
          'check-strictly': 'check-strictly',
          'default-expand-all': 'default-expand-all',
          'expand-on-click-node': 'expand-on-click-node'
        }
      }

      const mapping = propsMapping[type] || {}
      const convertedProps = {}

      Object.keys(props).forEach(key => {
        const mappingValue = mapping[key]
        if (mappingValue) {
          if (typeof mappingValue === 'string') {
            convertedProps[mappingValue] = props[key]
          } else if (typeof mappingValue === 'function') {
            const result = mappingValue(props[key])
            if (result !== undefined) {
              convertedProps[key] = result
            }
          }
        } else {
          // 没有映射的属性直接传递
          convertedProps[key] = props[key]
        }
      })

      return convertedProps
    },

    /**
     * 转换事件
     */
    convertEvents (type, events) {
      const eventsMapping = {
        'i-button': {
          'on-click': 'click'
        },
        'i-input': {
          'on-change': 'change',
          'on-blur': 'blur',
          'on-focus': 'focus',
          'on-input': 'input'
        },
        'i-modal': {
          'on-ok': 'confirm',
          'on-cancel': 'close',
          'on-visible-change': 'visible-change'
        },
        'i-table': {
          'on-selection-change': 'selection-change',
          'on-sort-change': 'sort-change',
          'on-row-click': 'row-click',
          'on-row-dblclick': 'row-dblclick'
        },
        'i-form': {
          'on-validate': 'validate'
        },
        'i-select': {
          'on-change': 'change',
          'on-clear': 'clear',
          'on-focus': 'focus',
          'on-blur': 'blur'
        },
        'i-date-picker': {
          'on-change': 'change',
          'on-clear': 'clear',
          'on-focus': 'focus',
          'on-blur': 'blur'
        },
        'i-tree': {
          'on-select-change': 'node-click',
          'on-check-change': 'check-change',
          'on-expand-change': 'node-expand'
        }
      }

      const mapping = eventsMapping[type] || {}
      const convertedEvents = {}

      Object.keys(events).forEach(key => {
        const mappedEvent = mapping[key] || key.replace(/^on-/, '')
        convertedEvents[mappedEvent] = events[key]
      })

      return convertedEvents
    },

    /**
     * 转换表格列配置
     */
    convertTableColumns (iviewColumns) {
      if (!Array.isArray(iviewColumns)) return []

      // 这里可能需要将iView的columns转换为Element UI的table-column
      // 实际实现中可能需要动态生成el-table-column组件
      return iviewColumns
    },

    /**
     * 组件挂载完成
     */
    handleMounted () {
      this.$emit('adapted-mounted', {
        originalType: this.originalType,
        adaptedType: this.adaptedComponent
      })
    }
  }
}
</script>
