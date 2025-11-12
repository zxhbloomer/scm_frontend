<template>
  <div class="workflow-editor-container">
    <!-- 头部操作栏 -->
    <div class="editor-header">
      <el-form :model="workflow" label-width="100px" inline>
        <el-form-item label="工作流标题">
          <el-input v-model="workflow.title" placeholder="请输入工作流标题" style="width: 300px" />
        </el-form-item>

        <el-form-item label="分类">
          <select-dict
            v-model="workflow.category"
            dict-code="ai_workflow_category"
            placeholder="请选择分类"
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="优先级">
          <el-input-number
            v-model="workflow.priority"
            :min="0"
            :max="100"
            :step="5"
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="是否公开">
          <el-switch v-model="workflow.isPublic" />
        </el-form-item>
      </el-form>

      <div class="header-buttons">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存草稿</el-button>
        <el-button
          type="warning"
          :disabled="!canTest"
          @click="handleTest"
        >
          测试运行
        </el-button>
        <el-button
          type="success"
          :disabled="!canPublish"
          @click="handlePublish"
        >
          发布
        </el-button>
        <el-button
          v-if="workflow.isEnable"
          type="info"
          @click="handleUnpublish"
        >
          取消发布
        </el-button>
      </div>
    </div>

    <!-- 主体编辑区 -->
    <div class="editor-body">
      <el-tabs v-model="activeTab">
        <!-- 基本信息 Tab -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="workflow" label-width="120px">
            <el-form-item label="工作流描述">
              <el-input
                v-model="workflow.description"
                type="textarea"
                :rows="6"
                placeholder="详细描述工作流的适用场景、功能、输入输出等,供AI路由使用"
              />
            </el-form-item>

            <el-form-item label="关键词">
              <el-input
                v-model="workflow.keywords"
                placeholder="多个关键词用英文逗号分隔,如: 订单,采购,库存,入库,出库"
              />
              <div class="form-help-text">
                用于快速匹配,建议3-10个关键词
              </div>
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                v-model="workflow.remark"
                type="textarea"
                :rows="3"
                placeholder="内部备注信息"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 工作流配置 Tab -->
        <el-tab-pane label="工作流配置" name="config">
          <div class="config-panel">
            <el-alert
              title="工作流配置区域"
              type="info"
              description="此区域用于配置工作流的节点、连接线等,实际实现需要集成工作流编辑器组件"
              :closable="false"
            />
            <!-- TODO: 集成实际的工作流编辑器 -->
            <div class="workflow-canvas">
              <p>工作流画布占位区域</p>
            </div>
          </div>
        </el-tab-pane>

        <!-- 测试运行 Tab -->
        <el-tab-pane label="测试运行" name="test">
          <div class="test-panel">
            <el-form label-width="100px">
              <el-form-item label="测试输入">
                <el-input
                  v-model="testInput"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入测试内容"
                />
              </el-form-item>

              <el-form-item label="测试结果">
                <div class="test-result-box">
                  <div v-if="testResult" v-html="testResult" />
                  <div v-else class="empty-text">暂无测试结果</div>
                </div>
              </el-form-item>

              <el-form-item label="最后测试时间">
                <span v-if="workflow.lastTestTime">{{ formatDateTime(workflow.lastTestTime) }}</span>
                <span v-else class="empty-text">未测试</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 发布状态 Tab -->
        <el-tab-pane label="发布状态" name="publish">
          <div class="publish-panel">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="发布状态">
                <el-tag :type="workflow.isEnable ? 'success' : 'info'">
                  {{ workflow.isEnable ? '已发布' : '草稿' }}
                </el-tag>
              </el-descriptions-item>

              <el-descriptions-item label="UUID">
                {{ workflow.workflowUuid || '未生成' }}
              </el-descriptions-item>

              <el-descriptions-item label="最后测试时间">
                {{ workflow.lastTestTime ? formatDateTime(workflow.lastTestTime) : '未测试' }}
              </el-descriptions-item>

              <el-descriptions-item label="最后修改时间">
                {{ workflow.uTime ? formatDateTime(workflow.uTime) : '-' }}
              </el-descriptions-item>

              <el-descriptions-item label="创建时间">
                {{ workflow.cTime ? formatDateTime(workflow.cTime) : '-' }}
              </el-descriptions-item>

              <el-descriptions-item label="创建人">
                {{ workflow.cId || '-' }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="publish-rules">
              <h4>发布规则说明</h4>
              <ul>
                <li>1. 发布前必须执行测试运行</li>
                <li>2. 测试时间必须晚于修改时间(确保测试了最新版本)</li>
                <li>3. 发布后工作流将对所有用户可见(或按权限可见)</li>
                <li>4. 已发布工作流修改后需要重新测试并发布</li>
              </ul>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import selectDict from '@/components/00_dict/select/SelectDict.vue'
import {
  saveWorkflow,
  testWorkflow,
  publishWorkflow,
  unpublishWorkflow,
  getWorkflowDetail
} from '@/components/70_ai/api/workflow'

export default {
  name: 'WorkflowEditor',
  components: {
    selectDict
  },
  props: {
    workflowUuid: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      activeTab: 'basic',
      workflow: {
        workflowUuid: null,
        title: '',
        description: '',
        keywords: '',
        category: '0',
        priority: 50,
        isPublic: false,
        isEnable: false,
        remark: '',
        lastTestTime: null,
        cTime: null,
        uTime: null,
        cId: null
      },
      testInput: '',
      testResult: null,
      loading: false
    }
  },
  computed: {
    canTest () {
      return this.workflow.title && this.workflow.title.trim() !== ''
    },
    canPublish () {
      if (!this.workflow.lastTestTime) {
        return false
      }
      if (!this.workflow.uTime) {
        return true
      }
      const testTime = new Date(this.workflow.lastTestTime)
      const updateTime = new Date(this.workflow.uTime)
      return testTime > updateTime
    }
  },
  mounted () {
    if (this.workflowUuid) {
      this.loadWorkflow()
    }
  },
  methods: {
    async loadWorkflow () {
      try {
        this.loading = true
        const res = await getWorkflowDetail(this.workflowUuid)
        if (res.code === 200) {
          this.workflow = res.data
        } else {
          this.$message.error('加载工作流失败: ' + res.msg)
        }
      } catch (error) {
        this.$message.error('加载工作流失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    async handleSave () {
      if (!this.workflow.title || this.workflow.title.trim() === '') {
        this.$message.warning('请输入工作流标题')
        return
      }

      try {
        this.loading = true
        const res = await saveWorkflow(this.workflow)
        if (res.code === 200) {
          this.$message.success('保存成功')
          if (!this.workflow.workflowUuid && res.data) {
            this.workflow.workflowUuid = res.data.workflowUuid
          }
        } else {
          this.$message.error('保存失败: ' + res.msg)
        }
      } catch (error) {
        this.$message.error('保存失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    async handleTest () {
      if (!this.workflow.workflowUuid) {
        this.$message.warning('请先保存工作流')
        return
      }

      if (!this.testInput || this.testInput.trim() === '') {
        this.$message.warning('请输入测试内容')
        return
      }

      try {
        this.loading = true
        this.activeTab = 'test'
        this.testResult = '<div class="loading">测试运行中...</div>'

        const res = await testWorkflow(this.workflow.workflowUuid, this.testInput)
        if (res.code === 200) {
          this.testResult = `<div class="success">测试运行成功</div><pre>${JSON.stringify(res.data, null, 2)}</pre>`
          this.workflow.lastTestTime = new Date().toISOString()
          this.$message.success('测试运行成功')
        } else {
          this.testResult = `<div class="error">测试运行失败: ${res.msg}</div>`
          this.$message.error('测试运行失败: ' + res.msg)
        }
      } catch (error) {
        this.testResult = `<div class="error">测试运行失败: ${error.message}</div>`
        this.$message.error('测试运行失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    async handlePublish () {
      if (!this.canPublish) {
        this.$message.warning('请先执行测试运行')
        return
      }

      try {
        this.loading = true
        const res = await publishWorkflow(this.workflow.workflowUuid)
        if (res.code === 200) {
          this.workflow.isEnable = true
          this.$message.success('发布成功')
          this.activeTab = 'publish'
        } else {
          this.$message.error('发布失败: ' + res.msg)
        }
      } catch (error) {
        this.$message.error('发布失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    async handleUnpublish () {
      try {
        await this.$confirm('确定要取消发布吗?取消后该工作流将不可用', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loading = true
        const res = await unpublishWorkflow(this.workflow.workflowUuid)
        if (res.code === 200) {
          this.workflow.isEnable = false
          this.$message.success('已取消发布')
        } else {
          this.$message.error('取消发布失败: ' + res.msg)
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消发布失败: ' + error.message)
        }
      } finally {
        this.loading = false
      }
    },

    handleCancel () {
      this.$emit('close')
    },

    formatDateTime (dateTime) {
      if (!dateTime) {
        return '-'
      }
      return dateTime.replace('T', ' ').substring(0, 19)
    }
  }
}
</script>

<style scoped lang="scss">
.workflow-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-buttons {
    display: flex;
    gap: 8px;
  }
}

.editor-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.form-help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.config-panel {
  .workflow-canvas {
    margin-top: 16px;
    height: 400px;
    border: 1px dashed #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
  }
}

.test-panel {
  .test-result-box {
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
    padding: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background: #fafafa;

    .empty-text {
      color: #909399;
      text-align: center;
    }

    .loading {
      color: #409eff;
    }

    .success {
      color: #67c23a;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .error {
      color: #f56c6c;
      font-weight: bold;
      margin-bottom: 8px;
    }

    pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}

.publish-panel {
  .publish-rules {
    margin-top: 24px;
    padding: 16px;
    background: #f0f9ff;
    border-left: 4px solid #409eff;

    h4 {
      margin: 0 0 12px 0;
      color: #303133;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        line-height: 1.8;
        color: #606266;
      }
    }
  }
}

.empty-text {
  color: #909399;
}
</style>
