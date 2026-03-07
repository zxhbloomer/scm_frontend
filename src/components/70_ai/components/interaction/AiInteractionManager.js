/**
 * AI人机交互状态管理器
 *
 * 管理交互状态生命周期：WAITING → SUBMITTED/TIMEOUT/CANCELLED
 * 负责倒计时、反馈提交、状态清理。
 */

let countdownTimer = null
let activeInteractionUuid = null

/**
 * 启动交互：保存交互状态到Vuex，启动倒计时
 * @param {Object} request - interaction_request JSON对象
 * @param {Object} store - Vuex store实例
 */
export function startInteraction (request, store) {
  if (!request || !request.interaction_uuid) {
    console.warn('[AiInteractionManager] 无效的交互请求:', request)
    return
  }

  // 计算剩余秒数
  let remainingSeconds = (request.timeout_minutes || 30) * 60
  if (request.timeout_at) {
    const timeoutAt = new Date(request.timeout_at).getTime()
    const now = Date.now()
    const diff = Math.floor((timeoutAt - now) / 1000)
    if (diff > 0) {
      remainingSeconds = diff
    }
  }

  const interaction = {
    ...request,
    status: 'WAITING',
    remainingSeconds
  }

  store.commit('SET_ACTIVE_INTERACTION', interaction)
  activeInteractionUuid = request.interaction_uuid

  // 启动倒计时
  stopCountdown()
  const currentUuid = request.interaction_uuid
  countdownTimer = setInterval(() => {
    // 防护：如果活跃交互已切换，停止旧的倒计时
    if (activeInteractionUuid !== currentUuid) {
      stopCountdown()
      return
    }
    const current = store.state.chat.activeInteraction
    if (!current || current.status !== 'WAITING') {
      stopCountdown()
      return
    }

    const newRemaining = current.remainingSeconds - 1
    if (newRemaining <= 0) {
      // 前端超时提示
      store.commit('SET_ACTIVE_INTERACTION', {
        ...current,
        status: 'TIMEOUT',
        remainingSeconds: 0
      })
      stopCountdown()
      return
    }

    store.commit('SET_ACTIVE_INTERACTION', {
      ...current,
      remainingSeconds: newRemaining
    })
  }, 1000)
}

/**
 * 提交反馈：构建反馈消息，通过Chat发送
 * @param {string} action - 用户操作类型
 * @param {Object} data - 反馈数据
 * @param {Object} store - Vuex store实例
 */
export function submitFeedback (action, data, store) {
  const interaction = store.state.chat.activeInteraction
  if (!interaction) return

  // 构建反馈消息JSON
  const feedbackMessage = JSON.stringify({
    type: 'ai_interaction_feedback',
    interaction_uuid: interaction.interaction_uuid,
    action,
    data
  })

  // 更新状态为SUBMITTED
  store.commit('SET_ACTIVE_INTERACTION', {
    ...interaction,
    status: 'SUBMITTED'
  })
  stopCountdown()

  return feedbackMessage
}

/**
 * 取消交互
 * @param {Object} store - Vuex store实例
 */
export function cancelInteraction (store) {
  const interaction = store.state.chat.activeInteraction
  if (!interaction) return

  const feedbackMessage = JSON.stringify({
    type: 'ai_interaction_feedback',
    interaction_uuid: interaction.interaction_uuid,
    action: 'cancel',
    data: null
  })

  store.commit('SET_ACTIVE_INTERACTION', {
    ...interaction,
    status: 'CANCELLED'
  })
  stopCountdown()

  return feedbackMessage
}

/**
 * 清除交互状态
 * @param {Object} store - Vuex store实例
 */
export function clearInteraction (store) {
  store.commit('SET_ACTIVE_INTERACTION', null)
  activeInteractionUuid = null
  stopCountdown()
}

/**
 * 获取当前活跃交互
 * @param {Object} store - Vuex store实例
 */
export function getActiveInteraction (store) {
  return store.state.chat.activeInteraction
}

/**
 * 格式化剩余时间为 mm:ss
 */
export function formatRemainingTime (seconds) {
  if (!seconds || seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function stopCountdown () {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

export default {
  startInteraction,
  submitFeedback,
  cancelInteraction,
  clearInteraction,
  getActiveInteraction,
  formatRemainingTime
}
