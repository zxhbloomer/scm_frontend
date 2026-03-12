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
import { EventBus } from '@/common/eventbus/eventbus'

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
    const query = {}
    if (command.page_mode) query._ai_mode = command.page_mode
    if (command.query_params) Object.assign(query, command.query_params)
    if (command.record_id) query._ai_record_id = command.record_id
    // form_data 通过 store 传递，不放 URL
    if (command.form_data) store.commit('SET_AI_PAGE_FORM_DATA', command.form_data)

    await router.push({ path: command.route, query })
    await waitForNextTick()
    step('✅ 页面加载完成')

    // 主动触发 mixin（处理 RouterTab 缓存不重新 mount 的情况）
    // consumed flag 保证即使 mounted 也执行了，这里也不会重复消费 formData
    if (command.page_mode && command.page_mode !== 'list') {
      EventBus.$emit('ai-page-action-repeat', {
        mode: command.page_mode,
        route: command.route
      })
    }

    return true
  } catch (err) {
    if (err.name === 'NavigationDuplicated') {
      // form_data 通过 store 传递
      if (command.form_data) {
        store.commit('SET_AI_PAGE_FORM_DATA', command.form_data)
      }
      // 页面已存在，直接通过 EventBus 触发动作（activated 不会再触发）
      EventBus.$emit('ai-page-action-repeat', {
        mode: command.page_mode,
        route: command.route
      })
    } else {
      console.error('[AiPageRouter] 导航失败:', err)
      step('❌ 页面导航失败')
      Vue.prototype.$message.error('页面导航失败')
    }
    return false
  } finally {
    // 等待倒计时（2秒）跑完后再关闭遮罩
    setTimeout(() => {
      store.commit('SET_AI_LOADING_OVERLAY', false)
    }, 2000)
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
