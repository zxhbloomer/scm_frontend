/**
 * Workflow Runtime Vuex Module
 * 工作流运行时状态管理模块
 * 基于 aideepin 原始实现,适配 Vue 2.7.16 + Vuex 3.1.0
 *
 * 重要修改：
 * - aideepin 使用 Vue 3（支持 Map/Set 响应式）
 * - SCM 使用 Vue 2.7（不支持 Map/Set 响应式）
 * - 必须将 Map/Set 改为普通对象以确保响应式工作
 */

import Vue from 'vue'
import { RUNTIME_STATUS } from '../../components/workflow/constants'

const state = {
  // 运行时数据映射 (workflowUuid -> WorkflowRuntime[])
  // Vue 2: 使用普通对象代替 Map
  wfUuidToRuntimes: {},

  // 运行时加载状态映射 (workflowUuid -> boolean)
  // Vue 2: 使用普通对象代替 Map
  wfUuidToRuntimeLoading: {},

  // 当前正在运行的工作流UUID集合
  // Vue 2: 使用普通对象代替 Set（值为 true/false）
  runningWorkflows: {}
}

const getters = {
  /**
   * 获取工作流的运行时列表
   * Vue 2: 使用对象属性访问代替 Map.get()
   */
  getRuntimes: (state) => (wfUuid) => {
    return state.wfUuidToRuntimes[wfUuid] || []
  },

  /**
   * 获取运行时信息 (by runtimeUuid)
   * Vue 2: 使用 Object.values() 代替 Map.values()
   */
  getRuntime: (state) => (runtimeUuid) => {
    for (const runtimes of Object.values(state.wfUuidToRuntimes)) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        return runtime
      }
    }
    console.warn(`Runtime not found: ${runtimeUuid}`)
    return null
  },

  /**
   * 获取运行时节点
   */
  getRuntimeNode: (state, getters) => (runtimeUuid, runtimeNodeUuid) => {
    const runtime = getters.getRuntime(runtimeUuid)
    if (!runtime) return null

    const runtimeNode = runtime.nodes.find(item => item.node_runtime_uuid === runtimeNodeUuid)
    if (!runtimeNode) {
      console.warn(`Runtime node not found: ${runtimeNodeUuid}`)
    }
    return runtimeNode
  },

  /**
   * 判断工作流是否正在运行
   * Vue 2: 检查对象属性是否为 true
   */
  isRunning: (state) => (wfUuid) => {
    return Boolean(state.runningWorkflows[wfUuid])
  },

  /**
   * 获取最新的运行时
   * Vue 2: 使用对象属性访问代替 Map.get()
   */
  getLatestRuntime: (state) => (wfUuid) => {
    const runtimes = state.wfUuidToRuntimes[wfUuid]
    if (!runtimes || runtimes.length === 0) return null
    return runtimes[0] // 最新的在最前面
  }
}

const mutations = {
  /**
   * 初始化运行时
   */
  INIT_RUNTIME (state, runtime) {
    if (!runtime.input) {
      runtime.input = {}
    }
    if (!runtime.output) {
      runtime.output = {}
    }
    if (!runtime.nodes) {
      runtime.nodes = []
    }
    if (!runtime.prologue) {
      runtime.prologue = ''
    }
  },

  /**
   * 设置运行时列表
   * Vue 2: 使用 Vue.set() 确保新属性是响应式的
   */
  SET_RUNTIMES (state, { wfUuid, runtimes }) {
    runtimes.forEach((runtime) => {
      mutations.INIT_RUNTIME(state, runtime)
    })
    // 关键修改：使用 Vue.set() 代替 Map.set()
    Vue.set(state.wfUuidToRuntimes, wfUuid, runtimes.reverse())
  },

  /**
   * 添加运行时到列表头部 (最新的)
   * Vue 2: 使用对象属性和 Vue.set()
   */
  UNSHIFT_RUNTIMES (state, { wfUuid, runtimes }) {
    runtimes.forEach((runtime) => {
      mutations.INIT_RUNTIME(state, runtime)
    })
    const records = state.wfUuidToRuntimes[wfUuid]
    if (records) {
      records.unshift(...runtimes.reverse())
    } else {
      Vue.set(state.wfUuidToRuntimes, wfUuid, runtimes.reverse())
    }
  },

  /**
   * 添加运行时到列表尾部
   * Vue 2: 使用对象属性和 Vue.set()
   */
  APPEND_RUNTIMES (state, { wfUuid, runtimes }) {
    runtimes.forEach((runtime) => {
      mutations.INIT_RUNTIME(state, runtime)
    })
    const records = state.wfUuidToRuntimes[wfUuid]
    if (records) {
      records.push(...runtimes.reverse())
    } else {
      Vue.set(state.wfUuidToRuntimes, wfUuid, runtimes.reverse())
    }
  },

  /**
   * 更新运行时prologue (开场白)
   * Vue 2: 使用 Object.values()
   */
  UPDATE_RUNTIME_PROLOGUE (state, { runtimeUuid, prologue }) {
    for (const runtimes of Object.values(state.wfUuidToRuntimes)) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        runtime.prologue = prologue || ''
        break
      }
    }
  },

  /**
   * 设置运行时节点列表
   * Vue 2: 使用 Object.values()
   */
  SET_RUNTIME_NODES (state, { runtimeUuid, nodes, workflowNodes }) {
    for (const runtimes of Object.values(state.wfUuidToRuntimes)) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        nodes.forEach((node) => {
          if (!node.input) node.input = {}
          if (!node.output) node.output = {}

          // 关联工作流节点信息
          const wfNode = workflowNodes.find(n => n.id === node.node_id)
          if (wfNode) {
            node.node_uuid = wfNode.node_uuid
            node.node_title = wfNode.title
            node.wf_component = wfNode.wf_component
          } else {
            console.error('Workflow node not found for runtime node:', node.node_id)
          }

          node.runtime_uuid = runtime.runtime_uuid
          runtime.nodes.push(node)
        })
        break
      }
    }
  },

  /**
   * 添加运行时节点
   * Vue 2: 使用 Object.values()
   */
  APPEND_RUNTIME_NODE (state, { runtimeUuid, runtimeNode, workflowNodes }) {
    for (const runtimes of Object.values(state.wfUuidToRuntimes)) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        // 关联工作流节点信息
        const wfNode = workflowNodes.find(n => n.id === runtimeNode.node_id)
        if (wfNode) {
          runtimeNode.node_uuid = wfNode.node_uuid
          runtimeNode.node_title = wfNode.title
          runtimeNode.wf_component = wfNode.wf_component
        } else {
          console.warn(`Workflow node not found: ${runtimeNode.node_id}`)
        }

        runtimeNode.runtime_uuid = runtime.runtime_uuid
        if (!runtimeNode.input) runtimeNode.input = {}
        if (!runtimeNode.output) runtimeNode.output = {}

        runtime.nodes.push(runtimeNode)
        break
      }
    }
  },

  /**
   * 添加输入到运行时节点
   * Vue 2: 使用 Object.values()
   */
  APPEND_INPUT_TO_RUNTIME_NODE (state, { runtimeUuid, runtimeNodeUuid, inputJson }) {
    for (const runtimes of Object.values(state.wfUuidToRuntimes)) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        const runtimeNode = runtime.nodes.find(n => n.node_runtime_uuid === runtimeNodeUuid)
        if (runtimeNode) {
          // inputJson: {"name": "input1", "content":{"value": "input1", type: 1}}
          try {
            const obj = JSON.parse(inputJson)
            runtimeNode.input[obj.name] = obj.content
          } catch (e) {
            console.error('Failed to parse input JSON:', inputJson, e)
          }
        }
        break
      }
    }
  },

  /**
   * 添加输出到运行时节点
   * Vue 2: 使用 Object.values()
   */
  APPEND_OUTPUT_TO_RUNTIME_NODE (state, { runtimeUuid, runtimeNodeUuid, outputJson }) {
    for (const runtimes of Object.values(state.wfUuidToRuntimes)) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        const runtimeNode = runtime.nodes.find(n => n.node_runtime_uuid === runtimeNodeUuid)
        if (runtimeNode) {
          try {
            const obj = JSON.parse(outputJson)
            runtimeNode.output[obj.name] = obj.content
          } catch (e) {
            console.error('Failed to parse output JSON:', outputJson, e)
          }
        }
        break
      }
    }
  },

  /**
   * 添加chunk到运行时节点 (流式输出)
   * Vue 2: 使用 Object.values()
   */
  APPEND_CHUNK_TO_RUNTIME_NODE (state, { runtimeUuid, runtimeNodeUuid, chunk }) {
    for (const runtimes of Object.values(state.wfUuidToRuntimes)) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        const runtimeNode = runtime.nodes.find(n => n.node_runtime_uuid === runtimeNodeUuid)
        if (runtimeNode) {
          // 累加chunk到output字段
          if (!runtimeNode.output.output) {
            runtimeNode.output.output = ''
          }
          runtimeNode.output.output += chunk
        }
        break
      }
    }
  },

  /**
   * 更新运行时状态为成功
   * Vue 2: 使用对象属性和 Vue.delete()
   */
  UPDATE_RUNTIME_SUCCESS (state, { wfUuid, runtimeUuid, outputJson }) {
    const runtimes = state.wfUuidToRuntimes[wfUuid]
    if (runtimes) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        runtime.status = RUNTIME_STATUS.SUCCESS
        try {
          runtime.output = JSON.parse(outputJson)
        } catch (e) {
          console.error('Failed to parse output JSON:', outputJson, e)
          runtime.output = { error: 'Invalid JSON output' }
        }
      }
    }
    // 从运行中集合移除
    Vue.delete(state.runningWorkflows, wfUuid)
  },

  /**
   * 更新运行时状态为失败
   * Vue 2: 使用对象属性和 Vue.delete()
   */
  UPDATE_RUNTIME_ERROR (state, { wfUuid, runtimeUuid, errorMsg }) {
    const runtimes = state.wfUuidToRuntimes[wfUuid]
    if (runtimes) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        runtime.status = RUNTIME_STATUS.FAILED
        runtime.status_remark = errorMsg || 'Workflow execution failed'
      }
    }
    // 从运行中集合移除
    Vue.delete(state.runningWorkflows, wfUuid)
  },

  /**
   * 更新运行时状态为运行中
   * Vue 2: 使用对象属性和 Vue.set()
   */
  UPDATE_RUNTIME_RUNNING (state, { wfUuid, runtimeUuid }) {
    const runtimes = state.wfUuidToRuntimes[wfUuid]
    if (runtimes) {
      const runtime = runtimes.find(item => item.runtime_uuid === runtimeUuid)
      if (runtime) {
        runtime.status = RUNTIME_STATUS.RUNNING
      }
    }
    // 添加到运行中集合
    Vue.set(state.runningWorkflows, wfUuid, true)
  },

  /**
   * 删除运行时
   * Vue 2: 使用对象属性
   */
  DELETE_RUNTIME (state, { wfUuid, runtimeUuid }) {
    const runtimes = state.wfUuidToRuntimes[wfUuid]
    if (runtimes) {
      const idx = runtimes.findIndex(item => item.runtime_uuid === runtimeUuid)
      if (idx > -1) {
        runtimes.splice(idx, 1)
      }
    }
  },

  /**
   * 清空工作流的所有运行时
   * Vue 2: 使用 Vue.set() 和 Vue.delete()
   */
  CLEAR_RUNTIMES (state, wfUuid) {
    Vue.set(state.wfUuidToRuntimes, wfUuid, [])
    Vue.delete(state.runningWorkflows, wfUuid)
  },

  /**
   * 设置运行时加载状态
   * Vue 2: 使用 Vue.set()
   */
  SET_RUNTIME_LOADING (state, { wfUuid, loading }) {
    Vue.set(state.wfUuidToRuntimeLoading, wfUuid, loading)
  }
}

const actions = {
  /**
   * 加载工作流运行时历史
   */
  async loadRuntimes ({ commit }, { wfUuid, page = 1, pageSize = 20 }) {
    commit('SET_RUNTIME_LOADING', { wfUuid, loading: true })
    try {
      // TODO: 调用API加载运行时历史
      // const result = await workflowApi.getRuntimeList({ wfUuid, page, pageSize })
      // commit('APPEND_RUNTIMES', { wfUuid, runtimes: result.records })
    } finally {
      commit('SET_RUNTIME_LOADING', { wfUuid, loading: false })
    }
  },

  /**
   * 获取运行时详情
   */
  async loadRuntimeDetail ({ commit, rootGetters }, runtimeUuid) {
    // TODO: 调用API获取运行时详情
    // const runtime = await workflowApi.getRuntimeDetail(runtimeUuid)
    // const workflow = rootGetters['ai/workflow/getWorkflowInfo'](runtime.wf_uuid)
    // commit('SET_RUNTIME_NODES', {
    //   runtimeUuid,
    //   nodes: runtime.nodes,
    //   workflowNodes: workflow.nodes
    // })
  },

  /**
   * 停止工作流运行
   */
  async stopRuntime ({ commit }, runtimeUuid) {
    // TODO: 调用API停止运行时
    // await workflowApi.stopRuntime(runtimeUuid)
  },

  /**
   * 提交人工反馈
   */
  async submitFeedback ({ commit }, { runtimeUuid, feedback }) {
    // TODO: 调用API提交人工反馈
    // await workflowApi.submitFeedback(runtimeUuid, feedback)
  },

  /**
   * 删除运行时
   */
  async deleteRuntime ({ commit }, { wfUuid, runtimeUuid }) {
    // TODO: 调用API删除运行时
    // await workflowApi.deleteRuntime(runtimeUuid)
    commit('DELETE_RUNTIME', { wfUuid, runtimeUuid })
  },

  /**
   * 清空运行时历史
   */
  async clearRuntimes ({ commit }, wfUuid) {
    // TODO: 调用API清空运行时历史
    // await workflowApi.clearRuntimes(wfUuid)
    commit('CLEAR_RUNTIMES', wfUuid)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
