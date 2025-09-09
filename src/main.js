import 'core-js/stable'
// import 'regenerator-runtime/runtime'

import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css
import 'vue-tour/dist/vue-tour.css' // vue-tour 样式
import '@/assets/bpm/theme.less' // BPM主题变量

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon

// Vite环境下的SVG图标虚拟模块导入
try {
  if (typeof require === 'undefined') {
    // 可能是Vite环境，尝试导入SVG图标虚拟模块
    import('virtual:svg-icons-register').catch(() => {
      // 忽略导入失败的情况
      console.debug('SVG icons register not available')
    })
  }
} catch (e) {
  // webpack环境下会忽略这个错误
  console.debug('SVG icons register not available in webpack environment')
}

import './permission' // permission control
import '@/assets/iconfont/iconfont.css'

import * as filters from './filters' // global filters

import FloatMenu from '@/components/FloatMenu'

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

// 引入 Monaco Editor 组件
import MonacoEditor from '@/components/99_util/MonacoEditor'

// 注册 Monaco Editor 组件
Vue.component('MonacoEditor', MonacoEditor)

// add by zxh
import commonFunction from './common/commonFunction'
import constants_para from './common/constants/constants_para'
import constants_type from './common/constants/constants_dict'
import constants_emits from './common/constants/constants_emits'
import constants_program from './common/constants/constants_program'
// import EventProxy from 'vue-event-proxy'
import global from './common/global/global'
// 引入echarts
import * as echarts from 'echarts'
import ElInputTag from '@/components/40_input/inputtag'
import VueTour from 'vue-tour'

// 引入组件和样式
import RouterTab from '@/components/RouterTab/install'
import ExTable from '@/components/30_table/ExTable'
Vue.use(RouterTab)
Vue.use(ElInputTag)

Vue.use(commonFunction)
Vue.prototype.CONSTANTS = constants_type
Vue.prototype.EMITS = constants_emits
Vue.prototype.PARAMETERS = constants_para
Vue.prototype.PROGRAMS = constants_program
Vue.prototype.GLOBAL = global
Vue.prototype.$echarts = echarts

// Vue.use(EventProxy)

Vue.use(Element, {
  size: Cookies.get('size') || 'mini' // set element-ui default size
})
/** 扩展的table和tablecolumn必须在，element下面，否则没有效果 */
Vue.use(ExTable, {
  size: Cookies.get('size') || 'mini' // set element-ui default size
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 全局组件
Vue.component('FloatMenu', FloatMenu)

Vue.use(VueTour)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
