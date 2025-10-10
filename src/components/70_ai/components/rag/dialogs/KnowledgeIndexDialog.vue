<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    title="选择索引类型"
    width="550px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="index-container">
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <div slot="title">
          对文档进行<strong>图谱化</strong>时会使用到大语言模型，需要消耗一定量的Token
        </div>
      </el-alert>

      <!-- 索引类型选择 -->
      <div class="index-types">
        <div class="form-label">索引类型</div>
        <el-checkbox-group v-model="selectedIndexTypes">
          <el-checkbox label="embedding">向量化</el-checkbox>
          <el-checkbox label="graphical">图谱化</el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 已选中的知识项 -->
      <div class="selected-items">
        <div class="form-label">已选中的知识点</div>
        <div class="item-tags">
          <el-tag
            v-for="item in selectedItems"
            :key="item.itemUuid"
            closable
            size="small"
            type="info"
            style="margin: 5px"
            @close="handleRemoveItem(item)"
          >
            {{ item.title }}
          </el-tag>
          <el-tag
            v-if="selectedItems.length === 0"
            size="small"
            type="warning"
          >
            先选择知识点
          </el-tag>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :disabled="!canSubmit"
        :loading="indexing"
        @click="handleSubmit"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { INDEX_TYPE } from '../constants/indexTypes'
import knowledgeBaseService from '../api/knowledgeBaseService'
import elDragDialog from '@/directive/el-drag-dialog'

export default {

  name: 'KnowledgeIndexDialog',
  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedItems: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      indexing: false,
      selectedIndexTypes: [INDEX_TYPE.EMBEDDING]
    }
  },

  computed: {
    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },

    canSubmit () {
      return this.selectedItems.length > 0 && this.selectedIndexTypes.length > 0
    }
  },

  watch: {
    visible (val) {
      if (val) {
        this.selectedIndexTypes = [INDEX_TYPE.EMBEDDING]
      }
    }
  },

  methods: {
    /**
     * 移除选中项
     */
    handleRemoveItem (item) {
      this.$emit('remove-item', item)
    },

    /**
     * 提交索引
     */
    async handleSubmit () {
      if (!this.canSubmit) {
        return
      }

      this.indexing = true
      try {
        const uuids = this.selectedItems.map(item => item.itemUuid)
        await knowledgeBaseService.itemsIndexing(uuids, this.selectedIndexTypes)

        this.$message.success('索引任务后台执行中')
        this.$emit('success')

        // 开始轮询检查索引状态
        this.$emit('start-checking')

        this.handleClose()
      } catch (error) {
        this.$message.error('索引失败: ' + (error.message || '未知错误'))
      } finally {
        this.indexing = false
      }
    },

    /**
     * 取消
     */
    handleCancel () {
      this.handleClose()
    },

    /**
     * 关闭弹窗
     */
    handleClose () {
      this.dialogVisible = false
      this.selectedIndexTypes = [INDEX_TYPE.EMBEDDING]
    }
  }
}
</script>

<style scoped>
.index-container {
  padding: 10px;
}

.form-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  font-weight: 500;
}

.index-types {
  margin-bottom: 20px;
}

.selected-items {
  margin-top: 20px;
}

.item-tags {
  min-height: 50px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 10px;
  background-color: #F5F7FA;
}

.dialog-footer {
  text-align: right;
}
</style>
