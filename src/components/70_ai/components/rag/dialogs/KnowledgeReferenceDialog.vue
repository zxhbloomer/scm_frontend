<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    title="引用资料"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="reference-container">
      <div
        v-if="loading"
        class="loading-state"
      >
        <i class="el-icon-loading" />
        <span>加载中...</span>
      </div>

      <div
        v-else-if="references.length === 0"
        class="empty-state"
      >
        <i class="el-icon-document" />
        <p>暂无引用资料</p>
      </div>

      <div v-else class="reference-list">
        <div
          v-for="(ref, index) in references"
          :key="index"
          class="reference-item"
        >
          <div class="reference-header">
            <span class="reference-index">引用 {{ index + 1 }}</span>
            <el-tag
              v-if="ref.score"
              size="small"
              type="success"
            >
              相关性: {{ (ref.score * 100).toFixed(2) }}%
            </el-tag>
          </div>

          <div class="reference-content">
            <div
              v-if="ref.kbItemTitle"
              class="reference-meta"
            >
              <span class="meta-label">知识点:</span>
              <span class="meta-value">{{ ref.kbItemTitle }}</span>
            </div>

            <div class="reference-text">
              {{ ref.text }}
            </div>

            <div
              v-if="ref.fileName"
              class="reference-meta"
            >
              <span class="meta-label">文件:</span>
              <span class="meta-value">{{ ref.fileName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import elDragDialog from '@/directive/el-drag-dialog'

export default {

  name: 'KnowledgeReferenceDialog',
  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    qaRecordUuid: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      loading: false
    }
  },

  computed: {
    ...mapGetters('knowledgeBase', ['getReferences']),

    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },

    references () {
      return this.getReferences(this.qaRecordUuid) || []
    }
  },

  watch: {
    visible (val) {
      if (val && this.qaRecordUuid) {
        this.loadReferences()
      }
    }
  },

  methods: {
    ...mapActions('knowledgeBase', ['loadReferences']),

    /**
     * 加载引用资料
     */
    async loadReferences () {
      if (this.references.length > 0) {
        return
      }

      this.loading = true
      try {
        await this.$store.dispatch('knowledgeBase/loadReferences', this.qaRecordUuid)
      } catch (error) {
        this.$message.error('加载引用资料失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.reference-container {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
}

.loading-state i,
.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
  color: #c0c4cc;
}

.reference-list {
  padding: 10px;
}

.reference-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 3px solid #409EFF;
}

.reference-item:last-child {
  margin-bottom: 0;
}

.reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reference-index {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.reference-content {
  font-size: 14px;
}

.reference-meta {
  display: flex;
  margin-bottom: 8px;
  line-height: 1.5;
}

.meta-label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 60px;
}

.meta-value {
  color: #303133;
  word-break: break-all;
}

.reference-text {
  padding: 12px;
  background-color: #ffffff;
  border-radius: 4px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 10px 0;
}

.dialog-footer {
  text-align: right;
}
</style>
