// 基于Chatwoot实际配置模式的Tailwind配置
module.exports = {
  darkMode: 'class', // 像Chatwoot一样支持暗色模式
  content: [
    './src/components/70_chat/**/*.{vue,js}' // 仅扫描聊天组件目录
  ],
  // 不使用prefix - 保持Tailwind原生类名
  theme: {
    extend: {
      // 参考Chatwoot的颜色扩展模式
      colors: {
        'chat': {
          primary: 'rgb(var(--el-color-primary-rgb) / <alpha-value>)',
          bg: 'rgb(var(--chat-bg) / <alpha-value>)',
          text: 'rgb(var(--chat-text) / <alpha-value>)',
          border: 'rgb(var(--chat-border) / <alpha-value>)',
          bubble: {
            user: 'rgb(var(--chat-bubble-user) / <alpha-value>)',
            agent: 'rgb(var(--chat-bubble-agent) / <alpha-value>)',
          }
        }
      },
      // 参考Chatwoot的字体系统
      fontFamily: {
        sans: [
          '-apple-system', 'system-ui', 'BlinkMacSystemFont', 
          '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'
        ]
      },
      // 参考Chatwoot的spacing系统
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // 参考Chatwoot的阴影系统
      boxShadow: {
        'chat-soft': '0 1px 3px 0 rgb(var(--chat-border) / 0.1)',
        'chat-strong': '0 4px 6px -1px rgb(var(--chat-border) / 0.25)',
      }
    }
  },
  plugins: []
}