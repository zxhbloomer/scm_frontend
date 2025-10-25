/**
 * SSE 事件处理器
 * 基于 aideepin 原始实现,适配 SCM 前端
 * 用于处理工作流运行时的 SSE 实时反馈
 */

import { parseSSEEventLine, SSE_EVENT_TYPES } from '../constants/sseEvents'

/**
 * 创建 SSE 事件处理器
 * @param {object} options
 * @param {object} options.store Vuex store 实例
 * @param {string} options.wfUuid 工作流 UUID
 * @param {string} options.runtimeUuid 运行时 UUID
 * @param {Array} options.workflowNodes 工作流节点数组（用于关联运行时节点）
 * @param {function} options.onStart 开始回调
 * @param {function} options.onDone 完成回调
 * @param {function} options.onError 错误回调
 * @param {function} options.onNodeRun 节点运行回调 (nodeUuid)
 * @param {function} options.onNodeInput 节点输入回调 (nodeUuid, inputData)
 * @param {function} options.onNodeChunk 节点输出流回调 (nodeUuid, chunk)
 * @param {function} options.onNodeOutput 节点输出回调 (nodeUuid, outputData)
 * @param {function} options.onNodeWaitFeedback 节点等待反馈回调 (nodeUuid)
 * @returns {object} SSE 处理器对象
 */
export function createSSEHandler (options) {
  const {
    store,
    wfUuid,
    runtimeUuid,
    workflowNodes,
    onStart,
    onDone,
    onError,
    onNodeRun,
    onNodeInput,
    onNodeChunk,
    onNodeOutput,
    onNodeWaitFeedback
  } = options

  // 当前事件类型和节点 UUID
  let currentEventType = null
  let currentNodeUuid = null

  /**
   * 开始回调
   */
  function handleStart () {
    // 更新运行时状态为运行中
    store.commit('workflowRuntime/UPDATE_RUNTIME_RUNNING', { wfUuid, runtimeUuid })

    if (onStart) {
      onStart()
    }
  }

  /**
   * 消息接收回调
   * @param {string} chunk 数据片段
   * @param {string} eventName 事件名称
   */
  function handleMessageReceived (chunk, eventName) {
    // 解析事件行
    let parsedEvent = null

    if (eventName) {
      // 有 eventName，直接解析为 event: 行
      parsedEvent = parseSSEEventLine(`event: ${eventName}`)
    } else if (chunk.startsWith('event:')) {
      // chunk 本身是 event: 行
      parsedEvent = parseSSEEventLine(chunk)
    } else if (chunk.startsWith('data:')) {
      // chunk 本身是 data: 行
      parsedEvent = parseSSEEventLine(chunk)
    } else {
      // 假定是纯数据
      parsedEvent = { data: chunk }
    }

    if (!parsedEvent) {
      return
    }

    // 处理事件类型
    if (parsedEvent.type) {
      currentEventType = parsedEvent.type
      currentNodeUuid = parsedEvent.nodeUuid || null

      switch (parsedEvent.type) {
        case SSE_EVENT_TYPES.START:
          handleStart()
          break

        case SSE_EVENT_TYPES.NODE_RUN:
          handleNodeRun(parsedEvent.nodeUuid)
          break

        case SSE_EVENT_TYPES.NODE_INPUT:
          // 等待下一个 data: 行
          break

        case SSE_EVENT_TYPES.NODE_CHUNK:
          // 等待下一个 data: 行（流式输出）
          break

        case SSE_EVENT_TYPES.NODE_OUTPUT:
          // 等待下一个 data: 行
          break

        case SSE_EVENT_TYPES.NODE_WAIT_FEEDBACK:
          handleNodeWaitFeedback(parsedEvent.nodeUuid)
          break

        case SSE_EVENT_TYPES.DONE:
          // 等待下一个 data: 行（输出结果）
          break

        case SSE_EVENT_TYPES.ERROR:
          // 等待下一个 data: 行（错误信息）
          break
      }
    }

    // 处理数据
    if (parsedEvent.data !== undefined) {
      handleEventData(currentEventType, currentNodeUuid, parsedEvent.data)
    }
  }

  /**
   * 处理事件数据
   * @param {string} eventType 事件类型
   * @param {string} nodeUuid 节点 UUID
   * @param {any} data 数据
   */
  function handleEventData (eventType, nodeUuid, data) {
    switch (eventType) {
      case SSE_EVENT_TYPES.START:
        // START 后可能跟 prologue 数据
        if (typeof data === 'string' && data) {
          store.commit('workflowRuntime/UPDATE_RUNTIME_PROLOGUE', {
            runtimeUuid,
            prologue: data
          })
        }
        break

      case SSE_EVENT_TYPES.NODE_INPUT:
        handleNodeInput(nodeUuid, data)
        break

      case SSE_EVENT_TYPES.NODE_CHUNK:
        handleNodeChunk(nodeUuid, data)
        break

      case SSE_EVENT_TYPES.NODE_OUTPUT:
        handleNodeOutput(nodeUuid, data)
        break

      case SSE_EVENT_TYPES.DONE:
        handleDone(data)
        break

      case SSE_EVENT_TYPES.ERROR:
        handleError(data)
        break
    }
  }

  /**
   * 节点开始运行
   * @param {string} nodeUuid 节点 UUID
   */
  function handleNodeRun (nodeUuid) {
    // 创建运行时节点
    const runtimeNode = {
      node_runtime_uuid: nodeUuid + '_runtime', // 临时 UUID，后续会被后端数据覆盖
      node_id: '',
      node_uuid: nodeUuid,
      runtime_uuid: runtimeUuid,
      status: 1, // 运行中
      input: {},
      output: {}
    }

    store.commit('workflowRuntime/APPEND_RUNTIME_NODE', {
      runtimeUuid,
      runtimeNode,
      workflowNodes
    })

    if (onNodeRun) {
      onNodeRun(nodeUuid)
    }
  }

  /**
   * 节点输入数据
   * @param {string} nodeUuid 节点 UUID
   * @param {string} inputJson 输入 JSON 字符串
   */
  function handleNodeInput (nodeUuid, inputJson) {
    // 找到运行时节点的 UUID
    const runtime = store.getters['workflowRuntime/getRuntime'](runtimeUuid)
    if (!runtime) return

    const runtimeNode = runtime.nodes.find(n => n.node_uuid === nodeUuid)
    if (!runtimeNode) return

    store.commit('workflowRuntime/APPEND_INPUT_TO_RUNTIME_NODE', {
      runtimeUuid,
      runtimeNodeUuid: runtimeNode.node_runtime_uuid,
      inputJson: typeof inputJson === 'string' ? inputJson : JSON.stringify(inputJson)
    })

    if (onNodeInput) {
      onNodeInput(nodeUuid, inputJson)
    }
  }

  /**
   * 节点输出流（chunk）
   * @param {string} nodeUuid 节点 UUID
   * @param {string} chunk 数据片段
   */
  function handleNodeChunk (nodeUuid, chunk) {
    // 找到运行时节点的 UUID
    const runtime = store.getters['workflowRuntime/getRuntime'](runtimeUuid)
    if (!runtime) return

    const runtimeNode = runtime.nodes.find(n => n.node_uuid === nodeUuid)
    if (!runtimeNode) return

    store.commit('workflowRuntime/APPEND_CHUNK_TO_RUNTIME_NODE', {
      runtimeUuid,
      runtimeNodeUuid: runtimeNode.node_runtime_uuid,
      chunk: typeof chunk === 'string' ? chunk : JSON.stringify(chunk)
    })

    if (onNodeChunk) {
      onNodeChunk(nodeUuid, chunk)
    }
  }

  /**
   * 节点输出数据
   * @param {string} nodeUuid 节点 UUID
   * @param {string} outputJson 输出 JSON 字符串
   */
  function handleNodeOutput (nodeUuid, outputJson) {
    // 找到运行时节点的 UUID
    const runtime = store.getters['workflowRuntime/getRuntime'](runtimeUuid)
    if (!runtime) return

    const runtimeNode = runtime.nodes.find(n => n.node_uuid === nodeUuid)
    if (!runtimeNode) return

    store.commit('workflowRuntime/APPEND_OUTPUT_TO_RUNTIME_NODE', {
      runtimeUuid,
      runtimeNodeUuid: runtimeNode.node_runtime_uuid,
      outputJson: typeof outputJson === 'string' ? outputJson : JSON.stringify(outputJson)
    })

    if (onNodeOutput) {
      onNodeOutput(nodeUuid, outputJson)
    }
  }

  /**
   * 节点等待人工反馈
   * @param {string} nodeUuid 节点 UUID
   */
  function handleNodeWaitFeedback (nodeUuid) {
    if (onNodeWaitFeedback) {
      onNodeWaitFeedback(nodeUuid)
    }
  }

  /**
   * 工作流完成
   * @param {string} outputJson 输出 JSON 字符串
   */
  function handleDone (outputJson) {
    store.commit('workflowRuntime/UPDATE_RUNTIME_SUCCESS', {
      wfUuid,
      runtimeUuid,
      outputJson: typeof outputJson === 'string' ? outputJson : JSON.stringify(outputJson || {})
    })

    if (onDone) {
      onDone()
    }
  }

  /**
   * 工作流错误
   * @param {string} errorMsg 错误消息
   */
  function handleError (errorMsg) {
    console.error('[SSE] Workflow error:', runtimeUuid, errorMsg)

    store.commit('workflowRuntime/UPDATE_RUNTIME_ERROR', {
      wfUuid,
      runtimeUuid,
      errorMsg: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)
    })

    if (onError) {
      onError(errorMsg)
    }
  }

  return {
    handleStart,
    handleMessageReceived,
    handleDone,
    handleError
  }
}

/**
 * 处理 SSE 原始行数据
 * 用于逐行解析 SSE 流
 * @param {string} line SSE 原始行
 * @param {object} handler SSE 处理器对象
 */
export function processSSELine (line, handler) {
  if (!line || line.trim() === '') {
    return
  }

  // 解析事件行
  const parsedEvent = parseSSEEventLine(line)
  if (parsedEvent && parsedEvent.type) {
    // 事件类型行
    handler.currentEventType = parsedEvent.type
    handler.currentNodeUuid = parsedEvent.nodeUuid || null
  } else if (parsedEvent && parsedEvent.data !== undefined) {
    // 数据行
    if (handler.handleMessageReceived) {
      handler.handleMessageReceived(parsedEvent.data, '')
    }
  }
}

/**
 * 简化的 SSE 事件处理（基于回调）
 * 适用于不需要 Vuex 的场景
 * @param {object} callbacks 回调函数集合
 * @returns {object} 简化的处理器
 */
export function createSimpleSSEHandler (callbacks) {
  const {
    onStart,
    onNodeRun,
    onNodeInput,
    onNodeChunk,
    onNodeOutput,
    onNodeWaitFeedback,
    onDone,
    onError
  } = callbacks

  let currentEventType = null
  let currentNodeUuid = null

  return {
    messageReceived: (chunk, eventName) => {
      let parsedEvent = null

      if (eventName) {
        parsedEvent = parseSSEEventLine(`event: ${eventName}`)
      } else if (chunk.startsWith('event:')) {
        parsedEvent = parseSSEEventLine(chunk)
      } else if (chunk.startsWith('data:')) {
        parsedEvent = parseSSEEventLine(chunk)
      } else {
        parsedEvent = { data: chunk }
      }

      if (!parsedEvent) return

      // 事件类型
      if (parsedEvent.type) {
        currentEventType = parsedEvent.type
        currentNodeUuid = parsedEvent.nodeUuid || null

        switch (parsedEvent.type) {
          case SSE_EVENT_TYPES.START:
            if (onStart) onStart()
            break
          case SSE_EVENT_TYPES.NODE_RUN:
            if (onNodeRun) onNodeRun(parsedEvent.nodeUuid)
            break
          case SSE_EVENT_TYPES.NODE_WAIT_FEEDBACK:
            if (onNodeWaitFeedback) onNodeWaitFeedback(parsedEvent.nodeUuid)
            break
        }
      }

      // 事件数据
      if (parsedEvent.data !== undefined) {
        switch (currentEventType) {
          case SSE_EVENT_TYPES.NODE_INPUT:
            if (onNodeInput) onNodeInput(currentNodeUuid, parsedEvent.data)
            break
          case SSE_EVENT_TYPES.NODE_CHUNK:
            if (onNodeChunk) onNodeChunk(currentNodeUuid, parsedEvent.data)
            break
          case SSE_EVENT_TYPES.NODE_OUTPUT:
            if (onNodeOutput) onNodeOutput(currentNodeUuid, parsedEvent.data)
            break
          case SSE_EVENT_TYPES.DONE:
            if (onDone) onDone(parsedEvent.data)
            break
          case SSE_EVENT_TYPES.ERROR:
            if (onError) onError(parsedEvent.data)
            break
        }
      }
    }
  }
}
