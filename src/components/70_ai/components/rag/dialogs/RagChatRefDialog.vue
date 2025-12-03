<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    title="引用资料"
    width="60%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    @close="handleClose"
  >
    <div v-if="loading" class="loading-container">
      <i class="el-icon-loading" /> 加载中...
    </div>

    <div v-else-if="displayReferences.length === 0" class="empty-container">
      无引用资料
    </div>

    <el-collapse v-else v-model="activeNames" class="reference-collapse">
      <el-collapse-item
        v-for="(reference, idx) in displayReferences"
        :key="reference.id || idx"
        :title="`引用${idx + 1}（相似度: ${(reference.score * 100).toFixed(2)}%）`"
        :name="`refer_${idx}`"
      >
        <div class="reference-content">
          <div class="reference-meta">
            <el-tag size="mini" type="info">排名: {{ idx + 1 }}</el-tag>
            <el-tag size="mini" type="success">分数: {{ reference.score.toFixed(4) }}</el-tag>
            <el-tag v-if="reference.kbItemUuid" size="mini">
              条目: {{ reference.kbItemUuid }}
            </el-tag>
          </div>
          <div class="reference-text">
            {{ reference.content }}
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ragService from '../../../api/ragService'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'RagChatRefDialog',
  directives: { elDragDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    qaRecordUuid: {
      type: String,
      default: ''
    },
    references: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      dialogVisible: false,
      loading: false,
      localReferences: [],
      activeNames: ['refer_0'] // 默认展开第一个引用
    }
  },
  computed: {
    displayReferences () {
      // 优先使用父组件传递的references，如果没有则使用本地加载的
      return this.references.length > 0 ? this.references : this.localReferences
    }
  },
  watch: {
    visible: {
      handler (val) {
        this.dialogVisible = val
        if (val && this.qaRecordUuid) {
          // 如果父组件没有传递references，才自己加载
          if (this.references.length === 0) {
            this.loadReferences()
          } else {
            // 使用父组件传递的数据，默认展开第一个
            if (this.references.length > 0) {
              this.activeNames = ['refer_0']
            }
          }
        }
      }
    }
  },
  methods: {
    async loadReferences () {
      if (!this.qaRecordUuid) {
        this.$message.warning('缺少问答记录UUID')
        return
      }

      this.loading = true
      try {
        const response = await ragService.getEmbeddingRef(this.qaRecordUuid)

        if (response.system_code === 0 && response.data) {
          this.localReferences = response.data || []

          // 如果有引用，默认展开第一个
          if (this.localReferences.length > 0) {
            this.activeNames = ['refer_0']
          }
        } else {
          this.$message.error(response.message || '加载引用资料失败')
          this.localReferences = []
        }
      } catch (error) {
        this.$message.error('加载引用资料失败: ' + (error.message || '未知错误'))
        this.localReferences = []
      } finally {
        this.loading = false
      }
    },

    handleClose () {
      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')

      // 重置数据
      this.localReferences = []
      this.activeNames = ['refer_0']
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-container {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;

  i {
    font-size: 24px;
    margin-right: 8px;
  }
}

.empty-container {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

.reference-collapse {
  max-height: 500px;
  overflow-y: auto;
  border: none;

  ::v-deep .el-collapse-item__header {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
    padding-left: 16px;
  }

  ::v-deep .el-collapse-item__wrap {
    border-bottom: 1px solid #ebeef5;
  }

  ::v-deep .el-collapse-item__content {
    padding: 16px;
    background-color: #f5f7fa;
  }
}

.reference-content {
  .reference-meta {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .reference-text {
    padding: 12px;
    background-color: #ffffff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    line-height: 1.8;
    color: #606266;
    font-size: 14px;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
