/**
 * app store 模块
 * 用于管理全局应用级别数据，包括AI模型列表
 * 严格参考 aideepin 的 app store 实现
 * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\store\modules\app\index.ts
 */

import { getLlmModels, getVisionModels, getEmbeddingModels, getDefaultModels } from '../../api/model'

const state = {
  /**
   * LLM模型列表（支持聊天的模型）
   * 格式：[{id, name, modelName, provider, deploymentName}, ...]
   */
  llms: [],

  /**
   * Vision模型列表（支持视觉的模型）
   */
  visionModels: [],

  /**
   * Embedding模型列表（支持嵌入的模型）
   */
  embeddingModels: [],

  /**
   * 默认模型配置
   * 格式：{llm: modelId, vision: modelId, embedding: modelId}
   */
  defaultModels: {}
}

const getters = {
  /**
   * 获取LLM模型列表，用于下拉选择
   * 返回格式：[{label: name, value: id}, ...]
   */
  llmOptions: state => {
    return state.llms.map(model => ({
      label: model.name,
      value: model.id,
      modelName: model.modelName,
      provider: model.provider,
      deploymentName: model.deploymentName
    }))
  },

  /**
   * 获取Vision模型列表选项
   */
  visionOptions: state => {
    return state.visionModels.map(model => ({
      label: model.name,
      value: model.id,
      modelName: model.modelName,
      provider: model.provider,
      deploymentName: model.deploymentName
    }))
  },

  /**
   * 获取Embedding模型列表选项
   */
  embeddingOptions: state => {
    return state.embeddingModels.map(model => ({
      label: model.name,
      value: model.id,
      modelName: model.modelName,
      provider: model.provider,
      deploymentName: model.deploymentName
    }))
  },

  /**
   * 根据模型ID获取模型对象
   */
  getLlmById: state => id => {
    return state.llms.find(model => model.id === id)
  },

  getVisionById: state => id => {
    return state.visionModels.find(model => model.id === id)
  },

  getEmbeddingById: state => id => {
    return state.embeddingModels.find(model => model.id === id)
  }
}

const mutations = {
  SET_LLMS (state, llms) {
    state.llms = llms
  },

  SET_VISION_MODELS (state, models) {
    state.visionModels = models
  },

  SET_EMBEDDING_MODELS (state, models) {
    state.embeddingModels = models
  },

  SET_DEFAULT_MODELS (state, defaults) {
    state.defaultModels = defaults
  }
}

const actions = {
  /**
   * 加载所有类型的模型
   * 严格参考 aideepin App.vue onMounted 方法
   */
  async loadAllModels ({ dispatch }) {
    try {
      await Promise.all([
        dispatch('loadLLMs'),
        dispatch('loadVisionModels'),
        dispatch('loadEmbeddingModels'),
        dispatch('loadDefaultModels')
      ])
    } catch (error) {
      console.error('加载模型列表失败:', error)
      throw error
    }
  },

  /**
   * 加载LLM模型列表
   */
  async loadLLMs ({ commit }) {
    try {
      const response = await getLlmModels()
      // scm系统响应格式：response.data 直接是数据数组
      if (response.data) {
        commit('SET_LLMS', response.data)
      }
    } catch (error) {
      console.error('加载LLM模型失败:', error)
      throw error
    }
  },

  /**
   * 加载Vision模型列表
   */
  async loadVisionModels ({ commit }) {
    try {
      const response = await getVisionModels()
      // scm系统响应格式：response.data 直接是数据数组
      if (response.data) {
        commit('SET_VISION_MODELS', response.data)
      }
    } catch (error) {
      console.error('加载Vision模型失败:', error)
      throw error
    }
  },

  /**
   * 加载Embedding模型列表
   */
  async loadEmbeddingModels ({ commit }) {
    try {
      const response = await getEmbeddingModels()
      // scm系统响应格式：response.data 直接是数据数组
      if (response.data) {
        commit('SET_EMBEDDING_MODELS', response.data)
      }
    } catch (error) {
      console.error('加载Embedding模型失败:', error)
      throw error
    }
  },

  /**
   * 加载默认模型配置
   */
  async loadDefaultModels ({ commit }) {
    try {
      const response = await getDefaultModels()
      // scm系统响应格式：response.data 直接是数据对象
      if (response.data) {
        commit('SET_DEFAULT_MODELS', response.data)
      }
    } catch (error) {
      console.error('加载默认模型配置失败:', error)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
