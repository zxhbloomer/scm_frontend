<!--
elFinder Vue 组件 - 文件管理器和树形结构显示

@version      1.0.0
@author       SCM Team
@summary      基于elFinder的Vue组件，支持JSON数据源树形显示和完整文件管理功能

功能特性：
- 支持 JSON 数据源的树形结构显示
- 完整的 elFinder 文件管理器功能
- 与 Element UI 主题兼容
- 支持多种工作模式（tree/manager/dialog）
- 完整的权限控制和自定义配置

使用方式：
<el-finder
  v-model="selectedFiles"
  :json-data="treeData"
  :width="800"
  :height="600"
  :multiple="true"
  :read-only="false"
  lang="zh_CN"
/>

注意：需要在 index.html 中引入 jQuery 和 jQuery UI
-->

<script>
export default {
  name: 'ElFinder',

  props: {
    // ========== Vue 组件特有参数 ==========

    // v-model 支持
    value: {
      type: [Array, String],
      default: () => []
      // 选中的文件hash数组或单个hash字符串
    },

    // JSON 数据源（核心功能）
    jsonData: {
      type: [Array, Object],
      default: () => []
      // JSON树形数据，支持嵌套children结构
    },

    // 工作模式
    mode: {
      type: String,
      default: 'manager',
      validator: (value) => ['tree', 'manager', 'dialog'].includes(value)
    },

    // Vue组件级别的只读控制
    readOnly: {
      type: Boolean,
      default: false
    },

    // 多选支持
    multiple: {
      type: Boolean,
      default: false
    },

    // 选择文件夹
    selectFolders: {
      type: Boolean,
      default: false
    },

    // ========== 客户端核心参数 ==========

    // 连接器URL
    url: {
      type: String,
      default: ''
    },

    // 自定义数据
    customData: {
      type: Object,
      default: () => ({})
    },

    // 请求类型
    requestType: {
      type: String,
      default: 'POST',
      validator: (value) => ['GET', 'POST'].includes(value)
    },

    // 上传URL
    urlUpload: {
      type: String,
      default: ''
    },

    // ========== 界面布局参数 ==========

    // 界面宽度
    width: {
      type: [Number, String],
      default: 'auto'
    },

    // 界面高度
    height: {
      type: Number,
      default: 400
    },

    // 是否可调整大小
    resizable: {
      type: Boolean,
      default: true
    },

    // 自定义CSS类
    cssClass: {
      type: String,
      default: ''
    },

    // 默认视图模式
    defaultView: {
      type: String,
      default: 'icons',
      validator: (value) => ['icons', 'list'].includes(value)
    },

    // ========== 国际化参数 ==========

    // 界面语言
    lang: {
      type: String,
      default: 'zh_CN',
      validator: (value) => [
        'ar', 'bg', 'ca', 'cs', 'de', 'en', 'es', 'fr', 'hu',
        'jp', 'nl', 'pl', 'pt_BR', 'ru', 'zh_CN'
      ].includes(value)
    },

    // 客户端日期格式化
    clientFormatDate: {
      type: Boolean,
      default: false
    },

    // UTC时区显示
    utcDate: {
      type: Boolean,
      default: false
    },

    // 日期格式
    dateFormat: {
      type: String,
      default: 'Y-m-d H:i:s'
    },

    // 友好日期格式
    fancyDateFormat: {
      type: String,
      default: 'D, d M Y H:i'
    },

    // ========== 行为控制参数 ==========

    // 记住上次目录
    rememberLastDir: {
      type: Boolean,
      default: true
    },

    // 使用浏览器历史
    useBrowserHistory: {
      type: Boolean,
      default: true
    },

    // 只显示特定MIME类型
    onlyMimes: {
      type: Array,
      default: () => []
    },

    // 文件名验证
    validName: {
      type: [RegExp, String],
      default: null
    },

    // 排序字段
    sort: {
      type: String,
      default: 'name',
      validator: (value) => ['name', 'size', 'date'].includes(value)
    },

    // 排序方向
    sortDirect: {
      type: String,
      default: 'asc',
      validator: (value) => ['asc', 'desc'].includes(value)
    },

    // ========== 命令和UI参数 ==========

    // 激活的命令列表
    commands: {
      type: Array,
      default: () => [
        'open', 'reload', 'mkdir', 'mkfile', 'upload', 'copy', 'cut', 'paste',
        'rm', 'rename', 'edit', 'resize', 'selectall', 'chmod', 'netmount',
        'pref', 'help', 'getfile', 'download', 'archive', 'extract'
      ]
    },

    // 命令选项
    commandsOptions: {
      type: Object,
      default: () => ({
        getfile: {
          onlyURL: false,
          multiple: false,
          folders: false,
          oncomplete: ''
        },
        upload: {
          ui: 'uploadbutton'
        },
        quicklook: {
          autoplay: true,
          jplayer: 'extensions/jplayer'
        },
        edit: {
          mimes: [],
          editors: []
        },
        help: {
          view: ['about', 'shortcuts', 'help']
        }
      })
    },

    // UI插件
    ui: {
      type: Array,
      default: () => ['toolbar', 'tree', 'path', 'content', 'contextmenu', 'resize']
    },

    // UI选项
    uiOptions: {
      type: Object,
      default: () => ({
        toolbar: [
          ['back', 'forward'],
          ['mkdir', 'mkfile', 'upload'],
          ['open', 'download', 'getfile'],
          ['info'],
          ['quicklook'],
          ['copy', 'cut', 'paste'],
          ['rm'],
          ['duplicate', 'rename', 'edit', 'resize'],
          ['extract', 'archive'],
          ['search'],
          ['view'],
          ['help']
        ],
        tree: {
          openRootOnLoad: true,
          syncTree: true
        },
        navbar: {
          minWidth: 150,
          maxWidth: 500
        },
        cwd: {
          oldSchool: false,
          listView: {
            columns: ['perm', 'date', 'size', 'kind'],
            columnsCustomName: {}
          }
        }
      })
    },

    // 右键菜单
    contextmenu: {
      type: Object,
      default: () => ({
        navbar: ['open', '|', 'copy', 'cut', 'paste', 'duplicate', '|', 'rm', '|', 'info'],
        cwd: ['reload', 'back', '|', 'upload', 'mkdir', 'mkfile', 'paste', '|', 'info'],
        files: [
          'getfile', '|', 'open', 'quicklook', '|', 'download', '|', 'copy', 'cut', 'paste',
          'duplicate', '|', 'rm', '|', 'edit', 'rename', 'resize', '|', 'archive', 'extract', '|', 'info'
        ]
      })
    },

    // ========== 性能优化参数 ==========

    // 通知延迟
    notifyDelay: {
      type: Number,
      default: 5000
    },

    // 拖拽上传
    dragUploadAllow: {
      type: Boolean,
      default: true
    },

    // 快捷键
    allowShortcuts: {
      type: Boolean,
      default: true
    },

    // 缩略图加载量
    loadTmbs: {
      type: Number,
      default: 4
    },

    // 文件显示量
    showFiles: {
      type: Boolean,
      default: true
    },

    // 显示阈值
    showThreshold: {
      type: Number,
      default: 100
    },

    // iframe超时
    iframeTimeout: {
      type: Number,
      default: 0
    },

    // 同步刷新
    sync: {
      type: Number,
      default: 0
    },

    // ========== 浏览器兼容参数 ==========

    // Cookie选项
    cookie: {
      type: Object,
      default: () => ({
        expires: 30,
        domain: '',
        path: '/',
        secure: false
      })
    },

    // 调试配置
    debug: {
      type: [Array, Boolean],
      default: () => ['error', 'warning', 'event-destroy']
    },

    // ========== 上传配置参数 ==========

    // 上传覆盖
    uploadOverwrite: {
      type: Boolean,
      default: true
    },

    // 允许上传的MIME类型
    uploadAllow: {
      type: Array,
      default: () => []
    },

    // 禁止上传的MIME类型
    uploadDeny: {
      type: Array,
      default: () => []
    },

    // 上传最大大小
    uploadMaxSize: {
      type: [Number, String],
      default: 0
    },

    // ========== 权限控制参数 ==========

    // 默认权限
    defaults: {
      type: Object,
      default: () => ({
        read: true,
        write: true
      })
    },

    // 属性权限
    attributes: {
      type: Array,
      default: () => []
    },

    // 禁用的命令
    disabled: {
      type: Array,
      default: () => []
    },

    // ========== 目录树参数 ==========

    // 树深度
    treeDeep: {
      type: Number,
      default: 1
    },

    // 检查子文件夹
    checkSubfolders: {
      type: [Boolean, Number],
      default: true
    },

    // ========== 回调函数参数 ==========

    // 获取文件回调
    getFileCallback: {
      type: Function,
      default: null
    },

    // 事件处理器
    handlers: {
      type: Object,
      default: () => ({})
    }
  },

  data () {
    return {
      // elFinder实例
      elfinderInstance: null,
      // 容器ID
      containerId: `elfinder-${this._uid}`,
      // 是否已加载
      isLoaded: false,
      // 是否正在初始化
      isInitializing: false
    }
  },

  computed: {
    // 容器样式
    containerStyles () {
      return {
        width: typeof this.width === 'number' ? `${this.width}px` : this.width,
        height: typeof this.height === 'number' ? `${this.height}px` : this.height,
        border: '1px solid #dcdfe6',
        borderRadius: '4px',
        overflow: 'hidden'
      }
    },

    // elFinder配置选项
    elfinderOptions () {
      const baseOptions = {
        // 基础配置
        width: this.width,
        height: this.height,
        lang: this.lang,
        resizable: this.resizable,
        cssClass: this.cssClass,

        // 视图配置
        defaultView: this.defaultView,
        sort: this.sort,
        sortDirect: this.sortDirect,

        // 国际化配置
        clientFormatDate: this.clientFormatDate,
        UTCDate: this.utcDate,
        dateFormat: this.dateFormat,
        fancyDateFormat: this.fancyDateFormat,

        // 行为配置
        rememberLastDir: this.rememberLastDir,
        useBrowserHistory: this.useBrowserHistory,
        onlyMimes: this.onlyMimes,
        validName: this.validName,

        // 命令配置
        commands: this.getFilteredCommands(),
        commandsOptions: this.commandsOptions,

        // UI配置
        ui: this.ui,
        uiOptions: this.uiOptions,
        contextmenu: this.contextmenu,

        // 性能配置
        notifyDelay: this.notifyDelay,
        dragUploadAllow: this.dragUploadAllow,
        allowShortcuts: this.allowShortcuts,
        loadTmbs: this.loadTmbs,
        showFiles: this.showFiles,
        showThreshold: this.showThreshold,
        iframeTimeout: this.iframeTimeout,
        sync: this.sync,

        // 网络配置
        requestType: this.requestType,
        urlUpload: this.urlUpload,

        // 上传配置
        uploadOverwrite: this.uploadOverwrite,
        uploadAllow: this.uploadAllow,
        uploadDeny: this.uploadDeny,
        uploadMaxSize: this.uploadMaxSize,

        // 浏览器兼容
        cookie: this.cookie,
        debug: this.debug,

        // 自定义数据
        customData: this.customData,

        // 事件处理
        handlers: {
          ...this.handlers,
          select: this.handleSelect,
          open: this.handleOpen,
          load: this.handleLoad
        }
      }

      // JSON模式配置
      if (this.jsonData && this.jsonData.length > 0) {
        baseOptions.url = 'javascript:void(0)'
        baseOptions.customData = this.convertJsonToElfinderFormat(this.jsonData)
      } else if (this.url) {
        baseOptions.url = this.url
      }

      // 只读模式配置
      if (this.readOnly || this.disabled.length > 0) {
        const disabledCommands = this.readOnly
          ? ['mkdir', 'mkfile', 'rename', 'rm', 'cut', 'copy', 'paste', 'upload', 'edit', 'resize', 'duplicate', 'archive', 'extract']
          : this.disabled

        baseOptions.commands = baseOptions.commands.filter(cmd => !disabledCommands.includes(cmd))
      }

      // 回调函数
      if (this.getFileCallback) {
        baseOptions.getFileCallback = this.getFileCallback
      }

      return baseOptions
    }
  },

  watch: {
    // 监听JSON数据变化
    jsonData: {
      handler (newData) {
        if (this.elfinderInstance && newData) {
          this.updateJsonData(newData)
        }
      },
      deep: true
    },

    // 监听只读模式变化
    readOnly (newVal) {
      if (this.elfinderInstance) {
        // 重新初始化以应用新的命令配置
        this.reinitialize()
      }
    }
  },

  mounted () {
    this.initElFinder()
  },

  beforeDestroy () {
    this.destroyElFinder()
  },

  methods: {
    /**
     * 初始化 elFinder
     */
    async initElFinder () {
      if (this.isInitializing) return

      this.isInitializing = true

      try {
        await this.loadElFinderResources()
        this.createElFinderInstance()
        this.isLoaded = true
        this.$emit('load', this.elfinderInstance)
      } catch (error) {
        console.error('elFinder 初始化失败:', error)
        this.$emit('error', error)
      } finally {
        this.isInitializing = false
      }
    },

    /**
     * 动态加载 elFinder 资源
     */
    loadElFinderResources () {
      return new Promise((resolve, reject) => {
        // 检查 jQuery
        if (!window.jQuery) {
          reject(new Error('需要在 index.html 中引入 jQuery 和 jQuery UI'))
          return
        }

        // 检查是否已加载
        if (window.jQuery.fn.elfinder) {
          resolve()
          return
        }

        // 加载 elFinder CSS
        this.loadCSS(require('@webjetcms/elfinder/css/elfinder.min.css'))
        this.loadCSS(require('@webjetcms/elfinder/css/theme.css'))

        // 加载 elFinder JS
        const script = document.createElement('script')
        script.src = require('@webjetcms/elfinder/js/elfinder.min.js')
        script.onload = () => {
          // 加载语言包
          if (this.lang && this.lang !== 'en') {
            this.loadLanguage(this.lang).then(resolve).catch(reject)
          } else {
            resolve()
          }
        }
        script.onerror = () => reject(new Error('elFinder 脚本加载失败'))
        document.head.appendChild(script)
      })
    },

    /**
     * 加载CSS文件
     */
    loadCSS (href) {
      if (document.querySelector(`link[href="${href}"]`)) return

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    },

    /**
     * 加载语言包
     */
    loadLanguage (lang) {
      return new Promise((resolve, reject) => {
        try {
          const langScript = document.createElement('script')
          langScript.src = require(`@webjetcms/elfinder/js/i18n/elfinder.${lang}.js`)
          langScript.onload = resolve
          langScript.onerror = () => {
            console.warn(`语言包 ${lang} 加载失败，使用默认语言`)
            resolve()
          }
          document.head.appendChild(langScript)
        } catch (error) {
          console.warn(`语言包 ${lang} 不存在，使用默认语言`)
          resolve()
        }
      })
    },

    /**
     * 创建 elFinder 实例
     */
    createElFinderInstance () {
      const $container = window.jQuery(`#${this.containerId}`)

      if ($container.length === 0) {
        throw new Error('elFinder 容器元素未找到')
      }

      this.elfinderInstance = $container.elfinder(this.elfinderOptions).elfinder('instance')

      if (!this.elfinderInstance) {
        throw new Error('elFinder 实例创建失败')
      }
    },

    /**
     * 销毁 elFinder 实例
     */
    destroyElFinder () {
      if (this.elfinderInstance) {
        try {
          this.elfinderInstance.destroy()
        } catch (error) {
          console.warn('elFinder 销毁时出现警告:', error)
        }
        this.elfinderInstance = null
      }
      this.isLoaded = false
    },

    /**
     * 重新初始化
     */
    async reinitialize () {
      this.destroyElFinder()
      await this.$nextTick()
      await this.initElFinder()
    },

    /**
     * 获取过滤后的命令列表
     */
    getFilteredCommands () {
      let commands = [...this.commands]

      // 如果是只读模式，过滤掉编辑命令
      if (this.readOnly) {
        const editCommands = ['mkdir', 'mkfile', 'rename', 'rm', 'cut', 'copy', 'paste', 'upload', 'edit', 'resize', 'duplicate', 'archive', 'extract']
        commands = commands.filter(cmd => !editCommands.includes(cmd))
      }

      // 过滤掉明确禁用的命令
      if (this.disabled.length > 0) {
        commands = commands.filter(cmd => !this.disabled.includes(cmd))
      }

      return commands
    },

    /**
     * 将 JSON 数据转换为 elFinder 格式
     */
    convertJsonToElfinderFormat (jsonData, parentHash = '') {
      if (!Array.isArray(jsonData)) return []

      const convertedData = []

      jsonData.forEach((item, index) => {
        const hash = item.id || item.hash || `node_${parentHash}_${index}`

        const fileData = {
          name: item.name || item.label || `节点${index}`,
          hash: hash,
          phash: parentHash,
          mime: item.children ? 'directory' : (item.mime || 'text/plain'),
          size: item.size || 0,
          ts: item.timestamp || Date.now(),
          dirs: item.children ? 1 : 0,
          read: 1,
          write: this.readOnly ? 0 : 1,
          locked: this.readOnly ? 1 : 0,
          // 保留原始数据
          ...item.custom
        }

        convertedData.push(fileData)

        // 递归处理子节点
        if (item.children && Array.isArray(item.children)) {
          const childrenData = this.convertJsonToElfinderFormat(item.children, hash)
          convertedData.push(...childrenData)
        }
      })

      return convertedData
    },

    /**
     * 更新JSON数据
     */
    updateJsonData (newData) {
      if (this.elfinderInstance) {
        // TODO: 暂时注释掉未使用的数据转换，后续可能需要用于更新elFinder数据
        // const convertedData = this.convertJsonToElfinderFormat(newData)
        // 这里可以添加更新elFinder数据的逻辑
        // 由于elFinder的限制，可能需要重新初始化
        this.reinitialize()
      }
    },

    /**
     * 文件选择事件处理
     */
    handleSelect (event, elfinderInstance) {
      const selectedFiles = elfinderInstance.selected()
      this.$emit('input', this.multiple ? selectedFiles : selectedFiles[0] || '')
      this.$emit('select', selectedFiles, event)
    },

    /**
     * 文件打开事件处理
     */
    handleOpen (event, elfinderInstance) {
      this.$emit('open', event, elfinderInstance)
    },

    /**
     * 加载完成事件处理
     */
    handleLoad (event, elfinderInstance) {
      this.$emit('load', elfinderInstance)
    },

    /**
     * 获取选中的文件
     */
    getSelectedFiles () {
      return this.elfinderInstance ? this.elfinderInstance.selected() : []
    },

    /**
     * 刷新文件列表
     */
    refresh () {
      if (this.elfinderInstance) {
        this.elfinderInstance.exec('reload')
      }
    },

    /**
     * 获取当前路径
     */
    getCurrentPath () {
      return this.elfinderInstance ? this.elfinderInstance.cwd().hash : ''
    },

    /**
     * 打开指定路径
     */
    openPath (hash) {
      if (this.elfinderInstance) {
        this.elfinderInstance.exec('open', hash)
      }
    }
  },

  render (h) {
    return h('div', {
      attrs: {
        id: this.containerId,
        class: ['elfinder-container', this.cssClass].filter(Boolean).join(' ')
      },
      style: this.containerStyles
    }, [
      // 如果正在初始化或未加载，显示加载状态
      !this.isLoaded && h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#909399',
          fontSize: '14px'
        }
      }, this.isInitializing ? '正在加载 elFinder...' : '初始化中...')
    ])
  }
}
</script>

<style lang="less" scoped>
// elFinder 容器基础样式
.elfinder-container {
  position: relative;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

// 深度样式，与 Element UI 主题兼容
:deep(.elfinder) {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  font-size: 14px;
  border: none;

  // 工具栏样式
  .elfinder-toolbar {
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;

    .elfinder-button {
      border-radius: 3px;
      transition: all 0.3s;

      &:hover {
        background-color: #ecf5ff;
        color: #409eff;
      }

      &.elfinder-button-active,
      &.ui-state-active {
        background-color: #409eff;
        color: #ffffff;
      }
    }

    .elfinder-button-separator {
      border-color: #e4e7ed;
    }
  }

  // 导航栏样式
  .elfinder-navbar {
    background-color: #fafafa;
    border-right: 1px solid #e4e7ed;

    .elfinder-tree {
      .elfinder-navbar-dir {
        &:hover {
          background-color: #f5f7fa;
        }

        &.elfinder-navbar-expanded,
        &.ui-state-active {
          background-color: #ecf5ff;
          color: #409eff;
        }
      }
    }
  }

  // 路径栏样式
  .elfinder-path {
    background-color: #ffffff;
    border-bottom: 1px solid #e4e7ed;

    .elfinder-path-dir {
      &:hover {
        background-color: #f5f7fa;
        color: #409eff;
      }
    }
  }

  // 内容区域样式
  .elfinder-cwd {
    background-color: #ffffff;

    // 图标视图
    .elfinder-cwd-view-icons {
      .elfinder-cwd-file {
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        &.ui-selected {
          background-color: #ecf5ff;
          border-color: #409eff;
        }
      }
    }

    // 列表视图
    .elfinder-cwd-view-list {
      .elfinder-cwd-file {
        &:hover {
          background-color: #f5f7fa;
        }

        &.ui-selected {
          background-color: #ecf5ff;
          color: #409eff;
        }
      }

      .elfinder-cwd-file-wrapper {
        border-bottom: 1px solid #f0f0f0;
      }
    }
  }

  // 状态栏样式
  .elfinder-statusbar {
    background-color: #f5f7fa;
    border-top: 1px solid #e4e7ed;
    color: #606266;
    font-size: 12px;
  }

  // 对话框样式
  .elfinder-dialog {
    .ui-dialog-titlebar {
      background-color: #409eff;
      color: #ffffff;
      border: none;

      .ui-dialog-titlebar-close {
        background: none;
        border: none;

        &:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .ui-dialog-content {
      background-color: #ffffff;
    }

    .ui-dialog-buttonpane {
      background-color: #f5f7fa;
      border-top: 1px solid #e4e7ed;

      .ui-button {
        background-color: #409eff;
        color: #ffffff;
        border: 1px solid #409eff;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #66b1ff;
          border-color: #66b1ff;
        }

        &.ui-priority-secondary {
          background-color: #ffffff;
          color: #606266;
          border-color: #dcdfe6;

          &:hover {
            background-color: #ecf5ff;
            color: #409eff;
            border-color: #c6e2ff;
          }
        }
      }
    }
  }

  // 上下文菜单样式
  .elfinder-contextmenu {
    background-color: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .elfinder-contextmenu-item {
      padding: 8px 12px;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
        color: #409eff;
      }

      &.elfinder-contextmenu-separator {
        border-top: 1px solid #e4e7ed;
        margin: 4px 0;
        padding: 0;
      }
    }
  }

  // 加载动画样式
  .elfinder-spinner {
    .elfinder-spinner-icon {
      border-color: #409eff transparent #409eff transparent;
    }
  }

  // 通知样式
  .elfinder-notify {
    background-color: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    &.elfinder-notify-error {
      background-color: #fef0f0;
      border-color: #fde2e2;
      color: #f56c6c;
    }

    &.elfinder-notify-warning {
      background-color: #fdf6ec;
      border-color: #faecd8;
      color: #e6a23c;
    }

    &.elfinder-notify-success {
      background-color: #f0f9ff;
      border-color: #c6e2ff;
      color: #67c23a;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  :deep(.elfinder) {
    .elfinder-navbar {
      display: none;
    }

    .elfinder-cwd {
      margin-left: 0;
    }
  }
}
</style>
