/**
 * RAG知识库模块统一导出
 * 提供知识库管理、知识项管理、问答等完整功能
 */

import KnowledgeBaseManageDialog from './dialogs/KnowledgeBaseManageDialog.vue'
import KnowledgeBaseEditDialog from './dialogs/KnowledgeBaseEditDialog.vue'
import KnowledgeBaseDetailDialog from './dialogs/KnowledgeBaseDetailDialog.vue'
import KnowledgeBaseQaDialog from './dialogs/KnowledgeBaseQaDialog.vue'
import KnowledgeItemEditDialog from './dialogs/KnowledgeItemEditDialog.vue'
import KnowledgeItemUploadDialog from './dialogs/KnowledgeItemUploadDialog.vue'
import KnowledgeIndexDialog from './dialogs/KnowledgeIndexDialog.vue'
import KnowledgeSelectorDialog from './dialogs/KnowledgeSelectorDialog.vue'
import KnowledgeReferenceDialog from './dialogs/KnowledgeReferenceDialog.vue'
import KnowledgeGraphRefDialog from './dialogs/KnowledgeGraphRefDialog.vue'
import ItemEmbeddingDialog from './dialogs/ItemEmbeddingDialog.vue'
import ItemGraphDialog from './dialogs/ItemGraphDialog.vue'

import ItemEmbeddingList from './components/ItemEmbeddingList.vue'
import ItemGraphViewer from './components/ItemGraphViewer.vue'
import FilePreview from './components/FilePreview.vue'
import QaMessageList from './components/QaMessageList.vue'

import knowledgeBaseService from './api/knowledgeBaseService'

import knowledgeBaseMixin from './mixins/knowledgeBaseMixin'

import * as knowledgeBaseConstants from './constants/knowledgeBase'
import * as indexTypes from './constants/indexTypes'

import * as knowledgeBaseUtils from './utils/knowledgeBaseUtils'
import * as sseUtils from './utils/sseUtils'
import * as graphUtils from './utils/graphUtils'

import knowledgeBaseStore from './store'

export {
  KnowledgeBaseManageDialog,
  KnowledgeBaseEditDialog,
  KnowledgeBaseDetailDialog,
  KnowledgeBaseQaDialog,
  KnowledgeItemEditDialog,
  KnowledgeItemUploadDialog,
  KnowledgeIndexDialog,
  KnowledgeSelectorDialog,
  KnowledgeReferenceDialog,
  KnowledgeGraphRefDialog,
  ItemEmbeddingDialog,
  ItemGraphDialog,
  ItemEmbeddingList,
  ItemGraphViewer,
  FilePreview,
  QaMessageList,
  knowledgeBaseService,
  knowledgeBaseMixin,
  knowledgeBaseConstants,
  indexTypes,
  knowledgeBaseUtils,
  sseUtils,
  graphUtils,
  knowledgeBaseStore
}

export default {
  install (Vue) {
    Vue.component('KnowledgeBaseManageDialog', KnowledgeBaseManageDialog)
    Vue.component('KnowledgeBaseEditDialog', KnowledgeBaseEditDialog)
    Vue.component('KnowledgeBaseDetailDialog', KnowledgeBaseDetailDialog)
    Vue.component('KnowledgeBaseQaDialog', KnowledgeBaseQaDialog)
    Vue.component('KnowledgeItemEditDialog', KnowledgeItemEditDialog)
    Vue.component('KnowledgeItemUploadDialog', KnowledgeItemUploadDialog)
    Vue.component('KnowledgeIndexDialog', KnowledgeIndexDialog)
    Vue.component('KnowledgeSelectorDialog', KnowledgeSelectorDialog)
    Vue.component('KnowledgeReferenceDialog', KnowledgeReferenceDialog)
    Vue.component('KnowledgeGraphRefDialog', KnowledgeGraphRefDialog)
    Vue.component('ItemEmbeddingDialog', ItemEmbeddingDialog)
    Vue.component('ItemGraphDialog', ItemGraphDialog)
    Vue.component('ItemEmbeddingList', ItemEmbeddingList)
    Vue.component('ItemGraphViewer', ItemGraphViewer)
    Vue.component('FilePreview', FilePreview)
    Vue.component('QaMessageList', QaMessageList)
  }
}
