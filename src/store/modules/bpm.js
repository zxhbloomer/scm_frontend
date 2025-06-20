
export default {
  state: {
    nodeMap: new Map(),
    formItemMap: new Map(),
    isEdit: null,
    selectedNode: {},
    selectFormItem: null,
    design: {},
    runningList: [],
    noTakeList: [],
    endList: [],
    diagramMode: 'design'
  },
  mutations: {
    selectedNode (state, val) {
      state.selectedNode = val
    },
    loadForm (state, val) {
      state.design = val
    },
    isEdit (state, val) {
      state.isEdit = val
    },
    selectFormItem (state, val) {
      state.selectFormItem = val
    },
    endList (state, val) {
      state.endList = val
    },
    runningList (state, val) {
      state.runningList = val
    },
    noTakeList (state, val) {
      state.noTakeList = val
    }
  },
  getters: {},
  actions: {},
  modules: {}
}
