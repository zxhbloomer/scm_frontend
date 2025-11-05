/**
 * 文件上传工具函数
 * 适配SCM Vue2.7.16
 */

// 导入SVG图标
import csvIcon from '@/assets/fileType/csv-icon.svg'
import docIcon from '@/assets/fileType/doc-icon.svg'
import fileIcon from '@/assets/fileType/file-icon.svg'
import htmlIcon from '@/assets/fileType/html-icon.svg'
import mdIcon from '@/assets/fileType/md-icon.svg'
import pdfIcon from '@/assets/fileType/pdf-icon.svg'
import txtIcon from '@/assets/fileType/txt-icon.svg'
import unknownIcon from '@/assets/fileType/unknown-icon.svg'
import xlsxIcon from '@/assets/fileType/xlsx-icon.svg'
import zipIcon from '@/assets/fileType/zip-icon.svg'

// 文件类型扩展名定义
export const FILE_EXTENSIONS = {
  image: ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP'],
  document: ['PDF', 'DOCX', 'TXT', 'XLS', 'XLSX', 'MD', 'HTML', 'CSV'],
  audio: ['MP3', 'WAV', 'OGG', 'AAC', 'M4A'],
  video: ['MP4', 'AVI', 'MOV', 'WMV'],
  other: ['PPT', 'DOC', 'ZIP', 'RAR']
}

// 文件类型图标映射
const FILE_ICON_MAP = {
  // 图片
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', bmp: 'image',
  // 文档
  pdf: 'pdf', doc: 'word', docx: 'word',
  xls: 'excel', xlsx: 'excel',
  ppt: 'ppt', pptx: 'ppt',
  txt: 'txt', md: 'markdown',
  html: 'html', csv: 'csv',
  // 音频
  mp3: 'audio', wav: 'audio', ogg: 'audio', aac: 'audio', m4a: 'audio',
  // 视频
  mp4: 'video', avi: 'video', mov: 'video', wmv: 'video',
  // 压缩包
  zip: 'zip', rar: 'zip'
}

// SVG图标映射
const FILE_ICONS = {
  image: fileIcon,
  pdf: pdfIcon,
  word: docIcon,
  excel: xlsxIcon,
  ppt: fileIcon,
  txt: txtIcon,
  markdown: mdIcon,
  html: htmlIcon,
  csv: csvIcon,
  audio: fileIcon,
  video: fileIcon,
  zip: zipIcon,
  default: unknownIcon
}

/**
 * 获取文件图标URL
 * @param {string} fileName - 文件名
 * @returns {string} SVG图标路径
 */
export function getFileIconUrl (fileName) {
  if (!fileName) return FILE_ICONS.default

  const extension = fileName.split('.').pop()?.toLowerCase()
  const iconType = FILE_ICON_MAP[extension] || 'default'

  return FILE_ICONS[iconType] || FILE_ICONS.default
}

/**
 * 根据扩展名列表过滤文件
 * @param {Array} fileList - 文件列表
 * @param {Array<string>} extensionList - 扩展名列表
 * @returns {Array} 过滤后的文件列表
 */
export function filterFilesByExtension (fileList, extensionList) {
  if (!fileList || !Array.isArray(fileList)) return []
  if (!extensionList || !Array.isArray(extensionList)) return fileList

  return fileList.filter(file => {
    if (!file.name) return false
    const ext = file.name.split('.').pop()?.toUpperCase()
    return extensionList.includes(ext)
  })
}

/**
 * 获取允许上传的文件类型字符串
 * @param {Object} fileUploadSetting - 文件上传配置
 * @returns {string} accept字符串，如: ".jpg,.png,.pdf"
 */
export function getAcceptFileTypes (fileUploadSetting = {}) {
  const {
    image = true,
    document = true,
    audio = false,
    video = false,
    other = false,
    otherExtensions = []
  } = fileUploadSetting

  let accepts = []

  if (image) accepts = [...accepts, ...FILE_EXTENSIONS.image]
  if (document) accepts = [...accepts, ...FILE_EXTENSIONS.document]
  if (audio) accepts = [...accepts, ...FILE_EXTENSIONS.audio]
  if (video) accepts = [...accepts, ...FILE_EXTENSIONS.video]
  if (other) accepts = [...accepts, ...otherExtensions]

  if (accepts.length === 0) return '*'

  return accepts.map(ext => `.${ext.toLowerCase()}`).join(',')
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大大小（MB）
 * @returns {boolean} 是否通过验证
 */
export function validateFileSize (file, maxSize = 10) {
  if (!file) return false
  if (file.size === 0) return false

  const maxBytes = maxSize * 1024 * 1024
  return file.size <= maxBytes
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {Array<string>} allowedExtensions - 允许的扩展名列表
 * @returns {boolean} 是否通过验证
 */
export function validateFileType (file, allowedExtensions = []) {
  if (!file || !file.name) return false
  if (allowedExtensions.length === 0) return true

  const ext = file.name.split('.').pop()?.toUpperCase()
  return allowedExtensions.includes(ext)
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 */
export function formatFileSize (bytes) {
  if (!bytes || bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 创建符合Element UI upload组件要求的文件对象
 * @param {File} rawFile - 原始文件对象
 * @returns {Object} Element UI文件对象
 */
export function createElUploadFile (rawFile) {
  return {
    uid: Date.now() + Math.random(), // 生成唯一ID
    name: rawFile.name,
    size: rawFile.size,
    raw: rawFile,
    status: 'ready',
    percentage: 0
  }
}

/**
 * 检查是否达到文件数量上限
 * @param {number} currentCount - 当前文件数量
 * @param {number} maxFiles - 最大文件数量
 * @returns {boolean} 是否达到上限
 */
export function checkFilesLimit (currentCount, maxFiles = 5) {
  return currentCount >= maxFiles
}
