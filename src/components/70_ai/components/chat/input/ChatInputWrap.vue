<template>
  <div
    ref="chatInputContainer"
    class="chat-input-container"
    @drop.prevent="handleDrop"
    @dragover.prevent
  >
    <!-- 文件上传区域 -->
    <div
      v-if="hasUploadedFiles"
      class="file-preview-area"
    >
      <el-scrollbar max-height="136px">
        <div
          v-loading="uploadLoading"
          class="file-preview-content"
        >
          <!-- 文档文件预览 -->
          <div
            v-for="(item, index) in uploadDocumentList"
            :key="'doc-' + index"
            class="file-card"
            @mouseenter="showDeleteIcon = item.uid"
            @mouseleave="showDeleteIcon = null"
          >
            <div class="file-info">
              <img
                :src="getFileIcon(item.name)"
                class="file-icon"
              >
              <div
                class="file-name"
                :title="item.name"
              >
                {{ item.name }}
              </div>
            </div>
            <i
              v-if="showDeleteIcon === item.uid"
              class="el-icon-circle-close file-delete"
              @click="removeFile(item)"
            />
          </div>

          <!-- 图片文件预览 -->
          <div
            v-for="(item, index) in uploadImageList"
            :key="'img-' + index"
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

          <!-- 音频文件预览 -->
          <div
            v-for="(item, index) in uploadAudioList"
            :key="'audio-' + index"
            class="file-card"
            @mouseenter="showDeleteIcon = item.uid"
            @mouseleave="showDeleteIcon = null"
          >
            <div class="file-info">
              <img
                :src="getFileIcon(item.name)"
                class="file-icon"
              >
              <div
                class="file-name"
                :title="item.name"
              >
                {{ item.name }}
              </div>
            </div>
            <i
              v-if="showDeleteIcon === item.uid"
              class="el-icon-circle-close file-delete"
              @click="removeFile(item)"
            />
          </div>
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
    }
  },

  data () {
    return {
      userInput: '',
      isFocused: false,
      // 文件上传相关
      fileAllList: [], // 所有上传的文件
      uploadingDict: {}, // 正在上传的文件字典
      showDeleteIcon: null // 当前显示删除图标的文件uid
    }
  },

  computed: {
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

  methods: {
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
      // 检查文件数量限制
      if (this.isFilesLimitReached) {
        this.$message.warning(`最多上传${this.fileUploadSetting.maxFiles}个文件`)
        return
      }

      // 验证文件大小
      if (!validateFileSize(rawFile, this.fileUploadSetting.fileLimit)) {
        if (rawFile.size === 0) {
          this.$message.warning('不能上传空文件')
        } else {
          this.$message.warning(`文件大小不能超过${this.fileUploadSetting.fileLimit}MB`)
        }
        return
      }

      // 验证文件类型
      if (!validateFileType(rawFile, this.allAllowedExtensions)) {
        this.$message.warning('不支持该文件类型')
        return
      }

      // 创建文件对象
      const elFile = createElUploadFile(rawFile)

      // 开始上传
      this.uploadFile(elFile)
    },

    async uploadFile (file) {
      // 标记为上传中
      this.$set(this.uploadingDict, file.uid, true)

      try {
        // 这里调用实际的上传API
        // const response = await this.$api.uploadChatFile(file.raw)
        // file.url = response.data.url
        // file.file_id = response.data.file_id

        // 临时模拟上传成功
        await new Promise(resolve => setTimeout(resolve, 500))
        file.url = URL.createObjectURL(file.raw)
        file.file_id = file.uid

        // 添加到文件列表
        this.fileAllList.push(file)
      } catch (error) {
        this.$message.error('文件上传失败：' + (error.message || '未知错误'))
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

    // 拖拽上传
    handleDrop (event) {
      if (!this.fileUploadSetting.enabled) return

      const files = event.dataTransfer?.files
      if (!files) return

      // 处理拖拽的文件
      Array.from(files).forEach(rawFile => {
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
}

/* 文件预览区域 */
.file-preview-area {
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: #f5f7fa;
  padding: 8px;
}

.file-preview-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
}

/* 文件卡片样式 */
.file-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 150ms ease;
  min-width: 200px;
  max-width: 300px;
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
