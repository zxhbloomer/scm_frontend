<template>
  <div>
    <el-tabs
      ref="outTabs"
      v-model="settings.tabs.activeName"
      @tab-click="handleTabsClick"
      @tab-remove="handleRemoveTab"
    >
      <el-tab-pane
        name="main"
        :disabled="dataJson.mainTab.show = false"
      >
        <template slot="label">出库单</template>
        <out-template
          @emitInsert="handleInsert"
          @emitUpdate="handleUpdate"
          @emitView="handleView"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="dataJson.tab.show"
        name="edit"
        closable
      >
        <template slot="label">{{ dataJson.tab.name }}</template>
        <operate-template
          :data="dataJson.data"
          :edit-status="dataJson.editStatus"
          :head-info="dataJson.operation_head_info"
          :can-edit="dataJson.canEdit"
          @emitReturn="handleReturn"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="dataJson.viewTab.show"
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
import outTemplate from './tabs/list.vue'
import operateTemplate from './tabs/edit.vue'
import viewTemplate from './tabs/edit.vue'
import resizeMixin from '@/mixin/resizeHandlerMixin'

export default {
  components: { outTemplate, operateTemplate, viewTemplate },
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
        // 左侧树的数据
        leftTreeData: null,
        tab: {
          show: false,
          name: ''
        },
        viewTab: {
          show: false,
          name: ''
        },
        mainTab: {
          show: true,
          name: ''
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
      this.$refs.outTabs.$el.children[0].style.margin = 0
      this.$refs.outTabs.$el.children[0].style.display = 'none'
    })
    // 返回出库单列表
    this.$on(this.EMITS.EMIT_OUT_RETURN, _data => {
      this.dataJson.tab.show = false
      this.dataJson.viewTab.show = false
      this.settings.tabs.activeName = 'main'
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
      this.dataJson.tab.show = false
      this.dataJson.viewTab.show = false
      this.settings.tabs.activeName = 'main'
    },
    handleInsert (_data) {
      // 新增出库单
      this.dataJson.tab.show = true
      this.dataJson.viewTab.show = false
      this.dataJson.mainTab.show = false
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'edit'
      this.dataJson.canEdit = true
      this.dataJson.editStatus = _data.editStatus
    },
    handleView (_data) {
      // 查看出库单
      this.dataJson.tab.show = false
      this.dataJson.viewTab.show = true
      this.dataJson.mainTab.show = false
      this.dataJson.data = _data.data
      this.dataJson.viewTab = _data.operate_tab_info
      this.settings.tabs.activeName = 'view'
      this.dataJson.canEdit = false
      this.dataJson.editStatus = _data.editStatus
    },
    handleReturn () {
      // 返回列表
      this.dataJson.tab.show = false
      this.dataJson.viewTab.show = false
      this.dataJson.mainTab.show = true
      this.settings.tabs.activeName = 'main'
      // this.dataJson.show = false
    },
    handleUpdate (_data) {
      // 新增出库单
      this.dataJson.tab.show = true
      this.dataJson.viewTab.show = false
      this.dataJson.mainTab.show = false
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'edit'
      this.dataJson.canEdit = true
      this.dataJson.editStatus = _data.editStatus
    }
  }
}
</script>
