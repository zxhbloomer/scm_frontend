// Vite错误显示增强工具
// 用于在开发环境中更清晰地显示各种错误

/**
 * 增强的错误显示处理器
 */
export function setupErrorHandler () {
  // 只在开发环境启用详细错误显示
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Vite错误显示增强器已启用')

    // 捕获未处理的Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      console.group('🚨 未处理的Promise错误')
      console.error('错误:', event.reason)
      console.error('Promise:', event.promise)
      if (event.reason && event.reason.stack) {
        console.error('堆栈跟踪:', event.reason.stack)
      }
      console.groupEnd()

      // 在页面上显示错误通知
      showErrorNotification('Promise错误', event.reason?.message || '未知错误')
    })

    // 捕获JavaScript运行时错误
    window.addEventListener('error', (event) => {
      console.group('🚨 JavaScript运行时错误')
      console.error('错误信息:', event.message)
      console.error('文件:', event.filename)
      console.error('行号:', event.lineno)
      console.error('列号:', event.colno)
      console.error('错误对象:', event.error)
      if (event.error && event.error.stack) {
        console.error('堆栈跟踪:', event.error.stack)
      }
      console.groupEnd()

      // 在页面上显示错误通知
      showErrorNotification('JavaScript错误', `${event.message} (${event.filename}:${event.lineno})`)
    })

    // Vue错误处理器（如果Vue已经加载）
    if (window.Vue) {
      window.Vue.config.errorHandler = (err, vm, info) => {
        console.group('🚨 Vue组件错误')
        console.error('错误:', err)
        console.error('组件:', vm)
        console.error('详细信息:', info)
        if (err.stack) {
          console.error('堆栈跟踪:', err.stack)
        }
        console.groupEnd()

        showErrorNotification('Vue错误', `${err.message} (${info})`)
      }
    }

    // 网络请求错误监听
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          console.group('🚨 网络请求错误')
          console.error('URL:', args[0])
          console.error('状态码:', response.status)
          console.error('状态文本:', response.statusText)
          console.error('响应头:', Object.fromEntries(response.headers.entries()))
          console.groupEnd()

          showErrorNotification('网络错误', `${response.status} ${response.statusText}`)
        }
        return response
      } catch (error) {
        console.group('🚨 Fetch请求异常')
        console.error('URL:', args[0])
        console.error('错误:', error)
        console.groupEnd()

        showErrorNotification('请求异常', error.message)
        throw error
      }
    }
  }
}

/**
 * 在页面上显示错误通知
 */
function showErrorNotification (title, message) {
  // 创建错误通知元素
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4757;
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 400px;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.4;
    cursor: pointer;
    position: relative;
  `

  // 创建关闭按钮
  const closeBtn = document.createElement('div')
  closeBtn.innerHTML = '×'
  closeBtn.style.cssText = `
    position: absolute;
    top: 4px;
    right: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    opacity: 0.8;
    hover: opacity: 1;
  `

  // 创建内容区域
  const content = document.createElement('div')
  content.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px; padding-right: 20px;">${title}</div>
    <div style="margin-bottom: 8px; padding-right: 20px;">${message}</div>
    <div style="font-size: 10px; opacity: 0.8; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
      点击复制错误信息 | 查看控制台获取详细信息
    </div>
  `

  // 组装通知框
  notification.appendChild(content)
  notification.appendChild(closeBtn)

  // 创建复制成功提示
  function showCopySuccess () {
    const copyTip = document.createElement('div')
    copyTip.innerHTML = '✓ 复制成功'
    copyTip.style.cssText = `
      position: fixed;
      top: 20px;
      right: 430px;
      background: #2ed573;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10001;
      animation: fadeInOut 2s ease-in-out;
    `

    // 添加动画样式
    if (!document.getElementById('copyTipStyle')) {
      const style = document.createElement('style')
      style.id = 'copyTipStyle'
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(20px); }
          20% { opacity: 1; transform: translateX(0); }
          80% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px); }
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(copyTip)

    // 2秒后移除提示
    setTimeout(() => {
      if (copyTip.parentNode) {
        copyTip.remove()
      }
    }, 2000)
  }

  // 点击内容区域复制错误信息
  content.addEventListener('click', async (e) => {
    e.stopPropagation()
    const errorText = `${title}: ${message}`

    try {
      // 尝试使用现代的 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(errorText)
        showCopySuccess()
      } else {
        // 回退到传统的复制方法
        const textArea = document.createElement('textarea')
        textArea.value = errorText
        textArea.style.cssText = 'position:fixed;top:-1000px;left:-1000px;'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showCopySuccess()
      }
    } catch (err) {
      console.error('复制失败:', err)
      // 复制失败时的提示
      const failTip = document.createElement('div')
      failTip.innerHTML = '✗ 复制失败，请手动复制控制台信息'
      failTip.style.cssText = `
        position: fixed;
        top: 20px;
        right: 430px;
        background: #ff4757;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10001;
      `
      document.body.appendChild(failTip)
      setTimeout(() => failTip.remove(), 3000)
    }
  })

  // 点击关闭按钮关闭
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    notification.remove()
  })

  // 鼠标悬停效果
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.opacity = '1'
  })
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.opacity = '0.8'
  })

  // 添加到页面
  document.body.appendChild(notification)

  // 不再自动关闭，用户需要手动关闭
}

/**
 * 显示Vite构建错误（在控制台中更清晰地格式化）
 */
export function formatViteError (error) {
  if (error && error.message) {
    console.group('🚨 Vite构建错误')
    console.error('错误信息:', error.message)

    if (error.id) {
      console.error('文件ID:', error.id)
    }

    if (error.loc) {
      console.error('错误位置:')
      console.error(`  文件: ${error.loc.file || error.id}`)
      console.error(`  行号: ${error.loc.line}`)
      console.error(`  列号: ${error.loc.column}`)
    }

    if (error.frame) {
      console.error('代码片段:')
      console.error(error.frame)
    }

    if (error.stack) {
      console.error('堆栈跟踪:', error.stack)
    }

    console.groupEnd()
  }
}

// 自动设置错误处理器
if (typeof window !== 'undefined') {
  setupErrorHandler()
}
