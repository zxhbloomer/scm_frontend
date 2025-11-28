
const state = {
  program: null,
  selectedMultipleDataJson: null
}

const mutations = {
  SET_PROGRAM: (state, program) => {
    state.program = program
  },
  SET_SELECTED_MULTIPLE_DATA_JSON: (state, selectedMultipleDataJson) => {
    state.selectedMultipleDataJson = selectedMultipleDataJson
  }
}

const actions = {
  program ({ commit }, data) {
    commit('SET_PROGRAM', data)
  },
  selectedMultipleDataJson ({ commit }, data) {
    commit('SET_SELECTED_MULTIPLE_DATA_JSON', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
