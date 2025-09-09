<template>
  <div>
    <el-tabs
      ref="refTabs"
      v-model="settings.tabs.activeName"
      @tab-click="handleTabsClick"
      @tab-remove="handleRemoveTab"
    >
      <!--      账户管理-列表-->
      <!--      注意：第一个list页面是不需要v-if来管理是否隐藏-->
      <el-tab-pane
        name="main"
      >
        <template slot="label">账户管理-列表</template>
        <list_template
          :data="dataJson.data"
        />
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import list_template from './tabs/10_list/index.vue'

export default {
  components: { list_template },
  directives: { elDragDialog },
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
          showMain: true, // 显示主页面-列表
          // showEdit: false, // 显示新增/修改页面
          showNew: false, // 显示新增
          showUpdate: false, // 显示修改页面
          showView: false // 显示查看页面
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
      this.$refs.refTabs.$el.children[0].style.margin = 0
      this.$refs.refTabs.$el.children[0].style.display = 'none'
    })
  },
  created () {
    // 设置页面标识，让FloatMenu组件能够正确管理列配置
    this.$options.name = this.$route.meta.page_code
  },
  methods: {
    handleTabsClick (tab, event) {
      // console.log(tab, event)
    },
    // 点击tabs的关闭
    handleRemoveTab (targetName) {
    },
    doCloseTab () {
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = true
      this.settings.tabs.activeName = 'main'
    },
    /**
     * 查看
     * @param _data
     */
    handleView (_data) {
      // 查看监管任务
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'view'
      this.dataJson.tab.showView = true
      this.dataJson.tab.showMain = false
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.canEdit = false
      this.dataJson.editStatus = _data.editStatus
    },
    /**
     * 新增
     * @param _data
     */
    handleNew (_data) {
      // 编辑监管任务
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'edit'
      this.dataJson.tab.showNew = true
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.canEdit = false
      this.dataJson.editStatus = _data.editStatus
    },
    /**
     * 修改
     * @param _data
     */
    handleUpdate (_data) {
      // 编辑监管任务
      this.dataJson.data = _data.data
      this.dataJson.tab = _data.operate_tab_info
      this.settings.tabs.activeName = 'edit'
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = true
      this.dataJson.tab.showView = false
      this.dataJson.tab.showMain = false
      this.dataJson.canEdit = false
      this.dataJson.editStatus = _data.editStatus
      this.dataJson.modifyReason = _data.modifyReason
    },
    /**
     * 新增页面返回
     */
    handleReturn () {
      this.dataJson.tab.showMain = true
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showApprove = false
      this.settings.tabs.activeName = 'main'
    },
    /**
     * 新增页面，新增成功后，关闭页面
     */
    handleCloseMeOk () {
      this.dataJson.tab.showMain = true
      this.dataJson.tab.showNew = false
      this.dataJson.tab.showUpdate = false
      this.dataJson.tab.showView = false
      this.dataJson.tab.showApprove = false
      this.settings.tabs.activeName = 'main'
    }
  }
}
</script>

<style scoped>
::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 10px;
}
::v-deep .el-button-group {
  margin-bottom: 10px;
}
</style>

