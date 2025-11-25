<template>
  <div
    ref="chatInputContainer"
    class="chat-input-container"
    :class="{ 'is-dragging': isDragging }"
    @drop.prevent="handleDrop"
    @dragover.prevent
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <!-- 文件上传区域 -->
    <div
      v-if="hasUploadedFiles"
    >
      <el-scrollbar>
        <div
          v-loading="uploadLoading"
          style="padding: 8px 12px"
        >
          <el-row :gutter="10">
            <!-- 文档文件预览 -->
            <el-col
              v-for="(item, index) in uploadDocumentList"
              :key="'doc-' + index"
              :span="dynamicColSpan"
            >
              <el-card
                shadow="never"
                class="file-card cursor"
              >
                <div
                  class="file-content"
                  @mouseenter="showDeleteIcon = item.uid"
                  @mouseleave="showDeleteIcon = null"
                >
                  <div class="file-left">
                    <img
                      :src="getFileIcon(item.name)"
                      alt=""
                      width="24"
                    >
                    <div class="file-name" :title="item.name">
                      {{ item.name }}
                    </div>
                  </div>
                  <div
                    v-if="showDeleteIcon === item.uid"
                    class="file-delete-icon"
                    @click="removeFile(item)"
                  >
                    <i class="el-icon-circle-close" style="font-size: 18px" />
                  </div>
                </div>
              </el-card>
            </el-col>

            <!-- 音频文件预览 -->
            <el-col
              v-for="(item, index) in uploadAudioList"
              :key="'audio-' + index"
              :span="dynamicColSpan"
            >
              <el-card
                shadow="never"
                class="file-card cursor"
              >
                <div
                  class="file-content"
                  @mouseenter="showDeleteIcon = item.uid"
                  @mouseleave="showDeleteIcon = null"
                >
                  <div class="file-left">
                    <img
                      :src="getFileIcon(item.name)"
                      alt=""
                      width="24"
                    >
                    <div class="file-name" :title="item.name">
                      {{ item.name }}
                    </div>
                  </div>
                  <div
                    v-if="showDeleteIcon === item.uid"
                    class="file-delete-icon"
                    @click="removeFile(item)"
                  >
                    <i class="el-icon-circle-close" style="font-size: 18px" />
                  </div>
                </div>
              </el-card>
            </el-col>

            <!-- 图片文件预览 -->
            <el-col
              v-for="(item, index) in uploadImageList"
              :key="'img-' + index"
              :span="dynamicColSpan"
            >
              <div
                class="image-preview"
                @mouseenter="showDeleteIcon = item.uid"
                @mouseleave="showDeleteIcon = null"
              >
                <el-image
                  :src="item.url"
                  fit="cover"
                  class="preview-image"
                />
                <i
                  v-if="showDeleteIcon === item.uid"
                  class="el-icon-circle-close image-delete"
                  @click="removeFile(item)"
                />
              </div>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
    </div>

    <div
      class="chat-input-wrapper"
      :class="{
        'focused': isFocused
      }"
    >
      <!-- Workflow 浮动命令菜单 (GitHub Copilot风格) -->
      <div
        v-if="showWorkflowMenu"
        class="workflow-command-menu"
        :style="menuPositionStyle"
        @click.stop
      >
        <!-- 菜单头部 - 搜索框 -->
        <div class="menu-header">
          <input
            ref="menuSearch"
            v-model="searchQuery"
            type="text"
            placeholder="搜索工作流..."
            class="menu-search"
            @input="handleMenuSearch"
            @click.stop
          >
        </div>

        <!-- 菜单项列表 -->
        <div ref="menuItems" class="menu-items">
          <div
            v-for="(wf, index) in filteredWorkflows"
            :key="wf.workflowUuid"
            :class="['menu-item', { 'is-active': index === activeMenuIndex }]"
            @click="handleSelectWorkflow(wf)"
            @mouseenter="activeMenuIndex = index"
          >
            <!-- 左侧图标 -->
            <div class="item-icon">
              <i class="el-icon-s-operation" />
            </div>

            <!-- 右侧内容 -->
            <div class="item-content">
              <div class="item-title">{{ wf.title }}</div>
              <div v-if="wf.desc" class="item-desc">{{ wf.desc }}</div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredWorkflows.length === 0" class="menu-empty">
            <i class="el-icon-search" />
            <p>未找到匹配的工作流</p>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <el-input
        ref="chatInput"
        v-model="userInput"
        type="textarea"
        :rows="1"
        :placeholder="currentPlaceholder"
        :disabled="isLoading"
        resize="none"
        class="user-message-input"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.native="handleKeyDown"
        @input="handleInput"
        @paste.native="handlePaste"
      />

      <!-- 右侧按钮区域 -->
      <div class="chat-input-actions">
        <!-- 附件上传按钮 -->
        <el-upload
          v-if="fileUploadSetting.enabled"
          ref="uploadRef"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :accept="acceptFileTypes"
          :on-change="handleFileChange"
          :disabled="isLoading || isFilesLimitReached"
          multiple
        >
          <el-tooltip
            effect="dark"
            placement="top"
            :content="`上传文件：最多${fileUploadSetting.maxFiles}个，每个不超过${fileUploadSetting.fileLimit}MB`"
          >
            <el-button
              text
              :disabled="isFilesLimitReached || isLoading"
              class="attachment-btn"
            >
              <i class="el-icon-paperclip" />
            </el-button>
          </el-tooltip>
        </el-upload>

        <!-- 分隔线 -->
        <el-divider
          v-if="fileUploadSetting.enabled"
          direction="vertical"
        />

        <!-- 发送按钮 -->
        <el-button
          text
          class="send-button"
          :disabled="isDisabledSend || isLoading || uploadLoading"
          @click="handleSendMessage"
        >
          <i
            v-show="isDisabledSend || isLoading || uploadLoading"
            class="el-icon-s-promotion send-icon-disabled"
          />
          <i
            v-show="!isDisabledSend && !isLoading && !uploadLoading"
            class="el-icon-s-promotion send-icon-active"
          />
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import {
  FILE_EXTENSIONS,
  getFileIconUrl,
  filterFilesByExtension,
  getAcceptFileTypes,
  validateFileSize,
  validateFileType,
  createElUploadFile,
  checkFilesLimit
} from '../../../utils/fileUtils'
import fsRequest from '@/utils/fsRequest'

export default {
  name: 'ChatInputWrap',

  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '输入您的消息'
    },
    // 文件上传配置
    fileUploadSetting: {
      type: Object,
      default: () => ({
        enabled: true,
        maxFiles: 5,
        fileLimit: 10, // MB
        image: true,
        document: true,
        audio: true,
        video: false,
        other: false,
        otherExtensions: []
      })
    },
    // 会话ID，用于文件上传
    sessionId: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      userInput: '',
      isFocused: false,
      // 文件上传相关
      fileAllList: [], // 所有上传的文件
      uploadingDict: {}, // 正在上传的文件字典
      showDeleteIcon: null, // 当前显示删除图标的文件uid
      // 拖拽状态
      isDragging: false, // 是否正在拖拽文件到区域
      dragCounter: 0, // 拖拽计数器，解决子元素触发dragleave的问题
      // 容器宽度监听
      containerWidth: 0, // 容器实际宽度
      resizeObserver: null, // ResizeObserver实例
      // ==================== Workflow Slash Command (2025-11-24) ====================
      showWorkflowMenu: false, // 是否显示workflow浮动菜单
      searchQuery: '', // 菜单搜索关键词
      activeMenuIndex: 0, // 当前高亮的菜单项索引
      menuPosition: { // 菜单位置
        top: '0px',
        left: '0px',
        width: '0px'
      }
    }
  },

  computed: {
    // Vuex Store映射 - Workflow状态
    ...mapState('chat', {
      availableWorkflows: state => state.availableWorkflows,
      selectedWorkflow: state => state.selectedWorkflow,
      isWorkflowMode: state => state.isWorkflowMode
    }),

    // 动态placeholder
    currentPlaceholder () {
      if (this.isWorkflowMode && this.selectedWorkflow) {
        return `@${this.selectedWorkflow.title} - 输入参数并发送 (清空或 / 切换)`
      }
      return this.placeholder
    },

    // 根据容器宽度动态计算列的span值
    dynamicColSpan () {
      if (this.containerWidth === 0) {
        return 24 // 初始状态，单列显示
      }
      // 容器宽度 < 500px: 单列
      if (this.containerWidth < 500) {
        return 24
      }
      // 容器宽度 500-800px: 两列
      if (this.containerWidth < 800) {
        return 12
      }
      // 容器宽度 >= 800px: 三列
      return 8
    },
    // 是否有已上传的文件
    hasUploadedFiles () {
      return this.fileAllList.length > 0
    },
    // 发送按钮是否禁用
    isDisabledSend () {
      return !(this.userInput.trim() || this.hasUploadedFiles)
    },
    // 上传中状态
    uploadLoading () {
      return Object.keys(this.uploadingDict).length > 0
    },
    // 是否达到文件数量限制
    isFilesLimitReached () {
      return checkFilesLimit(this.fileAllList.length, this.fileUploadSetting.maxFiles)
    },
    // 允许的文件类型
    acceptFileTypes () {
      return getAcceptFileTypes(this.fileUploadSetting)
    },
    // 图片文件列表
    uploadImageList () {
      return filterFilesByExtension(this.fileAllList, FILE_EXTENSIONS.image)
    },
    // 文档文件列表
    uploadDocumentList () {
      return filterFilesByExtension(this.fileAllList, FILE_EXTENSIONS.document)
    },
    // 音频文件列表
    uploadAudioList () {
      return filterFilesByExtension(this.fileAllList, FILE_EXTENSIONS.audio)
    },
    // 视频文件列表
    uploadVideoList () {
      return filterFilesByExtension(this.fileAllList, FILE_EXTENSIONS.video)
    },
    // 所有允许的扩展名
    allAllowedExtensions () {
      const exts = []
      if (this.fileUploadSetting.image) exts.push(...FILE_EXTENSIONS.image)
      if (this.fileUploadSetting.document) exts.push(...FILE_EXTENSIONS.document)
      if (this.fileUploadSetting.audio) exts.push(...FILE_EXTENSIONS.audio)
      if (this.fileUploadSetting.video) exts.push(...FILE_EXTENSIONS.video)
      if (this.fileUploadSetting.other) exts.push(...(this.fileUploadSetting.otherExtensions || []))
      return exts
    },
    // ==================== Workflow Slash Command Computed (2025-11-24) ====================
    // 过滤后的workflow列表
    filteredWorkflows () {
      if (!this.searchQuery) {
        return this.availableWorkflows
      }
      const query = this.searchQuery.toLowerCase()
      return this.availableWorkflows.filter(wf => {
        return wf.title.toLowerCase().includes(query) ||
               (wf.desc && wf.desc.toLowerCase().includes(query))
      })
    },
    // 菜单位置样式
    menuPositionStyle () {
      return {
        position: 'fixed',
        top: this.menuPosition.top,
        bottom: this.menuPosition.bottom, // 添加bottom属性
        left: this.menuPosition.left,
        width: this.menuPosition.width,
        zIndex: 9999
      }
    }
  },

  mounted () {
    // 初始化容器宽度监听
    this.initResizeObserver()
  },

  beforeDestroy () {
    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  },

  methods: {
    // Vuex Actions映射
    ...mapActions('chat', [
      'loadAvailableWorkflows',
      'selectWorkflow',
      'executeWorkflowCommand',
      'clearWorkflowSelection'
    ]),

    // 初始化ResizeObserver监听容器宽度变化
    initResizeObserver () {
      const container = this.$refs.chatInputContainer
      if (!container) return

      // 立即获取初始宽度
      this.containerWidth = container.offsetWidth

      // 创建ResizeObserver监听容器尺寸变化
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // 更新容器宽度
          this.containerWidth = entry.contentRect.width
        }
      })

      // 开始监听
      this.resizeObserver.observe(container)
    },

    onFocus () {
      this.isFocused = true
      this.$emit('input-focus')
    },

    onBlur () {
      this.isFocused = false
    },

    handleKeyDown (e) {
      // ==================== Workflow Menu 键盘导航 (2025-11-24) ====================
      if (this.showWorkflowMenu) {
        switch (e.keyCode) {
          case 38: // ↑ 上箭头
            e.preventDefault()
            this.activeMenuIndex = Math.max(0, this.activeMenuIndex - 1)
            this.scrollToActive()
            break

          case 40: // ↓ 下箭头
            e.preventDefault()
            this.activeMenuIndex = Math.min(
              this.filteredWorkflows.length - 1,
              this.activeMenuIndex + 1
            )
            this.scrollToActive()
            break

          case 13: // Enter 确认选择
            e.preventDefault()
            if (this.filteredWorkflows[this.activeMenuIndex]) {
              this.handleSelectWorkflow(this.filteredWorkflows[this.activeMenuIndex])
            }
            break

          case 27: // Esc 关闭菜单
            e.preventDefault()
            this.closeWorkflowMenu()
            break
        }
        return
      }

      // ==================== Workflow Mode Esc 取消 (2025-11-24) ====================
      // 如果处于workflow模式，按Esc取消
      if (this.isWorkflowMode && e.keyCode === 27) {
        e.preventDefault()
        this.clearWorkflowSelection()
        this.userInput = ''
        this.$message.info('已取消工作流选择')
        return
      }

      // 原有的Enter发送消息逻辑
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault()
        this.handleSendMessage()
      }
    },

    handleInput () {
      // ==================== Workflow Slash Command 检测 (2025-11-24) ====================

      // 检测清空输入 - 取消workflow模式
      if (this.userInput === '' && this.isWorkflowMode) {
        // 清空输入时自动退出workflow模式
        this.clearWorkflowSelection()
        this.closeWorkflowMenu()
        return
      }

      // 检测是否输入斜杠 "/"
      if (this.userInput === '/') {
        // 如果已经在workflow模式，先退出
        if (this.isWorkflowMode) {
          this.clearWorkflowSelection()
        }

        // 显示workflow浮动菜单
        this.showWorkflowMenu = true
        this.searchQuery = ''
        this.activeMenuIndex = 0
        // 计算菜单位置
        this.calculateMenuPosition()
        // 加载workflow列表（每次都获取最新数据）
        this.loadAvailableWorkflows().catch(error => {
          console.error('加载workflow列表失败:', error)
          this.$message.error('加载工作流列表失败')
          this.showWorkflowMenu = false
        })
      } else if (!this.userInput.startsWith('/')) {
        // 用户输入了其他内容（不是斜杠开头），关闭菜单
        if (this.showWorkflowMenu && !this.isWorkflowMode) {
          this.closeWorkflowMenu()
        }
      }
    },

    handleSendMessage () {
      // ==================== Workflow Slash Command 执行 (2025-11-24) ====================
      // 如果处于workflow模式，执行workflow命令
      if (this.isWorkflowMode && this.selectedWorkflow) {
        const userInput = this.userInput.trim()
        const fileUrls = this.getAllFileUrls()

        // 执行workflow命令
        this.executeWorkflowCommand({
          userInput,
          fileUrls
        }).then(() => {
          // 清空输入和文件
          this.userInput = ''
          this.fileAllList = []
          this.focusInput()
        }).catch(error => {
          console.error('执行workflow失败:', error)
          this.$message.error('执行工作流失败')
        })
        return
      }

      // 原有的常规消息发送逻辑
      const message = this.userInput?.trim() || (this.hasUploadedFiles ? '发送文件' : '')

      if (message || this.hasUploadedFiles) {
        this.$emit('send-message', {
          content: message,
          files: {
            images: this.uploadImageList,
            documents: this.uploadDocumentList,
            audios: this.uploadAudioList,
            videos: this.uploadVideoList
          }
        })

        // 清空输入和文件
        this.userInput = ''
        this.fileAllList = []
        this.focusInput()
      }
    },

    // 文件上传相关方法
    handleFileChange (file, fileList) {
      this.processFile(file.raw)
    },

    processFile (rawFile) {
      console.log('🔍 processFile开始处理:', rawFile.name)

      // 检查文件数量限制
      if (this.isFilesLimitReached) {
        console.warn('⚠️ 文件数量已达上限')
        this.$message.warning(`最多上传${this.fileUploadSetting.maxFiles}个文件`)
        return
      }

      // 验证文件大小
      console.log('📏 验证文件大小:', rawFile.size, 'bytes, 限制:', this.fileUploadSetting.fileLimit, 'MB')
      if (!validateFileSize(rawFile, this.fileUploadSetting.fileLimit)) {
        if (rawFile.size === 0) {
          console.warn('⚠️ 文件大小为0')
          this.$message.warning('不能上传空文件')
        } else {
          console.warn('⚠️ 文件过大')
          this.$message.warning(`文件大小不能超过${this.fileUploadSetting.fileLimit}MB`)
        }
        return
      }

      // 验证文件类型
      console.log('📝 验证文件类型:', rawFile.type, '允许的扩展名:', this.allAllowedExtensions)
      if (!validateFileType(rawFile, this.allAllowedExtensions)) {
        console.warn('⚠️ 文件类型不支持')
        this.$message.warning('不支持该文件类型')
        return
      }

      // 创建文件对象
      const elFile = createElUploadFile(rawFile)
      console.log('📦 创建文件对象:', elFile)

      // 开始上传
      console.log('🚀 调用uploadFile')
      this.uploadFile(elFile)
    },

    async uploadFile (file) {
      console.log('📤 uploadFile开始:', file.name, file.uid)

      // 标记为上传中
      this.$set(this.uploadingDict, file.uid, true)
      console.log('⏳ 标记为上传中')

      try {
        // 构建FormData
        const formData = new FormData()
        formData.append('file', file.raw)

        // 获取上传URL（带认证参数）
        const uploadUrl = `/api/service/v1/upload?app_key=${import.meta.env.VITE_FILE_SYSTEM_APP_KEY}&secret_key=${import.meta.env.VITE_FILE_SYSTEM_SECRET_KEY}`

        console.log('🌐 开始上传到FS服务器:', uploadUrl)

        // 调用FS服务器上传API
        const response = await fsRequest.post(uploadUrl, formData, {
          headers: { 'content-type': 'multipart/form-data' }
        })

        console.log('✅ FS服务器响应:', response)

        // 响应验证（FS服务器返回格式：{code: 0, message: '', data: {...}}）
        if (!response || !response.data) {
          throw new Error('服务器响应数据为空')
        }

        // 保存完整的FS服务器响应数据
        file.fsResponse = response.data // 完整的响应JSON
        file.url = response.data.url || response.data.fileUrl // 文件访问URL
        file.file_id = response.data.fileId || response.data.id // 文件ID
        file.serverFileName = response.data.fileName || response.data.name || file.name
        file.serverSize = response.data.fileSize || response.data.size || file.size
        file.serverPath = response.data.path // 服务器路径
        file.uploadTime = new Date().toISOString()

        console.log('📦 保存的文件数据:', {
          url: file.url,
          file_id: file.file_id,
          serverFileName: file.serverFileName,
          fsResponse: file.fsResponse
        })

        // 添加到文件列表
        this.fileAllList.push(file)

        // 触发上传成功事件
        this.$emit('file-uploaded', file)
      } catch (error) {
        console.error('文件上传失败：', error)

        // 友好的错误提示
        let errorMsg = '文件上传失败'
        if (error.message) {
          errorMsg += '：' + error.message
        } else if (error.response && error.response.status === 413) {
          errorMsg = '文件过大，服务器拒绝接收'
        } else if (error.code === 'ECONNABORTED') {
          errorMsg = '上传超时，请检查网络连接'
        }

        this.$message.error(errorMsg)

        // 触发上传失败事件
        this.$emit('file-upload-error', { file, error })
      } finally {
        // 移除上传中标记
        this.$delete(this.uploadingDict, file.uid)
      }
    },

    // 粘贴上传
    handlePaste (event) {
      if (!this.fileUploadSetting.enabled) return

      const clipboardData = event.clipboardData
      if (!clipboardData) return

      const files = clipboardData.files
      if (files.length === 0) return

      // 处理粘贴的文件
      Array.from(files).forEach(rawFile => {
        this.processFile(rawFile)
      })

      // 阻止默认粘贴行为
      event.preventDefault()
    },

    // 拖拽进入
    handleDragEnter (event) {
      event.preventDefault()
      this.dragCounter++

      // 只在第一次进入时设置isDragging
      if (this.dragCounter === 1) {
        this.isDragging = true
        console.log('🎯 拖拽进入区域')
      }
    },

    // 拖拽离开
    handleDragLeave (event) {
      event.preventDefault()
      this.dragCounter--

      // 只在完全离开时（计数器归零）才取消isDragging
      if (this.dragCounter === 0) {
        this.isDragging = false
        console.log('👋 拖拽离开区域')
      }
    },

    // 拖拽上传
    handleDrop (event) {
      console.log('🎯 handleDrop触发', event)

      // 重置拖拽状态
      this.isDragging = false
      this.dragCounter = 0

      console.log('📁 fileUploadSetting.enabled:', this.fileUploadSetting.enabled)

      if (!this.fileUploadSetting.enabled) {
        console.warn('⚠️ 文件上传功能已禁用')
        return
      }

      const files = event.dataTransfer?.files
      console.log('📁 拖动的文件数量:', files?.length)
      if (!files || files.length === 0) {
        console.warn('⚠️ 没有检测到文件')
        return
      }

      // 处理拖拽的文件
      console.log('✅ 开始处理拖拽的文件')
      Array.from(files).forEach(rawFile => {
        console.log('📄 处理文件:', rawFile.name, rawFile.size, rawFile.type)
        this.processFile(rawFile)
      })
    },

    // 删除文件
    removeFile (file) {
      const index = this.fileAllList.findIndex(f => f.uid === file.uid)
      if (index > -1) {
        this.fileAllList.splice(index, 1)
      }
    },

    // 获取文件图标
    getFileIcon (fileName) {
      return getFileIconUrl(fileName)
    },

    focusInput () {
      if (this.$refs.chatInput) {
        this.$refs.chatInput.focus()
      }
    },

    // ==================== Workflow Slash Command 方法 (2025-11-24) ====================

    /**
     * 计算菜单位置 - 智能定位(视口边界检测)
     */
    calculateMenuPosition () {
      this.$nextTick(() => {
        // 使用整个输入框容器来计算位置,而不是内部的textarea
        const container = this.$refs.chatInputContainer
        if (!container) return

        // 获取容器位置(包含整个输入框区域)
        const containerRect = container.getBoundingClientRect()

        // 菜单最大高度(与CSS中max-height保持一致)
        const menuMaxHeight = 400

        // 视口高度
        const viewportHeight = window.innerHeight

        // 计算下方剩余空间
        const spaceBelow = viewportHeight - containerRect.bottom
        // 计算上方剩余空间
        const spaceAbove = containerRect.top

        // 判断菜单应该显示在上方还是下方
        // 优先下方,但如果下方空间不足且上方空间更充足,则显示在上方
        const showAbove = spaceBelow < menuMaxHeight + 16 && spaceAbove > spaceBelow

        if (showAbove) {
          // 显示在输入框上方
          // 菜单底部应该在容器顶部上方8px处
          // CSS的bottom = 从视口底部到菜单底部的距离
          // 计算: 视口高度 - (容器顶部位置 - 8px间距)
          const menuBottom = viewportHeight - (containerRect.top - 8)
          this.menuPosition = {
            top: 'auto',
            bottom: `${menuBottom}px`,
            left: `${containerRect.left + 20}px`,
            width: `400px`
          }
        } else {
          // 显示在输入框下方(默认)
          this.menuPosition = {
            top: `${containerRect.bottom + 8}px`,
            bottom: 'auto',
            left: `${containerRect.left}px`,
            width: `${containerRect.width}px`
          }
        }
      })
    },

    /**
     * 关闭workflow菜单
     */
    closeWorkflowMenu () {
      this.showWorkflowMenu = false
      this.searchQuery = ''
      this.activeMenuIndex = 0
    },

    /**
     * 处理选择workflow（完整流程）
     */
    handleSelectWorkflow (workflow) {
      // 1. 调用Vuex action选择workflow
      this.selectWorkflow(workflow)

      // 2. 关闭浮动菜单
      this.closeWorkflowMenu()

      // 3. 清空输入框的 "/"
      this.userInput = ''

      // 4. 聚焦输入框，准备输入workflow参数
      this.$nextTick(() => {
        this.focusInput()
      })
    },

    /**
     * 处理菜单搜索
     */
    handleMenuSearch () {
      // 重置高亮索引到第一项
      this.activeMenuIndex = 0
    },

    /**
     * 滚动到当前高亮项
     */
    scrollToActive () {
      this.$nextTick(() => {
        const activeItem = this.$el.querySelector('.menu-item.is-active')
        if (activeItem) {
          activeItem.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          })
        }
      })
    },

    /**
     * 获取所有文件的URL列表（用于workflow执行）
     */
    getAllFileUrls () {
      const urls = []
      this.fileAllList.forEach(file => {
        if (file.url) {
          urls.push(file.url)
        }
      })
      return urls
    }
  }
}
</script>

<style scoped>
/* 容器样式 */
.chat-input-container {
  position: relative;
  transition: all 0.3s ease;
}

/* 拖拽状态样式 */
.chat-input-container.is-dragging {
  border: 2px dashed #409eff !important;
  background-color: rgba(64, 158, 255, 0.05) !important;
  border-radius: 8px;
  position: relative;
}

.chat-input-container.is-dragging::before {
  content: '拖拽文件到这里上传';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #409eff;
  font-weight: 500;
  pointer-events: none;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 24px;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

/* 文件预览区域 */
.file-preview-area {
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: #f5f7fa;
  padding: 8px;
}

.file-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-delete {
  font-size: 18px;
  color: #F56C6C;
  cursor: pointer;
  margin-left: 8px;
  transition: all 150ms ease;
}

.file-delete:hover {
  transform: scale(1.2);
}

/* 图片预览样式 */
.image-preview {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.image-delete {
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 20px;
  color: #F56C6C;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 150ms ease;
}

.image-delete:hover {
  transform: scale(1.2);
}

/* 新的输入框包装器样式 */
.chat-input-wrapper {
  display: flex;
  align-items: center;
  padding: 0 12px 0 8px;
  border-radius: 7px;
  transition: all 200ms ease;
  background-color: #ffffff;
  box-shadow: 0 0 0 1px rgb(235, 235, 235), 0 0 2px 3px rgba(235, 235, 235, 0.1);
}

.chat-input-wrapper.focused {
  box-shadow: 0 0 0 1px #2781F6, 0 0 2px 3px rgba(39, 129, 246, 0.1);
}

/* MaxKB风格的文件卡片样式 */
.cursor {
  cursor: pointer;
}

.file-card {
  transition: all 0.2s;
}

/* 设置el-card内部的padding为8px */
.file-card ::v-deep .el-card__body {
  padding: 8px !important;
}

.file-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 文件内容容器 - flex布局 */
.file-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-left img {
  flex-shrink: 0;
}

.file-left .file-name {
  margin-left: 4px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #606266;
}

.file-delete-icon {
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-delete-icon:hover {
  color: #F56C6C;
  transform: scale(1.1);
}

/* 按钮区域样式 */
.chat-input-actions {
  display: flex;
  align-items: center;
  padding-left: 8px;
}

/* 完全按照chatwoot的样式 */
.items-center {
  display: flex;
  align-items: center;
}

.flex {
  display: flex;
}

/* ltr:pl-3 rtl:pr-3 ltr:pr-2 rtl:pl-2 */
.ltr\:pl-3 {
  padding-left: 12px;
}

.ltr\:pr-2 {
  padding-right: 8px;
}

/* rounded-[7px] */
.rounded-\[7px\] {
  border-radius: 7px;
}

/* transition-all duration-200 */
.transition-all {
  transition: all 200ms ease;
}

.duration-200 {
  transition-duration: 200ms;
}

/* bg-n-background */
.bg-n-background {
  background-color: #ffffff;
}

/* 简单直接的shadow效果 */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 未选中状态 - 浅灰色边框 */
.shadow-n-strong {
  box-shadow:
    0 0 0 1px rgb(235, 235, 235) !important,
    0 0 2px 3px rgba(235, 235, 235, 0.1) !important;
}

/* 选中状态 - 蓝色边框 */
.shadow-n-brand {
  box-shadow:
    0 0 0 1px #2781F6 !important,
    0 0 2px 3px rgba(39, 129, 246, 0.1) !important;
}

/* 按钮容器 */
.ltr\:pl-2 {
  padding-left: 8px;
}

/* 输入框样式 - 按照chatwoot的user-message-input */
.user-message-input {
  width: 100%;
  border: none;
}

.user-message-input >>> .el-textarea__inner {
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  height: 32px;
  min-height: 32px;
  max-height: 240px;
  padding: 4px 0;
  margin: 8px 0;
  color: #0f172a;
  transition: all 200ms ease;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: none;
}

.user-message-input >>> .el-textarea__inner::placeholder {
  color: #64748b;
}

.user-message-input >>> .el-textarea__inner:focus {
  border: none;
  box-shadow: none;
  background: transparent;
}

/* 按钮样式 */
.attachment-btn {
  min-height: 32px;
  min-width: 32px;
  padding: 4px;
  margin-right: 0;
  border: none !important;
}

.attachment-btn:hover,
.attachment-btn:focus,
.attachment-btn:active {
  border: none !important;
  background: transparent !important;
}

.attachment-btn >>> i {
  font-size: 20px;
}

/* 分隔线样式 */
::v-deep .el-divider--vertical {
  height: 1.5em;
  margin: 0 8px;
  background-color: #e5e7eb;
}

/* 发送按钮样式 */
.send-button {
  min-height: 32px;
  min-width: 32px;
  padding: 4px;
  margin-left: 0;
  border: none !important;
}

.send-button:hover,
.send-button:focus,
.send-button:active {
  border: none !important;
  background: transparent !important;
}

.send-button >>> i {
  font-size: 24px;
}

.send-icon-disabled {
  color: #9ca3af;
}

.send-icon-active {
  color: #3b82f6;
}

/* ==================== Workflow Slash Command 样式 (GitHub Copilot风格) ==================== */

/* 选择器主容器 */
.workflow-selector {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  z-index: 1000;
}

/* 下拉面板全局样式 */
.workflow-selector-dropdown {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
}

/* 选项项容器 - 移除Element UI默认样式 */
.workflow-option-item {
  padding: 0 !important;
  height: auto !important;
  line-height: normal !important;
}

.workflow-option-item:hover {
  background-color: #f5f7fa !important;
}

.workflow-option-item.selected {
  background-color: #ecf5ff !important;
}

/* 选项内容布局 - Flex横向布局 */
.workflow-option {
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  gap: 12px;
  min-height: 60px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 左侧图标 */
.workflow-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

/* 中间内容区域 */
.workflow-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workflow-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workflow-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.workflow-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 选中状态样式优化 */
.workflow-option-item.selected .workflow-icon {
  background: linear-gradient(135deg, #409eff 0%, #53a8ff 100%);
}

.workflow-option-item.selected .workflow-title {
  color: #409eff;
}

/* Hover状态优化 */
.workflow-option-item:hover .workflow-icon {
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(102, 126, 234, 0.3);
}

/* 空状态样式 */
.workflow-selector-dropdown .el-select-dropdown__empty {
  padding: 20px 0;
  color: #909399;
  font-size: 13px;
}

/* ==================== Workflow 浮动命令菜单样式 (GitHub Copilot风格) (2025-11-24) ==================== */

/* 浮动菜单容器 */
.workflow-command-menu {
  position: fixed;
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow: hidden;
  animation: menuFadeIn 0.2s ease;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 菜单头部 - 搜索框 */
.menu-header {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.menu-search {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.menu-search:focus {
  border-color: #409eff;
}

.menu-search::placeholder {
  color: #c0c4cc;
}

/* 菜单项容器 */
.menu-items {
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 0;
}

/* 滚动条美化 */
.menu-items::-webkit-scrollbar {
  width: 6px;
}

.menu-items::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.menu-items::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}

/* 单个菜单项 */
.menu-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px;
}

/* Hover状态 */
.menu-item:hover {
  background-color: #f5f7fa;
}

/* 激活状态(键盘导航) */
.menu-item.is-active {
  background-color: #ecf5ff;
}

.menu-item.is-active .item-icon {
  background: linear-gradient(135deg, #409eff 0%, #53a8ff 100%);
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(64, 158, 255, 0.3);
}

.menu-item.is-active .item-title {
  color: #409eff;
  font-weight: 500;
}

/* 左侧图标 */
.item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.item-icon i {
  font-size: 16px;
}

/* 右侧内容 */
.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title {
  font-size: 14px;
  font-weight: 400;
  color: #303133;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.item-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 空状态 */
.menu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
}

.menu-empty i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.menu-empty p {
  font-size: 14px;
  margin: 0;
}

</style>
