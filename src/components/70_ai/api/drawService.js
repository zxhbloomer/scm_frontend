// AI绘图API服务
// 严格参照 AIDeepin index.ts 中的 Draw API 实现 (lines 270-427)
import request from '@/utils/request'

// API基础路径 - 对应SCM后端DrawController
const API_BASE = '/api/v1/ai/draw'

/**
 * 查询绘图记录详情
 * 对应AIDeepin: fetchDraw(uuid: string)
 * 对应后端: DrawController.getDrawDetail(@PathVariable Long uuid)
 * @param {number} uuid - 绘图记录UUID
 * @returns {Promise} - 绘图记录详情数据
 */
export function fetchDraw (uuid) {
  return request({
    url: `${API_BASE}/${uuid}`,
    method: 'get'
  })
}

/**
 * 生成图片
 * 对应AIDeepin: imageGenerate(params: ImageGenerationParams)
 * 对应后端: DrawController.generate(@RequestBody AiDrawVo drawVo)
 * @param {Object} params - 图片生成参数
 * @param {string} params.prompt - 图片描述提示词
 * @param {string} params.negativePrompt - 反向提示词(可选)
 * @param {string} params.imageSize - 图片尺寸(可选)
 * @param {number} params.num - 生成数量(可选)
 * @param {number} params.modelId - 模型ID(可选)
 * @returns {Promise} - 生成任务信息
 */
export function imageGenerate (params) {
  return request({
    url: `${API_BASE}/generate`,
    method: 'post',
    data: {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt || '',
      image_size: params.imageSize || '',
      num: params.num || 1,
      model_id: params.modelId || null
    }
  })
}

/**
 * 收藏或取消收藏绘图
 * 对应AIDeepin: drawStarOrUnStar(uuid: string)
 * 对应后端: DrawController.star(@PathVariable Long uuid)
 * @param {number} uuid - 绘图记录UUID
 * @returns {Promise} - 操作结果
 */
export function drawStarOrUnStar (uuid) {
  return request({
    url: `${API_BASE}/star/${uuid}`,
    method: 'post'
  })
}

/**
 * 删除绘图记录
 * 对应AIDeepin: deleteDraw(uuid: string)
 * 对应后端: DrawController.softDelete(@PathVariable Long uuid)
 * @param {number} uuid - 绘图记录UUID
 * @returns {Promise} - 删除结果
 */
export function deleteDraw (uuid) {
  return request({
    url: `${API_BASE}/${uuid}`,
    method: 'delete'
  })
}

/**
 * 分页查询绘图记录列表
 * 对应AIDeepin: searchDraws(params: SearchDrawParams)
 * 对应后端: DrawController.listByPage(@RequestBody AiDrawVo drawVo)
 * @param {Object} params - 查询参数
 * @param {number} params.currentPage - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @param {boolean} params.starStatus - 是否只查询收藏(可选)
 * @param {string} params.interactingMethod - 交互方式(可选)
 * @returns {Promise} - 分页数据
 */
export function searchDraws (params) {
  return request({
    url: `${API_BASE}/list`,
    method: 'post',
    data: {
      current_page: params.currentPage,
      page_size: params.pageSize,
      star_status: params.starStatus !== undefined ? params.starStatus : null,
      interacting_method: params.interactingMethod || ''
    }
  })
}

/**
 * 添加绘图评论
 * 对应AIDeepin: addDrawComment(params: DrawCommentParams)
 * 对应后端: DrawController.addComment(@RequestBody AiDrawCommentVo commentVo)
 * @param {Object} params - 评论参数
 * @param {number} params.drawUuid - 绘图记录UUID
 * @param {string} params.comment - 评论内容
 * @returns {Promise} - 添加结果
 */
export function addDrawComment (params) {
  return request({
    url: `${API_BASE}/comment`,
    method: 'post',
    data: {
      draw_uuid: params.drawUuid,
      comment: params.comment
    }
  })
}

/**
 * 查询绘图评论列表
 * 对应AIDeepin: getDrawComments(drawUuid: string)
 * 对应后端: DrawController.listComments(@PathVariable Long drawUuid)
 * @param {number} drawUuid - 绘图记录UUID
 * @returns {Promise} - 评论列表
 */
export function getDrawComments (drawUuid) {
  return request({
    url: `${API_BASE}/comment/${drawUuid}`,
    method: 'get'
  })
}

/**
 * 删除绘图评论
 * 对应AIDeepin: deleteDrawComment(commentId: number)
 * 对应后端: DrawController.deleteComment(@PathVariable Long commentId)
 * @param {number} commentId - 评论ID
 * @returns {Promise} - 删除结果
 */
export function deleteDrawComment (commentId) {
  return request({
    url: `${API_BASE}/comment/${commentId}`,
    method: 'delete'
  })
}

/**
 * 更新绘图评论
 * 对应AIDeepin: updateDrawComment(params: UpdateDrawCommentParams)
 * 对应后端: DrawController.updateComment(@RequestBody AiDrawCommentVo commentVo)
 * @param {Object} params - 更新参数
 * @param {number} params.commentId - 评论ID
 * @param {string} params.comment - 新的评论内容
 * @returns {Promise} - 更新结果
 */
export function updateDrawComment (params) {
  return request({
    url: `${API_BASE}/comment`,
    method: 'put',
    data: {
      id: params.commentId,
      comment: params.comment
    }
  })
}

/**
 * 获取用户收藏的绘图列表
 * 对应AIDeepin: getStarDraws(currentPage: number, pageSize: number)
 * 对应后端: DrawController.listStarDraws(@RequestParam int currentPage, @RequestParam int pageSize)
 * @param {number} currentPage - 当前页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise} - 收藏的绘图分页数据
 */
export function getStarDraws (currentPage, pageSize) {
  return request({
    url: `${API_BASE}/star/list`,
    method: 'post',
    data: {
      current_page: currentPage,
      page_size: pageSize
    }
  })
}

/**
 * 重新生成图片
 * 对应AIDeepin: regenerateDraw(uuid: string)
 * 对应后端: DrawController.regenerate(@PathVariable Long uuid)
 * @param {number} uuid - 原绘图记录UUID
 * @returns {Promise} - 新的生成任务信息
 */
export function regenerateDraw (uuid) {
  return request({
    url: `${API_BASE}/regenerate/${uuid}`,
    method: 'post'
  })
}

/**
 * 图生图
 * 对应AIDeepin: imageToImage(params: ImageToImageParams)
 * 对应后端: DrawController.imageToImage(@RequestBody AiDrawVo drawVo)
 * @param {Object} params - 图生图参数
 * @param {string} params.originalImageUrl - 原始图片URL
 * @param {string} params.prompt - 图片描述提示词
 * @param {string} params.negativePrompt - 反向提示词(可选)
 * @param {number} params.modelId - 模型ID(可选)
 * @returns {Promise} - 生成任务信息
 */
export function imageToImage (params) {
  return request({
    url: `${API_BASE}/image-to-image`,
    method: 'post',
    data: {
      original_image_url: params.originalImageUrl,
      prompt: params.prompt,
      negative_prompt: params.negativePrompt || '',
      model_id: params.modelId || null
    }
  })
}

/**
 * 编辑图片
 * 对应AIDeepin: editImage(params: EditImageParams)
 * 对应后端: DrawController.editImage(@RequestBody AiDrawVo drawVo)
 * @param {Object} params - 图片编辑参数
 * @param {string} params.originalImageUrl - 原始图片URL
 * @param {string} params.maskImageUrl - 蒙版图片URL
 * @param {string} params.prompt - 编辑描述提示词
 * @param {number} params.modelId - 模型ID(可选)
 * @returns {Promise} - 生成任务信息
 */
export function editImage (params) {
  return request({
    url: `${API_BASE}/edit-image`,
    method: 'post',
    data: {
      original_image_url: params.originalImageUrl,
      mask_image_url: params.maskImageUrl,
      prompt: params.prompt,
      model_id: params.modelId || null
    }
  })
}

/**
 * 超分辨率放大图片
 * 对应AIDeepin: upscaleImage(params: UpscaleImageParams)
 * 对应后端: DrawController.upscale(@RequestBody AiDrawVo drawVo)
 * @param {Object} params - 放大参数
 * @param {string} params.originalImageUrl - 原始图片URL
 * @param {number} params.scale - 放大倍数(可选)
 * @returns {Promise} - 生成任务信息
 */
export function upscaleImage (params) {
  return request({
    url: `${API_BASE}/upscale`,
    method: 'post',
    data: {
      original_image_url: params.originalImageUrl,
      scale: params.scale || 2
    }
  })
}

/**
 * 查询生成任务状态
 * 对应AIDeepin: getDrawTaskStatus(taskId: string)
 * 对应后端: DrawController.getTaskStatus(@PathVariable String taskId)
 * @param {string} taskId - 任务ID
 * @returns {Promise} - 任务状态信息
 */
export function getDrawTaskStatus (taskId) {
  return request({
    url: `${API_BASE}/task/status/${taskId}`,
    method: 'get'
  })
}

/**
 * 取消生成任务
 * 对应AIDeepin: cancelDrawTask(taskId: string)
 * 对应后端: DrawController.cancelTask(@PathVariable String taskId)
 * @param {string} taskId - 任务ID
 * @returns {Promise} - 取消结果
 */
export function cancelDrawTask (taskId) {
  return request({
    url: `${API_BASE}/task/cancel/${taskId}`,
    method: 'post'
  })
}

/**
 * 批量删除绘图记录
 * 对应AIDeepin: batchDeleteDraws(uuids: number[])
 * 对应后端: DrawController.batchDelete(@RequestBody List<Long> uuids)
 * @param {number[]} uuids - 绘图记录UUID数组
 * @returns {Promise} - 删除结果
 */
export function batchDeleteDraws (uuids) {
  return request({
    url: `${API_BASE}/batch-delete`,
    method: 'post',
    data: uuids
  })
}

/**
 * 获取绘图统计信息
 * 对应AIDeepin: getDrawStatistics()
 * 对应后端: DrawController.getStatistics()
 * @returns {Promise} - 统计信息
 */
export function getDrawStatistics () {
  return request({
    url: `${API_BASE}/statistics`,
    method: 'get'
  })
}

// 导出所有API函数
export default {
  fetchDraw,
  imageGenerate,
  drawStarOrUnStar,
  deleteDraw,
  searchDraws,
  addDrawComment,
  getDrawComments,
  deleteDrawComment,
  updateDrawComment,
  getStarDraws,
  regenerateDraw,
  imageToImage,
  editImage,
  upscaleImage,
  getDrawTaskStatus,
  cancelDrawTask,
  batchDeleteDraws,
  getDrawStatistics
}
