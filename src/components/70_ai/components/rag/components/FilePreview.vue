<template>
  <div class="file-preview">
    <div v-if="loading" class="loading-container">
      <i class="el-icon-loading" />
      <span>加载中...</span>
    </div>

    <div v-else-if="!hasFile" class="text-content">
      <div class="content-header">
        <span class="content-title">文本内容</span>
      </div>
      <div class="text-viewer">
        {{ itemData.remark || '无内容' }}
      </div>
    </div>

    <div v-else class="file-content">
      <div class="content-header">
        <span class="content-title">文件预览</span>
        <el-button
          v-if="fileUrl"
          size="small"
          type="primary"
          @click="handleDownload"
        >
          下载文件
        </el-button>
      </div>

      <div class="preview-container">
        <div v-if="isImage" class="image-preview">
          <img :src="fileUrl" :alt="itemData.title">
        </div>

        <div v-else-if="isPdf" class="pdf-preview">
          <iframe
            :src="fileUrl"
            frameborder="0"
            width="100%"
            height="600px"
          />
        </div>

        <div v-else-if="isText" class="text-preview">
          <pre>{{ fileContent }}</pre>
        </div>

        <div v-else class="unsupported-preview">
          <i class="el-icon-document" />
          <p>该文件类型暂不支持预览</p>
          <p class="file-info">文件名: {{ itemData.fileName }}</p>
          <el-button
            type="primary"
            @click="handleDownload"
          >
            下载文件
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilePreview',

  props: {
    itemData: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      loading: false,
      fileContent: ''
    }
  },

  computed: {
    hasFile () {
      return this.itemData.filePath && this.itemData.fileName
    },

    fileUrl () {
      if (!this.hasFile) {
        return ''
      }

      const fileUploadUrl = process.env.VUE_APP_FILE_UPLOAD_URL || ''
      return `${fileUploadUrl}${this.itemData.filePath}`
    },

    fileExtension () {
      if (!this.itemData.fileName) {
        return ''
      }
      const parts = this.itemData.fileName.split('.')
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
    },

    isImage () {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
      return imageExtensions.includes(this.fileExtension)
    },

    isPdf () {
      return this.fileExtension === 'pdf'
    },

    isText () {
      const textExtensions = ['txt', 'md', 'json', 'xml', 'csv', 'log']
      return textExtensions.includes(this.fileExtension)
    }
  },

  watch: {
    itemData: {
      handler () {
        if (this.isText && this.hasFile) {
          this.loadTextFile()
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * 加载文本文件内容
     */
    async loadTextFile () {
      if (!this.fileUrl) {
        return
      }

      this.loading = true
      try {
        const response = await fetch(this.fileUrl)
        this.fileContent = await response.text()
      } catch (error) {
        this.$message.error('加载文件失败: ' + (error.message || '未知错误'))
        this.fileContent = '文件加载失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 下载文件
     */
    handleDownload () {
      if (!this.fileUrl) {
        return
      }

      const link = document.createElement('a')
      link.href = this.fileUrl
      link.download = this.itemData.fileName || 'download'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<style scoped>
.file-preview {
  width: 100%;
  min-height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
}

.loading-container i {
  font-size: 32px;
  margin-bottom: 10px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 15px;
}

.content-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.text-content {
  padding: 15px;
}

.text-viewer {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
  color: #606266;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
}

.file-content {
  padding: 15px;
}

.preview-container {
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #ffffff;
}

.image-preview img {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.pdf-preview {
  background-color: #ffffff;
}

.text-preview {
  padding: 15px;
  background-color: #ffffff;
  max-height: 600px;
  overflow-y: auto;
}

.text-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
  color: #606266;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #ffffff;
  color: #909399;
}

.unsupported-preview i {
  font-size: 64px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

.unsupported-preview p {
  margin: 5px 0;
  font-size: 14px;
}

.file-info {
  color: #606266;
  margin-bottom: 20px;
}
</style>
