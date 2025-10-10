/**
 * 知识库Vuex模块入口
 * 基于aideepin的知识库状态管理
 */

import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
