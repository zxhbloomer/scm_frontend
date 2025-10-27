<template>
  <el-dialog
    v-if="dialogVisible"
    v-el-drag-dialog
    :visible="dialogVisible"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    :append-to-body="true"
    :modal-append-to-body="true"
    :class="['workflow-edit-dialog', { 'workflow-edit-dialog--fullscreen': isFullscreen }]"
    width="600px"
    top="5vh"
    destroy-on-close
    @close="handleClose"
  >
    <!-- 自定义标题栏 -->
    <div slot="title" class="dialog-title">
      <span>{{ dialogTitle }}</span>
      <el-button
        type="text"
        :icon="isFullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"
        :title="isFullscreen ? '恢复' : '最大化'"
        class="maximize-btn"
        @click.native="toggleFullscreen"
      />
    </div>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <!-- 查看模式：显示创建者信息 -->
      <div v-if="viewMode === 'read'" class="view-header">
        <div class="user-info">
          <span class="user-name">{{ formData.userName || currentUserName }}</span>
        </div>
        <div class="node-count">
          <i class="el-icon-connection" />
          <span>{{ formData.nodes.length }} 个节点</span>
        </div>
      </div>
      <el-divider v-if="viewMode === 'read'" />

      <!-- 编辑模式：表单 -->
      <template v-if="viewMode !== 'read'">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="如：翻译"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="是否公开">
          <el-switch
            v-model="formData.isPublic"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </template>

      <!-- 查看模式：只读信息 -->
      <div v-if="viewMode === 'read'" class="read-content">
        <div class="info-item">
          <span class="label">标题：</span>
          <span class="value">{{ formData.title }}</span>
        </div>
        <div class="info-item">
          <span class="label">备注：</span>
          <span class="value">{{ formData.remark || '无' }}</span>
        </div>
        <div class="info-item">
          <span class="label">是否公开：</span>
          <span class="value">{{ formData.isPublic ? '是' : '否' }}</span>
        </div>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <template v-if="viewMode !== 'read'">
        <el-button
          v-if="formData.uuid"
          type="danger"
          plain
          @click="handleDelete"
        >
          删除
        </el-button>
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="saving"
          @click="handleSave"
        >
          {{ formData.uuid ? '更新' : '新增' }}
        </el-button>
      </template>
      <template v-else>
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { workflowAdd, workflowBaseInfoUpdate, workflowDel } from '@/components/70_ai/components/workflow/utils'
import { emptyWorkflowInfo } from '@/components/70_ai/components/workflow/utils'

import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'WorkflowEditDialog',

  directives: { elDragDialog },

  data () {
    return {
      isFullscreen: false,
      saving: false,
      formData: emptyWorkflowInfo(),
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    ...mapState({
      showCreateOrEditView: state => state.ai.workflow.showCreateOrEditDialog,
      createOrEditWfUuid: state => state.ai.workflow.createOrEditWfUuid,
      currentUserId: state => state.user.userId, // 修正：使用userId而不是不存在的uuid
      currentUserName: state => state.user.name
    }),

    dialogVisible: {
      get () {
        return this.showCreateOrEditView
      },
      set (val) {
        this.$store.commit('ai/workflow/SET_SHOW_CREATE_OR_EDIT_VIEW', val)
      }
    },

    dialogTitle () {
      if (this.viewMode === 'create') {
        return '新增工作流'
      } else if (this.viewMode === 'edit') {
        return '编辑工作流'
      } else {
        return '查看工作流'
      }
    },

    viewMode () {
      if (this.createOrEditWfUuid) {
        // 判断是否是当前用户创建的（修正：使用userId比较）
        if (this.formData.userId === this.currentUserId) {
          return 'edit'
        }
        return 'read'
      } else {
        return 'create'
      }
    }
  },

  watch: {
    createOrEditWfUuid: {
      immediate: true,
      handler (val) {
        if (val) {
          // 编辑模式：加载工作流信息
          const workflow = this.$store.getters['ai/workflow/getWorkflowInfo'](val)
          if (workflow) {
            this.formData = {
              uuid: workflow.workflowUuid,
              title: workflow.title,
              remark: workflow.remark,
              isPublic: workflow.isPublic,
              userId: workflow.userId, // 修正：使用userId而不是userUuid
              userName: workflow.userName,
              nodes: workflow.nodes || [],
              dbversion: workflow.dbversion
            }
          }
        } else {
          // 新建模式：重置表单
          this.formData = emptyWorkflowInfo()
        }
      }
    }
  },

  methods: {
    ...mapMutations({
      setShowCreateView: 'ai/workflow/SET_SHOW_CREATE_OR_EDIT_VIEW',
      addWorkflowAndActive: 'ai/workflow/ADD_WORKFLOW_AND_ACTIVE',
      updateBaseInfo: 'ai/workflow/UPDATE_BASE_INFO',
      deleteWorkflow: 'ai/workflow/DELETE_WORKFLOW'
    }),

    toggleFullscreen () {
      this.isFullscreen = !this.isFullscreen
    },

    handleClose () {
      this.isFullscreen = false
      this.dialogVisible = false
      this.formData = emptyWorkflowInfo()
      this.$refs.formRef.clearValidate()
    },

    async handleSave () {
      try {
        await this.$refs.formRef.validate()
      } catch (error) {
        return
      }

      if (this.saving) return

      this.saving = true
      const params = {
        uuid: this.formData.uuid,
        title: this.formData.title,
        remark: this.formData.remark,
        isPublic: this.formData.isPublic,
        dbversion: this.formData.dbversion
      }

      try {
        if (!this.formData.uuid) {
          // 新增
          const response = await workflowAdd(params)
          this.addWorkflowAndActive(response.data)
          this.$message.success('工作流创建成功')
        } else {
          // 更新
          const response = await workflowBaseInfoUpdate(params)
          this.updateBaseInfo({ uuid: this.formData.uuid, workflow: response.data })
          this.$message.success('工作流更新成功')
        }
        this.handleClose()
      } catch (error) {
        console.error('保存工作流失败:', error)
        this.$message.error(error.message || '保存失败')
      } finally {
        this.saving = false
      }
    },

    handleDelete () {
      if (!this.formData.uuid) {
        this.$message.error('删除失败，uuid为空')
        return
      }

      this.$confirm('确定要删除这个工作流吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await workflowDel(this.formData.uuid)
          this.deleteWorkflow(this.formData.uuid)
          this.$message.success('删除成功')
          this.handleClose()
        } catch (error) {
          console.error('删除工作流失败:', error)
          this.$message.error(error.message || '删除失败')
        }
      }).catch(() => {
        // 取消删除
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 20px;

  .maximize-btn {
    padding: 5px;
    margin-left: 8px;
    font-size: 16px;
    color: #909399;

    &:hover {
      color: #409eff;
    }
  }
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .user-info {
    display: flex;
    align-items: center;

    .user-name {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }

  .node-count {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #909399;
    font-size: 14px;

    i {
      font-size: 16px;
    }
  }
}

.read-content {
  .info-item {
    margin-bottom: 16px;
    line-height: 1.8;

    .label {
      font-weight: 500;
      color: #606266;
      margin-right: 8px;
    }

    .value {
      color: #303133;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>

<style>
/* 最大化样式 - 避开 ai-chat 弹窗 (480px) */
/* 注意：这个 style 标签没有 scoped，以确保样式能够正确应用到 Element UI 的对话框 */
.workflow-edit-dialog--fullscreen .el-dialog {
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  width: calc(100vw - 480px) !important;
  height: 100vh !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.workflow-edit-dialog--fullscreen .el-dialog__body {
  height: calc(100vh - 60px - 70px) !important;
  overflow-y: auto !important;
}
</style>
