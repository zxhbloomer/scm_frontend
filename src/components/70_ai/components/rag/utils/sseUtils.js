/**
 * SSE流式通信工具
 * 复用scm-ai的SSE模式，适配aideepin知识库问答格式
 */

import { getTokenFromCookie } from './knowledgeBaseUtils'

/**
 * 通用SSE处理器（参考aiChatService.js）
 * @param {string} url - SSE端点URL
 * @param {Object} callbacks - 回调函数
 * @param {AbortSignal} signal - 中止信号
 */
export function sseProcess (url, callbacks = {}, signal = null) {
  const {
    onStart = () => {},
    onThinking = () => {},
    onChunk = () => {},
    onDone = () => {},
    onError = () => {}
  } = callbacks

  let cancelled = false
  const controller = signal ? null : new AbortController()
  const abortSignal = signal || controller.signal

  const connectSSE = async () => {
    try {
      const token = getTokenFromCookie()
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Authorization': token,
        'wms-Token': token
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        signal: abortSignal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let done = false

      // eslint-disable-next-line no-unmodified-loop-condition
      while (!done && !cancelled) {
        const result = await reader.read()
        done = result.done
        const value = result.value
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const messages = buffer.split('\n\n')
        buffer = messages.pop() || ''

        for (const message of messages) {
          if (message.trim() === '') continue

          let eventType = null
          let eventData = ''

          const lines = message.split('\n')
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim()
            } else if (line.startsWith('data:')) {
              eventData = line.slice(5).trim()
            }
          }

          switch (eventType) {
            case '[START]':
              onStart()
              break
            case '[THINKING]':
              onThinking(eventData)
              break
            case '[DONE]':
              onDone(eventData)
              return
            case '[ERROR]':
              onError(new Error(eventData))
              return
            default:
              if (eventData && eventData.trim() !== '') {
                onChunk(eventData)
              }
          }
        }
      }

      if (!cancelled) {
        onDone(buffer)
      }
    } catch (error) {
      if (!cancelled && error.name !== 'AbortError') {
        onError(error)
      }
    }
  }

  connectSSE()

  return () => {
    cancelled = true
    if (controller) {
      controller.abort()
    }
  }
}

/**
 * 创建知识库问答SSE连接
 * @param {string} qaRecordUuid - QA记录UUID
 * @param {Object} callbacks - 回调函数
 * @param {AbortSignal} signal - 中止信号
 */
export function createKbQaStream (qaRecordUuid, callbacks, signal) {
  const baseURL = process.env.VUE_APP_BASE_API || ''
  const url = `${baseURL}/api/v1/ai/knowledge-base/qa/process/${qaRecordUuid}`

  return sseProcess(url, callbacks, signal)
}
