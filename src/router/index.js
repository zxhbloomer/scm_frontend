import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import { isNotEmpty } from '@/utils'

/**
 * 解决Vue-Router升级导致的Uncaught (in promise)问题
 */
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

/**
 * 使用 Vite 的 import.meta.glob 预注册 views 下的所有页面
 * 注意：glob 的键必须是绝对的 /src 开头路径，不能用别名 @
 */
const viewModules = import.meta.glob('/src/views/**/*.vue')

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
 roles: ['admin','editor']    control the page roles (you can set multiple roles)
 title: 'title'               the name show in sidebar and breadcrumb (recommend set)
 icon: 'svg-name'             the icon show in the sidebar
 noCache: true                if set true, the page will no be cached(default is false)
 affix: true                  if set true, the tag will affix in the tags-view
 breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
 activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
 }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/password_reset',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/signup',
    component: () => import('@/views/00_platform/signup'),
    hidden: true
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/sso',
    component: () => import('@/views/login/link'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    // 监管任务detail
    path: '/preview',
    component: () => import('@/views/30_wms/preview/index'),
    hidden: true
  },
  {
    // 物流大屏
    path: '/logistics_large_screen',
    component: () => import('@/views/50_query/logistics_large_screen'),
    hhidden: true
  },
  {
    // 监管任务detail, 备份的
    path: '/previewbackup',
    component: () => import('@/views/30_wms/previewbackup'),
    hidden: true
  },
  {
    // 监管任务detail, 备份的
    path: '/previewbackupv2',
    component: () => import('@/views/30_wms/previewbackupv2'),
    hidden: true
  },
  {
    path: '/user/info1',
    hidden: true,
    component: Layout,
    name: 'C00000001', // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
    children: [
      {
        hidden: true,
        path: '/user/info1',
        component: () => import('@/views/20_master/user/index'),
        name: 'userinfo'
      }
    ]
  }

]

let asyncRoutesConvertToOneRouter = [
  {
    path: '/async',
    component: Layout,
    redirect: 'noRedirect',
    children: []
  }
]

function clearAsyncRoutesConvertToOneRouter () {
  asyncRoutesConvertToOneRouter = [
    {
      path: '/async',
      component: Layout,
      redirect: 'noRedirect',
      children: []
    }
  ]
}
export function setAsyncRouters (_data) {
  // 初始化
  clearAsyncRoutesConvertToOneRouter()
  asyncRoutesConvertToOneRouter[0].children = [..._data]
  return asyncRoutesConvertToOneRouter
}

/**
 * 注意：Vite 环境下需要先声明 customerRouter，再创建 router
 * 否则会触发 let 的 TDZ（临时性死区）错误
 */
let customerRouter = []

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  // 将动态路由（如果存在）拼接到常量路由后
  routes: constantRoutes.concat(
    customerRouter ? (Array.isArray(customerRouter) ? customerRouter : [customerRouter]) : []
  )
})

const router = createRouter()

/**
 * 重定向使用
 * @param {*} _data
 */
export function setRedirectRouter (_data) {
  const redirect_router = {
    path: '/',
    component: Layout,
    redirect: _data.redirect,
    hidden: false,
    children: [
      {
        path: _data.path,
        component: loadView(_data.component),
        name: _data.name,
        meta: { title: _data.meta.title, icon: _data.meta.icon, affix: _data.meta.affix, active_topnav_index: _data.meta.active_topnav_index }
      }
    ]
  }
  customerRouter = redirect_router
  resetRouter()
}

/**
 * 递归对象，动态读取所有的component
 * @param {*} obj
 */
export function deepRecursiveLoadComponent (obj) {
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue
    if (typeof obj[i] === 'object') {
      deepRecursiveLoadComponent(obj[i])
    } else {
      if (i === 'component') {
        obj[i] = loadView(obj[i])
      }
    }
  }
  return obj
}

// 按一级路由的方式来设置，并返回
export function convertToOneRouter (orignal, _path) {
  // 初始化
  clearAsyncRoutesConvertToOneRouter()
  for (const item of orignal) {
    let path = _path === undefined ? '' : _path + '/'
    path = path + item.path
    if (item.children && item.children.length > 0) {
      findChilds(item.children, path, item, asyncRoutesConvertToOneRouter)
    } else {
      // 删除对象中的children属性
      delete item.children
      item.path = path
      asyncRoutesConvertToOneRouter[0].children.push(item)
    }
  }
  return asyncRoutesConvertToOneRouter
}

// 查找子结点
function findChilds (children, _path, _parent, _childrens) {
  let path = _path === undefined ? '' : _path + '/'
  for (const _childItem of children) {
    if (_childItem.children && _childItem.children.length > 0) {
      path = _path + '/' + _childItem.path
      findChilds(_childItem.children, path, _childItem, _childrens)
    } else {
      // 删除对象中的children属性
      delete _childItem.children
      path = _path === undefined ? '' : _path + '/'
      path = path.replace('//', '/')
      _childItem.path = path.endsWith('/') ? (path + _childItem.path) : (path + '/' + _childItem.path)
      _childItem.path = _childItem.path.replace('//', '/')
      _childrens[0].children.push(_childItem)
    }
  }
}

/**
 * 懒加载页面 (Vite 版)
 * @param {*} view 例如 '/30_wms/preview/index' 或 '/10_system/config/config'
 */
export const loadView = (view) => { // 路由懒加载
  if (view === 'Layout') {
    return Layout
  } else {
    if (isNotEmpty(view)) {
      // 统一成不以 / 结尾的路径
      const v = String(view).replace(/\/+$/, '')

      // 尝试两种常见文件：/path.vue 与 /path/index.vue
      const candidates = [
        `/src/views${v}.vue`,
        `/src/views${v}/index.vue`
      ]
      const importer = candidates.map(p => viewModules[p]).find(Boolean)

      if (!importer) {
        console.error('[router] View not found for', view)
        // 兜底，避免路由报错（可改为跳 404）
        return () => Promise.resolve({ render: h => h('div', 'View not found') })
      }

      // import.meta.glob 返回 () => Promise<ComponentModule>
      // 直接返回给 vue-router 作为异步组件使用
      return importer
    }
  }
}

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
