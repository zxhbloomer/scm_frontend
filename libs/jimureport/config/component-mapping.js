/**
 * UI组件映射配置
 * @description iView组件到Element UI组件的映射配置
 * @author SCM Report Team
 */

/**
 * 组件类型映射表
 * iView组件名 → Element UI组件名
 */
export const componentMapping = {
  // 基础组件
  'i-button': 'el-button',
  'i-icon': 'i', // Element UI使用i标签或el-icon
  'i-link': 'el-link',
  
  // 布局组件
  'i-row': 'el-row',
  'i-col': 'el-col',
  'i-divider': 'el-divider',
  
  // 表单组件
  'i-form': 'el-form',
  'i-form-item': 'el-form-item',
  'i-input': 'el-input',
  'i-input-number': 'el-input-number',
  'i-radio': 'el-radio',
  'i-radio-group': 'el-radio-group',
  'i-checkbox': 'el-checkbox',
  'i-checkbox-group': 'el-checkbox-group',
  'i-select': 'el-select',
  'i-option': 'el-option',
  'i-option-group': 'el-option-group',
  'i-switch': 'el-switch',
  'i-slider': 'el-slider',
  'i-time-picker': 'el-time-picker',
  'i-date-picker': 'el-date-picker',
  'i-cascader': 'el-cascader',
  'i-transfer': 'el-transfer',
  'i-color-picker': 'el-color-picker',
  'i-rate': 'el-rate',
  'i-upload': 'el-upload',
  
  // 数据展示
  'i-table': 'el-table',
  'i-tag': 'el-tag',
  'i-progress': 'el-progress',
  'i-tree': 'el-tree',
  'i-pagination': 'el-pagination',
  'i-badge': 'el-badge',
  'i-avatar': 'el-avatar',
  'i-skeleton': 'el-skeleton',
  'i-empty': 'el-empty',
  'i-descriptions': 'el-descriptions',
  'i-result': 'el-result',
  
  // 反馈组件
  'i-alert': 'el-alert',
  'i-loading': 'el-loading', // 特殊处理
  'i-message': 'el-message', // 全局方法
  'i-message-box': 'el-message-box', // 全局方法
  'i-notification': 'el-notification', // 全局方法
  'i-popover': 'el-popover',
  'i-tooltip': 'el-tooltip',
  'i-popconfirm': 'el-popconfirm',
  
  // 导航组件
  'i-menu': 'el-menu',
  'i-menu-item': 'el-menu-item',
  'i-submenu': 'el-submenu',
  'i-menu-item-group': 'el-menu-item-group',
  'i-tabs': 'el-tabs',
  'i-tab-pane': 'el-tab-pane',
  'i-breadcrumb': 'el-breadcrumb',
  'i-breadcrumb-item': 'el-breadcrumb-item',
  'i-page-header': 'el-page-header',
  'i-steps': 'el-steps',
  'i-step': 'el-step',
  
  // 其他组件
  'i-affix': 'el-affix',
  'i-anchor': 'el-anchor',
  'i-back-top': 'el-backtop',
  'i-card': 'el-card',
  'i-collapse': 'el-collapse',
  'i-collapse-panel': 'el-collapse-item',
  'i-carousel': 'el-carousel',
  'i-carousel-item': 'el-carousel-item',
  'i-timeline': 'el-timeline',
  'i-timeline-item': 'el-timeline-item',
  'i-drawer': 'el-drawer',
  'i-modal': 'el-dialog',
  'i-dropdown': 'el-dropdown',
  'i-dropdown-menu': 'el-dropdown-menu',
  'i-dropdown-item': 'el-dropdown-item'
}

/**
 * 属性映射表
 * 每个组件的属性映射规则
 */
export const propsMapping = {
  'i-button': {
    'type': 'type',
    'size': 'size',
    'loading': 'loading',
    'disabled': 'disabled',
    'ghost': 'plain', // iView的ghost对应Element的plain
    'shape': (value) => value === 'circle' ? 'circle' : undefined,
    'icon': 'icon',
    'html-type': 'native-type'
  },
  
  'i-input': {
    'value': 'value',
    'v-model': 'v-model',
    'type': 'type',
    'size': 'size',
    'placeholder': 'placeholder',
    'clearable': 'clearable',
    'show-password': 'show-password',
    'show-word-limit': 'show-word-limit',
    'prefix': 'prefix-icon',
    'suffix': 'suffix-icon',
    'prepend': 'prepend',
    'append': 'append',
    'rows': 'rows',
    'autosize': 'autosize',
    'readonly': 'readonly',
    'disabled': 'disabled',
    'maxlength': 'maxlength',
    'minlength': 'minlength',
    'autofocus': 'autofocus'
  },
  
  'i-modal': {
    'v-model': 'visible',
    'title': 'title',
    'width': 'width',
    'top': 'top',
    'modal': 'modal',
    'mask-closable': 'close-on-click-modal',
    'closable': 'show-close',
    'scrollable': (value) => !value ? 'lock-scroll' : undefined,
    'fullscreen': 'fullscreen',
    'draggable': 'draggable',
    'mask': 'modal'
  },
  
  'i-table': {
    'data': 'data',
    'columns': 'columns', // 需要特殊转换
    'loading': 'v-loading',
    'stripe': 'stripe',
    'border': 'border',
    'show-header': 'show-header',
    'highlight-row': 'highlight-current-row',
    'row-class-name': 'row-class-name',
    'row-style': 'row-style',
    'cell-class-name': 'cell-class-name',
    'cell-style': 'cell-style',
    'header-cell-class-name': 'header-cell-class-name',
    'header-cell-style': 'header-cell-style',
    'row-key': 'row-key',
    'empty-text': 'empty-text',
    'default-expand-all': 'default-expand-all',
    'expand-row-keys': 'expand-row-keys',
    'default-sort': 'default-sort',
    'tooltip-effect': 'tooltip-effect',
    'show-summary': 'show-summary',
    'sum-text': 'sum-text',
    'summary-method': 'summary-method',
    'span-method': 'span-method',
    'select-on-indeterminate': 'select-on-indeterminate',
    'indent': 'indent',
    'lazy': 'lazy',
    'load': 'load',
    'tree-props': 'tree-props'
  },
  
  'i-form': {
    'model': 'model',
    'rules': 'rules',
    'inline': 'inline',
    'label-position': 'label-position',
    'label-width': 'label-width',
    'label-suffix': 'label-suffix',
    'hide-required-asterisk': 'hide-required-asterisk',
    'show-message': 'show-message',
    'inline-message': 'inline-message',
    'status-icon': 'status-icon',
    'validate-on-rule-change': 'validate-on-rule-change',
    'size': 'size',
    'disabled': 'disabled'
  },
  
  'i-select': {
    'value': 'value',
    'v-model': 'v-model',
    'multiple': 'multiple',
    'disabled': 'disabled',
    'value-key': 'value-key',
    'size': 'size',
    'clearable': 'clearable',
    'collapse-tags': 'collapse-tags',
    'multiple-limit': 'multiple-limit',
    'name': 'name',
    'autocomplete': 'autocomplete',
    'placeholder': 'placeholder',
    'filterable': 'filterable',
    'allow-create': 'allow-create',
    'filter-method': 'filter-method',
    'remote': 'remote',
    'remote-method': 'remote-method',
    'loading': 'loading',
    'loading-text': 'loading-text',
    'no-match-text': 'no-match-text',
    'no-data-text': 'no-data-text',
    'popper-class': 'popper-class',
    'reserve-keyword': 'reserve-keyword',
    'default-first-option': 'default-first-option',
    'popper-append-to-body': 'popper-append-to-body',
    'automatic-dropdown': 'automatic-dropdown'
  },
  
  'i-date-picker': {
    'value': 'value',
    'v-model': 'v-model',
    'readonly': 'readonly',
    'disabled': 'disabled',
    'editable': 'editable',
    'clearable': 'clearable',
    'size': 'size',
    'placeholder': 'placeholder',
    'start-placeholder': 'start-placeholder',
    'end-placeholder': 'end-placeholder',
    'type': 'type',
    'format': 'format',
    'align': 'align',
    'popper-class': 'popper-class',
    'picker-options': 'picker-options',
    'range-separator': 'range-separator',
    'default-value': 'default-value',
    'default-time': 'default-time',
    'value-format': 'value-format',
    'name': 'name',
    'unlink-panels': 'unlink-panels',
    'prefix-icon': 'prefix-icon',
    'clear-icon': 'clear-icon'
  },
  
  'i-tree': {
    'data': 'data',
    'empty-text': 'empty-text',
    'node-key': 'node-key',
    'props': 'props',
    'render-after-expand': 'render-after-expand',
    'load': 'load',
    'render-content': 'render-content',
    'highlight-current': 'highlight-current',
    'default-expand-all': 'default-expand-all',
    'expand-on-click-node': 'expand-on-click-node',
    'check-on-click-node': 'check-on-click-node',
    'auto-expand-parent': 'auto-expand-parent',
    'default-expanded-keys': 'default-expanded-keys',
    'show-checkbox': 'show-checkbox',
    'check-strictly': 'check-strictly',
    'default-checked-keys': 'default-checked-keys',
    'current-node-key': 'current-node-key',
    'filter-node-method': 'filter-node-method',
    'accordion': 'accordion',
    'indent': 'indent',
    'icon-class': 'icon-class'
  }
}

/**
 * 事件映射表
 * iView事件名 → Element UI事件名
 */
export const eventMapping = {
  'i-button': {
    'on-click': 'click'
  },
  
  'i-input': {
    'on-input': 'input',
    'on-change': 'change',
    'on-focus': 'focus',
    'on-blur': 'blur',
    'on-clear': 'clear',
    'on-enter': 'keyup.enter',
    'on-keydown': 'keydown',
    'on-keypress': 'keypress',
    'on-keyup': 'keyup'
  },
  
  'i-modal': {
    'on-ok': 'confirm',
    'on-cancel': 'close',
    'on-visible-change': 'visible-change',
    'on-opened': 'opened',
    'on-closed': 'closed'
  },
  
  'i-table': {
    'on-current-change': 'current-change',
    'on-select': 'select',
    'on-select-cancel': 'select-cancel',
    'on-select-all': 'select-all',
    'on-select-all-cancel': 'select-all-cancel',
    'on-selection-change': 'selection-change',
    'on-sort-change': 'sort-change',
    'on-filter-change': 'filter-change',
    'on-row-click': 'row-click',
    'on-row-dblclick': 'row-dblclick',
    'on-row-contextmenu': 'row-contextmenu',
    'on-cell-mouse-enter': 'cell-mouse-enter',
    'on-cell-mouse-leave': 'cell-mouse-leave',
    'on-cell-click': 'cell-click',
    'on-cell-dblclick': 'cell-dblclick',
    'on-header-click': 'header-click',
    'on-header-contextmenu': 'header-contextmenu',
    'on-expand-change': 'expand-change'
  },
  
  'i-form': {
    'on-validate': 'validate'
  },
  
  'i-select': {
    'on-change': 'change',
    'on-visible-change': 'visible-change',
    'on-remove-tag': 'remove-tag',
    'on-clear': 'clear',
    'on-blur': 'blur',
    'on-focus': 'focus'
  },
  
  'i-date-picker': {
    'on-change': 'change',
    'on-blur': 'blur',
    'on-focus': 'focus'
  },
  
  'i-tree': {
    'on-select-change': 'node-click',
    'on-check-change': 'check-change',
    'on-expand-change': 'node-expand',
    'on-current-change': 'current-change'
  }
}

/**
 * 样式类名映射表
 * iView样式类名 → Element UI样式类名
 */
export const classMapping = {
  // 按钮相关
  'ivu-btn': 'el-button',
  'ivu-btn-primary': 'el-button--primary',
  'ivu-btn-default': 'el-button--default',
  'ivu-btn-dashed': 'el-button--default',
  'ivu-btn-text': 'el-button--text',
  'ivu-btn-info': 'el-button--info',
  'ivu-btn-success': 'el-button--success',
  'ivu-btn-warning': 'el-button--warning',
  'ivu-btn-error': 'el-button--danger',
  'ivu-btn-large': 'el-button--large',
  'ivu-btn-small': 'el-button--small',
  'ivu-btn-mini': 'el-button--mini',
  'ivu-btn-loading': 'is-loading',
  'ivu-btn-disabled': 'is-disabled',
  
  // 输入框相关
  'ivu-input': 'el-input',
  'ivu-input-wrapper': 'el-input',
  'ivu-input-large': 'el-input--large',
  'ivu-input-small': 'el-input--small',
  'ivu-input-mini': 'el-input--mini',
  'ivu-input-disabled': 'is-disabled',
  'ivu-input-focused': 'is-focus',
  
  // 表格相关
  'ivu-table': 'el-table',
  'ivu-table-wrapper': 'el-table',
  'ivu-table-header': 'el-table__header-wrapper',
  'ivu-table-body': 'el-table__body-wrapper',
  'ivu-table-row': 'el-table__row',
  'ivu-table-cell': 'el-table__cell',
  'ivu-table-stripe': 'el-table--striped',
  'ivu-table-border': 'el-table--border',
  
  // 模态框相关
  'ivu-modal': 'el-dialog',
  'ivu-modal-wrap': 'el-dialog__wrapper',
  'ivu-modal-header': 'el-dialog__header',
  'ivu-modal-body': 'el-dialog__body',
  'ivu-modal-footer': 'el-dialog__footer',
  'ivu-modal-close': 'el-dialog__close',
  
  // 表单相关
  'ivu-form': 'el-form',
  'ivu-form-item': 'el-form-item',
  'ivu-form-item-label': 'el-form-item__label',
  'ivu-form-item-content': 'el-form-item__content',
  'ivu-form-item-error': 'el-form-item__error',
  'ivu-form-item-required': 'is-required',
  
  // 选择器相关
  'ivu-select': 'el-select',
  'ivu-select-dropdown': 'el-select-dropdown',
  'ivu-select-item': 'el-select-dropdown__item',
  'ivu-select-item-selected': 'selected',
  'ivu-select-item-disabled': 'is-disabled'
}

/**
 * 获取映射后的组件名
 */
export function getMappedComponent(iviewComponent) {
  return componentMapping[iviewComponent] || iviewComponent
}

/**
 * 获取映射后的属性
 */
export function getMappedProps(componentType, props) {
  const mapping = propsMapping[componentType] || {}
  const result = {}
  
  Object.keys(props).forEach(key => {
    const mappedKey = mapping[key]
    if (typeof mappedKey === 'string') {
      result[mappedKey] = props[key]
    } else if (typeof mappedKey === 'function') {
      const mappedValue = mappedKey(props[key])
      if (mappedValue !== undefined) {
        result[key] = mappedValue
      }
    } else {
      result[key] = props[key]
    }
  })
  
  return result
}

/**
 * 获取映射后的事件
 */
export function getMappedEvents(componentType, events) {
  const mapping = eventMapping[componentType] || {}
  const result = {}
  
  Object.keys(events).forEach(key => {
    const mappedEvent = mapping[key] || key.replace(/^on-/, '')
    result[mappedEvent] = events[key]
  })
  
  return result
}

/**
 * 获取映射后的样式类名
 */
export function getMappedClasses(classes) {
  if (typeof classes === 'string') {
    return classes.split(' ').map(cls => classMapping[cls] || cls).join(' ')
  }
  
  if (Array.isArray(classes)) {
    return classes.map(cls => classMapping[cls] || cls)
  }
  
  if (typeof classes === 'object') {
    const result = {}
    Object.keys(classes).forEach(key => {
      const mappedKey = classMapping[key] || key
      result[mappedKey] = classes[key]
    })
    return result
  }
  
  return classes
}