<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="1000px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="kb-qa-container">
      <qa-message-list
        :messages="displayMessages"
        @view-reference="handleViewReference"
        @view-graph-ref="handleViewGraphRef"
        @delete="handleDeleteMessage"
      />

      <div class="input-area">
        <el-input
          v-model="inputQuestion"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题..."
          :disabled="sending"
          @keydown.enter.ctrl.native="handleSend"
        />
        <div class="input-actions">
          <span class="input-tip">Ctrl + Enter 发送</span>
          <el-button
            type="primary"
            :loading="sending"
            :disabled="!canSend"
            @click="handleSend"
          >
            {{ sending ? '发送中...' : '发送' }}
          </el-button>
        </div>
      </div>
    </div>

    <knowledge-reference-dialog
      :visible.sync="referenceDialogVisible"
      :qa-record-uuid="currentQaRecordUuid"
    />

    <knowledge-graph-ref-dialog
      :visible.sync="graphRefDialogVisible"
      :qa-record-uuid="currentQaRecordUuid"
    />
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { createKbQaStream } from '../utils/sseUtils'
import { createEmptyQaRecord } from '../utils/knowledgeBaseUtils'
import knowledgeBaseService from '../api/knowledgeBaseService'
import QaMessageList from '../components/QaMessageList.vue'
import KnowledgeReferenceDialog from './KnowledgeReferenceDialog.vue'
import KnowledgeGraphRefDialog from './KnowledgeGraphRefDialog.vue'
import elDragDialog from '@/directive/el-drag-dialog'

export default {

  name: 'KnowledgeBaseQaDialog',
  directives: { elDragDialog },

  components: {
    QaMessageList,
    KnowledgeReferenceDialog,
    KnowledgeGraphRefDialog
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    kbUuid: {
      type: String,
      default: ''
    },
    kbTitle: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      inputQuestion: '',
      sending: false,
      currentQaRecordUuid: '',
      referenceDialogVisible: false,
      graphRefDialogVisible: false,
      sseAbortController: null,
      currentStreamingRecord: null
    }
  },

  computed: {
    ...mapGetters('knowledgeBase', ['getRecords']),

    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },

    dialogTitle () {
      return this.kbTitle ? `${this.kbTitle} - 知识库问答` : '知识库问答'
    },

    qaRecords () {
      return this.getRecords(this.kbUuid)
    },

    displayMessages () {
      const messages = []
      this.qaRecords.forEach(record => {
        messages.push({
          uuid: record.uuid,
          role: 'user',
          qaContent: record.qaContent,
          createTime: record.createTime
        })

        if (record.qaAnswer || record.status === 'thinking' || record.status === 'error') {
          messages.push({
            uuid: record.uuid,
            role: 'assistant',
            qaAnswer: record.qaAnswer,
            status: record.status,
            errorMessage: record.errorMessage,
            createTime: record.updateTime || record.createTime
          })
        }
      })

      return messages
    },

    canSend () {
      return this.inputQuestion.trim().length > 0 && !this.sending
    }
  },

  watch: {
    visible (val) {
      if (val && this.kbUuid) {
        this.loadQaRecords()
      }
    }
  },

  beforeDestroy () {
    this.cancelCurrentStreaming()
  },

  methods: {
    ...mapActions('knowledgeBase', [
      'loadQaRecords',
      'addQaRecord',
      'deleteQaRecord'
    ]),

    ...mapMutations('knowledgeBase', [
      'UPDATE_QA_RECORD',
      'APPEND_CHUNK'
    ]),

    /**
     * 加载QA记录
     */
    async loadQaRecords () {
      if (!this.kbUuid) return

      try {
        await this.$store.dispatch('knowledgeBase/loadQaRecords', {
          kbUuid: this.kbUuid,
          keyword: '',
          page: 1,
          pageSize: 100
        })
      } catch (error) {
        console.error('加载QA记录失败:', error)
      }
    },

    /**
     * 发送消息
     */
    async handleSend () {
      if (!this.canSend) return

      const question = this.inputQuestion.trim()
      this.inputQuestion = ''
      this.sending = true

      try {
        const response = await knowledgeBaseService.qaRecordAdd(this.kbUuid, question)
        const data = response.data || response

        const qaRecord = {
          ...createEmptyQaRecord(),
          ...data,
          qaContent: question,
          status: 'thinking'
        }

        this.UPDATE_QA_RECORD({
          kbUuid: this.kbUuid,
          record: qaRecord
        })

        this.currentStreamingRecord = qaRecord

        this.startStreaming(qaRecord.uuid)
      } catch (error) {
        this.$message.error('发送失败: ' + (error.message || '未知错误'))
        this.sending = false
      }
    },

    /**
     * 开始流式响应
     */
    startStreaming (qaRecordUuid) {
      console.log('[Dialog] startStreaming被调用, qaRecordUuid:', qaRecordUuid)
      this.sseAbortController = new AbortController()

      createKbQaStream(
        qaRecordUuid,
        {
          onStart: () => {
            console.log('[Dialog] SSE流开始')
          },

          onThinking: () => {
            console.log('[Dialog] 收到thinking事件')
            this.UPDATE_QA_RECORD({
              kbUuid: this.kbUuid,
              record: {
                uuid: qaRecordUuid,
                status: 'thinking'
              }
            })
          },

          onChunk: (chunk) => {
            console.log('[Dialog] onChunk被调用, chunk类型:', typeof chunk, '值:', chunk)
            this.APPEND_CHUNK({
              kbUuid: this.kbUuid,
              qaRecordUuid,
              chunk
            })
          },

          onDone: () => {
            this.UPDATE_QA_RECORD({
              kbUuid: this.kbUuid,
              record: {
                uuid: qaRecordUuid,
                status: 'completed'
              }
            })
            this.sending = false
            this.currentStreamingRecord = null
          },

          onError: (error) => {
            this.UPDATE_QA_RECORD({
              kbUuid: this.kbUuid,
              record: {
                uuid: qaRecordUuid,
                status: 'error',
                errorMessage: error.message || '回答失败'
              }
            })
            this.sending = false
            this.currentStreamingRecord = null
            this.$message.error('回答失败: ' + (error.message || '未知错误'))
          }
        },
        this.sseAbortController.signal
      )
    },

    /**
     * 取消当前流式响应
     */
    cancelCurrentStreaming () {
      if (this.sseAbortController) {
        this.sseAbortController.abort()
        this.sseAbortController = null
      }
      this.sending = false
      this.currentStreamingRecord = null
    },

    /**
     * 查看引用资料
     */
    handleViewReference (message) {
      this.currentQaRecordUuid = message.uuid
      this.referenceDialogVisible = true
    },

    /**
     * 查看引用图谱
     */
    handleViewGraphRef (message) {
      this.currentQaRecordUuid = message.uuid
      this.graphRefDialogVisible = true
    },

    /**
     * 删除消息
     */
    handleDeleteMessage (message) {
      this.$confirm('确定删除此问答记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await this.$store.dispatch('knowledgeBase/deleteQaRecord', {
            kbUuid: this.kbUuid,
            qaRecordUuid: message.uuid
          })
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }).catch(() => {})
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.cancelCurrentStreaming()
      this.inputQuestion = ''
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.kb-qa-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.input-area {
  flex-shrink: 0;
  border-top: 1px solid #e4e7ed;
  padding: 15px 0 0;
  margin-top: 15px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.input-tip {
  font-size: 12px;
  color: #909399;
}
</style>
