import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import vue2Jsx from '@vitejs/plugin-vue2-jsx'
import legacy from '@vitejs/plugin-legacy'
import requireContext from '@originjs/vite-plugin-require-context'
import EnvironmentPlugin from 'vite-plugin-environment'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { resolve } from 'path'
// 可选：自定义ESLint插件（在开发模式下检查代码质量）
import viteEslintPlugin from './build/vite-eslint-plugin.js'

export default defineConfig(() => {
  return {
    // 日志级别配置
    logLevel: 'info',
    clearScreen: false,
    base: './',
    // 定义全局变量，解决 Node.js 库在浏览器环境中的兼容性问题
    define: {
      global: 'globalThis',
      'process.env': {}
    },
    plugins: [
      // Vue 2 SFC
      vue(),
      // 启用 Vue 2 JSX，自动注入 h 函数支持JSX组件
      vue2Jsx({
        injectH: true
      }),
      // 兼容 webpack 的 require.context
      requireContext(),
      // 将关键环境变量暴露为 process.env（兼容现有代码，避免Windows系统变量干扰）
      EnvironmentPlugin({
        NODE_ENV: 'production',
        VUE_APP_BASE_API: '/scm',
        VUE_APP_Tenant: 'false', 
        VUE_APP_FILE_UPLOAD_URL: 'http://file.xinyirunscm.com/',
        VUE_APP_Version: '1.0.0'
      }),
      // SVG 图标处理插件
      createSvgIconsPlugin({
        iconDirs: [resolve(__dirname, 'src/icons/svg')],
        symbolId: 'icon-[name]'
      }),
      // 旧浏览器兼容
      legacy({
        targets: ['defaults', 'not IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      }),
      // 开发模式下运行ESLint检查（可选，如不需要可以注释掉）
      ...(process.env.NODE_ENV === 'development' ? [viteEslintPlugin()] : [])
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      // 允许省略 .vue 扩展名
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          // 全局导入 BPM 主题变量，让所有LESS文件都能使用这些变量
          additionalData: `@import "@/assets/bpm/theme.less";`
        },
        scss: {
          // 启用 SCSS 变量导出功能，支持 :export 语法
          additionalData: ``
        }
      },
      modules: {
        // 启用 CSS Modules，支持 SCSS 变量导出
        localsConvention: 'camelCase'
      }
    },
    server: {
      port: 9528,
      open: false,
      // 增强错误显示配置
      overlay: true, // 开启浏览器错误遮罩层
      clearScreen: false, // 不清除终端内容，保留错误信息
      logLevel: 'info', // 详细日志级别
      // HMR热模块替换配置 - 核心优化
      hmr: {
        overlay: true, // HMR错误覆盖层
        clientPort: 9528, // 客户端HMR端口，与服务端保持一致
        port: 9528 // WebSocket端口
      },
      // 文件监听优化配置
      watch: {
        // 忽略大文件夹，提升性能
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.vscode/**'],
        // 启用轮询模式（适用于某些文件系统或Docker环境）
        usePolling: false,
        // 防抖延迟（毫秒）
        interval: 100
      },
      // 代理配置，与原Vue CLI保持一致
      proxy: {
        // SCM后台端代理
        '/scm': {
          target: 'http://127.0.0.1:8088/',
          changeOrigin: true,
          timeout: 600000, // 10分钟超时
          ws: true // 支持WebSocket
        },
        // 文件系统后台端代理
        '/fs': {
          target: 'http://file.xinyirunscm.com/', // 使用生产文件服务地址
          changeOrigin: true,
          timeout: 55000, // 55秒超时
          ws: true // 支持WebSocket
        }
      }
    },
    build: {
      target: 'es2019',
      sourcemap: true, // 开启sourcemap便于错误定位
      rollupOptions: {
        output: {
          manualChunks: {
            monaco: ['monaco-editor'] // Monaco Editor单独分块
          }
        },
        onwarn (warning, warn) {
          // 显示详细的构建警告信息
          console.warn(`构建警告: ${warning.message}`)
          if (warning.loc) {
            console.warn(`位置: ${warning.loc.file}:${warning.loc.line}:${warning.loc.column}`)
          }
          warn(warning)
        },
        onError (error) {
          // 显示详细的构建错误信息
          console.error(`构建错误: ${error.message}`)
          if (error.loc) {
            console.error(`位置: ${error.loc.file}:${error.loc.line}:${error.loc.column}`)
          }
          throw error
        }
      }
    },
    optimizeDeps: {
      // 限定只从根 index.html 作为扫描入口，避免扫描 public 和 demo html
      entries: ['index.html'],
      // 关键：让 esbuild 在扫描阶段把 .vue 的 script 当作 JSX 处理，避免 "JSX syntax extension is not enabled"
      esbuildOptions: {
        loader: {
          '.vue': 'jsx',
          '.js': 'jsx'
        },
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        target: 'es2020', // Monaco Editor需要ES2020支持
        logLevel: 'info', // esbuild详细日志
        logOverride: { // 覆盖特定日志级别
          'this-is-undefined-in-esm': 'silent'
        }
      },
      // 详细的依赖预构建日志
      force: false, // 是否强制重新构建依赖
      include: ['monaco-editor'], // 明确包含monaco-editor
      exclude: [] // 明确排除的依赖
    },
    worker: {
      format: 'es' // Web Workers使用ES模块格式
    }
  }
})
