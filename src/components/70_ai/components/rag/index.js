/**
 * RAG知识库模块统一导出
 * 提供知识库管理、知识项管理、问答等完整功能
 */

import KnowledgeBaseManageDialog from './dialogs/KnowledgeBaseManageDialog.vue'
import KnowledgeBaseEditDialog from './dialogs/KnowledgeBaseEditDialog.vue'
import KnowledgeBaseDetailDialog from './dialogs/KnowledgeBaseDetailDialog.vue'
import KnowledgeItemEditDialog from './dialogs/KnowledgeItemEditDialog.vue'
import KnowledgeItemUploadDialog from './dialogs/KnowledgeItemUploadDialog.vue'
import KnowledgeIndexDialog from './dialogs/KnowledgeIndexDialog.vue'
import ItemEmbeddingDialog from './dialogs/ItemEmbeddingDialog.vue'
import ItemGraphDialog from './dialogs/ItemGraphDialog.vue'
import RagChatDialog from './dialogs/RagChatDialog.vue'
import RagChatGraphDialog from './dialogs/RagChatGraphDialog.vue'
import RagChatRefDialog from './dialogs/RagChatRefDialog.vue'
import RagQaHistoryDialog from './dialogs/RagQaHistoryDialog.vue'

import ItemEmbeddingList from './components/ItemEmbeddingList.vue'
import ItemGraphViewer from './components/ItemGraphViewer.vue'
import FilePreview from './components/FilePreview.vue'
import QaMessageList from './components/QaMessageList.vue'

import knowledgeBaseService from '../../api/knowledgeBaseService'

import * as knowledgeBaseConstants from './constants/knowledgeBase'
import * as indexTypes from './constants/indexTypes'

import * as knowledgeBaseUtils from './utils/knowledgeBaseUtils'
import * as sseUtils from './utils/sseUtils'
import * as graphUtils from './utils/graphUtils'

export {
  KnowledgeBaseManageDialog,
  KnowledgeBaseEditDialog,
  KnowledgeBaseDetailDialog,
  KnowledgeItemEditDialog,
  KnowledgeItemUploadDialog,
  KnowledgeIndexDialog,
  ItemEmbeddingDialog,
  ItemGraphDialog,
  RagChatDialog,
  RagChatGraphDialog,
  RagChatRefDialog,
  RagQaHistoryDialog,
  ItemEmbeddingList,
  ItemGraphViewer,
  FilePreview,
  QaMessageList,
  knowledgeBaseService,
  knowledgeBaseConstants,
  indexTypes,
  knowledgeBaseUtils,
  sseUtils,
  graphUtils
}

export default {
  install (Vue) {
    Vue.component('KnowledgeBaseManageDialog', KnowledgeBaseManageDialog)
    Vue.component('KnowledgeBaseEditDialog', KnowledgeBaseEditDialog)
    Vue.component('KnowledgeBaseDetailDialog', KnowledgeBaseDetailDialog)
    Vue.component('KnowledgeItemEditDialog', KnowledgeItemEditDialog)
    Vue.component('KnowledgeItemUploadDialog', KnowledgeItemUploadDialog)
    Vue.component('KnowledgeIndexDialog', KnowledgeIndexDialog)
    Vue.component('ItemEmbeddingDialog', ItemEmbeddingDialog)
    Vue.component('ItemGraphDialog', ItemGraphDialog)
    Vue.component('RagChatDialog', RagChatDialog)
    Vue.component('RagChatGraphDialog', RagChatGraphDialog)
    Vue.component('RagChatRefDialog', RagChatRefDialog)
    Vue.component('RagQaHistoryDialog', RagQaHistoryDialog)
    Vue.component('ItemEmbeddingList', ItemEmbeddingList)
    Vue.component('ItemGraphViewer', ItemGraphViewer)
    Vue.component('FilePreview', FilePreview)
    Vue.component('QaMessageList', QaMessageList)
  }
}
