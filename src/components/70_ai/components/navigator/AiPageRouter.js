/**
 * AI页面导航器
 *
 * 接收后端open_page_command指令，执行RouterTab级别的页面跳转。
 * 支持权限校验、加载浮层、参数传递、page_mode后续操作。
 *
 * @param {Object} command - open_page_command JSON对象
 * @param {string} command.route - 目标路由路径
 * @param {string} command.page_mode - 打开模式: list/new/view/edit/approve
 * @param {Object} [command.query_params] - 查询参数(list模式)
 * @param {Object} [command.form_data] - 表单预填数据(new模式)
 * @param {string|number} [command.record_id] - 记录ID(view/edit/approve模式)
 */

import Vue from 'vue'

/**
 * 标准化路径：确保以 / 开头，去除尾部 /
 */
function normalizePath (path) {
  if (!path) return ''
  let p = path.trim()
  if (!p.startsWith('/')) p = '/' + p
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

/**
 * 检查路由是否在用户权限菜单中
 */
function checkRoutePermission (route, store) {
  const menus = store.getters.permission_menus_routers || []
  const normalizedRoute = normalizePath(route)
  return findRouteInMenus(normalizedRoute, menus)
}

function findRouteInMenus (targetPath, menus) {
  for (const menu of menus) {
    if (normalizePath(menu.path) === targetPath) return true
    if (menu.children && findRouteInMenus(targetPath, menu.children)) return true
  }
  return false
}

/**
 * 执行页面导航
 */
export async function navigateToPage (command, router, store) {
  if (!command || !command.route) {
    console.warn('[AiPageRouter] 无效的导航指令:', command)
    return false
  }

  // 1. 权限校验
  if (!checkRoutePermission(command.route, store)) {
    Vue.prototype.$message.warning('没有访问该页面的权限: ' + command.route)
    return false
  }

  // 2. 显示加载浮层
  store.commit('SET_AI_LOADING_OVERLAY', true)

  try {
    // 3. 构建路由参数
    const query = { _ai: '1' }
    if (command.page_mode) {
      query._ai_mode = command.page_mode
    }
    if (command.query_params) {
      Object.assign(query, command.query_params)
    }
    if (command.record_id) {
      query._ai_record_id = command.record_id
    }
    if (command.form_data) {
      query._ai_form_data = JSON.stringify(command.form_data)
    }

    // 4. 执行导航
    await router.push({ path: command.route, query })

    // 5. 等待页面渲染完成
    await waitForNextTick()

    // 6. 通过全局事件总线通知目标页面执行page_mode操作
    if (command.page_mode && command.page_mode !== 'list') {
      Vue.prototype.$bus && Vue.prototype.$bus.$emit('ai-page-action', {
        mode: command.page_mode,
        record_id: command.record_id,
        form_data: command.form_data
      })
    }

    return true
  } catch (err) {
    // NavigationDuplicated不算错误
    if (err.name !== 'NavigationDuplicated') {
      console.error('[AiPageRouter] 导航失败:', err)
      Vue.prototype.$message.error('页面导航失败')
    }
    return false
  } finally {
    // 7. 关闭加载浮层（延迟500ms让页面渲染）
    setTimeout(() => {
      store.commit('SET_AI_LOADING_OVERLAY', false)
    }, 500)
  }
}

function waitForNextTick () {
  return new Promise(resolve => {
    Vue.nextTick(() => {
      setTimeout(resolve, 200)
    })
  })
}

export default {
  navigateToPage
}
