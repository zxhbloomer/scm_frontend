<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col>
        <el-card
          shadow="always"
          :body-style="{ padding: '10px' }"
        >
          <el-tabs
            ref="tabs"
            v-model="settings.tabs.activeName"
            @tab-click="handleTabsClick"
            @tab-remove="handleRemoveTab"
          >
            <!-- 权限列表Tab -->
            <el-tab-pane
              name="10_list"
              :style="{height: settings.rightHeight + 'px'}"
              style="overflow-y:auto;overflow-x:hidden;"
              :disabled="dataJson.tab.show"
            >
              <template slot="label">权限列表</template>
              <list-tab
                :height="settings.rightHeight - 142"
                @emitEdit="handleEdit"
                @emitView="handleView"
              />
            </el-tab-pane>

            <!-- 权限编辑Tab -->
            <el-tab-pane
              v-if="dataJson.tab.show && dataJson.tab.mode === 'edit'"
              name="30_edit"
              :style="{height: settings.rightHeight + 'px'}"
              style="overflow-y:auto;overflow-x:hidden;"
              closable
            >
              <template slot="label">{{ dataJson.tab.name }}</template>
              <edit-tab
                :height="settings.rightHeight - 102"
                :head-info="dataJson.operation_head_info"
                :permission-id="dataJson.permissionId"
                :can-edit="true"
                @emitReturn="handleReturn"
              />
            </el-tab-pane>

            <!-- 权限查看Tab -->
            <el-tab-pane
              v-if="dataJson.tab.show && dataJson.tab.mode === 'view'"
              name="40_view"
              :style="{height: settings.rightHeight + 'px'}"
              style="overflow-y:auto;overflow-x:hidden;"
              closable
            >
              <template slot="label">{{ dataJson.tab.name }}</template>
              <view-tab
                :height="settings.rightHeight - 102"
                :head-info="dataJson.operation_head_info"
                :permission-id="dataJson.permissionId"
                :can-edit="false"
                @emitReturn="handleReturn"
              />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import resizeMixin from './permission_roleResizeHandlerMixin'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'PermissionManagement',
  components: {
    listTab: () => import('./tabs/10_list/index.vue'), // 权限列表页面
    editTab: () => import('./tabs/30_edit/index.vue'), // 权限编辑页面
    viewTab: () => import('./tabs/40_view/index.vue') // 权限查看页面
  },
  directives: { elDragDialog },
  mixins: [resizeMixin],
  props: {},
  data () {
    return {
      // 数据类
      dataJson: {
        // 左侧树的数据
        leftTreeData: null,
        tab: {
          show: false,
          name: '',
          mode: 'edit' // 'edit' 或 'view'
        },
        operation_head_info: '',
        permissionId: null,
        canEdit: null
      },
      // 页面设置json
      settings: {
        leftHeight: this.setUIheight(),
        rightHeight: this.setUIheight(),
        tabs: {
          activeName: '10_list',
          is_edit: false
        },
        // loading 状态
        loading: false,
        duration: 4000
      }
    }
  },
  computed: {},
  // 监听器
  watch: {},
  created () {},
  mounted () {
    // 兼容现有的事件监听机制
    this.setupEventListeners()
  },
  methods: {
    /**
     * 设置事件监听器 - 保持与现有系统的兼容性
     */
    setupEventListeners () {
      // 部门权限变更
      this.$on(this.EMITS.EMIT_PERMISSION_CHANGE, _data => {
        this.dataJson.leftTreeData = _data
      })

      // 角色权限编辑
      this.$on(this.EMITS.EMIT_PERMISSION_OPERATE_EDIT, _data => {
        this.dataJson.tab = _data.operate_tab_info
        this.dataJson.tab.mode = 'edit'
        this.settings.tabs.activeName = '30_edit'
        this.dataJson.operation_head_info = _data.operate_tab_header_info.info
        this.dataJson.permissionId = _data.permission.permissionId
        this.dataJson.canEdit = true
        this.settings.tabs.is_edit = false
      })

      // 编辑完成
      this.$on(this.EMITS.EMIT_PERMISSION_OPERATE_EDIT_OK, _data => {
        this.settings.tabs.activeName = '10_list'
        this.dataJson.tab.show = false
      })

      // 权限信息查看
      this.$on(this.EMITS.EMIT_PERMISSION_OPERATE_INFO, _data => {
        this.dataJson.tab = _data.operate_tab_info
        this.dataJson.tab.mode = 'view'
        this.settings.tabs.activeName = '40_view'
        this.dataJson.operation_head_info = _data.operate_tab_header_info.info
        this.dataJson.permissionId = _data.permission.permissionId
        this.dataJson.canEdit = false
        this.settings.tabs.is_edit = false
      })

      // 是否编辑状态
      this.$on(this.EMITS.EMIT_PERMISSION_IS_EDIT, _data => {
        this.settings.tabs.is_edit = _data
      })
    },

    /**
     * Tab点击处理
     */
    handleTabsClick (tab, event) {
      // console.log('Tab clicked:', tab, event)
    },

    /**
     * Tab关闭处理
     */
    handleRemoveTab (targetName) {
      if (this.settings.tabs.is_edit === false) {
        this.doCloseTab()
      } else {
        if ((targetName === '30_edit' || targetName === '40_view') && this.settings.tabs.is_edit) {
          this.$confirm('您点击了关闭当前页签的操作，请注意保存当前数据。', '确认信息', {
            distinguishCancelAndClose: true,
            confirmButtonText: '取消',
            cancelButtonText: '确认关闭'
          }).then(() => {
          }).catch(action => {
            if (action === 'cancel') {
              this.doCloseTab()
            }
          })
        }
      }
    },

    /**
     * 执行关闭Tab操作
     */
    doCloseTab () {
      this.dataJson.tab.show = false
      this.settings.tabs.activeName = '10_list'
      this.$off(this.EMITS.EMIT_PERMISSION_OPERATE_EDIT_OK)
      this.$emit(this.EMITS.EMIT_PERMISSION_OPERATE_EDIT_OK, null)
      this.$off(this.EMITS.EMIT_PERMISSION_OPERATE_INFO_OK)
      this.$emit(this.EMITS.EMIT_PERMISSION_OPERATE_INFO_OK, null)
    },

    /**
     * 处理编辑请求 - 从列表页面触发
     */
    handleEdit (_data) {
      this.dataJson.tab = _data.operate_tab_info
      this.dataJson.tab.mode = 'edit'
      this.settings.tabs.activeName = '30_edit'
      this.dataJson.operation_head_info = _data.operate_tab_header_info.info
      this.dataJson.permissionId = _data.permission.permissionId
      this.dataJson.canEdit = true
      this.settings.tabs.is_edit = false
    },

    /**
     * 处理查看请求 - 从列表页面触发
     */
    handleView (_data) {
      this.dataJson.tab = _data.operate_tab_info
      this.dataJson.tab.mode = 'view'
      this.settings.tabs.activeName = '40_view'
      this.dataJson.operation_head_info = _data.operate_tab_header_info.info
      this.dataJson.permissionId = _data.permission.permissionId
      this.dataJson.canEdit = false
      this.settings.tabs.is_edit = false
    },

    /**
     * 处理返回操作
     */
    handleReturn () {
      this.dataJson.tab.show = false
      this.settings.tabs.activeName = '10_list'
    }
  }
}
</script>

<style scoped>
.app-container {
  margin: 0;
  padding: 0;
}

.floatRight {
  float: right;
}

.floatLeft {
  float: left;
}

.el-form-item .el-cascader {
  width: 100%;
}

.grid-content {
  border-radius: 2px;
  min-height: 36px;
  margin-bottom: 10px;
}

.bg-purple-light {
  background: #e5e9f2;
}

.el-alert--info.is-light {
  background: #eee;
}

.corner {
  position: absolute;
  top: 0px;
  border: 0;
  right: 0;
}
</style>

<style>
.buttonSearch {
  color: #ffffff;
  background-color: #1890ff;
  border-color: #1890ff;
}

.buttonReset {
  color: #ffffff;
  background-color: #f56c6c;
  border-color: #f56c6c;
}
</style>
