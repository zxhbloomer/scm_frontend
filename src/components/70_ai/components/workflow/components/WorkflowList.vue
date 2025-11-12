<template>
  <div class="workflow-list">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 我的工作流 -->
      <el-tab-pane label="我的工作流" name="mine">
        <div class="tab-content">
          <div class="action-bar">
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleCreate"
            >
              新建工作流
            </el-button>
          </div>

          <!-- 筛选条件 -->
          <div class="filter-bar">
            <el-form :inline="true" size="small" :model="filters" style="display:flex">
              <el-form-item label="" prop="category">
                <select-dict
                  v-model="filters.category"
                  :para="CONSTANTS.DICT_AI_WORKFLOW_CATEGORY"
                  init-placeholder="全部分类"
                  style="width: 150px;"
                  @change="handleFilterChange"
                />
              </el-form-item>
              <el-form-item label="" prop="isEnable">
                <el-select
                  v-model="filters.isEnable"
                  placeholder="全部状态"
                  clearable
                  style="width: 120px;"
                  @change="handleFilterChange"
                >
                  <el-option label="已发布" :value="true" />
                  <el-option label="未发布" :value="false" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <div v-loading="loadingMine" class="list-container">
            <div v-if="!filteredMyWorkflows.length && !loadingMine" class="empty-state">
              <i class="el-icon-folder-opened" />
              <p>暂无工作流</p>
            </div>

            <div v-else class="workflow-items">
              <div
                v-for="item in filteredMyWorkflows"
                :key="item.workflowUuid"
                class="workflow-item"
                :class="{ active: item.workflowUuid === activeUuid }"
                @click="handleSelect(item)"
              >
                <div class="item-content">
                  <div class="item-header">
                    <i
                      class="status-icon"
                      :class="item.isPublic ? 'el-icon-share' : 'el-icon-lock'"
                    />
                    <span class="item-title">{{ item.title }}</span>
                  </div>
                  <div class="item-meta">
                    <el-tag v-if="item.categoryName" size="mini" type="info">{{ item.categoryName }}</el-tag>
                    <el-tag
                      v-if="item.isEnable !== undefined"
                      size="mini"
                      :type="item.isEnable ? 'success' : 'warning'"
                    >
                      {{ item.isEnable ? '已发布' : '未发布' }}
                    </el-tag>
                    <span v-if="item.priority !== undefined" class="priority-badge">优先级: {{ item.priority }}</span>
                  </div>
                </div>
                <div
                  v-if="showActions === item.workflowUuid"
                  class="item-actions"
                  @click.stop
                >
                  <el-button
                    type="text"
                    icon="el-icon-edit"
                    size="mini"
                    @click="handleEdit(item)"
                  />
                </div>
                <div
                  v-else
                  class="hover-trigger"
                  @mouseenter="showActions = item.workflowUuid"
                  @mouseleave="showActions = ''"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 公开工作流 -->
      <el-tab-pane label="公开工作流" name="public">
        <div v-loading="loadingPublic" class="list-container">
          <div v-if="!publicWorkflows.length && !loadingPublic" class="empty-state">
            <i class="el-icon-folder-opened" />
            <p>暂无公开工作流</p>
          </div>

          <div v-else class="workflow-items">
            <div
              v-for="item in publicWorkflows"
              :key="item.workflowUuid"
              class="workflow-item"
              :class="{ active: item.workflowUuid === activeUuid }"
              @click="handleSelect(item)"
            >
              <div class="item-content">
                <div class="item-header">
                  <i class="status-icon el-icon-share" />
                  <span class="item-title">{{ item.title }}</span>
                </div>
                <div class="item-meta">
                  <el-tag v-if="item.categoryName" size="mini" type="info">{{ item.categoryName }}</el-tag>
                  <span v-if="item.priority !== undefined" class="priority-badge">优先级: {{ item.priority }}</span>
                </div>
              </div>
              <div
                v-if="showActions === item.workflowUuid"
                class="item-actions"
                @click.stop
              >
                <el-button
                  type="text"
                  icon="el-icon-info"
                  size="mini"
                  @click="handleView(item)"
                />
              </div>
              <div
                v-else
                class="hover-trigger"
                @mouseenter="showActions = item.workflowUuid"
                @mouseleave="showActions = ''"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import SelectDict from '@/components/00_dict/select/SelectDict'

export default {
  name: 'WorkflowList',

  components: {
    SelectDict
  },

  data () {
    return {
      activeTab: 'mine',
      showActions: '',
      currentPage: 1,
      pageSize: 20,
      // 筛选条件
      filters: {
        category: '', // 单选,使用字符串
        isEnable: ''
      }
    }
  },

  computed: {
    ...mapState({
      myWorkflows: state => state.ai.workflow.myWorkflows,
      publicWorkflows: state => state.ai.workflow.publicWorkflows,
      loadingMine: state => state.ai.workflow.loadingMyWorkflows,
      loadingPublic: state => state.ai.workflow.loadingPublicWorkflows,
      activeUuid: state => state.ai.workflow.activeUuid,
      wfComponents: state => state.ai.workflow.wfComponents
    }),

    // 筛选后的我的工作流列表
    filteredMyWorkflows () {
      let list = this.myWorkflows
      // 按分类筛选
      if (this.filters.category) {
        list = list.filter(item => item.category === this.filters.category)
      }
      // 按发布状态筛选
      if (this.filters.isEnable !== '') {
        list = list.filter(item => item.isEnable === this.filters.isEnable)
      }
      return list
    }
  },

  mounted () {
    this.initData()
  },

  methods: {
    ...mapMutations({
      setShowCreateView: 'ai/workflow/SET_SHOW_CREATE_OR_EDIT_VIEW',
      setCreateOrEditWfUuid: 'ai/workflow/SET_CREATE_OR_EDIT_WF_UUID',
      setActive: 'ai/workflow/SET_ACTIVE'
    }),

    ...mapActions({
      loadWfComponents: 'ai/workflow/loadWfComponents',
      loadMyWorkflows: 'ai/workflow/loadMyWorkflows',
      loadPublicWorkflows: 'ai/workflow/loadPublicWorkflows'
    }),

    async initData () {
      // 加载工作流组件定义
      if (this.wfComponents.length === 0) {
        await this.loadWfComponents()
      }

      // 加载我的工作流
      if (this.myWorkflows.length === 0 && !this.loadingMine) {
        await this.loadMyWorkflows({ page: this.currentPage, pageSize: this.pageSize })
      }

      // 加载公开工作流
      if (this.publicWorkflows.length === 0 && !this.loadingPublic) {
        await this.loadPublicWorkflows({ page: this.currentPage, pageSize: this.pageSize })
      }
    },

    handleCreate () {
      this.setCreateOrEditWfUuid('')
      this.setShowCreateView(true)
    },

    handleSelect (workflow) {
      if (this.activeUuid === workflow.workflowUuid) {
        return
      }
      this.setActive(workflow.workflowUuid)
      this.$emit('select', workflow)
    },

    handleEdit (workflow) {
      this.setCreateOrEditWfUuid(workflow.workflowUuid)
      this.setShowCreateView(true)
    },

    handleView (workflow) {
      this.setCreateOrEditWfUuid(workflow.workflowUuid)
      this.setShowCreateView(true)
    },

    handleFilterChange () {
      // 筛选条件变化时触发,computed会自动重新计算filteredMyWorkflows
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-list {
  height: 100%;
  display: flex;
  flex-direction: column;

  ::v-deep .el-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;

    .el-tabs__content {
      flex: 1;
      overflow: hidden;
    }

    .el-tab-pane {
      height: 100%;
    }
  }
}

.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.action-bar {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.filter-bar {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;

  ::v-deep .el-form {
    margin-bottom: 0;
  }

  ::v-deep .el-form-item {
    margin-bottom: 0;
    margin-right: 12px;
  }
}

.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;

  i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

.workflow-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workflow-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f7fa;
    border-color: #409eff;
  }

  &.active {
    background-color: #ecf5ff;
    border-color: #409eff;
    color: #409eff;

    .item-title {
      font-weight: 500;
    }
  }

  .item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;

    .item-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .item-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .priority-badge {
        font-size: 12px;
        color: #909399;
        padding: 2px 8px;
        background-color: #f4f4f5;
        border-radius: 3px;
      }
    }
  }

  .item-actions {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: #fff;
    padding: 0 4px;
    z-index: 10;
  }

  .hover-trigger {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 40px;
  }
}
</style>
