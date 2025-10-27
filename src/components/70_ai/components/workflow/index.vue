<template>
  <div class="workflow-container">
    <!-- 左侧：工作流列表 -->
    <div class="workflow-sidebar">
      <workflow-list @select="handleSelectWorkflow" />
    </div>

    <!-- 右侧：工作流详情/设计器 -->
    <div class="workflow-content">
      <div v-if="!activeWorkflow.workflowUuid" class="empty-content">
        <i class="el-icon-guide" />
        <p>请从左侧选择或创建一个工作流</p>
      </div>

      <div v-else class="workflow-detail">
        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <el-page-header :content="activeWorkflow.title || '工作流'" @back="handleBack">
            <template slot="content">
              <span class="workflow-title">{{ activeWorkflow.title || '未命名工作流' }}</span>
              <el-tag v-if="activeWorkflow.isPublic" type="success" size="mini" style="margin-left: 8px;">
                公开
              </el-tag>
              <el-tag v-else type="info" size="mini" style="margin-left: 8px;">
                私有
              </el-tag>
            </template>
          </el-page-header>
        </div>

        <!-- Tab 页签区域 -->
        <div class="tab-area">
          <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
            <!-- Tab 1: 流程执行 -->
            <el-tab-pane label="流程执行" name="runtime">
              <workflow-runtime-list
                v-if="activeWorkflow.workflowUuid"
                :workflow="activeWorkflow"
              />
            </el-tab-pane>

            <!-- Tab 2: 工作流流程图 -->
            <el-tab-pane label="工作流流程图" name="design" class="design-tab-pane">
              <workflow-designer
                v-if="activeWorkflow.workflowUuid"
                ref="workflowDesigner"
                :workflow="activeWorkflow"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <workflow-edit-dialog />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import WorkflowList from './components/WorkflowList.vue'
import WorkflowDesigner from './components/WorkflowDesigner.vue'
import WorkflowRuntimeList from './components/WorkflowRuntimeList.vue'
import WorkflowEditDialog from './dialogs/WorkflowEditDialog.vue'

export default {
  name: 'WorkflowIndex',

  components: {
    WorkflowList,
    WorkflowDesigner,
    WorkflowRuntimeList,
    WorkflowEditDialog
  },

  data () {
    return {
      activeTab: 'runtime' // 默认显示流程执行页签
    }
  },

  computed: {
    ...mapState({
      activeUuid: state => state.ai.workflow.activeUuid
    }),

    ...mapGetters({
      getWorkflowInfo: 'ai/workflow/getWorkflowInfo'
    }),

    activeWorkflow () {
      if (this.activeUuid) {
        const wf = this.getWorkflowInfo(this.activeUuid) || {}
        return wf
      }
      return {}
    }
  },

  /**
   * 组件挂载时加载AI模型列表
   * 严格参考 aideepin App.vue onMounted 方法
   * 引用：D:\2025_project\20_project_in_github\99_tools\aideepin\langchain4j-aideepin-web\src\App.vue (Line 183-185)
   */
  mounted () {
    // 加载所有类型的AI模型列表
    this.$store.dispatch('ai/app/loadAllModels')
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('加载AI模型列表失败:', error)
        this.$message.error('加载AI模型列表失败,请刷新页面重试')
      })
  },

  methods: {
    handleSelectWorkflow (workflow) {
      // 工作流选中后自动切换到流程执行页签
      this.activeTab = 'runtime'
    },

    handleBack () {
      // 关闭工作流并重新加载列表
      this.$store.dispatch('ai/workflow/closeWorkflow')
        .then(() => {
          // closeWorkflow 完成
        })
        .catch((error) => {
          // 处理错误
          // eslint-disable-next-line no-console
          console.error('closeWorkflow failed:', error)
        })
    },

    /**
     * 处理 tab 切换事件
     * 当切换到工作流流程图 tab 时，手动触发 WorkflowDesigner 的 resize
     */
    handleTabClick (tab, event) {
      if (tab.name === 'design') {
        // 使用轮询等待容器获得有效尺寸
        this.$nextTick(() => {
          if (this.$refs.workflowDesigner && this.$refs.workflowDesigner.waitForValidSizeAndResize) {
            this.$refs.workflowDesigner.waitForValidSizeAndResize()
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-container {
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
}

.workflow-sidebar {
  width: 320px;
  flex-shrink: 0;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workflow-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;

  i {
    font-size: 64px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
}

.workflow-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;

  .workflow-title {
    font-size: 16px;
    font-weight: 500;
  }
}

.tab-area {
  flex: 1;
  overflow: hidden;
  background-color: #fff;

  ::v-deep .el-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    .el-tabs__header {
      margin: 0;
      padding: 0 24px;
      border-bottom: 1px solid #e4e7ed;
    }

    .el-tabs__content {
      flex: 1;
      overflow: hidden;

      .el-tab-pane {
        height: 100%;
      }
    }
  }

  // 确保设计器tab撑满
  ::v-deep .design-tab-pane {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
