import { selectTodoCountApi } from '@/api/40_business/bpm_todo/todo'
import { getAlarmCount } from '@/api/10_system/message'

const state = {
  // 预警条数
  alarmCount: 0,
  // 待办
  toDoCount: 0
}

const mutations = {
  UPDATE_ALARM_COUNT: (state, value) => {
    state.alarmCount = value
  },
  SET_TODO_COUNT: (state, value) => {
    state.toDoCount = value
  }
}

const actions = {
  // 获取预警信息
  alarmCount ({ commit }) {
    return new Promise((resolve, reject) => {
      getAlarmCount().then(response => {
        const { data } = response
        // 设置令牌
        commit('UPDATE_ALARM_COUNT', data.warning_count)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 获取待办信息
  todoCount ({ commit }) {
    return new Promise((resolve, reject) => {
      selectTodoCountApi().then(response => {
        const { data } = response
        // 设置令牌
        commit('SET_TODO_COUNT', data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
