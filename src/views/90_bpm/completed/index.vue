<!--审批流数据-->
<template>
  <div>
    <el-tabs
      ref="inTabs"
      v-model="settings.tabs.activeName"
      @tab-click="handleTabsClick"
      @tab-remove="handleRemoveTab"
    >
      <el-tab-pane name="main">
        <template slot="label">我的已办</template>
        <list-template
          :data="dataJson.data"
          @emitViewProcess="handleViewProcess"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="dataJson.tab.showView"
        name="view"
        closable
      >
        <template slot="label">{{ dataJson.tab.name }}</template>
        <view-template
          :data="dataJson.data"
          :edit-status="dataJson.editStatus"
          :head-info="dataJson.operation_head_info"
          :can-edit="dataJson.canEdit"
          @emitReturn="handleReturn"
        />
      </el-tab-pane>

      <el-tab-pane
        v-if="dataJson.tab.showEdit"
        name="edit"
        closable
      >
        <template slot="label">{{ dataJson.tab.name }}</template>
        <approve_template
          :data="dataJson.data"
          :edit-status="dataJson.editStatus"
          :head-info="dataJson.operation_head_info"
          :can-edit="dataJson.canEdit"
          @emitReturn="handleReturn"
        />
      </el-tab-pane>

    </el-tabs>

  </div>
</template>

<style scoped>
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
<style >
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
<script>
import elDragDialog from '@/directive/el-drag-dialog'
import listTemplate from './tabs/list'
import approve_template from './tabs/approve_template.vue'
import resizeMixin from '@/mixin/resizeHandlerMixin'
import { EventBus } from '@/common/eventbus/eventbus'

export default {
  components: { listTemplate, approve_template },
  directives: { elDragDialog },
  mixins: [resizeMixin],
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data () {
    return {
      dataJson: {
        tab: {
          showEdit: false,
          showView: false,
          showMain: true
        },
        operation_head_info: '',
        permissionId: null,
        canEdit: null
      },
      // 页面设置json
      settings: {
        tabs: {
          activeName: 'main',
          is_edit: false
        },
        // loading 状态
        loading: true,
        duration: 4000
      }
    }
  },
  // 监听器
  watch: {
  },
  mounted () {
    // 描绘完成
    this.$nextTick(() => {
      this.$refs.inTabs.$el.children[0].style.margin = 0
      this.$refs.inTabs.$el.children[0].style.display = 'none'
    })
  },
  created () {
  },
  methods: {
    handleTabsClick (tab, event) {
      // console.log(tab, event)
    },
    // 点击tabs的关闭
    handleRemoveTab (targetName) {
      if (this.settings.tabs.is_edit === false) {
        this.doCloseTab()
      } else {
        if (targetName === 'edit_permission' && this.settings.tabs.is_edit) {
          this.$confirm('您点击了关闭当前页签的操作，请注意保存当前数据。', '确认信息', {
            distinguishCancelAndClose: true,
            confirmButtonText: '取消',
            cancelButtonText: '确认关闭'
          }).then(() => {
          }).catch(action => {
            // 右上角X
            if (action === 'cancel') {
              this.doCloseTab()
            }
          })
        }
      }
    },
    doCloseTab () {
      this.dataJson.tab.showEdit = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = true
      this.settings.tabs.activeName = 'main'
    },
    /**
     * 查看流程
     * @param _data
     */
    handleViewProcess (_data) {
      // 编辑监管任务
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'edit'
      this.dataJson.tab.showEdit = true
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.canEdit = false
      this.dataJson.editStatus = _data.editStatus
    },
    handleReturn () {
      this.dataJson.tab.showEdit = false
      this.dataJson.tab.showView = false

      this.settings.tabs.activeName = 'main'
      EventBus.$emit('refreshList')
    }
  }
}
</script>
