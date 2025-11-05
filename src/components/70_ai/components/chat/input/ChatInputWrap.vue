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
      <!-- 输入框 -->
      <el-input
        ref="chatInput"
        v-model="userInput"
        type="textarea"
        :rows="1"
        :placeholder="placeholder"
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
      resizeObserver: null // ResizeObserver实例
    }
  },

  computed: {
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
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault()
        this.handleSendMessage()
      }
    },

    handleInput () {
      // 处理输入变化
    },

    handleSendMessage () {
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
</style>
