<template>
  <el-dialog
    v-el-drag-dialog
    :visible.sync="dialogVisible"
    title="选择知识库"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="selector-container">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的知识库" name="mine">
          <div class="kb-list">
            <div
              v-if="myKbInfos.length === 0"
              class="empty-state"
            >
              <i class="el-icon-folder-opened" />
              <p>暂无知识库</p>
            </div>

            <el-checkbox-group
              v-else
              v-model="selectedKbUuids"
            >
              <div
                v-for="kb in myKbInfos"
                :key="kb.uuid"
                class="kb-item"
                :class="{ 'selected': isSelected(kb.uuid) }"
                @click="handleToggleSelect(kb.uuid)"
              >
                <el-checkbox
                  :label="kb.uuid"
                  @click.native.stop
                >
                  <div class="kb-info">
                    <div class="kb-title">{{ kb.title }}</div>
                    <div class="kb-remark">{{ kb.remark || '无描述' }}</div>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-tab-pane>

        <el-tab-pane label="公开知识库" name="public">
          <div class="kb-list">
            <div
              v-if="publicKbInfos.length === 0"
              class="empty-state"
            >
              <i class="el-icon-folder-opened" />
              <p>暂无公开知识库</p>
            </div>

            <el-checkbox-group
              v-else
              v-model="selectedKbUuids"
            >
              <div
                v-for="kb in publicKbInfos"
                :key="kb.uuid"
                class="kb-item"
                :class="{ 'selected': isSelected(kb.uuid) }"
                @click="handleToggleSelect(kb.uuid)"
              >
                <el-checkbox
                  :label="kb.uuid"
                  @click.native.stop
                >
                  <div class="kb-info">
                    <div class="kb-title">{{ kb.title }}</div>
                    <div class="kb-remark">{{ kb.remark || '无描述' }}</div>
                    <div class="kb-owner">创建者: {{ kb.ownerName || '未知' }}</div>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :disabled="selectedKbUuids.length === 0"
        @click="handleConfirm"
      >
        确定 ({{ selectedKbUuids.length }})
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import elDragDialog from '@/directive/el-drag-dialog'

export default {

  name: 'KnowledgeSelectorDialog',
  directives: { elDragDialog },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedKbs: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      activeTab: 'mine',
      selectedKbUuids: []
    }
  },

  computed: {
    ...mapState('knowledgeBase', ['myKbInfos', 'publicKbInfos']),

    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    }
  },

  watch: {
    visible (val) {
      if (val) {
        this.initData()
      }
    },

    selectedKbs: {
      handler (val) {
        if (val) {
          this.selectedKbUuids = val.map(kb => kb.uuid || kb)
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions('knowledgeBase', ['loadMyKbList', 'loadPublicKbList']),

    /**
     * 初始化数据
     */
    async initData () {
      try {
        await Promise.all([
          this.loadMyKbList(),
          this.loadPublicKbList()
        ])
      } catch (error) {
        console.error('加载知识库列表失败:', error)
      }
    },

    /**
     * 检查是否选中
     */
    isSelected (uuid) {
      return this.selectedKbUuids.includes(uuid)
    },

    /**
     * 切换选中状态
     */
    handleToggleSelect (uuid) {
      if (!this.multiple) {
        this.selectedKbUuids = [uuid]
        return
      }

      const index = this.selectedKbUuids.indexOf(uuid)
      if (index > -1) {
        this.selectedKbUuids.splice(index, 1)
      } else {
        this.selectedKbUuids.push(uuid)
      }
    },

    /**
     * 确认选择
     */
    handleConfirm () {
      const allKbs = [...this.myKbInfos, ...this.publicKbInfos]
      const selectedKbs = this.selectedKbUuids
        .map(uuid => allKbs.find(kb => kb.uuid === uuid))
        .filter(kb => kb)

      this.$emit('confirm', selectedKbs)
      this.handleClose()
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
    }
  }
}
</script>

<style scoped>
.selector-container {
  min-height: 400px;
  max-height: 500px;
}

.kb-list {
  max-height: 450px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
  color: #c0c4cc;
}

.kb-item {
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.kb-item:hover {
  border-color: #409EFF;
  background-color: #f5f7fa;
}

.kb-item.selected {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.kb-item >>> .el-checkbox {
  width: 100%;
}

.kb-item >>> .el-checkbox__label {
  width: 100%;
}

.kb-info {
  padding-left: 5px;
}

.kb-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.kb-remark {
  font-size: 12px;
  color: #909399;
  margin-bottom: 3px;
}

.kb-owner {
  font-size: 12px;
  color: #606266;
}

.dialog-footer {
  text-align: right;
}
</style>
