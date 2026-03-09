/**
 * AI页面导航器
 *
 * 接收后端open_page_command指令，执行RouterTab级别的页面跳转。
 * 权限由后端MCP工具校验，前端直接跳转。
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
 * 执行页面导航
 * @param {Object} command - open_page_command JSON对象
 * @param {Object} router - Vue Router 实例
 * @param {Object} store - 包含 { commit } 的 store 对象
 * @param {Function} [onStep] - 步骤回调
 */
export async function navigateToPage (command, router, store, onStep) {
  const step = onStep || (() => {})

  if (!command || !command.route) {
    console.warn('[AiPageRouter] 无效的导航指令:', command)
    return false
  }

  store.commit('SET_AI_LOADING_OVERLAY', true)

  try {
    // 构建路由参数并跳转（权限已由后端校验）
    step('⏳ 正在打开页面，等待加载...')
    const query = { _ai: '1' }
    if (command.page_mode) query._ai_mode = command.page_mode
    if (command.query_params) Object.assign(query, command.query_params)
    if (command.record_id) query._ai_record_id = command.record_id
    if (command.form_data) query._ai_form_data = JSON.stringify(command.form_data)

    await router.push({ path: command.route, query })
    await waitForNextTick()
    step('✅ 页面加载完成')

    // 触发 page_mode 操作
    if (command.page_mode && command.page_mode !== 'list') {
      step('⏳ 正在触发操作...')
      Vue.prototype.$bus && Vue.prototype.$bus.$emit('ai-page-action', {
        mode: command.page_mode,
        record_id: command.record_id,
        form_data: command.form_data
      })
      step('✅ 完成')
    }

    return true
  } catch (err) {
    if (err.name !== 'NavigationDuplicated') {
      console.error('[AiPageRouter] 导航失败:', err)
      step('❌ 页面导航失败')
      Vue.prototype.$message.error('页面导航失败')
    }
    return false
  } finally {
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
