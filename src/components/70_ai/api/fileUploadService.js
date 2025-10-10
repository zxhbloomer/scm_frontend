/**
 * 聊天文件上传API服务
 */
import request from '@/utils/request'

/**
 * 上传聊天文件
 * @param {File} file - 文件对象
 * @param {string} conversationId - 会话ID
 * @returns {Promise}
 */
export function uploadChatFile (file, conversationId) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('conversationId', conversationId)
  formData.append('fileType', 'CHAT')

  return request({
    url: '/api/v1/ai/chat/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量上传聊天文件
 * @param {Array<File>} files - 文件数组
 * @param {string} conversationId - 会话ID
 * @returns {Promise<Array>}
 */
export async function uploadChatFiles (files, conversationId) {
  const promises = files.map(file => uploadChatFile(file, conversationId))
  return Promise.all(promises)
}

/**
 * 删除聊天文件
 * @param {string} fileId - 文件ID
 * @returns {Promise}
 */
export function deleteChatFile (fileId) {
  return request({
    url: `/api/v1/ai/chat/file/${fileId}`,
    method: 'delete'
  })
}

/**
 * 获取文件信息
 * @param {string} fileId - 文件ID
 * @returns {Promise}
 */
export function getChatFileInfo (fileId) {
  return request({
    url: `/api/v1/ai/chat/file/${fileId}`,
    method: 'get'
  })
}

export default {
  uploadChatFile,
  uploadChatFiles,
  deleteChatFile,
  getChatFileInfo
}
